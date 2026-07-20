import json
import logging
import traceback


from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.domains.plans.models import MealPlan
from app.domains.plans.schemas import PlanGenerateRequest
from app.domains.plans.tasks import generate_plan_task
from app.domains.users.models import User
from app.domains.groups.service import GroupsService
from app.shared.llm_client import generate_meal_plan

logger = logging.getLogger(__name__)


class PlansService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_plan_request(self,
                                  user_id: UUID,
                                  data: PlanGenerateRequest) -> MealPlan:
        plan = MealPlan(
            user_id=user_id if not data.is_group else None,
            group_id=data.group_id if data.is_group else None,
            days=data.days,
            status="pending",
            cooking_time=data.cooking_time,
            meals=data.meals,
            available_products=data.available_products,
            cuisine=data.cuisine,
        )
        self.session.add(plan)
        await self.session.commit()
        await self.session.refresh(plan)

        if data.is_group and data.group_id:
            profile = (await GroupsService(self.session).
                       get_group_profile(data.group_id))
            profile_str = f"""Групповой профиль:
- Запрещённые продукты (аллергии/ненавистные): {", ".join(profile.forbidden) if profile.forbidden else "нет"}
- Приоритетные продукты: {", ".join(profile.priority) if profile.priority else "нет"}
"""
            prompt = self._build_prompt(profile_str, data)
        else:
            result = (await self.
                      session.
                      execute(select(User).where(User.id == user_id)))
            user = result.scalar_one_or_none()
            profile_str = f"""Профиль пользователя:
- Аллергии: {", ".join(user.allergies) if user.allergies else "нет"}
- Любимые продукты: {", ".join(user.liked_products) if user.liked_products else "нет"}
- Ненавистные продукты: {", ".join(user.hated_products) if user.hated_products else "нет"}
- Нелюбимые: {", ".join(user.disliked_products) if user.disliked_products else "нет"}
"""
            prompt = self._build_prompt(profile_str, data)

        generate_plan_task.delay(str(plan.id), prompt)

        return plan

    def _build_prompt(self,
                      profile_str: str,
                      data: PlanGenerateRequest) -> str:
        meal_names = {
            "breakfast": "завтрак",
            "lunch": "обед",
            "dinner": "ужин",
            "snack": "перекус",
        }
        meals_str = ", ".join(meal_names.get(m, m) for m in data.meals)

        prompt = f"""Ты — профессиональный диетолог. Составь сбалансированный план питания на {data.days} дней.

{profile_str}
"""

        if data.cooking_time:
            prompt += f"- Максимальное время готовки одного блюда: {data.cooking_time} минут\n"

        if data.available_products:
            prompt += f"- Продукты под рукой (приоритет, но можно добавлять другие): {data.available_products}\n"
        else:
            prompt += "- Продукты под рукой: не указаны. Используй разнообразные продукты на своё усмотрение, не ограничивайся курицей и помидорами.\n"
        if data.cuisine:
            prompt += f"- Предпочитаемая кухня: {data.cuisine}\n"

        prompt += f"""

СТРОГИЕ ПРАВИЛА:
1. Сгенерируй ТОЛЬКО эти приёмы пищи: {meals_str}.
   Не добавляй завтрак, обед или ужин, если они не указаны.
2. Если указан только один приём (например, "перекус") — составь только его.
3. Составь ровно {len(data.meals)} блюд на каждый день — ни больше, ни меньше.
4. Используй ТОЛЬКО эти типы в поле type: {meals_str}.
   Для перекуса — type: "перекус", для завтрака — type: "завтрак",
   для обеда — type: "обед", для ужина — type: "ужин".
5. Блюда не должны повторяться. Разнообразь ингредиенты.
6. Если продукты под рукой не указаны — выбирай любые продукты на своё усмотрение.

Верни ответ строго в формате JSON, без markdown-обёртки:
{{
    "days": [
        {{
            "day": 1,
            "meals": [
                {{
                    "type": "завтрак",
                    "name": "Название блюда",
                    "ingredients": ["список"],
                    "cooking_time": 15,
                    "recipe": "Краткое описание"
                }},
                ...ровно {len(data.meals)} блюд на день...
            ]
        }},
        ...ровно {data.days} дней...
    ]
}}
"""
        if data.correction_prompt:
            prompt += f"\nКОРРЕКТИРОВКА ОТ ПОЛЬЗОВАТЕЛЯ (обязательно учти): {data.correction_prompt}\n"

        return prompt

    async def delete_plan(self, plan_id: UUID) -> None:
        plan = await self.get_plan(plan_id)
        await self.session.delete(plan)
        await self.session.commit()

    async def get_plan(self, plan_id: UUID) -> MealPlan:
        result = await self.session.execute(select(MealPlan).where(MealPlan.id == plan_id))
        plan = result.scalar_one_or_none()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        return plan

    async def get_my_plans(self, user_id: UUID) -> list[MealPlan]:
        result = await self.session.execute(
            select(MealPlan).where(MealPlan.user_id == user_id).order_by(MealPlan.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_group_plans(self, group_id: UUID) -> list[MealPlan]:
        result = await self.session.execute(
            select(MealPlan).where(MealPlan.group_id == group_id).order_by(MealPlan.created_at.desc())
        )
        return list(result.scalars().all())
