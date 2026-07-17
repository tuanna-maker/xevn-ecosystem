# D-DASH-01 — GET /employees/summary route order fix

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DASH-01` |
| **date** | 2026-07-17 |
| **owner** | dev-be |
| **spec_ref** | UC-HRM-20 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 dashboard · P1-HRM-PERF-BE-01 |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

Live `:8088` returned **500** `HRM-SYS-001` with `invalid input syntax for type uuid: "summary"` because `GET /api/hrm/employees/summary` was handled by `GET /employees/:employeeId` (`queryEmployeeById` casts `$1::uuid`).

Committed `employees.controller.ts` lacked `@Get('summary')`. Service `getEmployeesSummary` existed (P1-HRM-PERF-BE-01) but was **not wired** to HTTP.

## Fix

1. Register `@Get('summary')` **before** all `:employeeId` param routes in `employees.controller.ts` (lines 67–82).
2. Returns `HRM-EMP-SUMMARY-200` with headcount aggregates via `EmployeesService.getEmployeesSummary` (same `buildEmployeeListFilters` scope as list — `company_id=main` → holding rollup).
3. Jest regression: `d-dash-01-employees-summary.spec.ts` + `employees.controller.spec.ts` D-DASH-01 case + existing `p1-hrm-perf-be-01.spec.ts`.

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` UC-HRM-20 dashboard aggregates
- **tech_spec:** P1-HRM-PERF-BE-01 `EmployeeSummary` / list scope parity
- **change_mode:** ADD (HTTP route wiring only; service already present)

## Verification

```bash
cd apps/api/hrm-api
npx jest --runInBand \
  src/employees/d-dash-01-employees-summary.spec.ts \
  src/employees/p1-hrm-perf-be-01.spec.ts \
  src/employees/employees.controller.spec.ts
pnpm run build
```

| Check | Result |
|-------|--------|
| `GET /employees/summary?company_id=main` → `HRM-EMP-SUMMARY-200` | **PASS** (supertest) |
| `summary` does not invoke `getEmployeeById` | **PASS** |
| `GET /employees/:uuid` still `HRM-EMP-200` | **PASS** |
| Jest employees summary suite | **20/20 PASS** |
| `pnpm run build` (hrm-api) | **exit 0** |

## FE contract (unchanged)

```
GET /api/hrm/employees/summary?company_id=main
Headers: Authorization Bearer … | x-internal-api-key, x-tenant-id
Response: { code: "HRM-EMP-SUMMARY-200", data: { total, active_count, inactive_count, archived_count, payroll, by_department, salary_ranges, new_hires } }
```

## Residual

- **Deploy:** live `:8088` needs hrm-api image rebuild with this controller change (QA probe after DevOps deploy).
- **D-DASH-02/04:** FE still uses paginated `/employees` storm — separate dev-fe lane.

## Handoff

- `next_owner`: **qa**
- `next_dispatch_prompt`: Retest D-DASH-01 on Dev8088 after deploy: login `ceo@xe.vn` → probe `GET /api/hrm/employees/summary?company_id=main` expects **200** `HRM-EMP-SUMMARY-200` (not 500 uuid). U65 zero-seed. Evidence update this file + `p1-hrm-menu-dashboard-20260717.md` row D-DASH-01.
