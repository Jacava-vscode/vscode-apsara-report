<#
Sync backend (/server) to a separate GitHub repository.

Usage:
  Open PowerShell in the project root (where this script lives) and run:
    .\scripts\sync-backend.ps1

What it does:
- Clones the target backend repo into a local folder `.backend_repo` (next to your monorepo) if not present.
- Pulls latest changes from the remote.
- Replaces the content of the backend repo (except the `.git` folder) with the contents of `server/` from this monorepo.
- Commits and pushes any changes to the remote (default branch `main`).

Notes:
- This script is idempotent and safe: if no changes are detected it does nothing.
- Customize `$BackendRepoUrl` or `$TargetBranch` variables below if needed.
- Run with credentials already configured (Git credential helper, SSH agent, or use HTTPS and pass credentials via remote).
#>

param(
    [string]$BackendRepoUrl = 'https://github.com/Jacava-vscode/apsara-report-backend.git',
    [string]$TargetBranch = 'main',
    [ValidateSet('root','subdir')][string]$Mode = 'subdir',
    [string]$TargetSubdir = 'server',
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
# project root is parent of scripts
$projectRoot = Resolve-Path (Join-Path $scriptDir '..')
$serverSrc = Join-Path $projectRoot 'server'
$backendDir = Join-Path $projectRoot '.backend_repo'

Write-Host "Project root: $projectRoot"
Write-Host "Server source: $serverSrc"
Write-Host "Backend mirror dir: $backendDir"

if (-not (Test-Path $serverSrc)) {
    Write-Error "Server folder not found at $serverSrc. Aborting."
    exit 1
}

# Ensure git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH. Please install Git to continue."
    exit 1
}

# Clone or update remote
if (-not (Test-Path (Join-Path $backendDir '.git'))) {
    Write-Host "Cloning backend repo $BackendRepoUrl into $backendDir..."
    git clone $BackendRepoUrl $backendDir
} else {
    Write-Host "Backend repo exists. Fetching latest..."
    Push-Location $backendDir
    try {
        # Ensure origin URL matches requested remote (if provided)
        try {
            $currentRemote = git config --get remote.origin.url 2>$null
        } catch {
            $currentRemote = $null
        }
        if ($currentRemote -and $BackendRepoUrl -and ($currentRemote -ne $BackendRepoUrl)) {
            Write-Host "Updating origin remote from $currentRemote to $BackendRepoUrl"
            git remote set-url origin $BackendRepoUrl
        }

        git fetch origin
        try {
            git checkout $TargetBranch 2>$null | Out-Null
        } catch {
            Write-Host "Note: git checkout returned a message (maybe already on $TargetBranch). Continuing..."
        }
        # Try a fast-forward pull first. If that fails (non-fast-forward), fall back to rebase.
        try {
            git pull --ff-only origin $TargetBranch
        } catch {
            Write-Host "Fast-forward pull failed. Attempting rebase onto origin/$TargetBranch..."
            try {
                git pull --rebase origin $TargetBranch
            } catch {
                Write-Host "Rebase failed. Please resolve conflicts manually in $backendDir and re-run the script."
                throw
            }
        }
    } finally {
        Pop-Location
    }
}

# Copy strategy depends on mode
$copyOptions = @{Recurse = $true; Force = $true}
if ($Mode -eq 'root') {
    # Clean backend dir except .git
    Write-Host "Cleaning backend dir (preserving .git)..."
    Get-ChildItem -LiteralPath $backendDir -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
        $path = $_.FullName
        Write-Host "Removing: $path"
        Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Copy server content into backend repo root
    Write-Host "Copying server/ to backend repo root..."
    Get-ChildItem -LiteralPath $serverSrc -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
        $src = $_.FullName
        $dest = Join-Path $backendDir $_.Name
        Write-Host "Copying $src -> $dest"
        if (Test-Path $dest) {
            Remove-Item -LiteralPath $dest -Recurse -Force -ErrorAction SilentlyContinue
        }
        Copy-Item -LiteralPath $src -Destination $dest @copyOptions
    }
} else {
    # subdir mode: copy monorepo server/ into backend repo under $TargetSubdir
    $targetPath = Join-Path $backendDir $TargetSubdir
    Write-Host "Preparing target subdir: $targetPath"
    if (Test-Path (Join-Path $targetPath 'server')) {
        Write-Host "Removing stray $targetPath/server folder (should not exist)"
        Remove-Item -LiteralPath (Join-Path $targetPath 'server') -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $targetPath) {
        Write-Host "Removing existing $targetPath"
        Remove-Item -LiteralPath $targetPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null

    # Move any files/folders in backend repo root (except .git and $TargetSubdir) into $TargetSubdir
    $rootItems = Get-ChildItem -LiteralPath $backendDir -Force | Where-Object { $_.Name -ne '.git' -and $_.Name -ne $TargetSubdir }
    foreach ($item in $rootItems) {
        $src = $item.FullName
        $dest = Join-Path $targetPath $item.Name
        Write-Host "Moving stray $src -> $dest"
        Move-Item -LiteralPath $src -Destination $dest -Force
    }

    Write-Host "Copying server/ to backend repo subdir '$TargetSubdir'..."
    Get-ChildItem -LiteralPath $serverSrc -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
        $src = $_.FullName
        $dest = Join-Path $targetPath $_.Name
        Write-Host "Copying $src -> $dest"
        if (Test-Path $dest) {
            Remove-Item -LiteralPath $dest -Recurse -Force -ErrorAction SilentlyContinue
        }
        Copy-Item -LiteralPath $src -Destination $dest @copyOptions
    }
}

# Commit and push if there are changes
Push-Location $backendDir
try {
    try {
        git checkout $TargetBranch 2>$null | Out-Null
    } catch {
        Write-Host "Warning: git checkout failed or already on branch. Continuing..."
    }

    # If dry-run was requested, show the changes that would be committed/pushed and exit.
    if ($DryRun) {
        Write-Host "Dry-run mode: showing planned changes (no commit/push will be performed)"
        $status = git status --porcelain
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host "No changes detected. Nothing would be committed."
            exit 0
        }
        Write-Host "Git status (porcelain):"
        git status --porcelain
        Write-Host "Files changed (name/status):"
        git --no-pager diff --name-status
        Write-Host "End of dry-run preview. No changes were pushed."
        exit 0
    }

    git add -A
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "No changes detected. Nothing to commit."
        exit 0
    }

    if ($Mode -eq 'subdir') {
        $msg = "Sync backend: update '$TargetSubdir' from monorepo/server at $(Get-Date -Format o)"
    } else {
        $msg = "Sync backend from monorepo at $(Get-Date -Format o)"
    }
    git commit -m $msg
    Write-Host "Pushing to origin/$TargetBranch..."
    git push origin $TargetBranch
    Write-Host "Push complete."
} finally {
    Pop-Location
}

Write-Host "Backend sync finished."
