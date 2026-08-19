# PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01 — Option/F.1 · Giữ chỗ quỹ phép khi nộp & duyệt (hold on submit) — RETAIN LIVE leave create/approve + pending_days

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-08 / ATT-02 / PLT / CORE seals · **DENY** invent PAY/printable/Word DONE · **DENY** invent `att_leave_hold` dual ledger · **DENY** honesty flip · **DENY** claim ATT module UAT · **DENY** claim client-days=ATT-08 DONE · **DENY** claim ATT-08 preview = ATT-09 DONE · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD residual) → API/FE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-26 UC-BP-ATT-08 **SEALED** — stamp `ATT08QC1-MSLSL36C` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-qc-01.md` · QA `ATT08QA1-MSLSGUJF` · **must_keep** ATT-08 preview-deduction RETAIN (physical `POST …/preview-deduction` · T6→T2=2 · HOL-MISS · ALIGN · **R-ATT-08-PREVIEW-FE CLOSED**) · `ATT02QC1-MSLQZUK7` · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false** · ≠ CORE-09 DONE) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` **ABSENT** · **client-days≠ATT-08 DONE** · **≠ ATT UAT** · PAY invent DONE **OUT** |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#29** after ATT-08 (#28 SEALED GWC) · ATT-10+ / PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | ATT-08 [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md) · ATT-02/PLT/CORE seals · leave catalog / funnel / balance panel peers **RETAIN cite** · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim ATT-08 = ATT-09 DONE** · **DENY invent PAY/printable DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-09** · Diễn biến **#0a–#6 + Thành công** · **BR-BP-LV-06** (submit **must** hold · reject hoàn **100%**) · **BR-BP-LV-05** (peer ATT-08 engine) · **BR-BP-LV-TYPE-01** · partner **REQ_NP_003** · **Q-LEAVE-UNIT** = cả hai theo loại phép · **GĐ1 = một QL trực tiếp** (thang duyệt theo số ngày = giai đoạn sau) |
| **ref_inventory** | `UC_INVENTORY.md` / `UC_BR_MATRIX_DEPTH.md` `UC-BP-ATT-09` — hold on submit · approve consume · reject release |
| **ref_adr** | This Option evaluation (ADR template) · Nest physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-LEAVE-02** (submit + hold) · **F-ATT-LEAVE-03** (approve consume / reject release) · peer **F-ATT-LEAVE-01** preview (**must_keep ATT-08** · ≠ invent wipe) · leave-balance/panel · **F-ATT-CAT-EFF-01** · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.leave_requests` · `public.employee_leave_balances` (**`pending_days`** = hold · **`used_days`** = consumed · **`entitled_days`**) · paper `leave_balances.held` / `att_leave_hold` = **alias / DENY invent dual** · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `attendance.controller` `@Controller('attendance')` · `POST leave-requests` · `POST …/approve\|reject\|cancel` · `POST …/preview-deduction` · `GET leave-balance` + `…/panel` · `LeaveRequestsService.lockPendingLeaveBalance` / `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` · `assertSufficientLeaveBalance` · `assertNoLeaveOverlap` · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual · wipe ATT-08 preview / ATT-02 CFG / PLT / CORE · invent PAY DONE · invent printable/Word DONE · invent `att_leave_hold` second ledger · claim LIVE soft hold-alone = ATT-09 DONE · claim ATT-08 preview = ATT-09 DONE · claim ATT-04b ứng phép full DONE · claim multi-level approve GĐ1 · claim ATT module UAT · reopen sealed peers · seed · honesty flip · apps/** this seat |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-27 architecture unlock: **leave balance hold on submit + consume/release on approve/reject** (FR-UC-BP-ATT-09 · BR-BP-LV-06) vs AS-IS LIVE Nest leave create/approve — **gap-only** under U89 |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after ATT-08 QC-01 GWC (`ATT08QC1-MSLSL36C`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-09 · BR-BP-LV-06 · BR-BP-LV-05 peer · REQ_NP_003 · F-ATT-LEAVE-02/03 · F-ATT-LEAVE-01 must_keep · must_keep ATT-08/02/PLT/CORE · Nest `/core` DENY · U19 · soft≠CORE-06 · PAY OUT invent DONE · client-days≠ATT-08 DONE · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-08 SEALED (`ATT08QC1-MSLSL36C`):** preview-deduction physical **PRESENT** · T6→T2 `working_days=2` · HOL-MISS · ALIGN · Nest `/core` leave **0** · **R-ATT-08-PREVIEW-FE CLOSED** · client-days≠ATT-08 DONE · ≠ ATT UAT · must_keep ATT-02/PLT/CORE · printable **false** · PAY OUT. **Leave TXN + hold AS-IS (PRESENT — RETAIN cite):** (1) **Submit** `POST /api/hrm/attendance/leave-requests` → status `pending` · after insert calls **`lockPendingLeaveBalance`** (`pending_days += deductible/total`) when `employee_leave_balances` row exists. (2) **Approve** `POST …/leave-requests/:id/approve` → **`settleApprovedLeaveBalance`** (`pending_days −=` · `used_days +=`). (3) **Reject / cancel** → **`releasePendingLeaveBalance`** (`pending_days −=` · **100%** release of locked units). (4) **Available** = `entitled − used − pending` on `GET leave-balance` + `…/panel` (display-ready). (5) **Overlap** `assertNoLeaveOverlap` pending\|approved. (6) **Balance gate** `assertSufficientLeaveBalance` when tracked. (7) **Soft path:** **no** balance row → assert + lock are **no-op** (happy path must_keep). (8) **ABSENT:** Nest `@Controller('core')` · separate `att_leave_hold` table · PATCH change leave_type while pending (re-hold) · multi-level approve by day count · ATT-04b full advance policy as ATT-09 DONE. |
| **Paper target** | FR-UC-BP-ATT-09: gửi đơn → **giữ chỗ ngay** (giảm khả dụng) · duyệt → giữ chỗ → đã trừ · từ chối → hoàn **100%** · chồng ngày chặn · GĐ1 = **một** QL trực tiếp · BR-BP-LV-06: gửi không giữ chỗ = **không chấp nhận** khi hệ thống theo dõi quỹ. |
| **Gap class** | **GĐ1 continuous AC + residual harden hold/panel/GĐ1-one-level/type-change policy** on LIVE leave + `pending_days` spine — **not** greenfield Nest `/core`; **not** invent `att_leave_hold` dual; **not** claim soft no-row path alone = FR-09 DONE; **not** invent PAY DONE. |
| **Constraints** | U89 continuous · **preserve** ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable/Word DONE · **DENY** claim ATT module UAT · **DENY** wipe ATT-08 preview |
| **Failure impact if unresolved** | Board #29 stalls or Dev invents Nest `/core` / dual hold ledger; false claim soft create = ATT-09 DONE; double-book quỹ; wipe ATT-08 preview seal; PAY open early |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-08 + ATT-02 + PLT-01 + CORE-01..10* (SEALED must_keep)
  Nest /core DENY · printable false · client-days≠ATT-08 DONE · C-SLICE · honesty false
       │
       │  must_keep RETAIN — DENY reopen J-HRM-ATT-08 / ATT-02 / PLT-01 / CORE-*
       │  must_keep ATT-08 preview-deduction · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED
       ▼
  ┌────────────── FR-UC-BP-ATT-09 (this seat — gap-only RETAIN + hold residuals) ─┐
  │                                                                              │
  │  RETAIN LIVE (cite — ≠ ATT-09 DONE alone)                                    │
  │    POST /api/hrm/attendance/leave-requests                                   │
  │      → lockPendingLeaveBalance (pending_days += units)                       │
  │    POST …/leave-requests/:id/approve                                         │
  │      → settleApprovedLeaveBalance (pending→used)                             │
  │    POST …/reject | cancel                                                    │
  │      → releasePendingLeaveBalance (hoàn 100%)                                │
  │    GET leave-balance + leave-balance/panel                                   │
  │      → available = entitled − used − pending                                 │
  │    POST …/preview-deduction (ATT-08 must_keep)                               │
  │    assertNoLeaveOverlap · assertSufficientLeaveBalance · ATT-08 ALIGN        │
  │                                                                              │
  │  RESIDUAL unlock (BA → DATA/API — closable gap)                              │
  │    R-ATT-09-HOLD   : BR-BP-LV-06 — submit without hold when tracked = FAIL   │
  │    R-ATT-09-SETTLE : approve consume · reject/cancel release 100% AC         │
  │    R-ATT-09-PANEL  : panel/FE reflects pending after submit · F5             │
  │    R-ATT-09-SOFT   : soft no-row policy explicit (track XOR untracked)       │
  │    R-ATT-09-TYPE   : đổi loại khi pending — re-hold / chặn (SRS đặc biệt)    │
  │    R-ATT-09-GĐ1    : một QL trực tiếp đủ · DENY multi-level by days GĐ1      │
  │    R-ATT-09-DISP   : display-ready held/pending/available/statusLabelVi      │
  │    Prefer physical Nest under /api/hrm/attendance/*                          │
  │    Paper F-ATT-LEAVE-02/03 /att/… + /core = ALIAS ONLY                       │
  │    Paper held / att_leave_hold = alias → LIVE pending_days (DENY invent dual)│
  │                                                                              │
  │  ATT-04b ứng phép full / ATT-10 / PAY / multi-level = QUEUED · OUT invent    │
  │  must_keep ATT-08/02/PLT/CORE · Nest /core DENY · printable false            │
  └──────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe ATT-08 preview / ATT-02 / PLT / CORE  = DENY
  Invent att_leave_hold second ledger        = DENY
  soft = CORE-06 DONE                        = DENY
  Invent PAY/printable/Word DONE             = DENY
  Claim soft create alone = ATT-09 DONE      = DENY
  Claim ATT-08 preview = ATT-09 DONE         = DENY
  Claim Option alone = ATT module UAT        = DENY
  Claim client-days = ATT-08 DONE            = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go
```

