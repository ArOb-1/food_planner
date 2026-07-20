from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.auth.dependencies import get_current_user
from app.domains.users.models import User
from app.domains.groups.schemas import (
    GroupCreate, GroupAddMember, GroupOut, GroupProfileOut
)
from app.domains.groups.service import GroupsService


router = APIRouter()


@router.post("/", response_model=GroupOut, status_code=201)
async def create_group(
    data: GroupCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await GroupsService(session).create_group(current_user.id, data)


@router.get("/", response_model=list[GroupOut])
async def get_my_groups(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await GroupsService(session).get_my_groups(current_user.id)


@router.get("/{group_id}", response_model=GroupOut)
async def get_group(
    group_id: str,
    session: AsyncSession = Depends(get_db),
):
    return await GroupsService(session).get_group(group_id)


@router.post("/{group_id}/members", response_model=GroupOut)
async def add_member(
    group_id: str,
    data: GroupAddMember,
    session: AsyncSession = Depends(get_db),
):
    return await GroupsService(session).add_member(group_id, data.user_id)


@router.delete("/{group_id}/members/{user_id}", response_model=GroupOut)
async def remove_member(
    group_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await GroupsService(session).remove_member(group_id,
                                                      user_id,
                                                      current_user.id)


@router.get("/{group_id}/profile", response_model=GroupProfileOut)
async def get_group_profile(
    group_id: str,
    session: AsyncSession = Depends(get_db),
):
    return await GroupsService(session).get_group_profile(group_id)


@router.delete("/{group_id}", status_code=204)
async def delete_group(
    group_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    await GroupsService(session).delete_group(group_id, current_user.id)
