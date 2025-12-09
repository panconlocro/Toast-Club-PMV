"""
Recording model for Toast Club PMV
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Recording(BaseModel):
    """
    Recording model representing audio/video recordings from VR sessions
    """
    id: Optional[str] = Field(default=None, description="Recording unique identifier")
    session_id: str = Field(..., description="Associated session ID")
    file_path: str = Field(..., description="Path to the recording file")
    file_size: Optional[int] = Field(default=None, description="File size in bytes")
    duration: Optional[int] = Field(default=None, description="Recording duration in seconds")
    mime_type: str = Field(default="audio/mpeg", description="MIME type of the recording")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    uploaded_at: Optional[datetime] = Field(default=None, description="Upload completion timestamp")
    is_processed: bool = Field(default=False, description="Whether the recording has been processed")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "rec_123456",
                "session_id": "ses_123456",
                "file_path": "/recordings/ses_123456_audio.mp3",
                "file_size": 1048576,
                "duration": 300,
                "mime_type": "audio/mpeg",
                "is_processed": False
            }
        }
