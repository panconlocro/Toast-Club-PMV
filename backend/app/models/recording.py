from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base


class Recording(Base):
    """Recording model for audio recordings."""
    __tablename__ = "recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    
    # Audio data
    storage_key = Column(String, nullable=False)
    duracion_segundos = Column(Float, nullable=True)
    formato = Column(String, nullable=True)  # mp3, wav, etc.
    metadata_carga = Column(JSON, nullable=True)  # Additional upload metadata
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("Session", back_populates="recordings")
