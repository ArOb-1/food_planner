from __future__ import annotations
import re
from io import BytesIO
from pathlib import Path

import httpx
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from app.core.logger import setup_logger

logger = setup_logger(__name__)


_FONT_DIR = Path(__file__).resolve().parent.parent.parent / "fonts"
_FONT_REGULAR = _FONT_DIR / "DejaVuSans.ttf"
_FONT_BOLD = _FONT_DIR / "DejaVuSans-Bold.ttf"


if _FONT_REGULAR.exists() and _FONT_BOLD.exists():
    pdfmetrics.registerFont(TTFont("DejaVu",     str(_FONT_REGULAR)))
    pdfmetrics.registerFont(TTFont("DejaVuBold", str(_FONT_BOLD)))
    FONT = "DejaVu"
    FONT_B = "DejaVuBold"
else:
    logger.warning("DejaVu шрифты не найдены, используем Helvetica")
    FONT = "Helvetica"
    FONT_B = "Helvetica-Bold"


def _esc(text) -> str:
    """
    Экранирует XML-символы для ReportLab Paragraph.
    Без этого &, <, > ломают генерацию.
    """
    return (
        str(text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _split_steps(text: str) -> list[str]:
    """Разбивает инструкции на шаги. Поддерживает \\n и \\r\\n."""
    return [s.strip() for s in re.split(r"\r?\n", text or "") if s.strip()]


def _fetch_image(url: str, width: float = 160, height: float = 110) -> Image | None:
    """Загружает картинку по URL, возвращает Image или None при ошибке."""
    try:
        resp = httpx.get(url, timeout=8, follow_redirects=True)
        resp.raise_for_status()
        return Image(BytesIO(resp.content), width=width, height=height)
    except Exception as e:
        logger.debug(f"Не удалось загрузить картинку {url}: {e}")
        return None


def _days_word(n: int) -> str:
    if n == 1:
        return "день"
    elif 2 <= n <= 4:
        return "дня"
    return "дней"


def _build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "PdfTitle",
            parent=base["Title"],
            fontName=FONT_B,
            fontSize=24,
            textColor=colors.HexColor("#111827"),
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "PdfSubtitle",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9,
            textColor=colors.HexColor("#6B7280"),
            spaceAfter=2,
        ),
        "day": ParagraphStyle(
            "PdfDay",
            parent=base["Heading2"],
            fontName=FONT_B,
            fontSize=15,
            textColor=colors.HexColor("#111827"),
            spaceBefore=14,
            spaceAfter=6,
        ),
        "meal_type": ParagraphStyle(
            "PdfMealType",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=8,
            textColor=colors.HexColor("#059669"),
            spaceAfter=2,
        ),
        "meal_name": ParagraphStyle(
            "PdfMealName",
            parent=base["Normal"],
            fontName=FONT_B,
            fontSize=12,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=4,
        ),
        "label": ParagraphStyle(
            "PdfLabel",
            parent=base["Normal"],
            fontName=FONT_B,
            fontSize=9,
            textColor=colors.HexColor("#374151"),
            spaceBefore=4,
            spaceAfter=2,
        ),
        "body": ParagraphStyle(
            "PdfBody",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9,
            leading=14,
            textColor=colors.HexColor("#374151"),
            spaceAfter=2,
        ),
        "step": ParagraphStyle(
            "PdfStep",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9,
            leading=14,
            textColor=colors.HexColor("#4B5563"),
            leftIndent=12,
            spaceAfter=3,
        ),
        "small": ParagraphStyle(
            "PdfSmall",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=8,
            textColor=colors.HexColor("#9CA3AF"),
            spaceAfter=2,
        ),
    }


def generate_plan_pdf(plan_dict: dict, user_name: str = "") -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    S = _build_styles()
    story = []

    story.append(Paragraph("План питания", S["title"]))

    if user_name:
        story.append(Paragraph(f"Для: {_esc(user_name)}", S["subtitle"]))

    days_count = plan_dict.get("days", 0)
    cooking_time = plan_dict.get("cooking_time")
    cuisine = plan_dict.get("cuisine")

    info_parts = [f"{days_count} {_days_word(days_count)}"]
    if cooking_time:
        info_parts.append(f"до {cooking_time} мин")
    if cuisine:
        info_parts.append(f"{_esc(cuisine)} кухня")

    story.append(Paragraph(" · ".join(info_parts), S["subtitle"]))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor("#E5E7EB"), spaceAfter=4,
    ))

    # ── Дни ─────────────────────────────────────────────────
    for day in plan_dict.get("plan_data", {}).get("days", []):
        story.append(Paragraph(f"День {day.get('day', '')}", S["day"]))

        for meal in day.get("meals", []):
            meal_type = meal.get("type", "")
            meal_name = meal.get("name", "")
            full      = meal.get("full_recipe") or {}

            # Карточку держим вместе — не разрываем между страницами
            card = []

            # Тип приёма пищи
            if meal_type:
                card.append(Paragraph(_esc(meal_type.capitalize()), S["meal_type"]))

            # Название блюда
            card.append(Paragraph(_esc(meal_name), S["meal_name"]))

            # Картинка из MealDB
            if full.get("thumbnail"):
                img = _fetch_image(full["thumbnail"])
                if img:
                    card.append(Spacer(1, 4))
                    card.append(img)
                    card.append(Spacer(1, 6))

            # Ингредиенты: приоритет у full_recipe, fallback — AI
            ingredients = full.get("ingredients") or meal.get("ingredients") or []
            if ingredients:
                label = "Состав:" if full.get("ingredients") else "Ингредиенты:"
                card.append(Paragraph(label, S["label"]))
                card.append(Paragraph(
                    _esc(", ".join(str(i) for i in ingredients[:12])),
                    S["body"],
                ))

            # Инструкции: приоритет у full_recipe, fallback — AI recipe
            instructions = full.get("instructions") or meal.get("recipe") or ""
            if instructions:
                card.append(Paragraph("Приготовление:", S["label"]))
                steps = _split_steps(instructions)

                if len(steps) > 1:
                    # Пронумерованные шаги
                    for i, step in enumerate(steps, 1):
                        card.append(Paragraph(f"{i}. {_esc(step)}", S["step"]))
                else:
                    # Один абзац (краткий AI-рецепт)
                    card.append(Paragraph(_esc(instructions.strip()), S["body"]))

            # Разделитель между блюдами
            card.append(Spacer(1, 8))
            card.append(HRFlowable(
                width="100%", thickness=0.5,
                color=colors.HexColor("#F3F4F6"), spaceAfter=4,
            ))

            story.append(KeepTogether(card))

    doc.build(story)
    buffer.seek(0)
    return buffer


def build_pdf_bytes(plan) -> bytes:
    """
    Принимает MealPlan ORM-объект или dict.
    Возвращает bytes — используется в Celery-таске.
    """
    if isinstance(plan, dict):
        plan_dict = plan
        user_name = plan.get("user_name", "")
    else:
        # ORM-объект → конвертируем в dict
        plan_dict = {
            "days":         getattr(plan, "days", 0),
            "cooking_time": getattr(plan, "cooking_time", None),
            "cuisine":      getattr(plan, "cuisine", None),
            "plan_data":    getattr(plan, "plan_data", {}) or {},
        }
        # Пробуем получить имя пользователя (если eager loaded)
        try:
            user = getattr(plan, "user", None)
            user_name = getattr(user, "name", "") or getattr(user, "email", "")
        except Exception:
            user_name = ""

    return generate_plan_pdf(plan_dict, user_name=user_name).read()
