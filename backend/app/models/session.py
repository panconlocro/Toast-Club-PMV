"""
Session model for Toast Club PMV
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SessionState(str, Enum):
    """
    Session state enumeration defining the lifecycle of a VR session
    """
    CREATED = "created"
    READY_TO_START = "ready_to_start"
    RUNNING = "running"
    AUDIO_UPLOADED = "audio_uploaded"
    SURVEY_PENDING = "survey_pending"
    COMPLETED = "completed"


class Session(BaseModel):
    """
    Session model representing a VR Toast Club session
    """
    id: Optional[str] = Field(default=None, description="Session unique identifier")
    user_id: str = Field(..., description="ID of the user (impulsador) who created the session")
    title: str = Field(..., description="Session title")
    description: Optional[str] = Field(default=None, description="Session description")
    state: SessionState = Field(default=SessionState.CREATED, description="Current session state")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Creation timestamp")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Last update timestamp")
    started_at: Optional[datetime] = Field(default=None, description="Session start timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Session completion timestamp")
    recording_id: Optional[str] = Field(default=None, description="Associated recording ID")
    survey_id: Optional[str] = Field(default=None, description="Associated survey ID")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "ses_123456",
                "user_id": "usr_123456",
                "title": "Sesión de prueba VR",
                "description": "Primera sesión de práctica",
                "state": "created",
                "recording_id": "rec_123456",
                "survey_id": "srv_123456"
            }
        }
