# PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01 — F.1 AGG write + PAY hours bag bind

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01` **PASS_TO_PM** · `att_timesheet_line` **CONFIRMED ADD** |
| **lane** | governance · sa |
| **change_mode** | **ADD** F-ATT-SHEET-AGG-01 F.1 · **EXPAND** F-PAY-FORMULA-PREVIEW-01 §4.4 · F-PAY-PROCESS-01 / F-PAY-ATT-CLOSED-01 bag SELECT · **DOC-DELTA** API-01 (no wipe) |
| **date** | 2026-08-07 |
| **status** | **CONFIRMED** — unlock dual **dev-be** (ATT ensureSchema+AGG · PAY `loadAttHoursFromClosedLine`) |
| **ref_data** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md` §2–§4 |
| **ref_api** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` §4.4 · §5 · §7 |
| **ref_qc** | `po-hrm-payroll-formula-run-gap-qc-eval-01.md` ATT-412 / PREVIEW-STUB honesty baseline |
| **ref_funnel** | `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` F-ATT-SHEET-AGG-01 · OPEN-Q2 |
| **ref_client** | `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-SHEET-AGG · F-ATT-SHEET-02 · F-PAY-ATT-CLOSED-01 |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim LIVE · **cấm** silent `0` · **cấm** Nest this seat · **cấm** invent VIEW-only hours |
| **must_keep** | `attendance_sheets` header + close cols · `att_timesheet_sign_step` · soft-delete · scope_parity U19 · U65 · QC AC4b ATT-412 · AC4a PREVIEW-STUB |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective & locks

Close residual **R-PAY-F-ATT-LINE** at **API F.1** so BE can:

1. **Write** physical `att_timesheet_line` from ATT AGG (not PAY).
2. **Bind** closed+locked lines into `PAY_FORMULA_ATT_HOUR_VARS` for PREVIEW/PROCESS.
3. **Freeze** error taxonomy so hours never silently become `0`.

| Lock | Rule |
|------|------|
| **Physical table** | Exact Nest name `public.att_timesheet_line` (probe hard-coded) |
| **Header SoT** | LIVE `attendance_sheets` = logical `att_timesheet_header` — **must_keep** |
| **Sign SoT** | LIVE `att_timesheet_sign_step` — AGG/PAY **không** bypass |
| **Writer** | ATT only (F-ATT-SHEET-AGG-01 + close lock) |
| **Reader** | PAY bag SELECT when `status=closed` AND `line_locked=true` AND `archived_at IS NULL` |
| **Allow-list** | Nest `PAY_FORMULA_ATT_HOUR_VARS` = 5 keys — **cấm** invent `work_days` var without DV-18 APPEND |
| **OPEN-Q2** | **FROZEN** §1.1 — dedicated Nest `/aggregate` + submit **must** invoke AGG |
| **Honesty** | `payroll_e2e_ready=false` until QA UF closes hours LIVE |

```text
attendance_records (+ leave markers) ──ATT AGG──▶ att_timesheet_line
attendance_sheets (close + sign) ────lock──────▶ line_locked=true
                                                      │
                                                      ▼ PAY read-only
                                         PAY_FORMULA_ATT_HOUR_VARS bag
                                         PREVIEW / PROCESS
```

---

## 1. OPEN-Q2 freeze — AGG HTTP SoT

| Option | Verdict | Why |
|--------|---------|-----|
| A — only inside `submit` (no path) | **REJECT** as sole SoT | Rebuild after reopen / HCNS re-agg needs explicit idempotent endpoint |
| B — only `/aggregate`, submit never writes lines | **REJECT** alone | Sign panel can go `submitted` with `line_count=0` (AS-IS Nest) → PAY fidelity fail |
| **C — Nest `/aggregate` + submit invokes AGG** | **ACCEPT** | Explicit rebuild + gate: submit/close never leave PAY without lines when enrolled |

