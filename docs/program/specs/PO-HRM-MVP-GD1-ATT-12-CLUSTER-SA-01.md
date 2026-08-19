# PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01 — Option/F.1 · Mở quỹ phép & ca mặc định khi Hoạt động — RETAIN CORE-07 emit + gap enroll consumer

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** after ATT-07 QC GWC) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** wipe ATT peer seals · **DENY** reopen **J-HRM-ATT-07-*** / **J-HRM-ATT-06-04** without regression · **DENY** honesty flip · **DENY** claim ATT-12 / ATT module UAT DONE · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → (ba-data HOLD default) → API/BE residual only after BA stamps · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC GWC **`ATT07QC1-MSM9GWC1`** · `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md` · board **#40 SEALED** · **#41 UC-BP-ATT-12** · **must_keep** **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** (**DENY `att_leave_hold`**) · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`CORE07QC1-KZJTSHNT`** · **`CORE07QA1-MSLJSPGO`** · **R-ATT-01-ASSIGN open** (peer non-blocking) · **R-ATT-04-ENGINE HOLD** · Nest `/core` **DENY** · **≠ ATT UAT** · PAY OUT · printable **false** |
| **uc_ids** | `UC-BP-ATT-12` · `FR-UC-BP-ATT-12` · **BR-BP-LC-03** · peer **FR-UC-BP-CORE-07** · **R-CORE-07-ATT-12** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#41** Wave-36 after ATT-07 (#40 SEALED GWC) |
| **ref_sa_spine** | CORE-07 [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) · ATT-04 [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) · ATT-01 [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md) · ATT-09 hold [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) · ATT-07 seal [`PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md) |
| **ref_honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · product_go **false** · **DENY claim ATT-12 / FR-12 DONE alone** · **DENY claim `employee.activated` emit alone = FR-12 LIVE** · **DENY claim ATT-07/06/05/05b/04 DONE from 12 seat** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-12** · Diễn biến **#1–#2** · Luồng chính **1–4** · **BR-BP-LC-03** · peer **FR-UC-BP-CORE-07** (Hoạt động cuối tháng → nửa tháng phép · Luồng #3 tín hiệu ATT-12) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · **F-CORE-ACT-01** · **F-ATT-CAT-LVT/LVRULE** · **F-ATT-LEAVE-BAL** · **F-ATT-LEAVE-04** (HOLD) · **F-ATT-CAT-SHIFT** · **F-ATT-SHIFT-02** (paper) |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — activate · leave-accrual-policies · tracked-entitlement · work-shifts* · shift-assignments (paper) · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` — `employee_leave_balances` · `att_leave_accrual_policy` · `work_shifts` · paper `att_shift_assignment` · **DENY** `att_leave_hold` |
| **ref_code** | **read-only cite:** `employees.service` `activateEmployee` + `emitEmployeeActivated` · `hrm-realtime.service` `publishEmployeeActivated` · `leave-balance.service` + `PUT tracked-entitlement` · `att-leave-accrual-policy.service` · `attendance.controller` work-shifts* · **ABSENT:** attendance listener on `employee.activated` · **ABSENT:** auto grant on activate · **ABSENT:** Nest `shift-assignments` persist (**R-ATT-01-ASSIGN**) |
| **OUT** | Nest `/core` dual enroll SoT · wipe **ATT07QC1** / **ATT06QC1** / **ATT05BQC1** / **ATT09** seals · invent `att_leave_hold` · merge **sick/compensatory/carry→annual** · invent ASSIGN/PAY/printable DONE · claim **emit alone** = ATT-12 DONE · claim **manual tracked-entitlement alone** = auto-enroll DONE · reopen **J-HRM-ATT-07-01..07** / **J-HRM-ATT-06-04** without regression · ATT UAT flip · seed |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-36 architecture unlock: **Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động** (FR-UC-BP-ATT-12 · BR-BP-LC-03) vs AS-IS LIVE CORE-07 activate + emit peer + manual ATT-04 grant paths — **gap** activate consumer (quỹ + ca) |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after ATT-07 QC GWC (`ATT07QC1-MSM9GWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-12 · BR-BP-LC-03 · FR-UC-BP-CORE-07 Luồng **#3** · **R-CORE-07-ATT-12** · peer ATT-04 (LVRULE + ledger) · ATT-01 (ca catalog + **R-ATT-01-ASSIGN**) · ATT-09 `pending_days` · must_keep full ATT chain through **ATT07QC1** · **CORE07QC1-KZJTSHNT** · Nest `/core` DENY · PAY OUT · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-07 SEALED (`CORE07QC1-KZJTSHNT`):** `POST /api/hrm/employees/:id/activate` (or gated PATCH) · checklist GATE **409** · `effective_date` display · **`employee.activated` emit** in response `events[]` + `HrmRealtimeService` (**R-CORE-07-ATT-12** wire-only · **DENY** invent ATT enroll DONE on CORE seat). **ATT-07 SEALED (`ATT07QC1-MSM9GWC1`):** sick flags · fund-order · dayBranches · panel 5 buckets · **J-HRM-ATT-07-01..07** + **J-06-04** — **must_keep · DENY reopen without regression**. **Quỹ phép (PRESENT — peer ATT-04, ≠ auto ATT-12):** `leave-accrual-policies*` → `att_leave_accrual_policy` (**F-ATT-LVRULE-01..04**) · `GET leave-balance` / `panel` · **PUT** `leave-balance/tracked-entitlement` → `employee_leave_balances` (HR manual grant · U65 product path · **ATT09QC1** `pending_days` hold · **DENY `att_leave_hold`**). **F-ATT-LEAVE-04 accrue job:** **HOLD** (SRS tự động tích lũy giai đoạn sau · **R-ATT-04-ENGINE**). **Ca (PRESENT — peer ATT-01, ≠ default assign):** `work-shifts*` catalog + `/effective` · ATT-02 `attendance_rules` dept/shift specificity · **ABSENT** Nest persist **`shift-assignments`** (**R-ATT-01-ASSIGN open** · QC ATT-07 non-blocking). **ATT-12 consumer (ABSENT):** no `hrm-api` attendance handler subscribed to `employee.activated` · no idempotent auto-grant · no default shift row on activate. Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-12: On **Hoạt động** (from CORE-07): (1) receive activate signal (2) **grant leave balances** per published policy (**ATT-04**) including **half-month** when activate end-of-month (3) **assign default department shift** (**ATT-01**) (4) HCNS can **review** on employee profile — **no manual grant required** for day-one punch/leave unless tenant disables auto. |
| **Gap class** | **GĐ1 continuous AC** on LIVE **CORE-07 emit** + LIVE **LVRULE + ledger + shift catalog** peers + residuals **activate consumer · pro-rata half-month · default shift bind · FE confirmation strip** — **not** greenfield CORE activate; **not** claim emit = FR-12 DONE; **not** claim tracked-entitlement manual path = auto-enroll DONE; **not** invent `att_leave_hold`; **not** merge buckets; **not** regress ATT-07 sick seals. |
| **Constraints** | U89 · preserve **`ATT07QC1`** + **`ATT06QC1`** + **`ATT05BQC1`** + **`ATT05QC1`** + **`ATT09QC1`** + **`ATT04*`** + **`CORE07QC1`** · **DENY merge sick/compensatory/carry→annual** · **DENY reopen J-HRM-ATT-07-*** / **J-HRM-ATT-06-04** · C-SLICE · U65 · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Team claims CORE-07 emit = ATT-12 UAT; HR must seed grant via API; new hires cannot punch/submit leave on day one; duplicate grant on re-activate; wipes sick/comp panel semantics from ATT-07 |

### 1.2 Relation to CORE-07, ATT-04, ATT-01, ATT-09 — context gates

| Seat | Role for ATT-12 | SA lock |
|------|-----------------|--------|
| **#23 FR-UC-BP-CORE-07** | Activate + **`employee.activated` emit** | **RETAIN cite** · **≠** ATT-12 consumer DONE · **DENY** move grant logic into employees.service beyond emit |
| **#35 FR-UC-BP-ATT-04** | LVRULE + ledger SoT | **RETAIN cite** · consumer reads **effective policy** · grant via same `employee_leave_balances` rows · **DENY** bypass LVRULE with ad-hoc amounts · **F-ATT-LEAVE-04** full engine **HOLD** |
| **#32 FR-UC-BP-ATT-01** | Default ca | **RETAIN cite** catalog · **GAP** **R-ATT-01-ASSIGN** as **default bind on activate** (narrow slice — not full roster GĐ2) |
| **#29 FR-UC-BP-ATT-09** | Hold on submit | **must_keep** **`ATT09QC1`** · enroll **≠** submit hold · **DENY `att_leave_hold`** |
| **#40 FR-UC-BP-ATT-07** | Sick panel/order | **must_keep** **`ATT07QC1`** · enroll **≠** sick engine · **DENY reopen J-07 / J-06-04** |

### 1.3 Architecture diagram (target — Option A)

```text
  CORE-07 (CORE07QC1) · ATT-07 (ATT07QC1) · ATT-06..04 · ATT-09 · ATT-01 catalog · ATT-10/11 — SEALED must_keep
  Nest /core DENY · printable false · PAY OUT · honesty false · DENY merge buckets
       │
       │  CORE-07: F-CORE-ACT-01 activate + R-CORE-07-ATT-12 emit (RETAIN · OUT invent ATT DONE on CORE)
       ▼
  ┌──────── FR-UC-BP-ATT-12 (gap-only RETAIN emit + enroll/shift consumer residuals) ────────┐
  │ RETAIN LIVE (cite — ≠ FR-12 DONE alone)                                                    │
  │   employee.activated payload: employee_id · company_id · effective_date (dd/MM/yyyy)      │
  │   ATT-04: leave-accrual-policies/effective + employee_leave_balances physical               │
  │   ATT-04: PUT tracked-entitlement (manual HR path — RETAIN · ≠ substitute auto consumer)  │
  │   ATT-01: work-shifts/effective + att_attendance_rule dept/shift peer (CFG≠ATT-01 DONE)    │
  │                                                                                            │
  │ RESIDUAL unlock (BA → DATA/API/BE — BR-BP-LC-03 consumer)                                  │
  │   R-ATT-12-CONSUMER   : idempotent handler on employee.activated (in-proc or queue)        │
  │   R-ATT-12-LEAVE-GRANT: apply effective LVRULE → upsert balances per leave_type_key       │
  │   R-ATT-12-HALF-MONTH : pro-rata when activate end-of-month (CORE-07 + ATT-12 đặc biệt)    │
  │   R-ATT-12-SHIFT-DEFAULT: bind default shift assignment (dept/OU) — narrow F-ATT-SHIFT-02   │
  │   R-ATT-12-FE-CONFIRM : HCNS strip on employee profile (display-ready · read-only OK GĐ1)  │
  │   R-ATT-12-IDEMPOTENT : re-activate / duplicate event → no double grant                    │
  │   mint J-HRM-ATT-12-* DRAFT for QA L2.5                                                    │
  │   Paper F-ATT-* /att + /core = ALIAS ONLY                                                  │
  └────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼ OUT this seat
  att_leave_hold second ledger              = DENY (ATT-09)
  Nest /core dual enroll SoT                = DENY
  Merge sick/compensatory/carry→annual      = DENY (ATT07/06/05 seals)
  Claim emit alone = ATT-12 DONE            = DENY
  Claim manual tracked-entitlement = auto    = DENY
  Reopen J-HRM-ATT-07-* / J-06-04           = DENY
  Invent ASSIGN / PAY / printable DONE      = DENY
  Flip attendance_uat_ready                 = DENY
```

**Label lock:** Board «Mở quỹ & ca khi Hoạt động» GĐ1 = **RETAIN cite** CORE-07 emit + ATT-04/01 peers **+ gap AC** for **activate consumer · grant · half-month · default shift · HCNS confirm** — **not** emit alone; **not** ATT UAT.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / BR-BP-LC-03) | AS-IS LIVE | Verdict |
|------------|---------------------------|------------|---------|
| Tín hiệu Hoạt động | Luồng #1 · CORE-07 #3 | `employee.activated` emit | **RETAIN cite** · **R-CORE-07-ATT-12** |
| Consumer ATT-12 | Diễn biến #1 job | **ABSENT** listener | **GAP** **R-ATT-12-CONSUMER** |
| Cấp quỹ theo chính sách | #2 · ATT-04 | LVRULE CRUD + manual tracked-entitlement | **RETAIN cite** + **GAP** **R-ATT-12-LEAVE-GRANT** |
| Nửa tháng cuối tháng | Đặc biệt · CORE-07 | **ABSENT** pro-rata on activate | **GAP** **R-ATT-12-HALF-MONTH** |
| Gán ca mặc định BP | #2 · ATT-01 | Catalog LIVE · assignment **ABSENT** | **RETAIN cite** + **GAP** **R-ATT-12-SHIFT-DEFAULT** |
| HCNS xác nhận | Luồng #4 | **ABSENT** dedicated strip | **GAP** **R-ATT-12-FE-CONFIRM** (display OK GĐ1) |
| Idempotent enroll | BR implicit | **ABSENT** | **GAP** **R-ATT-12-IDEMPOTENT** |
| Accrue engine periodic | ATT-04 SRS later | F-ATT-LEAVE-04 **HOLD** | **HOLD** · **≠** ATT-12 slice DONE |
| `pending_days` on submit | ATT-09 | **PRESENT** | **must_keep** · **DENY `att_leave_hold`** |
| Sick/comp/carry buckets | ATT-07/06/05 | separate | **must_keep** · **DENY merge→annual** |
| Nest `/core` | alias | **ABSENT** | **alias only** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-12 DONE** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN CORE-07 emit + ATT-04/01 peers + gap activate consumer (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** `POST …/activate` + **`employee.activated`** emit (**R-CORE-07-ATT-12**) · **RETAIN** `leave-accrual-policies*` + `employee_leave_balances` + **PUT tracked-entitlement** (manual parallel path) · **RETAIN** `work-shifts*` + ATT-02 rule peer. Unlock BA residuals **R-ATT-12-*** for **idempotent consumer**, **LVRULE-driven grant**, **half-month pro-rata**, **default shift bind** (narrow **R-ATT-01-ASSIGN** slice), **FE confirm strip**. **must_keep** **ATT07QC1** + full peer chain. **DENY** `att_leave_hold` · merge buckets · reopen **J-HRM-ATT-07-*** / **J-06-04**. |
| **Scope** | Docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (consumer + idempotency + policy resolution + shift bind) |
| **Risk** | Low if BA separates **emit DONE (CORE)** vs **grant/shift DONE (ATT-12)** and regression-gates ATT-07 |
| **Pros** | Matches SRS orchestration; reuses sealed LVRULE/shift catalog; testable U65: activate FE → F5 balances/shift visible |
| **Cons** | Requires coordination with **R-ATT-01-ASSIGN** physical row (may share DATA seat with ATT-01) |
| **Failure modes** | Double grant; grant on re-activate; shift bind without scope parity |
| **Mitigation** | Idempotency key · U19 same resolver · **J-HRM-ATT-12-*** · **J-06-04** + **J-07** regression smoke |

### Option B — invent `att_leave_hold` / Nest `/core` enroll / merge buckets / wipe ATT-07 seals (REJECT)

| | |
|--|--|
| **Summary** | Second hold ledger; `/core` enroll SoT; fold grants into `annual` only; wipe **ATT07QC1** / **ATT06QC1** sick-comp semantics |
| **Pros** | Illusion of one-shot «enrollment API» |
| **Cons** | Violates **`ATT09QC1`** · **`ATT07QC1`** · **`ATT06QC1`** · BR-BP-LC-03 separation |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim `employee.activated` emit alone = ATT-12 DONE / ATT UAT flip (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because CORE-07 emits event; skip grant/shift AC; flip `attendance_uat_ready` |
| **Pros** | Fast chat claim |
| **Cons** | Violates SRS Diễn biến **#2** · board #41 · **C-SLICE** |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+consumer gap) | B (dual/merge) | C (emit alone DONE) |
|-----------|-------:|------------------------:|---------------:|--------------------:|
| Business value (FR-12) | 5 | **4** | 1 | 0 |
| Preserve ATT-07..04 / CORE-07 seals | 5 | **5** | 0 | 2 |
| Honesty / seal safety | 5 | **5** | 0 | 0 |
| CORE-07 boundary (emit only on CORE) | 4 | **5** | 1 | 3 |
| Time to deliver | 4 | **3** | 2 | Fake PASS |
| Fit LIVE LVRULE + shift catalog | 5 | **5** | 0 | 1 |
| **Weighted** | | **high** | low | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE activate emit + LVRULE/ledger/shift catalog peers; unlock **R-ATT-12-*** consumer/grant/half-month/shift/FE/idempotent AC; **HOLD** F-ATT-LEAVE-04 periodic accrue as ATT-04 footer; **DENY** att_leave_hold · merge buckets · Nest `/core` · reopen **J-HRM-ATT-07-*** / **J-06-04** · honesty flip |
| **Why selected** | SRS core gap is **automatic grant + default ca on activate signal** — emit is **necessary but not sufficient** (CORE-07 contract already says OUT invent ATT enroll DONE) |
| **Assumptions** | Consumer runs in **hrm-api** attendance module (same tenant scope as activate); grant amounts derived from **effective** `att_leave_accrual_policy` bound to `leave_type_key` (MVP five codes + seniority as configured); default shift resolved from employee **dept/OU** + ATT-02 rule row → `work_shift_id`; half-month uses **calendar month** of `effective_date` (vi-VN) unless BA stamps FY rule |
| **Rejected** | **B** dual hold / merge buckets · **C** emit-alone DONE / ATT UAT |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | CORE emit | RETAIN `employee.activated` payload | AC cite · **≠** ATT-12 DONE |
| O2 | Consumer wiring | GAP **R-ATT-12-CONSUMER** in attendance lane | AC trigger · idempotency |
| O3 | LVRULE source | RETAIN `leave-accrual-policies/effective` | AC per `leave_type_key` |
| O4 | Ledger write | RETAIN `employee_leave_balances` | AC same as tracked-entitlement cols · **DENY `att_leave_hold`** |
| O5 | Manual grant path | RETAIN PUT tracked-entitlement | AC parallel · HR override · **≠** auto consumer DONE |
| O6 | Half-month | GAP **R-ATT-12-HALF-MONTH** | AC CORE-07 + ATT-12 đặc biệt · formula |
| O7 | Default shift | GAP **R-ATT-12-SHIFT-DEFAULT** | AC dept rule → shift · cite **R-ATT-01-ASSIGN** |
| O8 | ATT-02 peer | CFG≠ATT-02 DONE | AC read rule specificity only |
| O9 | HCNS confirm UI | GAP **R-ATT-12-FE-CONFIRM** | AC employee profile strip · F5 |
| O10 | Idempotency | GAP **R-ATT-12-IDEMPOTENT** | AC duplicate activate / replay event |
| O11 | ATT-09 peer | must_keep **`ATT09QC1`** | enroll **≠** submit hold |
| O12 | ATT-07/06/05 peers | must_keep **`ATT07QC1`** **`ATT06QC1`** **`ATT05BQC1`** | **DENY merge buckets** · **DENY reopen J-07 / J-06-04** |
| O13 | ATT-04 engine | **R-ATT-04-ENGINE HOLD** | periodic accrue **≠** ATT-12 slice |
| O14 | CORE-07 peer | must_keep **`CORE07QC1-KZJTSHNT`** | activate GATE unchanged |
| O15 | Paper `/core` | Alias only | DENY Nest dual |
| O16 | Honesty | false · C-SLICE · mint **J-HRM-ATT-12-*** | **≠ ATT-12 / ATT UAT DONE** |

---

## 5. F.1 API map sketch (§F.1 — mục đích · nghiệp vụ · bước SRS)

> Physical prefer `/api/hrm/employees/*` (CORE) + `/api/hrm/attendance/*` (ATT) · paper `/att/*` + `/core/*` = **alias only** · deepen = later **sa API-01** seat after BA stamps.

| F-id (cite) | METHOD/path (prefer) | Mục đích (VI) | Nghiệp vụ xử lý (BE) | Bước SRS (FR-UC-BP-ATT-12) | Disposition |
|-------------|----------------------|---------------|----------------------|----------------------------|-------------|
| **F-CORE-ACT-01** | `POST …/employees/:id/activate` | Kích hoạt Hoạt động | GATE checklist · status `active` · emit event | Peer CORE-07 #3 | **RETAIN cite** · **OUT** grant on CORE |
| **R-CORE-07-ATT-12** | event `employee.activated` | Tín hiệu cho ATT-12 | Payload min · realtime/push seam | **#1** input | **RETAIN cite** · **≠** FR-12 DONE |
| **F-ATT-LVRULE EFF** | `GET …/leave-accrual-policies/effective` | Đọc chính sách cấp | Resolve policy per `leave_type_key` + scope | Tiên quyết #2 | **RETAIN cite** · ATT-04 |
| **F-ATT-LEAVE-BAL grant** | internal / proposed `POST …/leave-balance/enroll-on-activate` *(proposed)* | Cấp quỹ khởi tạo | Upsert `employee_leave_balances` from LVRULE · half-month branch | **#2** | **GAP** **R-ATT-12-LEAVE-GRANT** |
| **F-ATT-LEAVE-BAL manual** | `PUT …/leave-balance/tracked-entitlement` | HR cấp tay | Upsert row · audit | Alternate path | **RETAIN cite** · **≠** auto DONE |
| **F-ATT-LEAVE-04 accrue** | `POST …/leave-balances/accrue` *(HOLD)* | Tích lũy định kỳ | Job engine | OUT of slice | **HOLD** **R-ATT-04-ENGINE** |
| **F-ATT-CAT-SHIFT EFF** | `GET …/work-shifts/effective` | Ca hiệu lực | Catalog assert | Tiên quyết ca | **RETAIN cite** · ATT-01 |
| **F-ATT-SHIFT-02** | `PUT …/shift-assignments` *(proposed)* | Gán ca mặc định | Persist assignment row dept/employee | **#2** ca | **GAP** **R-ATT-12-SHIFT-DEFAULT** · **R-ATT-01-ASSIGN** |
| **F-ATT-RULE-01** *(peer)* | `GET/PATCH …/attendance/rules*` | Rule BP → ca | Read dept specificity | Resolve default | **RETAIN cite** · ATT-02 CFG≠DONE |
| **F-ATT-LEAVE-BAL read** | `GET …/leave-balance` / `panel` | HCNS xác nhận | Display-ready balances | **#4** | **RETAIN cite** · ATT-05b peer |
| **F-ATT-LEAVE-02 submit** *(peer)* | `POST …/leave-requests` | Nộp phép sau enroll | `pending_days` if tracked | Post-condition | **RETAIN cite** · ATT-09 · regression only |

**DENY:** invent Nest `@Controller('core')` enroll SoT · invent `att_leave_hold` · merge **sick/compensatory/carry→annual** · claim **emit** or **manual grant UI** alone = FR-12 UAT · reopen **J-HRM-ATT-07-01..07** / **J-HRM-ATT-06-04** without regression bus stamp · run grant inside `employees.service` beyond emit (CORE boundary).

### 5.1 must_keep peer chain (DENY reopen without regression)

| Stamp / journey | Lock |
|-----------------|------|
| **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** | Sick fund-order · dayBranches · panel · **J-HRM-ATT-07-01..07** |
| **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** | OT-comp · compensatory separate · **J-HRM-ATT-06-01..07** · **J-06-04** |
| **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** | Panel · carry_over · **DENY merge→annual** |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` · **DENY `att_leave_hold`** |
| **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** | LVT/LVRULE/grant |
| **`CORE07QC1-KZJTSHNT`** · **`CORE07QA1-MSLJSPGO`** | Activate GATE · emit |
| **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** | AGG + sign context |
| **`ATT03DQC1-MSM1CR19`** + ATT-08/02/01/03b + PLT/CORE | full ATT chain |

**Regression rule:** Any change touching `employee_leave_balances` grant paths · `leave-accrual-policies` effective resolution · shift assignment · **must** re-run **J-HRM-ATT-06-04** + **J-HRM-ATT-07-01..07** (subset) before sealing ATT-12 QC — **DENY** silent regression.

---

## 6. unlock_lane

```text
BA-01 (ba-process) AC pack O1–O16 + mint J-HRM-ATT-12-* DRAFT
  → ba-data HOLD default (enroll idempotency key + optional shift_assignment physicalize — no att_leave_hold)
  → sa API-01 deepen F-ATT-LEAVE-ENROLL / F-ATT-SHIFT-02 consumer if stamped
  → dev-be BE-01 consumer + grant + shift bind (HOLD until BA CONFIRMED)
  → dev-fe FE-01 employee profile confirm strip (narrow)
  → QA U65: CORE-07 activate FE → Network 2xx → F5 balances + default shift visible · J-06-04 + J-07 regression · Nest /core 0
  → QC GWC C-SLICE (≠ ATT-12/ATT UAT · must_keep ATT07QC1 + peer chain)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + **PASS_TO_PM** |
| 2. BA O1–O16 AC + J-HRM-ATT-12-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default | ba-data | **no** `att_leave_hold` |
| 4. sa API-01 if stamped | sa | F.1 physicalize enroll/shift consumer |
| 5. dev-be / dev-fe | execution | HOLD until BA CONFIRMED |
| 6. QA / QC | execution | U65 · C-SLICE honesty · **J-07 / J-06-04 non-regression** |

---

## 7. must_keep / forbidden_paths / honesty locks

### must_keep (RETAIN — DENY wipe / DENY reopen without regression)

| Stamp / artifact | Lock |
|------------------|------|
| **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** | ATT-07 · **J-HRM-ATT-07-*** · **DENY reopen** |
| **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** | **DENY merge compensatory→annual** · **J-HRM-ATT-06-04** |
| **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** | **DENY merge carry→annual** |
| **`ATT09QC1-MSLUTL9D`** | **DENY `att_leave_hold`** |
| **`ATT04*`** · **`CORE07QC1-KZJTSHNT`** | LVRULE · activate emit |
| **J-HRM-ATT-07-01..07** · **J-HRM-ATT-06-04** | **DENY reopen** without regression evidence |

### forbidden_paths (default DENY unless BA unlock lists allowed_paths)

```text
**/att_leave_hold**
apps/api/hrm-api/src/**/core.controller.ts
apps/api/hrm-api/src/employees/employees.service.ts   # beyond emit — grant/shift logic DENY on CORE (ATT-12 owned)
apps/api/hrm-api/src/attendance/leave-requests.service.ts  # invent att_leave_hold — ATT-09 owned
apps/api/hrm-api/src/attendance/**/sick*                # ATT-07 owned — no enroll regression
apps/api/hrm-api/src/attendance/**/ot-comp*             # ATT-06 owned
honesty flags · SERVICE_READINESS promote
```

### honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-12 / FR-12 DONE** from Option A alone | **LOCKED** |
| **≠ ATT-07 / ATT-06 / ATT-05/05b/04 DONE** from 12 seat | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=true` | **LOCKED** |
| **`employee.activated` emit alone = FR-12 LIVE** | **DENIED** |
| **Manual tracked-entitlement alone = auto-enroll DONE** | **DENIED** |
| **Merge sick/compensatory/carry→annual** | **DENIED** |
| **Invent `att_leave_hold` · Nest `/core` dual** | **DENIED** |
| **Reopen J-HRM-ATT-07-*** / **J-HRM-ATT-06-04** without regression | **DENIED** |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** (PAY OUT) |
| **Seed in UAT evidence** | **DENIED** (U65) |
| **C-SLICE-≠-MODULE** | **RETAIN** |

---

## 8. Validation and acceptance evidence plan (SA → BA/QA)

| Layer | Plan |
|-------|------|
| **L0** | `qc:fe-be-health` · Nest `/core` leave **0** |
| **L2** | Employee profile post-activate · attendance leave panel |
| **L2.5** | **J-HRM-ATT-12-*** DRAFT: (1) CORE-07 activate FE `effective_date` (2) Network activate **2xx** + `employee.activated` in `events[]` (3) F5 employee — balances per policy visible (4) default shift/assignment visible or rule-resolved (5) submit leave **2xx** peer (6) **J-HRM-ATT-06-04** compensatory panel **non-regression** (7) **J-HRM-ATT-07-03..05** sick submit **non-regression** (subset) |
| **Honesty** | Evidence **≠ ATT-12 DONE** · **≠ ATT UAT** · emit labeled **necessary not sufficient** |
| **Regression** | **DENY reopen J-HRM-ATT-07-*** / **J-06-04** · must_keep **ATT07QC1** + **ATT06QC1** |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-ATT-12: **RETAIN** CORE-07 `POST …/activate` + **`employee.activated`** emit (**R-CORE-07-ATT-12**) · **RETAIN** ATT-04 `leave-accrual-policies/effective` + `employee_leave_balances` + PUT **tracked-entitlement** (manual parallel) · **RETAIN** ATT-01 `work-shifts/effective` + ATT-02 rule peer; **GAP** **R-ATT-12-CONSUMER/LEAVE-GRANT/HALF-MONTH/SHIFT-DEFAULT/FE-CONFIRM/IDEMPOTENT**; **HOLD** F-ATT-LEAVE-04 periodic accrue footer; **DENY** att_leave_hold · merge buckets · Nest `/core` · reopen **J-HRM-ATT-07-*** / **J-06-04**; must_keep **ATT07QC1+ATT06QC1+ATT05BQC1+ATT05QC1+ATT09+ATT04+CORE07** + ATT-10/11/03d peers; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** (BA-01 AC pack) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-12 · FR-UC-BP-ATT-12 · BR-BP-LC-03 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md (R-CORE-07-ATT-12 emit · DENY grant on CORE)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md (LVRULE · tracked-entitlement · R-ATT-04-ENGINE HOLD)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md (R-ATT-01-ASSIGN · default shift slice)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md (must_keep ATT07QC1 · DENY reopen J-HRM-ATT-07-* / J-06-04)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md (must_keep ATT06QC1 · DENY merge compensatory→annual)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-12 · Diễn biến #1–#2 · FR-UC-BP-CORE-07 peer)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md (ATT07QC1-MSM9GWC1 must_keep)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md
  - O1–O16 CONFIRM (emit RETAIN · consumer GAP · LVRULE grant · half-month · default shift · HCNS confirm · idempotent · peers must_keep · honesty)
  - mint J-HRM-ATT-12-01..0n DRAFT (activate FE → F5 balances + shift · Nest /core 0 · J-06-04 + J-07 subset regression)
  - explicit ≠ ATT-12 DONE · ≠ ATT-07/06/05 DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - DENY invent att_leave_hold · DENY Nest /core dual · DENY merge buckets · DENY claim emit alone = DONE · DENY reopen J-HRM-ATT-07-* / J-06-04 without regression
  - must_keep: ATT07QC1-MSM9GWC1 · ATT06QC1-MSM84GWC1 · ATT05BQC1-MSM5SDQC1 · ATT05QC1-MSM52GWC1 · ATT09QC1-MSLUTL9D · ATT04BQC1 · ATT04QC1 · CORE07QC1-KZJTSHNT · peer ATT chain
  - unlock next: ba-data HOLD default → sa API-01 (if enroll/shift physicalize stamped) → dev-be/dev-fe HOLD until CONFIRMED
  - ack_status PASS_TO_PM · next_owner ba-data (HOLD) or pm
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · honesty flip · wipe ATT07QC1/06/05/09 seals · reopen J-HRM-ATT-07-* / J-06-04 without regression
```
