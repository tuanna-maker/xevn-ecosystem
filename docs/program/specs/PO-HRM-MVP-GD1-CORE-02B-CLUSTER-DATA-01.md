# PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE EMP-CF spine (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-17 seat **#19**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD / RETAIN** LIVE `public.hrm_catalog_extension_items` + `public.hrm_merge_tokens` + `public.employees.custom_fields` + four allow-list EMP field catalogs · **NO ADD** `profile_groups_json` · **NO** Nest `emp_custom_field` / mega-EAV · **NO** Nest `/core` table · **NO** wipe Settings extension SoT · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — physical EMP-CF spine **already LIVE** · BA O5 `profile_groups_json` gap **NOT proven** → **NOT unlock** |
| **uc_ids** | `UC-BP-CORE-02b` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · EMPCF QA **`EMPCFQA-MSK14LUH`** · EXT QA **`EMPTOKEXTQA-MSJ57PE1`** · peer QC **`CORE09DQC1-MSLDR8I3`** must_keep |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md) · ba-data **HOLD default** · O1–O12 · AC-CORE-02B-* · AC-PLT-EMP-CUSTOM-01* · VAL-EMP-CF-* |
| **ref_emp_cf** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md) · BA-01 · FE-SA **`R-PLT-EMP-CF-FE-01` P2 HOLD** |
| **ref_tok_data** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md) · EXT `origin=extension_field` |
| **ref_core09d_data** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md) — open TPL+junction · **≠ printable / closed-8 DONE** |
| **ref_core09c_data** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) — VER/PDF · **≠ printable UAT** |
| **ref_core09b_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — PACK+PREV ephemeral |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — CL body+snapshot |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · **`profile_groups_json` OUT invent** · Nest `/core` DENY |
| **ref_db_settings** | [`DB_DESIGN_HRM_SETTINGS_CATALOG.md`](../../hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md) §7 · [`DB_DESIGN_HRM_EMPLOYEES.md`](../../hrm/DB_DESIGN_HRM_EMPLOYEES.md) `custom_fields` |
| **ref_paper_api** | **F-EMP-CF-01..03** · **F-EMP-TOK-03** · **F-EMP-CF-CNS-01/02** · must_keep **F-CORE-CTR-TPL-01/02** · VER/PDF · PACK+PREV ephemeral · CL · CORE-08/02/01 |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-02b** · Diễn biến **#1–#4** · **AC-PLT-EMP-CUSTOM-01*** · **BR-PLT-01/02/04/05** · **BR-BP-MD-01** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim EMPCF = CORE-02b / personnel DONE · **DENY** claim CORE-09d printable / closed-8 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Profile groups SoT | **Four** allow-list Settings catalog keys (`hrm_employee_{basic\|personal\|work\|finance}_fields` + aliases) — **RETAIN** · **DENY** Nest `employee_profile_groups` |
| Field-def SoT | **ONE** LIVE **`public.hrm_catalog_extension_items`** — **RETAIN** · **DENY** Nest `emp_custom_field` / mega-EAV |
| Token SoT | **ONE** LIVE **`public.hrm_merge_tokens`** · F-EMP-TOK-03 `origin=extension_field` · `custom.emp.<code>` — **RETAIN** cite `EMPTOKEXTQA-MSJ57PE1` |
| Values SoT | **`public.employees.custom_fields`** JSONB bag — **RETAIN** · invent assert **F-EMP-CF-CNS-01** cite `EMPCFQA-MSK14LUH` |
| Schema action this seat | **HOLD** — **no ADD** `profile_groups_json` · **no** Nest field-def table · **no** mega-EAV · **no** Nest `/core` EMP-CF table · **no** wipe Settings extension SoT |
| O5 `profile_groups_json` | Paper optional on DB_DESIGN employees · **ABSENT** LIVE `employees` ensureSchema (CORE-01 OUT) · BA gap **NOT proven** → **NOT unlock** · **OUT primary** layout SoT |
| Display order GĐ1 | **catalog_key** (= nhóm) + AS-IS list order (`ORDER BY code` within catalog) — **sufficient** per BA O5 · physical `sort_order` col on extension-items **ABSENT** ensureSchema → **HOLD ADD** (≠ unlock `profile_groups_json`) |
| Nest path | Physical **`/api/hrm/settings-catalogs*`** + **`/api/hrm/employees*`** · paper `/api/hrm/core/…` = **alias only** |
| CORE-09d..01 | **must_keep** TPL+clause · VER/PDF ≠ printable · PREV ephemeral · CL · RD+payroll_link · packages/AuthZ/CB-403 · public strip · Nest `/core` DENY · stamps **`CORE09DQC1-MSLDR8I3`** · **`CORE09CQC1-MSLBXMUT`** · **`CORE09BQC1-MSLB05DZ`** · **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** |
| FE residual | **`R-PLT-EMP-CF-FE-01`** empty CTA = **P2 HOLD** — **≠** schema unlock · **≠** Nest field-def UI |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 · **NO** claim EMPCF=module DONE · **NO** claim CORE-09d printable/closed-8 |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| FR-02b «nhóm» hồ sơ | Four catalog keys allow-list | **RETAIN** = groups SoT |
| Field-def / mục mở rộng | **`hrm_catalog_extension_items`** | **RETAIN** ONE def SoT |
| Merge token register | **`hrm_merge_tokens`** `origin=extension_field` | **RETAIN** F-EMP-TOK-03 |
| Profile values | **`employees.custom_fields`** | **RETAIN** values bag |
| `profile_groups_json` (DB_DESIGN §3.1) | — | **HOLD invent · OUT primary** |
| Nest `emp_custom_field` / mega-EAV | — | **DENY ADD** |
| `/api/hrm/core/…` EMP-CF | `/settings-catalogs*` + `/employees*` | **Alias only** — API seat |
| Nest `/core` EMP-CF table | — | **DENY invent** |

