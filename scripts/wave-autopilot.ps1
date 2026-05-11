param(
  [switch]$Watch,
  [switch]$RunChecks,
  [int]$IntervalSec = 30
)

$ErrorActionPreference = "Stop"

function Read-FileText {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return "" }
  return [System.IO.File]::ReadAllText($Path)
}

function Test-BoardTaskDone {
  param(
    [string]$BoardText,
    [string]$TaskId
  )
  $pattern = "\|\s*$([regex]::Escape($TaskId))\s*\|.*\|\s*DONE\s*\|"
  return [regex]::IsMatch($BoardText, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
}

function Get-WaveState {
  param(
    [string]$BoardText,
    [string]$ExecutionStatusText,
    [string]$DefectText
  )

  $wave1Done = (Test-BoardTaskDone -BoardText $BoardText -TaskId "SA-N1") -and
               (Test-BoardTaskDone -BoardText $BoardText -TaskId "BA-N1") -and
               (Test-BoardTaskDone -BoardText $BoardText -TaskId "BA-N2")

  $wave2Done = (Test-BoardTaskDone -BoardText $BoardText -TaskId "DEV-N1") -and
               (Test-BoardTaskDone -BoardText $BoardText -TaskId "DEV-N2") -and
               (Test-BoardTaskDone -BoardText $BoardText -TaskId "DEV-N3")

  $wave3Done = (Test-BoardTaskDone -BoardText $BoardText -TaskId "QA-N1") -and
               (Test-BoardTaskDone -BoardText $BoardText -TaskId "QA-N2")

  $noOpenBlocker = -not [regex]::IsMatch($DefectText, "\|\s*[^|]+\s*\|\s*(Blocker|Critical)\s*\|.*\|\s*Open\s*\|", "IgnoreCase")
  $gateEPass = $ExecutionStatusText -match "Gate E:\s*\*\*PASS\*\*"
  $wave4Done = $gateEPass -and $noOpenBlocker

  $currentWave = if (-not $wave1Done) { 1 }
    elseif (-not $wave2Done) { 2 }
    elseif (-not $wave3Done) { 3 }
    elseif (-not $wave4Done) { 4 }
    else { 5 }

  return [PSCustomObject]@{
    wave1Done = $wave1Done
    wave2Done = $wave2Done
    wave3Done = $wave3Done
    wave4Done = $wave4Done
    noOpenBlocker = $noOpenBlocker
    currentWave = $currentWave
  }
}

function Write-WaveSnapshot {
  param(
    [string]$Path,
    [pscustomobject]$State
  )

  $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $lines = @(
    "# WAVE AUTOPILOT SNAPSHOT",
    "",
    "- Timestamp: $now",
    "- Current wave: $($State.currentWave)",
    "- Wave 1 done: $($State.wave1Done)",
    "- Wave 2 done: $($State.wave2Done)",
    "- Wave 3 done: $($State.wave3Done)",
    "- Wave 4 done: $($State.wave4Done)",
    "- No open blocker/critical: $($State.noOpenBlocker)",
    "",
    "## Meaning",
    "- Wave 1: SA + BA freeze",
    "- Wave 2: DEV implementation",
    "- Wave 3: QA cycles",
    "- Wave 4: Release/Gate close",
    "- Wave 5: All 4 waves complete"
  )
  [System.IO.File]::WriteAllText($Path, ($lines -join [Environment]::NewLine))
}

function Invoke-Checks {
  function Remove-DistWithRetry {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    for ($i = 1; $i -le 3; $i++) {
      try {
        Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
        return
      } catch {
        if ($i -eq 3) { throw }
        Start-Sleep -Seconds 2
      }
    }
  }

  Write-Host "`n[autopilot] Running verification checks..." -ForegroundColor Yellow

  # Avoid Windows/OneDrive stale-lock failures during Nest dist cleanup.
  Remove-DistWithRetry -Path (Join-Path $root "apps/api/hrm-api/dist")
  Remove-DistWithRetry -Path (Join-Path $root "apps/api/xbos-api/dist")

  pnpm --filter hrm-api run build | Out-Host
  pnpm --filter xbos-api run build | Out-Host
  pnpm --filter hrm-api exec jest --runInBand | Out-Host
  pnpm --filter xbos-api exec jest --runInBand | Out-Host
  pnpm --filter x-bos run build | Out-Host
  pnpm --filter vite_react_shadcn_ts run build | Out-Host
  pnpm run sim:xevn:full | Out-Host
}

$root = Split-Path -Parent $PSScriptRoot
$boardPath = Join-Path $root "docs/program/SPRINT_BOARD_8_AGENT.md"
$execPath = Join-Path $root "docs/HRM_XBOS_EXECUTION_STATUS.md"
$defectPath = Join-Path $root "docs/program/DEFECT_MASTER.md"
$snapshotPath = Join-Path $root "docs/program/WAVE_AUTOPILOT_SNAPSHOT.md"

if ($Watch) {
  while ($true) {
    $boardText = Read-FileText -Path $boardPath
    $execText = Read-FileText -Path $execPath
    $defectText = Read-FileText -Path $defectPath
    $state = Get-WaveState -BoardText $boardText -ExecutionStatusText $execText -DefectText $defectText

    Clear-Host
    Write-Host "XeVN Wave Autopilot | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
    Write-Host "Current wave: $($state.currentWave)"
    Write-Host "Wave1: $($state.wave1Done) | Wave2: $($state.wave2Done) | Wave3: $($state.wave3Done) | Wave4: $($state.wave4Done)"
    Write-Host "No open blocker/critical: $($state.noOpenBlocker)"

    Write-WaveSnapshot -Path $snapshotPath -State $state

    if ($RunChecks -and $state.currentWave -lt 5) {
      Invoke-Checks
    }

    Start-Sleep -Seconds $IntervalSec
  }
} else {
  $boardText = Read-FileText -Path $boardPath
  $execText = Read-FileText -Path $execPath
  $defectText = Read-FileText -Path $defectPath
  $state = Get-WaveState -BoardText $boardText -ExecutionStatusText $execText -DefectText $defectText

  Write-Host "XeVN Wave Autopilot Snapshot" -ForegroundColor Green
  Write-Host "Current wave: $($state.currentWave)"
  Write-Host "Wave1: $($state.wave1Done) | Wave2: $($state.wave2Done) | Wave3: $($state.wave3Done) | Wave4: $($state.wave4Done)"
  Write-Host "No open blocker/critical: $($state.noOpenBlocker)"

  Write-WaveSnapshot -Path $snapshotPath -State $state

  if ($RunChecks -and $state.currentWave -lt 5) {
    Invoke-Checks
  }
}
