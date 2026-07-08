from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.domains.users.models import User
from app.domains.auth.schemas import UserRegister, UserLogin, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register(self, data: UserRegister) -> TokenResponse:
        result = await (self.
                        session.
                        execute(select(User).where(User.email == data.email)))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Email already exists")

        user = User(email=data.email,
                    password_hash=hash_password(data.password))
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def login(self, data: UserLogin) -> TokenResponse:
        result = await (self.
                        session.
                        execute(select(User).where(User.email == data.email)))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Invalid credentials")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="User is inactive")

        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )
