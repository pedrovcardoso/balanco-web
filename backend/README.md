# Balanço Cidadão Backend v2

FastAPI feature-based que encapsula o Power Automate e impede SQL bruto no browser.

## Execução

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Documentação: `http://localhost:8000/docs`. Preencha `.env` sem versionar segredos.

## Regras de autenticação

`POST /api/auth/login` gera JWT para usuário persistido. `POST /api/auth/guest` gera token de visitante,
mas operações de progresso, jogos e certificado exigem usuário identificado. Endpoints públicos de dados
não exigem token. Endpoints administrativos exigem claim `is_admin=true`; até o Keycloak ser integrado,
nenhum token de login comum recebe essa claim.
