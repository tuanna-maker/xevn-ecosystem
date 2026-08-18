# P1-L0-STACK-HEALTH-RESUME-01 — Local L0 stack health

**Date:** 2026-07-19  
**Role:** devops  
**Sponsor:** RESUME — bring local/dev stack healthy for FE/Mobile/QA  
**U65:** no seed used

## Ports / processes

| Service | Port / URL | Start command | Status |
|---------|------------|---------------|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | `pnpm run dev:hrm-api` | LISTENING (Nest started) |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | `pnpm run dev:xbos-api` | LISTENING (Nest started) |
| web-portal | `http://127.0.0.1:5173/` | `pnpm run dev:web-only` | Vite ready |
| hrm FE (embed) | `http://127.0.0.1:8080/hr/` | (via `dev:web-only`) | Vite ready |
| x-bos-core | `http://127.0.0.1:5176/` | (via `dev:web-only`) | Vite ready |
| local docker `xevn-pg` | `54329→5432` | `docker start xevn-pg` | Up (APIs use remote `DB_HOST:6432` from deploy `.env`) |

**Note:** Broken compose restart loop (`xevn-hrm-api-dev`, `xevn-xbos-api-dev`, …) stopped — containers missing `@nestjs/cli` in bind-mount (`MODULE_NOT_FOUND`). Local Nest processes used instead for L0.

## Gate results

### 1) Initial `pnpm run qc:dev-stack` (before resume)

| Check | Result |
|-------|--------|
| hrm-api | FAIL — fetch failed `:28001` |
| xbos-api | FAIL — fetch failed `:28002` |
| web-portal | FAIL — fetch failed `:5173` |
| **exit** | **1** |

### 2) After start — `node ./scripts/qc-dev-stack.mjs`

| Check | Result |
|-------|--------|
| hrm-api | PASS HTTP 200 `http://127.0.0.1:28001/api/hrm` |
| xbos-api | PASS HTTP 200 `http://127.0.0.1:28002/api/xbos` |
| web-portal (optional) | PASS HTTP 200 `http://127.0.0.1:5173` |
| **exit** | **0** |

### 3) `node ./scripts/qc-fe-be-api-health.mjs` (project SoT for FE↔BE)

| Check | Result |
|-------|--------|
| portal-base | `http://127.0.0.1:5173` |
| hrm-api-health | PASS 200 |
| xbos-api-health | PASS 200 |
| web-portal | PASS 200 |
| portal-login | PASS token ok |
| hrm-employees-direct | PASS 200 |
| hrm-catalog-sync-direct | PASS 200 |
| portal-proxy-hrm-employees | PASS 200 |
| portal-proxy-hrm-catalog | PASS 200 |
| **Summary** | **ALL PASS** |
| **exit** | **0** |

## Residual / ops notes

- Compose bind-mount dev containers remain broken until `pnpm install` / nest CLI available in container — do **not** rely on `docker compose` local API for L0 until fixed.
- First `pnpm run qc:dev-stack` after APIs-up hit a Windows libuv assert crash after printing healthy lines; re-run via `node ./scripts/qc-dev-stack.mjs` exited **0** cleanly.
- No Phase1/PROD claim. L0 only — QA still owns L2.5 J-* journeys.

## Verdict

**PASS_TO_PM** — local L0 + FE↔BE health green; stack ready for FE/Mobile/QA work.