```text
  Four allow-list catalogs = PROFILE GROUPS SoT (RETAIN)
    hrm_employee_basic_fields | personal | work | finance (+ aliases)
    DENY: Nest employee_profile_groups dual
                │
                │ F-EMP-CF-01/02/03  (Settings)
                ▼
  hrm_catalog_extension_items (LIVE — RETAIN ONE field-def SoT · HOLD no ADD)
        RETAIN: id · tenant_id · company_id · catalog_key · code · label ·
                unit · status (active|draft soft-stop) · created_at
        UQ:     (tenant_id, company_id, catalog_key, code)
        ORDER:  AS-IS SELECT ORDER BY code (within catalog_key)
        ABSENT: physical sort_order column · archived_at (soft = status=draft)
        DENY:   Nest emp_custom_field · mega-EAV · wipe Settings SoT · closed enum
                │
                │ F-EMP-TOK-03 same TX
                ▼
  hrm_merge_tokens (LIVE — RETAIN)
        RETAIN: token_key = custom.emp.<code> · origin=extension_field ·
                ring=custom · domain=EMP · extension_field_ref · status · archived_at
        DENY:   second EMP token table · reopen EXT suite as greenfield
                │
                │ F-EMP-CF-CNS-01/02 consumer
                ▼
  employees.custom_fields (LIVE JSONB — RETAIN values SoT)
        RETAIN: bag keys ∈ EFF when EFF>0 · invent → HRM-EMP-CUSTOM-FIELD-KEY
        DENY:   value write = definition register · profile_groups_json primary
                │
                │ must_keep peers
                ▼
  CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral ·
  09a CL · 08 RD+payroll_link · 02 packages/AuthZ/CB-403 · 01 public
        SEALED · Nest /core DENY

  FORBIDDEN GĐ1 this seat:
        ADD profile_groups_json / Nest emp_custom_field / mega-EAV /
        Nest @Controller('core') EMP-CF table / wipe Settings extension SoT
        Unlock profile_groups_json without BA O5 proven gap
        Claim EMPCF = CORE-02b / personnel UAT · claim CORE-09d printable/closed-8
        Reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 · seed · honesty · apps/**
```

