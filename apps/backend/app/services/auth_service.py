from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac_cache import resolve_role_id
from app.core.security import DUMMY_PASSWORD_HASH, create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, user_to_out


async def register(db: AsyncSession, body: RegisterRequest) -> AuthResponse:
    # Hash first so response time is constant whether the email exists or not.
    # Without this, a 409 returns in ~1 ms while a 201 takes ~250 ms (bcrypt),
    # leaking whether a given email is registered via timing measurement.
    hashed = hash_password(body.password)

    result = await db.execute(
        select(User).where(User.email == body.email, User.deleted_at.is_(None))
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hashed,
        role="citizen",
        role_id=resolve_role_id("citizen"),
        **({"language": body.language} if body.language is not None else {}),
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        # Race condition or soft-deleted row still holds the unique constraint.
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    await db.refresh(user)

    token = create_access_token(user.id, user.role)
    return AuthResponse(access_token=token, user=user_to_out(user))


async def login(db: AsyncSession, body: LoginRequest) -> AuthResponse:
    result = await db.execute(select(User).where(User.email == body.email, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()

    # Always run bcrypt regardless of whether the user exists.
    # Short-circuiting on user is None would leak timing information
    # allowing an attacker to enumerate valid email addresses.
    hashed = user.hashed_password if (user is not None and user.hashed_password) else DUMMY_PASSWORD_HASH
    password_ok = verify_password(body.password, hashed)

    # Also reject Gov.br-only users (no local password) attempting password login.
    if user is None or not password_ok or not user.is_active or user.hashed_password is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id, user.role)
    return AuthResponse(access_token=token, user=user_to_out(user))
