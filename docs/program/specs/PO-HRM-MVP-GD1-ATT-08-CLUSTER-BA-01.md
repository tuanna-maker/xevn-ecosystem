# BA AC pack — Wave-26 ATT cluster · UC-BP-ATT-08 (Trừ phép xuyên T7–CN–Lễ · RETAIN LIVE leave + working-day residual)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-26 seat **#28**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (ADD residual only if closable gap for engine/holiday/unit) · sa API residual unlock after DATA · **DENY** claim client `total_days` / calendar expand = ATT-08 DONE · **DENY** claim ATT-09/ATT-03b DONE · **DENY** claim ATT module UAT · **printable false RETAIN** · **PAY OUT invent DONE** · **CFG≠ATT-02 DONE** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe ATT-02/PLT/CORE · **no** wipe soft≠CORE-06 DONE · **no** invent PAY/printable/Word DONE · **no** claim client days alone = FR-08 DONE) |
| **uc_ids** | `UC-BP-ATT-08` · `FR-UC-BP-ATT-08` |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-02 **`ATT02QC1-MSLQZUK7`** · QA **`ATT02QA1-MSLQWDN3`** · must_keep PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false** · ≠ CORE-09 DONE) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · **CFG≠ATT-02 DONE** · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-08** · Luồng **#1–#5** · Diễn biến **#1–#4 + FAIL calendar + Thành công** · **BR-BP-LV-05** · partner **REQ_NP_006** · **Q-LEAVE-UNIT** = cả hai theo loại phép (đã chốt) |
| **ref_api_paper** | **F-ATT-LEAVE-01** (preview-deduction) · peers **F-ATT-LEAVE-02/03** (submit/approve — **≠** ATT-09 DONE) · **F-ATT-HOL-01** (holiday — peer ATT-03b **QUEUED** · ≠ DONE) · **F-ATT-CAT-LVT/EFF** · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `leave_requests` · `employee_leave_balances` · `att_leave_type` · funnel `attendance_records` · paper `holiday_calendar_days` / `att_holiday_*` · Nest holiday **ABSENT** · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim client `total_days`/calendar = ATT-08 DONE · **DENY** claim ATT-09/ATT-03b DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** claim PLT/CORE DONE |
| **Cấm** | Nest `/core` dual · wipe ATT-02/PLT/CORE · soft=CORE-06 DONE · invent PAY/printable/Word DONE · claim client-days/calendar expand = FR-08 DONE · claim ATT-09/ATT-03b DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-26 seat #28 — **gap-only RETAIN** LIVE leave TXN/balance/type/calendar helpers + **working-day deduction residual**:

1. **Engine SoT** = **BR-BP-LV-05** — chỉ đếm ngày làm việc; **T6→T2 = 2** (không **4** calendar); T7/CN/Lễ = **0**; FAIL nếu trừ calendar.
2. **Preview** = physical Nest `POST …/leave-requests/preview-deduction` (**F-ATT-LEAVE-01**) — paper `/att/…` + `/core` = **alias only**.
3. **Holiday input** = đọc year set lễ đơn vị (minimal residual OK) — **≠** claim ATT-03b admin DONE; thiếu lịch năm → **chặn nộp**.
4. **Weekend** = T7+CN luôn non-working GĐ1 default — **DENY** invent full ATT-01 ca calendar as ATT-08 blocker.
5. **Unit** = **Q-LEAVE-UNIT** cả hai theo **loại phép** (0.5d and/or 1h) — display-ready `deductible_units`.
6. **Submit align** = create/approve consume **engine** units (reject silent client calendar inflate) — thin R-ATT-08-ALIGN · **≠** invent ATT-09 hold DONE.
7. **Funnel / expand** = RETAIN `expandLeaveDateRange` / `toLeaveDayKey` — **explicit ≠** FR-08 DONE.
8. **Mint** `J-HRM-ATT-08-01..06` DRAFT — chọn khoảng → preview đúng → FAIL calendar → F5 — **narrow** · **≠** ATT module UAT · **≠** client-days DONE.
9. **must_keep** ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · **CFG≠ATT-02 DONE**.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân viên | Chọn khoảng nghỉ + loại phép → xem preview ngày trừ → gửi (sau engine) |
| Quản lý | Duyệt — quỹ giảm đúng `working_days` / `deductible_units` (peer ATT-09 cite · ≠ DONE) |
| C&B / HCNS | Quản trị loại phép unit + (peer) lịch lễ — **≠** claim ATT-03b DONE this seat |
| Group CEO | Scope rollup `main` — U19 list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | Working-day engine · preview · holiday year set input · Nest `/core` **0** |
| ATT-02 / PLT / CORE / PAY | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-08 Diễn biến #1–#4 + FAIL + BR-BP-LV-05 → AC-ATT-08-* · residuals ENGINE/PREVIEW/HOL/UNIT/ALIGN · J-HRM-ATT-08-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/leave-requests*` (+ residual `…/preview-deduction`) · paper `/att` + `/core` alias | Nest `/core/…` leave SoT dual |
| Explicit ≠ ATT-08 DONE from client `total_days`/calendar expand · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE | Claim Option/LIVE alone = FR-08 DONE · invent PAY/printable/Word |
| Honesty footer · ATT-02/PLT/CORE RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Engine SoT | **YES** — **BR-BP-LV-05**: count **working days only**; gold **T6→T2 = 2** (T6+T2); T7/CN/Lễ = **0**; **FAIL** if UI/API trừ **4** calendar — **AC-ATT-08-ENGINE** · **AC-ATT-08-GOLD** · **AC-ATT-08-FAIL-CAL** |
| **O2** | Preview surface | **YES** — Prefer physical Nest **`POST /api/hrm/attendance/leave-requests/preview-deduction`** (**F-ATT-LEAVE-01**) — paper `POST /api/hrm/att/leave-requests/preview-deduction` + `/core/…` = **alias only** — **no** Nest `/core` — **AC-ATT-08-PREVIEW** · **AC-ATT-08-PATH** |
| **O3** | Holiday input | **YES** — Prefer read **year holiday set** (minimal residual closable without ATT-03b admin DONE) · **policy thiếu lịch năm = CHẶN NỘP** (fail-closed) · số trừ = 0 (toàn T7/CN/Lễ) → **cảnh báo** trước gửi · **≠** claim ATT-03b DONE — **AC-ATT-08-HOL** · **AC-ATT-08-HOL-MISS** · **AC-ATT-08-ZERO** |
| **O4** | Weekend rule | **YES** — Sat+Sun **always** non-working for GĐ1 default — **DENY** invent full ATT-01 ca calendar as ATT-08 blocker — **AC-ATT-08-WE** |
| **O5** | Unit | **YES** — **Q-LEAVE-UNIT** = cả hai theo **loại phép** (`day` 0.5 min and/or `hour` 1h) — half-day ends · hour khớp ca khi unit=hour · display-ready `deductible_units` + `unit` — **AC-ATT-08-UNIT** |
| **O6** | Submit align | **YES** — Create/approve consume **engine** units — reject silent client calendar inflate (`total_days` ≠ engine) — thin **R-ATT-08-ALIGN** · **≠** invent ATT-09 hold DONE — **AC-ATT-08-ALIGN** · **AC-ATT-08-≠-09** |
| **O7** | Funnel / expand | **YES RETAIN** — `expandLeaveDateRange` / `toLeaveDayKey` / leave funnel peer — **explicit ≠** FR-08 / ATT-08 DONE — **AC-ATT-08-≠-EXPAND** |
| **O8** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-08-PATH** |
| **O9** | ATT-02/PLT/CORE | **YES** — must_keep stamps **intact** · **CFG≠ATT-02 DONE** · **≠** reopen · **≠** claim ATT-02/PLT/CORE DONE · printable false · GATE/ACT-400/Nest DENY — **AC-ATT-08-MK-*** |
| **O10** | PAY/printable/Word / ATT-09/10 | **YES OUT invent** — balance cite **trace-only** · QUEUED ATT-09/10/PAY — **DENY** invent PAY/printable/Word / ATT-09/ATT-03b/ATT-10 DONE — **AC-ATT-08-PAY-OUT** · **AC-ATT-08-≠-09** · **AC-ATT-08-≠-03b** |
| **O11** | Honesty | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · printable false RETAIN · **DENY** claim ATT module UAT · client-days = DONE · CFG=ATT-02 DONE · PLT/CORE DONE — **AC-ATT-08-H** |
| **O12** | Journey mint | **YES** — Mint **`J-HRM-ATT-08-01..06` DRAFT** (range → preview 2 not 4 → FAIL calendar → unit → F5) — **narrow** · **≠** ATT module UAT · **≠** client-days DONE · U65 zero-seed |

