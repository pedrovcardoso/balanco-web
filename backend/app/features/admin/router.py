from typing import Annotated
from fastapi import APIRouter,Depends,Query
from app.core.dependencies import get_db_client,require_admin
from .schemas import SectionIn,PhaseIn,QuestionIn,QuestionLinkIn,MoveIn
from . import service
router=APIRouter(prefix='/admin',tags=['admin'],dependencies=[Depends(require_admin)])
@router.post('/sections')
async def section(b:SectionIn,db=Depends(get_db_client)): return await service.save_section(db,b)
@router.delete('/sections/{id}')
async def del_section(id:int,db=Depends(get_db_client)): return await service.deactivate_section(db,id)
@router.patch('/sections/{id}/order')
async def move_section(id:int,b:MoveIn,db=Depends(get_db_client)): return await service.move(db,'bc.game_section','game_section_id',id,b.direction)
@router.post('/phases')
async def phase(b:PhaseIn,db=Depends(get_db_client)): return await service.save_phase(db,b)
@router.post('/questions')
async def question(b:QuestionIn,db=Depends(get_db_client)): return await service.save_question(db,b)
@router.post('/phases/{id}/questions')
async def link(id:int,b:QuestionLinkIn,db=Depends(get_db_client)): return await service.link(db,id,b)
@router.delete('/phase-questions/{id}')
async def unlink(id:int,db=Depends(get_db_client)): return await service.unlink(db,id)
@router.patch('/phase-questions/{id}/order')
async def move_pq(id:int,b:MoveIn,db=Depends(get_db_client)): return await service.move(db,'bc.phase_question','phase_question_id',id,b.direction,f'WHERE game_phase_id=(SELECT game_phase_id FROM bc.phase_question WHERE phase_question_id={id})')
@router.get('/questions/reusable')
async def reusable(section_id:int=Query(...),engine_id:int=Query(...),phase_id:int=Query(...),db=Depends(get_db_client)): return await service.reusable(db,section_id,engine_id,phase_id)
