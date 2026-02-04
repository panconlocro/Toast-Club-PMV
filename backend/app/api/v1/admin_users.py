from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
import logging

from ...db.session import get_db
from ...core.security import get_current_user_id
from ...core.time import to_local_iso
from ...models.user import User
from ...services.users import create_user_with_temp_password, reset_user_password, ALLOWED_ROLES

router = APIRouter()
logger = logging.getLogger(__name__)


class AdminUserCreate(BaseModel):
    email: EmailStr
    role: str


class AdminUserOut(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: str


class AdminUserCreateResponse(BaseModel):
    user: AdminUserOut
    temporary_password: str


class AdminUserResetPasswordResponse(BaseModel):
    temporary_password: str


class AdminUserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


def _require_analista(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    if user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PASSWORD_CHANGE_REQUIRED"
        )
    if user.rol != "ANALISTA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ANALISTA users can access this resource"
        )
    return user


def _build_admin_user_out(user: User) -> AdminUserOut:
    return AdminUserOut(
        id=user.id,
        email=user.email,
        role=user.rol,
        is_active=user.is_active,
        created_at=to_local_iso(user.created_at) or "",
    )


@router.get("/admin/users", response_model=List[AdminUserOut])
def list_admin_users(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    _require_analista(current_user_id, db)

    users = db.query(User).offset(skip).limit(limit).all()
    return [_build_admin_user_out(user) for user in users]


@router.post("/admin/users", response_model=AdminUserCreateResponse, status_code=status.HTTP_201_CREATED)
def create_admin_user(
    payload: AdminUserCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    _require_analista(current_user_id, db)

    normalized_role = payload.role.strip().upper()
    if normalized_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    try:
        user, temporary_password = create_user_with_temp_password(
            db,
            email=payload.email,
            role=normalized_role
        )
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_400_BAD_REQUEST
        if "Email already exists" in detail:
            status_code = status.HTTP_409_CONFLICT
        raise HTTPException(status_code=status_code, detail=detail) from exc

    logger.info(
        "admin_users.create user_id=%s created_user_id=%s role=%s",
        current_user_id,
        user.id,
        user.rol
    )

    return AdminUserCreateResponse(
        user=_build_admin_user_out(user),
        temporary_password=temporary_password
    )


@router.post("/admin/users/{user_id}/reset-password", response_model=AdminUserResetPasswordResponse)
def reset_admin_user_password(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    current_user = _require_analista(current_user_id, db)
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot reset your own password via this endpoint"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    temporary_password = reset_user_password(db, user)
    logger.info(
        "admin_users.reset_password user_id=%s target_user_id=%s",
        current_user.id,
        user.id
    )
    return AdminUserResetPasswordResponse(temporary_password=temporary_password)


@router.patch("/admin/users/{user_id}", response_model=AdminUserOut)
def update_admin_user(
    user_id: int,
    payload: AdminUserUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    current_user = _require_analista(current_user_id, db)
    if user_id == current_user.id and (payload.role is not None or payload.is_active is not None):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify your own role or active status"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if payload.role is not None:
        normalized_role = payload.role.strip().upper()
        if normalized_role not in ALLOWED_ROLES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role"
            )
        user.rol = normalized_role

    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    logger.info(
        "admin_users.update user_id=%s target_user_id=%s role=%s is_active=%s",
        current_user.id,
        user.id,
        user.rol,
        user.is_active
    )
    return _build_admin_user_out(user)