**Architecture SoT:** RETAIN LIVE `/attendance/leave-requests*` + leave-balance/panel + `att_leave_type`/EFF + calendar helpers + funnel · unlock ENGINE/PREVIEW/HOL/UNIT/ALIGN · paper F-ATT-LEAVE-01 + `/core` alias only · U19 list↔get↔mutate · ATT-02/PLT/CORE **must_keep**.

### Primary API surface (BA lock — O2/O8)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Preview deduction (residual) | **`POST /api/hrm/attendance/leave-requests/preview-deduction`** | `POST /api/hrm/att/leave-requests/preview-deduction` · `/core/…` **alias only** |
| Submit leave (RETAIN cite) | **`POST /api/hrm/attendance/leave-requests`** | `/att/leave-requests` alias · **≠** ATT-09 DONE |
| Approve / reject (RETAIN cite) | **`POST …/leave-requests/:id/approve\|reject`** | paper alias · **≠** ATT-09 DONE |
| Leave balance / panel | **`GET …/leave-balance*`** | paper alias · **≠** ATT-08 DONE alone |
| Leave types / EFF | **`/attendance/leave-types*`** / effective | paper alias · Q-LEAVE-UNIT bind |
| Holiday year set (peer residual) | Prefer **`/attendance/holiday-calendars*`** if ADD · else thin year set HOLD | `PUT /att/holiday-calendars/{year}` alias · **≠** ATT-03b DONE |
| Calendar helpers | `expandLeaveDateRange` / `toLeaveDayKey` | **≠** BR-BP-LV-05 / FR-08 DONE |
| ATT-02 CFG / PLT / CORE peers | `/attendance/rules*` · `/merge-tokens*` · SI/CTR/activate | must_keep · **≠** claim DONE |

**Invariant ATT-08-PATH:** Preview/engine Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL O8**.

**Invariant ATT-08-ENGINE:** T6→T2 preview/submit **= 2** working days — calendar **4** = **FAIL O1**.

**Invariant ATT-08-≠-CLIENT:** Claim client `total_days` / `expandLeaveDateRange` alone = FR-UC-BP-ATT-08 DONE = **FAIL O7/O11**.

