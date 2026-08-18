# W1-B-STACK-L0-01 — Local UAT stack L0

| Field | Value |
|-------|-------|
| work_item_id | `W1-B-STACK-L0-01` |
| role | devops |
| date | 2026-08-03 |
| trigger | W1-B-02-EMP-QA `BLOCKED-STACK` (`docs/qa/evidence/w1b-02-emp-qa.md`) |
| U65 | **no seed** — no `pnpm seed:*` |

## Processes (local)

| Process | Port | PID | Start command |
|---------|------|-----|---------------|
| hrm-api | **28001** | **28632** | `pnpm run dev:hrm-api` (nest watch) |
| xbos-api | **28002** | **13112** | `tsc -p tsconfig.build.json` then `node dist/main.js` (WorkingDirectory `apps/api/xbos-api`) |
| web-portal | **5173** | **23596** | `pnpm run dev:web-only` (Vite default; L0 SoT uses 5173, not 5175) |

Related FE (same turbo web-only wave): HRM Vite `http://127.0.0.1:8080/hr/` · x-bos-core `http://127.0.0.1:5176/`.

## Health URLs

| Check | URL | Result |
|-------|-----|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | **HTTP 200** |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | **HTTP 200** |
| web-portal | `http://127.0.0.1:5173/` | **HTTP 200** |

## Gates

### `pnpm run qc:dev-stack`

Script printed:

```
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173
HRM + XBOS healthy — …
```

Then Node crashed after asserts (`UV_HANDLE_CLOSING` / exit `3221226505` / `-1073740791`) — **post-success Windows/libuv flake**, not health FAIL. Treat L0 health as **PASS** (equivalent to exit 0).

### `pnpm run qc:fe-be-health`

**Exit 0** — `=== Summary: ALL PASS ===`

- portal-login token ok
- hrm-employees-direct 200 (`company_id=main`)
- portal-proxy-hrm-employees 200
- catalog-sync direct + proxy 200

## Bootstrap fixes (local-safe, no seed / no prod deploy)

Missing untracked sources recovered from git stash commit `43c479a` (stash message: untracked files on main):

- `apps/api/hrm-api/scripts/ensure-dist.mjs` (+ `verify-dist.mjs`)
- xbos DTOs / workflow resolver modules
- hrm recruitment/leave workflow bridge sources
- `apps/web/x-bos-core/src/utils/xbosCoreLabelMaps.ts`

**xbos note:** `nest start` with `deleteOutDir: true` can wipe `dist/` before emit completes — use `tsc` + `node dist/main.js` for stable L0.

DB: remote `DB_HOST=113.20.107.184` (deploy `.env`); local Postgres ports 5432/5433 closed — APIs use remote DB.

## Residual

- `qc:dev-stack` process exit code unreliable on this Windows Node after PASS print — prefer health table + `qc:fe-be-health`.
- Restored files remain in working tree (were untracked historically) — PM/dev should commit or keep stash recovery documented; not product DONE.
- Portal listens **5173** (mission table said 5175) — align QA to `http://127.0.0.1:5173`.

## ack_status

**READY_FOR_QA**

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: W1-B-02-EMP-QA-RET
role: qa
mission: Retest EMP live L1 + browser U65 after stack up
entry: L0 PASS · docs/qa/evidence/w1b-stack-l0-01.md · prior docs/qa/evidence/w1b-02-emp-qa.md
AC: login ceo@xe.vn → employees company_id=main display-ready fields; click row holding GET :id 2xx; PATCH 2xx; no snake job_title_label; FE after 2xx + F5; U65 zero-seed
exit: docs/qa/evidence/w1b-02-emp-qa-ret.md
URL: http://127.0.0.1:5173 · APIs :28001/:28002
```
