"""
Session API endpoints for Toast Club PMV
"""
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models import Session, SessionState

router = APIRouter(prefix="/sessions", tags=["sessions"])

# In-memory storage for MVP (replace with database later)
sessions_db: dict = {}


@router.post("/", response_model=Session, status_code=status.HTTP_201_CREATED)
async def create_session(session: Session) -> Session:
    """
    Create a new VR session
    """
    import uuid
    session.id = f"ses_{uuid.uuid4().hex[:12]}"
    session.state = SessionState.CREATED
    sessions_db[session.id] = session
    return session


@router.get("/", response_model=List[Session])
async def list_sessions(user_id: str = None) -> List[Session]:
    """
    List all sessions, optionally filtered by user_id
    """
    sessions = list(sessions_db.values())
    if user_id:
        sessions = [s for s in sessions if s.user_id == user_id]
    return sessions


@router.get("/{session_id}", response_model=Session)
async def get_session(session_id: str) -> Session:
    """
    Get a specific session by ID
    """
    if session_id not in sessions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    return sessions_db[session_id]


@router.put("/{session_id}", response_model=Session)
async def update_session(session_id: str, session_update: Session) -> Session:
    """
    Update a session
    """
    if session_id not in sessions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    existing_session = sessions_db[session_id]
    update_data = session_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(existing_session, field, value)
    
    from datetime import datetime
    existing_session.updated_at = datetime.utcnow()
    
    return existing_session


@router.patch("/{session_id}/state", response_model=Session)
async def update_session_state(session_id: str, new_state: SessionState) -> Session:
    """
    Update session state
    """
    if session_id not in sessions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    session = sessions_db[session_id]
    session.state = new_state
    
    from datetime import datetime
    session.updated_at = datetime.utcnow()
    
    if new_state == SessionState.RUNNING and not session.started_at:
        session.started_at = datetime.utcnow()
    elif new_state == SessionState.COMPLETED:
        session.completed_at = datetime.utcnow()
    
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str):
    """
    Delete a session
    """
    if session_id not in sessions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    del sessions_db[session_id]
    return None
