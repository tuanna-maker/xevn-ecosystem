# deploy-dev-server.ps1 — push (if git) + SSH deploy on VPS
# Usage: pnpm run deploy:dev-server
# Or: pwsh -File ./scripts/deploy-dev-server.ps1

param(
  [string]$Message = "",
  [switch]$SkipCommit,
  [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
$VPS_HOST = "root@14.225.217.232"
$VPS_PW = "1T4dTddMh0tbzFwBCIlu"
$HOSTKEY = "SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo"
$DEPLOY_SCRIPT = "/opt/xevn-ecosystem/deploy/dev-server/deploy.sh"

function Write-Step { param($msg) Write-Host "[deploy] $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

if (-not $SkipCommit -and (Test-Path ".git")) {
  $changed = git status --porcelain 2>$null
  if ($changed) {
    $msg = if ($Message) { $Message } else { "fix: P0 code review fixes $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    Write-Step "Committing: $msg"
    git add -A
    git commit -m $msg
  }
}

if (-not $SkipPush -and (Test-Path ".git")) {
  Write-Step "Pushing origin/main..."
  git push origin main
  Write-OK "Pushed."
}

Write-Step "Deploying on VPS..."
$out = & plink -ssh $VPS_HOST -pw $VPS_PW -hostkey $HOSTKEY -batch "bash $DEPLOY_SCRIPT" 2>&1
$out | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) {
  Write-Fail "Deploy failed (exit $LASTEXITCODE)"
  exit 1
}
Write-OK "Deploy done. Portal: http://14.225.217.232:8088/command-center"
