# PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01 — Physical DB delta · 8 `XEVN_*` template_code

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01` |
| **lane** | governance · ba-data |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` · Tech [`XEVN-TPL-TECHSPEC-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md) |
| **change_mode** | **EXPAND** DATA-01/02 · **ADD** columns/constraints · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — **@CHANGE CORR-01 SUPERSEDES** closed enum / FORBIDDEN 9th / CHK IN (8); open catalog + starter 8 optional |
| **ref_tech** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md) §2–§7 · Option A LOCK (**open catalog** per CORR-01) |
| **ref_spec** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md) §2 · §5 · **CORR-01** |
| **ref_corr** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`DYNAMIC-LOCK`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **ref_data_spine** | [`DATA-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) · [`DATA-02`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) — **must_keep** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **v0.19** · **FR-UC-BP-CORE-09d** |
| **Honesty** | `contracts_printable_ready=false` · U65 zero-seed · **không** claim printable UAT |
| **must_keep** | UF-HRM-02 · print-spine GWC · **Q-CTR-01 CLOSED** · **Q-CTR-02 CLOSED** · DATA-02 lineage publish/pull/apply · pack `GENERAL`\|`IT_OFFICE`\|`DRIVER` · BR-CD-F5-01 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Storage | **Option A** — SoT = `hrm_contract_templates.code` **open catalog** (+ optional starter **8 `XEVN_*`** + legacy); **không** bảng catalog riêng; **không** FE-only enum; **không** closed CHECK IN (8) |
| Template EXPAND | ADD `default_term_type` · `default_duration_days` · `default_duration_months` · `title_print_vi` · `matrix_family` + keyword_map schema tokens |
| Pack gate XEVN starter | App: starter `XEVN_*` → `pack_code` ∈ `{IT_OFFICE, DRIVER}` per matrix §2; custom codes → pack ∈ configured packs |
| Print freeze | **ADD column** `hrm_contract_print_versions.template_code` (SoT list/F5); mirror into `merged_fields_json` meta on issue |
| Registry denorm | **ADD** nullable `employee_contracts.template_code` (optional F5); keep `template_id` soft FK |
| GPLX 4 fields | **CONFIRMED live SoT = `employee_contracts` columns** (not employee JSON blob; **not** cb ring) — see §5 |
| Number pattern | **CONFIRMED** CFG on `hrm_company_settings` keys — not FE hardcode; not new OU table GĐ1 |
| DATA-02 lineage | **must_keep** `origin*` · publishes · pull_audits; payload shape **EXPAND** fields only |
| 9th+ template_code | **REQUIRED** via Settings CRUD (CORR-01) — **SUPERSEDES** prior FORBIDDEN 9th |
| CHK `code IN (8)` | **FORBIDDEN to ship** (CORR-01) |
| Dev this seat | **NO** `apps/**` |
| Honesty | **remain false** |

---

## 2. Starter `template_code` set (machine — optional bootstrap, **not** ceiling)

> **@CHANGE CORR-01:** 8 mã dưới = **starter examples** từ Excel. Catalog **open**. Cấm `CHK code IN (8)`. HR CRUD 9+.

```text
XEVN_PROBATION_OFFICE | XEVN_FT_12M_OFFICE | XEVN_FT_24M_OFFICE | XEVN_INDEF_OFFICE |
XEVN_PROBATION_DRIVER | XEVN_FT_12M_DRIVER | XEVN_FT_24M_DRIVER | XEVN_INDEF_DRIVER
```

