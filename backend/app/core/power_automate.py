import asyncio
import httpx
from app.core.config import settings
from app.core.exceptions import FlowConfigurationError, FlowExecutionError

class PowerAutomateClient:
    def __init__(self, client: httpx.AsyncClient):
        self.client = client

    async def execute_sql(self, sql: str, database: str | None = None) -> list[dict]:
        if not settings.flow_url or not settings.fabric_warehouse:
            raise FlowConfigurationError('FLOW_URL e FABRIC_WAREHOUSE devem ser configurados.')

        body = {
            'warehouse': settings.fabric_warehouse,
            'database': database or settings.fabric_database,
            'sql': sql,
        }
        last_error = None

        for attempt in range(3):
            try:
                response = await self.client.post(settings.flow_url, json=body)
                response.raise_for_status()
                payload = response.json()

                if isinstance(payload, dict) and payload.get('ok') is False:
                    message = payload.get('error') or payload.get('message') or payload.get('body') or 'Falha no Flow.'
                    raise FlowExecutionError(str(message))

                return parse_rows(payload)
            except FlowExecutionError:
                raise
            except httpx.HTTPStatusError as exc:
                detail = exc.response.text[:2000]
                raise FlowExecutionError(
                    f'Power Automate retornou HTTP {exc.response.status_code}: {detail}'
                ) from exc
            except (httpx.HTTPError, ValueError) as exc:
                last_error = exc
                if attempt < 2:
                    await asyncio.sleep(0.5 * (2 ** attempt))

        raise FlowExecutionError(f'Falha ao executar Power Automate: {last_error}')

def parse_rows(payload) -> list[dict]:
    if isinstance(payload, list):
        return payload
    if not isinstance(payload, dict):
        return []
    return (
        payload.get('rows')
        or payload.get('ResultSets', {}).get('Table1')
        or payload.get('body', {}).get('ResultSets', {}).get('Table1')
        or []
    )
