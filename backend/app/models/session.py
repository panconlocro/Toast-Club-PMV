from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base
from ..core.state_machine import SessionState
import secrets


class Session(Base):
    """Session model for training sessions."""
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_code = Column(String, unique=True, index=True, nullable=False)
    
    # Participant data
    datos_participante = Column(JSON, nullable=False)  # {nombre, edad_aproximada, email_opcional}
    texto_seleccionado = Column(JSON, nullable=False)
    
    # State management
    estado = Column(String, nullable=False, default=SessionState.CREATED.value)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    recordings = relationship("Recording", back_populates="session", cascade="all, delete-orphan")
    surveys = relationship("Survey", back_populates="session", cascade="all, delete-orphan")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.session_code:
            self.session_code = self.generate_session_code()
    
    @staticmethod
    def generate_session_code() -> str:
        """Generate a unique session code."""
        return secrets.token_urlsafe(8)
