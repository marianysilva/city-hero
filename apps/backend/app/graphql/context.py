from uuid import UUID

import jwt
from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User


async def _user_from_request(request: Request, db: AsyncSession) -> User | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            return None
    except jwt.InvalidTokenError:
        return None

    result = await db.execute(
        select(User).where(User.id == UUID(user_id), User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    return user if (user and user.is_active) else None


async def get_graphql_context(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    current_user = await _user_from_request(request, db)
    return {"request": request, "db": db, "current_user": current_user}
