from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from ...db.session import get_db
from ...models.user import User
from ...core.security import (
    verify_password,
    create_access_token,
    get_current_user_id,
    get_current_user_role,
)
from ...core.config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    rol: str


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    rol: str
    
    class Config:
        from_attributes = True


@router.post("/auth/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint."""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.rol},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        rol=user.rol
    )


@router.get("/auth/me", response_model=UserResponse)
def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current user info."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        rol=user.rol
    )


@router.post("/auth/logout")
def logout():
    """Logout endpoint (token-based, client should discard token)."""
    return {"message": "Successfully logged out"}
