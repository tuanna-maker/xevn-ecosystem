# PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01 — Physical DB · DEC / QSĐ decision-type catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `hr_decision_type` · **EXPAND** `hr_decisions.decision_type` note · **DOC-DELTA** client DB · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** decisions create/approve/WH · **no wipe** EMP/ATT/REC sealed |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — physical ADD per SA DEC vertical §2 + BA AC-PLT-DEC-01..06 |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` **CONFIRMED** · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01` **PASS** |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md) §2 physical · F-DEC-CAT-* · L-DEC-CAT-* |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md) AC-PLT-DEC-01..06 · BR-PLT-02/04/05/06 · BR-PLT-DEC-* · VAL-DEC-* |
| **ref_peer** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) · REC-DATA-01 |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B |
| **ref_db_client** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.11 `hr_decisions` |
| **ref_e2e** | [`PO-HRM-E2E-LINK-EMP-DB-01.md`](./PO-HRM-E2E-LINK-EMP-DB-01.md) WH `decision_id` — **must_keep** |
| **Honesty** | All ready flags **false** · U65 · no invent decisions/personnel UAT |
| **must_keep** | F-CORE-DEC-01/02 create→approve→effective→WH · settings REF `hr_decision_types` · EMP DOC/ET · ATT leave · REC stages · CTR `contract_types` OUT · soft-delete · scope TEXT slug |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.hr_decision_type` — **ABSENT AS-IS** Nest / prior platform DATA-01 / EMP-DATA / ATT-DATA / REC-DATA |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV |
| Open catalog | **`decision_type_key`** format-only CHK — **FORBIDDEN** closed enum CHECK on starter / HRD_* |
| Dual SoT | Group REF settings-catalogs **`hr_decision_types`** (family aliases `decision_types`) **≠** DEC tenant writer — effective union; **tenant wins** (**BR-PLT-06**) |
| Typed flags | `is_person_bound` · `writes_work_history` · `wh_event_type` · `requires_position_key` — **not** free JSON SoT; replace Nest hardcoded Sets after BE |
| Consumer column | **EXPAND note only** — `hr_decisions.decision_type` stays **text** key; no rename / no hard FK GĐ1 |
| Soft-delete | `status=retired` + `archived_at` — history QSĐ keep key (**BR-PLT-04**) |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** DEC / QSĐ types slice · residual **R-PLT-EMP-05** ownership already moved by SA |
| Honesty | **remain false** — no decisions / personnel / PAY / ATT / REC / EMP ready flip |

---

## 2. ADD `public.hr_decision_type`

### 2.1 Columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `decision_type_key` | text | NO | | Open catalog code — format `^[a-zA-Z][a-zA-Z0-9_]*$` (allows `HRD_01`); **UQ / assert normalize `lower(key)`** |
| `name_vi` | text | NO | | UI label (display-ready) |
| `sort_order` | int | NO | 100 | Picker / tab order |
| `is_person_bound` | boolean | NO | false | F-CORE-DEC-01 → require `employee_id` (**BR-PLT-DEC-01** · synonym BA `person_bound`) |
| `writes_work_history` | boolean | NO | false | F-CORE-DEC-02 → UPSERT WH when QSĐ `status=effective` |
| `wh_event_type` | text | YES | NULL | When `writes_work_history`: preferred `appointment` \| `transfer` \| `termination` — **TEXT open**, **not** invent new WH SoT table |
| `requires_position_key` | boolean | NO | false | Soft gate `HRM-DEC-POS-KEY`; default **true** when `writes_work_history` (service default) |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Optional aliases (e.g. `["appointment"]`) — assert accepts alias → canonical key |
| `color_token` | text | YES | NULL | Optional UI chip |
| `metadata_json` | jsonb | YES | NULL | Optional hints — **not** replace typed flags |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(decision_type_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` · `(company_id, is_person_bound)` WHERE `archived_at IS NULL` |
| **CHK `chk_hr_decision_type_key_format`** | `decision_type_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$'` — **format only** |
| **CHK `chk_hr_decision_type_status`** | `status IN ('active','retired')` |
| **CHK `chk_hr_decision_type_wh_flags`** | `(writes_work_history = false) OR (is_person_bound = true AND wh_event_type IS NOT NULL AND length(trim(wh_event_type)) > 0)` |
| **FORBIDDEN** | `CHECK (decision_type_key IN ('appointment','transfer','HRD_01',…))` · closed CHECK on `hr_decisions.decision_type` · hard-delete when QSĐ history references key · mega-EAV |

