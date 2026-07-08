from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.domains.plans.models import MealPlan


class PlansService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_plan_request(self, user_id: UUID, days: int) -> MealPlan:
        plan = MealPlan(user_id=user_id, days=days, status="pending")
        self.session.add(plan)
        await self.session.commit()
        await self.session.refresh(plan)
        return plan

    async def create_group_plan_request(self, group_id: UUID, days: int):
        plan = MealPlan(group_id=group_id, days=days, status="pending")
        self.session.add(plan)
        await self.session.commit()
        await self.session.refresh(plan)
        return plan

    async def get_plan(self, plan_id: UUID) -> MealPlan:
        result = await self.session.execute(select(MealPlan).where(MealPlan.id == plan_id))
        plan = result.scalar_one_or_none()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Plan not found")
        return plan

    async def get_my_plans(self, user_id: UUID) -> list[MealPlan]:
        result = await self.session.execute(
            select(MealPlan).where(MealPlan.user_id == user_id).order_by(MealPlan.created_at.desc())
        )
        return list(result.scalars().all())
