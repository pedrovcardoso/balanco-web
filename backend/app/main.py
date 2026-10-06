from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.exceptions import FlowConfigurationError, FlowExecutionError
from app.features.auth.router import router as auth_router
from app.features.trails.router import router as trails_router
from app.features.balanco_dados.router import router as dados_router
from app.features.games.router import router as games_router
from app.features.achievements.router import router as achievements_router
from app.features.certificates.router import router as certificates_router
from app.features.admin.router import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI): yield
app=FastAPI(title=settings.app_name, version='2.0.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
for router in [auth_router,trails_router,dados_router,games_router,achievements_router,certificates_router,admin_router]: app.include_router(router,prefix='/api')
@app.get('/health',tags=['infra'])
async def health(): return {'status':'ok'}
@app.exception_handler(FlowConfigurationError)
async def flow_config_handler(_:Request, exc:FlowConfigurationError): return JSONResponse(status_code=503,content={'detail':str(exc)})
@app.exception_handler(FlowExecutionError)
async def flow_error_handler(_:Request, exc:FlowExecutionError): return JSONResponse(status_code=502,content={'detail':str(exc)})
