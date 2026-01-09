from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from ...db.session import get_db
from ...models.session import Session as SessionModel
from ...core.state_machine import SessionState, SessionStateMachine
from ...core.time import to_local_iso

router = APIRouter()


class ParticipantData(BaseModel):
    """Participant data schema."""
    nombre: str = Field(..., min_length=1, max_length=100)
    edad_aproximada: Optional[int] = Field(None, ge=1, le=120)
    email_opcional: Optional[str] = None


class SessionCreate(BaseModel):
    """Schema for creating a session."""
    datos_participante: ParticipantData
    texto_seleccionado: str = Field(..., min_length=1)


class SessionResponse(BaseModel):
    """Schema for session response."""
    id: int
    session_code: str
    datos_participante: Dict[str, Any]
    texto_seleccionado: str
    estado: str
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class StateUpdateRequest(BaseModel):
    """Schema for updating session state."""
    new_state: SessionState


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(session_data: SessionCreate, db: Session = Depends(get_db)):
    """Create a new training session."""
    # Create new session
    new_session = SessionModel(
        datos_participante=session_data.datos_participante.model_dump(),
        texto_seleccionado=session_data.texto_seleccionado,
        estado=SessionState.CREATED.value
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return SessionResponse(
        id=new_session.id,
        session_code=new_session.session_code,
        datos_participante=new_session.datos_participante,
        texto_seleccionado=new_session.texto_seleccionado,
        estado=new_session.estado,
        created_at=to_local_iso(new_session.created_at) or "",
        updated_at=to_local_iso(new_session.updated_at)
    )


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    """Get session details by ID."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    return SessionResponse(
        id=session.id,
        session_code=session.session_code,
        datos_participante=session.datos_participante,
        texto_seleccionado=session.texto_seleccionado,
        estado=session.estado,
        created_at=to_local_iso(session.created_at) or "",
        updated_at=to_local_iso(session.updated_at)
    )

@router.get("/sessions/by-code/{session_code}", response_model=SessionResponse)
def get_session_by_code(session_code: str, db: Session = Depends(get_db)):
    """Get session details by session_code (for VR app)."""
    session = db.query(SessionModel).filter(SessionModel.session_code == session_code).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid session_code"
        )

    return SessionResponse(
        id=session.id,
        session_code=session.session_code,
        datos_participante=session.datos_participante,
        texto_seleccionado=session.texto_seleccionado,
        estado=session.estado,
        created_at=to_local_iso(session.created_at) or "",
        updated_at=to_local_iso(session.updated_at)
    )

@router.patch("/sessions/{session_id}/state", response_model=SessionResponse)
def update_session_state(
    session_id: int,
    state_update: StateUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update session state following the state machine rules."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    # Validate state transition
    current_state = SessionState(session.estado)
    new_state = state_update.new_state
    
    try:
        SessionStateMachine.validate_transition(current_state, new_state)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Update state
    session.estado = new_state.value
    db.commit()
    db.refresh(session)
    
    return SessionResponse(
        id=session.id,
        session_code=session.session_code,
        datos_participante=session.datos_participante,
        texto_seleccionado=session.texto_seleccionado,
        estado=session.estado,
        created_at=to_local_iso(session.created_at) or "",
        updated_at=to_local_iso(session.updated_at)
    )
