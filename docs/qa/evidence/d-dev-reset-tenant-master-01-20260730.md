# D-DEV-RESET-TENANT-MASTER-01 — Dev DB tenant-master reset

**Date:** 2026-07-30  
**Owner:** devops  
**Sponsor lock:** bootstrap dev (U65 FE-first re-test)  
**Script:** `scripts/reset-dev-tenant-master-only.mjs` · `pnpm run reset:dev:tenant-master`

## Commands (exit codes)

| Step | Command | Exit |
|------|---------|------|
| Dry-run probe | `ALLOW_DEV_TENANT_MASTER_RESET=true node scripts/reset-dev-tenant-master-only.mjs --dry-run` | 0 |
| HRM+XBOS wipe | `ALLOW_DEV_TENANT_MASTER_RESET=true node scripts/reset-dev-tenant-master-only.mjs --skip-bootstrap` | 0 (partial — bootstrap skipped after first run) |
| migrate hrm | `node scripts/migrate-apply.mjs hrm --repair-checksums` | 0 (4 applied, 16 checksum repaired) |
| migrate xbos | `node scripts/migrate-apply.mjs xbos --repair-checksums` | 0 |
| seed org | `npm run seed:org` (apps/api/xbos-api) | 0 |
| seed tenant CEOs | `pnpm run seed:tenant-ceos` | 0 |
| L0 stack | `pnpm run qc:dev-stack` | **functional PASS** — hrm/xbos/portal HTTP 200; Node UV_HANDLE_CLOSING crash on Windows exit (3221226505), ignored |

## Before / after counts

| Table | Before | After |
|-------|--------|-------|
| **HRM** employees | 1192 | **0** |
| employee_contracts | 1300 | **0** |
| hrm_seed_metadata | 18337 | **0** |
| attendance_records | 13303 | **0** |
| payroll_periods | 119 | **0** |
| company_slug_map | (kept) | kept |
| **XBOS** xbos_legal_entity | 5 | **5** |
| xbos_org_unit | 24 | **24** |
| xbos_tenant_registry | 5 | **5** |
| xbos_user_tenant_membership | 11 | **11** (6 tenant CEOs + admin/super dev) |
| asset_registry | 3 | **0** |
| xbos_legal_entity_shareholder | 3 | **0** |

## Kept vs wiped

- **HRM KEEP:** `company_slug_map`, `schema_migrations`
- **HRM WIPE:** 90 transactional tables (employees, contracts, payroll, attendance, leave, recruitment, insurance, performance, seed metadata, catalog extensions, …)
- **XBOS KEEP:** org-foundation (`xbos_legal_entity`, `xbos_org_unit`, `xbos_tenant_registry`, `xbos_user_tenant_membership`, `xbos_position_template`, `xbos_business_master_entries`), `config_catalogs` / `config_catalog_items`, RACI baseline (`raci_*`, `xbos_cc_permission_matrix_cell`)
- **XBOS WIPE:** 27 transactional tables (assets, shareholders, workflow instances, KPI actuals, portal users/alerts, audit logs, …)

## CEO mobile auth

- **Decision:** portal-only — no HRM `employees` row for `ceo@xe.vn` after wipe.
- **Before:** 1 employee row (id `678b9cb2-c59a-4b1e-b257-ce93033ba2f3`) removed by TRUNCATE cascade.
- **Reference hash** (if row needed later): `sha256('ceo@xe.vn:Xevn@2026')` = `f1486b463d0a7045f3e6da9de3e81663df7640d97b11da29f5c67c4003546183` per `mobile-auth.service.ts`.

## Not run (per dispatch)

- `seed:hrm:1000-uat`, `seed:hrm:fidelity`, `seed-hrm-100-employees`, `reset-hrm-realistic-workforce`
- No `:8088` deploy (HOLD_DEPLOY)

## Tenant CEO memberships (post seed:tenant-ceos)

| user_id | tenant | role |
|---------|--------|------|
| ceo@xe.vn | xevn | group_ceo |
| du-lich.ceo@xe.vn | xe-du-lich | subsidiary_ceo |
| du-lich.hr@xe.vn | xe-du-lich | HRBP_MANAGER |
| vietnam.ceo@xe.vn | xe-vietnam | subsidiary_ceo |
| tmdv.ceo@xe.vn | xe-tmdv | subsidiary_ceo |
| visun.ceo@xe.vn | visun | subsidiary_ceo |

Portal login: `ceo@xe.vn` / `Xevn@2026`

## Residual

- Re-run full one-shot: `ALLOW_DEV_TENANT_MASTER_RESET=true pnpm run reset:dev:tenant-master` (script now uses direct migrate+seed:org; avoids `bootstrap:xbos:no-health` spawn issue on OneDrive Unicode path).
- If mobile login for group CEO needed: dispatch `D-BE-MOB-AUTH-CEO-HASH-01` only if FE mobile path requires HRM employee row.

## ack_status

**PASS_TO_PM**
