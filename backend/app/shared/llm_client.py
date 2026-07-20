from openai import OpenAI

from app.core.config import settings
from app.core.logger import setup_logger


logger = setup_logger(__name__)

BASE_URL = "https://ai.api.cloud.yandex.net/v1"


def generate_meal_plan(prompt: str) -> str:

    client = OpenAI(
        api_key=settings.YANDEX_API_KEY,
        base_url=BASE_URL,
        project=settings.YANDEX_FOLDER_ID,
    )
    logger.info(f"Sending prompt to YandexGPT (length: {len(prompt)})")

    response = client.chat.completions.create(
        model=f"gpt://{settings.YANDEX_FOLDER_ID}/yandexgpt",
        messages=[
            {"role": "system", "content": "Ты — диетолог. Отвечай строго в JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=4000,
    )
    logger.info(f"Response received. Choices: {len(response.choices)}")

    content = response.choices[0].message.content
    if not content:
        logger.error("Empty response from YandexGPT")
        raise ValueError("Empty response from YandexGPT")

    if content.startswith("```"):
        content = content.strip("`")
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()

    logger.info(f"Response content (first 300 chars): {content[:300]}")

    return content
