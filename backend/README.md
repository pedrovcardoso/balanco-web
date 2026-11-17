# Balanço Cidadão Backend

Refatorado para acesso assíncrono direto ao MySQL com `aiomysql`, queries parametrizadas e transações.

## Execução

Execute os comandos abaixo na pasta `backend`.

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
   .\venv\Scripts\python.exe -m pip install -r requirements.txt
   ```
6. Inicie o servidor backend:
   ```powershell
   .\venv\Scripts\python.exe -m uvicorn app.main:app --reload
   ```
   *O servidor estará acessível em `http://127.0.0.1:8000` e a documentação interativa em `http://127.0.0.1:8000/docs`.*

O script `scripts\start-dev.ps1`, executado na raiz do projeto, também usa o Python de `backend\venv`. Se aparecer `No module named uvicorn`, execute o passo 5 nesse ambiente antes de iniciar novamente. Usar o caminho explícito do Python dispensa a ativação do ambiente nos passos 5 e 6 e evita instalar os pacotes em outro interpretador.

Ao excluir uma conta, o backend remove seus registros vinculados e passa a rejeitar os tokens dessa conta, inclusive os de outras sessões. A conferência de conta ativa ocorre nas rotas autenticadas; o logout comum encerra apenas a sessão do navegador.

O pool MySQL usa `autocommit` para leituras independentes e transações explícitas para operações que precisam de atomicidade. Cada processo do backend mantém um pool de até 10 conexões; antes de aumentar workers ou esse limite, considere o limite de conexões do MySQL, outros serviços e medições de carga.

### Erro de compilação do PyYAML no Windows

Se a instalação exigir Microsoft Visual C++ Build Tools para compilar o PyYAML (por exemplo, no Python 3.15 sem um wheel compatível), é possível usar sua implementação em Python puro. Na pasta `backend`:

```powershell
$PreviousValue = $env:PYYAML_FORCE_LIBYAML
try {
    $env:PYYAML_FORCE_LIBYAML = '0'
    .\venv\Scripts\python.exe -m pip install -r requirements.txt
}
finally {
    $env:PYYAML_FORCE_LIBYAML = $PreviousValue
}
```

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