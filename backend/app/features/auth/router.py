from uuid import uuid4
from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.dependencies import get_db_client,get_current_user
from app.core.security import create_access_token
from .schemas import LoginRequest,GuestRequest,TokenResponse,UserResponse
from . import service
router=APIRouter(prefix='/auth',tags=['auth'])
@router.post('/login',response_model=TokenResponse)
async def login(body:LoginRequest,db=Depends(get_db_client)):
    user=await service.create_or_get_user(db,body.cpf,body.name)
    return {'token':service.token_for(user),'user':{**user,'isGuest':False}}
@router.post('/guest',response_model=TokenResponse)
async def guest(body:GuestRequest):
    uid=str(uuid4()); name=body.display_name.strip()[:160] or 'Visitante'
    return {'token':create_access_token(uid,name,is_guest=True),'user':{'publicUserId':uid,'displayName':name,'isGuest':True}}
@router.post('/logout',status_code=204)
async def logout(): return None
@router.delete('/account')
async def delete_account(user:Annotated[dict,Depends(get_current_user)],db=Depends(get_db_client)): return await service.delete_user_data(db,user['sub'])
