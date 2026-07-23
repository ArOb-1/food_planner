import asyncio
import hashlib
import json
import httpx
from difflib import SequenceMatcher

from deep_translator import GoogleTranslator

from app.core.config import settings
from app.core.logger import setup_logger
from app.shared.constants import (
    FOOD_DICT, MEALDB_SEARCH_URL, MEALDB_FILTER_URL,
    MEALDB_LOOKUP_URL, CACHE_TTL, MEAL_TYPE_CATEGORIES,
    DISH_CATEGORY_MAP
)

try:
    import redis.asyncio as aioredis
    _redis_available = True
except ImportError:
    _redis_available = False

logger = setup_logger(__name__)


def _cache_key(text: str) -> str:
    return f"mealdb:{hashlib.md5(text.lower().encode()).hexdigest()}"


async def _get_redis():
    """Возвращает Redis-клиент или None, если Redis недоступен."""
    if not _redis_available:
        return None
    try:
        client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await client.ping()
        return client
    except Exception:
        return None


async def _empty_str() -> str:
    return ""


async def _translate(text: str, target: str = "en") -> str:
    """
    Асинхронный перевод — запускаем блокирующий GoogleTranslator
    в отдельном потоке, чтобы не блокировать event loop.
    """
    if not text or not text.strip():
        return text
    try:
        source = "ru" if target == "en" else "en"
        result = await asyncio.to_thread(
            lambda: GoogleTranslator(source=source, target=target).translate(text)
        )
        return result or text
    except Exception as e:
        logger.warning(f"Translation failed: {e}")
        return text


