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
  return Invoke-RestMethod -Method Post -Uri $Url -Headers $defaultHeaders -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
}

Write-Host "=== XeVN Full Simulation: XBOS + HRM ==="

Write-Host "Step 1: Health check 2 subsystems"
$xbosHealth = Invoke-RestMethod -Method Get -Uri "http://localhost:3002/api/xbos" -Headers $defaultHeaders
$hrmHealth = Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/hrm" -Headers $defaultHeaders

Write-Host "Step 2: Bootstrap realistic catalogs in XBOS"
$bootstrap = Invoke-JsonPost -Url "http://localhost:3002/api/xbos/config-sync/bootstrap-xevn"

Write-Host "Step 3: Read all catalogs assigned to HRM from XBOS"
$xbosCatalogs = Invoke-RestMethod -Method Get -Uri "http://localhost:3002/api/xbos/config-sync/catalogs?target=hrm" -Headers $defaultHeaders

Write-Host "Step 4: Pull all assigned catalogs into HRM"
$pullResults = @()
foreach ($catalog in $xbosCatalogs.data.data) {
  $pull = Invoke-JsonPost -Url ("http://localhost:3001/api/hrm/catalog-sync/pull/" + $catalog.key)
  $pullResults += $pull
}

Write-Host "Step 5: Verify HRM local catalog cache"
$hrmLocalCatalogs = Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/hrm/catalog-sync" -Headers $defaultHeaders

Write-Host "Step 6: Re-pull to verify version/audit behavior"
$repullResults = @()
foreach ($catalog in $xbosCatalogs.data.data) {
  $repull = Invoke-JsonPost -Url ("http://localhost:3001/api/hrm/catalog-sync/pull/" + $catalog.key)
  $repullResults += $repull
}
$hrmAfterRepull = Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/hrm/catalog-sync" -Headers $defaultHeaders

Write-Host "Step 7: Check realistic samples"
$sampleChecks = [PSCustomObject]@{
  has_ceo_title = $false
  has_hanoi_cost_center = $false
  has_otif_kpi = $false
  has_versioning = $true
  has_checksum = $true
}

foreach ($catalog in $hrmAfterRepull.data.data) {
  foreach ($item in $catalog.payload.items) {
    if ($item.code -eq "CEO" -and $item.label -eq "Tong giam doc") { $sampleChecks.has_ceo_title = $true }
    if ($item.code -eq "CC-HN-OPS" -and $item.label -eq "Van hanh Ha Noi") { $sampleChecks.has_hanoi_cost_center = $true }
    if ($item.code -eq "KPI_OTIF" -and $item.label -eq "Ty le giao dung han OTIF") { $sampleChecks.has_otif_kpi = $true }
  }
  if ($catalog.version -lt 2) { $sampleChecks.has_versioning = $false }
  if (-not $catalog.checksum) { $sampleChecks.has_checksum = $false }
}

$allPulled = ($pullResults | Where-Object { $_.success -eq $true }).Count -eq $xbosCatalogs.data.total
$integrationReady = (
  $xbosHealth.data.status -eq "ok" -and
  $hrmHealth.data.status -eq "ok" -and
  $bootstrap.success -eq $true -and
  $xbosCatalogs.success -eq $true -and
  $allPulled -and
  (($repullResults | Where-Object { $_.success -eq $true }).Count -eq $xbosCatalogs.data.total) -and
  $hrmLocalCatalogs.data.total -ge $xbosCatalogs.data.total -and
  $sampleChecks.has_ceo_title -and
  $sampleChecks.has_hanoi_cost_center -and
  $sampleChecks.has_otif_kpi -and
  $sampleChecks.has_versioning -and
  $sampleChecks.has_checksum
)

$report = [PSCustomObject]@{
  xbos_health = $xbosHealth.data
  hrm_health = $hrmHealth.data
  seeded_catalog_count = $bootstrap.data.seeded_catalogs
  xbos_catalogs_for_hrm = $xbosCatalogs.data.total
  pulled_catalog_count = ($pullResults | Where-Object { $_.success -eq $true }).Count
  repulled_catalog_count = ($repullResults | Where-Object { $_.success -eq $true }).Count
  hrm_local_catalog_count = $hrmLocalCatalogs.data.total
  realistic_samples = $sampleChecks
  integration_ready = $integrationReady
}

$report | ConvertTo-Json -Depth 10

if (-not $integrationReady) {
  throw "Full simulation failed. Check report details."
}

Write-Host "Full two-subsystem simulation completed successfully."
