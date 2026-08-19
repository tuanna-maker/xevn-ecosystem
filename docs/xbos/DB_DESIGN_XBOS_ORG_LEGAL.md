# DB_DESIGN — XBOS Org Legal (Plane A identity · group-member-units · documents)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-ORG-LEGAL-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | Khách `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.4 FR-XBOS-ORG-01** · **§3.5 FR-XBOS-ORG-03** · team **UC-XBOS-ORG-01** / **UC-XBOS-ORG-03** · UF-XBOS-02 / 03 / 06 · CC P0 `COMMAND_CENTER_P0_SRS.md` UC-CC-P0-02 (documents) |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§11** · **§14.4–14.5** · `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §2–4 |
| **ref_hrm_extend** | `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` (industry columns — **must_keep**, do not wipe) · dual-plane `docs/hrm/DB_DESIGN_HRM_CO_HC.md` §4 |
| **ref_api** | `docs/xbos/API_DESIGN_XBOS_ORG_LEGAL.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB spine before Dev claim on legal GET/PUT / documents / group list |
| **Date** | 2026-07-27 |
| **Owner service** | XBOS (`xbos-api` · `FoundationSchemaService` · `OrgFoundationService` · `LegalEntityProfileService`) |

> **Plane A SoT:** legal identity + ĐKKD profile + legal documents live here.  
> **Plane B (workforce):** `employees.company_id` TEXT slug — see `DB_DESIGN_HRM_CO_HC.md`. **Never** store headcount on these tables.

---

## 1. Table inventory (this slice)

| Table | Role | FR / UC |
|-------|------|---------|
| **`xbos_legal_entity`** | Hồ sơ pháp nhân / ĐKKD (Plane A PK) | FR-XBOS-ORG-01 / 03 |
| **`xbos_legal_entity_document`** | Metadata + file pointers tài liệu pháp lý | FR-XBOS-ORG-03 · UC-CC-P0-02 |
| **`xbos_tenant_registry`** (read join) | Holding + member tenants → drive `group-member-units` | FR-XBOS-ORG-01 |
| `xbos_org_unit` | Cây tổ chức / phòng ban (FK optional → LE) — **read for ORG-01 tree; mutate = FR-ORG-02 out of mutate depth here** | FR-XBOS-ORG-01 (tree) |
| `xbos_legal_entity_shareholder` | Cổ đông — **out of scope** → `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` | FR-CC-P0-01 |

Bootstrap / ensure: `FoundationSchemaService.ensureAll` · migrate ref `migrations/20260518_legal_entity_profile.sql` (documents).

---

## 2. `xbos_legal_entity` — physical columns (identity Plane A)

| Column | Type | Null | Meaning (VI) | UI / API role | `ref_srs` |
|--------|------|------|--------------|---------------|-----------|
| **`id`** | UUID PK | NO | **Khóa pháp nhân Plane A** | Path `{entityId}` · Company row key · document FK parent | FR-ORG-01 Diễn biến #5 khóa mang · FR-ORG-03 |
| `tenant_id` | TEXT | NO | Partition tenant | Headers / join registry | FR-ECO-SCOPE-02 |
| `company_id` | TEXT | NO | Partition trong tenant (`holding` / member `default_company_id`) | Scope resolve for list/PUT | FR-ORG-03 · ORG-01 |
| `code` | TEXT | NO | Mã pháp nhân ổn định | Form + list | FR-ORG-03 bắt buộc tên/mã |
| `name` | TEXT | NO | Tên pháp nhân | Form + list | FR-ORG-03 Diễn biến #3/#4 |
| **`entity_type`** | TEXT NOT NULL DEFAULT `'subsidiary'` | NO | **Loại ĐVTV** (`holding` \| `subsidiary` …) | Classification only | UC-HRM-CO-01 · **không** = ngành nghề |
| **`business_lines`** | TEXT | YES | **Ngành nghề / lĩnh vực** | Company «Ngành nghề» SoT; legal form | FR-ORG-03 · HRM §20 · **must_keep expose** |
| `tax_code` | TEXT | YES | MST | Form / Company MST | FR-ORG-03 |
| `established_at` | DATE | YES | Ngày thành lập | `founded_date` / form | FR-ORG-03 · locale dd/MM/yyyy |
| `address` | TEXT | YES | Địa chỉ | Form / list | FR-ORG-03 |
| `charter_capital` | NUMERIC | YES | Vốn điều lệ | Form; vi-VN thousand group on FE | FR-ORG-03 NFR |
| `legal_representative` | TEXT | YES | Người đại diện PL | Form | FR-ORG-03 |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | `active` / `deleted` | Soft-delete; list excludes deleted | — |
| `payload` | JSONB NOT NULL DEFAULT `{}` | NO | `companyForm` (email, phone, website, industry fallback) | Enrich / dual-write contact | CO-BIND · FR-ORG-03 |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | Audit | — | — |

### 2.1 Constraints / indexes

| Constraint | Purpose |
|------------|---------|
| `PRIMARY KEY (id)` | Plane A identity |
| `UNIQUE (tenant_id, company_id, code)` | Stable LE code per partition |
| Filter `status IS DISTINCT FROM 'deleted'` | All read lists |

### 2.2 Semantic anti-confusion (normative — extend industry pair)

| Column | IS | IS NOT |
|--------|----|--------|
| **`id` (UUID)** | Plane A legal identity for profile, documents, CC | Operating slug for workforce COUNT |
| **`business_lines`** | Industry / business line | `entity_type` / holding-subsidiary role |
| **`entity_type`** | Org classification in group | Industry label for «Ngành nghề» |
| **`company_id` (on LE)** | XBOS partition slug within tenant | HRM `employees.company_id` operating ladder (may differ; bridge via BR-INT-05) |

**FAIL** if product treats LE UUID as Plane B headcount key, or `entity_type` as industry SoT.

### 2.3 `business_lines` value contract (must_keep from industry slice)

| Form | Example | Rule |
|------|---------|------|
| Catalog key | `logistics`, `tourism` | FE/i18n → VI (`DB_DESIGN_HRM_COMPANY_DISPLAY` §2.2 / TECHSPEC HRM §20.3) |
| Free text VI | `Vận tải hàng hóa đường bộ` | Display as-is |
| NULL / empty | — | UI «—» |
| Token ∈ `{holding,subsidiary,…}` | — | Invalid for industry → «—» |

**Write preference:** PUT body `businessLines` → column `business_lines`; optional sync `payload.companyForm.industry`.

---

## 3. Group-member-units join keys (read model)

Not a separate table — **query contract** for `OrgFoundationService.listGroupMemberUnits`:

```text
xbos_tenant_registry (member, active)
  JOIN xbos_legal_entity le
    ON le.tenant_id = t.tenant_id
   AND le.company_id = t.default_company_id
   AND le.status IS DISTINCT FROM 'deleted'
