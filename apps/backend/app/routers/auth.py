from fastapi import APIRouter, Depends, Request

from app.core.database import get_db
from app.core.limiter import limiter
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.services import auth_service
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status

router = APIRouter()


@router.post("/register", response_model=AuthResponse, response_model_by_alias=True, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(db, body)


@router.post("/login", response_model=AuthResponse, response_model_by_alias=True)
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, body)
