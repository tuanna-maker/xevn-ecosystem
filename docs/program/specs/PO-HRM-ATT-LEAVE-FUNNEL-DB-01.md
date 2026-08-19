# PO-HRM-ATT-LEAVE-FUNNEL-DB-01 — DB confirm · leave → attendance funnel (physical)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-FUNNEL-DB-01` |
| **lane** | governance · ba-data |
| **parent** | `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01` · PM **CONFIRMED** Option A P0 + staged B · **REJECT** Option C |
| **change_mode** | ADD confirm · **NO CODE** `apps/**` · **no migrate executed this seat** |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED** (Option A soft FK on `attendance_records`) · staged B line hours **CONFIRMED ADD-plan** (Dev AGG HOLD) |
| **ref_sa** | [`PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md`](./PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md) §4–§8 |
| **ref_logical** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4 · §4.5 · **§4.6** (must_keep sign §4.6.1) |
| **ref_physical** | Nest `attendance.service.ts` `ensureSchema` · `attendance-sheet-schema.bootstrap.ts` · `leave-requests.service.ts` · `attendance-sheet-sign.service.ts` · `scripts/lib/hrm-catalog-lineage.mjs` |
| **Honesty** | `attendance_uat_ready=false` · U65 zero-seed · WAIVE_L2 intact · J-HRM-06b/06c must_keep |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Option A materialize target | **`public.attendance_records`** — UPSERT `status='leave'` on approve |
| Soft FK | **ADD** `leave_request_id` UUID NULL → `leave_requests.id` (**soft** · **no CASCADE**) |
| Type snapshot | **ADD** `leave_type_key` TEXT NULL (= `leave_requests.leave_type` at materialize) |
| UQ keep | Existing `(company_id, employee_id, attendance_date)` — funnel UPSERT on this key |
| Reverse when sheet **closed** | **Forbidden** mutate/delete markers → **409** `HRM-ATT-SHEET-LOCKED` |
| Reverse when sheet open/draft/submitted | Clear/downgrade rows with matching `leave_request_id` only |
| OPEN-Q3 paid/unpaid | **CONFIRMED** map §4 — **no invent** catalog DDL fields |
| Sheet header physical | **`public.attendance_sheets`** = alias logical `att_timesheet_header` |
| Line hours physical | **`att_timesheet_line` ABSENT AS-IS** → **ADD** for staged B (AGG-01) — **not** BE-01 scope |
| Sign tables §4.6.1 | **must_keep** — **cấm** wipe / rename / dual SoT |
| Option C FE-join | **REJECT** (PM) |
| Ladder N / LV-02 | **WAIVE_L2** — **cấm** reopen |
| `attendance_uat_ready` | **false** |

**Unlock:** PM → **`PO-HRM-ATT-LEAVE-FUNNEL-BE-01`** (Option A + GET projection + reverse + conflict/locked).  
**HOLD:** `PO-HRM-ATT-SHEET-AGG-01` / line DDL until AGG wave (OPEN-Q2 HTTP bind still sa).

---

## 2. AS-IS physical (read-only facts)

### 2.1 `attendance_records` (day grid / weekly SoT)

| Column / constraint | AS-IS |
|---------------------|-------|
| PK | `id` UUID |
| Scope | `company_id` **TEXT** (ALTER from UUID) |
| Keys | `employee_id` UUID · `attendance_date` DATE |
| Punch | `check_in_at` / `check_out_at` timestamptz NULL |
| Status | CHECK `pending\|present\|absent\|leave` |
| Note | `note` TEXT NULL |
| Audit | `created_by`, `created_at`, `updated_at` |
| UQ | `uq_attendance_company_employee_date` `(company_id, employee_id, attendance_date)` |
| IX | `idx_attendance_company_date` `(company_id, attendance_date DESC)` |
| **Missing** | `leave_request_id` · `leave_type_key` |

Source: `attendance.service.ts` `ensureSchema`.

### 2.2 `leave_requests`

| Column | AS-IS |
|--------|-------|
| PK / scope | `id` UUID · `company_id` TEXT |
| Type / range | `leave_type` TEXT · `start_date`/`end_date` DATE · `total_days` NUMERIC |
| Status | `pending\|approved\|rejected\|cancelled` |
| Soft FK out | none → attendance |

Source: `leave-requests.service.ts` `ensureSchema`.

### 2.3 `attendance_sheets` (header)

| Column | AS-IS |
|--------|-------|
| Table | `public.attendance_sheets` |
| Period | `start_date` / `end_date` |
| Status | default `draft` · lifecycle includes `submitted` / `closed` (+ `closed_at` / `closed_by`) |
| Create | **Header-only** — **no** seed records (AC-ATT-SHEET empty honesty) |

Source: `attendance-sheet-schema.bootstrap.ts`.

### 2.4 Line / sign

