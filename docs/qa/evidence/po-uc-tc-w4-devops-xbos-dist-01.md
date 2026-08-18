# PO-UC-TC-W4-DEVOPS-XBOS-DIST-01 — Restore xbos-api dist/main (L0)

| Field | Value |
|-------|--------|
| work_item_id | `PO-UC-TC-W4-DEVOPS-XBOS-DIST-01` |
| from_role | pm → devops |
| date | 2026-08-04 |
| ack_status | **READY_FOR_QA** |
| u65_zero_seed | true (no seed) |
| scope | Local L0 only — **no** VPS/prod deploy |

## Symptom (QA W4-E4)

- `nest start --watch` / `dev:xbos-api`: `Cannot find module …/apps/api/xbos-api/dist/main`
- Portal login proxy → 500 when XBOS down
- Blocked: HRM-CI-01 mutate retest

## Root cause

1. `apps/api/xbos-api/dist/` missing while `tsconfig.build.tsbuildinfo` still present (incremental “0 errors” without emit).
2. Multiple concurrent `nest start --watch` on xbos-api with `nest-cli.json` `deleteOutDir: true` → race deletes `dist` after compile.
3. Prefer durable start: **one** clean `nest build` then `node dist/main.js` (avoid stacking watchers).

## Actions executed

1. Stopped competing xbos nest/pnpm watchers (kept restore path for HRM).
2. Removed stale `apps/api/xbos-api/tsconfig.build.tsbuildinfo`.
3. `pnpm exec nest build` in `apps/api/xbos-api` → `dist/main.js` present (~99 JS files under `dist/`).
4. Ensured listeners:
   - xbos-api `node …/dist/main.js` on **:28002** (PID observed)
   - hrm-api `pnpm run dev:hrm-api` → Nest up on **:28001**
   - web-portal already on **:5173** (5175/8088 not required for this L0)
5. No seed; no prod deploy.

## Gate results

| Check | Result |
|-------|--------|
| `GET http://127.0.0.1:28002/api/xbos` | **200** |
| `GET http://127.0.0.1:28001/api/hrm` | **200** |
| `GET http://127.0.0.1:5173/` | **200** |
| `GET http://127.0.0.1:5173/api/xbos` (proxy) | **200** |
| `POST http://127.0.0.1:28002/api/xbos/auth/login` ceo@xe.vn | **201** `XBOS-AUTH-200` + token |
| `POST http://127.0.0.1:5173/api/xbos/auth/login` (proxy) | **201** (not 500) |
| `dist/main.js` present | **True** |
| `pnpm run qc:dev-stack` | Prints ✓ hrm + ✓ xbos + ✓ portal 5173. Windows Node may exit with UV assertion noise (`qc-dev-stack-windows-uv-exit-noise`) after PASS print — treat printed ✓ as L0 PASS. |

## Residual / notes for QA

- Portal UAT URL for this machine: **http://127.0.0.1:5173** (not :5175 / :8088).
- Do **not** start a second `pnpm run dev:xbos-api` while `node dist/main.js` is already bound — will race `deleteOutDir`.
- No UAT/PROD claim from this work item.

## Handoff

- **next_owner:** qa
- **next work_item:** `PO-UC-TC-W4-QA-E4-CI01-R3`
- **ack_status:** READY_FOR_QA
