param(
    [string]$SecretsDir,
    [switch]$UseProgramData,
    [switch]$DryRun
)

if (-not $SecretsDir) {
    if ($UseProgramData) {
        $SecretsDir = Join-Path -Path $env:ProgramData -ChildPath 'apsara-report-secrets'
    } else {
        $RepoRoot = (Get-Location).Path
        $SecretsDir = Join-Path -Path $RepoRoot -ChildPath 'secrets'
    }
}

Write-Host "Using secrets dir: $SecretsDir" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "DRY RUN - no changes will be made" -ForegroundColor Yellow
}

if (-not (Test-Path $SecretsDir)) {
    if ($DryRun) { Write-Host "Would create $SecretsDir"; return }
    New-Item -ItemType Directory -Path $SecretsDir -Force | Out-Null
    Write-Host "Created secrets directory: $SecretsDir" -ForegroundColor Green
}

# Copy sample .env to secrets to use as a starting point
if (Test-Path 'server/.env.example') {
    $destination = Join-Path -Path $SecretsDir -ChildPath '.env'
    if ($DryRun) { Write-Host "Would copy server/.env.example to $destination"; return }
    Copy-Item -Path 'server/.env.example' -Destination $destination -Force
    Write-Host "Created sample $destination. Edit this file with your secrets." -ForegroundColor Green
}

Write-Host "You can now edit $SecretsDir/.env or add single-file secrets (files are named by env var, ex: ATLAS_PRIVATE_KEY)." -ForegroundColor Green
Write-Host "Note: This folder is not committed; add the path to .gitignore if needed." -ForegroundColor Yellow
