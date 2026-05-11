param(
  [switch]$Watch,
  [int]$IntervalSec = 20,
  [int]$DispatchTopN = 5,
  [string]$TerminalsDir = "$env:USERPROFILE\.cursor\projects\c-Users-ADMIN-OneDrive-Ta-i-li-u-Vibe-Coding-projects-xevn-ecosystem\terminals"
)

$ErrorActionPreference = "Stop"

function Read-JsonSafe {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  $raw = Get-Content -Path $Path -Raw
  if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
  return $raw | ConvertFrom-Json
}

function Update-QueueAndDashboard {
  param([string]$Root)
  pnpm ops:pm:queue | Out-Host
  pnpm ops:dashboard:data | Out-Host
}

function Read-TerminalIncidents {
  param(
    [string]$DirPath,
    [string[]]$Patterns
  )
  if (-not (Test-Path $DirPath)) { return @() }
  $hits = @()
  $files = Get-ChildItem -Path $DirPath -Filter *.txt -File -ErrorAction SilentlyContinue
  foreach ($f in $files) {
    $tail = Get-Content -Path $f.FullName -Tail 80 -ErrorAction SilentlyContinue
    if (-not $tail) { continue }
    foreach ($line in $tail) {
      foreach ($p in $Patterns) {
        if ($line -match $p) {
          $hits += [PSCustomObject]@{
            terminal = $f.Name
            line = $line.Trim()
          }
          break
        }
      }
    }
  }
  return $hits
}

function Read-CacheSet {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return [System.Collections.Generic.HashSet[string]]::new() }
  $raw = Get-Content -Path $Path -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($raw)) { return [System.Collections.Generic.HashSet[string]]::new() }
  try {
    $arr = $raw | ConvertFrom-Json
    $set = [System.Collections.Generic.HashSet[string]]::new()
    if ($null -eq $arr) { return $set }
    foreach ($item in @($arr)) { [void]$set.Add([string]$item) }
    return $set
  } catch {
    return [System.Collections.Generic.HashSet[string]]::new()
  }
}

function Save-CacheSet {
  param(
    [string]$Path,
    [System.Collections.Generic.HashSet[string]]$Set
  )
  $arr = @()
  foreach ($i in $Set) { $arr += $i }
  $arr | ConvertTo-Json -Depth 3 | Set-Content -Path $Path
}

function Read-JsonArraySafe {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return @() }
  $raw = Get-Content -Path $Path -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
  try {
    $data = $raw | ConvertFrom-Json
    if ($null -eq $data) { return @() }
    return @($data)
  } catch {
    return @()
  }
}

function Save-JsonArray {
  param(
    [string]$Path,
    [object[]]$Items
  )
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  if ($null -eq $Items -or @($Items).Count -eq 0) {
    Set-Content -Path $Path -Value "[]"
    return
  }
  $Items | ConvertTo-Json -Depth 10 | Set-Content -Path $Path
}

function Append-Defect {
  param(
    [string]$DefectPath,
    [string]$IncidentSummary
  )
  $stamp = Get-Date -Format "yyyyMMddHHmmss"
  $defectId = "DEF-PM-$stamp-$([int](Get-Random -Minimum 100 -Maximum 999))"
  $row = "| $defectId | Major | Dev Runtime | $IncidentSummary | PM-Tech | Open | Pending triage |"
  Add-Content -Path $DefectPath -Value $row
}

function Resolve-IncidentOwner {
  param([string]$Line)
  $text = $Line.ToLowerInvariant()
  if ($text.Contains("x-bos:dev") -or $text.Contains("x-bos-core")) { return "A6" }
  if ($text.Contains("vite_react_shadcn_ts:dev") -or $text.Contains("apps\\web\\hrm")) { return "A6" }
  if ($text.Contains("web-portal:dev") -or $text.Contains("failed to resolve import")) { return "A6" }
  if ($text.Contains("xbos-api")) { return "A5" }
  if ($text.Contains("hrm-api")) { return "A4" }
  if ($text.Contains("sim:") -or $text.Contains("uat")) { return "A8" }
  return "A7"
}

