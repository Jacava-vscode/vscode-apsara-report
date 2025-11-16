param(
  [switch]$DryRun
)

Write-Host "Reconfiguring backend workspace..."

$projectRoot = Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) '..')
Write-Host "DEBUG: script path = $($MyInvocation.MyCommand.Definition)"
Write-Host "DEBUG: project root (resolved) = $projectRoot"
$serverRoot = Join-Path $projectRoot 'server'
$nested = Join-Path $serverRoot 'server'

if (-not (Test-Path $nested)) {
  Write-Host "No nested server folder found. Nothing to do."; exit 0
}

Write-Host "Found nested server folder: $nested"

function maybeCopy($src, $dest) {
  if (-not (Test-Path $src)) { return }
  if ($DryRun) { Write-Host "DRY-RUN: Would copy $src -> $dest"; return }
  if (-not (Test-Path (Split-Path $dest -Parent))) { New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null }
  Copy-Item -LiteralPath $src -Destination $dest -Recurse -Force
  Write-Host "Copied: $src -> $dest"
}

function maybeRemove($path) {
  if (-not (Test-Path $path)) { return }
  if ($DryRun) { Write-Host "DRY-RUN: Would remove $path"; return }
  Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Removed: $path"
}

# Move .env.example, .gitignore if they exist
maybeCopy (Join-Path $nested '.env.example') (Join-Path $serverRoot '.env.example')
maybeCopy (Join-Path $nested '.gitignore') (Join-Path $serverRoot '.gitignore')

# Move scripts if present
if (Test-Path (Join-Path $nested 'scripts')) {
  maybeCopy (Join-Path $nested 'scripts') (Join-Path $serverRoot 'scripts')
}

# If DryRun, exit now
if ($DryRun) {
  Write-Host "Dry-run complete."; exit 0
}

Write-Host "Removing nested server directory in $serverRoot..."
maybeRemove $nested

Write-Host "Backend workspace reconfiguration complete." 
