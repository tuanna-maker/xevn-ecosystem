# P1-PHASE1-BE-SCOPE-P0-S5-01 — Post-S5 scope parity P0 closure

| Field | Value |
|-------|-------|
| work_item_id | P1-PHASE1-BE-SCOPE-P0-S5-01 |
| owner | dev-be |
| ack_status | READY_FOR_QA |
| date | 2026-06-05 |
| entry | TM `p1-s5-tm-01-20260605.md` — TM-S5-P0-01, TM-S5-P0-02 |
| normative | `docs/architecture/PHASE1_SCOPE_PARITY_AUDIT.md` §3.1, §3.3 |

## Problem (TM S5 P0)

| ID | Gap | Risk |
|----|-----|------|
| TM-S5-P0-01 | `POST /employees/:id/restore` updated by UUID only — no `resolveHrmListScope` / `assertResourceInHrmScope` | Cross-scope restore of archived employees |
| TM-S5-P0-02 | `GET /org-foundation/legal-entities/:entityId` called `readScope` but discarded partition assert | Member CEO IDOR — 200 on other tenant legal-entity UUID |

## Change

### HRM — employee restore (P0-2 audit row)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/employees/employees.service.ts` | `restoreEmployee(employeeId, requestedCompanyId, authorization)` — `resolveHrmListScope` + scoped `queryEmployeeById` (include archived) + `assertResourceInHrmScope` before UPDATE |
| `apps/api/hrm-api/src/employees/employees.controller.ts` | Pass `scope.companyId` + `authorization` to service (parity with `archiveEmployee`) |
| `apps/api/hrm-api/src/employees/employees.service.spec.ts` | Restore holding employee under `company_id=main`; out-of-scope 404 |
| `apps/api/hrm-api/src/employees/employees.controller.spec.ts` | Assert restore passes scoped companyId |
| `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` | `employee restore scope parity` — group CEO rollup vs member CEO reject |

### XBOS — legal-entity GET partition assert (P0-1 audit row)

| File | Change |
|------|--------|
| `apps/api/xbos-api/src/org-foundation/org-foundation.controller.ts` | After `readScope`: `resolveRaciMatrixJwtScope` → `resolveLegalEntityPartition` → `assertJwtMayReadLegalEntityPartition` → `getLegalEntityById` |
| `apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts` | Partition mock + member CEO cross-tenant UUID → **409** |
| `apps/api/xbos-api/src/org-foundation/org-foundation.legal-scope-crud.integration.spec.ts` | Supertest member CEO other-tenant UUID block |
| `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts` | `org-foundation GET parity` partition assert case |

## Verification (local — 2026-06-05)

```text
pnpm --filter hrm-api exec jest src/common/hrm-list-scope.spec.ts src/employees/employees.service.spec.ts src/employees/employees.controller.spec.ts
→ Test Suites: 3 passed, Tests: 40 passed (exit 0)

pnpm --filter xbos-api exec jest src/common/xbos-group-legal-scope.spec.ts src/org-foundation/org-foundation.controller.spec.ts src/org-foundation/org-foundation.legal-scope-crud.integration.spec.ts
→ Test Suites: 3 passed, Tests: 39 passed (exit 0)
```

| Spec | New cases |
|------|-----------|
| `hrm-list-scope.spec.ts` | 21 total (+2 restore parity) |
| `xbos-group-legal-scope.spec.ts` | 17 total (+1 org-foundation GET parity) |
| `employees.service.spec.ts` | +2 restore scope |
| `org-foundation.controller.spec.ts` | +1 member cross-tenant 409 |

## Acceptance mapping

| Criterion | Result |
|-----------|--------|
| Restore holding employee with `company_id=main` scope | **PASS** (jest) |
| Restore out-of-scope id | **404** (jest) |
| Group CEO GET member legal-entity UUID | **200** (existing + partition mock) |
| Member CEO GET other tenant UUID | **409 SCOPE_CONTEXT_MISMATCH** (jest + integration) |

## Residual (out of this work_item)

- P0-3 / P0-4 from SA audit (`catalog-sync`, `settings-catalogs` batch GET) — not in TM S5 P0 entry; separate dispatch if TM/QC requires full audit closure.
- Pilot nip.io retest after **devops** redeploy `hrm-be` + `xbos-be`.

## J-* / matrix (QA retest)

- J-HRM-01/02 — employee list → detail / restore under `ceo@xe.vn` + `company_id=main`
- J-CC-03 — member legal entity GET by UUID (`du-lich.ceo@xe.vn` cross-tenant must **409**)

## Handoff

- `next_owner`: qa
- `evidence_path`: `docs/qa/evidence/p1-phase1-be-scope-p0-s5-20260605.md`
- `ack_status`: **READY_FOR_QA**
