# DevOps — HDSD Phase 2 stack readiness (L0)

| Field | Value |
|-------|-------|
| **work_item_id** | `DEVOPS-HDSD-P2-STACK-01` |
| **program** | `HDSD-P2-FULL-01` / `P-HDSD-P2-FULL-01` |
| **date** | 2026-07-30 21:20 +07:00 |
| **owner** | devops |
| **ack_status** | `PASS_TO_PM` |
| **U65** | No seed — stack verify only |

## Summary

| Gate | Command | Exit | Verdict |
|------|---------|------|---------|
| L0 stack | `pnpm run qc:dev-stack` | `-1073740791` (Node UV crash on Windows exit) | **PASS (functional)** — all probes HTTP 200 |
| FE↔BE health | `PORTAL_DEV_URL=http://127.0.0.1:5173 pnpm run qc:fe-be-health` | **0** | **PASS** |
| HRM standalone W2a | Started `:5175` | — | **PASS** — `/` and `/employees` HTTP 200 |

## Service URLs (live)

| Service | URL | HTTP | Notes |
|---------|-----|------|-------|
| hrm-api | http://127.0.0.1:28001/api/hrm | 200 | Nest health |
| xbos-api | http://127.0.0.1:28002/api/xbos | 200 | Nest health |
| web-portal (unified) | http://127.0.0.1:5173/ | 200 | `dev:web-only` (pre-existing terminal) |
| HRM embed proxy | http://127.0.0.1:5173/command-center/hrm/employees | 200 | W2b screenshots / UAT |
| HRM standalone (W2a) | http://127.0.0.1:5175/ | 200 | Started this wave |
| HRM standalone employees | http://127.0.0.1:5175/employees | 200 | HDSD W2a route |
| HRM embed Vite (portal `/hr` proxy) | http://127.0.0.1:8080/hr/ | 200 | Unchanged — portal iframe backend |
| x-bos-core | http://127.0.0.1:5176/ | 200 | From `dev:web-only` |

## Actions taken

1. Verified APIs + portal already up from prior `pnpm run dev:web-only` session.
2. Started **HRM standalone** for W2a (5175 was down):
   ```powershell
   cd apps/web/hrm
   pnpm exec vite --port 5175 --host --base /
   ```
   Background PID terminal `252366` — serves routes at `/employees`, … per HDSD Ch.0.
3. Re-ran L0 gates (no seed, no migrate).

## qc:dev-stack output

```
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173

HRM + XBOS healthy — có thể chấp nhận bước QC dev (chạy thêm `pnpm run qc:fe-be-health` trước UAT).
```

**Note:** On Windows, Node occasionally aborts after successful fetch with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` (exit `3221226505` / `-1073740791`). All HTTP probes passed; treat L0 as **PASS** for HDSD stack readiness.

## qc:fe-be-health output

```
INFO  portal-base  http://127.0.0.1:5173
PASS  hrm-api-health  HTTP 200
PASS  xbos-api-health  HTTP 200
PASS  web-portal  HTTP 200
PASS  portal-login  token ok
PASS  hrm-employees-direct  HTTP 200
PASS  hrm-catalog-sync-direct  HTTP 200
PASS  portal-proxy-hrm-employees  HTTP 200
PASS  portal-proxy-hrm-catalog  HTTP 200
=== Summary: ALL PASS ===
```

## Pilot account (for QA screenshots — U65 FE flow)

| Persona | Email | Password |
|---------|-------|----------|
| Tập đoàn / CC | `ceo@xe.vn` | `Xevn@2026` |

## Residual

| Item | Severity | Owner | Notes |
|------|----------|-------|-------|
| `qc:dev-stack` Windows exit crash | P3 env | devops/qa | Functional probes PASS; use `node scripts/qc-dev-stack.mjs` + grep "HRM + XBOS healthy" if pnpm exit unreliable |
| HRM `:5175` not in root `dev:web-only` | P2 doc | dev-fe/pm | Manual `vite --port 5175 --base /` required until script added; `:8080/hr/` remains embed backend |

## next_owner

PM → parallel dispatch `HDSD-P2-SCREEN-01` (dev-fe) + `QA-HDSD-FULL-W0-W4-01` (qa)

## pm_dispatch_hint

Stack L0 green for HDSD P2 — portal `:5173`, HRM standalone `:5175`, APIs `:28001`/`:28002`. No seed.
