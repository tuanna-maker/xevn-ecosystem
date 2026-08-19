# PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01 — Physical DB · SI insurance-type catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01` **Option B CONFIRMED** · Nest **ABSENT** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `si_insurance_type` · **EXPAND** consumer key notes · **DOC-DELTA** client DB · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** enrollment / CTR legal-print / policy spine |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — physical ADD per SA Option B §4–§6 · F-SI-CAT-TYP/EFF |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01` **CONFIRMED** · parallel `…-SI-INS-CATALOG-BA-01` **CONFIRMED** (BE unlock gate clear with this DATA) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md) Option B · L-SI-INS-* · F-SI-CAT-TYP/EFF · AC-PLT-SI-INS-01* |
| **ref_peer** | [`EMP-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) · [`DEC-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md) · [`ATT-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete |
| **ref_db_client** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6 enrollment ONE SoT |
| **ref_e2e** | [`PO-HRM-E2E-LINK-EMP-DB-01.md`](./PO-HRM-E2E-LINK-EMP-DB-01.md) — enrollment `employee_insurances` **must_keep** |
| **ref_settings** | [`PO-HRM-SETTINGS-DEFAULTS-DATA-01.md`](./PO-HRM-SETTINGS-DEFAULTS-DATA-01.md) `pay_insurance_rate_cfg.insurance_type_key` consumer |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | Enrollment ONE SoT `employee_insurances` · F-CORE-SI-02/03 · CTR legal-print / library seals · soft-delete · scope TEXT slug · open catalog no CHK IN · E3 `HRM-INS-TYPE-KEY` class |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.si_insurance_type` — **ABSENT AS-IS** Nest (grep empty · Settings MD only today) |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV · **not** second policy catalog table |
| Open catalog | **`insurance_type_key`** format-only CHK — **FORBIDDEN** closed enum CHECK (`BHXH`/`BHYT`/`social` ≠ ceiling) |
| Dual SoT | Group REF settings-catalogs **`insurance_types`** **≠** SI tenant writer — effective union; **tenant wins** (**BR-PLT-06** · ATT leave peer) |
| Soft-delete | `status=retired` + `archived_at` — history policy/enrollment/rate-cfg keep key (**BR-PLT-04**) |
| Consumer columns | **EXPAND note only** — policy `insurance_type` · enrollment `type` · rate-cfg `insurance_type_key` stay **text** soft keys; **no** hard FK GĐ1 · **no** enrollment schema rewrite |
| Insurers | **OUT GĐ1** — Settings `insurers` / `HRM-INS-INSURER-KEY` retain path — **FORBIDDEN** fold into this table |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** SI insurance-type catalog slice |
| Honesty | **remain false** — printable / personnel / payroll / SI·CTR module UAT **not** flipped |
| BE unlock | **CLEAR** — parallel **BA-01 CONFIRMED** + this DATA **CONFIRMED** → PM may unlock BE |

---

## 2. ADD `public.si_insurance_type`

### 2.1 Columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `insurance_type_key` | text | NO | | Open catalog code — format `^[a-zA-Z][a-zA-Z0-9_]*$` (allows `BHXH`, `BHYT`, `social`); **UQ / assert normalize `lower(key)`** |
| `name_vi` | text | NO | | UI label (display-ready) |
| `sort_order` | int | NO | 100 | Picker / Settings tab order |
| `is_statutory` | boolean | NO | false | BHXH/BHYT/BHTN class vs commercial — **typed** UI/group flag · **≠** invent rate formula |
| `eligible_for_rate_cfg` | boolean | NO | true | Soft gate Settings `pay_insurance_rate_cfg` consumer — when false, rate-cfg upsert may 4xx class (BA enumerate) |
| `requires_policy` | boolean | NO | false | Soft UX hint for commercial types needing `policy_id` — **≠** hard FK / enrollment rewrite |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Optional aliases (e.g. `["social"]` → canonical `bhxh`/`BHXH`) — assert accepts alias → canonical key |
| `metadata_json` | jsonb | YES | NULL | Optional hints — **not** replace typed flags · **not** mega-EAV SoT |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(insurance_type_key)) WHERE archived_at IS NULL` |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` — F-SI-CAT-EFF-01 resolution |
| **CHK `chk_si_ins_type_key_format`** | `insurance_type_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$'` — **format only** |
| **CHK `chk_si_ins_type_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (insurance_type_key IN ('BHXH','BHYT','BHTN','social',…))` · hard-delete when policy/enrollment/rate-cfg history references key · mega-EAV · second `si_policy_type` / insurers table this seat |

### 2.3 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `insurance_type_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | typed SI flags + `sort_order` (+ optional `legacy_alias_keys_json` / `metadata_json`) |
| `catalog_kind` | `si_insurance_type` (adapter constant) |

