from typing import Annotated
from fastapi import APIRouter,Depends
from app.core.dependencies import get_db_client,get_current_user
from . import service
router=APIRouter(prefix='/achievements',tags=['achievements'])
@router.get('')
async def achievements(user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db_client)): return await service.list_achievements(db,user['sub'])