| `code` | Required `pack_code` | `default_term_type` | `default_duration_days` | `default_duration_months` | `title_print_vi` | `matrix_family` |
|--------|----------------------|---------------------|-------------------------|---------------------------|------------------|-----------------|
| `XEVN_PROBATION_OFFICE` | `IT_OFFICE` | `probation` | **60** | NULL | HỢP ĐỒNG THỬ VIỆC | `XEVN_MATRIX` |
| `XEVN_FT_12M_OFFICE` | `IT_OFFICE` | `definite` | NULL | **12** | HỢP ĐỒNG LAO ĐỘNG | `XEVN_MATRIX` |
| `XEVN_FT_24M_OFFICE` | `IT_OFFICE` | `definite` | NULL | **24** | HỢP ĐỒNG LAO ĐỘNG | `XEVN_MATRIX` |
| `XEVN_INDEF_OFFICE` | `IT_OFFICE` | `indefinite` | NULL | NULL | HỢP ĐỒNG LAO ĐỘNG | `XEVN_MATRIX` |
| `XEVN_PROBATION_DRIVER` | `DRIVER` | `probation` | **60** | NULL | HỢP ĐỒNG THỬ VIỆC | `XEVN_MATRIX` |
| `XEVN_FT_12M_DRIVER` | `DRIVER` | `definite` | NULL | **12** | HỢP ĐỒNG LAO ĐỘNG | `XEVN_MATRIX` |
| `XEVN_FT_24M_DRIVER` | `DRIVER` | `definite` | NULL | **24** | HỢP ĐỒNG LAO ĐỘNG | `XEVN_MATRIX` |
| `XEVN_INDEF_DRIVER` | `DRIVER` | `indefinite` | NULL | NULL | HỢP ĐỒNG LAO ĐỘNG | `XEVN_MATRIX` |

**Legacy rows** (`HDLD_STANDARD`, …): `matrix_family='LEGACY'` or NULL; **no** force duration columns; pack may remain `GENERAL`\|`IT_OFFICE`\|`DRIVER`\|`LOGISTICS` per DATA-01.

**Alias sheets** `HĐKXĐ` / `HĐ KXĐ` → **no auto-bootstrap row** / **no starter code** (AC-CTR-XEVN-10). **CORR-01:** HR vẫn được tạo mã tùy chỉnh khác (AC-CTR-XEVN-11).

---

## 3. EXPAND `hrm_contract_templates` (physical)

### 3.1 ADD columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `default_term_type` | text | YES | NULL | `probation`\|`definite`\|`indefinite` — required when `matrix_family='XEVN_MATRIX'` |
| `default_duration_days` | int | YES | NULL | Probation → **60**; else NULL |
| `default_duration_months` | int | YES | NULL | **12** \| **24** \| NULL (indefinite/probation) |
| `title_print_vi` | text | YES | NULL | Print chrome title (`{{contract_title_print}}`) |
| `matrix_family` | text | YES | NULL | `XEVN_MATRIX` \| `LEGACY` \| NULL |

**Keep (DATA-01 + DATA-02 — must_keep):** `id`, `company_id`, `code`, `name_vi`, `pack_code`, `layout_json`, `keyword_map`, `status`, `version`, `archived_at`, timestamps/by, lineage `origin` · `origin_company_id` · `origin_publish_version` · `lineage_code`.

### 3.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **UQ keep** | Partial `(company_id, lower(code)) WHERE archived_at IS NULL` — DATA-01 |
| **IX keep** | `(company_id, status)`, `(company_id, pack_code)` |
| **IX ADD** | `(company_id, matrix_family)` WHERE `matrix_family IS NOT NULL` |
| **IX ADD** | `(company_id, code)` WHERE `code LIKE 'XEVN_%' AND archived_at IS NULL` (picker/matrix filter — starter + custom `XEVN_%`) |
| **CHK `chk_hrm_ctr_tpl_xevn_code`** | **REMOVED / FORBIDDEN (CORR-01)** — prior `code NOT LIKE 'XEVN_%' OR code IN (<8>)` **SUPERSEDED**; do **not** ship |
| **CHK `chk_hrm_ctr_tpl_xevn_pack`** | **REVISED (optional):** starter matrix pack gate may stay **app-layer** for known starter codes; **cấm** use as closed code enum. Prefer: `pack_code` ∈ configured packs for all rows |
| **CHK `chk_hrm_ctr_tpl_term_type`** | `default_term_type IS NULL OR default_term_type IN ('probation','definite','indefinite')` |
| **CHK `chk_hrm_ctr_tpl_duration_months`** | `default_duration_months IS NULL OR default_duration_months IN (12,24)` — **note:** custom templates may need broader duration later (app validate); GĐ1 keep CHK or move to app |
| **CHK `chk_hrm_ctr_tpl_matrix_family`** | `matrix_family IS NULL OR matrix_family IN ('XEVN_MATRIX','LEGACY')` |
| **App invariant AC-CTR-XEVN-01** | **CORR-01:** open catalog — **no** “exactly 8” ceiling; optional CTA if starter 8 missing after ensure; UI SoT = **all active** templates (filter optional `matrix=xevn` for starter family only) |
| **App invariant AC-CTR-XEVN-11** | Settings create 9th+ → persist → list/F5 → bind preview |

