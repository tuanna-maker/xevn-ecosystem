# Dev-BE — P1-PHASE1-BE-CRUD-RD-PARITY-01

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-BE-CRUD-RD-PARITY-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **executed_at** | `2026-06-06` |
| **prior QA** | [`p1-phase1-qa-crud-matrix-retest-20260606.md`](p1-phase1-qa-crud-matrix-retest-20260606.md) |

## Defects closed

| Defect ID | Journey | Fix |
|-----------|---------|-----|
| **D-CRUDMAT-REC-RD-01** | **J-HRM-05** | `GET /api/hrm/recruitment/requisitions/:requisitionId?company_id=main` — scope via `resolveHrmListScope` + `pushCompanyIdFilter` (same as list) |
| **D-CRUDMAT-ATT-RD-01** | **J-HRM-06** | `GET /api/hrm/attendance/records/:recordId?company_id=main` — scope via `pushWorkforceEmployeeScopeFilter` (same as list) |

## Implementation

### Recruitment

- `RecruitmentService.getJobRequisitionById()` — id + `company_id = ANY($scope.companyIds)` filter
- `RecruitmentController` `@Get('requisitions/:requisitionId')` — response `HRM-REC-200`
- DTO: `get-job-requisition.query.dto.ts`

### Attendance (P2 same wave)

- `AttendanceService.getRecordById()` — id + workforce employee scope subquery
- `AttendanceController` `@Get('records/:recordId')` — response `HRM-ATT-200`
- DTO: `get-attendance-record.query.dto.ts`

## scope_parity tests

| File | Coverage |
|------|----------|
| `recruitment/p1-phase1-be-crud-rd-parity.spec.ts` | Group CEO `company_id=main` → holding requisition + attendance record; 404 outside scope |
| `recruitment/recruitment.controller.spec.ts` | Controller forwards scope context on GET requisition |
| `attendance/attendance.controller.spec.ts` | Controller forwards scope context on GET record |

## Verification

```bash
cd apps/api/hrm-api && pnpm test
# Test Suites: 51 passed, 51 total
# Tests:       347 passed, 347 total
# exit 0
```

## QA retest (expected)

| Check | Account | Path | Expected |
|-------|---------|------|----------|
| **J-HRM-05** | `ceo@xe.vn` | `GET …/recruitment/requisitions/{id from list}?company_id=main` | **200** `HRM-REC-200` |
| **J-HRM-06** | `ceo@xe.vn` | `GET …/attendance/records/{id from list}?company_id=main` | **200** `HRM-ATT-200` |
| **AC-CRUD-HRM-REC-G-RD-01** | Group CEO | Same as J-HRM-05 | **PASS** |
| **AC-CRUD-HRM-ATT-G-RD-01** | Group CEO | Same as J-HRM-06 | **PASS** |

## Residual (not in scope)

| Defect | Priority | Notes |
|--------|----------|-------|
| **D-CRUDMAT-REC-U-01** | P2 | `PATCH …/requisitions/:id` still 404 — headcount-proposals PATCH works; separate wave |
| **D-CRUDMAT-INS-RD-01** | P3 | Insurance GET-by-id optional deep link |

## ack_status

**READY_FOR_QA**
