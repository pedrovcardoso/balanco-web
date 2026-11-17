import httpx
from typing import Annotated
from fastapi import Depends, HTTPException
from app.core.database import db,Database
from app.core.security import token_payload
from app.core.exceptions import Forbidden
def get_db()->Database:return db
async def get_http_client():
 async with httpx.AsyncClient(timeout=30) as client: yield client
async def get_optional_user(payload:Annotated[dict|None,Depends(token_payload)],db:Annotated[Database,Depends(get_db)]):
 if not payload: return None
 if payload.get('is_guest'): return payload
 subject=payload.get('sub')
 if not isinstance(subject,str) or not subject.isascii() or not subject.isdigit():
  raise HTTPException(status_code=401,detail='Token inválido.')
 user=await db.fetch_one('SELECT id FROM tb_user WHERE id=%s',(subject,))
 if not user: raise HTTPException(status_code=401,detail='Conta excluída ou token inválido.')
 return payload
async def get_current_user(payload:Annotated[dict|None,Depends(get_optional_user)]):
 if not payload or payload.get('is_guest'):raise Forbidden('Identificação necessária para esta operação.')
 return payload
async def require_admin(user:Annotated[dict,Depends(get_current_user)]):
 if not user.get('is_admin'):raise Forbidden('Permissão administrativa necessária.')
 return user
