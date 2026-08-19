# PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01 — Physical DB · EMP document + employment catalogs

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` |
| **W7 seat** | `PO_HRM_CONTINUOUS_W7_20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `emp_document_type` · **ADD** `emp_employment_type` · **EXPAND** checklist `document_type_key` note · **DOC-DELTA** client DB · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** profile / contracts / SI / job_titles REF |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — physical ADD per EMP vertical SA §2.1–2.2 |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) §2 · F-EMP-CAT-* · AC-PLT-EMP-02..06 |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_peer** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) pattern peer |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · §7 EMP |
| **ref_db_client** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.1 · §3.5 |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · U65 |
| **must_keep** | CORE-01 profile · UF-HRM-02 contracts · SI enrollment · AC-PLT-EMP-01 XBOS position/dept · soft-delete · scope TEXT slug |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical tables | **CONFIRMED ADD** `public.emp_document_type` + `public.emp_employment_type` — **ABSENT AS-IS** Nest / prior platform DATA-01 |
| Platform pattern | Option B **`ICatalogRow`** on domain tables — **not** mega-EAV |
| Open catalog (DOC) | **`document_type_key`** format-only CHK — **FORBIDDEN** closed enum CHECK |
| Open catalog (ET) | **`employment_type_key`** format-only CHK — **FORBIDDEN** closed `full_time\|part_time\|…` CHECK |
| Dual SoT (ET) | Group REF `employment_types` **≠** EMP writer — effective union at read (**BR-PLT-06**) |
| Document SoT | HRM tenant writer = SoT for checklist / CORE-03 (**L-EMP-CAT-04**) |
| Position / dept | **OUT** — XBOS REF (**AC-PLT-EMP-01**) — **FORBIDDEN** `emp_position` |
| Consumer columns | **EXPAND note only** — checklist `document_type_key` stays text; no rename / wipe |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** EMP slice (document + employment catalogs) |
| Honesty | **remain false** — no personnel / e2e / PAY / ATT / REC ready flip |

---

## 2. ADD `public.emp_document_type`