### 3.3 `keyword_map` JSON schema (tokens — physical contract)

Shape unchanged (TECHSPEC-01):

```json
{
  "{{token}}": { "source": "path.to.field", "ring": "public|company|contract|cb|clause" }
}
```

| Token | `source` (physical path) | Ring | Required when |
|-------|--------------------------|------|---------------|
| `{{employer_legal_name}}` | company/OU legal display | company | always merge |
| `{{employer_unit_label}}` | `company_slug_map.display_name` / OU | company | always |
| `{{employer_address}}` | company/OU address | company | always |
| `{{contract_number}}` | `employee_contracts.contract_code` | contract | always |
| `{{contract_number_suggested}}` | generator from Settings pattern | contract | preview hint only |
| `{{contract_title_print}}` | `hrm_contract_templates.title_print_vi` | contract | matrix |
| `{{term_type_label_vi}}` | derived from `default_term_type` / contract.`term_type` | contract | matrix |
| `{{effective_from}}` / `{{effective_to}}` | `start_date` / `end_date` | contract | term rules |
| `{{driver_license_number}}` | `employee_contracts.driver_license_number` | public | DRIVER pack |
| `{{driver_license_class}}` | `employee_contracts.license_class` | public | DRIVER |
| `{{driver_license_issued_on}}` | `employee_contracts.driver_license_issued_on` | public | DRIVER |
| `{{driver_license_issued_place}}` | `employee_contracts.driver_license_issued_place` | public | DRIVER |
| `{{license_class}}` / `{{vehicle_plate}}` | AS-IS spine tokens | public | DRIVER (must_keep plate) |

**`layout_json` flag:** `show_driver_license_block: true` iff `pack_code='DRIVER'`.

### 3.4 DATA-02 publish payload EXPAND (no wipe)

Canonical item in `hrm_contract_library_publishes.payload_json.templates[]` **ADD** fields when present:

```json
{
  "code", "name_vi", "pack_code", "layout_json", "keyword_map", "version",
  "default_term_type", "default_duration_days", "default_duration_months",
  "title_print_vi", "matrix_family"
}
```

Checksum input includes new keys (stable order). Lineage upsert copies these columns. **VAL-PUB-*** unchanged.

---

## 4. EXPAND `hrm_contract_print_versions` — freeze `template_code`

| ADD column | Type | Null | Rule |
|------------|------|------|------|
| `template_code` | text | YES | Frozen at VER-01 issue; **SoT** for list/F5 / AC-CTR-XEVN-07; NULL only for legacy versions issued before matrix |

| **IX ADD** | `(company_id, template_code)` WHERE `template_code IS NOT NULL` |
| **Rule** | On issue: set `template_code` := templates.`code` (or request); also stamp `merged_fields_json._meta.template_code` **mirror** (same txn) — **column wins** if diverge (repair = re-issue version) |
| **Immutability** | Issued row: **cấm** UPDATE `template_code` / snapshots — amend → new `version_no` (BR-CTR-CL-01 / BR-CTR-TPL-02) |
| **merged_fields_json** | Must include GPLX keys when `pack_code=DRIVER`; employer_* + contract_number when unit selected |

**Keep:** DATA-01 columns (`pack_code`, `template_id`, `template_version`, snapshots, status, pdf…); DATA-02 does **not** mutate print_versions on apply.

---

## 5. GPLX 4 fields — physical SoT **CONFIRMED**

### 5.1 Option evaluation

| Option | Summary | Verdict |
|--------|---------|---------|
| **A — Columns on `employee_contracts`** | Align AS-IS `license_class`·`vehicle_plate`; gate on registry/preview | **CONFIRMED GĐ1** |
| B — Dedicated cols on `employees` | Better HR master long-term | **DEFER GĐ1.5** — no AS-IS cols; avoid invent dual SoT this wave |
| C — Employee `profile_json` / metadata blob | Flexible | **REJECT** GĐ1 — weak typed validate + QA |
| D — C&B / compensation ring | Wrong domain | **FORBIDDEN** |

### 5.2 Physical map (ONE live SoT)

