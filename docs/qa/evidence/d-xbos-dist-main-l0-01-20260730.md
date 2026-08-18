# D-XBOS-DIST-MAIN-L0-01 — xbos-api dist/main recovery (local L0)

**Date:** 2026-07-30  
**Owner:** devops  
**HOLD_DEPLOY:** yes (no VPS)  
**U65:** no seed

## Symptom (before)

- `npm run dev` / turbo: xbos-api `nest start --watch` reported "Found 0 errors" then `MODULE_NOT_FOUND` for `apps/api/xbos-api/dist/main`.
- `dist/` absent; portal proxy `ECONNREFUSED` on `127.0.0.1:28002`.
- Turbo loop: repeated "4 tasks shutting down..." (wedged).

## Actions

1. Stopped wedged dev root process (terminal 4, pid 18988).
2. Built from junction `C:\xevn-ecosystem`:
   - `pnpm --filter xbos-api build` (exit 0)
   - Direct `npx nest build` in `apps/api/xbos-api` (exit 0) — confirmed emit.
3. Started APIs (reliable path, not nest watch):
   - xbos: `XBOS_BE_PORT=28002` → `node dist/main.js` (background)
   - hrm: `HRM_BE_PORT=28001` → `node dist/main.js` (background; dist already present)

## dist listing (after build)

Path: `apps/api/xbos-api/dist/`

| Artifact | Size (bytes) |
|----------|----------------|
| `main.js` | 1647 |
| `main.js.map` | 1165 |
| `app.module.js` | 4616 |
| (+ module subdirs: auth, org-foundation, workflow-engine, …) | — |

`Test-Path dist/main.js` → **True**

## Health / stack probes

| Check | URL | Result |
|-------|-----|--------|
| curl xbos root | `http://127.0.0.1:28002/api/xbos` | HTTP **200** |
| curl hrm root | `http://127.0.0.1:28001/api/hrm` | HTTP **200** |
| `node scripts/qc-dev-stack.mjs` | HRM + XBOS + portal :5173 | **All ✓** (script exit crashed Node on Windows UV_HANDLE_CLOSING — checks passed before crash) |
| `node scripts/qc-fe-be-api-health.mjs` | stack + HRM routes + portal proxy | **ALL PASS**, exit **0** |

## Residual (P3)

- **`nest start --watch` still not trusted** on OneDrive Unicode path + Node 24: watch compiles with 0 TS errors but may not emit / may run before emit. **Workaround:** `pnpm --filter xbos-api build` then `XBOS_BE_PORT=28002 node dist/main.js` (or `start:prod`). No nest-cli/webpack config change in this WI.
- Full monorepo `npm run dev` including `xbos-api:dev` may re-break until watch fixed; prefer **separate API processes** after build.
- Turbo shutdown spam: mitigated by stopping wedged root dev; not root-caused in this pass.

## Sponsor guidance

- **Do not** rely on terminal 4 `npm run dev` for xbos-api until watch emit is fixed.
- **Recommended:** keep HRM/XBOS on dedicated terminals (`build` + `node dist/main.js`); run portal via `pnpm run dev:web-only` or turbo filters **without** xbos-api watch, **or** restart `npm run dev` only if accepting xbos lane may fail again.

## ack_status

**PASS_TO_PM** — L0 stack restored locally; QA may confirm L2 proxy paths if portal dev server matches sponsor session.