### 2.4 Dual SoT — effective insurance-type catalog (read model)

```text
  XBOS / Settings insurance_types ──► group REF merge-read only
           │
  F-SI-CAT-TYP CRUD ──► public.si_insurance_type (code SoT)  [ADD physical]
           │
           ▼
  F-SI-CAT-EFF-01 effective
           │  (SI native row wins on same insurance_type_key)
           ▼
  Consumers (when count>0): pick type ∈ catalog
    · POST/PATCH insurance-policies (insurance_type) — E3 AC-INS · HRM-INS-TYPE-KEY
    · POST/PATCH employee-insurances (type) — FR-UC-BP-CORE-10 · F-CORE-SI-02
    · Settings insurance-rate-cfg (insurance_type_key) — SETTINGS-DEFAULTS
```

| Rule | Detail |
|------|--------|
| Writer | Only **`si_insurance_type`** for tenant mutate — **FORBIDDEN** write XBOS / settings REF partition via SI catalog API |
| Consumer | Keys ∈ **effective** when catalog **>0** (**BR-PLT-02** · **AC-PLT-SI-INS-01**) |
| Collision | Same key: SI native overrides REF label/flags (`source=si_override`) |
| Empty | `[]` = valid **200** — empty picker + admin CREATE open (**L-SI-INS-04** · U65 no fake density) |
| Normalize | Assert / UQ: `lower(insurance_type_key)`; legacy aliases resolve → canonical key |
| Settings REF | Partition **`insurance_types` remains** — merge-read only; **not** dropped · **not** sole SoT (**Option A REJECT**) |
| Error invent | Catalog ≠ empty ∧ key ∉ effective → **`HRM-INS-TYPE-KEY`** (retain E3) — BA may alias `HRM-SI-INS-TYPE-UNKNOWN` without breaking E3 matrix |

### 2.5 Bootstrap starter keys (docs only — Dev ensure later)

Starter examples (`BHXH`, `BHYT`, `BHTN`, `social` as alias/bootstrap) = **bootstrap upsert** when ensure runs — **not** product ceiling · **not** UF evidence (U65).

---

## 3. EXPAND consumer columns (note only — no rename / wipe)

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `insurance_policies` (contracts-insurance) | `insurance_type` | Stores open catalog key (text); validate ∈ **F-SI-CAT-EFF-01** when catalog **>0** → else **`HRM-INS-TYPE-KEY`**; history **may** hold **retired** keys (**BR-PLT-04**); migrate assert off MD-only (**L-SI-INS-02**) |
| `employee_insurances` | `type` (logical alias `insurance_type_key`) | Soft key space; validate ∈ **EFF** when **>0** → else **`HRM-INS-TYPE-KEY`** / BA UNKNOWN alias — **no** hard FK DDL · **no** SM rewrite · enrollment ONE SoT **must_keep** |
| `pay_insurance_rate_cfg` | `insurance_type_key` | Soft key ∈ **EFF** when catalog **>0** · open key (**FORBIDDEN** closed CHECK) — SETTINGS-DEFAULTS physical RETAIN |
| Settings items | `insurance_types` | Group REF partition — merge-read only (**L-SI-INS-03**) |
| `insurers` / insurer_key | — | **OUT GĐ1** — **FORBIDDEN** fold (**L-SI-INS-08**) |
| CTR templates / print / library | — | **SEAL RETAIN** — **FORBIDDEN** reopen |

**AS-IS cite (do not treat as Nest SoT):**

- `ContractsInsuranceService.assertInsuranceTypeKey` · `catalogKey: 'insurance_types'` · `HRM_INS_TYPE_KEY`
- `EmployeeInsurancesService` free-text `type` (default `social`) — **GAP** closed by EFF assert after BE
- FE `catalogSearchPicker` Settings `insurance_types` — FE rebind EFF after BE

---

## 4. Explicitly **not** this DATA seat

| Item | Owner |
|------|-------|
| Enrollment lifecycle / F-CORE-SI-02/03 / `hrm_insurance_rate_period` | E2E-LINK-EMP-DB + EMP-BE-02 — **must_keep SEAL** |
| Insurers Nest catalog | OUT residual · E3 `HRM-INS-INSURER-KEY` path |
| CTR legal-print / library PUB/PULL/APPLY | CTR seals — **FORBIDDEN** reopen |
| Second mega catalog / `hrm_si_catalog_rows` | **REJECT** (SA Option C · ADR Q-PLT-03) |
| Policy / enrollment schema redesign | **FORBIDDEN** |
| FE picker rebind | **dev-fe** after BE |
| AC click-path pack | parallel **ba-process** BA-01 |
| ensureSchema + F-SI-CAT-* + consumer assert | **dev-be** after BA+DATA |

