from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ...db.session import get_db
from ...models.session import Session as SessionModel
from ...models.recording import Recording
from ...models.survey import Survey
from ...core.security import get_current_user_role
from ...core.time import to_local_iso
from ...core.storage_r2 import get_s3_client
from ...core.config import settings
import json
import io
import csv
import zipfile
import logging
from datetime import datetime
from pathlib import Path

router = APIRouter()
logger = logging.getLogger(__name__)


class DatasetEntry(BaseModel):
    """Schema for dataset entry."""
    session_id: int
    session_code: str
    participant_name: str
    participant_age: Optional[int]
    participant_email: Optional[str]
    texto_seleccionado: str
    estado: str
    created_at: str
    recordings_count: int
    surveys_count: int


@router.get("/dataset")
def get_dataset(
    role: str = Depends(get_current_user_role),
    db: Session = Depends(get_db)
):
    """Get dataset for ANALISTA role (all sessions with recordings and surveys)."""
    # Check if user has ANALISTA role
    if role != "ANALISTA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ANALISTA users can access the dataset"
        )
    
    # Get all sessions with related data
    sessions = db.query(SessionModel).all()
    
    dataset = []
    for session in sessions:
        # Get recordings and surveys count
        recordings_count = db.query(Recording).filter(Recording.session_id == session.id).count()
        surveys_count = db.query(Survey).filter(Survey.session_id == session.id).count()
        
        # Get recordings data
        recordings = db.query(Recording).filter(Recording.session_id == session.id).all()
        recording_items = [
            {
                "id": rec.id,
                "storage_key": rec.storage_key,
                "created_at": to_local_iso(rec.created_at) or ""
            }
            for rec in recordings
        ]
        
        # Get survey data
        surveys = db.query(Survey).filter(Survey.session_id == session.id).all()
        survey_responses = [surv.respuestas_json for surv in surveys]
        
        entry = {
            "session_id": session.id,
            "session_code": session.session_code,
            "participant_name": session.datos_participante.get("nombre", ""),
            "participant_age": session.datos_participante.get("edad_aproximada"),
            "participant_email": session.datos_participante.get("email_opcional"),
            "texto_seleccionado": session.texto_seleccionado,
            "estado": session.estado,
            "created_at": to_local_iso(session.created_at) or "",
            "recordings_count": recordings_count,
            "recordings": recording_items,
            "surveys_count": surveys_count,
            "survey_responses": survey_responses
        }
        dataset.append(entry)
    
    return {"dataset": dataset, "total_sessions": len(dataset)}


