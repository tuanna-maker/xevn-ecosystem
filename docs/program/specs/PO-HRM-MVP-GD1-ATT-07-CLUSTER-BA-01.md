# BA AC pack — Wave-35 ATT cluster · UC-BP-ATT-07 (Nghỉ ốm BH/CTY · RETAIN phân loại catalog + VAL chứng từ + đơn phép · GAP thứ tự quỹ / nhánh ngày)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-35 seat **#40**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O20 **CONFIRMED** · **ba-data HOLD default** next · dev-be/dev-fe **HOLD** until DATA stamp · **DENY** claim sick picker / `HRM-LEAVE-VAL-ATT` alone = FR-07 DONE · **DENY** ATT-07 / ATT-06/05/05b/04/04b / ATT UAT DONE · **printable false RETAIN** · **PAY OUT** |
| **change_mode** | **ADD** (align SA-07 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** merge compensatory/sick/carry into `annual` · **no** wipe **`ATT06QC1-MSM84GWC1`** / peer seals · **DENY reopen J-HRM-ATT-06-*** without regression) |
| **uc_ids** | `UC-BP-ATT-07` · `FR-UC-BP-ATT-07` · **BR-BP-LV-04** · peer **BR-LEAVE-ATT-01** (attach) · **DV-16** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-06 **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** (**pending_days · DENY `att_leave_hold`**) · **`ATT03DQC1-MSM1CR19`** · **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** · **R-ATT-06-AGG** peer HOLD · **R-ATT-01-ASSIGN open** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-07** · Diễn biến **#1 · #2** · Luồng chính **1–4** · **BR-BP-LV-04** · đặc biệt «vượt ngày BH» · «còn phép năm» · **DV-16** |
| **ref_api_paper** | **F-ATT-CAT-LVT/EFF** · **F-ATT-LEAVE-02** submit · **F-ATT-LEAVE-01** preview (ATT-08) · **F-ATT-LEAVE-BAL** panel (5 buckets — sick ∉ MVP) · **F-ATT-SICK-POLICY-ORDER** *(GAP)* · **F-ATT-SICK-DAY-BRANCH** *(GAP)* · **F-ATT-SHEET-01** AGG peer |
| **ref_db** | `att_leave_type` (`insurance_regime_flag` · `company_topup_flag` · `category` · `metadata_json`) · `leave_requests` · `employee_leave_balances` (MVP **no** sick bucket on panel) · **DENY** physical `att_leave_hold` |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qc-01.md` (**ATT06QC1** must_keep · J-06 non-regression) |
| **Honesty** | `attendance_uat_ready=false` · **`contracts_printable_ready=false` RETAIN** · **C-SLICE-≠-MODULE** · **DENY** picker/VAL-ATT alone = FR-07 DONE · **DENY** ATT-07 / ATT-06/05/05b/04/04b / ATT UAT DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` · merge compensatory/sick/carry→annual · reopen **J-HRM-ATT-06-01..07** without regression · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-35 seat **#40** — **gap-only RETAIN** LIVE phân loại ốm (`insurance_regime_flag` · `company_topup_flag` · `resolveIsSickLeaveType`) · **`HRM-LEAVE-VAL-ATT`** (≥3 ngày · `attachment_url`) · `POST leave-requests` + **ATT-09** `pending_days` · **ATT-08** preview · **ATT-05b** panel (5 buckets — **sick ∉ panel**) — **GAP** tenant **fund-order CRUD** · **per-day branch allocator** (BR-BP-LV-04 · DV-16) · sheet/AGG day codes · optional annual-first · **ATT-10/11/CORE-10** context gates:

