# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-FE-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-FE-01` |
| from_role | dev-fe |
| to_role | pm |
| lane | execution |
| change_mode | ADD-only narrow |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |

---

## Scope completed

- Wired FE payroll batch flow to real enroll+payslip APIs (no fake add-record throw path).
- Enforced AC-PAY-HIRE-04/05 behavior in FE data flow:
  - after mutate 2xx, payroll list/detail refreshes from API-backed source;
  - same period rows are reloaded from server (F5/re-open persistence path).
- Removed success-only fake path by rejecting enroll responses with zero `enrolled`.
- Preserved PAY-02 dual-SoT constraints: FE only binds display-ready amounts, no FE net-calculation authority.

---

## Files changed

- `apps/web/hrm/src/integrations/hrmApi.ts`
  - Added payroll period optional rollup fields (`employee_count`, totals).
  - Added `enrollPayrollPeriod()` + request/response types.
- `apps/web/hrm/src/hooks/usePayrollBatches.ts`
  - Added helpers for API→UI mapping (`mapPayrollPeriodToBatch`, `mapPayslipToPayrollRecord`, `parsePayrollAmount`).
  - `fetchBatchRecords()` now reads `/payroll/payslips` by `period_id`.
  - `addRecord` now calls enroll endpoint and fails when `enrolled.length === 0`.
  - Batch/payslip query invalidation tightened after enroll.
- `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx`
  - Updated add-employee flow to use `batchId + employeeId` enroll payload.
  - Refetches batch list + detail records after add/process-close actions.
  - Keeps detail panel aligned with refreshed API state.
- `apps/web/hrm/src/hooks/usePayrollBatches.test.ts` (new)
  - Tests mapping and numeric parsing for refresh + persistence-safe behavior.

---

## Validation

- Lint diagnostics (touched files): **no errors**.
- Test command:
  - `pnpm test -- usePayrollBatches.test.ts` (run in `apps/web/hrm`) → **PASS** (3/3).

---

## Honesty / constraints

- `payroll_e2e_ready=false` (not claimed).
- No seed, no fake CRUD process flow, no payroll readiness claim.
- Browser U65 acceptance remains for QA wave.

---

## completion_report

- **Closed:** FE payroll enroll/process wiring now uses API-backed state refresh for period and payslip list, including post-2xx refresh and reload-safe persistence path.
- **Residual:** Requires BE endpoint behavior parity for final browser acceptance (especially enroll payload/result edge cases and process-generated rollups).

## next_owner

- `qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-FE-01
ack_target: PASS_TO_PM

read_first:
1. docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-01.md
2. docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md (AC-PAY-HIRE-04/05)
3. docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-DB-01.md

Task:
- Run browser-only U65 flow on Payroll:
  1) active employee -> payroll period -> add employee (enroll) -> verify payslip list updates right after 2xx
  2) process/close path -> verify period row + detail list updated from API
  3) F5 or re-open payroll -> verify same period/payslip rows persist
- Verify no fake toast-only success when enroll returns no enrolled row.
- Verify dual-SoT constraints: FE displays BE amounts; no FE-calculated net authority.
- Capture URL/account/click path + Network evidence.

forbidden:
- seed acceptance
- direct DB mutate
- claim payroll_e2e_ready

exit_criteria:
- evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md
- completion_report + next_dispatch_prompt
- ack_status: PASS_TO_PM
- honesty payroll_e2e_ready=false
```
