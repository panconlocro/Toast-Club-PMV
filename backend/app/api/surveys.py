"""
Survey API endpoints for Toast Club PMV
"""
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models import Survey

router = APIRouter(prefix="/surveys", tags=["surveys"])

# In-memory storage for MVP (replace with database later)
surveys_db: dict = {}


@router.post("/", response_model=Survey, status_code=status.HTTP_201_CREATED)
async def create_survey(survey: Survey) -> Survey:
    """
    Create a new survey
    """
    import uuid
    survey.id = f"srv_{uuid.uuid4().hex[:12]}"
    surveys_db[survey.id] = survey
    return survey


@router.get("/", response_model=List[Survey])
async def list_surveys(session_id: str = None, user_id: str = None) -> List[Survey]:
    """
    List all surveys, optionally filtered by session_id or user_id
    """
    surveys = list(surveys_db.values())
    if session_id:
        surveys = [s for s in surveys if s.session_id == session_id]
    if user_id:
        surveys = [s for s in surveys if s.user_id == user_id]
    return surveys


@router.get("/{survey_id}", response_model=Survey)
async def get_survey(survey_id: str) -> Survey:
    """
    Get a specific survey by ID
    """
    if survey_id not in surveys_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey {survey_id} not found"
        )
    return surveys_db[survey_id]


@router.put("/{survey_id}", response_model=Survey)
async def update_survey(survey_id: str, survey_update: Survey) -> Survey:
    """
    Update a survey (typically to submit responses)
    """
    if survey_id not in surveys_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey {survey_id} not found"
        )
    
    existing_survey = surveys_db[survey_id]
    update_data = survey_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(existing_survey, field, value)
    
    from datetime import datetime
    existing_survey.updated_at = datetime.utcnow()
    
    # Mark as completed if responses are provided
    if existing_survey.responses and not existing_survey.is_completed:
        existing_survey.is_completed = True
        existing_survey.completed_at = datetime.utcnow()
    
    return existing_survey


@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_survey(survey_id: str):
    """
    Delete a survey
    """
    if survey_id not in surveys_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey {survey_id} not found"
        )
    
    del surveys_db[survey_id]
    return None
