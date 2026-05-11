param(
  [string]$SourceRoot = "C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects",
  [string]$KbRoot = "C:\Users\ADMIN\.cursor\knowledge-base",
  [int]$TopFiles = 12
)

$ErrorActionPreference = "Stop"

function Append-Section {
  param(
    [string]$Path,
    [string]$Title,
    [string[]]$Lines
  )
  $body = @("")
  $body += "## $Title"
  $body += $Lines
  Add-Content -Path $Path -Value ($body -join [Environment]::NewLine)
}

if (-not (Test-Path $KbRoot)) {
  New-Item -ItemType Directory -Path $KbRoot -Force | Out-Null
}

$sharedPath = Join-Path $KbRoot "shared-lessons.md"
$pmPath = Join-Path $KbRoot "pm.md"
$saPath = Join-Path $KbRoot "sa.md"
$baProcessPath = Join-Path $KbRoot "ba-process.md"
$baDataPath = Join-Path $KbRoot "ba-data.md"
$tmPath = Join-Path $KbRoot "technical-manager.md"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

$recentFiles = @()
if (Test-Path $SourceRoot) {
  $recentFiles = Get-ChildItem -Path $SourceRoot -File -Recurse -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First $TopFiles
}

$fileLines = @()
foreach ($f in $recentFiles) {
  $fileLines += "- $($f.FullName)"
}
if ($fileLines.Count -eq 0) {
  $fileLines = @("- No files discovered in source root for this cycle.")
}

Append-Section -Path $sharedPath -Title "$timestamp | Continuous sync snapshot" -Lines (@("- Source root: $SourceRoot", "- Recent files:") + $fileLines)
Append-Section -Path $pmPath -Title "$timestamp | PM sync" -Lines (@("- Delivery pulse updated from project corpus.", "- Candidate impacts for roadmap/reprioritization logged in shared memory."))
Append-Section -Path $saPath -Title "$timestamp | SA sync" -Lines (@("- Architecture context refreshed from recent project artifacts.", "- Re-evaluate boundary and dependency drift if high-change files detected."))
Append-Section -Path $baProcessPath -Title "$timestamp | BA-Process sync" -Lines (@("- Process/use-case context refreshed from latest artifacts.", "- Validate acceptance paths for newly touched modules."))
Append-Section -Path $baDataPath -Title "$timestamp | BA-Data sync" -Lines (@("- Data/validation/traceability context refreshed.", "- Re-check contract consistency for changed files."))
Append-Section -Path $tmPath -Title "$timestamp | Technical Manager sync" -Lines (@("- Tech governance baseline refreshed from latest project changes.", "- Re-check coding/infrastructure/security implications for high-change areas."))

Write-Output ("KB_UPDATED " + $timestamp)
