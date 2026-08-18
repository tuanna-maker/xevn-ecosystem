# D-HRM-SETTINGS-MD-L0-RESTORE-01 — local hrm-api :28001 restore

**Date:** 2026-07-25  
**Role:** devops  
**Scope:** local L0 only (1B) — **HOLD_DEPLOY** · no `:8088` · no seed · no Phase1/PROD claim  
**work_item_id:** `D-HRM-SETTINGS-MD-L0-RESTORE-01`

## Mission

Restore `hrm-api` listening on **:28001** so Settings leave/dept live U65 QA can run.

## Root cause

| Layer | Finding |
|-------|---------|
| Process | `hrm-api` was **down** while `xbos-api :28002` + portal `:5173` were already up |
| Compile | Not a TypeScript blocker — `nest build` / watch reported **0 errors**; `dist/main.js` builds clean |
| Boot fail (wrong cwd) | Running `node dist/main.js` from **repo root** → `load-env.ts` resolves deploy `.env` incorrectly → falls back to `127.0.0.1:5432` → **ECONNREFUSED** (Postgres not local; SoT is `DB_HOST`/`DB_PORT` in `deploy/xevn-ecosystem/.env`) |
| Race | Concurrent `pnpm run dev:hrm-api` / `start:dev` / `nest build` (`deleteOutDir: true`) from parallel work items wiped `dist/` mid-start |
| Stabilize | Exclusive: one `nest build`, then **single** `node --enable-source-maps dist/main.js` with **cwd = `apps/api/hrm-api`** and `HRM_BE_PORT=28001` |

## Steps executed

1. `pnpm run qc:dev-stack` — FAIL (`hrm-api` fetch failed; xbos+portal OK).
2. Attempted `pnpm run dev:hrm-api` — compile OK then crash/race with concurrent watches.
3. Confirmed deploy env: `HRM_BE_PORT=28001`, `DB_HOST=113.20.107.184`, `DB_PORT=6432` (password redacted).
4. Env probe (cwd=`apps/api/hrm-api`): `DB 113.20.107.184 6432 HRM_BE 28001`.
5. Freed port races; rebuilt; started detached node on `:28001` (pid **36348**).
6. Re-verified health + stack probes.

## Gate results

| Check | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** `HRM-HEALTH-200` / `status: ok` |
| `GET http://127.0.0.1:28002/api/xbos` | **200** |
| Portal optional `:5173` | **200** |
| `pnpm run qc:dev-stack` / `node ./scripts/qc-dev-stack.mjs` | All three probes **✓ HTTP 200**; process then hits known Windows Node UV assertion (`UV_HANDLE_CLOSING`) so shell exit ≠ 0 — **substantive L0 PASS** |

### Sample health body (hrm)

```json
{"success":true,"code":"HRM-HEALTH-200","message":"HRM service is healthy","data":{"service":"hrm-api","status":"ok"}}
```

Listener: `OwningProcess=36348` on `::28001`.

## Residual / ops notes

- Prefer **one** hrm-api owner locally; avoid parallel `nest start --watch` + `nest build` on the same package.
- Do **not** start `node dist/main.js` from monorepo root — cwd must be `apps/api/hrm-api` for `load-env`.
- `qc:dev-stack` exit code may be polluted by Node Windows UV crash after printing success — trust probe lines.
- **HOLD_DEPLOY** — no VPS / `:8088` / seed.

## Handoff

- **next_owner:** `qa`
- **next work_item:** `QA-HRM-SETTINGS-MD-FE-LIVE-01`
- **ack_status:** `READY_FOR_QA`