1. **Catalog flags + sick classify** = RETAIN cite — **≠** picker alone = FR-07 DONE (**O1–O2**).
2. **Attach VAL** = RETAIN — **≠** FR-07 DONE alone (**O3**).
3. **Leave submit + hold** = RETAIN ATT-09 — **DENY `att_leave_hold`** (**O4**).
4. **Preview + panel** = RETAIN peers ATT-08 / ATT-05b — sick **not** merged into `annual` display (**O5–O6**).
5. **Fund order + day branch** = GAP SRS Diễn biến **#2** (**O7–O11**).
6. **ATT-06 peer** = **must_keep** **`ATT06QC1`** — **DENY merge compensatory→annual** · **DENY reopen J-06** (**O15**).
7. **Honesty + J-*** = mint **`J-HRM-ATT-07-01..07` DRAFT** + **J-HRM-ATT-06-04** compensatory non-regression (**O20**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân viên | Chọn loại ốm ∈ EFF · nộp đơn · đính kèm chứng từ khi rule |
| Quản lý | Duyệt đơn (peer leave WF GĐ1) |
| HCNS | CRUD thứ tự quỹ tenant (GAP) · cấu hình cờ BH/CTY trên loại phép |
| Hệ thống | Classify sick · VAL-ATT · hold `pending_days` · (GAP) allocator một nhánh/ngày |
| ATT-06 / ATT-05b / ATT-09 / ATT-08 / ATT-10 / ATT-11 | Peers **must_keep** — **≠** claim DONE from 07 seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O20 CONFIRM · AC-ATT-07-* · residuals **R-ATT-07-*** · J-HRM-ATT-07-* DRAFT | Impl `apps/**` / migration / seed |
| RETAIN cite classify + attach + leave TXN/hold | Nest `/core` SoT · invent `att_leave_hold` |
| GAP AC fund-order + day-branch + sheet/AGG footers | PAY DONE · ATT module UAT flip |
| Unlock **ba-data HOLD** default | Claim VAL-ATT/picker alone = FR-07 DONE |
| J-HRM-ATT-06-04 non-regression | Reopen J-HRM-ATT-06-* without bus stamp |

### SA Option A — BA CONFIRM (đóng O1–O20)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Catalog flags | **YES RETAIN** — `att_leave_type` EFF exposes `insuranceRegimeFlag` · `companyTopupFlag` · sick metadata · admin CRUD flags — **AC-ATT-07-CAT-FLAGS** · DV-16 config guard at type level |
| **O2** | Sick classify runtime | **YES RETAIN** — `resolveIsSickLeaveType` (code `sick`/`LVT_02` · `category=sick` · flags · label VI · metadata) — **AC-ATT-07-SICK-CLASSIFY** |
| **O3** | Attach VAL | **YES RETAIN** — ốm ≥ **3** ngày thiếu `attachment_url` → **`HRM-LEAVE-VAL-ATT`** (khác `HRM-LEAVE-TYPE-UNKNOWN`) — **AC-ATT-07-VAL-ATT** · **AC-ATT-07-≠-VAL-DONE** |
| **O4** | Leave submit + hold | **YES RETAIN** — `POST …/leave-requests` · catalog assert · overlap · **`pending_days`** when balance row exists (**`ATT09QC1`**) · **DENY** invent `att_leave_hold` — **AC-ATT-07-SUBMIT-HOLD** · **AC-ATT-07-MK-ATT09** |
| **O5** | Preview days | **YES RETAIN cite** — **ATT-08** `preview-deduction` + holiday engine for `total_days` — **AC-ATT-07-MK-ATT08** |
| **O6** | Panel MVP | **YES RETAIN** — **ATT-05b** 5 buckets (annual/seniority/compensatory/carry_over/advance) — **sick ∉ panel** (đúng paper) · **DENY** merge sick display into `annual` — **AC-ATT-07-PANEL-NO-SICK** · **AC-ATT-07-≠-MERGE-SICK-ANNUAL** |
| **O7** | Fund order CRUD | **YES GAP** — tenant ordered enum[] (annual \| insurance \| company \| unpaid) · **R-ATT-07-POLICY-ORDER** — **AC-ATT-07-FUND-ORDER** |
| **O8** | Day branch engine | **YES GAP** — per-day **một nhánh** theo order + flags · SRS Diễn biến **#2** · **R-ATT-07-DAY-BRANCH** · **DV-16** — **AC-ATT-07-DAY-BRANCH** |
| **O9** | Over BH days | **YES GAP** — vượt ngày BH → CTY hoặc không lương theo cấu hình — **R-ATT-07-OVER-BH** — **AC-ATT-07-OVER-BH** |
| **O10** | Annual-first optional | **YES GAP** — optional trừ `annual` trước nếu order config — **R-ATT-07-ANNUAL-FIRST** — **AC-ATT-07-ANNUAL-FIRST** |
| **O11** | Sheet day codes | **YES GAP** — mã ngày công trên records/lines theo nhánh — **R-ATT-07-SHEET-CODE** — **AC-ATT-07-SHEET-CODE** |
| **O12** | ATT-10 AGG footer | **YES HOLD** — paid/unpaid funnel reflects branch when allocator LIVE — **R-ATT-07-AGG** — non-blocking GWC — **AC-ATT-07-AGG-FOOTER** |
| **O13** | ATT-11 close | **YES explicit** — chốt sheet **≠** trigger phân nhánh ốm — **AC-ATT-07-≠-CLOSE-TRIGGER** |
| **O14** | CORE-10 cross-read | **YES HOLD** — read insurance eligibility context · **≠** invent CORE-10 DONE in slice — **R-ATT-07-CORE10** · PAY OUT — **AC-ATT-07-CORE10-HOLD** |
| **O15** | ATT-06 peer | **YES must_keep** — **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** · **DENY merge compensatory→annual** · **DENY reopen J-HRM-ATT-06-01..07** without regression evidence — **AC-ATT-07-MK-ATT06** · **AC-ATT-07-≠-REOPEN-J06** |
| **O16** | ATT-05/05b peers | **YES must_keep** — **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **DENY wipe** · **DENY merge carry→annual** — **AC-ATT-07-MK-ATT05B** · **AC-ATT-07-MK-ATT05** |
| **O17** | ATT-09 peer | **YES must_keep** — **`ATT09QC1-MSLUTL9D`** · **DENY `att_leave_hold`** — **AC-ATT-07-MK-ATT09** |
| **O18** | ATT-04/04b | **YES must_keep** — **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** — **AC-ATT-07-MK-ATT04** |
| **O19** | Paper `/core` | **YES** — `/att` + `/core` alias only · Network SoT `/api/hrm/attendance/*` — **AC-ATT-07-PATH** |
| **O20** | Honesty / journeys | **YES false** — mint **`J-HRM-ATT-07-01..07` DRAFT** · U65 FE-after-2xx+F5 · include **J-HRM-ATT-06-04** compensatory non-regression · C-SLICE · **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06/05/05b/04/04b DONE** · **≠ ATT UAT** — **AC-ATT-07-H** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Sick type EFF (RETAIN) | **`GET …/leave-types/effective`** | F-ATT-CAT-LVT EFF | Đầu vào loại ốm |
| Admin flags (RETAIN) | **`GET/POST/PATCH …/leave-types*`** | F-ATT-CAT-LVT admin | Tiên quyết policy |
| Submit sick leave (RETAIN) | **`POST …/leave-requests`** | F-ATT-LEAVE-02 | **#1** |
| Preview (RETAIN peer) | **`POST …/preview-deduction`** | F-ATT-LEAVE-01 | peer ATT-08 |
| Panel on submit (RETAIN peer) | **`GET …/leave-balance/panel`** | F-ATT-LEAVE-BAL | ATT-05b · sick ∉ list |
| Fund order (GAP) | **`GET/PUT …/sick-leave-fund-order`** *(proposed)* | F-ATT-SICK-POLICY-ORDER | Tiên quyết SRS |
| Day branch (GAP) | side-effect approve/submit *(proposed)* | F-ATT-SICK-DAY-BRANCH | **#2** |
| Sheet codes (GAP) | write attendance day meta *(proposed)* | F-ATT-SICK-SHEET-CODE | Luồng **4** |
| AGG context (RETAIN peer) | **`POST …/attendance-sheets/:id/aggregate`** | F-ATT-SHEET-01 | **R-ATT-07-AGG** footer |

**Invariant ATT-07-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` SoT = **FAIL**.

**Invariant ATT-07-≠-VAL-DONE:** Claim sick picker + doctor attach + `HRM-LEAVE-VAL-ATT` alone = FR-07 / ATT-07 DONE = **FAIL O3/O20**.

**Invariant ATT-07-≠-MERGE:** Fold `compensatory` into `annual` · merge sick into `annual` panel · merge `carry_over` into `annual` = **FAIL O6/O15/O16** · **`ATT06QC1`** · **`ATT05QC1`**.

**Invariant ATT-07-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O4/O17**.

**Invariant ATT-07-≠-REOPEN-J06:** Reopen or demote sealed **J-HRM-ATT-06-01..07** without bus regression stamp = **FAIL O15/O20**.

**Invariant ATT-07-FUND-HOLD-LABEL:** Evidence claiming fund-order/day-branch DONE when engine absent = **FAIL O7/O8/O20** — footer **HOLD** mandatory.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06 / FR-06 DONE** (`ATT06QC1`) · **≠ ATT-05b / ATT-05 / ATT-04 / ATT-04b DONE** · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-09 `pending_days` · ATT-03d · ATT-10/11 context · **R-ATT-07-AGG** · **R-ATT-07-CORE10** HOLD · **R-ATT-06-AGG** peer · **R-ATT-01-ASSIGN open** · DENY `att_leave_hold` · DENY merge compensatory/sick/carry→annual · DENY reopen J-HRM-ATT-06-* · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-35 #40 · Option A) |
|---|----------------------|--------------------------------|
| Catalog flags BH/CTY | **PRESENT** on `att_leave_type` | **RETAIN cite** (**O1**) |
| Sick classify + VAL-ATT | **PRESENT** | **RETAIN cite** (**O2–O3**) · **≠** DONE alone |
| Leave submit + `pending_days` | **PRESENT** (ATT-09) | **RETAIN** (**O4**) |
| Preview + panel | ATT-08 / ATT-05b **PRESENT** | **RETAIN** · sick ∉ panel (**O5–O6**) |
| Fund order CRUD | **ABSENT** | **GAP AC** (**O7**) |
| Day branch allocator | **ABSENT** | **GAP AC** (**O8–O11**) |
| ATT-10 sick→paid generic | **PRESENT** | **RETAIN** + **AGG footer** when engine LIVE (**O12**) |
| ATT-06 compensatory sep | **`ATT06QC1` SEALED** | **must_keep** + non-regression (**O15**) |

### 1.1 Residual map **R-ATT-07-*** (engine unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-ATT-07-POLICY-ORDER** | CRUD thứ tự quỹ tenant | **IN-SCOPE GAP** | **ba-data** (if physicalize) → **dev-be** |
| **R-ATT-07-DAY-BRANCH** | Allocator một nhánh/ngày · DV-16 | **IN-SCOPE GAP** | **dev-be** after DATA |
| **R-ATT-07-OVER-BH** | Vượt ngày BH | **IN-SCOPE GAP** | **dev-be** + **qa** |
| **R-ATT-07-ANNUAL-FIRST** | Optional annual trước trong order | **IN-SCOPE GAP** | **dev-be** |
| **R-ATT-07-SHEET-CODE** | Mã ngày công theo nhánh | **IN-SCOPE GAP** | **dev-be** |
| **R-ATT-07-AGG** | ATT-10 funnel branch hours | **HOLD footer** | **dev-be** when engine LIVE |
| **R-ATT-07-CORE10** | CORE-10 insurance read | **HOLD footer** | PAY OUT |
| **R-ATT-07-FE-PICKER** | Sick ∈ EFF · no free-text SoT | **IN-SCOPE AC** (partial LIVE) | **dev-fe** narrow |
| **R-ATT-07-DV16** | Cấm BH+CTY 100% cùng ngày | **IN-SCOPE GAP** | **dev-be** config + runtime |
| **R-ATT-07-≠DONE** | Honesty | **IN-SCOPE** | **qc** |

**Carry (non-blocking):** **R-ATT-06-AGG** · **J-06 overlap HOLD** · **R-ATT-01-ASSIGN** — **do not block** 07 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LV-04** | Đơn ốm · order tenant | Áp thứ tự trừ | Mỗi ngày **một nhánh** (annual/BH/CTY/unpaid) | AC-ATT-07-DAY-BRANCH · J-05 HOLD |
| **BR-BP-LV-04-NO-DUAL** | Cùng ngày | Cấm BH + CTY 100% không rule | **409** / reject branch (**DV-16**) | AC-ATT-07-DV16 · J-05 |
| **BR-BP-LV-04-OVER-BH** | Vượt ngày BH | Chuyển CTY hoặc unpaid theo config | Nhánh đúng trên sheet | AC-ATT-07-OVER-BH |
| **BR-LEAVE-ATT-01** | ốm ≥3 ngày | Thiếu attach | **`HRM-LEAVE-VAL-ATT`** | AC-ATT-07-VAL-ATT · J-02 |
| **BR-BP-LV-TYPE-01** | Loại ∉ EFF | Submit | **`HRM-LEAVE-TYPE-UNKNOWN`** | J-01 |
| **BR-BP-LV-06** (peer ATT-09) | Submit tracked annual/comp | `pending_days +=` | **DENY** `att_leave_hold` | J-04 |
| **BR-BP-LV-03-SEP** (peer ATT-06) | Multi-bucket | Display | **`compensatory`** **≠** merged into `annual` | J-07 · **ATT06QC1** |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| Đầu vào | Loại ốm ∈ catalog | **CAT-FLAGS** · **SICK-CLASSIFY** | **J-HRM-ATT-07-01** | EFF RETAIN |
| **#1** | Nộp đơn · chứng từ | **VAL-ATT** · **SUBMIT-HOLD** | **J-02** · **J-03** · **J-04** | leave-requests RETAIN |
| **#2** | Áp thứ tự quỹ | **FUND-ORDER** · **DAY-BRANCH** | **J-05** HOLD | policy/branch GAP |
| Luồng **4** | Mã ngày công | **SHEET-CODE** | **J-05** footer | sheet GAP |
| Đặc biệt | Vượt BH · annual-first | **OVER-BH** · **ANNUAL-FIRST** | **J-05** HOLD | engine GAP |
| Peer ATT-06 | Compensatory quỹ | **MK-ATT06** | **J-HRM-ATT-06-04** | panel RETAIN |
| O20 | Seals · ≠DONE | **AC-ATT-07-H** | **J-HRM-ATT-07-07** | — |

### 3.1 AC-ATT-07 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-07-PATH** | Any 07 path | Network | Physical `/api/hrm/attendance/*` only · Nest `/core` SoT **0** | U65 · J-* |
| **AC-ATT-07-CAT-FLAGS** | Settings / EFF | Load sick type | `insuranceRegimeFlag` · `companyTopupFlag` visible or in API body | O1 · J-01 |
| **AC-ATT-07-SICK-CLASSIFY** | Sick type selected | Submit path | Runtime classify sick · không free-text lạ làm SoT | O2 · J-01 |
| **AC-ATT-07-VAL-ATT** | ốm ≥3 ngày · no attach | Gửi đơn | **4xx** `HRM-LEAVE-VAL-ATT` · **≠** UNKNOWN | O3 · J-02 |
| **AC-ATT-07-≠-VAL-DONE** | VAL works | DONE claim | **FAIL** if attach/picker alone = FR-07 DONE | O3/O20 |
| **AC-ATT-07-SUBMIT-HOLD** | Tracked balance row (e.g. annual) | Submit sick **2xx** | `pending_days` ↑ if applicable · overlap/balance rules | O4 · J-03/04 · U65 |
| **AC-ATT-07-PANEL-NO-SICK** | Panel LIVE | Load panel on leave form | 5 MVP buckets · **no** «quỹ ốm BH» bucket invented | O6 · J-03 |
| **AC-ATT-07-≠-MERGE-SICK-ANNUAL** | Sick leave | Display/ledger | **No** fold sick into `annual` panel row | O6/O16 |
| **AC-ATT-07-FUND-ORDER** | HCNS | CRUD order when API LIVE | Ordered fund list persisted · no dup | O7 · J-05 HOLD |
| **AC-ATT-07-DAY-BRANCH** | Engine LIVE | After submit/approve | Each calendar day **one** branch code | O8 · J-05 HOLD |
| **AC-ATT-07-OVER-BH** | Config + engine | Long sick span | Post-BH days → CTY or unpaid per config | O9 · J-05 HOLD |
| **AC-ATT-07-ANNUAL-FIRST** | Order has annual first | Allocator | Annual deducted before BH when configured | O10 · J-05 HOLD |
| **AC-ATT-07-SHEET-CODE** | Engine LIVE | Sheet/records | Day status/label matches branch | O11 · J-05 HOLD |
| **AC-ATT-07-AGG-FOOTER** | Engine LIVE | QC doc | ATT-10 paid/unpaid reflects branch — **HOLD** until engine | O12 |
| **AC-ATT-07-≠-CLOSE-TRIGGER** | Sheet close | Branch claim | **FAIL** if close alone allocates sick branches | O13 |
| **AC-ATT-07-CORE10-HOLD** | CORE peer | Slice evidence | **≠** CORE-10 DONE invented | O14 |
| **AC-ATT-07-MK-ATT06** | Footer | Evidence | **`ATT06QC1-MSM84GWC1`** · **≠ ATT-06 DONE** · **DENY merge compensatory→annual** | O15 · J-07 |
| **AC-ATT-07-≠-REOPEN-J06** | J-06 sealed | Reopen without bus | **FAIL** | O15 · J-07 |
| **AC-ATT-07-MK-ATT05B** | Footer | **`ATT05BQC1-MSM5SDQC1`** | **≠ ATT-05b DONE** | O16 |
| **AC-ATT-07-MK-ATT05** | Footer | **`ATT05QC1-MSM52GWC1`** · **DENY merge carry→annual** | O16 |
| **AC-ATT-07-MK-ATT09** | Footer | **`ATT09QC1-MSLUTL9D`** · **DENY `att_leave_hold`** | O17 |
| **AC-ATT-07-MK-ATT04** | 07 wave | **`ATT04QC1`** · **`ATT04BQC1`** | O18 |
| **AC-ATT-07-MK-ATT08** | Preview peer | **must_keep** preview-deduction | O5 |
| **AC-ATT-07-H** | Program | QC GWC | `attendance_uat_ready=false` · **≠ ATT-07 DONE** · **≠ ATT-06/05/05b/04/04b DONE** · **≠ ATT UAT** · C-SLICE | O20 · J-07 |

---

## 4. J-HRM-ATT-07-* DRAFT (narrow · U65 · Nest `/core` 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-ATT-07-01** | **picker** | **Loại ốm ∈ danh mục hiệu lực (EFF)** | Login `ceo@xe.vn` → HRM embed → Nghỉ phép → Tạo đơn → picker loại **ốm** từ **`GET leave-types/effective`** · flags BH/CTY visible when LIVE · **không** free-text SoT · Nest `/core` **0** · no seed | AC-ATT-07-CAT-FLAGS/SICK-CLASSIFY · O1/O2 · **DRAFT** |
| **J-HRM-ATT-07-02** | **attach** | **Chứng từ ≥3 ngày — VAL-ATT** | Chọn ốm khoảng ≥3 ngày · **không** attach → **Gửi** → **4xx** `HRM-LEAVE-VAL-ATT` · thêm `attachment_url` → path toward **2xx** · **≠** claim VAL alone = FR-07 DONE | AC-ATT-07-VAL-ATT · O3 · **DRAFT** |
| **J-HRM-ATT-07-03** | **submit** | **Nộp đơn ốm — POST 2xx** | Đủ rule attach · khoảng hợp lệ · `POST leave-requests` **2xx** · status `pending` · catalog assert · overlap OK · **FE-after-2xx** | AC-ATT-07-SUBMIT-HOLD · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-07-04** | **hold-f5** | **Hold quỹ (nếu tracked) + F5** | Khi có row balance cùng `leave_type` tracked: sau **2xx** `pending_days` ↑ trên panel/by-type · **F5** persisted · **≠** `att_leave_hold` · sick thường skip balance — document observed behavior | AC-ATT-07-SUBMIT-HOLD · O4 · **DRAFT** |
| **J-HRM-ATT-07-05** | **engine-hold** | **Thứ tự quỹ + nhánh ngày — HOLD footer** | Evidence ghi **HOLD** **R-ATT-07-POLICY-ORDER** / **R-ATT-07-DAY-BRANCH** until engine LIVE · optional doc default order · **≠** claim fund-order DONE from partial path | AC-ATT-07-FUND-ORDER/DAY-BRANCH · O7/O8 · **DRAFT** · *HOLD until BE* |
| **J-HRM-ATT-07-06** | **panel** | **Panel ATT-05b — sick ∉ bucket MVP** | Mở form nghỉ phép → `GET panel` **2xx** · 5 buckets · **no** invented sick pool merged into `annual` | AC-ATT-07-PANEL-NO-SICK · O6 · **DRAFT** |
| **J-HRM-ATT-07-07** | **cross** | **Seals · ≠DONE · Nest 0** | (a) Nest `/core` leave **0** (b) **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06/05/05b/04/04b DONE** · **≠ ATT UAT** (c) must_keep **`ATT06QC1`** · **`ATT05BQC1`** · **`ATT05QC1`** · **`ATT09QC1`** · **`ATT04QC1`** · **`ATT04BQC1`** · **`ATT03DQC1`** · **`ATT10QC1`** · **`ATT11QC1`** (d) **DENY merge** compensatory/sick/carry→annual (e) printable false · PAY OUT · **DENY reopen J-HRM-ATT-06-*** | AC-ATT-07-H/MK-* · O15–O20 · **DRAFT** |

### 4.1 Compensatory non-regression (mandatory — from ATT06QC1)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-ATT-06-04** | **regression** | **Quỹ `compensatory` sau ATT-06 seal — non-regression** | Trong cùng session hoặc smoke sau wave 07 touch: **`GET …/leave-balance?leave_type=compensatory`** (hoặc panel row) · `source=employee_leave_balances` khi đã accrue · **không** giảm/mất quỹ do sick submit · **không** merge vào `annual` · re-run if `leave-requests` / panel / balance paths changed | **AC-ATT-07-MK-ATT06** · **`ATT06QC1`** · **DENY reopen J-06** · **DRAFT** (regression attach to 07 QC) |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip readiness · **narrow ≠ full ATT/PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§61** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-ATT-07-FUND-ORDER** | Tenant CRUD fund order | **GAP** | **ba-data** → **dev-be** |
| **G-ATT-07-DAY-BRANCH** | Per-day allocator + DV-16 | **GAP** | **dev-be** |
| **G-ATT-07-SHEET-CODE** | Day codes on records/lines | **GAP** | **dev-be** |
| **G-ATT-07-FE-PICKER** | Sick flags on LeaveTab | **GAP partial** (EFF may LIVE) | **dev-fe** |
| **H-ATT-07-AGG** | ATT-10 branch funnel | **HOLD footer** | **dev-be** when engine LIVE |
| **H-ATT-07-CORE10** | CORE-10 insurance read | **HOLD** | PAY OUT |
| **H-ATT-07-POLICY-SCHEMA** | fund-order / day-branch physical | **HOLD default** | **ba-data** only if BA stamps closable |
| **H-ATT-07-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **HOLD default** `PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01` — confirm **DENY** `att_leave_hold` · **no** merge sick/compensatory/carry into `annual` · ADD fund-order/day-branch physical **only** if closable + BA stamp | DATA-01 PASS_TO_PM |
| **sa** | API-01 deepen **F-ATT-SICK-POLICY-ORDER** / **F-ATT-SICK-DAY-BRANCH** if DATA stamped | optional API-01 |
| **dev-be** | **HOLD** allocator + policy until DATA CONFIRMED | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** sick picker flags + attach UX (narrow) | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-ATT-07-01..06** mandatory · J-07 footer · **J-HRM-ATT-06-04** regression when balance paths touched | PASS_TO_PM |
| **qc** | GWC C-SLICE · ≠ ATT-07/ATT-06/05/05b/04/ATT UAT · must_keep full peer chain · **DENY reopen J-06** | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O20 CONFIRMED** for UC-BP-ATT-07 / FR-UC-BP-ATT-07 / BR-BP-LV-04 against SA Option A: **RETAIN cite** catalog flags + sick classify + **`HRM-LEAVE-VAL-ATT`** + leave submit/hold (ATT-09) + ATT-08 preview + ATT-05b panel (no sick bucket); **GAP** **R-ATT-07-POLICY-ORDER/DAY-BRANCH/OVER-BH/ANNUAL-FIRST/SHEET-CODE/AGG/DV16/FE-PICKER**; ATT-10/11/CORE-10 context gates; AC-ATT-07-*; mint **J-HRM-ATT-07-01..07 DRAFT** + **J-HRM-ATT-06-04** compensatory non-regression (U65 FE-after-2xx+F5); unlock **ba-data HOLD** default; explicit **≠ ATT-07 DONE** · **≠ ATT-06/05/05b/04/04b DONE** · **≠ ATT UAT** · printable **false** · **C-SLICE** · **PAY OUT** · must_keep **`ATT06QC1`** + full peer chain · **DENY** `att_leave_hold` · **DENY** merge compensatory/sick/carry→annual · **DENY** VAL-ATT/picker-alone DONE · **DENY reopen J-HRM-ATT-06-*** |
| **Residual (open)** | ba-data DATA-01 HOLD · sa API-01 optional · dev-be allocator/policy · dev-fe picker/attach · QA J-* · QC GWC · **R-ATT-07-AGG/CORE10** footers |
| **next_owner** | **ba-data** (HOLD default) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data HOLD default)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-35 seat #40)
lane: governance · UC-BP-ATT-07 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (att_leave_type flags · leave_requests · employee_leave_balances — sick ∉ MVP panel buckets · DV-16 · DENY att_leave_hold · DENY merge compensatory/sick/carry into annual)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days SoT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md (must_keep ATT06QC1 · compensatory separate)
entry_criteria: BA O1–O20 CONFIRMED · default RETAIN cite sick classify + VAL + leave TXN — no schema ADD unless fund-order/day-branch physicalization closable
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md
  - HOLD default: RETAIN pending_days on employee_leave_balances · RETAIN att_leave_type flags · DENY physical att_leave_hold · DENY merge compensatory/carry/sick into annual display keys · sick bucket on panel OUT unless BA stamp
  - ADD only if closable + BA stamp: sick-leave-fund-order config · per-day branch ledger/meta (else explicit HOLD waiver with owner+trigger)
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge compensatory/sick/carry into annual · honesty flip · reopen J-HRM-ATT-06-* without regression
```

### 7.2 next_dispatch_prompt (copy-ready — pm orchestration hint)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-PM-01
role: pm
lane: governance
entry_criteria: BA-01 PASS_TO_PM @ docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md · must_keep ATT06QC1-MSM84GWC1 through ATT-11 seals
exit_criteria:
  - Dispatch ba-data DATA-01 HOLD (parallel) · hold dev-be/dev-fe until DATA PASS
  - Update PO_HRM_MVP_GD1_CONTINUOUS.md seat #40 BA stamped · PILOT_BUSINESS_FLOW_BA_TRACE §61
  - No attendance_uat_ready flip · C-SLICE honesty · DENY reopen J-HRM-ATT-06-*
cấm: claim ATT-07 or ATT module UAT DONE from BA pack alone · honesty flip
```
