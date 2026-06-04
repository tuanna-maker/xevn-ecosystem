# P1-EX-BE-HTTPS-ATTENDANCE-CONTRACT-01

- work_item_id: `P1-EX-BE-HTTPS-ATTENDANCE-CONTRACT-01`
- from_role: `pm`
- to_role: `dev-be`
- date: `2026-05-28`
- scope: `GET /api/hrm/attendance/update-requests` false `400 HRM-VAL-001` in HTTPS command-center attendance flow

## Reproduction and root cause

- Reproduced contract mismatch at code level in `ListAttendanceUpdateRequestsQueryDto` under global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`).
- Endpoint accepted `company_id`, `status`, `employee_id`, `manager_employee_id` only; common list probe keys (`page`, `page_size`, `pageSize`, `companyId`) were not declared.
- In HTTPS flow, when FE/QA sends list-style paging keys to `attendance/update-requests`, Nest validation rejects unknown fields before service executes, resulting in `400` mapped to `HRM-VAL-001`.

## Backend fix implemented

1. Hardened `ListAttendanceUpdateRequestsQueryDto` to support list-query aliases used across HRM endpoints:
   - Added `companyId` alias support with transform to `company_id`.
   - Added optional paging keys: `page`, `page_size`, `pageSize`.
   - Added scalar normalization (`pickScalar`) for array/query-parser variations.
   - Added numeric format validation (`@Matches(/^\d+$/)`) to keep deterministic contract.
2. Added regression coverage for this DTO in HTTPS validation suite:
   - `src/common/hrm-query-validation-regression.spec.ts` now asserts `company_id=main` + `page_size/pageSize` passes with whitelist+forbid enabled.

## Expected query contract (after fix)

`GET /api/hrm/attendance/update-requests`

Required:
- `company_id` (string, supports `main`)

Optional filters:
- `status`: `pending | approved | rejected`
- `employee_id`: UUID
- `manager_employee_id`: UUID

Optional paging-compatible keys (accepted to avoid false validation failures):
- `page`: numeric string
- `page_size`: numeric string
- `pageSize`: numeric string alias
- `companyId`: alias for `company_id`

Note: service behavior for update-requests remains filter-first list response (`total`, `data`); this fix addresses validation-contract compatibility and removes false 400 pre-service rejects.

## Verification evidence

Command:

```bash
pnpm --filter hrm-api test -- attendance.service.spec.ts hrm-query-validation-regression.spec.ts
```

Result:
- Test Suites: `2 passed, 2 total`
- Tests: `12 passed, 12 total`

## Handoff status

- ack_status: `READY_FOR_QA`
- evidence_path: `docs/qa/evidence/p1-ex-be-https-attendance-contract-01-20260528.md`
- pm_dispatch_hint: QA should retest HTTPS command-center attendance `GET /attendance/update-requests` with `company_id=main` plus paging aliases to confirm no `HRM-VAL-001`.