---

## 5. Validation matrix (physical)

### 5.1 Catalog CRUD — VAL-SI-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-SI-CAT-01** | Create key `hr_ins_custom_09` (N+) | No enum ceiling | **201** / persist — **AC-PLT-SI-INS-01d** · **BR-PLT-05** |
| **VAL-SI-CAT-02** | Active duplicate `lower(key)` same company | UQ partial | **409** `HRM-PLT-CAT-CODE-CONFLICT` |
| **VAL-SI-CAT-03** | Invalid slug (spaces / leading digit) | Format only | **400** `HRM-PLT-CAT-CODE-INVALID` |
| **VAL-SI-CAT-04** | Retire with existing policy/enrollment rows | Soft-delete | Picker hide; history key OK — **BR-PLT-04** · **L-SI-INS-05** |
| **VAL-SI-CAT-05** | Hard-delete attempt | Forbidden | **4xx/405** — no hard delete |
| **VAL-SI-CAT-06** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask — **L-SI-INS-06** · **VAL-SI-CNS-03** |
| **VAL-SI-CAT-07** | Mutate group REF via SI catalog API | Writer lock | **FORBIDDEN** |
| **VAL-SI-CAT-08** | `metadata_json` only | typed flags still SoT | Rate-cfg / statutory use columns first |
| **VAL-SI-CAT-09** | Effective active =0 | Empty EFF | **200** `[]` — admin CREATE still open — **AC-PLT-SI-INS-01c** · **no seed** |

### 5.2 Consumer — VAL-SI-CNS-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-SI-CNS-01** | Policy invent `insurance_type` when catalog >0 | **BR-PLT-02** · **AC-PLT-SI-INS-01b** | **400** `HRM-INS-TYPE-KEY` |
| **VAL-SI-CNS-02** | Enrollment invent `type` when catalog >0 | **BR-PLT-02** · SA VAL-SI-CNS-02 | **400** `HRM-INS-TYPE-KEY` (BA UNKNOWN alias OK) |
| **VAL-SI-CNS-03** | List picker scope ≠ assert scope | scope_parity | jest **FAIL** |
| **VAL-SI-CNS-04** | Rate-cfg invent `insurance_type_key` when catalog >0 | **BR-PLT-02** | **4xx** KEY class |
| **VAL-SI-CNS-05** | History policy/enrollment with retired key | **BR-PLT-04** | Display key/label fallback OK — no crash |
| **VAL-SI-CNS-06** | Format-only valid code ∉ effective | Membership required | **4xx** KEY — **L-SI-INS-07** (format ≠ membership) |
| **VAL-SI-CNS-07** | Alias in `legacy_alias_keys_json` | Resolve → canonical | **2xx** store/assert canonical key |

### 5.3 Dual SoT / scope

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-SI-ALS-01** | Group REF + SI same key | effective read | SI row wins (tenant) — **BR-PLT-06** |
| **VAL-SI-ALS-02** | Settings MD alone as sole picker SoT | Option A | **REJECT** — Nest EFF required when live |
| **VAL-SI-SCP-01** | list ↔ get-by-id ↔ consumer assert | Scope parity U19 | Member **409**/404 on foreign company |

---

## 6. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| **AC-PLT-SI-INS-01** picker when EFF≥1 | §2 ADD | **F-SI-CAT-EFF-01** | Nest EFF bind | U65 browser |
| **AC-PLT-SI-INS-01b** invent | effective keys | assert deepen | form | VAL-SI-CNS-01/02 |
| **AC-PLT-SI-INS-01c** empty | §2.4 empty | EFF `[]` | empty + CTA | VAL-SI-CAT-09 · U65 |
| **AC-PLT-SI-INS-01d** admin N+ | open key | **F-SI-CAT-TYP-02** | Settings SI type | VAL-SI-CAT-01 |
| **AC-PLT-SI-INS-01H** honesty | — | — | — | flags false · seals retain |
| **F-SI-CAT-TYP-01** list | §2 | `GET …/insurance-types` | Settings | jest CRUD |
| **F-SI-CAT-EFF-01** | §2.4 + IX effective | `GET …/effective` | picker | VAL-SI-ALS-* |
| **BR-PLT-02** | consumer keys | EFF assert | — | VAL-SI-CNS-* |
| **BR-PLT-04** | soft-delete | retire | — | VAL-SI-CAT-04 |
| **BR-PLT-05** | no enum CHECK | slug format only | — | VAL-SI-CAT-01 |
| **BR-PLT-06** | dual SoT | EFF-01 | — | VAL-SI-ALS-01 |
| FR-UC-BP-CORE-10 | §3 EXPAND `type` | F-CORE-SI-02 | SI timeline | enrollment assert |
| E3 AC-INS | §3 policy | assertInsuranceTypeKey → Nest | policy form | VAL-SI-CNS-01 |
| SETTINGS SI rate | `pay_insurance_rate_cfg` | rate-cfg upsert | Settings | VAL-SI-CNS-04 |
| scope_parity U19 | `company_id` TEXT | list=get=mutate=assert | deep link | VAL-SI-SCP-01 · VAL-SI-CAT-06 |
| J-* / UF | BA-01 enumerate | — | — | QA after BA+BE+FE |