**Label lock:** «Cấu hình nhóm field hồ sơ (metadata)» = **four allow-list catalogs + extension-items + TOK + CNS + custom_fields** — **not** Nest field-def · **not** mega-EAV · **not** `profile_groups_json` primary.  
**Spine lock:** Physical Settings `/settings-catalogs*` + Employee `/employees*` — **DENY** Nest `/core` dual.  
**Group lock:** Catalog key ∈ allow-list = nhóm — **DENY** parallel Nest group table.  
**Gap lock:** Schema UNLOCK `profile_groups_json` **only** with BA O5 proven closable UX gap beyond four catalogs + AS-IS order — **this seat: NOT unlock**.  
**Honesty lock:** EMPCF L1 / FE mount ≠ personnel / CORE-02b module UAT · CORE-09d ≠ printable / closed-8 DONE.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE | Gap (Wave-17 DATA) |
|--------|------------|---------------------|
| **`public.hrm_catalog_extension_items`** | `settings-catalogs.service.ts` `ensureExtensionSchema`: `id BIGSERIAL` · `tenant_id` · `company_id` · `catalog_key` · `code` · `label` · `unit` · `status` DEFAULT `active` · `created_at` · UQ `(tenant_id, company_id, catalog_key, code)` · list `ORDER BY code` · soft-stop `status='draft'` · INSERT append/upsert | **HOLD RETAIN** — **no ADD** |
| EMP allow-list catalogs | `emp-merge-token-register.ts` `EMP_EXTENSION_FIELD_CATALOG_KEYS` — basic/personal/work/finance + aliases | **RETAIN** = groups SoT |
| **`public.hrm_merge_tokens`** | `merge-tokens.service.ts` ensureSchema — `token_key` · `origin` CHK includes **`extension_field`** · `ring` · `domain` · `extension_field_ref` · soft `archived_at` · UQ active `(company_id, lower(token_key))` · partial IX `origin=extension_field` | **HOLD RETAIN** |
| F-EMP-TOK-03 | same-TX upsert `custom.emp.<code>` on allow-list CREATE/retire | **RETAIN** seal `EMPTOKEXTQA-MSJ57PE1` |
| **`public.employees.custom_fields`** | `employees.service.ts` ensureSchema JSONB NOT NULL DEFAULT `{}` | **HOLD RETAIN** values |
| F-EMP-CF-CNS-01 | `emp-custom-field-consumer-assert.ts` — invent when EFF>0 → **`HRM-EMP-CUSTOM-FIELD-KEY`** | **RETAIN** `EMPCFQA-MSK14LUH` |
| `profile_groups_json` | **ABSENT** employees ensureSchema · paper optional · CORE-01 DATA **OUT invent** | **HOLD invent · NOT unlock** |
| Nest `emp_custom_field*` | **ABSENT** | **HOLD** — **DENY invent** |
| Paper `/core/…` | **ABSENT** as Nest SoT | Alias only |
| Physical `sort_order` on extension-items | **ABSENT** ensureSchema (DTO type has no sort_order; list = `ORDER BY code`) | **HOLD ADD** — ≠ O5 unlock JSON |
| Source | `SettingsCatalogsService` · `emp-merge-token-register` · `emp-custom-field-consumer-assert` · `employees.service` · `@Controller` settings-catalogs / employees | sa API RETAIN cite → FE P2 HOLD only |

**FORBIDDEN invent this seat:** Nest `emp_custom_field` · mega-EAV · Nest `/core` EMP-CF SoT · wipe Settings extension · invent `profile_groups_json` primary · claim EMPCF=CORE-02b/personnel DONE · claim CORE-09d printable/closed-8 · reopen J-09D..01 · seed · honesty flip · `apps/**`.

---

## 4. Physical columns — LIVE cite (normative RETAIN)

