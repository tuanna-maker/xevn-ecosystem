#!/usr/bin/env bash
set -euo pipefail
REPO=/opt/xevn-ecosystem
cd "$REPO"
echo "=== verify-production-env (pnpm exec) ==="
set +e
if [ -d node_modules/dotenv ]; then
  pnpm exec node scripts/verify-production-env.mjs 2>&1
  EXIT=$?
else
  echo "node_modules/dotenv missing — run inline gate"
  ENV_FILE="$REPO/deploy/xevn-ecosystem/.env"
  export NODE_ENV=production
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  FORBIDDEN_JWT='xevn-dev-jwt-secret'
  FORBIDDEN_KEY='xevn-dev-internal-key'
  FAIL=0
  for svc in hrm-api xbos-api; do
    ok=true
    if [ -z "${SERVICE_JWT_SECRET:-}" ]; then echo "ERROR: $svc SERVICE_JWT_SECRET required"; ok=false; FAIL=1; fi
    if [ "${SERVICE_JWT_SECRET:-}" = "$FORBIDDEN_JWT" ]; then echo "ERROR: $svc SERVICE_JWT_SECRET dev default"; ok=false; FAIL=1; fi
    if [ -z "${INTERNAL_API_KEY:-}" ]; then echo "WARN: $svc INTERNAL_API_KEY not set"; fi
    if [ "${INTERNAL_API_KEY:-}" = "$FORBIDDEN_KEY" ]; then echo "ERROR: $svc INTERNAL_API_KEY dev default"; ok=false; FAIL=1; fi
    if [ -z "${CORS_ALLOWED_ORIGINS:-}" ]; then echo "ERROR: $svc CORS_ALLOWED_ORIGINS required"; ok=false; FAIL=1; fi
    echo "[$svc] ok=$ok"
  done
  EXIT=$FAIL
fi
set -e
echo "verify_exit=${EXIT}"
exit "$EXIT"
