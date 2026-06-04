# deploy-dev-server.ps1 — push (if git) + SSH deploy on VPS

# Usage: pnpm run deploy:dev-server

# Credentials: deploy/.vps-ssh.env (copy from deploy/.vps-ssh.env.example) or env VPS_SSH_PASSWORD / VPS_SSH_KEY_PATH

# Cổng VPS: cố định trong deploy/xevn-ecosystem/vps-host-ports.defaults — .env trên server giữ DB_PASSWORD.



param(

  [string]$Message = "",

  [switch]$SkipCommit,

  [switch]$SkipPush

)



$ErrorActionPreference = "Stop"

$VPS_HOST = "root@14.225.217.232"

$HOSTKEY = "SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo"

$REMOTE_DEPLOY = @'

set -euo pipefail

REPO=/opt/xevn-ecosystem

cd "$REPO"

echo "[deploy] git pull..."

git pull origin main

if [ -d deploy/xevn-ecosystem ] && [ -f deploy/xevn-ecosystem/docker-compose.yml ]; then

  COMPOSE_DIR="$REPO/deploy/xevn-ecosystem"

elif [ -d deploy/dev-server ] && [ -f deploy/dev-server/docker-compose.yml ]; then

  COMPOSE_DIR="$REPO/deploy/dev-server"

else

  echo "[deploy] ERROR: no compose dir"

  exit 1

fi

echo "[deploy] compose: $COMPOSE_DIR"

cd "$COMPOSE_DIR"

# Không cp .env.example đè .env — giữ password/secret đã cấu hình trên server

if [ ! -f .env ] && [ -f .env.example ]; then

  cp .env.example .env

  echo "[deploy] created .env from .env.example (first time only)"

fi

if command -v node >/dev/null 2>&1; then

  node "$REPO/scripts/merge-vps-port-env.mjs" --apply-canonical || true

  node "$REPO/scripts/xevn-ecosystem-bootstrap.mjs" || true

fi

echo "[deploy] ports in .env:"

grep -E '^(PORTAL_FE|HRM_FE|XBOS_FE|HRM_BE|XBOS_BE)_PORT=' .env 2>/dev/null || true

echo "[deploy] listening before up (host):"

ss -tlnp 2>/dev/null | grep -E ':(8088|8080|5173|3001|3002)\s' || netstat -tlnp 2>/dev/null | grep -E ':(8088|8080|5173|3001|3002)\s' || true

docker compose --env-file .env up -d --build --remove-orphans

echo "[deploy] published ports:"

docker compose ps --format "table {{.Name}}\t{{.Ports}}"

for port in 8088 8080 5173 3001 3002; do

  CODE=$(curl -so /dev/null -w "%{http_code}" "http://127.0.0.1:${port}/" 2>/dev/null || echo 000)

  echo "[deploy] smoke :${port}/ -> HTTP $CODE"

done

CODE=$(curl -so /dev/null -w "%{http_code}" http://127.0.0.1:8088/command-center 2>/dev/null || echo 000)

echo "[deploy] smoke :8088/command-center -> HTTP $CODE"

docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo "[deploy] HEAD=$(git -C "$REPO" rev-parse --short HEAD)"

echo "[deploy] Done."

'@



function Write-Step { param($msg) Write-Host "[deploy] $msg" -ForegroundColor Cyan }

function Write-OK   { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }

function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }



function Import-VpsEnvFile {

  param([string]$Path)

  if (-not (Test-Path $Path)) { return }

  Get-Content $Path -Encoding UTF8 | ForEach-Object {

    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#")) { return }

    $eq = $line.IndexOf("=")

    if ($eq -lt 1) { return }

    $k = $line.Substring(0, $eq).Trim()

    $v = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")

    if ($k -eq "VPS_SSH_PASSWORD" -and -not $env:VPS_SSH_PASSWORD) { $env:VPS_SSH_PASSWORD = $v }

    if ($k -eq "VPS_SSH_KEY_PATH" -and -not $env:VPS_SSH_KEY_PATH) { $env:VPS_SSH_KEY_PATH = $v }

  }

}



$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Import-VpsEnvFile (Join-Path $repoRoot "deploy\.vps-ssh.env")



$VPS_PW = $env:VPS_SSH_PASSWORD

$VPS_KEY_PATH = $env:VPS_SSH_KEY_PATH



if (-not $VPS_PW -and -not $VPS_KEY_PATH) {

  Write-Fail @"

Chưa có SSH credential.

  copy deploy\.vps-ssh.env.example deploy\.vps-ssh.env  (điền VPS_SSH_PASSWORD)

  hoặc: `$env:VPS_SSH_PASSWORD = '...'

Rồi: pnpm run deploy:dev-server -- -SkipCommit -SkipPush

"@

  exit 1

}



Set-Location $repoRoot



if (-not $SkipCommit -and (Test-Path ".git")) {

  $changed = git status --porcelain 2>$null

  if ($changed) {

    $msg = if ($Message) { $Message } else { "chore: deploy dev server $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

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



$plink = "C:\Program Files\PuTTY\plink.exe"

if (-not (Test-Path $plink)) { $plink = "plink" }



Write-Step "Deploying on VPS ($VPS_HOST)..."

# Normalize Windows CRLF payload to LF before base64 transfer to remote bash.
$remoteDeployNormalized = ($REMOTE_DEPLOY -replace "`r`n", "`n" -replace "`r", "`n").TrimStart("`n")
$b64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($remoteDeployNormalized))

# Decode to a temp script, strip any accidental CR, syntax-check, then execute.
$remoteCmd = "tmp=`$(mktemp /tmp/xevn-deploy.XXXXXX.sh) && printf '%s' '$b64' | base64 -d | tr -d '\r' > `"$tmp`" && chmod +x `"$tmp`" && bash -n `"$tmp`" && bash `"$tmp`"; rc=`$?; rm -f `"$tmp`"; exit `$rc"



$out = if ($VPS_KEY_PATH) {

  & $plink -ssh $VPS_HOST -i $VPS_KEY_PATH -hostkey $HOSTKEY -batch $remoteCmd 2>&1

} else {

  & $plink -ssh $VPS_HOST -pw $VPS_PW -hostkey $HOSTKEY -batch $remoteCmd 2>&1

}

$out | ForEach-Object { Write-Host $_ }

if ($LASTEXITCODE -ne 0) {

  Write-Fail "Deploy failed (exit $LASTEXITCODE)"

  exit 1

}

Write-OK "Deploy done. Portal: http://14.225.217.232:8088/command-center"


