# BA AC pack — Wave-28 ATT cluster · UC-BP-ATT-10 (Tổng hợp bảng công · phễu giờ công tính lương · RETAIN LIVE AGG + att_timesheet_line)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-28 seat **#30**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (ADD residual only if closable gap for HOL/MEAL/PAYABLE formula) · sa API residual unlock after DATA · **DENY** claim LIVE AGG alone = ATT-10 DONE · **DENY** claim ATT-11/PAY DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** CFG=ATT-02 DONE · **printable false RETAIN** · **PAY OUT invent DONE** · **DENY invent `att_leave_hold` dual** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** wipe ATT-09 hold/settle · **no** wipe ATT-08 preview · **no** wipe ATT-02/PLT/CORE · **no** wipe soft≠CORE-06 DONE · **no** invent PAY/printable/Word DONE · **no** claim LIVE AGG alone = FR-10 DONE) |
| **uc_ids** | `UC-BP-ATT-10` · `FR-UC-BP-ATT-10` |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-09 **`ATT09QC1-MSLUTL9D`** (hold/settle · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT) · QA **`ATT09QA2-MSLUKI9U`** · must_keep ATT-08 **`ATT08QC1-MSLSL36C`** preview · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false** · ≠ CORE-09 DONE) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · **≠ ATT UAT** · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-10** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-01** · phễu SoT (chuẩn / thực tế / phép / lễ / phạt / ăn ca / OT×hệ số / trừ không lương) · partner **REQ_L_001** · UC kế = **ATT-11** (**OUT** invent DONE) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` §6.1–6.4 · A5 closed sheet = ONE source PAY · funnel → **F-ATT-SHEET-01** aggregate → submitted → ATT-11 close · **F-ATT-SHEET-02/03/04** peer cite ≠ ATT-10 DONE |
| **ref_api_paper** | **F-ATT-SHEET-01** / **F-ATT-SHEET-AGG-01** (aggregate write) · submit **must** invoke AGG · peer **F-ATT-SHEET-02/03/04** + WF-SIGN (**ATT-11 OUT** invent DONE) · Nest `@Controller('core')` **ABSENT** · prior SoT `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` |
| **ref_db** | LIVE `public.attendance_sheets` (header) · `public.att_timesheet_line` (`standard_hours` · `ot_hours_weighted` · `paid_leave_hours` · `unpaid_leave_hours` · `payable_hours` · `late_penalty_hours` · `meal_shift_hours` NULL · `work_days` · `line_locked`) · sources `attendance_records` · `overtime_requests` (approved × coefficient) · `late_early_requests` · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim LIVE AGG alone = ATT-10 DONE · **DENY** claim ATT-11/PAY DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** claim PLT/CORE DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` dual · wipe ATT-09 hold/settle · wipe ATT-08 preview · wipe ATT-02/PLT/CORE · soft=CORE-06 DONE · invent PAY/printable/Word DONE · claim AGG alone = FR-10 DONE · claim ATT-11 close = ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-28 seat #30 — **gap-only RETAIN** LIVE AGG + `att_timesheet_line` funnel:

1. **AGG SoT** = LIVE `POST …/attendance-sheets/:sheetId/aggregate` → UPSERT `att_timesheet_line` — **≠** ATT-10 DONE from AGG alone.
2. **Submit→AGG (OPEN-Q2 FROZEN)** = `POST …/submit` **must** invoke AGG · after 2xx lines PRESENT · F5 còn.
3. **Phễu nhóm SoT** = map SRS buckets ↔ LIVE cols with footer **PRESENT / ABSENT / OUT GĐ1** (chuẩn · thực tế · phép · lễ · phạt · ăn ca · OT weighted · trừ không lương · `payable_hours`).
4. **Công chuẩn GĐ1** = default-8 interim **accepted** · residual shift/calendar wire closable · **≠** claim STD DONE if interim.
5. **Phép vào phễu** = day-record leave SoT GĐ1 · cite ATT-09 approved upstream · **DENY** invent leave HTTP in PAY.
6. **Payable formula GĐ1** = LIVE `standard_hours + paid_leave_hours + ot_hours_weighted` · `late_penalty_hours` **display separate** · **does NOT subtract** from payable GĐ1 · unpaid **not** in payable · gold numeric AC.
7. **OT × hệ số** = only weighted hours enter payable · raw OT → **FAIL** into «giờ công tính lương» (BR-BP-TS-01).
8. **Warnings** = thiếu punch → `warnings[]` · optional block-chốt = **ATT-11** peer · **≠** invent ATT-11 DONE.
9. **HOL / MEAL** = **OUT GĐ1** dedicated writers (`holiday_hours` ABSENT · `meal_shift_hours` NULL/ABSENT writer) · footer explicit · ba-data HOLD (ADD only if closable).
10. **Mint** `J-HRM-ATT-10-01..06` DRAFT — chọn kỳ → aggregate/submit → lines đủ nhóm SoT lock → F5 — **narrow** · **≠** ATT module UAT · U65 zero-seed.
11. **must_keep** ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS chấm công | Chọn kỳ / phạm vi → Chạy gộp / Gửi chờ ký → rà soát dòng giờ công tính lương |
| Hệ thống (Nest AGG) | Materialize `att_timesheet_line` · OT×coef · leave buckets · late_penalty write · warnings · closed 409 |
| Group CEO | Scope rollup `main` — U19 list = get = mutate sheet |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| ATT-09 / ATT-08 / ATT-02 / PLT / CORE / PAY / ATT-11 | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-10 Diễn biến #1–#3 + Thành công + BR-BP-TS-01 → AC-ATT-10-* · residuals FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP · J-HRM-ATT-10-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/attendance-sheets*/aggregate` (+ submit) · paper `/att` + `/core` alias | Nest `/core/…` AGG SoT dual · invent second hour ledger · invent `att_leave_hold` |
| Explicit ≠ ATT-10 DONE from AGG alone · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE | Claim Option/LIVE AGG alone = FR-10 DONE · invent PAY/printable/Word · invent ATT-11 close/sign DONE |
| Honesty footer · ATT-09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | AGG SoT | **YES** — LIVE `POST …/aggregate` + `att_timesheet_line` · paper F-ATT-SHEET-01 alias · **≠** ATT-10 DONE from AGG alone · mint **J-HRM-ATT-10-*** — **AC-ATT-10-AGG** · **AC-ATT-10-≠-AGG-DONE** |
| **O2** | Submit→AGG | **YES** — OPEN-Q2 FROZEN: submit **must** invoke AGG · after 2xx lines PRESENT · F5 — **AC-ATT-10-SUBMIT** · **AC-ATT-10-F5** |
| **O3** | Phễu nhóm | **YES** — Footer map PRESENT/ABSENT/OUT GĐ1 (see §1.1 FUNNEL) · thiếu nhóm SoT bắt buộc → warn (O8) — **AC-ATT-10-FUNNEL** · **AC-ATT-10-FOOTER** |
| **O4** | Công chuẩn | **YES** — GĐ1 **default-8 interim accepted** · residual shift/calendar wire closable · **≠** claim STD DONE if interim — **AC-ATT-10-STD** · **AC-ATT-10-≠-STD-DONE** |
| **O5** | Phép vào phễu | **YES** — Prefer day-record leave SoT GĐ1 · cite ATT-09 approved upstream · **DENY** invent leave HTTP in PAY — **AC-ATT-10-LEAVE** · **AC-ATT-10-MK-ATT09** |
| **O6** | Payable formula | **YES** — GĐ1 gold = LIVE `standard_hours + paid_leave_hours + ot_hours_weighted` · `late_penalty_hours` **display** · **NOT** subtracted from payable GĐ1 · unpaid **excluded** · −penalty into payable = **OUT GĐ1** (ADD only if ba-data/sponsor closable later) — **AC-ATT-10-PAYABLE** · **AC-ATT-10-GOLD** |
| **O7** | OT hệ số | **YES** — Reject raw OT into payable · LIVE Σ `total_hours × COALESCE(coefficient, 1.5)` approved — **AC-ATT-10-OT** · **AC-ATT-10-FAIL-RAW-OT** |
| **O8** | Warnings / thiếu punch | **YES** — `warnings[]` AC · optional block-chốt = ATT-11 peer · **≠** invent ATT-11 DONE — **AC-ATT-10-WARN** · **AC-ATT-10-≠-11** |
| **O9** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-10-PATH** |
| **O10** | ATT-09/08/02/PLT/CORE | **YES** — must_keep stamps **intact** · **≠** soft/ATT-08=ATT-09 DONE · **CFG≠ATT-02 DONE** · **≠** reopen · printable false — **AC-ATT-10-MK-*** |
| **O11** | ATT-11 / PAY / printable | **YES OUT invent** — sheet cite **trace-only** · QUEUED ATT-11/PAY · **DENY** invent PAY/printable/Word / ATT-11 DONE — **AC-ATT-10-PAY-OUT** · **AC-ATT-10-≠-11** |
| **O12** | Honesty / journeys | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · Mint **`J-HRM-ATT-10-01..06` DRAFT** (chọn kỳ → AGG/submit → lines SoT → F5) — **narrow** · **≠** ATT module UAT · U65 zero-seed · **DENY** invent `att_leave_hold` — **AC-ATT-10-H** |

**Architecture SoT:** RETAIN LIVE `/attendance/attendance-sheets*/aggregate` + submit→AGG + `att_timesheet_line` (standard · OT×coef · paid/unpaid leave · payable · late_penalty · warnings · closed 409) · unlock FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP · paper F-ATT-SHEET-01 + `/core` alias only · U19 list↔get↔mutate · ATT-09/08/02/PLT/CORE **must_keep**.

### Primary API surface (BA lock — O1/O9)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Aggregate (this seat) | **`POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate`** | `POST /api/hrm/att/attendance-sheets/aggregate` · `/core/…` **alias only** |
| Submit → AGG | **`POST …/attendance-sheets/{sheetId}/submit`** | paper `/att/…` alias · **must** call AGG |
| GET sheet + lines | **`GET …/attendance-sheets/{id}`** | paper alias · peer F-ATT-SHEET-04 cite · **≠** ATT-10 DONE · **≠** PAY DONE |
| Close / reopen / signatures | peer ATT-11 paths | **OUT invent = ATT-10 DONE** |
| ATT-09 leave hold peer | `/attendance/leave-requests*` + balance | must_keep · held=`pending_days` · **DENY** `att_leave_hold` |
| ATT-08 preview / ATT-02 CFG | preview-deduction · `/attendance/rules*` | must_keep · **≠** claim DONE |

**Invariant ATT-10-PATH:** Aggregate/submit Network **MUST** hit physical `/api/hrm/attendance/attendance-sheets*` — Nest dual `/core` SoT = **FAIL O9**.

**Invariant ATT-10-≠-AGG-DONE:** Claim LIVE AGG endpoint alone = FR-UC-BP-ATT-10 / ATT-10 DONE = **FAIL O1/O12**.

