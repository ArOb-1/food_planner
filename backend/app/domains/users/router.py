from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domains.auth.dependencies import get_current_user
from app.domains.users.models import User
from app.domains.users.schemas import UserOut, ProfileUpdate
from app.domains.users.service import UsersService

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me/profile", response_model=UserOut)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await UsersService(session).update_profile(current_user.id, data)


@router.get("/search")
async def search_users(
    email: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(User).where(User.email.ilike(f"%{email}%")).limit(5)
    )
    users = result.scalars().all()
    return [{"id": str(u.id), "email": u.email} for u in users]


@router.get("/{user_id}")
async def get_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "email": user.email, "name": user.name}
