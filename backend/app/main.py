from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.domains.auth.router import router as auth_router
from app.domains.users.router import router as users_router
from app.domains.groups.router import router as groups_router
from app.domains.plans.router import router as plans_router
from app.domains.websockets.router import router as ws_router


app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,
                   prefix=f"{settings.API_V1_PREFIX}/auth",
                   tags=["Auth"])
app.include_router(users_router,
                   prefix=f"{settings.API_V1_PREFIX}/users",
                   tags=["Users"])
app.include_router(groups_router,
                   prefix=f"{settings.API_V1_PREFIX}/groups",
                   tags=["Groups"])
app.include_router(plans_router,
                   prefix=f"{settings.API_V1_PREFIX}/plans",
                   tags=["Plans"])
app.include_router(ws_router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {"message": "MealPlan AI API", "docs": "/docs"}
