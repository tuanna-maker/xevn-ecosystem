# P1-EX-BE-HTTPS-BROWSER-AUTH-01C

- work_item_id: `P1-EX-BE-HTTPS-BROWSER-AUTH-01C`
- from_role: `pm`
- to_role: `dev-be`
- date: `2026-05-28`
- scope: Browser auth/session propagation hotfix for HRM list APIs (`company_id=main`)

## Problem (before)

Controllers accepted only direct `Authorization: Bearer ...` or `x-internal-api-key`.
When browser/proxy propagated session token via fallback transport (e.g. `x-access-token`/portal cookie), auth check failed with `HRM-AUTH-001 (401)` before scope/list execution.

Example pre-fix gate:

```ts
if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
  throw new ApiException('HRM-AUTH-001', 'Unauthorized ... access', HttpStatus.UNAUTHORIZED);
}
```

## Fix implemented (after)

### 1) Normalize browser session token sources

Updated `src/common/internal-auth.ts`:
- Added case-insensitive bearer parsing (`bearer ...` + trim safe).
- Added `resolveAuthorizationHeader(...)` to normalize JWT from:
  - `authorization`
  - `x-access-token`
  - `x-portal-access-token`
  - `x-auth-token`
  - `cookie` key `xevn.portal.accessToken`

### 2) Apply normalization on target list endpoints

Updated controllers to resolve effective auth header before `assertAccess` and `resolveScopeContext`:
- `src/contracts-insurance/contracts-insurance.controller.ts`
  - `GET /contracts-insurance/contracts`
  - `GET /contracts-insurance/insurance`
- `src/recruitment/recruitment.controller.ts`
  - `GET /recruitment/requisitions`
  - `GET /recruitment/candidates`
- `src/attendance/attendance.controller.ts`
  - `GET /attendance/records`
- `src/payroll/payroll.controller.ts`
  - `GET /payroll/payslips`

## Before/after snippet

Before:

```ts
this.assertAccess(authorization, internalApiKey);
resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
return this.service.listContracts(query, authorization, toHrmListScopeContext(tenantId));
```

After:

```ts
const authHeader = resolveAuthorizationHeader(authorization, headers);
this.assertAccess(authHeader, internalApiKey);
resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
return this.service.listContracts(query, authHeader, toHrmListScopeContext(tenantId));
```

## Regression verification

Command:

```bash
pnpm --filter hrm-api test -- contracts-insurance.controller.spec.ts recruitment.controller.spec.ts attendance.controller.spec.ts payroll.controller.spec.ts
```

Result:

- Test suites: `4 passed`
- Tests: `30 passed`
- Exit code: `0`

Added regression assertions for fallback browser token transport:
- `contracts-insurance.controller.spec.ts`
  - accepts `x-access-token` for `listContracts` + `listInsurance`
- `recruitment.controller.spec.ts`
  - accepts `x-access-token` for `listJobRequisitions`
- `attendance.controller.spec.ts`
  - accepts `x-access-token` for `listRecords`
- `payroll.controller.spec.ts`
  - accepts `x-access-token` for `listPayslips`

## Endpoint verdict (post-fix)

With valid JWT propagated via browser fallback header (`x-access-token`) and `company_id=main`, target list endpoints pass auth path (non-401):

1. `GET /api/hrm/contracts-insurance/contracts` -> non-401 (controller spec pass)
2. `GET /api/hrm/contracts-insurance/insurance` -> non-401 (controller spec pass)
3. `GET /api/hrm/recruitment/requisitions` -> non-401 (controller spec pass)
4. `GET /api/hrm/attendance/records` -> non-401 (controller spec pass)
5. `GET /api/hrm/payroll/payslips` -> non-401 (controller spec pass)

## Residual / follow-up

- Runtime HTTPS pilot smoke should be re-run by QA lane to confirm environment token/secret parity remains aligned (`READY_FOR_QA` handoff).

ack_status: `READY_FOR_QA`