| Logical token | Physical column | Table | Notes |
|---------------|-----------------|-------|-------|
| `driver_license_number` | **ADD** `driver_license_number` text NULL | `employee_contracts` | |
| `driver_license_class` | **KEEP** `license_class` text NULL | `employee_contracts` | **ONE** column — alias logical name; **cấm** dual `driver_license_class` col |
| `driver_license_issued_on` | **ADD** `driver_license_issued_on` date NULL | `employee_contracts` | Display vi-VN `dd/MM/yyyy` |
| `driver_license_issued_place` | **ADD** `driver_license_issued_place` text NULL | `employee_contracts` | |
| `vehicle_plate` | KEEP | `employee_contracts` | Spine DRIVER — **must_keep** |
| `route_or_region` | KEEP | `employee_contracts` | Optional tenant |

| **Print SoT** | Freeze copies into `hrm_contract_print_versions.merged_fields_json` at issue — **≠** live after issue |
| **cb ring** | May display salary only — **never** GPLX SoT |
| **Employee master** | Optional later copy-from-employee — OPEN residual; GĐ1 HCNS enters on contract / preview overrides |

### 5.3 Validation (VAL-XEVN-*)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-XEVN-01 | `pack_code=DRIVER` issue/preview can_issue | All 4 GPLX + `vehicle_plate` (spine) non-empty | else `HRM-CTR-DRIVER-REQUIRED` + `missing_fields[]` |
| VAL-XEVN-02 | `pack_code=IT_OFFICE` / OFFICE matrix | GPLX **not** required | omit block |
| VAL-XEVN-03 | `default_term_type` / contract `term_type` ∈ `{probation,definite}` | Require `start_date` **and** `end_date` | else `HRM-CTR-TERM-INVALID` / ISSUE-BLOCKED |
| VAL-XEVN-04 | `term_type=indefinite` | Require `start_date` only; **do not** require `end_date` | AC-CTR-XEVN-06 |
| VAL-XEVN-05 | Persist starter `*_OFFICE` code with `pack_code=DRIVER` (or reverse) | Block | `HRM-CTR-TPL-PACK-MISMATCH` |
| VAL-XEVN-06 | Upsert `code` | **CORR-01 SUPERSEDE:** reject **invalid format/slug** or UQ conflict only — **cấm** reject «not in 8-set» | `HRM-CTR-TPL-CODE-INVALID` = format only |
| VAL-XEVN-07 | Starter bootstrap incomplete (optional) | Soft warn / CTA ensure — **cấm** hard block thêm mẫu 9+ | AC-CTR-XEVN-01 (admin UX) |
| VAL-XEVN-08 | Registry CRUD without `template_id`/`template_code` | Allowed | UF-HRM-02 · AC-CTR-XEVN-08 |
| VAL-XEVN-09 | Change `company_id`/OU on draft | Re-merge employer_* + re-suggest number; **no** mutate issued PV | BR-CTR-TPL-07 |
| VAL-XEVN-10 | List template id then get-by-id out of scope | Fail | 403/409 **scope_parity** U19 |
| VAL-XEVN-11 | Settings create 9th+ valid code + pack | Persist · list · F5 · selectable on PREV | AC-CTR-XEVN-11 |

Keep DATA-01 **VAL-CTR-*** · DATA-02 **VAL-PUB-*** — **no wipe**.

---

## 6. EXPAND `employee_contracts` (registry)

| ADD / tighten | Type | Null | Rule |
|---------------|------|------|------|
| `template_code` | text | YES | Denorm last selected/issued code for F5; nullable registry-only |
| `driver_license_number` | text | YES | §5 |
| `driver_license_issued_on` | date | YES | §5 |
| `driver_license_issued_place` | text | YES | §5 |
| `term_type` | text | YES | **EXPAND allowed values:** `indefinite`\|`definite`\|`probation`\|`seasonal_other` (keep seasonal; ADD probation) |

**Keep:** `template_id` soft FK · `pack_code` · `license_class` · `vehicle_plate` · AS-IS UF-HRM-02 columns · `compensation_package_id` · salary ignore BR-CD-F5-01.

| **IX ADD** | `(company_id, template_code)` WHERE `template_code IS NOT NULL AND archived_at IS NULL` |
| **Rule** | When `template_id` set → soft assert same `company_id`; optional sync `template_code` from templates.`code` on save |

---

## 7. OU / company Settings — org_suffix / contract_number_pattern

### 7.1 Physical SoT — **CONFIRMED**

