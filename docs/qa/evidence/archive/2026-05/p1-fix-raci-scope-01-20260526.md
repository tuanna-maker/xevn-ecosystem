# P1-FIX-RACI-SCOPE-01 — RACI member legal-entity matrix scope

| Field | Value |
|-------|--------|
| **work_item_id** | P1-FIX-RACI-SCOPE-01 |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | READY_FOR_QA |
| **QC ref** | C-QC02-04 |
| **Date** | 2026-05-26 |

## Defect (before)

Group CEO JWT (`tenantId=xevn`, `companyId=main`):

- `GET/PUT /api/xbos/raci-governance/companies/{memberLegalEntityUuid}/matrix` → **409** `SCOPE_CONTEXT_MISMATCH`
- `GET .../companies/main/matrix` → **200**

**Root cause:** `resolveScopeContext` compared path param UUID to JWT `companyId=main`.

## Fix

| File | Change |
|------|--------|
| `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` | `isLegalEntityUuid`, `resolveRaciMatrixJwtScope`, `assertJwtMayReadLegalEntityPartition` (UC-CC-03 / BE-W5 pattern) |
| `apps/api/xbos-api/src/raci-governance/raci-governance.controller.ts` | `resolveCompanyMatrixScope`: slug → strict scope; UUID → JWT gate + `OrgFoundationService.resolveLegalEntityPartition` → matrix `(partition.tenantId, uuid)` |
| `apps/api/xbos-api/src/raci-governance/raci-governance.module.ts` | Import `OrgFoundationModule` |

**Behavior:**

1. Path `main` / slug: unchanged `resolveScopeContext` with path key.
2. Path legal-entity UUID: JWT validated via headers (`x-tenant-id`, `x-company-id`), not path UUID; group CEO may read any member partition; matrix DB key remains UUID.

## Jest

```text
cd apps/api/xbos-api
npx jest src/raci-governance src/common/xbos-group-legal-scope.spec.ts
```

| Suite | Result |
|-------|--------|
| `xbos-group-legal-scope.spec.ts` | 8 passed |
| `raci-governance.controller.spec.ts` | 5 passed |
| **Total** | **13 passed** |

## Live probe (direct XBOS :28002, `ceo@xe.vn`)

| Probe | HTTP | Code |
|-------|------|------|
| `GET .../companies/main/matrix` | 200 | XBOS-RACI-200 |
| `GET .../companies/f01bb8dc-99fd-46bf-9653-21ae9f696e5a/matrix` (xe-tmdv member LE) | 200 | XBOS-RACI-200 |
| `PUT .../matrix/cell` + reload | SKIP | Catalog rows `seed-*` only on env — run `pnpm seed:raci:catalog` for PUT persistence probe |

Command (repro):

```bash
node -e "import('./scripts/seed-env-loader.mjs').then(...)"  # see session log 2026-05-26
```

Portal proxy (`tmp-p1-close-qa-w5b-raci-probes.mjs`): **W5B-RACI-02-MATRIX PASS** (member or main).

## QA retest

1. Restart `xbos-api` if not hot-reloaded (`pnpm run dev:xbos-api`).
2. CC → member pháp nhân → tab **Nhiệm vụ & RACI** — no 409 banner.
3. Optional: `pnpm seed:raci:catalog` then edit one cell → reload matrix (L2.5 / J-CC RACI).

## pm_dispatch_hint

None — scope-only BE fix; no seed required for 200 matrix load.
