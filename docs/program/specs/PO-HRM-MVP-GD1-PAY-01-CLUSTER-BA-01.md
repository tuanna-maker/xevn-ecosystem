# BA AC pack — Wave-37 PAY cluster · UC-BP-PAY-01 (Ranh giới lương chỉ đọc bảng công chốt · RETAIN bind/412/bag · GAP boundary AC)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-37 seat **#42**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · **ba-data HOLD default** next · dev-be/dev-fe **HOLD** until DATA/API stamp · **DENY** claim bind alone = PAY-01 DONE · **DENY** claim process stub / 412 alone = FR-PAY-01 DONE · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-01 gap-only RETAIN — **no** Nest `/core` dual PAY+ATT hour SoT · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** / peer seals · **DENY reopen J-HRM-ATT-12-*** / **J-HRM-ATT-07-03..05** / **J-HRM-ATT-06-04** without regression bus) |
| **uc_ids** | `UC-BP-PAY-01` · `FR-UC-BP-PAY-01` · **BR-BP-TS-03** · peer **BR-BP-TS-02** (ATT-11 close) · cross **FR-UC-BP-PAY-06** AC-PAY-HIRE-01 trace |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-12 **`ATT12QC1-MSMAIGWC1`** · **`ATT12QA1-MSMAIARP`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** (**pending_days · DENY `att_leave_hold`**) · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · full ATT peer chain |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md` (close+lock · F-ATT-SHEET-04) |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-01** · Diễn biến **#1–#3** · **FAIL** cross-read leave/OT · **Thành công** · **BR-BP-TS-03** |
| **ref_api_paper** | **F-PAY-ATT-CLOSED-01** · **F-PAY-PROCESS-01** (**HOLD** full orchestrator = PAY-02/06) · **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** (trace-only) · **pay_period_timesheet_bind** · peer **F-ATT-SHEET-04** |
| **ref_db** | `attendance_sheets` (`status=closed`) · `att_timesheet_line` (`line_locked`) · `pay_period_timesheet_bind` · `payroll_periods` |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qc-01.md` (**ATT12QC1** must_keep) · `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md` (**ATT07QC1** regression) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** bind/412/bag alone = PAY-01 DONE · **DENY** PAY / ATT module UAT DONE |
| **Cấm** | Nest `/core` dual hour SoT · HTTP leave-requests/OT in calculate path · invent `att_leave_hold` · merge sick/compensatory/carry→annual · flip `payroll_e2e_ready` · reopen sealed ATT journeys without regression · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-37 seat **#42** — **gap-only RETAIN** LIVE ranh giới PAY đọc **chỉ** bảng công **đã chốt** + dòng **`line_locked`** (**F-PAY-ATT-CLOSED-01** · `loadAttHoursFromClosedLine`) · **RETAIN** `pay_period_timesheet_bind` + `assertClosedSheetForBind` · **RETAIN** `loadPayrollEligibility` + **`HRM-PAY-ATT-412`** on **`POST …/payroll/periods/{id}/process`** · **GAP** AC bind UI · eligibility **`NO_CLOSED_SHEET`** · optional **R-PAY-01-BOUNDARY** (403 vs TM audit GĐ1) · **trace-only** C&B/RD (**≠ DONE**) · **bind ATT-11** close spine (**BR-BP-TS-02** · **ATT11QC1**):

