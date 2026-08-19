# PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01 — Physical DB · SI insurers catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01` **Option B CONFIRMED** · Nest **ABSENT** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `si_insurer` · **EXPAND** consumer key notes · **DOC-DELTA** client DB §3.6b · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** §3.6a type · enrollment · CTR legal-print |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — physical ADD per SA Option B §4–§6 · F-SI-CAT-INS-* |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01` **CONFIRMED** · parallel `…-SI-INSURER-CATALOG-BA-01` **in flight** (BE unlock **HOLD** until BA **also** CONFIRMED) |
| **peer_retain** | [`SI-INS-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md) `si_insurance_type` §3.6a — **RETAIN** · **FORBIDDEN** reopen / fold |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md) Option B · L-SI-INR-* · F-SI-CAT-INS/EFF · AC-PLT-SI-INSURER-01* |
| **ref_peer_type** | [`SI-INS-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md) — column / UQ / dual-SoT / EFF IX pattern |
| **ref_peer** | [`EMP-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) · [`DEC-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md) · [`ATT-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete |
| **ref_db_client** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6 enrollment · §3.6a type |
| **ref_e2e** | [`PO-HRM-E2E-LINK-EMP-DB-01.md`](./PO-HRM-E2E-LINK-EMP-DB-01.md) — enrollment `employee_insurances` **must_keep** |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | SI type Nest F-SI-CAT-TYP/EFF L1 · Enrollment ONE SoT · F-CORE-SI-02/03 · CTR legal-print / library · soft-delete · scope TEXT slug · open catalog no CHK IN · E3 `HRM-INS-INSURER-KEY` class · type catalog **≠** insurer catalog |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.si_insurer` — **ABSENT AS-IS** Nest (grep empty · Settings MD `insurers` + `assertInsurerKey` only today) |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV · **not** fold into `si_insurance_type` · **not** second type catalog |
| Open catalog | **`insurer_key`** format-only CHK — **FORBIDDEN** closed enum CHECK (`VSS`/`BHXH_VN`/starter ≠ ceiling) |
| Dual SoT | Group REF settings-catalogs **`insurers`** (aliases `insurance_providers` / `bhxh_providers`) **≠** SI tenant writer — effective union; **tenant wins** (**BR-PLT-06** · SI type peer) |
| Soft-delete | `status=retired` + `archived_at` — history policy/records keep key (**BR-PLT-04**) |
| Consumer columns | **EXPAND note only** — policy `insurer_key` · optional `employee_insurance_records.insurer_key` stay **text** soft keys; **no** hard FK GĐ1 · **no** enrollment schema rewrite |
| Peer SI type | **§3.6a RETAIN** — **FORBIDDEN** wipe / reopen L1 / fold insurer rows into type |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** SI **insurers** catalog slice (type slice remains CLOSED separately) |
| Honesty | **remain false** — printable / personnel / payroll / SI·CTR module UAT **not** flipped |
| BE unlock | **HOLD** — this DATA **CONFIRMED** · parallel **BA-01** must also **CONFIRMED** before PM unlocks BE |

---

## 2. ADD `public.si_insurer`

### 2.1 Columns (`ICatalogRow`)

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `insurer_key` | text | NO | | Open catalog code — format `^[a-zA-Z][a-zA-Z0-9_]*$`; **UQ / assert normalize `lower(key)`** |
| `name_vi` | text | NO | | UI label (display-ready) |
| `sort_order` | int | NO | 100 | Picker / Settings tab order |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Optional aliases → canonical key — assert accepts alias → canonical |
| `metadata_json` | jsonb | YES | NULL | Optional hints (contact, license ref) — **not** mega-EAV SoT · **not** replace ICatalogRow columns |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

**Note:** No SI-type typed flags (`is_statutory` / `eligible_for_rate_cfg` / `requires_policy`) on this table — those belong to **`si_insurance_type` only**. Insurer row = open provider catalog (`ICatalogRow`); domain hints stay in optional `metadata_json` if BA enumerates later — **FORBIDDEN** invent rate/policy formula columns here.

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(insurer_key)) WHERE archived_at IS NULL` |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` — **F-SI-CAT-INS-EFF-01** resolution |
| **CHK `chk_si_insurer_key_format`** | `insurer_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$'` — **format only** |
| **CHK `chk_si_insurer_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (insurer_key IN (…))` · hard-delete when policy/records history references key · mega-EAV · fold into `si_insurance_type` · second mega `hrm_si_catalog_rows` · rewrite enrollment |

