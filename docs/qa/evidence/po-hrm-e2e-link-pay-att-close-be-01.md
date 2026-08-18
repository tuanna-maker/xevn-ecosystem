# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-BE-01

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-BE-01` |
| from_role | dev-be |
| to_role | qa |
| ack_status | **`READY_FOR_QA`** |
| date | 2026-08-06 |
| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01` FAIL (R-PAY-ATT-MONTH-LINK) |
| spec_ref | FR-UC-BP-ATT-11 · BR-BP-TS-02 · FR-HRM-PR-05 |

## Root cause (R-PAY-ATT-MONTH-LINK)

`hasClosedAttendanceSheet` had two gaps:

1. **Company scope too broad** — used `expandHrmTextCompanyIds(scope, …)` with group CEO rollup, so ANY member slug (`trsport`, `logistics`, …) with a closed sheet could satisfy eligibility for a `holding` payroll period.
2. **Month match too loose** — `daterange` overlap could match partial cross-month sheets; did not enforce **same calendar month** as payroll `start_date`.

QA Run A (Sept 2026 closed sheet) correctly did **not** unblock Jan 2026 payroll — behavior was already month-safe via non-overlap, but company scope was wrong for other scenarios.

## Fix

| Area | Before | After |
|------|--------|-------|
| Company probe | Group rollup slugs via JWT scope | `expandPayrollAttendanceSheetCompanyIds(period.company_id)` — period OU only + `main`↔`holding` parity + pilot UUID |
| Month match | `daterange(s.*) && daterange(period.*)` | `date_trunc('month', s.start_date) = date_trunc('month', period.start_date)` |
| Params | `[companyIds, start_date, end_date]` | `[companyIds, start_date]` |

## Expected behavior (documented)

| Scenario | `has_closed_sheet` | Eligibility |
|----------|-------------------|-------------|
| Jan payroll + Jan closed sheet (same `holding`/`main` OU) | **true** | Active NV eligible (minus HIRE_MID_MONTH warn) |
| Jan payroll + Sept closed sheet only | **false** | All NV `NO_CLOSED_SHEET` |
| Jan `holding` payroll + closed sheet on `trsport` only | **false** | All NV `NO_CLOSED_SHEET` |
| Legacy `main` period + closed sheet stored as `holding` | **true** | Parity via expand helper |
| `HRM_PAY_REQUIRE_CLOSED_TIMESHEET=0` | skipped (true) | Enroll allowed without sheet |

**Note:** Closing a sheet for a **different month** never unblocks payroll for the target month — FE must submit→sign→close the sheet whose `start_date` falls in the **same calendar month** as the payroll period.

## Files touched

- `apps/api/hrm-api/src/common/hrm-list-scope.ts` — ADD `expandPayrollAttendanceSheetCompanyIds`
- `apps/api/hrm-api/src/payroll/payroll.service.ts` — FIX `hasClosedAttendanceSheet` month + company scope
- `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` — 3 cases (holding/main/trsport narrow)
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` — month mismatch + month match eligibility

## must_keep

- BE-03 scope parity (list/get/enroll unchanged)
- Soft-delete · JWT scope ladder
- `HRM_PAY_REQUIRE_CLOSED_TIMESHEET` env gate
- No seed · no `payroll_e2e_ready=true`

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest payroll.service.spec.ts hrm-list-scope.spec.ts --no-cache
# Test Suites: 2 passed · Tests: 62 passed
```

### Jest matrix (new)

| Case | Expected |
|------|----------|
| Jan period · EXISTS false | `NO_CLOSED_SHEET` · SQL uses `date_trunc('month'` not `daterange` |
| Jan period · EXISTS true | `eligible_count=1` · no `NO_CLOSED_SHEET` |
| `expandPayrollAttendanceSheetCompanyIds('holding')` | includes `main`, holding UUID · excludes `trsport` |
| `expandPayrollAttendanceSheetCompanyIds('trsport')` | narrow — no `holding`/`main` |

## Residual (not BE-01)

| ID | Owner | Note |
|----|-------|------|
| R-ATT-SHEET-SUBMIT-SIGN-GAP | dev-fe | Jan sheet still `draft` — submit/sign/close from FE (PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01) |
| R-PAY-HIRE-NO-ELIGIBLE-U65 | qa | Until Jan sheet closed from FE, `eligible_count=0` expected under U65 |

## completion_report

- **Closed:** R-PAY-ATT-MONTH-LINK — payroll eligibility `NO_CLOSED_SHEET` now resolves closed sheet by **same calendar month** + **period operating unit** (main↔holding parity only).
- **Open:** U65 browser chain still blocked until FE completes submit→sign→close on Jan 2026 sheet; BE will return `eligible_count≥1` once matching closed sheet exists.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-BE-01 READY_FOR_QA + FE-01 when ready

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-be-01.md
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md

entry_criteria:
- BE-01 merged/running on :28001
- FE-01 submit→sign→close on Jan 2026 sheet (or parallel retest after FE READY)

task:
1) U65 browser: close Jan 2026 attendance sheet (not Sept) → GET eligibility Jan payroll → eligible_count ≥ 1
2) Negative: with only Sept closed sheet, Jan payroll still NO_CLOSED_SHEET (API probe OK)
3) AC-PAY-HIRE-04 enroll 2xx after eligibility unblocked
4) F5 persistence AC-PAY-HIRE-05

persona: ceo@xe.vn / http://127.0.0.1:5175/hr?company_id=main
forbidden: seed; payroll_e2e_ready=true without full chain
exit: PASS_TO_PM or FAIL with po-hrm-e2e-link-pay-att-close-qa-02.md
```

## ack_status

**`READY_FOR_QA`**
