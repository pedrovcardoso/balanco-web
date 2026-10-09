# Balanço Cidadão Backend

Refatorado para acesso assíncrono direto ao MySQL com `aiomysql`, queries parametrizadas e transações.

## Execução

1. Crie o banco usando o `schema.sql` contido em `refatora2-db.md`.
2. Copie `.env.example` para `.env` e preencha as credenciais.
3. Crie o ambiente virtual (`venv`):
   ```powershell
   python -m venv venv
   ```
4. Ative o ambiente virtual no PowerShell:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   > **Nota:** Caso ocorra erro de execução de scripts no PowerShell, execute primeiro `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`.

5. Instale as dependências:
   ```powershell
   pip install -r requirements.txt
   ```
6. Inicie o servidor backend:
   ```powershell
   uvicorn app.main:app --reload
   ```
   *O servidor estará acessível em `http://127.0.0.1:8000` e a documentação interativa em `http://127.0.0.1:8000/docs`.*

## Executar a pipeline SIGPLAN localmente

```powershell
Set-Location backend
python -m venv venv  # execute somente se a pasta venv ainda não existir
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python scripts/sigplan_data/run_sigplan_pipeline.py
```

> **Nota para Banco Remoto (VPS):** Se o banco MySQL estiver em um servidor remoto/VPS com acesso via SSH, abra o túnel em um terminal separado antes de iniciar o Uvicorn ou executar a pipeline SIGPLAN:
> ```powershell
> ssh -N -L 3306:127.0.0.1:3306 lepipe@181.215.135.50
> ```