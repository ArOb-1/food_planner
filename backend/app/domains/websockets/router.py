from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from app.core.security import decode_access_token
from app.core.redis_pubsub import listen_for_plan

router = APIRouter()


@router.websocket("/ws/plans/{plan_id}")
async def websocket_plan(websocket: WebSocket,
                         plan_id: str,
                         token: str = Query(...)):
    user_id = decode_access_token(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    try:
        await listen_for_plan(plan_id, websocket)
    except WebSocketDisconnect:
        pass
