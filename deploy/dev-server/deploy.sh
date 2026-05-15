#!/usr/bin/env bash
set -euo pipefail
REPO_DIR=/opt/xevn-ecosystem
COMPOSE_DIR=$REPO_DIR/deploy/dev-server
echo "[deploy] Pulling latest code..."
cd $REPO_DIR
git pull origin main
echo "[deploy] Restarting containers..."
cd $COMPOSE_DIR
docker compose up -d --remove-orphans
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