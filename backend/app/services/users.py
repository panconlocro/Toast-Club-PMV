import secrets
from typing import Tuple
from sqlalchemy.orm import Session
from ..models.user import User
from ..core.security import get_password_hash

ALLOWED_ROLES = {"IMPULSADOR", "ANALISTA"}


def generate_temporary_password() -> str:
    return secrets.token_urlsafe(12)


def create_user_with_temp_password(db: Session, email: str, role: str) -> Tuple[User, str]:
    """Create a user with a temporary password.

    Returns the created user and the temporary password.
    """
    normalized_email = email.strip().lower()
    normalized_role = role.strip().upper()

    if normalized_role not in ALLOWED_ROLES:
        raise ValueError("Invalid role")

    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise ValueError("Email already exists")

    temporary_password = generate_temporary_password()
    user = User(
        email=normalized_email,
        password_hash=get_password_hash(temporary_password),
        rol=normalized_role,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user, temporary_password


def reset_user_password(db: Session, user: User) -> str:
    temporary_password = generate_temporary_password()
    user.password_hash = get_password_hash(temporary_password)
    db.commit()
    db.refresh(user)
    return temporary_password
