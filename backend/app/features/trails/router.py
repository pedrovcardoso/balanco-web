from typing import Annotated
from fastapi import APIRouter,Depends,Query
from app.core.dependencies import get_db_client,get_current_user
from .schemas import ReadingProgressIn
from . import service
router=APIRouter(prefix='/trails',tags=['trails'])
@router.get('/progress')
async def progress(user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db_client)): return await service.get_trail_progress(db,user['sub'])
@router.get('/reading/{slug}')
async def reading(slug:str,user:Annotated[dict,Depends(get_current_user)],total_pages:int=Query(36,ge=1,le=9999),db=Depends(get_db_client)): return await service.get_reading(db,user['sub'],slug,total_pages)
@router.post('/reading')
async def save(body:ReadingProgressIn,user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db_client)): return await service.save_reading(db,user['sub'],body)
@router.post('/{slug}/complete')
async def complete(slug:str,user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db_client)): return await service.complete_trail(db,user['sub'],slug)