**Invariant ATT-08-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` from this seat = **FAIL O11**.

**Invariant ATT-08-≠-09/03b:** Claim ATT-09 hold / ATT-03b admin DONE from this seat = **FAIL O6/O10**.

**Invariant ATT-08-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O10/O11**.

**Invariant ATT-08-PAY-OUT:** Invent PAY DONE / claim payroll UAT from balance cite = **FAIL O10**.

**Invariant ATT-08-CFG≠02:** Claim CFG = ATT-02 DONE / reopen ATT-02 seals = **FAIL O9**.

**Wire codes (RETAIN + residual assert):** `HRM-VAL-400` (khoảng không hợp lệ / calendar inflate) · `HRM-LEAVE-TYPE-UNKNOWN` (EFF invent — RETAIN) · `HRM-LEAVE-HOL-MISSING` (thiếu lịch lễ năm — **chặn nộp**) · `HRM-SCOPE-409` · sealed ATT-02/PLT/CORE codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready preview (normative for FE bind):** `{ deductible_units, calendar_days, working_days, unit, excluded_days[]?, warnings[]? }` — labels VI: *Ngày calendar* / *Ngày trừ quỹ* / *Ngày loại (T7/CN/Lễ)*.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-08 DONE** · client `total_days`/calendar expand ≠ FR-08 DONE · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-26 · Option A) |
|---|----------------------|---------------------------|
| Leave requests | `POST/GET /attendance/leave-requests*` · client `total_days` `@Min(0.5)` | **RETAIN cite** + residual engine recompute / reject inflate (**O1/O6**) · **≠** FR-08 DONE alone |
| Working-day engine | **ABSENT** | **RESIDUAL** R-ATT-08-ENGINE (**O1**) |
| Preview deduction | Nest **ABSENT** | **RESIDUAL** R-ATT-08-PREVIEW (**O2**) |
| Holiday Nest | **ABSENT** | **RESIDUAL** R-ATT-08-HOL minimal year set (**O3**) · ≠ ATT-03b DONE |
| Weekend filter | expand = all calendar | **RESIDUAL** filter T7/CN (**O4**) |
| Unit 0.5d / 1h | Days only `@Min(0.5)` · hour **ABSENT** | **RESIDUAL** R-ATT-08-UNIT (**O5**) |
| Balance / panel / leave_type | LIVE | **RETAIN cite** · ≠ ATT-08 DONE alone |
| Calendar helpers / funnel | LIVE inclusive calendar | **RETAIN** · **≠** BR-BP-LV-05 (**O7**) |
| Paper F-ATT-LEAVE-01 / `/core` | Nest named path ABSENT · `@Controller('core')` ABSENT | **Alias only** (**O8**) |
| ATT-02 / PLT / CORE | SEALED stamps | **must_keep RETAIN** (**O9**) · CFG≠ATT-02 DONE |
| ATT-09 / ATT-03b / PAY | QUEUED | **OUT invent DONE** (**O10**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O11**) |

### 1.1 Disposition **R-ATT-08-ENGINE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-08-ENGINE` |
| **Scope** | **IN-SCOPE residual** — BR-BP-LV-05 working-day count · gold T6→T2=**2** · T7/CN/Lễ=0 · FAIL calendar-4 |
| **OUT of residual** | Claim client `total_days` = FR-08 DONE · Nest `/core` dual · invent PAY |
| **Rationale** | FR Diễn biến #2 + FAIL · REQ_NP_006 · SA O1; LIVE ABSENT engine |
| **Physical gap vs paper** | Engine **ABSENT** Nest — closable via service under `@Controller('attendance')` leave family |
| **ba-data** | **HOLD default** — **ADD** only if proves typed persist cols ABSENT for engine result on `leave_requests` (e.g. `working_days` / `deductible_units`) closable |
| **sa API** | F.1 deepen F-ATT-LEAVE-01 physical `/attendance/*` · paper alias |
| **DENY** | Nest `/core` SoT · soft-OK calendar inflate |

### 1.2 Disposition **R-ATT-08-PREVIEW**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-08-PREVIEW` |
| **Scope** | **IN-SCOPE residual** — F-ATT-LEAVE-01 preview before submit · Diễn biến #1/#2 |
| **OUT** | Claim preview alone = ATT module UAT · Nest `/core` dual |
| **Rationale** | SA O2 · paper F-ATT-LEAVE-01 · LIVE Nest path ABSENT |
| **ba-data** | **HOLD** — calc read-only; no mandatory new table for preview |
| **DENY** | Paper path as Nest dual invent · skip preview then trust client days |

### 1.3 Disposition **R-ATT-08-HOL**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-08-HOL` |
| **Scope** | **IN-SCOPE residual** — holiday year set **input** to engine · **thiếu lịch năm = CHẶN NỘP** · số trừ=0 → cảnh báo · **≠** ATT-03b admin DONE |
| **OUT** | Full ATT-03b lunar/solar admin UI DONE · invent Nest `/core` holiday SoT |
| **Rationale** | FR tiên quyết · đặc biệt «Thiếu lịch lễ năm» · SA O3 pick **chặn nộp** · F-ATT-HOL-01 peer cite |
| **ba-data** | **HOLD default** — **ADD** residual only if closable thin year set table ABSENT (map paper `holiday_calendar_days` / `att_holiday_*`) — prefer `/attendance/*` · **DENY** Nest `/core` |
| **DENY** | Claim ATT-03b DONE · seed holiday for U65 · reopen sealed peers |

### 1.4 Disposition **R-ATT-08-UNIT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-08-UNIT` |
| **Scope** | **IN-SCOPE residual** — Q-LEAVE-UNIT cả hai theo loại phép · 0.5d and/or 1h · display-ready `deductible_units` + `unit` |
| **OUT** | Hardcode một unit toàn tenant · invent PAY DONE |
| **Rationale** | SRS Decision chốt · SA O5 · matrix depth edge |
| **ba-data** | **HOLD default** — ADD only if `att_leave_type.unit` (or equiv) ABSENT closable |
| **DENY** | Force single unit for all leave types · Nest `/core` |

### 1.5 Disposition **R-ATT-08-ALIGN**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-08-ALIGN` |
| **Scope** | **IN-SCOPE residual thin** — submit/approve consume engine units · reject client calendar inflate · **≠** invent ATT-09 hold DONE |
| **OUT** | Full hold ledger UAT · overlapping deep · claim ATT-09 DONE |
| **Rationale** | Diễn biến #3/#4 cite · SA O6 · peers F-ATT-LEAVE-02/03 RETAIN |
| **ba-data** | **HOLD** — LIVE leave_requests RETAIN · align wire after engine |
| **DENY** | Silent accept client `total_days=4` for T6–T2 · claim ATT-09 DONE |

### 1.6 Disposition **R-ATT-08-≠-DONE** / **R-ATT-08-PAY** / **R-ATT-08-HONESTY**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-08-≠-CLIENT-DONE` · `R-ATT-08-≠-EXPAND` · `R-ATT-08-≠-09` · `R-ATT-08-≠-03b` · `R-ATT-08-≠-UAT` · `R-ATT-08-≠-CFG02` · `R-ATT-08-PAY-OUT` · `R-ATT-08-HONESTY` · `R-ATT-08-PRINTABLE` |
| **Scope** | **INFO honesty locks** — every evidence footer |
| **Rule** | client `total_days`/calendar expand ≠ FR-08 DONE · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · PAY/printable/Word **OUT invent DONE** · all ready flags **false** · printable **false RETAIN** |
| **DENY** | Claim DONE / honesty flip / invent PAY·printable·Word |

