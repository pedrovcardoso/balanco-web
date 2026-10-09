from functools import lru_cache
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=('.env', 'backend/.env'),
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )
    app_name: str = 'Balanço Cidadão API'
    environment: str = 'development'
    db_host: str = '127.0.0.1'
    db_port: int = 3307
    db_name: str = 'sc_balanco_web'
    db_user: str = 'balanco_user'
    db_password: str = 'senha_segura_balanco_v2'
    secret_key: str = 'change-me-with-at-least-32-random-characters'
    access_token_expire_minutes: int = 480
    cors_origins: list[str] = Field(default_factory=lambda: ['http://localhost:5173'])
    ibge_population_url: str = 'https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2025/variaveis/9324?localidades=N6[N3[31]]'

    @field_validator('cors_origins', mode='before')
    @classmethod
    def split_origins(cls, v):
        return [x.strip() for x in v.split(',') if x.strip()] if isinstance(v, str) else v

@lru_cache
def get_settings():
    return Settings()

settings = get_settings()

