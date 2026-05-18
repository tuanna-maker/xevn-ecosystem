# TECHSPEC — RACI Governance (X-BOS)

## 1. Schema

### `raci_catalog_version`
- `id` UUID PK
- `tenant_id` TEXT
- `version_label` TEXT (e.g. `2026-05-xevn`)
- `source_ref` TEXT — path tài liệu gốc
- `status` active | archived
- `created_at`

### `raci_activity_catalog`
- `id` UUID PK
- `tenant_id` TEXT
- `catalog_version_id` UUID FK
- `activity_code` TEXT — `HCNS-020`
- `domain_code` TEXT — `phong_hcns`
- `domain_label` TEXT — `Phòng HCNS`
- `seq_no` INT
- `name` TEXT
- `default_matrix` JSONB — optional template letters per column from group file
- UNIQUE (`tenant_id`, `catalog_version_id`, `activity_code`)

### `raci_ecosystem_capability`
- `id` UUID PK
- `tenant_id` TEXT
- `activity_id` UUID FK
- `module_code` TEXT
- `feature_code` TEXT
- `permission_code` TEXT nullable
- `workflow_id` TEXT nullable
- `api_route` TEXT nullable
- `raci_letter_required` TEXT — `R` | `A` | `*` 
- `status` active | planned
- `metadata` JSONB

### `company_raci_matrix_cell`
- `id` UUID PK
- `tenant_id` TEXT
- `company_id` TEXT
- `activity_id` UUID FK
- `org_column_id` TEXT — matches `RaciOrgColumnId`
- `raci_letters` TEXT
- `source` group_template | company_override
- UNIQUE (`tenant_id`, `company_id`, `activity_id`, `org_column_id`)

### `company_raci_column_binding`
- `company_id`, `org_column_id`, `position_template_id` (nullable), `org_unit_id` (nullable)

### `raci_matrix_audit_log`
- append-only changes to matrix cells

## 2. API (NestJS `raci-governance`)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/raci-governance/activities` | List catalog (filter domain, q) |
| GET | `/raci-governance/matrix` | Merged template + company cells |
| PUT | `/raci-governance/matrix/cell` | Upsert one cell |
| GET | `/raci-governance/capabilities` | By activity_id or domain |
| GET | `/raci-governance/coverage` | Stats per company |

Headers: `x-tenant-id`, `x-company-id`, internal auth như các module XBOS khác.

## 3. Import script

`scripts/seed-raci-activity-catalog.mjs`:
- Parse `docs/ma trận chức năng RACI.md`
- 18 columns aligned with `RACI_ORG_COLUMNS`
- Upsert version + activities + optional default_matrix JSONB

## 4. UI

`CompanyRaciPanel.tsx` — 3 tabs:
1. `matrix` — virtualized grid
2. `capabilities` — coverage + table
3. `bindings` — column ↔ position

Data: `raciGovernanceApi.ts` → XBOS proxy (vite) hoặc trực tiếp port 28002.

## 5. Evolution P2

- Trigger sync `xbos_permission_grant` from matrix
- Event bus: `raci.cell.updated` → workflow engine
