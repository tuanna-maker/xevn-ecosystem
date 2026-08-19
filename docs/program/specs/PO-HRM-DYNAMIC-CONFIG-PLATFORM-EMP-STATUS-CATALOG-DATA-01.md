# PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01 — Physical DB · EMP employment status + reason catalogs

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01` **Option B CONFIRMED** · Nest **ABSENT** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `emp_employment_status` + `emp_status_reason` · **EXPAND** `employees.status` open-key note · **DOC-DELTA** client DB §3.0c/d · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** EMP DOC/ET · EMP-CUSTOM CNS · MergeToken EXT · ATT/SI/CTR |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — physical ADD per SA Option B §4–§6 · F-EMP-CAT-ST/STR-* |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01` **CONFIRMED** · parallel `…-EMP-STATUS-CATALOG-BA-01` **in flight** (BE unlock **HOLD** until BA **also** CONFIRMED) |
| **re_dispatch** | Prior seat INVALID-HANDOFF (ZERO files) — this seat **writes both** spec + evidence |
| **peer_retain** | [`EMP-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) §3.0a–b DOC/ET — **RETAIN** · **FORBIDDEN** reopen / fold status into ET |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md) Option B · L-EMP-ST-* · F-EMP-CAT-ST/STR/EFF · F-EMP-ST-CNS-* · AC-PLT-EMP-STATUS-01* |
| **ref_peer_si** | [`SI-INSURER-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md) — structure peer (not SI columns) |
| **ref_peer** | [`EMP-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) · [`ATT-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) · [`DEC-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md) |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · Q-PLT-03 mega-EAV DENY |
| **ref_db_client** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.0a–b · §3.1 `hrm_employee.status` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **DENIED** invent module EMP UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | `employees.status` text column · EMP DOC/ET Nest seals · EMP-CUSTOM CNS L1 · MergeToken EXT · soft-delete · scope TEXT slug · open catalog no CHK IN · display-ready `status_label` path · C&B / position XBOS OUT · transition-graph code residual OK |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical tables | **CONFIRMED ADD** `public.emp_employment_status` + companion `public.emp_status_reason` — **ABSENT AS-IS** Nest (grep empty vs DOC/ET LIVE) |
| Platform pattern | Option B **`ICatalogRow`** on domain tables — **not** mega-EAV · **not** fold into `emp_employment_type` / EMP-CUSTOM extension · **not** Settings MD sole SoT |
| Open catalog (status) | **`status_key`** format-only CHK — **FORBIDDEN** closed enum CHECK / restore `chk_employees_status IN ('active','inactive')` ceiling |
| Open catalog (reason) | **`reason_key`** format-only CHK — **FORBIDDEN** free-text SoT when reason EFF>0 / `requires_reason` |
| Dual SoT | Group REF settings-catalogs **`employee_statuses`** / **`employment_statuses`** **≠** EMP tenant writer — effective union; **tenant wins** (**BR-PLT-06** · L-EMP-ST-03) — Settings = **REF dual SoT**, **not** sole producer |
| Soft-delete | `status=retired` + `archived_at` — history employees may keep retired keys (**BR-PLT-04** · L-EMP-ST-11) |
| Consumer column | **EXPAND** `employees.status` — keep **text** soft key; **drop/replace** closed product CHECK; validate ∈ EFF when count>0 → **`HRM-EMP-STATUS-KEY`** (SA) |
| Reason consumer | Soft text field / payload when required — invent → **`HRM-EMP-STATUS-REASON-KEY`** (SA) — **no** hard FK GĐ1 |
| Peer DOC/ET | **§3.0a–b RETAIN** — **FORBIDDEN** wipe / reopen / fold status into ET |
| Seals | EMP-CUSTOM CNS L1 · MergeToken EXT · ATT/SI/CTR/enrollment **RETAIN** — **FORBIDDEN** reopen |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** EMP **status/reason** catalog slice (DOC/ET slice remains CLOSED separately) |
| Honesty | **remain false** — personnel / e2e / printable / module EMP UAT **not** flipped |
| BE unlock | **HOLD** — this DATA **CONFIRMED** · parallel **BA-01** must also **CONFIRMED** before PM unlocks BE |

---

## 2. ADD `public.emp_employment_status`

### 2.1 Columns (`ICatalogRow` + typed status flags)

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `status_key` | text | NO | | Open catalog code — format `^[a-z][a-z0-9_]*$`; **UQ / assert normalize `lower(key)`** |
| `name_vi` | text | NO | | UI label (display-ready → `status_label`) |
| `sort_order` | int | NO | 100 | Picker / Settings tab order |
| `is_workforce_active` | boolean | NO | true | Counts as “đang làm việc” class for ops filters |
| `is_terminal` | boolean | NO | false | Terminal employment state (e.g. resigned/terminated class) |
| `requires_reason` | boolean | NO | false | When true → consumer must supply reason ∈ EFF (or reason EFF>0 rule per BA) |
| `counts_toward_headcount` | boolean | NO | true | Headcount / Reports active class — **≠** invent payroll formula |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Optional aliases → canonical key (FE/mobile map bootstrap) |
| `metadata_json` | jsonb | YES | NULL | Optional hints — **not** mega-EAV SoT · **not** replace typed flags |
| `status` | text | NO | `'active'` | Row lifecycle `active` \| `retired` (**≠** employee `status_key`) |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

**Note:** Typed flags are **status-catalog** columns (peer ET `counts_toward_headcount` / DOC flags). **FORBIDDEN** invent full state-machine transition table here — illegal reverse / graph may remain **code** (**L-EMP-ST-07**).

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(status_key)) WHERE archived_at IS NULL` |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` — **F-EMP-CAT-ST-EFF-01** resolution |
| **IX flags** | `(company_id, is_terminal)` · `(company_id, requires_reason)` optional for picker filters |
| **CHK `chk_emp_st_key_format`** | `status_key ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_emp_st_row_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (status_key IN ('active','inactive',…))` · restore Nest `chk_employees_status` closed ceiling · hard-delete when employees history references key · mega-EAV · fold into `emp_employment_type` / custom-field |

### 2.3 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `status_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | typed ST flags + `sort_order` (+ optional alias/meta JSON) |
| `catalog_kind` | `emp_employment_status` (adapter constant) |

### 2.4 Dual SoT — effective status catalog (read model)

```text
  XBOS / Settings employee_statuses|employment_statuses ──► group REF merge-read only
           │
  F-EMP-CAT-ST CRUD ──► public.emp_employment_status (code SoT)  [ADD physical]
           │
           ▼
  F-EMP-CAT-ST-EFF-01 effective
           │  (EMP native row wins on same status_key)
           ▼
  Consumers (when count>0): employees.status ∈ catalog
    · POST/PATCH employees.status — F-EMP-ST-CNS-01 · HRM-EMP-STATUS-KEY
    · display status_label from catalog (OS 28) — hardcode map only EFF=0 bootstrap
```

| Rule | Detail |
|------|--------|
| Writer | Only **`emp_employment_status`** for tenant mutate — **FORBIDDEN** write Settings REF partition via status catalog API |
| Consumer | Keys ∈ **effective** when catalog **>0** (**BR-PLT-02** · **AC-PLT-EMP-STATUS-01b**) |
| Collision | Same key: EMP native overrides REF label/flags (`source=emp_override`) |
| Empty | `[]` = valid **200** — soft skip invent + CTA Settings · **no seed** (**L-EMP-ST-06** · U65) |
| Normalize | Assert / UQ: `lower(status_key)` |
| Settings REF | Partitions **`employee_statuses`** / **`employment_statuses` remain** — merge-read only; **not** dropped · **not** sole SoT (**Option A REJECT** · L-EMP-ST-03) |
| Error invent | Catalog ≠ empty ∧ key ∉ effective → **`HRM-EMP-STATUS-KEY`** (cite SA §6.3) |
| Orthogonal | **`employment_type_key` ≠ `status_key`** — separate SoTs (**L-EMP-ST-08**) |

### 2.5 Bootstrap starter keys (docs only — Dev ensure later)

Starter examples: `active`, `probation`, `inactive`, `on_leave`, `resigned`, `terminated` = **bootstrap upsert** when ensure runs — **not** product ceiling · **not** UF evidence (U65) · **FORBIDDEN** as CHECK `IN (...)`.

### 2.6 Cap → column map (status)

| Cap | Columns / indexes used |
|-----|------------------------|
| **F-EMP-CAT-ST-01** list/admin | All §2.1 · IX list · scope `company_id` |
| **F-EMP-CAT-ST-02** POST CREATE N+1 | Mutate `status_key`/`name_vi`/`sort_order`/typed flags · UQ partial · format CHK |
| **F-EMP-CAT-ST-03** PATCH | Metadata/flags — **no** wipe consumer history keys |
| **F-EMP-CAT-ST-04** soft-retire | `status`+`archived_at` |
| **F-EMP-CAT-ST-EFF-01** effective | IX effective · dual-SoT merge REF |
| **F-EMP-ST-CNS-01** consumer | `employees.status` ∈ EFF when count>0 → else **`HRM-EMP-STATUS-KEY`** |

---

## 3. ADD `public.emp_status_reason` (companion)

### 3.1 Columns (`ICatalogRow`)

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug (**U19**) |
| `reason_key` | text | NO | | Open catalog code — format `^[a-z][a-z0-9_]*$`; **UQ partial lower(key)** |
| `name_vi` | text | NO | | UI label |
| `sort_order` | int | NO | 100 | Picker order |
| `applies_to_status_keys_json` | jsonb | YES | NULL | Optional allow-list of `status_key` this reason applies to — null/empty = all terminal/requires_reason class per BA |
| `metadata_json` | jsonb | YES | NULL | Optional hints — **not** SoT |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

### 3.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(reason_key)) WHERE archived_at IS NULL` |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` — **F-EMP-CAT-STR-EFF-01** |
| **CHK `chk_emp_str_key_format`** | `reason_key ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_emp_str_row_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | Closed `CHECK (reason_key IN (…))` · hard FK to `emp_employment_status.id` GĐ1 (soft apply via JSON / service) · hard-delete · mega-EAV fold into status row |

### 3.3 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `reason_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | `sort_order` + optional `applies_to_status_keys_json` / `metadata_json` |
| `catalog_kind` | `emp_status_reason` (adapter constant) |

### 3.4 Cap → column map (reason)

| Cap | Columns / indexes used |
|-----|------------------------|
| **F-EMP-CAT-STR-01** list | All §3.1 · optional filter by applies_to |
| **F-EMP-CAT-STR-02** POST CREATE N+1 | Open slug · UQ partial · format CHK |
| **F-EMP-CAT-STR-EFF-01** effective | IX effective · active only |
| **F-EMP-ST-CNS-02** consumer | When `requires_reason` / reason EFF>0 → invent → **`HRM-EMP-STATUS-REASON-KEY`** (cite SA) |

### 3.5 Bootstrap starter reasons (docs only)

Examples (`resign_personal`, `resign_better_offer`, `term_performance`, `term_redundancy`, …) = bootstrap only — **not** ceiling · **not** UF evidence.

---

## 4. EXPAND consumer — `employees.status` + DOC-DELTA CHECK

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `employees` / logical `hrm_employee` | `status` | **Keep text column** — stores open catalog **`status_key`**; validate ∈ **F-EMP-CAT-ST-EFF-01** when catalog **>0** → else **`HRM-EMP-STATUS-KEY`**; history **may** hold **retired** keys (**BR-PLT-04**); display `status_label` from catalog when known (**L-EMP-ST-13**) |
| Nest DDL AS-IS | `chk_employees_status CHECK (status IN ('active','inactive'))` | **DROP / REPLACE** — **FORBIDDEN** closed product ceiling (**BR-PLT-05** · L-EMP-ST-04). Allowed residual: format-only soft validate at service layer; **no** `CHECK IN (N keys)` product restore |
| Status reason (payload / column if BA names) | soft text | ∈ **F-EMP-CAT-STR-EFF-01** when required / EFF>0 → else **`HRM-EMP-STATUS-REASON-KEY`** — **no** hard FK |
| Settings items | `employee_statuses` / `employment_statuses` | Group REF partitions — merge-read only (**L-EMP-ST-03**) — **not** sole producer |
| `emp_employment_type` / DOC | — | **§3.0a–b RETAIN** — **FORBIDDEN** fold |
| EMP-CUSTOM extension / MergeToken EXT | — | **SEAL RETAIN** — **FORBIDDEN** reopen / fold status into custom field |
| ATT / SI / CTR / enrollment | — | **SEAL RETAIN** |

**AS-IS cite (do not treat as Nest status SoT):**

- FE `EmployeeFormDialog` Settings keys + hardcode fallback `active|probation|inactive`
- BE `employee-display.ts` hardcode VI map
- Mobile `profileTabs` hardcode map
- Bootstrap `chk_employees_status` closed CHECK
- Import hint `select:active|probation|inactive`

---

## 5. Explicitly **OUT** this DATA seat

| Item | Rule |
|------|------|
| Mega-EAV / `hrm_emp_catalog_rows` status+DOC+ET+custom | **REJECT** (SA Option C · ADR Q-PLT-03 · **L-EMP-ST-14**) |
| Fold into `emp_employment_type` / EMP-CUSTOM extension-items / DOC | **FORBIDDEN** |
| Wipe EMP DOC/ET seals / EMP-CUSTOM CNS L1 / MergeToken EXT | **FORBIDDEN** |
| Reopen ATT / SI / CTR / enrollment | **FORBIDDEN** |
| Seed / migrate execute / `apps/**` | **FORBIDDEN** this seat |
| Flip `hrm_personnel_uat_ready` / `employees_e2e_linkage_ready` / printable | **FORBIDDEN** |
| Invent module EMP UAT / Phase1 DONE | **FORBIDDEN** · **`C-SLICE-≠-MODULE`** |
| Full rewrite status-machine transition product | **FORBIDDEN** this seat (codes open; graph residual OK) |
| AC click-path pack | parallel **ba-process** BA-01 |
| ensureSchema + F-EMP-CAT-ST/STR + CNS KEY + DROP CHECK | **dev-be** **after BA+DATA both CONFIRMED** |
| FE/Mobile picker rebind | **dev-fe** / **dev-mobile** after BE |

---

## 6. Validation matrix (physical)

### 6.1 Status catalog CRUD — VAL-EMP-ST-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-EMP-ST-CAT-01** | Create key `hr_st_custom_09` (N+) | No enum ceiling | **201** / persist — **AC-PLT-EMP-STATUS-01** · **BR-PLT-05** |
| **VAL-EMP-ST-CAT-02** | Active duplicate `lower(key)` same company | UQ partial | **409** `HRM-PLT-CAT-CODE-CONFLICT` |
| **VAL-EMP-ST-CAT-03** | Invalid slug (spaces / leading digit / UPPER) | Format only | **400** `HRM-PLT-CAT-CODE-INVALID` |
| **VAL-EMP-ST-CAT-04** | Retire with existing employee rows | Soft-delete | Picker hide; history key OK — **BR-PLT-04** · **AC-PLT-EMP-STATUS-01d** |
| **VAL-EMP-ST-CAT-05** | Hard-delete attempt | Forbidden | **4xx/405** — no hard delete |
| **VAL-EMP-ST-CAT-06** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask — **L-EMP-ST-12** |
| **VAL-EMP-ST-CAT-07** | Mutate group REF via status catalog API | Writer lock | **FORBIDDEN** |
| **VAL-EMP-ST-CAT-08** | `metadata_json` only as SoT | Typed flags first | Flags from columns — meta ≠ code SoT |
| **VAL-EMP-ST-CAT-09** | Effective active =0 | Empty EFF | **200** `[]` — invent skip + CTA — **AC-PLT-EMP-STATUS-01c** · **no seed** |
| **VAL-EMP-ST-CAT-10** | Create with `requires_reason=true` | Flag persist | Row usable for CNS-02 gate |

### 6.2 Reason catalog — VAL-EMP-STR-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-EMP-STR-CAT-01** | Create reason N+1 | Open slug | **201** — **AC-PLT-EMP-STATUS-01e** |
| **VAL-EMP-STR-CAT-02** | Active duplicate reason key | UQ partial | **409** conflict |
| **VAL-EMP-STR-CAT-03** | Invalid reason slug | Format only | **400** invalid |
| **VAL-EMP-STR-CAT-04** | Soft-retire reason | Soft-delete | Picker hide; history OK |
| **VAL-EMP-STR-CAT-05** | Empty reason EFF | Soft skip when not required | **200** `[]` — **no seed** |

### 6.3 Consumer — VAL-EMP-ST-CNS-* / VAL-EMP-STR-CNS-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-EMP-ST-CNS-01** | Employee invent `status` when catalog >0 | **BR-PLT-02** · **AC-PLT-EMP-STATUS-01b** | **400** `HRM-EMP-STATUS-KEY` |
| **VAL-EMP-ST-CNS-02** | List picker scope ≠ assert scope | scope_parity | jest **FAIL** |
| **VAL-EMP-ST-CNS-03** | History employee with retired status_key | **BR-PLT-04** | Display key/label fallback OK — no crash |
| **VAL-EMP-ST-CNS-04** | Format-only valid code ∉ effective | Membership required | **4xx** KEY — format ≠ membership |
| **VAL-EMP-ST-CNS-05** | Alias in `legacy_alias_keys_json` | Resolve → canonical | **2xx** store/assert canonical |
| **VAL-EMP-ST-CNS-06** | Confuse `employment_type_key` with `status_key` | Separate SoTs | Invent type ≠ pass status assert |
| **VAL-EMP-ST-CNS-07** | Closed CHECK still present after ensure | DOC-DELTA | jest / migrate assert **FAIL** until DROP |
| **VAL-EMP-STR-CNS-01** | Invent reason when required / reason EFF>0 | **AC-PLT-EMP-STATUS-01e** | **400** `HRM-EMP-STATUS-REASON-KEY` |
| **VAL-EMP-STR-CNS-02** | Reason not in `applies_to` for target status (if BA enforces) | Soft filter | **4xx** KEY class |

### 6.4 Dual SoT / scope

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-EMP-ST-ALS-01** | Group REF + EMP same `status_key` | effective read | EMP row wins (tenant) — **BR-PLT-06** |
| **VAL-EMP-ST-ALS-02** | Settings MD alone as sole picker SoT | Option A | **REJECT** — Nest EFF required when live |
| **VAL-EMP-ST-SCP-01** | list ↔ get-by-id ↔ consumer assert | Scope parity U19 | Member **409**/404 on foreign company |

---

## 7. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| **AC-PLT-EMP-STATUS-01** admin N+ | §2 ADD | **F-EMP-CAT-ST-02** | Settings / Nest list | U65 browser |
| **AC-PLT-EMP-STATUS-01b** invent status | effective keys | **F-EMP-ST-CNS-01** | form | VAL-EMP-ST-CNS-01 |
| **AC-PLT-EMP-STATUS-01c** empty | §2.4 empty | EFF `[]` | empty + CTA | VAL-EMP-ST-CAT-09 · U65 |
| **AC-PLT-EMP-STATUS-01d** soft-retire | `archived_at` | ST-04 | picker hide | VAL-EMP-ST-CAT-04 |
| **AC-PLT-EMP-STATUS-01e** reason | §3 ADD | STR-* · CNS-02 | reason picker | VAL-EMP-STR-* |
| **AC-PLT-EMP-STATUS-01H** honesty | — | — | — | flags false · seals retain |
| **F-EMP-CAT-ST-01** list | §2 | `GET …/employment-statuses` | Settings | jest CRUD |
| **F-EMP-CAT-ST-EFF-01** | §2.4 + IX effective | `GET …/effective` | picker | VAL-EMP-ST-ALS-* |
| **F-EMP-CAT-STR-*** | §3 | status-reasons* | picker | VAL-EMP-STR-CAT-* |
| **BR-PLT-02** | consumer keys | EFF assert | — | VAL-EMP-ST-CNS-* |
| **BR-PLT-04** | soft-delete | retire | — | VAL-EMP-ST-CAT-04 |
| **BR-PLT-05** | no enum CHECK | slug format only · DROP closed CHECK | — | VAL-EMP-ST-CAT-01 · CNS-07 |
| **BR-PLT-06** | dual SoT | EFF-01 | — | VAL-EMP-ST-ALS-01 |
| scope_parity U19 | `company_id` TEXT | list=get=mutate=assert | deep link | VAL-EMP-ST-SCP-01 · CAT-06 |
| Peer DOC/ET | §3.0a–b RETAIN | F-EMP-CAT-DOC/ET | — | **FORBIDDEN** reopen |
| EMP-CUSTOM / EXT | seals RETAIN | — | — | **FORBIDDEN** reopen |

---

## 8. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md` (ADD-only · no_prompt_echo)

| Action | Content |
|--------|---------|
| **ADD** | §3.0c `emp_employment_status` physical — open `status_key` · typed flags · UQ partial · dual SoT · **FORBIDDEN** closed key CHECK |
| **ADD** | §3.0d `emp_status_reason` companion — open `reason_key` · soft applies_to · soft-delete |
| **EXPAND** | §3.1 `hrm_employee.status` — open catalog key · validate ∈ EFF when >0 · history may hold retired · **DROP/REPLACE** closed Nest `chk_employees_status` ceiling |
| **EXPAND** | §1.1 ER — status/reason catalogs validate employee status keys |
| **EXPAND** | §3.0b peer pointer — status ≠ employment_type (no wipe ET) |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01` |
| **Cấm** | Wipe §3.0a–b DOC/ET · EMP-CUSTOM/EXT · ATT/SI/CTR · prompt-echo chat into client prose |

API_DESIGN F-EMP-CAT-ST/STR-* append = **ba-docs** residual after BA — not blocking DATA CONFIRMED; **BE HOLD** until BA AC pack CONFIRMED.

---

## 9. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-EMP-ST-01 | AC pack consumer UF/J-* · reason required wording | **ba-process** BA-01 (parallel in flight) |
| R-PLT-EMP-ST-02 | ensureSchema ADD 2 tables + DROP closed CHECK + Nest F-EMP-CAT-ST/STR + CNS KEY | **dev-be** after **BA+DATA** both CONFIRMED |
| R-PLT-EMP-ST-03 | FE picker rebind Nest EFF — deprecate hardcode sole SoT when EFF>0 | **dev-fe** after BE |
| R-PLT-EMP-ST-04 | Mobile label map → catalog | **dev-mobile** after BE |
| R-PLT-EMP-ST-05 | Client API DOC-DELTA F-EMP-CAT-ST/STR | **ba-docs** |
| R-PLT-EMP-ST-06 | Transition-graph code residual (illegal reverse) | product residual — **not** this DATA seat |

---

## 10. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `emp_employment_status` + `emp_status_reason` + partial UQ + format/row-status CHKs + effective IX — **omit** closed key CHECK · **DROP/REPLACE** `chk_employees_status` closed IN · **omit** hard FK on employees.status · **omit** touching DOC/ET DDL |
| Feature flag | When status catalog empty (0): invent assert **skip** + CTA; hardcode label map bootstrap OK — when **>0**: Nest EFF mandatory (**BR-PLT-02**) · FE **FORBIDDEN** hardcode sole SoT |
| Builtin ensure | Optional upsert starter keys — **not** UF evidence (U65) |
| Nest paths | Under employees module: `GET/POST/PUT/PATCH/retire` `/api/hrm/employees/employment-statuses*` · `/status-reasons*` · EFF helpers — **FORBIDDEN** invent mega `/api/hrm/platform/emp/*` EAV |
| Assert | Employee create/update → Nest EFF when count>0; reason when required / EFF>0 |
| Peer pattern | Mirror `emp_document_type` / `emp_employment_type` / `att_leave_type` / `si_insurer` ensureSchema style — **separate** tables |
| Unlock gate | **BA CONFIRMED + this DATA CONFIRMED** → PM may unlock BE — DATA alone **≠** BE start |

---

## 11. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `hrm_personnel_uat_ready` | **false** · **DENIED** flip |
| `employees_e2e_linkage_ready` | **false** · **DENIED** flip |
| `contracts_printable_ready` | **false** · **DENIED** flip |
| Module EMP UAT / Phase1 | **DENIED** invent · **`C-SLICE-≠-MODULE`** |
| EMP DOC/ET §3.0a–b + EMP-DATA-01 | **RETAIN** — **cấm** reopen / fold |
| EMP-CUSTOM CNS L1 · MergeToken EXT | **RETAIN** — **cấm** reopen / wipe |
| ATT / SI / CTR / enrollment | **RETAIN** |
| Seed | **DENIED** (U65) |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-data-01.md` |
| **next_owner** | **pm** — hold **dev-be** until parallel **BA-01 CONFIRMED**; then unlock `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01` |
| **completion_report** | CONFIRMED physical ADD `public.emp_employment_status` + companion `public.emp_status_reason` (open keys, partial UQ lower(key), soft-delete `archived_at`, ICatalogRow + typed ST flags / applies_to, dual SoT Settings `employee_statuses`/`employment_statuses` REF vs tenant writer tenant-wins, F-EMP-CAT-ST/STR/EFF + effective IX, invent KEY `HRM-EMP-STATUS-KEY` / `HRM-EMP-STATUS-REASON-KEY` cite SA, VAL-EMP-ST/STR-CAT/CNS/ALS/SCP); EXPAND `employees.status` soft-key + **DROP/REPLACE** closed `chk_employees_status`; **FORBIDDEN** mega-EAV · fold into ET/custom · wipe EMP-CUSTOM/EXT · seed · flip ready; DOC-DELTA DB §3.0c/d; closes R-PLT-DATA-04 EMP status/reason slice; honesty false; seals RETAIN; no apps/**; **BE unlock HOLD** until BA also CONFIRMED. |