def _fuzzy_score(a: str, b: str) -> float:
    """Коэффициент схожести двух строк от 0 до 1."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def _extract_en_keywords(meal_name: str) -> list[str]:
    """
    Извлекает английские ключевые слова из русского названия блюда.
    Сначала ищет в словаре FOOD_DICT, не тратя время на API.
    """
    words = meal_name.lower().split()
    found = []
    for word in words:
        clean = word.rstrip("ьюяией")
        if word in FOOD_DICT:
            found.append(FOOD_DICT[word])
        elif clean in FOOD_DICT:
            found.append(FOOD_DICT[clean])
    return list(dict.fromkeys(found))


async def _api_search_by_name(client: httpx.AsyncClient, name: str) -> list[dict]:
    """search.php?s=name — поиск по названию."""
    try:
        r = await client.get(MEALDB_SEARCH_URL, params={"s": name})
        r.raise_for_status()
        return r.json().get("meals") or []
    except Exception as e:
        logger.debug(f"Name search failed for '{name}': {e}")
        return []


async def _api_filter_by_ingredient(client: httpx.AsyncClient, ingredient: str) -> list[dict]:
    """filter.php?i=ingredient — получаем список блюд с этим ингредиентом."""
    try:
        r = await client.get(MEALDB_FILTER_URL, params={"i": ingredient})
        r.raise_for_status()
        return r.json().get("meals") or []
    except Exception as e:
        logger.debug(f"Ingredient filter failed for '{ingredient}': {e}")
        return []


async def _api_filter_by_category(client: httpx.AsyncClient, category: str) -> list[dict]:
    """filter.php?c=category."""
    try:
        r = await client.get(MEALDB_FILTER_URL, params={"c": category})
        r.raise_for_status()
        return r.json().get("meals") or []
    except Exception as e:
        logger.debug(f"Category filter failed for '{category}': {e}")
        return []


async def _api_lookup(client: httpx.AsyncClient, meal_id: str) -> dict | None:
    """lookup.php?i=id — получаем полные данные по ID."""
    try:
        r = await client.get(MEALDB_LOOKUP_URL, params={"i": meal_id})
        r.raise_for_status()
        meals = r.json().get("meals") or []
        return meals[0] if meals else None
    except Exception as e:
        logger.debug(f"Lookup failed for id={meal_id}: {e}")
        return None


def _score_meal(
    meal: dict,
    en_keywords: list[str],
    translated_name: str,
    meal_type: str,
) -> float:
    """
    Считает релевантность рецепта из MealDB.
    Возвращает float — чем больше, тем лучше.
    """
    score = 0.0
    meal_name_en = meal.get("strMeal", "").lower()
    category = meal.get("strCategory", "").lower()

    if translated_name:
        score += _fuzzy_score(translated_name, meal_name_en) * 10

    for kw in en_keywords:
        if kw.lower() in meal_name_en:
            score += 3
        elif any(kw.lower() in word or word in kw.lower()
                 for word in meal_name_en.split()):
            score += 1

    expected_cats = MEAL_TYPE_CATEGORIES.get(meal_type.lower(), [])
    if category in expected_cats:
        score += 2
        if en_keywords and any(kw.lower() in category for kw in en_keywords):
            score += 1

    return score


async def search_recipe(meal_name: str, meal_type: str = "") -> dict | None:
    if not meal_name or not meal_name.strip():
        return None

    cache_key = _cache_key(f"{meal_name}:{meal_type}")
    redis = await _get_redis()
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                logger.info(f"Cache hit for '{meal_name}'")
                return json.loads(cached)
        except Exception:
            pass

    en_keywords = _extract_en_keywords(meal_name)

    translated_name, translated_first = await asyncio.gather(
        _translate(meal_name, "en"),
        _translate(meal_name.split()[0], "en"),
    )

    logger.info(
        f"Searching '{meal_name}' | en: '{translated_name}' | keywords: {en_keywords}"
    )

    fallback_category = None
    words = meal_name.lower().split()
    for word in words:
        if word in DISH_CATEGORY_MAP:
            fallback_category = DISH_CATEGORY_MAP[word]
            break

    async with httpx.AsyncClient(timeout=10) as client:
        search_tasks = []

        if translated_name and translated_name != meal_name:
            search_tasks.append(_api_search_by_name(client, translated_name))

        if translated_first and translated_first not in (translated_name, meal_name):
            search_tasks.append(_api_search_by_name(client, translated_first))

        for kw in en_keywords[:2]:
            search_tasks.append(_api_search_by_name(client, kw))
            search_tasks.append(_api_filter_by_ingredient(client, kw))

        if fallback_category:
            search_tasks.append(_api_filter_by_category(client, fallback_category))

        if not search_tasks:
            search_tasks.append(_api_search_by_name(client, meal_name))

        results = await asyncio.gather(*search_tasks, return_exceptions=True)

        seen_ids: set[str] = set()
        candidates: list[dict] = []

        for batch in results:
            if isinstance(batch, Exception) or not batch:
                continue
            for meal in batch:
                mid = meal.get("idMeal")
                if mid and mid not in seen_ids:
                    seen_ids.add(mid)
                    candidates.append(meal)

        if not candidates:
            logger.info(f"TheMealDB: nothing found for '{meal_name}'")
            return None

        partial_scored = sorted(
            candidates,
            key=lambda m: _score_meal(m, en_keywords, translated_name, meal_type),
            reverse=True,
        )[:5]

        full_meals_raw = await asyncio.gather(
            *[_api_lookup(client, m["idMeal"]) for m in partial_scored],
            return_exceptions=True,
        )
        full_meals = [m for m in full_meals_raw if m and not isinstance(m, Exception)]
        if not full_meals:
            full_meals = partial_scored

    final_scored = sorted(
        full_meals,
        key=lambda m: _score_meal(m, en_keywords, translated_name, meal_type),
        reverse=True,
    )
    best = final_scored[0]
    best_score = _score_meal(best, en_keywords, translated_name, meal_type)

    if best_score < 1.2:
        logger.info(
            f"Best score too low ({best_score:.2f}), "
            f"skipping '{best.get('strMeal')}'"
        )
        return None

    logger.info(f"Best match: '{best.get('strMeal')}' (score={best_score:.2f})")

    result = await _parse_meal(best)

    if redis:
        try:
            await redis.setex(cache_key, CACHE_TTL, json.dumps(result, ensure_ascii=False))
        except Exception:
            pass

    return result


async def _parse_meal(meal: dict) -> dict:
    raw_ingredients = []
    for i in range(1, 21):
        name = meal.get(f"strIngredient{i}", "")
        measure = meal.get(f"strMeasure{i}", "")
        if name and name.strip():
            raw_ingredients.append(f"{measure.strip()} {name.strip()}".strip())

    instructions_en = meal.get("strInstructions", "")
    meal_name_en = meal.get("strMeal", "")

    translations = await asyncio.gather(
        _translate(meal_name_en, "ru"),
        _translate(instructions_en, "ru") if instructions_en else _empty_str(),
        *[_translate(ing, "ru") for ing in raw_ingredients],
    )

    name_ru = translations[0] or meal_name_en
    instructions_ru = translations[1]
    ingredients_ru = list(translations[2:])

    return {
        "name":          name_ru,
        "original_name": meal_name_en,
        "category":      meal.get("strCategory"),
        "area":          meal.get("strArea"),
        "instructions":  instructions_ru,
        "thumbnail":     meal.get("strMealThumb"),
        "youtube":       meal.get("strYoutube"),
        "ingredients":   ingredients_ru,
        "found":         True,
    }


async def enrich_plan(plan_data: dict) -> dict:
    """
    Дополняет план рецептами из TheMealDB.
    Все блюда ищутся параллельно — не ждём каждое по очереди.
    """
    if not plan_data or "days" not in plan_data:
        return plan_data

    all_meals: list[dict] = [
        meal
        for day in plan_data["days"]
        for meal in day.get("meals", [])
    ]

    if not all_meals:
        return plan_data

    recipes = await asyncio.gather(
        *[
            search_recipe(meal.get("name", ""), meal.get("type", ""))
            for meal in all_meals
        ],
        return_exceptions=True,
    )

    for meal, recipe in zip(all_meals, recipes):
        if recipe and not isinstance(recipe, Exception):
            meal["full_recipe"] = recipe

    return plan_data
