# D-HRM-API-DIST-CRASH-01 — hrm-api dist MODULE_NOT_FOUND restore

**Date:** 2026-07-30  
**Role:** dev-be  
**work_item_id:** `D-HRM-API-DIST-CRASH-01`  
**ack_status:** READY_FOR_QA

## Incident

| Symptom | Detail |
|---------|--------|
| Portal | `http://127.0.0.1:5173/command-center/hrm/dashboard` → proxy **500** / ECONNREFUSED |
| hrm-api boot | `Error: Cannot find module './common/http-exception.filter'` from `dist/main.js` |
| Source | `apps/api/hrm-api/src/common/http-exception.filter.ts` exists |

## Root cause

Nest `nest-cli.json` had `"deleteOutDir": true`. During `nest start --watch`, a rebuild **wipes `dist/`** then re-emits files incrementally. Node restarts on `dist/main.js` before `dist/common/http-exception.filter.js` is written → **MODULE_NOT_FOUND** crash loop. Same class as prior waves (`do-hrm-settings-md-l0-restore-01`, `pcomp-w6-do-stable-dist-01`).

## Fix (preserve_default — config + guard only)

| File | Change |
|------|--------|
| `apps/api/hrm-api/nest-cli.json` | `deleteOutDir: false` — stop mid-watch full dist wipe |
| `apps/api/hrm-api/package.json` | `build:clean`, `predev`, `prestart:dev` → run `scripts/ensure-dist.mjs` when spine files missing |
| `apps/api/hrm-api/scripts/ensure-dist.mjs` | **ADD** — if `dist/main.js` or `dist/common/http-exception.filter.js` absent → `nest build` |

No business logic / API contract change.

## Verification

### Clean build

```powershell
cd apps/api/hrm-api
pnpm run build:clean
Test-Path dist/common/http-exception.filter.js   # True
```

### Jest smoke

```powershell
pnpm exec jest src/app.controller.spec.ts --runInBand
# Test Suites: 1 passed, Tests: 1 passed
```

### Runtime (:28001)

```powershell
$env:HRM_BE_PORT='28001'
node dist/main.js
# GET /api/hrm → 200 HRM-HEALTH-200
```

### CEO token probes (xbos login → hrm direct)

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `GET /api/hrm/employees/summary?company_id=main` | **200** | ceo@xe.vn Bearer |
| `GET /api/hrm/attendance/overview?company_id=main&year=2026` | **200** | ceo@xe.vn Bearer |

### ensure-dist guard

Deleted `dist/common/http-exception.filter.js` → `node ./scripts/ensure-dist.mjs` → `build:clean` fallback → file restored, exit 0.

## Residual

| ID | Owner | Note |
|----|-------|------|
| R1 | devops | Avoid concurrent `nest build` on hrm-api from parallel agents; use `build:clean` once if dist corrupt |
| R2 | qa | Retest portal dashboard J-HRM embed after hrm-api stable on :28001 (U65 FE path) |

## must_keep

- `GlobalHttpExceptionFilter` import path in `src/main.ts`
- `@xevn/platform-core` `logHttpException` in filter
- Sponsor UAT freeze `dist-uat-w6` unchanged (separate from dev `dist/`)
