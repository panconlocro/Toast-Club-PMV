from sqlalchemy import Column, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base


class Survey(Base):
    """Survey model for post-session surveys."""
    __tablename__ = "surveys"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    
    # Survey data
    respuestas_json = Column(JSON, nullable=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("Session", back_populates="surveys")
