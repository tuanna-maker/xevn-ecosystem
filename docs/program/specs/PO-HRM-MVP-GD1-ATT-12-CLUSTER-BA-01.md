# BA AC pack — Wave-36 ATT cluster · UC-BP-ATT-12 (Mở quỹ phép & ca mặc định khi Hoạt động · RETAIN CORE-07 emit + ATT-04/01 peers · GAP activate consumer)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-36 seat **#41**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O16 **CONFIRMED** · **ba-data HOLD default** next · dev-be/dev-fe **HOLD** until DATA stamp · **DENY** claim `employee.activated` emit alone = FR-12 DONE · **DENY** manual tracked-entitlement alone = auto-enroll DONE · **DENY** ATT-12 / ATT-07/06/05/05b/04 / ATT UAT DONE · **printable false RETAIN** · **PAY OUT** |
| **change_mode** | **ADD** (align SA-12 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`ATT07QC1-MSM9GWC1`** / peer seals · **DENY reopen J-HRM-ATT-07-*** / **J-HRM-ATT-06-04** without regression) |
| **uc_ids** | `UC-BP-ATT-12` · `FR-UC-BP-ATT-12` · **BR-BP-LC-03** · peer **FR-UC-BP-CORE-07** · **R-CORE-07-ATT-12** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-07 **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** (**pending_days · DENY `att_leave_hold`**) · **`CORE07QC1-KZJTSHNT`** · **`CORE07QA1-MSLJSPGO`** · **R-ATT-01-ASSIGN open** · **R-ATT-04-ENGINE HOLD** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-12** · Diễn biến **#1 · #2** · Luồng chính **1–4** · **BR-BP-LC-03** · đặc biệt «Hoạt động cuối tháng» → nửa tháng phép |
| **ref_api_paper** | **F-CORE-ACT-01** · **R-CORE-07-ATT-12** event · **F-ATT-LVRULE EFF** · **F-ATT-LEAVE-BAL grant** *(GAP enroll-on-activate)* · **PUT tracked-entitlement** (manual parallel) · **F-ATT-CAT-SHIFT EFF** · **F-ATT-SHIFT-02** *(GAP default bind)* · **F-ATT-LEAVE-04 accrue** *(HOLD)* |
| **ref_db** | `employee_leave_balances` · `att_leave_accrual_policy` · `work_shifts` · paper `att_shift_assignment` · **DENY** physical `att_leave_hold` |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md` (**ATT07QC1** must_keep · J-07 + J-06-04 non-regression) |
| **Honesty** | `attendance_uat_ready=false` · **`contracts_printable_ready=false` RETAIN** · **C-SLICE-≠-MODULE** · **DENY** emit alone = FR-12 DONE · **DENY** ATT-12 / ATT-07/06/05/05b/04 / ATT UAT DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` · merge sick/compensatory/carry→annual · grant logic in `employees.service` beyond emit · reopen **J-HRM-ATT-07-01..07** / **J-HRM-ATT-06-04** without regression · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-36 seat **#41** — **gap-only RETAIN** LIVE **CORE-07** activate + **`employee.activated`** emit (**R-CORE-07-ATT-12** · **emit-only ≠ FR-12 DONE**) · **ATT-04** `leave-accrual-policies/effective` + `employee_leave_balances` + **PUT tracked-entitlement** (HR manual parallel · **≠** auto consumer DONE) · **ATT-01** `work-shifts/effective` + ATT-02 rule peer — **GAP** idempotent **activate consumer**, **LVRULE-driven grant**, **half-month pro-rata**, **default shift bind** (narrow **R-ATT-01-ASSIGN**), **HCNS confirm strip**, **idempotency on re-activate**:

