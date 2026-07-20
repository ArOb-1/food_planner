import json

from app.core.celery_app import celery_app
from app.core.database import SyncSessionLocal
from app.domains.plans.models import MealPlan
from app.domains.users.models import User
from app.domains.groups.models import Group
from app.shared.llm_client import generate_meal_plan


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_plan_task(self, plan_id: str, prompt: str):
    db = SyncSessionLocal()
    try:
        plan = db.query(MealPlan).get(plan_id)
        if not plan:
            return

        ai_response = generate_meal_plan(prompt)
        plan.plan_data = json.loads(ai_response)
        plan.status = "completed"
        db.commit()
    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc)
    finally:
        db.close()