function Build-IncidentTask {
  param(
    [string]$Terminal,
    [string]$Line
  )
  $stamp = Get-Date -Format "yyyyMMddHHmmss"
  $owner = Resolve-IncidentOwner -Line $Line
  $taskId = "INC-$stamp-$([int](Get-Random -Minimum 100 -Maximum 999))"
  return [PSCustomObject]@{
    id = $taskId
    to = $owner
    source = $Terminal
    severity = "HIGH"
    reason = "Auto-detected runtime incident"
    detail = $Line
    status = "OPEN"
    createdAt = (Get-Date).ToString("s")
  }
}

function Append-IncidentPing {
  param(
    [string]$BusPath,
    [System.Collections.ArrayList]$NewIncidents,
    [object[]]$IncidentTasks
  )
  if ($NewIncidents.Count -eq 0) { return }
  $now = Get-Date -Format "yyyy-MM-dd HH:mm"
  $lines = @()
  foreach ($inc in $NewIncidents) {
    $lines += "  - [$($inc.terminal)] $($inc.line)"
  }
  $dispatch = @()
  foreach ($task in @($IncidentTasks)) {
    $dispatch += "  - Assign $($task.to): $($task.id) | $($task.detail)"
  }
  $linesText = if ($lines.Count -gt 0) { $lines -join [Environment]::NewLine } else { "  - (none)" }
  $dispatchText = if ($dispatch.Count -gt 0) { $dispatch -join [Environment]::NewLine } else { "  - (none)" }
  $entry = @(
    "",
    "## $now | A9 PM-Tech -> Team | HIGH",
    "- Topic: Incident auto-intake from live terminals",
    "- Request / Handoff:",
    "  - PM detected runtime/build incidents and opened/updated defect tracking.",
    "  - PM auto-dispatched incidents to owners. Dev/QA must ACK immediately.",
    "  - Incident lines:",
    $linesText,
    "  - Auto assignments:",
    $dispatchText,
    "- Artifacts:",
    "  - docs/program/DEFECT_MASTER.md",
    "  - docs/program/PM_INCIDENT_QUEUE.json",
    "  - docs/program/AGENT_MESSAGE_BUS.md",
    "- Needed by:",
    "  - Immediate",
    "- Response:",
    "  - PM awaiting owner ACK with fix ETA."
  ) -join [Environment]::NewLine
  Add-Content -Path $BusPath -Value $entry
}

function Queue-Signature {
  param($QueueObject)
  if ($null -eq $QueueObject) { return "" }
  return (($QueueObject.queue | ConvertTo-Json -Depth 10) + "|" + ($QueueObject.activePhase | Out-String)).Trim()
}

function Append-DispatchPing {
  param(
    [string]$BusPath,
    $QueueObject,
    [int]$TopN = 5
  )

  if ($null -eq $QueueObject -or $null -eq $QueueObject.queue) { return }
  $items = @($QueueObject.queue)
  if ($items.Count -eq 0) { return }

  $now = Get-Date -Format "yyyy-MM-dd HH:mm"
  $top = $items | Select-Object -First $TopN
  $lines = @()
  foreach ($item in $top) {
    $lines += "  - To $($item.to): $($item.task) [$($item.priority)] - $($item.reason)"
  }
  $linesText = if ($lines.Count -gt 0) { $lines -join [Environment]::NewLine } else { "  - (none)" }

  $entry = @(
    "",
    "## $now | A9 PM-Tech -> Team | HIGH",
    "- Topic: Autopilot dispatch reminder",
    "- Request / Handoff:",
    "  - Active phase: $($QueueObject.activePhase)",
    "  - Pending queue items:",
    $linesText,
    "- Artifacts:",
    "  - docs/program/PM_DISPATCH_QUEUE.json",
    "  - docs/program/dashboard/dashboard-data.js",
    "- Needed by:",
    "  - Immediate",
    "- Response:",
    "  - Please ACK/execute assigned tasks and push evidence to message bus + daily sync."
  ) -join [Environment]::NewLine

  Add-Content -Path $BusPath -Value $entry
}

