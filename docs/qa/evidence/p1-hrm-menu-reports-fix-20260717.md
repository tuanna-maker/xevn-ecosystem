# P1-HRM-MENU-QA-REPORTS-FIX — Dev-FE

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-REPORTS-FIX` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **spec_ref** | HRM-PR-06 · HRM-OP-04 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` (reports) · QA `docs/qa/evidence/p1-hrm-menu-reports-20260717.md` |
| **U65** | zero-seed · no DB/API mutate for evidence |
| **ack_status** | **READY_FOR_QA** |

---

## Defects closed

| ID | Fix |
|----|-----|
| **D-HRM-RPT-ATT-REF-01** | Rewrote `useAttendanceReports.ts` to call Nest `listAttendanceRecords` + `listEmployees` + `listLeaveRequests`. Removed undefined `attendanceError` / `employeesError` / `leaveError` / `attendanceData` / `trendRecords`. Dropped 12× month fan-out. |
| **D-HRM-RPT-TURNOVER-PAGE-01** | `buildTurnoverReportFromApi(..., { totalActiveOverride })` — Reports uses `getEmployeesSummary.active_count` (scope total), not page-1 length. |
| **D-HRM-RPT-RECON-WIRE-01** | Overview calls `getPayrollReconciliationSummary` and renders draft / processed / closed (HRM-PR-06). Honest note: VNĐ payslip cost not loaded on overview. |
| **D-HRM-RPT-PERF-01** (partial) | Removed overview `listPayrollPayslips` (~875KB). Overview no longer mounts `useAttendanceReports` or `useDepartments` (settings-catalogs). Tab payloads (recruit/contract/leave/turnover) load only when that tab is selected. Dept pie from `employees/summary.by_department`. |

---

## Files touched

- `apps/web/hrm/src/hooks/useAttendanceReports.ts`
- `apps/web/hrm/src/hooks/useAttendanceReports.test.ts` (new)
- `apps/web/hrm/src/hooks/useReportsData.ts`
- `apps/web/hrm/src/hooks/reportsApiAggregator.ts`
- `apps/web/hrm/src/hooks/reportsApiAggregator.test.ts`
- `apps/web/hrm/src/components/reports/OverviewReportTab.tsx`
- `apps/web/hrm/src/pages/Reports.tsx`

---

## Tests

```text
npx vitest run src/hooks/reportsApiAggregator.test.ts src/hooks/useAttendanceReports.test.ts
→ 2 files, 8 tests PASS
```

---

## QA retest checklist (browser, U65)

1. Login `ceo@xe.vn` → Command Center → HRM → **Báo cáo** (`companyId=main`)
2. Console: **no** `ReferenceError: attendanceError`
3. Overview: Tổng NV ≈ **1107**; attendance card shows **records count** (not stuck 0% from broken hook); **Đối soát lương** draft/processed/closed visible (probe was 10/10/60)
4. Network on overview load: **no** `/payroll/payslips`; **yes** `/payroll/reports/reconciliation` + `/operations/reports/summary` + `/employees/summary`
5. Tab **Biến động NS**: current employees = overview headcount (**≠ 95**)
6. Residual OK: tools empty; 429 under parallel QA wave = NFR (not this fix)

---

## Residual

- Turnover hire/termination charts still sample from employees page-1 (+ override for `totalActive` only) — P2 accuracy for dept/tenure charts at 1000+ scale.
- Attendance detailed % lives on Attendance → Reports tab (fixed hook), not re-fetched on Reports overview (perf trade-off + honest AC).
- HTTP 429 under concurrent menu QA → DevOps/NFR residual.

---

## Handoff

- `completion_report:` Closed P0 ReferenceError + turnover totalActive override + HRM-PR-06 recon wire + cut payslips/settings-catalogs fan-out on overview. Vitest 8/8 PASS.
- `next_owner:` **qa**
- `ack_status:` **READY_FOR_QA**
- `evidence_path:` `docs/qa/evidence/p1-hrm-menu-reports-fix-20260717.md`
- `next_dispatch_prompt:` «QA retest `P1-HRM-MENU-QA-REPORTS-FIX` on `:8088` (or local) `ceo@xe.vn` companyId=main — path Command Center → HRM → Báo cáo. AC: (1) console 0 ReferenceError attendanceError; (2) overview loads reconciliation draft/processed/closed via GET `/payroll/reports/reconciliation`; (3) no payslips dump on overview Network; (4) Biến động NS current employees matches overview total (~1107 not ~95). U65 no seed. Evidence update `docs/qa/evidence/p1-hrm-menu-reports-fix-20260717.md` or new retest file. Exit PASS_TO_PM.»
