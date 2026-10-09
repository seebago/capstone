$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$runtimePath = Join-Path $PSScriptRoot '.runtime'
New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
$pythonPath = Join-Path $runtimePath 'venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $pythonPath)) {
    python -m venv (Join-Path $runtimePath 'venv')
    if ($LASTEXITCODE -ne 0) { throw 'Python 3.12 or higher is required' }
}
# Repeat installation safely if a previous first-run download was interrupted.
& $pythonPath -m pip install -r requirements.lock.txt
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed; run this script again to retry' }
$mongoAvailable = Test-NetConnection -ComputerName 127.0.0.1 -Port 27018 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $mongoAvailable) {
    $mongoPath = Get-ChildItem -LiteralPath $runtimePath -Filter mongod.exe -Recurse | Select-Object -First 1 -ExpandProperty FullName
    if (-not $mongoPath) {
        $archivePath = Join-Path $runtimePath 'mongodb.zip'
        Invoke-WebRequest 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.26.zip' -OutFile $archivePath
        Expand-Archive -LiteralPath $archivePath -DestinationPath (Join-Path $runtimePath 'mongodb') -Force
        $mongoPath = Get-ChildItem -LiteralPath $runtimePath -Filter mongod.exe -Recurse | Select-Object -First 1 -ExpandProperty FullName
    }
    $dataPath = Join-Path $runtimePath 'mongo-data'
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
    $logPath = Join-Path $runtimePath 'mongo.log'
    $mongoProcess = Start-Process -FilePath $mongoPath -ArgumentList @('--dbpath',('"'+$dataPath+'"'),'--bind_ip','127.0.0.1','--port','27018','--logpath',('"'+$logPath+'"'),'--logappend') -WindowStyle Hidden -PassThru
    $mongoProcess.Id | Set-Content (Join-Path $runtimePath 'mongo.pid')
}
& $pythonPath -c "from pymongo import MongoClient; MongoClient('mongodb://127.0.0.1:27018', serverSelectionTimeoutMS=15000).admin.command('ping')"
if ($LASTEXITCODE -ne 0) { throw 'MongoDB is not available; inspect .runtime/mongo.log' }
try { $null = Invoke-RestMethod 'http://127.0.0.1:8765/api/health'; $appAvailable = $true } catch { $appAvailable = $false }
if (-not $appAvailable) {
    $appProcess = Start-Process -FilePath $pythonPath -ArgumentList @('"'+(Join-Path $PSScriptRoot 'run_local.py')+'"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimePath 'app.log') -RedirectStandardError (Join-Path $runtimePath 'app-error.log') -PassThru
    $appProcess.Id | Set-Content (Join-Path $runtimePath 'app.pid')
    for ($attempt=0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 500
        try { $null=Invoke-RestMethod 'http://127.0.0.1:8765/api/health'; $appAvailable=$true; break } catch {}
    }
}
if (-not $appAvailable) { throw 'Demo did not start; inspect .runtime/app-error.log' }
Write-Host 'Open http://127.0.0.1:8765 and choose Patient or Clinician. No password required.'
Write-Host 'The data is saved locally. Closing the browser does not delete it.'
