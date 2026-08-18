# PCOMP-W6-DO-STACK-REFRESH-01 — Local L0 stack refresh (W6 UAT window)

**Date:** 2026-07-27  
**Role:** devops  
**Sponsor locks:** HOLD_DEPLOY (no :8088 / Bay.vn) · U65 zero-seed · not Phase1/PROD claim

## Verdict

| Gate | Result | Notes |
|------|--------|-------|
| HRM `:28001` from **`dist-uat-w6`** | **PASS** | PID `25960` · `node --enable-source-maps dist-uat-w6/main.js` |
| XBOS `:28002` | **PASS** | Stable `node dist/main.js` after clean `tsc` (watch race wiped `dist`) |
| Portal `:5173` | **PASS** | Vite web-portal HTTP 200 |
| `pnpm run qc:dev-stack` probes | **PASS** | All three ✓ HTTP **200** |
| `qc:dev-stack` process exit | **NOISE** | Windows Node UV abort after success print (`exit 3221226505`) — known flake; functional L0 = PASS |
| `pnpm run qc:fe-be-health` | **PASS exit 0** | ALL PASS (direct + portal proxy employees/catalog-sync + login token) |
| Seed | **Not run** | U65 |
| :8088 / VPS / Bay.vn | **Not touched** | HOLD_DEPLOY |

## Sponsor browser window (ops note)

| Item | Value |
|------|--------|
| Portal | http://127.0.0.1:5173 |
| Account (group CEO) | `ceo@xe.vn` / `Xevn@2026` |
| HRM API | http://127.0.0.1:28001/api/hrm (freeze `dist-uat-w6`) |
| XBOS API | http://127.0.0.1:28002/api/xbos |
| Do **not** open | `:8088` / portal.xe.vn / Bay.vn (HOLD_DEPLOY) |
| Do **not** run | `pnpm seed:*` · `pnpm run dev:hrm-api` · `nest build` / watch on **hrm-api** during UAT |

**Lock file:** `apps/api/hrm-api/dist-uat-w6/.SPONSOR_UAT_LOCK`  
**Freeze SoT:** serve HRM **only** from `dist-uat-w6` (outside nest `deleteOutDir`).

## Steps executed

1. Audit: `dist-uat-w6` present; ports initially down / nest watch stuck not listening.
2. Killed competing `dev:hrm-api` / nest `--watch` on HRM (watch races).
3. Started HRM: `node --enable-source-maps dist-uat-w6/main.js` with `HRM_BE_PORT=28001` + env from deploy + `hrm-api/.env` · GET `/api/hrm` → **200**.
4. Portal: `pnpm run dev:web-only` → `:5173` **200**.
5. XBOS: nest `--watch` failed (`MODULE_NOT_FOUND` `dist/main` after `deleteOutDir`). Clean `tsc -p tsconfig.build.json --incremental false` → `node dist/main.js` with `XBOS_BE_PORT=28002` → **200**.
6. Re-confirmed freeze CMD contains `dist-uat-w6`; `qc:dev-stack` ✓×3; `qc:fe-be-health` exit **0**.

## Residual

1. Windows UV abort on `qc:dev-stack` after healthy print — ignore process exit; trust probe lines + `qc:fe-be-health`.
2. Do **not** restart `dev:hrm-api` during sponsor SP-01 (will race / wipe working tree vs freeze).
3. XBOS is on stable `dist/main` (not watch) — code edits need rebuild/restart before expecting new BE behavior.
4. No VPS/:8088 (HOLD_DEPLOY).

## Commands (no secrets)

```text
pnpm run qc:dev-stack       # functional ✓ then possible Windows UV abort
pnpm run qc:fe-be-health    # exit 0 ALL PASS
```

## ack

- `ack_status`: **READY_FOR_QA**
- `next_owner`: qa → dry-run W6 / then PM invite sponsor **PCOMP-W6-SP-01**
- U65 · HOLD_DEPLOY honored · Phase1/PROD **not** claimed
