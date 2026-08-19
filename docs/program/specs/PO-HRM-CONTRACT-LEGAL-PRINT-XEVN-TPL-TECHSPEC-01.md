# PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01 — TechSpec ADD · ma trận 8 `template_code` X.E

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECH-01` |
| **Parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **lane** | governance · sa |
| **change_mode** | **ADD-only** · **NO CODE** `apps/**` · **cấm** redesign print-spine · **cấm** wipe `PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01` must_keep |
| **Date** | 2026-08-07 |
| **Status** | **DRAFT TechSpec delta** — **@CHANGE CORR-01 SUPERSEDES** closed enum; open catalog + starter 8 |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **v0.19** · **FR-UC-BP-CORE-09d** (ADD under CORE-09 · preserve 09 · 09a · 09b · 09c) |
| **ref_spec** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md) §2–§5 · §9 · **CORR-01** |
| **ref_corr** | [`CORR-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`DYNAMIC-LOCK`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **prior_tech** | [`PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) — print-spine GWC SoT |
| **prior_data** | [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) · [`DATA-02`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) (lineage publish) — **EXPAND overlay**, không replace |
| **docs_evidence** | [`po-hrm-contract-legal-print-xevn-tpl-docs-01.md`](../../qa/evidence/po-hrm-contract-legal-print-xevn-tpl-docs-01.md) |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · U65 zero-seed · **không** claim printable UAT |
| **must_keep** | UF-HRM-02 / J-HRM-03 registry · print-spine GWC (AC-CTR-PRINT-*) · **Q-CTR-01 CLOSED** · **Q-CTR-02 CLOSED** · pack `GENERAL`\|`IT_OFFICE`\|`DRIVER` · BR-CD-F5-01 · soft-delete · scope_parity |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Context & objective

**Business intent:** Sau BA LOCK + SRS v0.19 FR-09d + **sponsor CORR-01 (2026-08-07)** — khóa **TechSpec open catalog** với **starter 8** `template_code` X.E (ví dụ), map pack + duration defaults + `keyword_map` (GPLX · đơn vị đa pháp nhân · pattern số HĐ), **không** thiết kế lại kiến trúc in/PDF đã GWC, **không** closed enum 8.

**Architecture truth (this wave):**

| Lock | Rule |
|------|------|
| Spine | Giữ TECHSPEC-01: template → pack resolve → clause → merge → preview → print_version snapshot → PDF |
| Catalog | SoT in = **`template_code`** (any active row) **+** `pack_code`; starter 8 optional bootstrap — **not** ceiling |
| Pack | Neo starter `*_OFFICE` → `IT_OFFICE` · `*_DRIVER` → `DRIVER` — **cấm** invent pack `OFFICE`; custom → configured packs |
| Alias sheets | 2 sheet KXĐ LX Excel = **không auto-bootstrap** mã riêng (AC-10); HR **được** tạo mã 9+ (AC-11) |
| Dev gate | CORR-01 + DATA/API → **dev-be/fe dynamic** — **cấm** CHK IN (8) |
| Honesty | Print-spine GWC **≠** `contracts_printable_ready=true` |

**Non-goals:** redesign PDF engine · reopen Q-CTR · wipe CORE-09a/b/c · paste full body Excel · seed HĐ.

---

## 1. Option evaluation (catalog storage)

| Option | Summary | Pros | Cons | Verdict |
|--------|---------|------|------|---------|
| **A — Open catalog trên `hrm_contract_templates.code` + metadata columns** | SoT = template rows; optional starter 8 upsert; ADD term/duration/title | Khớp DATA-01 `code` UQ; Settings CRUD 9+; group publish lineage giữ | Cần validate format/pack app-layer | **RECOMMENDED (CORR-01)** |
| **B — Bảng lookup `hrm_contract_template_catalog` riêng** | Matrix tách khỏi instance template | Linh hoạt alias | Dual SoT; FE join | REJECT GĐ1 |
| **C — Hardcode FE enum only (8)** | Không DB | Nhanh giả | Vi phạm BR-CTR-CL-03 / DYNAMIC-LOCK | **FORBIDDEN** |
| **D — Closed CHECK `code IN (8)`** | DB enum cứng | Chặn alias nhầm | Chặn HR mẫu 9+ — vi phạm sponsor CORR-01 | **FORBIDDEN** |

**Decision:** **Option A (revised CORR-01)** — open template catalog + columns; resolve API đọc **active** codes; optional ensure starter 8; legacy codes ngoài starter vẫn tồn tại; **cấm** closed CHECK IN (8).

---

## 2. Starter matrix — 8 `template_code` (ví dụ X.E — **not** closed enum)

> **@CHANGE CORR-01:** §2 = starter examples. Catalog open. HR CRUD 9+.

### 2.1 Matrix (starter)
| `template_code` (`code`) | `pack_code` | `default_term_type` | Duration default (resolve hint) | `title_print_vi` (logic) | `contract_type_key` gợi ý |
|--------------------------|-------------|---------------------|----------------------------------|--------------------------|---------------------------|
| `XEVN_PROBATION_OFFICE` | `IT_OFFICE` | `probation` | **60 ngày** từ `effective_from` → gợi ý `effective_to`; **không** +12/+24 tháng | HỢP ĐỒNG THỬ VIỆC | `probation` |
| `XEVN_FT_12M_OFFICE` | `IT_OFFICE` | `definite` | **+12 tháng** | HỢP ĐỒNG LAO ĐỘNG | `fixed_term` |
| `XEVN_FT_24M_OFFICE` | `IT_OFFICE` | `definite` | **+24 tháng** | HỢP ĐỒNG LAO ĐỘNG | `fixed_term` |
| `XEVN_INDEF_OFFICE` | `IT_OFFICE` | `indefinite` | Chỉ `effective_from`; **cấm** require `effective_to` cho `can_issue` | HỢP ĐỒNG LAO ĐỘNG | `indefinite` |
| `XEVN_PROBATION_DRIVER` | `DRIVER` | `probation` | **60 ngày** | HỢP ĐỒNG THỬ VIỆC | `probation` |
| `XEVN_FT_12M_DRIVER` | `DRIVER` | `definite` | **+12 tháng** | HỢP ĐỒNG LAO ĐỘNG | `fixed_term` |
| `XEVN_FT_24M_DRIVER` | `DRIVER` | `definite` | **+24 tháng** | HỢP ĐỒNG LAO ĐỘNG | `fixed_term` |
| `XEVN_INDEF_DRIVER` | `DRIVER` | `indefinite` | Chỉ `effective_from` | HỢP ĐỒNG LAO ĐỘNG | `indefinite` |

**Starter set (machine — optional bootstrap):**

```text
XEVN_PROBATION_OFFICE | XEVN_FT_12M_OFFICE | XEVN_FT_24M_OFFICE | XEVN_INDEF_OFFICE |
XEVN_PROBATION_DRIVER | XEVN_FT_12M_DRIVER | XEVN_FT_24M_DRIVER | XEVN_INDEF_DRIVER
```

**Bootstrap cấm auto-tạo từ alias:** `XEVN_INDEF_DRIVER_V2` · `XEVN_KXĐ_LX_ALT` · sheet `HĐKXĐ` / `HĐ KXĐ` (SPEC §2.2 · AC-10). **CORR-01:** HR **được** tạo mã tùy chỉnh khác (AC-11).

### 2.2 Resolve rules (locked)

```text
1. User selects template_code (any active catalog row — starter or HR-created).
2. System sets pack_code := template.pack_code (configured packs).
3. System sets term_type hint := default_term_type; apply duration defaults to draft dates (user may edit in legal bounds).
4. Reject persist if template.pack_code ≠ request.pack_code override mismatch on same save
   (HCNS may change pack before issue ONLY if also changing to a template_code whose pack matches —
    BR: không lưu starter *_OFFICE với pack DRIVER).
5. On print-version issue: freeze template_id + template.code + template.version + pack_code on snapshot.
6. Issued snapshot immutable; template_code change → new version (BR-CTR-TPL-02 / BR-CTR-CL-01).
```

### 2.3 Duration / term validation (BR-CTR-TPL-03)

| `default_term_type` | `can_issue` date gate |
|---------------------|------------------------|
| `probation` \| `definite` | Require `effective_from` **and** `effective_to` valid range |
| `indefinite` | Require `effective_from` only; **do not** require `effective_to` |

---

## 3. Entity overlay (logical — ba-data physicalizes)

> Sketch only. Prefer **EXPAND** DATA-01 tables. **Cấm** replace registry `employee_contracts`.

### 3.1 `hrm_contract_templates` — EXPAND

| ADD / tighten | Type (hint) | Rule |
|---------------|-------------|------|
| `code` | text | **Open** unique active per company; optional starter 8 + legacy; picker FR-09d = active rows (optional filter `matrix=xevn`); **cấm** CHECK IN (8) |
| `pack_code` | text | Starter XEVN rows: **must** be `IT_OFFICE` or `DRIVER` per §2.1; custom ∈ configured packs |
| `default_term_type` | text | `probation`\|`definite`\|`indefinite` — **ADD** |
| `default_duration_days` | int NULL | Probation → **60**; else NULL |
| `default_duration_months` | int NULL | 12 / 24 / NULL (indefinite) |
| `title_print_vi` | text | Print chrome title |
| `keyword_map` | jsonb | Extend §4 tokens (GPLX · unit · number pattern) |
| `layout_json` | jsonb | Section chrome; DRIVER includes GPLX block flag |
| `matrix_family` | text NULL | Optional: `XEVN_MATRIX` vs `LEGACY` — ba-data chốt |
| lineage cols | | Keep DATA-02 publish/pull/apply — **must_keep** |

**Invariant (CORR-01):** Catalog **open** — **no** “exactly 8” ceiling. Optional ensure starter 8. Alias sheets không auto-bootstrap row. AC-CTR-XEVN-11 = CRUD 9+.

### 3.2 `employee_contracts` / print_versions — EXPAND

| ADD (logical) | Purpose |
|---------------|---------|
| `template_id` | Soft FK (đã DATA-01) — nullable registry-only |
| `template_code` | Denorm `code` at last save / issue for list F5 (optional denorm — ba-data) |
| print_version.`template_code` | Freeze string on `merged_fields_json` **or** column — snapshot SoT in |
| print_version.`merged_fields_json` | Must include GPLX tokens when DRIVER; unit + number pattern fields |

### 3.3 DRIVER PII / license fields (source — ba-data chốt)

| Logical token | Preferred SoT (hint) | Validate |
|---------------|----------------------|----------|
| `driver_license_number` | employee profile JSON / dedicated cols / cb ring | Required `can_issue` when pack=`DRIVER` |
| `driver_license_class` | same | Required |
| `driver_license_issued_on` | date | Required |
| `driver_license_issued_place` | text | Required |

**Align TECHSPEC-01 §3.4:** DRIVER gate expands beyond `license_class`+`vehicle_plate` — X.E matrix **requires** full GPLX quartet for issue (BR-CTR-TPL-04 · AC-CTR-XEVN-09). `vehicle_plate` vẫn theo pack DRIVER spine (không bỏ).

### 3.4 Contract number pattern config (hint)

| Logical | Hint |
|---------|------|
| `org_suffix` / `contract_number_pattern` | Per company / operating unit Settings — **not** FE hardcode Visun/DLX.E |
| Generator | `{seq}/{yyyy}/{docKind}-{orgSuffix}` where `docKind` = `HĐTV` \| `HĐLĐ` from template family |

---

## 4. keyword_map delta (ADD tokens)

### 4.1 Shape (unchanged from TECHSPEC-01)

```json
{
  "{{token}}": { "source": "path.to.field", "ring": "public|company|contract|cb|clause" }
}
```

### 4.2 Multi-legal-entity / đơn vị

| Token | Source (logical) | Ring | BR |
|-------|------------------|------|-----|
| `{{employer_legal_name}}` | company.legal_name / OU legal | company | BR-CTR-TPL-06 |
| `{{employer_unit_label}}` | operating_unit.display_name | company | Header «Đơn vị» |
| `{{employer_address}}` | company/OU address | company | Đ.21 |
| `{{contract_number}}` | contract.contract_code (user-editable hint from pattern) | contract | BR-CTR-TPL-05 |
| `{{contract_number_suggested}}` | pattern engine output | contract | Preview only until save |

**Rule:** Đổi `company_id` / OU trên draft → re-merge employer_* + re-suggest number; **không** mutate issued snapshot (BR-CTR-TPL-07).

### 4.3 GPLX (DRIVER-only required)

| Token | Source | Ring | OFFICE | DRIVER |
|-------|--------|------|--------|--------|
| `{{driver_license_number}}` | employee/cb | public or cb | omit / not required | **required** |
| `{{driver_license_class}}` | employee/cb | public or cb | omit | **required** |
| `{{driver_license_issued_on}}` | employee/cb | public | omit | **required** (vi-VN display `dd/MM/yyyy`) |
| `{{driver_license_issued_place}}` | employee/cb | public | omit | **required** |

Layout: `layout_json.show_driver_license_block = true` iff `pack_code=DRIVER`.

### 4.4 Pattern số HĐ (keyword_map / Settings — không hardcode FE)

| `doc_kind` | Templates | Pattern logic |
|------------|-----------|---------------|
| `HDTV` | `*_PROBATION_*` | `{seq}/{yyyy}/HĐTV-{orgSuffix}` |
| `HDLD` | `*_FT_*` · `*_INDEF_*` | `{seq}/{yyyy}/HĐLĐ-{orgSuffix}` |

| `orgSuffix` examples (config, not FE literals) | When |
|-----------------------------------------------|------|
| `X.E` | Default X.E legal |
| `DLVISUN` | Unit Visun (mẫu 24T VP signal) |
| `DLX.E` | Du lịch X.E |
| `XE` | Alias lịch sử KXĐ LX → cùng generator |

**BR-CTR-TPL-05:** Suffix từ cấu hình pháp nhân/OU; UF-HRM-02 `contract_code` vẫn SoT người dùng sửa trước ban hành.

### 4.5 Term / title tokens

| Token | Rule |
|-------|------|
| `{{contract_title_print}}` | From `title_print_vi` of selected template |
| `{{term_type_label_vi}}` | Derived: thử việc / XĐTH / KXĐTH |
| `{{effective_from}}` · `{{effective_to}}` | contract; indefinite may leave `effective_to` empty |

---

## 5. Capability map overlay — FR-09d

**Giữ nguyên** F-CORE-CTR-01 · TPL · CL · PACK · PREV · VER · PDF từ TECHSPEC-01.  
**ADD / deepen** behavior only:

| Cap | F-id | Delta vs spine |
|-----|------|----------------|
| List templates (matrix) | **F-CORE-CTR-TPL-01** | List **all active** (open); optional `matrix=xevn` filter starter family; expose term/duration/title/pack |
| Upsert template | **F-CORE-CTR-TPL-02** | Validate format/UQ/pack; **allow** 9th+; starter pack matrix when applicable |
| Registry CRUD | **F-CORE-CTR-01** | Optional nullable `template_id`/`template_code`; **must_keep** CRUD without template (AC-CTR-XEVN-08) |
| Pack resolve | **F-CORE-CTR-PACK-01** | When `template_code` present → pack **from template** wins suggestion |
| Merge preview | **F-CORE-CTR-PREV-01** | Request `template_code` or `template_id`; apply duration hints; GPLX gate; unit re-merge |
| Save print version | **F-CORE-CTR-VER-01** | Freeze `template_code` + pack + keyword snapshot |
| PDF | **F-CORE-CTR-PDF-01** | Render from snapshot (unchanged spine) |

---

## 6. API_DESIGN F.1 — FR-UC-BP-CORE-09d (ADD)

### 6.1 F-CORE-CTR-TPL-01 — List templates (matrix consume)

| | |
|--|--|
| **Mục đích** | Trả danh sách mẫu hiệu lực (**open catalog**, gồm starter + HR-added) để picker tạo/sửa HĐ và Settings. |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Filter `status=active`, `archived_at IS NULL`. (3) Optional `matrix=xevn` → starter/`XEVN_MATRIX` family (not exclusive product SoT). (4) Empty set → CTA cấu hình (không fake rows). (5) Display-ready: code, name_vi, pack_code, default_term_type, duration hints, title_print_vi. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09d** Diễn biến **#1** · AC-CTR-XEVN-01 · AC-CTR-XEVN-10 · **AC-CTR-XEVN-11** |
| **Request** | Query: `company_id`, optional `matrix`, `pack_code`, `status` |
| **Response → DB** | `hrm_contract_templates.*` (+ ADD columns §3.1) |
| **Lỗi** | Scope 403/409 |

### 6.2 F-CORE-CTR-TPL-02 — Upsert / activate template (matrix gate)

| | |
|--|--|
| **Mục đích** | Tạo/sửa/activate mẫu; khóa pack starter khi áp dụng; **cho phép** mã 9+. |
| **Nghiệp vụ xử lý** | Validate `code` format + UQ; if starter `XEVN_*` → enforce §2.1 pack/term/duration; **CORR-01:** do **not** reject unknown custom codes; soft-delete only; lineage DATA-02 preserved. |
| **Tham chiếu bước SRS** | **09d** AC-CTR-XEVN-01/10/**11** · **09** AC-CTR-TPL-01 · BR-CTR-TPL-01 · BR-CTR-TPL-DYN-* |
| **Lỗi** | `HRM-CTR-TPL-CODE-INVALID` (**format only**) · `HRM-CTR-TPL-PACK-MISMATCH` · conflict 409 |

### 6.3 F-CORE-CTR-PREV-01 — Merge preview (overlay 09d)

| | |
|--|--|
| **Mục đích** | Xem trước theo `template_code`: tiêu đề · nhãn loại · duration · có/không GPLX · clause pack. |
| **Nghiệp vụ xử lý** | (1) Load template by id/code. (2) Set pack from template; reject pack mismatch. (3) Apply duration defaults if dates empty (hint only). (4) Merge keyword_map §4 (unit · number · GPLX). (5) OFFICE → no GPLX required; DRIVER → require GPLX quartet + DRIVER clauses. (6) indefinite → không đưa `effective_to` vào missing. (7) Return `can_issue` + `missing_fields[]` / `missing_clauses[]`. **Không** persist unless VER-01. |
| **Tham chiếu bước SRS** | **09d #2–#5** · AC-CTR-XEVN-02..06 · 09 · AC-CTR-PRINT-02/03/06 |
| **Request** | `{ template_id? , template_code? , pack_code? , company_id/ou? , field_overrides? }` |
| **Response** | Spine PREV-01 + `template_code` · `title_print_vi` · `term_type` · `number_pattern_hint` |
| **Lỗi** | `HRM-CTR-TPL-NONE` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-TERM-INVALID` · scope |

### 6.4 F-CORE-CTR-VER-01 — Save print version (overlay 09d)

| | |
|--|--|
| **Mục đích** | Lưu phiên bản in kèm snapshot `template_code` + merge fields (đơn vị · số · GPLX nếu DRIVER). |
| **Nghiệp vụ xử lý** | Re-validate PREV server-side; freeze template code/version/pack; denorm list fields for F5; issued immutable. |
| **Tham chiếu bước SRS** | **09d #6–#7** · **09c #1** · AC-CTR-XEVN-07 · AC-CTR-PRINT-04 |
| **Lỗi** | `HRM-CTR-ISSUE-BLOCKED` (+ GPLX / term) · scope |

### 6.5 F-CORE-CTR-01 — Registry (must_keep)

| | |
|--|--|
| **Mục đích** | CRUD sổ đăng ký **không** bắt buộc chọn mẫu in. |
| **Nghiệp vụ xử lý** | AS-IS + optional template fields nullable; ignore salary (F5); AC-CTR-XEVN-08. |
| **Tham chiếu bước SRS** | **09d #1** · UF-HRM-02 · AC-CTR-PRINT-08 |

### 6.6 Error taxonomy ADD

| Code | HTTP | When |
|------|------|------|
| `HRM-CTR-TPL-CODE-INVALID` | 400 | Invalid format/slug — **CORR-01:** **not** «unknown 9th» |
| `HRM-CTR-TPL-PACK-MISMATCH` | 400 | `*_OFFICE` với `DRIVER` (hoặc ngược) |
| `HRM-CTR-TERM-INVALID` | 400 | definite/probation thiếu `effective_to`; hoặc indefinite bị ép `effective_to` bắt buộc sai rule |
| `HRM-CTR-DRIVER-REQUIRED` | 400 | Thiếu GPLX quartet (expand message list) — keep spine code |
| `HRM-CTR-UNIT-SCOPE` | 403/409 | Đơn vị ngoài token scope (BR-CTR-TPL-06) |

Keep spine codes: `HRM-CTR-TPL-NONE` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-PACK-INVALID` · AS-IS `HRM-CON-*`.

---

## 7. DB / API touch points — ba-data next (hints only)

> **Không** physicalize trong seat SA này. Next: `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01`.

### 7.1 Tables / columns (EXPAND)

| Table | Touch |
|-------|--------|
| `public.hrm_contract_templates` | **Open** `code` policy (**cấm** CHECK IN 8); ADD `default_term_type`, `default_duration_days`, `default_duration_months`, `title_print_vi`, optional `matrix_family`; extend `keyword_map` JSON schema; ensure `pack_code` ∈ spine packs |
| `public.hrm_contract_print_versions` | Freeze `template_code` (column **or** inside `merged_fields_json.template_code`); ensure snapshot includes GPLX/unit keys |
| `public.employee_contracts` | Optional denorm `template_code`; keep `template_id` soft FK; registry nullable |
| Employee / profile / cb | Physical home for GPLX 4 fields — **chốt một SoT** (cột vs JSON) |
| Company / OU settings | `org_suffix` / `contract_number_pattern` per legal unit |
| `hrm_contract_clauses` | No new table; ensure DRIVER groups apply_to_packs include `DRIVER` (titles SPEC §4 — body in Settings, not docs) |
| DATA-02 lineage | **must_keep** publish/pull/apply columns — matrix rows publish được như template thường |

### 7.2 Indexes / constraints (hint)

| Hint | Note |
|------|------|
| Partial UQ `(company_id, code) WHERE archived_at IS NULL` | Giữ DATA-01 |
| App: starter code → pack_code matrix; all codes → format/UQ/pack ∈ configured | Enforce BR; **cấm** closed IN (8) |
| Optional ensure starter 8 | AC-CTR-XEVN-01 CTA — **not** ceiling; AC-11 = 9+ |

### 7.3 API surface (map for API_DESIGN deepen after DATA)

| METHOD / path (physical prefer) | F-id | Note |
|---------------------------------|------|------|
| `GET …/contract-templates` | TPL-01 | + matrix query |
| `POST/PATCH …/contract-templates` | TPL-02 | matrix validation |
| `POST …/contracts/:id/preview` | PREV-01 | `template_code` |
| `POST …/contracts/:id/print-versions` | VER-01 | freeze code |
| `GET/POST/PATCH …/contracts` | CTR-01 | nullable template |

**Scope parity:** list templates / get template / preview / version — cùng `resolveHrmListScope` (U19).

---

## 8. must_keep / forbidden

### must_keep

- UF-HRM-02 / J-HRM-03 registry CRUD + F5 không bắt buộc print template
- Print-spine GWC · AC-CTR-PRINT-01..08 semantics
- **Q-CTR-01 CLOSED** (group publish Option A) · **Q-CTR-02 CLOSED** (PDF binary)
- Pack codes `GENERAL` · `IT_OFFICE` · `DRIVER` (+ optional LOGISTICS GĐ1.5)
- BR-CD-F5-01 salary off body; C&B ACL on preview
- Soft-delete · scope_parity · DATA-01/02 physical baseline
- Enterprise FR-09 · 09a · 09b · 09c text (no wipe) · FR-09d ADD-only
- Honesty `contracts_printable_ready=false`

### forbidden

- `apps/**` / seed / claim printable UAT this wave
- Redesign PDF/merge architecture
- Invent auto-bootstrap from Excel alias sheets
- Closed enum / CHECK IN (8) / FE hardcode 8 / reject 9th as product rule
- Hardcode org names / number patterns on FE
- Paste full HĐ body into TechSpec / client docs
- Reopen Q-CTR CLOSED without gap
- Đè / wipe TECHSPEC-01 print-spine must_keep

---

## 9. Acceptance map (QA later — paper only now)

| AC | Tech gate |
|----|-----------|
| AC-CTR-XEVN-01 | Open catalog · optional starter 8 · no FE hardcode |
| AC-CTR-XEVN-02..04 | PREV title/term/GPLX by template |
| AC-CTR-XEVN-05 | duration_months 12 vs 24 |
| AC-CTR-XEVN-06 | indefinite no forced `effective_to` |
| AC-CTR-XEVN-07 | unit change → employer + number hint; F5 keeps `template_code` |
| AC-CTR-XEVN-08 | CTR-01 without template |
| AC-CTR-XEVN-09 | DRIVER GPLX block issue |
| AC-CTR-XEVN-10 | no alias auto-bootstrap in starter |
| AC-CTR-XEVN-11 | Settings 9th → F5 → create/preview bind |

J-*: `J-HRM-CTR-04` · `05` · `06` · **`07`** (journey DRAFT — không claim UAT).

---

## 10. Honesty & residual

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| Print-spine GWC | Giữ — **không** promote module printable |
| Residual | **CORR-01** · BE/FE dynamic · QA AC-CTR-XEVN-11 U65 · optional sa/ba-docs client DOC-DELTA |

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Historical ADD TechSpec + **@CHANGE CORR-01:** Option A = open catalog; supersede closed enum; AC-11; printable=false. |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-tech-01.md` · corr: `…-corr-01.md` |

---

## @CHANGE — CORR-01 (2026-08-07) dynamic catalog

| Field | Value |
|-------|--------|
| **work_item** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |
| **SUPERSEDE** | «TechSpec enum 8» · Option A closed CHECK · invariant exactly 8 · TPL-02 reject 9th · FORBIDDEN invent 9th+ as product rule |
| **REPLACE WITH** | Open catalog Option A · starter 8 optional · Option D FORBIDDEN (CHK IN 8) · AC-11 · CODE-INVALID=format · BR-UI-POPUP-AUTO-CLOSE-01 |
| **KEEP** | Print spine · packs · UF-02 · Q-CTR · GPLX/unit/number keyword · printable=false |

---

## 12. TechSpec UI Popup Modal & Data Sync Standards (BR-UI-POPUP-AUTO-CLOSE-01)

1. **Busy State (`saveTplBusy` / `isPending`):** Mọi nút submit form trong Dialog Popup (`onSaveTemplate`, `onActivateTemplate`, `onSaveClause`, `onSave`...) phải được khóa `disabled` và thay đổi nhãn visual (`Đang lưu...`) ngay khi bấm.
2. **Auto Close Dialog (`closeTemplateDialog` / `closeDialog`):** Ngay sau khi API trả về status 200/201, FE kích hoạt hàm đóng dialog `closeTemplateDialog()` hoặc `setOpen(false)`.
3. **Automatic List Re-fetch (`loadAll` / `loadRows`):** Ngay sau khi đóng dialog, FE kích hoạt `await loadAll()` hoặc `queryClient.invalidateQueries()` để cập nhật bảng dữ liệu ngoài màn hình chính mà không cần F5.

