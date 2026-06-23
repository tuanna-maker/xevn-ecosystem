# HRM API — GET employee by id (`P1-S0-BE-01`)

**work_item_id:** `P1-S0-BE-01`  
**from_role:** dev-be  
**to_role:** qa  
**ack_status:** `READY_FOR_QA`  
**date:** 2026-05-23  

## Summary

Added scoped single-resource read for embed detail (HRM-EMBED-D7 hardening):

- `GET /api/hrm/employees/:employeeId?company_id={id}&include_archived=true|false`
- Envelope: `HRM-EMP-200` (found), `HRM-EMP-404` (not in company scope)
- Claim-first `resolveScopeContext` on controller (same as list/create)
- FE `getEmployeeById` in `apps/web/hrm` now calls GET-by-id (no list pagination scan)

## Contract

| Item | Value |
|------|--------|
| Method | `GET` |
| Path | `/api/hrm/employees/{employeeId}` |
| Query | `company_id` (required), `include_archived` (optional, default active-only) |
| Auth | `Authorization: Bearer` and/or `x-internal-api-key` + `x-tenant-id` |
| Success | `{ success: true, code: "HRM-EMP-200", data: Employee }` |
| Not found | `404` + `HRM-EMP-404` |
| Scope mismatch | `409` + `SCOPE_CONTEXT_MISMATCH` |

## Files

- `apps/api/hrm-api/src/employees/employees.controller.ts`
- `apps/api/hrm-api/src/employees/employees.service.ts`
- `apps/api/hrm-api/src/employees/dto/get-employee.query.dto.ts`
- `apps/api/hrm-api/src/employees/employees.controller.spec.ts`
- `apps/api/hrm-api/src/employees/employees.service.spec.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` (consumer)
- `docs/api/openapi/hrm-api.yaml`
- `scripts/lib/srs-api-map.mjs` (`HRM-EM-02A`)

## Verification

```text
pnpm --filter hrm-api test
→ Test Suites: 26 passed, 26 total
→ Tests:       110 passed, 110 total
→ exit 0
```

### QA retest hints

1. L0: `pnpm run qc:dev-stack`
2. Login `ceo@xe.vn` / `Xevn@2026`, open embed employee detail URL from `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`
3. Network should show **one** `GET /api/hrm/employees/{uuid}?company_id=main&include_archived=true` (not `page_size=100` list scan)
4. Wrong `company_id` vs JWT → `409 SCOPE_CONTEXT_MISMATCH`
5. Unknown uuid in scope → `404 HRM-EMP-404`

## Residual risk

- Multi-company membership still tries companies in order (one GET per company until hit); acceptable for pilot scope sizes.