### 2.1 Columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `document_type_key` | text | NO | | Open catalog code — format `^[a-z][a-z0-9_]*$` |
| `name_vi` | text | NO | | UI label (display-ready) |
| `sort_order` | int | NO | 100 | Checklist / picker order |
| `required_by_default` | boolean | NO | false | Default when seeding checklist lines for new hire |
| `requires_expiry` | boolean | NO | false | Expiry date UI + warn class CORE-03 |
| `blocks_activation` | boolean | NO | false | When required + missing → F-CORE-ACT-01 **409** class |
| `is_identity_doc` | boolean | NO | false | CCCD/passport class — OCR hook GĐ2 OUT |
| `allowed_mime_json` | jsonb | YES | NULL | Optional allow-list — empty/null = platform default |
| `metadata_json` | jsonb | YES | NULL | Optional position/contract rule hints — **not** replace typed flags |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(document_type_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` |
| **CHK `chk_emp_doc_type_key_format`** | `document_type_key ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_emp_doc_type_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (document_type_key IN ('cccd','cv','degree',…))` · hard-delete when checklist history references key · mega-EAV |

### 2.3 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `document_type_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | typed DOC flags + `sort_order` (+ optional `allowed_mime_json` / `metadata_json`) |
| `catalog_kind` | `emp_document_type` (adapter constant) |

### 2.4 Bootstrap starter keys (docs only — Dev ensure later)

Starter keys (`cccd`, `cv`, `degree`, `health_cert`, `labor_book`, …) = **bootstrap examples** when ensure runs — **not** product ceiling · **not** UF evidence (U65).

---

## 3. ADD `public.emp_employment_type`

### 3.1 Columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `employment_type_key` | text | NO | | Open catalog — normalize hyphens→underscores on write (`full-time`→`full_time`) |
| `name_vi` | text | NO | | UI label |
| `sort_order` | int | NO | 100 | Picker order |
| `counts_toward_headcount` | boolean | NO | true | Headcount rules |
| `eligible_for_si` | boolean | NO | true | Soft gate SI enroll UX — **≠** invent SI rate / dual enrollment SoT |
| `is_contingent` | boolean | NO | false | Contractor / intern class |
| `metadata_json` | jsonb | YES | NULL | Optional hints — **not** replace typed flags |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

### 3.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(employment_type_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` |
| **CHK `chk_emp_et_key_format`** | `employment_type_key ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_emp_et_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (employment_type_key IN ('full_time','part_time','contract','intern'))` · hard-delete · FE 4-option ceiling as DB rule |

### 3.3 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `employment_type_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | ET flags + `sort_order` (+ optional `metadata_json`) |
| `catalog_kind` | `emp_employment_type` (adapter constant) |

### 3.4 Dual SoT — effective employment catalog (read model)

```text
  XBOS publish ──► settings-catalogs.employment_types (group REF)
                           │
                           ├── pull/sync (read-only for tenant writer)
                           │
  EMP Settings/CFG ──► emp_employment_type CRUD (tenant writer)
                           │
                           ▼
              F-EMP-CAT-EFF-02 effective union
              (EMP row wins on same employment_type_key)
                           │
              employee form · YCTD/JD employment_type · headcount
```

| Rule | Detail |
|------|--------|
| Writer | Only **`emp_employment_type`** for tenant mutate — **FORBIDDEN** write XBOS REF partition |
| Consumer | `employment_type` / `employment_type_key` ∈ effective when catalog >0 (**BR-PLT-02**) |
| Collision | Same key: EMP native overrides REF label/flags |
| Empty | `[]` = valid — no fake starter in U65 |
| Normalize | Write path: hyphens → underscores before UQ / persist |

### 3.5 Bootstrap starter keys (docs only)

Starter (`full_time`, `part_time`, `contract`, `intern` / alias `full-time`) = **bootstrap examples** — **not** ceiling · **not** UF evidence.

---

## 4. EXPAND consumer columns (note only — no rename / wipe)

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `hrm_document_checklist_item` (logical) / AS-IS checklist | `document_type_key` | Stores open catalog key; validate ∈ **F-EMP-CAT-EFF-01** when catalog >0 → else `HRM-EMP-DOC-TYPE-UNKNOWN`; history **may** hold **retired** keys (**BR-PLT-04**) |
| `hrm_employee` / AS-IS employees (if column present) | `employment_type` / `employment_type_key` | Soft key space; validate ∈ **F-EMP-CAT-EFF-02** when >0 → else `HRM-EMP-ET-UNKNOWN` — **no** hard FK DDL GĐ1 |
| YCTD / job requisition / posting | `employment_type` | REC **consumes** EMP catalog — **not** REC-owned SoT |
| JD pack resolve | `employment_type` context | Must_keep JD-DYNAMIC — ∈ effective when catalog >0 |
| `employee_contracts` / `employee_insurances` | — | **must_keep** spines — **no** new FK required this seat |
| `job_titles` / `departments` | settings-catalogs REF | **AC-PLT-EMP-01** — **out of mutate scope** |

---

## 5. Explicitly **not** this DATA seat

| Item | Owner |
|------|-------|
| `job_titles` / `departments` physical | XBOS + settings-catalogs — AC-PLT-EMP-01 |
| `hr_decision_types` / QSĐ | Decisions — GĐ1.5 |
| CTR `contract_types` / HĐ packs | CTR domain — **FORBIDDEN** EMP duplicate |
| `hrm_merge_tokens` custom.emp hook | Platform BE + BR-PLT-01 residual |
| Profile FormSchema tabs (CORE-02b) | Interface later |
| Wipe / redesign profile · contracts · SI | **FORBIDDEN** |

---

## 6. Validation matrix

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-EMP-DOC-01** | Create DOC row | `document_type_key` matches slug regex | 201 / persist |
| **VAL-EMP-DOC-02** | Create DOC | key = `CCCD` (upper) | 400 `HRM-PLT-CAT-CODE-INVALID` |
| **VAL-EMP-DOC-03** | Create active duplicate key same company | UQ partial | 409 `HRM-PLT-CAT-CODE-CONFLICT` |
| **VAL-EMP-DOC-04** | Create key `hr_doc_custom_09` (N+) | No enum ceiling | **201** — AC-PLT-EMP-02 |
| **VAL-EMP-DOC-05** | Retire DOC with checklist history | `status=retired`, `archived_at` set | Picker hides; old checklist keeps key |
| **VAL-EMP-DOC-06** | Hard-delete DOC with checklist ref | — | **FORBIDDEN** |
| **VAL-EMP-DOC-07** | Checklist mutate key ∉ effective | catalog >0 | 400 `HRM-EMP-DOC-TYPE-UNKNOWN` |
| **VAL-EMP-DOC-08** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask |
| **VAL-EMP-DOC-09** | `metadata_json` only | typed flags still SoT for required/blocks | Activate uses flags first |
| **VAL-EMP-ET-01** | Create ET row | slug format + hyphen→underscore | 201 / persist `full_time` |
| **VAL-EMP-ET-02** | Create ET | key fails regex | 400 `HRM-PLT-CAT-CODE-INVALID` |
| **VAL-EMP-ET-03** | Active duplicate ET key | UQ partial | 409 `HRM-PLT-CAT-CODE-CONFLICT` |
| **VAL-EMP-ET-04** | Create 5th+ ET key | No 4-option ceiling | **201** — AC-PLT-EMP-04 |
| **VAL-EMP-ET-05** | Retire ET with YCTD/employee history | soft-delete | Picker hides; history keeps key |
| **VAL-EMP-ET-06** | Hard-delete ET | — | **FORBIDDEN** |
| **VAL-EMP-ET-07** | Submit employment_type ∉ effective | catalog >0 | 400 `HRM-EMP-ET-UNKNOWN` |
| **VAL-EMP-ET-08** | Group REF + EMP same key | effective read | EMP row wins |
| **VAL-EMP-ET-09** | Mutate group REF partition via EMP API | — | **FORBIDDEN** — tenant writer only |
| **VAL-EMP-ET-10** | List vs get-by-id OOS | scope_parity | 404/403 |

---

## 7. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| AC-PLT-EMP-02 open DOC N+ | §2 ADD | F-EMP-CAT-DOC-02 | Settings / checklist | U65 browser |
| AC-PLT-EMP-03 retire DOC | `archived_at` | retire endpoint | picker hide | history visible |
| AC-PLT-EMP-04 open ET N+ | §3 ADD | F-EMP-CAT-ET-02 | Settings / form | U65 |
| AC-PLT-EMP-05 validate ET | effective keys | F-EMP-CAT-EFF-02 | emp/YCTD form | 4xx not in catalog |
| AC-PLT-EMP-06 activate | DOC flags | F-CORE-ACT-01 | activate | 409 missing blocks |
| AC-PLT-EMP-01 position | XBOS REF | unchanged | WH picker | must_keep |
| BR-PLT-02 | consumer keys | EFF-01/02 | — | VAL-EMP-DOC-07 · VAL-EMP-ET-07 |
| BR-PLT-04 | soft-delete | retire | — | VAL-EMP-DOC-05 · VAL-EMP-ET-05 |
| BR-PLT-05 | no enum CHECK | slug format only | — | VAL-EMP-DOC-04 · VAL-EMP-ET-04 |
| BR-PLT-06 | dual SoT ET | F-EMP-CAT-EFF-02 | — | VAL-EMP-ET-08 |
| FR-UC-BP-CORE-03 | §2 | DOC CRUD | checklist | CORE-03 |
| J-HRM-EMP-DOC-01 | §2 | DOC-01 | Settings | QA later |
| J-HRM-EMP-ET-01 | §3 | ET-01 | Settings | QA later |
| scope_parity U19 | `company_id` TEXT | list=get=mutate | deep link | VAL-*-08/10 |

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-EMP-01 | Wire checklist / ACT-01 → F-EMP-CAT-EFF-01 after table live | **dev-be** |
| R-PLT-EMP-02 | Wire YCTD/employee employment_type → F-EMP-CAT-EFF-02 | **dev-be** |
| R-PLT-EMP-03 | Client API DOC-DELTA (F-EMP-CAT-* append) | **ba-docs** |
| R-PLT-EMP-04 | Custom field → MergeToken auto-register (**BR-PLT-01**) | sa/dev-be later |
| R-PLT-EMP-05 | QSĐ / `hr_decision_types` open-catalog deepen | sa GĐ1.5 |
| R-PLT-EMP-06 | Profile FormSchema tabs (CORE-02b) | interface later |

---

## 9. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD both tables + partial UQ + format/status CHKs — **omit** closed key CHECK |
| Feature flag | Checklist / forms operable if catalog empty (free-text until catalog >0 per BR-PLT-02) |
| Builtin ensure | Optional upsert starter DOC/ET keys — **not** UF evidence (U65) |
| Nest paths | `/api/hrm/employees/document-types*` · `/api/hrm/employees/employment-types*` per SA |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| Platform / Phase1 DONE | **false** |
| This seat | Docs only — physical DB_DESIGN |
| Option B | **CONFIRMED** (prior SA + this DATA) |
| `apps/**` touched | **none** |
| Seed | **forbidden** in UF evidence |

---

## 11. Cascade unlock

| Gate | Status after this seat |
|------|------------------------|
| EMP physical DOC + ET | **CONFIRMED** (this doc) |
| **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01` | **UNLOCKED** — ensureSchema + F-EMP-CAT-* |
| **dev-fe** EMP Settings pickers + checklist/ET bind | **HOLD** until BE READY_FOR_QA |
| **QA** AC-PLT-EMP-02..06 | After FE/BE — U65 browser |
| MergeToken custom.emp / QSĐ | Residual — not blocking |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-data-01.md` |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01` (parallel **ba-docs** R-PLT-EMP-03 if needed) |
| **completion_report** | CONFIRMED physical ADD `emp_document_type` + `emp_employment_type` (open keys, partial UQ, slug CHK only, soft-delete, typed DOC/ET flags); EXPAND checklist `document_type_key` open-catalog note; DOC-DELTA DB §3.0a/b + §3.5; closes R-PLT-DATA-04 EMP; no apps/**; unlock EMP-BE-01. |
