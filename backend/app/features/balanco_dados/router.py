import httpx
from fastapi import APIRouter, Depends
from app.core.dependencies import get_db_client, get_http_client
from . import service

router = APIRouter(prefix='/dados', tags=['dados'])

@router.get('/resumo')
async def resumo(db=Depends(get_db_client)): return await service.resumo(db)

@router.get('/regioes')
async def regioes(db=Depends(get_db_client)): return await service.regioes(db)

@router.get('/municipios')
async def municipios(db=Depends(get_db_client)): return await service.municipios(db)

@router.get('/ods')
async def ods(db=Depends(get_db_client)): return await service.ods(db)

@router.get('/funcoes')
async def funcoes(db=Depends(get_db_client)): return await service.funcoes(db)

@router.get('/uos')
async def uos(db=Depends(get_db_client)): return await service.uos(db)

@router.get('/populacao')
async def populacao(client: httpx.AsyncClient = Depends(get_http_client)): return await service.populacao(client)
