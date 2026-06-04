# P1-EX-BE-HTTPS-J-HRM-06-SCOPE-PARITY-03 — Employee get-by-id scope parity

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-J-HRM-06-SCOPE-PARITY-03` |
| from_role | `dev-be` |
| to_role | `qa` |
| execution_time_utc | `2026-05-29` |
| ack_status | **READY_FOR_QA** |

## Problem

QA R5 (`docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r5-20260529.md`): attendance list → employee detail on HTTPS pilot.

- UI: «Không tìm thấy nhân viên»
- API: `GET /api/hrm/employees/00000000-0000-4000-8000-000000000002?company_id=main` → **409** `SCOPE_CONTEXT_MISMATCH`
- Root cause: portal embed sends `x-tenant-id: main` (and URL `tenantId=main`) while JWT carries `tenantId=xevn` — `resolveScopeContext` rejected before `getEmployeeById` SQL scope rollup ran.

## Fix

`apps/api/hrm-api/src/common/scope-context.ts`:

- `normalizePortalScopeRequest`: when JWT tenant is `xevn` and request tenant is `main` (operating company bucket echoed as tenant), map request tenant → `xevn` per ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.
- Does **not** widen member-tenant scope; only master tenant + `main` alias.

`apps/api/hrm-api/src/common/hrm-list-scope.ts`: export `MASTER_TENANT_ID` for shared constants.

## Regression tests

| Spec | Case |
|---|---|
| `scope-context.spec.ts` | group CEO JWT + `tenantId=main` header → scope `{ tenantId: xevn, companyId: main }` |
| `employees.controller.spec.ts` | `getEmployeeById` with Bearer + `x-tenant-id: main` → `HRM-EMP-200`, service invoked |
| `employees.service.spec.ts` | existing group CEO `company_id=main` rollup (unchanged) |

## Verification (local)

```bash
cd apps/api/hrm-api
pnpm exec jest src/common/scope-context.spec.ts src/employees/employees.controller.spec.ts src/employees/employees.service.spec.ts
```

Result: **PASS** (all targeted suites).

## QA retest (HTTPS pilot)

Account: `ceo@xe.vn` / `Xevn@2026` · `https://14-225-217-232.nip.io`

1. **J-HRM-06 L2.5:** `/hr/attendance?portal=1&companyId=main` → click row → employee profile (no not-found).
2. **CC iframe:** `/command-center/hrm/attendance` → same list→detail path.
3. **API:** `GET /api/hrm/employees/{id}?company_id=main` with portal session → **200** `HRM-EMP-200` (not 409).

**Deploy note:** hrm-api image/restart required on pilot VPS before UI retest.

## completion_report

- **Closed:** `SCOPE_CONTEXT_MISMATCH` on employee get-by-id when portal sends `x-tenant-id: main` with group CEO JWT `tenantId=xevn`; controller reaches existing list/detail scope rollup.
- **Residual:** Pilot deploy + QA L2.5 browser confirmation; unrelated probe failures (J-CC-03, P-CC-04c) out of scope.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R6
from_role: pm
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-be-https-j-hrm-06-scope-parity-03-20260529.md READY_FOR_QA; hrm-api deployed on https://14-225-217-232.nip.io
exit_criteria: J-HRM-06 L2.5 PASS — attendance list click → GET /api/hrm/employees/:id?company_id=main returns 200 HRM-EMP-200 for ceo@xe.vn; UI profile renders (no «Không tìm thấy nhân viên») on /hr and CC iframe; P-CC-07 still PASS
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r6-20260529.md
ack_status: PASS_TO_PM
```
