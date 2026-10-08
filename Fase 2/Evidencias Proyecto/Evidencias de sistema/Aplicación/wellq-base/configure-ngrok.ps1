param([switch]$StartTunnel)
$ErrorActionPreference = 'Stop'
$runtimePath = Join-Path $PSScriptRoot '.runtime'
New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
$configPath = Join-Path $runtimePath 'ngrok.yml'
if (-not (Test-Path -LiteralPath $configPath)) {
    Write-Host 'Crea o inicia sesion en https://dashboard.ngrok.com/get-started/your-authtoken'
    Write-Host 'Copia el authtoken y pegalo aqui. No se mostrara ni se enviara al chat.'
    $secureToken = Read-Host 'Authtoken de ngrok' -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    try {
        $tokenValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
        if ([string]::IsNullOrWhiteSpace($tokenValue)) { throw 'El token esta vacio' }
        $yamlToken = ConvertTo-Json -InputObject $tokenValue -Compress
        [IO.File]::WriteAllText($configPath, "version: '2'`nauthtoken: $yamlToken`n", [Text.UTF8Encoding]::new($false))
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        $tokenValue = $null
        $yamlToken = $null
        $secureToken.Dispose()
    }
}
Write-Host 'Configuracion guardada en .runtime/ngrok.yml (excluida de Git).'
if ($StartTunnel) {
    $searchPath = $PSScriptRoot
    $ngrokExe = $null
    for ($i=0; $i -lt 8 -and $searchPath; $i++) {
        $candidate = Join-Path $searchPath 'qa-2026-10-08/ngrok/ngrok.exe'
        if (Test-Path -LiteralPath $candidate) { $ngrokExe=$candidate; break }
        $searchPath = Split-Path -Parent $searchPath
    }
    if (-not $ngrokExe) {
        $command = Get-Command ngrok -ErrorAction SilentlyContinue
        if ($command) { $ngrokExe=$command.Source }
    }
    if (-not $ngrokExe) { throw 'Instala ngrok antes de iniciar el tunel.' }
    $health = Invoke-RestMethod 'http://127.0.0.1:8765/api/health'
    if ($health.status -ne 'ok' -or $health.synthetic_only -ne $true) { throw 'La demo no esta lista' }
    & $ngrokExe http 8765 --host-header=rewrite --inspect=false --config $configPath
}
