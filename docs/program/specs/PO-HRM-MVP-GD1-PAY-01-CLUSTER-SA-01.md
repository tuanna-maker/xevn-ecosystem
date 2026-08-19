# PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01 — Option/F.1 · Ranh giới PAY chỉ đọc bảng công chốt — RETAIN LIVE boundary

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT peer seals · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** honesty flip · **DENY** claim PAY/ATT module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → (ba-data HOLD) → API/BE deepen only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-36 UC-BP-ATT-12 **SEALED** — stamp **`ATT12QC1-MSMAIGWC1`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qc-01.md` · QA **`ATT12QA1-MSMAIARP`** · **must_keep** **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · full ATT peer chain · Nest `/core` DENY · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-01` · `FR-UC-BP-PAY-01` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#42** after ATT-12 (#41 SEALED GWC) · PAY-02..09 **QUEUED** |
| **ref_sa_spine** | ATT-11 [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) · ATT-12 [`PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md) · ATT-10 AGG funnel · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-12-*** / **J-HRM-ATT-07-*** / **J-HRM-ATT-06-04** without regression bus |
| **ref_honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY module UAT** · **≠ ATT module UAT** · product_go **false** · **DENY claim bind/process stub alone = PAY-01 DONE** · **DENY claim F-PAY-PROCESS full orchestrator = PAY-01 DONE** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-01** · Diễn biến **#1–#3 + FAIL + Thành công** · **BR-BP-TS-03** · partner **REQ_L_001** · cross **FR-UC-BP-PAY-06** AC-PAY-HIRE-01 · UC kế = **PAY-02** formula / **PAY-06** run depth (**OUT** invent DONE this seat) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P1–P4** · **F-PAY-ATT-CLOSED-01** · **F-PAY-PROCESS-01** (orchestrator pointer) · **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** · peer **F-ATT-SHEET-04** · **ATT-LINE-01** · Q-PAY-FORMULA **ANSWERED** · formula author **HOLD** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-ATT-CLOSED-01** · **F-PAY-PROCESS-01** · **F-PAY-CB-READ-01** · **F-PAY-RD-APPLY-01** · Nest live `POST /api/hrm/payroll/periods/{id}/process` · `pay_period_timesheet_bind` · **F-ATT-SHEET-04** peer |
| **ref_db** | LIVE `attendance_sheets` (`status=closed`) · `att_timesheet_line` (`line_locked`) · `pay_period_timesheet_bind` · `payroll_periods` · formula bag reads **closed line only** (`pay-formula-variable-bag.ts` **F-PAY-ATT-CLOSED-01**) |
| **ref_code** | `pay-period-input-pack.service.ts` `assertClosedSheetForBind` · `payroll.service.ts` `loadPayrollEligibility` + `HRM-PAY-ATT-412` on process · `pay-formula-variable-bag.ts` `loadAttHoursFromClosedLine` · **read-only cite** · Nest `@Controller('core')` payroll **ABSENT** as ATT SoT |
| **OUT** | Nest `/core` dual PAY/ATT · invent `att_leave_hold` · merge sick/comp/carry buckets · claim bind alone = PAY-01 DONE · claim process stub = payroll_e2e LIVE · wipe ATT-11/12/10.. seals · reopen J-ATT-12 / J-ATT-07 without regression · seed · honesty flip · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-37 architecture unlock: **ranh giới lương chỉ đọc bảng công đã chốt** (FR-UC-BP-PAY-01 · BR-BP-TS-03) vs AS-IS LIVE Nest payroll boundary — **gap-only** under U89 · **bind ATT-11 close spine** |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U89 after ATT-12 QC-01 GWC (`ATT12QC1-MSMAIGWC1`) · U88 continuous |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-01 · BR-BP-TS-03 · REQ_L_001 · F-PAY-ATT-CLOSED-01 · F-PAY-PROCESS-01 precheck · F-ATT-SHEET-04 peer · ATT-11 BR-BP-TS-02 close gate · must_keep ATT12QC1 + ATT11QC1 + ATT peer chain · Nest `/core` DENY · U19 scope parity · ≠ PAY/ATT UAT · ≠ payroll_e2e LIVE from boundary alone |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-11 SEALED (`ATT11QC1-MSLXTH9P`):** sign+close → `attendance_sheets.status=closed` · `att_timesheet_line.line_locked` · **≠ LIVE alone = ATT-11 DONE** · WF/CSUM/EMIT residuals HOLD · PAY **OUT** invent DONE on ATT seat. **ATT-12 SEALED (`ATT12QC1-MSMAIGWC1`):** profile strip panel + activate-default read · **≠ FR-12 DONE** · regression **J-HRM-ATT-06-04** · **J-HRM-ATT-07-03..05** PASS · must_keep ATT07/06/05b/09/CORE07. **PAY boundary AS-IS (PRESENT — RETAIN cite):** (1) **`pay_period_timesheet_bind`:** POST bind → `assertClosedSheetForBind` → sheet `status !== closed` → reject (**HRM-PAY-ATT-412** family). (2) **`POST /api/hrm/payroll/periods/{id}/process`:** `loadPayrollEligibility` → `require_closed_timesheet` + `has_closed_sheet` → **412 `HRM-PAY-ATT-412`** when policy requires closed sheet and none found. (3) **`loadAttHoursFromClosedLine` (F-PAY-ATT-CLOSED-01):** SELECT `attendance_sheets` `status=closed` + `att_timesheet_line` with `line_locked` · prefer `pay_period_timesheet_bind` · **cấm** Leave/OT HTTP in bag loader (comment + design). (4) Eligibility API surfaces `NO_CLOSED_SHEET` per employee when sheet missing. **ABSENT / residual:** Static **HRM-PAY-BOUNDARY-403** if runtime detects Leave/OT API dependency in calculate path (paper · **unproven** grep gate). Full **F-PAY-PROCESS-01** orchestrator depth (eval all components · split · full RD) = **partial/staged** — **≠ PAY-01 DONE alone**. **F-PAY-CB-READ-01** / **F-PAY-RD-APPLY-01** = outline vs full AC (**PAY-06/CORE-08** waves). FE may still show payroll menus without claiming e2e LIVE. |
| **Paper target** | FR-UC-BP-PAY-01: C&B chọn kỳ → kiểm tra bảng công **đã chốt** → nạp giờ từ sheet chốt + C&B từ vòng HĐ/BH + KT/KL đã thi hành → **cấm** đọc OT/Phép song song · FAIL = thiết kế lỗi. BR-BP-TS-03. Tiên quyết ATT-11 close (BR-BP-TS-02). |
| **Gap class** | **GĐ1 continuous AC + boundary regression + optional static cross-read gate** on LIVE closed-sheet reads — **not** greenfield payroll engine; **not** claim bind/process precheck alone = FR-PAY-01 DONE; **not** flip `payroll_e2e_ready`; **not** wipe ATT seals. |
| **Constraints** | U89 · preserve **ATT12QC1** + **ATT11QC1** + ATT10..CORE07 chain · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · DENY merge buckets · DENY `att_leave_hold` · DENY reopen **J-HRM-ATT-12-*** / **J-HRM-ATT-07-*** without regression bus |
| **Failure impact if unresolved** | Board #42 stalls; Dev reads `leave-requests` / OT APIs in process path; false `payroll_e2e_ready`; PAY runs on draft sheet; wipe ATT-11 close invariant |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-10 AGG → ATT-11 sign/close → ATT-12 profile (SEALED must_keep)
  Nest /core DENY · honesty false · C-SLICE · payroll_e2e_ready=false
       │
       │  ATT-11: BR-BP-TS-02 → status=closed · line_locked (peer RETAIN)
       │  ATT-12: panel/activate-default ≠ PAY trigger · J-06-04/J-07-* regression RETAIN
       ▼
  ┌────────────── FR-UC-BP-PAY-01 (this seat — boundary RETAIN + gap AC) ──────────┐
  │                                                                                │
  │  RETAIN LIVE (cite — ≠ PAY-01 DONE alone)                                      │
  │    pay_period_timesheet_bind POST → closed sheet only                          │
  │    payroll eligibility → require_closed_timesheet · has_closed_sheet           │
  │    POST …/payroll/periods/{id}/process → HRM-PAY-ATT-412 if no closed sheet    │
  │    loadAttHoursFromClosedLine → att_timesheet_line locked · no Leave/OT HTTP   │
  │    F-ATT-SHEET-04 peer: GET sheet when closed (ATT UI + PAY whitelist cite)      │
  │                                                                                │
  │  RESIDUAL unlock (BA → API — closable gap)                                     │
  │    R-PAY-01-BOUNDARY   : static/detect cross-read Leave/OT in process (403)    │
  │    R-PAY-01-ELIGIBILITY: AC empty list + reason NO_CLOSED_SHEET (PAY-06 peer)│
  │    R-PAY-01-BIND-AC    : bind UI + Network 412 on draft sheet                  │
  │    R-PAY-01-PROCESS-AC : process 412 when draft · 2xx only with closed+locked  │
  │    R-PAY-01-CB-RD      : F-PAY-CB-READ-01 / F-PAY-RD-APPLY-01 trace (≠ DONE)  │
  │    R-PAY-01-JOURNEY    : mint J-HRM-PAY-01-* DRAFT + regression J-ATT-12/07    │
  │    F-PAY-PROCESS-01 full orchestrator = PAY-02/06 waves (HOLD footer)           │
  │                                                                                │
  │  Formula author / payslip / split = QUEUED · OUT invent DONE                 │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  Nest /core dual PAY+ATT              = DENY
  Read leave-requests/OT in calculate  = DENY (BR-BP-TS-03 FAIL)
  Merge sick/comp/carry buckets        = DENY
  Invent att_leave_hold                = DENY
  Claim bind/process stub = PAY-01 DONE= DENY
  Flip payroll_e2e_ready / PAY UAT     = DENY
  Reopen J-ATT-12-* / J-ATT-07-*       = DENY without regression bus
  C-SLICE ≠ module PAY / ATT UAT

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Ranh giới: lương chỉ đọc bảng công đã chốt» GĐ1 = **RETAIN cite LIVE closed-sheet gate + att_timesheet_line bag** + **gap AC boundary/regression** — **not** full payroll engine DONE; **not** formula LIVE; **bind ATT-11 close** as prerequisite narrative; **C-SLICE**.  
**Spine lock:** Physical Nest `/api/hrm/payroll/*` + internal `loadAttHoursFromClosedLine` · paper `/api/hrm/pay/*` = **alias** where mapped — **DENY** Nest `/core` as ATT hour SoT.  
**Hour SoT lock:** **Only** `attendance_sheets.status=closed` + `att_timesheet_line` (`line_locked`) · funnel cols `payable_hours`, `ot_hours_weighted`, `paid_leave_hours`, `unpaid_leave_hours` — **DENY** parallel HTTP to leave/OT modules for hour vars (**BR-BP-TS-03**).  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / TechSpec / API) | AS-IS LIVE | Verdict |
|------------|------------------------------|------------|---------|
| Kiểm tra sheet chốt trước process | Diễn biến #2 · BR-BP-TS-03 | `processPayrollPeriod` + `HRM-PAY-ATT-412` | **RETAIN cite** |
| Bind kỳ ↔ sheet chốt | F-PAY period bind | `assertClosedSheetForBind` | **RETAIN cite** |
| Đọc giờ từ line locked | F-PAY-ATT-CLOSED-01 · ATT-LINE-01 | `loadAttHoursFromClosedLine` | **RETAIN cite** · residual incomplete line warnings |
| GET sheet closed (peer) | F-ATT-SHEET-04 | GET attendance-sheets when closed | **peer RETAIN** · ATT-11 seal |
| ATT-11 close prerequisite | BR-BP-TS-02 | close + line_locked | **context gate RETAIN** · ≠ PAY DONE |
| Eligibility NO_CLOSED_SHEET | PAY-06 peer | `loadPayrollEligibility.items[].reasons` | **RETAIN cite** · **R-PAY-01-ELIGIBILITY** AC |
| C&B vars từ CORE C&B | Diễn biến #3 P2 | partial in formula bag | **RETAIN partial** · **R-PAY-01-CB** GAP trace |
| KT/KL đã thi hành | Diễn biến #3 P3 | F-PAY-RD-APPLY-01 outline | **GAP** · CORE-08 peer |
| Detect Leave/OT HTTP in run | FAIL Diễn biến | **unproven** static gate | **RESIDUAL** R-PAY-01-BOUNDARY |
| Full F-PAY-PROCESS-01 | PAY-02/06 | process creates payslips · formula staged | **HOLD** · **≠ PAY-01 DONE** |
| Formula author/publish | PAY-02 | HOLD product fidelity | **QUEUED** |
| ATT-12 profile strip | peer | SEALED ATT12QC1 | **must_keep** · ≠ PAY trigger |
| Merge buckets / att_leave_hold | DENY | ATT seals RETAIN | **DENY** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ PAY UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN closed-sheet boundary (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE `pay_period_timesheet_bind` closed gate · `loadPayrollEligibility` + **HRM-PAY-ATT-412** on process · `loadAttHoursFromClosedLine` (closed+locked `att_timesheet_line` · no Leave/OT HTTP). Unlock BA residuals **R-PAY-01-BOUNDARY/ELIGIBILITY/BIND-AC/PROCESS-AC/JOURNEY** + trace **F-PAY-CB-READ-01** / **F-PAY-RD-APPLY-01** without claiming DONE. **must_keep** **ATT12QC1-MSMAIGWC1** + **ATT11QC1-MSLXTH9P** + full ATT peer chain · **bind ATT-11** close spine · Nest `/core` DENY · DENY merge buckets · DENY `att_leave_hold` · DENY reopen **J-HRM-ATT-12-*** / **J-HRM-ATT-07-*** · ≠ PAY/ATT UAT · **F-PAY-PROCESS** full = PAY-02/06 **OUT** this seat. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Low–medium (boundary LIVE; residual = AC + optional 403 gate + journeys) |
| **Risk** | Low if BA claims bind= DONE or reopens ATT journeys |
| **Pros** | Matches BR-BP-TS-03 · coded closed gate · preserves ATT seals · unlocks board #42 |
| **Cons** | Full payroll e2e still QUEUED; static boundary detector may need BE wave |
| **Failure modes** | Cross-read leave/OT in process · honesty flip · wipe ATT-11 close |
| **Mitigation** | O1–O12 · regression J-ATT-12/07 · C-SLICE |

### Option B — Nest `/core` dual + read Leave/OT APIs for hours (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` payroll/att reads; calculate hours from `leave-requests` / OT endpoints alongside sheet |
| **Pros** | Literal mis-read of legacy `/core` paths |
| **Cons** | Violates BR-BP-TS-03 · dual SoT · regression ATT-11 funnel · sponsor conflict |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim bind+412 alone = PAY-01 DONE / payroll_e2e LIVE (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because `HRM-PAY-ATT-412` exists or bind table exists; flip `payroll_e2e_ready`; skip ATT-11 close journey; reopen sealed ATT-12/07 journeys |
| **Pros** | Fast chat claim |
| **Cons** | Violates FR-PAY-01 Diễn biến FAIL · C-SLICE · false UAT |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap AC) | B (core+leave/OT read) | C (HOLD/claim DONE) |
|-----------|-------:|-------------------:|------------------------:|--------------------:|
| Business value (FR-PAY-01) | 5 | **5** | 0 | 0 |
| Time to deliver | 4 | **5** | 1 | Fake PASS |
| Fit BR-BP-TS-03 + ATT-11 | 5 | **5** | 0 | 1 |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE closed-sheet bind + process 412 + `loadAttHoursFromClosedLine`; unlock R-PAY-01-* AC; **RETAIN** ATT11/ATT12 + full ATT peer chain; **bind ATT-11** close; paper F-PAY-ATT-CLOSED-01 + F-ATT-SHEET-04 peer; **DENY** Nest dual · Leave/OT HTTP for hours · merge buckets · `att_leave_hold` · claim boundary alone = PAY-01 DONE · `payroll_e2e_ready` flip · reopen **J-HRM-ATT-12-*** / **J-HRM-ATT-07-*** · seed · apps/** |
| **Why selected** | AS-IS already enforces closed sheet at bind and process precheck; formula bag reads locked lines only; FR-PAY-01 gap is **AC + regression + optional BOUNDARY-403** — not invent second hour SoT, not claim partial process = module DONE |
| **Assumptions** | **ATT12QC1-MSMAIGWC1 RETAIN** · **ATT11QC1-MSLXTH9P RETAIN** · ATT10/09/08/02/PLT/CORE stamps **RETAIN** · **ATT07/06/05b** seals **RETAIN** · Nest `@Controller('core')` **ABSENT** for ATT hour SoT. `payroll_e2e_ready=false` · `attendance_uat_ready=false`. Physical bind + 412 + bag loader **PRESENT** (grep 2026-08-10). |
| **Rejected** | **B** — `/core` dual + leave/OT read · **C** — HOLD / honesty flip / reopen peers |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Hour SoT | `att_timesheet_line` on `closed` sheet only · **cấm** leave/OT HTTP for hour vars | FAIL AC if cross-read |
| O2 | ATT-11 bind | Close+lock peer **ATT11QC1** prerequisite narrative · ≠ ATT-11 DONE | AC cites BR-BP-TS-02 |
| O3 | Bind POST | Draft sheet → bind reject (**412**) | Network evidence |
| O4 | Process precheck | No closed sheet → **HRM-PAY-ATT-412** | Diễn biến #2 FAIL |
| O5 | Eligibility | `NO_CLOSED_SHEET` reason on items | PAY-06 peer trace |
| O6 | Line locked | Bag omits vars if `line_locked=false` | ATT-LINE-01 |
| O7 | BOUNDARY-403 | Prefer residual static detect **XOR** document manual TM audit GĐ1 | Footer |
| O8 | CB/RD trace | F-PAY-CB-READ-01 / F-PAY-RD-APPLY-01 **≠ DONE** | Trace-only rows |
| O9 | F-PAY-PROCESS depth | Full orchestrator = **PAY-02/06** waves | **≠ PAY-01 DONE** footer |
| O10 | ATT-12/07 regression | **DENY reopen** **J-HRM-ATT-12-*** / **J-HRM-ATT-07-03..05** / **J-06-04** without bus | Regression PASS retained |
| O11 | must_keep stamps | ATT12+ATT11+peer chain · DENY merge · DENY `att_leave_hold` | ≠ wipe seals |
| O12 | Honesty / journeys | Mint **J-HRM-PAY-01-*** DRAFT · `payroll_e2e_ready=false` · U65 | **≠ PAY UAT** · C-SLICE |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-PAY-ATT-CLOSED-01** (this seat) | Internal + used by `POST …/payroll/periods/{id}/process` | `/api/hrm/pay/periods/{id}/process` precheck | Chỉ đọc sheet `closed` + line `line_locked` · cấm Leave/OT HTTP | Diễn biến **#2–#3** · FAIL cross-read |
| **F-ATT-SHEET-04** (peer RETAIN) | `GET /api/hrm/attendance/attendance-sheets/{id}` | paper alias | PAY whitelist khi `closed` | Peer ATT-11 · **OUT invent PAY DONE** |
| **pay_period_timesheet_bind** (this seat) | `GET/POST …/payroll/periods/{periodId}/timesheet-binds` | AMIS bind | Gắn kỳ với header chốt | Diễn biến **#1–#2** |
| **F-PAY-PROCESS-01** (HOLD partial) | `POST …/payroll/periods/{id}/process` | `/api/hrm/pay/periods/{id}/process` | Orchestrator · **partial LIVE** | **#3** Thành công · **≠ PAY-01 DONE alone** |
| **F-PAY-CB-READ-01** (GAP trace) | Internal facade (paper `/core/employees/{id}/compensation`) | alias | C&B từ vòng HĐ/BH | Diễn biến **#3** P2 |
| **F-PAY-RD-APPLY-01** (GAP trace) | Internal (paper reward-discipline filter) | alias | KT/KL đã thi hành | Diễn biến **#3** P3 · CORE-08 |

**DENY:** invent Nest `@Controller('core')` as primary hour SoT for F-PAY-ATT-CLOSED-01.  
**DENY:** HTTP `leave-requests` / OT APIs inside formula variable bag for hour vars.  
**DENY:** treat bind table alone or single 412 handler alone as FR-PAY-01 module DONE.

**Display-ready cite for BA:** Eligibility `{ require_closed_timesheet, has_closed_sheet, items[{ eligible, reasons[] }] }` · bind `{ timesheetHeaderId, timesheetStatus, timesheetDisplayLabel }` · process errors `HRM-PAY-ATT-412` · bag warnings `NO_CLOSED_SHEET` / `ATT_LINE_NOT_LOCKED` (honesty — not silent 0).

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-PAY-01-* DRAFT
  → ba-data HOLD default (ADD only if closable boundary audit table)
  → sa API-01 F.1 deepen RETAIN F-PAY-ATT-CLOSED-01 (+ R-PAY-01-BOUNDARY if closable)
  → Dev-BE residual wire ONLY (gap-only · optional static cross-read gate)
  → QA U65 J-HRM-PAY-01-* + regression J-ATT-12 / J-ATT-07
  → QC GWC C-SLICE (≠ PAY-01 module UAT · ≠ payroll_e2e_ready flip · ≠ ATT UAT)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC + mint J-HRM-PAY-01-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default | ba-data | HOLD unless closable |
| 4. sa API F.1 cite RETAIN (+ boundary wire if closable) | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-PAY-01-* · regression ATT-12/07 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT12+ATT11+peer stamps untouched · Nest `/core` still DENY · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-01 DONE · **≠** PAY module UAT.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Process reads leave/OT HTTP | grep / static audit in payroll | O1 · R-PAY-01-BOUNDARY |
| A | Claim bind= PAY-01 DONE | Evidence footer | O9 · C-SLICE |
| A | Reopen J-ATT-12/07 without bus | QA regression FAIL | O10 · must_keep |
| A | Flip payroll_e2e_ready | Ready flag true | O12 DENY |
| A | Wipe ATT-11 close | Draft sheet pays | O2 · O4 |
| B | Dual hour SoT | leave API in bag | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **ATT12QC1-MSMAIGWC1** | RETAIN · panel + activate-default · ≠ FR-12 DONE · ≠ ATT-12 UAT |
| **ATT11QC1-MSLXTH9P** | RETAIN · close+sign spine · **bind PAY-01 prerequisite** · ≠ ATT-11 DONE alone |
| **ATT10QC1-MSLWGUYH** | RETAIN · AGG funnel · ≠ AGG=ATT-10 DONE |
| **ATT09QC1-MSLUTL9D** | RETAIN · DENY `att_leave_hold` |
| **ATT07/06/05b QC seals** | RETAIN · DENY merge buckets · regression J-07 / J-06-04 |
| **CORE07QC1-KZJTSHNT** | RETAIN |
| Full ATT peer chain W25–W36 | RETAIN · **DENY reopen J-HRM-ATT-12-*** / **J-HRM-ATT-07-*** without regression bus |
| Nest `/core` | **DENY** dual invent |
| `att_leave_hold` | **DENY** invent |
| Merge sick/comp/carry→annual | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| `attendance_uat_ready` | **DENY** flip |
| Claim bind/process stub = PAY-01 DONE | **DENY** |
| F-PAY-PROCESS full orchestrator | **HOLD** PAY-02/06 · **OUT** this seat DONE |
| Honesty | **DENY** flip · U65 zero-seed |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-01: **RETAIN** `pay_period_timesheet_bind` closed gate · `loadPayrollEligibility` + **HRM-PAY-ATT-412** on process · `loadAttHoursFromClosedLine` (closed+locked line · no Leave/OT HTTP); **GAP** **R-PAY-01-BOUNDARY/ELIGIBILITY/BIND-AC/PROCESS-AC/JOURNEY** + trace CB/RD; **HOLD** full **F-PAY-PROCESS-01** = PAY-02/06; **bind ATT-11** close peer; **must_keep** **ATT12QC1+ATT11QC1** + full ATT chain; **DENY** merge · `att_leave_hold` · Nest `/core` · reopen **J-ATT-12-*** / **J-ATT-07-***; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** (BA-01 AC pack) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-01 · FR-UC-BP-PAY-01 · BR-BP-TS-03 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md (close+lock peer · F-ATT-SHEET-04 · BR-BP-TS-02)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-01
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-ATT-CLOSED-01 · F-PAY-PROCESS-01 (HOLD footer)
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + full ATT peer chain · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md
  - AC O1–O12 from SA §4.1 · mint J-HRM-PAY-01-* DRAFT (bind closed · process 412 · eligibility NO_CLOSED_SHEET · regression J-HRM-ATT-12-* + J-HRM-ATT-07-03..05 + J-HRM-ATT-06-04)
  - Footer: ≠ PAY-01 DONE · ≠ payroll_e2e_ready · ≠ PAY module UAT · F-PAY-PROCESS full = PAY-02/06 HOLD · DENY merge buckets · DENY att_leave_hold · DENY reopen sealed ATT journeys without regression bus
  - ack_status PASS_TO_PM · next ba-data DATA-01 HOLD default
cấm: honesty flip · seed · invent att_leave_hold · claim bind alone = DONE · apps/**
```