### 2.3 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `insurer_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | `sort_order` (+ optional `legacy_alias_keys_json` / `metadata_json`) |
| `catalog_kind` | `si_insurer` (adapter constant) |

### 2.4 Dual SoT — effective insurers catalog (read model)

```text
  XBOS / Settings insurers ──► group REF merge-read only
           │
  F-SI-CAT-INS CRUD ──► public.si_insurer (code SoT)  [ADD physical]
           │
           ▼
  F-SI-CAT-INS-EFF-01 effective
           │  (SI native row wins on same insurer_key)
           ▼
  Consumers (when count>0): pick insurer_key ∈ catalog
    · POST/PATCH insurance-policies (insurer_key) — E3 AC-INS-02 · HRM-INS-INSURER-KEY
    · optional employee_insurance_records.insurer_key — BA enumerate
```

| Rule | Detail |
|------|--------|
| Writer | Only **`si_insurer`** for tenant mutate — **FORBIDDEN** write XBOS / settings REF partition via SI insurer catalog API |
| Consumer | Keys ∈ **effective** when catalog **>0** (**BR-PLT-02** · **AC-PLT-SI-INSURER-01**) |
| Collision | Same key: SI native overrides REF label (`source=si_override`) |
| Empty | `[]` = valid **200** — empty picker + admin CREATE open (**L-SI-INR-04** · U65 no fake density) |
| Normalize | Assert / UQ: `lower(insurer_key)`; legacy aliases resolve → canonical key |
| Settings REF | Partition **`insurers` remains** (aliases `insurance_providers` / `bhxh_providers`) — merge-read only; **not** dropped · **not** sole SoT (**Option A REJECT**) |
| Error invent | Catalog ≠ empty ∧ key ∉ effective → **`HRM-INS-INSURER-KEY`** (retain E3) — BA may alias UNKNOWN without breaking E3 matrix |
| Type KEY | **`HRM-INS-TYPE-KEY` ≠ `HRM-INS-INSURER-KEY`** — separate SoTs |

### 2.5 Bootstrap starter keys (docs only — Dev ensure later)

Starter examples (e.g. common VN carriers) = **bootstrap upsert** when ensure runs — **not** product ceiling · **not** UF evidence (U65).

### 2.6 Cap → column map

| Cap | Columns / indexes used |
|-----|------------------------|
| **F-SI-CAT-INS-01** list/admin | All §2.1 · IX list `(company_id, status)` / `(company_id, sort_order)` · scope `company_id` |
| **F-SI-CAT-INS-02** POST/PUT/retire | Mutate `insurer_key`/`name_vi`/`sort_order`/flags-via-meta · soft-delete `status`+`archived_at` · UQ partial · format CHK |
| **F-SI-CAT-INS-EFF-01** effective | IX effective · `archived_at IS NULL AND status='active'` · dual-SoT merge REF |

---

