from typing import Annotated
import httpx
from fastapi import APIRouter, Depends
from app.core.database import Database
from app.core.dependencies import get_db, get_http_client
from . import service

router = APIRouter(prefix='/dados', tags=['dados'])

@router.get('/resumo')
async def resumo(db: Annotated[Database, Depends(get_db)]):
    return await service.resumo(db)

@router.get('/regioes')
async def regioes(db: Annotated[Database, Depends(get_db)]):
    return await service.regioes(db)

@router.get('/municipios')
async def municipios(db: Annotated[Database, Depends(get_db)]):
    return await service.municipios(db)

@router.get('/ods')
async def ods(db: Annotated[Database, Depends(get_db)]):
    return await service.ods(db)

@router.get('/funcoes')
async def funcoes(db: Annotated[Database, Depends(get_db)]):
    return await service.funcoes(db)

@router.get('/uos')
async def uos(db: Annotated[Database, Depends(get_db)]):
    return await service.uos(db)

@router.get('/populacao')
async def populacao(client: Annotated[httpx.AsyncClient, Depends(get_http_client)]):
    return await service.populacao(client)
