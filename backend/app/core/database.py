from contextlib import asynccontextmanager
import aiomysql
from app.core.config import settings
class Database:
 def __init__(self): self.pool=None
 async def connect(self):
  try:
   self.pool=await aiomysql.create_pool(host=settings.db_host,port=settings.db_port,user=settings.db_user,password=settings.db_password,db=settings.db_name,charset='utf8mb4',autocommit=False,minsize=1,maxsize=10,cursorclass=aiomysql.DictCursor,connect_timeout=5)
   await self.fetch_one('SELECT 1 ok')
   print("✅ Conectado ao banco de dados MySQL com sucesso.")
  except Exception as e:
   self.pool=None
   print(f"⚠️ [AVISO] Não foi possível conectar ao MySQL ({e}). Verifique se o MySQL está rodando e se as credenciais do .env estão corretas.")
 async def disconnect(self):
  if self.pool: self.pool.close(); await self.pool.wait_closed(); self.pool=None
 @asynccontextmanager
 async def transaction(self):
  if not self.pool: raise RuntimeError('Banco não inicializado.')
  async with self.pool.acquire() as conn:
   async with conn.cursor() as cur:
    try: yield cur; await conn.commit()
    except Exception: await conn.rollback(); raise
 async def fetch_all(self,q,p=()):
  if not self.pool: raise RuntimeError('Banco não inicializado.')
  async with self.pool.acquire() as conn:
   async with conn.cursor() as cur: await cur.execute(q,p); return list(await cur.fetchall())
 async def fetch_one(self,q,p=()):
  rows=await self.fetch_all(q,p); return rows[0] if rows else None
 async def execute(self,q,p=()):
  async with self.transaction() as cur: await cur.execute(q,p); return cur.lastrowid or cur.rowcount
db=Database()
