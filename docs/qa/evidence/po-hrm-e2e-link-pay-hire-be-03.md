# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-BE-03

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-BE-03` |
| from_role | dev-be |
| to_role | qa |
| ack_status | **`READY_FOR_QA`** |
| date | 2026-08-06 |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-03` FAIL (R-PAY-HIRE-SCOPE-PARITY-MAIN) |
| spec_ref | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.6 · FR-HRM-PR-05 · ADR group CEO `main`→holding rollup |

## Root cause

`createPayrollPeriod` persisted `payload.company_id` verbatim (`main`) while list/get/eligibility/enroll/process filtered via `scope.companyIds` (`holding` + member slugs only). Orphan `main` rows were invisible → **HRM-PAY-404** on follow-up ops.

## Fix (scope parity)

| Path | Change |
|------|--------|
| **Create** | `resolveHrmPersistCompanyIdText(authorization, payload.company_id, { tenantId })` — group CEO `main` → `holding` TEXT persist (parity leave/employees/settings) |
| **List / get-by-id / eligibility / enroll / process / reconciliation** | `expandPayrollPeriodCompanyIds(scope)` — rollup filter includes legacy `main` orphans |
| **assertResourceInHrmScope** | Group rollup allows `company_id=main` rows (legacy + assert after find) |

## Files touched

- `apps/api/hrm-api/src/common/hrm-list-scope.ts` — `expandPayrollPeriodCompanyIds`, `buildAllowedCompanyKeys` +main on rollup
- `apps/api/hrm-api/src/payroll/payroll.service.ts` — create persist + read filters
- `apps/api/hrm-api/src/payroll/payroll.controller.ts` — pass `authorization`, `tenantId` to create
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` — scope parity suite (5 cases)
- `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` — expand + assert tests
- `apps/api/hrm-api/src/payroll/payroll.controller.spec.ts` — create signature

## must_keep

- Soft-delete unchanged
- JWT scope ladder unchanged
- FE enroll body without `company_id` unchanged
- Holding-scoped periods still resolve for group CEO + direct `holding` query

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest payroll.service.spec.ts payroll.controller.spec.ts hrm-list-scope.spec.ts --no-cache
# Test Suites: 3 passed · Tests: 66 passed
```

### Scope parity matrix (jest)

| Case | Expected |
|------|----------|
| POST create `company_id=main` (group CEO JWT) | INSERT `company_id=holding` |
| GET list `company_id=main` | SQL `company_id = ANY([...slugs, main])` |
| GET eligibility legacy `main` row | **200** not 404 |
| POST process holding row + query `main` | finds period → **412** ATT (not 404) |
| GET holding period + query `holding` | **200** regression |

## QA retest entry (QA-04)

1. Login `ceo@xe.vn` → `/hr/payroll?companyId=main`
2. **Lập bảng** → POST periods **201**
3. Same period: GET eligibility **200** (not HRM-PAY-404)
4. GET list `company_id=main` includes new draft
5. POST enroll / process → not 404 (412/409 business codes OK under U65)
6. F5 list persistence (AC-PAY-HIRE-05) after enroll path unblocked

## Residual (not BE-03)

| ID | Owner | Note |
|----|-------|------|
| R-PAY-HIRE-NO-ELIGIBLE-U65 | pm/qa | All NV `NO_CLOSED_SHEET` until attendance close from FE — expected under U65 |

## completion_report

- **Closed:** R-PAY-HIRE-SCOPE-PARITY-MAIN — create/list/get/eligibility/enroll/process aligned on group CEO `main` rollup; holding periods preserved; jest 66/66.
- **Open:** U65 enroll requires closed attendance sheet (P1 cross-module, not scope).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-04
from_role: pm
to_role: qa
entry: BE-03 READY_FOR_QA · FE-03 create dialog already PASS
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-hire-be-03.md

task:
- Retest UF-HRM-06 / J-HRM-07: create draft → eligibility 200 → enroll (not 404)
- listPayrollPeriods?company_id=main includes new draft
- AC-PAY-HIRE-04/05 browser U65 · ATT-412 on new draft (412 OK, not 404)
- Persona ceo@xe.vn / http://127.0.0.1:5175/hr/payroll?companyId=main

forbidden: seed; payroll_e2e_ready=true
exit: PASS_TO_PM or FAIL with evidence po-hrm-e2e-link-pay-hire-qa-04.md
```

## ack_status

**`READY_FOR_QA`**
