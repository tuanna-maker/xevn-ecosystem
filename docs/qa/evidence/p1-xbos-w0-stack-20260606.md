# P1-XBOS-W0-STACK — Wave W0 local stack health (U32)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W0-STACK` |
| **lane** | QA — L0 stack + FE↔BE health |
| **environment** | Local workstation (U32), Windows, repo root |
| **date** | 2026-06-06 |
| **account (fe-be-health login)** | `ceo@xe.vn` / `Xevn@2026` |

## Commands executed

```powershell
# 1) Initial (cold stack)
pnpm run qc:dev-stack

# Remediation (all APIs down)
pnpm run dev:hrm-api          # background → :28001
pnpm run dev:web-only         # background → :5173
# xbos-api: dev:xbos-api watch crashed (dist/main missing) → clean build + node dist/main.js
cd apps/api/xbos-api; npx nest build; node dist/main.js   # background → :28002

# 2) Re-run gates (warm stack)
pnpm run qc:dev-stack
pnpm run qc:fe-be-health

# 3) Build artifact check (clean incremental cache)
Remove-Item -Recurse -Force apps/api/xbos-api/dist, apps/api/xbos-api/*.tsbuildinfo -ErrorAction SilentlyContinue
pnpm --filter xbos-api run build
Test-Path apps/api/xbos-api/dist/main.js
```

## Exit codes

| Step | Command | Exit code | Verdict |
|------|---------|-----------|---------|
| 1a | `pnpm run qc:dev-stack` (cold) | **1** | FAIL — hrm/xbos/portal fetch failed |
| 1b | Remediation — start stack | — | hrm-api + portal up; xbos via `nest build` + `node dist/main.js` |
| 1c | `pnpm run qc:dev-stack` (warm) | **0** | PASS |
| 2 | `pnpm run qc:fe-be-health` | **0** | PASS — ALL PASS (8/8 probes) |
| 3 | `pnpm --filter xbos-api run build` (after clean cache) | **0** | PASS — `dist/main.js` exists |

## Ports / HTTP status (warm stack)

| Service | URL | Status |
|---------|-----|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | **200** |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | **200** |
| web-portal | `http://127.0.0.1:5173` | **200** |

### qc:fe-be-health probes (all PASS)

- `hrm-api-health` — 200
- `xbos-api-health` — 200
- `web-portal` — 200
- `portal-login` — token ok
- `hrm-employees-direct` — 200 (`company_id=main`)
- `hrm-catalog-sync-direct` — 200
- `portal-proxy-hrm-employees` — 200
- `portal-proxy-hrm-catalog` — 200

## Build artifact — `apps/api/xbos-api/dist/main.js`

| Check | Result |
|-------|--------|
| After clean `pnpm --filter xbos-api run build` | **EXISTS** |
| Size | **1647 bytes** |
| Path | `apps/api/xbos-api/dist/main.js` |

**Note:** First `pnpm --filter xbos-api run build` attempts returned exit 0 but **no** `dist/main.js` due to stale TypeScript incremental cache (`*.tsbuildinfo`). `dev:xbos-api` (`nest start --watch`) then crashed with `MODULE_NOT_FOUND …/dist/main`. Clean `dist` + `*.tsbuildinfo` before build resolves emit. Operational workaround used in-session: `cd apps/api/xbos-api && npx nest build && node dist/main.js`.

## completion_report

**Closed:** W0 local L0 (`qc:dev-stack` exit 0) and FE↔BE health (`qc:fe-be-health` exit 0) on `:28001` / `:28002` / `:5173` after stack startup. `dist/main.js` verified after clean build.

**Residual (non-blocking for W0):**

- Cold workstation requires explicit `dev:hrm-api` + xbos start ( `pnpm dev` does not include hrm-api).
- `dev:xbos-api` unreliable if incremental cache stale — recommend `Remove-Item dist, *.tsbuildinfo` then `pnpm --filter xbos-api run build` before watch/prod start.
- No L1/L2/L2.5 in this work item scope (stack health only).

## Handoff

| Field | Value |
|-------|-------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/p1-xbos-w0-stack-20260606.md` |
| **next_owner** | `pm` |

### next_dispatch_prompt

```
PM — intake P1-XBOS-W0-STACK QA PASS_TO_PM (2026-06-06).

W0 local stack L0 + FE↔BE health PASS after remediation:
- qc:dev-stack exit 0 (hrm :28001, xbos :28002, portal :5173)
- qc:fe-be-health exit 0 (8/8 probes, portal login + HRM proxy OK)
- apps/api/xbos-api/dist/main.js exists after clean pnpm build (1647 B)

Residual for DevOps/backlog (not W0 blockers): xbos-api watch fails when TS incremental cache stale — document clean-build step in LOCAL_DEV_STACK_L0.md or fix nest watch emit.

Evidence: docs/qa/evidence/p1-xbos-w0-stack-20260606.md

If next wave is XBOS feature/UAT: dispatch QA with explicit J-* from PROGRAM_JOURNEY_MAP.md after Dev READY_FOR_QA; do not skip L2.5 on CC routes.
```
