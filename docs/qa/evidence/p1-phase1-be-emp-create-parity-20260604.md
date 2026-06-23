# BE evidence — P1-PHASE1-BE-EMP-CREATE-PARITY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-BE-EMP-CREATE-PARITY-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **root_cause** | `POST /api/hrm/employees` inserted `company_id=main` without `resolveHrmPersistCompanyIdText` and without `custom_fields.tenant_id` — list/get use `resolveHrmListScope` (group rollup slugs + tenant partition; member `tenant_id` filter). |
| **fix** | `employees.service.createEmployee` maps group CEO `main` → `holding`, stamps `tenant_id` for master/member scope; controller + spreadsheet import pass auth/tenant context. |

## Code touchpoints

- `apps/api/hrm-api/src/employees/employees.service.ts` — persist + tenant stamp
- `apps/api/hrm-api/src/employees/employees.controller.ts` — pass `authorization`, `toHrmListScopeContext(tenantId)`
- `apps/api/hrm-api/src/spreadsheet/spreadsheet.service.ts` — import commit parity
- `apps/api/hrm-api/src/employees/employees.service.spec.ts` — regression cases

## Verification (local)

```bash
pnpm --filter hrm-api test -- employees.service.spec.ts employees.controller.spec.ts
```

| Check | Result |
|-------|--------|
| Jest `employees.service.spec.ts` + `employees.controller.spec.ts` + `hrm-list-scope.spec.ts` | **33/33 PASS** |
| Jest `p1-phase1-be-emp-create-parity.spec.ts` (HTTP create→GET→PATCH→list) | **2/2 PASS** |
| `pnpm --filter hrm-api build` | **PASS** |
| Pilot probe `tmp-p1-phase1-member-hrm-cu-probe.mjs` (nip.io, pre-deploy) | **FAIL** 3 — employee PATCH/GET **404** (stale `hrm-be`); contract GET detail **404** (separate) |

## QA re-run

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs
```

Expect exit **0**, `MEM-CRUD-02 employee POST/PATCH`, `J-HRM-02 scope parity GET` **PASS**.

**Deploy note:** nip.io requires **hrm-be** redeploy with this build before probe PASS on pilot.

## completion_report

- Closed phantom `HRM-EMP-201` create: persist/read aligned with list scope (ADR TEXT create pattern).
- Residual: pilot PASS depends on **devops** `hrm-be` redeploy; spreadsheet import only fixed when auth headers present.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-CRUD-JOURNEY-03
from_role: pm
to_role: qa
entry_criteria: dev-be READY_FOR_QA docs/qa/evidence/p1-phase1-be-emp-create-parity-20260604.md — employee create scope_parity fix merged/deployed to pilot hrm-be.
exit_criteria: PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs exit 0; MEM-CRUD-02 Create PASS; J-HRM-02 PASS; promote AC-CRUD-HRM-EMP-M-C-01; PASS_TO_PM with evidence path.
evidence_path: docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md
ack_status target: PASS_TO_PM
```