### 1.7 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `leave_requests` + client `total_days` | **HOLD · RETAIN** | ≠ FR-08 DONE alone · ALIGN residual |
| Working-day engine result cols | **HOLD default** · **ADD** only if closable | Prefer extend LIVE leave_requests |
| Preview endpoint | **HOLD** calc — no table required | F-ATT-LEAVE-01 physical `/attendance/*` |
| Holiday year set | **HOLD default** · **ADD** if ABSENT closable | ≠ ATT-03b DONE · DENY Nest `/core` |
| `att_leave_type` unit | **HOLD default** · **ADD** if ABSENT | Q-LEAVE-UNIT |
| leave-balance / panel / EFF | **HOLD · RETAIN** | ≠ ATT-08 DONE alone |
| `expandLeaveDateRange` / funnel | **HOLD · RETAIN** | ≠ BR-BP-LV-05 |
| Nest `/core` | **DENY** | alias only |
| ATT-02 / PLT / CORE / soft≠06 | **DENY wipe** | must_keep · CFG≠ATT-02 DONE · printable false |
| PAY / ATT-09 / ATT-03b deepen | **OUT invent DONE** | cite only |

**Unlock next:** **ba-data HOLD** stamp (ADD residual only if engine/holiday/unit gap closable) → **sa API** F.1 F-ATT-LEAVE-01 physical `/attendance/*`.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-08 DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false` · CFG≠ATT-02 DONE

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-LV-05** | Khoảng nghỉ có T7/CN/Lễ | Chỉ trừ ngày làm việc | Gold T6→T2 = **2**; T7/CN/Lễ = **0** |
| **BR-ATT-08-FAIL-CAL** | Engine/UI trừ calendar cho T6–T2 | Assert FAIL | **4** calendar = **Không đạt AC** |
| **BR-ATT-08-PATH** | Preview / engine API | Physical `/attendance/*` | Nest `/core` dual = **FAIL O8** |
| **BR-ATT-08-PREVIEW** | Chọn khoảng trước gửi | Gọi preview | NV thấy `working_days` / `deductible_units` |
| **BR-ATT-08-HOL** | Có year holiday set | Exclude lễ khỏi trừ | Lễ = 0 trừ |
| **BR-ATT-08-HOL-MISS** | Thiếu lịch lễ năm pháp nhân | **Chặn nộp** | `HRM-LEAVE-HOL-MISSING` / VAL-400 · **≠** silent 2xx |
| **BR-ATT-08-ZERO** | Toàn khoảng T7/CN/Lễ | Số trừ = 0 | **Cảnh báo** trước gửi |
| **BR-ATT-08-WE** | GĐ1 default | T7+CN non-working | **DENY** invent ATT-01 ca as blocker |
| **BR-ATT-08-UNIT** | Loại phép có unit | 0.5d and/or 1h per type | Q-LEAVE-UNIT cả hai · không khóa 1 unit toàn CT |
| **BR-ATT-08-ALIGN** | Submit/approve | Consume engine units | Reject client inflate · **≠** ATT-09 DONE |
| **BR-ATT-08-≠-CLIENT** | client `total_days` / expand alone | ≠ FR-08 DONE | Claim DONE = **FAIL O7/O11** |
| **BR-ATT-08-≠-09** | Align / approve cite | ≠ ATT-09 hold DONE | Claim = **FAIL O6/O10** |
| **BR-ATT-08-≠-03b** | Holiday residual | ≠ ATT-03b admin DONE | Claim = **FAIL O3/O10** |
| **BR-ATT-08-≠-UAT** | Slice PASS | ≠ ATT module UAT | Flip `attendance_uat_ready` = **FAIL O11** |
| **BR-ATT-08-≠-CFG02** | Any ATT-08 evidence | CFG≠ATT-02 DONE | Claim CFG DONE / reopen ATT-02 = **FAIL O9** |
| **BR-ATT-08-PAY-OUT** | Balance cite | PAY QUEUED | Invent PAY DONE = **FAIL O10** |
| **BR-ATT-08-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O10/O11** |
| **BR-ATT-08-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-ATT-08-SCOPE-U19** | list = get = mutate | Same scope resolver | Cross-CT leak = **FAIL U19** |
| **BR-ATT-08-MK** | Any ATT-08 evidence | Diff ATT-02/PLT/CORE seals | Wipe/reopen/claim DONE = **FAIL O9** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| `HRM-VAL-400` | 400 | Khoảng không hợp lệ / calendar inflate | Soft-OK 4 calendar days |
| `HRM-LEAVE-HOL-MISSING` | 4xx | Thiếu lịch lễ năm — chặn nộp | Silent 2xx submit |
| `HRM-LEAVE-TYPE-UNKNOWN` | 4xx | Loại phép ngoài EFF | Free-text invent |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed ATT-02 | — | CFG≠DONE · ≠ ATT UAT | Claim CFG=ATT-02 DONE |
| Sealed PLT-01 | — | peer≠PLT DONE · merge≠UAT | Claim PLT DONE |
| Sealed CORE-10 SI | — | catalog/CRUD/LIVE≠DONE | Claim CORE-10 DONE |
| Sealed CORE-09 CTR | — | printable false | Flip printable |
| Sealed CORE-07 GATE/ACT | — | GATE 409 · ACT-400 · Nest 0 | Claim CORE-07 DONE |

### Gold cases (normative — O1)

| Case ID | From→To (weekday) | Holidays in range | Expected `working_days` / deductible | FAIL if |
|---------|-------------------|-------------------|--------------------------------------|---------|
| **GC-ATT-08-01** | T6 → T2 (no holiday) | none | **2** (T6+T2) · calendar_days=**4** | Shows **4** trừ quỹ |
| **GC-ATT-08-02** | T6 → T2 + Mon holiday | Mon=Lễ | **1** (T6 only) | Trừ 2 hoặc 4 |
| **GC-ATT-08-03** | Sat → Sun only | n/a | **0** + warning | Silent submit OK without warn |
| **GC-ATT-08-04** | Half-day T6 AM (unit=day) | none | **0.5** | Forces 1.0 |
| **GC-ATT-08-05** | 1h leave (unit=hour) | none | **1** hour khớp ca | Forces day unit |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-08 DONE** · Nest `/core` DENY · C-SLICE

---

## 3. Diễn biến FR-UC-BP-ATT-08 → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #1** · Luồng #1 | Chọn khoảng nghỉ + loại phép | **AC-ATT-08-LOAD** · **AC-ATT-08-RANGE** | **J-HRM-ATT-08-01** | leave form · leave-types EFF RETAIN · Nest `/core` **0** |
| **Diễn biến #2** · Luồng #2–#4 | Tính ngày trừ BR-BP-LV-05 | **AC-ATT-08-ENGINE** · **AC-ATT-08-GOLD** · **AC-ATT-08-PREVIEW** | **J-01** | `POST …/preview-deduction` residual · Nest `/core` **0** |
| **FAIL calendar** | Trừ 4 calendar T6–T2 | **AC-ATT-08-FAIL-CAL** | **J-HRM-ATT-08-02** | Reject / assert FAIL · không soft-OK |
| **Luồng #3** · holiday | Loại T7/CN/Lễ | **AC-ATT-08-HOL** · **AC-ATT-08-WE** | **J-HRM-ATT-08-03** | Holiday year set input · ≠ ATT-03b DONE |
| **Đặc biệt thiếu lịch** | Thiếu year set | **AC-ATT-08-HOL-MISS** | **J-03** | Chặn nộp · `HRM-LEAVE-HOL-MISSING` |
| **Đặc biệt số trừ=0** | Toàn T7/CN/Lễ | **AC-ATT-08-ZERO** | **J-HRM-ATT-08-04** | Cảnh báo trước gửi |
| **Q-LEAVE-UNIT** | 0.5d / 1h | **AC-ATT-08-UNIT** | **J-HRM-ATT-08-05** | unit theo loại phép |
| **Diễn biến #3/#4** thin | Gửi / duyệt align | **AC-ATT-08-ALIGN** · **≠-09** | **J-01/06** | leave-requests RETAIN · ≠ ATT-09 DONE |
| **Thành công** | NV thấy ngày trừ đúng · F5 | **AC-ATT-08-F5** · **AC-ATT-08-ENGINE** | **J-HRM-ATT-08-06** | F5 còn · seals footer |
| **O7–O11** | ≠DONE + seals | **AC-ATT-08-≠-*** · **H** · **MK-*** | **J-06** | ATT-02/PLT/CORE RETAIN · PAY OUT |

### 3.1 AC-ATT-08 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-08-PATH** | Preview/engine API | Calc / submit align | Network hits **only** physical `/api/hrm/attendance/*` · Nest `/api/hrm/core/**` SoT **0** · paper `/att`+/`/core` alias only | U65 · O2/O8 · **R-ATT-08-PREVIEW** |
| **AC-ATT-08-LOAD** | Quyền NV/C&B đúng scope | Mở form đơn nghỉ | Form load · leave_type EFF picker RETAIN · Nest `/core` 0 · no seed · balance panel cite | Diễn biến #1 · J-01 |
| **AC-ATT-08-RANGE** | Scope OK | Chọn Từ–Đến (vd T6→T2) + loại trừ quỹ | Preview kích hoạt · Đến ≥ Từ | O1/O2 · J-01 |
| **AC-ATT-08-ENGINE** / **AC-ATT-08-GOLD** | Holiday+weekend rules | Preview T6→T2 no holiday | `working_days=2` · `calendar_days=4` · `deductible_units` khớp unit · FE hiện **Ngày trừ = 2** (không 4) | O1 · BR-BP-LV-05 · GC-01 · J-01 |
| **AC-ATT-08-FAIL-CAL** | Engine/UI | Claim/trừ **4** calendar cho T6–T2 | **FAIL AC** — không đạt · reject soft-OK inflate | O1 · SRS FAIL · J-02 |
| **AC-ATT-08-PREVIEW** | Range + leave_type | Gọi F-ATT-LEAVE-01 | Response display-ready `{ deductible_units, calendar_days, working_days, unit, excluded_days[]?, warnings[]? }` · Nest `/core` 0 | O2 · Diễn biến #2 · J-01 |
| **AC-ATT-08-WE** | GĐ1 default | Range spans Sat/Sun | T7/CN ∈ excluded · trừ = 0 cho các ngày đó | O4 · J-01/03 |
| **AC-ATT-08-HOL** | Year holiday set PRESENT | Range includes lễ | Lễ ∈ excluded · trừ = 0 cho lễ · **≠** claim ATT-03b DONE | O3 · J-03 |
| **AC-ATT-08-HOL-MISS** | Year holiday set ABSENT | Preview/submit | **Chặn nộp** · mã `HRM-LEAVE-HOL-MISSING` (hoặc VAL-400) · **no** silent 2xx · **≠** ATT-03b DONE | O3 · J-03 |
| **AC-ATT-08-ZERO** | Toàn khoảng T7/CN/Lễ | Preview | `working_days=0` · **cảnh báo** trước gửi | O3 · SRS đặc biệt · J-04 |
| **AC-ATT-08-UNIT** | leave_type unit=day\|hour | Preview / half-day / 1h | 0.5d min khi day · 1h khi hour · **không** khóa 1 unit toàn CT | O5 · Q-LEAVE-UNIT · J-05 |
| **AC-ATT-08-ALIGN** | Engine result | Submit create | Persisted units = engine · reject client `total_days` calendar inflate · **≠** ATT-09 hold DONE | O6 · J-01/06 |
| **AC-ATT-08-F5** | Sau preview (và/hoặc submit align) | F5 / navigate lại | Số trừ / đơn còn khớp engine · Nest `/core` 0 | U65 · J-06 |
| **AC-ATT-08-≠-CLIENT** | client `total_days` PASS alone | Claim FR-08 / ATT-08 DONE | **FAIL** — footer **client-days ≠ ATT-08 DONE** | O7/O11 |
| **AC-ATT-08-≠-EXPAND** | expandLeaveDateRange / funnel LIVE | Claim = BR-BP-LV-05 / FR-08 DONE | **FAIL** | O7 |
| **AC-ATT-08-≠-09** | leave submit/approve cite | Claim ATT-09 hold DONE | **FAIL** | O6/O10 |
| **AC-ATT-08-≠-03b** | Holiday residual | Claim ATT-03b admin DONE | **FAIL** | O3/O10 |
| **AC-ATT-08-≠-UAT** | Slice GWC later | Claim ATT module UAT / flip `attendance_uat_ready` | **FAIL** | O11 · C-SLICE |
| **AC-ATT-08-≠-CFG02** | Any ATT-08 evidence | Claim CFG = ATT-02 DONE / reopen ATT-02 | **FAIL** | O9 |
| **AC-ATT-08-≠-PLT-DONE** | Any ATT-08 evidence | Claim PLT-01 / platform UAT DONE | **FAIL** — peer≠PLT · merge≠UAT | O9 |
| **AC-ATT-08-≠-CORE10-DONE** | Any ATT-08 evidence | Claim catalog/CRUD/LIVE = CORE-10 DONE | **FAIL** | O9 |
| **AC-ATT-08-≠-09-DONE** | Any ATT-08 evidence | Claim CORE-09 DONE / printable flip | **FAIL** | O9/O10 |
| **AC-ATT-08-≠-07-DONE** | Any ATT-08 evidence | Claim CORE-07 DONE | **FAIL** | O9 |
| **AC-ATT-08-PAY-OUT** | Balance / quỹ cite | This seat | **OUT invent** — claim PAY DONE = **FAIL** | O10 |
| **AC-ATT-08-NO-SEED** | Empty holiday / balance | UF evidence | CTA / hướng dẫn · **no** seed | O12 · U65 |
| **AC-ATT-08-MK-ATT02** | Any ATT-08 evidence | Diff ATT-02 | CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 **intact** · **no** reopen J-HRM-ATT-02-01..06 · **≠** claim ATT-02 DONE | O9 · `ATT02QC1-MSLQZUK7` |
| **AC-ATT-08-MK-PLT** | Any ATT-08 evidence | Diff PLT-01 | peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT **intact** · **no** reopen J-HRM-PLT-01-01..06 · **≠** claim PLT DONE | O9 · `PLT01QC1-MSLPUQIU` |
| **AC-ATT-08-MK-10** | Any ATT-08 evidence | Diff CORE-10 | SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT **intact** · **no** reopen J-HRM-CORE-10-01..06 · **≠** claim CORE-10 DONE | O9 · `CORE10QC1-MSLP0EJB` |
| **AC-ATT-08-MK-09** | Any ATT-08 evidence | Diff CORE-09 | Fill+registry · PREV · VER · printable **false** · 09a–d≠DONE · registry≠DONE **intact** · **no** reopen J-HRM-CORE-09-01..06 · **≠** claim CORE-09 DONE · **≠** Word invent | O9 · `CORE09QC1-MSLNBA89` |
| **AC-ATT-08-MK-07** | Any ATT-08 evidence | Diff CORE-07 | Physical activate · GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE **intact** · **no** reopen J-HRM-CORE-07-01..05 · **≠** claim CORE-07 DONE | O9 · `CORE07QC1-KZJTSHNT` |
| **AC-ATT-08-MK-06** | Any ATT-08 evidence | Diff CORE-06 | soft≠DONE · Nest `/core` 0 **intact** · **≠** claim soft=CORE-06 DONE | O9 |
| **AC-ATT-08-H** | Evidence footer | Any seal | attendance/personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** client-days=ATT-08 DONE · ATT-09/03b DONE · ATT UAT · CFG=ATT-02 DONE · PLT/CORE DONE · PAY/printable/Word DONE · Nest DENY · no reopen seals | O9/O10/O11 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + NV/C&B | Leave preview/engine across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP / NV** | Chỉ pháp nhân membership | list ≠ get ≠ mutate resolver |
| **No leave right** | Deny mutate leave-requests | Silent 2xx |

**Invariant ATT-08-SCOPE-U19:** leave-requests / preview / balance list **=** get-by-id **=** mutate **same** hrm list-scope family.

**Prerequisite:** ATT-02 seal RETAIN (`ATT02QC1-MSLQZUK7` · CFG≠DONE · ≠ ATT UAT) · PLT-01 (`PLT01QC1-MSLPUQIU`) · CORE-10 (`CORE10QC1-MSLP0EJB`) · CORE-09 (`CORE09QC1-MSLNBA89` · printable false) · CORE-07 (`CORE07QC1-KZJTSHNT`) · soft≠CORE-06 DONE · **không** seed · honesty flags false.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-08 DONE** · Nest `/core` DENY · C-SLICE

---

## 4. Diễn biến FE U65 (browser matrix — narrow ATT-08)

```text
Login (ceo@xe.vn / member NV or HCNS)
  → /hr Nhân sự → Đơn nghỉ / nộp phép (narrow leave)
  → (Pos RANGE) Chọn loại phép trừ quỹ + khoảng T6→T2 → Preview
       → Assert Ngày trừ quỹ = 2 (không 4) · calendar_days=4 · Nest /core = 0 · no seed
       → Assert client total_days / expandLeaveDateRange ≠ ATT-08 DONE alone
  → (Neg FAIL-CAL) Nếu UI/API hiện trừ 4 calendar → FAIL AC (không soft-OK)
  → (Pos HOL/WE) Khoảng có lễ hoặc T7/CN → excluded · trừ khớp engine · ≠ ATT-03b DONE
  → (Neg HOL-MISS) Thiếu lịch lễ năm → chặn nộp · không silent 2xx
  → (Pos ZERO) Toàn T7/CN/Lễ → working_days=0 + cảnh báo
  → (Pos UNIT) Loại unit=day half-day → 0.5 · unit=hour → 1h (không khóa 1 unit toàn CT)
  → (Pos ALIGN thin) Gửi (nếu holiday OK) → persisted units = engine · ≠ ATT-09 hold DONE
  → F5 → số trừ / đơn còn · Nest /core 0
  → Footer: ≠ ATT-08 DONE
       · client total_days / calendar expand ≠ FR-08 DONE
       · ≠ ATT-09 / ATT-03b DONE
       · ≠ ATT module UAT · attendance_uat_ready=false
       · CFG≠ATT-02 DONE · must_keep ATT02QC1-MSLQZUK7
       · peer≠PLT DONE · merge≠platform UAT
       · printable false RETAIN
       · PAY OUT invent DONE
       · must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed leave/holiday · DB fake · PASS chỉ curl · Nest `/core` dual · wipe ATT-02/PLT/CORE · claim client-days=FR-08 DONE · claim ATT-09/ATT-03b DONE · claim ATT module UAT · invent PAY/printable/Word · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-ATT-08-01** | T6→T2 preview = 2 not 4 · Nest `/core` 0 · no seed | AC-ATT-08-LOAD/RANGE/ENGINE/GOLD/PREVIEW/PATH · O1/O2/O8 |
| **VAL-ATT-08-02** | Calendar-4 claim = FAIL · no soft-OK inflate | AC-ATT-08-FAIL-CAL · O1 |
| **VAL-ATT-08-03** | Exclude T7/CN/Lễ · HOL-MISS chặn nộp · ≠ ATT-03b DONE | AC-ATT-08-HOL/WE/HOL-MISS · O3/O4 |
| **VAL-ATT-08-04** | Zero deduction + warning | AC-ATT-08-ZERO · O3 |
| **VAL-ATT-08-05** | Unit 0.5d / 1h per leave_type | AC-ATT-08-UNIT · O5 |
| **VAL-ATT-08-06** | F5 + ALIGN thin + seals · ≠DONE · printable false · PAY OUT · ATT-02/PLT/CORE RETAIN · honesty | AC-ATT-08-F5/ALIGN/≠-*/H/MK-* · O6/O7/O9/O10/O11 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-08 DONE** · Nest `/core` DENY · C-SLICE

