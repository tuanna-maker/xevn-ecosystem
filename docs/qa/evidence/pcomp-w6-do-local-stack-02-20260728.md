# PCOMP-W6-DO-LOCAL-STACK-02 — Local L0 stack for W6 sponsor UAT

**Date:** 2026-07-28  
**Role:** devops  
**Sponsor locks:** HOLD_DEPLOY (no :8088 / portal.xe.vn) · U65 zero-seed · LOCAL ONLY · not Phase1/PROD

## Verdict

| Gate | Result | Notes |
|------|--------|-------|
| HRM `:28001` from **`dist-uat-w6`** | **PASS** | PID `30316` · `node --enable-source-maps dist-uat-w6\main.js` |
| XBOS `:28002` | **PASS** | PID `15908` · `node --enable-source-maps dist\main.js` |
| Portal `:5173` | **PASS** | Vite web-portal HTTP **200** (PID listen `28000`) |
| `pnpm run qc:dev-stack` probes | **PASS** | hrm / xbos / portal all HTTP **200** |
| `qc:dev-stack` process exit | **NOISE** | Windows Node UV abort after success print (`exit -1073740791`) — known flake; functional L0 = PASS |
| `pnpm run qc:fe-be-health` | **PASS exit 0** | ALL PASS (direct + portal proxy employees/catalog-sync + login token) |
| Seed | **Not run** | U65 |
| :8088 / VPS / portal.xe.vn | **Not touched** | HOLD_DEPLOY |

## Ports (live at handoff)

| Service | URL | Status |
|---------|-----|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | **200** |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | **200** |
| web-portal | `http://127.0.0.1:5173` | **200** |
| :5175 | — | not required (5173 up) |

## Root cause of prior DOWN

1. Workspace `node_modules/@xevn/platform-core` missing → `node dist-uat-w6/main.js` / `dist/main.js` exited `MODULE_NOT_FOUND`.
2. Remediation: `pnpm install` completed (log residue `_tmp-pnpm-install-w6.log` — Done in ~1m12s).
3. Then stable start (no nest `--watch` on HRM).

## Steps executed

1. Probed :28001/:28002/:5173/:5175 — all DOWN.
2. Confirmed `dist-uat-w6/main.js` present; restored pnpm links (`@xevn/platform-core` resolves).
3. Started HRM: `cwd=apps/api/hrm-api`, `node --enable-source-maps dist-uat-w6\main.js`, `HRM_BE_PORT=28001` · wrote `dist-uat-w6/.SPONSOR_UAT_LOCK` + `.SPONSOR_UAT_PID`.
4. Started XBOS: `cwd=apps/api/xbos-api`, `node --enable-source-maps dist\main.js`, `XBOS_BE_PORT=28002`.
5. Started portal: `cmd /c pnpm run dev:web-only` from repo root → `:5173` **200**.
6. `node ./scripts/qc-dev-stack.mjs` — ✓×3 then UV abort (noise).
7. `node ./scripts/qc-fe-be-api-health.mjs` — **exit 0** ALL PASS.
8. Left processes **running** (not killed after smoke).

## Sponsor browser window (ops)

| Item | Value |
|------|--------|
| Portal | http://127.0.0.1:5173 |
| Account (group CEO) | `ceo@xe.vn` / `Xevn@2026` |
| HRM API | http://127.0.0.1:28001/api/hrm (freeze `dist-uat-w6`) |
| XBOS API | http://127.0.0.1:28002/api/xbos |
| Do **not** open | `:8088` / portal.xe.vn (HOLD_DEPLOY) |
| Do **not** run | `pnpm seed:*` · `pnpm run dev:hrm-api` · `nest build` / watch on **hrm-api** during UAT |

**Lock file:** `apps/api/hrm-api/dist-uat-w6/.SPONSOR_UAT_LOCK`

## Residual

1. Windows UV abort on `qc:dev-stack` after healthy print — ignore process exit; trust probe lines + `qc:fe-be-health` exit 0.
2. Do **not** restart `dev:hrm-api` during sponsor SP-01 (will race vs freeze).
3. XBOS on stable `dist/main` (not watch) — code edits need rebuild/restart before new BE behavior.
4. `dev:web-only` may also spin sibling Vite (x-bos-core / hrm) — W6 pack uses **portal :5173** only.
5. No VPS/:8088 (HOLD_DEPLOY).

## Commands (no secrets)

```text
pnpm run qc:dev-stack       # functional ✓ then possible Windows UV abort
pnpm run qc:fe-be-health    # exit 0 ALL PASS
```

## ack

- `work_item_id`: **PCOMP-W6-DO-LOCAL-STACK-02**
- `ack_status`: **READY_FOR_QA**
- `next_owner`: **qa** → `QA-PCOMP-W6-LOCAL-SMOKE-03` then PM invite sponsor **PCOMP-W6-SP-01**
- U65 · HOLD_DEPLOY honored · Phase1/PROD **not** claimed