## 3. EXPAND consumer columns (note only — no rename / wipe)

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `hrm_insurance_policies` (AS-IS Nest) | `insurer_key` (+ snapshot `insurer_label`) | Stores open catalog key (text); validate ∈ **F-SI-CAT-INS-EFF-01** when catalog **>0** → else **`HRM-INS-INSURER-KEY`**; history **may** hold **retired** keys (**BR-PLT-04**); migrate assert off MD-only (**L-SI-INR-02**) |
| `employee_insurance_records` | `insurer_key` | Soft key ∈ **EFF** when catalog **>0** (BA enumerate required surfaces) — **no** hard FK · **≠** enrollment `type` |
| Settings items | `insurers` | Group REF partition — merge-read only (**L-SI-INR-03**) |
| `si_insurance_type` / type keys | — | **§3.6a RETAIN** — **FORBIDDEN** fold / reopen L1 |
| `employee_insurances` | — | Enrollment ONE SoT **must_keep** — this seat ≠ type/insurer fold into enrollment |
| CTR templates / print / library | — | **SEAL RETAIN** — **FORBIDDEN** reopen |

**AS-IS cite (do not treat as Nest SoT):**

- `ContractsInsuranceService.assertInsurerKey` · `catalogKey: 'insurers'` · `HRM_INS_INSURER_KEY`
- Settings master familyId `insurers` · aliases `insurance_providers` / `bhxh_providers`
- FE `catalogSearchPicker` Settings `insurers` — FE rebind EFF after BE

---

## 4. Explicitly **OUT** this DATA seat

| Item | Rule |
|------|------|
| Mega-EAV / `hrm_si_catalog_rows` | **REJECT** (SA Option C · ADR Q-PLT-03) |
| Fold into `si_insurance_type` / wipe §3.6a | **FORBIDDEN** · peer **SI-INS-CATALOG-DATA-01 RETAIN** |
| Reopen SI type L1 GWC / F-SI-CAT-TYP | **FORBIDDEN** |
| Reopen CTR legal-print / enrollment EMP-BE-02 | **FORBIDDEN** |
| Seed / migrate execute / `apps/**` | **FORBIDDEN** this seat |
| Flip printable / personnel / payroll / module SI·CTR UAT | **FORBIDDEN** |
| AC click-path pack | parallel **ba-process** BA-01 |
| ensureSchema + F-SI-CAT-INS-* + consumer assert | **dev-be** **after BA+DATA both CONFIRMED** |
| FE picker rebind | **dev-fe** after BE |

---

## 5. Validation matrix (physical)

### 5.1 Catalog CRUD — VAL-SI-INR-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-SI-INR-CAT-01** | Create key `hr_insurer_custom_09` (N+) | No enum ceiling | **201** / persist — **AC-PLT-SI-INSURER-01d** · **BR-PLT-05** |
| **VAL-SI-INR-CAT-02** | Active duplicate `lower(key)` same company | UQ partial | **409** `HRM-PLT-CAT-CODE-CONFLICT` |
| **VAL-SI-INR-CAT-03** | Invalid slug (spaces / leading digit) | Format only | **400** `HRM-PLT-CAT-CODE-INVALID` |
| **VAL-SI-INR-CAT-04** | Retire with existing policy/records rows | Soft-delete | Picker hide; history key OK — **BR-PLT-04** · **L-SI-INR-05** |
| **VAL-SI-INR-CAT-05** | Hard-delete attempt | Forbidden | **4xx/405** — no hard delete |
| **VAL-SI-INR-CAT-06** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask — **L-SI-INR-06** · **VAL-SI-INR-CNS-02** |
| **VAL-SI-INR-CAT-07** | Mutate group REF via SI insurer catalog API | Writer lock | **FORBIDDEN** |
| **VAL-SI-INR-CAT-08** | `metadata_json` only as SoT | ICatalogRow columns first | Label/key from columns — meta ≠ code SoT |
| **VAL-SI-INR-CAT-09** | Effective active =0 | Empty EFF | **200** `[]` — admin CREATE still open — **AC-PLT-SI-INSURER-01c** · **no seed** |

