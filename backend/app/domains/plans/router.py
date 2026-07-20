from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.auth.dependencies import get_current_user
from app.domains.users.models import User
from app.domains.plans.schemas import PlanGenerateRequest, MealPlanOut
from app.domains.plans.service import PlansService
from app.domains.groups.service import GroupsService
from app.domains.groups.schemas import GroupOut

router = APIRouter()


@router.post("/generate", response_model=MealPlanOut, status_code=201)
async def generate_plan(
    data: PlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await PlansService(session).create_plan_request(current_user.id,
                                                           data)


@router.get("/", response_model=list[MealPlanOut])
async def get_my_plans(
    group_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if group_id:
        return await PlansService(session).get_group_plans(group_id)
    return await PlansService(session).get_my_plans(current_user.id)


@router.get("/{plan_id}", response_model=MealPlanOut)
async def get_plan(
    plan_id: str,
    session: AsyncSession = Depends(get_db),
):
    return await PlansService(session).get_plan(plan_id)


@router.delete("/{plan_id}", status_code=204)
async def delete_plan(
    plan_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    await PlansService(session).delete_plan(plan_id)


@router.delete("/{group_id}/members/{user_id}", response_model=GroupOut)
async def remove_member(
    group_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await GroupsService(session).remove_member(group_id, user_id, current_user.id)
