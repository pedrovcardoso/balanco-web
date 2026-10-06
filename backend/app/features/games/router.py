from typing import Annotated
from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_db_client, get_optional_user
from .schemas import AttemptIn
from . import service

router = APIRouter(prefix='/games', tags=['games'])

@router.get('/map')
async def map_(user: Annotated[dict | None, Depends(get_optional_user)], db=Depends(get_db_client)):
    uid = user['sub'] if user else None
    return await service.game_map(db, uid)

@router.get('/progress')
async def progress(user: Annotated[dict | None, Depends(get_optional_user)], db=Depends(get_db_client)):
    uid = user['sub'] if user else None
    return await service.progress(db, uid)

@router.get('/phases/{phase_id}/questions')
async def questions(phase_id: str, limit: int = Query(10, ge=1, le=50), random: bool = True, db=Depends(get_db_client)):
    return await service.questions(db, phase_id, limit, random)

@router.get('/phases/{phase_id}/next')
async def next_(phase_id: str, user: Annotated[dict | None, Depends(get_optional_user)], db=Depends(get_db_client)):
    uid = user['sub'] if user else None
    return await service.next_phase(db, uid, phase_id)

@router.post('/phases/{phase_id}/attempt')
async def attempt(phase_id: str, body: AttemptIn, user: Annotated[dict | None, Depends(get_optional_user)], db=Depends(get_db_client)):
    uid = user['sub'] if user else None
    return await service.attempt(db, uid, phase_id, body)