| Alias | Nest physical (implement) | Paper / client alias |
|-------|---------------------------|----------------------|
| AGG | `POST /api/hrm/attendance/attendance-sheets/:sheetId/aggregate` | `POST /api/hrm/att/attendance-sheets/aggregate` (docs) |
| Submit | `POST /api/hrm/attendance/attendance-sheets/:sheetId/submit` *(live)* — **must call AGG** before/as status→`submitted` | unchanged |
| Close | `POST …/:sheetId/close` *(live)* — **must** set `line_locked=true` on active lines | F-ATT-SHEET-02 |
| Reopen | `POST …/:sheetId/reopen` — archive lines (`archived_at`) or regenerate on next AGG | F-ATT-SHEET-03 must_keep sign archive |

---

## 2. F.1 — F-ATT-SHEET-AGG-01 (write path)

| | |
|--|--|
| **METHOD / path** | Nest: `POST /api/hrm/attendance/attendance-sheets/:sheetId/aggregate` · also **invoked by** `submit` |
| **Mục đích** | Materialize giờ công tính lương theo NV trên bảng công — ghi `att_timesheet_line` (chuẩn / OT weighted / phép / payable) trước ký chốt, để PAY chỉ đọc line đã khóa (**FR-UC-BP-ATT-10** · Q-PAY-F-3). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` / sheet scope **same** as list/get sheet (U19). (2) Load header `attendance_sheets`; if `status=closed` → **`409 HRM-ATT-SHEET-LOCKED`**. (3) Idempotent rebuild: for each enrolled employee in period window, UPSERT active row UQ `(header_id, employee_id)` WHERE `archived_at IS NULL`. (4) Compute columns from **ATT SoT only**: day punches / `attendance_records` (+ soft `leave_request_id` funnel) + OT weighted **in ATT** (ADR I-6) — **FORBIDDEN** PAY Leave/OT HTTP. (5) Set `company_id` = header `company_id` (denorm). (6) Set `line_locked=false` while header open/submitted. (7) Soft-delete prior cycle: on reopen-driven re-AGG, `archived_at` prior active lines then insert fresh (or UPDATE in place if same cycle — prefer archive+insert when reopen). (8) Return `{ sheet_id, status, line_count, warnings[] }`. (9) **Submit hook:** before `status→submitted`, call AGG; if AGG yields `line_count=0` for non-empty enrollment → **warn** OK GĐ1 empty honesty (AC-ATT-SHEET) — **do not** invent silent zeros. (10) **FORBIDDEN:** FE-join invent hours; VIEW as PAY SoT; PAY UPDATE lines. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-10** Diễn biến **#1–#3** (tổng hợp) · BR-BP-TS-01 · FUNNEL F-ATT-SHEET-AGG-01 · DATA-ATT-LINE §2 · tiên quyết **FR-UC-BP-ATT-11** |
| **Request → DB** | |

| DTO / server | DB column (`att_timesheet_line`) | Required |
|--------------|----------------------------------|----------|
| path `:sheetId` | `header_id` | YES |
| *(server from header)* | `company_id` | YES |
| enrolled `employeeId` | `employee_id` | YES |
| AGG compute | `standard_hours` | YES |
| AGG compute | `ot_hours_weighted` | YES (default 0) |
| AGG compute | `paid_leave_hours` | YES (default 0) |
| AGG compute | `unpaid_leave_hours` | YES (default 0) |
| AGG compute | `payable_hours` | YES |
| optional AGG | `late_penalty_hours` · `meal_shift_hours` · `other_components_json` · `work_days` | NO (nullable) |
| *(server)* | `line_locked=false` on AGG while not closed | YES |
| *(server)* | `created_at` / `updated_at` | YES |
| soft reopen | `archived_at` | when superseded |

| **Response** | `{ sheet_id, status, line_count, warnings[] }` — display-ready counts |
| **Lỗi** | `HRM-AS-404` · `HRM-SCOPE-409` / 403 · `409 HRM-ATT-SHEET-LOCKED` · `409` UQ conflict (`VAL-ATT-LINE-03`) · `422` hour CHK `<0` |
| **scope_parity** | Sheet get/list resolver ≡ AGG mutate assert |

### 2.1 Close lock EXPAND — F-ATT-SHEET-02

| | |
|--|--|
| **ADD after sign PASS** | `UPDATE att_timesheet_line SET line_locked=true, updated_at=now() WHERE header_id=:id AND archived_at IS NULL` |
| **Mục đích** | PAY chỉ tin hours khi header `closed` **và** line locked |
| **Tham chiếu** | FR-UC-BP-ATT-11 · client F-ATT-SHEET-02 · BR-PAY-ATT-LINE-05 |
| **must_keep** | Sign evaluator BR-BP-TS-02 unchanged — **cấm** close without sign |

### 2.2 Reopen EXPAND — F-ATT-SHEET-03

| | |
|--|--|
| **ADD** | Archive active lines (`archived_at=now()`) **or** set `line_locked=false` + require re-AGG — preferred: **archive** then AGG on next submit |
| **must_keep** | Sign-step archive pattern; no hard DELETE |

---

## 3. F.1 — PAY bag SELECT bind (`loadAttHoursFromClosedLine`)

Internal helper used by **F-PAY-FORMULA-PREVIEW-01** and **F-PAY-PROCESS-01** / **F-PAY-ATT-CLOSED-01** — **not** a public Leave/OT HTTP.

| | |
|--|--|
| **Symbol (Nest)** | `loadAttHoursFromClosedLine(db, { companyId, employeeId, periodFrom, periodTo })` → merge into `buildPayFormulaVariableBag` |
| **Mục đích** | Nạp đúng 5 khóa `PAY_FORMULA_ATT_HOUR_VARS` từ **closed+locked** timesheet line — thay probe-only `ATT_TIMESHEET_LINE_ABSENT` khi bảng LIVE. |
| **Nghiệp vụ xử lý** | (1) If `information_schema` table missing → `attTimesheetLinePresent=false` (legacy probe retained). (2) Else resolve closed header(s): `attendance_sheets` where `status='closed'` AND period window covers payroll `[period_from, period_to]` AND `company_id` ∈ `expandPayrollAttendanceSheetCompanyIds(period.company_id)` (**same** ATT-412 eligibility as today — U19). (3) SELECT line: `header_id`, `employee_id`, `archived_at IS NULL`, prefer `line_locked=true`. (4) Map columns → vars (§3.1). (5) **Never** invent `0` for missing keys — omit key / fail-closed per taxonomy §4. (6) **FORBIDDEN:** SELECT from `leave_requests` / OT HTTP / raw punch as PAY var SoT; FE-computed hours. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-02** xem trước / lập bảng · **FR-UC-BP-PAY-01** #2–#3 · Q-PAY-F-3 · **AC-PAY-FORMULA-04** · **AC-PAY-RUN-06/07/09** · DATA-ATT-LINE §1/§3 |
| **Response (internal)** | `{ vars partial, warnings[], attTimesheetLinePresent, attHoursReady, sheetId?, lineId? }` |

### 3.1 Column → `PAY_FORMULA_ATT_HOUR_VARS`

| Var key | Column | Rule |
|---------|--------|------|
| `payable_hours` | `payable_hours` | Required when in `required_vars` / expression |
| `standard_hours` | `standard_hours` | when listed |
| `ot_hours_weighted` | `ot_hours_weighted` | weighted — **not** boolean OT |
| `paid_leave_hours` | `paid_leave_hours` | when listed |
| `unpaid_leave_hours` | `unpaid_leave_hours` | when listed |

**OUT / DEFER:** `work_days` as formula var · late/meal columns · `other_components_json` as engine SoT.

### 3.2 EXPAND — F-PAY-FORMULA-PREVIEW-01 (§4.4 lift)

| Change | Detail |
|--------|--------|
| **SUPERSEDE wording** | «hours fidelity **BLOCKED forever** / until line ABSENT» |
| **REPLACE WITH** | When table LIVE + closed+locked line present → bind hours into bag; evaluate `gd1_eval_v1` may compute with `payroll_e2e_ready=false` until UF. When table ABSENT or hours incomplete → **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** + warnings — **cấm** silent 0 · **cấm** claim customer LIVE |
| **KEEP** | Opaque → PREVIEW-STUB · C&B VARS · no persist · U65 |

### 3.3 EXPAND — F-PAY-PROCESS-01 / F-PAY-ATT-CLOSED-01 (§5)

| Change | Detail |
|--------|--------|
| **ADD** | After closed-sheet EXISTS precheck: call `loadAttHoursFromClosedLine` for each payslip employee when `required_vars ∩ ATT hours ≠ ∅` |
| **ADD** | Missing/open sheet → **`HRM-PAY-ATT-412`** (retain QC AC4b) |
| **ADD** | Closed sheet but line missing/null required hour → **`HRM-PAY-ATT-412`** details `ATT_LINE_INCOMPLETE` / `ATT_LINE_MISSING` — **not** silent 0₫ |
| **KEEP** | FORMULA-412 no published · FORMULA-412-VARS for non-ATT · BOUNDARY-403 Leave/OT |

---

## 4. Error taxonomy FREEZE (ATT-412 vs PREVIEW-STUB)

> Aligns QC-EVAL honesty baseline · DATA BR-PAY-ATT-LINE-01..04 · API-01 §7. **No silent 0.**

| Code | Surface | When (deterministic) | `details.reason` / warnings |
|------|---------|----------------------|-----------------------------|
| **`HRM-PAY-ATT-412`** | **PROCESS** (primary) · period eligibility | No closed `attendance_sheets` covering period/company scope | `NO_CLOSED_SHEET` |
| **`HRM-PAY-ATT-412`** | **PROCESS** | Closed sheet exists · table LIVE · active line **missing** for employee | `ATT_LINE_MISSING` |
| **`HRM-PAY-ATT-412`** | **PROCESS** | Closed sheet · line present · `line_locked≠true` **or** required ATT hour key null/non-finite | `ATT_LINE_INCOMPLETE` |
| **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** | **PREVIEW** | Table **ABSENT** + needed ATT keys | `ATT_TIMESHEET_LINE_ABSENT` · `ATT_HOURS_BLOCKED_UNTIL_LINE` |
| **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** | **PREVIEW** | Table LIVE but sheet open/missing **or** line incomplete + needed ATT keys | `ATT_HOURS_VAR_BAG_INCOMPLETE` (honest staging — **not** LIVE) |
| **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** | **PREVIEW** | Opaque / unsupported `expression_json` | existing evaluator path (must_keep QC AC1) |
| **`HRM-PAY-FORMULA-412-VARS`** | PREVIEW/PROCESS | Missing **non-ATT** required keys (C&B) | retain CB bag honesty |
| **`HRM-PAY-FORMULA-412`** | PROCESS | No active published formula | must_keep no silent 0₫ |
| **`HRM-PAY-BOUNDARY-403`** | any | Leave/OT/REC HTTP dependency detected in PAY calculate | must_keep |

### 4.1 Explicit non-mix rules

| Forbidden | Why |
|-----------|-----|
| PROCESS returns **2xx** with ATT hours defaulted to `0` | Dishonest fidelity — QC residual class |
| PREVIEW returns **ATT-412** for table ABSENT only | Breaks QC AC4a PREVIEW-STUB baseline — use **PREVIEW-STUB** |
| PROCESS returns **PREVIEW-STUB** for open sheet | Breaks QC AC4b — use **ATT-412** |
| Use `HRM-PAY-FORMULA-412-VARS` alone for missing ATT hours on PROCESS when sheet open/incomplete | Prefer **ATT-412** (timesheet fidelity) per DATA SA hint |

### 4.2 Validation matrix (API)

| ID | Condition | API code |
|----|-----------|----------|
| VAL-PAY-ATT-LINE-01 | PROCESS open/missing sheet | `HRM-PAY-ATT-412` |
| VAL-PAY-ATT-LINE-02 | PROCESS closed + line incomplete | `HRM-PAY-ATT-412` + `ATT_LINE_INCOMPLETE` |
| VAL-PAY-ATT-LINE-03 | PREVIEW table ABSENT + ATT required | `412-PREVIEW-STUB` + `ATT_TIMESHEET_LINE_ABSENT` |
| VAL-PAY-ATT-LINE-04 | PREVIEW incomplete hours + ATT required | `412-PREVIEW-STUB` + `ATT_HOURS_VAR_BAG_INCOMPLETE` |
| VAL-PAY-ATT-LINE-05 | Invent numeric 0 for missing ATT key | **FORBIDDEN** |
| VAL-ATT-AGG-01 | AGG on closed sheet | `409 HRM-ATT-SHEET-LOCKED` |
| VAL-ATT-AGG-02 | Close without `line_locked` update | **FAIL** BE DoD |
| VAL-ATT-LINE-SCOPE | AGG/get line scope ≠ sheet list | **FAIL** U19 |

---

## 5. Capability map (this seat)

| Cap | F-id | Nest path / symbol | Status |
|-----|------|--------------------|--------|
| Aggregate write lines | **F-ATT-SHEET-AGG-01** | `POST …/attendance-sheets/:sheetId/aggregate` (+ submit hook) | **F.1 CONFIRMED** |
| Close lock lines | **F-ATT-SHEET-02** EXPAND | `POST …/close` + `line_locked=true` | **F.1 CONFIRMED** |
| Reopen archive lines | **F-ATT-SHEET-03** EXPAND | `POST …/reopen` | **F.1 CONFIRMED** |
| Closed precheck + line read | **F-PAY-ATT-CLOSED-01** EXPAND | internal + process | **F.1 CONFIRMED** |
| Preview bag hours | **F-PAY-FORMULA-PREVIEW-01** EXPAND | `POST …/formulas/:id/preview` | **F.1 CONFIRMED** |
| Process bag hours | **F-PAY-PROCESS-01** EXPAND | `POST …/periods/:id/process` | **F.1 CONFIRMED** |

---

## 6. Dev unlock gate

| Gate | Status |
|------|--------|
| DATA-ATT-LINE physical CONFIRMED | **YES** (prior) |
| API F.1 AGG + bag + taxonomy | **YES — this file** |
| **dev-be ATT** `ensureAttTimesheetLineSchema` + AGG + close lock + reopen archive | **UNLOCKED** |
| **dev-be PAY** `loadAttHoursFromClosedLine` in `buildPayFormulaVariableBag` | **UNLOCKED** |
| QA UF hours LIVE / J-HRM-07 process | **BLOCKED** until BE READY_FOR_QA |
| `payroll_e2e_ready` | Remains **false** |
| Formula LIVE / Phase1 DONE | **DENIED** |

**Split seats allowed:** `…-BE-ATT-LINE-ATT-01` then `…-BE-ATT-LINE-PAY-01` — or single dual-lane BE with clear completion_report sections.

---

## 7. Non-claims / cấm

- No `apps/**` / Nest ensureSchema / migrations this seat.
- No seed (U65).
- No wipe ATT header/sign schema.
- No invent VIEW-over-`attendance_records` as PAY SoT.
- No flip `payroll_e2e_ready` / claim LIVE / claim G-PAY-F-06 CLOSED at runtime.
- No invent `work_days` into `gd1_eval_v1` allow-list.

---

## 8. Client API_DESIGN DOC-DELTA (pointer · ADD-only)

**File:** `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md`

| Change | Detail |
|--------|--------|
| **UPGRADE** | F-ATT-SHEET-AGG — Nest path `…/attendance/attendance-sheets/{id}/aggregate`; DTO↔`att_timesheet_line` per DATA-ATT-LINE §2; submit invokes AGG |
| **UPGRADE** | F-ATT-SHEET-02 — explicit `line_locked=true` (already paper) |
| **UPGRADE** | F-PAY-FORMULA-PREVIEW-01 — hours bind when line LIVE; ABSENT/incomplete → PREVIEW-STUB (not «BLOCKED forever») |
| **UPGRADE** | F-PAY-ATT-CLOSED-01 — SELECT locked line → ATT hour vars |
| **KEEP** | Sign ladder · soft-delete · `payroll_e2e_ready=false` · P1–P6 |
| **FORBIDDEN** | Wipe AGG/sign blocks · invent VIEW silent 0 |

---

## 9. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` → dispatch **dev-be** (ATT+PAY dual or split)
- **evidence_path:** `docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-att-line-01.md`
