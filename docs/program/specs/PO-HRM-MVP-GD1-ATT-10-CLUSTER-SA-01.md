# PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01 — Option/F.1 · Tổng hợp bảng công (phễu giờ công tính lương) — RETAIN LIVE AGG + att_timesheet_line

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-09 hold/settle · **DENY** wipe ATT-08 preview · **DENY** invent `att_leave_hold` dual · **DENY** invent PAY/printable/Word DONE · **DENY** honesty flip · **DENY** claim ATT module UAT · **DENY** claim ATT-09/08/02 = DONE · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD residual) → API/FE/BE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-27 UC-BP-ATT-09 **SEALED** — stamp `ATT09QC1-MSLUTL9D` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md` · QA `ATT09QA2-MSLUKI9U` · **must_keep** ATT-09 hold/settle path RETAIN (`pending_days` · DENY `att_leave_hold`) · `ATT08QC1-MSLSL36C` preview RETAIN · `ATT02QC1-MSLQZUK7` · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false** · ≠ CORE-09 DONE) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` **ABSENT** · **≠ ATT UAT** · **≠ soft/ATT-08=ATT-09 DONE** · PAY invent DONE **OUT** |
| **uc_ids** | `UC-BP-ATT-10` · `FR-UC-BP-ATT-10` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#30** after ATT-09 (#29 SEALED GWC) · ATT-11 / PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | ATT-09 [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) · ATT-08/02/PLT/CORE seals · AGG SoT [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md) · DATA-ATT-LINE · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim LIVE AGG alone = ATT-10 DONE** · **DENY invent PAY/printable DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-10** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-01** (một kỳ một bảng · OT vào phễu **đã** × hệ số · PAY **không** nhân lại) · phễu SoT: công chuẩn / thực tế / phép / lễ / phạt / ăn ca / OT weighted / trừ không lương · partner **REQ_L_001** · UC kế = **ATT-11** ký chốt (**OUT** invent DONE this seat) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` §6.1–6.4 · A5 closed sheet = ONE source PAY · funnel → `F-ATT-SHEET-01` aggregate → submitted → ATT-11 close · **F-ATT-SHEET-02/03/04** peer cite ≠ ATT-10 DONE |
| **ref_adr** | This Option evaluation · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-SHEET-01** (= AGG write · physical `POST …/aggregate`) · peer submit invokes AGG · **F-ATT-SHEET-02/03/04** + WF-SIGN peer ATT-11 · Nest `@Controller('core')` **ABSENT** · prior SoT `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` **F-ATT-SHEET-AGG-01** |
| **ref_db** | LIVE `public.attendance_sheets` (header alias) · `public.att_timesheet_line` (`standard_hours` · `ot_hours_weighted` · `paid_leave_hours` · `unpaid_leave_hours` · `payable_hours` · `late_penalty_hours` · `meal_shift_hours` NULL col · `work_days` · `line_locked`) · sources `attendance_records` · `overtime_requests` (approved × coefficient) · `late_early_requests` (approved minutes → penalty) · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `attendance.controller` `@Controller('attendance')` · `POST attendance-sheets/:sheetId/aggregate` · `POST …/submit` (calls AGG) · `att-timesheet-line-aggregate.ts` · `AttendanceSheetSignService` · late-penalty util (ATT-02 peer) · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual · wipe ATT-09 hold/settle · wipe ATT-08 preview · invent `att_leave_hold` · invent PAY DONE · invent printable/Word DONE · claim LIVE AGG alone = ATT-10 DONE · claim ATT-11 close/sign = ATT-10 DONE · claim ATT module UAT · reopen sealed peers · seed · honesty flip · apps/** this seat |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-28 architecture unlock: **aggregate timesheet funnel → giờ công tính lương** (FR-UC-BP-ATT-10 · BR-BP-TS-01) vs AS-IS LIVE Nest AGG + `att_timesheet_line` — **gap-only** under U89 |
| **Requestor** | PM · program `PO-HRM_MVP_GD1_CONTINUOUS` · U89 after ATT-09 QC-01 GWC (`ATT09QC1-MSLUTL9D`) · U88 continuous |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-10 · BR-BP-TS-01 · REQ_L_001 · F-ATT-SHEET-01 / F-ATT-SHEET-AGG-01 · peers ATT-11 F-ATT-SHEET-02..04 OUT invent · must_keep ATT-09/08/02/PLT/CORE · Nest `/core` DENY · U19 · soft≠CORE-06 · PAY OUT invent DONE · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-09 SEALED (`ATT09QC1-MSLUTL9D`):** hold/settle/release on leave · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave **0** · must_keep ATT-08 preview · ATT-02/PLT/CORE · printable **false** · PAY OUT · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · P1 TYPE-BLOCK UI carry non-block. **AGG + sheet spine AS-IS (PRESENT — RETAIN cite):** (1) **Aggregate** `POST /api/hrm/attendance/attendance-sheets/:sheetId/aggregate` → idempotent UPSERT `att_timesheet_line` UQ `(header_id, employee_id)`. (2) **Submit** `POST …/submit` **must** invoke AGG (OPEN-Q2 FROZEN). (3) **Hours buckets LIVE:** `standard_hours` (present punch or default 8h) · `ot_hours_weighted` = Σ approved OT `total_hours × COALESCE(coefficient, 1.5)` · `paid_leave_hours` / `unpaid_leave_hours` from `attendance_records.status=leave` · `payable_hours` = `standard + paidLeave + ot` (**does not subtract** `late_penalty_hours` today) · `late_penalty_hours` via ATT-02 CFG evaluate on approved late minutes · `work_days`. (4) **Closed** header → `409 HRM-ATT-SHEET-LOCKED`. (5) **Warnings:** `AGG_SHEET_DATE_INVALID` · `AGG_RECORDS_UNAVAILABLE` · `AGG_OT_ENROLL_UNAVAILABLE` · `AGG_EMPTY_ENROLLMENT` · `AGG_LINE_COUNT_ZERO`. (6) **Schema residual cols:** `meal_shift_hours` **NULL writer ABSENT** · no dedicated `holiday_hours` column. (7) **Peers PRESENT (cite ≠ ATT-10 DONE):** sheet CRUD · GET by id · signatures · close · reopen (ATT-11 lane). (8) **ABSENT:** Nest `@Controller('core')` · holiday funnel bucket writer · meal writer · payable−penalty formula harden · shift/calendar SoT for «công chuẩn» beyond default 8h · leave_requests→line direct join (leave enters via day records) · block-close on missing punch as ATT-10 product AC. |
| **Paper target** | FR-UC-BP-ATT-10: chọn kỳ → gộp phễu (công chuẩn + thực tế + phép + lễ + phạt + ăn ca + OT đã × hệ số + trừ không lương) → dòng giờ công tính lương → HCNS rà soát → trạng thái chờ ký (ATT-11). BR-BP-TS-01: một kỳ một bảng; OT đã hệ số; thiếu nhóm → cảnh báo / có thể chặn chốt theo cấu hình. |
| **Gap class** | **GĐ1 continuous AC + residual funnel completeness** on LIVE AGG spine — **not** greenfield Nest `/core`; **not** invent dual sheet/line SoT; **not** claim AGG alone = FR-10 DONE; **not** invent PAY/ATT-11 DONE; **not** invent `att_leave_hold`. |
| **Constraints** | U89 continuous · **preserve** ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable/Word DONE · **DENY** claim ATT module UAT · **DENY** wipe ATT-09 hold · **DENY** wipe ATT-08 preview |
| **Failure impact if unresolved** | Board #30 stalls or Dev invents Nest `/core` / dual AGG; false claim AGG = ATT-10 DONE; PAY opens on incomplete funnel; wipe ATT-09/08 seals; silent invent hours |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-09 + ATT-08 + ATT-02 + PLT-01 + CORE-01..10* (SEALED must_keep)
  Nest /core DENY · printable false · C-SLICE · honesty false · PAY OUT
       │
       │  must_keep RETAIN — DENY reopen J-HRM-ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*
       │  must_keep ATT-09 hold/settle pending_days · DENY att_leave_hold
       │  must_keep ATT-08 preview-deduction · ATT-02 late_penalty CFG peer
       ▼
  ┌────────────── FR-UC-BP-ATT-10 (this seat — gap-only RETAIN + funnel residuals) ─┐
  │                                                                                │
  │  RETAIN LIVE (cite — ≠ ATT-10 DONE alone)                                      │
  │    POST /api/hrm/attendance/attendance-sheets/:id/aggregate                    │
  │      → UPSERT att_timesheet_line (standard · OT×coef · paid/unpaid leave ·     │
  │        payable · late_penalty_hours · work_days · warnings[])                  │
  │    POST …/submit → MUST call AGG (OPEN-Q2 FROZEN)                              │
  │    Sources: attendance_records · overtime_requests approved · late_early       │
  │    Closed → 409 HRM-ATT-SHEET-LOCKED                                           │
  │    Sheet GET/CRUD + sign/close/reopen = peer ATT-11 cite ≠ ATT-10 DONE         │
  │                                                                                │
  │  RESIDUAL unlock (BA → DATA/API — closable gap)                                │
  │    R-ATT-10-FUNNEL : đủ nhóm phễu SRS (chuẩn/thực tế/phép/lễ/phạt/OT/ăn ca)   │
  │    R-ATT-10-STD    : công chuẩn từ ca+lịch (≠ chỉ default 8h) — AC closable    │
  │    R-ATT-10-LEAVE  : phép đã duyệt vào phễu (records XOR leave SoT explicit)   │
  │    R-ATT-10-HOL    : công lễ bucket / cite ATT-03b holiday — ABSENT writer     │
  │    R-ATT-10-MEAL   : meal_shift_hours writer OR OUT GĐ1 explicit               │
  │    R-ATT-10-PAYABLE: payable = f(standard, leave, OT, −penalty?) BR-BP-TS-01  │
  │    R-ATT-10-OT     : OT raw chưa hệ số → chặn vào «giờ công tính lương»       │
  │    R-ATT-10-WARN   : thiếu punch → warnings · optional block-chốt config       │
  │    R-ATT-10-DISP   : display-ready line DTO + FE rà soát trước submit          │
  │    Prefer physical Nest under /api/hrm/attendance/attendance-sheets*           │
  │    Paper F-ATT-SHEET-01 /att/… + /core = ALIAS ONLY                            │
  │                                                                                │
  │  ATT-11 ký chốt / PAY closed read / multi-period = QUEUED · OUT invent DONE    │
  │  must_keep ATT-09/08/02/PLT/CORE · Nest /core DENY · printable false           │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe ATT-09 hold / ATT-08 preview / peers  = DENY
  Invent att_leave_hold second ledger        = DENY
  soft = CORE-06 DONE                        = DENY
  Invent PAY/printable/Word DONE             = DENY
  Claim LIVE AGG alone = ATT-10 DONE         = DENY
  Claim ATT-11 close = ATT-10 DONE           = DENY
  Claim Option alone = ATT module UAT        = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go · ≠ invent PAY DONE
```

**Label lock:** Board «Tổng hợp bảng công (phễu giờ công tính lương)» GĐ1 = **RETAIN cite LIVE AGG + `att_timesheet_line` + submit→AGG** + **gap AC funnel completeness** — **not** Nest `/core` dual; **not** invent `att_leave_hold`; **not** Option alone = ATT UAT; **not** ATT-11/PAY DONE.  
**Spine lock:** Physical prefer `/api/hrm/attendance/attendance-sheets/:id/aggregate` (+ submit same family) · paper `POST /api/hrm/att/attendance-sheets/aggregate` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT.  
**Funnel SoT lock:** LIVE writer = `att-timesheet-line-aggregate.ts` → `att_timesheet_line` — **DENY** invent parallel payroll hour ledger this seat.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Aggregate kỳ | FR-10 Diễn biến #2 · F-ATT-SHEET-01 / AGG-01 | `POST …/aggregate` UPSERT lines | **RETAIN cite** · residual **R-ATT-10-FUNNEL/DISP** |
| Submit → chờ ký | Diễn biến #3 · TechSpec submitted | `POST …/submit` calls AGG · status gate | **RETAIN cite** · ≠ ATT-11 DONE |
| Công chuẩn | Rule ca + lịch | Default `ATT_STANDARD_DAY_HOURS=8` or punch capped | **RESIDUAL** R-ATT-10-STD |
| Công thực tế / punch | Punch hợp lệ + round | `status=present` + punch span | **RETAIN cite** · residual round/warn |
| Công phép | Phép đã duyệt theo loại | Via `attendance_records` leave + unpaid key heuristic | **RETAIN cite** · **R-ATT-10-LEAVE** (SoT vs leave_requests) |
| Công lễ | Lịch lễ đơn vị | **ABSENT** dedicated hours bucket / writer | **RESIDUAL** R-ATT-10-HOL |
| Phạt muộn/sớm | ATT-02 mode/bands | `late_penalty_hours` written on AGG | **RETAIN cite** peer ATT-02 · **≠** CFG=ATT-02 DONE · residual **R-ATT-10-PAYABLE** (subtract?) |
| Ăn ca | Optional policy | Col `meal_shift_hours` NULL · **writer ABSENT** | **RESIDUAL** R-ATT-10-MEAL (or OUT GĐ1) |
| OT × hệ số | BR-BP-TS-01 | Σ `total_hours * COALESCE(coefficient, 1.5)` approved | **RETAIN cite** · **R-ATT-10-OT** AC reject raw |
| Trừ không lương | Unpaid bucket | `unpaid_leave_hours` · **not** in payable sum | **RETAIN cite** |
| Giờ công tính lương | `payable_hours` SoT | `standard + paidLeave + ot` | **RETAIN cite** · **R-ATT-10-PAYABLE** formula AC |
| Warnings / thiếu punch | SRS đặc biệt | warnings[] codes LIVE | **RETAIN cite** · **R-ATT-10-WARN** |
| Closed lock | TechSpec | 409 `HRM-ATT-SHEET-LOCKED` | **RETAIN cite** |
| GET sheet / close / sign | F-ATT-SHEET-02..04 · ATT-11 | PRESENT peers | **peer RETAIN** · **OUT invent = ATT-10 DONE** |
| Paper `/att` + `/core` | alias | Nest `/core` **ABSENT** | **paper = alias only** |
| ATT-09 hold/settle | peer | SEALED `ATT09QC1-MSLUTL9D` | **must_keep RETAIN** |
| ATT-08 preview | peer | SEALED `ATT08QC1-MSLSL36C` | **must_keep RETAIN** |
| ATT-02 / PLT / CORE | peers | SEALED stamps | **must_keep RETAIN** |
| `att_leave_hold` | DENY dual | held=`pending_days` | **DENY invent** |
| PAY deepen | OUT | QUEUED | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT UAT** · **≠ ATT-10 DONE** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN AGG + att_timesheet_line funnel (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` `POST …/attendance-sheets/:id/aggregate` + submit→AGG + `att_timesheet_line` materialize (standard · OT weighted · paid/unpaid leave · payable · late_penalty · warnings) · closed lock 409. Unlock BA residuals **R-ATT-10-FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP** for BR-BP-TS-01 AC (phễu đủ nhóm · công chuẩn · phép SoT · lễ/ăn ca closable or OUT GĐ1 · payable formula · OT hệ số · warnings · display-ready FE). Prefer physical Nest under `/api/hrm/attendance/attendance-sheets*`; paper **F-ATT-SHEET-01** `/att/…` + `/core` = **alias only**. **must_keep** ATT09QC1-MSLUTL9D hold/settle · ATT08QC1-MSLSL36C preview · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT · ≠ soft/ATT-08=ATT-09 DONE. PAY/printable/Word/ATT-11 invent DONE **OUT**. **DENY** invent `att_leave_hold` · claim Option/AGG alone = ATT module UAT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Low–medium (spine LIVE; residual = funnel AC + optional holiday/meal/payable formula wire) |
| **Risk** | Low if BA invents Nest dual / claims AGG=DONE / invents PAY / wipes ATT-09/08 |
| **Cost / timeline** | BA → ba-data HOLD (prefer) → sa API F.1 deepen only if closable wire gap → Dev residual · QA U65 |
| **Pros** | Matches preserve_default; reuses LIVE AGG already coded (OPEN-Q2 FROZEN); unlocks board #30; avoids dual SoT; preserves ATT-09/08 seals |
| **Cons** | Holiday/meal/payable−penalty still residual; ATT-11/PAY still QUEUED |
| **Failure modes** | BA over-scopes Nest `/core` · claims AGG alone DONE · invents PAY · wipes hold/preview |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual + invent second AGG / wipe LIVE lines (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary aggregate SoT; invent parallel hour ledger; dual-write or abandon `/attendance/attendance-sheets*/aggregate` + `att_timesheet_line` |
| **Pros** | Paper `/core` literal |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression ATT-09/08/02/PLT/CORE + live AGG/PAY probes |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe hold/preview/AGG |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim LIVE AGG = ATT-10 DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because aggregate endpoint exists (even when holiday/meal/payable formula/FE review incomplete); flip `attendance_uat_ready`; invent PAY/printable DONE; reopen sealed ATT-09/08/02/PLT/CORE |
| **Pros** | Fast chat claim |
| **Cons** | Violates BR-BP-TS-01 funnel completeness · C-SLICE · sponsor distrust · PAY risk on incomplete SoT |
| **Failure modes** | False UAT · incomplete giờ công tính lương · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap funnel AC) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|-------------------------:|-------------------:|--------------------:|
| Business value (FR-ATT-10) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **5** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **4** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit BR-BP-TS-01 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE AGG + submit→AGG + `att_timesheet_line` funnel; unlock R-ATT-10-* residuals; paper F-ATT-SHEET-01 + `/core` = alias only; **RETAIN** ATT-09 hold/settle · ATT-08 preview · ATT-02/PLT/CORE · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT; **DENY** Nest dual · invent `att_leave_hold` · wipe peers · invent PAY/printable/Word DONE · claim AGG alone = ATT-10 DONE · claim ATT-11 = ATT-10 DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns BR-BP-TS-01 spine (AGG materialize · OT×coef · leave buckets · late_penalty write · payable · locked when closed · OPEN-Q2 submit→AGG); FR-10 gap is **funnel completeness AC + display journey + optional holiday/meal/payable formula** — not greenfield Nest `/core`, not dual ledger, not wipe ATT-09/08; preserves W10–W27 must_keep; unlocks board #30 |
| **Assumptions** | ATT-09 **`ATT09QC1-MSLUTL9D` RETAIN** · QA `ATT09QA2-MSLUKI9U` · hold/settle **PRESENT** · held=`pending_days` · DENY `att_leave_hold` · Nest `/core` leave **0**. ATT-08 **`ATT08QC1-MSLSL36C` RETAIN**. ATT-02 **`ATT02QC1-MSLQZUK7` RETAIN**. PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN**. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT** (grep 2026-08-09). Physical AGG + submit **PRESENT**. `attendance_uat_ready=false` · printable false · product_go **false**. ATT-11 / PAY **QUEUED**. |
| **Rejected** | **B** — Nest `/core` dual / invent second AGG / wipe · **C** — HOLD / claim LIVE AGG = ATT-10 DONE / invent PAY·printable / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | AGG SoT | LIVE `POST …/aggregate` + `att_timesheet_line` · paper F-ATT-SHEET-01 alias | ≠DONE from AGG alone · mint J-HRM-ATT-10-* |
| O2 | Submit→AGG | OPEN-Q2 FROZEN — submit **must** invoke AGG | AC + F5 lines present |
| O3 | Phễu nhóm | Map SRS buckets ↔ LIVE cols; holiday/meal = residual closable **XOR** OUT GĐ1 explicit | Footer groups PRESENT/ABSENT |
| O4 | Công chuẩn | Prefer residual wire from shift/calendar **XOR** document GĐ1 default-8 as accepted interim | ≠ claim STD DONE if interim |
| O5 | Phép vào phễu | Prefer: day-record leave SoT GĐ1 · cite ATT-09 approved leave upstream | DENY invent leave HTTP in PAY |
| O6 | Payable formula | Prefer: document LIVE `standard+paid+ot` · decide whether −`late_penalty_hours` GĐ1 | Gold numeric AC |
| O7 | OT hệ số | Reject raw OT into payable; LIVE uses coefficient (default 1.5) | FAIL case raw |
| O8 | Warnings / thiếu punch | warnings[] + optional block-chốt (ATT-11) — ATT-10 = warn AC | ≠ invent ATT-11 DONE |
| O9 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O10 | ATT-09/08/02/PLT/CORE | must_keep stamps · ≠ soft/ATT-08=ATT-09 DONE · CFG≠ATT-02 DONE | ≠ reopen · ≠ claim DONE |
| O11 | ATT-11 / PAY / printable | OUT invent DONE | Trace-only if sheet cite |
| O12 | Honesty / journeys | All false · C-SLICE · `attendance_uat_ready=false` · mint `J-HRM-ATT-10-*` DRAFT | Footer ≠DONE · ≠ ATT module UAT · U65 zero-seed · DENY `att_leave_hold` |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-SHEET-01** / **F-ATT-SHEET-AGG-01** (this seat) | `POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate` | `POST /api/hrm/att/attendance-sheets/aggregate` · `/core/…` **alias only** | Gộp phễu → materialize `att_timesheet_line` (giờ công tính lương) | Diễn biến **#1–#2** · BR-BP-TS-01 |
| **Submit** (RETAIN peer gate) | `POST …/attendance-sheets/{sheetId}/submit` | paper alias | Gửi chờ ký — **must** gọi AGG | Diễn biến **#3** · ≠ invent ATT-11 DONE |
| **F-ATT-SHEET-04** (peer RETAIN) | `GET …/attendance-sheets/{id}` | paper alias | Đọc sheet + lines (ATT UI; PAY chỉ khi closed) | peer PAY-01 · ≠ ATT-10 DONE |
| **F-ATT-SHEET-02/03 + WF-SIGN** | close / reopen / signatures | paper alias | Ký chốt / mở lại | **ATT-11 OUT** invent DONE this seat |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-SHEET-01/AGG.  
**DENY:** invent second hour ledger beside `att_timesheet_line`.  
**DENY:** treat paper path alone as Nest dual invent requirement.

**Display-ready cite for BA/DATA:** `{ sheet_id, status, statusLabelVi, line_count, warnings[], lines: [{ employee_id, employee_name?, standard_hours, ot_hours_weighted, paid_leave_hours, unpaid_leave_hours, late_penalty_hours, meal_shift_hours?, payable_hours, work_days, line_locked }] }` — BA may deepen VI labels; map paper holiday/meal → LIVE residual or OUT GĐ1.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-ATT-10-* DRAFT
  → ba-data HOLD default (ADD residual ONLY if BA proves closable col/writer for HOL/MEAL/PAYABLE)
  → sa API-01 F.1 deepen RETAIN cite F-ATT-SHEET-01/AGG (+ wire residual ONLY if closable)
  → Dev-BE / Dev-FE residual wire ONLY (gap-only)
  → QA U65 J-HRM-ATT-10-* browser FE-after-2xx + F5
  → QC GWC C-SLICE (≠ ATT-10 module UAT · ≠ ATT module UAT · printable false · PAY OUT)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC + mint J-HRM-ATT-10-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if closable | ba-data | HOLD unless closable gap |
| 4. sa API F.1 cite RETAIN AGG (+ wire residual ONLY if closable) | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-10-* (aggregate → lines · OT weighted · leave buckets · Nest `/core` 0 · F5) | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip · ≠ wipe ATT-09/08 · ≠ invent PAY |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT-09/08/02/PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT-10 DONE · **≠** claim ATT UAT.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O9 DENY · QC Nest SoT 0 |
| A | Claim AGG alone = ATT-10 DONE | Evidence footer missing ≠DONE | O1/O12 · C-SLICE |
| A | Wipe ATT-09 hold / ATT-08 preview | Diff removes leave hold / preview | must_keep ATT09/ATT08 · O10 |
| A | Invent PAY / ATT-11 DONE | AC claims payroll / close WF | O11 OUT |
| A | Invent `att_leave_hold` | New table dual | O12 DENY · held=pending_days |
| A | Claim Option = ATT module UAT | Ready flag flip | O12 DENY |
| B | Dual-write / Nest `/core` | New `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| ATT09QC1-MSLUTL9D | RETAIN · hold/settle/release · held=`pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| ATT08QC1-MSLSL36C | RETAIN · preview-deduction physical · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠ATT-08 DONE |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · late_penalty peer funnel · ≠ ATT UAT |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY / printable / Word | **OUT invent DONE** |
| ATT-11 close/sign | **≠** invent = ATT-10 DONE |
| LIVE AGG alone | **≠** ATT-10 DONE · **≠** ATT module UAT |
| `att_leave_hold` | **DENY** invent dual |
| Honesty | **DENY** flip · **C-SLICE** · `attendance_uat_ready=false` |
| apps/** | **CẤM** until contracts after BA/DATA/API |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-ATT-10: RETAIN LIVE `POST …/attendance-sheets/:id/aggregate` + submit→AGG + `att_timesheet_line` funnel (standard · OT×coef · paid/unpaid leave · payable · late_penalty · warnings); unlock R-ATT-10-FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP; paper F-ATT-SHEET-01 `/att`+`/core` alias only; **must_keep** ATT-09 hold/settle (`ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold`) · ATT-08 preview (`ATT08QC1-MSLSL36C`) · ATT-02/PLT/CORE · Nest `/core` DENY · printable false · ≠ ATT UAT; DENY invent PAY/printable · honesty flip · claim AGG=ATT-10 DONE · apps/**. unlock_lane **BA → DATA(HOLD) → API → FE/BE**. Explicit **≠ ATT-10 DONE · ≠ ATT module UAT · C-SLICE · PAY OUT · printable false**. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md` |
| **unlock_lane** | `ba-process` → `ba-data` (HOLD prefer) → `sa` API-01 → `dev-be`/`dev-fe` residual → `qa` → `qc` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-28 seat #30)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md · depends ATT09QC1-MSLUTL9D · must_keep ATT-09 hold/settle RETAIN (pending_days · DENY att_leave_hold · Nest /core leave 0) · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · PAY invent DONE OUT
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline · residuals R-ATT-10-* · unlock_lane)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-10 · BR-BP-TS-01 · phễu SoT · Diễn biến #1–#3
  - docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md §6 funnel · F-ATT-SHEET-01..04 (ATT-11 peer OUT invent)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-SHEET-01 / AGG
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md (must_keep ATT09QC1-MSLUTL9D)
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-ATT-10 (aggregate funnel · payable · OT×hệ số · warnings · display)
  - Mint J-HRM-ATT-10-* DRAFT (U65 browser) — chọn kỳ → POST aggregate/submit → lines hiện đủ nhóm SoT đã lock → F5; không seed
  - Explicit ≠ ATT-10 DONE from AGG alone · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE · PAY OUT
  - ba-data HOLD default (ADD residual only if closable gap for HOL/MEAL/PAYABLE formula) · DENY invent att_leave_hold dual · DENY Nest /core dual · DENY invent PAY/printable/Word DONE · DENY wipe ATT-09/08 · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · invent att_leave_hold dual · wipe ATT-09/08/02/PLT/CORE · honesty flip · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable · invent ATT-11 DONE
```

---

*End SA-01 · Option A LOCKED · 2026-08-09*
