<#
Remove an IP address from a MongoDB Atlas project's Access List (whitelist).

Usage examples:
  .\scripts\remove-atlas-ip.ps1 -ProjectId <PROJECT_ID> -Ip 203.0.113.10 -PublicKey $env:ATLAS_PUBLIC_KEY -PrivateKey $env:ATLAS_PRIVATE_KEY

  .\scripts\remove-atlas-ip.ps1 -ProjectName 'Apsara Project' -Ip 203.0.113.10 -DryRun

#>

param(
    [string]$PublicKey = $env:ATLAS_PUBLIC_KEY,
    [string]$PrivateKey = $env:ATLAS_PRIVATE_KEY,
    [string]$ProjectId,
    [string]$ProjectName,
    [Parameter(Mandatory=$true)][string]$Ip,
    [switch]$DryRun
)

function ExitWithError($msg) { Write-Error $msg; exit 1 }

if (-not $PublicKey -or -not $PrivateKey) {
    ExitWithError "Atlas API keys are required. Provide -PublicKey and -PrivateKey or set ATLAS_PUBLIC_KEY/ATLAS_PRIVATE_KEY environment variables."
}

if (-not $ProjectId -and -not $ProjectName) {
    ExitWithError "Either -ProjectId or -ProjectName must be provided."
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

if (-not $ProjectId -and $ProjectName) {
    Write-Host "Resolving project id for name: $ProjectName" -ForegroundColor Yellow
    $groups = Invoke-AtlasApi -method GET -path 'groups'
    $matched = $groups.results | Where-Object { $_.name -eq $ProjectName }
    if ($matched.Count -eq 0) { ExitWithError "No Atlas project found with name: $ProjectName" }
    $ProjectId = $matched[0].id
    Write-Host "Resolved project id: $ProjectId" -ForegroundColor Green
}

$encodedIp = [System.Uri]::EscapeDataString($Ip)

if ($DryRun) {
    Write-Host "DRY RUN: Would DELETE groups/$ProjectId/accessList/$encodedIp" -ForegroundColor Yellow
    exit 0
}

Write-Host "Removing IP $Ip from project $ProjectId access list..." -ForegroundColor Cyan
try {
    $res = Invoke-AtlasApi -method DELETE -path "groups/$ProjectId/accessList/$encodedIp"
    Write-Host "Success: IP removed." -ForegroundColor Green
    if ($res) { $res | ConvertTo-Json -Depth 5 | Write-Host }
} catch {
    ExitWithError "Failed to remove IP from Atlas Access List: $($_.Exception.Message)"
}
