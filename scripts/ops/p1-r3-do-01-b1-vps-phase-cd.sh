#!/usr/bin/env bash
# P1-R3-DO-01-B1 — Phase C+D on VPS (no secrets in stdout)
set -euo pipefail

REPO=/opt/xevn-ecosystem
COMPOSE_DIR="$REPO/deploy/xevn-ecosystem"
ENV="$COMPOSE_DIR/.env"
FORBIDDEN_JWT='xevn-dev-jwt-secret'
FORBIDDEN_KEY='xevn-dev-internal-key'

set_key() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "$ENV" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV"
  else
    echo "${key}=${val}" >> "$ENV"
  fi
}

needs_secret() {
  local key="$1"
  local forbidden="$2"
  local cur
  cur="$(grep "^${key}=" "$ENV" 2>/dev/null | cut -d= -f2- | tr -d '\r' || true)"
  if [ -z "$cur" ]; then return 0; fi
  if [ "$cur" = "$forbidden" ]; then return 0; fi
  return 1
}

echo "=== P1-R3-DO-01-B1 Phase C+D ==="
cd "$COMPOSE_DIR"
if [ ! -f "$ENV" ]; then
  echo "ERROR: missing $ENV"
  exit 2
fi

BAK="$ENV.bak.$(date +%Y%m%d-%H%M%S)"
cp "$ENV" "$BAK"
echo "backup=$BAK"

if needs_secret SERVICE_JWT_SECRET "$FORBIDDEN_JWT"; then
  JWT="$(openssl rand -hex 32)"
  set_key SERVICE_JWT_SECRET "$JWT"
  echo "SERVICE_JWT_SECRET=rotated"
else
  echo "SERVICE_JWT_SECRET=kept"
fi

if needs_secret INTERNAL_API_KEY "$FORBIDDEN_KEY"; then
  IKEY="$(openssl rand -hex 24)"
  set_key INTERNAL_API_KEY "$IKEY"
  echo "INTERNAL_API_KEY=rotated"
else
  echo "INTERNAL_API_KEY=kept"
fi

set_key NODE_ENV production
set_key LOG_LEVEL info
CORS_VAL="https://14-225-217-232.nip.io,http://127.0.0.1:8088,http://127.0.0.1:8080,http://localhost:8088"
set_key CORS_ALLOWED_ORIGINS "$CORS_VAL"
echo "CORS_ALLOWED_ORIGINS=set"

echo "=== env audit (keys only) ==="
grep -E '^(NODE_ENV|SERVICE_JWT_SECRET|INTERNAL_API_KEY|CORS_ALLOWED_ORIGINS|LOG_LEVEL)=' "$ENV" | sed 's/=.*/=<set>/'

cd "$REPO"
echo "=== git pull + merge ports ==="
git pull origin main 2>&1 | tail -5
node scripts/merge-vps-port-env.mjs --apply-canonical 2>&1 | tail -3

cd "$COMPOSE_DIR"
echo "=== docker compose up BE ==="
docker compose --env-file .env up -d --build --remove-orphans hrm-be xbos-be 2>&1 | tail -15
echo "waiting 40s for Nest boot..."
sleep 40

HRM=3001
XBOS=28002
echo "=== smoke ==="
for ep in "/api/hrm/" "/api/xbos/"; do
  port="$HRM"
  [ "$ep" = "/api/xbos/" ] && port="$XBOS"
  code=$(curl -so /dev/null -w "%{http_code}" "http://127.0.0.1:${port}${ep}" -H "x-request-id: p1-r3-b1-smoke" || echo 000)
  echo "GET :${port}${ep} -> ${code}"
done
for ep in "/api/hrm/metrics?format=prometheus" "/api/xbos/metrics?format=prometheus"; do
  port="$HRM"
  [[ "$ep" == *xbos* ]] && port="$XBOS"
  code=$(curl -so /dev/null -w "%{http_code}" "http://127.0.0.1:${port}${ep}" || echo 000)
  hit=$(curl -sf "http://127.0.0.1:${port}${ep}" 2>/dev/null | grep -c http_requests_total || echo 0)
  echo "metrics :${port} -> http=${code} http_requests_total_lines=${hit}"
done

echo "=== verify-production-env ==="
cd "$REPO"
set +e
node scripts/verify-production-env.mjs 2>&1
VERIFY_EXIT=$?
set -e
echo "verify_exit=${VERIFY_EXIT}"
exit "$VERIFY_EXIT"