1. **Hour SoT** = closed sheet + locked lines only — **cấm** leave/OT HTTP for hour vars (**O1** · **BR-BP-TS-03**).
2. **ATT-11 prerequisite** narrative — close+lock peer **≠ ATT-11 DONE alone** (**O2**).
3. **Bind POST** draft → reject **412** family (**O3**).
4. **Process precheck** no closed sheet → **`HRM-PAY-ATT-412`** (**O4** · Diễn biến **#2** FAIL).
5. **Eligibility** surfaces **`NO_CLOSED_SHEET`** per employee (**O5** · PAY-06 peer).
6. **Line locked** bag omits/warns if `line_locked=false` (**O6** · ATT-LINE-01).
7. **BOUNDARY-403** residual documented (**O7**).
8. **CB/RD** trace rows only (**O8** · **≠ PAY-01 DONE**).
9. **F-PAY-PROCESS-01** full depth = **PAY-02/06** (**O9** HOLD footer).
10. **ATT-12/07 regression** — **DENY reopen** sealed J-* (**O10**).
11. **must_keep** stamps + DENY merge / `att_leave_hold` (**O11**).
12. **Mint J-HRM-PAY-01-*** DRAFT + honesty (**O12**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / Payroll | Chọn kỳ · gắn bind sheet chốt · xem eligibility · (khi policy cho phép) chạy process — **không** «lấy giờ từ đơn OT/phép» trên UI lương |
| Hệ thống PAY | Precheck closed sheet · đọc `att_timesheet_line` locked · map biến giờ · từ chối draft / cross-read |
| ATT-11 (peer) | Cung cấp `status=closed` + `line_locked` — **must_keep ATT11QC1** |
| ATT-12 (peer) | Panel/activate — **≠** trigger PAY · **must_keep ATT12QC1** |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-PAY-01-* · residuals **R-PAY-01-*** | Impl `apps/**` / migration / seed |
| RETAIN cite bind · 412 · bag loader · eligibility reasons | Nest `/core` PAY+ATT dual · invent `att_leave_hold` |
| GAP AC bind UI · boundary audit · journeys | Formula author · payslip depth · **≠ payroll_e2e LIVE** |
| Unlock **ba-data HOLD** default | Claim bind/412 = PAY-01 DONE · PAY module UAT |
| Regression **J-ATT-12** / **J-ATT-07** / **J-06-04** attach | Reopen sealed ATT journeys without bus |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Hour SoT | **YES** — Mọi biến **giờ** kỳ lấy từ `attendance_sheets.status=closed` + `att_timesheet_line` với `line_locked=true` (cols funnel: `payable_hours`, `ot_hours_weighted`, `paid_leave_hours`, `unpaid_leave_hours`) · **cấm** HTTP `leave-requests` / OT endpoints trong path tính giờ · FAIL = **BR-BP-TS-03** / Diễn biến **FAIL** · **AC-PAY-01-HOUR-SOT** · **AC-PAY-01-≠-CROSS-READ** |
| **O2** | ATT-11 bind | **YES RETAIN narrative** — Tiên quyết nghiệp vụ: sheet **đã chốt** theo **BR-BP-TS-02** · cite **`ATT11QC1-MSLXTH9P`** · **≠** claim ATT-11 LIVE alone = ATT-11 DONE · **AC-PAY-01-MK-ATT11** |
| **O3** | Bind POST | **YES RETAIN + AC** — `POST …/payroll/periods/{periodId}/timesheet-binds` với header **draft/submitted** → reject **`HRM-PAY-ATT-412`** (family) · closed header → **2xx** · Network evidence U65 · **AC-PAY-01-BIND-CLOSED** · **AC-PAY-01-BIND-DRAFT-412** |
| **O4** | Process precheck | **YES RETAIN** — `POST …/payroll/periods/{id}/process` khi `require_closed_timesheet` + không có closed bind/sheet → **`412` `HRM-PAY-ATT-412`** · khớp Diễn biến **#2** từ chối · **AC-PAY-01-PROCESS-412** |
| **O5** | Eligibility | **YES RETAIN + AC** — `loadPayrollEligibility` (or GET eligibility surface) · item `eligible=false` có `reasons[]` chứa **`NO_CLOSED_SHEET`** khi thiếu sheet chốt đúng kỳ/pháp nhân · trace PAY-06 **AC-PAY-HIRE-01** peer · **AC-PAY-01-ELIG-NO-CLOSED** |
| **O6** | Line locked | **YES RETAIN** — `loadAttHoursFromClosedLine` / bag: line `line_locked=false` → omit var hoặc warning **`ATT_LINE_NOT_LOCKED`** / **`NO_CLOSED_SHEET`** — **cấm** silent 0₫ giờ UAT · **AC-PAY-01-LINE-LOCKED** |
| **O7** | BOUNDARY-403 | **YES GAP doc** — Prefer residual static detect Leave/OT dependency in process → **`HRM-PAY-BOUNDARY-403`** **XOR** footer **TM manual audit GĐ1** nếu chưa wire · **AC-PAY-01-BOUNDARY** (PASS = no leave/OT HTTP during process Network tab) |
| **O8** | CB/RD trace | **YES trace-only** — **F-PAY-CB-READ-01** / **F-PAY-RD-APPLY-01** mapped to Diễn biến **#3** P2/P3 · **≠** claim partial bag = PAY-01 DONE · **AC-PAY-01-CB-TRACE** · **AC-PAY-01-RD-TRACE** (HOLD depth) |
| **O9** | F-PAY-PROCESS depth | **YES HOLD** — Full orchestrator (eval all components · split · full RD) = **PAY-02 / PAY-06** waves · process stub/payslip partial **≠ PAY-01 DONE** · **AC-PAY-01-≠-PROCESS-DONE** · **AC-PAY-01-PROCESS-HOLD** |
| **O10** | ATT-12/07 regression | **YES must_keep** — **DENY reopen** **J-HRM-ATT-12-*** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** without regression bus + **`ATT12QC1`** / **`ATT07QC1`** stamps · **AC-PAY-01-≠-REOPEN-J12-J07** |
| **O11** | must_keep stamps | **YES** — **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · full ATT peer chain · **DENY** merge sick/compensatory/carry→annual · **DENY** `att_leave_hold` · **AC-PAY-01-MK-PEERS** |
| **O12** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-01-01..07` DRAFT** · U65 FE-after-2xx+F5 · attach regression **J-HRM-ATT-12-07** (subset) · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **C-SLICE** · **AC-PAY-01-H** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Bind period↔sheet (RETAIN) | **`GET/POST …/payroll/periods/{periodId}/timesheet-binds`** | pay_period bind | **#1–#2** |
| Closed-sheet precheck (RETAIN) | Internal **F-PAY-ATT-CLOSED-01** used by process | F-PAY-ATT-CLOSED-01 | **#2–#3** · FAIL |
| Process orchestrator (partial HOLD) | **`POST …/payroll/periods/{id}/process`** | F-PAY-PROCESS-01 | **#2–#3** · **≠ PAY-01 DONE alone** |
| Eligibility (RETAIN) | Payroll eligibility API / loader | PAY-06 peer | **#2** · NO_CLOSED_SHEET |
| GET closed sheet (peer) | **`GET …/attendance/attendance-sheets/{id}`** when `closed` | F-ATT-SHEET-04 | Peer ATT-11 |
| C&B vars (GAP trace) | Internal facade (paper `/core/employees/{id}/compensation`) | F-PAY-CB-READ-01 | **#3** P2 |
| KT/KL (GAP trace) | Internal RD filter | F-PAY-RD-APPLY-01 | **#3** P3 · CORE-08 |

**Invariant PAY-01-PATH:** Bind/process Network **MUST** hit `/api/hrm/payroll/*` + read ATT closed via whitelisted sheet/line paths — Nest `/api/hrm/core/**` as **hour SoT** = **FAIL O1**.

**Invariant PAY-01-≠-BIND-DONE:** Claim `pay_period_timesheet_bind` table or single bind **2xx** alone = FR-PAY-01 / PAY-01 DONE = **FAIL O9/O12**.

**Invariant PAY-01-≠-412-DONE:** Claim **`HRM-PAY-ATT-412`** handler exists alone = module DONE = **FAIL O4/O9/O12**.

**Invariant PAY-01-≠-CROSS-READ:** Any `leave-requests` or OT calculate HTTP during process window = **FAIL O1/O7** (**BR-BP-TS-03**).

**Invariant PAY-01-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O11**.

**Invariant PAY-01-≠-REOPEN-J12-J07:** Demote/reopen **J-HRM-ATT-12-*** or **J-HRM-ATT-07-03..05** or **J-HRM-ATT-06-04** without regression bus = **FAIL O10/O12**.

**Invariant PAY-01-PROCESS-HOLD:** Evidence claiming PAY-01 DONE when F-PAY-PROCESS full eval/split/RD not stamped = **FAIL O8/O9/O12**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-01 / FR-UC-BP-PAY-01 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT** · printable false · must_keep **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · **F-PAY-PROCESS-01 full = PAY-02/06 HOLD** · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY reopen J-HRM-ATT-12-* / J-07-03..05 / J-06-04 · bind/412/bag **necessary not sufficient** · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-37 #42 · Option A) |
|---|----------------------|--------------------------------|
| Bind closed gate | `assertClosedSheetForBind` **PRESENT** | **RETAIN cite** + **AC bind UI** (**O3**) |
| Process 412 | `HRM-PAY-ATT-412` on process **PRESENT** | **RETAIN cite** + U65 **AC-PAY-01-PROCESS-412** (**O4**) |
| Hour bag | `loadAttHoursFromClosedLine` **PRESENT** | **RETAIN cite** + line_locked AC (**O1/O6**) |
| Eligibility reasons | `NO_CLOSED_SHEET` in loader **PRESENT** | **RETAIN cite** + list AC (**O5**) |
| Cross-read detect | **unproven** static gate | **GAP** R-PAY-01-BOUNDARY or TM audit (**O7**) |
| C&B / RD in process | partial / outline | **trace-only** (**O8**) · **≠ DONE** |
| Full F-PAY-PROCESS | partial payslip path | **HOLD** PAY-02/06 (**O9**) |
| ATT-11 close spine | **ATT11QC1 SEALED** | **prerequisite narrative** (**O2**) |
| ATT-12 panel | **ATT12QC1 SEALED** | **must_keep** · **≠** PAY trigger (**O10/O11**) |

### 1.1 Residual map **R-PAY-01-*** (engine unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-01-BOUNDARY** | Static/detect Leave/OT HTTP in calculate | **IN-SCOPE GAP** (or TM audit GĐ1) | **dev-be** after API stamp · **technical-manager** audit XOR |
| **R-PAY-01-ELIGIBILITY** | FE list + reason `NO_CLOSED_SHEET` | **IN-SCOPE AC** | **dev-fe** + **qa** U65 |
| **R-PAY-01-BIND-AC** | Bind UI + draft → 412 | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-01-PROCESS-AC** | Process 412 vs 2xx closed path | **IN-SCOPE AC** | **qa** U65 |
| **R-PAY-01-JOURNEY** | J-HRM-PAY-01-* DRAFT | **IN-SCOPE** (this pack) | **qa** |
| **R-PAY-01-CB-RD** | F-PAY-CB-READ-01 / F-PAY-RD-APPLY-01 depth | **TRACE HOLD** | PAY-06 / CORE-08 waves · **≠ PAY-01 DONE** |
| **F-PAY-PROCESS-01-full** | Orchestrator eval/split/formula | **HOLD footer** | **PAY-02/06** · **≠ PAY-01 DONE** |

**Carry (non-blocking):** Formula author · payslip ESS · AMIS template parity — **do not block** PAY-01 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-TS-03** | Chạy tính lương / nạp biến giờ | Chỉ đọc bảng công **đã chốt** + line locked | **Cấm** HTTP OT/Phép cho giờ | AC-PAY-01-HOUR-SOT · J-01..04 · J-07 |
| **BR-BP-TS-02** (peer) | Chưa đủ ký / chưa close | Không mở PAY giờ | Sheet `closed` prerequisite | AC-PAY-01-MK-ATT11 · J-02 |
| **BR-BP-TS-03-DRAFT** | Sheet nháp/chờ ký | Từ chối bind/process | **412** / eligibility reason | J-03 · J-04 |
| **BR-BP-TS-03-FAIL-DESIGN** | Process phụ thuộc leave/OT API | Dừng kỳ / 403 family | Diễn biến **FAIL** | AC-PAY-01-BOUNDARY |
| **BR-BP-PAY-HIRE** (peer PAY-06) | NV chưa có sheet chốt kỳ | `NO_CLOSED_SHEET` | Không silent eligible | AC-PAY-01-ELIG-NO-CLOSED |
| **BR-BP-LV-06** (peer ATT-09) | Leave hold | `pending_days` | **DENY** `att_leave_hold` table | Regression J-07-04 |
| **BR-BP-LV-03-SEP** (peer ATT-06/07) | Multi-bucket | Display/grant | **DENY** merge compensatory/sick/carry→annual | J-06-04 · J-07 regression |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#1** | Chọn kỳ | **BIND** · period scope | **J-HRM-PAY-01-01** | timesheet-binds RETAIN |
| **#2** | Kiểm tra SoT công | **PROCESS-412** · **ELIG** | **J-HRM-PAY-01-03** · **J-04** | F-PAY-ATT-CLOSED-01 RETAIN |
| **#3** | Nạp giờ + C&B + KT/KL | **HOUR-SOT** · **CB/RD trace** | **J-HRM-PAY-01-05** | bag RETAIN · CB/RD GAP |
| **FAIL** | Cross-read leave/OT | **BOUNDARY** · **≠-CROSS-READ** | **J-HRM-PAY-01-06** | BOUNDARY-403 GAP |
| **Thành công** | Một nguồn giờ | **≠-PROCESS-DONE** footer | **J-HRM-PAY-01-07** | F-PAY-PROCESS HOLD |
| O10/O11 | Peer seals | **MK-PEERS** · **≠-REOPEN** | **J-ATT-12/07/06** regression | — |

### 3.1 AC-PAY-01 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-01-PATH** | Any PAY boundary path | Network | `/payroll/` bind+process · closed sheet read whitelisted · Nest `/core` hour SoT **0** | U65 · J-* |
| **AC-PAY-01-HOUR-SOT** | Period with closed+locked lines | Process or bag load | Vars from `att_timesheet_line` only · funnel cols cited | O1 · J-05 |
| **AC-PAY-01-≠-CROSS-READ** | Process run | DevTools Network | **No** `leave-requests` / OT calc HTTP for hour vars | O1/O7 · J-06 |
| **AC-PAY-01-MK-ATT11** | Footer / narrative | AC text | Cites **BR-BP-TS-02** + **`ATT11QC1`** · **≠ ATT-11 DONE alone** | O2 |
| **AC-PAY-01-BIND-CLOSED** | Closed sheet same company/period | **POST** bind FE | **2xx** · bind row · `timesheetStatus=closed` (display-ready) | O3 · J-02 |
| **AC-PAY-01-BIND-DRAFT-412** | Draft/submitted sheet | **POST** bind FE | **412** `HRM-PAY-ATT-412` family · FE banner actionable | O3 · J-03 |
| **AC-PAY-01-PROCESS-412** | Period requires closed · none bound | **Chạy tính lương** FE | **412** `HRM-PAY-ATT-412` · no payslip storm | O4 · J-04 |
| **AC-PAY-01-ELIG-NO-CLOSED** | Employee missing closed sheet | Open eligibility list | `eligible=false` · `reasons` includes **`NO_CLOSED_SHEET`** | O5 · J-03 |
| **AC-PAY-01-LINE-LOCKED** | Line unlocked on closed header | Bag/process | Warning/omit · **≠** silent zero hours | O6 |
| **AC-PAY-01-BOUNDARY** | Process path | Audit | **403** wired **OR** TM audit log GĐ1 · no cross-read | O7 · J-06 |
| **AC-PAY-01-CB-TRACE** | Process with C&B | Evidence doc | Maps **F-PAY-CB-READ-01** to Diễn biến #3 P2 · depth **HOLD** | O8 |
| **AC-PAY-01-RD-TRACE** | Process with RD cases | Evidence doc | Maps **F-PAY-RD-APPLY-01** · executed-only · **HOLD** | O8 |
| **AC-PAY-01-≠-PROCESS-DONE** | Partial process LIVE | DONE claim | **FAIL** if stub = PAY-01 DONE | O9/O12 |
| **AC-PAY-01-PROCESS-HOLD** | Footer | QC | Full **F-PAY-PROCESS-01** = **PAY-02/06** only | O9 |
| **AC-PAY-01-MK-PEERS** | Footer | Stamps | **ATT12+ATT11+ATT10+ATT09+ATT07+ATT06+ATT05b+CORE07** RETAIN · DENY merge · DENY `att_leave_hold` | O11 |
| **AC-PAY-01-≠-REOPEN-J12-J07** | Sealed J-12/J-07/J-06-04 | Reopen without bus | **FAIL** | O10/O12 |
| **AC-PAY-01-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-01 DONE** · **≠ PAY UAT** · **≠ ATT UAT** · C-SLICE | O12 · J-07 |

---

## 4. J-HRM-PAY-01-* DRAFT (narrow · U65 · Nest `/core` hour SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-01-01** | **period** | **C&B chọn kỳ lương — scope + menu PAY** | Login `ceo@xe.vn` → HRM embed → **Lương** (hoặc kỳ lương SRS) → chọn kỳ khớp bảng công · Network period **2xx** · không banner scope 409 | AC-PAY-01-PATH · O12 · **DRAFT** |
| **J-HRM-PAY-01-02** | **bind-closed** | **Gắn kỳ với bảng công đã chốt** | Sau ATT-11 close path (sheet `closed` · **ATT11QC1** cite): mở bind UI → chọn header chốt → **POST timesheet-binds** **2xx** · **FE-after-2xx** · **F5** bind còn · label `timesheetStatus=closed` | AC-PAY-01-BIND-CLOSED · O2/O3 · **DRAFT** |
| **J-HRM-PAY-01-03** | **bind-draft-412** | **Từ chối gắn bảng nháp/chờ ký** | Chọn sheet `submitted`/draft (không `closed`) → **POST bind** → **412** `HRM-PAY-ATT-412` · toast/banner VI · không row bind giả | AC-PAY-01-BIND-DRAFT-412 · O3 · **DRAFT** |
| **J-HRM-PAY-01-04** | **process-412** | **Chạy lương khi chưa có sheet chốt** | Kỳ chưa bind closed / policy require closed → **Chạy tính lương** → **412** `HRM-PAY-ATT-412` · không tạo payslip hàng loạt lỗi im lặng | AC-PAY-01-PROCESS-412 · O4 · **DRAFT** |
| **J-HRM-PAY-01-05** | **process-closed-2xx** | **Precheck pass — process 2xx (boundary slice only)** | Kỳ đã bind closed+locked · **POST process** **2xx** · eligibility trước đó không còn `NO_CLOSED_SHEET` cho NV in-scope · **label ≠ PAY-01 DONE** · **≠ payroll_e2e** | AC-PAY-01-HOUR-SOT · O1/O4/O9 · **DRAFT** · conditional formula |
| **J-HRM-PAY-01-06** | **boundary** | **Network: cấm đọc OT/Phép khi chạy lương** | Trong J-05 window: DevTools → **no** `leave-requests` / OT APIs cho biến giờ · nếu detect → **403** or QA FAIL design | AC-PAY-01-≠-CROSS-READ/BOUNDARY · O1/O7 · **DRAFT** |
| **J-HRM-PAY-01-07** | **cross** | **Seals · honesty · regression ATT — ≠DONE** | (a) Nest `/core` hour SoT **0** (b) **≠ PAY-01 / FR-PAY-01 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **`ATT12QC1`** · **`ATT11QC1`** · peer chain (d) **DENY merge** buckets (e) **DENY reopen J-ATT-12-*** / **J-07-03..05** / **J-06-04** (f) printable false · C-SLICE | AC-PAY-01-H/MK-* · O10–O12 · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-01 QC — do not reopen sealed ATT)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-ATT-12-07** | **regression** | **ATT-12 seals — panel/activate ≠ PAY trigger** | Re-run footer subset from **ATT12QC1** when PAY menu touched | **`ATT12QC1`** · **DRAFT** |
| **J-HRM-ATT-07-03** | **regression** | **Nộp đơn ốm — non-regression** | Sick submit **2xx** path sealed **ATT07QC1** | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-07-04** | **regression** | **Hold pending_days — non-regression** | Tracked submit · F5 · **DENY `att_leave_hold`** | **`ATT09QC1`** · **DRAFT** |
| **J-HRM-ATT-07-05** | **regression** | **Fund-order / dayBranches — non-regression** | When LIVE · persisted fund-order | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-06-04** | **regression** | **Quỹ compensatory — non-regression** | Panel `compensatory` separate · **≠** merge→`annual` | **`ATT06QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§63** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-01-BOUNDARY** | Leave/OT HTTP detect | **GAP** (or TM audit) | **dev-be** · **technical-manager** |
| **G-PAY-01-BIND-FE** | Bind UI draft→412 | **GAP AC** | **dev-fe** |
| **G-PAY-01-ELIG-FE** | Eligibility list reasons | **GAP AC** | **dev-fe** |
| **H-PAY-01-PROCESS-FULL** | F-PAY-PROCESS-01 eval/split | **HOLD** | **PAY-02/06** |
| **H-PAY-01-CB-RD** | C&B + RD depth | **TRACE HOLD** | PAY-06 · CORE-08 |
| **H-PAY-01-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **HOLD default** `PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01` — RETAIN `pay_period_timesheet_bind` + `attendance_sheets`/`att_timesheet_line` · **DENY** `att_leave_hold` · **DENY** merge buckets · ADD boundary audit table **only** if closable | DATA-01 PASS_TO_PM |
| **sa** | API-01 deepen **F-PAY-ATT-CLOSED-01** + **R-PAY-01-BOUNDARY** if closable | optional API-01 |
| **dev-be** | **HOLD** optional static cross-read gate until API/DATA stamped | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** bind + eligibility UI residuals | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-01-01..07** mandatory · regression **J-ATT-12-07** · **J-ATT-07-03..05** · **J-ATT-06-04** when PAY paths touched | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-01 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **ATT12+ATT11** + peer chain | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O12 CONFIRMED** for UC-BP-PAY-01 / FR-UC-BP-PAY-01 / BR-BP-TS-03 against SA Option A: **RETAIN cite** `pay_period_timesheet_bind` closed gate · `loadPayrollEligibility` + **`HRM-PAY-ATT-412`** on process · `loadAttHoursFromClosedLine` (closed+locked · no Leave/OT HTTP); **GAP** **R-PAY-01-BOUNDARY/ELIGIBILITY/BIND-AC/PROCESS-AC/JOURNEY** + trace **F-PAY-CB-READ-01** / **F-PAY-RD-APPLY-01**; **HOLD** full **F-PAY-PROCESS-01** = PAY-02/06; **bind ATT-11** close peer; AC-PAY-01-*; mint **J-HRM-PAY-01-01..07 DRAFT** + regression **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** (U65 FE-after-2xx+F5); unlock **ba-data HOLD** default; explicit **≠ PAY-01 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT** · **C-SLICE** · must_keep **`ATT12QC1-MSMAIGWC1`** + **`ATT11QC1-MSLXTH9P`** + full ATT peer chain · **DENY** `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** bind/412-alone DONE · **DENY reopen J-HRM-ATT-12-*** / **J-07-03..05** / **J-06-04** |
| **Residual (open)** | ba-data DATA-01 HOLD · sa API-01 optional · dev-be boundary gate · dev-fe bind/elig · QA J-* · QC GWC · **F-PAY-PROCESS** / formula PAY-02/06 |
| **next_owner** | **ba-data** (HOLD default) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data HOLD default)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-37 seat #42)
lane: governance · UC-BP-PAY-01 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (attendance_sheets · att_timesheet_line · pay_period_timesheet_bind · payroll_periods — DENY att_leave_hold · DENY merge sick/compensatory/carry into annual hour buckets)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md (close+line_locked peer)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md (must_keep ATT12QC1 · DENY reopen J-12)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md (must_keep ATT07QC1 · DENY reopen J-07 / J-06-04)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qc-01.md (ATT12QC1-MSMAIGWC1)
entry_criteria: BA O1–O12 CONFIRMED · default RETAIN cite bind/412/bag — no schema ADD unless boundary audit artifact closable
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md
  - HOLD default: RETAIN pay_period_timesheet_bind + closed sheet/line tables · DENY physical att_leave_hold · DENY merge compensatory/sick/carry into annual keys for PAY hour reads
  - ADD only if closable + BA stamp: optional boundary_crossread_audit row/store (else explicit HOLD waiver with owner+trigger)
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge buckets · honesty flip · flip payroll_e2e_ready · reopen J-HRM-ATT-12-* / J-07-03..05 / J-06-04 without regression · wipe ATT12/ATT11 peer seals
```

### 7.2 next_dispatch_prompt (copy-ready — pm orchestration hint)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-01-CLUSTER-PM-01
role: pm
lane: governance
entry_criteria: BA-01 PASS_TO_PM @ docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md · must_keep ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain
exit_criteria:
  - Dispatch ba-data DATA-01 HOLD (parallel) · hold dev-be/dev-fe until DATA/API PASS
  - Update PO_HRM_MVP_GD1_CONTINUOUS.md seat #42 BA stamped · PILOT_BUSINESS_FLOW_BA_TRACE §63
  - No payroll_e2e_ready / PAY module UAT flip · C-SLICE honesty · DENY reopen J-HRM-ATT-12-* / J-07-03..05 / J-06-04
cấm: claim PAY-01 or PAY module UAT DONE from BA pack alone · claim bind/412 alone = FR-PAY-01 DONE · honesty flip
```
