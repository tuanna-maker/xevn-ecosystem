# D-HRM-FE-PROXY-28001-01 — HRM FE Vite proxy default → `:28001`

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HRM-FE-PROXY-28001-01` |
| **from_role** | pm → devops |
| **date** | 2026-07-25 |
| **ack_status** | `READY_FOR_QA` |
| **lane** | execution |
| **HOLD_DEPLOY** | honored (no Phase1/PROD/:8088) |

## Context

QA-HRM-SETTINGS-MD-JT-BROWSER-01 PASS via portal `:5173/hr`. Residual P2: standalone `apps/web/hrm` `:8080` defaulted Vite proxy to dead `:3001` → settings-catalogs **500**.

## Change (delta only)

| File | Change |
|------|--------|
| `apps/web/hrm/vite.config.ts` | Default `VITE_DEV_PROXY_HRM_API` fallback `http://127.0.0.1:3001` → **`http://127.0.0.1:28001`** (aligned with portal + `HRM_BE_PORT`) |
| `apps/web/hrm/.env.example` | Document optional `VITE_DEV_PROXY_HRM_API=http://127.0.0.1:28001` |

**Not touched:** portal `apps/web/web-portal/vite.config.ts` · BE catalog lock · `apps/api/hrm-api/dist-uat-w6/**` · seed · `:8088`

## Proof (local 2026-07-25)

Restarted HRM Vite on `:8080` **without** `VITE_DEV_PROXY_HRM_API` env override so new default applies.

| Probe | Result | Verdict |
|-------|--------|---------|
| `GET http://127.0.0.1:3001/api/hrm/...` | connection fail (dead) | baseline |
| `GET http://127.0.0.1:28001/api/hrm/metrics?format=prometheus` | **200** | Nest live |
| `GET http://127.0.0.1:8080/api/hrm/metrics?format=prometheus` | **200** + `http_requests_total` | proxy → 28001 |
| `GET :8080/api/hrm/settings-catalogs` (no auth) | **401** (same as direct `:28001`) | Nest auth, not Vite 500 to :3001 |
| `GET :8080/api/hrm/settings-catalogs` + Bearer + `x-tenant-id`/`x-company-id` | **200** `HRM-SET-200` · **111710** bytes (byte-match direct `:28001`) | **PASS** |
| `GET :8080/api/hrm` + Bearer | **200** `HRM-HEALTH-200` | **PASS** |
| Portal `:5173/` | **200** · portal vite default still `:28001` | no regression |
| `apps/api/hrm-api/dist-uat-w6/main.js` | exists; process still `dist-uat-w6\main.js` | W6 freeze intact |

Auth note: Bearer minted with local `SERVICE_JWT_SECRET` from `apps/api/hrm-api/.env` (value redacted; length 26). Token not logged.

## Residual

- Optional light QA: browser smoke Job Titles / JD picker on direct `:8080/hr/...` (portal path already 🟢).
- XBOS `:28002` was down during this wave (`dist/main` missing for `nest start --watch`); **not** required for this proxy fix. Portal login path for QA may need `dev:xbos-api` if using UI login on `:5173`.

## Handoff

- **next_owner:** qa
- **ack_status:** `READY_FOR_QA`
- **next_dispatch_prompt:** Light smoke on `http://127.0.0.1:8080/hr/` — open Cài đặt danh mục / Job Titles (JD picker) → Network `GET /api/hrm/settings-catalogs` **200** (not 500). U65 zero-seed · HOLD_DEPLOY · not `:8088`. Close residual P2 from QA-HRM-SETTINGS-MD-JT-BROWSER-01. Evidence: `docs/qa/evidence/qa-hrm-fe-proxy-28001-smoke-01-20260725.md` (optional append to JT close-out).
