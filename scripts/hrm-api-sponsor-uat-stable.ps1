# PCOMP-W6-DO-STABLE-DIST-01 — keep hrm-api on :28001 from dist-uat-w6
# LOCK: do NOT run pnpm run dev:hrm-api / nest start --watch / nest build on hrm-api while this runs.
# U65 / HOLD_DEPLOY / local 1B only — not :8088.

$ErrorActionPreference = 'Continue'
$repoRoot = Split-Path -Parent $PSScriptRoot
$hrmDir = Join-Path $repoRoot 'apps\api\hrm-api'
$entry = Join-Path $hrmDir 'dist-uat-w6\main.js'
$lockFile = Join-Path $hrmDir 'dist-uat-w6\.SPONSOR_UAT_LOCK'
$pidFile = Join-Path $hrmDir 'dist-uat-w6\.SPONSOR_UAT_PID'
$logFile = Join-Path $hrmDir 'logs\uat-w6-watchdog.log'
New-Item -ItemType Directory -Force -Path (Join-Path $hrmDir 'logs') | Out-Null

function Write-Log([string]$msg) {
  $line = "$(Get-Date -Format o) $msg"
  Add-Content -Path $logFile -Value $line -Encoding utf8
}

function Get-ListenInfo {
  $rows = @()
  netstat -ano 2>$null | Select-String ':28001' | Select-String 'LISTENING' | ForEach-Object {
    $parts = ($_.Line -split '\s+') | Where-Object { $_ -ne '' }
    $procId = [int]$parts[-1]
    $cmd = $null
    try { $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction Stop).CommandLine } catch { $cmd = $null }
    $rows += [PSCustomObject]@{ Pid = $procId; Cmd = $cmd; IsUat = ($cmd -match 'dist-uat-w6') }
  }
  return $rows
}

function Ensure-DistUat {
  if (Test-Path $entry) { return $true }
  $distMain = Join-Path $hrmDir 'dist\main.js'
  if (-not (Test-Path $distMain)) {
    Write-Log 'FAIL: dist/main.js missing - run one exclusive nest build before watchdog'
    return $false
  }
  $dst = Join-Path $hrmDir 'dist-uat-w6'
  if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
  Copy-Item -Recurse -Force (Join-Path $hrmDir 'dist') $dst
  Write-Log 'Copied dist -> dist-uat-w6'
  return (Test-Path $entry)
}

function Kill-HrmWatches {
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and
    $_.CommandLine -notmatch 'xbos-api' -and
    $_.CommandLine -notmatch 'dist-uat-w6' -and
    $_.CommandLine -notmatch 'hrm-api-sponsor-uat-stable' -and
    (
      ($_.CommandLine -match 'hrm-api' -and $_.CommandLine -match 'nest\.js|start --watch') -or
      ($_.CommandLine -match 'dev:hrm-api') -or
      ($_.CommandLine -match 'filter=hrm-api')
    )
  } | ForEach-Object {
    Write-Log "kill watch $($_.ProcessId)"
    cmd /c "taskkill /F /T /PID $($_.ProcessId)" 2>$null | Out-Null
  }
}

function Start-UatServe {
  $env:HRM_BE_PORT = '28001'
  $p = Start-Process -FilePath 'node' -ArgumentList '--enable-source-maps', $entry -WorkingDirectory $hrmDir -PassThru -WindowStyle Hidden
  Write-Log "started node pid=$($p.Id)"
  return $p
}

function Write-Lock([int]$procId) {
  @"
work_item=PCOMP-W6-DO-STABLE-DIST-01
pid=$procId
entry=dist-uat-w6/main.js
cwd=apps/api/hrm-api
port=28001
started=$(Get-Date -Format o)
LOCK=Do NOT run pnpm run dev:hrm-api / nest start --watch / nest build on hrm-api during sponsor W6.
Serve ONLY from dist-uat-w6 (outside nest deleteOutDir).
watchdog=scripts/hrm-api-sponsor-uat-stable.ps1
"@ | Set-Content -Path $lockFile -Encoding utf8
  "$procId" | Set-Content -Path $pidFile -Encoding utf8
}

if (-not (Ensure-DistUat)) { exit 1 }
Write-Log 'watchdog start'
Kill-HrmWatches

while ($true) {
  try {
    Kill-HrmWatches
    $info = @(Get-ListenInfo)
    $uat = $info | Where-Object { $_.IsUat } | Select-Object -First 1
    $non = $info | Where-Object { -not $_.IsUat }

    foreach ($row in $non) {
      Write-Log "kill non-uat usurper $($row.Pid) :: $($row.Cmd)"
      cmd /c "taskkill /F /T /PID $($row.Pid)" 2>$null | Out-Null
    }

    if (-not $uat) {
      # port free or cleared — start uat serve
      Start-Sleep -Milliseconds 400
      $still = @(Get-ListenInfo)
      if (-not ($still | Where-Object { $_.IsUat })) {
        Start-UatServe | Out-Null
        Start-Sleep -Seconds 2
      }
      $info = @(Get-ListenInfo)
      $uat = $info | Where-Object { $_.IsUat } | Select-Object -First 1
    }

    if ($uat) {
      try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:28001/api/hrm' -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) {
          Write-Lock -procId $uat.Pid
        } else {
          Write-Log "health $($r.StatusCode) - restart"
          cmd /c "taskkill /F /T /PID $($uat.Pid)" 2>$null | Out-Null
        }
      } catch {
        Write-Log "health fail - restart $($_.Exception.Message)"
        cmd /c "taskkill /F /T /PID $($uat.Pid)" 2>$null | Out-Null
      }
    }
  } catch {
    Write-Log "loop error $($_.Exception.Message)"
  }
  Start-Sleep -Seconds 5
}