| Logical §4.6 | Physical AS-IS |
|--------------|----------------|
| `att_timesheet_header` | **Alias** → `attendance_sheets` |
| `att_timesheet_line` (`paid_leave_hours` / `unpaid_leave_hours`) | **ABSENT** |
| `att_timesheet_sign_step` | **PRESENT** (`attendance-sheet-sign.service.ts`) — must_keep |

---

## 3. DOC-DELTA — Option A columns (CONFIRMED)

### 3.1 ADD on `public.attendance_records`

| Column | Type | Null | Rule |
|--------|------|------|------|
| `leave_request_id` | UUID | YES | Soft FK → `leave_requests.id`; set only when `status='leave'` from funnel; **no** DB CASCADE |
| `leave_type_key` | TEXT | YES | Snapshot of `leave_requests.leave_type` (catalog code e.g. `LVT_01` / `annual`); display SoT for GET projection |

### 3.2 Indexes (ADD)

| Index | Definition | Purpose |
|-------|------------|---------|
| `idx_attendance_records_leave_request_id` | `(leave_request_id)` WHERE `leave_request_id IS NOT NULL` | Reverse / audit by đơn |
| (keep) UQ employee-date | unchanged | UPSERT funnel |

### 3.3 Reverse / locked rules (data integrity)

| Condition | Expected |
|-----------|----------|
| Leave leaves `approved` → `rejected`/`cancelled` **and** no overlapping sheet `status='closed'` for that `company_id` + date | DELETE row **or** clear leave marker (`status`→`pending`, null soft FK) **only** where `leave_request_id` = đơn |
| Same reverse **and** date ∈ sheet `closed` period (same company) | **409** `HRM-ATT-SHEET-LOCKED` — no silent wipe |
| Approve overlap day already `present` | **409** `HRM-ATT-LEAVE-FUNNEL-CONFLICT` (SPEC §5) — no overwrite |
| Day `pending`/`absent` or no row | UPSERT → `leave` + soft FK |
| Create sheet | Still **no** roster seed (INV-3) |

**Closed detection (app):** sheet row `attendance_sheets` with `status='closed'` AND `attendance_date BETWEEN start_date AND end_date` AND same TEXT company scope resolver as leave/sheet list (F-ATT-LEAVE-FUNNEL-04 / U19).

### 3.4 Alias — logical leave type

| Logical | Physical |
|---------|----------|
| `att_leave_request.leave_type_key` | `leave_requests.leave_type` |
| Snapshot on day marker | `attendance_records.leave_type_key` |
| Enterprise CFG table `att_leave_type` | **Not** required for Option A BE-01; AGG may read catalog §4 |

---

## 4. OPEN-Q3 — paid / unpaid source (**CONFIRMED** · no invent)

### 4.1 What exists (no new catalog columns)

| Source | Fields observed | Role |
|--------|-----------------|------|
| Settings catalog `leave_types` | `code`, `label`, `status`, optional `metadata` (e.g. `is_sick` pattern) | AS-IS picker SoT |
| Lineage | `unpaid` → **`LVT_04`**; label «Không lương» | `hrm-catalog-lineage.mjs` |
| Enterprise §4.4 | `att_leave_type.is_paid` boolean | **Logical** — table **not** AS-IS runtime |

**Fact:** AS-IS `leave_types` catalog items **do not** expose a required `is_paid` column. **Forbidden:** invent XBOS/HRM catalog field / migrate settings schema for this seat.

### 4.2 Deterministic AGG bucket map (Phase-1)

Resolve `is_unpaid` for a leave day / request:

1. **If** catalog item `metadata.is_paid` is boolean → use it (`true`→paid hours, `false`→unpaid). Same optional-metadata pattern as sick (`metadata.is_sick`) — **read-only if present**; do not require.
2. **Else** code/lineage unpaid set (case-insensitive): `unpaid`, `lvt_04`, `LVT_04` → **unpaid**.
3. **Else** normalized label contains `khong luong` / `unpaid` / `không lương` (NFD-strip) → **unpaid**.
4. **Else** → **paid** (covers `LVT_01` Phép năm, `LVT_02` Ốm, `LVT_03` Thai sản, `annual`, `sick`, `maternity`, `compensatory`, …).

Hours math (staged B only): for each employee in sheet period, sum day units for `status='leave'` records (default **1.0 day × standard work_hours** from shift/company default when full-day; half-day follows SPEC OPEN unit / `total_days` fraction — **no invent unit lock**). Bucket into `paid_leave_hours` vs `unpaid_leave_hours` via map above.

### 4.3 Future (not BE-01)

When `att_leave_type` physicalizes: AGG prefers `att_leave_type.is_paid` by `leave_type_key` — **ADD-only** path; until then §4.2 is SoT.

---

## 5. Bridge — `attendance_sheets` vs `att_timesheet_line` (§4.6)

