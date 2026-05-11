$ErrorActionPreference = "Stop"

function ConvertTo-Base64Url {
  param([byte[]]$Bytes)
  return [Convert]::ToBase64String($Bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function New-ServiceJwt {
  $secret = if ($env:SERVICE_JWT_SECRET) { $env:SERVICE_JWT_SECRET } else { "xevn-dev-jwt-secret" }
  $issuer = if ($env:SERVICE_JWT_ISSUER) { $env:SERVICE_JWT_ISSUER } else { "xevn-internal" }
  $audience = if ($env:SERVICE_JWT_AUDIENCE) { $env:SERVICE_JWT_AUDIENCE } else { "xevn-api" }

  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $headerJson = '{"alg":"HS256","typ":"JWT"}'
  $payloadJson = "{`"iss`":`"$issuer`",`"aud`":`"$audience`",`"iat`":$now,`"nbf`":$now,`"exp`":$($now + 600)}"

  $header = ConvertTo-Base64Url -Bytes ([Text.Encoding]::UTF8.GetBytes($headerJson))
  $payload = ConvertTo-Base64Url -Bytes ([Text.Encoding]::UTF8.GetBytes($payloadJson))
  $signingInput = "$header.$payload"

  $hmac = New-Object System.Security.Cryptography.HMACSHA256
  $hmac.Key = [Text.Encoding]::UTF8.GetBytes($secret)
  $signatureBytes = $hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($signingInput))
  $signature = ConvertTo-Base64Url -Bytes $signatureBytes
  return "$signingInput.$signature"
}

$serviceJwt = New-ServiceJwt
$defaultHeaders = @{
  "Authorization" = "Bearer $serviceJwt"
  "x-request-id" = [guid]::NewGuid().ToString()
}

function Invoke-JsonPost {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $false)]$Body = @{}
  )
  return Invoke-RestMethod -Method Post -Uri $Url -Headers $defaultHeaders -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 8)
}

Write-Host "=== XeVN Cross-System Simulation ==="
Write-Host "1) Bootstrap configuration in XBOS"
$bootstrap = Invoke-JsonPost -Url "http://localhost:3002/api/xbos/config-sync/bootstrap-xevn"
$bootstrap | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "2) Verify XBOS catalog assigned to HRM"
$xbosCatalog = Invoke-RestMethod -Method Get -Uri "http://localhost:3002/api/xbos/config-sync/catalog/job_titles?target=hrm" -Headers $defaultHeaders
$xbosCatalog | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "3) HRM pulls catalog from XBOS"
$pull = Invoke-JsonPost -Url "http://localhost:3001/api/hrm/catalog-sync/pull/job_titles"
$pull | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "4) HRM reads local synced catalog"
$hrmCatalog = Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/hrm/catalog-sync/job_titles" -Headers $defaultHeaders
$hrmCatalog | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "5) Simulation assertions"
$hasTongGiamDoc = $false
if ($hrmCatalog.success -eq $true -and $hrmCatalog.data.payload.items) {
  foreach ($item in $hrmCatalog.data.payload.items) {
    if ($item.code -eq "CEO" -and $item.label -eq "Tong giam doc") {
      $hasTongGiamDoc = $true
    }
  }
}

$summary = [PSCustomObject]@{
  xbos_seeded_catalogs   = $bootstrap.data.seeded_catalogs
  xbos_to_hrm_assignment = $xbosCatalog.success
  hrm_pull_success       = $pull.success
  hrm_local_read_success = $hrmCatalog.success
  realistic_sample_found = $hasTongGiamDoc
  integration_ready      = ($xbosCatalog.success -and $pull.success -and $hrmCatalog.success -and $hasTongGiamDoc)
}

$summary | ConvertTo-Json -Depth 10

if (-not $summary.integration_ready) {
  throw "Cross-system simulation failed."
}

Write-Host ""
Write-Host "Simulation completed successfully."