1. **CORE emit** = RETAIN cite — **≠** ATT-12 DONE alone (**O1**).
2. **Consumer + grant + shift** = GAP SRS Diễn biến **#1–#2** (**O2–O7, O10**).
3. **Manual HR grant** = RETAIN parallel path (**O5**).
4. **ATT-09 enroll ≠ submit hold** — **DENY `att_leave_hold`** (**O11**).
5. **ATT-07/06/05 peers** = **must_keep** — **DENY merge buckets** · **DENY reopen J-07 / J-06-04** (**O12**).
6. **Honesty + J-*** = mint **`J-HRM-ATT-12-01..07` DRAFT** + regression **J-HRM-ATT-06-04** + subset **J-HRM-ATT-07-03..05** (**O16**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS | Kích hoạt Hoạt động (CORE-07) · rà soát strip quỹ/ca trên hồ sơ (GAP FE) · override grant tay qua tracked-entitlement khi cần |
| Hệ thống | Nhận `employee.activated` · (GAP) cấp quỹ theo LVRULE · (GAP) gán ca mặc định · idempotent replay |
| CORE-07 | Phát tín hiệu activate — **OUT** grant/shift trên CORE seat |
| ATT-04 / ATT-01 / ATT-09 / ATT-07 | Peers **must_keep** — **≠** claim DONE from 12 seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O16 CONFIRM · AC-ATT-12-* · residuals **R-ATT-12-*** | Impl `apps/**` / migration / seed |
| RETAIN cite emit + LVRULE + ledger + shift catalog + manual grant | Nest `/core` enroll SoT · invent `att_leave_hold` |
| GAP AC consumer/grant/half-month/shift/FE/idempotent | PAY DONE · ATT module UAT flip |
| Unlock **ba-data HOLD** default | Claim emit or manual grant alone = FR-12 DONE |
| J-07 + J-06-04 regression attach | Reopen J-HRM-ATT-07-* without bus stamp |

### SA Option A — BA CONFIRM (đóng O1–O16)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | CORE emit | **YES RETAIN** — `POST …/employees/:id/activate` (or gated PATCH) · response `events[]` contains readable **`employee.activated`** (`employee_id` · `company_id` · `effective_date` `dd/MM/yyyy`) · **AC-ATT-12-CORE-EMIT** · **AC-ATT-12-≠-EMIT-DONE** · **≠** FR-12 / ATT-12 DONE alone |
| **O2** | Consumer wiring | **YES GAP** — **R-ATT-12-CONSUMER** idempotent handler in attendance lane (in-proc or queue) subscribed to activate signal — **AC-ATT-12-CONSUMER** |
| **O3** | LVRULE source | **YES RETAIN** — grant reads **`GET …/leave-accrual-policies/effective`** per `leave_type_key` · no ad-hoc amounts bypass policy — **AC-ATT-12-LVRULE-EFF** |
| **O4** | Ledger write | **YES RETAIN** — upsert **`employee_leave_balances`** same columns as tracked-entitlement / ATT-04 grant · **DENY** `att_leave_hold` — **AC-ATT-12-LEDGER** · **AC-ATT-12-MK-ATT09** |
| **O5** | Manual grant path | **YES RETAIN** — **`PUT …/leave-balance/tracked-entitlement`** remains HR parallel override · **AC-ATT-12-MANUAL-GRANT** · **AC-ATT-12-≠-MANUAL-AUTO-DONE** |
| **O6** | Half-month | **YES GAP** — **R-ATT-12-HALF-MONTH** when `effective_date` is end-of-calendar-month (vi-VN) per SRS đặc biệt + CORE-07 peer — **AC-ATT-12-HALF-MONTH** |
| **O7** | Default shift | **YES GAP** — **R-ATT-12-SHIFT-DEFAULT** resolve dept/OU + ATT-02 rule → `work_shift_id` · persist narrow assignment (**R-ATT-01-ASSIGN** slice) — **AC-ATT-12-SHIFT-DEFAULT** |
| **O8** | ATT-02 peer | **YES RETAIN cite** — read `attendance/rules*` specificity only · **CFG≠ATT-02 DONE** — **AC-ATT-12-MK-ATT02** |
| **O9** | HCNS confirm UI | **YES GAP** — **R-ATT-12-FE-CONFIRM** employee profile strip display-ready (read-only OK GĐ1) · F5 shows grant + shift summary — **AC-ATT-12-FE-CONFIRM** |
| **O10** | Idempotency | **YES GAP** — **R-ATT-12-IDEMPOTENT** duplicate activate / replay event → no double grant/shift — **AC-ATT-12-IDEMPOTENT** |
| **O11** | ATT-09 peer | **YES must_keep** — **`ATT09QC1-MSLUTL9D`** · enroll **≠** submit `pending_days` hold · **DENY** `att_leave_hold` — **AC-ATT-12-MK-ATT09** |
| **O12** | ATT-07/06/05 peers | **YES must_keep** — **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **DENY merge** sick/compensatory/carry→annual · **DENY reopen J-HRM-ATT-07-01..07** / **J-HRM-ATT-06-04** without regression evidence — **AC-ATT-12-MK-ATT07** · **AC-ATT-12-≠-REOPEN-J07-J06** |
| **O13** | ATT-04 engine | **YES HOLD** — **R-ATT-04-ENGINE** periodic **F-ATT-LEAVE-04** accrue **≠** ATT-12 slice DONE — **AC-ATT-12-ENGINE-HOLD** |
| **O14** | CORE-07 peer | **YES must_keep** — **`CORE07QC1-KZJTSHNT`** · activate GATE 409 unchanged · grant/shift **DENY** on CORE service beyond emit — **AC-ATT-12-MK-CORE07** |
| **O15** | Paper `/core` | **YES** — `/att` + `/core` alias only · Network SoT `/api/hrm/employees/*` + `/api/hrm/attendance/*` — **AC-ATT-12-PATH** |
| **O16** | Honesty / journeys | **YES false** — mint **`J-HRM-ATT-12-01..07` DRAFT** · U65 FE-after-2xx+F5 · attach **J-HRM-ATT-06-04** + subset **J-HRM-ATT-07-03..05** sick non-regression · C-SLICE · **≠ ATT-12 / FR-12 DONE** · **≠ ATT-07/06/05/05b/04 DONE** · **≠ ATT UAT** — **AC-ATT-12-H** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Activate (RETAIN) | **`POST …/employees/:id/activate`** or gated **`PATCH …/employees/:id`** | F-CORE-ACT-01 | Peer CORE-07 · input #1 |
| Emit (RETAIN) | `employee.activated` in 2xx envelope | R-CORE-07-ATT-12 | **#1** |
| LVRULE read (RETAIN) | **`GET …/leave-accrual-policies/effective`** | F-ATT-LVRULE EFF | Tiên quyết #2 |
| Auto grant (GAP) | internal / proposed **`POST …/leave-balance/enroll-on-activate`** | F-ATT-LEAVE-BAL grant | **#2** quỹ |
| Manual grant (RETAIN) | **`PUT …/leave-balance/tracked-entitlement`** | F-ATT-LEAVE-BAL manual | Alternate HR |
| Balances read (RETAIN) | **`GET …/leave-balance`** / **`panel`** | F-ATT-LEAVE-BAL read | Luồng **#4** |
| Shift catalog (RETAIN) | **`GET …/work-shifts/effective`** | F-ATT-CAT-SHIFT EFF | Tiên quyết ca |
| Default assign (GAP) | proposed **`PUT …/shift-assignments`** | F-ATT-SHIFT-02 | **#2** ca |
| Rule peer (RETAIN) | **`GET/PATCH …/attendance/rules*`** | F-ATT-RULE-01 | Resolve default |
| Periodic accrue (HOLD) | `POST …/leave-balances/accrue` | F-ATT-LEAVE-04 | OUT of slice |
| Leave submit (peer regression) | **`POST …/leave-requests`** | F-ATT-LEAVE-02 | Post-enroll peer |

**Invariant ATT-12-PATH:** Activate Network **MUST** hit `/employees/` · grant/shift consumer **MUST** hit `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` SoT = **FAIL**.

**Invariant ATT-12-≠-EMIT-DONE:** Claim `employee.activated` in `events[]` alone = FR-12 / ATT-12 DONE = **FAIL O1/O16**.

**Invariant ATT-12-≠-MANUAL-AUTO-DONE:** Claim HR **PUT tracked-entitlement** alone satisfies auto-enroll SRS = **FAIL O5/O16**.

**Invariant ATT-12-≠-MERGE:** Fold sick/compensatory/carry into `annual` ledger or panel = **FAIL O12** · **`ATT07QC1`** · **`ATT06QC1`** · **`ATT05QC1`**.

**Invariant ATT-12-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O4/O11**.

**Invariant ATT-12-CORE-BOUNDARY:** Grant/shift logic inside `employees.service` beyond emit = **FAIL O14**.

**Invariant ATT-12-≠-REOPEN-J07:** Reopen or demote sealed **J-HRM-ATT-07-01..07** or **J-HRM-ATT-06-04** without bus regression stamp = **FAIL O12/O16**.

**Invariant ATT-12-CONSUMER-HOLD-LABEL:** Evidence claiming FR-12 DONE when consumer/grant/shift GAP not LIVE = **FAIL O2/O6/O7/O16** — footer **HOLD** mandatory until BE.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-12 / FR-12 DONE** · **≠ ATT-07 / FR-07 DONE** (`ATT07QC1`) · **≠ ATT-06 / ATT-05b / ATT-05 / ATT-04 DONE** · **≠ ATT UAT** · printable false · PAY OUT · must_keep **`CORE07QC1-KZJTSHNT`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1`** · **`ATT05BQC1`** · **`ATT05QC1`** · **`ATT09QC1`** · **`ATT04*`** · **R-ATT-04-ENGINE HOLD** · **R-ATT-01-ASSIGN open** · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY reopen J-HRM-ATT-07-* / J-06-04 · emit **necessary not sufficient** · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-36 #41 · Option A) |
|---|----------------------|--------------------------------|
| CORE-07 activate + emit | **`CORE07QC1` SEALED** · emit wire | **RETAIN cite** (**O1/O14**) · **≠** ATT-12 DONE |
| ATT-12 consumer | **ABSENT** listener | **GAP AC** (**O2**) |
| LVRULE + ledger | ATT-04 **PRESENT** | **RETAIN** + auto grant consumer (**O3/O4**) |
| Manual tracked-entitlement | **PRESENT** | **RETAIN parallel** (**O5**) |
| Half-month on activate | **ABSENT** | **GAP AC** (**O6**) |
| Default shift bind | Catalog LIVE · assign **ABSENT** | **GAP AC** (**O7**) |
| HCNS confirm strip | **ABSENT** | **GAP AC** (**O9**) |
| Idempotent enroll | **ABSENT** | **GAP AC** (**O10**) |
| ATT-07 sick seals | **`ATT07QC1` SEALED** | **must_keep** + non-regression (**O12**) |

### 1.1 Residual map **R-ATT-12-*** (engine unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-ATT-12-CONSUMER** | Handler on `employee.activated` | **IN-SCOPE GAP** | **dev-be** after DATA HOLD |
| **R-ATT-12-LEAVE-GRANT** | LVRULE → upsert balances | **IN-SCOPE GAP** | **dev-be** |
| **R-ATT-12-HALF-MONTH** | End-of-month pro-rata | **IN-SCOPE GAP** | **dev-be** + **qa** |
| **R-ATT-12-SHIFT-DEFAULT** | Default assignment row | **IN-SCOPE GAP** | **dev-be** · share **R-ATT-01-ASSIGN** |
| **R-ATT-12-FE-CONFIRM** | Profile strip | **IN-SCOPE GAP** | **dev-fe** narrow |
| **R-ATT-12-IDEMPOTENT** | Re-activate / replay | **IN-SCOPE GAP** | **dev-be** |
| **R-ATT-04-ENGINE** | Periodic accrue job | **HOLD footer** | ATT-04 wave · **≠** 12 DONE |
| **R-ATT-01-ASSIGN** | Full roster GĐ2 | **OPEN peer** | non-blocking ATT-12 BA |

**Carry (non-blocking):** **R-ATT-07-AGG/SHEET-CODE** footers · **R-ATT-01-ASSIGN** full grid — **do not block** 12 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LC-03** | Hồ sơ chuyển Hoạt động (CORE-07 OK) | Nhận sự kiện · cấp quỹ + ca mặc định | NV chấm/nộp phép ngày đầu **không** bắt gán tay (trừ tenant tắt auto) | AC-ATT-12-CONSUMER/GRANT/SHIFT · J-03..04 |
| **BR-BP-LC-03-HALF** | Hoạt động cuối tháng | Pro-rata nửa tháng theo policy | Số dư khởi tạo đúng công thức | AC-ATT-12-HALF-MONTH · J-03 |
| **BR-BP-LC-03-MANUAL** | Tenant tắt auto hoặc HR override | Manual tracked-entitlement | Parallel path · **≠** thay consumer DONE | AC-ATT-12-MANUAL-GRANT |
| **BR-BP-LV-01** (peer ATT-04) | Grant amounts | Bind effective LVRULE | Per `leave_type_key` | AC-ATT-12-LVRULE-EFF |
| **BR-BP-SHF-01** (peer ATT-01) | Default ca BP | Rule → shift | Assignment visible | AC-ATT-12-SHIFT-DEFAULT |
| **BR-BP-LV-06** (peer ATT-09) | Submit after enroll | `pending_days` | **DENY** `att_leave_hold` | J-05 · regression |
| **BR-BP-LV-03-SEP** (peer ATT-06/07) | Multi-bucket | Display/grant | **DENY** merge compensatory/sick/carry→annual | J-06/J-07 regression |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#1** | Sự kiện Hoạt động | **CORE-EMIT** · **CONSUMER** | **J-HRM-ATT-12-01** · **J-02** | activate + event RETAIN/GAP |
| **#2** | Gán ca + số dư | **GRANT** · **HALF-MONTH** · **SHIFT-DEFAULT** | **J-03** · **J-04** | enroll GAP · shift GAP |
| Luồng **#4** | HCNS xác nhận | **FE-CONFIRM** | **J-HRM-ATT-12-05** | panel/balance RETAIN |
| Thành công | Điểm danh / đơn phép | **H** · peer submit | **J-06** | leave-requests RETAIN |
| Peer CORE-07 | Emit only on CORE | **MK-CORE07** · **≠-EMIT-DONE** | **J-01** | F-CORE-ACT-01 |
| O16 | Seals · regression | **MK-ATT07** · **≠-REOPEN-J07** | **J-07** + **J-06-04** + **J-07-03..05** | — |

### 3.1 AC-ATT-12 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-12-PATH** | Any 12 path | Network | `/employees/` activate · `/attendance/` grant/shift · Nest `/core` SoT **0** | U65 · J-* |
| **AC-ATT-12-CORE-EMIT** | Checklist PASS · pending→active | **Kích hoạt** FE | **2xx** · `events[]` includes **`employee.activated`** with ids + `effective_date` | O1 · J-01/02 |
| **AC-ATT-12-≠-EMIT-DONE** | Emit present | DONE claim | **FAIL** if emit alone = FR-12 / ATT-12 DONE | O1/O16 |
| **AC-ATT-12-CONSUMER** | Consumer LIVE | After activate **2xx** | Handler runs (log/metric/evidence) · tenant scope U19 | O2 · J-02 HOLD until BE |
| **AC-ATT-12-LVRULE-EFF** | Published policies | Grant | Reads **effective** policy per type · no bypass | O3 |
| **AC-ATT-12-LEDGER** | Consumer LIVE | Grant | Rows in **`employee_leave_balances`** per policy keys | O4 · J-03 |
| **AC-ATT-12-MANUAL-GRANT** | HR role | PUT tracked-entitlement | **2xx** · parallel to auto · audit trail | O5 |
| **AC-ATT-12-≠-MANUAL-AUTO-DONE** | Manual only | SRS auto-enroll | **FAIL** if manual path alone = FR-12 DONE | O5/O16 |
| **AC-ATT-12-HALF-MONTH** | `effective_date` end of month | Grant | Pro-rata per stamped formula · vi-VN calendar | O6 · J-03 HOLD |
| **AC-ATT-12-SHIFT-DEFAULT** | Dept/OU + rules | After activate | Default shift/assignment visible or rule-resolved | O7 · J-04 HOLD |
| **AC-ATT-12-FE-CONFIRM** | Profile post-activate | F5 | Strip or section shows balances + shift summary (display OK GĐ1) | O9 · J-05 |
| **AC-ATT-12-IDEMPOTENT** | Re-activate same employee | Second activate | **No** duplicate grant rows / double shift bind | O10 |
| **AC-ATT-12-MK-ATT02** | Footer | CFG peer | **≠ ATT-02 DONE** | O8 |
| **AC-ATT-12-MK-ATT09** | Footer | **`ATT09QC1`** · **DENY `att_leave_hold`** | O11 |
| **AC-ATT-12-MK-ATT07** | Footer | **`ATT07QC1`** · fund-order/dayBranches · **≠ ATT-07 DONE** | O12 |
| **AC-ATT-12-≠-REOPEN-J07** | J-07/J-06-04 sealed | Reopen without bus | **FAIL** | O12/O16 |
| **AC-ATT-12-MK-CORE07** | Footer | **`CORE07QC1`** · GATE unchanged | O14 |
| **AC-ATT-12-ENGINE-HOLD** | Periodic accrue | Slice evidence | **≠** F-ATT-LEAVE-04 LIVE = ATT-12 DONE | O13 |
| **AC-ATT-12-H** | Program | QC GWC | `attendance_uat_ready=false` · **≠ ATT-12 DONE** · **≠ ATT-07/06/05/05b/04 DONE** · **≠ ATT UAT** · C-SLICE | O16 · J-07 |

---

## 4. J-HRM-ATT-12-* DRAFT (narrow · U65 · Nest `/core` 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-ATT-12-01** | **activate** | **CORE-07 Kích hoạt Hoạt động — FE + effective_date** | Login `ceo@xe.vn` → HRM → Hồ sơ NV đủ checklist → **Kích hoạt Hoạt động** · nhập `effective_date` `dd/MM/yyyy` · Network **`POST …/employees/:id/activate`** (or gated PATCH) **2xx** · status Hoạt động · **FE-after-2xx** | AC-ATT-12-CORE-EMIT · O1/O14 · **DRAFT** |
| **J-HRM-ATT-12-02** | **emit** | **Tín hiệu `employee.activated` — necessary not sufficient** | Cùng bước activate · response `events[]` (or realtime seam) chứa **`employee.activated`** · evidence label **≠ FR-12 DONE** · Nest `/core` **0** · no seed | AC-ATT-12-≠-EMIT-DONE · O1 · **DRAFT** |
| **J-HRM-ATT-12-03** | **balances-f5** | **Quỹ khởi tạo theo policy — F5** | Sau activate consumer LIVE: mở hồ sơ / panel phép → **`GET leave-balance`/`panel` 2xx** · rows per `leave_type_key` match effective LVRULE · **F5** persisted · **HOLD** footer until consumer LIVE | AC-ATT-12-GRANT/LEDGER/HALF-MONTH · O4/O6 · **DRAFT** |
| **J-HRM-ATT-12-04** | **shift-f5** | **Ca mặc định — visible after activate** | Sau activate: profile hoặc attendance context shows **default shift** (assignment row or rule-resolved label) · **F5** · cite **R-ATT-01-ASSIGN** narrow slice · **HOLD** until BE | AC-ATT-12-SHIFT-DEFAULT · O7 · **DRAFT** |
| **J-HRM-ATT-12-05** | **hcns-confirm** | **HCNS strip xác nhận trên hồ sơ** | HCNS mở cùng hồ sơ → strip/section **display-ready** (balances + ca) · read-only OK GĐ1 · **F5** | AC-ATT-12-FE-CONFIRM · O9 · **DRAFT** |
| **J-HRM-ATT-12-06** | **leave-peer** | **Nộp đơn phép sau enroll — peer ATT-09** | NV → Nghỉ phép → tạo đơn tracked type · `POST leave-requests` **2xx** · `pending_days` behavior per **ATT09** · **≠** invent enroll hold table | AC-ATT-12-MK-ATT09 · O11 · **DRAFT** |
| **J-HRM-ATT-12-07** | **cross** | **Seals · idempotent · ≠DONE · Nest 0** | (a) Nest `/core` leave **0** (b) **≠ ATT-12 / FR-12 DONE** · **≠ ATT-07/06/05/05b/04 DONE** · **≠ ATT UAT** (c) must_keep **`CORE07QC1`** · **`ATT07QC1`** · **`ATT06QC1`** · **`ATT05BQC1`** · **`ATT05QC1`** · **`ATT09QC1`** · **`ATT04QC1`** · **`ATT04BQC1`** (d) **DENY merge** buckets (e) re-activate idempotency smoke when LIVE (f) printable false · PAY OUT · **DENY reopen J-HRM-ATT-07-*** | AC-ATT-12-H/MK-* · O12/O16 · **DRAFT** |

### 4.1 Mandatory regression (from ATT07QC1 — attach to ATT-12 QC)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-ATT-06-04** | **regression** | **Quỹ `compensatory` — non-regression after enroll touch** | If grant/balance paths change: **`GET panel`** · `compensatory` row separate · **≠** merge→`annual` | **`ATT06QC1`** · **DENY reopen J-06** · **DRAFT** |
| **J-HRM-ATT-07-03** | **regression** | **Nộp đơn ốm — non-regression subset** | Re-run sick submit **2xx** path sealed in ATT07QA | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-07-04** | **regression** | **Hold `pending_days` — non-regression** | Tracked submit · F5 · **DENY `att_leave_hold`** | **`ATT09QC1`** · **DRAFT** |
| **J-HRM-ATT-07-05** | **regression** | **Fund-order / dayBranches — non-regression** | GET/PUT fund-order persisted · `dayBranches[]` on sick submit when LIVE | **`ATT07QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip readiness · **narrow ≠ full ATT/PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§62** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-ATT-12-CONSUMER** | Activate listener | **GAP** | **dev-be** |
| **G-ATT-12-LEAVE-GRANT** | Policy-driven upsert | **GAP** | **dev-be** |
| **G-ATT-12-HALF-MONTH** | End-of-month formula | **GAP** | **dev-be** |
| **G-ATT-12-SHIFT-DEFAULT** | Assignment persist | **GAP** | **dev-be** · **ba-data** optional physicalize |
| **G-ATT-12-FE-CONFIRM** | Profile strip | **GAP** | **dev-fe** |
| **G-ATT-12-IDEMPOTENT** | Dedup key / state | **GAP** | **dev-be** · **ba-data** HOLD |
| **H-ATT-12-ENGINE** | F-ATT-LEAVE-04 job | **HOLD** | ATT-04 · **R-ATT-04-ENGINE** |
| **H-ATT-12-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **HOLD default** `PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01` — confirm **DENY** `att_leave_hold` · **no** merge sick/compensatory/carry into `annual` · ADD enroll idempotency key + optional `shift_assignment` physical **only** if closable + BA stamp | DATA-01 PASS_TO_PM |
| **sa** | API-01 deepen **F-ATT-LEAVE-ENROLL** / **F-ATT-SHIFT-02** consumer if DATA stamped | optional API-01 |
| **dev-be** | **HOLD** consumer + grant + shift until DATA CONFIRMED | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** profile confirm strip (narrow) | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-ATT-12-01..06** mandatory · **J-07** footer · **J-HRM-ATT-06-04** + **J-HRM-ATT-07-03..05** regression when grant/balance paths touched | PASS_TO_PM |
| **qc** | GWC C-SLICE · ≠ ATT-12/ATT-07/06/05/ATT UAT · must_keep **`ATT07QC1`** + peer chain · **DENY reopen J-07 / J-06-04** | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O16 CONFIRMED** for UC-BP-ATT-12 / FR-UC-BP-ATT-12 / BR-BP-LC-03 against SA Option A: **RETAIN cite** CORE-07 activate + **`employee.activated`** emit (**R-CORE-07-ATT-12** · **emit-only ≠ DONE**) · **RETAIN** ATT-04 LVRULE effective + `employee_leave_balances` + PUT **tracked-entitlement** (manual parallel) · **RETAIN** ATT-01 shift catalog + ATT-02 rule peer; **GAP** **R-ATT-12-CONSUMER/LEAVE-GRANT/HALF-MONTH/SHIFT-DEFAULT/FE-CONFIRM/IDEMPOTENT**; **HOLD** F-ATT-LEAVE-04 periodic footer; AC-ATT-12-*; mint **J-HRM-ATT-12-01..07 DRAFT** + **J-HRM-ATT-06-04** + subset **J-HRM-ATT-07-03..05** regression (U65 FE-after-2xx+F5); unlock **ba-data HOLD** default; explicit **≠ ATT-12 DONE** · **≠ ATT-07/06/05/05b/04 DONE** · **≠ ATT UAT** · printable **false** · **C-SLICE** · **PAY OUT** · must_keep **`ATT07QC1-MSM9GWC1`** + full peer chain · **DENY** `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** emit/manual-alone DONE · **DENY reopen J-HRM-ATT-07-*** / **J-06-04** |
| **Residual (open)** | ba-data DATA-01 HOLD · sa API-01 optional · dev-be consumer/grant/shift · dev-fe confirm strip · QA J-* · QC GWC · **R-ATT-04-ENGINE** footer |
| **next_owner** | **ba-data** (HOLD default) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data HOLD default)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-36 seat #41)
lane: governance · UC-BP-ATT-12 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (employee_leave_balances · att_leave_accrual_policy · work_shifts · paper att_shift_assignment — DENY att_leave_hold · DENY merge sick/compensatory/carry into annual)
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md (activate spine · emit boundary)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md (LVRULE · tracked-entitlement)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md (R-ATT-01-ASSIGN narrow slice)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md (must_keep ATT07QC1 · DENY reopen J-07 / J-06-04)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md (ATT07QC1-MSM9GWC1)
entry_criteria: BA O1–O16 CONFIRMED · default RETAIN cite CORE emit + LVRULE/ledger/shift peers — no schema ADD unless enroll idempotency + shift_assignment physicalization closable
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md
  - HOLD default: RETAIN employee_leave_balances + att_leave_accrual_policy + work_shifts · DENY physical att_leave_hold · DENY merge compensatory/sick/carry into annual keys · DENY grant logic on employees table beyond emit
  - ADD only if closable + BA stamp: enroll idempotency key/store · optional shift_assignment row for default bind (else explicit HOLD waiver with owner+trigger)
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge buckets · honesty flip · reopen J-HRM-ATT-07-* / J-06-04 without regression · wipe ATT07QC1 peer seals
```

### 7.2 next_dispatch_prompt (copy-ready — pm orchestration hint)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-PM-01
role: pm
lane: governance
entry_criteria: BA-01 PASS_TO_PM @ docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md · must_keep ATT07QC1-MSM9GWC1 through CORE07QC1-KZJTSHNT seals
exit_criteria:
  - Dispatch ba-data DATA-01 HOLD (parallel) · hold dev-be/dev-fe until DATA PASS
  - Update PO_HRM_MVP_GD1_CONTINUOUS.md seat #41 BA stamped · PILOT_BUSINESS_FLOW_BA_TRACE §62
  - No attendance_uat_ready flip · C-SLICE honesty · DENY reopen J-HRM-ATT-07-* / J-06-04
cấm: claim ATT-12 or ATT module UAT DONE from BA pack alone · claim emit-only = FR-12 DONE · honesty flip
```
