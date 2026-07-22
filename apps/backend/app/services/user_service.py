from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import case, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import RoleSlug
from app.core.rbac_cache import (
    can_create_role,
    can_manage,
    get_assignable_role_names,
    get_manageable_role_names,
    get_role_data,
    resolve_role_id,
)
from app.core.security import hash_password
from app.models.user import User
from app.schemas.auth import (
    Capabilities,
    MeResponse,
    RoleInfo,
    UserOut,
    user_to_out,
)
from app.schemas.user import AdminUserCreateRequest, ResetPasswordRequest, UsersListResponse, UserUpdateRequest

# Role hierarchy: lower number = higher privilege (sorts first when ASC).
# Used only for ORDER BY — canonical rank lives in roles.rank in the DB.
_ROLE_RANK = case(
    (User.role == "admin", 0),
    (User.role == "mayor", 1),
    (User.role == "secretary", 2),
    (User.role == "dispatcher", 3),
    (User.role == "field_team", 4),
    (User.role == "citizen", 5),
    else_=6,
)

_SORT_COLUMNS = {
    "name": User.name,
    "email": User.email,
    "role": _ROLE_RANK,
    "status": User.is_active,
    "created_at": User.created_at,
    "deleted_at": User.deleted_at,
}

_DEFAULT_ORDER = [_ROLE_RANK.asc(), User.name.asc()]
_DEFAULT_ORDER_DELETED = [User.deleted_at.desc(), User.name.asc()]


def _build_order(sort: list[str]):
    if not sort:
        return _DEFAULT_ORDER
    order = []
    for item in sort:
        parts = item.split(":", 1)
        field = parts[0]
        col = _SORT_COLUMNS.get(field)
        if col is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid sort field: {field!r}. Allowed: {sorted(_SORT_COLUMNS)}",
            )
        direction = parts[1] if len(parts) > 1 else "asc"
        if direction not in ("asc", "desc"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid sort direction: {direction!r}. Use 'asc' or 'desc'.",
            )
        order.append(col.desc() if direction == "desc" else col.asc())
    return order or _DEFAULT_ORDER


async def _get_active_user_or_404(db: AsyncSession, user_id: UUID) -> User:
    result = await db.execute(
        select(User).where(User.id == user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def get_me(current_user: User) -> MeResponse:
    role_data = get_role_data(current_user.role)
    if role_data is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Role configuration error")

    perms_out = ["*"] if role_data.is_superuser else sorted(role_data.permissions)

    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        auth_provider=current_user.auth_provider,
        is_active=current_user.is_active,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at.isoformat(),
        deleted_at=current_user.deleted_at.isoformat() if current_user.deleted_at else None,
        role_info=RoleInfo(
            name=role_data.name,
            rank=role_data.rank,
            is_superuser=role_data.is_superuser,
        ),
        capabilities=Capabilities(
            permissions=perms_out,
            assignable_roles=get_assignable_role_names(current_user.role),
            manageable_roles=get_manageable_role_names(current_user.role),
        ),
    )


async def list_users(
    db: AsyncSession,
    page: int,
    page_size: int,
    sort: list[str],
    q: str | None,
    user_status: Literal["active", "inactive", "deleted"],
) -> UsersListResponse:
    offset = (page - 1) * page_size

    if user_status == "deleted":
        base_filter = User.deleted_at.isnot(None)
        default_order = _DEFAULT_ORDER_DELETED
    elif user_status == "inactive":
        base_filter = (User.deleted_at.is_(None)) & (User.is_active == False)  # noqa: E712
        default_order = _DEFAULT_ORDER
    else:
        base_filter = (User.deleted_at.is_(None)) & (User.is_active == True)  # noqa: E712
        default_order = _DEFAULT_ORDER

    order = _build_order(sort) if sort else default_order

    base = select(User).where(base_filter)
    count_base = select(func.count()).select_from(User).where(base_filter)

    if q:
        # Escape LIKE metacharacters so user input is treated as a literal substring.
        q_escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        pattern = f"%{q_escaped}%"
        condition = or_(
            User.name.ilike(pattern, escape="\\"),
            User.email.ilike(pattern, escape="\\"),
        )
        base = base.where(condition)
        count_base = count_base.where(condition)

    total = (await db.execute(count_base)).scalar_one()
    users = (await db.execute(base.order_by(*order).offset(offset).limit(page_size))).scalars().all()

    return UsersListResponse(
        users=[user_to_out(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
    )


async def get_user(db: AsyncSession, user_id: UUID) -> UserOut:
    user = await _get_active_user_or_404(db, user_id)
    return user_to_out(user)


async def create_user(db: AsyncSession, body: AdminUserCreateRequest, current_user: User) -> UserOut:
    if not can_create_role(current_user.role, body.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You cannot create a user with role '{body.role}'",
        )
    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
        role=body.role,
        role_id=resolve_role_id(body.role),
        auth_provider="email",
        is_active=True,
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    await db.refresh(user)
    return user_to_out(user)


async def update_user(db: AsyncSession, user_id: UUID, body: UserUpdateRequest, current_user: User) -> UserOut:
    user = await _get_active_user_or_404(db, user_id)

    if not can_manage(current_user.role, user.role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if body.role is not None and current_user.role != RoleSlug.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change user roles",
        )

    if user.id == current_user.id and body.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )

    if body.name is not None:
        user.name = body.name
    if body.role is not None:
        user.role = body.role
        user.role_id = resolve_role_id(body.role)
    if body.is_active is not None:
        user.is_active = body.is_active

    await db.commit()
    await db.refresh(user)
    return user_to_out(user)


async def delete_user(db: AsyncSession, user_id: UUID, current_user: User) -> None:
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    user = await _get_active_user_or_404(db, user_id)

    if not can_manage(current_user.role, user.role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    # deleted_at alone is what excludes a user from login (auth_service.login's
    # deleted_at filter) and from active/inactive listings (list_users' same
    # filter) — is_active is intentionally left untouched so a later restore
    # can bring the user back to whatever status they actually had, instead of
    # always reactivating them.
    user.deleted_at = datetime.now(timezone.utc)
    await db.commit()


async def restore_user(db: AsyncSession, user_id: UUID, current_user: User) -> UserOut:
    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.isnot(None)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or not deleted")

    if not can_manage(current_user.role, user.role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    # is_active is deliberately left as-is: delete_user() no longer touches
    # it, so it already holds the status the user had before being deleted.
    # Forcing it True here would silently re-enable an account that had been
    # disabled on purpose (offboarded, compromised, policy violation) before
    # it was deleted.
    user.deleted_at = None
    await db.commit()
    await db.refresh(user)
    return user_to_out(user)


async def reset_password(db: AsyncSession, user_id: UUID, body: ResetPasswordRequest) -> None:
    user = await _get_active_user_or_404(db, user_id)
    user.hashed_password = hash_password(body.new_password)
    await db.commit()