### 2.3 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `decision_type_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | typed DEC flags + `sort_order` (+ optional `legacy_alias_keys_json` / `color_token` / `metadata_json`) |
| `catalog_kind` | `hr_decision_type` (adapter constant) |

### 2.4 Dual SoT — effective decision-type catalog (read model)

```text
  XBOS publish ──► settings-catalogs.hr_decision_types (group REF · aliases decision_types)
                           │
                           ├── pull/sync (read-only for tenant writer)
                           │
  DEC Settings/CFG ──► hr_decision_type CRUD (tenant writer)
                           │
                           ▼
              F-DEC-CAT-EFF-01 effective union
              (DEC native row wins on same decision_type_key)
                           │
              F-CORE-DEC-01 create/patch · picker · assert ∈ catalog
              F-CORE-DEC-02 effective → WH UPSERT (must_keep)
```

| Rule | Detail |
|------|--------|
| Writer | Only **`hr_decision_type`** for tenant mutate — **FORBIDDEN** write XBOS / settings REF partition via DEC API |
| Storage / write key prefer | **`hr_decision_types`** (E1-B) — family alias `decision_types` still **resolves** (**BR-PLT-DEC-05**) |
| Consumer | `hr_decisions.decision_type` ∈ **effective** when catalog **>0** (**BR-PLT-02**) |
| Collision | Same key: DEC native overrides REF label/flags (`source=dec_override`) |
| Empty | `[]` = valid **200** — no fake starter in U65 |
| Normalize | Assert / UQ: `lower(decision_type_key)`; legacy aliases resolve → canonical key |
| Settings REF | Partition **`hr_decision_types` remains** — merge-read only; **not** dropped |

### 2.5 Bootstrap starter keys (docs only — Dev ensure later)

Starter examples (`appointment`, `transfer`, `HRD_01`, `HRD_02`, `HRD_03`, …) = **bootstrap upsert** when ensure runs — **not** product ceiling · **not** UF evidence (U65).

---

## 3. EXPAND consumer columns (note only — no rename / wipe)

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `hr_decisions` | `decision_type` | Stores open catalog key (text); validate ∈ **F-DEC-CAT-EFF-01** when catalog **>0** → else **`HRM-DEC-TYPE-UNKNOWN`**; history **may** hold **retired** keys (**BR-PLT-04**); **FORBIDDEN** closed `CHECK IN (...)` on this column |
| `employee_work_timeline` | `decision_id` / `event_type` | **must_keep** F-CORE-DEC-02; `event_type` ← catalog `wh_event_type` when WH write; soft FK by `decision_id` — **no** dual decision table |
| Settings items | `hr_decision_types` | Group REF partition — merge-read only (**L-DEC-CAT-02**) |

**Person-bound / WH (runtime — columns already on TXN):**

| Gate | Source after catalog live |
|------|---------------------------|
| Require `employee_id` | Catalog `is_person_bound=true` — **not** hardcoded `PERSON_BOUND_DECISION_TYPES` Set |
| WH UPSERT on effective | `writes_work_history=true` + QSĐ `status=effective` + `employee_id` |
| Position soft gate | `requires_position_key` + XBOS `job_titles` — **AC-PLT-EMP-01** must_keep |

---

## 4. Explicitly **not** this DATA seat

| Item | Owner |
|------|-------|
| `hr_decisions` TXN DDL / approve SM / WH `decision_id` | E2E-LINK-EMP-DB + F-CORE-DEC — **must_keep** |
| `emp_document_type` / `emp_employment_type` | EMP-DATA — **SEAL** |
| `att_leave_type` / `rec_pipeline_stage` | ATT/REC — **SEAL** |
| `contract_types` / HĐ packs | CTR — **OUT** · **FORBIDDEN** absorb |
| QSĐ FormSchema by type | GĐ1.5 residual (SA R-PLT-DEC-04) |
| QSĐ MergeToken print | GĐ2 (SA R-PLT-DEC-05) |
| Hardcoded Nest Sets retire in code | **dev-be** DEC-BE-01 (R-PLT-DEC-01) |

---

## 5. Validation matrix (physical)

