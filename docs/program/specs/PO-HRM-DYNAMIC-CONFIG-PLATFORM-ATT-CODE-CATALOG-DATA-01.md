# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01 — Physical DB · ATT attendance-code (ký hiệu công) catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01` **Option B CONFIRMED** · Nest **ABSENT** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `att_attendance_code` · **EXPAND** `attendance_records.status` open-key note · **DOC-DELTA** client DB §4.4d + §4.5a · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** ATT leave / work-sites / sign · EMP/SI/CTR · **no** rewrite `att-timesheet-line-aggregate` |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — physical ADD per SA Option B §4–§6 · F-ATT-CAT-CODE-* |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01` **CONFIRMED** · parallel `…-ATT-CODE-CATALOG-BA-01` **in flight** (BE unlock **HOLD** until BA **also** CONFIRMED) |
| **peer_retain** | [`ATT-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) §2 `att_leave_type` — **RETAIN** · [`ATT-WORKSITE-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md) §4.4c — **RETAIN** · **FORBIDDEN** fold day-code into leave / work-sites / shifts |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) Option B · L-ATT-CODE-* · F-ATT-CAT-CODE/EFF · F-ATT-CODE-CNS-* · AC-PLT-ATT-CODE-01* |
| **ref_peer_emp_status** | [`EMP-STATUS-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md) — **closest structural peer** (DEFINE new Nest catalog + typed flags + semantics stay code) |
| **ref_peer** | [`ATT-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) · [`ATT-WORKSITE-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md) · [`EMP-STATUS-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md) |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · Q-PLT-03 mega-EAV DENY · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) D1 `work_shifts` ops lock |
| **ref_db_client** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4 leave · §4.4c work-sites · §4.5a `attendance_records.status` |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent module ATT UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | `attendance_records.status` text column · `att_leave_type` leave sub-type SoT · `attendance_work_sites` · `work_shifts` ops · sheet/sign spine · soft-delete · scope TEXT slug · open catalog no closed status enum ceiling · display-ready `symbol`/`status_label` · `att-timesheet-line-aggregate` counting code GĐ1 sealed |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.att_attendance_code` — **ABSENT AS-IS** Nest (grep empty vs leave/work-sites LIVE) |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV · **not** fold into `att_leave_type` / `attendance_work_sites` / `work_shifts` · **not** Settings MD sole SoT |
| Open catalog | **`code`** format-only CHK — **FORBIDDEN** closed enum CHECK / restore DTO `@IsIn(['pending','present','absent','leave'])` product ceiling |
| Typed flags (GĐ2 metadata) | Physical columns `counts_as` / `day_weight` / `is_paid` / `is_present` — **FORBIDDEN** rewrite `att-timesheet-line-aggregate` this seat (**L-ATT-CODE-07**) |
| Dual SoT | Future Settings partition **`attendance_codes`** = group **REF** merge-read only — tenant Nest writer **wins** (**BR-PLT-06** · L-ATT-CODE-03) — Settings **≠** sole producer |
| Soft-delete | `status=retired` + `archived_at` — history `attendance_records` may keep retired codes (**BR-PLT-04** · L-ATT-CODE-11) |
| Consumer column | **EXPAND** `attendance_records.status` — keep **text** soft key (day-code); **drop** closed product CHECK/DTO ceiling; validate ∈ EFF when count>0 → **`HRM-ATT-CODE-KEY`** (alias `HRM-ATT-CODE-UNKNOWN`) |
| Peer leave / work-sites | **§4.4 / §4.4c RETAIN** — **FORBIDDEN** wipe / reopen / fold |
| Seals | ATT leave · ATT work-sites · sign / J-HRM-06c · EMP dept/pos/status/custom/token-ext · SI · CTR · PAY/LIST-TOTALS **RETAIN** |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** ATT **attendance-code** catalog slice (leave / work-sites slices remain CLOSED separately) |
| Honesty | **remain false** — attendance / payroll / module ATT UAT **not** flipped |
| BE unlock | **HOLD** — this DATA **CONFIRMED** · parallel **BA-01** must also **CONFIRMED** before PM unlocks BE |

---

## 2. ADD `public.att_attendance_code`

### 2.1 Columns (`ICatalogRow` + typed day-code flags)

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — same `resolveHrmListScope` (**U19**) |
| `code` | text | NO | | Open catalog day-code key — format `^[a-z][a-z0-9_]*$`; **UQ / assert normalize `lower(code)`** — stores consumer `attendance_records.status` value |
| `name_vi` | text | NO | | UI label (display-ready → `status_label`) |
| `symbol` | text | NO | | Ký hiệu công (e.g. `X`, `V`, `P`, `CT`, `½`, `WFH`, `L`, `KL`) — display-ready |
| `sort_order` | int | NO | 100 | Picker / Settings tab order |
| `counts_as` | text | NO | `'other'` | Typed semantic class — see §2.3 (**≠** key ceiling) |
| `day_weight` | numeric(4,2) | NO | 1 | Day fraction for future aggregate (1 / 0.5 …) — **GĐ2 wiring only** |
| `is_paid` | boolean | NO | true | Paid class hint for GĐ2 — **≠** rewrite leave unpaid path this seat |
| `is_present` | boolean | NO | false | Present-like display/filter class — **≠** force aggregate `present` branch this seat |
| `color` | text | YES | NULL | Optional badge/UI hint (hex or token) — not SoT |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Optional aliases → canonical `code` (FE bootstrap map e.g. `on_leave`→`leave`, `early_leave`) |
| `metadata_json` | jsonb | YES | NULL | Optional hints — **not** mega-EAV SoT · **not** replace typed flags |
| `status` | text | NO | `'active'` | Row lifecycle `active` \| `retired` (**≠** attendance day-code `code`) |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

**Note:** Typed flags are **catalog metadata** for **GĐ2** aggregate/payroll wiring. **FORBIDDEN** claim this DATA seat rewires `att-timesheet-line-aggregate` present→standard / leave→paid|unpaid (**L-ATT-CODE-07**). Counting semantics remain **sealed code** GĐ1.

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(code)) WHERE archived_at IS NULL` |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` — **F-ATT-CAT-CODE-EFF-01** resolution |
| **IX flags** | `(company_id, counts_as)` · `(company_id, is_present)` optional for picker filters |
| **CHK `chk_att_att_code_format`** | `code ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_att_att_code_symbol`** | `char_length(trim(symbol)) BETWEEN 1 AND 16` — display ký hiệu; **not** closed enum |
| **CHK `chk_att_att_code_counts_as`** | `counts_as IN ('work','paid_leave','unpaid_leave','holiday','absent','other')` — typed class (**≠** `code` ceiling) |
| **CHK `chk_att_att_code_day_weight`** | `day_weight > 0 AND day_weight <= 1` — GĐ1 range; BA may widen later |
| **CHK `chk_att_att_code_row_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (code IN ('pending','present','absent','leave',…))` · restore Nest DTO `@IsIn(4)` as product ceiling · hard-delete when `attendance_records` history references code · mega-EAV · fold into `att_leave_type` / `attendance_work_sites` / `work_shifts` |

### 2.3 `counts_as` typed class (not key ceiling)

| `counts_as` | Use (metadata · GĐ2) |
|-------------|----------------------|
| `work` | Ngày công / present-like for future standard hours |
| `paid_leave` | Nghỉ có lương class |
| `unpaid_leave` | Nghỉ không lương class |
| `holiday` | Ngày lễ / nghỉ lễ |
| `absent` | Vắng |
| `other` | HR-defined open class |

**Clarify:** `code` values like `present` / `leave` / `business_trip` remain **open keys**. `counts_as` classifies semantics — **does not** limit which codes admin may CREATE (**BR-PLT-05**).

### 2.4 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `code` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | `symbol` + typed flags (`counts_as`/`day_weight`/`is_paid`/`is_present`) + `sort_order`/`color` (+ optional alias/meta JSON) |
| `catalog_kind` | `att_attendance_code` (adapter constant) |

### 2.5 Dual SoT — effective attendance-code catalog (read model)

```text
  (future) Settings attendance_codes ──► group REF merge-read only
           │
  F-ATT-CAT-CODE CRUD ──► public.att_attendance_code (code SoT)  [ADD physical]
           │
           ▼
  F-ATT-CAT-CODE-EFF-01 effective
           │  (ATT native row wins on same code)
           ▼
  Consumers (when count>0): attendance_records.status ∈ catalog
    · POST/PATCH attendance_records.status — F-ATT-CODE-CNS-01 · HRM-ATT-CODE-KEY
    · display symbol / status_label from catalog (OS 28) — hardcode map only EFF=0 bootstrap
  counting aggregate ──► SEALED CODE GĐ1 (flag wiring = GĐ2 residual)
  att_leave_type / work_sites / work_shifts ──► OUT this seat