| Logical | Physical | Notes |
|---------|----------|-------|
| `org_suffix` | **`hrm_company_settings`** row: `setting_key='contract_number_org_suffix'` · value JSON `{ "suffix": "X.E" }` | `company_id` = legal/OU slug in scope |
| `contract_number_pattern` | Optional key `contract_number_pattern` · `{ "pattern": "{seq}/{yyyy}/{docKind}-{orgSuffix}" }` | Default pattern if missing |
| `docKind` | Derived from template family | `HDTV` if `*_PROBATION_*` else `HDLD` (render HĐTV/HĐLĐ in label) |

**FORBIDDEN:** Hardcode `Visun` / `DLX.E` / `XE` on FE. Examples in SPEC are config values only.

**Generator (service):** `{seq}/{yyyy}/{docKind}-{orgSuffix}` → write hint to preview as `contract_number_suggested`; user-editable SoT remains `employee_contracts.contract_code` (UF-HRM-02).

**No new table GĐ1** for OU suffix — reuse settings key-value (same pattern as leave ladder). If OU lacks row → fallback company/holding suffix then empty + CTA.

### 7.2 Residual

| ID | Note | Owner |
|----|------|-------|
| Q-CTR-04b | Employer legal name/address columns if company master thin | ba-data/SA when skim |
| OU settings UI | Settings surface for suffix | FE after API |

---

## 8. DTO ↔ column map (hints for API seat)

> Full F.1 Mục đích / bước SRS = SA deepen seat. Below = physical binding only.

### 8.1 F-CORE-CTR-TPL-01 / TPL-02 — `hrm_contract_templates`

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | |
| `company_id` | `company_id` | query scope |
| `code` / `template_code` | `code` | response alias `template_code` display-ready OK |
| `name_vi` | `name_vi` | |
| `pack_code` | `pack_code` | |
| `default_term_type` | `default_term_type` | ADD |
| `default_duration_days` | `default_duration_days` | ADD |
| `default_duration_months` | `default_duration_months` | ADD |
| `title_print_vi` | `title_print_vi` | ADD |
| `matrix_family` | `matrix_family` | ADD; query `matrix=xevn` → `XEVN_MATRIX` |
| `layout_json` | `layout_json` | |
| `keyword_map` | `keyword_map` | |
| `status` · `version` | same | |
| `origin*` · `lineage_code` | DATA-02 | display-ready |
| `archived_at` | exclude from list when set | |

**Errors:** `HRM-CTR-TPL-CODE-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-CL-CODE-CONFLICT` · scope.

### 8.2 F-CORE-CTR-PREV-01 — preview request/response

| DTO | Source |
|-----|--------|
| Request `template_id` / `template_code` | Resolve template row |
| Request `pack_code?` | Must match template.pack when template XEVN |
| Request `field_overrides.driver_license_*` | Overlay contract cols for preview |
| Response `template_code` · `title_print_vi` · `term_type` · `number_pattern_hint` | Template + Settings |
| Response `merged_fields` · `missing_fields[]` · `can_issue` | Merge + VAL-XEVN |

### 8.3 F-CORE-CTR-VER-01 — print version

| DTO / persist | DB |
|---------------|-----|
| Freeze `template_code` | `hrm_contract_print_versions.template_code` |
| Freeze pack / template_id / version | existing cols |
| Snapshots | `merged_fields_json` · `clauses_snapshot_json` · C&B snapshot |
| Denorm contract | `employee_contracts.pack_code` · `template_id` · **`template_code`** |

### 8.4 F-CORE-CTR-01 — registry (must_keep)

| DTO | DB |
|-----|-----|
| Optional `template_id` · `template_code` | nullable |
| Optional GPLX / plate | §5 cols |
| `contract_type` · dates · status · … | AS-IS aliases DATA-01 §2.1 |
| salary | **ignore** |

### 8.5 Settings CFG (new thin F.1 hint — SA confirm path)

| Cap hint | Path prefer | DB |
|----------|-------------|-----|
| Get/put org suffix | `GET/PUT …/company-settings?key=contract_number_org_suffix` **or** nest under contracts-insurance settings | `hrm_company_settings` |

Exact METHOD/path = **SA API deepen** (reuse existing company-settings if present).

---

## 9. scope_parity (U19)

