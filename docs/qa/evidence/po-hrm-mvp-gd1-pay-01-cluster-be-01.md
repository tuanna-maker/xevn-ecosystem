# PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01` |
| **role** | dev-be |
| **date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-01 / FR-UC-BP-PAY-01 DONE** · **≠ PAY module UAT** |
| **must_keep** | ATT12QC1-MSMAIGWC1 · ATT11QC1-MSLXTH9P · ATT peer chain |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| API-01 | §4.6 F-PAY-ATT-CLOSED-01 · §4.7 process · §4.11 R-PAY-01-BOUNDARY |
| DATA-01 | §4.3 boundary waiver (no `pay_boundary_crossread_*` DDL) |
| BA-01 | AC-PAY-01-* · J-HRM-PAY-01-* |
| ATT-11 SA | F-ATT-SHEET-04 · BR-BP-TS-02 |

## change_mode

FIX narrow · preserve_default · CODE-MEMORY APPEND

## Closed scope

1. **RETAIN** `assertClosedSheetForBind` → `HRM-PAY-ATT-412` on bind (draft / no overlap).
2. **RETAIN** `loadPayrollEligibility` / `GET eligibility` — `NO_CLOSED_SHEET` in `reasons[]`.
3. **RETAIN** `processPayrollPeriod` — `require_closed_timesheet && !has_closed_sheet` → **412** `HRM-PAY-ATT-412`.
4. **RETAIN** `loadAttHoursFromClosedLine` — closed+locked line; warnings `NO_CLOSED_SHEET` · `ATT_LINE_NOT_LOCKED`.
5. **GAP closed (Option A):** `pay-att-hour-boundary.ts` — `assertPayrollAttHourBoundaryLocked()` at process entry → **`403` `HRM-PAY-BOUNDARY-403`** (env `HRM_PAY_ALLOW_ATT_HTTP_CROSSREAD=1` or registered cross-read flag). **No** audit table DDL.
6. **U19:** existing jest — bind list/get under `main` rollup; eligibility/process for holding-stored period + group CEO token.

## Files touched

- `apps/api/hrm-api/src/payroll/pay-att-hour-boundary.ts` (+ spec)
- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` (CODE-MEMORY)
- `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts` (CODE-MEMORY)
- `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.spec.ts` (NO_CLOSED_SHEET)
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` (boundary 403)
- `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.spec.ts` (describe label)

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="pay-att-hour-boundary|pay-formula-variable-bag|pay-period-input-pack.service|payroll.service.spec" --no-cache
```

**Result:** 4 suites · **68 tests PASS** · exit **0**

## Residual (not promoted)

- FE bind/eligibility UI (`PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01` HOLD).
- QA U65 **J-HRM-PAY-01-01..07** + ATT regression J-12-07 · J-07-03..05 · J-06-04.
- **F-PAY-PROCESS-01** full depth = PAY-02/06 HOLD.
- **F-PAY-CB-READ-01** / **F-PAY-RD-APPLY-01** TRACE only.

## Static audit (boundary)

`grep` payroll `src/payroll/**` — **no** `leave-request` / overtime HTTP clients for hour vars; hour path = `loadAttHoursFromClosedLine` only.
