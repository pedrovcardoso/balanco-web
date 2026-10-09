from typing import Annotated
from fastapi import APIRouter,Depends
from app.core.dependencies import get_db,get_current_user
from .schemas import RedemptionIn
from . import service
router=APIRouter(prefix='/trails',tags=['trails'])
@router.get('/progress')
async def progress(user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db)):return await service.get_trail_progress(db,user['sub'])
@router.post('/redeem')
async def redeem(body:RedemptionIn,user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db)):return await service.redeem(db,user['sub'],body.itemKey)
