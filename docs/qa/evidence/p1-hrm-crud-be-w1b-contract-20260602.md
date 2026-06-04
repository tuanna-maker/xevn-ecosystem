# P1-HRM-CRUD-BE-W1B-CONTRACT Evidence

- Work item: `P1-HRM-CRUD-BE-W1B-CONTRACT`
- Date: 2026-06-02

## Contract outcomes

- `POST /api/hrm/recruitment/candidates` now supports candidate-pool create when `requisition_id` is omitted; requisition flow remains unchanged when `requisition_id` exists.
- Added candidate-pool CRUD routes:
  - `PATCH /api/hrm/recruitment/candidates-pool/:candidateId`
  - `DELETE /api/hrm/recruitment/candidates-pool/:candidateId`
- Added payment actions for FE stubs:
  - `POST /api/hrm/payroll/payment-batches/:batchId/records`
  - `POST /api/hrm/payroll/payment-batches/:batchId/records/:recordId/process`
  - `POST /api/hrm/payroll/payment-batches/:batchId/process`
- Payment batch aggregate counters/status are refreshed after add/process actions.

## Request/response examples

1) Candidate pool create via unified candidate endpoint

Request body:
`{"company_id":"main","full_name":"Pool Candidate","email":"pool@xe.vn","source":"career_page","stage":"applied"}`

Expected envelope:
`{"code":"HRM-REC-CP-201","message":"Candidate pool row created","data":{"id":"<uuid>","company_id":"holding|member-slug","full_name":"Pool Candidate"}}`

2) Candidate pool delete

Request:
`DELETE /api/hrm/recruitment/candidates-pool/<candidateId>?company_id=main`

Expected envelope:
`{"code":"HRM-REC-CP-200","message":"Candidate pool row deleted","data":{"id":"<candidateId>"}}`

3) Add payment record

Request body:
`{"company_id":"main","employee_code":"NV001","employee_name":"Nguyen Van A","amount":12000000}`

Expected envelope:
`{"code":"HRM-PB-201","message":"Payment record added","data":{"id":"<recordId>","status":"pending"}}`

4) Process single payment record

Request:
`POST /api/hrm/payroll/payment-batches/<batchId>/records/<recordId>/process?company_id=main`

Expected envelope:
`{"code":"HRM-PB-202","message":"Payment record processed","data":{"id":"<recordId>","status":"paid"}}`

5) Process all payment records in batch

Request:
`POST /api/hrm/payroll/payment-batches/<batchId>/process?company_id=main`

Expected envelope:
`{"code":"HRM-PB-202","message":"Payment batch processed","data":{"batch":{"id":"<batchId>","status":"processing|completed"},"processed_records":<n>}}`

## Verification pass table

| Check | Command | Result |
|---|---|---|
| Recruitment + payroll controller contracts | `pnpm --filter hrm-api test -- recruitment.controller.spec.ts recruitment-catalog.service.spec.ts payroll.controller.spec.ts` | PASS (19/19) |
| Recruitment + payroll service regression | `pnpm --filter hrm-api test -- recruitment.service.spec.ts payroll.service.spec.ts` | PASS (18/18) |
| Lint for touched files | IDE diagnostics | PASS (no new lint errors) |

## Residuals

- No blocking backend residual found for this scoped contract patch.
- FE integration should replace payment stub throws with the new endpoints and align candidate create form to optional `requisition_id` flow.
