<#
PowerShell helper script to copy Khmer font files from a source folder into the repo's
client/fonts/ folder, normalize filenames, generate fonts.css @font-face rules, and
create a fonts.json manifest consumed by the settings UI.

Usage (PowerShell):
    Set-Location -LiteralPath 'D:\DEV\Apsara Report'
    .\scripts\import-khmer-fonts.ps1 -Source 'D:\All_Khmer_Fonts' -Commit

Parameters:
  -Source: Path to the folder containing your fonts (e.g., D:\All_Khmer_Fonts)
  -Commit: If specified, the script will git add/commit/push the files.

This script prefers WOFF2 files when present. It will copy any .woff2/.woff/.ttf/.otf files.
It will generate the file `client/fonts/fonts.css` with @font-face rules and
`client/fonts/fonts.json` manifest.
#>
param(
  [Parameter(Mandatory=$true)]
  [string]$Source,
  [switch]$Commit
)

$repoFonts = Join-Path $PSScriptRoot '..\client\fonts' | Resolve-Path -Relative
$repoFontsFull = Join-Path (Resolve-Path "${PSScriptRoot}\..\client\fonts") ''
if (!(Test-Path $Source)) {
  Write-Error "Source folder '$Source' not found."
  exit 1
}

# Ensure target exists
New-Item -ItemType Directory -Path $repoFontsFull -Force | Out-Null

# Collect font files
$fontFiles = Get-ChildItem -Path $Source -Recurse -File | Where-Object { $_.Extension -match '\.(woff2|woff|ttf|otf)$' }
if ($fontFiles.Count -eq 0) {
  Write-Host "No font files found in $Source"
  exit 0
}

# Helper to make a safe id from filename
function Make-Id($name) {
  $id = [System.Text.RegularExpressions.Regex]::Replace($name, "[^A-Za-z0-9]+", "-")
  $id = $id.Trim('-').ToLower()
  return $id
}

$manifest = @()
$fontFaceRules = @()

# We'll group by base family name (without extension)
$grouped = $fontFiles | Group-Object { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) }
foreach ($grp in $grouped) {
  $base = $grp.Name
  # find best file: prefer woff2, then woff, then ttf/otf
  $best = $grp.Group | Sort-Object @{Expression={
      switch ($_.Extension.ToLower()) {
        '.woff2' { 1 }
        '.woff' { 2 }
        default { 3 }
      }
    }} | Select-Object -First 1
  $destName = "${base}${best.Extension}"
  $destPath = Join-Path $repoFontsFull $destName
  Copy-Item -Path $best.FullName -Destination $destPath -Force

  # Create friendly label and id
  $label = $base -replace '[-_]', ' '
  $label = ($label -replace '\s+', ' ').Trim()
  $id = Make-Id $label

  # Map family name (use the base as family; user may want to edit later)
  $family = $base -replace '\s+', ' '

  # Build @font-face rule
  $relPath = "../fonts/$destName"
  $format = switch ($best.Extension.ToLower()) {
    '.woff2' { "format('woff2')" }
    '.woff' { "format('woff')" }
    '.ttf' { "format('truetype')" }
    '.otf' { "format('opentype')" }
    default { "format('woff2')" }
  }
  $rule = "@font-face {`n  font-family: '$family';`n  src: url('$relPath') $format;`n  font-weight: 400 700;`n  font-style: normal;`n  font-display: swap;`n}"
  $fontFaceRules += $rule

  $manifest += [PSCustomObject]@{
    id = $id
    label = $label
    family = $family
    filename = $destName
  }
}

# Write fonts.css and fonts.json
$fontsCssPath = Join-Path $repoFontsFull 'fonts.css'
$fontsJsonPath = Join-Path $repoFontsFull 'fonts.json'
$fontFaceRules | Out-File -FilePath $fontsCssPath -Encoding utf8 -Force
$manifest | ConvertTo-Json -Depth 4 | Out-File -FilePath $fontsJsonPath -Encoding utf8 -Force

Write-Host "Copied $($fontFiles.Count) font files to $repoFontsFull"
Write-Host "Generated $fontsCssPath and $fontsJsonPath"

if ($Commit) {
  Push-Location (Join-Path $PSScriptRoot '..')
  git add client/fonts/*
  git commit -m "Fonts: add Khmer fonts from $Source and generated manifest"
  git push origin main
  Pop-Location
}

Write-Host "Done. Open client/settings.html and choose the font from Settings → Fonts."