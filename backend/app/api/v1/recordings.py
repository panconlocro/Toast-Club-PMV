from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from ...db.session import get_db
from ...models.recording import Recording
from ...models.session import Session as SessionModel
from ...core.state_machine import SessionState
import os
from pathlib import Path

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
    """Create a recording for a session (mock implementation)."""
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
        created_at=recording.created_at.isoformat() if recording.created_at else ""
    )


@router.post("/sessions/{session_id}/upload", response_model=RecordingResponse)
async def upload_audio_file(
    session_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload audio file for a session (placeholder implementation)."""
    # Check if session exists
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    # For PMV, we just save the file info without actual file storage
    # In production, you would save to cloud storage (S3, etc.)
    file_path = f"/uploads/session_{session_id}_{file.filename}"
    
    recording = Recording(
        session_id=session_id,
        audio_url=file_path,
        formato=file.content_type or "audio/wav",
        metadata_carga={
            "filename": file.filename,
            "content_type": file.content_type
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
        created_at=recording.created_at.isoformat() if recording.created_at else ""
    )
