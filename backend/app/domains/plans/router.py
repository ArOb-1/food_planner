from pathlib import Path

import redis as redis_sync

from jose import JWTError, jwt
from fastapi import APIRouter, Depends, HTTPException, Query
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from celery.result import AsyncResult
from fastapi.responses import Response

from app.core.celery_app import celery_app
from app.domains.plans.tasks import generate_pdf_task
from app.core.database import get_db
from app.domains.auth.dependencies import get_current_user
from app.domains.users.models import User
from app.domains.plans.schemas import PlanGenerateRequest, MealPlanOut
from app.domains.plans.service import PlansService
from app.domains.groups.service import GroupsService
from app.domains.groups.schemas import GroupOut
from app.core.logger import setup_logger
from app.domains.plans.models import MealPlan
from app.core.config import settings

logger = setup_logger(__name__)

router = APIRouter()


async def _user_from_query_token(
    token: str = Query(..., description="JWT access token"),
    session: AsyncSession = Depends(get_db),
) -> User:
    """
    Используется для эндпоинтов, которые открываются браузером напрямую
    (скачивание файлов, открытие в новой вкладке) — там нельзя передать
    Authorization заголовок.
    """
    credentials_exc = HTTPException(
        status_code=403,
        detail="Недействительный или просроченный токен",
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    result = await session.execute(
        select(User).where(User.id == UUID(user_id))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exc

    return user


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


@router.get("/{plan_id}/pdf/download/{task_id}")
async def download_pdf(
    plan_id: UUID,
    task_id: str,
    current_user: User = Depends(_user_from_query_token),
    session: AsyncSession = Depends(get_db),
):

    result = await session.execute(
        select(MealPlan).where(
            MealPlan.id == plan_id,
            (MealPlan.user_id == current_user.id) |
            (MealPlan.group_id.isnot(None)),
        )
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=403, detail="Нет доступа к этому плану")

    r = redis_sync.Redis.from_url(settings.REDIS_URL)
    pdf_bytes = r.get(f"pdf:{task_id}")

    if not pdf_bytes:
        raise HTTPException(
            status_code=404,
            detail="PDF не найден или истёк (1 час). Сгенерируйте заново.",
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="meal_plan_{plan_id}.pdf"'
        },
    )


@router.post("/{plan_id}/pdf/generate")
async def start_pdf_generation(
    plan_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Запускает генерацию PDF в Celery, сразу возвращает task_id."""
    result = await session.execute(
        select(MealPlan).where(
            MealPlan.id == plan_id,
            (MealPlan.user_id == current_user.id) |
            (MealPlan.group_id.isnot(None))
        )
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="План не найден")

    task = generate_pdf_task.delay(str(plan_id))

    return {"task_id": task.id}


@router.get("/tasks/{task_id}/status")
async def get_task_status(task_id: str):
    """Проверяет статус Celery-задачи."""
    result = AsyncResult(task_id, app=celery_app)

    if result.state == "PENDING":
        return {"status": "pending"}

    if result.state == "FAILURE":
        return {"status": "failure", "error": str(result.info)}

    if result.state == "SUCCESS":
        return {"status": "success", "task_id": task_id}

    return {"status": "pending"}
