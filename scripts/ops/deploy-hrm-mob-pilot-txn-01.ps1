# D-HDSD-MOB-PILOT-TXN-NET-01 — sync hrm-api auth + ESS txn fixes to pilot VPS
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
Set-Location $repoRoot

$envFile = Join-Path $repoRoot 'deploy\.vps-ssh.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $p = $_ -split '=', 2
    if ($p.Count -eq 2) { Set-Item -Path "env:$($p[0].Trim())" -Value $p[1].Trim() }
  }
}

$VPS_HOST = 'root@14.225.217.232'
$VPS_PW = $env:VPS_SSH_PASSWORD
$VPS_KEY = $env:VPS_SSH_KEY_PATH
$REMOTE = '/opt/xevn-ecosystem'
$HOSTKEY = 'SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo'

$pscp = if (Test-Path 'C:\Program Files\PuTTY\pscp.exe') { 'C:\Program Files\PuTTY\pscp.exe' } else { 'pscp' }
$plink = if (Test-Path 'C:\Program Files\PuTTY\plink.exe') { 'C:\Program Files\PuTTY\plink.exe' } else { 'plink' }

if (-not $VPS_PW -and -not $VPS_KEY) {
  Write-Error 'Missing VPS_SSH_PASSWORD or VPS_SSH_KEY_PATH in deploy/.vps-ssh.env'
}

$HOSTKEY = 'SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo'

function Invoke-Pscp($local, $remote) {
  if ($VPS_KEY) {
    & $pscp -batch -hostkey $HOSTKEY -i $VPS_KEY -r $local "${VPS_HOST}:${remote}"
  } else {
    & $pscp -batch -hostkey $HOSTKEY -pw $VPS_PW -r $local "${VPS_HOST}:${remote}"
  }
  if ($LASTEXITCODE -ne 0) { throw "pscp failed: $local" }
}

Write-Host '[deploy] SCP auth + platform + main...'
Invoke-Pscp 'apps/api/hrm-api/src/auth' "$REMOTE/apps/api/hrm-api/src/"
Invoke-Pscp 'apps/api/hrm-api/src/platform/platform-runtime.ts' "$REMOTE/apps/api/hrm-api/src/platform/"
Invoke-Pscp 'apps/api/hrm-api/src/main.ts' "$REMOTE/apps/api/hrm-api/src/"
Invoke-Pscp 'apps/api/hrm-api/dist' "$REMOTE/apps/api/hrm-api/"

$remoteCmd = @"
set -eu
cd $REMOTE/deploy/xevn-ecosystem
grep -q '^HRM_PILOT_UAT_AUTH_ENABLED=' .env 2>/dev/null || echo 'HRM_PILOT_UAT_AUTH_ENABLED=true' >> .env
grep -q '^HRM_MOBILE_UAT_PASSWORD=' .env 2>/dev/null || echo 'HRM_MOBILE_UAT_PASSWORD=xevn-uat-2026' >> .env
docker exec xevn-hrm-be-dev sh -lc 'cd /app/apps/api/hrm-api && pnpm run build'
docker compose restart hrm-be hrm-be-2 hrm-be-3
sleep 8
wget -qO- --timeout=8 http://127.0.0.1:3001/api/hrm/ >/dev/null && echo HRM_HEALTH_OK
"@

Write-Host '[deploy] Remote build + restart...'
if ($VPS_KEY) {
  & $plink -ssh $VPS_HOST -hostkey $HOSTKEY -i $VPS_KEY -batch $remoteCmd
} else {
  & $plink -ssh $VPS_HOST -hostkey $HOSTKEY -pw $VPS_PW -batch $remoteCmd
}
if ($LASTEXITCODE -ne 0) { throw 'Remote deploy failed' }
Write-Host '[deploy] PASS'
