# Inicia frontend e backend no terminal atual do VS Code, sem tunel SSH.

# erro de "arquivo não está assinado digitalmente"
# Unblock-File -Path .\scripts\start-dev.ps1
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
# .\scripts\start-dev.ps1

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot 'site'
$BackendDir = Join-Path $ProjectRoot 'backend'
$VenvPython = Join-Path $BackendDir 'venv\Scripts\python.exe'
$LogDir = Join-Path $PSScriptRoot '.logs'
$FrontendOutLog = Join-Path $LogDir 'frontend.log'
$FrontendErrLog = Join-Path $LogDir 'frontend-error.log'

$FrontendPort = 5173
$FrontendProcess = $null

function Test-RequiredCommand {
    param([Parameter(Mandatory)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Comando nao encontrado: $Name"
    }
}

function Stop-ProcessTree {
    param([int]$ProcessId)

    if ($ProcessId -le 0) { return }

    try {
        & taskkill.exe /PID $ProcessId /T /F 2>$null | Out-Null
    }
    catch {}
}

function Stop-PortOwner {
    param([Parameter(Mandatory)][int]$Port)

    $Connections = Get-NetTCPConnection `
        -State Listen `
        -LocalPort $Port `
        -ErrorAction SilentlyContinue

    $ProcessIds = @(
        $Connections |
        Select-Object -ExpandProperty OwningProcess -Unique
    )

    foreach ($ProcessId in $ProcessIds) {
        if ($ProcessId -and $ProcessId -ne $PID) {
            Write-Host "Encerrando processo antigo na porta $Port (PID $ProcessId)..." -ForegroundColor Yellow
            Stop-ProcessTree -ProcessId $ProcessId
        }
    }
}

function Stop-StartedServices {
    Write-Host ''
    Write-Host 'Encerrando frontend...' -ForegroundColor Yellow

    if ($null -ne $FrontendProcess) {
        Stop-ProcessTree -ProcessId $FrontendProcess.Id
    }

    Write-Host 'Processos encerrados.' -ForegroundColor Green
}

try {
    Test-RequiredCommand 'npm.cmd'
    Test-RequiredCommand 'taskkill.exe'

    if (-not (Test-Path -LiteralPath $FrontendDir -PathType Container)) {
        throw "Pasta do frontend nao encontrada: $FrontendDir"
    }

    if (-not (Test-Path -LiteralPath $BackendDir -PathType Container)) {
        throw "Pasta do backend nao encontrada: $BackendDir"
    }

    if (-not (Test-Path -LiteralPath $VenvPython -PathType Leaf)) {
        throw "Python do ambiente virtual nao encontrado: $VenvPython"
    }

    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

    Stop-PortOwner -Port $FrontendPort
    Start-Sleep -Seconds 1

    Write-Host '[1/2] Iniciando frontend...' -ForegroundColor Cyan
    $FrontendProcess = Start-Process `
        -FilePath 'npm.cmd' `
        -ArgumentList @('run', 'dev') `
        -WorkingDirectory $FrontendDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput $FrontendOutLog `
        -RedirectStandardError $FrontendErrLog `
        -PassThru

    Start-Sleep -Seconds 2

    if ($FrontendProcess.HasExited) {
        $FrontendError = Get-Content -LiteralPath $FrontendErrLog -Raw -ErrorAction SilentlyContinue
        throw "O frontend encerrou durante a inicializacao.`n$FrontendError"
    }

    Write-Host '[2/2] Iniciando backend...' -ForegroundColor Green
    Write-Host 'Frontend: http://localhost:5173' -ForegroundColor Cyan
    Write-Host 'A partir deste ponto, o terminal mostra os logs do backend.' -ForegroundColor DarkGray
    Write-Host 'Pressione Ctrl+C para encerrar.' -ForegroundColor Yellow
    Write-Host ''

    Push-Location $BackendDir
    try {
        & $VenvPython -m uvicorn app.main:app --reload
        $BackendExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    if ($BackendExitCode -ne 0) {
        throw "O backend encerrou com o codigo $BackendExitCode."
    }
}
catch {
    Write-Host ''
    Write-Error $_.Exception.Message
}
finally {
    Stop-StartedServices
}