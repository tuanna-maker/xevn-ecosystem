# Evidence — R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2

| Field | Value |
|-------|-------|
| **work_item_id** | `R-DASH-PAYROLL-CHART-0` + `R-DEPT-FETCH-X2` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-07-17 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no seed in fix path |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |

---

## spec_read_ack

| Item | Detail |
|------|--------|
| **srs** | `docs/hrm/SRS.md` UC-HRM-20 (ops summary tiles) · dashboard payroll summary charts |
| **tech_spec** | `GET /api/hrm/employees/summary` → `payroll.total` / `employees_with_salary`; `GET /api/hrm/departments` |
| **qc residual** | `docs/qa/evidence/qc-gwc-hrm-rec-uf12-01-20260717.md` · `qc-p1-hrm-full-menu-regate-20260717.md` |
| **change_mode** | ADD (honest empty) + REPLACE (dept fetch dedupe) |
| **must_keep** | Company dept real rows (P1-HRM-MENU-COMPANY-DEPT-STUB); UC-HRM-20 Kỳ lương tile; no Tools CRUD |

---

## R-DASH-PAYROLL-CHART-0 — closed

### Root cause

`employees/summary` returns successfully with `payroll.employees_with_salary === 0` (salary fields absent on employee rows). FE previously rendered **0 VNĐ** + zero/fake charts (incl. 100% base-salary pie) as if aggregate existed. Kỳ lương tile (ops summary count) was already OK and unrelated.

Reconciliation API only returns period status counts (draft/processed/closed) — **no VNĐ totals** to wire for these charts.

### Fix (minimal honest)

- Gate on `hasEmployeeSalaryAggregate(summary)` (`employees_with_salary > 0`)
- When summary ready but no aggregate → honest empty copy + link to `/payroll` (`data-testid="dashboard-payroll-chart-empty"`)
- No fake 0 VNĐ tiles / zero charts / fake pie when data absent
- Helper: `apps/web/hrm/src/lib/dashboardPayrollChart.ts`

### Files

- `apps/web/hrm/src/lib/dashboardPayrollChart.ts` (+ `.test.ts`)
- `apps/web/hrm/src/pages/Dashboard.tsx`

---

## R-DEPT-FETCH-X2 — closed

### Root cause

`DepartmentManagement` `useEffect` + React StrictMode remount issued two parallel `loadCompanyDepartments` → two `GET /api/hrm/departments?company_id=main`.

### Fix

1. **In-flight coalesce** in `loadCompanyDepartments` (StrictMode-safe single network GET per companyId)
2. **React Query** in `DepartmentManagement` (`COMPANY_DEPARTMENTS_QUERY_KEY`, `staleTime: 60s`) — one observer fetch per mount/scope change; retry still via `refetch`

### Files

- `apps/web/hrm/src/lib/hrmDepartmentCatalog.ts` (+ coalesce test)
- `apps/web/hrm/src/components/company/DepartmentManagement.tsx`

---

## Unit tests

```text
pnpm exec vitest run src/lib/dashboardPayrollChart.test.ts src/lib/hrmDepartmentCatalog.test.ts
→ 2 files / 9 tests PASS
```

---

## QA light retest (:8088) — copy-ready AC

| # | Path | Expect |
|---|------|--------|
| 1 | Login `ceo@xe.vn` → HRM Dashboard | UC-HRM-20 Kỳ lương tile still OK |
| 2 | Section «Tổng hợp lương» | **No** bare `0 VNĐ` pretending data; empty notice `dashboard-payroll-chart-empty` **or** real totals if salary fields present |
| 3 | Company → Phòng ban | Rows still load (prior stub fix); DevTools Network: **one** `GET …/departments?company_id=main` per tab mount (not ×2) |
| 4 | U65 | No seed |

**cấm:** Phase 1 DONE · PROD · Tools CRUD · seed

---

## Handoff

```yaml
work_item_id: R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-20260717.md
completion_report: |
  Closed P2 residuals: dashboard payroll charts use honest empty when
  employees_with_salary=0 (no fake 0 VNĐ); Phòng ban departments GET
  coalesced + React Query (one call per mount/scope). Vitest 9/9 PASS.
  Residual: BE may later populate salary fields so charts show real VNĐ —
  FE gate remains correct either way. Not Phase 1 / PROD DONE.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2
  from_role: pm
  to_role: qa
  entry_criteria: Dev8088 :8088; U65 zero-seed; evidence docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-20260717.md
  exit_criteria: |
    1) Dashboard «Tổng hợp lương»: no fake 0 VNĐ; empty notice OR real totals
    2) UC-HRM-20 Kỳ lương tile still OK
    3) Company Phòng ban: rows OK; Network GET /departments ×1 (not ×2)
    4) Update matrix residual flags if PASS; PASS_TO_PM
  evidence_path: docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-qa-20260717.md
  cấm: seed · Phase 1 DONE · PROD · Tools CRUD
```
