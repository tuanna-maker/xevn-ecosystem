# PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01 — Option/F.1 · Nghỉ ốm — chế độ BH + hỗ trợ CTY — RETAIN phân loại catalog + VAL chứng từ + đơn phép · gap thứ tự quỹ / nhánh ngày

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** after ATT-06 QC GWC) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** merge compensatory→annual · **DENY** wipe ATT peer seals · **DENY** reopen **J-HRM-ATT-06-*** without regression · **DENY** honesty flip · **DENY** claim ATT-07 / ATT module UAT DONE · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → (ba-data HOLD default) → API/BE residual only after BA stamps · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC GWC **`ATT06QC1-MSM84GWC1`** · `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qc-01.md` · seat **#39 SEALED** · board **#40 UC-BP-ATT-07** · **must_keep** **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** (**DENY `att_leave_hold`**) · **`ATT03DQC1-MSM1CR19`** · **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** · **`ATT04BQC1`** · **`ATT04QC1`** · **R-ATT-06-AGG** peer HOLD · **R-ATT-05-*** · **R-ATT-01-ASSIGN open** · Nest `/core` **DENY** · **≠ ATT UAT** · PAY OUT · printable **false** |
| **uc_ids** | `UC-BP-ATT-07` · `FR-UC-BP-ATT-07` · **BR-BP-LV-04** · peer **BR-LEAVE-ATT-01** (attach) |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#40** Wave-35 after ATT-06 (#39 SEALED GWC) |
| **ref_sa_spine** | ATT-06 [`PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md) · ATT-09 hold [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) · ATT-05b panel [`PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md) · ATT-04 catalog [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) · ATT-08 preview [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md) · ATT-10 AGG [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md) · ATT-11 sign [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) · PLT leave catalog consumer [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) |
| **ref_honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · product_go **false** · **DENY claim ATT-07 / FR-07 DONE alone** · **DENY claim sick picker / VAL-ATT alone = FR-07 LIVE** · **DENY claim ATT-06 / ATT-05/05b/04/04b DONE from 07 seat** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-07** · Diễn biến **#1 · #2** · Luồng chính **1–4** · **BR-BP-LV-04** · đặc biệt «vượt ngày BH» · «còn phép năm» · DV-16 |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · **F-ATT-CAT-LVT/EFF** · **F-ATT-LEAVE-02** submit · **F-ATT-LEAVE-01** preview (ATT-08) · **F-ATT-SHEET-01** AGG paid/unpaid leave hours · **F-ATT-LEAVE-BAL** panel (5 buckets — **sick ∉ MVP panel**) |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — leave-types/effective · leave-requests · preview-deduction · aggregate · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` — `att_leave_type` (`insurance_regime_flag` · `company_topup_flag` · `category` · `metadata_json`) · `leave_requests` · `employee_leave_balances` (MVP types **không** có bucket `sick` riêng) · **DV-16** · **DENY** physical `att_leave_hold` |
| **ref_code** | **read-only cite:** `att-leave-type.service` CRUD + EFF list flags · `leave-requests.service` `resolveIsSickLeaveType` · `assertSickAttachmentIfRequired` → **`HRM-LEAVE-VAL-ATT`** · `createLeaveRequest` catalog assert + overlap + balance (balance key = `leave_type` code — thường **không** row `sick` → skip balance) · `att-timesheet-line-aggregate` `isUnpaidLeaveTypeKey` (**sick = paid** default) · **ABSENT:** tenant **fund-order** CRUD · per-day **branch allocator** · `insurance_regime` vs `company_topup` day codes on sheet lines |
| **OUT** | Nest `/core` dual sick SoT · wipe **ATT06QC1** / **ATT05BQC1** / **ATT05QC1** / **ATT09** seals · invent `att_leave_hold` · merge **compensatory→annual** · merge sick into **annual** panel bucket · invent ASSIGN/PAY/printable/CORE-10 BH DONE · claim **sick dropdown + attach VAL** alone = ATT-07 DONE · claim **ATT-06 compensatory** regression · reopen **J-HRM-ATT-06-01..07** without bus stamp · ATT UAT flip · seed |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-35 architecture unlock: **Nghỉ ốm — BH hoặc hỗ trợ CTY** (FR-UC-BP-ATT-07 · BR-BP-LV-04) vs AS-IS LIVE phân loại ốm + chứng từ + đơn phép — **gap** thứ tự quỹ tenant + phân nhánh ngày + phễu công/lương |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after ATT-06 QC GWC (`ATT06QC1-MSM84GWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-07 · BR-BP-LV-04 · BR-LEAVE-ATT-01 · DV-16 · must_keep full ATT peer chain through **ATT06QC1** · bind **ATT-10** (paid/unpaid leave funnel) · **ATT-11** (chốt bảng công PAY gate) · **CORE-10** (BHXH lifecycle — **context HOLD** · PAY OUT) · Nest `/core` DENY · PAY OUT · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-06 SEALED (`ATT06QC1-MSM84GWC1`):** OT-comp policy/accrual · `compensatory` bucket separate · **DENY merge→annual** · **J-HRM-ATT-06-01..07** sealed · **DENY reopen** without regression. **Danh mục loại phép (PRESENT — RETAIN cite ATT-04 / PLT):** Nest `att_leave_type` + `GET …/leave-types/effective` · cột/flag **`insurance_regime_flag`** · **`company_topup_flag`** · `category` / `metadata_json` (`is_sick`) — paper A4 ATT-07. **Phân loại nghỉ ốm (PRESENT):** `leave-requests.service` `resolveIsSickLeaveType` (code `sick`/`LVT_02` · catalog `category=sick` · `insuranceRegimeFlag` · label VI · metadata). **Chứng từ ốm (PRESENT):** `assertSickAttachmentIfRequired` — ốm ≥ **3** ngày thiếu `attachment_url` → **`HRM-LEAVE-VAL-ATT`** (khác lỗi «mã loại ngoài danh mục»). **Nộp đơn (PRESENT — peer ATT-09):** `POST …/leave-requests` · catalog assert **`HRM-LEAVE-TYPE-UNKNOWN`** · overlap · **`pending_days`** hold khi có row balance cùng `leave_type` · **DENY `att_leave_hold`**. **Số dư:** `MVP_LEAVE_BALANCE_TYPES` = annual/seniority/compensatory/carry_over/advance — **không** có bucket «quỹ ốm BH/CTY» trên panel ATT-05b; sick thường **không** track `employee_leave_balances` → balance gate **skip** (SRS «nếu theo dõi»). **Preview ngày (PRESENT — ATT-08):** `preview-deduction` + holiday engine cho `total_days` align. **Phễu bảng công (PRESENT — ATT-10 context):** leave trên `attendance_records` → `paid_leave_hours` / `unpaid_leave_hours`; **`isUnpaidLeaveTypeKey`** chỉ `unpaid`/`lvt_04` — **sick mặc định paid** · **không** tách nhánh BH vs CTY trên dòng. **ABSENT / GAP:** tenant **CRUD thứ tự trừ quỹ** (annual · BH · CTY · không lương — SRS «cấu hình được») · **engine phân bổ từng ngày** đúng **một nhánh** (BR-BP-LV-04 · DV-16) · vượt ngày BH → CTY/không lương · optional trừ **annual** trước nếu cấu hình · mã ngày công/lương theo nhánh trên sheet/records · đồng bộ **CORE-10** insurance regime (cross-module HOLD). **Nest `@Controller('core')`:** **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-07: NV chọn **loại ốm ∈ danh mục hiệu lực** · nộp đơn (chứng từ nếu rule) · hệ thống **áp thứ tự trừ đã cấu hình** · mỗi ngày **một nhánh** (phép năm / BH / CTY hỗ trợ / không lương) · **cấm** BH + CTY 100% cùng ngày không rule · bảng công nhận **đúng mã ngày** · sẵn sàng chốt (ATT-11). |
| **Gap class** | **GĐ1 continuous AC** on LIVE **sick classify + attach VAL + leave TXN + catalog flags** + residuals **fund-order policy + day-branch allocator + AGG/sheet day codes + DV-16 enforcement + CORE-10 read HOLD** — **not** greenfield leave module; **not** conflate attach VAL with FR-07 DONE; **not** invent `att_leave_hold`; **not** merge compensatory/annual; **not** regress ATT-06 OT-comp seals. |
| **Constraints** | U89 · preserve **`ATT06QC1`** + **`ATT06QA1`** + **`ATT05BQC1`** + **`ATT05QC1`** + **`ATT04BQC1`** + **`ATT04QC1`** + **`ATT09QC1`** + **`ATT03DQC1`** + ATT-10/11 seals · **DENY merge compensatory→annual** · **DENY reopen J-HRM-ATT-06-*** · C-SLICE · U65 · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Team claims sick picker + doctor attach = ATT-07 UAT; builds second hold ledger; merges OT-comp or sick into annual; reopens ATT-06 journeys; ignores fund-order SRS; double BH+CTY on payroll |

### 1.2 Relation to ATT-10 (AGG), ATT-11 (sign/close), CORE-10 (BHXH) — context gates

| Seat | Role for ATT-07 | SA lock |
|------|-----------------|--------|
| **#30 FR-UC-BP-ATT-10** | Leave hours vào `paid_leave_hours` / `unpaid_leave_hours` trên `att_timesheet_line` | **RETAIN cite** · today sick → **paid** unless `unpaid` key · **GAP** **R-ATT-07-AGG**: day-level **branch code** (BH / CTY / annual / unpaid) khi allocator LIVE · **HOLD** footer until engine · non-blocking GWC |
| **#31 FR-UC-BP-ATT-11** | Chốt sheet trước PAY | **RETAIN cite** · **≠** trigger phân nhánh ốm · PAY đọc sheet closed (**PAY-01 OUT**) |
| **#25 FR-UC-BP-CORE-10** | BHXH lifecycle / regime eligibility | **RETAIN cite** · **HOLD** **R-ATT-07-CORE10** cross-read · **≠** invent CORE-10 DONE trong slice ATT-07 · PAY OUT |
| **#39 FR-UC-BP-ATT-06** | Quỹ `compensatory` · policy OT-comp | **must_keep** **`ATT06QC1`** · **DENY** merge compensatory→annual · **DENY** reopen **J-HRM-ATT-06-01..07** without regression evidence |

### 1.3 Architecture diagram (target — Option A)

```text
  ATT-06 (ATT06QC1) · ATT-05b (ATT05BQC1) · ATT-05 (ATT05QC1) · ATT-04/04b · ATT-09 · ATT-08 · ATT-03d
  ATT-10 (ATT10QC1) AGG · ATT-11 (ATT11QC1) sign · CORE-10 (context HOLD) — SEALED must_keep
  Nest /core DENY · printable false · PAY OUT · honesty false · DENY merge compensatory→annual
       │
       ▼
  ┌──────── FR-UC-BP-ATT-07 (gap-only RETAIN spine + fund-order / day-branch residuals) ────┐
  │ RETAIN LIVE (cite — ≠ FR-07 DONE alone)                                                   │
  │   F-ATT-CAT-LVT/EFF — loại ốm ∈ catalog · insurance_regime_flag · company_topup_flag       │
  │   resolveIsSickLeaveType + HRM-LEAVE-VAL-ATT (≥3 ngày · attachment_url)                    │
  │   POST leave-requests + pending_days hold (ATT-09) · preview-deduction (ATT-08)            │
  │   Panel ATT-05b — 5 buckets MVP (sick ∉ panel — đúng paper)                                │
  │                                                                                            │
  │ RESIDUAL unlock (BA → DATA/API/BE — BR-BP-LV-04 engine)                                    │
  │   R-ATT-07-POLICY-ORDER : CRUD thứ tự quỹ tenant (annual|insurance|company|unpaid)         │
  │   R-ATT-07-DAY-BRANCH   : per-day allocator · một nhánh/ngày · DV-16                       │
  │   R-ATT-07-OVER-BH      : vượt ngày BH → CTY hoặc không lương theo cấu hình                │
  │   R-ATT-07-ANNUAL-FIRST : optional trừ annual trước nếu order config                      │
  │   R-ATT-07-SHEET-CODE   : mã ngày công trên records/lines theo nhánh                       │
  │   R-ATT-07-AGG          : ATT-10 funnel reflects branch (paid/unpaid/BH flags)             │
  │   R-ATT-07-CORE10       : read insurance eligibility HOLD · ≠ CORE DONE                    │
  │   R-ATT-07-FE-PICKER    : LeaveTab sick type ∈ EFF · không free-text SoT                   │
  │   mint J-HRM-ATT-07-* DRAFT for QA L2.5                                                  │
  │   Paper F-ATT-* /att + /core = ALIAS ONLY                                                  │
  └────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼ OUT this seat
  att_leave_hold second ledger              = DENY (ATT-09)
  Nest /core dual sick SoT                  = DENY
  Merge compensatory → annual               = DENY (ATT-06 + ATT-05)
  Merge sick into annual panel bucket       = DENY
  Claim attach VAL / sick picker alone DONE = DENY
  Reopen J-HRM-ATT-06-* without regression  = DENY
  Claim ATT-06/05/05b/04/ATT UAT            = DENY
  Invent ASSIGN / PAY / printable DONE      = DENY
```

**Label lock:** Board «Nghỉ ốm BH/CTY» GĐ1 = **RETAIN cite** catalog flags + sick classify + attach VAL + leave TXN/hold peers **+ gap AC** for **fund-order + day-branch + sheet codes + AGG/CORE10 footers** — **not** picker/attach alone; **not** ATT UAT.  
**Balance lock:** Nghỉ ốm **không** yêu cầu thêm bucket `sick` trên panel MVP ATT-05b trừ khi BA stamp physical quỹ riêng (default **OUT** — SRS nhánh BH/CTY ≠ bucket `annual`).

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / BR-BP-LV-04) | AS-IS LIVE | Verdict |
|------------|---------------------------|------------|---------|
| Loại ốm ∈ danh mục | Đầu vào · cấm free-text | F-ATT-CAT-EFF + assert UNKNOWN | **RETAIN cite** |
| Cờ BH / CTY trên loại | BR-BP-LV-04 | `insurance_regime_flag` · `company_topup_flag` | **RETAIN cite** |
| Phân loại ốm runtime | BR-LEAVE-ATT-01 | `resolveIsSickLeaveType` | **RETAIN cite** |
| Chứng từ ≥3 ngày | Diễn biến #1 | `HRM-LEAVE-VAL-ATT` | **RETAIN cite** · **≠ FR-07 DONE** |
| Nộp đơn + hold | #1 hold nhánh | `POST leave-requests` · `pending_days` | **RETAIN cite** · ATT-09 |
| Preview ngày | peer ATT-08 | `preview-deduction` engine | **RETAIN cite** |
| Thứ tự trừ quỹ CRUD | Tiên quyết SRS | **ABSENT** dedicated API | **GAP** **R-ATT-07-POLICY-ORDER** |
| Áp thứ tự / ngày | Diễn biến #2 | **ABSENT** allocator | **GAP** **R-ATT-07-DAY-BRANCH** |
| Vượt ngày BH | Đặc biệt SRS | **ABSENT** | **GAP** **R-ATT-07-OVER-BH** |
| Trừ annual trước (optional) | Đặc biệt SRS | **ABSENT** order | **GAP** **R-ATT-07-ANNUAL-FIRST** |
| Mã ngày bảng công | Luồng 4 | sick → paid generic | **GAP** **R-ATT-07-SHEET-CODE** · **R-ATT-07-AGG** footer |
| DV-16 dual BH+CTY | DB design | **ABSENT** enforce | **GAP** **R-ATT-07-DV16** |
| CORE-10 cross-read | HR-004 | CORE module peer | **HOLD** **R-ATT-07-CORE10** |
| Panel quỹ ốm | — | sick **not** in MVP 5 buckets | **RETAIN** (correct) · **DENY** invent annual merge |
| `compensatory` OT-comp | peer ATT-06 | separate bucket | **must_keep** · **DENY merge→annual** |
| `pending_days` hold | peer ATT-09 | **PRESENT** | **must_keep** · **DENY `att_leave_hold`** |
| Nest `/core` | alias | **ABSENT** | **alias only** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-07 DONE** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN sick classify + catalog flags + attach VAL + leave TXN + gap fund-order / day-branch AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** `att_leave_type` EFF + `insurance_regime_flag` / `company_topup_flag` · sick resolver · **`HRM-LEAVE-VAL-ATT`** · `POST leave-requests` + **ATT-09** `pending_days` · **ATT-08** preview · **ATT-05b** panel (no sick bucket). Unlock BA residuals **R-ATT-07-*** for tenant **fund-order CRUD** · **per-day branch allocator** (DV-16) · sheet/AGG day codes · optional annual-first · **ATT-10/11** context + **CORE-10** HOLD footer. **must_keep** **ATT06QC1** + full peer chain. **DENY** `att_leave_hold` · merge compensatory→annual · reopen **J-HRM-ATT-06-***. |
| **Scope** | Docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium–high (policy order + day allocator + AGG branch codes) |
| **Risk** | Low if BA separates **VAL-ATT DONE** vs **fund-order DONE** and keeps ATT-06 seals |
| **Pros** | Matches LIVE leave spine + paper flags; SRS testable partially today (submit + attach); clear engine boundary |
| **Cons** | Full FR-07 needs policy table + day ledger + AGG branch writer |
| **Failure modes** | Attach alone claimed UAT; sick forced into annual deduct; ATT-06 regression |
| **Mitigation** | J-HRM-ATT-07-* · U65 sick submit → Network 2xx → F5 · **DENY** reopen J-06 |

### Option B — invent `att_leave_hold` / Nest `/core` sick SoT / merge sick or compensatory into annual / wipe ATT-06 seals (REJECT)

| | |
|--|--|
| **Summary** | Second hold ledger; `/core` sick policy SoT; fold sick into `annual` panel; demote `compensatory`; wipe **ATT06QC1** / **ATT05QC1** |
| **Pros** | Illusion of one pool / one ledger |
| **Cons** | Violates **`ATT09QC1`** · **`ATT06QC1`** (**DENY merge compensatory→annual**) · **`ATT05BQC1`** · BR-BP-LV-04 type separation |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim sick picker + attach VAL alone = ATT-07 DONE / ATT UAT flip (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because LeaveTab has «Ốm» and ≥3-day attach works; skip fund-order + day-branch AC; flip `attendance_uat_ready` |
| **Pros** | Fast chat claim |
| **Cons** | Violates SRS Diễn biến **#2** · UC_BR_MATRIX **MISSING** · board #40 · **C-SLICE** |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+engine gap) | B (dual/merge) | C (claim DONE) |
|-----------|-------:|----------------------:|---------------:|---------------:|
| Business value (FR-07) | 5 | **4** | 1 | 0 |
| Preserve ATT-06/05/09/04 seals | 5 | **5** | 0 | 0 |
| Honesty / seal safety | 5 | **5** | 0 | 0 |
| ATT-10/11/CORE-10 gate correctness | 4 | **4** | 1 | 0 |
| Time to deliver | 4 | **3** | 2 | Fake PASS |
| Fit LIVE classify + leave TXN | 5 | **5** | 0 | 2 |
| **Weighted** | | **high** | low | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE sick catalog flags + classify + attach VAL + leave submit/hold + preview peers; unlock **R-ATT-07-*** policy/order/branch/sheet/AGG/CORE10 AC; **HOLD** footers until engine; **RETAIN** ATT-10/11/CORE-10 as **context gates**; **DENY** `att_leave_hold` · merge buckets · Nest `/core` · reopen **J-HRM-ATT-06-*** · honesty flip |
| **Why selected** | SRS core gap is **configurable fund order + per-day single branch** (BR-BP-LV-04) — not greenfield sick form; LIVE already exposes **catalog flags**, **sick detection**, and **attach validation** for U65 partial path |
| **Assumptions** | Fund order stored per tenant/company scope (slug resolver U19); day branch persisted on leave_request lines or attendance day records; `insurance_regime_flag` ∧ `company_topup_flag` on **same type** blocked at config (DV-16) not only at runtime |
| **Rejected** | **B** dual hold / merge sick or compensatory · **C** attach/picker-alone DONE / ATT UAT |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Catalog flags | RETAIN `insurance_regime_flag` · `company_topup_flag` | AC cite · DV-16 config rule |
| O2 | Sick classify | RETAIN `resolveIsSickLeaveType` | AC · catalog + code paths |
| O3 | Attach VAL | RETAIN `HRM-LEAVE-VAL-ATT` ≥3d | AC · **≠** FR-07 DONE alone |
| O4 | Leave submit + hold | RETAIN ATT-09 `pending_days` | AC · **DENY `att_leave_hold`** |
| O5 | Preview days | RETAIN ATT-08 engine | AC peer cite |
| O6 | Panel MVP | sick **not** in 5 buckets | AC · **DENY** merge sick→annual display |
| O7 | Fund order CRUD | GAP **R-ATT-07-POLICY-ORDER** | AC tenant CRUD + default order |
| O8 | Day branch engine | GAP **R-ATT-07-DAY-BRANCH** | AC Diễn biến **#2** · one branch/day |
| O9 | Over BH days | SRS đặc biệt | AC **R-ATT-07-OVER-BH** |
| O10 | Annual-first optional | SRS đặc biệt | AC **R-ATT-07-ANNUAL-FIRST** |
| O11 | Sheet day codes | Luồng 4 | AC **R-ATT-07-SHEET-CODE** |
| O12 | ATT-10 AGG | footer branch hours | AC **R-ATT-07-AGG** HOLD |
| O13 | ATT-11 close | **not** branch trigger | AC explicit |
| O14 | CORE-10 | cross-read HOLD | AC **R-ATT-07-CORE10** · PAY OUT |
| O15 | ATT-06 peer | must_keep **`ATT06QC1`** | **DENY merge compensatory→annual** · **DENY reopen J-06** |
| O16 | ATT-05/05b peers | must_keep **`ATT05BQC1`** **`ATT05QC1`** | **DENY wipe** |
| O17 | ATT-09 peer | must_keep **`ATT09QC1`** | **DENY `att_leave_hold`** |
| O18 | ATT-04/04b | must_keep **`ATT04QC1`** **`ATT04BQC1`** | **DENY wipe** |
| O19 | Paper `/core` | Alias only | DENY Nest dual |
| O20 | Honesty | false · C-SLICE · mint **J-HRM-ATT-07-*** | **≠ ATT-07 / ATT UAT DONE** |

---

## 5. F.1 API map sketch (§F.1 — mục đích · nghiệp vụ · bước SRS)

> Physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core/*` = **alias only** · deepen = later **sa API-01** seat after BA stamps.

| F-id (cite) | METHOD/path (prefer) | Mục đích (VI) | Nghiệp vụ xử lý (BE) | Bước SRS (FR-UC-BP-ATT-07) | Disposition |
|-------------|----------------------|---------------|----------------------|----------------------------|-------------|
| **F-ATT-CAT-LVT EFF** | `GET …/leave-types/effective` | Picker loại ốm | Filter EFF · expose `insuranceRegimeFlag` · `companyTopupFlag` · sick metadata | Đầu vào loại ốm | **RETAIN cite** · ATT-04/PLT |
| **F-ATT-CAT-LVT admin** | `GET/POST/PATCH …/leave-types*` | Cấu hình cờ BH/CTY trên loại | CRUD `att_leave_type` · DV-16 guard mutual flags | Tiên quyết policy | **RETAIN cite** |
| **F-ATT-LEAVE-02 submit** | `POST …/leave-requests` | Nộp đơn ốm | Classify sick · VAL-ATT · overlap · balance if tracked · `pending_days` | **#1** | **RETAIN cite** · ATT-09 |
| **F-ATT-LEAVE-01 preview** | `POST …/preview-deduction` | Dự kiến ngày trừ | ATT-08 holiday engine | **#2** input | **RETAIN cite** |
| **F-ATT-LEAVE-BAL panel** | `GET …/leave-balance/panel` | Panel khi nộp đơn (peer) | 5 MVP buckets — **sick ∉ list** | Optional annual in order | **RETAIN cite** · ATT-05b · **≠** sick bucket invent |
| **F-ATT-SICK-POLICY-ORDER** *(paper)* | `GET/PUT …/sick-leave-fund-order` *(proposed)* | CRUD thứ tự trừ quỹ | Ordered enum[] tenant · validate no dup · default paper | Tiên quyết SRS | **GAP** **R-ATT-07-POLICY-ORDER** |
| **F-ATT-SICK-DAY-BRANCH** *(paper)* | side-effect on approve/submit *(proposed)* | Gán nhánh từng ngày | Allocator: annual→BH→CTY→unpaid per config · DV-16 | **#2** | **GAP** **R-ATT-07-DAY-BRANCH** |
| **F-ATT-SICK-SHEET-CODE** *(paper)* | write on `attendance_records` / line meta *(proposed)* | Mã ngày công theo nhánh | Map branch → day status/label for sheet | Luồng **4** | **GAP** **R-ATT-07-SHEET-CODE** |
| **F-ATT-SHEET-01 AGG** | `POST …/attendance-sheets/:id/aggregate` | Phễu paid/unpaid leave | Today: sick→paid unless unpaid key | Công/lương đúng nhánh | **RETAIN cite** · ATT-10 · **R-ATT-07-AGG** footer |
| **F-ATT-SHEET-02 close** | `POST …/attendance-sheets/:id/close` | Chốt bảng công | Lock lines | PAY prereq | **RETAIN cite** · ATT-11 |
| **CORE-10 insurance** *(peer)* | `GET …/employees/:id/insurance-*` *(CORE)* | Eligibility BH | Read lifecycle | Context HOLD | **HOLD** **R-ATT-07-CORE10** · PAY OUT |

**DENY:** invent Nest `@Controller('core')` sick SoT · invent `att_leave_hold` · merge **compensatory→annual** (ATT-06) · merge sick display into **annual** panel · claim **VAL-ATT** or **EFF picker** alone = FR-07 UAT · reopen **J-HRM-ATT-06-01..07** without regression bus stamp.

### 5.1 must_keep peer chain (DENY reopen without regression)

| Stamp / journey | Lock |
|-----------------|------|
| **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** | OT-comp policy/accrual · compensatory separate · **J-HRM-ATT-06-01..07** |
| **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** | Panel · carry_over · **DENY merge→annual** |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` · **DENY `att_leave_hold`** |
| **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** | LVT/LVRULE/grant |
| **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** | AGG + sign context |
| **`ATT03DQC1-MSM1CR19`** + ATT-08/02/01/03b + PLT/CORE | full ATT chain |

**Regression rule:** Any change touching `leave-requests` balance/hold · `leave-balance` panel buckets · OT-comp accrual · **must** re-run **J-HRM-ATT-06-04..07** smoke before sealing ATT-07 QC — **DENY** silent regression.

---

## 6. unlock_lane

```text
BA-01 (ba-process) AC pack O1–O20 + mint J-HRM-ATT-07-* DRAFT
  → ba-data HOLD default (policy order + day-branch physicalize only if BA stamps — no att_leave_hold)
  → sa API-01 deepen F-ATT-SICK-POLICY-ORDER / F-ATT-SICK-DAY-BRANCH if stamped
  → dev-be BE-01 allocator + policy (HOLD until BA CONFIRMED)
  → dev-fe FE-01 sick picker flags + attach UX (narrow)
  → QA U65 J-HRM-ATT-07-* (sick type ∈ EFF · attach rule · submit 2xx · F5 · Nest /core 0 · J-06 regression subset)
  → QC GWC C-SLICE (≠ ATT-07/ATT UAT · must_keep ATT06QC1 + peer chain)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + **PASS_TO_PM** |
| 2. BA O1–O20 AC + J-HRM-ATT-07-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default | ba-data | **no** `att_leave_hold` |
| 4. sa API-01 if stamped | sa | F.1 physicalize policy/branch |
| 5. dev-be / dev-fe | execution | HOLD until BA CONFIRMED |
| 6. QA / QC | execution | U65 · C-SLICE honesty · **J-06 non-regression** |

---

## 7. must_keep / forbidden_paths / honesty locks

### must_keep (RETAIN — DENY wipe / DENY reopen without regression)

| Stamp / artifact | Lock |
|------------------|------|
| **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** | ATT-06 OT-comp · **DENY merge compensatory→annual** · **J-HRM-ATT-06-*** |
| **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** | Panel · carry · **DENY merge carry→annual** |
| **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** | ATT-04/04b |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` · **DENY `att_leave_hold`** |
| **`ATT03DQC1-MSM1CR19`** | GPS |
| **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** | AGG + sign · **≠ DONE alone** |
| **J-HRM-ATT-06-01..07** | **DENY reopen** without regression evidence |

### forbidden_paths (default DENY unless BA unlock lists allowed_paths)

```text
**/att_leave_hold**
apps/api/hrm-api/src/**/core.controller.ts
apps/api/hrm-api/src/attendance/leave-balance.service.ts   # merge compensatory→annual · invent sick→annual panel
apps/api/hrm-api/src/attendance/leave-requests.service.ts  # invent att_leave_hold — ATT-09 owned
apps/api/hrm-api/src/attendance/**/ot-comp*                # ATT-06 owned — no sick regression
honesty flags · SERVICE_READINESS promote
```

### honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-07 / FR-07 DONE** from Option A alone | **LOCKED** |
| **≠ ATT-06 / ATT-05/05b/04/04b DONE** from 07 seat | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=true` | **LOCKED** |
| **Sick picker + VAL-ATT alone = FR-07 LIVE** | **DENIED** |
| **Merge compensatory→annual · merge sick→annual panel** | **DENIED** |
| **Invent `att_leave_hold` · Nest `/core` dual** | **DENIED** |
| **Reopen J-HRM-ATT-06-*** without regression | **DENIED** |
| **Invent ASSIGN / PAY / printable / CORE-10 DONE** | **DENIED** (PAY OUT) |
| **Seed in UAT evidence** | **DENIED** (U65) |
| **C-SLICE-≠-MODULE** | **RETAIN** |

---

## 8. Validation and acceptance evidence plan (SA → BA/QA)

| Layer | Plan |
|-------|------|
| **L0** | `qc:fe-be-health` · Nest `/core` leave **0** |
| **L2** | LeaveTab · Settings leave-types (flags visible) |
| **L2.5** | **J-HRM-ATT-07-*** DRAFT: (1) pick sick ∈ EFF (2) attach rule ≥3d (3) submit 2xx (4) hold if tracked (5) F5 (6) fund-order config HOLD footer until engine (7) **J-HRM-ATT-06-04** compensatory read **non-regression** |
| **Honesty** | Evidence **≠ ATT-07 DONE** · **≠ ATT UAT** · VAL-ATT labeled **partial** |
| **Regression** | **DENY reopen J-HRM-ATT-06-*** · must_keep **ATT06QC1** compensatory sep |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-ATT-07: RETAIN LIVE sick catalog flags (`insurance_regime_flag` · `company_topup_flag`) + `resolveIsSickLeaveType` + **`HRM-LEAVE-VAL-ATT`** + `POST leave-requests`/`pending_days` (ATT-09) + ATT-08 preview + ATT-05b panel (no sick bucket); GAP **R-ATT-07-POLICY-ORDER/DAY-BRANCH/OVER-BH/ANNUAL-FIRST/SHEET-CODE/AGG/DV16/CORE10/FE-PICKER**; ATT-10/11/CORE-10 bound as context gates; **DENY** att_leave_hold · merge compensatory→annual · sick→annual panel · reopen **J-HRM-ATT-06-***; must_keep **ATT06QC1+ATT06QA1+ATT05BQC1+ATT05QC1+ATT09+ATT04 peers+ATT10/11**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** (BA-01 AC pack) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-07 · FR-UC-BP-ATT-07 · BR-BP-LV-04 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md (must_keep ATT06QC1 · DENY merge compensatory→annual · DENY reopen J-HRM-ATT-06-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md (panel 5 buckets — sick ∉ MVP)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md (att_leave_type flags)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md (preview-deduction)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md (paid/unpaid funnel · R-ATT-07-AGG footer)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md (close ≠ branch trigger)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md (EFF picker SoT)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-07 · Diễn biến #1–#2 · BR-BP-LV-04 · DV-16)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qc-01.md (ATT06QC1-MSM84GWC1 must_keep)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md
  - O1–O20 CONFIRM (catalog flags RETAIN · sick classify · VAL-ATT · submit/hold · preview · panel no sick bucket · fund-order GAP · day-branch GAP · over-BH · annual-first · sheet codes · ATT-10/11/CORE10 gates · peers must_keep · honesty)
  - mint J-HRM-ATT-07-01..0n DRAFT (sick ∈ EFF · attach ≥3d rule · submit 2xx · F5 · fund-order HOLD footer · Nest /core 0 · J-HRM-ATT-06-04 compensatory non-regression)
  - explicit ≠ ATT-07 DONE · ≠ ATT-06/05/05b/04/04b DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - DENY invent att_leave_hold · DENY Nest /core dual · DENY merge compensatory/carry/sick into annual · DENY claim VAL-ATT/picker alone = DONE · DENY reopen J-HRM-ATT-06-* without regression
  - must_keep: ATT06QC1-MSM84GWC1 · ATT06QA1-MSM84RYS · ATT05BQC1-MSM5SDQC1 · ATT05QC1-MSM52GWC1 · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · ATT10QC1-MSLWGUYH · ATT11QC1-MSLXTH9P · peer ATT chain
  - unlock next: ba-data HOLD default → sa API-01 (if policy/branch physicalize stamped) → dev-be/dev-fe HOLD until CONFIRMED
  - ack_status PASS_TO_PM · next_owner ba-data (HOLD) or pm
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · honesty flip · wipe ATT06QC1/05/09 seals · reopen J-HRM-ATT-06-* without regression
```