```

| Rule | Detail |
|------|--------|
| Writer | Only **`att_attendance_code`** for tenant mutate — **FORBIDDEN** write Settings REF partition via attendance-code catalog API |
| Consumer | Keys ∈ **effective** when catalog **>0** (**BR-PLT-02** · **AC-PLT-ATT-CODE-01**) |
| Collision | Same key: ATT native overrides REF label/flags/symbol (`source=att_override`) |
| Empty | `[]` = valid **200** — soft skip invent + CTA Settings · **no seed** (**L-ATT-CODE-06** · U65) |
| Normalize | Assert / UQ: `lower(code)` |
| Settings REF | Future partition **`attendance_codes`** — merge-read only; **not** sole SoT (**Option A REJECT** · L-ATT-CODE-03) |
| Error invent | Catalog ≠ empty ∧ key ∉ effective → **`HRM-ATT-CODE-KEY`** (alias `HRM-ATT-CODE-UNKNOWN`) — cite SA §6.2 |
| Orthogonal | **`leave_type_key` ≠ `code`** — leave sub-type SoT ≠ day-code SoT (**L-ATT-CODE-08**) |
| Symbol vs code | `symbol` = display ký hiệu (`CT`, `½`); `code` = slug key (`business_trip`, `half_day`) — consumer stores **`code`**, not free-text symbol |

### 2.6 Bootstrap starter keys (docs only — Dev ensure later)

| `code` | Example `symbol` | Example `counts_as` | Note |
|--------|------------------|---------------------|------|
| `pending` | `—` | `other` | Bootstrap default create |
| `present` | `X` | `work` | Aggregate sealed reads `present` GĐ1 |
| `absent` | `V` | `absent` | |
| `leave` | `P` | `paid_leave` | Leave day-code · unpaid via leave sub-type path GĐ1 |
| `business_trip` | `CT` | `work` | Admin N+1 class |
| `half_day` | `½` | `work` | `day_weight=0.5` |
| `wfh` | `WFH` | `work` | |
| `holiday` | `L` | `holiday` | |
| `unpaid` | `KL` | `unpaid_leave` | |

= **bootstrap upsert** when ensure runs — **not** product ceiling · **not** UF evidence (U65) · **FORBIDDEN** as CHECK `IN (...)`.

FE AS-IS divergent keys `early_leave` / `on_leave` → resolve via `legacy_alias_keys_json` or BA rename to open catalog codes — **not** restore DTO closed IsIn.

### 2.7 Cap → column map

| Cap | Columns / indexes used |
|-----|------------------------|
| **F-ATT-CAT-CODE-01** list/admin | All §2.1 · IX list · scope `company_id` · display `symbol`/`name_vi` |
| **F-ATT-CAT-CODE-02** POST CREATE N+1 | Mutate `code`/`name_vi`/`symbol`/typed flags · UQ partial · format CHK |
| **F-ATT-CAT-CODE-03** PATCH | Metadata/flags — **no** wipe consumer history codes |
| **F-ATT-CAT-CODE-04** soft-retire | `status`+`archived_at` |
| **F-ATT-CAT-CODE-EFF-01** effective | IX effective · dual-SoT merge REF |
| **F-ATT-CODE-CNS-01** consumer | `attendance_records.status` ∈ EFF when count>0 → else **`HRM-ATT-CODE-KEY`** |
| **F-ATT-CODE-CNS-02** display | Prefer catalog symbol/label; hardcode map only EFF=0 |
| **F-ATT-CODE-CNS-03** aggregate | **OUT** rewrite this seat — flags physical only |

---

## 3. EXPAND consumer — `attendance_records.status` + DOC-DELTA CHECK/DTO

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `attendance_records` | `status` | **Keep text column** — stores open catalog **`code`** (day-code); validate ∈ **F-ATT-CAT-CODE-EFF-01** when catalog **>0** → else **`HRM-ATT-CODE-KEY`**; history **may** hold **retired** codes (**BR-PLT-04**); display `symbol`/`status_label` from catalog when known (**L-ATT-CODE-13**) |
| Nest DDL / DTO AS-IS | Closed `CHECK (status IN ('pending','present','absent','leave'))` and/or DTO `@IsIn([...])` | **DROP / REPLACE** closed product ceiling (**BR-PLT-05** · L-ATT-CODE-04). Allowed residual: format-only soft validate at service layer; **no** `CHECK IN (N keys)` / closed `IsIn` product restore |
| Soft FK | text soft key | **no** hard FK to `att_attendance_code.id` GĐ1 |
| Settings items | future `attendance_codes` | Group REF — merge-read only (**L-ATT-CODE-03**) — **not** sole producer |
| `att_leave_type` | leave sub-type | **§4.4 RETAIN** — **FORBIDDEN** fold; day-code `leave` may still carry `leave_type_key` funnel snapshot |
| `attendance_work_sites` / `work_shifts` | geofence / ops | **RETAIN** — **FORBIDDEN** fold |
| Aggregate / payroll | `att-timesheet-line-aggregate` · LIST-TOTALS | **SEALED CODE** GĐ1 — flag wiring **GĐ2 residual** |

**AS-IS cite (do not treat as Nest attendance-code SoT):**

- BE `CreateAttendanceRecordDto.status` `@IsIn(['pending','present','absent','leave'])`
- BE `AttendanceService.createRecord` — no catalog assert
- FE `AttendanceRecordsTable` hardcode label/badge + richer Select keys (`early_leave`/`on_leave` divergent)
- Aggregate hardcoded `status==='present'` / `status==='leave'`

---

## 4. Explicitly **OUT** this DATA seat

| Item | Rule |
|------|------|
| Mega-EAV / one ATT table for code+leave+work-sites+shifts | **REJECT** (SA Option C · ADR Q-PLT-03 · **L-ATT-CODE-14**) |
| Fold into `att_leave_type` / `attendance_work_sites` / `work_shifts` / EMP status | **FORBIDDEN** |
| Wipe ATT leave / work-sites / sign / J-HRM-06c seals | **FORBIDDEN** |
| Reopen EMP dept/pos/status/custom/token-ext · SI · CTR · PAY/DEC/REC/LIST-TOTALS | **FORBIDDEN** |
| Rewrite `att-timesheet-line-aggregate` / payroll counting | **FORBIDDEN** this seat (**L-ATT-CODE-07**) |
| Seed / migrate execute / `apps/**` | **FORBIDDEN** this seat |
| Flip `attendance_uat_ready` / `payroll_e2e_ready` | **FORBIDDEN** |
| Invent module ATT UAT / Phase1 DONE | **FORBIDDEN** · **`C-SLICE-≠-MODULE`** |
| AC click-path pack | parallel **ba-process** BA-01 |
| ensureSchema + F-ATT-CAT-CODE + CNS KEY + DROP closed IsIn/CHECK | **dev-be** **after BA+DATA both CONFIRMED** |
| FE picker rebind / reconcile divergence | **dev-fe** after BE |

---

## 5. Validation matrix (physical)

### 5.1 Catalog CRUD — VAL-ATT-CODE-CAT-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-CODE-CAT-01** | Create key `business_trip` / `wfh` (N+) | No enum ceiling | **201** / persist — **AC-PLT-ATT-CODE-01d** · **BR-PLT-05** |
| **VAL-ATT-CODE-CAT-02** | Active duplicate `lower(code)` same company | UQ partial | **409** `HRM-PLT-CAT-CODE-CONFLICT` |
| **VAL-ATT-CODE-CAT-03** | Invalid slug (spaces / leading digit / UPPER / `1/2` as code) | Format only — use `half_day` + symbol `½` | **400** `HRM-PLT-CAT-CODE-INVALID` |
| **VAL-ATT-CODE-CAT-04** | Retire with existing attendance_records rows | Soft-delete | Picker hide; history code OK — **BR-PLT-04** · **AC-PLT-ATT-CODE-01e** |
| **VAL-ATT-CODE-CAT-05** | Hard-delete attempt | Forbidden | **4xx/405** — no hard delete |
| **VAL-ATT-CODE-CAT-06** | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask — **L-ATT-CODE-12** |
| **VAL-ATT-CODE-CAT-07** | Mutate group REF via attendance-code catalog API | Writer lock | **FORBIDDEN** |
| **VAL-ATT-CODE-CAT-08** | `metadata_json` only as SoT | Typed flags first | Flags from columns — meta ≠ code SoT |
| **VAL-ATT-CODE-CAT-09** | Effective active =0 | Empty EFF | **200** `[]` — invent skip + CTA — **AC-PLT-ATT-CODE-01c** · **no seed** |
| **VAL-ATT-CODE-CAT-10** | `counts_as` invalid value | Typed CHK | **400** — class enum only |
| **VAL-ATT-CODE-CAT-11** | `day_weight` ≤0 or >1 | Range CHK GĐ1 | **400** |
| **VAL-ATT-CODE-CAT-12** | Empty / oversized `symbol` | Symbol CHK | **400** |

### 5.2 Consumer — VAL-ATT-CODE-CNS-*

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-CODE-CNS-01** | Record invent `status` when catalog >0 | **BR-PLT-02** · **AC-PLT-ATT-CODE-01b** | **400** `HRM-ATT-CODE-KEY` |
| **VAL-ATT-CODE-CNS-02** | List picker scope ≠ assert scope | scope_parity | jest **FAIL** |
| **VAL-ATT-CODE-CNS-03** | History record with retired code | **BR-PLT-04** | Display symbol/label fallback OK — no crash |
| **VAL-ATT-CODE-CNS-04** | Format-only valid code ∉ effective | Membership required | **4xx** KEY — format ≠ membership |
| **VAL-ATT-CODE-CNS-05** | Alias in `legacy_alias_keys_json` (e.g. `on_leave`) | Resolve → canonical | **2xx** store/assert canonical |
| **VAL-ATT-CODE-CNS-06** | Confuse `leave_type_key` with day-code `code` | Separate SoTs | Invent leave type ≠ pass day-code assert |
| **VAL-ATT-CODE-CNS-07** | Closed `IsIn`/CHECK still present after ensure | DOC-DELTA | jest / migrate assert **FAIL** until DROP |
| **VAL-ATT-CODE-CNS-08** | Admin CREATE N+1 treated as invent | L-ATT-CODE-01 | Admin **2xx**; invent only on consumer |

### 5.3 Dual SoT / scope / aggregate lock

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-CODE-ALS-01** | Group REF + ATT same `code` | effective read | ATT row wins (tenant) — **BR-PLT-06** |
| **VAL-ATT-CODE-ALS-02** | Settings MD alone as sole picker SoT | Option A | **REJECT** — Nest EFF required when live |
| **VAL-ATT-CODE-SCP-01** | list ↔ get-by-id ↔ consumer assert | Scope parity U19 | Member **409**/404 on foreign company |
| **VAL-ATT-CODE-AGG-01** | Wave claims aggregate rewrite from flags | L-ATT-CODE-07 | **FAIL** process — GĐ2 residual only |

