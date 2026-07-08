from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domains.auth.dependencies import get_current_user
from app.domains.users.models import User
from app.domains.plans.schemas import PlanGenerateRequest, MealPlanOut
from app.domains.plans.service import PlansService

router = APIRouter()


@router.post("/generate", response_model=MealPlanOut, status_code=201)
async def generate_plan(
    data: PlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if data.is_group and data.group_id:
        return await PlansService(session).create_group_plan_request(data.group_id, data.days)
    return await PlansService(session).create_plan_request(current_user.id, data.days)


@router.get("/", response_model=list[MealPlanOut])
async def get_my_plans(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await PlansService(session).get_my_plans(current_user.id)


@router.get("/{plan_id}", response_model=MealPlanOut)
async def get_plan(
    plan_id: str,
    session: AsyncSession = Depends(get_db),
):
    return await PlansService(session).get_plan(plan_id)