### 4.1 `public.hrm_catalog_extension_items` (ONE field-def SoT)

| Cột | Kiểu (LIVE) | Null | Ý nghĩa | Maps |
|-----|-------------|------|---------|------|
| `id` | BIGSERIAL PK | NO | Extension row id | F-EMP-CF-01/02 |
| `tenant_id` | text | NO | Tenant partition | U19 |
| `company_id` | text | NO | Legal entity / scope | U19 · scope_parity |
| **`catalog_key`** | text | NO | **= nhóm** (allow-list EMP field catalog) | O2 · AC-CORE-02B-01 · F-EMP-CF-01 |
| **`code`** | text | NO | Open field-def identity (UQ in catalog) | O3 · AC-01 · VAL-ADM-01 |
| **`label`** | text | NO | Nhãn VI display-ready | O11 |
| `unit` | text | YES | Optional meta | O11 |
| **`status`** | text | NO | `active` \| `draft` (soft-stop = draft) | O7 · AC-01e · soft-retire |
| `created_at` | timestamptz | NO | Audit | F5 |

**Constraints / indexes (LIVE):**

| Object | Definition | Maps |
|--------|------------|------|
| **UQ** | `(tenant_id, company_id, catalog_key, code)` | O3 UQ · admin KEY class |
| **List order AS-IS** | `ORDER BY code` within catalog | O5 display · AC-CORE-02B-05 |
| **Soft-retire** | `UPDATE status='draft'` (+ token soft) | O7 · BR-PLT-04 · **DENY** hard DELETE wipe |

**Display-order note (honest AS-IS):** Physical column **`sort_order` ABSENT** on this table in Nest `ensureExtensionSchema`. BA/SA «sort_order» for GĐ1 = **catalog_key partition (nhóm) + stable code order** as sufficient display SoT — **not** a closable residual unlocking `profile_groups_json`. Optional future ADD `sort_order` (narrow) would require **new** BA/QA proof of reorder CRUD gap — **out of this seat unlock gate** (O5 gate = JSON column only; result = NOT unlock).

**Invariant CORE-02B-DEF-ONE:** Authoritative field-def SoT = **`hrm_catalog_extension_items` only** — Nest `emp_custom_field` / mega-EAV = **FAIL O3**.  
**Invariant CORE-02B-GROUPS:** Groups SoT ≠ four allow-list catalogs (or invent Nest group table) = **FAIL O2**.  
**Invariant CORE-02B-OPEN:** Closed enum of extension codes / reject N+1 = **FAIL O3**.

### 4.2 Four allow-list catalogs = groups (RETAIN)

| catalog_key (storage) | Aliases (accept) | FR-02b nhóm |
|-----------------------|------------------|-------------|
| `hrm_employee_basic_fields` | `employee_basic_fields` | Thông tin cơ bản |
| `hrm_employee_personal_fields` | `employee_personal_fields` | Cá nhân |
| `hrm_employee_work_fields` | `employee_work_fields` | Công việc |
| `hrm_employee_finance_fields` | `employee_finance_fields` | Tài chính (C&B ring — CORE-02/01 strip) |

**Invariant CORE-02B-FINANCE:** Finance catalog / money keys **must_keep** CORE-02 CB-403 + CORE-01 public strip — public leak = **FAIL O8**.

### 4.3 `public.hrm_merge_tokens` (F-EMP-TOK-03 RETAIN)

| Cột / rule | LIVE | Maps |
|------------|------|------|
| `token_key` | `custom.emp.<normalized_code>` | O4 · AC-01b · VAL-ADM-02 |
| `origin` | **`extension_field`** (CHK includes) | BR-PLT-01 · EXT seal |
| `ring` | `custom` | EMP extension |
| `domain` | `EMP` | EMP |
| `extension_field_ref` | soft neo to def | TOK-03 |
| `status` / `archived_at` | soft-retire with def | O7 |
| UQ active | `(company_id, lower(token_key)) WHERE archived_at IS NULL` | no dual active key |

