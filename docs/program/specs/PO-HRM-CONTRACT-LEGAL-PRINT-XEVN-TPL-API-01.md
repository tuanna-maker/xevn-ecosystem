# PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01 — API_DESIGN F.1 deepen · FR-UC-BP-CORE-09d

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01` |
| **lane** | governance · sa |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **change_mode** | **ADD / EXPAND** · **NO CODE** `apps/**` · **no seed** · **no wipe** DATA-01/02 / XEVN-TPL-DATA / print-spine |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — **@CHANGE CORR-01 SUPERSEDES** closed enum 8 / FORBIDDEN 9th; open catalog unlock BE/FE dynamic |
| **ref_data** | [`XEVN-TPL-DATA-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md) **CONFIRMED** §3–§8 · **CORR-01** |
| **ref_corr** | [`CORR-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`DYNAMIC-LOCK`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **ref_tech** | [`XEVN-TPL-TECHSPEC-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md) §6 F.1 overlay |
| **ref_spine** | [`DATA-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) §5 · [`DATA-02`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) §7 **must_keep** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **v0.19** · **FR-UC-BP-CORE-09d** Diễn biến #1–#7 · AC-CTR-XEVN-01..**11** |
| **Client pointer** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) DOC-DELTA (cite — **no wipe** F-CORE-CTR-*) |
| **Honesty** | `contracts_printable_ready=false` · U65 zero-seed · **không** claim printable UAT · **Q-CTR-01/02 CLOSED** |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective & locks

Deepen **API_DESIGN F.1** for FR-09d matrix onto physical Nest prefix **`/api/hrm/contracts-insurance`**, binding DTO ↔ XEVN-TPL-DATA columns.

| Lock | Rule |
|------|------|
| Paths | **Preserve** DATA-01 §5 METHOD/path spine — **EXPAND** query/body/response only |
| Library | DATA-02 `/contract-library/*` PUB/PULL/APPLY **must_keep** — payload templates[] may carry new fields; no new library F-id |
| Enum / catalog | **CORR-01 SUPERSEDE:** **open catalog** — starter 8 optional; HR CRUD **9+**; **FORBIDDEN** closed 8 enum · API reject 9th · FE hardcode 8 |
| GPLX SoT | Live = `employee_contracts` columns; `license_class` = class alias (**ONE** col) |
| Number CFG | `hrm_company_settings` keys — **not** FE hardcode |
| Freeze | `hrm_contract_print_versions.template_code` column **wins**; `merged_fields_json._meta.template_code` mirror |
| Registry | Nullable `template_id` / `template_code` — UF-HRM-02 / AC-CTR-XEVN-08 |
| Scope | list ↔ get ↔ mutate = `resolveHrmListScope` + `assertResourceInHrmScope` (U19) |
| Honesty | Print-spine GWC ≠ `contracts_printable_ready=true` |

**Envelope:** `{ code, message, data }` · Soft-delete only.

---

## 1. Capability map (overlay — no path redesign)

| Cap | F-id | METHOD / path (physical — locked) | 09d delta |
|-----|------|-----------------------------------|-----------|
| List templates | **F-CORE-CTR-TPL-01** | `GET …/contract-templates` | `matrix=xevn` · ADD display cols |
| Get template | **F-CORE-CTR-TPL-01** | `GET …/contract-templates/:templateId` | same scope; display-ready matrix fields |
| Upsert / activate | **F-CORE-CTR-TPL-02** | `POST/PATCH …/contract-templates` · `POST …/:id/activate` | CODE/PACK/term/duration gates |
| Registry CRUD | **F-CORE-CTR-01** | `GET/POST/PATCH/DELETE …/contracts` | nullable template_* · GPLX optional |
| Pack resolve | **F-CORE-CTR-PACK-01** | `GET …/contracts/pack-resolve` | when template selected → pack from template **wins** suggestion |
| Preview | **F-CORE-CTR-PREV-01** | `POST …/contracts/:id/preview` | `template_code` · GPLX · term · number hint |
| Issue version | **F-CORE-CTR-VER-01** | `POST …/contracts/:id/print-versions` | freeze `template_code` + denorm |
| List/get versions | **F-CORE-CTR-VER-02** | `GET …/contracts/:id/print-versions` · `…/:versionId` | expose frozen `template_code` |
| PDF | **F-CORE-CTR-PDF-01** | `GET …/print-versions/:versionId/pdf` | snapshot only — **no redesign** |
| Number CFG | **F-CORE-CTR-CFG-01** | `GET/PUT …/company-settings` (**ADD** thin) | org_suffix · pattern |
| Publish / pull / apply | **F-CORE-CTR-PUB/PULL/APPLY** | DATA-02 §7 paths | payload EXPAND fields only |

---

## 2. Starter codes & aliases (optional bootstrap — **not** API ceiling)

> **@CHANGE CORR-01:** Machine list dưới = starter examples. Upsert **any** valid code (9+) allowed.

```text
XEVN_PROBATION_OFFICE | XEVN_FT_12M_OFFICE | XEVN_FT_24M_OFFICE | XEVN_INDEF_OFFICE |
XEVN_PROBATION_DRIVER | XEVN_FT_12M_DRIVER | XEVN_FT_24M_DRIVER | XEVN_INDEF_DRIVER
```

| Alias plane | Rule |
|-------------|------|
| Request `code` / `template_code` | Same value when referring to `hrm_contract_templates.code` |
| Response | Prefer both `code` and `template_code` (echo) — **never** diverge |
| `driver_license_class` ↔ `license_class` | DTO may accept either; persist **`license_class`** only |
| Dates | API ISO `yyyy-MM-dd`; display vi-VN `dd/MM/yyyy` on FE |

---

## 3. API_DESIGN F.1 — FR-09d deepen

### 3.1 F-CORE-CTR-TPL-01 — List / get templates (matrix consume)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-templates` · `GET …/contract-templates/:templateId` |
| **Mục đích** | Trả mẫu hiệu lực (gồm 8 mã X.E) cho picker tạo/sửa HĐ và Settings — đủ metadata thời hạn / tiêu đề in / họ ma trận. |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + `company_id`. (2) Exclude `archived_at IS NOT NULL`. (3) Optional `status`, `pack_code`. (4) **`matrix=xevn`** → `matrix_family='XEVN_MATRIX'` **AND** `code IN` 8-set (equiv. `code LIKE 'XEVN_%'` + CHECK). (5) Empty `[]` = **200** + FE CTA cấu hình — **không** fake 8 rows. (6) Get-by-id: **same** scope resolver — out of scope → 404/403 (VAL-XEVN-10). (7) Display-ready lineage DATA-02 fields khi có. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09d** Diễn biến **#1** · AC-CTR-XEVN-01 · AC-CTR-XEVN-10 · **09** AC-CTR-TPL-01 |
| **Request (query)** | `company_id` (required) · `matrix?` (`xevn`) · `pack_code?` · `status?` |
| **Response → DB** | `hrm_contract_templates`: |

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | |
| `company_id` | `company_id` | |
| `code` / `template_code` | `code` | alias echo |
| `name_vi` | `name_vi` | |
| `pack_code` | `pack_code` | |
| `default_term_type` | `default_term_type` | ADD |
| `default_duration_days` | `default_duration_days` | ADD |
| `default_duration_months` | `default_duration_months` | ADD |
| `title_print_vi` | `title_print_vi` | ADD |
| `matrix_family` | `matrix_family` | `XEVN_MATRIX` \| `LEGACY` \| null |
| `layout_json` · `keyword_map` | same | |
| `status` · `version` | same | |
| `origin` · `origin_company_id` · `origin_publish_version` · `lineage_code` | DATA-02 | display-ready |

| **Lỗi** | Scope 403/409 · 403 thiếu quyền cấu hình · empty **không** 404 |
| **scope_parity** | List filter = get-by-id assert |

---

### 3.2 F-CORE-CTR-TPL-02 — Upsert / activate (matrix gate)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-templates` · `PATCH …/contract-templates/:templateId` · `POST …/:templateId/activate` |
| **Mục đích** | Tạo/sửa/activate mẫu; khóa pack↔starter matrix khi áp dụng; **cho phép** mã thứ 9+; ghi metadata thời hạn / tiêu đề. |
| **Nghiệp vụ xử lý** | (1) Scope. (2) Validate `code` **format/slug** + UQ — **CORR-01:** **cấm** reject vì «not in 8-set»; `HRM-CTR-TPL-CODE-INVALID` = format only. (3) If starter `XEVN_*` known matrix → enforce pack ∈ `{IT_OFFICE,DRIVER}` per matrix · term/duration defaults · `matrix_family='XEVN_MATRIX'` · `title_print_vi` required when activating matrix row; **custom** codes → `pack_code` ∈ configured packs · term/duration per DTO rules. (4) Persist starter `*_OFFICE` with `pack_code=DRIVER` (or reverse) → **`HRM-CTR-TPL-PACK-MISMATCH`**. (5) UQ `(company_id, lower(code))` active → `HRM-CTR-CL-CODE-CONFLICT`. (6) Soft-delete / retire only; bump `version` on activate after issued use (spine). (7) Lineage DATA-02 columns **must_keep** on upsert from apply — do not strip. (8) Soft warn nếu thiếu starter bootstrap (optional CTA) — **cấm** hard block thêm mẫu (AC-CTR-XEVN-11). |
| **Tham chiếu bước SRS** | **09d** AC-CTR-XEVN-01/10/**11** · **09** AC-CTR-TPL-01..05 · BR-CTR-TPL-01 · BR-CTR-TPL-DYN-* · VAL-XEVN-05/06/07/11 |
| **Request → DB** | |

| DTO | DB | Required when |
|-----|-----|---------------|
| `company_id` | `company_id` | always |
| `code` | `code` | create |
| `name_vi` | `name_vi` | create / activate |
| `pack_code` | `pack_code` | create; XEVN locked to matrix |
| `default_term_type` | `default_term_type` | XEVN_MATRIX |
| `default_duration_days` | `default_duration_days` | probation → 60 |
| `default_duration_months` | `default_duration_months` | 12 \| 24 \| null |
| `title_print_vi` | `title_print_vi` | XEVN activate |
| `matrix_family` | `matrix_family` | set `XEVN_MATRIX` for XEVN codes |
| `layout_json` · `keyword_map` · `status` · `clause_ids` | spine | optional |

| **Lỗi** | `HRM-CTR-TPL-CODE-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-CL-CODE-CONFLICT` · `HRM-VAL-400` · scope |
| **scope_parity** | Mutate assert same list scope |

---

### 3.3 F-CORE-CTR-PREV-01 — Merge preview (09d overlay)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:contractId/preview` |
| **Mục đích** | Xem trước theo `template_code`: tiêu đề · nhãn loại · duration hint · GPLX (DRIVER) · pattern số · `can_issue` — **không** persist. |
| **Nghiệp vụ xử lý** | (1) Scope contract. (2) Resolve template by `template_id` **or** `template_code` (active, same company). Missing both + no default → `HRM-CTR-TPL-NONE`. (3) Set `pack_code` from template when XEVN; request `pack_code` override that mismatches template → **`HRM-CTR-TPL-PACK-MISMATCH`**. (4) Apply duration **hints** if dates empty (probation +60d; FT +12/+24m) — user-editable; **do not** invent end for indefinite. (5) Term gate: `probation`\|`definite` require `start_date`+`end_date` else add missing / `HRM-CTR-TERM-INVALID` path via `can_issue=false` + `missing_fields` (issue throws `HRM-CTR-ISSUE-BLOCKED` or TERM). Indefinite: **do not** require `end_date` (AC-CTR-XEVN-06 / VAL-XEVN-04). (6) Merge keyword_map (employer_* · contract_number · title · term · GPLX). (7) Read `hrm_company_settings` → build `number_pattern_hint` / `contract_number_suggested` (BR-CTR-TPL-05). (8) DRIVER: require GPLX quartet + `vehicle_plate`; OFFICE: omit GPLX required (VAL-XEVN-01/02). Overrides in `field_overrides` overlay live cols for preview only. (9) C&B ACL spine. (10) Return `can_issue` + lists. |
| **Tham chiếu bước SRS** | **09d #2–#5** · AC-CTR-XEVN-02..06/09 · **09b** AC-CTR-PRINT-02/03/06 · BR-CTR-TPL-03/04/05/06/07 |
| **Request** | |

```text
{
  template_id?: uuid,
  template_code?: string,          // ADD — resolve if no template_id
  pack_code?: string,              // optional; must match template when XEVN (AS-IS required today → BE may keep required OR derive from template when template_code set — prefer derive when template resolved)
  field_overrides?: {
    driver_license_number?,
    driver_license_class? | license_class?,
    driver_license_issued_on?,     // yyyy-MM-dd
    driver_license_issued_place?,
    vehicle_plate?,
    employer_unit_label?,          // draft OU switch
    contract_code?,
    start_date? / end_date? / effective_from? / effective_to?
  },
  can_view_cb?: boolean
}
```

| **Response (EXPAND spine)** | |

```text
{
  pack_code,
  template_id,
  template_code,                 // ADD
  title_print_vi,                // ADD
  term_type,                     // ADD — probation|definite|indefinite
  default_duration_days?,
  default_duration_months?,
  number_pattern_hint,           // ADD — from Settings pattern + suffix
  contract_number_suggested?,    // preview only until save registry
  sections[],
  merged_fields,                 // includes GPLX keys when DRIVER; employer_*; contract_number
  clauses[],
  missing_fields[],              // expand: driver_license_* · vehicle_plate · dates
  missing_clauses[],
  can_issue,
  cb_masked,
  show_driver_license_block      // true iff pack_code=DRIVER
}
```

| **Lỗi** | `HRM-CTR-TPL-NONE` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TERM-INVALID` · `HRM-CTR-DRIVER-REQUIRED` (+ `missing_fields[]`) · `HRM-CTR-PACK-INVALID` · `HRM-CTR-UNIT-SCOPE` · scope |
| **scope_parity** | Contract in list scope |

**`HRM-CTR-DRIVER-REQUIRED` expand (VAL-XEVN-01):** when `pack_code=DRIVER` and any of the following empty → 400 **or** preview `can_issue=false` with same code on issue:

| missing key | Live SoT |
|-------------|----------|
| `driver_license_number` | `employee_contracts.driver_license_number` |
| `driver_license_class` | `employee_contracts.license_class` |
| `driver_license_issued_on` | `employee_contracts.driver_license_issued_on` |
| `driver_license_issued_place` | `employee_contracts.driver_license_issued_place` |
| `vehicle_plate` | `employee_contracts.vehicle_plate` (spine must_keep) |

---

### 3.4 F-CORE-CTR-VER-01 — Save print version (freeze)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:contractId/print-versions` |
| **Mục đích** | Lưu phiên bản in kèm snapshot `template_code` + merge (đơn vị · số · GPLX nếu DRIVER); F5 còn mã mẫu. |
| **Nghiệp vụ xử lý** | (1) Re-run PREV validation server-side. (2) `!can_issue` → `HRM-CTR-ISSUE-BLOCKED` (detail may include DRIVER/TERM missing). (3) INSERT `hrm_contract_print_versions`: freeze `template_id`, `template_version`, `pack_code`, **`template_code`** := templates.`code`, snapshots. (4) Same txn: `merged_fields_json._meta.template_code` **mirror**; **column wins** if diverge. (5) Denorm `employee_contracts.pack_code`, `template_id`, **`template_code`**. (6) Prior issued → `superseded`. (7) Issued row **immutable** — amend → new `version_no`. (8) **Không** mutate print_versions from PUB/PULL/APPLY (DATA-02 VAL-PUB-09). |
| **Tham chiếu bước SRS** | **09d #6–#7** · AC-CTR-XEVN-07 · **09c #1** · AC-CTR-PRINT-04 · BR-CTR-CL-01 |
| **Request → DB** | Same inputs as PREV (+ optional overrides) → print_versions + denorm contract |
| **Response → DB** | version row display-ready including `template_code`, `version_no`, `pack_code`, `status=issued` |
| **Lỗi** | `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-TPL-NONE` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-TERM-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · scope |

### 3.4b F-CORE-CTR-VER-02 — List/get versions (F5)

| | |
|--|--|
| **METHOD / path** | `GET …/contracts/:id/print-versions` · `GET …/print-versions/:versionId` |
| **Mục đích** | Sau Lưu / F5: còn `template_code` · `version_no` · snapshot metadata (AC-CTR-XEVN-07). |
| **Nghiệp vụ xử lý** | scope_parity; expose frozen `template_code` (column SoT); mask C&B if `!canViewCb`. |
| **Tham chiếu bước SRS** | **09d #7** · **09c #3** · AC-CTR-PRINT-04 |
| **Lỗi** | 404 scope |

---

### 3.5 F-CORE-CTR-01 — Registry CRUD (must_keep UF-HRM-02)

| | |
|--|--|
| **METHOD / path** | `GET/POST /api/hrm/contracts-insurance/contracts` · `GET/PATCH/DELETE …/contracts/:id` |
| **Mục đích** | CRUD sổ đăng ký **không** bắt buộc chọn mẫu in (AC-CTR-XEVN-08). |
| **Nghiệp vụ xử lý** | AS-IS + optional nullable `template_id` / `template_code`; optional GPLX / plate cols; **ignore salary** (BR-CD-F5-01); when `template_id` set → soft assert same `company_id` + optional sync `template_code` from templates.`code`; VAL-XEVN-08 allow omit; G-CI-01 / V-05 keep. |
| **Tham chiếu bước SRS** | **09d #1** · UF-HRM-02 · AC-CTR-XEVN-08 · AC-CTR-PRINT-08 · **09b #1** |
| **Request → DB (EXPAND optional)** | |

| DTO | DB | Null OK? |
|-----|-----|----------|
| `template_id` | `template_id` | YES |
| `template_code` | `template_code` | YES |
| `term_type` | `term_type` | YES — allow `indefinite`\|`definite`\|`probation`\|`seasonal_other` |
| `driver_license_number` | `driver_license_number` | YES |
| `license_class` / `driver_license_class` | `license_class` | YES — ONE col |
| `driver_license_issued_on` | `driver_license_issued_on` | YES |
| `driver_license_issued_place` | `driver_license_issued_place` | YES |
| `vehicle_plate` | `vehicle_plate` | YES |
| AS-IS registry fields | DATA-01 §2.1 | keep |
| salary / compensation write | — | **ignore** |

| **Lỗi** | AS-IS `HRM-CON-*` · scope — **không** regress; **không** force template |
| **scope_parity** | List = get-by-id |

---

### 3.6 F-CORE-CTR-CFG-01 — Contract number Settings (**ADD**)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/contracts-insurance/company-settings?company_id=&key=` · `PUT /api/hrm/contracts-insurance/company-settings` |
| **Mục đích** | Đọc/ghi hậu tố & pattern số HĐ theo pháp nhân/OU — **không** hardcode FE (BR-CTR-TPL-05). |
| **Nghiệp vụ xử lý** | (1) Scope `company_id`. (2) Upsert `hrm_company_settings` by `(tenant_id, company_id, setting_key)`. (3) Allowed keys GĐ1: `contract_number_org_suffix` · `contract_number_pattern`. (4) Missing key on GET → **200** with `value=null` + default pattern hint in message/meta (FE CTA) — **not** 404. (5) PREV consumes these keys for `number_pattern_hint`. (6) Fallback chain: OU row → company → holding → empty. |
| **Tham chiếu bước SRS** | **09d** BR-CTR-TPL-05 · AC-CTR-XEVN-07 · Diễn biến #3/#7 |
| **Request PUT** | `{ company_id, setting_key, value }` |
| **Value shapes** | |

| `setting_key` | `value` JSON |
|---------------|--------------|
| `contract_number_org_suffix` | `{ "suffix": "X.E" }` |
| `contract_number_pattern` | `{ "pattern": "{seq}/{yyyy}/{docKind}-{orgSuffix}" }` |

| **Generator (service, not FE)** | `{seq}/{yyyy}/{docKind}-{orgSuffix}` · `docKind` = `HDTV` if `*_PROBATION_*` else `HDLD` (label HĐTV/HĐLĐ) |
| **Response → DB** | `{ company_id, setting_key, value, updated_at }` ← `hrm_company_settings` |
| **Lỗi** | `HRM-VAL-400` unknown key · scope 403/409 · `HRM-CTR-UNIT-SCOPE` |
| **scope_parity** | Get/put same resolver |
| **Note** | Physical table shared with leave ladder CFG; Nest mount under **contracts-insurance** this wave to bound blast radius. Future shared `/api/hrm/company-settings` may alias same SoT — **ONE** physical table. |

---

### 3.7 F-CORE-CTR-PACK-01 — Pack resolve (thin overlay)

| | |
|--|--|
| **METHOD / path** | `GET …/contracts/pack-resolve?employee_id=&company_id=` |
| **Mục đích** | Gợi ý pack từ chức danh — HCNS đổi được. |
| **Nghiệp vụ xử lý** | Spine unchanged. When client later binds `template_code`, **PREV/VER** use template.pack — pack resolve does **not** invent XEVN codes. |
| **Tham chiếu bước SRS** | **09b #1–#2** · **09d #2** |

---

### 3.8 DATA-02 library — must_keep (no new F-id)

| Cap | Path | 09d note |
|-----|------|----------|
| PUB-01/02 · PULL-01 · APPLY-01 | `/contract-library/*` | `payload_json.templates[]` **may include** `default_term_type`, `default_duration_*`, `title_print_vi`, `matrix_family`; checksum includes new keys; lineage upsert copies columns; VAL-PUB-* unchanged; **cấm** mutate print_versions |

---

### 3.9 F-CORE-CTR-PDF-01 — must_keep

Unchanged spine: render from frozen snapshot only. GPLX/title already in snapshot after VER-01. **Q-CTR-02 CLOSED** — no reopen.

---

## 4. Error taxonomy (deterministic)

| Code | HTTP | When | VAL / AC |
|------|------|------|----------|
| `HRM-CTR-TPL-CODE-INVALID` | 400 | `XEVN_%` not in 8-set / forbidden alias | VAL-XEVN-06 · AC-10 |
| `HRM-CTR-TPL-PACK-MISMATCH` | 400 | OFFICE code + DRIVER pack (or reverse) | VAL-XEVN-05 |
| `HRM-CTR-TERM-INVALID` | 400 | definite/probation missing end; or indefinite forced-require end wrongly on issue path | VAL-XEVN-03/04 · AC-06 |
| `HRM-CTR-DRIVER-REQUIRED` | 400 | DRIVER missing GPLX quartet and/or `vehicle_plate`; details.`missing_fields[]` | VAL-XEVN-01 · AC-09 |
| `HRM-CTR-UNIT-SCOPE` | 403/409 | OU/company outside token scope | BR-CTR-TPL-06 |
| `HRM-CTR-TPL-NONE` | 400 | 0 active template | spine |
| `HRM-CTR-ISSUE-BLOCKED` | 400 | `!can_issue` (missing fields/clauses) | spine + XEVN |
| `HRM-CTR-PACK-INVALID` | 400 | Unknown pack | spine |
| `HRM-CTR-CL-CODE-CONFLICT` | 409 | Active code UQ (template/clause) | spine |
| `HRM-CTR-PUB-*` | per DATA-02 | Library | must_keep |
| Scope | 403/409 | U19 parity | VAL-XEVN-10 |
| AS-IS | `HRM-CON-*` | Registry | must_keep |

**Preview vs issue:** Preview may return `can_issue=false` + `missing_fields[]` with **200**; VER-01 / PDF gates raise the codes above.

---

## 5. scope_parity (U19)

| Cap | List | Get / mutate |
|-----|------|--------------|
| TPL-01/02 | `resolveHrmListScope` + optional `matrix=xevn` | get-by-id / PATCH same |
| PREV / VER / PDF | Contract in scope | version `company_id` assert |
| CTR-01 | Registry list | get-by-id parity |
| CFG-01 | Settings by `company_id` in scope | PUT same |
| PUB/PULL/APPLY | DATA-02 | unchanged |

Journey intent (QA later — **not** UAT claim): `J-HRM-CTR-04` · `05` · `06` + UF-HRM-02 regression.

---

## 6. DTO ↔ column summary (binding SoT)

| Cap | Primary tables |
|-----|----------------|
| TPL | `hrm_contract_templates` (+ ADD cols DATA §3) |
| PREV | read templates + `employee_contracts` + settings → merged view |
| VER | write `hrm_contract_print_versions.template_code` + `merged_fields_json`; denorm `employee_contracts.template_code` |
| CTR | `employee_contracts` nullable template_* + GPLX cols |
| CFG | `hrm_company_settings` |
| PUB payload | DATA-02 publishes.payload_json EXPAND |

---

## 7. must_keep / forbidden

### must_keep

- DATA-01 F.1 paths · VAL-CTR-* · UF-HRM-02 / J-HRM-03
- DATA-02 `/contract-library/*` · VAL-PUB-* · lineage
- Print-spine GWC · **Q-CTR-01 CLOSED** · **Q-CTR-02 CLOSED**
- Pack `GENERAL`\|`IT_OFFICE`\|`DRIVER` (+ optional LOGISTICS)
- Soft-delete · BR-CD-F5-01 · `license_class` ONE column
- `contracts_printable_ready=false`

### forbidden

- `apps/**` / seed this seat
- Wipe DATA-01/02 / XEVN-TPL-DATA / F-CORE-CTR stubs
- Closed enum 8 · CHK IN (8) · reject 9th as product rule · FE hardcode list 8
- Dual `driver_license_class` physical column
- FE-hardcoded org suffix / pattern
- Claim printable UAT / reopen Q-CTR without gap
- Redesign PDF/merge spine · live holding PREV join

---

## 8. Traceability

| SRS | Cap | DB | Test intent |
|-----|-----|----|-------------|
| 09d #1 · AC-01/10/11 | TPL-01/02 | templates EXPAND open | catalog + starter + 9th CRUD |
| 09d #2–#5 · AC-02..06/09 | PREV-01 | keyword + GPLX + term + CFG | title/GPLX/duration/indef |
| 09d #6–#7 · AC-07 | VER-01/02 | PV.`template_code` | F5 keeps code |
| 09d AC-08 · UF-02 | CTR-01 | nullable template_* | registry without template |
| BR-CTR-TPL-05 | CFG-01 | company_settings | no FE hardcode |
| 09a distribution | PUB/PULL/APPLY | DATA-02 | lineage must_keep |

---

## 9. Honesty & Dev unlock

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| DATA + API cascade | **SUFFICIENT** + **CORR-01 dynamic** |
| Unlock order | **dev-be** EXPAND ensureSchema (**no** CHK IN 8 · open upsert) → **dev-fe** Settings **CRUD open** + picker from API → QA AC-CTR-XEVN-01..**11** U65 |
| Client DOC-DELTA | Pointer overlay on enterprise API_DESIGN — **no wipe** |

**This seat:** docs only — **no** `apps/**`.

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Historical CONFIRMED API F.1 + **@CHANGE CORR-01:** open catalog; TPL-02 no 8-set reject; CODE-INVALID=format; AC-11; printable=false. |
| next_owner | **pm** |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-api-01.md` · corr: `…-corr-01.md` |

---

## @CHANGE — CORR-01 (2026-08-07) dynamic catalog

| Field | Value |
|-------|--------|
| **work_item** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |
| **SUPERSEDE** | §0 Enum «Exactly 8 · FORBIDDEN 9th» · TPL-02 step reject not-in-8 · forbidden «Invent 9th+» · unlock «Settings 8 rows» only |
| **REPLACE WITH** | Open catalog upsert · format/UQ/pack gates · AC-CTR-XEVN-11 · Settings CRUD 9+ · BR-UI-POPUP-AUTO-CLOSE-01 |
| **KEEP** | PREV/VER freeze · UF-02 nullable · packs · DATA-02 · Q-CTR · printable=false |
| **`HRM-CTR-TPL-CODE-INVALID`** | Format/slug only — **not** closed enum |
| **TPL-01 body residual** | Historical step «`code IN` 8-set» under `matrix=xevn` — **SUPERSEDED**: filter = `matrix_family='XEVN_MATRIX'` (starter family), **not** closed code list; default list without filter = open active catalog |

---

## 5. UI API Contract & Response Handling Rule (BR-UI-POPUP-AUTO-CLOSE-01)

1. **Successful Mutation Contract (HTTP 200/201):** Khi các API POST/PATCH/PUT Cài đặt (ví dụ `POST /api/hrm/contracts-insurance/contract-templates`, `PATCH /api/hrm/contracts-insurance/contract-clauses/:id`, `POST /api/hrm/contracts-insurance/merge-tokens`...) trả về thành công `200 OK` hoặc `201 Created`:
   - FE **BẮT BUỘC** lập tức đóng Hộp thoại Dialog (`closeDialog()` / `setOpen(false)`).
   - FE **BẮT BUỘC** gọi API GET lại danh sách (`loadAll()` / `loadRows()`) hoặc `invalidateQueries()` để cập nhật dữ liệu hiển thị tức thì.