---

## 6. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| **AC-PLT-ATT-CODE-01** picker EFF | §2 ADD | **F-ATT-CAT-CODE-EFF-01** | Chấm công record status | U65 browser |
| **AC-PLT-ATT-CODE-01b** invent | effective keys | **F-ATT-CODE-CNS-01** | form | VAL-ATT-CODE-CNS-01 |
| **AC-PLT-ATT-CODE-01c** empty | §2.5 empty | EFF `[]` | empty + CTA | VAL-ATT-CODE-CAT-09 · U65 |
| **AC-PLT-ATT-CODE-01d** admin N+1 | §2 ADD | **F-ATT-CAT-CODE-02** | Settings / Nest list | VAL-ATT-CODE-CAT-01 |
| **AC-PLT-ATT-CODE-01e** soft-retire | `archived_at` | CODE-04 | picker hide | VAL-ATT-CODE-CAT-04 |
| **AC-PLT-ATT-CODE-01f** display | `symbol`/`name_vi` | CNS-02 | catalog label | reconcile FE divergence |
| **AC-PLT-ATT-CODE-01H** honesty | — | — | — | flags false · seals retain |
| **F-ATT-CAT-CODE-01** list | §2 | `GET …/attendance-codes` | Settings | jest CRUD |
| **F-ATT-CAT-CODE-EFF-01** | §2.5 + IX effective | `GET …/effective` | picker | VAL-ATT-CODE-ALS-* |
| **BR-PLT-02** | consumer keys | EFF assert | — | VAL-ATT-CODE-CNS-* |
| **BR-PLT-04** | soft-delete | retire | — | VAL-ATT-CODE-CAT-04 |
| **BR-PLT-05** | no enum CHECK | slug format only · DROP closed IsIn | — | VAL-ATT-CODE-CAT-01 · CNS-07 |
| **BR-PLT-06** | dual SoT | EFF-01 | — | VAL-ATT-CODE-ALS-01 |
| scope_parity U19 | `company_id` TEXT | list=get=mutate=assert | deep link | VAL-ATT-CODE-SCP-01 · CAT-06 |
| Peer leave / work-sites | §4.4 / §4.4c RETAIN | F-ATT-CAT-LVT/WS | — | **FORBIDDEN** reopen |
| Aggregate seal | flags physical only | CNS-03 OUT rewrite | — | VAL-ATT-CODE-AGG-01 |

