# Dev-BE — P1-PHASE1-BE-REC-PATCH-01

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-BE-REC-PATCH-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **executed_at** | `2026-06-06` |
| **matrix AC** | **AC-CRUD-HRM-REC-G-U-01** |
| **prior QA** | [`p1-phase1-qa-crud-rd-retest-20260606.md`](p1-phase1-qa-crud-rd-retest-20260606.md) |

## Defect closed

| Defect ID | AC / Journey | Fix |
|-----------|--------------|-----|
| **D-CRUDMAT-REC-U-01** | **AC-CRUD-HRM-REC-G-U-01** | `PATCH /api/hrm/recruitment/requisitions/:requisitionId?company_id=main` with `{ status: 'on_hold' \| 'open' \| 'closed' }` → **200** `HRM-REC-200` |

## Implementation

### Route

- `PATCH /api/hrm/recruitment/requisitions/:requisitionId`
- Query: `company_id` (required, same as list GET)
- Body: `{ status: 'open' | 'closed' | 'on_hold' }`
- Response: `HRM-REC-200` + updated requisition row

### Scope parity (same as list GET)

- `RecruitmentService.updateJobRequisition()` uses `resolveHrmListScope` + `pushCompanyIdFilter` + `assertResourceInHrmScope`
- Controller forwards `toHrmListScopeContext(tenantId)` and `resolveScopeContext` (mirrors `getJobRequisitionById` / `listJobRequisitions`)

### Files

| File | Change |
|------|--------|
| `recruitment/dto/update-job-requisition.dto.ts` | Status validation |
| `recruitment/recruitment.service.ts` | `updateJobRequisition()` |
| `recruitment/recruitment.controller.ts` | `@Patch('requisitions/:requisitionId')` |
| `recruitment/p1-phase1-be-rec-patch.spec.ts` | scope_parity regression |
| `recruitment/recruitment.service.spec.ts` | Service unit tests |
| `recruitment/recruitment.controller.spec.ts` | Controller forwards scope |

## scope_parity tests

| File | Coverage |
|------|----------|
| `p1-phase1-be-rec-patch.spec.ts` | Group CEO `company_id=main` → update holding requisition; HRM-REC-404 / HRM-REC-409 outside scope |
| `recruitment.service.spec.ts` | Service-level update + 404 |
| `recruitment.controller.spec.ts` | Controller scope context forwarding |

## Verification

```bash
cd apps/api/hrm-api && pnpm test
# Test Suites: 52 passed, 52 total
# Tests:       353 passed, 353 total
# exit 0
```

## QA retest (expected)

| Probe | Expected |
|-------|----------|
| `AC-CRUD-HRM-REC-G-U-01` | `PATCH …/recruitment/requisitions/:id?company_id=main` `{ status: 'on_hold' }` → **200** `HRM-REC-200` (**PASS**, not GWC) |
| Account | `ceo@xe.vn` / `Xevn@2026`, `company_id=main` |
| L0 prerequisite | `pnpm run qc:dev-stack` exit 0 |

## Residual

| ID | Severity | Note |
|----|----------|------|
| — | — | None for this work item |

## Handoff

- **completion_report:** D-CRUDMAT-REC-U-01 closed — requisition PATCH route exposed with list-scope parity; 353/353 jest PASS.
- **next_owner:** qa
- **next_dispatch_prompt:** QA retest `P1-PHASE1-BE-REC-PATCH-01`: L0 `pnpm run qc:dev-stack`; probe `AC-CRUD-HRM-REC-G-U-01` — list requisitions `company_id=main`, PATCH first id `{ status: 'on_hold' }` expect **200** `HRM-REC-200` (not headcount fallback); account `ceo@xe.vn`; evidence `docs/qa/evidence/p1-phase1-qa-rec-patch-retest-20260606.md`; ack_status PASS_TO_PM or FAIL_TO_PM.
- **evidence_path:** `docs/qa/evidence/p1-phase1-be-rec-patch-20260606.md`
- **ack_status:** READY_FOR_QA
