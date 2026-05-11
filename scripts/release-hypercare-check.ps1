param(
  [switch]$RunSmoke
)

$ErrorActionPreference = "Stop"

function Get-RootPackageScripts {
  $packagePath = Join-Path $PSScriptRoot "..\package.json"
  $packageJson = Get-Content -Raw -Path $packagePath | ConvertFrom-Json
  return $packageJson.scripts
}

function Test-ScriptExists {
  param(
    [Parameter(Mandatory = $true)][object]$Scripts,
    [Parameter(Mandatory = $true)][string]$Name
  )

  return $null -ne $Scripts.PSObject.Properties[$Name]
}

function Test-HttpHealth {
  param(
    [Parameter(Mandatory = $true)][string]$Url
  )

  try {
    $res = Invoke-RestMethod -Method Get -Uri $Url -TimeoutSec 3
    if ($res.data.status -eq "ok") {
      return $true
    }
    return $false
  } catch {
    return $false
  }
}

$requiredScripts = @(
  "sim:xevn:full",
  "sim:xevn:cross-system",
  "seed:xevn:db",
  "migrate:hrm:status",
  "migrate:xbos:status",
  "migrate:hrm:apply",
  "migrate:xbos:apply"
)

$scripts = Get-RootPackageScripts
$scriptChecks = @()
foreach ($scriptName in $requiredScripts) {
  $scriptChecks += [PSCustomObject]@{
    name = $scriptName
    exists = (Test-ScriptExists -Scripts $scripts -Name $scriptName)
    command = if (Test-ScriptExists -Scripts $scripts -Name $scriptName) { $scripts.$scriptName } else { $null }
  }
}

$allScriptsPresent = ($scriptChecks | Where-Object { $_.exists -eq $false }).Count -eq 0
$migrationApplyIsPlaceholder = (
  ($scripts."migrate:hrm:apply" -match "^echo\s+") -or
  ($scripts."migrate:xbos:apply" -match "^echo\s+")
)

$hrmHealthy = Test-HttpHealth -Url "http://localhost:3001/api/hrm"
$xbosHealthy = Test-HttpHealth -Url "http://localhost:3002/api/xbos"
$canRunSmoke = $hrmHealthy -and $xbosHealthy

$smokeResult = "SKIPPED"
$smokeError = $null
if ($RunSmoke -and $canRunSmoke) {
  try {
    pnpm run sim:xevn:full | Out-Null
    $smokeResult = "PASS"
  } catch {
    $smokeResult = "FAIL"
    $smokeError = $_.Exception.Message
  }
}

$report = [PSCustomObject]@{
  timestamp_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
  script_checks = $scriptChecks
  all_required_scripts_present = $allScriptsPresent
  migration_apply_is_placeholder = $migrationApplyIsPlaceholder
  health = [PSCustomObject]@{
    hrm_api = $hrmHealthy
    xbos_api = $xbosHealthy
  }
  smoke = [PSCustomObject]@{
    requested = [bool]$RunSmoke
    runnable = $canRunSmoke
    result = $smokeResult
    error = $smokeError
  }
}

$report | ConvertTo-Json -Depth 8

if (-not $allScriptsPresent) {
  throw "Missing required release scripts in root package.json"
}

if ($RunSmoke -and $canRunSmoke -and $smokeResult -ne "PASS") {
  throw "Smoke run failed"
}
