"""
User API endpoints for Toast Club PMV
"""
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])

# In-memory storage for MVP (replace with database later)
users_db: dict = {}


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: User) -> User:
    """
    Create a new user (impulsador or analista)
    """
    import uuid
    user.id = f"usr_{uuid.uuid4().hex[:12]}"
    
    # Validate role
    if user.role not in ["impulsador", "analista"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'impulsador' or 'analista'"
        )
    
    users_db[user.id] = user
    return user


@router.get("/", response_model=List[User])
async def list_users(role: str = None) -> List[User]:
    """
    List all users, optionally filtered by role
    """
    users = list(users_db.values())
    if role:
        users = [u for u in users if u.role == role]
    return users


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str) -> User:
    """
    Get a specific user by ID
    """
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    return users_db[user_id]


@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: User) -> User:
    """
    Update a user
    """
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    
    existing_user = users_db[user_id]
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(existing_user, field, value)
    
    from datetime import datetime
    existing_user.updated_at = datetime.utcnow()
    
    return existing_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """
    Delete a user
    """
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    
    del users_db[user_id]
    return None