**Label lock:** Board «Nộp & duyệt phép — hold quỹ khi submit» GĐ1 = **RETAIN cite LIVE leave create/approve/reject + `pending_days` hold ledger + balance panel** + **gap AC harden BR-BP-LV-06 / panel / GĐ1 / type-change** — **not** Nest `/core` dual; **not** invent `att_leave_hold`; **not** Option alone = ATT UAT.  
**Spine lock:** Physical prefer `/api/hrm/attendance/leave-requests*` (+ approve/reject/cancel same family) · paper `POST /api/hrm/att/leave-requests` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT.  
**Hold SoT lock:** LIVE column **`employee_leave_balances.pending_days`** = paper **held** — **DENY** invent parallel `att_leave_hold` table this seat.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **≠** ATT-08 DONE from client-days · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Hold on submit | BR-BP-LV-06 · Diễn biến #2 · F-ATT-LEAVE-02 | `lockPendingLeaveBalance` when balance row **PRESENT** | **RETAIN cite** · residual **R-ATT-09-HOLD/SOFT** (soft no-row ≠ strict FR alone) |
| Available decreases | Hậu điều kiện · panel | `available = entitled−used−pending` on balance/panel | **RETAIN cite** · **R-ATT-09-PANEL** FE AC |
| Approve → consumed | Diễn biến #3 · F-ATT-LEAVE-03 | `settleApprovedLeaveBalance` pending→used | **RETAIN cite** · **R-ATT-09-SETTLE** |
| Reject → hoàn 100% | Diễn biến #4 · BR-BP-LV-06 | `releasePendingLeaveBalance` | **RETAIN cite** · **R-ATT-09-SETTLE** |
| Cancel release | peer | cancel also releases pending | **RETAIN cite** |
| Overlap chặn | Diễn biến #5 | `assertNoLeaveOverlap` | **RETAIN cite** |
| Preview ngày trừ | Diễn biến #1 · ATT-08 | `POST …/preview-deduction` **SEALED** | **must_keep RETAIN** · **≠** ATT-09 DONE |
| Engine units on hold | BR-BP-LV-05 · ALIGN | create uses `deductible_units` when engine live | **must_keep ATT-08 ALIGN** |
| Leave type ∈ EFF | BR-BP-LV-TYPE-01 | assert leave_type catalog | **RETAIN cite** |
| Đổi loại khi pending | SRS đặc biệt | **ABSENT** PATCH re-hold | **RESIDUAL** R-ATT-09-TYPE |
| GĐ1 one manager | SRS v0.14 | approve path LIVE (no day-threshold ladder) | **RETAIN cite** · **R-ATT-09-GĐ1** AC DENY multi-level invent |
| Paper `held` / `att_leave_hold` | API_DESIGN | LIVE = `pending_days` | **alias → pending_days** · **DENY invent dual** |
| Paper `/att` + `/core` | alias | Nest `/core` **ABSENT** | **paper = alias only** |
| ATT-08 preview seal | peer | SEALED `ATT08QC1-MSLSL36C` | **must_keep RETAIN** |
| ATT-02/PLT/CORE | peers | SEALED stamps | **must_keep RETAIN** |
| Ứng phép full / ATT-04b | OUT | catalog `allows_advance` peer only | **OUT invent DONE** this seat |
| PAY deepen | OUT | QUEUED | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN leave create/approve + pending_days hold (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` leave-requests create/approve/reject/cancel · `lockPendingLeaveBalance` / `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` on `employee_leave_balances.pending_days`/`used_days` · leave-balance + panel · overlap + balance assert · **must_keep ATT-08** `POST …/preview-deduction` (T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED). Unlock BA residuals **R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP** for BR-BP-LV-06 AC (submit hold when tracked · reject 100% · panel F5 · soft no-row explicit · type-change policy · one-manager GĐ1 · display-ready). Prefer physical Nest under `/api/hrm/attendance/*`; paper **F-ATT-LEAVE-02/03** `/att/…` + `/core` = **alias only**; paper `held`/`att_leave_hold` = **alias to `pending_days`** — **DENY** invent dual ledger. **must_keep** ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · client-days≠ATT-08 DONE · ≠ ATT UAT. PAY/printable/Word **OUT invent DONE**. **DENY** claim Option/soft-create alone = ATT module UAT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Low–medium (spine LIVE; residual = AC harden + soft policy + optional type-change + panel journey) |
| **Risk** | Low if BA invents Nest dual / `att_leave_hold` / claims LIVE alone DONE / invents PAY / wipes ATT-08 preview |
| **Cost / timeline** | BA → ba-data HOLD (prefer) → sa API F.1 deepen only if closable wire gap → Dev residual · QA U65 |
| **Pros** | Matches preserve_default; reuses LIVE hold TXN already coded; unlocks board #29; avoids dual SoT; preserves ATT-08 seal |
| **Cons** | Soft no-row ≠ strict BR alone until AC; type-change residual; ATT-04b/PAY still QUEUED |
| **Failure modes** | BA over-scopes Nest `/core` · invents `att_leave_hold` · claims soft = DONE · wipes preview |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual + invent `att_leave_hold` / wipe pending_days (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary leave-hold SoT; invent `att_leave_hold` table; dual-write or abandon `/attendance/leave-requests*` + `pending_days` |
| **Pros** | Paper `/core` / `att_leave_hold` literal |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression ATT-08/02/PLT/CORE + live hold |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe preview/balance |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim LIVE soft create = ATT-09 DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because create exists (even when balance row absent / no panel F5 / no BR-BP-LV-06 FAIL path); flip `attendance_uat_ready`; invent PAY/printable DONE; reopen sealed ATT-08/02/PLT/CORE |
| **Pros** | Fast chat claim |
| **Cons** | Violates BR-BP-LV-06 · C-SLICE · double-book risk when untracked · sponsor distrust |
| **Failure modes** | False UAT · đặt kép quỹ · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap hold AC) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|-----------------------:|-------------------:|--------------------:|
| Business value (FR-ATT-09) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **5** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **4** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit BR-BP-LV-06 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE leave create/approve/reject/cancel + `pending_days` hold ledger + balance/panel + overlap/balance assert + **must_keep ATT-08 preview**; unlock hold/settle/panel/soft/type/GĐ1/disp residuals; paper F-ATT-LEAVE-02/03 + `/core` = alias only; paper held = `pending_days`; **RETAIN** ATT-08/02/PLT/CORE · soft≠CORE-06 · Nest `/core` DENY · client-days≠ATT-08 DONE · ≠ ATT UAT; **DENY** Nest dual · invent `att_leave_hold` · wipe peers · invent PAY/printable/Word DONE · claim soft create = ATT-09 DONE · claim ATT-08 preview = ATT-09 DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns submit hold (`lockPendingLeaveBalance`), approve consume, reject/cancel release 100%, and panel available math; FR-09 gap is **AC harden + soft-row policy + panel journey + GĐ1 + optional type-change** — not greenfield Nest `/core`, not dual hold ledger, not wipe ATT-08 preview; preserves W10–W26 must_keep; unlocks board #29 |
| **Assumptions** | ATT-08 **`ATT08QC1-MSLSL36C` RETAIN** · QA `ATT08QA1-MSLSGUJF` · preview physical **PRESENT** · **R-ATT-08-PREVIEW-FE CLOSED** · client-days≠ATT-08 DONE · ≠ ATT UAT. ATT-02 **`ATT02QC1-MSLQZUK7` RETAIN**. PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN**. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT** (grep 2026-08-09). Physical leave* + balance* **PRESENT**. `attendance_uat_ready=false` · printable false · product_go **false**. GĐ1 = one direct manager (SRS v0.14). |
| **Rejected** | **B** — Nest `/core` dual / invent `att_leave_hold` / wipe · **C** — HOLD / claim LIVE soft = ATT-09 DONE / invent PAY·printable / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Hold SoT | LIVE `pending_days` = paper held · **DENY** invent `att_leave_hold` dual | AC map held↔pending · ≠DONE from soft alone |
| O2 | Submit hold | BR-BP-LV-06 — when balance tracked, create **must** increase pending before return 2xx | FAIL if submit without hold when tracked |
| O3 | Soft no-row | Prefer: untracked (no row) = allow create **without** hold **XOR** require balance row before submit — pick one; document | Explicit ≠ claim soft path = FR-09 DONE |
| O4 | Approve/reject | pending→used · reject/cancel release **100%** of locked units | Gold cases + F5 panel |
| O5 | Panel | After submit, panel `available`/`pending` reflect hold · F5 | Mint J-HRM-ATT-09-* · U65 |
| O6 | Preview peer | **must_keep** ATT-08 preview-deduction · hold consumes engine units when ALIGN live | ≠ wipe · ≠ claim ATT-08 = ATT-09 DONE |
| O7 | Type change | Prefer: chặn đổi loại khi pending **XOR** release+re-lock (SRS) — pick one closable | DENY invent full edit workflow beyond hold |
| O8 | GĐ1 approve | One direct manager enough · DENY day-threshold multi-level GĐ1 | Footer giai đoạn sau OUT |
| O9 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O10 | ATT-08/02/PLT/CORE | must_keep stamps · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE | ≠ reopen · ≠ claim DONE |
| O11 | PAY/printable/Word / ATT-04b/10 | OUT invent DONE | Trace-only if balance cite |
| O12 | Honesty / journeys | All false · C-SLICE · `attendance_uat_ready=false` · mint `J-HRM-ATT-09-*` DRAFT | Footer ≠DONE · ≠ ATT module UAT · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-LEAVE-02** (this seat) | `POST /api/hrm/attendance/leave-requests` | `POST /api/hrm/att/leave-requests` · `/core/…` **alias only** | Nộp đơn + giữ chỗ quỹ (`pending_days`) | Diễn biến **#2** · BR-BP-LV-06 |
| **F-ATT-LEAVE-03** (this seat) | `POST …/leave-requests/:id/approve` · `…/reject` · peer `…/cancel` | paper `/att/…` alias | Duyệt: giữ chỗ→đã trừ · Từ chối/hủy: hoàn 100% | Diễn biến **#3–#4** |
| **F-ATT-LEAVE-01** (must_keep peer) | `POST …/leave-requests/preview-deduction` | paper alias | Preview ngày trừ trước gửi | Diễn biến **#1** · **≠** invent wipe ATT-08 |
| **Leave balance / panel** (RETAIN) | `GET …/leave-balance` · `GET …/leave-balance/panel` | paper alias | Khả dụng phản ánh hold | Hậu điều kiện · ATT-05b peer cite |
| **F-ATT-CAT-EFF** (RETAIN) | leave-types effective | paper alias | Loại phép ∈ danh mục trước hold | Diễn biến **#0a–#0b** |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-LEAVE-02/03.  
**DENY:** invent `att_leave_hold` as second SoT beside `pending_days`.  
**DENY:** treat paper path alone as Nest dual invent requirement.

**Display-ready cite for BA/DATA:** `{ request_id, status, status_label, pending_days | held_units, used_days, available_days, deductible_units?, leave_type, leave_type_label }` — BA may deepen VI labels; map paper `held_units` → LIVE `pending_days`.

---

## 6. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O9 DENY · QC Nest SoT 0 |
| A | Invent `att_leave_hold` dual ledger | New table + dual-write | O1 DENY · ba-data HOLD prefer |
| A | Claim soft create / no panel = ATT-09 DONE | Evidence footer missing ≠DONE | O3/O12 · C-SLICE |
| A | Wipe ATT-08 preview seal | Diff removes preview-deduction / reopens J-ATT-08 | must_keep ATT08QC1 · O6 |
| A | Invent PAY/printable / multi-level approve | AC claims payroll / day ladder GĐ1 | O8/O11 OUT |
| A | Claim Option = ATT module UAT | Ready flag flip | O12 DENY |
| B | Dual-write / Nest `/core` | New `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 7. Implementation & validation plan

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC pack + mint J-HRM-ATT-09-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if BA proves closable (soft/type) | ba-data | HOLD unless closable gap |
| 4. sa API F.1 cite RETAIN F-ATT-LEAVE-02/03 (+ wire residual ONLY if closable) | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-09-* (submit→pending↑·available↓ · approve used · reject 100% · Nest `/core` 0) | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip · ≠ wipe ATT-08 · client-days≠ATT-08 DONE |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT-08/02/PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT UAT · **≠** claim ATT-08 DONE.

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| ATT08QC1-MSLSL36C | RETAIN · preview-deduction physical · T6→T2=2 · HOL-MISS · ALIGN · **R-ATT-08-PREVIEW-FE CLOSED** · client-days≠ATT-08 DONE · ≠ ATT UAT · Nest `/core` leave 0 |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY / printable / Word | **OUT invent DONE** |
| `pending_days` hold spine | **RETAIN** · paper held = alias · **DENY** invent `att_leave_hold` dual |
| ATT-08 preview / ALIGN | **≠** wipe · **≠** claim = ATT-09 DONE |
| client `total_days` / calendar | **≠** ATT-08 DONE · **≠** ATT-09 DONE |
| ATT-04b / ATT-10 / multi-level | **≠** invent DONE this seat |
| Honesty | **DENY** flip · **C-SLICE** · `attendance_uat_ready=false` |
| ATT module UAT | **DENY** claim from Option alone |
| apps/** | **CẤM** until contracts after BA/DATA/API |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-ATT-09: RETAIN LIVE `/attendance/leave-requests` create + approve/reject/cancel + `pending_days` hold (`lockPending` / `settle` / `release` 100%) + leave-balance/panel; **must_keep** ATT-08 preview-deduction (`ATT08QC1-MSLSL36C` · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED); unlock R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP; paper F-ATT-LEAVE-02/03 `/att`+`/core` alias only; paper held→`pending_days` (**DENY** `att_leave_hold` dual); must_keep ATT-02/PLT/CORE · Nest `/core` DENY · printable false · client-days≠ATT-08 DONE · ≠ ATT UAT; DENY invent PAY/printable · honesty flip · apps/**. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-27 seat #29)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md · depends ATT08QC1-MSLSL36C · must_keep ATT-08 preview-deduction RETAIN (physical POST …/preview-deduction · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED) · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY invent DONE OUT
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline · residuals R-ATT-09-*)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-09 · BR-BP-LV-06 · BR-BP-LV-05 peer · GĐ1 one manager
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-LEAVE-02 · F-ATT-LEAVE-03 · F-ATT-LEAVE-01 peer
  - docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-qc-01.md (must_keep ATT08QC1-MSLSL36C)
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-ATT-09 (hold on submit · approve consume · reject 100% · panel F5 · soft policy · GĐ1)
  - Mint J-HRM-ATT-09-* DRAFT (U65 browser) — submit → pending↑ available↓ → approve used XOR reject hoàn 100% → F5; không seed
  - Explicit ≠ ATT-09 DONE from soft create alone · ≠ ATT-08 preview = ATT-09 DONE · ≠ client-days=ATT-08 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE
  - ba-data HOLD default (ADD residual only if closable gap for soft/type) · paper held = pending_days · DENY invent att_leave_hold dual · DENY Nest /core dual · DENY invent PAY/printable/Word DONE · DENY wipe ATT-08 preview · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · invent att_leave_hold dual · wipe ATT-08/02/PLT/CORE · honesty flip · claim soft=ATT-09 DONE · claim ATT-08=ATT-09 DONE · claim ATT module UAT · invent PAY/printable
```

---

*End SA-01 · Option A LOCKED · 2026-08-09*