| Cap | List | Get / mutate |
|-----|------|--------------|
| TPL-01/02 | `resolveHrmListScope` + optional `matrix=xevn` | get-by-id same resolver |
| PREV/VER | Contract in scope | version assert `company_id` |
| CTR-01 | Registry list | get-by-id parity |
| PUB/PULL/APPLY | DATA-02 unchanged | must_keep |

Journey intent (QA later, **not** UAT claim): `J-HRM-CTR-04` · `05` · `06` + UF-HRM-02 regression.

---

## 10. must_keep / forbidden

### must_keep

- UF-HRM-02 / J-HRM-03 registry CRUD without print template
- Print-spine GWC · AC-CTR-PRINT-* semantics
- **Q-CTR-01 CLOSED** · **Q-CTR-02 CLOSED**
- DATA-01 tables/VAL-CTR-* · DATA-02 publishes/lineage/pull_audits/VAL-PUB-*
- Pack codes `GENERAL` · `IT_OFFICE` · `DRIVER` (+ optional LOGISTICS)
- Soft-delete · BR-CD-F5-01 · `license_class` ONE column alias
- `contracts_printable_ready=false`

### forbidden

- `apps/**` / migrate / seed this seat
- Wipe / replace DATA-01 or DATA-02
- Invent alias **auto-bootstrap** from Excel sheets `HĐKXĐ` / `HĐ KXĐ`
- **CHK `code IN (8)`** / closed enum / FE hardcode 8 / API reject 9th as product rule
- Dual `driver_license_class` column beside `license_class`
- GPLX SoT in cb ring or opaque employee JSON GĐ1
- FE-hardcoded org suffix / number pattern
- Claim printable UAT / set `contracts_printable_ready=true`
- Redesign PDF/merge spine · reopen Q-CTR without gap

---

## 11. Traceability

| SRS | Cap | DB | Test intent |
|-----|-----|----|-------------|
| FR-09d #1 · AC-XEVN-01/10/11 | TPL-01/02 | templates EXPAND · **no** CHK IN 8 | open catalog · starter optional · 9th CRUD |
| 09d #2–#5 · AC-02..06/09 | PREV-01 | keyword_map + contract GPLX + term | title/GPLX/duration/indef |
| 09d #6–#7 · AC-07 | VER-01 | PV.`template_code` + merged freeze | F5 keeps code · unit re-merge draft only |
| 09d AC-08 · UF-02 | CTR-01 | nullable template_* | registry without template |
| 09a distribution | PUB/PULL/APPLY | DATA-02 + payload EXPAND | lineage must_keep |
| BR-CTR-TPL-05 | Settings | `hrm_company_settings` suffix | no FE hardcode |

---

## 12. Honesty & residual / unlock

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| Print-spine GWC | Giữ — matrix DATA ≠ module printable UAT |
| Residual next | **CORR-01** · **dev-be** dynamic (no CHK IN 8) · **dev-fe** Settings CRUD 9+ · QA AC-CTR-XEVN-11 U65 |
| Client DOC-DELTA | Pointer residual for ba-docs/sa: DB_DESIGN open catalog — **no wipe** CTR-01 text |

**Dev unlock:** PM may unlock BE/FE for **dynamic catalog** per CORR-01 + DYNAMIC-LOCK. Honesty remains **false**.

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Historical CONFIRMED EXPAND + **@CHANGE CORR-01:** open catalog; remove FORBIDDEN 9th & CHK IN 8; VAL-06/07 revised; VAL-11 ADD; printable=false. |
| next_owner | **pm** |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-data-01.md` · corr: `…-corr-01.md` |

---

## @CHANGE — CORR-01 (2026-08-07) dynamic catalog

| Field | Value |
|-------|--------|
| **work_item** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |
| **SUPERSEDE** | §1 «9th FORBIDDEN» · §3.2 `chk_hrm_ctr_tpl_xevn_code` IN (8) · VAL-XEVN-06 closed set · AC «exactly 8» ceiling |
| **REPLACE WITH** | Open `hrm_contract_templates` · optional upsert starter 8 · format/UQ/pack validation · AC-CTR-XEVN-11 |
| **KEEP** | Freeze PV.`template_code` · GPLX cols · Settings org_suffix · DATA-02 lineage · packs · UF-02 · Q-CTR |
| **FORBIDDEN ship** | `CHECK code IN (8 XEVN_*)` |
