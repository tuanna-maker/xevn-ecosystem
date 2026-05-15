# deploy-dev-server.ps1 — push local changes + restart dev server in 1 command
# Usage: pnpm run deploy:dev-server
# Or: pwsh -File ./scripts/deploy-dev-server.ps1

param(
  [string]$Message = "",
  [switch]$SkipCommit,
  [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
$VPS_HOST = "root@14.225.217.232"
$VPS_DEPLOY_SCRIPT = "/opt/xevn-ecosystem/deploy/dev-server/deploy.sh"

function Write-Step { param($msg) Write-Host "[deploy] $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }

Set-Location $PSScriptRoot\..

# --- 1. Commit local changes (if any)
if (-not $SkipCommit) {
  $changed = git status --porcelain 2>$null
  if ($changed) {
    $msg = if ($Message) { $Message } else { "chore: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    Write-Step "Committing local changes: $msg"
    git add -A
    git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m $msg
  } else {
    Write-Step "No local changes to commit."
  }
}

# --- 2. Push to GitHub
if (-not $SkipPush) {
  Write-Step "Pushing to origin/main..."
  git push origin main
  Write-OK "Pushed."
}

# --- 3. SSH deploy: git pull + docker compose restart
Write-Step "Deploying to VPS $VPS_HOST ..."
plink -ssh $VPS_HOST -pw "1T4dTddMh0tbzFwBCIlu" -hostkey "SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo" -batch "bash $VPS_DEPLOY_SCRIPT"

if ($LASTEXITCODE -eq 0) {
  Write-OK "Deploy done. Portal: http://14.225.217.232:8088/command-center"
} else {
  Write-Fail "Deploy failed (exit $LASTEXITCODE). Check logs on VPS."
  exit 1
}