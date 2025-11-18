param(
    [Parameter(Mandatory=$true)][string]$Key,
    [Parameter(Mandatory=$true)][string]$Value,
    [string]$SecretsDir
)

if (-not $SecretsDir) { $SecretsDir = Join-Path -Path (Get-Location).Path -ChildPath 'secrets' }

if (-not (Test-Path $SecretsDir)) { Write-Host "Secrets directory not found: $SecretsDir" -ForegroundColor Red; exit 1 }

$file = Join-Path -Path $SecretsDir -ChildPath $Key
Write-Host "Writing secret to $file" -ForegroundColor Yellow
Set-Content -Path $file -Value $Value -Force
Write-Host "Wrote secret $Key" -ForegroundColor Green
