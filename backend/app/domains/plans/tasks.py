import json
import asyncio
import redis
import uuid
from pathlib import Path

from app.core.celery_app import celery_app
from app.core.config import settings
from app.core.database import SyncSessionLocal
from app.domains.plans.models import MealPlan
from app.domains.users.models import User
from app.domains.groups.models import Group
from app.shared.llm_client import generate_meal_plan
from app.shared.recipe_finder import enrich_plan
from app.shared.pdf_converter import build_pdf_bytes

PDF_DIR = Path("/tmp/meal_plan_pdfs")
PDF_TTL = 60 * 60


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_plan_task(self, plan_id: str, prompt: str):
    db = SyncSessionLocal()
    try:
        plan = db.query(MealPlan).get(plan_id)
        if not plan:
            return

        ai_response = generate_meal_plan(prompt)
        plan_data = json.loads(ai_response)

        plan_data = asyncio.run(enrich_plan(plan_data))

        plan.plan_data = plan_data
        plan.status = "completed"
        db.commit()

        r = redis.Redis.from_url(settings.REDIS_URL)
        r.publish(
            f"plan:{plan_id}",
            json.dumps({"status": plan.status, "plan_id": plan_id}),
        )

    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2, default_retry_delay=30)
def generate_pdf_task(self, plan_id: str):
    """Генерирует PDF в фоне, сохраняет на диск, пишет путь в Redis."""
    db = SyncSessionLocal()
    try:
        plan = db.query(MealPlan).get(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")

        pdf_bytes = build_pdf_bytes(plan)

        PDF_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{plan_id}_{uuid.uuid4().hex[:8]}.pdf"
        filepath = PDF_DIR / filename
        filepath.write_bytes(pdf_bytes)

        r = redis.Redis.from_url(settings.REDIS_URL)
        r.setex(
            f"pdf:{self.request.id}",
            3600,
            pdf_bytes,
        )

        return {"status": "success"}

    except Exception as exc:
        raise self.retry(exc=exc)
    finally:
        db.close()
