# scripts/start.ps1
# Inicia frontend, tunel SSH e backend no terminal atual do VS Code.

# erro de "arquivo não está assinado digitalmente"
# Unblock-File -Path .\scripts\start.ps1
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
# .\scripts\start.ps1

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
$SshUser = 'lepipe'
$SshHost = '181.215.135.50'
$LocalPort = 3307
$RemoteHost = '127.0.0.1'
$RemotePort = 3306

$FrontendProcess = $null
$SshProcess = $null

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
    Write-Host 'Encerrando frontend e tunel SSH...' -ForegroundColor Yellow

    if ($null -ne $FrontendProcess) {
        Stop-ProcessTree -ProcessId $FrontendProcess.Id
    }

    if ($null -ne $SshProcess) {
        Stop-ProcessTree -ProcessId $SshProcess.Id
    }

    Write-Host 'Processos encerrados.' -ForegroundColor Green
}

try {
    Test-RequiredCommand 'ssh.exe'
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

    # Limpa somente processos antigos que ficaram nas portas usadas pelo projeto.
    Stop-PortOwner -Port $FrontendPort
    Stop-PortOwner -Port $LocalPort
    Start-Sleep -Seconds 1

    Write-Host '[1/3] Iniciando frontend...' -ForegroundColor Cyan
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

    Write-Host '[2/3] Iniciando tunel SSH...' -ForegroundColor Cyan
    Write-Host 'Digite a senha SSH abaixo.' -ForegroundColor Yellow

    $Forward = "${LocalPort}:${RemoteHost}:${RemotePort}"
    $Destination = "${SshUser}@${SshHost}"
    $SshArguments = @(
        '-N'
        '-T'
        '-o', 'ExitOnForwardFailure=yes'
        '-o', 'ServerAliveInterval=30'
        '-o', 'ServerAliveCountMax=3'
        '-L', $Forward
        $Destination
    )

    # Mantem o mesmo modo da versao que funcionava:
    # prompt de senha no terminal atual e nenhum terminal externo.
    $SshProcess = Start-Process `
        -FilePath 'ssh.exe' `
        -ArgumentList $SshArguments `
        -NoNewWindow `
        -PassThru

    $Deadline = (Get-Date).AddSeconds(120)
    $TunnelReady = $false

    while ((Get-Date) -lt $Deadline) {
        if ($SshProcess.HasExited) {
            throw "O SSH encerrou antes de criar o tunel. Codigo: $($SshProcess.ExitCode)"
        }

        # Verifica diretamente se o SSH abriu a porta local.
        $Listener = Get-NetTCPConnection `
            -State Listen `
            -LocalPort $LocalPort `
            -OwningProcess $SshProcess.Id `
            -ErrorAction SilentlyContinue

        if ($Listener) {
            $TunnelReady = $true
            break
        }

        Start-Sleep -Milliseconds 300
    }

    if (-not $TunnelReady) {
        throw 'Tempo esgotado aguardando a senha SSH e a abertura do tunel.'
    }

    Write-Host '[3/3] Tunel conectado. Iniciando backend...' -ForegroundColor Green
    Write-Host 'A partir deste ponto, o terminal mostra os logs do backend.' -ForegroundColor DarkGray
    Write-Host 'Pressione Ctrl+C para encerrar tudo.' -ForegroundColor Yellow
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
