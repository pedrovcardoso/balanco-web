from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import db
from app.features.achievements.router import router as achievements_router
from app.features.admin.router import router as admin_router
from app.features.auth.router import router as auth_router
from app.features.balanco_dados.router import router as dados_router
from app.features.certificates.router import router as certificates_router
from app.features.games.router import router as games_router
from app.features.trails.router import router as trails_router


@asynccontextmanager
async def lifespan(app):
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(
    title=settings.app_name,
    version='3.0.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

ROUTERS = [
    auth_router,
    trails_router,
    games_router,
    certificates_router,
    achievements_router,
    admin_router,
    dados_router,
]

for router in ROUTERS:
    app.include_router(router, prefix='/api')


@app.get('/health')
async def health():
    database_ok = bool(await db.fetch_one('SELECT 1 ok')) if db.pool else False
    return {'status': 'ok', 'database': database_ok}
