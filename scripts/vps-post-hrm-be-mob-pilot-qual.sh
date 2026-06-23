#!/usr/bin/env bash
# P1-PHASE1-DO-MOB-PENDING-PARITY-01 — idempotent UAT0001 mobile qual after hrm-be is healthy.
# Closes QC C-MOBJOB-01: manager pending queue must not stay 0 on pilot after deploy/recreate.
set -eu

REPO_DIR="${XEVN_REPO_DIR:-/opt/xevn-ecosystem}"
COMPOSE_ENV="${XEVN_COMPOSE_ENV:-$REPO_DIR/deploy/xevn-ecosystem/.env}"

if [ "${XEVN_SKIP_MOB_PILOT_QUAL:-0}" = "1" ]; then
  echo "[mob-pilot-qual] Skipped (XEVN_SKIP_MOB_PILOT_QUAL=1)"
  exit 0
fi

if [ ! -f "$COMPOSE_ENV" ]; then
  echo "[mob-pilot-qual] WARN: missing $COMPOSE_ENV — skip"
  exit 0
fi

set -a
# shellcheck disable=SC1090
source "$COMPOSE_ENV"
set +a

HRM_PORT="${HRM_BE_PORT:-3001}"
export HRM_API_BASE_URL="${HRM_API_BASE_URL:-http://127.0.0.1:${HRM_PORT}}"
export HRM_MOBILE_EMAIL="${HRM_MOBILE_EMAIL:-uat.nv0001@xe.vn}"
export HRM_MOBILE_PILOT_PASSWORD="${HRM_MOBILE_PILOT_PASSWORD:-xevn-uat-2026}"

cd "$REPO_DIR"

echo "[mob-pilot-qual] Seeding UAT0001 payslip + pending update + pending leave (idempotent)..."
node scripts/seed-hrm-uat-mob-pilot-qual.mjs

echo "[mob-pilot-qual] Probing manager pending>=1 on ${HRM_API_BASE_URL}..."
node scripts/tmp-p1-resid-c03-probe.mjs
echo "[mob-pilot-qual] PASS — pending manager queue ready for J-MOB-05"
