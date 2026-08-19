# PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01 — API F.1 · Ranh giới PAY chỉ đọc bảng công chốt · RETAIN bind/412/eligibility/bag + GAP boundary (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-37 seat **#42**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-PAY-ATT-CLOSED-01** · **pay_period_timesheet_bind** GET/POST · **GET eligibility** (`NO_CLOSED_SHEET`) · **POST process** precheck **`HRM-PAY-ATT-412`** · peer **F-ATT-SHEET-04** · **TRACE HOLD** **F-PAY-CB-READ-01** / **F-PAY-RD-APPLY-01** · **GAP** **R-PAY-01-BOUNDARY** (static **`HRM-PAY-BOUNDARY-403`** **XOR** TM audit GĐ1 — **no** `pay_boundary_crossread_*` table without future closable DATA ADD) · **HOLD** full **F-PAY-PROCESS-01** = PAY-02/06 · physical **`/api/hrm/payroll/*`** · paper `/api/hrm/pay/*` **alias only** · Nest `@Controller('core')` **DENY** as ATT hour SoT · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED RETAIN + GAP MAP** — LIVE bind closed assert · eligibility · process 412 · `loadAttHoursFromClosedLine` **PRESENT** (grep 2026-08-10) · boundary static gate **unproven** · **unlock dev-be BE-01** (residual wire only) · **dev-fe FE-01 HOLD** (bind/eligibility UI) · **≠ PAY-01 / FR-UC-BP-PAY-01 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-01` · `FR-UC-BP-PAY-01` · **BR-BP-TS-03** · peer **BR-BP-TS-02** (ATT-11) · cross **FR-UC-BP-PAY-06** AC-PAY-HIRE-01 |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) (**F-ATT-SHEET-04**) · **must_keep** **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_data** | DATA-01 §4.1–4.3 closed boundary · §10 error map · R-PAY-01-BOUNDARY waiver |
| **ref_ba** | BA-01 — AC-PAY-01-* · **J-HRM-PAY-01-01..07** DRAFT · regression **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** |
| **ref_sa** | SA-01 §5 F.1 outline |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-01** · Diễn biến **#1–#3** · **FAIL** cross-read leave/OT · **Thành công** (một nguồn giờ — **≠** full process DONE) |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — **F-PAY-ATT-CLOSED-01** · **F-PAY-PROCESS-01** (HOLD footer) · **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** · **F-ATT-SHEET-04** |
| **ref_code_cite** | **read-only 2026-08-10:** `payroll.controller.ts` (eligibility · process · timesheet-binds) · `pay-period-input-pack.service.ts` (`assertClosedSheetForBind`) · `payroll.service.ts` (`loadPayrollEligibility` · `processPayrollPeriod` + **HRM-PAY-ATT-412**) · `pay-formula-variable-bag.ts` (`loadAttHoursFromClosedLine` · warnings **`NO_CLOSED_SHEET`** / **`ATT_LINE_NOT_LOCKED`**) · grep **`att_leave_hold` CREATE = 0** · **`HRM-PAY-BOUNDARY-403` wire = unproven** |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** bind/412/bag alone = PAY-01 DONE · **DENY** partial process = module UAT |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (optional boundary static gate · display-ready DTO hardening if gap) · **dev-fe FE-01 HOLD** · **qa** U65 **J-HRM-PAY-01-*** · **qc** GWC C-SLICE |

---

## 1. Verdict — RETAIN closed-sheet boundary + documented GAP boundary

| Decision | Stamp |
|----------|--------|
| Hour SoT (F-PAY-ATT-CLOSED-01) | **RETAIN cite** — `loadAttHoursFromClosedLine` · closed header + `line_locked` · prefer `pay_period_timesheet_bind` · **cấm** Leave/OT HTTP (**O1** · **BR-BP-TS-03**) |
| Bind closed gate | **RETAIN** — `assertClosedSheetForBind` → **`HRM-PAY-ATT-412`** on non-`closed` (**O3**) |
| Eligibility | **RETAIN** — **`GET …/eligibility`** · `reasons[]` includes **`NO_CLOSED_SHEET`** (**O5**) |
| Process precheck | **RETAIN** — **`POST …/process`** · `require_closed_timesheet` + `!has_closed_sheet` → **412** **`HRM-PAY-ATT-412`** (**O4**) |
| Peer ATT sheet read | **RETAIN** — **F-ATT-SHEET-04** · **ATT11QC1** prerequisite narrative (**O2**) |
| Cross-read detect | **GAP** — **R-PAY-01-BOUNDARY** · **`HRM-PAY-BOUNDARY-403`** **XOR** TM manual audit · **no** boundary audit table this seat (**O7** · DATA §4.3 waiver) |
| C&B / RD | **TRACE HOLD** — **F-PAY-CB-READ-01** / **F-PAY-RD-APPLY-01** · **≠ PAY-01 DONE** (**O8**) |
| Full orchestrator | **HOLD** — **F-PAY-PROCESS-01** eval/split/formula depth = **PAY-02/06** (**O9**) |
| ATT-12/07 regression | **must_keep** seals · **DENY reopen** **J-HRM-ATT-12-*** / **J-07-03..05** / **J-06-04** (**O10**) |

