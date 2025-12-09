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
import json
import io

router = APIRouter()


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
        recording_urls = [rec.audio_url for rec in recordings]
        
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
            "created_at": session.created_at.isoformat() if session.created_at else "",
            "recordings_count": recordings_count,
            "recordings": recording_urls,
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
    """Export dataset as CSV for ANALISTA role."""
    # Check if user has ANALISTA role
    if role != "ANALISTA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ANALISTA users can export the dataset"
        )
    
    # Get all sessions
    sessions = db.query(SessionModel).all()
    
    # Create CSV content
    csv_content = "session_id,session_code,participant_name,participant_age,participant_email,texto,estado,created_at,recordings_count,surveys_count\n"
    
    for session in sessions:
        recordings_count = db.query(Recording).filter(Recording.session_id == session.id).count()
        surveys_count = db.query(Survey).filter(Survey.session_id == session.id).count()
        
        csv_content += f"{session.id},{session.session_code},"
        csv_content += f"\"{session.datos_participante.get('nombre', '')}\"," 
        csv_content += f"{session.datos_participante.get('edad_aproximada', '')},"
        csv_content += f"\"{session.datos_participante.get('email_opcional', '')}\"," 
        csv_content += f"\"{session.texto_seleccionado}\","
        csv_content += f"{session.estado},"
        csv_content += f"{session.created_at.isoformat() if session.created_at else ''},"
        csv_content += f"{recordings_count},{surveys_count}\n"
    
    # Return as downloadable CSV
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=toastclub_dataset.csv"}
    )
