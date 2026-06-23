#!/usr/bin/env bash
set -euo pipefail
REPO_DIR=/opt/xevn-ecosystem
COMPOSE_DIR=$REPO_DIR/deploy/xevn-ecosystem
echo "[deploy] Pulling latest code..."
cd $REPO_DIR
git pull origin main
echo "[deploy] Restarting containers..."
cd $COMPOSE_DIR
if command -v node >/dev/null 2>&1; then
  node "$REPO_DIR/scripts/merge-vps-port-env.mjs" --apply-canonical || true
fi
docker compose --env-file .env up -d --build --remove-orphans

XBOS_PORT="${XBOS_BE_PORT:-28002}"
HRM_PORT="${HRM_BE_PORT:-3001}"

echo "[deploy] Waiting for hrm-api :${HRM_PORT} (up to 120s)..."
for i in $(seq 1 120); do
  CODE=$(curl -so /dev/null -w "%{http_code}" "http://127.0.0.1:${HRM_PORT}/api/hrm/" 2>/dev/null || echo 000)
  if [ "$CODE" = "200" ]; then
    echo "[deploy] HRM API UP after ${i}s"
    break
  fi
  sleep 1
done

if [ -x "$REPO_DIR/scripts/vps-post-hrm-be-mob-pilot-qual.sh" ]; then
  echo "[deploy] Mobile pilot qual seed (C-MOBJOB-01)..."
  bash "$REPO_DIR/scripts/vps-post-hrm-be-mob-pilot-qual.sh" || {
    echo "[deploy] WARN: mob-pilot-qual failed — run: bash $REPO_DIR/scripts/vps-post-hrm-be-mob-pilot-qual.sh"
  }
fi

echo "[deploy] Waiting for xbos-api login :${XBOS_PORT} (up to 120s)..."
for i in $(seq 1 120); do
  CODE=$(curl -so /dev/null -w "%{http_code}" -X POST "http://127.0.0.1:${XBOS_PORT}/api/xbos/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"ceo@xe.vn","password":"Xevn@2026"}' 2>/dev/null || echo 000)
  if [ "$CODE" = "201" ] || [ "$CODE" = "200" ]; then
    echo "[deploy] XBOS login OK after ${i}s"
    break
  fi
  sleep 1
done

echo "[deploy] Waiting for portal (up to 30s)..."
for i in $(seq 1 30); do
  CODE=$(curl -so /dev/null -w "%{http_code}" http://127.0.0.1:8088/ 2>/dev/null)
  if [ "$CODE" = "200" ]; then
    echo "[deploy] Portal UP after ${i}s"
    break
  fi
  sleep 1
done
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo "[deploy] Done."