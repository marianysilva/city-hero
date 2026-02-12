from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer()

_JWT_ALGORITHM = "HS256"

# Pre-computed at startup so every login call runs bcrypt regardless of whether
# the email exists — prevents timing-based user enumeration attacks.
_BCRYPT_ROUNDS = 12

DUMMY_PASSWORD_HASH: str = bcrypt.hashpw(
    b"__cityhero_internal_timing_dummy__", bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)
).decode()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: UUID, role: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "iat": now, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=_JWT_ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[_JWT_ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception

    result = await db.execute(
        select(User).where(User.id == UUID(user_id), User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user
