# PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01 — API_DESIGN F.1 · EMP catalog (Option B roll-out)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **W7 seat** | `PO_HRM_CONTINUOUS_W7_20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** F-EMP-CAT-DOC-* · F-EMP-CAT-ET-* · **EXPAND** checklist / consumer validate · **DOC-DELTA** client API/DB · **NO CODE** `apps/**` · **no seed** · **no wipe** EMP profile / contracts / SI spines |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — Option **B** roll to EMP vertical (document types + employment types open catalogs) · cite F-PLT-TOK / ATT-VERTICAL / REC-VERTICAL pattern |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1–L7 · §7 EMP row |
| **ref_metadata** | [`ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.md`](../../architecture/ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.md) · settings-catalogs extension / apply parity |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) F-PLT-TOK F.1 · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md) pattern mirrors · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 EMP · BR-PLT-02/04/05/06 · **AC-PLT-EMP-01** (position picker — must_keep) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-CORE-03** (danh mục giấy tờ động) · CORE-01/02/07 · CORE-09 registry orthogonal |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.1 `hrm_employee` · §3.5 `hrm_document_checklist_item.document_type_key` · **no** `emp_document_type` / `emp_employment_type` physical yet |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) **F-CORE-CTR-01** checklist · **F-CORE-ACT-01** · **F-CORE-EMP-*** (must_keep) |
| **ref_spine** | Profile CORE-01 · UF-HRM-02 contracts · SI enrollment (`employee_insurances`) · E2E EMP linkage — **must_keep** |
| **Honesty** | No personnel / EMP module UAT flip · `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · U65 |
| **must_keep** | Profile / contracts / SI spines · position+dept = XBOS REF pickers (**AC-PLT-EMP-01**) · soft-delete · scope_parity U19 · C&B not on public form |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective & locks

Roll **Platform Option B** to **EMP vertical GĐ1 Catalog**: **document types** (CORE-03) + **employment types** (settings family `employment_types`) as open `ICatalogRow` — same F.1 depth as **F-PLT-TOK** / **F-ATT-CAT-LVT-*** / **F-REC-CAT-STG-***. **Unlock ba-data physical** — **no** `apps/**` here.

| Lock | Rule |
|------|------|
| **L-EMP-CAT-01 Open document types** | `document_type_key` = **open catalog** per company — starter keys (`cccd`, `cv`, `degree`, `health_cert`, `labor_book`, …) = **bootstrap examples only** — **not** closed enum (**BR-PLT-05** · DYNAMIC-LOCK class). **FORBIDDEN** `CHECK (document_type_key IN (...))` ceiling |
| **L-EMP-CAT-02 Open employment types** | `employment_type_key` = **open catalog** per company — starter (`full_time`, `part_time`, `contract`, `intern` / alias `full-time` normalize) = **bootstrap only** — **not** FE `select:full-time\|…` ceiling (**BR-PLT-05**) |
| **L-EMP-CAT-03 Dual SoT (employment)** | **Group REF** settings-catalogs / catalog-sync key **`employment_types`** (XBOS publish) **≠** EMP CFG writer **`emp_employment_type`** — effective union; **tenant row wins** on key collision (**BR-PLT-06** · ATT leave_types peer) |
| **L-EMP-CAT-04 Document SoT** | **HRM tenant writer** = `emp_document_type` — SoT for checklist picker + CORE-03 CRUD. Group REF partition optional GĐ1.5 — if present, same merge-read / tenant wins |
| **L-EMP-CAT-05 Position ≠ EMP catalog table** | **`job_titles` / `departments`** = XBOS REF via settings-catalogs (**AC-PLT-EMP-01**) — **FORBIDDEN** invent `emp_position` / dual master this seat (ATT `work_shifts` ops-lock class) |
| **L-EMP-CAT-06 Decision types OUT GĐ1** | `hr_decision_types` / QSĐ types = **decisions** module catalog — **GĐ1.5 residual** (BA «Loại QSĐ after CTR») — **not** this seat |
| **L-EMP-CAT-07 Contract types OUT** | `contract_types` / HĐ template packs = **CTR** domain — **FORBIDDEN** EMP duplicate SoT |
| **L-EMP-CAT-08 Consumer SoT** | When effective catalog **>0**: checklist create / employee or YCTD `employment_type` **must** ∈ catalog (**BR-PLT-02**) — free-text **4xx** |
| **L-EMP-CAT-09 Soft-delete** | Retire = `status=retired` + `archived_at` — history FK / past checklist rows / employee denorm keys intact (**BR-PLT-04**) — **FORBIDDEN** hard-delete |
| **L-EMP-CAT-10 Scope** | list ↔ get-by-id ↔ mutate = `resolveHrmListScope` + `assertResourceInHrmScope` (**U19**) |
| **L-EMP-CAT-11 MergeToken hook** | Custom field → register `custom.emp.<code>` (**BR-PLT-01**) = **residual** after CTR token BE — **not** blocking this Catalog seat |
| **L-EMP-CAT-12 Honesty** | No personnel UAT / e2e linkage / payroll / ATT / REC ready flip from docs |
| **Paths (Nest physical GĐ1)** | **ADD** `/api/hrm/employees/document-types*` · **ADD** `/api/hrm/employees/employment-types*` (alias `/api/hrm/core/…` OK) |

**Envelope:** `{ code, message, data }`  
**Auth:** HRM JWT / membership — same employees / core peers.

---

## 1. Platform → EMP binding (`ICatalogRow`)

| Logical (`ICatalogRow`) | Physical GĐ1 | `catalog_kind` | Notes |
|-------------------------|--------------|----------------|-------|
| `code` | `document_type_key` | `emp_document_type` | Stable slug; UQ active per company |
| `label_vi` | `name_vi` | | display-ready |
| `status` | `status` + `archived_at` | | active \| retired |
| `scope_company_id` | `company_id` TEXT | | JWT operating slug |
| `meta` | typed flags + optional `sort_order` | | **not** free JSON SoT for blocks_activation |
| Employment row | `employment_type_key` | `emp_employment_type` | Same interface map |
| Position / dept | settings-catalogs REF | `job_titles` / `departments` | **Adapter only** — **out of mutate scope** this seat |

**FORBIDDEN GĐ1:** Mega `hrm_catalog_rows` EAV for EMP (ADR Q-PLT-03). **FORBIDDEN:** closed `CHECK IN` on starter document or employment keys. **FORBIDDEN:** rewrite profile / contracts / SI schemas.

```text
  XBOS publish ──► settings-catalogs.employment_types (group REF)
                           │
                           ├── pull/sync (read) ──► effective ET picker union
                           │
  EMP Settings/CFG ──► emp_employment_type CRUD (tenant writer)
                           │
                           ▼
              employee form · YCTD/JD employment_type · headcount rules
                           │
  EMP Settings/CFG ──► emp_document_type CRUD (tenant writer = SoT)
                           │
                           ▼
              hrm_document_checklist_item · F-CORE-ACT-01 · CORE-03
                           │
  job_titles / departments (XBOS REF) ──► AC-PLT-EMP-01 — NOT this table
                           │
  custom extension + MergeToken ──► residual BR-PLT-01 (not this seat)
```

---

## 2. Physical DATA pointer (ba-data unlock — **not covered yet**)

> **Unlock:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01` — **ADD** `public.emp_document_type` + `public.emp_employment_type`.  
> Platform DATA-01 wave only physicalized **MergeToken** (+ CTR/JD adapters) — **EMP catalog physical = this cascade** (closes R-PLT-DATA-04 EMP slice).  
> AS-IS `hrm_document_checklist_item.document_type_key` stays **text** storing catalog key — **EXPAND** DOC note: after catalog >0, values **must** resolve to active/retired catalog (history may hold retired keys).

### 2.1 `emp_document_type` (ADD physical)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | uuid | PK | |
| `company_id` | text | NO | Scope slug |
| `document_type_key` | text | NO | Open catalog code — format `^[a-z][a-z0-9_]*$` |
| `name_vi` | text | NO | UI label |
| `sort_order` | int | NO | Checklist / picker order — default 100 |
| `required_by_default` | boolean | NO | Default when seeding checklist lines for new hire |
| `requires_expiry` | boolean | NO | Expiry date UI + warn class CORE-03 |
| `blocks_activation` | boolean | NO | When required + missing → F-CORE-ACT-01 **409** class |
| `is_identity_doc` | boolean | NO | CCCD/passport class — OCR hook GĐ2 OUT |
| `allowed_mime_json` | jsonb | YES | Optional allow-list — empty = platform default |
| `metadata_json` | jsonb | YES | Optional — position/contract rule hints — **not** replace typed flags |
| `status` | text | NO | active \| retired |
| `archived_at` | timestamptz | YES | soft-delete |
| `created_at`, `updated_at` | timestamptz | NO | audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(document_type_key))` WHERE `archived_at IS NULL` |
| **CHK format** | slug only — **FORBIDDEN** enum ceiling CHECK |
| **Starter rows** | Optional ensure upsert blueprint keys — **not** UF evidence (U65) |

### 2.2 `emp_employment_type` (ADD physical)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | uuid | PK | |
| `company_id` | text | NO | Scope slug |
| `employment_type_key` | text | NO | Open catalog — normalize hyphens→underscores on write (`full-time`→`full_time`) |
| `name_vi` | text | NO | UI label |
| `sort_order` | int | NO | default 100 |
| `counts_toward_headcount` | boolean | NO | default true |
| `eligible_for_si` | boolean | NO | Soft gate SI enroll UX — **≠** invent SI rate |
| `is_contingent` | boolean | NO | contractor / intern class |
| `metadata_json` | jsonb | YES | Optional |
| `status` | text | NO | active \| retired |
| `archived_at` | timestamptz | YES | soft-delete |
| `created_at`, `updated_at` | timestamptz | NO | audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(employment_type_key))` WHERE `archived_at IS NULL` |
| **CHK format** | slug only — **FORBIDDEN** closed `full_time\|part_time\|…` CHECK |
| **Starter rows** | Optional ensure upsert — **not** UF evidence (U65) |

### 2.3 Consumer columns (EXPAND note — no rename)

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `hrm_document_checklist_item` / AS-IS checklist | `document_type_key` | Stores key; validate ∈ effective on mutate |
| Employee / profile denorm (if present) | `employment_type` / `employment_type_key` | Same key space when column exists |
| YCTD / job requisition / posting | `employment_type` | Align same key space — REC consumer of EMP catalog (**not** REC-owned SoT) |
| JD pack resolve | `employment_type` context | Must_keep JD-DYNAMIC — validate ∈ effective when catalog >0 |

### 2.4 Explicitly **not** this DATA seat

| Item | Owner |
|------|-------|
| `job_titles` / `departments` physical | XBOS + settings-catalogs REF — **AC-PLT-EMP-01** |
| `hr_decision_types` | Decisions / QSĐ — GĐ1.5 |
| `hrm_merge_tokens` custom.emp hook | Platform BE + BR-PLT-01 residual |
| `employee_contracts` / SI enrollment DDL | must_keep spines — **no wipe** |
| Profile FormSchema tabs | GĐ1.5 / CORE-02b — interface only |

---

## 3. API_DESIGN F.1 — F-EMP-CAT-*

### 3.1 F-EMP-CAT-DOC-01 — List / get document types (open catalog)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/document-types` · `GET /api/hrm/employees/document-types/:documentTypeId` |
| **Mục đích** | Trả danh mục loại giấy tờ (Settings · checklist hồ sơ · activate gate) — display-ready — sau HR thêm mã **thứ N+** F5 list **có** row (**AC-PLT-EMP-02**). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + required `company_id` query. (2) Query `emp_document_type` WHERE scope AND `archived_at IS NULL` unless `include_archived=true`. (3) Default filter `status=active` when omitted (picker). (4) Optional `q` ilike key/`name_vi`. (5) Sort `sort_order`, `document_type_key`. (6) Empty `[]` = **200** — **không** fake starter in UF (U65). (7) Get-by-id: same scope — OOS → 404/403 (**U19**). (8) Response includes typed flags. (9) Optional `include_group_ref=true` reserved — GĐ1 no-op unless XBOS partition exists later. |
| **Tham chiếu bước SRS / AC** | **FR-UC-BP-CORE-03** · BR-BP-DOC-01 · **AC-PLT-EMP-02** · **BR-PLT-02/05** · BA §2.1 · ADR §7 EMP |
| **Request (query)** | `company_id` (required) · `status?` · `include_archived?` · `include_group_ref?` · `q?` |
| **Response → DB** | |

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `documentTypeKey` | `document_type_key` | consumer FK |
| `nameVi` | `name_vi` | |
| `sortOrder` | `sort_order` | |
| `requiredByDefault` | `required_by_default` | |
| `requiresExpiry` | `requires_expiry` | |
| `blocksActivation` | `blocks_activation` | |
| `isIdentityDoc` | `is_identity_doc` | |
| `allowedMime` | `allowed_mime_json` | optional |
| `metadata` | `metadata_json` | optional |
| `status` | `status` | |
| `source` | derived | `emp_native` \| `group_ref` \| `emp_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Scope 403/409 · empty list **không** 404 |
| **scope_parity** | List predicate = get-by-id assert |

---

### 3.2 F-EMP-CAT-DOC-02 — Create / upsert / retire document type

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/employees/document-types` · `PUT /api/hrm/employees/document-types` (upsert by `(company_id, document_type_key)`) · `PATCH …/:documentTypeId` · `POST …/:documentTypeId/retire` |
| **Mục đích** | HR CRUD loại giấy tờ tenant — mở catalog **không** giới hạn starter (**BR-PLT-05** · CORE-03). |
| **Nghiệp vụ xử lý** | (1) Scope + mutate assert. (2) Validate `documentTypeKey` slug — **`HRM-PLT-CAT-CODE-INVALID` = format only** — **cấm** reject «not in starter set». (3) Validate boolean flags. (4) Upsert active key → refresh labels/flags; bump `updated_at`. (5) UQ conflict → **`HRM-PLT-CAT-CODE-CONFLICT`**. (6) Retire: `status=retired`, `archived_at=now()` — pickers hide; **must_keep** historical checklist rows (**BR-PLT-04**). (7) **FORBIDDEN** hard-delete. (8) After 2xx, checklist UI must accept new key (**AC-PLT-EMP-02**). |
| **Tham chiếu bước SRS / AC** | **AC-PLT-EMP-02/03** · **BR-PLT-02/04/05** · FR-UC-BP-CORE-03 |
| **Request → DB** | Same fields as §3.1 (create/upsert required: `companyId`, `documentTypeKey`, `nameVi`) |
| **Response → DB** | Single row display-ready |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · scope |
| **scope_parity** | Mutate assert = list scope |

---

### 3.3 F-EMP-CAT-ET-01 — List / get employment types (open catalog)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/employment-types` · `GET /api/hrm/employees/employment-types/:employmentTypeId` |
| **Mục đích** | Trả danh mục loại hình thuê / employment (Settings · hồ sơ · YCTD/JD) — display-ready — sau HR thêm mã **thứ 5+** F5 list **có** row (**AC-PLT-EMP-04**). |
| **Nghiệp vụ xử lý** | (1) Scope + `company_id`. (2) Query `emp_employment_type` active/archived rules as DOC-01. (3) **Effective union (read model):** when `include_group_ref=true`, merge settings-catalogs partition `employment_types` — **tenant row wins** on same key (**L-EMP-CAT-03**). (4) Empty `[]` = **200** U65. (5) Get-by-id scope_parity U19. (6) Normalize display key to underscore form. |
| **Tham chiếu bước SRS / AC** | BA §2.1 employment status/types · **AC-PLT-EMP-04** · **BR-PLT-02/05/06** · ADR §7 · settings master key `employment_types` |
| **Request (query)** | `company_id` (required) · `status?` · `include_archived?` · `include_group_ref?` · `q?` |
| **Response → DB** | |

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `employmentTypeKey` | `employment_type_key` | consumer FK |
| `nameVi` | `name_vi` | |
| `sortOrder` | `sort_order` | |
| `countsTowardHeadcount` | `counts_toward_headcount` | |
| `eligibleForSi` | `eligible_for_si` | |
| `isContingent` | `is_contingent` | |
| `metadata` | `metadata_json` | optional |
| `status` | `status` | |
| `source` | derived | `emp_native` \| `group_ref` \| `emp_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Scope · empty ≠ 404 |
| **scope_parity** | List = get-by-id |

---

### 3.4 F-EMP-CAT-ET-02 — Create / upsert / retire employment type

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/employees/employment-types` · `PUT …` upsert · `PATCH …/:id` · `POST …/:id/retire` |
| **Mục đích** | HR CRUD loại hình thuê tenant — **cấm** hardcode 4-option select ceiling. |
| **Nghiệp vụ xử lý** | (1) Scope + mutate. (2) Normalize + validate slug — **`HRM-PLT-CAT-CODE-INVALID` format only**. (3) Upsert / UQ **`HRM-PLT-CAT-CODE-CONFLICT`**. (4) Retire soft — **must_keep** historical YCTD/employee keys (**BR-PLT-04**). (5) **FORBIDDEN** hard-delete. (6) **FORBIDDEN** mutate group REF rows in XBOS partition — tenant writer only on `emp_employment_type`. (7) After 2xx pickers accept new key (**AC-PLT-EMP-04**). |
| **Tham chiếu bước SRS / AC** | **AC-PLT-EMP-04/05** · **BR-PLT-02/04/05/06** |
| **Request → DB** | Same as §3.3 (required: `companyId`, `employmentTypeKey`, `nameVi`) |
| **Lỗi** | Platform CAT codes · scope |
| **scope_parity** | Mutate = list |

---

### 3.5 F-EMP-CAT-EFF-01 — Effective document catalog (read helper)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/document-types/effective` (alias — may fold into DOC-01) |
| **Mục đích** | Single read model for checklist / CORE-03 / activate gate. |
| **Nghiệp vụ xử lý** | Active tenant rows (+ future group REF); used by checklist assert — **replace ad-hoc free-text** after BE lands. Read-only. |
| **Tham chiếu bước SRS / AC** | **BR-PLT-02** · FR-UC-BP-CORE-03 · F-CORE-ACT-01 |
| **scope_parity** | Same as DOC-01 |

---

### 3.6 F-EMP-CAT-EFF-02 — Effective employment catalog (read helper)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/employees/employment-types/effective` (alias — may fold into ET-01 `include_group_ref=true`) |
| **Mục đích** | Single read model for employee form / YCTD / JD resolve — union EMP native + group REF. |
| **Nghiệp vụ xử lý** | (1) Load EMP rows active. (2) Merge settings-catalogs `employment_types`. (3) Key collision → EMP overrides REF. (4) Read-only. |
| **Tham chiếu bước SRS / AC** | **BR-PLT-06** · AC-PLT-EMP-05 · JD/YCTD employment_type consumers |
| **scope_parity** | Same as ET-01 |

---

## 4. Consumer deepen (pointer — must_keep TXN APIs)

> **Không** redesign F-CORE-EMP-* / UF-HRM-02 contracts / SI enrollment / activate. **EXPAND** validation source only.

| Consumer F-id | Change |
|---------------|--------|
| **F-CORE-CTR-01** checklist | Assert `document_type_key` ∈ **F-EMP-CAT-EFF-01** when catalog >0 → else **`HRM-EMP-DOC-TYPE-UNKNOWN`** (**BR-PLT-02**) |
| **F-CORE-ACT-01** | Keep checklist-missing **409** — required lines use `blocks_activation` / `required_by_default` from catalog when physical live |
| **Employee create/update** | If employment_type field present: ∈ **F-EMP-CAT-EFF-02** when >0 |
| **YCTD / posting / JD pack** | `employment_type` ∈ effective EMP catalog when >0 — **REC consumes EMP SoT** (not invent REC employment catalog) |
| **UF-HRM-02 / SI** | **No** new FK required — **must_keep** registry + enrollment spines |
| **AC-PLT-EMP-01** | Position/dept pickers remain XBOS REF — **unchanged** by this seat |

---

## 5. Acceptance criteria (EMP vertical)

| ID | Domain | Đạt khi (U65 browser) | Không đạt khi |
|----|--------|----------------------|---------------|
| **AC-PLT-EMP-01** | EMP position | *(existing BA)* WH create: position = catalog picker; reject free-text SoT | Input position SoT — **must_keep** · **not** redesigned here |
| **AC-PLT-EMP-02** | EMP documents | Settings/EMP CFG → **Tạo loại giấy tờ** mã HR đặt (#N+) → **2xx** → list có row → **F5** còn → checklist hồ sơ **chọn được** mã mới | Reject «không thuộc starter» · FE hardcode list · mất sau F5 |
| **AC-PLT-EMP-03** | EMP documents | Retire loại giấy tờ → picker ẩn → checklist cũ **còn** hiển thị key | Hard-delete · orphan checklist |
| **AC-PLT-EMP-04** | EMP employment | Settings → **Tạo loại hình thuê** (#5+) → 2xx → F5 → form NV/YCTD **chọn được** | FE fixed 4-option · API reject 5th |
| **AC-PLT-EMP-05** | EMP employment | Khi catalog >0: submit employment_type **ngoài** catalog → **4xx** deterministic | Free-text SoT khi catalog có items |
| **AC-PLT-EMP-06** | EMP activate | Checklist thiếu mục `blocks_activation`/`required` → activate **không** 2xx silent | Bypass CORE-07 / invent activate |

**Journey (QA later):** `J-HRM-EMP-DOC-01` (open document catalog) · `J-HRM-EMP-ET-01` (employment types) · reuse profile/contracts/SI spines — **no** claim personnel UAT from this seat.

---

## 6. Error taxonomy (EMP catalog class)

| Code | HTTP | When | Shared with |
|------|------|------|-------------|
| `HRM-PLT-CAT-CODE-INVALID` | 400 | slug format fail — **not** «not in starter N» | Platform |
| `HRM-PLT-CAT-CODE-CONFLICT` | 409 | Active UQ key | Platform |
| `HRM-EMP-DOC-TYPE-UNKNOWN` | 400 | Checklist / doc mutate key ∉ effective | BR-PLT-02 |
| `HRM-EMP-ET-UNKNOWN` | 400 | Employment type ∉ effective | BR-PLT-02 |
| Activate checklist 409 | 409 | Missing required / blocks_activation | F-CORE-ACT-01 — unchanged class |
| Scope | 403/409 | list↔id↔mutate | U19 |

---

## 7. DOC-DELTA — client deliverables (ADD-only)

> **ba-docs** append — **không** wipe F-CORE-EMP-* / CTR-01 checklist path / SI / UF-02 stubs.

### 7.1 `API_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** §3.x | **F-EMP-CAT-DOC-01..02** · **F-EMP-CAT-ET-01..02** · **F-EMP-CAT-EFF-01..02** with full F.1 blocks (copy §3) |
| **EXPAND** | **F-CORE-CTR-01** footnote: checklist `document_type_key` ∈ effective DOC catalog when >0 |
| **EXPAND** | **F-CORE-ACT-01** footnote: required/blocks flags from `emp_document_type` |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` |

### 7.2 `DB_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** | §3.x `emp_document_type` + `emp_employment_type` physical — **FORBIDDEN** closed key CHECK |
| **EXPAND** | §3.5 `document_type_key` note: open catalog key · starter ≠ ceiling |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` |

### 7.3 `SRS_HRM_ENTERPRISE.md` (optional pointer)

| Action | Content |
|--------|---------|
| **EXPAND** | FR-UC-BP-CORE-03 — «CRUD danh mục theo tenant» = Settings open catalog (no new FR if wording matches) |

---

## 8. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| CORE-01 profile spine | Wipe employee public ring / invent C&B on public form |
| UF-HRM-02 `employee_contracts` registry | Require template on every contract |
| SI enrollment `employee_insurances` + rate period | Dual enrollment SoT / invent payslip |
| AC-PLT-EMP-01 position/dept XBOS REF | `emp_position` dual master this seat |
| Soft-delete catalogs | Hard-delete with history FK |
| U65 FE CRUD evidence | Seed for UF |
| Open catalog N+ doc / ET keys | `CHECK IN (starter)` · API reject Nth |
| Honesty flags false | Personnel / PAY / ATT / REC UAT flip from docs |
| CTR `contract_types` ownership | EMP duplicate contract-type SoT |
| Decisions `hr_decision_types` | Absorb QSĐ types into this seat |

---

## 9. Cascade unlock

| Gate | Status after this seat |
|------|------------------------|
| EMP vertical API F.1 (DOC + ET) | **CONFIRMED** (this doc) |
| **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01` | **UNLOCKED** — physical `emp_document_type` + `emp_employment_type` (**not** already covered by platform DATA-01) |
| **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01` | **HOLD** until DATA CONFIRMED |
| **dev-fe** EMP Settings pickers + checklist/ET bind | **HOLD** until BE READY_FOR_QA |
| **QA** AC-PLT-EMP-02..06 | After FE/BE — U65 browser |
| MergeToken custom.emp hook | **Residual** BR-PLT-01 — not blocking EMP catalog |
| Decision / QSĐ types catalog | **GĐ1.5** |

**Residual OPEN:**

| ID | Note | Owner |
|----|------|-------|
| R-PLT-EMP-01 | Wire checklist / ACT-01 → F-EMP-CAT-EFF-01 after table live | dev-be |
| R-PLT-EMP-02 | Wire YCTD/employee employment_type → F-EMP-CAT-EFF-02 | dev-be |
| R-PLT-EMP-03 | Client DOC-DELTA §7 | ba-docs |
| R-PLT-EMP-04 | Custom field → MergeToken auto-register (**BR-PLT-01**) | sa/dev-be later |
| R-PLT-EMP-05 | QSĐ / `hr_decision_types` open-catalog deepen | sa GĐ1.5 |
| R-PLT-EMP-06 | Profile FormSchema tabs (CORE-02b) | interface later |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| EMP / personnel module UAT-ready (`hrm_personnel_uat_ready`) | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| Platform / Phase1 DONE | **false** |
| This seat | Docs only — API F.1 EMP document + employment catalogs |
| Option B | **CONFIRMED** |
| Seed | **forbidden** in UF evidence |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-vertical-sa-01.md` |
| **next_owner** | **pm** → **ba-data** EMP physical · parallel **ba-docs** DOC-DELTA §7 |
| **completion_report** | CONFIRMED EMP vertical F.1: F-EMP-CAT-DOC/ET/EFF open catalogs (peer F-PLT-TOK / F-ATT-CAT-LVT / F-REC-CAT-STG); ICatalogRow map; dual SoT employment_types REF vs emp_employment_type; document types CORE-03 tenant writer; must_keep profile/contracts/SI + AC-PLT-EMP-01 XBOS position; AC-PLT-EMP-02..06; DOC-DELTA client API/DB; unlock ba-data EMP-DATA-01 (not already covered); no apps/**; honesty flags stay false. |