### 5.2 Consumer — VAL-SI-INR-CNS-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-SI-INR-CNS-01** | Policy invent `insurer_key` when catalog >0 | **BR-PLT-02** · **AC-PLT-SI-INSURER-01b** | **400** `HRM-INS-INSURER-KEY` |
| **VAL-SI-INR-CNS-02** | List picker scope ≠ assert scope | scope_parity | jest **FAIL** |
| **VAL-SI-INR-CNS-03** | Records invent `insurer_key` when catalog >0 (if BA in-scope) | **BR-PLT-02** | **4xx** KEY class |
| **VAL-SI-INR-CNS-04** | History policy/records with retired key | **BR-PLT-04** | Display key/label fallback OK — no crash |
| **VAL-SI-INR-CNS-05** | Format-only valid code ∉ effective | Membership required | **4xx** KEY — **L-SI-INR-07** (format ≠ membership) |
| **VAL-SI-INR-CNS-06** | Alias in `legacy_alias_keys_json` | Resolve → canonical | **2xx** store/assert canonical key |
| **VAL-SI-INR-CNS-07** | Confuse type KEY with insurer KEY | Separate SoTs | Invent type ≠ pass insurer assert (and reverse) |

### 5.3 Dual SoT / scope

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-SI-INR-ALS-01** | Group REF + SI same key | effective read | SI row wins (tenant) — **BR-PLT-06** |
| **VAL-SI-INR-ALS-02** | Settings MD alone as sole picker SoT | Option A | **REJECT** — Nest EFF required when live |
| **VAL-SI-INR-SCP-01** | list ↔ get-by-id ↔ consumer assert | Scope parity U19 | Member **409**/404 on foreign company |

---

## 6. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| **AC-PLT-SI-INSURER-01** picker when EFF≥1 | §2 ADD | **F-SI-CAT-INS-EFF-01** | Nest EFF bind | U65 browser |
| **AC-PLT-SI-INSURER-01b** invent | effective keys | assert deepen | form | VAL-SI-INR-CNS-01 |
| **AC-PLT-SI-INSURER-01c** empty | §2.4 empty | EFF `[]` | empty + CTA | VAL-SI-INR-CAT-09 · U65 |
| **AC-PLT-SI-INSURER-01d** admin N+ | open key | **F-SI-CAT-INS-02** | Settings insurers | VAL-SI-INR-CAT-01 |
| **AC-PLT-SI-INSURER-01H** honesty | — | — | — | flags false · seals retain |
| **F-SI-CAT-INS-01** list | §2 | `GET …/insurers` | Settings | jest CRUD |
| **F-SI-CAT-INS-02** mutate | §2.1–2.2 | POST/PUT/retire | Settings | VAL-SI-INR-CAT-* |
| **F-SI-CAT-INS-EFF-01** | §2.4 + IX effective | `GET …/effective` | picker | VAL-SI-INR-ALS-* |
| **BR-PLT-02** | consumer keys | EFF assert | — | VAL-SI-INR-CNS-* |
| **BR-PLT-04** | soft-delete | retire | — | VAL-SI-INR-CAT-04 |
| **BR-PLT-05** | no enum CHECK | slug format only | — | VAL-SI-INR-CAT-01 |
| **BR-PLT-06** | dual SoT | EFF-01 | — | VAL-SI-INR-ALS-01 |
| E3 AC-INS-02 | §3 EXPAND `insurer_key` | assertInsurerKey → Nest | policy form | VAL-SI-INR-CNS-01 |
| FR-UC-BP-CORE-10 | peer type + this insurer | F-CORE-SI / F-SI-CAT-* | SI surfaces | BA enumerate UF/J-* |
| scope_parity U19 | `company_id` TEXT | list=get=mutate=assert | deep link | VAL-SI-INR-SCP-01 · VAL-SI-INR-CAT-06 |
| Peer type L1 | §3.6a RETAIN | F-SI-CAT-TYP/EFF | — | **FORBIDDEN** reopen |

---

## 7. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md` (ADD-only · no_prompt_echo)