@router.get("/dataset/export")
def export_dataset_csv(
    role: str = Depends(get_current_user_role),
    db: Session = Depends(get_db)
):
    """Export dataset as ZIP (CSV + audio files) for ANALISTA role."""
    # Check if user has ANALISTA role
    if role != "ANALISTA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ANALISTA users can export the dataset"
        )
    
    if not settings.R2_BUCKET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="R2_BUCKET is not configured"
        )

    sessions = db.query(SessionModel).all()
    session_map = {session.id: session for session in sessions}

    recordings = db.query(Recording).all()
    recordings_by_session: Dict[int, List[Recording]] = {}
    for recording in recordings:
        recordings_by_session.setdefault(recording.session_id, []).append(recording)

    surveys = db.query(Survey).all()
    surveys_by_session: Dict[int, List[Survey]] = {}
    for survey in surveys:
        surveys_by_session.setdefault(survey.session_id, []).append(survey)

    def resolve_extension(recording: Recording) -> str:
        if recording.formato:
            if "/" in recording.formato:
                return recording.formato.split("/")[-1].strip() or "webm"
            if recording.formato.startswith("."):
                return recording.formato[1:]
            return recording.formato
        if recording.storage_key:
            suffix = Path(recording.storage_key).suffix
            if suffix:
                return suffix.lstrip(".")
        return "webm"

    def build_dataset_csv(zip_handle: zipfile.ZipFile, s3_client) -> None:
        dataset_buffer = io.StringIO()
        writer = csv.writer(dataset_buffer)
        writer.writerow([
            "session_id",
            "session_code",
            "recording_id",
            "audio_file",
            "formato",
            "duration_seconds",
            "uploaded_at",
            "survey_id",
            "survey_completed_at",
            "audio_missing",
        ])

        for session in sessions:
            session_recordings = recordings_by_session.get(session.id, [])
            session_surveys = surveys_by_session.get(session.id, [])
            survey_to_use = None
            if session_surveys:
                survey_to_use = sorted(session_surveys, key=lambda item: item.created_at or datetime.min)[0]

            if not session_recordings:
                writer.writerow([
                    session.id,
                    session.session_code,
                    "",
                    "",
                    "",
                    "",
                    "",
                    survey_to_use.id if survey_to_use else "",
                    to_local_iso(survey_to_use.created_at) if survey_to_use else "",
                    True,
                ])
                continue

            for recording in session_recordings:
                storage_key = recording.storage_key
                audio_missing = False
                audio_path = ""
                formato = resolve_extension(recording)
                if storage_key:
                    try:
                        response = s3_client.get_object(Bucket=settings.R2_BUCKET, Key=storage_key)
                        audio_bytes = response["Body"].read()
                        audio_path = f"audios/{session.session_code}__{recording.id}.{formato}"
                        zip_handle.writestr(audio_path, audio_bytes)
                    except Exception as exc:
                        audio_missing = True
                        audio_path = ""
                        logger.warning("Failed to download audio from R2: %s", exc)
                else:
                    audio_missing = True

                writer.writerow([
                    session.id,
                    session.session_code,
                    recording.id,
                    audio_path,
                    formato,
                    recording.duracion_segundos or "",
                    to_local_iso(recording.created_at) or "",
                    survey_to_use.id if survey_to_use else "",
                    to_local_iso(survey_to_use.created_at) if survey_to_use else "",
                    audio_missing,
                ])

        zip_handle.writestr("dataset.csv", dataset_buffer.getvalue())

    def build_surveys_csv(zip_handle: zipfile.ZipFile) -> None:
        surveys_buffer = io.StringIO()
        all_keys: List[str] = []
        key_sets = []

        for survey in surveys:
            keys = sorted(survey.respuestas_json.keys()) if survey.respuestas_json else []
            key_sets.append(keys)
            for key in keys:
                if key not in all_keys:
                    all_keys.append(key)

        if surveys and key_sets and all(keys == key_sets[0] for keys in key_sets):
            writer = csv.writer(surveys_buffer)
            writer.writerow([
                "survey_id",
                "session_id",
                "session_code",
                "created_at",
                *all_keys,
            ])
            for survey in surveys:
                session = session_map.get(survey.session_id)
                row = [
                    survey.id,
                    survey.session_id,
                    session.session_code if session else "",
                    to_local_iso(survey.created_at) or "",
                ]
                for key in all_keys:
                    row.append(survey.respuestas_json.get(key, "") if survey.respuestas_json else "")
                writer.writerow(row)
        else:
            writer = csv.writer(surveys_buffer)
            writer.writerow([
                "survey_id",
                "session_id",
                "session_code",
                "created_at",
                "question_key",
                "answer_value",
            ])
            for survey in surveys:
                session = session_map.get(survey.session_id)
                responses = survey.respuestas_json or {}
                if not responses:
                    writer.writerow([
                        survey.id,
                        survey.session_id,
                        session.session_code if session else "",
                        to_local_iso(survey.created_at) or "",
                        "",
                        "",
                    ])
                    continue
                for key, value in responses.items():
                    writer.writerow([
                        survey.id,
                        survey.session_id,
                        session.session_code if session else "",
                        to_local_iso(survey.created_at) or "",
                        key,
                        value,
                    ])

        zip_handle.writestr("surveys.csv", surveys_buffer.getvalue())

    zip_buffer = io.BytesIO()
    zip_name = f"dataset_export_{datetime.now().strftime('%Y%m%d_%H%M')}.zip"

    try:
        s3_client = get_s3_client()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing storage client: {exc}"
        )

    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_handle:
        build_dataset_csv(zip_handle, s3_client)
        build_surveys_csv(zip_handle)

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=\"{zip_name}\""}
    )