| Topic | Plan |
|-------|------|
| Header | **ONE physical:** `attendance_sheets` ↔ logical `att_timesheet_header` (**alias**, no dual header table) |
| Period alias | `start_date`↔`period_from` · `end_date`↔`period_to` |
| Status | Keep AS-IS `draft`/`open`/`submitted`/`closed` — align close with §4.6 immutability |
| Line | **ADD** `public.att_timesheet_line` (or Nest ensureSchema) with §4.6 columns including `paid_leave_hours` / `unpaid_leave_hours` · UQ `(header_id, employee_id)` · `header_id` → `attendance_sheets.id` soft/hard per SA |
| Writer | ATT only · F-ATT-SHEET-AGG-01 · **before** PAY read |
| PAY | Reads **closed** header + lines only — **cấm** FK/HTTP `leave_requests` |
| Sign | **Preserve** `att_timesheet_sign_step` §4.6.1 — funnel **không** bypass |

**OPEN-Q2 (HTTP):** ba-data lean — Phase-1 embed aggregate inside existing `POST …/submit` when line exists (fewer storm surfaces; must_keep 06c). Dedicated `/aggregate` optional later. **Owner seal:** sa (+ ba-data) on AGG wave — **not** blocking BE-01 Option A.

---

## 6. Validation matrix (data)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-FUNNEL-01 | Approve leave open sheet | UPSERT records leave + soft FK | Rows exist; GET display-ready |
| VAL-FUNNEL-02 | Reject/cancel after approve · sheet not closed | Reverse by `leave_request_id` | No orphan leave markers |
| VAL-FUNNEL-03 | Reverse · sheet closed | Block | 409 `HRM-ATT-SHEET-LOCKED` |
| VAL-FUNNEL-04 | Overlap `present` | Block silent overwrite | 409 `HRM-ATT-LEAVE-FUNNEL-CONFLICT` |
| VAL-FUNNEL-05 | Scope list≠detail | Same resolver leave + records + sheets | No 404 after list id (U19) |
| VAL-FUNNEL-06 | AGG unpaid code | `LVT_04` / unpaid lineage | Hours → `unpaid_leave_hours` |
| VAL-FUNNEL-07 | AGG paid default | `LVT_01`/`02`/`03` without unpaid signal | Hours → `paid_leave_hours` |
| VAL-FUNNEL-08 | Invent catalog `is_paid` DDL | Forbidden this seat | Review FAIL |
| VAL-FUNNEL-09 | Wipe sign / dual header | Forbidden | Review FAIL |
| VAL-FUNNEL-10 | Create sheet seeds records | Forbidden | AC-ATT-SHEET FAIL |

---

## 7. Traceability

| Requirement | API intent | DB | FE / Journey | Test |
|-------------|------------|----|--------------|------|
| AC-ATT-LV-SHEET-01 | F-ATT-LEAVE-FUNNEL-01/03 | `attendance_records` + soft FK | Weekly / Bản ghi · J-HRM-06b | FUNNEL-QA-01 U65 |
| Reverse | F-ATT-LEAVE-FUNNEL-02 | clear by `leave_request_id` | — | AC-ATT-LV-SHEET-02 |
| Locked | F-ATT-LEAVE-FUNNEL-02 | closed sheet gate | — | AC-ATT-LV-SHEET-03 |
| ATT-10 hours | F-ATT-SHEET-AGG-01 | **ADD** `att_timesheet_line` | submit path must_keep 06c | AGG-01 staged |
| PAY boundary | INV-1 | no leave FK on pay_* | — | schema review |
| Storm | INV-4 | no extra poll tables | must_keep ≤2 GET/10s | AC-ATT-SHEET-04/06 |

---

## 8. Gaps with owner (explicit)

| ID | Gap | Owner | Blocks BE-01? |
|----|-----|-------|---------------|
| OPEN-Q1 | Holiday days inside leave range: marker vs skip | **ba-process** | No (default: still marker leave until sealed) |
| OPEN-Q2 | Aggregate on `submit` vs `/aggregate` | **sa** (+ ba-data lean §5) | No for Option A |
| Half-day unit | Fraction via note / `other` — no invent lock | ba-process / BE follow catalog | Soft |
| Line DDL | Physical `att_timesheet_line` | **AGG-01** / BE later | Yes for B only |

---

## 9. Honesty / forbidden

| Item | Value |
|------|--------|
| `attendance_uat_ready` | **false** |
| apps/** this seat | untouched |
| seed | forbidden (U65) |
| invent ladder N | forbidden |
| wipe §4.6 / sign | forbidden |
| Option C | rejected |

---

## Completion contract

- `completion_report`: CONFIRMED soft FK + indexes on `attendance_records`; OPEN-Q3 paid/unpaid via code/label/optional metadata (no invent); header↔line bridge stamped; residual OPEN-Q1/Q2 + AGG line HOLD.
- `next_owner`: **pm** → **dev-be** `PO-HRM-ATT-LEAVE-FUNNEL-BE-01`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md` · `docs/qa/evidence/po-hrm-att-leave-funnel-db-01.md`
