# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01 — Physical DB · ATT leave catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `att_leave_type` · **EXPAND** `attendance_work_sites` platform note · **NO CODE** `apps/**` · **no migrate** · **no seed** |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — physical ADD per SA ATT vertical §2 |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) §2 · F-ATT-CAT-* |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) D1/D3 |
| **ref_funnel** | [`PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md`](./PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md) — funnel `leave_type_key` snapshot must_keep |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · U65 |
| **must_keep** | `work_shifts` ops SoT · sheet/sign spine §4.6.1 · settings-catalogs `leave_types` group REF · soft-delete · scope TEXT slug |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.att_leave_type` — **ABSENT AS-IS** Nest |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV |
| Open catalog | **`leave_type_key`** format-only CHK — **FORBIDDEN** closed enum CHECK |
| Dual SoT | Group REF `leave_types` **≠** ATT writer — effective union at read (**BR-PLT-06**) |
| Work sites | **EXPAND note only** — `attendance_work_sites` LIVE — no new table GĐ1 |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** ATT slice |

---

## 2. ADD `public.att_leave_type`

### 2.1 Columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `leave_type_key` | text | NO | | Open catalog code |
| `name_vi` | text | NO | | UI label |
| `category` | text | NO | | See §2.3 |
| `is_paid` | boolean | NO | true | Sheet aggregate default |
| `allows_carry_over` | boolean | NO | false | |
| `allows_advance` | boolean | NO | false | |
| `insurance_regime_flag` | boolean | NO | false | Sick BHXH branch |
| `company_topup_flag` | boolean | NO | false | |
| `counts_toward_timesheet` | boolean | NO | true | |
| `metadata_json` | jsonb | YES | NULL | Optional sick/attach bridge — **not** SoT for paid/unpaid |
| `status` | text | NO | `'active'` | active \| retired |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | `(company_id, lower(leave_type_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, category)` |
| **CHK key format** | `leave_type_key ~ '^[a-z][a-z0-9_]*$'` |
| **CHK category** | `category IN ('annual','seniority','ot_comp','carry_over','advance','sick','other')` |
| **CHK status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (leave_type_key IN ('annual','sick','LVT_01',…))` · hard-delete |

### 2.3 Category enum (typed — not key ceiling)

| `category` | Use |
|------------|-----|
| `annual` | Phép năm |
| `seniority` | Phép thâm niên |
| `ot_comp` | Phép bù OT |
| `carry_over` | Bảo lưu |
| `advance` | Ứng phép |
| `sick` | Nghỉ ốm |
| `other` | HR-defined open types |

### 2.4 `ICatalogRow` binding

| Logical | Physical |
|---------|----------|
| `code` | `leave_type_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | `category` + boolean flags (+ optional `metadata_json`) |
| `catalog_kind` | `att_leave_type` (adapter constant) |

### 2.5 Dual SoT — effective catalog (read model)

```text
  XBOS publish ──► settings-catalogs.leave_types (group REF)
                           │
                           ├── pull/sync (read-only for tenant writer)
                           │
  ATT Settings ──► att_leave_type CRUD (tenant writer)
                           │
                           ▼
              F-ATT-CAT-EFF-01 effective union
              (ATT row wins on same leave_type_key)
                           │
              leave_requests · balance · funnel · sheet aggregate
```

| Rule | Detail |
|------|--------|
| Writer | Only **`att_leave_type`** for tenant mutate — **FORBIDDEN** write XBOS REF partition |
| Consumer | `leave_requests.leave_type` must ∈ effective set when catalog >0 (**BR-PLT-02**) |
| Collision | Same key: ATT native overrides REF label/flags |
| Empty | `[]` = valid — no fake starter in U65 |

### 2.6 Bootstrap starter keys (docs only — Dev ensure later)

Starter keys (`annual`, `seniority`, `ot_comp`, `carry_over`, `advance`, `sick`, `LVT_01`…`LVT_04`) = **bootstrap examples** when ensure runs — **not** product ceiling · **not** UF evidence.

---

## 3. EXPAND `attendance_work_sites` (platform note — LIVE)

| Meta | Stamp |
|------|--------|
| Physical | **LIVE** — `attendance-config.service.ts` `ensureWorkSitesSchema` |
| Action | Document `ICatalogRow` map only — **no column gap** blocks GĐ1 |
| Retire | `active=false` GĐ1 (no `archived_at` required now) |
| Geofence SoT | ADR **D3** — punch assert `HRM-ATT-GEO-001` unchanged |
| **Deepen pointer (2026-08-08)** | [`ATT-WORKSITE-CATALOG-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md) **CONFIRMED EXPAND** — soft-retire sole product path · list default `active=TRUE` · IX `(company_id, active)` note · SITE-UNKNOWN HOLD · **FORBIDDEN** second table / fold into leave / ensureDefault / seed — **RETAIN** this §3 · **no wipe** `att_leave_type` ADD |

