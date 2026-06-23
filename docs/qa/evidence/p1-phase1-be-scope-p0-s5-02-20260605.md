# P1-PHASE1-BE-SCOPE-P0-S5-02 — Member CEO cross-partition restore block

| Field | Value |
|-------|-------|
| work_item_id | P1-PHASE1-BE-SCOPE-P0-S5-02 |
| defect | D-SCOPE-S5-HRM-RESTORE-01 |
| owner | dev-be |
| ack_status | **READY_FOR_QA** |
| date | 2026-06-05 |
| entry | `docs/qa/evidence/p1-phase1-qa-scope-p0-s5-20260605.md` (FAIL_TO_PM) |

## Root cause

1. **`assertResourceInHrmScope`** mapped `company_id=main` to **holding UUID** for all scopes; member CEO JWT (`companyIds: ['main']`) could pass the company guard on a **holding / xevn** row when `company_id` was stored as UUID TEXT.
2. **No tenant partition** on row-level assert — cross-tenant restore was not rejected when a row was visible.
3. **`restoreEmployee`** UPDATE used **id-only** WHERE (no list-scope filters); aligned load path duplicated `queryEmployeeById` instead of **`getEmployeeById` + assert** like `archiveEmployee`.
4. **Portal `x-tenant-id`** was not passed into restore/archive service scope context (JWT-only resolution).

## Change

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | `buildAllowedCompanyKeys` — member CEOs: no `main`→holding UUID rollup on assert; `assertResourceInHrmScope` validates `custom_fields.tenant_id` for `memberTenantId` / `masterTenantPartition` (U28-R2) |
| `apps/api/hrm-api/src/employees/employees.service.ts` | `restoreEmployee` — `getEmployeeById` (include archived) + assert + scoped UPDATE via `pushEmployeeListScopeFilters`; `archiveEmployee` accepts `scopeContext` |
| `apps/api/hrm-api/src/employees/employees.controller.ts` | Pass `toHrmListScopeContext(tenantId)` on archive/restore |
| `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` | +3 member CEO negative assert cases |
| `apps/api/hrm-api/src/employees/employees.service.spec.ts` | +2 member CEO restore negative cases |
| `apps/api/hrm-api/src/employees/employees.controller.spec.ts` | Restore passes scope context |

## Verification (local — 2026-06-05)

```bash
pnpm --filter hrm-api exec jest src/common/hrm-list-scope.spec.ts src/employees/employees.service.spec.ts src/employees/employees.controller.spec.ts
```

→ **3 suites, 44 tests, exit 0**

| Case | Expected | Jest |
|------|----------|------|
| Group CEO restore holding archived `company_id=main` | 200/201 path | PASS |
| Member CEO restore holding/xevn (not in list scope) | **404** `HRM-EMP-404` | PASS |
| Member CEO restore if row loaded (holding/xevn) | **409** `HRM-EMP-409` | PASS |
| Member assert holding slug / holding UUID / main+xevn tenant | **409** | PASS |

## QA retest (nip.io)

After **devops** `hrm-be` redeploy on pilot:

1. `ceo@xe.vn` — create → archive → restore → **201** `HRM-EMP-204`
2. `du-lich.ceo@xe.vn` — POST restore same id `?company_id=main` → **404** or **409** (not **201**)
3. `node scripts/tmp-p1-phase1-qa-scope-p0-s5-probe.mjs` — `HRM-RESTORE-MEMBER-CEO-OOS-BLOCKED` **PASS**

## Handoff

- `next_owner`: qa → devops (hrm-be nip.io redeploy if pilot image stale)
- `evidence_path`: `docs/qa/evidence/p1-phase1-be-scope-p0-s5-02-20260605.md`
- `ack_status`: **READY_FOR_QA**
