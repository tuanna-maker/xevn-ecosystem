# BA AC pack — Wave-27 ATT cluster · UC-BP-ATT-09 (Giữ chỗ quỹ phép khi nộp & duyệt · RETAIN LIVE leave + pending_days hold)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-27 seat **#29**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (ADD residual only if closable gap for soft/type) · sa API residual unlock after DATA · **DENY** claim soft create alone = ATT-09 DONE · **DENY** claim ATT-08 preview = ATT-09 DONE · **DENY** claim client-days=ATT-08 DONE · **DENY** claim ATT module UAT · **DENY** CFG=ATT-02 DONE · **printable false RETAIN** · **PAY OUT invent DONE** · **DENY invent `att_leave_hold` dual** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** wipe ATT-08/02/PLT/CORE · **no** wipe soft≠CORE-06 DONE · **no** invent PAY/printable/Word DONE · **no** claim LIVE soft create alone = FR-09 DONE) |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-08 **`ATT08QC1-MSLSL36C`** (preview-deduction · T6→T2=2 · HOL-MISS · ALIGN · **R-ATT-08-PREVIEW-FE CLOSED**) · QA **`ATT08QA1-MSLSGUJF`** · must_keep ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false** · ≠ CORE-09 DONE) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · **client-days≠ATT-08 DONE** · **≠ ATT UAT** · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-09** · Diễn biến **#0a–#6 + Thành công** · **BR-BP-LV-06** · **BR-BP-LV-05** peer · **BR-BP-LV-TYPE-01** · partner **REQ_NP_003** · **Q-LEAVE-UNIT** · **GĐ1 = một QL trực tiếp** (v0.14) |
| **ref_api_paper** | **F-ATT-LEAVE-02** (submit + hold) · **F-ATT-LEAVE-03** (approve consume / reject release) · peer **F-ATT-LEAVE-01** preview (**must_keep ATT-08** · ≠ invent wipe · ≠ ATT-09 DONE from preview alone) · leave-balance/panel · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `leave_requests` · `employee_leave_balances` (**`pending_days`** = hold · **`used_days`** = consumed · **`entitled_days`**) · paper `leave_balances.held` / `att_leave_hold` = **alias / DENY invent dual** · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim soft create = ATT-09 DONE · **DENY** claim ATT-08 preview = ATT-09 DONE · **DENY** claim client-days=ATT-08 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** claim PLT/CORE DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` dual · wipe ATT-08 preview / ATT-02/PLT/CORE · soft=CORE-06 DONE · invent PAY/printable/Word DONE · claim soft create alone = FR-09 DONE · claim ATT-08 preview = ATT-09 DONE · claim client-days=ATT-08 DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-27 seat #29 — **gap-only RETAIN** LIVE leave create/approve/reject/cancel + **`pending_days` hold ledger** + balance/panel:

1. **Hold SoT** = LIVE `employee_leave_balances.pending_days` = paper **held** — **DENY** invent `att_leave_hold` dual ledger.
2. **Submit hold (BR-BP-LV-06)** = when balance **tracked** (row PRESENT), create **must** increase `pending_days` before return **2xx**; submit without hold when tracked = **FAIL**.
3. **Approve consume** = `settleApprovedLeaveBalance` — `pending_days −=` · `used_days +=` (Đã trừ).
4. **Reject / cancel release** = `releasePendingLeaveBalance` — hoàn **100%** locked units về khả dụng.
5. **Panel F5** = after submit, panel `available`↓ · `pending`↑; after approve/reject XOR path khớp; F5 còn.
6. **Soft no-row** = untracked (no balance row) allow create **without** hold — **explicit ≠** claim soft path alone = FR-09 / ATT-09 DONE.
7. **Type-change GĐ1** = **chặn** đổi loại phép khi `pending` (DENY invent full re-hold edit workflow this seat).
8. **GĐ1 approve** = **một** QL trực tiếp đủ · DENY day-threshold multi-level GĐ1 (nước đoạn sau OUT).
9. **must_keep ATT-08** preview-deduction (`ATT08QC1-MSLSL36C` · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED) — hold consumes engine units when ALIGN live · **≠** wipe · **≠** claim ATT-08 = ATT-09 DONE.
10. **Mint** `J-HRM-ATT-09-01..06` DRAFT — submit → pending↑ available↓ → approve used **XOR** reject hoàn 100% → F5 — **narrow** · **≠** ATT module UAT · U65 zero-seed.
11. **must_keep** ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân viên | Chọn khoảng + loại phép → (preview ATT-08 cite) → **Gửi** → thấy khả dụng giảm theo giữ chỗ |
| Quản lý trực tiếp (GĐ1) | **Một** cấp duyệt **hoặc** từ chối (+ lý do) → quỹ settle / release 100% |
| C&B / HCNS | Theo dõi panel quỹ · **≠** claim ATT-04b/ATT-05b module DONE |
| Group CEO | Scope rollup `main` — U19 list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | `lockPending` / `settle` / `release` · overlap · balance assert · Nest `/core` **0** |
| ATT-08 / ATT-02 / PLT / CORE / PAY | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-09 Diễn biến #0a–#6 + Thành công + BR-BP-LV-06 → AC-ATT-09-* · residuals HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP · J-HRM-ATT-09-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/leave-requests*` (+ approve/reject/cancel) · paper `/att` + `/core` alias · held→`pending_days` | Nest `/core/…` leave SoT dual · invent `att_leave_hold` |
| Explicit ≠ ATT-09 DONE from soft create alone · ≠ ATT-08 preview = ATT-09 DONE · ≠ client-days=ATT-08 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE | Claim Option/LIVE soft alone = FR-09 DONE · invent PAY/printable/Word · multi-level approve GĐ1 · ATT-04b full · ATT-10 |
| Honesty footer · ATT-08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Hold SoT | **YES** — LIVE **`pending_days`** = paper **held** · paper `att_leave_hold` / `held_units` = **alias only** · **DENY** invent dual ledger — **AC-ATT-09-HOLD-SOT** · **AC-ATT-09-≠-DUAL** |
| **O2** | Submit hold | **YES** — **BR-BP-LV-06**: when balance **tracked** (row PRESENT), create **must** `pending_days +=` deductible/engine units **before** 2xx · submit without hold when tracked = **FAIL** — **AC-ATT-09-HOLD** · **AC-ATT-09-FAIL-NOHOLD** |
| **O3** | Soft no-row | **YES** — Prefer: **untracked** (no `employee_leave_balances` row) = allow create **without** hold (**LIVE RETAIN**) · **XOR** tracked = must hold (O2) · **explicit ≠** claim soft path alone = FR-09 / ATT-09 DONE — **AC-ATT-09-SOFT** · **AC-ATT-09-≠-SOFT-DONE** |
| **O4** | Approve / reject | **YES** — Approve: pending→used (`settle`) · Reject/**cancel**: release **100%** locked units · gold + panel F5 — **AC-ATT-09-SETTLE** · **AC-ATT-09-RELEASE** · **AC-ATT-09-CANCEL** |
| **O5** | Panel | **YES** — After submit: panel `pending`↑ · `available`↓ · F5 · mint **J-HRM-ATT-09-*** · U65 — **AC-ATT-09-PANEL** · **AC-ATT-09-F5** |
| **O6** | Preview peer | **YES** — **must_keep** ATT-08 `POST …/preview-deduction` · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · hold consumes engine units when ALIGN live · **≠** wipe · **≠** claim ATT-08 = ATT-09 DONE — **AC-ATT-09-MK-ATT08** · **AC-ATT-09-≠-08-DONE** |
| **O7** | Type change | **YES** — Prefer GĐ1: **chặn** đổi loại phép khi status=`pending` (**DENY** invent full release+re-lock edit workflow this seat) · SRS «đổi loại» = nước đoạn sau closable ADD only if ba-data proves · **AC-ATT-09-TYPE-BLOCK** |
| **O8** | GĐ1 approve | **YES** — **Một** QL trực tiếp đủ · DENY day-threshold multi-level GĐ1 · footer nước đoạn sau OUT — **AC-ATT-09-GĐ1** · **AC-ATT-09-≠-MULTI** |
| **O9** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-09-PATH** |
| **O10** | ATT-08/02/PLT/CORE | **YES** — must_keep stamps **intact** · client-days≠ATT-08 DONE · **CFG≠ATT-02 DONE** · **≠** reopen · **≠** claim ATT-08/02/PLT/CORE DONE · printable false — **AC-ATT-09-MK-*** |
| **O11** | PAY/printable/Word / ATT-04b/10 | **YES OUT invent** — balance cite **trace-only** · QUEUED ATT-04b/10/PAY · **DENY** invent PAY/printable/Word / ATT-04b/ATT-10 DONE — **AC-ATT-09-PAY-OUT** · **AC-ATT-09-≠-04b** |
| **O12** | Honesty / journeys | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · Mint **`J-HRM-ATT-09-01..06` DRAFT** (submit→pending↑ available↓ → approve used XOR reject 100% → F5) — **narrow** · **≠** ATT module UAT · U65 zero-seed — **AC-ATT-09-H** |

**Architecture SoT:** RETAIN LIVE `/attendance/leave-requests*` create/approve/reject/cancel + `lockPending` / `settle` / `release` on `pending_days`/`used_days` + leave-balance/panel + overlap/balance assert + **must_keep ATT-08** preview · unlock HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP · paper F-ATT-LEAVE-02/03 + `/core` alias only · paper held→`pending_days` · U19 list↔get↔mutate · ATT-08/02/PLT/CORE **must_keep**.

### Primary API surface (BA lock — O1/O9)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Submit + hold (this seat) | **`POST /api/hrm/attendance/leave-requests`** | `POST /api/hrm/att/leave-requests` · `/core/…` **alias only** |
| Approve consume | **`POST …/leave-requests/:id/approve`** | paper `/att/…` alias |
| Reject release 100% | **`POST …/leave-requests/:id/reject`** | paper alias |
| Cancel release | **`POST …/leave-requests/:id/cancel`** | paper alias · peer release |
| Leave balance / panel | **`GET …/leave-balance`** · **`GET …/leave-balance/panel`** | paper alias |
| Preview deduction (must_keep peer) | **`POST …/leave-requests/preview-deduction`** | paper alias · **≠** ATT-09 DONE · **≠** wipe ATT-08 |
| Leave types / EFF | **`/attendance/leave-types*`** / effective | paper alias · BR-BP-LV-TYPE-01 |
| ATT-02 CFG / PLT / CORE peers | `/attendance/rules*` · `/merge-tokens*` · SI/CTR/activate | must_keep · **≠** claim DONE |

**Invariant ATT-09-PATH:** Submit/approve/reject/cancel/panel Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL O9**.

**Invariant ATT-09-HOLD-SOT:** Paper `held` / `att_leave_hold` = **`pending_days`** — invent dual ledger = **FAIL O1**.

**Invariant ATT-09-HOLD:** Tracked balance + create 2xx **without** `pending_days` increase = **FAIL O2** (BR-BP-LV-06).

**Invariant ATT-09-≠-SOFT-DONE:** Claim soft no-row create alone = FR-UC-BP-ATT-09 / ATT-09 DONE = **FAIL O3/O12**.

**Invariant ATT-09-≠-08-DONE:** Claim ATT-08 preview seal alone = ATT-09 DONE = **FAIL O6**.

**Invariant ATT-09-≠-CLIENT-08:** Claim client `total_days` / calendar = ATT-08 DONE = **FAIL O10** (must_keep peer).

**Invariant ATT-09-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` from this seat = **FAIL O12**.

**Invariant ATT-09-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O11/O12**.

**Invariant ATT-09-PAY-OUT:** Invent PAY DONE / claim payroll UAT from balance cite = **FAIL O11**.

**Invariant ATT-09-CFG≠02:** Claim CFG = ATT-02 DONE / reopen ATT-02 seals = **FAIL O10**.

**Invariant ATT-09-GĐ1:** Invent day-threshold multi-level approve as GĐ1 DONE = **FAIL O8**.

**Wire codes (RETAIN + residual assert):** `HRM-LEAVE-TYPE-UNKNOWN` (EFF invent — RETAIN · reject **before** hold) · `409` insufficient balance · overlap conflict · `HRM-SCOPE-409` · `HRM-VAL-400` · sealed ATT-08 HOL-MISS / ALIGN codes · sealed ATT-02/PLT/CORE codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready (normative for FE bind):** `{ request_id, status, status_label | statusLabelVi, pending_days | held_units, used_days, available_days, deductible_units?, leave_type, leave_type_label }` — map paper `held_units` → LIVE `pending_days`.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-09 DONE** · soft create alone ≠ FR-09 DONE · ≠ ATT-08 preview = ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-27 · Option A) |
|---|----------------------|---------------------------|
| Submit leave | `POST /attendance/leave-requests` → `lockPendingLeaveBalance` when row PRESENT | **RETAIN cite** + AC harden BR-BP-LV-06 (**O2**) · **≠** FR-09 DONE from soft alone |
| Approve | `settleApprovedLeaveBalance` pending→used | **RETAIN cite** + **R-ATT-09-SETTLE** (**O4**) |
| Reject / cancel | `releasePendingLeaveBalance` 100% | **RETAIN cite** + **R-ATT-09-SETTLE** (**O4**) |
| Soft no-row | assert + lock **no-op** | **RETAIN** · explicit ≠ FR-09 DONE (**O3**) |
| Panel / available | `available = entitled−used−pending` | **RETAIN cite** + FE F5 AC (**O5**) |
| Preview ATT-08 | SEALED `ATT08QC1-MSLSL36C` | **must_keep RETAIN** · ≠ ATT-09 DONE (**O6**) |
| Type change pending | **ABSENT** PATCH re-hold | **RESIDUAL** block change (**O7**) |
| GĐ1 one manager | LIVE approve path (no day ladder) | **RETAIN cite** + AC DENY multi-level (**O8**) |
| Paper held / att_leave_hold | LIVE = `pending_days` | **alias** · **DENY invent dual** (**O1**) |
| Paper `/att` + `/core` | Nest `/core` ABSENT | **Alias only** (**O9**) |
| ATT-08/02/PLT/CORE | SEALED stamps | **must_keep RETAIN** (**O10**) |
| ATT-04b / ATT-10 / PAY | QUEUED | **OUT invent DONE** (**O11**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-09-HOLD**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-09-HOLD` |
| **Scope** | **IN-SCOPE residual** — BR-BP-LV-06 submit **must** hold when tracked · FAIL no-hold 2xx |
| **OUT of residual** | Claim soft create = FR-09 DONE · Nest `/core` dual · invent `att_leave_hold` |
| **Rationale** | FR Diễn biến #2 · BR-BP-LV-06 · F-ATT-LEAVE-02 · SA O2 |
| **Physical gap vs paper** | LIVE `lockPendingLeaveBalance` PRESENT when row exists — residual = AC harden + evidence FAIL path |
| **ba-data** | **HOLD default** — paper held = `pending_days` · **DENY** invent `att_leave_hold` |
| **sa API** | F.1 deepen F-ATT-LEAVE-02 physical `/attendance/*` · paper alias · held→pending_days |
| **DENY** | Nest `/core` SoT · dual hold ledger · soft-OK no-hold when tracked |

### 1.2 Disposition **R-ATT-09-SETTLE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-09-SETTLE` |
| **Scope** | **IN-SCOPE residual** — approve pending→used · reject/cancel release **100%** |
| **OUT** | Claim approve alone = ATT module UAT · invent PAY DONE |
| **Rationale** | FR Diễn biến #3–#4 · F-ATT-LEAVE-03 · SA O4 |
| **ba-data** | **HOLD** — LIVE settle/release RETAIN · no new table |
| **DENY** | Partial release invent · Nest `/core` dual |

### 1.3 Disposition **R-ATT-09-PANEL**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-09-PANEL` |
| **Scope** | **IN-SCOPE residual** — panel reflects pending after submit · available↓ · F5 |
| **OUT** | Claim panel alone = ATT-05b / ATT module UAT DONE |
| **Rationale** | Hậu điều kiện FR-09 · SA O5 · U65 |
| **ba-data** | **HOLD** — LIVE leave-balance/panel RETAIN |
| **DENY** | Seed balance for U65 · Nest `/core` |

### 1.4 Disposition **R-ATT-09-SOFT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-09-SOFT` |
| **Scope** | **IN-SCOPE residual** — untracked = allow without hold · tracked = must hold · **≠** soft = FR-09 DONE |
| **OUT** | Claim soft path = ATT-09 DONE · force invent balance row via seed |
| **Rationale** | SA O3 pick · LIVE no-op when no row · BR-BP-LV-06 applies when **tracked** |
| **ba-data** | **HOLD default** — ADD only if closable gap to distinguish tracked vs untracked flags (prefer LIVE row presence) |
| **DENY** | Claim soft alone DONE · seed invent balance to fake U65 |

### 1.5 Disposition **R-ATT-09-TYPE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-09-TYPE` |
| **Scope** | **IN-SCOPE residual thin** — **chặn** đổi loại khi pending · DENY invent full re-hold edit |
| **OUT** | Full leave edit workflow DONE · multi-field PATCH invent |
| **Rationale** | SRS đặc biệt «Đổi loại» · SA O7 pick **block** for GĐ1 closable |
| **ba-data** | **HOLD default** — ADD only if closable wire needs typed guard ABSENT |
| **DENY** | Invent att_leave_hold for type re-calc · Nest `/core` |

### 1.6 Disposition **R-ATT-09-GĐ1** / **R-ATT-09-DISP**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-09-GĐ1` · `R-ATT-09-DISP` |
| **Scope** | **IN-SCOPE** — one direct manager · display-ready held/pending/available/statusLabelVi |
| **OUT** | Multi-level by days GĐ1 DONE · invent PAY |
| **Rationale** | SRS v0.14 · SA O8 · F.1 display-ready |
| **ba-data** | **HOLD** — no new approval ladder table GĐ1 |
| **DENY** | Day-threshold ladder invent DONE |

### 1.7 Disposition **R-ATT-09-≠-DONE** / **R-ATT-09-PAY** / **R-ATT-09-HONESTY**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-09-≠-SOFT-DONE` · `R-ATT-09-≠-08-DONE` · `R-ATT-09-≠-CLIENT-08` · `R-ATT-09-≠-UAT` · `R-ATT-09-≠-CFG02` · `R-ATT-09-≠-DUAL` · `R-ATT-09-PAY-OUT` · `R-ATT-09-HONESTY` · `R-ATT-09-PRINTABLE` |
| **Scope** | **INFO honesty locks** — every evidence footer |
| **Rule** | soft create ≠ FR-09 DONE · ATT-08 preview ≠ ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · DENY invent `att_leave_hold` · PAY/printable/Word **OUT invent DONE** · all ready flags **false** · printable **false RETAIN** |
| **DENY** | Claim DONE / honesty flip / invent PAY·printable·Word · dual ledger |

### 1.8 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `employee_leave_balances.pending_days` | **HOLD · RETAIN** | = paper held · DENY invent `att_leave_hold` |
| `used_days` / `entitled_days` | **HOLD · RETAIN** | settle / available math |
| `leave_requests` create/approve/reject/cancel | **HOLD · RETAIN** | ≠ FR-09 DONE from soft alone |
| leave-balance / panel | **HOLD · RETAIN** | panel F5 AC |
| Soft no-row policy | **HOLD default** · ADD if closable | ≠ soft = DONE |
| Type-change block | **HOLD default** · ADD if closable | chặn đổi loại pending |
| ATT-08 preview / ALIGN | **HOLD · must_keep** | ≠ wipe · ≠ ATT-09 DONE |
| Nest `/core` | **DENY** | alias only |
| ATT-08/02/PLT/CORE / soft≠06 | **DENY wipe** | must_keep · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE · printable false |
| PAY / ATT-04b / ATT-10 deepen | **OUT invent DONE** | cite only |

**Unlock next:** **ba-data HOLD** stamp (ADD residual only if soft/type gap closable) → **sa API** F.1 F-ATT-LEAVE-02/03 physical `/attendance/*`.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-09 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-LV-06** | Gửi đơn khi quỹ **tracked** | Phải giữ chỗ (`pending_days +=`) | Không giữ chỗ → **không chấp nhận** (FAIL) |
| **BR-ATT-09-HOLD-SOT** | Paper held / att_leave_hold | Map → `pending_days` | Invent dual = **FAIL O1** |
| **BR-ATT-09-AVAILABLE** | After hold | `available = entitled − used − pending` | Panel mirrors |
| **BR-ATT-09-SETTLE** | Duyệt | pending→used | Đã trừ đúng số giữ chỗ |
| **BR-ATT-09-RELEASE** | Từ chối / hủy | Hoàn **100%** pending locked | Khả dụng hoàn đủ |
| **BR-ATT-09-SOFT** | No balance row | Allow create without hold | **≠** FR-09 DONE alone |
| **BR-ATT-09-OVERLAP** | Chồng khoảng pending\|approved | Chặn đơn sau | assertNoLeaveOverlap |
| **BR-ATT-09-TYPE-01** | leave_type ∉ EFF (khi EFF>0) | Reject **before** hold | `HRM-LEAVE-TYPE-UNKNOWN` |
| **BR-ATT-09-TYPE-BLOCK** | Đổi loại khi pending | **Chặn** GĐ1 | DENY invent full re-hold |
| **BR-ATT-09-GĐ1** | Phê duyệt GĐ1 | Một QL trực tiếp | DENY multi-level by days |
| **BR-BP-LV-05** peer | Hold units | Engine / ALIGN when live | must_keep ATT-08 · ≠ wipe |
| **BR-ATT-09-PATH** | Submit/approve API | Physical `/attendance/*` | Nest `/core` dual = **FAIL O9** |
| **BR-ATT-09-≠-SOFT** | soft create alone | ≠ FR-09 / ATT-09 DONE | Claim = **FAIL O3/O12** |
| **BR-ATT-09-≠-08** | Preview seal | ≠ ATT-09 DONE | Claim = **FAIL O6** |
| **BR-ATT-09-≠-CLIENT-08** | client days | ≠ ATT-08 DONE | Claim = **FAIL O10** |
| **BR-ATT-09-≠-UAT** | Slice PASS | ≠ ATT module UAT | Flip `attendance_uat_ready` = **FAIL O12** |
| **BR-ATT-09-≠-CFG02** | Any ATT-09 evidence | CFG≠ATT-02 DONE | Claim CFG DONE / reopen ATT-02 = **FAIL O10** |
| **BR-ATT-09-PAY-OUT** | Balance cite | PAY QUEUED | Invent PAY DONE = **FAIL O11** |
| **BR-ATT-09-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O11/O12** |
| **BR-ATT-09-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-ATT-09-SCOPE-U19** | list = get = mutate | Same scope resolver | Cross-CT leak = **FAIL U19** |
| **BR-ATT-09-MK** | Any ATT-09 evidence | Diff ATT-08/02/PLT/CORE seals | Wipe/reopen/claim DONE = **FAIL O6/O10** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| Insufficient / no-hold when tracked | 4xx/409 | Gửi không giữ chỗ khi theo dõi quỹ | Soft-OK 2xx without pending↑ |
| Overlap | 409 | Chồng ngày với đơn khác | Soft OK second request |
| `HRM-LEAVE-TYPE-UNKNOWN` | 4xx | Loại phép ngoài EFF — **trước** hold | Free-text invent |
| Balance insufficient | 409 | Thiếu số dư · tắt ứng phép | Soft OK overdraw |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed ATT-08 | — | preview · T6→T2=2 · HOL-MISS · ALIGN · client-days≠DONE | Wipe / claim = ATT-09 DONE |
| Sealed ATT-02 | — | CFG≠DONE · ≠ ATT UAT | Claim CFG=ATT-02 DONE |
| Sealed PLT-01 | — | peer≠PLT DONE · merge≠UAT | Claim PLT DONE |
| Sealed CORE-10 SI | — | catalog/CRUD/LIVE≠DONE | Claim CORE-10 DONE |
| Sealed CORE-09 CTR | — | printable false | Flip printable |
| Sealed CORE-07 GATE/ACT | — | GATE 409 · ACT-400 · Nest 0 | Claim CORE-07 DONE |

### Gold cases (normative — O2/O4/O5)

| Case ID | Scenario | Expected | FAIL if |
|---------|----------|----------|---------|
| **GC-ATT-09-01** | Tracked balance · submit N units | `pending_days += N` · `available`↓ by N · status pending · Nest `/core` 0 | 2xx without pending↑ |
| **GC-ATT-09-02** | Approve after hold | `pending −= N` · `used += N` · available unchanged vs post-hold (or matches settle math) | pending remains / used not += |
| **GC-ATT-09-03** | Reject after hold | `pending −= N` · used unchanged · available hoàn **100%** | Partial release / used polluted |
| **GC-ATT-09-04** | Cancel after hold | Same as reject release 100% | Pending stuck |
| **GC-ATT-09-05** | Soft no-row create | 2xx allow without hold · footer **≠ soft = ATT-09 DONE** | Claim soft alone = FR-09 DONE |
| **GC-ATT-09-06** | Overlap second request | Chặn · no second hold | Soft OK double-book |
| **GC-ATT-09-07** | GĐ1 one manager approve | Single approve ends request · no day ladder | Require 2nd level by days |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-09 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE

---

## 3. Diễn biến FR-UC-BP-ATT-09 → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #0a/#0b** | Loại ∈ EFF · reject invent | **AC-ATT-09-TYPE** · **AC-ATT-09-TYPE-BEFORE** | **J-HRM-ATT-09-01** | leave-types EFF · reject trước hold · Nest `/core` **0** |
| **Diễn biến #1** | Preview ngày trừ | **AC-ATT-09-MK-ATT08** · **≠-08-DONE** | **J-01** cite | `POST …/preview-deduction` **must_keep** · ≠ ATT-09 DONE |
| **Diễn biến #2** · BR-BP-LV-06 | Gửi + giữ chỗ | **AC-ATT-09-HOLD** · **FAIL-NOHOLD** · **PANEL** | **J-HRM-ATT-09-01** | `POST …/leave-requests` · pending↑ · Nest `/core` **0** |
| **Diễn biến #3** | Duyệt → đã trừ | **AC-ATT-09-SETTLE** · **GĐ1** | **J-HRM-ATT-09-02** | `POST …/approve` · Nest `/core` **0** |
| **Diễn biến #4** | Từ chối hoàn 100% | **AC-ATT-09-RELEASE** | **J-HRM-ATT-09-03** | `POST …/reject` · Nest `/core` **0** |
| **Diễn biến #5** | Chồng ngày | **AC-ATT-09-OVERLAP** | **J-HRM-ATT-09-05** | assertNoLeaveOverlap |
| **Diễn biến #6** | Q-LEAVE-UNIT | **AC-ATT-09-UNIT-CITE** | **J-01** cite | must_keep ATT-08 UNIT · ≠ invent |
| **Đặc biệt soft / type** | Soft no-row · block đổi loại | **AC-ATT-09-SOFT** · **TYPE-BLOCK** · **≠-SOFT-DONE** | **J-HRM-ATT-09-04** | no-op lock · block PATCH type |
| **Thành công** · F5 | Quỹ khớp · seals | **AC-ATT-09-F5** · **≠-*** · **H** · **MK-*** | **J-HRM-ATT-09-06** | F5 còn · Nest `/core` 0 |
| **O1/O9–O12** | Hold SoT · path · honesty | **AC-ATT-09-HOLD-SOT** · **PATH** · **H** | **J-06** | DENY dual · printable false · C-SLICE |

### 3.1 AC-ATT-09 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-09-PATH** | Submit/approve/reject/panel API | Mutate / read | Network hits **only** physical `/api/hrm/attendance/*` · Nest `/api/hrm/core/**` SoT **0** · paper `/att`+/`/core` alias only | U65 · O9 · **R-ATT-09-HOLD** |
| **AC-ATT-09-HOLD-SOT** | Paper held / att_leave_hold | Any hold cite | Maps to LIVE **`pending_days`** · **no** second ledger table | O1 · **R-ATT-09-≠-DUAL** |
| **AC-ATT-09-≠-DUAL** | Spec/impl | Invent `att_leave_hold` dual | **FAIL** | O1 |
| **AC-ATT-09-LOAD** | Quyền NV/QL đúng scope | Mở form đơn nghỉ / panel | Form + panel load · EFF picker · Nest `/core` 0 · no seed | Diễn biến #0a · J-01 |
| **AC-ATT-09-TYPE** / **TYPE-BEFORE** | EFF active >0 | Submit loại ngoài EFF | Reject **before** hold · no pending↑ · `HRM-LEAVE-TYPE-UNKNOWN` | #0b · J-01 |
| **AC-ATT-09-HOLD** | Balance row **PRESENT** (tracked) | Submit N deductible units | `pending_days += N` · `available`↓ · status `pending` · 2xx **after** hold · Nest `/core` 0 | O2 · BR-BP-LV-06 · GC-01 · J-01 |
| **AC-ATT-09-FAIL-NOHOLD** | Tracked balance | Create returns 2xx **without** pending↑ | **FAIL AC** — không đạt BR-BP-LV-06 | O2 · J-01/04 |
| **AC-ATT-09-SOFT** | No balance row | Create | Allow without hold (LIVE RETAIN) · footer **≠ soft = ATT-09 DONE** | O3 · GC-05 · J-04 |
| **AC-ATT-09-≠-SOFT-DONE** | Soft create PASS alone | Claim FR-09 / ATT-09 DONE | **FAIL** | O3/O12 |
| **AC-ATT-09-SETTLE** | Pending hold N | Approve (one QL) | pending−=N · used+=N · Nest `/core` 0 | O4 · #3 · GC-02 · J-02 |
| **AC-ATT-09-RELEASE** | Pending hold N | Reject (+ lý do) | pending−=N · used unchanged · available hoàn **100%** · Nest `/core` 0 | O4 · #4 · GC-03 · J-03 |
| **AC-ATT-09-CANCEL** | Pending hold N | Cancel | Release **100%** same as reject | O4 · GC-04 |
| **AC-ATT-09-PANEL** | After submit hold | Open / refresh panel | `pending`↑ · `available`↓ display-ready · Nest `/core` 0 | O5 · J-01/06 |
| **AC-ATT-09-F5** | After submit / approve XOR reject | F5 / navigate lại | Quỹ + status còn khớp · Nest `/core` 0 | U65 · J-06 |
| **AC-ATT-09-OVERLAP** | Existing pending\|approved overlap | Second submit | Chặn · no double hold | #5 · GC-06 · J-05 |
| **AC-ATT-09-TYPE-BLOCK** | Status pending | Attempt đổi leave_type | **Chặn** · no silent re-hold invent · Nest `/core` 0 | O7 · J-05 |
| **AC-ATT-09-GĐ1** | Pending request | One direct manager approve/reject | Request ends · quỹ cập nhật · **no** day-threshold 2nd level | O8 · GC-07 · J-02/03 |
| **AC-ATT-09-≠-MULTI** | Any ATT-09 evidence | Claim multi-level by days GĐ1 DONE | **FAIL** | O8 |
| **AC-ATT-09-UNIT-CITE** | Hold units | When ATT-08 ALIGN live | Hold = engine deductible · must_keep ATT-08 UNIT | O6 · peer |
| **AC-ATT-09-DISP** | API/FE | After mutate | Display-ready fields VI labels · held↔pending map | O5 · F.1 |
| **AC-ATT-09-MK-ATT08** | Any ATT-09 evidence | Diff ATT-08 | preview physical · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · Nest `/core` leave 0 **intact** · **no** reopen J-HRM-ATT-08-01..06 · **≠** claim ATT-08 = ATT-09 DONE · **≠** wipe preview | O6 · `ATT08QC1-MSLSL36C` |
| **AC-ATT-09-≠-08-DONE** | Preview / ALIGN cite | Claim ATT-09 DONE | **FAIL** | O6 |
| **AC-ATT-09-≠-CLIENT-08** | client `total_days` | Claim ATT-08 DONE | **FAIL** — footer client-days≠ATT-08 DONE | O10 |
| **AC-ATT-09-≠-UAT** | Slice GWC later | Claim ATT module UAT / flip `attendance_uat_ready` | **FAIL** | O12 · C-SLICE |
| **AC-ATT-09-≠-CFG02** | Any ATT-09 evidence | Claim CFG = ATT-02 DONE / reopen ATT-02 | **FAIL** | O10 |
| **AC-ATT-09-≠-PLT-DONE** | Any ATT-09 evidence | Claim PLT-01 / platform UAT DONE | **FAIL** | O10 |
| **AC-ATT-09-≠-CORE10-DONE** | Any ATT-09 evidence | Claim catalog/CRUD/LIVE = CORE-10 DONE | **FAIL** | O10 |
| **AC-ATT-09-≠-09-DONE** | Any ATT-09 evidence | Claim CORE-09 DONE / printable flip | **FAIL** | O10/O11 |
| **AC-ATT-09-≠-07-DONE** | Any ATT-09 evidence | Claim CORE-07 DONE | **FAIL** | O10 |
| **AC-ATT-09-PAY-OUT** | Balance / quỹ cite | This seat | **OUT invent** — claim PAY DONE = **FAIL** | O11 |
| **AC-ATT-09-≠-04b** | Ứng phép cite | Claim ATT-04b full DONE | **FAIL** | O11 |
| **AC-ATT-09-NO-SEED** | Empty / soft path | UF evidence | CTA / hướng dẫn · **no** seed | O12 · U65 |
| **AC-ATT-09-MK-ATT02** | Any ATT-09 evidence | Diff ATT-02 | CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 **intact** · **no** reopen J-HRM-ATT-02-01..06 · **≠** claim ATT-02 DONE | O10 · `ATT02QC1-MSLQZUK7` |
| **AC-ATT-09-MK-PLT** | Any ATT-09 evidence | Diff PLT-01 | peer≠PLT DONE · merge≠platform UAT **intact** · **no** reopen J-HRM-PLT-01-01..06 · **≠** claim PLT DONE | O10 · `PLT01QC1-MSLPUQIU` |
| **AC-ATT-09-MK-10** | Any ATT-09 evidence | Diff CORE-10 | SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT **intact** · **no** reopen J-HRM-CORE-10-01..06 · **≠** claim CORE-10 DONE | O10 · `CORE10QC1-MSLP0EJB` |
| **AC-ATT-09-MK-09** | Any ATT-09 evidence | Diff CORE-09 | Fill+registry · PREV · VER · printable **false** · 09a–d≠DONE · registry≠DONE **intact** · **no** reopen J-HRM-CORE-09-01..06 · **≠** claim CORE-09 DONE · **≠** Word invent | O10 · `CORE09QC1-MSLNBA89` |
| **AC-ATT-09-MK-07** | Any ATT-09 evidence | Diff CORE-07 | Physical activate · GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE **intact** · **no** reopen J-HRM-CORE-07-01..05 · **≠** claim CORE-07 DONE | O10 · `CORE07QC1-KZJTSHNT` |
| **AC-ATT-09-MK-06** | Any ATT-09 evidence | Diff CORE-06 | soft≠DONE · Nest `/core` 0 **intact** · **≠** claim soft=CORE-06 DONE | O10 |
| **AC-ATT-09-H** | Evidence footer | Any seal | attendance/personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** soft=ATT-09 DONE · ATT-08=ATT-09 DONE · client-days=ATT-08 DONE · ATT UAT · CFG=ATT-02 DONE · PLT/CORE DONE · PAY/printable/Word DONE · invent `att_leave_hold` · Nest DENY · no reopen seals | O6/O10/O11/O12 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + NV/QL | Leave submit/approve/panel across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP / NV / QL** | Chỉ pháp nhân membership | list ≠ get ≠ mutate resolver |
| **No leave / approve right** | Deny mutate leave-requests | Silent 2xx |

**Invariant ATT-09-SCOPE-U19:** leave-requests / approve / reject / balance list **=** get-by-id **=** mutate **same** hrm list-scope family.

**Prerequisite:** ATT-08 seal RETAIN (`ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ≠ ATT UAT) · ATT-02 (`ATT02QC1-MSLQZUK7` · CFG≠DONE) · PLT-01 (`PLT01QC1-MSLPUQIU`) · CORE-10 (`CORE10QC1-MSLP0EJB`) · CORE-09 (`CORE09QC1-MSLNBA89` · printable false) · CORE-07 (`CORE07QC1-KZJTSHNT`) · soft≠CORE-06 DONE · **không** seed · honesty flags false.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-09 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE

---

## 4. Diễn biến FE U65 (browser matrix — narrow ATT-09)

```text
Login (ceo@xe.vn / member NV + QL trực tiếp)
  → /hr Nhân sự → Đơn nghỉ / nộp phép (narrow leave)
  → (Pos TYPE) Chọn loại ∈ EFF · (Neg) loại ngoài EFF → từ chối trước hold · Nest /core = 0 · no seed
  → (Cite ATT-08) Preview ngày trừ khi có · ≠ claim preview = ATT-09 DONE · client-days ≠ ATT-08 DONE
  → (Pos HOLD / tracked) Snapshot panel pending/available → Gửi đơn
       → Assert pending↑ · available↓ · Network POST …/leave-requests 2xx after hold · Nest /core = 0
       → Assert FAIL nếu 2xx without pending↑ when tracked
  → (XOR SETTLE) QL duyệt → pending→used · Nest /core 0
       OR (XOR RELEASE) QL từ chối (+ lý do) → hoàn 100% · Nest /core 0
  → (Pos OVERLAP / TYPE-BLOCK / GĐ1) Chồng ngày chặn · đổi loại pending chặn · một QL đủ · ≠ multi-level
  → (Soft) Nếu no balance row: create OK without hold · footer ≠ soft = ATT-09 DONE
  → F5 → quỹ + status còn · Nest /core 0
  → Footer: ≠ ATT-09 DONE
       · soft create alone ≠ FR-09 DONE
       · ≠ ATT-08 preview = ATT-09 DONE
       · client-days ≠ ATT-08 DONE
       · ≠ ATT module UAT · attendance_uat_ready=false
       · CFG≠ATT-02 DONE · must_keep ATT02QC1-MSLQZUK7
       · must_keep ATT08QC1-MSLSL36C (preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED)
       · peer≠PLT DONE · merge≠platform UAT
       · printable false RETAIN
       · PAY OUT invent DONE
       · DENY invent att_leave_hold
       · must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed leave/inbox · DB fake · PASS chỉ curl · Nest `/core` dual · invent `att_leave_hold` · wipe ATT-08/02/PLT/CORE · claim soft=ATT-09 DONE · claim ATT-08=ATT-09 DONE · claim client-days=ATT-08 DONE · claim ATT module UAT · invent PAY/printable/Word · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-ATT-09-01** | Tracked submit → pending↑ available↓ · Nest `/core` 0 · no seed · hold SoT=pending_days | AC-ATT-09-LOAD/HOLD/HOLD-SOT/PANEL/PATH · O1/O2/O5/O9 |
| **VAL-ATT-09-02** | Approve → pending→used · one QL · Nest `/core` 0 | AC-ATT-09-SETTLE/GĐ1 · O4/O8 |
| **VAL-ATT-09-03** | Reject → hoàn 100% · Nest `/core` 0 | AC-ATT-09-RELEASE · O4 |
| **VAL-ATT-09-04** | FAIL no-hold when tracked · soft ≠ DONE · Nest `/core` 0 | AC-ATT-09-FAIL-NOHOLD/SOFT/≠-SOFT-DONE · O2/O3 |
| **VAL-ATT-09-05** | Overlap chặn · type-block pending · ≠ multi-level · Nest `/core` 0 | AC-ATT-09-OVERLAP/TYPE-BLOCK/≠-MULTI · O7/O8 |
| **VAL-ATT-09-06** | F5 + seals · ≠DONE · printable false · PAY OUT · ATT-08/02/PLT/CORE RETAIN · DENY att_leave_hold · honesty | AC-ATT-09-F5/≠-*/H/MK-* · O6/O10/O11/O12 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-09 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE

---

## 5. Journeys DRAFT (O12)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-ATT-09-01** | **hold** | **Submit → pending↑ available↓** | Login → Đơn nghỉ → (EFF OK) → Gửi (tracked) · pending↑ · available↓ · Nest `/core` 0 · no seed · held=`pending_days` · ≠ soft alone DONE · ≠ ATT-08 preview = ATT-09 DONE | AC-ATT-09-LOAD/HOLD/HOLD-SOT/PANEL/PATH · O1/O2/O5/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-09-02** | **settle** | **Approve → used** | After hold → QL trực tiếp Duyệt → pending→used · Nest `/core` 0 · GĐ1 one manager · ≠ multi-level | AC-ATT-09-SETTLE/GĐ1 · O4/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-09-03** | **release** | **Reject → hoàn 100%** | After hold → QL Từ chối (+ lý do) → pending−= · available hoàn 100% · Nest `/core` 0 | AC-ATT-09-RELEASE · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-09-04** | **neg/soft** | **FAIL no-hold XOR soft ≠ DONE** | Tracked 2xx without pending↑ → **FAIL AC** · soft no-row create OK + footer ≠ soft=ATT-09 DONE · Nest `/core` 0 | AC-ATT-09-FAIL-NOHOLD/SOFT/≠-SOFT-DONE · O2/O3 · U65 · **DRAFT** |
| **J-HRM-ATT-09-05** | **edge** | **Overlap + type-block + GĐ1** | Chồng ngày chặn · đổi loại pending chặn · một QL đủ · Nest `/core` 0 · ≠ multi-level DONE | AC-ATT-09-OVERLAP/TYPE-BLOCK/≠-MULTI · O7/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-09-06** | **cross** | **F5 + seals · ≠DONE** | F5 còn quỹ/status · Nest `/core` 0 · ≠ ATT-09 DONE · soft≠FR-09 · ≠ ATT-08=ATT-09 · client-days≠ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 DONE · no reopen J-ATT-08/ATT-02/PLT/CORE-10/09/07/06/05/03/02B/09D..01 · ≠ invent PAY/Word | AC-ATT-09-F5/≠-*/H/MK-* · O6/O10/O11/O12 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `attendance_uat_ready` · **≠** `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim soft create = ATT-09 DONE · **≠** claim ATT-08 preview = ATT-09 DONE · **≠** claim client-days = ATT-08 DONE · **≠** claim ATT module UAT · **≠** claim CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · **≠** invent PAY DONE · **≠** invent `att_leave_hold` · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-ATT-08-01..06** / `ATT08QC1-MSLSL36C` / `ATT08QA1-MSLSGUJF` | must_keep preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ≠ ATT UAT · Nest `/core` leave 0 · **≠** claim ATT-08 = ATT-09 DONE · **≠** wipe |
| **J-HRM-ATT-02-01..06** / `ATT02QC1-MSLQZUK7` / `ATT02QA1-MSLQWDN3` | must_keep CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 · **≠** claim ATT-02 DONE |
| **J-HRM-PLT-01-01..06** / `PLT01QC1-MSLPUQIU` / `PLT01QA1-MSLPQZF6` | must_keep peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| **J-HRM-CORE-10-01..06** / `CORE10QC1-MSLP0EJB` | must_keep SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **≠** claim CORE-10 DONE |
| **J-HRM-CORE-09-01..06** / `CORE09QC1-MSLNBA89` | must_keep fill+registry · printable **false** · 09a–d≠DONE · Word OUT · **≠** claim CORE-09 DONE |
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE |
| **J-HRM-CORE-06-*** / soft≠DONE | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05/03/02B/09D..01** | must_keep peer stamps · **≠** printable / closed-8 DONE |
| Leave LIVE hold / panel / ATT-08 preview | **RETAIN cite** · **≠** ATT-09 DONE from soft alone · ATT-04b/10/PAY **OUT invent DONE** · **DENY** invent `att_leave_hold` |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-09 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `attendance_uat_ready` | **false** · **DENY** flip |
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim soft create alone = ATT-09 / FR-09 DONE | **DENIED** (O3/O12) |
| Claim ATT-08 preview = ATT-09 DONE | **DENIED** (O6) |
| Claim client `total_days` / calendar = ATT-08 DONE | **DENIED** (O10) |
| Claim ATT module UAT | **DENIED** (O12) · C-SLICE |
| Claim CFG = ATT-02 DONE | **DENIED** (O10) · CFG≠DONE **RETAIN** |
| Claim PLT-01 / platform UAT DONE | **DENIED** · peer≠PLT · merge≠UAT |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | **DENIED** (O10) |
| Claim CORE-09 DONE / printable flip / Word invent | **DENIED** |
| Claim CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE | **DENIED** · **OUT invent** |
| Claim ATT-04b / ATT-10 DONE | **DENIED** |
| Claim printable / closed-8 DONE | **DENIED** |
| Invent `att_leave_hold` dual | **DENIED** (O1) |
| Nest `/core` dual | **DENIED** |
| Wipe ATT-08/02/PLT/CORE-10/09/07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module ATT/PLT/CORE/PAY/personnel UAT ≠ Phase1 |
| must_keep W26 | ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ≠ ATT UAT |
| must_keep W25 | ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 |
| must_keep W24 | PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| must_keep W23 | CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| must_keep W20..W10 | soft≠CORE-06 DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (ADD residual only if closable gap for soft/type on LIVE spine) · then **sa API** F.1 F-ATT-LEAVE-02/03 physical `/attendance/*` |
| **ba-data** | **HOLD** (default) — paper held = `pending_days` · **DENY** invent `att_leave_hold` · reopen **ADD/REQUIRED** only if DATA proves closable soft/type gap |
| **sa API-01** | After HOLD stamp — F.1 deepen F-ATT-LEAVE-02/03 · RETAIN F-ATT-LEAVE-01 peer must_keep · paper `/att`+`/core` alias only · held→pending_days · **DENY** Nest dual · **DENY** invent `att_leave_hold` · **DENY** invent PAY · **DENY** claim soft/ATT-08=ATT-09 DONE |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** wipe ATT-08/02/PLT/CORE · **DENY** invent PAY/printable/Word · **DENY** claim soft = ATT-09 DONE · **DENY** claim ATT UAT |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-27 seat #29)
uc_ids: UC-BP-ATT-09 · FR-UC-BP-ATT-09
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md · SA Option A · R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP · R-ATT-09-≠-DONE · R-ATT-09-PAY-OUT · printable false · ATT08QC1-MSLSL36C preview RETAIN (T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED) · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU peer≠PLT · merge≠UAT · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY OUT
spec_ref: F-ATT-LEAVE-02/03 physical prefer POST /api/hrm/attendance/leave-requests* (+ approve|reject|cancel) · paper /att + /core alias only · LIVE employee_leave_balances.pending_days = paper held · DENY invent att_leave_hold dual · leave_requests · leave-balance/panel · must_keep F-ATT-LEAVE-01 preview · BR-BP-LV-06 · GĐ1 one manager · ≠ soft=ATT-09 DONE · ≠ ATT-08 preview=ATT-09 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — LIVE employee_leave_balances.pending_days / used_days / entitled_days RETAIN = paper held — DENY invent att_leave_hold dual ledger
2) CONFIRM HOLD — LIVE leave_requests create/approve/reject/cancel + lockPending/settle/release RETAIN — ≠ FR-09 DONE from soft create alone
3) CONFIRM HOLD — leave-balance + panel RETAIN — panel F5 AC · available = entitled−used−pending
4) HOLD default on soft no-row / type-change block — ADD residual ONLY if proves closable typed gap (prefer LIVE row presence + block PATCH type while pending — DENY Nest /core · DENY invent att_leave_hold)
5) Cite display-ready DTO: request_id · status · statusLabelVi · pending_days|held_units · used_days · available_days · deductible_units? · leave_type · leave_type_label
6) RETAIN ATT-08 ATT08QC1-MSLSL36C preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ATT-02 ATT02QC1-MSLQZUK7 CFG≠DONE · PLT-01 PLT01QC1-MSLPUQIU · CORE-10 CORE10QC1-MSLP0EJB · CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY · soft≠CORE-06 DONE
7) DENY wipe ATT-08/02/PLT/CORE · invent att_leave_hold dual · invent PAY/printable/Word DONE · claim soft=ATT-09 DONE · claim ATT-08 preview=ATT-09 DONE · claim client-days=ATT-08 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-HRM-ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · apps/**
8) Unlock next: sa API F.1 F-ATT-LEAVE-02/03 physical /attendance/* — paper /att + /core alias only — held→pending_days — residual wire ONLY after DATA stamp — ATT-04b/10/PAY remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (F.1 · wire-only after HOLD/ADD)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · wipe ATT-08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word DONE · claim soft/ATT-08=ATT-09 DONE
```

---

## 8. completion_report

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-ATT-09 / FR-UC-BP-ATT-09: map BR-BP-LV-06 hold on submit (tracked must pending↑) + approve settle pending→used + reject/cancel release **100%** + panel F5 + soft no-row explicit ≠ DONE + type-block pending + GĐ1 one manager to LIVE Nest `/attendance/leave-requests*` + `pending_days` hold SoT (paper held alias · **DENY** invent `att_leave_hold`) + leave-balance/panel; residuals R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP; paper F-ATT-LEAVE-02/03 + `/att`+`/core` alias only; **must_keep** ATT-08 preview (`ATT08QC1-MSLSL36C` · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED); minted **J-HRM-ATT-09-01..06 DRAFT** (U65 narrow · ≠ soft=ATT-09 DONE · ≠ ATT-08=ATT-09 DONE · ≠ client-days=ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE); ba-data **HOLD default**; must_keep ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06; DENY Nest `/core` dual · invent `att_leave_hold` · invent PAY/printable/Word · honesty flip · seed · apps/**; honesty footer **false** · C-SLICE. |
| **next_owner** | `ba-data` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · 2026-08-09*