```text
  ATT11QC1 (close+lock) · ATT12QC1 (panel ≠ PAY trigger) · ATT10 funnel · ATT09 pending_days
  Nest /core DENY hour SoT · honesty false · C-SLICE · payroll_e2e_ready=false
       │
       ▼
  FR-UC-BP-PAY-01 (API-01 — RETAIN + gap boundary)
       │
       ├─ RETAIN LIVE (cite — necessary not sufficient)
       │    GET/POST …/payroll/periods/{id}/timesheet-binds (closed assert)
       │    GET …/payroll/periods/{id}/eligibility (NO_CLOSED_SHEET)
       │    POST …/payroll/periods/{id}/process (412 precheck + partial orchestrator)
       │    Internal loadAttHoursFromClosedLine (formula bag + process)
       │    Peer GET …/attendance/attendance-sheets/{id} when closed
       │
       ├─ GAP (dev-be BE-01 after this stamp — no invent table)
       │    R-PAY-01-BOUNDARY: static detect Leave/OT HTTP → HRM-PAY-BOUNDARY-403
       │         XOR technical-manager Network audit AC-PAY-01-BOUNDARY GĐ1
       │
       ├─ TRACE HOLD (≠ DONE)
       │    F-PAY-CB-READ-01 · F-PAY-RD-APPLY-01 (internal facade steps)
       │
       └─ HOLD footer
            F-PAY-PROCESS-01 full depth = PAY-02/06
            att_leave_hold · merge buckets · Nest /core hour SoT
            claim bind/412/bag = PAY-01 DONE
```

**Invariant PAY-01-PATH:** Bind/process/eligibility **MUST** hit **`/api/hrm/payroll/`** · hour read **MUST** use closed `attendance_sheets` + `att_timesheet_line` — Nest **`/api/hrm/core/**`** as ATT hour SoT = **FAIL** (**AC-PAY-01-PATH**).

**Invariant PAY-01-≠-BIND-DONE:** Single bind **2xx** or bind table exists alone = FR-PAY-01 DONE = **FAIL** (**O9/O12**).

**Invariant PAY-01-≠-412-DONE:** **`HRM-PAY-ATT-412`** handler alone = module DONE = **FAIL** (**O4/O9**).

**Invariant PAY-01-≠-CROSS-READ:** `leave-requests` / OT calculate HTTP for hour vars during process = **FAIL** (**BR-BP-TS-03** · **O1/O7**).

**Invariant PAY-01-HOLD-DUAL:** Invent physical **`att_leave_hold`** = **FAIL** (**ATT09QC1** · **O11**).

