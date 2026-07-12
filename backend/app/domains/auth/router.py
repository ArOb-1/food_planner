from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domains.auth.schemas import UserRegister, UserLogin, TokenResponse
from app.domains.auth.service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserRegister, session: AsyncSession = Depends(get_db)):
    return await AuthService(session).register(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, session: AsyncSession = Depends(get_db)):
    return await AuthService(session).login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    refresh_token: str = Body(..., embed=True),
    session: AsyncSession = Depends(get_db),
):
    return await AuthService(session).refresh(refresh_token)
