# PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01 — Option/F.1 · Trừ phép xuyên T7–CN–Lễ (0,5 ngày / 1 giờ) — RETAIN LIVE leave + gap working-day engine

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-02 CFG / PLT-01 / CORE seals · **DENY** invent PAY/printable/Word DONE · **DENY** honesty flip · **DENY** claim ATT module UAT from Option alone · **DENY** claim CFG=ATT-02 DONE · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD residual) → API/FE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-25 UC-BP-ATT-02 **SEALED** — stamp `ATT02QC1-MSLQZUK7` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qc-01.md` · QA `ATT02QA1-MSLQWDN3` · must_keep `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false** · ≠ CORE-09 DONE) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` **ABSENT** · **CFG≠ATT-02 DONE** · PAY invent DONE **OUT** |
| **uc_ids** | `UC-BP-ATT-08` · `FR-UC-BP-ATT-08` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#28** after ATT-02 (#27 SEALED GWC) · ATT-09+ / PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | ATT-02 [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md) · PLT-01/CORE-10/09/07 seals · leave catalog / funnel / LVRULE peers **RETAIN cite** · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim ATT-02 = ATT-08 DONE** · **DENY invent PAY/printable DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-08** · Diễn biến **#1–#4 + FAIL calendar + Thành công** · **BR-BP-LV-05** · partner **REQ_NP_006** · **Q-LEAVE-UNIT** = cả hai theo loại phép (đã chốt) |
| **ref_inventory** | `UC_INVENTORY.md` / `UC_BR_MATRIX_DEPTH.md` `UC-BP-ATT-08` — edge P0 · WBS-ATT-05 · **MISSING** working-day engine |
| **ref_adr** | This Option evaluation (ADR template) · Nest physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-LEAVE-01** (preview-deduction) · peers **F-ATT-LEAVE-02/03** (submit/approve — **≠** claim ATT-09 DONE) · **F-ATT-HOL-01** (holiday — peer ATT-03b **QUEUED** cite) · **F-ATT-CAT-LVT/EFF** · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | Paper `holiday_calendar_days` / `att_holiday_*` · LIVE `leave_requests` · `employee_leave_balances` · `att_leave_type` · funnel `attendance_records` · Nest `@Controller('core')` **ABSENT** · holiday Nest table **ABSENT** (grep 2026-08-09) |
| **ref_code** | `attendance.controller` `@Controller('attendance')` leave-requests* · leave-balance/panel · `LeaveRequestsService` (client `total_days`) · `expandLeaveDateRange` / `toLeaveDayKey` (**calendar** inclusive — **≠** BR-BP-LV-05) · leave funnel · `att_leave_type` · accrual policy (**engine HOLD**) · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual · wipe ATT-02 CFG / PLT / CORE · invent PAY DONE · invent printable/Word DONE · claim client `total_days` / calendar expand = ATT-08 DONE · claim ATT-09 hold DONE · claim ATT-03b holiday admin DONE · claim ATT module UAT · reopen sealed peers · seed · honesty flip · apps/** this seat |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-26 architecture unlock: **leave-day deduction across weekends/holidays** (FR-UC-BP-ATT-08 — BR-BP-LV-05 · 0.5 day / 1 hour) vs AS-IS LIVE Nest leave/attendance surfaces — **gap-only** under U89 |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after ATT-02 QC-01 GWC (`ATT02QC1-MSLQZUK7`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-08 · BR-BP-LV-05 · REQ_NP_006 · Q-LEAVE-UNIT · F-ATT-LEAVE-01 · F-ATT-HOL-01 (peer) · F-ATT-LEAVE-02/03 (peer · ≠ ATT-09 DONE) · must_keep ATT-02/PLT/CORE · Nest `/core` DENY · U19 · soft≠CORE-06 · PAY OUT invent DONE · CFG≠ATT-02 DONE |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-02 SEALED (`ATT02QC1-MSLQZUK7`):** CFG rules XOR residual SEALED · Nest `/core` ATT **0** · **CFG≠ATT-02 DONE** · ≠ ATT UAT · must_keep PLT/CORE · printable **false** · PAY OUT. **Leave AS-IS (PRESENT — RETAIN cite):** (1) **Đơn nghỉ** Nest physical `POST/GET /api/hrm/attendance/leave-requests*` + approve/reject/cancel → `public.leave_requests` — body **`total_days` client-supplied** (`@Min(0.5)`) — **ABSENT** BE working-day engine / holiday exclude. (2) **Quỹ** `GET …/leave-balance` + `…/leave-balance/panel` + `employee_leave_balances` LIVE. (3) **Loại phép** `att_leave_type` + EFF picker LIVE (F-ATT-CAT-LVT/EFF). (4) **Funnel** `LeaveAttendanceFunnelService` + `expandLeaveDateRange` / `toLeaveDayKey` — expands **inclusive calendar days** (Sat/Sun/holiday **not** filtered) → materialize attendance markers. (5) **Accrual policy** L1 LIVE · **F-ATT-LEAVE-04 engine HOLD**. (6) **ABSENT:** Nest holiday calendar routes/tables (`holiday_calendar*` / `att_holiday*` grep **0**) · Nest `preview-deduction` · Nest `@Controller('core')`. |
| **Paper target** | FR-UC-BP-ATT-08: liệt kê calendar → loại T7/CN/Lễ theo lịch đơn vị → **số ngày trừ quỹ = ngày làm việc** (vd T6→T2 = **2**, không **4**); đơn vị tối thiểu **0,5 ngày** hoặc **1 giờ** theo loại phép (Q-LEAVE-UNIT đã chốt cả hai); preview trước gửi; FAIL nếu trừ calendar. |
| **Gap class** | **GĐ1 continuous AC + residual working-day deduction engine + preview + holiday input cite** on LIVE leave spine — **not** greenfield Nest `/core` dual; **not** claim client `total_days` / calendar expand = FR-08 DONE; **not** invent ATT-09 hold / PAY DONE. |
| **Constraints** | U89 continuous · **preserve** ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable/Word DONE · **DENY** claim ATT module UAT · **DENY** CFG=ATT-02 DONE |
| **Failure impact if unresolved** | Board #28 stalls or Dev invents Nest `/core` / dual SoT; false claim calendar expand = ATT-08 DONE; T6–T2 trừ 4 → quỹ âm oan; wipe ATT-02/PLT/CORE; PAY open early |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-02 + PLT-01 + CORE-01..10* (SEALED must_keep)
  Nest /core DENY · printable false · CFG≠ATT-02 DONE · C-SLICE · honesty false
       │
       │  must_keep RETAIN — DENY reopen J-HRM-ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01
       ▼
  ┌────────────── FR-UC-BP-ATT-08 (this seat — gap-only RETAIN + working-day residual) ─┐
  │                                                                                    │
  │  RETAIN LIVE (cite — ≠ ATT-08 DONE alone)                                          │
  │    POST/GET /api/hrm/attendance/leave-requests*  → leave_requests (client days)    │
  │    leave-balance / panel                         → quỹ display                     │
  │    att_leave_type + EFF                          → loại phép picker                │
  │    expandLeaveDateRange / toLeaveDayKey          → calendar keys (≠ BR-BP-LV-05)   │
  │    leave funnel materialize                      → sheet markers peer              │
  │                                                                                    │
  │  RESIDUAL unlock (BA → DATA/API — closable gap)                                    │
  │    R-ATT-08-ENGINE : BR-BP-LV-05 working-day count · T7/CN/Lễ = 0                   │
  │    R-ATT-08-PREVIEW: F-ATT-LEAVE-01 preview before submit                           │
  │    R-ATT-08-HOL    : holiday set input (cite ATT-03b QUEUED · minimal residual OK)  │
  │    R-ATT-08-UNIT   : Q-LEAVE-UNIT 0.5d XOR/OR 1h per leave_type                     │
  │    R-ATT-08-ALIGN  : submit/hold consume engine units (≠ invent ATT-09 DONE)        │
  │    Prefer physical Nest under /api/hrm/attendance/*                                │
  │    Paper F-ATT-LEAVE-01 /att/leave-requests/preview-deduction + /core = ALIAS ONLY │
  │                                                                                    │
  │  ATT-09 hold / ATT-03b full admin / ATT-10 / PAY = QUEUED · OUT invent DONE        │
  │  must_keep ATT-02/PLT/CORE · Nest /core DENY · printable false · CFG≠ATT-02 DONE   │
  └────────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe ATT-02 CFG / PLT / CORE seals         = DENY
  soft = CORE-06 DONE                        = DENY
  Invent PAY/printable/Word DONE             = DENY
  Claim client total_days / calendar = DONE  = DENY
  Claim Option alone = ATT module UAT        = DENY
  Claim CFG = ATT-02 DONE                    = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go
```

