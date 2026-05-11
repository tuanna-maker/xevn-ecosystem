param(
  [switch]$Watch,
  [int]$IntervalSec = 25,
  [int]$EscalateAfterSec = 90
)

$ErrorActionPreference = "Stop"

function Read-JsonSafe {
  param([string]$Path, $Default)
  if (-not (Test-Path $Path)) { return $Default }
  $raw = Get-Content -Path $Path -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($raw)) { return $Default }
  try { return $raw | ConvertFrom-Json } catch { return $Default }
}

function Write-Json {
  param([string]$Path, $Data)
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  $Data | ConvertTo-Json -Depth 20 | Set-Content -Path $Path
}

function Queue-Hash {
  param($QueueObj)
  if ($null -eq $QueueObj -or $null -eq $QueueObj.queue) { return "" }
  return (@($QueueObj.queue) | ConvertTo-Json -Depth 10)
}

function Append-Bus {
  param([string]$BusPath, [string]$Topic, [string[]]$Lines)
  $lineText = if ($Lines.Count -gt 0) { $Lines -join [Environment]::NewLine } else { "  - (none)" }
  $now = Get-Date -Format "yyyy-MM-dd HH:mm"
  $body = @(
    "",
    "## $now | A9 PM-Tech -> Team | HIGH",
    "- Topic: $Topic",
    "- Request / Handoff:",
    $lineText,
    "- Response:",
    "  - Team members must ACK in message bus after intake."
  ) -join [Environment]::NewLine
  Add-Content -Path $BusPath -Value $body
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
  param([string]$RoomPath, [string]$From, [string]$Type, [string]$Message)
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $entry = @(
    "",
    "## [$ts] $Type",
    "- From: $From",
    "- Message: $Message"
  ) -join [Environment]::NewLine
  Add-Content -Path $RoomPath -Value $entry
  $raw = Get-Content -Path $RoomPath -Raw
  $raw = $raw -replace "Last updated: .*", "Last updated: $ts"
  Set-Content -Path $RoomPath -Value $raw
}

$root = Split-Path -Parent $PSScriptRoot
$queuePath = Join-Path $root "docs/program/PM_DISPATCH_QUEUE.json"
$mailboxPath = Join-Path $root "docs/program/TEAM_MAILBOX.json"
$statePath = Join-Path $root "docs/program/.team-loop-state.json"
$busPath = Join-Path $root "docs/program/AGENT_MESSAGE_BUS.md"

Push-Location $root
try {
  $defaultState = [PSCustomObject]@{
    lastQueueHash = ""
    assignedAtByTask = @{}
  }

  while ($true) {
    $queue = Read-JsonSafe -Path $queuePath -Default $null
    $state = Read-JsonSafe -Path $statePath -Default $defaultState
    if ($null -eq $state) { $state = $defaultState }
    if ($null -eq $state.assignedAtByTask) {
      $state.assignedAtByTask = @{}
    } elseif ($state.assignedAtByTask -isnot [hashtable]) {
      $tmp = @{}
      foreach ($p in $state.assignedAtByTask.PSObject.Properties) {
        $tmp[$p.Name] = [string]$p.Value
      }
      $state.assignedAtByTask = $tmp
    }

    $items = if ($null -ne $queue -and $null -ne $queue.queue) { @($queue.queue) } else { @() }
    $nowIso = (Get-Date).ToString("s")
    $hash = Queue-Hash -QueueObj $queue

    # Build mailbox grouped by agent
    $mailbox = [ordered]@{
      generatedAt = $nowIso
      activePhase = if ($null -ne $queue) { $queue.activePhase } else { $null }
      agents = [ordered]@{}
    }

    $hasQueueChange = $hash -ne $state.lastQueueHash
    $newAssignments = @()
    foreach ($item in $items) {
      $agent = [string]$item.to
      if (-not $mailbox.agents.Contains($agent)) {
        $mailbox.agents[$agent] = @()
      }
      $mailbox.agents[$agent] += [PSCustomObject]@{
        task = $item.task
        priority = $item.priority
        reason = $item.reason
        phase = $item.phase
      }

      if (-not $state.assignedAtByTask.ContainsKey($item.task)) {
        $state.assignedAtByTask[$item.task] = $nowIso
        $newAssignments += $item
      }
    }

    # Remove stale task timestamps not in queue anymore.
    $taskSet = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($i in $items) { [void]$taskSet.Add([string]$i.task) }
    $current = @{}
    foreach ($k in $state.assignedAtByTask.PSObject.Properties.Name) {
      if ($taskSet.Contains($k)) { $current[$k] = $state.assignedAtByTask.$k }
    }
    $state.assignedAtByTask = $current

    Write-Json -Path $mailboxPath -Data $mailbox

    if ($hasQueueChange -and $newAssignments.Count -gt 0) {
      $lines = @("  - New assignments detected and delivered into TEAM_MAILBOX.")
      foreach ($a in $newAssignments) {
        $lines += "  - Assign $($a.to): $($a.task) [$($a.priority)] - $($a.reason)"
        $room = Ensure-AgentRoom -Root $root -AgentId ([string]$a.to)
        Append-RoomLog -RoomPath $room -From "A9 PM-Tech" -Type "DISPATCH" -Message "Task=$($a.task), Priority=$($a.priority), Reason=$($a.reason)"
      }
      $lines += "  - Artifact: docs/program/TEAM_MAILBOX.json"
      Append-Bus -BusPath $busPath -Topic "Autonomous assignment broadcast" -Lines $lines
    }

    # Escalation if tasks are still queued too long.
    $escalations = @()
    foreach ($item in $items) {
      $taskId = [string]$item.task
      $assignedAt = $state.assignedAtByTask[$taskId]
      if (-not $assignedAt) { continue }
      $ageSec = [int]([DateTime]::UtcNow - [DateTime]::Parse($assignedAt).ToUniversalTime()).TotalSeconds
      if ($ageSec -ge $EscalateAfterSec) {
        $escalations += "  - Escalate $($item.to): $taskId pending ${ageSec}s (priority $($item.priority))."
      }
    }
    if ($escalations.Count -gt 0) {
      $lines = @("  - SLA timer breached for queued tasks.") + $escalations + @("  - PM requests immediate ACK + ETA update.")
      Append-Bus -BusPath $busPath -Topic "Autonomous SLA escalation" -Lines $lines
    }

    $state.lastQueueHash = $hash
    Write-Json -Path $statePath -Data $state

    Write-Host "[team-loop] $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | phase=$($mailbox.activePhase) | queued=$($items.Count) | changed=$hasQueueChange"

    if (-not $Watch) { break }
    Start-Sleep -Seconds $IntervalSec
  }
}
finally {
  Pop-Location
}
