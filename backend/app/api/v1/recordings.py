from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from pathlib import Path

from ...db.session import get_db
from ...models.recording import Recording
from ...models.session import Session as SessionModel
from ...core.state_machine import SessionState
from ...core.security import get_current_user_role
from ...core.config import settings
from ...core.time import to_local_iso
from ...core.storage_r2 import upload_fileobj, presign_get_url

router = APIRouter()


class RecordingCreate(BaseModel):
    """Schema for creating a recording (mock for now)."""
    audio_url: str
    duracion_segundos: Optional[float] = None
    formato: Optional[str] = "wav"
    metadata_carga: Optional[dict] = None


class RecordingResponse(BaseModel):
    """Schema for recording response."""
    id: int
    session_id: int
    audio_url: str
    duracion_segundos: Optional[float]
    formato: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/sessions/{session_id}/recording", response_model=RecordingResponse, status_code=status.HTTP_201_CREATED)
def create_recording(
    session_id: int,
    recording_data: RecordingCreate,
    db: Session = Depends(get_db)
):
    """Create a recording for a session (mock implementation for web testing)."""
    # Check if session exists
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    # Create recording
    recording = Recording(
        session_id=session_id,
        audio_url=recording_data.audio_url,
        duracion_segundos=recording_data.duracion_segundos,
        formato=recording_data.formato,
        metadata_carga=recording_data.metadata_carga or {}
    )
    
    db.add(recording)
    
    # Update session state to audio_uploaded if it's in running state
    if session.estado == SessionState.RUNNING.value:
        session.estado = SessionState.AUDIO_UPLOADED.value
    
    db.commit()
    db.refresh(recording)
    
    return RecordingResponse(
        id=recording.id,
        session_id=recording.session_id,
        audio_url=recording.audio_url,
        duracion_segundos=recording.duracion_segundos,
        formato=recording.formato,
        created_at=to_local_iso(recording.created_at) or ""
    )


@router.post("/sessions/{session_id}/upload", response_model=RecordingResponse)
async def upload_audio_file(
    session_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload audio file to Cloudflare R2 and register the recording."""
    # Check if session exists
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    # Build storage key
    original_ext = Path(file.filename or "").suffix or ".wav"
    storage_key = f"recordings/session_{session_id}/{uuid4()}{original_ext}"

    # Upload to R2 (private bucket)
    try:
        file.file.seek(0)
        upload_fileobj(
            file.file,
            bucket=settings.R2_BUCKET,
            key=storage_key,
            content_type=file.content_type or "audio/wav",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading to storage: {exc}"
        )
    
    recording = Recording(
        session_id=session_id,
        audio_url=storage_key,  # store the storage key, not a public URL
        formato=file.content_type or "audio/wav",
        metadata_carga={
            "filename": file.filename,
            "content_type": file.content_type,
            "storage": "r2"
        }
    )
    
    db.add(recording)
    
    # Update session state
    if session.estado == SessionState.RUNNING.value:
        session.estado = SessionState.AUDIO_UPLOADED.value
    
    db.commit()
    db.refresh(recording)
    
    return RecordingResponse(
        id=recording.id,
        session_id=recording.session_id,
        audio_url=recording.audio_url,
        duracion_segundos=recording.duracion_segundos,
        formato=recording.formato,
        created_at=to_local_iso(recording.created_at) or ""
    )


@router.get("/recordings/{recording_id}/download")
def get_recording_download_url(
    recording_id: int,
    current_role: str = Depends(get_current_user_role),
    db: Session = Depends(get_db),
    expires_seconds: int = 600,
):
    """Return a presigned URL to download a recording (ANALISTA only)."""
    if current_role != "ANALISTA":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only ANALISTA can download recordings")

    recording = db.query(Recording).filter(Recording.id == recording_id).first()
    if not recording:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording not found")

    if not recording.audio_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recording has no storage key")

    try:
        presigned_url = presign_get_url(
            bucket=settings.R2_BUCKET,
            key=recording.audio_url,
            expires_seconds=expires_seconds,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error generating download URL: {exc}")

    return {
        "recording_id": recording_id,
        "download_url": presigned_url,
        "expires_in": expires_seconds,
    }
