from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.domains.users.models import User
from app.domains.users.schemas import ProfileUpdate


class UsersService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _get_user(self, user_id: UUID):
        result = await self.session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def get_me(self, user_id: UUID):
        return await self._get_user(user_id)

    async def update_profile(self, user_id: UUID, data: ProfileUpdate):
        user = await self._get_user(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        await self.session.commit()
        await self.session.refresh(user)
        return user
