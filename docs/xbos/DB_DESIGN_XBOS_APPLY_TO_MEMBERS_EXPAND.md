# DB_DESIGN — XBOS apply-to-members expand (E-XBOS-CTRL-SPEC)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-ERP-XBOS-CTRL-SPEC-01` |
| **change_mode** | ADD · **no DDL G1** |
| **ref_srs** | XBOS-DM-HRM-07 · BR-XBOS-CTRL-01..04 (TechSpec) · **PENDING_SYNTH** BA formal |
| **ref_techspec** | `docs/xbos/TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| **ref_api** | `docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| **parent_db** | `docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md` (L0 SoT — must_keep) |
| **consumer_db** | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` · `DB_DESIGN_HRM_SETTINGS_E1B.md` §3.1 |
| **Date** | 2026-07-28 |

---

## 1. Verdict — physical schema

| Question | Answer |
|----------|--------|
| New XBOS policy table? | **No for G1** — allow-list is application constant + optional alias map in code |
| Alter `config_catalogs` / items? | **No** — fan-out already upserts via publish |
| Migration path G1 | **None** — code-only allow-list expand after sponsor chốt |
| Optional P2 table | `config_catalog_apply_allowlist` (tenant-scoped policy) — **HOLD**; not required for Tier B |

**Rationale:** Runtime already copies L0 rows per `(tenant_id, company_id, catalog_key)`. Expanding keys only widens which `catalog_key` values may be copied — no new columns.

---

## 2. Reused physical model (must_keep)

| Table | Role in apply |
|-------|----------------|
| `public.config_catalogs` | Source + target headers; UNIQUE `(tenant_id, company_id, catalog_key)` |
| `public.config_catalog_items` | Source items copied to target partition |
| `public.catalog_audit_logs` | Audit via publish path (`publish_upsert` / related action) |
| HRM `synced_catalogs` | **Consumer** after pull — not written by apply |
| HRM `hrm_catalog_extension_*` | L2a — unchanged |

Partition identity: **`(tenant_id, company_id, catalog_key)`** with `company_id` = Plane B slug / `holding` — **forbidden** LE UUID.

---

## 3. Logical policy artifact (not a table)

### 3.1 Allow-list phases (BA SoT)

| Phase | Storage | Keys |
|-------|---------|------|
| AS-IS | Nest const `APPLY_TO_MEMBERS_CATALOG_ALLOWLIST` | `job_titles`, `recruitment_channels`, `job_grades` |
| **P0** | Same const (expand) | + `departments`, `leave_types` |
| **P1** | Same const (expand) | + `contract_types`, `employment_types`, `pay_types`, `shifts`, `decision_types` |
| **P2 HOLD** | N/A | `salary_components`, `insurers`, `insurance_types`, `kpi_library`, … |

### 3.2 Alias → allow-list canonical (logical)

| Alias (input) | Canonical for allow-list check |
|---------------|--------------------------------|
| `positions`, `employee_positions` | `job_titles` |
| `department_catalog`, `org_departments` | `departments` |
| `candidate_sources` | `recruitment_channels` |
| `grades` | `job_grades` |
| `employment_type` | `employment_types` |
| `hr_decision_types` | **`decision_types`** (BA) |
| `component_types`, `pay_natures` | `pay_types` |
| `payroll_components` | **P2 HOLD** |

**Write key:** copy **source L0 `catalog_key` as-is** (SA-DEC-WRITE-01) — if holding already stores DEC under `hr_decision_types`, members receive that key (no DDL rename).

### 3.3 Alignment with HRM E1-B bucket matrix

| E1-B `#` | Canonical Settings key | Apply phase |
|----------|------------------------|-------------|
| 1 | `job_titles` | AS-IS / P0 |
| 2 | `departments` | **P0** |
| 3 | `leave_types` | **P0** |
| 4 | `decision_types` / live `hr_decision_types` | **P1** (+ SA-DEC-WRITE-01) |
| 5 | `contract_types` | **P1** |
| 6 | `employment_types` | **P1** |
| 7 | `shifts` | **P1** (catalog only; ≠ `work_shifts` TX) |
| 8 | `job_grades` | AS-IS / P0 |
| 9 | `recruitment_channels` | AS-IS / P0 |
| 10 | `pay_types` | **P1** |
| 11 | `salary_components` | **P2 HOLD** |

---

## 4. Data interaction (apply)

```text
READ  config_catalogs + items  WHERE scope = source (tenant, company, key)
FOR each target IN targets|memberCompanyIds:
  UPSERT config_catalogs (target scope, same key)
  REPLACE/UPSERT config_catalog_items (target)
  INSERT catalog_audit_logs (publish semantics)
```

| Field | Source → Target |
|-------|-----------------|
| `catalog_key` | Same storage key (after alias normalize) |
| `name`, `domain`, `assigned_to` / `assignedTo` | Copied from source |
| `items[].code/label/status` | Copied |
| `version` / `checksum` | Recomputed per publish rules |

---

## 5. Validation rules (DB plane)

| ID | Rule | Fail |
|----|------|------|
| **VAL-XBOS-CTRL-DB-01** | Source header must exist for storage key | API 404 `XBOS-CFG-001` |
| **VAL-XBOS-CTRL-DB-02** | Target `company_id` ∈ known member slug set or valid cross-tenant pair | API 400 `XBOS-VAL-011/012` |
| **VAL-XBOS-CTRL-DB-03** | UNIQUE scope×key preserved | Upsert not duplicate insert |
| **VAL-XBOS-CTRL-DB-04** | No LE UUID in `company_id` | Reject at API normalize |

---

## 6. Optional P2 physical policy (HOLD — not G1)

If product later needs per-tenant allow-list without deploy:

| Column | Type | Notes |
|--------|------|-------|
| `tenant_id` | TEXT | PK part |
| `catalog_key` | TEXT | PK part |
| `enabled` | BOOLEAN | default true |
| `updated_at` | TIMESTAMPTZ | |

**Do not create in G1.** Constant is SoT until P2 ADR.

---

## 7. Migration path

| Wave | DDL | Code |
|------|-----|------|
| SPEC (this) | None | None |
| G1 Dev | None | Expand const + alias normalize + OpenAPI text |
| G2 HRM | None unless pull key reject | Assert/pull family if gap |
| P2 | Optional allow-list table | ADR required |

---

## 8. Acceptance (DB)

| Check | PASS |
|-------|------|
| No new migration file required for Tier B | Design review |
| After G1 apply `departments` — member row in `config_catalogs` | SQL / API |
| HRM L1 unchanged until pull | Design |
| Settings pair files not wiped | must_keep |

---

## 9. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| L0 unique scope×key | DDL rename `hr_decision_types` → `decision_types` |
| Plane B partition | LE UUID as catalog `company_id` |
| Publish checksum semantics | Invent parallel apply table for G1 |
| E1-B alias families | Fan-out Tier C without cohort |
