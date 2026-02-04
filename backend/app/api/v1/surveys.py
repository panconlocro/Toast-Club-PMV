from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List
from ...db.session import get_db
from ...models.survey import Survey
from ...models.session import Session as SessionModel
from ...core.state_machine import SessionState
from ...core.time import to_local_iso

router = APIRouter()


class SurveyCreate(BaseModel):
    """Schema for creating a survey."""
    respuestas_json: Dict[str, Any]


class SurveyResponse(BaseModel):
    """Schema for survey response."""
    id: int
    session_id: int
    respuestas_json: Dict[str, Any]
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/sessions/{session_id}/survey", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_survey(
    session_id: int,
    survey_data: SurveyCreate,
    db: Session = Depends(get_db)
):
    """Create a survey for a session."""
    # Check if session exists
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    # Create survey
    survey = Survey(
        session_id=session_id,
        respuestas_json=survey_data.respuestas_json
    )
    
    db.add(survey)
    
    # Update session state to completed if it's in survey_pending state
    if session.estado == SessionState.SURVEY_PENDING.value:
        session.estado = SessionState.COMPLETED.value
    
    db.commit()
    db.refresh(survey)
    
    return SurveyResponse(
        id=survey.id,
        session_id=survey.session_id,
        respuestas_json=survey.respuestas_json,
        created_at=to_local_iso(survey.created_at) or ""
    )


@router.get("/sessions/{session_id}/survey", response_model=List[SurveyResponse])
def get_session_surveys(session_id: int, db: Session = Depends(get_db)):
    """Get all surveys for a session."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    surveys = db.query(Survey).filter(Survey.session_id == session_id).all()
    
    return [
        SurveyResponse(
            id=survey.id,
            session_id=survey.session_id,
            respuestas_json=survey.respuestas_json,
            created_at=to_local_iso(survey.created_at) or ""
        )
        for survey in surveys
    ]