---

## 5. Journeys DRAFT (O12)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-ATT-08-01** | **preview** | **T6→T2 = 2 not 4** | Login → Đơn nghỉ → chọn khoảng T6→T2 + loại trừ quỹ → Preview · Ngày trừ = **2** (không 4) · Nest `/core` 0 · no seed · ≠ ATT-08 DONE from client `total_days` alone | AC-ATT-08-LOAD/RANGE/ENGINE/GOLD/PREVIEW/PATH · O1/O2/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-08-02** | **neg** | **FAIL calendar inflate** | Assert/trừ calendar **4** cho T6–T2 → **FAIL AC** · không soft-OK · Nest `/core` 0 | AC-ATT-08-FAIL-CAL · O1 · U65 · **DRAFT** |
| **J-HRM-ATT-08-03** | **holiday** | **Exclude lễ + HOL-MISS** | Range có lễ → trừ đúng · thiếu lịch năm → **chặn nộp** · Nest `/core` 0 · **≠** ATT-03b DONE | AC-ATT-08-HOL/WE/HOL-MISS · O3/O4 · U65 · **DRAFT** |
| **J-HRM-ATT-08-04** | **edge** | **Zero deduction warn** | Toàn T7/CN/Lễ → `working_days=0` + cảnh báo · Nest `/core` 0 | AC-ATT-08-ZERO · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-08-05** | **unit** | **0.5d / 1h per type** | leave_type day half → 0.5 · hour → 1h · Nest `/core` 0 · Q-LEAVE-UNIT | AC-ATT-08-UNIT · O5 · U65 · **DRAFT** |
| **J-HRM-ATT-08-06** | **cross** | **F5 + seals · ≠DONE** | F5 còn số trừ/engine · ALIGN thin · Nest `/core` 0 · ≠ ATT-08 DONE · client/expand ≠ FR-08 · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · ATT-02 `ATT02QC1-MSLQZUK7` · PLT `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 DONE · no reopen J-ATT-02/PLT/CORE-10/09/07/06/05/03/02B/09D..01 · ≠ invent PAY/Word | AC-ATT-08-F5/ALIGN/≠-*/H/MK-* · O6/O7/O9/O10/O11 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `attendance_uat_ready` · **≠** `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim client-days = ATT-08 DONE · **≠** claim ATT-09/ATT-03b DONE · **≠** claim ATT module UAT · **≠** claim CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · **≠** invent PAY DONE · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-ATT-02-01..06** / `ATT02QC1-MSLQZUK7` / `ATT02QA1-MSLQWDN3` | must_keep CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 · **≠** claim ATT-02 DONE |
| **J-HRM-PLT-01-01..06** / `PLT01QC1-MSLPUQIU` / `PLT01QA1-MSLPQZF6` | must_keep peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| **J-HRM-CORE-10-01..06** / `CORE10QC1-MSLP0EJB` | must_keep SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **≠** claim CORE-10 DONE |
| **J-HRM-CORE-09-01..06** / `CORE09QC1-MSLNBA89` | must_keep fill+registry · printable **false** · 09a–d≠DONE · Word OUT · **≠** claim CORE-09 DONE |
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE |
| **J-HRM-CORE-06-*** / soft≠DONE | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05/03/02B/09D..01** | must_keep peer stamps · **≠** printable / closed-8 DONE |
| Leave LIVE / balance / leave_type / expand / funnel | **RETAIN cite** · **≠** ATT-08 DONE alone · ATT-09/03b/PAY **OUT invent DONE** |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-08 DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false` · CFG≠ATT-02 DONE

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `attendance_uat_ready` | **false** · **DENY** flip |
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim client `total_days` / calendar expand alone = ATT-08 / FR-08 DONE | **DENIED** (O7/O11) |
| Claim ATT-09 hold / ATT-03b admin DONE | **DENIED** (O6/O10) |
| Claim ATT module UAT | **DENIED** (O11) · C-SLICE |
| Claim CFG = ATT-02 DONE | **DENIED** (O9) · CFG≠DONE **RETAIN** |
| Claim PLT-01 / platform UAT DONE | **DENIED** · peer≠PLT · merge≠UAT |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | **DENIED** (O9) |
| Claim CORE-09 DONE / printable flip / Word invent | **DENIED** |
| Claim CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE | **DENIED** · **OUT invent** |
| Claim printable / closed-8 DONE | **DENIED** |
| Nest `/core` dual | **DENIED** |
| Wipe ATT-02/PLT/CORE-10/09/07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module ATT/PLT/CORE/PAY/personnel UAT ≠ Phase1 |
| must_keep W25 | ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 |
| must_keep W24 | PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| must_keep W23 | CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| must_keep W20..W10 | soft≠CORE-06 DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (ADD residual only if closable gap for engine result cols / holiday year set / leave_type unit on LIVE spine) · then **sa API** F.1 F-ATT-LEAVE-01 physical `/attendance/*` |
| **ba-data** | **HOLD** (default) — reopen **ADD/REQUIRED** only if DATA proves typed col/table ABSENT for engine/holiday/unit closable |
| **sa API-01** | After HOLD stamp — F.1 deepen F-ATT-LEAVE-01 · RETAIN F-ATT-LEAVE-02/03 · F-ATT-HOL-01 peer cite · paper `/att`+`/core` alias only · **DENY** Nest dual · **DENY** invent PAY · **DENY** claim ATT-09/03b DONE |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** wipe ATT-02/PLT/CORE · **DENY** invent PAY/printable/Word · **DENY** claim client-days = ATT-08 DONE · **DENY** claim ATT UAT |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-26 seat #28)
uc_ids: UC-BP-ATT-08 · FR-UC-BP-ATT-08
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md · SA Option A · R-ATT-08-ENGINE HOLD/ADD residual · R-ATT-08-PREVIEW HOLD · R-ATT-08-HOL HOLD/ADD (thiếu lịch = CHẶN NỘP · ≠ ATT-03b DONE) · R-ATT-08-UNIT HOLD/ADD · R-ATT-08-ALIGN thin · R-ATT-08-≠-DONE · R-ATT-08-PAY-OUT · printable false · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU peer≠PLT · merge≠UAT · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · PAY OUT
spec_ref: F-ATT-LEAVE-01 physical prefer POST /api/hrm/attendance/leave-requests/preview-deduction · paper /att/leave-requests/preview-deduction + /core alias only · LIVE leave_requests · employee_leave_balances · att_leave_type/EFF · expandLeaveDateRange (≠ BR-BP-LV-05) · F-ATT-HOL-01 peer · Nest /core DENY · BR-BP-LV-05 T6→T2=2 · Q-LEAVE-UNIT · ≠ ATT-08 DONE from client total_days · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — LIVE leave_requests (client total_days) + leave-balance/panel + att_leave_type/EFF RETAIN — ≠ FR-08 DONE alone
2) HOLD default on engine result cols (working_days / deductible_units / unit) — ADD residual ONLY if proves typed col ABSENT for closable BR-BP-LV-05 persist (prefer extend leave_requests — DENY Nest /core dual table invent as primary)
3) HOLD default on holiday year set — ADD residual ONLY if ABSENT closable (map paper holiday_calendar_days / att_holiday_*) · policy thiếu lịch = CHẶN NỘP · explicit ≠ ATT-03b admin DONE
4) HOLD default on leave_type.unit (day|hour) — ADD only if ABSENT for Q-LEAVE-UNIT
5) CONFIRM HOLD — expandLeaveDateRange / toLeaveDayKey / leave funnel RETAIN · explicit ≠ BR-BP-LV-05 / FR-08 DONE
6) Cite display-ready DTO: deductible_units · calendar_days · working_days · unit · excluded_days[]? · warnings[]?
7) RETAIN ATT-02 ATT02QC1-MSLQZUK7 CFG≠DONE · PLT-01 PLT01QC1-MSLPUQIU · CORE-10 CORE10QC1-MSLP0EJB · CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY · soft≠CORE-06 DONE
8) DENY wipe ATT-02/PLT/CORE · invent PAY/printable/Word DONE · claim client-days/calendar = ATT-08 DONE · claim ATT-09/ATT-03b DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-HRM-ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · apps/**
9) Unlock next: sa API F.1 F-ATT-LEAVE-01 physical /attendance/* — paper /att + /core alias only — residual wire ONLY after DATA stamp — ATT-09/03b/PAY remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (F.1 · wire-only after HOLD/ADD)
cấm: apps/** · seed · Nest /core dual invent · wipe ATT-02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word DONE · claim ATT-09/ATT-03b DONE
```

---

## 8. completion_report

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-ATT-08 / FR-UC-BP-ATT-08: map BR-BP-LV-05 working-day engine (T6→T2=**2** not 4) + F-ATT-LEAVE-01 preview + holiday input (thiếu lịch=**CHẶN NỘP** · ≠ ATT-03b DONE) + Q-LEAVE-UNIT 0.5d/1h + thin ALIGN to LIVE Nest `/attendance/leave-requests*` + balance/panel + `att_leave_type`/EFF + calendar helpers (≠ FR-08 DONE); residuals R-ATT-08-ENGINE/PREVIEW/HOL/UNIT/ALIGN; paper F-ATT-LEAVE-01 + `/att`+`/core` alias only; minted **J-HRM-ATT-08-01..06 DRAFT** (U65 narrow · ≠ ATT module UAT · ≠ client-days DONE · ≠ ATT-09/03b DONE · CFG≠ATT-02 DONE); ba-data **HOLD default**; must_keep ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06; DENY Nest `/core` dual · invent PAY/printable/Word · honesty flip · seed · apps/**; honesty footer **false** · C-SLICE. |
| **next_owner** | `ba-data` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · 2026-08-09*
