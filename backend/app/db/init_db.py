from sqlalchemy.orm import Session
from sqlalchemy import text
from ..models.base import Base
from ..models.user import User
from ..core.security import get_password_hash
from .session import engine


def init_db(db: Session) -> None:
    """Initialize database with tables and seed data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Ensure new columns exist when running without migrations
    db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE"))
    db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE"))
    db.commit()
    
    # Create default users if they don't exist
    impulsador = db.query(User).filter(User.email == "impulsador@toastclub.com").first()
    if not impulsador:
        impulsador = User(
            email="impulsador@toastclub.com",
            password_hash=get_password_hash("impulsador123"),
            rol="IMPULSADOR"
        )
        db.add(impulsador)
    
    analista = db.query(User).filter(User.email == "analista@toastclub.com").first()
    if not analista:
        analista = User(
            email="analista@toastclub.com",
            password_hash=get_password_hash("analista123"),
            rol="ANALISTA"
        )
        db.add(analista)
    
    db.commit()
