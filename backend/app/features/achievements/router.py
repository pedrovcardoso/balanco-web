from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_db
from . import service

router = APIRouter(prefix='/achievements', tags=['achievements'])


@router.get('')
async def achievements(
    user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    return await service.get_achievements(db, user['sub'])
