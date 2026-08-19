# PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01 — Physical ATT line for payroll hours bag

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | QC-FE-EVAL GWC · residual **R-PAY-F-ATT-LINE** OPEN (`ATT_TIMESHEET_LINE_ABSENT`) |
| **change_mode** | **ADD** |
| **lane** | governance · ba-data |
| **date** | 2026-08-07 |
| **honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **cấm** claim formula LIVE / silent `0` hours |
| **spec_ref** | Q-PAY-F-3 · FR-UC-BP-ATT-10/11 · FR-UC-BP-PAY-02 · DATA_OWNERSHIP INV closed-sheet · DB_DESIGN §4.6 · FUNNEL-DB-01 §5 · API-01 §4.4/§5 · Nest `PAY_FORMULA_ATT_HOUR_VARS` |

---

## 0. Verdict (machine-readable)

| Decision | Value |
|----------|--------|
| **AS-IS line table** | **`public.att_timesheet_line` = ABSENT** (Nest `information_schema` probe → warning `ATT_TIMESHEET_LINE_ABSENT`) |
| **Header SoT** | **LIVE** `public.attendance_sheets` = logical `att_timesheet_header` (**alias** — **must_keep**) |
| **Close gate SoT** | LIVE `status='closed'` + `closed_at` / `closed_by` (migration `20260805_attendance_sheets_close_columns.sql` + `ensureAttendanceSheetSchema`) |
| **Sign SoT** | LIVE `att_timesheet_sign_step` (§4.6.1) — **must_keep**; funnel/PAY **không** bypass |
| **This wave** | **CONFIRMED ADD** physical `public.att_timesheet_line` (Nest ensureSchema / migrate) — **no** dual header · **no** PAY shadow hours · **no** invent VIEW that invents silent `0` |
| **R-PAY-F-ATT-LINE** | Physical design **LOCKED** → unlock **sa** F.1 AGG+PAY bag bind → then **dev-be** wire |
| **G-PAY-F-06** | Remains **open product** until BE AGG writes rows + PAY bag SELECT closes UF |

---

## 1. Domain map (hours fidelity)

```text
attendance_sheets (header · company_id TEXT · start_date/end_date · status)
        │ 1
        │
        ▼ N
att_timesheet_line (ADD) ── UQ (header_id, employee_id)
        │
        │ PAY read-only when header.status = closed AND line_locked = true
        ▼
pay_formula variable bag → payable_hours | standard_hours | ot_hours_weighted
                           | paid_leave_hours | unpaid_leave_hours
```

| Entity | Physical | Writer | Reader (payroll) |
|--------|----------|--------|------------------|
| Timesheet header | `attendance_sheets` | ATT catalog / sign / close | Soft EXISTS closed for period |
| Timesheet line (hours grain) | **`att_timesheet_line` ADD** | ATT **only** (F-ATT-SHEET-AGG) | PAY PREVIEW/PROCESS bag |
| Day punches / leave markers | `attendance_records` (+ soft `leave_request_id`) | ATT funnel | **FORBIDDEN** as PAY var SoT |
| Leave / OT request HTTP | `leave_requests` / OT tables | ATT | **FORBIDDEN** in formula bag |

**Key grain for PROCESS/PREVIEW bind:** `(period window + employee + OU)` resolved as:

1. Find **closed** `attendance_sheets` whose `[start_date, end_date]` covers payroll period (same `company_id` / `expandPayrollAttendanceSheetCompanyIds` scope as ATT-412 today — U19 list↔detail parity).  
2. Load **`att_timesheet_line`** where `header_id = sheet.id` AND `employee_id = payslip.employee_id` AND `archived_at IS NULL`.  
3. Map columns → var bag keys (§3).  
4. If sheet missing/open → **`HRM-PAY-ATT-412`**. If closed but line missing / required hour key null → **honest incomplete** (§4) — **cấm** invent `0`.

---

## 2. Physical DDL — CONFIRMED ADD `att_timesheet_line`

