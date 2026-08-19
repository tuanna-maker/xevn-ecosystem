# DB_DESIGN — HRM Company Management display fields (Plane A legal entity)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-CO-INDUSTRY-SA-01` |
| **change_mode** | ADD |
| **ref_srs** | `docs/hrm/SRS.md` **UC-HRM-CO-01** — Data Interaction «Danh sách ĐVTV (tên, MST, founded, …)» · profile Plane A |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§20** · CO-BIND · §19 (headcount orthogonal) |
| **ref_xbos** | `docs/xbos/TECHSPEC.md` FR-XBOS-ORG-01 / FR-XBOS-ORG-03 · `xbos_legal_entity` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` (physical column contract) |
| **U71** | Physical DB slice **before** Dev feature claim on industry bind |
| **Date** | 2026-07-27 |

> Company UI **reads** XBOS legal entity for profile columns. Workforce counts = Plane B (`employees`) — see `DB_DESIGN` / TechSpec §19; **not** this slice.

---

## 1. Table SoT

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`xbos_legal_entity`** |
| Owner service | XBOS (`xbos-api` org-foundation / foundation-schema) |
| Consumers | HRM embed CompanyManagement (via tenant-scope + legal-entities) · Command Center legal profile |

---

## 2. Columns used by Company display (physical)

| Column | Type | Null | Meaning (VI) | Company UI | `ref_srs` |
|--------|------|------|--------------|------------|-----------|
| `id` | UUID PK | NO | Khóa pháp nhân Plane A | Row `id` (members); holding may use synthetic UI id | UC-HRM-CO-01 identity |
| `tenant_id` | TEXT | NO | Partition tenant | Bridge / enrich match | UC-HRM-CO-01 · BR-INT-05 |
| `company_id` | TEXT | NO | Partition trong tenant (`holding` / `main` / member default) | Scope legal GET | FR-XBOS-ORG-03 |
| `code` | TEXT | NO | Mã pháp nhân ổn định | Cột / form mã | UC-HRM-CO-01 list |
| `name` | TEXT | NO | Tên pháp nhân | Cột tên | UC-HRM-CO-01 list |
| **`entity_type`** | TEXT NOT NULL DEFAULT `'subsidiary'` | NO | **Loại ĐVTV** trong tập đoàn (`holding` \| `subsidiary` …) — **không** phải ngành nghề | Optional separate label only | UC-HRM-CO-01 profile (classification) |
| **`business_lines`** | TEXT | YES | **Ngành nghề / lĩnh vực kinh doanh** (catalog key hoặc free text VI) | UI «Ngành nghề» SoT | UC-HRM-CO-01 Data Interaction profile |
| `tax_code` | TEXT | YES | MST | Cột MST | UC-HRM-CO-01 · CO-BIND |
| `established_at` | DATE | YES | Ngày thành lập (calendar) | `founded_date` | UC-HRM-CO-01 · ADR date |
| `address` | TEXT | YES | Địa chỉ | Cột địa chỉ | UC-HRM-CO-01 |
| `charter_capital` | NUMERIC | YES | Vốn điều lệ | CC / legal form (not industry) | FR-XBOS-ORG-03 |
| `legal_representative` | TEXT | YES | Người đại diện | Legal form | FR-XBOS-ORG-03 |
| `status` | TEXT | NO | active / deleted | Filter deleted out of list | — |
| `payload` | JSONB | NO | `companyForm` (email, phone, website, **industry** fallback) | Enrich when column empty | CO-BIND · UC-HRM-CO-01 |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | Audit | — | — |

### 2.1 Semantic anti-confusion (normative)

| Column | IS | IS NOT |
|--------|----|--------|
| **`business_lines`** | Industry / business line for «Ngành nghề» | Org role (`holding`/`subsidiary`) |
| **`entity_type`** | Org classification of legal entity in group | Industry / sector label |

**FAIL DB semantics if product treats `entity_type` as industry SoT.**

### 2.2 `business_lines` value contract

| Form | Example | UI rule |
|------|---------|---------|
| Catalog key | `logistics`, `tourism` | Map → VI per TechSpec §20.3 |
| Free text VI | `Vận tải hàng hóa đường bộ` | Display as-is |
| NULL / empty | — | UI «—» / `-` (honest empty) |
| Mis-stored entity_type token | `subsidiary` | Treat as invalid for industry display → «—» + fix data/bind |

### 2.3 `payload.companyForm` fallback keys (not separate columns)

| JSON path | Role |
|-----------|------|
| `payload.companyForm.industry` | Fallback industry when `business_lines` NULL |
| `payload.companyForm.businessLines` / `business_lines` | Same fallback family |
| `payload.companyForm.companyEmail` / `hotline` / `website` / `headOfficeAddress` | Contact / address enrich (CO-BIND) |

**Write path preference:** persist industry to **`business_lines`** column on legal-entity upsert (`businessLines` DTO); keep payload in sync only if product already dual-writes.

---

## 3. Indexes / constraints (existing — no migrate required for this slice)

| Constraint | Purpose |
|------------|---------|
| `UNIQUE (tenant_id, company_id, code)` | Stable LE identity |
| PK `id` | UUID join from group-member-units |
| Default `entity_type = 'subsidiary'` | Member LE classification — **not** industry default |

**This ADD does not require a new migration** if `business_lines TEXT` already ensured by `FoundationSchemaService` / seed ALTER. Dev must verify column exists on target env before claiming bind PASS.

---

## 4. Dual-plane note

```text
Plane A (this table): name, tax_code, established_at, business_lines, entity_type
Plane B (employees):  company_id = operating slug → employee_count (TECHSPEC §19)
```

Joining industry to headcount is **forbidden**. Industry never lives on `employees`.

---

## 5. Acceptance for Dev/QA (DB plane)

| Check | PASS |
|-------|------|
| Column `business_lines` present on `xbos_legal_entity` | `\d` / information_schema |
| Sample LE: industry text ≠ `entity_type` when both set | SQL spot |
| Deleted LE excluded from Company list joins | `status IS DISTINCT FROM 'deleted'` |

---

## 6. Out of scope

- New `xbos_industry_catalog` table (optional future; catalog today = FE/i18n keys)
- Changing default `entity_type`
- HRM Prisma model owning legal industry