**Invariant PAY-01-U19:** `payroll/periods` list/get · `timesheet-binds` · `eligibility` · `process` **same** `resolveHrmListScope` / period `company_id` (Plane B TEXT slug) as ATT `attendance_sheets` get-by-id for bound header.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-01 / FR-UC-BP-PAY-01 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`**  
> **F-PAY-PROCESS-01 full = PAY-02/06 HOLD** · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · bind/412/bag **necessary not sufficient**  
> **R-PAY-01-BOUNDARY:** no `pay_boundary_crossread_*` DDL this seat · app 403 **XOR** TM audit OK  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Period eligibility (RETAIN)** | **`GET /api/hrm/payroll/periods/:periodId/eligibility`** |
| **Period process (RETAIN partial · HOLD full)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Timesheet bind (RETAIN)** | **`GET /api/hrm/payroll/periods/:periodId/timesheet-binds`** · **`GET …/timesheet-binds/:bindId`** · **`POST …/timesheet-binds`** · **`POST …/timesheet-binds/:bindId/archive`** |
| **F-PAY-ATT-CLOSED-01 (RETAIN internal)** | **`loadAttHoursFromClosedLine`** in `pay-formula-variable-bag.ts` — invoked from process/preview bag build · **no** standalone public HTTP GĐ1 |
| **ATT peer closed sheet (RETAIN)** | **`GET /api/hrm/attendance/attendance-sheets/:id`** (**F-ATT-SHEET-04**) |
| **C&B read (TRACE HOLD)** | Internal facade — paper `GET /api/hrm/core/employees/{id}/compensation` — **alias only** · orchestrator-internal |
| **RD apply (TRACE HOLD)** | Internal filter step — paper reward-discipline query — orchestrator-internal |
| **Boundary detect (GAP)** | **No HTTP** until wired — prefer **403** on process path · **no** invent audit table |
| **LOGICAL (paper)** | `/api/hrm/pay/periods/*` — **alias** mapped to **`/api/hrm/payroll/periods/*`** |
| **Controller** | Nest `@Controller('payroll')` · **`@Controller('core')` ABSENT** as ATT hour SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-PAY-ATT-CLOSED-01 | internal bag loader | `attendance_sheets` + `att_timesheet_line` |
| pay_period_timesheet_bind | timesheet-binds routes | `pay_period_timesheet_bind` |
| F-PAY-PROCESS-01 | POST process | `payroll_periods` · `payroll_payslips` (+ lines) **partial** |
| Eligibility projection | GET eligibility | `employees` + closed-sheet probe |
| F-ATT-SHEET-04 | GET attendance-sheets | `attendance_sheets` (+ lines when expanded) |
| Paper `att_leave_hold` | — | **`employee_leave_balances.pending_days`** only · **DENY** table |
| `pay_boundary_crossread_*` | — | **ABSENT** · DATA HOLD waiver |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| `assertClosedSheetForBind` | `pay-period-input-pack.service.ts` | **RETAIN** **AC-PAY-01-BIND-*** |
| `POST timesheet-binds` | `payroll.controller.ts` | **RETAIN** |
| `GET eligibility` + `NO_CLOSED_SHEET` | `payroll.service.ts` + spec | **RETAIN** **AC-PAY-01-ELIG-NO-CLOSED** |
| `POST process` + **HRM-PAY-ATT-412** | `processPayrollPeriod` | **RETAIN** **AC-PAY-01-PROCESS-412** |
| `loadAttHoursFromClosedLine` | `pay-formula-variable-bag.ts` | **RETAIN** **AC-PAY-01-HOUR-SOT** · **LINE-LOCKED** warnings |
| Prefer bind on bag load | `resolveBoundClosedSheetIds` | **RETAIN** |
| **HRM-PAY-BOUNDARY-403** | grep wire **unproven** | **GAP** **R-PAY-01-BOUNDARY** |
| `pay_boundary_crossread_*` | **ABSENT** | **DENY invent** (DATA waiver) |
| Full formula eval/split | partial/staged | **HOLD** PAY-02/06 |
| `att_leave_hold` | CREATE **0** | **DENY invent** |
| Nest `/core` PAY hour SoT | **ABSENT** | **DENY** |

---

## 4. F.1 — endpoints (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** (FR-UC-BP-PAY-01 Diễn biến #) · Request/Response ↔ DB · Lỗi.

### 4.1 F-PAY-PERIOD-BIND-01 — GET danh sách gắn kỳ ↔ bảng công (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/periods/:periodId/timesheet-binds`** |
| **Paper alias** | `GET /api/hrm/pay/periods/{periodId}/timesheet-binds` |
| **Mục đích** | C&B xem các liên kết kỳ lương ↔ header bảng công đã gắn (AMIS chuyển công) trước khi chạy tính lương. |
| **Nghiệp vụ xử lý** | Resolve `payroll_periods` by `periodId` + **U19** scope (`company_id` query/header vs token) · SELECT `pay_period_timesheet_bind` active rows for period · join display `attendance_sheets.status` · `timesheetDisplayLabel` / `timesheetStatus` **display-ready** (closed expected for PAY hour path) · optional `include_archived` · **không** tạo bind · **không** đọc leave/OT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#1** (chọn kỳ · xác nhận gắn bảng) · **AC-PAY-01-BIND-CLOSED** (read-back) · **J-HRM-PAY-01-01** · **J-HRM-PAY-01-02** |
| **Request → DB** | Read `payroll_periods` · `pay_period_timesheet_bind` · `attendance_sheets` (status, dates, label) |
| **Response** | `{ items: [{ bindId, payrollPeriodId, timesheetHeaderId, timesheetStatus, timesheetDisplayLabel, transferKind?, archivedAt? }] }` envelope **`HRM-PAY-INP-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **404** period out of scope |

### 4.2 F-PAY-PERIOD-BIND-02 — GET chi tiết một bind (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/periods/:periodId/timesheet-binds/:bindId`** |
| **Paper alias** | same under `/pay/` |
| **Mục đích** | Deep link / audit một dòng gắn kỳ ↔ sheet (list→detail parity U19). |
| **Nghiệp vụ xử lý** | Assert bind belongs to `periodId` · same scope resolver as list · return single bind DTO + sheet status · **cấm** expose draft sheet as eligible for PAY without status field. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#1–#2** · **J-HRM-PAY-01-02** |
| **Request → DB** | Read `pay_period_timesheet_bind` · `attendance_sheets` |
| **Response** | Single bind DTO · **`HRM-PAY-INP-200`** |
| **Lỗi** | **404** bind/period · **`HRM-SCOPE-409`** |

### 4.3 F-PAY-PERIOD-BIND-03 — POST gắn header bảng công (**RETAIN** · closed assert)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/timesheet-binds`** |
| **Paper alias** | `POST /api/hrm/pay/periods/{periodId}/timesheet-binds` |
| **Mục đích** | Gắn kỳ lương với **một** header bảng công **đã chốt** — tiên quyết **BR-BP-TS-02** / **ATT11QC1**. |
| **Nghiệp vụ xử lý** | Body `{ timesheetHeaderId, transferKind?, note? }` · load period + scope · **`assertClosedSheetForBind`**: header **`status` MUST = `closed`** · date range overlaps period window · company scope match (expanded OU for holding `main`) · on pass INSERT `pay_period_timesheet_bind` · on fail **`412`** **`HRM-PAY-ATT-412`** (family) — **no** fake bind row · draft/submitted header → reject (**AC-PAY-01-BIND-DRAFT-412**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#1–#2** · FAIL gắn nháp · **AC-PAY-01-BIND-CLOSED** · **AC-PAY-01-BIND-DRAFT-412** · **J-HRM-PAY-01-02** · **J-HRM-PAY-01-03** |
| **Request → DB** | Read `attendance_sheets` · write `pay_period_timesheet_bind` |
| **Response** | **201** bind row + `timesheetStatus=closed` display fields · **`HRM-PAY-INP-201`** |
| **Lỗi** | **`HRM-PAY-ATT-412`** (not closed / no overlap) · **`HRM-SCOPE-409`** · **404** sheet |

### 4.4 F-PAY-PERIOD-BIND-04 — POST archive bind (**RETAIN cite**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/timesheet-binds/:bindId/archive`** |
| **Mục đích** | Gỡ/archive liên kết khi policy cho phép — không mutate ATT header. |
| **Nghiệp vụ xử lý** | Scope + ownership check · soft-archive bind row · **không** reopen ATT sheet · PAY hour path must re-bind closed sheet before process. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#1** (điều chỉnh gắn) — peer admin |
| **Request → DB** | Update `pay_period_timesheet_bind.archived_at` (or equivalent) |
| **Lỗi** | **404** · **`HRM-SCOPE-409`** |

### 4.5 F-PAY-ELIGIBILITY-01 — GET đủ điều kiện tính lương theo NV (**RETAIN** · **`NO_CLOSED_SHEET`**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/periods/:periodId/eligibility`** |
| **Paper alias** | paper payroll eligibility under `/pay/` |
| **Mục đích** | C&B xem trước danh sách NV eligible/ineligible và **lý do** — đặc biệt thiếu bảng công chốt kỳ (**PAY-06** peer **AC-PAY-HIRE-01**). |
| **Nghiệp vụ xử lý** | Load period · **`loadPayrollEligibility`**: `require_closed_timesheet` (policy flag) · `has_closed_sheet` probe (calendar month aligned with period — **cấm** any random closed sheet) · per employee: `eligible = active && has_closed_sheet` (when require closed) · push **`NO_CLOSED_SHEET`** into `reasons[]` when period lacks closed sheet · additional reasons (`NOT_ACTIVE`, `HIRE_MID_MONTH`) **RETAIN** · **main↔holding** employee filter (**cấm** silent empty `items[]`) · **DENY** `att_leave_hold` table — hold semantics = **`pending_days`** peer only. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#2** · **FR-UC-BP-PAY-06** AC-PAY-HIRE-01 · **AC-PAY-01-ELIG-NO-CLOSED** · **J-HRM-PAY-01-03** · **J-HRM-PAY-01-04** (context) |
| **Request → DB** | Read `payroll_periods` · `employees` · probe `attendance_sheets` closed for period month |
| **Response** | `{ require_closed_timesheet, has_closed_sheet, eligible_count, ineligible_count, items: [{ employee_id, employee_code, employee_name, hire_date, eligible, reasons[] }] }` · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **404** period |

### 4.6 F-PAY-ATT-CLOSED-01 — Preconditions đọc giờ từ sheet chốt (**RETAIN internal**)

| | |
|--|--|
| **METHOD / path** | **Internal** — `loadAttHoursFromClosedLine(db, { companyId, employeeId, periodFrom, periodTo, periodId?, requiredKeys? })` · consumed by **F-PAY-PROCESS-01** / formula preview bag |
| **Paper alias** | Precheck step cited on `POST …/process` in `API_DESIGN_HRM_ENTERPRISE.md` |
| **Mục đích** | Đảm bảo mọi biến **giờ** kỳ lấy từ `attendance_sheets.status=closed` + `att_timesheet_line` với **`line_locked=true`** — **cấm** HTTP leave-requests / OT endpoints (**BR-BP-TS-03** · I-3 · D8 · P1). |
| **Nghiệp vụ xử lý** | (1) If `periodId` → **prefer** active `pay_period_timesheet_bind` closed header ids. (2) Else resolve closed sheet by month/window overlap. (3) SELECT line for `employee_id` where `line_locked=true` · map funnel cols → `payable_hours`, `ot_hours_weighted`, `paid_leave_hours`, `unpaid_leave_hours`, `standard_hours` — **omit** null keys (**cấm** silent 0). (4) Missing sheet → warnings **`NO_CLOSED_SHEET`** · unlocked line → **`ATT_LINE_NOT_LOCKED`** / omit vars. (5) **DENY** parallel leave/OT HTTP in this loader (comment + architecture). (6) **DENY** merge compensatory/sick/carry into annual hour keys on read. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#2–#3** · **FAIL** đọc leave/OT · **Thành công** (một nguồn giờ — với footer **≠** full PAY DONE) · **AC-PAY-01-HOUR-SOT** · **AC-PAY-01-LINE-LOCKED** · **J-HRM-PAY-01-05** |
| **Request → DB** | Read `pay_period_timesheet_bind` · `attendance_sheets` · `att_timesheet_line` |
| **Response** | `{ vars: Record<string, number>, warnings: string[], attHoursReady, attHoursReason }` — internal |
| **Lỗi** | Contributes to **`HRM-PAY-ATT-412`** at orchestrator when hard-fail policy · bag warnings surfaced in process `warnings[]` when soft |

### 4.7 F-PAY-PROCESS-01 — Chạy tính lương kỳ (**RETAIN precheck · HOLD full orchestrator**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Paper alias** | `POST /api/hrm/pay/periods/{id}/process` |
| **Mục đích** | Orchestrate tính lương kỳ: precheck closed sheet · nạp biến giờ/C&B/RD · (khi formula wave LIVE) eval công thức → phiếu preview — **GĐ1 PAY-01 slice** = boundary + partial payslip path **≠** module DONE. |
| **Nghiệp vụ xử lý** | **RETAIN (PAY-01 in-scope):** (a) Scope + period state guards. (b) **`loadPayrollEligibility`** — if `require_closed_timesheet && !has_closed_sheet` → **`412`** **`HRM-PAY-ATT-412`** (**no** payslip storm). (c) Invoke **F-PAY-ATT-CLOSED-01** per employee via variable bag. (d) Surface eligibility/filter for auto-enroll subset. **HOLD (PAY-02/06 — OUT PAY-01 DONE):** full component SRC resolver · split segments · published formula eval depth · template snapshot hot-swap guards — per paper `API_DESIGN` §F-PAY-PROCESS-01 paragraphs (5)–(7). **TRACE internal steps:** **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** when orchestrator reaches P2/P3. **GAP:** if runtime detects Leave/OT HTTP dependency → **`HRM-PAY-BOUNDARY-403`** (**R-PAY-01-BOUNDARY**) **or** QA/TM audit per **AC-PAY-01-BOUNDARY**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#2** (từ chối chưa chốt) · **#3** (nạp biến — partial LIVE) · **Thành công** (footer **AC-PAY-01-≠-PROCESS-DONE**) · **AC-PAY-01-PROCESS-412** · **AC-PAY-01-PROCESS-HOLD** · **J-HRM-PAY-01-04** · **J-HRM-PAY-01-05** |
| **Request → DB** | Read ATT closed + binds + employees + (partial) C&B/RD + formula defs; write `payroll_payslips` / lines when partial path runs |
| **Response** | **202** `{ period_id, payslip_count?, preview_totals?, warnings[] }` · **`HRM-PAY-202`** when success path |
| **Lỗi** | **`HRM-PAY-ATT-412`** · **`HRM-PAY-BOUNDARY-403`** (GAP wire) · **`HRM-PAY-FORMULA-412`** (formula wave) · **`HRM-SCOPE-409`** |

### 4.8 F-ATT-SHEET-04 — GET bảng công (peer RETAIN · PAY whitelist khi `closed`)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/attendance-sheets/:id`** (physical path; expand lines per ATT module) |
| **Paper alias** | F-ATT-SHEET-04 |
| **Mục đích** | PAY/FE đọc metadata sheet đã chốt để chọn bind · ATT UI đọc draft/submitted — **PAY hour SoT** chỉ khi `status=closed` (**ATT11QC1**). |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-11 seal · U19 scope parity with ATT list/get · PAY orchestrator **không** dùng draft lines for hour vars · **≠** invent PAY DONE on GET alone. |
| **Tham chiếu bước SRS** | Peer **FR-UC-BP-ATT-11** · **FR-UC-BP-PAY-01** Diễn biến **#2** · **AC-PAY-01-MK-ATT11** · **J-HRM-PAY-01-02** |
| **Request → DB** | Read `attendance_sheets` (+ optional lines) |
| **Lỗi** | **404/409** scope · orchestrator **412** when PAY consumes non-closed |

### 4.9 F-PAY-CB-READ-01 — Nạp biến C&B từ CORE (**TRACE HOLD · ≠ PAY-01 DONE**)

| | |
|--|--|
| **METHOD / path** | **Internal** facade during **F-PAY-PROCESS-01** — paper `GET /api/hrm/core/employees/{id}/compensation` (**alias only**) |
| **Mục đích** | Lấy lương nền, phụ cấp, BH, MST, GTCG theo timeline trong kỳ — **không** từ serializer hồ sơ công khai. |
| **Nghiệp vụ xử lý** | **TRACE** mapping to Diễn biến **#3** P2 · depth/eval **HOLD** PAY-06/CORE waves · **cấm** claim partial bag = PAY-01 DONE · **cấm** Nest `/core` controller invent as duplicate hour SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#3** P2 · **AC-PAY-01-CB-TRACE** |
| **Request → DB** | Read `hrm_employee_compensation`, dependents, SI enrollment (existing slices) |
| **Lỗi** | **`HRM-CORE-CB-403`** when policy blocks |

### 4.10 F-PAY-RD-APPLY-01 — Áp KT/KL đã thi hành (**TRACE HOLD · ≠ PAY-01 DONE**)

| | |
|--|--|
| **METHOD / path** | **Internal** step inside **F-PAY-PROCESS-01** — paper filter reward-discipline by `payroll_period_id` |
| **Mục đích** | Chỉ case **đã thi hành** + có số tiền → dòng thưởng/phạt trên phiếu kỳ. |
| **Nghiệp vụ xử lý** | **TRACE** Diễn biến **#3** P3 · CORE-08 peer · **HOLD** full enforce depth · skip silent **cấm** — return `skipped_pending` in preview when wired. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-08** · **FR-UC-BP-PAY-01** **#3** P3 · **AC-PAY-01-RD-TRACE** |
| **Request → DB** | Read `hrm_reward_discipline`; write `payroll_payslip_lines` when LIVE |
| **Lỗi** | Policy skip must be visible in preview metadata |

### 4.11 R-PAY-01-BOUNDARY — Phát hiện đọc chéo Leave/OT (**GAP · no audit table**)

| | |
|--|--|
| **METHOD / path** | **No dedicated REST** GĐ1 — behavior on **`POST …/process`** (and optionally preview) |
| **Mục đích** | Thực thi **FAIL thiết kế** khi engine gọi HTTP leave-requests / OT để lấy biến **giờ** thay vì funnel `att_timesheet_line` (**BR-BP-TS-03**). |
| **Nghiệp vụ xử lý** | **Option A (preferred residual):** static guard / code audit in payroll calculate path → **`403`** **`HRM-PAY-BOUNDARY-403`** with actionable VI message. **Option B (XOR):** if wire not proven — **technical-manager** manual Network audit per **AC-PAY-01-BOUNDARY** (process window · **zero** leave/OT hour HTTP). **DATA-01 HOLD waiver:** **no** `pay_boundary_crossread_log` table · **no** DDL this seat · **DENY** QA FAIL solely for missing table when app/TM path documented. **Trigger future ADD:** BA+SA closable writer + idempotent migration — **not** before proven. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **FAIL** (cross-read) · **AC-PAY-01-≠-CROSS-READ** · **AC-PAY-01-BOUNDARY** · **J-HRM-PAY-01-06** |
| **Request → DB** | **None** (app-only) |
| **Lỗi** | **`HRM-PAY-BOUNDARY-403`** · or TM audit PASS with evidence path |

---

## 5. Display-ready DTO lock (FE / QA)

| Field / code | Semantics | FE expectation |
|--------------|-----------|----------------|
| `timesheetStatus` | `closed` \| `submitted` \| `open` | Bind UI: only promote **POST** when user selected **closed** sheet |
| `require_closed_timesheet` | boolean | Show banner when true and `has_closed_sheet=false` |
| `has_closed_sheet` | boolean period-level | Drives collective **NO_CLOSED_SHEET** on items |
| `reasons[]` | includes **`NO_CLOSED_SHEET`** | **AC-PAY-01-ELIG-NO-CLOSED** — visible list · **≠** silent eligible |
| **`HRM-PAY-ATT-412`** | bind + process family | **412** · actionable VI · **no** fake bind row |
| `warnings[]` (process/bag) | `NO_CLOSED_SHEET` · `ATT_LINE_NOT_LOCKED` | **≠** display 0h silently (**AC-PAY-01-LINE-LOCKED**) |
| **`HRM-PAY-BOUNDARY-403`** | GAP | Design failure banner |

---

## 6. Scope parity (U19)

| Surface | Rule |
|---------|------|
| `GET/POST …/payroll/periods/{id}/*` | Same `resolveHrmListScope` + period `company_id` (TEXT slug) as period list/get |
| `timesheet-binds` | Bound `attendance_sheets.company_id` must match period OU expansion (`expandPayrollAttendanceSheetCompanyIds`) |
| `eligibility` items | Employee filter **∩** period OU — **cấm** silent `items=[]` for holding CEO |
| `GET attendance-sheets/{id}` (peer) | Same resolver as ATT module list/get-by-id |
| Future boundary store | If ever ADD — must key `company_id` + `period_id` consistent with process run |

---

## 7. Traceability matrix (API → AC → J-*)

| API § | AC | Journey |
|-------|-----|---------|
| §4.3 bind POST | AC-PAY-01-BIND-* | J-02 · J-03 |
| §4.5 eligibility | AC-PAY-01-ELIG-NO-CLOSED | J-03 |
| §4.7 process | AC-PAY-01-PROCESS-412 · ≠-PROCESS-DONE | J-04 · J-05 |
| §4.6 bag | AC-PAY-01-HOUR-SOT · LINE-LOCKED | J-05 |
| §4.11 boundary | AC-PAY-01-BOUNDARY · ≠-CROSS-READ | J-06 |
| §4.8 peer sheet | AC-PAY-01-MK-ATT11 | J-02 |
| Footer | AC-PAY-01-H · MK-PEERS | J-07 · regression J-ATT-12/07/06 |

---

## 8. RETAIN vs GAP vs HOLD summary

| F-id / residual | Verdict | Owner |
|-----------------|---------|-------|
| F-PAY-PERIOD-BIND-* | **RETAIN** | dev-fe AC (bind UI) + qa |
| F-PAY-ELIGIBILITY-01 | **RETAIN** | dev-fe list + qa |
| F-PAY-ATT-CLOSED-01 | **RETAIN cite** | dev-be (warnings hardening if needed) |
| F-PAY-PROCESS-01 precheck | **RETAIN** | qa U65 |
| F-PAY-PROCESS-01 full depth | **HOLD** | PAY-02/06 |
| F-ATT-SHEET-04 | **peer RETAIN** | ATT seals |
| F-PAY-CB/RD | **TRACE HOLD** | PAY-06 / CORE-08 |
| R-PAY-01-BOUNDARY | **GAP** | dev-be **XOR** technical-manager |
| `pay_boundary_crossread_*` | **DENY invent** | future DATA+BA only |
| `att_leave_hold` | **DENY invent** | — |

---

## 9. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED RETAIN + GAP MAP** for UC-BP-PAY-01: full **F.1** per §4 (**Mục đích · Nghiệp vụ · SRS Diễn biến #** · DTO↔DB · lỗi) for **timesheet-binds** GET/POST/archive · **GET eligibility** (`NO_CLOSED_SHEET`) · internal **F-PAY-ATT-CLOSED-01** · **POST process** (**HRM-PAY-ATT-412** + **HOLD** full orchestrator) · peer **F-ATT-SHEET-04** · **TRACE** CB/RD · **R-PAY-01-BOUNDARY** (403 **XOR** TM audit · **no** boundary table); **must_keep ATT12QC1+ATT11QC1** + peer chain; **DENY** `att_leave_hold` · merge buckets · Nest `/core` hour SoT · claim bind/412/bag = PAY-01 DONE; docs-only · unlock **dev-be BE-01**; **≠ PAY-01 / payroll_e2e / PAY UAT DONE** · **C-SLICE**. |
| **next_owner** | **dev-be** — `PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md` |
| **residual** | BE optional **HRM-PAY-BOUNDARY-403** wire · FE bind/eligibility · QA **J-HRM-PAY-01-*** · QC GWC · **F-PAY-PROCESS** full PAY-02/06 |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-01 · FR-UC-BP-PAY-01 · BR-BP-TS-03
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-37 seat #42)
depends_on: API-01 CONFIRMED RETAIN+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md · DATA-01 CONFIRMED HOLD (no boundary DDL) · BA O1–O12 · SA Option A · must_keep ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT10/09/07/06/05b/CORE07 chain
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md (§4.6 F-PAY-ATT-CLOSED-01 · §4.7 process · §4.11 R-PAY-01-BOUNDARY GAP)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md (§4.3 boundary waiver · §10 errors)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md (AC-PAY-01-* · J-HRM-PAY-01-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md (F-ATT-SHEET-04 · close peer)
spec_ref: FR-UC-BP-PAY-01 Diễn biến #1–#3 + FAIL cross-read · BR-BP-TS-03 · API-01 §4.11 boundary · AC-PAY-01-BOUNDARY
change_mode: FIX narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (payroll.service · pay-period-input-pack · pay-formula-variable-bag · controller DTO display-ready only if gap) · spec-mapped jest only
forbidden_paths: invent att_leave_hold · pay_boundary_crossread_* migration · merge compensatory/sick/carry into annual hour keys · Nest /core controller · wipe ATT11/12 seals · honesty flags · claim PAY-01 DONE
entry_criteria: hrm-api dev stack · RETAIN bind/412/eligibility/bag LIVE per API-01 §3
exit_criteria:
  1) RETAIN assertClosedSheetForBind + HRM-PAY-ATT-412 + loadPayrollEligibility NO_CLOSED_SHEET (regression jest payroll.service + pay-formula-variable-bag.spec)
  2) GAP R-PAY-01-BOUNDARY: wire static detect → HRM-PAY-BOUNDARY-403 on process path OR document TM audit evidence if defer — XOR per AC-PAY-01-BOUNDARY (no invent audit table)
  3) Display-ready bind/eligibility fields per API-01 §5 if FE gap remains on BE side
  4) U19 scope_parity: period list=get=bind=eligibility=process for holding CEO persona
  5) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-be-01.md · U65 J-HRM-PAY-01-01..07 + regression J-ATT-12-07 · J-ATT-07-03..05 · J-ATT-06-04 when PAY touched
  6) ack_status READY_FOR_QA · explicit ≠ PAY-01 DONE · ≠ payroll_e2e_ready · ≠ PAY module UAT · C-SLICE
cấm: seed · invent boundary table · reopen J-HRM-ATT-12-* / J-07-03..05 / J-06-04 without regression bus · F-PAY-PROCESS full depth claim
```

---

## 10. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| DATA-01 | HOLD RETAIN bind/sheets/lines · NO_CLOSED_SHEET · 412 · boundary waiver §4.3 |
| BA-01 | O1–O12 · AC-PAY-01-* · J-HRM-PAY-01-* |
| SA-01 | Option A LOCKED · R-PAY-01-* residuals |
| ATT-11 SA | F-ATT-SHEET-04 · BR-BP-TS-02 · ATT11QC1 |
| API_DESIGN paper | F-PAY-ATT-CLOSED-01 · F-PAY-PROCESS-01 HOLD footer |

---

*End API-01 · CONFIRMED RETAIN + GAP MAP · unlock dev-be BE-01 · ≠ PAY-01 DONE · 2026-08-10*
