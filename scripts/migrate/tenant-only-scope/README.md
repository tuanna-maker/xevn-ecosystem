# Tenant-only scope migration

**work_item_id:** `HRM-TENANT-ONLY-SCOPE-MIGRATE-01`  
**SPEC:** `docs/program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md`  
**ADR:** `docs/architecture/ADR-HRM-TENANT-ONLY-SCOPE-20260822.md`

## Purpose

Backfill HRM rows from legacy **OU slug** partition (`company_id=trsport|logistics|…` under `tenant_id=xevn`) to **tenant-only** partition (`tenant_id=<member>`, `company_id=main`).

## SoT

Mapping file: [`ou-to-tenant-map.json`](./ou-to-tenant-map.json)

## Scripts

| Script | Purpose |
|--------|---------|
| `load-env.mjs` | Load `deploy/xevn-ecosystem/.env` + `apps/api/hrm-api/.env` |
| `verify-counts.mjs` | Baseline / post-migrate employee counts by OU and tenant |
| `backfill-employees.mjs` | Migrate `employees` (`custom_fields.tenant_id` + `company_id=main`) |
| `backfill-scoped-tables.mjs` | ADD `tenant_id` + migrate payroll, recruitment, departments, decisions, … |
| `verify-api-scope.mjs` | AC-TOS-01/02 — login `ceo@xe.vn` / `ceo2@xe.vn` and check `GET /employees` |

## Order of execution

```bash
node scripts/migrate/tenant-only-scope/verify-counts.mjs
node scripts/migrate/tenant-only-scope/backfill-employees.mjs --dry-run
node scripts/migrate/tenant-only-scope/backfill-employees.mjs
node scripts/migrate/tenant-only-scope/backfill-scoped-tables.mjs --dry-run
node scripts/migrate/tenant-only-scope/backfill-scoped-tables.mjs
node scripts/migrate/tenant-only-scope/verify-counts.mjs
```

Enable flags (local):

- `apps/api/hrm-api/.env`: `HRM_TENANT_ONLY_SCOPE=true`, `HRM_TENANT_ONLY_LEGACY_BRIDGE=false`
- `apps/web/web-portal/.env`: `VITE_HRM_TENANT_ONLY_SCOPE=true`

Restart `hrm-api` + portal, then:

```bash
node scripts/migrate/tenant-only-scope/verify-api-scope.mjs
```

## Post-migrate verification (2026-08-22)

| Account | Expected | Result |
|---------|----------|--------|
| `ceo2@xe.vn` (visun) | `total ≥ 1` | **220** |
| `ceo@xe.vn` (group_ceo rollup) | full workforce | **1101** |

Employees: **1101** rows on `company_id=main` across 5 tenants (0 legacy OU rows).

## Rollback

Restore DB snapshot taken before migrate. Do not partial-rollback single OU without SA sign-off.
