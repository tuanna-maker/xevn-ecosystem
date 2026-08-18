# D-HRM-DASH-NET-01 — Dashboard embed network fix

**work_item_id:** D-HRM-DASH-NET-01  
**Generated:** 2026-07-30T15:03:00Z  
**ack_status:** READY_FOR_QA

## Scope closed

| Before (QA audit) | After (fix) |
|-------------------|-------------|
| `GET attendance/records` on dashboard load | **Removed** — no longer called from Dashboard |
| `attendance/overview` **MISSING** | **Added** via `useAttendanceOverview()` |
| `payroll/payslips` **MISSING** | **Added** via `usePayrollPayslips()` |

## Changed files

- `apps/web/hrm/src/pages/Dashboard.tsx` — replace `useAttendanceDashboard` (records list) with overview + payslips hooks; attendance comparison uses overview stats proxy
- `apps/web/hrm/src/hooks/p1-hrm-perf-fe-04.test.ts` — regression assert D-HRM-DASH-NET-01 endpoints

## spec_ref

- UC-HRM-20 · `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-HRM-DASH
- Prior FAIL: `docs/qa/evidence/qa-hrm-embed-network-audit-20260730.md`

## Verify (dev)

```bash
cd apps/web/hrm
pnpm exec vitest run src/hooks/p1-hrm-perf-fe-04.test.ts src/lib/dashboardPayrollChart.test.ts
# exit 0 — 7 tests PASS
```

## QA retest matrix (required endpoints on `/command-center/hrm/dashboard`)

| Endpoint | Expected |
|----------|----------|
| `GET /api/hrm/employees/summary?company_id=main` | 200 (unchanged) |
| `GET /api/hrm/attendance/overview?company_id=main&year=2026` | **200** (was MISSING) |
| `GET /api/hrm/payroll/payslips?company_id=main` | **200** (was MISSING) |
| `GET /api/hrm/attendance/leave-requests?company_id=main` | 200 (unchanged via `useLeaveRequestsData`) |

Account: `ceo@xe.vn` / `Xevn@2026` · U65 zero-seed · browser Network tab on dashboard load.

## Residual (not in scope)

- `performance/evaluations` 500 → `D-HRM-PERF-EVAL-500-01` (dev-be)
- Post-audit hrm-api crash cascade → devops restart + delayed re-audit

## next_dispatch_prompt

QA retest `QA-HRM-EMBED-NETWORK-AUDIT-01-R2` dashboard row only first: login `ceo@xe.vn` → `/command-center/hrm/dashboard` → confirm Network shows `attendance/overview` + `payroll/payslips` 2xx alongside `employees/summary` + `leave-requests`; no `attendance/records` on initial load. Evidence: append `docs/qa/evidence/qa-hrm-embed-network-audit-20260730-r2.md`. U65 browser-only.