---

## 7. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md` (ADD-only · no_prompt_echo)

| Action | Content |
|--------|---------|
| **ADD** | §4.4d `att_attendance_code` physical — open `code` · `symbol` · typed flags · UQ partial · dual SoT · **FORBIDDEN** closed key CHECK |
| **EXPAND** | §4.5a `attendance_records.status` — open catalog key · validate ∈ EFF when >0 · history may hold retired · **DROP/REPLACE** closed Nest CHECK / DTO `IsIn` ceiling |
| **EXPAND** | §1.1 ER — attendance-code catalog validates record day-code |
| **EXPAND** | §4.4 peer pointer — day-code ≠ leave_type (no wipe leave) |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01` |
| **Cấm** | Wipe §4.4 leave · §4.4c work-sites · sheet/sign · EMP/SI/CTR · prompt-echo chat into client prose · claim aggregate rewrite |

API_DESIGN F-ATT-CAT-CODE-* append = **ba-docs** residual after BA — not blocking DATA CONFIRMED; **BE HOLD** until BA AC pack CONFIRMED.

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-ATT-CODE-01 | AC pack consumer UF/J-* · leave≠day-code wording · counting stay code | **ba-process** BA-01 (parallel in flight) |
| R-PLT-ATT-CODE-02 | ensureSchema ADD table + DROP closed status CHECK/DTO IsIn + Nest F-ATT-CAT-CODE + CNS KEY | **dev-be** after **BA+DATA** both CONFIRMED |
| R-PLT-ATT-CODE-03 | FE picker rebind Nest EFF — deprecate hardcode sole SoT when EFF>0 · reconcile `early_leave`/`on_leave` | **dev-fe** after BE |
| R-PLT-ATT-CODE-04 | Client API DOC-DELTA F-ATT-CAT-CODE/EFF | **ba-docs** |
| R-PLT-ATT-CODE-05 | GĐ2 wire `counts_as`/`day_weight`/`is_paid` into `att-timesheet-line-aggregate` / LIST-TOTALS | **separate wave** — **FORBIDDEN** this seat |

---

## 9. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `att_attendance_code` + partial UQ + format/symbol/counts_as/day_weight/row-status CHKs + effective IX — **omit** closed `code IN (...)` CHECK · **DROP/REPLACE** closed `attendance_records.status` product CHECK if present · **omit** hard FK on `status` · **omit** touching leave/work-sites/aggregate DDL |
| Feature flag | When attendance-code catalog empty (0): invent assert **skip** + CTA; hardcode label map bootstrap OK — when **>0**: Nest EFF mandatory (**BR-PLT-02**) · FE **FORBIDDEN** hardcode sole SoT |
| Builtin ensure | Optional upsert starter keys §2.6 — **not** UF evidence (U65) |
| Nest paths | Under attendance module: `GET/POST/PUT/PATCH/retire` `/api/hrm/attendance/attendance-codes*` · EFF helpers — **FORBIDDEN** invent mega `/api/hrm/platform/att/*` EAV |
| Assert | Record create/update `status` → Nest EFF when count>0 |
| Peer pattern | Mirror `att_leave_type` / `emp_employment_status` / `si_insurer` ensureSchema style — **separate** table |
| Aggregate | **Do not** change `att-timesheet-line-aggregate.ts` this BE wave unless separate GĐ2 warrant |
| Unlock gate | **BA CONFIRMED + this DATA CONFIRMED** → PM may unlock BE — DATA alone **≠** BE start |

---

## 10. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `attendance_uat_ready` | **false** · **DENIED** flip |
| `payroll_e2e_ready` | **false** · **DENIED** flip |
| Module ATT UAT / Phase1 | **DENIED** invent · **`C-SLICE-≠-MODULE`** |
| ATT leave §4.4 + ATT-DATA-01 | **RETAIN** — **cấm** reopen / fold |
| ATT work-sites §4.4c + WORKSITE-DATA-01 | **RETAIN** — **cấm** reopen / fold |
| Sheet/sign / J-HRM-06c / WAIVE | **RETAIN** |
| EMP dept/pos/status/custom/token-ext · SI · CTR | **RETAIN** |
| PAY / LIST-TOTALS / aggregate counting code | **RETAIN** sealed GĐ1 |
| Seed | **DENIED** (U65) |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-data-01.md` |
| **next_owner** | **pm** — hold **dev-be** until parallel **BA-01 CONFIRMED**; then unlock `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01` |
| **completion_report** | CONFIRMED physical ADD `public.att_attendance_code` (open `code`, `symbol`, partial UQ lower(code), soft-delete `archived_at`, ICatalogRow + typed GĐ2 flags `counts_as`/`day_weight`/`is_paid`/`is_present`, dual SoT future Settings `attendance_codes` REF vs tenant writer tenant-wins, F-ATT-CAT-CODE/EFF + effective IX, invent KEY `HRM-ATT-CODE-KEY`, VAL-ATT-CODE-CAT/CNS/ALS/SCP/AGG); EXPAND `attendance_records.status` soft-key + **DROP/REPLACE** closed CHECK/DTO IsIn ceiling; **FORBIDDEN** mega-EAV · fold leave/worksite/shifts · rewrite aggregate · wipe EMP/ATT/SI/CTR seals · seed · flip ready; DOC-DELTA DB §4.4d + §4.5a; closes R-PLT-DATA-04 ATT attendance-code slice; honesty false; seals RETAIN; no apps/**; **BE unlock HOLD** until BA also CONFIRMED. |
| **next_dispatch_prompt** | `Task pm — after BA also CONFIRMED on PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01: Task dev-be work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01. Read DATA-01 §2–§3 + SA L-ATT-CODE-* + BA AC-PLT-ATT-CODE-01*. ensureSchema ADD public.att_attendance_code (ICatalogRow + typed flags + partial UQ + format/symbol/counts_as/day_weight CHKs + effective IX); DROP/REPLACE closed attendance_records.status CHECK and DTO @IsIn ceiling; Nest F-ATT-CAT-CODE-01..04 + EFF-01 + CNS KEY HRM-ATT-CODE-KEY when EFF>0; soft-delete retire; scope_parity U19; empty EFF soft skip + no seed. FORBIDDEN: rewrite att-timesheet-line-aggregate; fold into att_leave_type/work_sites/work_shifts; reopen EMP/SI/CTR seals; flip attendance_uat_ready; mega-EAV. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md. U65. If BA not yet CONFIRMED: HOLD BE — do not dispatch.` |
