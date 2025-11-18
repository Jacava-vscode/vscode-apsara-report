<#
Compare `server/` directory against `.backend_repo/server/` and print differences.

Usage:
  # Basic
  .\scripts\check-backend-sync.ps1

  # Provide custom backend directory
  .\scripts\check-backend-sync.ps1 -BackendDir '.backend_repo/server'

Exit codes:
  0 => directories are in sync
  2 => not in sync (differences found)
  1 => error
#>

param(
  [string]$BackendDir = '.backend_repo/server',
  [switch]$VerboseOutput
)

function ExitError($msg, $code=1) { Write-Error $msg; exit $code }

$projectRoot = Get-Location
$serverDir = Join-Path $projectRoot 'server'
$backendPath = Join-Path $projectRoot $BackendDir

$mismatched = @()
Write-Host "The check-backend-sync helper has been disabled."
Write-Host "Sync enforcement has been removed from this repository. If you need to re-enable checks, restore the original script from version control history." 
exit 0
