from typing import Annotated
from fastapi import APIRouter,Depends,HTTPException
from app.core.dependencies import get_db,get_current_user
from .schemas import CertificateRequest
from . import service
router=APIRouter(prefix='/certificates',tags=['certificates'])
@router.post('/generate')
async def generate(body:CertificateRequest,user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db)):
 try:return await service.generate(db,user['sub'],body.participantName,body.fiscalYear)
 except ValueError as e:raise HTTPException(409,str(e)) from e
@router.get('/status')
async def status(user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db)): return await service.status(db,user['sub'])
@router.get('/verify/{code}')
async def verify(code:str,db=Depends(get_db)): return await service.verify(db,code) or {'verificationCode':code.upper(),'isValid':False}
