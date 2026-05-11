param(
  [switch]$Watch,
  [int]$IntervalSec = 45,
  [string]$LearningScope = "C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects"
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

function Append-Section {
  param([string]$Path, [string]$Title, [string[]]$Lines)
  $lineText = if ($Lines.Count -gt 0) { $Lines -join [Environment]::NewLine } else { "  - (none)" }
  $entry = @(
    "",
    "## $Title",
    $lineText
  ) -join [Environment]::NewLine
  Add-Content -Path $Path -Value $entry
}

function Ensure-AgentRoom {
  param([string]$RoomsDir, [string]$AgentId)
  if (-not (Test-Path $RoomsDir)) { New-Item -ItemType Directory -Path $RoomsDir -Force | Out-Null }
  $roomPath = Join-Path $RoomsDir "$AgentId.md"
  if (-not (Test-Path $roomPath)) {
    Set-Content -Path $roomPath -Value "# Agent $AgentId Room`n`nLast updated: N/A"
  }
  return $roomPath
}

function Append-Room {
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

function Queue-Hash {
  param($Queue)
  if ($null -eq $Queue -or $null -eq $Queue.queue) { return "" }
  return (($Queue.activePhase | Out-String) + "|" + ($Queue.queue | ConvertTo-Json -Depth 10)).Trim()
}

$root = Split-Path -Parent $PSScriptRoot
$queuePath = Join-Path $root "docs/program/PM_DISPATCH_QUEUE.json"
$mailboxPath = Join-Path $root "docs/program/TEAM_MAILBOX.json"
$statePath = Join-Path $root "docs/program/.compact-orchestrator-state.json"
$knowledgePath = Join-Path $root "docs/program/TEAM_KNOWLEDGE_LOG.md"
$busPath = Join-Path $root "docs/program/AGENT_MESSAGE_BUS.md"
$roomsDir = Join-Path $root "docs/program/agent-rooms"

Push-Location $root
try {
  $defaultState = [PSCustomObject]@{
    lastQueueHash = ""
    lastLearningAt = ""
  }

  while ($true) {
    pnpm ops:pm:queue | Out-Host
    pnpm ops:dashboard:data | Out-Host
    powershell -ExecutionPolicy Bypass -File ./scripts/update-global-kb.ps1 -SourceRoot $LearningScope | Out-Host

    $state = Read-JsonSafe -Path $statePath -Default $defaultState
    if ($null -eq $state) { $state = $defaultState }
    $queue = Read-JsonSafe -Path $queuePath -Default $null
    $hash = Queue-Hash -Queue $queue

    $mailbox = [ordered]@{
      generatedAt = (Get-Date).ToString("s")
      activePhase = if ($null -ne $queue) { $queue.activePhase } else { $null }
      team = [ordered]@{
        PM = @("A9 runs queue+incident orchestration")
        SA = @("A1 validates architecture/signoff against active phase")
        BA = @("A2/A3 refine acceptance+traceability")
        DEV = @("A4/A5/A6 execute backend/frontend tasks from queue")
        QA = @("A7/A8 execute regression/UAT and raise defects")
      }
      queue = if ($null -ne $queue -and $null -ne $queue.queue) { @($queue.queue) } else { @() }
    }
    Write-Json -Path $mailboxPath -Data $mailbox
    $pmRoom = Ensure-AgentRoom -RoomsDir $roomsDir -AgentId "A9"
    Append-Room -RoomPath $pmRoom -From "A9 PM-Tech" -Type "HEARTBEAT" -Message "Phase=$($mailbox.activePhase), Queue=$(@($mailbox.queue).Count), mailbox refreshed."
    foreach ($q in @($mailbox.queue)) {
      $to = [string]$q.to
      if ([string]::IsNullOrWhiteSpace($to)) { continue }
      $room = Ensure-AgentRoom -RoomsDir $roomsDir -AgentId $to
      Append-Room -RoomPath $room -From "A9 PM-Tech" -Type "DISPATCH" -Message "Task=$($q.task) Priority=$($q.priority) Reason=$($q.reason)"
    }

    $heartbeatLines = @(
      "- Topic: Compact orchestrator heartbeat",
      "- Request / Handoff:",
      "  - Active phase: $($mailbox.activePhase)",
      "  - Queue size: $(@($mailbox.queue).Count)",
      "  - Mailbox refreshed: docs/program/TEAM_MAILBOX.json",
      "- Response:",
      "  - Team continues role-lane execution and evidence updates."
    )
    Append-Section -Path $busPath -Title "$(Get-Date -Format 'yyyy-MM-dd HH:mm') | A9 PM-Tech -> Team | INFO" -Lines $heartbeatLines

    if ($hash -ne $state.lastQueueHash -and $null -ne $queue) {
      $lines = @(
        "- Topic: Compact orchestration broadcast",
        "- Request / Handoff:",
        "  - Active phase: $($queue.activePhase)",
        "  - Queue size: $(@($queue.queue).Count)",
        "  - Artifact: docs/program/TEAM_MAILBOX.json",
        "- Response:",
        "  - Members execute by role lane and post ACK/evidence."
      )
      Append-Section -Path $busPath -Title "$(Get-Date -Format 'yyyy-MM-dd HH:mm') | A9 PM-Tech -> Team | HIGH" -Lines $lines
      $state.lastQueueHash = $hash
    }

    # Lightweight continuous learning heartbeat from the user's allowed project scope.
    $recent = @()
    if (Test-Path $LearningScope) {
      $recent = Get-ChildItem -Path $LearningScope -File -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 8
    }
    if ($recent.Count -gt 0) {
      $learnLines = @(
        "- Scope: project-wide autonomous learning heartbeat",
        "- Latest touched artifacts:"
      )
      foreach ($f in $recent) {
        $learnLines += "  - $($f.FullName)"
      }
      Append-Section -Path $knowledgePath -Title "$(Get-Date -Format 'yyyy-MM-dd HH:mm') | A9 PM-Tech | COMPACT-LEARNING" -Lines $learnLines
      $state.lastLearningAt = (Get-Date).ToString("s")
    }

    Write-Json -Path $statePath -Data $state
    Write-Host "[compact-orchestrator] $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | phase=$($mailbox.activePhase) | queue=$(@($mailbox.queue).Count)" -ForegroundColor Green

    if (-not $Watch) { break }
    Start-Sleep -Seconds $IntervalSec
  }
}
finally {
  Pop-Location
}
