import json
import asyncio

import redis.asyncio as aioredis

from app.core.config import settings


async def listen_for_plan(plan_id: str, websocket):
    r = aioredis.from_url(settings.REDIS_URL)
    pubsub = r.pubsub()
    await pubsub.subscribe(f'plan:{plan_id}')

    try:
        async for message in pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                await websocket.send_json(data)
                break
    finally:
        await pubsub.unsubscribe(f'plan:{plan_id}')
        await r.aclose()