**Label lock:** Board «Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ)» GĐ1 = **RETAIN cite LIVE leave-requests + balance + leave_type + calendar helpers** + **gap working-day engine / preview / holiday input / unit** — **not** Nest `/core` dual; **not** client `total_days` alone = FR-08 DONE; **not** Option alone = ATT UAT.  
**Spine lock:** Physical prefer `/api/hrm/attendance/leave-requests*` (+ residual `…/preview-deduction` same controller family) · paper `POST /api/hrm/att/leave-requests/preview-deduction` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **≠** CFG=ATT-02 DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Working-day deduction | BR-BP-LV-05 · Diễn biến #2 · FAIL calendar | **ABSENT** engine — client `total_days` trusted | **RESIDUAL** R-ATT-08-ENGINE |
| Exclude T7/CN | FR luồng #3 | `expandLeaveDateRange` = **all calendar** | **RESIDUAL** (filter layer) |
| Exclude holiday | F-ATT-HOL-01 · ATT-03b | Nest holiday **ABSENT** | **RESIDUAL** R-ATT-08-HOL (cite peer QUEUED · minimal year set OK) |
| Preview trước gửi | F-ATT-LEAVE-01 · Diễn biến #1/#2 | Nest `preview-deduction` **ABSENT** | **RESIDUAL** R-ATT-08-PREVIEW |
| Unit 0.5d / 1h | Q-LEAVE-UNIT chốt cả hai | DTO `@Min(0.5)` days only · hour unit **ABSENT** on submit path | **RESIDUAL** R-ATT-08-UNIT |
| Submit + hold | F-ATT-LEAVE-02 · ATT-09 | leave-requests + balance LIVE · hold semantics peer | **RETAIN cite** · **≠** ATT-09 DONE · R-ATT-08-ALIGN thin |
| Approve consume | F-ATT-LEAVE-03 · BR-BP-LV-06 | approve/reject LIVE | **RETAIN cite** · **≠** ATT-09 DONE |
| Leave type catalog | F-ATT-CAT-LVT/EFF | LIVE | **RETAIN cite** |
| Calendar day keys | helpers | `toLeaveDayKey` / expand **PRESENT** | **RETAIN cite** · **≠** BR-BP-LV-05 |
| Funnel materialize | peer sheet | LIVE calendar expand | **RETAIN cite** · may consume engine output later · **≠** ATT-08 DONE |
| Paper `/att` + `/core` | alias | Nest `/core` **ABSENT** | **paper = alias only** |
| ATT-02 CFG rules | peer seal | SEALED `ATT02QC1-MSLQZUK7` | **must_keep RETAIN** · **CFG≠DONE** |
| PLT / CORE seals | peers | SEALED stamps | **must_keep RETAIN** |
| PAY deepen | OUT | QUEUED | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN leave spine + gap working-day engine (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` leave-requests* · leave-balance/panel · `att_leave_type`/EFF · `toLeaveDayKey`/`expandLeaveDateRange` (calendar helpers) · leave funnel · balance ledger. Unlock BA residuals **R-ATT-08-ENGINE/PREVIEW/HOL/UNIT/ALIGN** for **BR-BP-LV-05** SoT (T6→T2 = **2**; T7/CN/Lễ = 0; FAIL calendar-4) + preview before submit + Q-LEAVE-UNIT 0.5d/1h per leave type + holiday input (prefer cite ATT-03b peer; **minimal** year holiday residual closable without claiming ATT-03b admin DONE). Prefer physical Nest under `/api/hrm/attendance/*` (ADD `…/leave-requests/preview-deduction` and/or server-side recompute on create); paper **F-ATT-LEAVE-01** `/att/…` + `/core` = **alias only**. **must_keep** ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · **CFG≠ATT-02 DONE**. PAY/printable/Word **OUT invent DONE**. **DENY** claim Option/client-days alone = ATT module UAT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (spine LIVE; residual = engine + holiday input + unit + preview AC) |
| **Risk** | Low–medium if BA invents Nest dual / claims calendar=DONE / invents ATT-09/PAY / full ATT-03b wipe |
| **Cost / timeline** | BA → ba-data HOLD/ADD residual → sa API F.1 → Dev wire · QA U65 |
| **Pros** | Matches preserve_default; reuses LIVE leave/balance/type; unlocks board #28; avoids dual SoT; fixes P0 edge REQ_NP_006 |
| **Cons** | Not full ATT UAT; ATT-09 hold / ATT-03b full / PAY still QUEUED; holiday may be thin residual until ATT-03b |
| **Failure modes** | BA over-scopes Nest `/core` · claims expandLeaveDateRange=FR-08 · invent PAY · wipe ATT-02 CFG |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual + wipe/re-home leave_requests (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary leave-deduction SoT; dual-write or abandon `/attendance/leave-requests*`; invent parallel holiday/leave engine unrelated to LIVE balance/funnel |
| **Pros** | Paper `/core` literal |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression ATT-02/PLT/CORE + leave seals |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe leave_type/balance |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim LIVE client total_days = ATT-08 DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because leave-requests + `@Min(0.5)` + calendar expand exist; flip `attendance_uat_ready`; invent PAY/printable DONE; reopen sealed ATT-02/PLT/CORE |
| **Pros** | Fast chat claim |
| **Cons** | Violates BR-BP-LV-05 · FAIL calendar AC · C-SLICE · REQ_NP_006 MISSING |
| **Failure modes** | False UAT · T6–T2 trừ 4 · sponsor distrust · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap engine) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|----------------------:|-------------------:|--------------------:|
| Business value (FR-ATT-08) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **4** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **3** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit BR-BP-LV-05 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE leave-requests* + balance/panel + att_leave_type/EFF + calendar helpers + funnel; unlock working-day engine / preview / holiday input / unit / submit-align residuals; paper F-ATT-LEAVE-01 + `/core` = alias only; **RETAIN** ATT-02/PLT/CORE · soft≠CORE-06 · Nest `/core` DENY · CFG≠ATT-02 DONE; **DENY** Nest dual · wipe peers · invent PAY/printable/Word DONE · claim client `total_days`/calendar expand = ATT-08 DONE · claim ATT-09/ATT-03b DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns leave TXN + balance + type catalog + day-key helpers; FR-08 gap is **working-day SoT + holiday exclude + preview + unit** — not greenfield Nest `/core`, not wipe ATT-02/PLT/CORE; preserves W10–W25 must_keep; unlocks board #28 |
| **Assumptions** | ATT-02 **`ATT02QC1-MSLQZUK7` RETAIN** · QA `ATT02QA1-MSLQWDN3` · **CFG≠ATT-02 DONE** · ≠ ATT UAT. PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN**. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT** (grep 2026-08-09). Physical `@Controller('attendance')` leave* **PRESENT**. Holiday Nest **ABSENT**. `attendance_uat_ready=false` · printable false · product_go **false**. Q-LEAVE-UNIT SRS = **cả hai theo loại phép**. |
| **Rejected** | **B** — Nest `/core` dual / wipe · **C** — HOLD / claim LIVE client days = ATT-08 DONE / invent PAY·printable / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Engine SoT | BR-BP-LV-05 — count working days only; T6→T2 = **2**; T7/CN/Lễ = 0; **FAIL** if calendar-4 | AC Diễn biến #2 + FAIL row · gold cases |
| O2 | Preview surface | Prefer physical `POST /attendance/leave-requests/preview-deduction` (F-ATT-LEAVE-01) | Map paper `/att/…` + `/core` as **alias only** — **no** Nest `/core` |
| O3 | Holiday input | Prefer read holiday year set; **minimal residual** closable if ATT-03b still QUEUED | Explicit ≠ claim ATT-03b admin DONE · policy thiếu lịch: chặn **XOR** cảnh báo nháp (SRS đặc biệt) — pick one |
| O4 | Weekend rule | Sat+Sun always non-working for GĐ1 default (unless BA proves shift calendar otherwise) | DENY invent full ATT-01 ca calendar as ATT-08 blocker |
| O5 | Unit | Q-LEAVE-UNIT = cả hai theo **loại phép** (0.5d and/or 1h) | Half-day ends · hour unit match ca · display-ready `deductible_units` |
| O6 | Submit align | Create/approve consume **engine** units (reject silent client calendar inflate) | Thin R-ATT-08-ALIGN · **≠** invent ATT-09 hold DONE |
| O7 | Funnel / expand | RETAIN calendar helpers + funnel peer | Explicit expandLeaveDateRange **≠** FR-08 DONE |
| O8 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O9 | ATT-02/PLT/CORE | must_keep stamps · CFG≠ATT-02 DONE | ≠ reopen · ≠ claim DONE |
| O10 | PAY/printable/Word / ATT-09/10 | OUT invent DONE | Trace-only if balance cite |
| O11 | Honesty | All false · C-SLICE · `attendance_uat_ready=false` | Footer ≠DONE · ≠ ATT module UAT |
| O12 | Journey mint | Prefer `J-HRM-ATT-08-*` DRAFT (range → preview 2 · not 4 → submit/F5) | Narrow · not full ATT/PAY module · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-LEAVE-01** (residual) | Prefer `POST /api/hrm/attendance/leave-requests/preview-deduction` · list/get parity N/A (calc) · U19 scope on company | `POST /api/hrm/att/leave-requests/preview-deduction` · `/core/…` **alias only** | Tính ngày trừ xuyên T7–CN–Lễ trước gửi | Diễn biến **#1–#2** · BR-BP-LV-05 · FAIL calendar |
| **F-ATT-LEAVE-02** (RETAIN cite) | `POST /api/hrm/attendance/leave-requests` | `/att/leave-requests` alias | Nộp đơn (+ hold peer ATT-09) | Diễn biến #3 · **≠** ATT-09 DONE |
| **F-ATT-LEAVE-03** (RETAIN cite) | `POST …/leave-requests/:id/approve\|reject` | paper alias | Duyệt trừ / từ chối | Diễn biến #4 · BR-BP-LV-06 peer |
| **F-ATT-HOL-01** (peer cite) | Prefer `/attendance/holiday-calendars*` **if** residual ADD · else HOLD thin year set | `PUT /att/holiday-calendars/{year}` alias | Lịch lễ đơn vị cho engine | Tiên quyết · **≠** ATT-03b DONE |
| **F-ATT-CAT-LVT/EFF** (RETAIN) | `/attendance/leave-types*` / effective | paper alias | Loại phép + unit bind | Q-LEAVE-UNIT |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-LEAVE-01.  
**DENY:** treat paper path alone as Nest dual invent requirement.

**Display-ready preview (cite for BA/DATA):** `{ deductible_units, calendar_days, working_days, unit, excluded_days[]?, warnings[]? }` — BA may deepen labels VI.

---

## 6. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O8 DENY · QC Nest SoT 0 |
| A | Claim client `total_days` / calendar expand = ATT-08 DONE | Evidence footer missing ≠DONE | O7/O11 · C-SLICE |
| A | Wipe ATT-02 CFG / PLT/CORE seals | Diff touches sealed J-* | must_keep stamps · regression |
| A | Invent PAY/printable / ATT-09 DONE | AC claims payroll/hold UAT | O10 OUT |
| A | Claim Option = ATT module UAT | Ready flag flip | O11 DENY |
| A | Claim CFG = ATT-02 DONE | Footer missing CFG≠DONE | O9 |
| B | Dual-write / Nest `/core` | New `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 7. Implementation & validation plan

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC pack + mint J-HRM-ATT-08-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if BA proves (engine cols / holiday / unit) | ba-data | HOLD unless closable gap |
| 4. sa API F.1 cite RETAIN + residual LEAVE-01 | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-08-* (T6→T2 = 2 not 4) | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip · CFG≠ATT-02 DONE |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT-02/PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT UAT · **≠** CFG=ATT-02 DONE.

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · ≠ ATT UAT · Nest `/core` ATT 0 |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY / printable / Word | **OUT invent DONE** |
| client `total_days` / calendar expand / funnel | **≠** FR-UC-BP-ATT-08 DONE alone |
| ATT-09 hold / ATT-03b admin / ATT-10 | **≠** invent DONE this seat |
| Honesty | **DENY** flip · **C-SLICE** · `attendance_uat_ready=false` |
| ATT module UAT | **DENY** claim from Option alone |
| apps/** | **CẤM** until contracts after BA/DATA/API |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-ATT-08: RETAIN LIVE `/attendance/leave-requests*` + leave-balance/panel + `att_leave_type`/EFF + calendar helpers + funnel; unlock BR-BP-LV-05 working-day engine + preview (F-ATT-LEAVE-01) + holiday input + Q-LEAVE-UNIT 0.5d/1h residuals; paper `/att` + `/core` alias only; must_keep ATT02QC1-MSLQZUK7 · PLT/CORE · CFG≠ATT-02 DONE; DENY Nest dual · invent PAY/printable · honesty flip · claim client-days=ATT-08 DONE · claim ATT UAT; **no** `apps/**`. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-26 seat #28)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md · depends ATT02QC1-MSLQZUK7 · must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · CFG≠ATT-02 DONE · PAY invent DONE OUT
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline · residuals R-ATT-08-*)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08 · BR-BP-LV-05 · Q-LEAVE-UNIT
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-LEAVE-01 · F-ATT-HOL-01 · F-ATT-LEAVE-02/03
  - docs/client-delivery/hrm-enterprise-blueprint/UC_BR_MATRIX_DEPTH.md UC-BP-ATT-08 · REQ_NP_006
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-ATT-08 (working-day engine · T6→T2=2 not 4 · 0.5d/1h · preview)
  - Mint J-HRM-ATT-08-* DRAFT (U65 browser) — chọn khoảng → preview ngày trừ đúng · FAIL calendar · F5; không seed
  - Explicit ≠ ATT-08 DONE from client total_days/calendar expand alone · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE
  - ba-data HOLD default (ADD residual only if closable gap for engine/holiday/unit) · DENY Nest /core dual · DENY invent PAY/printable/Word DONE · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · wipe ATT-02/PLT/CORE · honesty flip · claim client-days=ATT-08 DONE · claim ATT module UAT · invent PAY/printable
```

---

*End SA-01 · Option A LOCKED · 2026-08-09*