See DB_DESIGN §4.4c for column list.

---

## 4. Consumer pointers (must_keep — no redesign)

| Consumer | Binding |
|----------|-----------|
| `leave_requests.leave_type` | Soft FK by key → effective catalog |
| `att_leave_balance` / policy | `leave_type_key` soft → `att_leave_type` |
| `attendance_records.leave_type_key` | Funnel snapshot (FUNNEL-DB-01) |
| `att_timesheet_line` / sheet sign | **must_keep** — no new FK to catalog GĐ1 |
| PAY | **No** FK to leave_type (D-I-3b) |
| `work_shifts` | **Ops SoT** — not catalog duplicate (ADR D1) |

---

## 5. Validation matrix

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-ATT-LVT-01 | Create row | `leave_type_key` matches slug regex | 201 / persist |
| VAL-ATT-LVT-02 | Create row | `leave_type_key` = `Annual` (upper) | 400 `HRM-PLT-CAT-CODE-INVALID` |
| VAL-ATT-LVT-03 | Create active duplicate key same company | UQ partial | 409 `HRM-PLT-CAT-CODE-CONFLICT` |
| VAL-ATT-LVT-04 | Create key `hr_custom_09` (9th+) | No enum ceiling | **201** — AC-PLT-ATT-01 |
| VAL-ATT-LVT-05 | Retire row with history | `status=retired`, `archived_at` set | Picker hides; old requests keep key |
| VAL-ATT-LVT-06 | Hard-delete with `leave_requests` ref | — | **FORBIDDEN** |
| VAL-ATT-LVT-07 | List vs get-by-id OOS slug | scope_parity | 404/403 — not empty mask |
| VAL-ATT-LVT-08 | Submit leave type ∉ effective | catalog >0 | 400 `HRM-LEAVE-TYPE-UNKNOWN` |
| VAL-ATT-LVT-09 | `metadata_json.is_sick` only | typed `is_paid` still SoT | Sheet uses flags first |
| VAL-ATT-LVT-10 | Group REF + ATT same key | effective read | ATT row wins |

---

## 6. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| AC-PLT-ATT-01 open 9+ | §2 ADD | F-ATT-CAT-LVT-02 | Settings picker | U65 browser |
| AC-PLT-ATT-02 retire | `archived_at` | retire endpoint | picker hide | balance/history visible |
| AC-PLT-ATT-03 validate | effective keys | F-ATT-CAT-EFF-01 | leave form | 4xx not in catalog |
| AC-PLT-ATT-04 work sites | §4.4c LIVE | F-ATT-CAT-WS-* | GPS settings | geofence 2xx |
| BR-PLT-02 | consumer keys | F-ATT-LEAVE-02/03 | — | VAL-ATT-LVT-08 |
| BR-PLT-04 | soft-delete | retire | — | VAL-ATT-LVT-05 |
| BR-PLT-05 | no enum CHECK | slug format only | — | VAL-ATT-LVT-04 |
| BR-PLT-06 | dual SoT | F-ATT-CAT-EFF-01 | — | union collision |
| J-HRM-ATT-LVT-01 | §2 | LVT-01 | Settings | QA later |

---

## 7. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-ATT-01 | Wire `leave-requests` to effective catalog | dev-be |
| R-PLT-ATT-02 | Accrual policy CRUD bound keys | ba-data GĐ1.5 |
| R-PLT-ATT-03 | Client API DOC-DELTA append | ba-docs |
| R-PLT-ATT-04 | Sheet export MergeToken | sa GĐ1.5 |

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-data-01.md` |
| **next_owner** | **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01` |
| **completion_report** | CONFIRMED physical ADD `att_leave_type` (open key, UQ partial, slug CHK, soft-delete, metadata_json); EXPAND work-sites platform note; DOC-DELTA DB §4.4/§4.4c; closes R-PLT-DATA-04 ATT; no apps/**; unlock BE ensureSchema. |
