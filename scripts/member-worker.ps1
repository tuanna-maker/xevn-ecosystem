param(
  [Parameter(Mandatory = $true)][string]$Agent,
  [int]$IntervalSec = 20,
  [int]$ForceRunEverySec = 60
)

$ErrorActionPreference = "Stop"

function Read-JsonSafe {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  $raw = Get-Content -Path $Path -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
  try { return $raw | ConvertFrom-Json } catch { return $null }
}

function Get-PromptInstruction {
  param([string]$PromptPath, [string]$AgentId)
  $obj = Read-JsonSafe -Path $PromptPath
  if ($null -eq $obj) { return "No prompt instruction available." }
  $global = [string]$obj.globalInstruction
  $agentPrompt = ""
  if ($null -ne $obj.agents -and $null -ne $obj.agents.$AgentId) {
    $agentPrompt = [string]$obj.agents.$AgentId
  }
  $parts = @()
  if (-not [string]::IsNullOrWhiteSpace($global)) { $parts += $global }
  if (-not [string]::IsNullOrWhiteSpace($agentPrompt)) { $parts += $agentPrompt }
  if ($parts.Count -eq 0) { return "No prompt instruction available." }
  return ($parts -join " | ")
}

function Get-AgentWorkCommand {
  param([string]$AgentId)
  switch ($AgentId.ToUpperInvariant()) {
    "A2" { return "Write-Output 'BA process validation cycle'; pnpm ops:pm:queue" }
    "A3" { return "Write-Output 'BA data traceability cycle'; pnpm ops:pm:queue" }
    "A4" { return "pnpm --filter hrm-api test -- --runInBand" }
    "A5" { return "pnpm --filter xbos-api test -- --runInBand" }
    "A6" { return "pnpm --filter web-portal build" }
    "A7" { return "pnpm --filter hrm-api test -- --runInBand" }
    "A8" { return "powershell -ExecutionPolicy Bypass -File ./scripts/simulate-hrm-uat-business-flow.ps1" }
    default { return "pnpm ops:pm:queue" }
  }
}

function Append-AgentBusLog {
  param(
    [string]$BusPath,
    [string]$AgentId,
    [object[]]$Tasks
  )
  if (-not (Test-Path $BusPath)) { return }
  $now = Get-Date -Format "yyyy-MM-dd HH:mm"
  $taskLines = @()
  foreach ($task in $Tasks) {
    $taskLines += "  - $($task.task): $($task.reason)"
  }
  $taskText = if ($taskLines.Count -gt 0) { $taskLines -join [Environment]::NewLine } else { "  - (none)" }
  $entry = @(
    "",
    "## $now | $AgentId Worker -> PM (A9) | HIGH",
    "- Topic: Worker ACK task intake",
    "- Request / Handoff:",
    "  - Agent $AgentId received new queue assignment batch.",
    "  - Assigned tasks:",
    $taskText,
    "- Response:",
    "  - Worker cycle started and execution evidence will follow in next updates."
  ) -join [Environment]::NewLine
  Add-Content -Path $BusPath -Value $entry
}

function Ensure-AgentRoom {
  param([string]$Root, [string]$AgentId)
  $roomsDir = Join-Path $Root "docs/program/agent-rooms"
  if (-not (Test-Path $roomsDir)) { New-Item -ItemType Directory -Path $roomsDir -Force | Out-Null }
  $roomPath = Join-Path $roomsDir "$AgentId.md"
  if (-not (Test-Path $roomPath)) {
    Set-Content -Path $roomPath -Value "# Agent $AgentId Room`n`nLast updated: N/A"
  }
  return $roomPath
}

function Append-RoomLog {
  param([string]$RoomPath, [string]$Type, [string]$Message)
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $entry = @(
    "",
    "## [$ts] $Type",
    "- From: Worker",
    "- Message: $Message"
  ) -join [Environment]::NewLine
  Add-Content -Path $RoomPath -Value $entry
  $raw = Get-Content -Path $RoomPath -Raw
  $raw = $raw -replace "Last updated: .*", "Last updated: $ts"
  Set-Content -Path $RoomPath -Value $raw
}

$root = Split-Path -Parent $PSScriptRoot
$queuePath = Join-Path $root "docs/program/PM_DISPATCH_QUEUE.json"
$busPath = Join-Path $root "docs/program/AGENT_MESSAGE_BUS.md"
$promptPath = Join-Path $root "docs/program/TEAM_PROMPT_QUEUE.json"
$statePath = Join-Path $root "docs/program/.worker-state-$($Agent.ToUpperInvariant()).txt"

Push-Location $root
try {
  Write-Host "[$Agent worker] started at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
  $lastSignature = if (Test-Path $statePath) { Get-Content $statePath -Raw } else { "" }
  $lastExecutedAt = (Get-Date).AddYears(-1)
  $roomPath = Ensure-AgentRoom -Root $root -AgentId $Agent

  while ($true) {
    $queue = Read-JsonSafe -Path $queuePath
    $items = @()
    if ($null -ne $queue -and $null -ne $queue.queue) {
      $items = @($queue.queue | Where-Object { "$($_.to)" -eq $Agent })
    }

    $signature = ($items | ConvertTo-Json -Depth 8)
    $secondsSinceExec = [int]((Get-Date) - $lastExecutedAt).TotalSeconds
    $hasTasks = $items.Count -gt 0
    $shouldRun = $hasTasks -and (($signature -ne $lastSignature) -or ($secondsSinceExec -ge $ForceRunEverySec))
    $shouldPlan = (-not $hasTasks) -and ($secondsSinceExec -ge $ForceRunEverySec)
    if ($shouldRun) {
      $taskCount = $items.Count
      $reason = if ($signature -ne $lastSignature) { "queue changed" } else { "periodic cycle" }
      Write-Host "[$Agent worker] $reason | tasks=$taskCount | $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
      Append-AgentBusLog -BusPath $busPath -AgentId $Agent -Tasks $items
      $taskList = ($items | ForEach-Object { $_.task }) -join ", "
      Append-RoomLog -RoomPath $roomPath -Type "ACK" -Message "Intake tasks: $taskList ($reason)"
      $cmd = Get-AgentWorkCommand -AgentId $Agent
      Write-Host "[$Agent worker] executing: $cmd" -ForegroundColor Yellow
      Invoke-Expression $cmd | Out-Host
      Append-RoomLog -RoomPath $roomPath -Type "EXECUTION" -Message "Executed lane command: $cmd"
      $lastExecutedAt = Get-Date
      $lastSignature = $signature
      Set-Content -Path $statePath -Value $lastSignature
    } elseif ($shouldPlan) {
      $promptInstruction = Get-PromptInstruction -PromptPath $promptPath -AgentId $Agent
      Write-Host "[$Agent worker] planning cycle | no assigned task | $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
      Append-RoomLog -RoomPath $roomPath -Type "PLANNING" -Message "Prompt source: $promptInstruction"
      $lastExecutedAt = Get-Date
    } elseif ($signature -ne $lastSignature) {
      $taskCount = $items.Count
      Write-Host "[$Agent worker] queue changed | tasks=$taskCount | $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
      Write-Host "[$Agent worker] no assigned task, waiting..." -ForegroundColor DarkGray
      Append-RoomLog -RoomPath $roomPath -Type "IDLE" -Message "Queue changed but no assigned tasks."
      $lastSignature = $signature
      Set-Content -Path $statePath -Value $lastSignature
    } else {
      Write-Host "[$Agent worker] heartbeat | no change | $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkGray
    }
    Start-Sleep -Seconds $IntervalSec
  }
}
finally {
  Pop-Location
}