---

## 7. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md` (ADD-only · no_prompt_echo)

| Action | Content |
|--------|---------|
| **ADD** | §3.6a `si_insurance_type` physical — open key · UQ partial · typed flags · dual SoT · **FORBIDDEN** closed key CHECK · **FORBIDDEN** insurers fold |
| **EXPAND** | §3.6 `insurance_type_key` / AS-IS `type` note: open catalog key · starter ≠ ceiling · dual SoT REF `insurance_types` · history may hold retired · validate ∈ EFF when >0 |
| **EXPAND** | §1.1 ER — `si_insurance_type` validates policy/enrollment/rate-cfg type keys |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` |
| **Cấm** | Wipe enrollment ONE SoT · CTR print · prompt-echo chat into client prose |

API_DESIGN F-SI-CAT-* append = **ba-docs** residual after BA — not blocking DATA CONFIRMED; **BE HOLD** until BA AC pack CONFIRMED.

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-SI-INS-01 | AC pack consumer UF/J-* · UNKNOWN alias wording | **ba-process** BA-01 (parallel) |
| R-PLT-SI-INS-02 | ensureSchema + Nest F-SI-CAT-TYP/EFF + consumer assert deepen | **dev-be** after BA+DATA |
| R-PLT-SI-INS-03 | FE picker rebind Nest EFF — Settings MD alone REJECT | **dev-fe** after BE |
| R-PLT-SI-INS-04 | Client API DOC-DELTA F-SI-CAT-* | **ba-docs** |
| R-PLT-SI-INS-05 | Insurers Nest catalog seat | OUT / later Catalog P2 |
| R-PLT-SI-INS-06 | ADR §7 Contracts/Settings SI type row EXPAND | sa / ba-docs |

---

## 9. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `si_insurance_type` + partial UQ + format/status CHKs + effective IX — **omit** closed key CHECK · **omit** hard FK on policy/enrollment |
| Feature flag | When catalog empty (0): empty picker + admin CREATE; legacy MD assert path may coexist until cutover per BA — when **>0**: Nest EFF mandatory (**BR-PLT-02**) |
| Builtin ensure | Optional upsert starter keys — **not** UF evidence (U65) |
| Nest paths | Under contracts-insurance: `GET/POST/PUT/PATCH/retire` `/api/hrm/contracts-insurance/insurance-types*` · EFF helper — **FORBIDDEN** invent `/api/hrm/platform/si/*` mega |
| Assert migrate | `assertInsuranceTypeKey` → Nest EFF when count>0; enrollment create/update `type` same; rate-cfg same |
| Peer pattern | Mirror `emp_document_type` / `hr_decision_type` / `att_leave_type` ensureSchema style |

---

## 10. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| Module SI / CTR UAT | **DENIED** invent |
| CTR legal-print QC-01/02 · library QC-03 | **RETAIN** |
| SI enrollment EMP-BE-02 | **RETAIN** |
| EMP DOC/ET · DEC · PAY · ATT · REC · EXT · LIST-TOTALS | **RETAIN** — **cấm** reopen |
| `C-SLICE-≠-MODULE` | Nest type catalog ≠ module GO |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-data-01.md` |
| **next_owner** | **pm** → unlock **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01` (BA-01 + DATA-01 CONFIRMED) |
| **completion_report** | CONFIRMED physical ADD `public.si_insurance_type` (open `insurance_type_key`, partial UQ lower(key), soft-delete `archived_at`, typed `is_statutory`/`eligible_for_rate_cfg`/`requires_policy`, dual SoT Settings `insurance_types` REF vs tenant writer tenant-wins, F-SI-CAT-TYP/EFF IX, VAL-SI-CAT/CNS/ALS/SCP); EXPAND policy/enrollment/rate-cfg soft-key notes; **FORBIDDEN** insurers mega-fold · second catalog · enrollment rewrite; DOC-DELTA DB §3.6a; closes R-PLT-DATA-04 SI slice; honesty false; CTR/SI seals RETAIN; no apps/**; no seed; BE unlock gate CLEAR (BA+DATA). |