function Run-PmCycle {
  param(
    [string]$Root,
    [string]$QueuePath,
    [string]$BusPath,
    [string]$DefectPath,
    [string]$IncidentQueuePath,
    [string]$IncidentCachePath,
    [string]$TerminalsDirPath,
    [string]$PreviousSignature,
    [int]$TopN
  )

  Update-QueueAndDashboard -Root $Root
  $queue = Read-JsonSafe -Path $QueuePath
  $signature = Queue-Signature -QueueObject $queue
  $changed = $signature -ne $PreviousSignature

  if ($changed) {
    Append-DispatchPing -BusPath $BusPath -QueueObject $queue -TopN $TopN
    pnpm ops:dashboard:data | Out-Host
  }

  $patterns = @('ELIFECYCLE', 'Failed to resolve import', 'error when starting dev server', 'EPERM:', 'run failed:')
  $allIncidents = Read-TerminalIncidents -DirPath $TerminalsDirPath -Patterns $patterns
  $cache = Read-CacheSet -Path $IncidentCachePath
  if ($null -eq $cache) { $cache = [System.Collections.Generic.HashSet[string]]::new() }
  $existingQueue = Read-JsonArraySafe -Path $IncidentQueuePath
  $incidentQueue = @()
  if ($null -ne $existingQueue) {
    if ($existingQueue -is [System.Array] -or $existingQueue -is [System.Collections.IEnumerable]) {
      $incidentQueue += @($existingQueue)
    } else {
      $incidentQueue += $existingQueue
    }
  }
  $newTasks = @()
  $newIncidents = New-Object System.Collections.ArrayList
  foreach ($inc in $allIncidents) {
    $sig = "$($inc.terminal)|$($inc.line)"
    if (-not $cache.Contains($sig)) {
      [void]$cache.Add($sig)
      [void]$newIncidents.Add($inc)
      Append-Defect -DefectPath $DefectPath -IncidentSummary ($inc.line.Replace('|', '/'))
      $task = Build-IncidentTask -Terminal $inc.terminal -Line $inc.line
      $newTasks += $task
    }
  }
  if ($newTasks.Count -gt 0) {
    $incidentQueue += @($newTasks)
  }
  Save-JsonArray -Path $IncidentQueuePath -Items $incidentQueue
  Save-CacheSet -Path $IncidentCachePath -Set $cache
  Append-IncidentPing -BusPath $BusPath -NewIncidents $newIncidents -IncidentTasks $newTasks

  $summary = if ($null -ne $queue) {
    "phase=$($queue.activePhase); queue=$(@($queue.queue).Count); qaReady=$($queue.qaReady)"
  } else {
    "queue unavailable"
  }

  return [PSCustomObject]@{
    signature = $signature
    changed = $changed
    summary = $summary
  }
}

$root = Split-Path -Parent $PSScriptRoot
$queuePath = Join-Path $root "docs/program/PM_DISPATCH_QUEUE.json"
$busPath = Join-Path $root "docs/program/AGENT_MESSAGE_BUS.md"
$defectPath = Join-Path $root "docs/program/DEFECT_MASTER.md"
$incidentQueuePath = Join-Path $root "docs/program/PM_INCIDENT_QUEUE.json"
$incidentCachePath = Join-Path $root "docs/program/.pm-incident-cache.json"

Push-Location $root
try {
  $lastSignature = ""
  if ($Watch) {
    while ($true) {
      $result = Run-PmCycle -Root $root -QueuePath $queuePath -BusPath $busPath -DefectPath $defectPath -IncidentQueuePath $incidentQueuePath -IncidentCachePath $incidentCachePath -TerminalsDirPath $TerminalsDir -PreviousSignature $lastSignature -TopN $DispatchTopN
      $lastSignature = $result.signature
      Write-Host "[pm-autopilot] $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | $($result.summary) | changed=$($result.changed)" -ForegroundColor Green
      Start-Sleep -Seconds $IntervalSec
    }
  } else {
    $result = Run-PmCycle -Root $root -QueuePath $queuePath -BusPath $busPath -DefectPath $defectPath -IncidentQueuePath $incidentQueuePath -IncidentCachePath $incidentCachePath -TerminalsDirPath $TerminalsDir -PreviousSignature $lastSignature -TopN $DispatchTopN
    Write-Host "[pm-autopilot] one-shot completed | $($result.summary) | changed=$($result.changed)" -ForegroundColor Green
  }
}
finally {
  Pop-Location
}
