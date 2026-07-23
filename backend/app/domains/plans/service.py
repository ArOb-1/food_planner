import json
import traceback

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.domains.plans.constants import VARIETY_HINTS, MEAL_NAMES, PROTEINS
from app.domains.plans.models import MealPlan
from app.domains.plans.schemas import PlanGenerateRequest
from app.domains.plans.tasks import generate_plan_task
from app.domains.users.models import User
from app.domains.groups.service import GroupsService
from app.shared.llm_client import generate_meal_plan
from app.core.logger import setup_logger

logger = setup_logger(__name__)


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

        previous_dishes = await self._get_previous_dishes(
            user_id=user_id,
            group_id=data.group_id if data.is_group else None,
            limit_plans=3,
        )

        if data.is_group and data.group_id:
            profile = await GroupsService(self.session).get_group_profile(data.group_id)
            profile_str = (
                f"Групповой профиль:\n"
                f"- Запрещённые продукты (аллергии/ненавистные): "
                f"{', '.join(profile.forbidden) if profile.forbidden else 'нет'}\n"
                f"- Приоритетные продукты: "
                f"{', '.join(profile.priority) if profile.priority else 'нет'}\n"
            )
        else:
            result = await self.session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            profile_str = (
                f"Профиль пользователя:\n"
                f"- Аллергии: {', '.join(user.allergies) if user.allergies else 'нет'}\n"
                f"- Любимые продукты: {', '.join(user.liked_products) if user.liked_products else 'нет'}\n"
                f"- Ненавистные продукты: {', '.join(user.hated_products) if user.hated_products else 'нет'}\n"
                f"- Нелюбимые: {', '.join(user.disliked_products) if user.disliked_products else 'нет'}\n"
            )

        prompt = self._build_prompt(profile_str, data, previous_dishes)
        generate_plan_task.delay(str(plan.id), prompt)
        return plan

    async def _get_previous_dishes(self,
                                user_id: UUID,
                                group_id: UUID | None = None,
                                limit_plans: int = 3) -> list[str]:
        """
        Возвращает список названий блюд из последних N планов.
        Передаём в промпт как запрещённые для повтора.
        """
        try:
            if group_id:
                query = (
                    select(MealPlan)
                    .where(MealPlan.group_id == group_id,
                        MealPlan.status == "completed")
                    .order_by(MealPlan.created_at.desc())
                    .limit(limit_plans)
                )
            else:
                query = (
                    select(MealPlan)
                    .where(MealPlan.user_id == user_id,
                        MealPlan.status == "completed")
                    .order_by(MealPlan.created_at.desc())
                    .limit(limit_plans)
                )

            result = await self.session.execute(query)
            plans = result.scalars().all()

            dishes = []
            for plan in plans:
                if not plan.plan_data:
                    continue
                for day in plan.plan_data.get("days", []):
                    for meal in day.get("meals", []):
                        name = meal.get("name", "").strip()
                        if name:
                            dishes.append(name)

            return dishes

        except Exception:
            return []   

    def _build_prompt(self,
                  profile_str: str,
                  data: PlanGenerateRequest,
                  previous_dishes: list[str] | None = None) -> str:
        meals_str = ", ".join(MEAL_NAMES.get(m, m) for m in data.meals)
        meals_count = len(data.meals)

        variety_block = "\n".join(
            f'  - {MEAL_NAMES.get(m, m).capitalize()}: чередуй между → {VARIETY_HINTS.get(MEAL_NAMES.get(m, m), "")}'
            for m in data.meals
        )

        forbidden_dishes_block = ""
        if previous_dishes:
            dishes_list = "\n".join(f"  - {d}" for d in previous_dishes)
            forbidden_dishes_block = f"""
    ЗАПРЕЩЁННЫЕ БЛЮДА (уже были в предыдущем плане, НЕ повторять):
    {dishes_list}
    """

        correction_block = ""
        if data.correction_prompt:
            correction_block = f"""
    ВАЖНОЕ ПОЖЕЛАНИЕ ПОЛЬЗОВАТЕЛЯ (наивысший приоритет, обязательно учти):
    {data.correction_prompt}
    """

        if data.available_products:
            products_block = (
                f"- Продукты под рукой (используй в приоритете, но не ограничивайся): "
                f"{data.available_products}"
            )
        else:
            products_block = (
                "- Доступные продукты: любые. Выбирай разнообразно — "
                "не зацикливайся на одних и тех же (яйца, помидоры, моцарелла и т.п.)."
            )

        prompt = f"""Ты — профессиональный диетолог и шеф-повар. \
    Составь разнообразный сбалансированный план питания на {data.days} дней.
    {correction_block}
    ━━━ ПРОФИЛЬ ━━━
    {profile_str.strip()}

    ━━━ ПАРАМЕТРЫ ━━━
    - Приёмы пищи: {meals_str}
    - Количество дней: {data.days}
    {"- Максимальное время приготовления: " + str(data.cooking_time) + " минут" if data.cooking_time else ""}
    {"- Кухня: " + data.cuisine if data.cuisine else ""}
    {products_block}
    {forbidden_dishes_block}
    ━━━ РАЗНООБРАЗИЕ (обязательно) ━━━
    {variety_block}

    - Каждый день должен использовать РАЗНЫЕ основные источники белка.
    Чередуй по дням: {", ".join(PROTEINS[:data.days + 2])}
    - Каждый день — разные методы приготовления:
    варка, жарка, запекание, тушение, гриль, на пару, сыроедение
    - НЕ используй одни и те же ингредиенты как основу более 2 раз за весь план.
    (Например, если яйца были в завтраке дня 1 — в дне 2 завтрак должен быть другим.)

    ━━━ СТРОГИЕ ПРАВИЛА ━━━
    1. Генерируй ТОЛЬКО эти приёмы пищи: {meals_str}. Никаких лишних.
    2. Ровно {meals_count} блюда на каждый день — не больше, не меньше.
    3. Типы в поле "type" строго: {meals_str}.
    4. Все {data.days * meals_count} блюд должны быть УНИКАЛЬНЫМИ — никаких повторов по названию и составу.
    5. Учитывай аллергии и запрещённые продукты из профиля — они не должны появляться нигде.
    6. Приоритетные/любимые продукты из профиля используй чаще.
    7. Порции и КБЖУ должны быть реалистичными для обычного человека.

    ━━━ ФОРМАТ ОТВЕТА ━━━
    Верни ТОЛЬКО валидный JSON без markdown-обёртки, без комментариев:
    {{
        "days": [
            {{
                "day": 1,
                "meals": [
                    {{
                        "type": "завтрак",
                        "name": "Конкретное название блюда",
                        "ingredients": ["ингредиент 1", "ингредиент 2"],
                        "cooking_time": 15,
                        "recipe": "Краткое описание приготовления (2-3 предложения)"
                    }}
                ]
            }}
        ]
    }}
    Ровно {data.days} объектов в "days". Ровно {meals_count} объектов в каждом "meals".
    """
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