**Invariant ATT-10-SUBMIT:** Submit 2xx **without** AGG materialize / lines = **FAIL O2**.

**Invariant ATT-10-OT:** Raw OT (unweighted) in `payable_hours` / «giờ công tính lương» = **FAIL O7**.

**Invariant ATT-10-PAYABLE:** GĐ1 payable ≠ LIVE gold formula (std+paidLeave+otWeighted) without documented residual = **FAIL O6**.

**Invariant ATT-10-≠-11:** Claim close/sign/WF = ATT-10 DONE = **FAIL O8/O11**.

**Invariant ATT-10-≠-09-DONE:** Claim soft/ATT-08 = ATT-09 DONE from this seat = **FAIL O10**.

**Invariant ATT-10-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL O12**.

**Invariant ATT-10-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O11/O12**.

**Invariant ATT-10-PAY-OUT:** Invent PAY DONE / claim payroll UAT from AGG cite = **FAIL O11**.

**Invariant ATT-10-CFG≠02:** Claim CFG = ATT-02 DONE / reopen ATT-02 seals = **FAIL O10**.

**Invariant ATT-10-≠-DUAL-HOLD:** Invent `att_leave_hold` = **FAIL O10/O12**.

**Wire codes (RETAIN + residual assert):** `409 HRM-ATT-SHEET-LOCKED` · `HRM-AS-404` · `HRM-SCOPE-409` · warnings `AGG_SHEET_DATE_INVALID` · `AGG_RECORDS_UNAVAILABLE` · `AGG_OT_ENROLL_UNAVAILABLE` · `AGG_EMPTY_ENROLLMENT` · `AGG_LINE_COUNT_ZERO` · sealed ATT-09/08/02/PLT/CORE codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready (normative for FE bind):** `{ sheet_id, status, statusLabelVi, line_count, warnings[], lines: [{ employee_id, employee_name?, standard_hours, ot_hours_weighted, paid_leave_hours, unpaid_leave_hours, late_penalty_hours, meal_shift_hours?, holiday_hours?, payable_hours, work_days, line_locked }] }` — `meal_shift_hours` / `holiday_hours` may be **null/ABSENT** GĐ1 (footer OUT).

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-10 DONE** · AGG alone ≠ FR-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-28 · Option A) |
|---|----------------------|---------------------------|
| Aggregate | `POST …/aggregate` UPSERT lines | **RETAIN cite** + AC harden funnel (**O1/O3**) · **≠** FR-10 DONE from AGG alone |
| Submit | `POST …/submit` calls AGG | **RETAIN cite** + F5 AC (**O2**) |
| Công chuẩn | Default 8h / punch capped | **Interim accepted** + residual STD (**O4**) · ≠ STD DONE if interim |
| Công thực tế | `status=present` + punch | **RETAIN cite** |
| Công phép | Via `attendance_records` leave | **RETAIN cite** + **R-ATT-10-LEAVE** (**O5**) · must_keep ATT-09 |
| Công lễ | Dedicated bucket ABSENT | **OUT GĐ1** footer (**O3**) · **R-ATT-10-HOL** |
| Phạt | `late_penalty_hours` written | **RETAIN cite** peer ATT-02 · ≠ CFG=ATT-02 DONE · display · not in payable GĐ1 (**O6**) |
| Ăn ca | `meal_shift_hours` NULL · writer ABSENT | **OUT GĐ1** footer (**O3**) · **R-ATT-10-MEAL** |
| OT × hệ số | Σ hours×coef approved | **RETAIN cite** + FAIL raw (**O7**) |
| Trừ không lương | `unpaid_leave_hours` · not in payable | **RETAIN cite** |
| `payable_hours` | std+paidLeave+ot | **RETAIN gold GĐ1** (**O6**) |
| Warnings | warnings[] LIVE | **RETAIN cite** + AC (**O8**) |
| Closed lock | 409 LOCKED | **RETAIN cite** |
| GET / close / sign | Peers PRESENT | **peer RETAIN** · **OUT invent = ATT-10 DONE** (**O11**) |
| Paper `/att` + `/core` | Nest `/core` ABSENT | **Alias only** (**O9**) |
| ATT-09/08/02/PLT/CORE | SEALED stamps | **must_keep RETAIN** (**O10**) |
| ATT-11 / PAY | QUEUED | **OUT invent DONE** (**O11**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-10-FUNNEL** (+ footer groups)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-FUNNEL` |
| **Scope** | **IN-SCOPE residual** — map SRS phễu ↔ LIVE cols · footer PRESENT/ABSENT/OUT |
| **OUT of residual** | Claim AGG alone = FR-10 DONE · Nest `/core` dual · invent second ledger |
| **Rationale** | FR Diễn biến #2 · BR-BP-TS-01 · F-ATT-SHEET-01 · SA O3 |
| **Footer groups (normative)** | |
| · Công chuẩn | **PRESENT** (`standard_hours`) · interim default-8 OK (**O4**) |
| · Công thực tế / punch | **PRESENT** (via present records → standard/work_days) |
| · Công phép paid | **PRESENT** (`paid_leave_hours`) |
| · Trừ không lương | **PRESENT** (`unpaid_leave_hours` · **excluded** from payable) |
| · OT × hệ số | **PRESENT** (`ot_hours_weighted`) |
| · Phạt muộn/sớm | **PRESENT** (`late_penalty_hours` · **display** · not subtracted GĐ1) |
| · Giờ công tính lương | **PRESENT** (`payable_hours` = gold O6) |
| · Công lễ dedicated | **ABSENT / OUT GĐ1** (no `holiday_hours` writer) |
| · Ăn ca | **ABSENT / OUT GĐ1** (`meal_shift_hours` NULL · writer ABSENT) |
| **ba-data** | **HOLD default** — ADD only if closable HOL/MEAL/PAYABLE−penalty |
| **DENY** | Nest `/core` · invent dual AGG · claim missing HOL/MEAL = ATT-10 FAIL without footer OUT |

### 1.2 Disposition **R-ATT-10-STD**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-STD` |
| **Scope** | **IN-SCOPE residual** — GĐ1 default-8 interim · shift/calendar wire closable later |
| **OUT** | Claim default-8 alone = STD/FR-10 DONE |
| **Rationale** | SRS «Rule ca + lịch» · SA O4 |
| **ba-data** | **HOLD** — no new col required for interim |
| **DENY** | Claim STD DONE if only default-8 |

### 1.3 Disposition **R-ATT-10-LEAVE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-LEAVE` |
| **Scope** | **IN-SCOPE residual** — day-record leave → paid/unpaid buckets · cite ATT-09 upstream |
| **OUT** | Invent leave HTTP in PAY · invent `att_leave_hold` · claim ATT-09 DONE |
| **Rationale** | FR phễu phép · SA O5 · must_keep ATT09QC1-MSLUTL9D |
| **ba-data** | **HOLD** — LIVE leave via records RETAIN |
| **DENY** | PAY leave/OT HTTP · wipe ATT-09 hold |

### 1.4 Disposition **R-ATT-10-HOL**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-HOL` |
| **Scope** | **OUT GĐ1 explicit** dedicated holiday hours writer · footer ABSENT |
| **OUT invent DONE** | Claim holiday bucket DONE · invent `holiday_hours` without ba-data ADD |
| **Rationale** | SA residual · ATT-03b cite · no LIVE writer |
| **ba-data** | **HOLD default** — **ADD residual ONLY** if proves closable `holiday_hours` (or equivalent) col/writer needed for GĐ1 |
| **DENY** | Silent invent holiday ledger · claim HOL missing = ATT-10 module FAIL when footer OUT |

### 1.5 Disposition **R-ATT-10-MEAL**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-MEAL` |
| **Scope** | **OUT GĐ1 explicit** — col may exist NULL · writer ABSENT |
| **OUT invent DONE** | Claim meal DONE · invent writer without ba-data ADD |
| **Rationale** | SA residual · optional policy |
| **ba-data** | **HOLD default** — **ADD ONLY** if closable meal writer required |
| **DENY** | Force meal into payable GĐ1 without policy |

### 1.6 Disposition **R-ATT-10-PAYABLE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-PAYABLE` |
| **Scope** | **IN-SCOPE residual** — gold GĐ1 = `standard + paidLeave + otWeighted` · penalty display-only · unpaid excluded |
| **OUT** | −`late_penalty_hours` into payable GĐ1 (**OUT** unless ba-data ADD closable) · invent PAY DONE |
| **Rationale** | BR-BP-TS-01 · LIVE AS-IS · SA O6 |
| **Gold AC** | After AGG: `payable_hours === standard_hours + paid_leave_hours + ot_hours_weighted` (±0.01) · unpaid not added · penalty not subtracted |
| **ba-data** | **HOLD default** — ADD only if closable formula change (−penalty) proven |
| **DENY** | Invent PAY formula on FE · claim PAY DONE |

### 1.7 Disposition **R-ATT-10-OT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-OT` |
| **Scope** | **IN-SCOPE residual** — only weighted OT in payable · FAIL raw |
| **OUT** | Claim OT alone = ATT-10 DONE · invent PAY re-multiply |
| **Rationale** | BR-BP-TS-01 · FR đặc biệt · SA O7 |
| **ba-data** | **HOLD** — LIVE coefficient path RETAIN |
| **DENY** | PAY nhân lại hệ số · Nest `/core` OT dual |

### 1.8 Disposition **R-ATT-10-WARN**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-WARN` |
| **Scope** | **IN-SCOPE residual** — warnings[] on missing/invalid · ATT-10 = warn AC |
| **OUT** | Block-chốt as ATT-10 DONE · invent ATT-11 DONE |
| **Rationale** | FR đặc biệt thiếu punch · SA O8 |
| **ba-data** | **HOLD** |
| **DENY** | Claim warn alone = ATT module UAT |

### 1.9 Disposition **R-ATT-10-DISP**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-DISP` |
| **Scope** | **IN-SCOPE residual** — display-ready DTO + FE rà soát trước submit · F5 |
| **OUT** | Claim FE wire alone = ATT-10 DONE · invent PAY UI |
| **Rationale** | Diễn biến #3 · SA O2/O12 · U65 |
| **ba-data** | **HOLD** |
| **DENY** | Seed lines for U65 · Nest `/core` |

### 1.10 Disposition **R-ATT-10-≠-DONE** / **R-ATT-10-PAY-OUT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-10-≠-DONE` · `R-ATT-10-PAY-OUT` |
| **Scope** | Explicit ≠ ATT-10 DONE · ≠ ATT-11/PAY · ≠ ATT UAT · printable false · C-SLICE |
| **DENY** | Honesty flip · invent PAY/printable/Word · claim AGG=DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-10 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE

---

## 2. Use-case catalog & AC matrix

### 2.1 Happy / alternate / exception

| Path | Steps | Pass |
|------|-------|------|
| **Happy** | #1 Chọn kỳ → #2 POST aggregate → lines UPSERT · gold payable · OT weighted · leave buckets · #3 rà soát display → submit (calls AGG) → F5 | AC-ATT-10-LOAD/AGG/FUNNEL/PAYABLE/OT/SUBMIT/F5/DISP |
| **Alt — re-AGG idempotent** | Aggregate again same sheet → UQ `(header_id,employee_id)` stable · Nest `/core` 0 | AC-ATT-10-IDEM |
| **Alt — submit path** | Submit without prior manual AGG → AGG still runs · lines PRESENT | AC-ATT-10-SUBMIT |
| **Exc — closed lock** | Aggregate/submit on closed → **409** `HRM-ATT-SHEET-LOCKED` | AC-ATT-10-LOCKED |
| **Exc — raw OT** | OT without coefficient path attempting payable as raw → **FAIL** into giờ công tính lương | AC-ATT-10-FAIL-RAW-OT |
| **Exc — warnings** | Missing punch / empty enroll → `warnings[]` codes · HCNS sees warn · ≠ invent ATT-11 block DONE | AC-ATT-10-WARN |
| **Exc — scope** | Wrong companyId → `HRM-SCOPE-409` | AC-ATT-10-SCOPE |
| **Exc — Nest dual** | Any SoT on Nest `/core` AGG = **FAIL** | AC-ATT-10-PATH |

### 2.2 AC pack (measurable)

| AC-ID | Criterion | Pass / Fail evidence | Maps |
|-------|-----------|----------------------|------|
| **AC-ATT-10-LOAD** | HCNS mở tổng hợp kỳ trong quyền · khung sheet hiện | Browser URL + sheet id · U65 | Diễn biến #1 · O1 |
| **AC-ATT-10-AGG** | `POST …/aggregate` 2xx → UPSERT lines · `line_count`≥0 | Network physical `/attendance/…/aggregate` · Nest `/core` 0 | O1 · F-ATT-SHEET-01 |
| **AC-ATT-10-≠-AGG-DONE** | Evidence footer **≠ ATT-10 DONE** from AGG alone | Footer present · C-SLICE | O1/O12 |
| **AC-ATT-10-SUBMIT** | `POST …/submit` 2xx **must** invoke AGG · lines PRESENT after | Network + FE lines · F5 | O2 |
| **AC-ATT-10-FUNNEL** | Lines expose SoT groups PRESENT per footer §1.1 | Response/DTO bind | O3 |
| **AC-ATT-10-FOOTER** | HOL/MEAL marked **OUT GĐ1** · not silent invent | Spec + evidence footer | O3 · R-HOL/MEAL |
| **AC-ATT-10-STD** | `standard_hours` written (interim default-8 OK) | Line field | O4 |
| **AC-ATT-10-≠-STD-DONE** | Interim default-8 **≠** claim STD FR DONE | Footer | O4 |
| **AC-ATT-10-LEAVE** | Paid/unpaid leave hours from day-record path · unpaid ∉ payable | Line fields + gold | O5 |
| **AC-ATT-10-MK-ATT09** | ATT-09 hold/settle RETAIN · held=`pending_days` · DENY `att_leave_hold` | Stamp `ATT09QC1-MSLUTL9D` | O5/O10 |
| **AC-ATT-10-PAYABLE** | `payable_hours = standard + paidLeave + otWeighted` (±0.01) | Gold assert | O6 |
| **AC-ATT-10-GOLD** | `late_penalty_hours` present for display · **not** subtracted GĐ1 | Numeric | O6 |
| **AC-ATT-10-OT** | `ot_hours_weighted` uses coefficient (default 1.5) | Numeric / approved OT | O7 |
| **AC-ATT-10-FAIL-RAW-OT** | Raw OT into payable = **FAIL** | Neg case | O7 |
| **AC-ATT-10-WARN** | Missing/invalid → `warnings[]` codes LIVE | Response warnings | O8 |
| **AC-ATT-10-≠-11** | Close/sign/WF **≠** ATT-10 DONE · OUT invent | Footer | O8/O11 |
| **AC-ATT-10-LOCKED** | Closed sheet mutate → 409 LOCKED | Network | RETAIN |
| **AC-ATT-10-SCOPE** | Scope mismatch → 409 | Network U19 | U19 |
| **AC-ATT-10-PATH** | Physical `/attendance/attendance-sheets*` · Nest `/core` SoT = FAIL | DevTools | O9 |
| **AC-ATT-10-IDEM** | Re-AGG same sheet idempotent UQ | Line ids stable | O1 |
| **AC-ATT-10-DISP** | Display-ready fields bind FE rà soát | UI after 2xx | O12 · R-DISP |
| **AC-ATT-10-F5** | F5 / navigate lại → lines + status còn | Browser | O2/O12 · U65 |
| **AC-ATT-10-MK-ATT08** | ATT-08 preview seal RETAIN · ≠ wipe · ≠ ATT-08=ATT-09 DONE | Stamp `ATT08QC1-MSLSL36C` | O10 |
| **AC-ATT-10-MK-ATT02** | ATT-02 CFG≠DONE RETAIN · late_penalty peer | Stamp `ATT02QC1-MSLQZUK7` | O10 |
| **AC-ATT-10-MK-PLT** | PLT peer≠DONE · merge≠UAT | Stamp `PLT01QC1-MSLPUQIU` | O10 |
| **AC-ATT-10-MK-CORE10** | CORE-10 ≠DONE · PAY-06 OUT | Stamp `CORE10QC1-MSLP0EJB` | O10 |
| **AC-ATT-10-MK-CORE09** | printable **false** · ≠ CORE-09 DONE | Stamp `CORE09QC1-MSLNBA89` | O10 |
| **AC-ATT-10-MK-CORE07** | GATE 409 · ACT-400 · Nest DENY · ≠ CORE-07 DONE | Stamp `CORE07QC1-KZJTSHNT` | O10 |
| **AC-ATT-10-≠-09-DONE** | soft/ATT-08 ≠ ATT-09 DONE | Footer | O10 |
| **AC-ATT-10-≠-CFG02** | CFG ≠ ATT-02 DONE | Footer | O10 |
| **AC-ATT-10-PAY-OUT** | PAY / printable / Word invent DONE = FAIL | Footer | O11 |
| **AC-ATT-10-≠-UAT** | ATT module UAT / ready flip = FAIL | Footer | O12 |
| **AC-ATT-10-H** | Honesty false · C-SLICE · DENY `att_leave_hold` · no seed · no apps | Spec + evidence | O12 |
| **AC-ATT-10-≠-DUAL-HOLD** | Invent `att_leave_hold` = FAIL | Grep / schema | O10/O12 |

### 2.3 Business rule table

| Condition | Action | Outcome |
|-----------|--------|---------|
| Sheet open + AGG | UPSERT lines | Lines materialize · warnings maybe |
| Submit | Must call AGG | Status → submitted peer · lines PRESENT |
| OT approved | × coefficient (default 1.5) | `ot_hours_weighted` · in payable |
| OT raw / unweighted | Reject into payable | FAIL AC-ATT-10-FAIL-RAW-OT |
| Leave day records | paid / unpaid buckets | unpaid ∉ payable |
| Late/early approved | Write `late_penalty_hours` | Display · **not** −payable GĐ1 |
| HOL / MEAL | No dedicated writer GĐ1 | Footer OUT · HOLD ba-data |
| Sheet closed | Mutate AGG/submit | 409 LOCKED |
| Nest `/core` SoT | Any non-404 primary | FAIL PATH |
| Claim AGG = ATT-10 DONE | — | FAIL ≠-AGG-DONE |
| Claim ATT-11/PAY DONE | — | FAIL PAY-OUT / ≠-11 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-10 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE

---

## 3. Activity / decision (branch)

```text
HCNS chọn kỳ (scope OK)
  → POST aggregate (physical /attendance/…/aggregate)
       → Nest /core SoT? → FAIL PATH
       → Closed? → 409 LOCKED
       → UPSERT att_timesheet_line
            · standard (interim 8 OK) · OT×coef · paid/unpaid leave
            · payable = std+paid+otW · late_penalty display
            · HOL/MEAL footer OUT GĐ1
            · warnings[] if thiếu
  → FE rà soát display-ready lines
  → POST submit → MUST AGG again → status submitted peer
       · ≠ invent ATT-11 close DONE
  → F5 → lines còn · Nest /core 0
  → Footer: ≠ ATT-10 DONE
       · AGG alone ≠ FR-10 DONE
       · ≠ ATT-11/PAY DONE
       · ≠ soft/ATT-08=ATT-09 DONE
       · ≠ ATT module UAT · attendance_uat_ready=false
       · CFG≠ATT-02 DONE · must_keep ATT02QC1-MSLQZUK7
       · must_keep ATT09QC1-MSLUTL9D (pending_days · DENY att_leave_hold)
       · must_keep ATT08QC1-MSLSL36C (preview · T6→T2=2 · HOL-MISS · ALIGN)
       · peer≠PLT DONE · merge≠platform UAT
       · printable false RETAIN
       · PAY OUT invent DONE
       · must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed sheet/lines · DB fake · PASS chỉ curl · Nest `/core` dual · invent `att_leave_hold` · wipe ATT-09/08/02/PLT/CORE · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · invent PAY/printable/Word · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-ATT-10-01** | Chọn kỳ → AGG → lines SoT PRESENT · Nest `/core` 0 · no seed · ≠ AGG=DONE | AC-ATT-10-LOAD/AGG/FUNNEL/PATH/≠-AGG-DONE · O1/O3/O9 |
| **VAL-ATT-10-02** | Submit → AGG invoked · lines · F5 · Nest `/core` 0 | AC-ATT-10-SUBMIT/F5 · O2 |
| **VAL-ATT-10-03** | OT weighted in payable · FAIL raw · Nest `/core` 0 | AC-ATT-10-OT/FAIL-RAW-OT · O7 |
| **VAL-ATT-10-04** | Payable gold · unpaid∉ · penalty display-only · Nest `/core` 0 | AC-ATT-10-PAYABLE/GOLD/LEAVE · O5/O6 |
| **VAL-ATT-10-05** | Warnings · closed 409 · Nest `/core` 0 · ≠ ATT-11 DONE | AC-ATT-10-WARN/LOCKED/≠-11 · O8/O11 |
| **VAL-ATT-10-06** | F5 + seals · ≠DONE · printable false · PAY OUT · ATT-09/08/02/PLT/CORE RETAIN · DENY att_leave_hold · honesty | AC-ATT-10-F5/≠-*/H/MK-* · O10/O11/O12 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-10 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE

---

## 4. Journeys DRAFT (O12)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-ATT-10-01** | **agg** | **Chọn kỳ → AGG → lines SoT** | Login → Bảng công → chọn kỳ → Chạy gộp / aggregate · lines đủ nhóm PRESENT · Nest `/core` 0 · no seed · ≠ AGG alone DONE · HOL/MEAL footer OUT | AC-ATT-10-LOAD/AGG/FUNNEL/FOOTER/PATH/≠-AGG-DONE · O1/O3/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-10-02** | **submit** | **Submit → AGG → F5** | After AGG (or direct) → Gửi chờ ký · submit must AGG · lines còn · F5 · Nest `/core` 0 · ≠ ATT-11 DONE | AC-ATT-10-SUBMIT/F5/≠-11 · O2/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-10-03** | **ot** | **OT × hệ số · FAIL raw** | Kỳ có OT duyệt ×coef → `ot_hours_weighted` in payable · raw OT FAIL · Nest `/core` 0 · PAY không nhân lại | AC-ATT-10-OT/FAIL-RAW-OT · O7 · U65 · **DRAFT** |
| **J-HRM-ATT-10-04** | **payable** | **Gold payable · leave · penalty display** | Lines: payable=std+paid+otW · unpaid∉ · late_penalty hiện · không trừ GĐ1 · Nest `/core` 0 · cite ATT-09 upstream · DENY att_leave_hold | AC-ATT-10-PAYABLE/GOLD/LEAVE/MK-ATT09 · O5/O6 · U65 · **DRAFT** |
| **J-HRM-ATT-10-05** | **warn/lock** | **Warnings + closed 409** | Thiếu punch → warnings[] · closed sheet AGG/submit → 409 LOCKED · Nest `/core` 0 · ≠ invent ATT-11 block DONE | AC-ATT-10-WARN/LOCKED/≠-11 · O8 · U65 · **DRAFT** |
| **J-HRM-ATT-10-06** | **cross** | **F5 + seals · ≠DONE** | F5 còn lines/status · Nest `/core` 0 · ≠ ATT-10 DONE · AGG≠FR-10 · ≠ ATT-11/PAY · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 DONE · no reopen J-ATT-09/ATT-08/ATT-02/PLT/CORE-10/09/07/06/05/03/02B/09D..01 · ≠ invent PAY/Word | AC-ATT-10-F5/≠-*/H/MK-* · O10/O11/O12 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `attendance_uat_ready` · **≠** `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim AGG alone = ATT-10 DONE · **≠** claim ATT-11/PAY DONE · **≠** claim soft/ATT-08 = ATT-09 DONE · **≠** claim ATT module UAT · **≠** claim CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · **≠** invent PAY DONE · **≠** invent `att_leave_hold` · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-ATT-09-01..06** / `ATT09QC1-MSLUTL9D` / `ATT09QA2-MSLUKI9U` | must_keep hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · **≠** wipe |
| **J-HRM-ATT-08-01..06** / `ATT08QC1-MSLSL36C` / `ATT08QA1-MSLSGUJF` | must_keep preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ≠ ATT UAT · Nest `/core` leave 0 · **≠** claim ATT-08 = ATT-09 DONE · **≠** wipe |
| **J-HRM-ATT-02-01..06** / `ATT02QC1-MSLQZUK7` / `ATT02QA1-MSLQWDN3` | must_keep CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 · **≠** claim ATT-02 DONE |
| **J-HRM-PLT-01-01..06** / `PLT01QC1-MSLPUQIU` / `PLT01QA1-MSLPQZF6` | must_keep peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| **J-HRM-CORE-10-01..06** / `CORE10QC1-MSLP0EJB` | must_keep SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **≠** claim CORE-10 DONE |
| **J-HRM-CORE-09-01..06** / `CORE09QC1-MSLNBA89` | must_keep fill+registry · printable **false** · 09a–d≠DONE · Word OUT · **≠** claim CORE-09 DONE |
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE |
| **J-HRM-CORE-06-*** / soft≠DONE | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05/03/02B/09D..01** | must_keep peer stamps · **≠** printable / closed-8 DONE |
| LIVE AGG + `att_timesheet_line` | **RETAIN cite** · **≠** ATT-10 DONE from AGG alone · ATT-11/PAY **OUT invent DONE** · **DENY** invent `att_leave_hold` |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-10 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE

---

## 5. Honesty & must_keep

| Item | Rule |
|------|------|
| `attendance_uat_ready` | **false** · **DENY** flip |
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim LIVE AGG alone = ATT-10 / FR-10 DONE | **DENIED** (O1/O12) |
| Claim ATT-11 close/sign = ATT-10 DONE | **DENIED** (O8/O11) |
| Claim soft / ATT-08 = ATT-09 DONE | **DENIED** (O10) |
| Claim ATT module UAT | **DENIED** (O12) · C-SLICE |
| Claim CFG = ATT-02 DONE | **DENIED** (O10) · CFG≠DONE **RETAIN** |
| Claim PLT-01 / platform UAT DONE | **DENIED** · peer≠PLT · merge≠UAT |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | **DENIED** (O10) |
| Claim CORE-09 DONE / printable flip / Word invent | **DENIED** |
| Claim CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE | **DENIED** · **OUT invent** |
| Claim printable / closed-8 DONE | **DENIED** |
| Invent `att_leave_hold` dual | **DENIED** (O10/O12) |
| Nest `/core` dual | **DENIED** |
| Wipe ATT-09/08/02/PLT/CORE-10/09/07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module ATT/PLT/CORE/PAY/personnel UAT ≠ Phase1 |
| must_keep W27 | ATT-09 `ATT09QC1-MSLUTL9D` · hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| must_keep W26 | ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ≠ ATT UAT |
| must_keep W25 | ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 |
| must_keep W24 | PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| must_keep W23 | CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| must_keep W20..W10 | soft≠CORE-06 DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (ADD residual only if closable gap for HOL/MEAL/PAYABLE−penalty on LIVE spine) · then **sa API** F.1 F-ATT-SHEET-01/AGG physical `/attendance/attendance-sheets*` |
| **ba-data** | **HOLD** (default) — LIVE `att_timesheet_line` cols RETAIN · HOL/MEAL **OUT GĐ1** · payable gold LIVE · **DENY** invent `holiday_hours` / meal writer / −penalty without closable proof · **DENY** invent `att_leave_hold` · reopen **ADD/REQUIRED** only if DATA proves closable HOL/MEAL/PAYABLE formula gap |
| **sa API-01** | After HOLD stamp — F.1 deepen F-ATT-SHEET-01/AGG · RETAIN submit→AGG · paper `/att`+`/core` alias only · **DENY** Nest dual · **DENY** invent `att_leave_hold` · **DENY** invent PAY · **DENY** claim AGG=ATT-10 DONE · **DENY** invent ATT-11 DONE |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** wipe ATT-09/08/02/PLT/CORE · **DENY** invent PAY/printable/Word · **DENY** claim AGG = ATT-10 DONE · **DENY** claim ATT UAT |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-28 seat #30)
uc_ids: UC-BP-ATT-10 · FR-UC-BP-ATT-10
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md · SA Option A · R-ATT-10-FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP · R-ATT-10-≠-DONE · R-ATT-10-PAY-OUT · printable false · ATT09QC1-MSLUTL9D hold/settle RETAIN (pending_days · DENY att_leave_hold · Nest /core leave 0 · ≠ soft/ATT-08=ATT-09 DONE) · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU peer≠PLT · merge≠UAT · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY OUT
spec_ref: F-ATT-SHEET-01 / AGG physical prefer POST /api/hrm/attendance/attendance-sheets/{id}/aggregate · submit must AGG · paper /att + /core alias only · LIVE att_timesheet_line (standard_hours · ot_hours_weighted · paid_leave_hours · unpaid_leave_hours · payable_hours · late_penalty_hours · meal_shift_hours NULL · work_days) · BR-BP-TS-01 · gold payable = standard+paidLeave+otWeighted · HOL/MEAL OUT GĐ1 · ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — LIVE attendance_sheets + att_timesheet_line RETAIN = phễu SoT — DENY invent second hour ledger · DENY invent att_leave_hold dual
2) CONFIRM HOLD — LIVE AGG writer cols (standard · OT weighted · paid/unpaid leave · payable · late_penalty · work_days · warnings) RETAIN — ≠ FR-10 DONE from AGG alone
3) CONFIRM HOLD — payable gold GĐ1 = standard_hours + paid_leave_hours + ot_hours_weighted · late_penalty display-only · unpaid excluded · −penalty into payable = OUT GĐ1 unless closable ADD proven
4) HOLD default on HOL/MEAL — ADD residual ONLY if proves closable holiday_hours (or equiv) writer OR meal_shift_hours writer needed for GĐ1 (prefer footer OUT GĐ1 — DENY Nest /core · DENY invent silent cols)
5) Cite display-ready DTO: sheet_id · status · statusLabelVi · line_count · warnings[] · lines[{ employee_id, standard_hours, ot_hours_weighted, paid_leave_hours, unpaid_leave_hours, late_penalty_hours, meal_shift_hours?, payable_hours, work_days, line_locked }]
6) RETAIN ATT-09 ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold · ATT-08 ATT08QC1-MSLSL36C preview · ATT-02 ATT02QC1-MSLQZUK7 CFG≠DONE · PLT-01 PLT01QC1-MSLPUQIU · CORE-10 CORE10QC1-MSLP0EJB · CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY · soft≠CORE-06 DONE
7) DENY wipe ATT-09/08/02/PLT/CORE · invent att_leave_hold dual · invent PAY/printable/Word DONE · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-HRM-ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · apps/**
8) Unlock next: sa API F.1 F-ATT-SHEET-01/AGG physical /attendance/attendance-sheets* — paper /att + /core alias only — residual wire ONLY after DATA stamp — ATT-11/PAY remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (F.1 · wire-only after HOLD/ADD)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · wipe ATT-09/08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word DONE · claim AGG=ATT-10 DONE · invent ATT-11 DONE
```

---

## 7. completion_report

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-ATT-10 / FR-UC-BP-ATT-10: map BR-BP-TS-01 aggregate funnel to LIVE Nest `POST …/attendance-sheets/:id/aggregate` + submit→AGG + `att_timesheet_line` (standard · OT×coef · paid/unpaid leave · payable gold = std+paid+otW · late_penalty display · unpaid∉ · HOL/MEAL **OUT GĐ1**) + warnings + closed 409; residuals R-ATT-10-FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP; paper F-ATT-SHEET-01 + `/att`+`/core` alias only; **must_keep** ATT-09 hold/settle (`ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold`) · ATT-08 preview (`ATT08QC1-MSLSL36C`) · ATT-02/PLT/CORE; minted **J-HRM-ATT-10-01..06 DRAFT** (U65 narrow · ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · C-SLICE · PAY OUT); ba-data **HOLD default** (ADD only HOL/MEAL/PAYABLE closable); DENY Nest `/core` dual · invent `att_leave_hold` · invent PAY/printable/Word · honesty flip · seed · apps/**; honesty footer **false**. |
| **next_owner** | `ba-data` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · 2026-08-09*
