"""
User model for Toast Club PMV
"""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    """
    User model representing impulsadores (promoters) and analistas (analysts)
    """
    id: Optional[str] = Field(default=None, description="User unique identifier")
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., description="User full name")
    role: str = Field(..., description="User role: impulsador or analista")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Creation timestamp")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Last update timestamp")
    is_active: bool = Field(default=True, description="User active status")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "usr_123456",
                "email": "usuario@toastclub.com",
                "name": "Juan Pérez",
                "role": "impulsador",
                "is_active": True
            }
        }
