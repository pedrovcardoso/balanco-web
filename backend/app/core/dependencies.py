import httpx
from typing import Annotated
from fastapi import Depends
from app.core.power_automate import PowerAutomateClient
from app.core.security import token_payload
from app.core.exceptions import Forbidden

async def get_http_client():
    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0), follow_redirects=False) as client: yield client
async def get_db_client(client: Annotated[httpx.AsyncClient, Depends(get_http_client)]): return PowerAutomateClient(client)
async def get_optional_user(payload: Annotated[dict | None, Depends(token_payload)]): return payload
async def get_current_user(payload: Annotated[dict | None, Depends(token_payload)]):
    if not payload or payload.get('is_guest'): raise Forbidden('Identificação necessária para esta operação.')
    return payload
async def require_admin(user: Annotated[dict, Depends(get_current_user)]):
    if not user.get('is_admin'): raise Forbidden('Permissão administrativa necessária.')
    return user
