"""
Survey model for Toast Club PMV
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class Survey(BaseModel):
    """
    Survey model representing post-session surveys
    """
    id: Optional[str] = Field(default=None, description="Survey unique identifier")
    session_id: str = Field(..., description="Associated session ID")
    user_id: str = Field(..., description="User who completed the survey")
    questions: Dict[str, Any] = Field(default_factory=dict, description="Survey questions and structure")
    responses: Dict[str, Any] = Field(default_factory=dict, description="User responses to survey questions")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Survey completion timestamp")
    is_completed: bool = Field(default=False, description="Whether the survey has been completed")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "srv_123456",
                "session_id": "ses_123456",
                "user_id": "usr_123456",
                "questions": {
                    "q1": "¿Cómo calificarías la experiencia?",
                    "q2": "¿Qué mejorarías?"
                },
                "responses": {
                    "q1": "Excelente",
                    "q2": "Más tiempo de práctica"
                },
                "is_completed": True
            }
        }