### 5.1 Catalog CRUD — VAL-DEC-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-DEC-CAT-01** | Create key `hr_custom_dec_09` (N+) | No enum ceiling | **201** / persist — **AC-PLT-DEC-01** · **BR-PLT-05** |
| **VAL-DEC-CAT-02** | Active duplicate `lower(key)` same company | UQ partial | **409** `HRM-PLT-CAT-CODE-CONFLICT` |
| **VAL-DEC-CAT-03** | Invalid slug (spaces / leading digit) | Format only | **400** `HRM-PLT-CAT-CODE-INVALID` |
| **VAL-DEC-CAT-04** | Retire with existing `hr_decisions` rows | Soft-delete | Picker hide; history key OK — **AC-PLT-DEC-02** · **BR-PLT-04** |
| **VAL-DEC-CAT-05** | Hard-delete attempt | Forbidden | **4xx/405** — no hard delete |
| **VAL-DEC-CAT-06** | `writes_work_history=true` + `is_person_bound=false` | CHK flags | **400** `HRM-VAL-400` |
| **VAL-DEC-CAT-07** | `writes_work_history=true` + null `wh_event_type` | CHK flags | **400** `HRM-VAL-400` |
| **VAL-DEC-CAT-08** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask |
| **VAL-DEC-CAT-09** | Mutate group REF via DEC API | Writer lock | **FORBIDDEN** |
| **VAL-DEC-CAT-10** | Retire last active WH-producing type without replacement | SA §3.2 | **412** `HRM-DEC-TYP-WH-REQUIRED` (or documented empty-catalog waiver) |
| **VAL-DEC-CAT-11** | `metadata_json` only | typed flags still SoT | Person-bound / WH use columns first |

### 5.2 Consumer — VAL-DEC-CNS-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-DEC-CNS-01** | QSĐ create `decision_type` ∉ effective when catalog >0 | **BR-PLT-02** | **400** `HRM-DEC-TYPE-UNKNOWN` — **AC-PLT-DEC-03** |
| **VAL-DEC-CNS-02** | `is_person_bound` + missing `employee_id` | **BR-PLT-DEC-01** | **400** `HRM-DEC-EMP-REQUIRED` — **AC-PLT-DEC-04** |
| **VAL-DEC-CNS-03** | `!is_person_bound` + null `employee_id` | **BR-PLT-DEC-02** | **2xx** allowed — **AC-PLT-DEC-05** |
| **VAL-DEC-CNS-04** | effective + person_bound + id + `writes_work_history` | **BR-PLT-DEC-03** | WH UPSERT by `decision_id` — **MK-DEC-SPINE-01** · **AC-PLT-DEC-04** SA |
| **VAL-DEC-CNS-05** | `writes_work_history=false` + effective | No invent WH | **no** WH row for discipline-like types |
| **VAL-DEC-CNS-06** | History QSĐ with retired key | **BR-PLT-04** | Display key/label fallback OK — no crash |

### 5.3 Alias / dual SoT / scope

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-DEC-ALS-01** | GET/pull `decision_types` vs `hr_decision_types` | Alias family | Resolve same effective — **AC-PLT-DEC-06** · **BR-PLT-DEC-05** |
| **VAL-DEC-ALS-02** | Group REF + DEC same key | effective read | DEC row wins (tenant) |
| **VAL-DEC-SCP-01** | list ↔ get-by-id ↔ mutate | Scope parity U19 | Member **409** on foreign company |

---

## 6. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| AC-PLT-DEC-01 open N+ | §2 ADD | F-DEC-CAT-TYP-02 | Settings / DEC CFG | U65 browser |
| AC-PLT-DEC-02 retire | `archived_at` | retire endpoint | picker hide | history visible |
| AC-PLT-DEC-03 validate | effective keys | F-DEC-CAT-EFF-01 | QSĐ form | VAL-DEC-CNS-01 |
| AC-PLT-DEC-04 person-bound | `is_person_bound` | F-CORE-DEC-01 | QSĐ form | VAL-DEC-CNS-02 |
| AC-PLT-DEC-05 optional id | flag false | F-CORE-DEC-01 | QSĐ form | VAL-DEC-CNS-03 |
| AC-PLT-DEC-06 dual SoT | §2.4 | F-DEC-CAT-EFF-01 | picker | VAL-DEC-ALS-* |
| AC-PLT-DEC-04 SA WH | flags + WH | F-CORE-DEC-02 | — | VAL-DEC-CNS-04 |
| BR-PLT-02 | consumer key | EFF-01 | — | VAL-DEC-CNS-01 |
| BR-PLT-04 | soft-delete | retire | — | VAL-DEC-CAT-04 |
| BR-PLT-05 | no enum CHECK | slug format only | — | VAL-DEC-CAT-01 |
| BR-PLT-06 | dual SoT | EFF-01 | — | VAL-DEC-ALS-02 |
| FR-UC-BP-CORE-01a | §3 EXPAND | F-CORE-DEC-* | QSĐ | MK-DEC-SPINE-01 |
| J-HRM-DEC-TYP-01 / J-HRM-DEC-04 | §2 | TYP-01 | Settings | QA later |
| scope_parity U19 | `company_id` TEXT | list=get=mutate | deep link | VAL-DEC-SCP-01 |

