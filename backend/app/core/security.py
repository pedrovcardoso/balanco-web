from datetime import datetime, timedelta, timezone
from hashlib import sha256
from uuid import uuid4
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings

ALGORITHM='HS256'
bearer=HTTPBearer(auto_error=False)

def hash_cpf(cpf: str) -> str: return sha256(''.join(filter(str.isdigit, cpf)).encode()).hexdigest().upper()
def create_access_token(subject: str, display_name: str, is_guest=False, is_admin=False) -> str:
    now=datetime.now(timezone.utc)
    payload={'sub':subject,'name':display_name,'is_guest':is_guest,'is_admin':is_admin,'iat':now,'exp':now+timedelta(minutes=settings.access_token_expire_minutes),'jti':str(uuid4())}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)
def decode_token(token: str) -> dict:
    try: return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError as exc: raise HTTPException(status.HTTP_401_UNAUTHORIZED,'Token inválido ou expirado.') from exc
async def token_payload(credentials: HTTPAuthorizationCredentials | None=Depends(bearer)) -> dict | None:
    return decode_token(credentials.credentials) if credentials else None