+ holding row from registry (master / tenant_kind=master)
```

| Result field | Source | Required for Company / CC |
|--------------|--------|---------------------------|
| `holding.*` | `xbos_tenant_registry` master | Holding nav |
| `members[].id` | `le.id` | **Plane A key** → ORG-03 / documents |
| `members[].code` / `name` | LE | List paint |
| **`members[].business_lines`** | **`le.business_lines`** | **must_keep expose** (industry) |
| `members[].entity_type` | LE | Loại ĐVTV only |
| `members[].payload` | LE | Fallback industry / contact |
| `members[].tenant_id` (+ names) | registry | Bridge / enrich |

**Recommended SELECT ADD** (if still thin): also `tax_code`, `established_at`, `address` — does not replace mandatory `business_lines`.

---

## 4. `xbos_legal_entity_document` — physical columns

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| **`id`** | UUID PK | NO | Khóa tài liệu | FR-ORG-03 Diễn biến #5/#7 khóa mang |
| `tenant_id` | TEXT | NO | Partition | Scope |
| `company_id` | TEXT | NO | Partition | Scope |
| **`legal_entity_id`** | UUID FK → `xbos_legal_entity(id)` ON DELETE CASCADE | NO | Parent Plane A | FR-ORG-03 |
| `document_code` | TEXT | YES | Số hiệu / mã TL | Metadata |
| `document_name` | TEXT NOT NULL | NO | Tên tài liệu | Diễn biến #5 bắt buộc khi thêm |
| `issued_date` | DATE | YES | Ngày cấp | Form; wire yyyy-MM-dd |
| `expired_date` | DATE | YES | Ngày hết hạn | Form |
| `file_url` | TEXT | YES | Public API URL after upload | Diễn biến #7 xem tệp |
| `storage_path` | TEXT | YES | Absolute/relative path under `XBOS_LEGAL_DOC_STORAGE_ROOT` | Storage |
| `mime_type` | TEXT | YES | MIME | Upload |
| `file_size` | BIGINT | YES | Bytes | Max 25MB policy |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | soft-delete `deleted` | List active-only |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | Audit | — |

### 4.1 File storage keys (not DB columns)

| Item | Contract |
|------|----------|
| Env root | `XBOS_LEGAL_DOC_STORAGE_ROOT` (default `apps/api/xbos-api/storage/legal-documents`) |
| Path pattern | `{root}/{tenantId}/{entityId}/{documentId}.{ext}` |
| Allowed ext | `pdf`, `doc`, `docx`, `xls`, `xlsx` |
| Max bytes | `XBOS_LEGAL_DOC_MAX_BYTES` (25MB) |
| Public base | `XBOS_PUBLIC_BASE_URL` → builds `file_url` |

---

## 5. Identity dual-plane note (mandatory)

```text
Plane A (this design):
  xbos_legal_entity.id          = UUID legal identity
  + profile columns (name, MST, business_lines, …)
  + xbos_legal_entity_document.legal_entity_id → same UUID
  → Command Center legal form · HRM Company profile columns
  → NEVER headcount SoT