---

## 7. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md` (ADD-only · no_prompt_echo)

| Action | Content |
|--------|---------|
| **ADD** | §3.11a `hr_decision_type` physical — open key · UQ partial · typed flags · **FORBIDDEN** closed key CHECK |
| **EXPAND** | §3.11 `decision_type` note: open catalog key · starter/HRD_* ≠ ceiling · dual SoT REF `hr_decision_types` · history may hold retired |
| **EXPAND** | §1.1 ER — `hr_decision_type` validates `hr_decisions.decision_type` |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` |
| **Cấm** | Wipe EMP/ATT/REC / CTR / F-CORE-DEC TXN wording · prompt-echo chat into client prose |

API_DESIGN F-DEC-CAT-* append = **ba-docs** residual (SA R-PLT-DEC-02) — not blocking DEC-BE-01 unlock.

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-DEC-01 | Wire F-CORE-DEC-01/02 → F-DEC-CAT-EFF-01; retire hardcoded Sets | **dev-be** DEC-BE-01 |
| R-PLT-DEC-02 | Client API DOC-DELTA F-DEC-CAT-* | **ba-docs** |
| R-PLT-DEC-03 | ADR §7 Decisions row EXPAND | sa / ba-docs |
| R-PLT-DEC-04 | FormSchema per decision type | sa GĐ1.5 |
| R-PLT-DEC-05 | QSĐ MergeToken print | GĐ2 |
| R-PLT-DEC-DATA-01 | ensureSchema + Nest paths `/api/hrm/decisions/decision-types*` | **dev-be** (this unlock) |

---

## 9. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `hr_decision_type` + partial UQ + format/status/WH-flag CHKs — **omit** closed key CHECK · **omit** CHECK on `hr_decisions.decision_type` |
| Feature flag | When catalog empty (0): legacy path per SA/BA (**BR-PLT-DEC-06**); when **>0**: BR-PLT-02 mandatory |
| Builtin ensure | Optional upsert starter keys — **not** UF evidence (U65) |
| Nest paths | `GET/POST/PUT/PATCH/retire` `/api/hrm/decisions/decision-types*` · EFF helper per SA §3 |
| Replace Sets | After table live: `PERSON_BOUND_*` / `WORK_HISTORY_NEO_*` → catalog flags (**R-PLT-DEC-01**) |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| Decisions / QSĐ module UAT-ready | **false** |
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| `contracts_printable_ready` | **false** |
| EMP DOC/ET L1 SEAL reopen | **false** (must_keep SEAL) |
| Platform / Phase1 DONE | **false** |
| UC-HRM-27 product DONE | **unchanged** — catalog physical ≠ module DONE |
| This seat | Docs only — physical DB_DESIGN |
| Option B | **CONFIRMED** (prior SA + this DATA) |
| `apps/**` touched | **none** |
| Seed | **forbidden** in UF evidence |

---

## 11. Cascade unlock

| Gate | Status after this seat |
|------|------------------------|
| DEC physical `hr_decision_type` | **CONFIRMED** (this doc) |
| **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01` | **UNLOCKED** — ensureSchema + F-DEC-CAT-* + consumer wire |
| **dev-fe** DEC Settings picker + QSĐ form bind | **HOLD** until BE READY_FOR_QA |
| **QA** AC-PLT-DEC-01..06 | After FE/BE — U65 browser |
| FormSchema / Merge print | Residual GĐ1.5 / GĐ2 |
| Closes | **R-PLT-DATA-04** DEC slice |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-data-01.md` |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01` |
| **completion_report** | CONFIRMED physical ADD `public.hr_decision_type` (open `decision_type_key`, partial UQ lower(key), soft-delete `archived_at`, typed flags `is_person_bound`/`writes_work_history`/`wh_event_type`/`requires_position_key`); dual SoT settings `hr_decision_types` REF vs tenant writer (tenant wins); EXPAND `hr_decisions.decision_type` open-catalog note; VAL-DEC-CAT/CNS/ALS/SCP; must_keep create/approve/WH spine; no closed enum CHECK; no wipe EMP/ATT/REC; honesty all false; unlock DEC-BE-01. |
