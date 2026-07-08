from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleSlug, require_permission, require_role
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import MeResponse, UserOut
from app.schemas.user import AdminUserCreateRequest, ResetPasswordRequest, UsersListResponse, UserUpdateRequest
from app.services import user_service

router = APIRouter()


@router.get("/me", response_model=MeResponse, response_model_by_alias=True)
async def get_me(current_user: User = Depends(get_current_user)):
    return user_service.get_me(current_user)


@router.get("", response_model=UsersListResponse, response_model_by_alias=True)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: list[str] = Query(default=[]),
    q: str | None = Query(default=None, max_length=200),
    user_status: Literal["active", "inactive", "deleted"] = Query(default="active", alias="status"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission("user:read")),
):
    return await user_service.list_users(db, page, page_size, sort, q, user_status)


@router.post("", response_model=UserOut, response_model_by_alias=True, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: AdminUserCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("user:create")),
):
    return await user_service.create_user(db, body, current_user)


@router.patch("/{user_id}", response_model=UserOut, response_model_by_alias=True)
async def update_user(
    user_id: UUID,
    body: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("user:edit")),
):
    return await user_service.update_user(db, user_id, body, current_user)


@router.post("/{user_id}/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_user_password(
    user_id: UUID,
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(RoleSlug.ADMIN)),
):
    return await user_service.reset_password(db, user_id, body)


@router.post("/{user_id}/restore", response_model=UserOut, response_model_by_alias=True)
async def restore_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("user:edit")),
):
    return await user_service.restore_user(db, user_id, current_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("user:edit")),
):
    return await user_service.delete_user(db, user_id, current_user)


@router.get("/{user_id}", response_model=UserOut, response_model_by_alias=True)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission("user:read")),
):
    return await user_service.get_user(db, user_id)
