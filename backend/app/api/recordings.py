"""
Recording API endpoints for Toast Club PMV
"""
from typing import List
from fastapi import APIRouter, HTTPException, status, UploadFile, File
from app.models import Recording

router = APIRouter(prefix="/recordings", tags=["recordings"])

# In-memory storage for MVP (replace with database later)
recordings_db: dict = {}


@router.post("/", response_model=Recording, status_code=status.HTTP_201_CREATED)
async def create_recording(recording: Recording) -> Recording:
    """
    Create a new recording entry
    """
    import uuid
    recording.id = f"rec_{uuid.uuid4().hex[:12]}"
    recordings_db[recording.id] = recording
    return recording


@router.post("/upload", response_model=Recording, status_code=status.HTTP_201_CREATED)
async def upload_recording(
    session_id: str,
    file: UploadFile = File(...)
) -> Recording:
    """
    Upload a recording file for a session
    """
    import uuid
    from datetime import datetime, timezone
    
    # Create recording entry
    recording_id = f"rec_{uuid.uuid4().hex[:12]}"
    file_path = f"/recordings/{recording_id}_{file.filename}"
    
    # In a real implementation, save the file to disk or cloud storage
    # For MVP, we just create the metadata
    
    recording = Recording(
        id=recording_id,
        session_id=session_id,
        file_path=file_path,
        mime_type=file.content_type or "audio/mpeg",
        uploaded_at=datetime.now(timezone.utc)
    )
    
    recordings_db[recording.id] = recording
    return recording


@router.get("/", response_model=List[Recording])
async def list_recordings(session_id: str = None) -> List[Recording]:
    """
    List all recordings, optionally filtered by session_id
    """
    recordings = list(recordings_db.values())
    if session_id:
        recordings = [r for r in recordings if r.session_id == session_id]
    return recordings


@router.get("/{recording_id}", response_model=Recording)
async def get_recording(recording_id: str) -> Recording:
    """
    Get a specific recording by ID
    """
    if recording_id not in recordings_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recording {recording_id} not found"
        )
    return recordings_db[recording_id]


@router.delete("/{recording_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recording(recording_id: str):
    """
    Delete a recording
    """
    if recording_id not in recordings_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recording {recording_id} not found"
        )
    
    del recordings_db[recording_id]
    return None