**Invariant CORE-02B-TOK-ONE:** Second EMP token table / second register path = **FAIL O4**.  
**FORBIDDEN:** reopen EXT suite as greenfield · closed `token_key IN (…)`.

### 4.4 `public.employees.custom_fields` (values SoT RETAIN)

| Cột | Kiểu (LIVE) | Null | Ý nghĩa | Maps |
|-----|-------------|------|---------|------|
| **`custom_fields`** | jsonb | NO DEFAULT `{}` | Tenant + profile bag · extension **values** | O6 · F-EMP-CF-CNS-01/02 · AC-01c/d |

| Rule | Outcome |
|------|---------|
| EFF active defs **>0** · invent code ∉ EFF | **4xx** `HRM-EMP-CUSTOM-FIELD-KEY` · F5 no persist — cite `EMPCFQA-MSK14LUH` |
| EFF **=0** | Skip invent assert · soft-empty omit · **no seed** · CTA **P2 HOLD** |
| Value PATCH alone | ≠ definition register (EXT-04c RETAIN) |
| ESS self-PATCH | Narrow allow only — **F-EMP-CF-CNS-02** · no widen |
| `profile_groups_json` | **ABSENT** on LIVE employees — **HOLD invent** |

**Invariant CORE-02B-≠-EMPCF-DONE:** EMPCF L1 / FE mount ≠ CORE-02b / personnel module UAT = **FAIL O10**.

### 4.5 Conditional UNLOCK gate (default = NOT)

| Condition | Unlock schema? | This seat |
|-----------|----------------|-----------|
| BA O5 proves closable UX gap that **four catalogs + AS-IS order cannot cover** → needs `profile_groups_json` (or equivalent layout engine column) | **YES** — narrow ADD only after ba-data | **NOT proven** (BA-01 O5) → **NOT unlock** |
| Desire reorder CRUD beyond `ORDER BY code` | **NO** this seat — optional future narrow `sort_order` only with separate BA proof · **≠** O5 JSON unlock | Default HOLD |
| FE UX / wire / empty CTA residual only | **NO** — sa API RETAIN and/or FE P2 HOLD | Default path |
| Desire Nest `emp_custom_field` / mega-EAV / Nest `/core` / wipe Settings / invent JSON primary | **NO** — **DENY** | Absolute |

**Verdict:** O5 gap **NOT proven** → **HOLD / NOT unlock `profile_groups_json`**.

---

## 5. Validation matrix (physical)

| VAL-ID | Condition | Rule | Expected |
|--------|-----------|------|----------|
| **VAL-CORE-02B-DATA-01** | Field-def SoT | Read/write defs only via `hrm_catalog_extension_items` | Nest `emp_custom_field` / mega-EAV = **FAIL** |
| **VAL-CORE-02B-DATA-02** | Groups SoT | `catalog_key` ∈ four allow-list (+ aliases) | Nest group dual = **FAIL O2** |
| **VAL-CORE-02B-DATA-03** | Open N+1 | INSERT new code allowed (format/UQ only) | Closed enum reject = **FAIL O3** |
| **VAL-CORE-02B-DATA-04** | Soft-retire | `status=draft` + token soft · history values OK | Hard DELETE wipe = **FAIL O7** |
| **VAL-CORE-02B-DATA-05** | TOK same-TX | CREATE → `custom.emp.*` `origin=extension_field` | Missing token / wrong origin = **FAIL O4** |
| **VAL-CORE-02B-DATA-06** | CNS invent | EFF>0 invent → `HRM-EMP-CUSTOM-FIELD-KEY` | 2xx invent = **FAIL O6** |
| **VAL-CORE-02B-DATA-07** | Empty EFF | Skip invent · soft-empty · no seed | Seed to pass = **FAIL U65** |
| **VAL-CORE-02B-DATA-08** | Values bag | Persist only in `employees.custom_fields` | Second values EAV = **FAIL** |
| **VAL-CORE-02B-DATA-09** | `profile_groups_json` | ABSENT LIVE · OUT primary | Invent primary without O5 = **FAIL O5** |
| **VAL-CORE-02B-DATA-10** | Nest `/core` | Zero EMP-CF physical SoT | Dual invent = **FAIL O1** |
| **VAL-CORE-02B-DATA-11** | Scope U19 | Settings list = employee invent assert same family | Cross-CT = **FAIL** |
| **VAL-CORE-02B-DATA-12** | C&B / public | Finance strip · CB-403 | Public leak = **FAIL O8** |
| **VAL-CORE-02B-DATA-13** | Peer seals | CORE-09d..01 RETAIN | Reopen rewrite = **FAIL** |
| **VAL-CORE-02B-DATA-14** | Honesty | personnel/printable/EMPCF=module DONE claims forbidden | Flip / claim = **FAIL O10** |
| **VAL-CORE-02B-DATA-15** | No seed | FE-only create → invent assert | Seed defs/values = **FAIL U65** |