> Aligns client logical §4.6 **Line** + FUNNEL-DB-01 §5. Nest table name **must** be exactly `att_timesheet_line` (probe already hard-coded).

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `header_id` | uuid | NO | — | Soft/hard FK → `attendance_sheets.id` (app assert same company) |
| `company_id` | text | NO | — | Plane B slug — **same** as header `company_id` (denorm for IX / scope) |
| `employee_id` | uuid | NO | — | → `employees.id` (app soft FK) |
| `standard_hours` | numeric(12,4) | NO | — | Giờ chuẩn sau làm tròn |
| `ot_hours_weighted` | numeric(12,4) | NO | `0` | OT **đã × hệ số** (ADR I-6) — **not** raw OT flag |
| `paid_leave_hours` | numeric(12,4) | NO | `0` | FUNNEL OPEN-Q3 paid bucket |
| `unpaid_leave_hours` | numeric(12,4) | NO | `0` | `LVT_04` / unpaid lineage |
| `late_penalty_hours` | numeric(12,4) | YES | NULL | Optional AGG; **not** in `gd1_eval_v1` ATT allow-list GĐ1 |
| `meal_shift_hours` | numeric(12,4) | YES | NULL | Optional AGG (A5) |
| `other_components_json` | jsonb | YES | NULL | Open funnel extras — **not** PAY engine SoT |
| `payable_hours` | numeric(12,4) | NO | — | Tổng giờ công tính lương (SoT for `payable_hours` var) |
| `line_locked` | boolean | NO | `false` | Set **`true`** on header close; PAY only trusts locked+closed |
| `work_days` | numeric(8,2) | YES | NULL | **Optional GĐ1** — not in Nest ATT allow-list yet; see §3.2 |
| `created_at` / `updated_at` | timestamptz | NO | `now()` | Audit |
| `archived_at` | timestamptz | YES | NULL | Soft-delete / reopen cycle archive |

| Constraint / index | Definition |
|--------------------|------------|
| **UQ** | `(header_id, employee_id)` WHERE `archived_at IS NULL` |
| **IX** | `(company_id, employee_id)` · `(header_id)` · partial `(company_id, header_id)` active |
| **CHK** | hour columns `>= 0`; `payable_hours` SHOULD equal AGG formula (document in AGG; soft warn OK GĐ1) |
| **Soft-delete** | `archived_at` — reopen archives prior lines or regenerates AGG per F-ATT-SHEET-03 (must_keep sign archive pattern) |

### 2.1 must_keep / FORBIDDEN

| must_keep | FORBIDDEN |
|-----------|-----------|
| `attendance_sheets` header + close cols | Second header table / rename wipe |
| `att_timesheet_sign_step` | Bypass sign to invent closed |
| Soft-delete only | Hard DELETE lines for UF |
| PAY read closed+locked only | PAY FK `leave_requests` / OT / punch |
| Hours vars from **line columns** | Silent `0` when line ABSENT / incomplete |
| Nest name `att_timesheet_line` | Alias-only `attendance_sheet_lines` without physical `att_timesheet_line` (probe break) |

### 2.2 Rejected alternatives

| Option | Verdict | Why |
|--------|---------|-----|
| A — VIEW over `attendance_records` for PAY | **REJECT** | Invents hours without close gate; dual SoT vs ATT-10 |
| B — Copy hours onto `payroll_payslips` as only SoT | **REJECT** | Shadow dual-write; reopen drift |
| C — Keep ABSENT + overrides forever | **REJECT** for residual close | QC residual R-PAY-F-ATT-LINE; honesty warnings only |
| D — **ADD line table + ATT AGG writer** | **ACCEPT** | Matches §4.6 · FUNNEL staged B · Nest probe |

---

## 3. Field map — `gd1_eval_v1` ATT vars

Source allow-list (Nest live — **do not invent new keys this seat**):

`PAY_FORMULA_ATT_HOUR_VARS` / `PAY_FORMULA_REQUIRED_VAR_ALLOWLIST` hours subset:

| Var key (expression / required_vars) | Column SoT | Required for hours fidelity | Notes |
|--------------------------------------|------------|-----------------------------|-------|
| `payable_hours` | `att_timesheet_line.payable_hours` | **YES** when required_vars includes it | Primary hours binder |
| `standard_hours` | `standard_hours` | when listed | |
| `ot_hours_weighted` | `ot_hours_weighted` | when listed | Weighted — **not** `ot_flag` boolean |
| `paid_leave_hours` | `paid_leave_hours` | when listed | Funnel paid bucket |
| `unpaid_leave_hours` | `unpaid_leave_hours` | when listed | Funnel unpaid |

### 3.1 OT / flags

| Concept | Physical | GĐ1 rule |
|---------|----------|----------|
| OT amount for formula | `ot_hours_weighted` | Coefficient applied **in ATT AGG before close** (ADR I-6) |
| Boolean `is_ot` / day flags | **OUT** | Not in allow-list; do not ADD flag columns for PAY bag |
| Late / meal | optional columns | Not in ATT hour allow-list — may feed `other_components_json` later |

### 3.2 Work days

| Concept | Decision |
|---------|----------|
| `work_days` on line | **OPTIONAL ADD column** (nullable) for ATT UI / future vars |
| `work_days` as `gd1_eval_v1` var | **DEFER** — **not** in Nest allow-list today; **cấm** invent key without API-01 DV-18 APPEND |
| Derive for display | FE may show `standard_hours / company_standard_day_hours` — **not** PAY SoT |

### 3.3 Non-ATT vars (out of this residual)

`base_salary`, `dependents_count`, `allowance_*` → CORE C&B bag (R-PAY-F-CB-BAG) — **unchanged**.

---

## 4. Business rules — closed gate + honest incomplete

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **BR-PAY-ATT-LINE-01** | PROCESS period | Sheet covering period must be `status=closed` | Else **`HRM-PAY-ATT-412`** — no process lines |
| **BR-PAY-ATT-LINE-02** | PROCESS + required_vars ∩ ATT hours ≠ ∅ | Closed sheet **and** line row for employee with finite required hour keys | Else **`HRM-PAY-ATT-412`** *or* **`HRM-PAY-FORMULA-412-VARS`** (taxonomy: prefer **ATT-412** when sheet open/missing; **VARS** when sheet closed but line incomplete — SA F.1 must freeze) |
| **BR-PAY-ATT-LINE-03** | PREVIEW + ATT hours required + table ABSENT / bag incomplete + no overrides | Honest stub | **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** + warnings `ATT_TIMESHEET_LINE_ABSENT` / `ATT_HOURS_VAR_BAG_INCOMPLETE` — **cấm** claim LIVE |
| **BR-PAY-ATT-LINE-04** | PREVIEW/PROCESS | **Cấm** invent numeric `0` for missing ATT keys | Fail-closed codes above |
| **BR-PAY-ATT-LINE-05** | Line mutate | Only ATT AGG / reopen-AGG; header `closed` ⇒ `line_locked=true` | PAY never UPDATE hours |
| **BR-PAY-ATT-LINE-06** | Dual-control formula | Unchanged Q-PAY-FORMULA | Author ≠ publish; independent of ATT line |
| **VAL-ATT-LINE-01** | Soft-delete | List PAY bag ignores `archived_at IS NOT NULL` | |
| **VAL-ATT-LINE-02** | scope_parity U19 | Line get/list by header uses **same** company resolver as `attendance_sheets` list/get | No 404 after list id under `main` |
| **VAL-ATT-LINE-03** | UQ | Second active line same `(header_id, employee_id)` | **409** conflict |
| **VAL-ATT-LINE-04** | Seed for UF | Forbidden (U65) | QA FAIL |

**Recommended SA freeze for BR-02 taxonomy (hint):**

- Sheet not found / not closed → **`HRM-PAY-ATT-412`**
- Sheet closed · table present · line missing or null required hour → **`HRM-PAY-ATT-412`** with message `ATT_LINE_INCOMPLETE` (treat as timesheet fidelity fail) — keeps PROCESS from silent zero better than VARS alone

