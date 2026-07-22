from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.limiter import LOGIN_RATE_LIMIT, REGISTER_RATE_LIMIT, limiter
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.services import auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit(REGISTER_RATE_LIMIT)
async def register(request: Request, body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(db, body)


@router.post("/login", response_model=AuthResponse, response_model_by_alias=True)
@limiter.limit(LOGIN_RATE_LIMIT)
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, body)