---

## 6. Traceability (requirement → DB → API → FE → test)

| SRS / BR | DB | API (paper) | FE / J-* | Test expect |
|----------|----|-------------|----------|-------------|
| FR-02b #1 · O2/O3 · AC-01 | four catalogs + `hrm_catalog_extension_items` | **F-EMP-CF-01/02** | **J-HRM-CORE-02B-01** | POST extension 2xx · F5 · no Nest `/core` |
| FR-02b #2 · O4 · AC-01b | `hrm_merge_tokens` origin=`extension_field` | **F-EMP-TOK-03** | **J-HRM-CORE-02B-02** | smoke cite `EMPTOKEXTQA-MSJ57PE1` |
| FR-02b #3 · O11 · AC-01 | EFF defs → form | F-EMP-CF-01 effective | **J-HRM-CORE-02B-02** | mount EFF>0 · display-ready |
| FR-02b #4 · O6 · AC-01c | `custom_fields` invent | **F-EMP-CF-CNS-01** | **J-HRM-CORE-02B-03** | KEY · F5 no persist · `EMPCFQA-MSK14LUH` |
| Empty · O9 · AC-01d | EFF=0 | CNS skip | spot + **P2 HOLD** CTA | soft omit PASS · CTA not mandatory GĐ1 |
| Soft-retire · O7 · AC-01e | status=draft + token | **F-EMP-CF-03** | **J-HRM-CORE-02B-04** | hide picker · history OK |
| O5 · AC-CORE-02B-05 | no `profile_groups_json` | — | inspect SoT | groups+order sufficient · JSON NOT required |
| O8 · AC-CORE-02B-08 | finance catalog ≠ public leak | CORE-02/01 must_keep | J-02B-04 | CB-403 strip |
| O10 · AC-CORE-02B-H | honesty false | — | seal footer | ≠ EMPCF DONE · ≠ 09d printable |
| O1 Nest deny | no `/core` EMP-CF table | physical settings+employees | Network | Nest `/core` 0 |

**scope_parity (U19):** Settings extension list/create/retire **=** employee invent assert consumer — same `resolveHrmListScope` / company catalog partition family (`company_id` + `tenant_id` on extension; employees list/get/PATCH same scope ladder). List returns def id/code → get/assert under group CEO `main` must not 404 scope (`scope_parity`).

---

## 7. Error / integrity mapping (RETAIN — no invent rewrite)

| Physical fail | HTTP / code | Data outcome |
|---------------|-------------|--------------|
| Invent extension code when EFF>0 | 4xx **`HRM-EMP-CUSTOM-FIELD-KEY`** | **no** persist invent · ≠ admin CREATE synonym |
| Admin bad format / UQ | 4xx admin VAL | **no** INSERT dual code |
| Scope mismatch | 409 `HRM-SCOPE-409` | **no** cross-CT |
| ESS outside allow | 403 class | **no** widen |
| EFF=0 invent path | skip assert | soft-empty · **no** fake KEY storm |
| Soft-retire | status=draft + token soft | hide picker · history OK |
| Success CREATE extension | 2xx | row in `hrm_catalog_extension_items` + TOK same-TX |
| Sealed CORE-*/CB-* | — | **DENY** rewrite |

