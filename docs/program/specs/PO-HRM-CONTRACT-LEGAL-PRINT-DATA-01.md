# PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01 — DB + API physical (CONFIRMED)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` |
| **lane** | governance · ba-data |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-TECH-01` |
| **change_mode** | ADD · **NO CODE** `apps/**` · **no migrate executed** · **no wipe** F-CORE-CTR-01 / CORE-09 |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED** — physical plan + F.1 paths unlock **sponsor CONFIRM** then Dev; Nest `ensureSchema` ADD only when unlocked |
| **ref_tech** | [`PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) §2–§10 |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **v0.18** · **FR-UC-BP-CORE-09** · **09a** · **09b** · **09c** |
| **ref_logical** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.4 (+ §3.4a–c DOC-DELTA) |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-CORE-CTR-* DOC-DELTA |
| **ref_physical_asis** | Nest `contracts-insurance.service.ts` `ensureSchema` → `public.employee_contracts` |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Registry SoT **ONE** | **`public.employee_contracts`** ↔ logical `hrm_contract` — **must_keep** UF-HRM-02 / J-HRM-03 |
| Template library | **ADD** `public.hrm_contract_templates` |
| Clause library | **ADD** `public.hrm_contract_clauses` |
| Print snapshot spine | **ADD** `public.hrm_contract_print_versions` |
| Pack rule (job_family → pack) | **ADD** `public.hrm_contract_pack_rules` — **pattern reuse** JD pack rules; **≠** dual-write `rec_jd_pack_rule` (different pack codes) |
| Salary / C&B | **BR-CD-F5-01** — ignore `salary` on registry write; live SoT = F5 `compensation_packages` via soft `compensation_package_id`; print SoT = `compensation_snapshot_json` on **print_version only** |
| Soft-delete | Library + print_version: `archived_at`; contract: **ADD** `archived_at` (AS-IS hard DELETE — BE upgrade later; GĐ1 list may still hard-delete until BE seat) |
| Dual physical registry | **FORBIDDEN** |
| Dev unlock this seat | **NO** — next = **sponsor CONFIRM** docs pack (SPEC+SRS+TechSpec+DB+API) |
| Honesty flags | **remain false** |

**Option A (TechSpec §12)** locked: child tables + expand `employee_contracts`.

---

## 2. Alias map (logical ↔ physical)

| Logical (enterprise) | Physical | Dual-write |
|----------------------|----------|------------|
| `hrm_contract` | **`public.employee_contracts`** | **no** |
| `hrm_contract_template` | **`public.hrm_contract_templates`** (**ADD**) | n/a new |
| `hrm_contract_clause` | **`public.hrm_contract_clauses`** (**ADD**) | n/a new |
| `hrm_contract_print_version` | **`public.hrm_contract_print_versions`** (**ADD**) | n/a new |
| `hrm_contract_pack_rule` | **`public.hrm_contract_pack_rules`** (**ADD**) | **≠** `rec_jd_pack_rule` |
| Compensation read (F5) | `compensation_packages` / active package APIs | **reuse** · no dual-write from print |
| Checklist (orthogonal) | `employee_document_checklist` / logical `hrm_document_checklist_item` | keep · **≠** print spine |

### 2.1 Column alias — `hrm_contract` ↔ `employee_contracts`

| Logical (DB_DESIGN §3.4) | Physical AS-IS / ADD | Rule |
|--------------------------|----------------------|------|
| `id` | `id` | PK |
| `employee_id` | `employee_id` | Soft FK employees |
| `company_id` | `company_id` | Scope TEXT slug |
| `contract_code` | `contract_code` | Nullable AS-IS; UQ when present |
| `contract_type_key` | **`contract_type`** | Catalog / type string — **ONE** column |
| `effective_from` | **`start_date`** | ONE date SoT |
| `effective_to` | **`end_date`** | Nullable open-ended (G-CI-01) |
| `signed_at` | **ADD** `signed_at` date NULL | Optional GĐ1 |
| `position_key` | `position_key` | Catalog SoT; `position` = denorm label |
| `work_location` | **ADD** `work_location` | Đ.21.c — AS-IS **missing** |
| `work_location_scope` | **ADD** `work_location_scope` text NULL | e.g. fixed\|mobile\|multi |
| `status` | `status` | AS-IS CHECK `active\|expired\|terminated` — registry must_keep |
| `notes` | `notes` | keep |
| `salary_calc_mode` | — | **DEPRECATED** logical — do **not** ADD; F5 owns calc |
| `compensation_snapshot_json` (on contract) | — | **DEPRECATED on registry** — SoT = print_version.`compensation_snapshot_json` |
| Live C&B link | **`compensation_package_id`** (AS-IS) | Soft FK F5 — **must_keep** |
| Signer (authorized) | `signer_name` · `signer_position` · `signer_position_key` | AS-IS must_keep |
| Dept | `department` · `department_key` | AS-IS |
| Soft-delete | **ADD** `archived_at` | Prefer soft; AS-IS DELETE until BE |

**EXPAND ADD (print overlay — nullable until first print save):**

| Physical column | Type | Null | Purpose |
|-----------------|------|------|---------|
| `pack_code` | text | YES | Denorm last issued pack (`GENERAL`\|`IT_OFFICE`\|`DRIVER`\|`LOGISTICS`) |
| `template_id` | uuid | YES | Soft FK → `hrm_contract_templates.id` |
| `term_type` | text | YES | `indefinite`\|`definite`\|`seasonal_other` |
| `job_description_text` | text | YES | Depth by pack — **≠** free-text position SoT |
| `probation_days` | int | YES | |
| `probation_end` | date | YES | |
| `license_class` | text | YES | DRIVER pack |
| `vehicle_plate` | text | YES | DRIVER pack |
| `route_or_region` | text | YES | DRIVER / optional required by tenant |

| **UQ (registry)** | Prefer partial: `(company_id, contract_code) WHERE contract_code IS NOT NULL AND archived_at IS NULL` (ADD when soft-delete live) |
| **IX** | keep `(company_id, end_date)`; ADD `(employee_id, status)`, `(company_id, pack_code)` WHERE pack not null |
| **Rule** | ≤1 overlapping `active` (V-05 / AS-IS); **salary ignored on write** |

### 2.2 Employer signatory (Q-CTR-04 — CONFIRMED intent)

| Token ring `company` | Source GĐ1 |
|----------------------|------------|
| `employer_legal_name` · `employer_address` | Operating unit / company master (existing display fields) — **no invent** new company DDL this seat |
| `employer_signatory_name` · `employer_signatory_title` | Prefer company settings when present; else denorm on **print_version** `merged_fields_json` / optional ADD `employer_signatory_*` on version only |
| Contract `signer_*` | Authorized **employee-side / company signer** for registry UI — **must_keep**; may map into merge as contract-ring tokens |

Residual: if company master lacks legal columns → BA/SA OPEN (do not invent here).

### 2.3 Pack rule vs JD (Q-CTR-05 — CONFIRMED)

| Item | Stamp |
|------|--------|
| Pattern | Same shape as `rec_jd_pack_rule` (`match_type=job_family` primary → pack) |
| Physical | **Separate** `hrm_contract_pack_rules` |
| Pack codes | Contract: `GENERAL` · `IT_OFFICE` · `DRIVER` · optional `LOGISTICS` — **≠** JD `PACK_*` codes |
| Fallback | No match → `GENERAL` |
| Override | HCNS may set pack on preview before issue (09b #5); freeze on print_version |

---

## 3. ADD tables (physical)

### 3.1 `hrm_contract_templates`

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope (Q-CTR-01 group publish = OPEN — GĐ1 per-company) |
| `code` | text | NO | e.g. `HDLD_STANDARD` |
| `name_vi` | text | NO | |
| `pack_code` | text | NO | Default pack for template |
| `layout_json` | jsonb | NO | Section order / chrome |
| `keyword_map` | jsonb | NO | `{{token}}` → `{source, ring}` |
| `status` | text | NO | `draft`\|`active`\|`retired` |
| `version` | int | NO | Default 1; bump after issued use |
| `archived_at` | timestamptz | YES | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | |
| `created_by` / `updated_by` | text/uuid | YES | |

| **UQ** | **Partial:** `(company_id, code) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)`, `(company_id, pack_code)` |
| **Rule** | Merge uses only `status=active` AND `archived_at IS NULL` |

### 3.2 `hrm_contract_clauses`

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `code` | text | NO | Stable lineage code |
| `title_vi` | text | NO | |
| `body_vi` | text | NO | May contain `{{keyword}}` |
| `clause_group` | text | NO | SPEC §B.3 |
| `apply_to_packs` | text[] | NO | Packs or `{*}` |
| `sort_order` | int | NO | Default 0 |
| `mandatory` | boolean | NO | Default false |
| `status` | text | NO | `draft`\|`active`\|`retired` |
| `version` | int | NO | BR-CTR-CL-01 |
| `effective_from` | date | YES | |
| `archived_at` | timestamptz | YES | |
| timestamps / by | | | |

| **UQ** | **Partial active:** `(company_id, code) WHERE status='active' AND archived_at IS NULL` — one active per code |
| **IX** | `(company_id, clause_group)`, `(company_id, status)`, GIN optional on `apply_to_packs` |
| **Rule** | Activate bumps `version` when prior issued snapshots reference same `code` (BR-CTR-CL-01); retire ≠ mutate old snapshots |

### 3.3 `hrm_contract_print_versions`

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `contract_id` | uuid | NO | Soft FK → `employee_contracts.id` |
| `company_id` | text | NO | Scope parity with contract |
| `version_no` | int | NO | Monotonic per contract |
| `pack_code` | text | NO | Frozen |
| `template_id` | uuid | YES | Soft FK template |
| `template_version` | int | YES | Frozen |
| `merged_fields_json` | jsonb | NO | Đ.21 fields after ACL at save |
| `clauses_snapshot_json` | jsonb | NO | Ordered `{code, title_vi, body_vi, clause_group, clause_version}` |
| `compensation_snapshot_json` | jsonb | YES | Historical print only — **≠** live PAY |
| `status` | text | NO | `draft_preview`\|`issued`\|`superseded` |
| `issued_at` | timestamptz | YES | |
| `issued_by` | text/uuid | YES | |
| `pdf_artifact_ref` | text | YES | Storage key after render |
| `archived_at` | timestamptz | YES | |
| timestamps | | | |

| **UQ** | `(contract_id, version_no)` |
| **IX** | `(company_id, contract_id)`, `(contract_id, status)`, `(company_id, issued_at)` |
| **Rule** | Amend → **new** version; **cấm** silent overwrite `issued` snapshot; PDF render **from snapshot** not live library |

### 3.4 `hrm_contract_pack_rules`

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `match_type` | text | NO | `job_family` (MVP) \| `fallback` |
| `match_value` | text | YES | Family tag; NULL when `fallback` |
| `pack_code` | text | NO | Target pack |
| `priority` | int | NO | Lower wins |
| `status` | text | NO | `active`\|`retired` |
| `archived_at` | timestamptz | YES | |

| **IX** | `(company_id, match_type, priority)` |
| **Rule** | Resolve: job_family match → else fallback → else hard default `GENERAL` |

---

## 4. Validation matrix (data)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-CTR-01 | Create registry without print fields | Nullable ADD cols OK | 2xx registry (UF-HRM-02) |
| VAL-CTR-02 | Write `salary` on contract body | Ignore (BR-CD-F5-01) | Persist without salary SoT |
| VAL-CTR-03 | Issue print, 0 active template | Block | `HRM-CTR-TPL-NONE` |
| VAL-CTR-04 | Issue, missing mandatory clause for pack | Block | `HRM-CTR-ISSUE-BLOCKED` + `missing_clauses[]` |
| VAL-CTR-05 | Pack=`DRIVER`, missing license/plate | Block | `HRM-CTR-DRIVER-REQUIRED` |
| VAL-CTR-06 | Unknown `pack_code` | Block | `HRM-CTR-PACK-INVALID` |
| VAL-CTR-07 | Activate clause duplicate active code | Block | `HRM-CTR-CL-CODE-CONFLICT` |
| VAL-CTR-08 | Clause empty code/title/body | Block | `HRM-CTR-CL-REQUIRED` |
| VAL-CTR-09 | PDF on non-issued version | Block | `HRM-CTR-VERSION-NOT-ISSUED` |
| VAL-CTR-10 | Unmasked C&B without ACL | Block / mask | `HRM-CTR-CB-FORBIDDEN` or masked preview |
| VAL-CTR-11 | List returns id; get-by-id out of scope | Fail parity | 403/409 scope (U19) |
| VAL-CTR-12 | Soft-delete clause then re-list | Excluded when `archived_at` set | 200 without row |
| VAL-CTR-13 | Overwrite issued snapshot in place | Forbidden | App reject / new version only |
| VAL-CTR-14 | Dual-write JD pack rule table as contract SoT | Forbidden | Schema/process FAIL |

---

## 5. API_DESIGN F.1 — physical prefer `/contracts-insurance`

**Prefix:** `/api/hrm/contracts-insurance`  
**Envelope:** `{ code, message, data }`  
**Scope:** list ↔ get ↔ mutate = `resolveHrmListScope` + `assertResourceInHrmScope` (**scope_parity** U19).  
**Logical alias prefix** `/api/hrm/core/...` = documentation only GĐ1 — Nest binds physical paths.

### 5.1 F-CORE-CTR-01 — Registry CRUD (must_keep overlay)

| | |
|--|--|
| **METHOD / path** | `GET/POST /api/hrm/contracts-insurance/contracts` · `GET/PATCH/DELETE …/contracts/:id` |
| **Mục đích** | Giữ sổ đăng ký HĐ (mã · loại · NV · hiệu lực · trạng thái · notes · signer · position). |
| **Nghiệp vụ xử lý** | AS-IS + optional nullable EXPAND fields; **ignore salary**; G-CI-01 end_date; V-05 overlap; soft FK `template_id` assert same `company_id` when set; checklist orthogonal CORE-03. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09b** Diễn biến **#1** · AC-CTR-PRINT-08 · UF-HRM-02. |
| **Request → DB** | DTO → `employee_contracts.*` (alias §2.1); salary discarded. |
| **Response → DB** | Display-ready registry row (+ optional `pack_code`/`template_id` when present). |
| **Lỗi** | AS-IS `HRM-CON-*` · scope 403/409 — **không** regress. |
| **scope_parity** | List filter = get-by-id assert same resolver. |

### 5.2 F-CORE-CTR-TPL-01 — List templates

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-templates` |
| **Mục đích** | Trả mẫu HĐ + keyword_map/layout để Settings và picker. |
| **Nghiệp vụ xử lý** | Scope; filter `status`/`pack_code`; exclude `archived_at`; empty `[]` = 200 + CTA. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09** Diễn biến **#1** · AC-CTR-TPL-01 · **09a** consume. |
| **Request** | Query: `company_id`, `status?`, `pack_code?` |
| **Response → DB** | `hrm_contract_templates.*` display-ready. |
| **Lỗi** | Scope 403/409 · 403 thiếu quyền cấu hình. |

### 5.3 F-CORE-CTR-TPL-02 — Upsert / activate template

| | |
|--|--|
| **METHOD / path** | `POST/PATCH /api/hrm/contracts-insurance/contract-templates` · optional `POST …/:id/activate` |
| **Mục đích** | Tạo/sửa mẫu; chỉ `active` chọn được khi merge. |
| **Nghiệp vụ xử lý** | Validate code/name/pack/keyword_map; UQ code; bump `version` when activating after issued use; retire keeps history. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09** #1–#2 · AC-CTR-TPL-01..05 · BR-CTR-CL-04. |
| **Request → DB** | `code`, `name_vi`, `pack_code`, `layout_json`, `keyword_map`, `status?` → templates. |
| **Lỗi** | `HRM-CTR-CL-CODE-CONFLICT` (reuse for template code) · `HRM-VAL-400` · scope. |

### 5.4 F-CORE-CTR-CL-01 — List clauses

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-clauses` |
| **Mục đích** | Thư viện điều khoản theo pháp nhân cho Settings + resolve pack. |
| **Nghiệp vụ xử lý** | Scope; filter `status`, `clause_group`, `pack_code` (overlap `apply_to_packs`); exclude archived; empty `[]` = 200. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09a** Diễn biến **#1** · AC-CTR-CL-01. |
| **Response → DB** | `hrm_contract_clauses.*`. |
| **Lỗi** | Scope / 403 config. |

### 5.5 F-CORE-CTR-CL-02 — Create / update clause

| | |
|--|--|
| **METHOD / path** | `POST/PATCH /api/hrm/contracts-insurance/contract-clauses` |
| **Mục đích** | Tạo/sửa điều khoản (nháp hoặc hiệu lực) đủ mã · tiêu đề · nội dung · gói. |
| **Nghiệp vụ xử lý** | Reject empty `body_vi`/`code`/`title_vi`; soft-update draft; active body change that was issued → force CL-03 version path (không overwrite im lặng). |
| **Tham chiếu bước SRS** | **09a #2** · **#5** · BR-CTR-CL-01. |
| **Request → DB** | `code`, `title_vi`, `body_vi`, `clause_group`, `apply_to_packs[]`, `sort_order`, `mandatory`, `status?`. |
| **Lỗi** | `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · scope. |

### 5.6 F-CORE-CTR-CL-03 — Activate (+ version bump)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-clauses/:id/activate` |
| **Mục đích** | Đưa điều khoản sang hiệu lực; tăng `version` nếu lineage đã gắn HĐ issued. |
| **Nghiệp vụ xử lý** | Gate quyền; retire prior active same `code` OR supersede; set `active`; bump version when issued snapshots exist; appears in pack resolve. |
| **Tham chiếu bước SRS** | **09a #3** · AC-CTR-CL-01 · AC-CTR-CL-02. |
| **Lỗi** | `HRM-CTR-CL-CODE-CONFLICT` · `HRM-CTR-CL-REQUIRED` · 404 scope. |

### 5.7 F-CORE-CTR-CL-04 — Retire

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-clauses/:id/retire` |
| **Mục đích** | Ngừng dùng; **không** đổi snapshot HĐ cũ. |
| **Nghiệp vụ xử lý** | Set `retired`; keep rows; print versions retain `clauses_snapshot_json`. |
| **Tham chiếu bước SRS** | **09a #4** · AC-CTR-CL-03. |
| **Lỗi** | 404 scope · 403. |

### 5.8 F-CORE-CTR-PACK-01 — Pack resolve suggestion

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=` |
| **Mục đích** | Gợi ý `pack_code` từ chức danh / họ nghề; HCNS vẫn đổi được. |
| **Nghiệp vụ xử lý** | Load employee `position_key` → job_family tag → `hrm_contract_pack_rules` → default `GENERAL`; return `{ suggested_pack, allowed_packs[], reason }`. |
| **Tham chiếu bước SRS** | **09b #1–#2** · **#5**. |
| **Response → DB** | Rules read-only; no mutate. |
| **Lỗi** | Employee 404 scope · `HRM-CTR-PACK-INVALID` if override later. |

### 5.9 F-CORE-CTR-PREV-01 — Merge preview

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:id/preview` |
| **Mục đích** | Sinh bản xem trước HĐLĐ: bên A/B · công việc · thời hạn · điều khoản theo gói · khối lương theo ACL. |
| **Nghiệp vụ xử lý** | (1) Scope contract. (2) Resolve template (explicit or default for pack). (3) 0 active template → `HRM-CTR-TPL-NONE`. (4) Resolve clauses for pack. (5) Merge keyword_map. (6) C&B if ACL else mask. (7) Validate mandatory fields/clauses → missing lists. (8) Return sections + `can_issue`. **Không** persist unless VER-01. |
| **Tham chiếu bước SRS** | **09b #2–#4** · **09** #2–#3 · AC-CTR-PRINT-02/03/06/07 · AC-CTR-TPL-02..04. |
| **Request** | `{ template_id?, pack_code, field_overrides? }` |
| **Response** | `{ pack_code, sections[], merged_fields, clauses[], missing_fields[], missing_clauses[], can_issue, cb_masked }` |
| **Lỗi** | `HRM-CTR-TPL-NONE` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-DRIVER-REQUIRED` · scope. |

### 5.10 F-CORE-CTR-VER-01 — Save print version

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:id/print-versions` |
| **Mục đích** | Lưu phiên bản + snapshot; cập nhật list/detail. |
| **Nghiệp vụ xử lý** | Re-run preview validation server-side; `!can_issue` → `HRM-CTR-ISSUE-BLOCKED`; INSERT `issued`; freeze snapshots; denorm `pack_code`/`template_id` on contract; prior issued → `superseded`. |
| **Tham chiếu bước SRS** | **09c #1** · **#4** · AC-CTR-PRINT-04 · AC-CTR-TPL-01/05. |
| **Request → DB** | Preview inputs → `hrm_contract_print_versions` + denorm contract cols. |
| **Lỗi** | `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-TPL-NONE` · scope. |

### 5.11 F-CORE-CTR-VER-02 — List/get versions

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contracts/:id/print-versions` · `GET …/print-versions/:versionId` |
| **Mục đích** | Sau Lưu / F5: còn `version_no`, `pack_code`, snapshot metadata. |
| **Nghiệp vụ xử lý** | scope_parity; mask C&B in snapshot if `!canViewCb`. |
| **Tham chiếu bước SRS** | **09c #3** · AC-CTR-PRINT-04 · AC-CTR-TPL-05. |
| **Response → DB** | print_versions display-ready. |
| **Lỗi** | 404 scope. |

### 5.12 F-CORE-CTR-PDF-01 — Render PDF / print

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf` |
| **Mục đích** | Xuất in/PDF **khớp** snapshot (không merge live library). |
| **Nghiệp vụ xử lý** | Load issued version; render from frozen JSON + layout; optional `pdf_artifact_ref`; block if not issued. |
| **Tham chiếu bước SRS** | **09c #2** · AC-CTR-PRINT-05. |
| **Lỗi** | `HRM-CTR-VERSION-NOT-ISSUED` · `HRM-CTR-RENDER-FAIL` · scope. |
| **Note** | Upload `file_url` UI **≠** substitute PDF-01. Engine choice = Q-CTR-02 (NFR). |

### 5.13 Error taxonomy (deterministic)

| Code | HTTP | When |
|------|------|------|
| `HRM-CTR-TPL-NONE` | 400 | 0 active template |
| `HRM-CTR-CL-REQUIRED` | 400 | Clause missing code/title/body |
| `HRM-CTR-CL-CODE-CONFLICT` | 409 | Active code conflict (clause/template) |
| `HRM-CTR-PACK-INVALID` | 400 | Unknown pack |
| `HRM-CTR-DRIVER-REQUIRED` | 400 | DRIVER missing license/plate |
| `HRM-CTR-ISSUE-BLOCKED` | 400 | missing_fields / missing_clauses |
| `HRM-CTR-VERSION-NOT-ISSUED` | 400 | PDF before issue |
| `HRM-CTR-RENDER-FAIL` | 500/400 | Render engine failure |
| `HRM-CTR-CB-FORBIDDEN` | 403 | Unmasked C&B without ACL |
| Scope | 403/409 | Parity failures |
| AS-IS | `HRM-CON-*` / `HRM-AUTH-001` | Registry path — keep |

---

## 6. must_keep / forbidden

### must_keep

- UF-HRM-02 / J-HRM-03 registry CRUD list → create → edit → F5
- AS-IS columns: `contract_code` · `contract_type` · `start_date`/`end_date` · `status` · `employee_id` · `company_id` · `position_key` · `notes` · signer_* · department_* · `compensation_package_id`
- BR-CD-F5-01 salary off body; F5 compensation packages
- Soft-delete on library/print; company scope ladder; list↔get parity
- CORE-09 / 09a / 09b / 09c FR text; F-CORE-CTR-01 stub text (overlay only)
- Checklist CORE-03 orthogonal

### forbidden

- `apps/**` / `packages/**` / seed this seat
- Claim `contracts_printable_ready=true` / personnel UAT
- Wipe F-CORE-CTR-01 stub without DOC-DELTA overlay
- Dual-write PAY from print snapshot
- Silent overwrite issued print versions
- Invent second registry table / dual `job_description_id`-style columns
- Use `rec_jd_pack_rule` as contract pack SoT
- Paste copyrighted full DOC samples

---

## 7. Traceability (requirement → API → DB → FE → test)

| SRS | Cap | DB | FE intent | Test / journey |
|-----|-----|----|-----------|----------------|
| CORE-09 #1 · TPL | TPL-01/02 | `hrm_contract_templates` | Settings mẫu | AC-CTR-TPL-01..05 |
| 09a #1–#5 | CL-01..04 | `hrm_contract_clauses` | Settings điều khoản | AC-CTR-CL-01..03 |
| 09b #1–#5 | PACK-01 · PREV-01 · CTR-01 | pack_rules + contract + preview | Màn HĐ preview | AC-CTR-PRINT-01..03/06/07 · J-HRM-03 registry |
| 09c #1–#4 | VER-01/02 · PDF-01 | `hrm_contract_print_versions` | Lưu phiên bản · In/PDF · F5 | AC-CTR-PRINT-04/05 · U65 later |
| BR-CD-F5-01 | CTR-01 write | ignore salary; F5 package | Compensation tab | Regression UF-HRM-02 |

**scope_parity:** every list API above + matching get-by-id / `:id` mutate share `resolveHrmListScope`.

---

## 8. OPEN residual (do not invent)

| ID | Question | Owner |
|----|----------|-------|
| Q-CTR-01 | Group-level template publish vs per-company only? | **LOCKED SA-02 Option A** · **physical CONFIRMED DATA-02** — [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) · next **dev-be** |
| Q-CTR-02 | PDF engine (puppeteer vs client print CSS)? | SA + DevOps NFR |
| Q-CTR-03 | LOGISTICS in GĐ1 or GĐ1.5 only? | PM |
| Q-CTR-04b | Exact company-master columns for employer legal name/address if missing | ba-data/SA when company DDL skim |
| Soft-delete contract | Switch Nest DELETE → archived_at | Dev-BE after sponsor CONFIRM |

---

## 9. Dev unlock criteria (PM gate — **not** this seat)

1. Sponsor **CONFIRM** docs pack: SPEC + SRS v0.18 + TechSpec + **this DATA-01** + client DB/API DOC-DELTA.  
2. Then BE → FE → QA U65; honesty stays **false** until QA+QC printable slice.

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Closed: CONFIRMED physical ADD templates/clauses/print_versions/pack_rules; EXPAND employee_contracts; alias map; VAL-CTR-*; F.1 F-CORE-CTR-TPL/CL/PACK/PREV/VER/PDF + CTR-01 overlay; honesty false; Dev HOLD. |
| next_owner | **pm** (sponsor CONFIRM before any Dev) |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-data-01.md` |
