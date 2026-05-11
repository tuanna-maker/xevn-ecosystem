$ErrorActionPreference = "Stop"

function Show-Section {
  param(
    [string]$Title,
    [string]$Path,
    [int]$Tail = 40
  )
  Write-Host ""
  Write-Host "==== $Title ====" -ForegroundColor Cyan
  if (Test-Path $Path) {
    Get-Content -Path $Path -Tail $Tail
  } else {
    Write-Host "Missing: $Path" -ForegroundColor Yellow
  }
}

$root = Split-Path -Parent $PSScriptRoot
$programDir = Join-Path $root "docs/program"

if ($args.Count -gt 0 -and $args[0] -eq "--watch") {
  while ($true) {
    Clear-Host
    Write-Host "XeVN 8-Agent Dashboard | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
    Show-Section -Title "CONTROL TOWER" -Path (Join-Path $programDir "AGENT_CONTROL_TOWER.md") -Tail 120
    Show-Section -Title "SPRINT BOARD" -Path (Join-Path $programDir "SPRINT_BOARD_8_AGENT.md") -Tail 120
    Show-Section -Title "MESSAGE BUS (latest)" -Path (Join-Path $programDir "AGENT_MESSAGE_BUS.md") -Tail 40
    Show-Section -Title "DAILY SYNC (latest)" -Path (Join-Path $programDir "DAILY_SYNC.md") -Tail 40
    Show-Section -Title "PROJECT JOURNAL (latest)" -Path (Join-Path $programDir "PROJECT_JOURNAL.md") -Tail 40
    Start-Sleep -Seconds 10
  }
} else {
  Write-Host "XeVN 8-Agent Dashboard | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
  Show-Section -Title "CONTROL TOWER" -Path (Join-Path $programDir "AGENT_CONTROL_TOWER.md") -Tail 120
  Show-Section -Title "SPRINT BOARD" -Path (Join-Path $programDir "SPRINT_BOARD_8_AGENT.md") -Tail 120
  Show-Section -Title "MESSAGE BUS (latest)" -Path (Join-Path $programDir "AGENT_MESSAGE_BUS.md") -Tail 40
  Show-Section -Title "DAILY SYNC (latest)" -Path (Join-Path $programDir "DAILY_SYNC.md") -Tail 40
  Show-Section -Title "PROJECT JOURNAL (latest)" -Path (Join-Path $programDir "PROJECT_JOURNAL.md") -Tail 40
}
