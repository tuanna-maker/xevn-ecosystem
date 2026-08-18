# DevOps — Local dev stack restart (L0)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-OPS-DEV-STACK-RESTART-01` |
| **parent** | `D-OPS-HRM-API-RESTART-01` / residual `R-HRM-API-01` |
| **date** | 2026-07-30 22:05 +07:00 |
| **owner** | devops |
| **ack_status** | `PASS_TO_PM` |
| **U65** | No seed — stack verify + restart only |

## Summary

| Gate | Command | Exit | Verdict |
|------|---------|------|---------|
| L0 stack | `node ./scripts/qc-dev-stack.mjs` | `-1073740791` (Windows UV crash after success) | **PASS (functional)** — hrm + xbos + portal HTTP 200 |
| FE↔BE health | `PORTAL_DEV_URL=http://127.0.0.1:5173 node ./scripts/qc-fe-be-api-health.mjs` | **0** | **PASS** — ALL 8 checks |
| Portal login | `GET http://127.0.0.1:5173/login` | — | **200** |

## Service state (post-restart)

| Service | URL | HTTP | Process / entry |
|---------|-----|------|-----------------|
| hrm-api | http://127.0.0.1:28001/api/hrm | 200 | `node --enable-source-maps dist-uat-w6/main.js` · `HRM_BE_PORT=28001` |
| xbos-api | http://127.0.0.1:28002/api/xbos | 200 | `node dist/main.js` |
| web-portal | http://127.0.0.1:5173/login | 200 | Vite (`dev:web-only` session, pre-existing) |

## Actions taken

1. **Audit** — Found stack partially up; HRM was on `dist-uat-w6/main.js` (PID 22772). Fresh `pnpm --filter hrm-api run build` + `build:clean` produced incomplete `dist/` (`MODULE_NOT_FOUND` on `start:prod`).
2. **HRM restart (R-HRM-API-01)** — Killed stale `:28001` listener; started stable serve:
   ```powershell
   $env:HRM_BE_PORT='28001'; $env:NODE_ENV='development'
   Start-Process node -ArgumentList '--enable-source-maps','dist-uat-w6/main.js' -WorkingDirectory apps/api/hrm-api -WindowStyle Hidden
   ```
   Health 200 within ~8s. **Did not** use `nest start --watch` (known `platform-runtime` / watch crash).
3. **XBOS / portal** — Left running (`node dist/main.js` :28002; Vite :5173). No `dev:web-only` restart required — portal already serving 200.
4. **Gates** — Re-ran `qc-dev-stack.mjs` + `qc-fe-be-api-health.mjs` with `PORTAL_DEV_URL=5173`.

## qc:dev-stack output

```
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173

HRM + XBOS healthy — có thể chấp nhận bước QC dev (chạy thêm `pnpm run qc:fe-be-health` trước UAT).
```

**Windows note:** Node v24 aborts after successful fetch with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` → exit `3221226505` / `-1073740791`. Treat as **PASS** when all three probes show ✓ (same as `devops-hdsd-p2-stack-20260730.md`).

## qc:fe-be-health output

```
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

## Residual

| ID | Severity | Owner | Notes |
|------|----------|-------|-------|
| R-HRM-BUILD-01 | P1 | dev-be | `nest build` → `dist/main.js` incomplete (`spreadsheet-template.service`, `http-exception.filter` missing at runtime); **workaround:** serve `dist-uat-w6/main.js` |
| R-HRM-WATCH-01 | P1 | dev-be | `nest start --watch` fails `Cannot find module '../platform/platform-runtime'` — do not use for L0 |
| qc:dev-stack Windows UV exit | P3 env | devops/qa | Functional probes PASS; prefer `node scripts/qc-dev-stack.mjs` + grep healthy line |

## next_owner

PM → QA retest W0/W1 browser journeys (`HDSD-P2-QA-W1-XBOS-01`) with L0 stable

## pm_dispatch_hint

L0 green — `:28001` hrm (dist-uat-w6), `:28002` xbos, `:5173` portal. U65 FE-only. Do not run `pnpm seed:*`.
