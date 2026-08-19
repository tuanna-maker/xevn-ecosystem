# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01 — Physical DB · leave accrual / balance **rule schema**

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01` **Option B CONFIRMED** · Nest policy **ABSENT** · ba-data **UNLOCK** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `att_leave_accrual_policy` · **EXPAND** ledger alias + optional `carried_in`/`advanced` notes · **DOC-DELTA** client DB §4.4b · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** `att_leave_type` L1 · CODE/WS/SHIFT · aggregate |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — physical ADD per SA Option B §4–§9 · F-ATT-LVRULE-* |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01` **CONFIRMED** · parallel `…-ATT-LEAVE-BALANCE-BA-01` **in flight** (BE unlock **HOLD** until BA **also** CONFIRMED) |
| **peer_retain** | [`ATT-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) `att_leave_type` — **SEAL RETAIN** · **FORBIDDEN** ALTER invent path / second leave-type table |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) Option B · L-ATT-LVRULE-* · F-ATT-LVRULE-* · AC-PLT-ATT-LEAVE-BAL-01* |
| **ref_peer_catalog** | ATT-LEAVE L1 · ATT-CODE · ATT-WS · ATT-SHIFT — **SEAL RETAIN** · **≠** this rule table |
| **ref_peer_engine** | PAY formula LIVE DENY · F-ATT-LEAVE-04 accrue **HOLD** — **cite ≠ invent LIVE** |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) · R-PLT-DATA-04 · Q-PLT-03 mega-EAV DENY |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B Catalog+Schema · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) |
| **ref_db_client** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§4.4b** |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-ATT-LEAVE-04 outline · F-ATT-LVRULE-* (SA) |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent module ATT UAT · **DENIED** claim accrue engine LIVE · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | Nest `att_leave_type` L1 · F-ATT-CAT-EFF · `HRM-LEAVE-TYPE-UNKNOWN` · `employee_leave_balances` ledger TXN · leave funnel WAIVE/sign · ATT-CODE/WS/SHIFT L1 · FE HOLDs · dual SoT REF `leave_types` merge-read · soft-delete · scope TEXT slug |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.att_leave_accrual_policy` — **ABSENT AS-IS** Nest (SA grep · DB §4.4b name lock) |
| Class | **Schema/CFG** versioned rule SoT — **NOT** reopen leave-type catalog L1 · **NOT** ICatalogRow mega-catalog fold |
| Soft FK | **`leave_type_key` TEXT** → sealed EFF `att_leave_type.leave_type_key` — **no** hard UUID FK GĐ1 · **no** invent type via policy |
| Version / effective | `version` + `effective_from`/`effective_to` + `status` — peer rate-cfg dating · **L-ATT-LVRULE-04** |
| Soft-retire | `status=retired` **and/or** `archived_at` — **FORBIDDEN** hard-delete product path when ledger/history refs |
| Ledger | **RETAIN** Nest `employee_leave_balances` — alias map §4 · optional **EXPAND** `carried_in`/`advanced` — **FORBIDDEN** second ledger / rename wipe |
| Settings / rules | **FORBIDDEN** Settings MD / company-settings KV / `attendance_rules` as sole rule SoT · **FORBIDDEN** dual-write policy from Settings |
| Fold | **FORBIDDEN** second `att_leave_type` · fold into `att_attendance_code` / worksite / shift · mega-EAV |
| Engine | F-ATT-LEAVE-04 accrue job **HOLD LIVE** — schema ≠ engine GO |
| Dev this seat | **NO** `apps/**` · **NO** migrate execute · **NO** seed UF |
| Closes | **R-PLT-ATT-02** physical slice (arch) · R-PLT-DATA-04 ATT **rule schema** residual |
| Honesty | **remain false** — attendance / payroll / module ATT UAT **not** flipped |
| BE unlock | **HOLD** — this DATA **CONFIRMED** · parallel **BA-01** must also **CONFIRMED** before PM unlocks BE |

```text
  Settings leave_types / attendance_rules ──► NOT rule SoT (Option A REJECT)
           │
  att_leave_type (SEALED L1) ──► leave_type_key SoT
           │
           ▼
  att_leave_accrual_policy (ADD · this seat) ──► RULE SoT
           │
           ▼
  employee_leave_balances (RETAIN ledger · optional EXPAND cols)
           │
  F-ATT-LEAVE-04 accrue job ──► HOLD LIVE
  Invent rule ──► HRM-ATT-LVRULE-KEY
  Invent type ──► HRM-LEAVE-TYPE-UNKNOWN (RETAIN)
```

---

## 2. ADD `public.att_leave_accrual_policy`

### 2.1 Columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `leave_type_key` | text | NO | | Soft FK → sealed EFF `att_leave_type.leave_type_key` (or retired-allowed history on read) |
| `version` | int | NO | 1 | Monotonic per `(company_id, leave_type_key)` — admin N+1 versions |
| `effective_from` | date | NO | | Inclusive start of policy window |
| `effective_to` | date | YES | NULL | Exclusive end · NULL = open-ended |
| `accrual_mode` | text | NO | | Locked A3 set (format + allow-list service) — **not** free invent consumer SoT |
| `annual_days` | numeric(6,2) | NO | 0 | Days (or hours when `unit=hour`) granted per year basis — BA locks semantics vs mode |
| `unit` | text | NO | `'day'` | `day` \| `hour` — Q-LEAVE-UNIT |
| `allow_negative` | boolean | NO | false | Advance/borrow when true **and** type `allows_advance` (type flag RETAIN) |
| `carry_over_expire_rule` | text | YES | NULL | e.g. `end_of_q1_next_year` · NULL = no carry expire rule |
| `carry_cap_days` | numeric(6,2) | YES | NULL | Max days that may carry into next period · NULL = no cap |
| `max_balance_days` | numeric(6,2) | YES | NULL | Absolute ceiling on available · NULL = no cap |
| `metadata_json` | jsonb | YES | NULL | Optional component hints (seniority bands, position overrides) — **not** mega-EAV SoT · **not** replace typed columns · engine LIVE **OUT** |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete / audit retire stamp |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |
| `created_by` | uuid | YES | NULL | Optional actor |
| `updated_by` | uuid | YES | NULL | Optional actor |

**Naming lock:** Table name = SA / DB §4.4b **`att_leave_accrual_policy`** — **FORBIDDEN** invent parallel `att_leave_balance_rule` / Settings-only KV as physical SoT.

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ version** | `(company_id, lower(leave_type_key), version) WHERE archived_at IS NULL` |
| **CHK dates** | `effective_to IS NULL OR effective_to > effective_from` |
| **CHK status** | `status IN ('active','retired')` |
| **CHK unit** | `unit IN ('day','hour')` |
| **CHK accrual_mode format** | `accrual_mode ~ '^[a-z][a-z0-9_]*$'` — format; **service allow-list** for A3 modes (`year_start_grant`\|`month_end_accrual`\|`after_6_months`\|…) — **FORBIDDEN** closed CHECK inventing only one mode forever without BA delta |
| **CHK annual_days** | `annual_days >= 0` |
| **CHK caps** | `(carry_cap_days IS NULL OR carry_cap_days >= 0)` · `(max_balance_days IS NULL OR max_balance_days >= 0)` |
| **IX list** | `(company_id, status)` · `(company_id, lower(leave_type_key), version DESC)` |
| **IX resolve effective** | `(company_id, lower(leave_type_key), effective_from DESC) WHERE archived_at IS NULL AND status = 'active'` — **F-ATT-LVRULE-04** |
| **Overlap** | Non-overlapping active windows for same `(company_id, leave_type_key)` — **service enforce** on POST/PATCH (409 conflict) · optional later `EXCLUDE USING gist` — GĐ1 docs = service UQ class |
| **Soft FK type** | Admin write: `leave_type_key` ∈ EFF `att_leave_type` (active) → else **4xx** type membership (BA locks code; class ≠ invent type via policy) |
| **FORBIDDEN** | Hard FK CASCADE wipe type · hard-delete product path · `CHECK leave_type_key IN (…)` closed · mega-EAV · Settings dual-write |

### 2.3 Accrual mode (typed allow-list — not catalog ceiling)

| `accrual_mode` (starter allow-list — BA may EXPAND) | Use |
|------------------------------------------------------|-----|
| `year_start_grant` | Grant `annual_days` at year start |
| `month_end_accrual` | Accrue monthly toward annual |
| `after_6_months` | Vesting after 6 months tenure |
| `manual_only` | No auto grant — admin adjust only |
| `other` | HR-defined — params in typed cols + optional metadata |

**Consumer invent** of unknown mode/`policy_id`/ad-hoc days when active policy set **>0** → **`HRM-ATT-LVRULE-KEY`** (SA L-ATT-LVRULE-05). Admin CREATE of allow-listed mode = **2xx** (L-ATT-LVRULE-01).

### 2.4 Soft-retire / lifecycle

| Transition | Physical | Product path |
|------------|----------|--------------|
| Create | `status=active`, `archived_at NULL`, `version` next | Admin F-ATT-LVRULE-02 |
| Update in place | PATCH accrual fields while window open | F-ATT-LVRULE-03 — BA may restrict mutate after ledger apply |
| Soft-retire | `status=retired` + set `archived_at` (or close `effective_to`) | Default resolve **hides** · history/ledger keep `policy_id` soft ref if stored |
| Hard DELETE | — | **FORBIDDEN** product path when ledger/history/TXN refs |

### 2.5 Resolve effective (consumer read model)

```text
  Input: company_id + leave_type_key + as_of (date)
       │
       ▼
  SELECT … FROM att_leave_accrual_policy
   WHERE company_id IN scope
     AND lower(leave_type_key) = lower(:key)
     AND archived_at IS NULL
     AND status = 'active'
     AND effective_from <= :as_of
     AND (effective_to IS NULL OR effective_to > :as_of)
   ORDER BY version DESC, effective_from DESC
   LIMIT 1
       │
       ▼
  200 row | 200 empty (no seed · L-ATT-LVRULE-07)
```

| Rule | Detail |
|------|--------|
| Scope | list ↔ get-by-id ↔ resolve ↔ CNS assert = **same** `resolveHrmListScope` (**U19** · L-ATT-LVRULE-09) |
| Empty | Valid — CTA admin · soft skip engine — **FORBIDDEN** seed fake policy (U65) |
| ATT wins | Nest policy = rule SoT — Settings/`attendance_rules` **not** consulted as sole |
| Type OOS | Policy row with orphan key blocked on **admin write**; historical resolve may still return retired type key for display |

### 2.6 Dual SoT / REF (EXPAND note — no Settings writer)

| Surface | Role |
|---------|------|
| Nest `att_leave_accrual_policy` | **SoT** accrual/balance **rules** |
| Nest `att_leave_type` | **SoT** type keys (**SEAL RETAIN**) |
| Nest `employee_leave_balances` | **SoT** ledger numbers |
| Settings `leave_types` | **REF** type merge only — **≠** rule SoT · **FORBIDDEN** dual-write policy rows |
| `attendance_rules` | Punch/GPS/standard days — **OUT** as accrual sole |
| F-ATT-LEAVE-04 engine | **HOLD** — not SoT claim this seat |

---

## 3. EXPAND — ledger `employee_leave_balances` (alias · optional columns)

### 3.1 AS-IS Nest (RETAIN — no wipe)

| Physical (Nest LIVE) | Logical DB §4.4b | Note |
|----------------------|------------------|------|
| `public.employee_leave_balances` | `att_leave_balance` | **Alias** — **FORBIDDEN** rename wipe / second ledger table |
| `leave_type` TEXT | `leave_type_key` | Soft key — **EXPAND note** alias; optional later ADD `leave_type_key` generated/alias col = BA+BE delta **not** this seat mandatory |
| `balance_year` INT | `year` | Alias |
| `entitled_days` | `entitled` | Alias |
| `used_days` | `used` | Alias |
| `pending_days` | `held` | Alias (hold while request pending) |
| — | `adjusted` | **ABSENT** AS-IS — optional EXPAND ADD later |
| — | `carried_in` | **ABSENT** AS-IS — **optional EXPAND ADD** when engine/BA prove |
| — | `advanced` | **ABSENT** AS-IS — **optional EXPAND ADD** when type `allows_advance` path proves |

**Derived available (app layer — DB §4.4b):**  
`entitled + carried_in + adjusted − used − held − advanced`  
AS-IS GĐ1 without EXPAND cols: treat missing as **0** → `entitled_days − used_days − pending_days`.

### 3.2 Optional ADD columns (docs unlock — not migrate this seat)

| Cột | Kiểu | Null | Default | When |
|-----|------|------|---------|------|
| `carried_in_days` | numeric(5,1) | NO | 0 | EXPAND when carry_over policy applies |
| `advanced_days` | numeric(5,1) | NO | 0 | EXPAND when advance path applies |
| `adjusted_days` | numeric(5,1) | NO | 0 | EXPAND when grant/adjust UI ships |
| `policy_id` | uuid | YES | NULL | Soft ref → `att_leave_accrual_policy.id` at entitle — **optional** GĐ1.5 |

**FORBIDDEN:** invent parallel `att_leave_balance` / `att_leave_hold` tables that wipe Nest ledger · claim hold table mandatory before BA proves ATT-09 path.

### 3.3 `att_leave_hold` (OUT / pointer)

DB §4.4b names hold entity — Nest may use `pending_days` on ledger **AS-IS**. Dedicated hold table = **OUT** this DATA seat unless BA-01 AC requires — **HOLD** physicalize.

---

## 4. DTO ↔ column map stubs (F-ATT-LVRULE-*)

| Cap ID | DTO field (wire) | Column | Notes |
|--------|------------------|--------|-------|
| **F-ATT-LVRULE-01** List | `id` | `id` | display-ready + join `name_vi` from EFF type |
| | `companyId` / scope | `company_id` | |
| | `leaveTypeKey` | `leave_type_key` | |
| | `version` | `version` | |
| | `effectiveFrom` / `effectiveTo` | `effective_from` / `effective_to` | ISO date |
| | `accrualMode` | `accrual_mode` | |
| | `annualDays` | `annual_days` | |
| | `unit` | `unit` | |
| | `allowNegative` | `allow_negative` | |
| | `carryOverExpireRule` | `carry_over_expire_rule` | |
| | `carryCapDays` | `carry_cap_days` | |
| | `maxBalanceDays` | `max_balance_days` | |
| | `status` | `status` | default list hides `retired` unless `include_inactive` |
| | `archivedAt` | `archived_at` | |
| **F-ATT-LVRULE-02** Create | body same open fields | INSERT | Validate type ∈ EFF · window non-overlap · **admin N+1** |
| **F-ATT-LVRULE-03** PATCH/retire | partial + `status` | UPDATE | Soft-retire class |
| **F-ATT-LVRULE-04** Effective | query `leave_type_key`, `as_of` | resolve IX | 200 empty OK |
| **F-ATT-LVRULE-CNS-01** | invent `policyId` / ad-hoc mode|days | — | **400 `HRM-ATT-LVRULE-KEY`** when active>0 |
| Type invent (RETAIN) | `leave_type` on TXN | — | **400 `HRM-LEAVE-TYPE-UNKNOWN`** ≠ LVRULE |
| **F-ATT-LEAVE-04** | accrue job | policy → ledger | **HOLD LIVE** — OUT GO |
| **F-ATT-LEAVE-BAL-*** | panel/ledger GET | `employee_leave_balances` | **RETAIN** |

**Path naming:** `/api/hrm/attendance/leave-accrual-policies` — **FORBIDDEN** invent `/api/hrm/platform/att/*` dual writer.

---

## 5. Validation matrix

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-LVRULE-01** | Admin CREATE bound to EFF `leave_type_key` | Soft FK membership | **201** persist |
| **VAL-ATT-LVRULE-02** | Admin CREATE orphan type key | Not in EFF | **4xx** type membership (BA code) |
| **VAL-ATT-LVRULE-03** | Admin CREATE overlapping active window same type | Service overlap | **409** conflict |
| **VAL-ATT-LVRULE-04** | Admin CREATE next `version` | UQ `(company, key, version)` | **201** N+1 |
| **VAL-ATT-LVRULE-05** | Consumer invent `policy_id` / ad-hoc days when active>0 | L-ATT-LVRULE-05 | **400 `HRM-ATT-LVRULE-KEY`** |
| **VAL-ATT-LVRULE-06** | Admin CREATE ≠ invent | L-ATT-LVRULE-01 | Admin **2xx** · consumer **4xx** split |
| **VAL-ATT-LVRULE-07** | Soft-retire | `status=retired` + `archived_at` | Resolve default hides · ledger OK |
| **VAL-ATT-LVRULE-08** | Hard DELETE with ledger ref | — | **FORBIDDEN** |
| **VAL-ATT-LVRULE-09** | List vs get-by-id vs resolve OOS | scope_parity U19 | 404/403 — not empty mask |
| **VAL-ATT-LVRULE-10** | Active policy count=0 | L-ATT-LVRULE-07 | **200** empty · no seed |
| **VAL-ATT-LVRULE-11** | Leave TXN invent type | RETAIN ATT-LEAVE | **400 `HRM-LEAVE-TYPE-UNKNOWN`** |
| **VAL-ATT-LVRULE-12** | Settings-only policy write | L-ATT-LVRULE-02 | **REJECT** as SoT |
| **VAL-ATT-LVRULE-13** | Accrue engine LIVE claim from this wave | L-ATT-LVRULE-08 | **DENIED** |
| **VAL-ATT-LVRULE-CNS-01** | Mutate invent rule params | CNS | 4xx LVRULE-KEY |
| **VAL-ATT-LVRULE-CNS-02** | Admin N+1 vs consumer invent | Split | Admin 2xx · consumer 4xx |
| **VAL-ATT-LVRULE-CNS-03** | Scope list ≠ resolve | jest scope_parity | FAIL on drift |

---

## 6. Traceability

| Requirement | DB | API (SA) | FE (later) | Test |
|-------------|-----|----------|------------|------|
| AC-PLT-ATT-LEAVE-BAL-01 Nest SoT | §2 ADD | F-ATT-LVRULE-01..04 | Settings/ATT CFG | U65 browser |
| AC-…-01b invent KEY | — | CNS-01 | grant/leave | VAL-05/CNS-01 |
| AC-…-01c empty no seed | resolve empty | F-ATT-LVRULE-04 | CTA | VAL-10 · U65 |
| AC-…-01d admin N+1 | INSERT | F-ATT-LVRULE-02 | admin | VAL-01/04 |
| AC-…-01e soft-retire | `status`/`archived_at` | F-ATT-LVRULE-03 | picker hide | VAL-07 |
| AC-…-01f type invent RETAIN | sealed type | leave TXN | — | VAL-11 |
| AC-…-01g panel ⊆ EFF/policy | ledger RETAIN | F-ATT-LEAVE-BAL-* | panel | BA deepen |
| AC-…-01H honesty | — | — | — | flags false |
| BR-PLT-02/04/05 | soft FK · soft-delete · open | F-ATT-LVRULE-* | — | VAL-* |
| R-PLT-ATT-02 | §2 | CRUD | — | this seat closes physical |
| L-ATT-LVRULE-08 engine HOLD | — | F-ATT-LEAVE-04 | — | no LIVE claim |
| J-* (BA enumerate) | §2 | LVRULE | Settings·leave·panel | QA later |
| scope_parity U19 | IX + service | list/detail/resolve | deep link | VAL-09/CNS-03 |

---

## 7. DOC-DELTA — client DB §4.4b (ADD-only pointer)

| Action | Content |
|--------|---------|
| **CONFIRM** | Physical SoT file = this DATA-01 · table **`att_leave_accrual_policy`** |
| **EXPAND** | Columns version/effective/caps/`archived_at` beyond sketch §4.4b — **ADD-only** · no wipe type §4.4 / funnel §4.5a |
| **ALIAS** | Logical `att_leave_balance` → Nest **`employee_leave_balances`** |
| **RETAIN** | `att_leave_type` L1 · attendance_records funnel · sheet/sign · CODE/WS/SHIFT |
| **OUT** | Hard-delete · Settings dual-write · mega-EAV · engine LIVE · second leave-type table |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` |
| **Do not** | Migrations / `apps/**` this seat |
| **Next** | BA-01 CONFIRMED → PM unlock **BE** F-ATT-LVRULE-* ensureSchema |

---

## 8. Explicit FORBIDDEN (this seat)

| FORBIDDEN | Rule |
|-----------|------|
| Migration SQL execute / `apps/**` / seed | Docs-only · U65 |
| Reopen `att_leave_type` L1 invent path | SEAL RETAIN · ALTER invent columns for «balance» on type = **REJECT** |
| Second leave-type table | — |
| Fold into `att_attendance_code` / worksite / shift | — |
| Settings dual-write SoT / `attendance_rules` sole | Option A REJECT |
| Mega-EAV / platform mega catalog | Q-PLT-03 |
| Wipe ledger / invent second balance mega table | — |
| Claim accrue engine LIVE / flip ready / module ATT UAT | Honesty |
| Invent FE HOLDs (ATT-CODE FE · ATT-SHIFT CNS-02) | RETAIN Conditions |
| Aggregate / LIST-TOTALS rewrite | SEAL RETAIN |

---

## 9. Residual

| ID | Item | Owner |
|----|------|-------|
| R-ATT-LVRULE-BA | AC pack AC-PLT-ATT-LEAVE-BAL-01* CONFIRMED | ba-process (parallel) |
| R-ATT-LVRULE-BE | ensureSchema + F-ATT-LVRULE-* + CNS KEY | dev-be **HOLD** until BA+DATA |
| R-ATT-LVRULE-LEDGER | Optional EXPAND `carried_in`/`advanced`/`policy_id` | ba-process prove → BE |
| R-ATT-LVRULE-HOLD | Dedicated `att_leave_hold` vs `pending_days` | BA/SA follow-on |
| R-ATT-LVRULE-ENGINE | F-ATT-LEAVE-04 LIVE + Q-LEAVE-ACCRUAL | dedicated wave — **OUT** |
| R-ATT-LVRULE-PANEL | Kill MVP five hardcode as sole SoT | BA-01 / FE after BE |
| R-ATT-LVRULE-DOC | Client API DOC-DELTA append | ba-docs after BE |

---

## 10. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-data-01.md` |
| **next_owner** | **pm** (gate BA+DATA then BE) |
| **completion_report** | CONFIRMED physical ADD `public.att_leave_accrual_policy` (version/effective dating, soft FK `leave_type_key` → sealed `att_leave_type`, accrual fields + caps, soft-retire, UQ/IX resolve); EXPAND ledger alias map + optional carried_in/advanced; DTO↔column F-ATT-LVRULE-*; FORBIDDEN second leave-type / ATT-CODE fold / Settings dual-write / engine LIVE / seed / flip ready; BE HOLD until BA also CONFIRMED; honesty false; no apps/**. |
