param(
    [string]$RepoRoot
)

if (-not $RepoRoot) { $RepoRoot = (Get-Location).Path }

$path = Join-Path -Path $RepoRoot -ChildPath 'server\index.js'
Write-Host "Checking for server entry path: $path"
if (Test-Path $path) {
    Write-Host "server/index.js exists at $path" -ForegroundColor Green
    exit 0
} else {
    Write-Host "server/index.js is missing from repo. Please verify the server directory was copied to the build artifact (e.g., /opt/render/project/src/server/index.js)" -ForegroundColor Red
    exit 2
}