---

## 5. Lifecycle

| Header status | Line expectation | PAY |
|---------------|------------------|-----|
| `draft` / `open` | Lines may be absent or draft AGG | ATT-412 on PROCESS |
| `submitted` | AGG **SHOULD** have written lines; `line_locked=false` | Still ATT-412 (not closed) |
| `closed` | All enrolled lines present · `line_locked=true` | PAY may read |
| reopen → `submitted` | Archive or regenerate lines per F-ATT-SHEET-03 | Prior closed snapshot no longer eligible |

Invalid: PROCESS while open → ATT-412. Invalid: PAY write line hours → BOUNDARY-403.

---

## 6. Traceability

| Requirement | API intent | DB | FE / Journey | Test |
|-------------|------------|----|--------------|------|
| Q-PAY-F-3 hours from closed sheet | F-PAY-ATT-CLOSED-01 · PREVIEW/PROCESS bag | `att_timesheet_line` + closed header | J-HRM-07 later | QA after BE — no ABSENT warning when line LIVE |
| FR-UC-BP-ATT-10 | F-ATT-SHEET-AGG-01 | ADD line | Sheet submit/aggregate | AGG-01 |
| FR-UC-BP-ATT-11 close | F-ATT-SHEET-02 | lock lines | J-HRM-06c | close + `line_locked` |
| FR-UC-BP-PAY-02 vars | API-01 §4.4/§5 | read line cols → bag | Formula preview | R-PAY-F-ATT-LINE close |
| G-PAY-F-06 | — | this ADD | — | Residual until BE+UF |
| Dual-control | F-PAY-FORMULA-PUBLISH | unchanged | — | must_keep |

**J-*:** Hours LIVE UF not claimed this seat — attach **J-HRM-06c** (close) + future **J-HRM-07** process with `payable_hours` after BE.

---

## 7. Unlock path (SA vs BE)

| Step | Owner | Why |
|------|-------|-----|
| **1 (next)** | **sa** | F.1 CONFIRMED for (a) F-ATT-SHEET-AGG write DTO↔columns §2 · (b) PAY bag SELECT closed line → var keys §3 · freeze BR-02 error taxonomy · DOC-DELTA API-01 §4.4/§5 lift hours BLOCKED wording |
| **2** | **dev-be** (ATT) | `ensureAttTimesheetLineSchema` + AGG on submit/close path · set `line_locked` on close · soft-delete/reopen |
| **3** | **dev-be** (PAY) | Replace probe-only: `loadAttHoursFromClosedLine` into `buildPayFormulaVariableBag` · retain ATT-412 / PREVIEW-STUB honesty · **cấm** silent 0 |
| **4** | **qa** | L1/browser: closed sheet + line → preview/process hours without `ATT_TIMESHEET_LINE_ABSENT`; open sheet still ATT-412 |

**Do not** ship Nest DDL/wire before SA F.1 ACK on AGG+bag bind (spec-before-code). DATA this seat = physical SoT unlock for SA.

---

## 8. Honesty / cấm

| Item | Value |
|------|--------|
| `payroll_e2e_ready` | **false** |
| Formula LIVE / Phase1 DONE | **DENIED** |
| apps/** this seat | untouched |
| Seed | forbidden |
| Overwrite closed ATT header/sign schema | forbidden |
| Invent VIEW silent 0 | forbidden |

---

## DOC-DELTA (pointer)

- Client `DB_DESIGN_HRM_ENTERPRISE.md` §4.6.2: status remains header LIVE · line **ADD-plan** — this file = **CONFIRMED physical** for PAY residual R-PAY-F-ATT-LINE (no wipe §4.6 columns).  
- FUNNEL-DB-01 §5 / §8 Line DDL gap → owner moves to SA/BE after this CONFIRM.  
- API-01: hours fidelity still BLOCKED until BE; SA delta removes “ABSENT forever” language after F.1.
