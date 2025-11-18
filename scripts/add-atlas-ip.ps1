<#
Add an IP address (or current public IP) to a MongoDB Atlas project's Access List (whitelist).

Usage examples:
  # Add your current public IP to project by id
  .\scripts\add-atlas-ip.ps1 -ProjectId <PROJECT_ID> -PublicKey $env:ATLAS_PUBLIC_KEY -PrivateKey $env:ATLAS_PRIVATE_KEY

  # Add a specific IP (dry-run)
  .\scripts\add-atlas-ip.ps1 -ProjectId <PROJECT_ID> -Ip 203.0.113.10 -DryRun

  # Look up project by name (requires Atlas API key)
  .\scripts\add-atlas-ip.ps1 -ProjectName "Apsara Project" -PublicKey $env:ATLAS_PUBLIC_KEY -PrivateKey $env:ATLAS_PRIVATE_KEY

Notes:
 - The script uses Atlas API v1.0 and HTTP Basic auth with PublicKey:PrivateKey.
 - You can store the Atlas keys in environment variables `ATLAS_PUBLIC_KEY` and `ATLAS_PRIVATE_KEY`.
 - For security, keep API keys in CI secrets when used in GitHub Actions or similar.
#>

param(
    [string]$PublicKey = $env:ATLAS_PUBLIC_KEY,
    [string]$PrivateKey = $env:ATLAS_PRIVATE_KEY,
    [string]$ProjectId,
    [string]$ProjectName,
    [string]$Ip,
    [string]$Comment = 'Added by add-atlas-ip.ps1',
    [switch]$DryRun
)

function ExitWithError($msg) { Write-Error $msg; exit 1 }

if (-not $PublicKey -or -not $PrivateKey) {
    ExitWithError "Atlas API keys are required. Provide -PublicKey and -PrivateKey or set ATLAS_PUBLIC_KEY/ATLAS_PRIVATE_KEY environment variables."
}

Write-Host "Atlas API public key: $PublicKey" -ForegroundColor Cyan

if (-not $Ip) {
    Write-Host "Detecting your public IP..." -ForegroundColor Yellow
    try {
        $Ip = (Invoke-RestMethod -Uri 'https://api.ipify.org' -UseBasicParsing).Trim()
    } catch {
        ExitWithError "Unable to detect public IP automatically. Provide -Ip or check network connectivity."
    }
}

Write-Host "Using IP: $Ip" -ForegroundColor Cyan

if (-not $ProjectId -and -not $ProjectName) {
    ExitWithError "Either -ProjectId or -ProjectName must be provided. Use Atlas project ID or provide the project name to look it up."
}

$baseUrl = 'https://cloud.mongodb.com/api/atlas/v1.0'

function Invoke-AtlasApi($method, $path, $body = $null) {
    $uri = "$baseUrl/$path"
    $headers = @{ 'Content-Type' = 'application/json' }
    $pscreds = New-Object System.Management.Automation.PSCredential($PublicKey, (ConvertTo-SecureString $PrivateKey -AsPlainText -Force))
    if ($body) { $json = $body | ConvertTo-Json -Depth 5 } else { $json = $null }
    try {
        if ($json) {
            return Invoke-RestMethod -Uri $uri -Method $method -Headers $headers -Credential $pscreds -Body $json -ErrorAction Stop
        }
        return Invoke-RestMethod -Uri $uri -Method $method -Headers $headers -Credential $pscreds -ErrorAction Stop
    } catch {
        Write-Error "Atlas API request failed: $($_.Exception.Message)"; throw
    }
}

# Resolve project id by name if requested
if (-not $ProjectId -and $ProjectName) {
    Write-Host "Resolving project id for name: $ProjectName" -ForegroundColor Yellow
    $groups = Invoke-AtlasApi -method GET -path 'groups'
    $matched = $groups.results | Where-Object { $_.name -eq $ProjectName }
    if ($matched.Count -eq 0) { ExitWithError "No Atlas project found with name: $ProjectName" }
    $ProjectId = $matched[0].id
    Write-Host "Resolved project id: $ProjectId" -ForegroundColor Green
}

# Check if the IP is already present
try {
    $existing = Invoke-AtlasApi -method GET -path "groups/$ProjectId/accessList?ipAddress=$Ip"
    if ($existing.Count -gt 0 -or $existing.totalCount -gt 0) {
        Write-Host "IP $Ip is already present in project's access list." -ForegroundColor Green
        exit 0
    }
} catch {
    # proceed
}

$body = @(@{ ipAddress = $Ip; comment = $Comment })

if ($DryRun) {
    Write-Host "DRY-RUN: Would add the following to $ProjectId access list:" -ForegroundColor Yellow
    $body | ConvertTo-Json -Depth 5 | Write-Host
    exit 0
}

Write-Host "Adding IP $Ip to project $ProjectId access list..." -ForegroundColor Cyan
try {
    $res = Invoke-AtlasApi -method POST -path "groups/$ProjectId/accessList" -body $body
    Write-Host "Success: IP added." -ForegroundColor Green
    $res | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    ExitWithError "Failed to add IP to Atlas Access List: $($_.Exception.Message)"
}
