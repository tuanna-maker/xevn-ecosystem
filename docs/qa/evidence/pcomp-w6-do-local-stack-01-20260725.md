# PCOMP-W6-DO-LOCAL-STACK-01 — Local L0 stack for W6 UAT

**Date:** 2026-07-25  
**Role:** devops  
**Sponsor lock:** 1B local only · 3A UAT soon · 4C no portal.xe.vn · 5A no Phase1/PROD · 2B no theme push · U65 zero-seed · **HOLD_DEPLOY** (no :8088 / VPS theme)

## Verdict

| Gate | Result | Notes |
|------|--------|-------|
| `qc:dev-stack` probes | **PASS** | hrm :28001 / xbos :28002 / portal :5173 all HTTP **200** |
| `qc:dev-stack` process exit | **NOISE** | After printing healthy, Node on Windows aborts: `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` → exit `3221226505` / `-1073740791`. Functional L0 = PASS (all ✓ lines printed). |
| `qc:fe-be-health` | **PASS exit 0** | ALL PASS (direct + portal proxy employees/catalog-sync + login token) |
| Seed | **Not run** | U65 |
| :8088 / VPS / portal.xe.vn | **Not touched** | HOLD_DEPLOY |

## Ports (live)

| Service | URL | Status |
|---------|-----|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | 200 |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | 200 |
| web-portal | `http://127.0.0.1:5173` | 200 |
| :5175 | — | not required (5173 up) |

## Steps executed

1. Initial `qc:dev-stack`: **hrm-api down** (xbos+portal OK).
2. Concurrent `dev:hrm-api` watch races → `MODULE_NOT_FOUND` `./spreadsheet/spreadsheet.module` (stale/partial `dist` under file churn).
3. Confirmed **`tsc --noEmit -p tsconfig.build.json` exit 0** — COMPILE TS blocker from earlier Settings wave **cleared** for boot (not blocking L0).
4. Clean `nest build` in `apps/api/hrm-api` (dist includes `spreadsheet.module.js`).
5. Stabilized runtime: `node dist/main.js` with `HRM_BE_PORT=28001` (watch mode unstable amid parallel agent edits). Process listening PID confirmed; GET `/api/hrm` → **200**.
6. Re-ran gates from repo root — probes PASS; `qc:fe-be-health` **exit 0**.

## COMPILE / Settings BE coordination

| Work item | Status vs L0 |
|-----------|----------------|
| `D-HRM-SETTINGS-MD-COMPILE-BE-01` | Build/tsc green enough for Nest boot; Settings master-data **business** residual still QA/BE ownership — **does not block** L0 health. |
| Watch restart under concurrent edits | Prefer `nest build` + `node dist/main` (or single watch) for sponsor UAT window. |

## Residual

1. **Windows Node UV abort** after `qc:dev-stack` success message — tooling flake; do not treat as API down. Prefer `qc:fe-be-health` exit 0 as hard L0+proxy proof.
2. **hrm-api** may be on `node dist/main` (non-watch) — code edits need rebuild/restart before QA expects new BE behavior.
3. No VPS/:8088 (HOLD_DEPLOY).

## Commands (no secrets)

```text
pnpm run qc:dev-stack          # functional ✓ then Windows UV abort possible
pnpm run qc:fe-be-health       # exit 0 ALL PASS
```

## ack

- `ack_status`: **READY_FOR_QA**
- `next_owner`: qa (browser W6 UAT / UF matrix on local :5173) → pm
- U65 · HOLD_DEPLOY honored
