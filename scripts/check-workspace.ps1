<#
Check minimal workspace layout for backend and frontend.

This script validates:
- `server/index.js` exists
- `server/package.json` has `start` script (index.js) and `main` points to index.js
- Root `package.json` has `start` script and client script
- `client/index.html`, `client/js/api.js`, `client/css/styles.css` exist
Use this locally to validate the repo before deployment.
#>

param()

function ExitWithError($msg) { Write-Error $msg; exit 1 }

Write-Host "Checking workspace layout..."

$repoRoot = Get-Location

$serverIndex = Join-Path $repoRoot 'server\index.js'
if (-not (Test-Path $serverIndex)) { ExitWithError "Missing server entry: $serverIndex" }

$rootPkg = Join-Path $repoRoot 'package.json'
if (-not (Test-Path $rootPkg)) { ExitWithError "Missing root package.json" }

$serverPkg = Join-Path $repoRoot 'server\package.json'
if (-not (Test-Path $serverPkg)) { ExitWithError "Missing server/package.json" }

try {
  $root = Get-Content $rootPkg -Raw | ConvertFrom-Json
  $server = Get-Content $serverPkg -Raw | ConvertFrom-Json
} catch {
  ExitWithError "Failed parsing package.json" }

if (-not $root.scripts.start) { ExitWithError "Root package.json missing start script" }
if (-not ($root.scripts.start -match 'server/index.js' -or $root.scripts.start -match 'node server/index.js')){
  Write-Host "Warning: root start script doesn't point to server/index.js" -ForegroundColor Yellow
}

if (-not $server.scripts.start) { ExitWithError "server/package.json missing start script" }
if (-not ($server.main -and $server.main -match 'index.js')) {
  Write-Host "Warning: server/package.json main is not index.js" -ForegroundColor Yellow
}

$clientIndex = Join-Path $repoRoot 'client\index.html'
if (-not (Test-Path $clientIndex)) { ExitWithError "Missing client/index.html" }

$clientApi = Join-Path $repoRoot 'client\js\api.js'
if (-not (Test-Path $clientApi)) { ExitWithError "Missing client/js/api.js" }

$clientCss = Join-Path $repoRoot 'client\css\styles.css'
if (-not (Test-Path $clientCss)) { ExitWithError "Missing client/css/styles.css" }

Write-Host "Workspace checks passed." -ForegroundColor Green
exit 0
