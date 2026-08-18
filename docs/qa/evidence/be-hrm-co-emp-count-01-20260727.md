# D-HRM-CO-EMP-COUNT-BE-01 — employees/summary `by_company`

**Date:** 2026-07-27  
**Work item:** `D-HRM-CO-EMP-COUNT-BE-01`  
**Lane:** dev-be  
**ack_status:** `READY_FOR_QA` (FE bind can run in parallel — contract below)

## Problem

Company Management showed `employee_count=0` because FE had no per-slug HRM headcount.  
`GET /api/hrm/employees/summary?company_id=main` already returned rollup `total` ~1100 but no Plane B breakdown.

## Change (Option A)

Extended **`GET /api/hrm/employees/summary`** with:

```json
"by_company": [
  { "company_id": "holding", "total": 120, "active_count": 110, "inactive_count": 10, "archived_count": 0 },
  { "company_id": "trsport", "total": 400, "active_count": 380, "inactive_count": 20, "archived_count": 0 },
  { "company_id": "logistics", "total": 250, "active_count": 240, "inactive_count": 10, "archived_count": 0 },
  { "company_id": "finance", "total": 180, "active_count": 170, "inactive_count": 10, "archived_count": 0 },
  { "company_id": "services", "total": 157, "active_count": 150, "inactive_count": 7, "archived_count": 0 }
]
```

| Rule | Behavior |
|------|----------|
| Scope parity | Same `resolveHrmListScope` + `buildEmployeeListFilters` as list/summary |
| Plane B | `company_id` ∈ `{holding,trsport,logistics,finance,services}` only |
| Group CEO `main` | Always **5** rows (zero-fill missing slugs) |
| Single slug | One row for that operating unit |
| CẤM | Never key counts by XBOS legal-entity UUID (pilot UUID → slug merge; unknown UUID dropped) |

## Files

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/employees/employee-summary.types.ts` | `EmployeeSummaryCompanyRow` + `by_company` |
| `apps/api/hrm-api/src/employees/employee-summary.ts` | `buildEmployeeSummaryByCompany` |
| `apps/api/hrm-api/src/employees/employees.service.ts` | CTE `by_company` + CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/employees/be-hrm-co-emp-count-01.spec.ts` | Unit tests |
| `apps/api/hrm-api/src/employees/p1-hrm-perf-be-01.spec.ts` | Regression mocks |
| `docs/api/openapi/hrm-api.yaml` | `EmployeeSummary.by_company` schema |

## Contract sample (FE)

```http
GET /api/hrm/employees/summary?company_id=main
x-tenant-id: xevn
Authorization: Bearer <group_ceo>
```

```json
{
  "success": true,
  "code": "HRM-EMP-SUMMARY-200",
  "data": {
    "company_id": "main",
    "total": 1107,
    "active_count": 1050,
    "inactive_count": 57,
    "archived_count": 3,
    "payroll": { "total": 18500000000, "employees_with_salary": 900 },
    "by_department": [],
    "by_company": [
      { "company_id": "holding", "total": 120, "active_count": 110, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "trsport", "total": 400, "active_count": 380, "inactive_count": 20, "archived_count": 0 },
      { "company_id": "logistics", "total": 250, "active_count": 240, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "finance", "total": 180, "active_count": 170, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "services", "total": 157, "active_count": 150, "inactive_count": 7, "archived_count": 0 }
    ],
    "salary_ranges": [],
    "new_hires": { "last_30_days": 24, "recent": [] }
  }
}
```

**FE bind:** map XBOS ĐVTV / operating slug → `data.by_company[].total` (or `active_count` per AC). Do **not** call summary with legal-entity UUID as company dimension for counts.

## TechSpec / OpenAPI note

- OpenAPI `EmployeeSummary` now requires `by_company` (additive field; existing consumers ignore safely until FE upgrade).
- TechSpec § employees summary: document `by_company` as Company page enrichment SoT under AC-CO-EMP / BR-CO-EMP-01 (delta optional — contract live in OpenAPI + this evidence).

## Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="be-hrm-co-emp-count-01|p1-hrm-perf-be-01|d-dash-01-employees-summary" --no-coverage
→ Test Suites: 3 passed | Tests: 12 passed
```

## Residual

- Live L1 smoke on `:28001` after nest restart (QA).
- FE Company page wire (`D-HRM-CO-EMP-COUNT-FE-01` if not yet dispatched).
- No seed (U65). HOLD_DEPLOY.

## next_owner

`dev-fe` (parallel) then `qa`
