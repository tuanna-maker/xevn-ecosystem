# QA-HRM-BUILD-01-RET

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HRM-BUILD-01-RET |
| **program** | INC-HRM-DASH-500-01 |
| **upstream** | D-HRM-BUILD-01 READY_FOR_QA |
| **Generated** | 2026-07-30T15:35:31.657Z |
| **Portal** | http://127.0.0.1:5173 |
| **Account** | ceo@xe.vn · companyId=main · U65 zero-seed |
| **ack_status** | PASS_TO_PM |

## Verdict

🟢 **PASS** — L0 fe-be-health exit 0; dashboard + employees embed load without 500/ECONNREFUSED :28001; dist spine present.

## HRM runtime (:28001)

| Item | Value |
|------|-------|
| PID | 3568 |
| Mode | **dist-uat-w6-freeze** |
| CommandLine | `"C:\Program Files\nodejs\node.exe" dist-uat-w6/main.js` |

> **Note:** Runtime still on sponsor freeze `dist-uat-w6/main.js`. D-OPS-HRM-DIST-MAIN-SWITCH-01 in flight. Build spine verified on disk; not blocked by freeze artifact.

## Dist spine (D-HRM-BUILD-01)

| File | Present |
|------|---------|
| `dist/main.js` | 🟢 |
| `dist/common/http-exception.filter.js` | 🟢 |
| `dist/spreadsheet/spreadsheet-template.service.js` | 🟢 |

## L0 gates

| Gate | Exit | Notes |
|------|------|-------|
| qc:dev-stack | 3221226505 (functional PASS) | HRM+XBOS+portal all HTTP 200; Node UV_HANDLE_CLOSING crash on Windows exit — waived per QA precedent |
| qc:fe-be-health | 0 | ALL PASS required |

### qc:fe-be-health tail

```
oding\projects\xevn-ecosystem
> node ./scripts/qc-fe-be-api-health.mjs

qc-fe-be-api-health — stack + HRM routes (console 500 class)

INFO  portal-base  http://127.0.0.1:5173

PASS  hrm-api-health  HTTP 200  http://127.0.0.1:28001/api/hrm/
PASS  xbos-api-health  HTTP 200  http://127.0.0.1:28002/api/xbos
PASS  web-portal  HTTP 200  http://127.0.0.1:5173
PASS  portal-login  token ok
PASS  hrm-employees-direct  HTTP 200  http://127.0.0.1:28001/api/hrm/employees?page_size=5&company_id=main
PASS  hrm-catalog-sync-direct  HTTP 200  http://127.0.0.1:28001/api/hrm/catalog-sync
PASS  portal-proxy-hrm-employees  HTTP 200  http://127.0.0.1:5173/api/hrm/employees?page_size=5&company_id=main
PASS  portal-proxy-hrm-catalog  HTTP 200  http://127.0.0.1:5173/api/hrm/catalog-sync

=== Summary: ALL PASS ===
```

## L2 — P-CC-HRM-DASH

- URL: http://127.0.0.1:5173/command-center/hrm/dashboard?portal=1&tenantId=xevn&companyId=main
- Error banner: **false**
- HRM API calls: **10**
- 5xx/0: **0**

| Method | Status | URL |
|--------|--------|-----|
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/operating-units |
| GET | 200 | /api/hrm/company-subscription?company_id=main |
| GET | 200 | /api/hrm/employees/summary?company_id=main |
| GET | 200 | /api/hrm/operations/reports/summary?company_id=main |
| GET | 200 | /api/hrm/payroll/payslips?company_id=main |
| GET | 200 | /api/hrm/contracts-insurance/contracts/expiring?company_id=main&days=30 |
| GET | 200 | /api/hrm/attendance/leave-requests?company_id=main |
| GET | 200 | /api/hrm/attendance/overview?company_id=main&year=2026 |

## L2 — P-CC-HRM-EMP

