# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-BE-01

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-BE-01` |
| from_role | dev-be |
| to_role | pm |
| ack_status | `READY_FOR_QA` |
| change_mode | ADD-only narrow |
| date | 2026-08-06 |
| honesty | `payroll_e2e_ready=false` |

## Scope completed

- Added payroll eligibility API path in controller/service: `GET /payroll/periods/:periodId/eligibility`.
- Added enroll API path in controller/service: `POST /payroll/periods/:periodId/enroll` with mode `explicit|auto_eligible`.
- Expanded process flow `POST /payroll/periods/:periodId/process` from status-only to:
  - enforce timesheet closed gate (`require_closed_timesheet`, default true),
  - auto-enroll eligible employees when period has zero payslips,
  - upsert payslips and move payslip status to `processed`,
  - return BE aggregate summary and `employee_count`.
- Updated period listing to return `employee_count` based on `payroll_payslips` count (no hardcoded zero).
- Preserved scope parity via existing `resolveHrmListScope` + `assertResourceInHrmScope` on period lookup path used by list/get/mutate.
- No new DDL migration, no seed, no invented `batch_records` SoT, no hard FK migration.

## Files touched

- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.controller.ts`
- `apps/api/hrm-api/src/payroll/dto/create-payroll-enroll.dto.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts`
- `apps/api/hrm-api/src/payroll/payroll.controller.spec.ts`

## Verification evidence

- Command:
  - `pnpm --filter hrm-api test -- src/payroll/payroll.service.spec.ts src/payroll/payroll.controller.spec.ts`
- Result:
  - `Test Suites: 2 passed, 2 total`
  - `Tests: 26 passed, 26 total`
- Lint diagnostics:
  - `ReadLints` on touched payroll files: no linter errors.

## AC/Conflict coverage implemented

- Eligibility path includes deterministic reasons (e.g. `NOT_ACTIVE`, `NO_CLOSED_SHEET`, `HIRE_MID_MONTH`) and counts.
- Enroll path upserts by UQ `(period_id, employee_id)` through existing `payroll_payslips` SoT and returns enrolled/rejected.
- Process rejects:
  - `HRM-PAY-ATT-412` when no closed attendance sheet and gate is enabled.
  - `HRM-PAY-ENROLL-REQUIRED` when cannot proceed with zero enrolled membership.
- Closed/draft transition guards retained:
  - `HRM-PAY-003`, `HRM-PAY-004`, `HRM-PAY-404`, scope mismatch `HRM-PAY-409`.

## completion_report

- **Closed:** Option B BE backbone for PAY hire→enroll→process is implemented on AS-IS schema with deterministic errors and unit/controller tests updated.
- **Residual:** full FE wire and browser AC `AC-PAY-HIRE-04/05` (post-2xx UI update + F5 persistence) remain for QA/FE validation; formula runtime stays stub-compatible by design.
- **Honesty lock:** `payroll_e2e_ready=false` remains unchanged.

## next_owner

- `qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-01
from_role: pm
to_role: qa
lane: execution
entry_criteria:
- BE READY_FOR_QA with evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-be-01.md
- U65 zero-seed, browser-first flow only

read_first:
1. docs/qa/evidence/po-hrm-e2e-link-pay-hire-be-01.md
2. docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md (F-PAY-HIRE-02..06)
3. docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-DB-01.md

task:
- Verify GET /payroll/periods/:id/eligibility from FE flow with reasons rendered and no silent empty.
- Verify POST enroll creates payroll membership via payslip rows (UQ period_id,employee_id), conflict/error semantics deterministic.
- Verify POST process no longer status-only:
  - with closed attendance sheet: moves period draft→processed and generates/updates payslips;
  - without closed attendance sheet: returns HRM-PAY-ATT-412.
- Verify AC-PAY-HIRE-04: FE state updates immediately after API 2xx (list/period employee_count), no fake success toast.
- Verify AC-PAY-HIRE-05: F5/navigate back preserves enrolled/processed payslip rows.
- Verify closed period reject mutate (HRM-PAY-003/004 conflict paths).

exit_criteria:
- evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md
- ack_status: PASS_TO_PM
- include residuals and whether payroll_e2e_ready remains false
```