---

## 8. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| ADD `profile_groups_json` / invent as primary layout SoT | O5 gap NOT proven · HOLD |
| Nest `emp_custom_field` / `emp_field_definition` / mega-EAV | O3 · Option A |
| Nest `/core` EMP-CF table or `@Controller('core')` SoT | O1 dual-SoT FAIL |
| Wipe LIVE Settings `hrm_catalog_extension_items` SoT | must_keep EMP-CUSTOM |
| Claim EMPCF L1 / FE mount = CORE-02b / personnel UAT DONE | O10 · C-SLICE |
| Claim CORE-09d printable / closed-8 TPL DONE | O10 · stamp `CORE09DQC1-MSLDR8I3` |
| Flip `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd | honesty lock |
| Reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 without regression | seals |
| Seed defs/values/inbox for U65 | U65 |
| `apps/**` / honesty flip | docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`EMPCFQA-MSK14LUH`** | CNS invent KEY · GAP CLOSED |
| **`EMPTOKEXTQA-MSJ57PE1`** | F-EMP-TOK-03 EXT seal |
| **`CORE09DQC1-MSLDR8I3`** | TPL+clause open catalog · Nest `/core` 0 · **≠ printable** · **≠ closed-8 DONE** |
| **`CORE09CQC1-MSLBXMUT`** | VER/PDF · **≠ printable UAT** |
| **`CORE09BQC1-MSLB05DZ`** | PACK+PREV ephemeral |
| **`CORE09AQC1-MSLA4LX9`** | CL body + snapshot |
| **`CORE08QC1-MSL9BFFE`** | RD dual + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages/eins · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY · `profile_groups_json` OUT |
| LIVE EMP-CF | settings-catalogs* · employees* · extension-items · merge_tokens · custom_fields |
| FE **`R-PLT-EMP-CF-FE-01`** | **P2 HOLD** cite (Option B) |
| Soft-delete · U19 scope_parity | doctrine |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| **`contracts_printable_ready`** | **false** · **DENY** flip |
| **`hrm_personnel_uat_ready`** | **false** · **DENY** flip |
| personnel / CORE / CTR module UAT | **false** |
| **C-SLICE-≠-MODULE** | GWC later ≠ module UAT ≠ personnel ready |
| Claim EMPCF = CORE-02b / personnel DONE | **DENIED** |
| Claim CORE-09d printable / closed-8 DONE | **DENIED** |

---

## 9. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest field-def / mega-EAV | VAL-01 · O3 FAIL · DENY |
| Dev invents `profile_groups_json` primary | VAL-09 · O5 FAIL · HOLD |
| Dual Nest `/core` EMP-CF path | O1 FAIL · Network Nest `/core` 0 |
| Schema unlock without O5 proof | §4.5 HOLD default |
| False DONE from EMPCF L1 / FE mount | §8 honesty · C-SLICE · O10 |
| Reopen CORE-09d as EMP-CF work / claim printable | must_keep `CORE09DQC1-MSLDR8I3` |
| Seed to pass invent KEY | VAL-15 · U65 |
| Misread missing `sort_order` col as O5 unlock JSON | §4.1 note · HOLD ADD sort_order ≠ JSON unlock |

---

## 10. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01`** | **sa** | **HOLD/RETAIN cite** **F-EMP-CF-01..03** · **F-EMP-TOK-03** · **F-EMP-CF-CNS-01/02** on physical `/settings-catalogs*` + `/employees*` · F.1 mục đích + bước SRS · DTO↔DB cols from DATA-01 · lỗi `HRM-EMP-CUSTOM-FIELD-KEY` · U19 scope_parity · **DENY** Nest `/core` dual · **DENY** invent endpoints/schema · **DENY** invent `profile_groups_json` · must_keep CORE-09d..01 · EMPCF/EXT seals — **not** Dev invent |
| Dev-BE | **HOLD** | Unless API residual wire gap proven after API-01 |
| Dev-FE | **P2 HOLD only** | `R-PLT-EMP-CF-FE-01` empty CTA — **≠** promote mandatory GĐ1 · **≠** Nest field-def UI · only after API RETAIN if wire residual |
| QA / QC | After FE (if any) | J-HRM-CORE-02B-01..04 DRAFT · C-SLICE · honesty false · cite EMPCF/EXT |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Physical DATA **CONFIRMED HOLD** for UC-BP-CORE-02b: **RETAIN** LIVE `public.hrm_catalog_extension_items` (cite `catalog_key`·`code`·`label`·`unit`·`status`·`tenant_id`·`company_id`·UQ · soft `status=draft` · AS-IS `ORDER BY code`) + **`public.hrm_merge_tokens`** (`origin=extension_field` · `custom.emp.*` · ring=`custom` · domain=`EMP`) + **`employees.custom_fields`** values + **four allow-list catalogs = groups**; **NO ADD** `profile_groups_json` / Nest `emp_custom_field` / mega-EAV / Nest `/core` table / wipe Settings extension SoT; physical `sort_order` col on extension-items **ABSENT** → **HOLD ADD** (≠ O5 unlock); conditional UNLOCK `profile_groups_json` **NOT** (BA O5 gap not proven); **must_keep** CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest `/core` DENY · EMPCF/EXT seals; FE CTA **P2 HOLD**; **DENY** invent Nest field-def · claim EMPCF=CORE-02b/personnel UAT · claim CORE-09d printable/closed-8 · reopen J-HRM-CORE-09D/09C/09B/09A/08/02/01 · seed · honesty · apps/**; unlock **sa API-01** RETAIN cite F-EMP-CF-* / CNS / TOK — **not** Dev invent. |
| **next_owner** | **sa** |
| **next_dispatch_prompt** | see §12 |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-data-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02b
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · peer CORE09DQC1-MSLDR8I3 must_keep
spec_ref: F-EMP-CF-01..03 · F-EMP-TOK-03 · F-EMP-CF-CNS-01/02 RETAIN cite · physical /settings-catalogs* + /employees* · paper /core alias only · profile_groups_json HOLD invent/OUT · Nest emp_custom_field DENY · Nest /core DENY · four catalogs = groups · DTO↔DB from DATA-01

MISSION — API F.1 lock (docs-only · HOLD/RETAIN):
1) RETAIN cite LIVE GET/POST …/settings-catalogs* (+ :catalogKey/extension-items) + soft-retire + POST/PUT/PATCH /employees* custom_fields — F.1 mỗi fn: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-02b Diễn biến #) · DTO↔DB cols from DATA-01 · lỗi HRM-EMP-CUSTOM-FIELD-KEY · admin format/UQ · HRM-SCOPE-409 · ESS 403
2) LOCK: groups=four catalogs · field-def=extension-items · TOK origin=extension_field same-TX · CNS invent when EFF>0 · U19 scope_parity Settings↔employees · soft-retire status=draft
3) DENY Nest /core dual EMP-CF SoT · DENY invent Nest emp_custom_field endpoints/schema · DENY invent profile_groups_json primary · DENY claim EMPCF = CORE-02b / personnel UAT · DENY claim CORE-09d printable / closed-8 DONE
4) RETAIN must_keep CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · EMPCF/EXT seals
5) Honesty: hrm_personnel_uat_ready=false · contracts_printable_ready=false · C-SLICE · no apps/** · no seed
6) Unlock next: FE P2 HOLD (R-PLT-EMP-CF-FE-01) only if residual — Dev-BE HOLD unless residual wire gap proven — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md · PASS_TO_PM
```

---

*End DATA-01 · Wave-17 CORE-02b · ba-data HOLD · 2026-08-09*
