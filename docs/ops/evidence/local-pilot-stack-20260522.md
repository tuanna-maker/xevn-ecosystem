# Local pilot stack — evidence (LOCAL-PILOT-STACK-01)

**Date:** 2026-05-22  
**Owner:** DevOps  
**Env source:** `deploy/xevn-ecosystem/.env` (DB_HOST, HRM_BE_PORT=28001, XBOS_BE_PORT=28002)  
**ack_status:** `READY_FOR_QA`

## Scope

Runnable local pilot for PM/QA without user terminal action:

| Service | Port | Role |
|---------|------|------|
| hrm-api | 28001 | HRM Nest API |
| xbos-api | 28002 | XBOS Nest API |
| web-portal (Vite dev) | 5175 | Portal + proxy `/api/xbos`, `/api/hrm` |

VPS SSH skipped per PM coaching.

## Actions executed

1. **Port audit** — 28001/28002/5175 listening; health endpoints reachable.
2. **Portal env** — `apps/web/web-portal/.env.local` updated: `VITE_REQUIRE_LOGIN=true`, `VITE_DEV_PROXY_XBOS_API=http://127.0.0.1:28002`, `VITE_DEV_USER_ID=ceo@xe.vn`. Vite auto-restarted on `.env.local` change.
3. **xbos-api refresh** — Stale process on 28002 returned `expiresInSec=43200` (12h build). `pnpm run build` in `apps/api/xbos-api`, killed listener PID, started `node dist/src/main.js` with deploy `.env` loaded (`start:prod` expects `dist/main` — entry is `dist/src/main.js` on current Nest outDir).
4. **hrm-api** — Existing `start:prod` on 28001 left running (health 200); no restart required.
5. **web-portal** — Already running via `pnpm dev:web-only` (turbo); HTTP 200 on `:5175`.
6. **Seed** — `ceo@xe.vn` membership present; `group-member-units` returned 4 members without `pnpm seed:tenant-ceos`.
7. **qc-dev-stack** — `node scripts/qc-dev-stack.mjs` PASS (xbos + portal).

## Gate table

| Gate | Target | Result |
|------|--------|--------|
| HRM `/api/hrm/` | HTTP 200 | **PASS** |
| XBOS `/api/xbos/` | HTTP 200 | **PASS** |
| Portal `/` | HTTP 200 | **PASS** |
| Login `POST /api/xbos/auth/login` (`ceo@xe.vn` / dev password) | `expiresInSec` = **86400** | **PASS** (after xbos rebuild) |
| `GET /api/xbos/tenant-scope/group-member-units?tenantId=xevn&companyId=holding` | HTTP 200, members ≥ 1 | **PASS** (4 members) |
| `VITE_REQUIRE_LOGIN` in `.env.local` | `true` | **PASS** |
| DB / seed | CEO membership | **PASS** (no seed run) |

## Smoke commands (redacted secrets)

```powershell
# Health
Invoke-WebRequest http://127.0.0.1:28001/api/hrm/ -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:28002/api/xbos/ -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:5175/ -UseBasicParsing

# Login + group units (dev password per auth.service.ts DEV_PASSWORD)
$login = Invoke-RestMethod -Uri http://127.0.0.1:28002/api/xbos/auth/login -Method POST `
  -Body '{"email":"ceo@xe.vn","password":"<DEV_PASSWORD>"}' -ContentType application/json
# expiresInSec: 86400
$gm = Invoke-RestMethod -Uri "http://127.0.0.1:28002/api/xbos/tenant-scope/group-member-units?tenantId=xevn&companyId=holding" `
  -Headers @{ Authorization = "Bearer $($login.data.accessToken)" }
```

## Notes for QA

- Portal login: `ceo@xe.vn` / `Xevn@2026` (XBOS dev auth).
- Command Center expects JWT when `VITE_REQUIRE_LOGIN=true`.
- If `expiresInSec` regresses to 43200, restart xbos-api from fresh `pnpm run build` + `node dist/src/main.js`.
- HRM mobile pilot uses separate HRM auth (`/api/hrm/auth/mobile/login`); not in this smoke scope.

## Handoff

- **Next:** QA — portal login UAT, Command Center `group-member-units` via proxy `http://localhost:5175/api/xbos/...`, token TTL UI (`authSession` / `expiresInSec`).
- **Blockers:** None.