| Action | Content |
|--------|---------|
| **ADD** | §3.6b `si_insurer` physical — open key · UQ partial · dual SoT · **FORBIDDEN** closed key CHECK · **FORBIDDEN** fold into §3.6a |
| **EXPAND** | §3.6 / policy note: `insurer_key` open catalog key · dual SoT REF `insurers` · history may hold retired · validate ∈ EFF when >0 |
| **EXPAND** | §3.6a peer pointer — insurers → §3.6b (no wipe type columns) |
| **EXPAND** | §1.1 ER — `si_insurer` validates policy/records insurer keys |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` |
| **Cấm** | Wipe §3.6a type · enrollment ONE SoT · CTR print · prompt-echo chat into client prose |

API_DESIGN F-SI-CAT-INS-* append = **ba-docs** residual after BA — not blocking DATA CONFIRMED; **BE HOLD** until BA AC pack CONFIRMED.

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-SI-INR-01 | AC pack consumer UF/J-* · UNKNOWN alias wording | **ba-process** BA-01 (parallel in flight) |
| R-PLT-SI-INR-02 | ensureSchema + Nest F-SI-CAT-INS-* + consumer assert deepen | **dev-be** after **BA+DATA** both CONFIRMED |
| R-PLT-SI-INR-03 | FE picker rebind Nest EFF — Settings MD alone REJECT | **dev-fe** after BE |
| R-PLT-SI-INR-04 | Client API DOC-DELTA F-SI-CAT-INS-* | **ba-docs** |
| R-PLT-SI-INR-05 | ADR §7 Contracts/Settings insurers row EXPAND | sa / ba-docs |

---

## 9. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `si_insurer` + partial UQ + format/status CHKs + effective IX — **omit** closed key CHECK · **omit** hard FK on policy/records · **omit** touching `si_insurance_type` DDL |
| Feature flag | When catalog empty (0): empty picker + admin CREATE; legacy MD assert path may coexist until cutover per BA — when **>0**: Nest EFF mandatory (**BR-PLT-02**) |
| Builtin ensure | Optional upsert starter keys — **not** UF evidence (U65) |
| Nest paths | Under contracts-insurance: `GET/POST/PUT/PATCH/retire` `/api/hrm/contracts-insurance/insurers*` · EFF helper — **FORBIDDEN** invent `/api/hrm/platform/si/*` mega |
| Assert migrate | `assertInsurerKey` → Nest EFF when count>0; records soft key same if BA in-scope |
| Peer pattern | Mirror `si_insurance_type` / `emp_document_type` / `att_leave_type` ensureSchema style — **separate** table |
| Unlock gate | **BA CONFIRMED + this DATA CONFIRMED** → PM may unlock BE — DATA alone **≠** BE start |

---

## 10. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| Module SI / CTR UAT | **DENIED** invent |
| SI type L1 GWC + SI-INS-CATALOG-DATA-01 | **RETAIN** — **cấm** reopen / fold |
| CTR legal-print QC-01/02/03 | **RETAIN** |
| SI enrollment EMP-BE-02 | **RETAIN** |
| EMP DOC/ET · DEC · PAY · ATT · REC · EXT · LIST-TOTALS | **RETAIN** — **cấm** reopen |
| `C-SLICE-≠-MODULE` | Nest insurer catalog ≠ module GO |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-data-01.md` |
| **next_owner** | **pm** — hold **dev-be** until parallel **BA-01 CONFIRMED**; then unlock `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01` |
| **completion_report** | CONFIRMED physical ADD `public.si_insurer` (open `insurer_key`, partial UQ lower(key), soft-delete `archived_at`, ICatalogRow + optional alias/meta JSON, dual SoT Settings `insurers` REF vs tenant writer tenant-wins, F-SI-CAT-INS-01/02/EFF-01 + effective IX, VAL-SI-INR-CAT/CNS/ALS/SCP); EXPAND policy/records soft-key notes; **FORBIDDEN** mega-EAV · fold into `si_insurance_type` · reopen type L1 · seed · wipe §3.6a; DOC-DELTA DB §3.6b; closes R-PLT-DATA-04 SI **insurers** slice; honesty false; CTR/SI type/enrollment seals RETAIN; no apps/**; no seed; **BE unlock HOLD** until BA also CONFIRMED. |
