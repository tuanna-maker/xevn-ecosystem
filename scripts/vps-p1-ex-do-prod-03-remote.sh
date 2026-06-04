#!/usr/bin/env bash
# P1-EX-DO-PROD-03 — NODE_ENV production parity on VPS (run on 14.225.217.232)
set -euo pipefail
REPO=/opt/xevn-ecosystem
COMPOSE_DIR="$REPO/deploy/xevn-ecosystem"
EVID_TAG="p1-ex-do-prod-03-$(date +%Y%m%d)"
LOG="/tmp/${EVID_TAG}.log"
exec > >(tee -a "$LOG") 2>&1

echo "=== P1-EX-DO-PROD-03 remote start $(date -Is) ==="

cd "$REPO"
git fetch origin main 2>/dev/null || true
# Apply compose NODE_ENV pin if present on remote (optional pull skipped — local sed below)

for f in apps/api/hrm-api/.env apps/api/xbos-api/.env; do
  if [[ -f "$f" ]]; then
    cp -a "$f" "${f}.bak.${EVID_TAG}"
    grep -v '^NODE_ENV=' "$f" > "${f}.tmp" && mv "${f}.tmp" "$f"
    echo "[strip] removed NODE_ENV from $f"
  fi
done

cd "$COMPOSE_DIR"
cp -a .env ".env.bak.${EVID_TAG}"
if ! grep -q '^NODE_ENV=production' .env; then
  if grep -q '^NODE_ENV=' .env; then
    sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env
  else
    echo 'NODE_ENV=production' >> .env
  fi
  echo "[env] set NODE_ENV=production in deploy .env"
fi

grep -E '^(NODE_ENV|CORS_ALLOWED)' .env | sed 's/=.*SECRET.*/=***redacted***/'

echo "[compose] recreate hrm-be xbos-be"
docker compose --env-file .env up -d --force-recreate hrm-be xbos-be
sleep 40

echo "[container] NODE_ENV"
docker exec xevn-hrm-be-dev printenv NODE_ENV || true
docker exec xevn-xbos-be-dev printenv NODE_ENV || true

echo "[gate] verify-production-env"
cd "$REPO"
node scripts/verify-production-env.mjs
echo "verify_exit=$?"

BASE=https://14-225-217-232.nip.io
for path in / /command-center /api/hrm/metrics?format=prometheus /api/xbos/metrics?format=prometheus; do
  code=$(curl -sk -o /dev/null -w '%{http_code}' "${BASE}${path}" || echo 000)
  echo "https_smoke ${path} -> ${code}"
done

echo "[cors] pilot origin OPTIONS hrm metrics"
curl -sk -si -X OPTIONS "${BASE}/api/hrm/metrics?format=prometheus" \
  -H "Origin: https://14-225-217-232.nip.io" \
  -H "Access-Control-Request-Method: GET" | head -15

echo "=== done; log $LOG ==="
