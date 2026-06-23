# API restart post-scope — ENV-RESTART-POST-SCOPE-01

**Date:** 2026-05-22 (local dev stack)  
**Owner:** devops  
**Related:** UAT-MOB-ATT-SCOPE-01 (QC GO WITH CONDITIONS — fresh HRM dist required)

## Environment

| Variable | Value |
|----------|-------|
| Env file | `deploy/xevn-ecosystem/.env` (loaded via `apps/api/*/src/load-env.ts` at runtime) |
| `HRM_BE_PORT` | 28001 |
| `XBOS_BE_PORT` | 28002 |
| VPS SSH | Not used (`deploy/.vps-ssh.env` absent) |

## Commands executed

```powershell
# Audit listeners
netstat -ano | findstr ":28001 :28002"

# Build
pnpm build:platform-core
pnpm --filter hrm-api run build
pnpm --filter xbos-api run build

# Stop stale node (PIDs from netstat; non-docker only)
Stop-Process -Id 27948,27380 -Force

# Start (cwd = app package; deploy .env auto-loaded)
# HRM entry: dist/main.js
Start-Process node -ArgumentList dist/main.js -WorkingDirectory apps\api\hrm-api
# XBOS entry: dist/src/main.js (nest output path)
Start-Process node -ArgumentList dist/src/main.js -WorkingDirectory apps\api\xbos-api
```

## Process / port evidence

| Service | PID | Listen port | Entry |
|---------|-----|-------------|-------|
| hrm-api | 22616 | 28001 | `node dist/main.js` |
| xbos-api | 2856 | 28002 | `node dist/src/main.js` |

**Note:** First xbos start with `dist/main.js` failed (`MODULE_NOT_FOUND`); corrected to `dist/src/main.js`.

Boot logs: `docs/qa/evidence/hrm-api-restart-20260522.out.log`, `docs/qa/evidence/xbos-api-restart-20260522.out.log` (stderr: `*.err.log`).

## Smoke results

| Check | URL / action | HTTP | Result |
|-------|----------------|------|--------|
| HRM health | `GET http://127.0.0.1:28001/api/hrm/` | 200 | PASS |
| XBOS health | `GET http://127.0.0.1:28002/api/xbos/` | 200 | PASS |
| HRM Prometheus | `GET http://127.0.0.1:28001/api/hrm/metrics?format=prometheus` | 200 | PASS — body contains `http_requests_total` |
| Mobile login | `POST http://127.0.0.1:28001/api/hrm/auth/mobile/login` body `{"email":"uat.nv0001@xe.vn","password":"<UAT_PASSWORD>"}` | 201 | PASS — `access_token` present |

UAT account per `docs/qa/SYSTEM_INTEGRATION_UAT_SCENARIO.md` (UAT0001 → `uat.nv0001@xe.vn`). Password not recorded here; use env `UAT_PASSWORD` default `xevn-uat-2026`.

## Gate summary

| Gate | Status |
|------|--------|
| platform-core build | PASS |
| hrm-api / xbos-api build | PASS |
| Stale process cleared on 28001/28002 | PASS |
| APIs listening on deploy ports | PASS |
| Health + metrics smoke | PASS |
| Mobile login smoke | PASS |

## VPS (optional, not run)

When `deploy/.vps-ssh.env` is available: audit → `git pull` → `node scripts/merge-vps-port-env.mjs --apply-canonical` → `docker compose up -d --build hrm-be xbos-be` per `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` / `docs/ops/DEPLOY_GUIDE.md`. Map host ports from `vps-host-ports.defaults` (HRM may be 3001 on VPS, not 28001).

## Next owner

**QA** — post-restart full UAT (`pnpm test:system:uat`), mobile JWT attendance scope, `verify-tenant-isolation`.