Plane B (HRM — DB_DESIGN_HRM_CO_HC):
  employees.company_id          = operating TEXT slug
  → COUNT / summary.by_company[]
  → Card «Tổng nhân viên»

Bridge (BR-INT-05):
  LE display / code / tenant → operating_slug BEFORE any COUNT bind
```

| Pattern | Verdict |
|---------|---------|
| Documents / PUT legal by `entityId` UUID | **REQUIRED** |
| Headcount `WHERE employees.company_id = <LE UUID>` | **FORBIDDEN** |
| Industry from `entity_type` | **FORBIDDEN** |

---

## 6. Relationship to HRM industry pair (must_keep)

| Artifact | Relationship |
|----------|--------------|
| `DB_DESIGN_HRM_COMPANY_DISPLAY.md` | **Subset** of §2 columns for Company display — remains authoritative for industry bind semantics |
| This file | **Superset** org spine: full LE + documents + group join keys |
| Rule | ADD-only; **do not** rewrite or delete industry pair; keep `business_lines` normative text aligned |

---

## 7. Acceptance (DB plane)

| Check | PASS |
|-------|------|
| `xbos_legal_entity` + `business_lines` present | `\d` / ensure schema |
| `xbos_legal_entity_document` FK to LE | information_schema / ensure |
| Soft-delete excluded from active lists | `status IS DISTINCT FROM 'deleted'` |
| Sample LE: `business_lines` ≠ `entity_type` when both set | SQL spot |
| No headcount column on LE / document | Schema review |

---

## 8. Out of scope

- Shareholder table physical design (`SA-U71-XBOS-SHAREHOLDER-DESIGN-01`)
- Org-unit department mutate depth (FR-XBOS-ORG-02 — separate U71 if needed)
- New industry catalog table
- Changing Plane B slug ladder
- Seed data for UAT (U65)
