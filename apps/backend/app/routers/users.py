from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.enums import UserRole
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.schemas.auth import UserOut, user_to_out

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return user_to_out(current_user)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.id == user_id, User.is_active.is_(True))
    if current_user.role != UserRole.ADMIN:
        if current_user.city_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        query = query.where(User.city_id == current_user.city_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user_to_out(user)
