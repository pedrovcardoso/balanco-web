from functools import lru_cache
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', case_sensitive=False, extra='ignore')
    app_name: str = 'Balanço Cidadão API'
    environment: str = 'development'
    flow_url: str = ''
    fabric_warehouse: str = ''
    fabric_database: str = 'warehouse_balanco_cidadao'
    sigplan_database: str = 'lh_Sigplan'
    secret_key: str = 'change-me-with-at-least-32-random-characters'
    access_token_expire_minutes: int = 480
    cors_origins: list[str] = Field(default_factory=lambda: ['http://localhost:5173'])
    ibge_population_url: str = 'https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2025/variaveis/9324?localidades=N6[N3[31]]'

    @field_validator('cors_origins', mode='before')
    @classmethod
    def split_origins(cls, value):
        if isinstance(value, str): return [x.strip() for x in value.split(',') if x.strip()]
        return value

@lru_cache
def get_settings() -> Settings: return Settings()
settings = get_settings()