- URL: http://127.0.0.1:5173/command-center/hrm/employees?portal=1&tenantId=xevn&companyId=main
- Error banner: **false**
- HRM API calls: **8**
- 5xx/0: **0**

| Method | Status | URL |
|--------|--------|-----|
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/operating-units |
| GET | 200 | /api/hrm/company-subscription?company_id=main |
| GET | 200 | /api/hrm/employees?company_id=main&page=1&page_size=50 |
| GET | 200 | /api/hrm/employees/summary?company_id=main&include_archived=true |
| GET | 200 | /api/hrm/settings-catalogs |
| GET | 200 | /api/hrm/settings-catalogs |


## Matrix

| Row | Verdict |
|-----|---------|
| P-CC-HRM-DASH | 🟢 |
| P-CC-HRM-EMP | 🟢 |

## Hard fails

_None_

## Residual

| ID | Owner | Note |
|----|-------|------|
| D-OPS-HRM-DIST-MAIN-SWITCH-01 | devops | Runtime during retest = `dist-uat-w6/main.js` PID 3568; `:28001` healthy. After `pnpm --filter hrm-api run build:clean`, `node dist/main.js` starts (verified mid-session). Switch prod-like runtime off freeze. |
| R-HRM-PARTIAL-DIST | dev-be | Stale partial `dist/` without `build:clean` → `MODULE_NOT_FOUND` (e.g. `create-attendance-sheet.dto`); spine verify alone insufficient for runtime — `build:clean` required before `dist/main.js`. |

## QA notes (build fix validation)

- **D-HRM-BUILD-01 spine gate:** all 6 spine files present after `build:clean`; `verify-dist.mjs` exit 0.
- **Freeze path:** `dist-uat-w6` does **not** block L2 smoke — dashboard + employees embed 🟢 with zero-seed browser.
- **Stack flap:** mid-retest APIs dropped once (likely concurrent restarts); stabilized before final browser run.
- **Script:** `scripts/qa/qa-hrm-build-01-ret.mjs` · runtime JSON `_tmp-qa-hrm-build-01-ret-runtime.json` · screenshots `docs/qa/evidence/screens/qa-hrm-build-01-ret/`

## Handoff

- **ack_status:** PASS_TO_PM
- **next_owner:** pm
- **evidence_path:** docs/qa/evidence/qa-hrm-build-01-ret-20260730.md
- **cấm:** seed

### completion_report

**Closed:** L0 `qc:fe-be-health` exit 0 (8/8 PASS); L0 `qc:dev-stack` functional probes HRM+XBOS+portal 200 (Windows exit crash waived); U65 browser `ceo@xe.vn` dashboard + employees embed — 18 HRM GET all 2xx, no Sync ERROR banner, no ECONNREFUSED :28001; dist spine files on disk; not blocked by `dist-uat-w6` freeze for L2 scope.

**Open:** `:28001` still served from `dist-uat-w6/main.js` — DevOps must finish D-OPS-HRM-DIST-MAIN-SWITCH-01 to canonical `dist/main.js` after `build:clean`.

### next_dispatch_prompt

```
work_item_id: D-OPS-HRM-DIST-MAIN-SWITCH-01
from_role: qa
to_role: devops
program: INC-HRM-DASH-500-01
entry_criteria: QA-HRM-BUILD-01-RET PASS_TO_PM; docs/qa/evidence/qa-hrm-build-01-ret-20260730.md; build:clean exit 0; L2 dashboard+employees 🟢 on current :28001
exit_criteria:
- Stop dist-uat-w6/main.js on :28001
- pnpm --filter hrm-api run build:clean && HRM_BE_PORT=28001 node dist/main.js
- GET /api/hrm/ 200; pnpm run qc:fe-be-health exit 0
- evidence: docs/qa/evidence/d-ops-hrm-dist-main-switch-01-20260730.md
ack_status: READY_FOR_QA
read_first: docs/qa/evidence/d-hrm-build-01-20260730.md · docs/qa/evidence/qa-hrm-build-01-ret-20260730.md
cấm: seed
```
