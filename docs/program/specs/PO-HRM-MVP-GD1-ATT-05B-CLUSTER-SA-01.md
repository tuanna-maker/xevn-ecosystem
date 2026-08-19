# PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01 — Option/F.1 · Panel quỹ phép khi nộp đơn — RETAIN LIVE panel + pending_days hold bind · gap FE submit-form AC

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** after ATT-05 QC GWC) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** wipe ATT-05/04b/04/09/03d seals · **DENY** honesty flip · **DENY** claim ATT-05b / ATT UAT DONE · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD default) → API deepen only if BA stamps · Dev-FE submit-form wire · **cấm apps/** until BA CONFIRMED (this seat docs-only) |
| **depends_on** | QC GWC **`ATT05QC1-MSM52GWC1`** · `docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qc-01.md` · QA **`ATT05QA1-MSM52CT7`** · seat **#37 SEALED** · **must_keep** **`ATT05QC1-MSM52GWC1`** (≠ ATT-05 DONE) · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** (**DENY `att_leave_hold`**) · **`ATT03DQC1-MSM1CR19`** · **R-ATT-05-FY** · **R-ATT-05-ENGINE** · **R-ATT-05-DEDUCT** · **R-ATT-05-FY-CAL** documented HOLD · **R-MAIN-EFFECTIVE-EMPTY** · **R-ATT-01-ASSIGN open** · Nest `/core` **DENY** · **≠ ATT UAT** · PAY OUT · printable **false** |
| **uc_ids** | `UC-BP-ATT-05b` · `FR-UC-BP-ATT-05b` · **BR-BP-LV-PANEL-01** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#38** Wave-33 after ATT-05 (#37 SEALED GWC) |
| **ref_sa_spine** | ATT-05 Option A [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md) · ATT-05 API RETAIN panel [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md) · ATT-09 hold [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) · ATT-04/04b panel peers [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) · [`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md) · BE cite [`docs/qa/evidence/po-hrm-att-03d-05b-be-01.md`](../../qa/evidence/po-hrm-att-03d-05b-be-01.md) |
| **ref_honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · product_go **false** · **DENY claim ATT-05b / FR-05b DONE alone** · **DENY claim ATT-05 / FR-05 DONE from 05b seat** · **DENY claim panel API alone = consumer UAT** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-05b** · Diễn biến **#0a · #0b · #1 · #2** · Luồng chính **1–4** · **BR-BP-LV-PANEL-01** · peer **FR-UC-BP-ATT-09** hold · **ATT-04…07** quỹ theo loại |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · **F-ATT-LEAVE-BAL** panel · **F-ATT-CAT-EFF-01** picker · **F-ATT-LEAVE-01** preview-deduction peer · **F-ATT-LEAVE-02** submit hold |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — `GET …/leave-balance` · `GET …/leave-balance/panel` · `POST …/leave-requests` (hold) · `POST …/preview-deduction` · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` — `employee_leave_balances` (`entitled_days` · `used_days` · **`pending_days`** = hold) · per-`leave_type` rows including **`carry_over`** separate from **`annual`** · **DENY** physical `att_leave_hold` |
| **ref_code** | **read-only cite:** `leave-balance.service` **`MVP_LEAVE_BALANCE_TYPES`** + **`GET …/leave-balance/panel`** (5 buckets: `annual` · `seniority` · `compensatory` · **`carry_over`** · `advance`) · `GET …/leave-balance?leave_type=` · `LeaveRequestsService.lockPendingLeaveBalance` · `LeaveTab` / leave create UX — **gap** submit-form panel bind vs settings-only deepen |
| **OUT** | Nest `/core` dual · wipe ATT-05/04/04b/09 seals · invent `att_leave_hold` · merge **`carry_over`** into **`annual`** on panel · free-text leave type as panel SoT · invent ASSIGN/PAY/printable DONE · claim **`GET panel` alone** = ATT-05b DONE · ATT UAT flip · seed · reopen sealed peers |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-33 architecture unlock: **Panel quỹ phép khi nộp đơn** (FR-UC-BP-ATT-05b · BR-BP-LV-PANEL-01) vs AS-IS LIVE balance/panel APIs + ATT-09 `pending_days` — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after ATT-05 QC GWC (`ATT05QC1-MSM52GWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-05b · peer FR-UC-BP-ATT-09 hold · FR-UC-BP-ATT-05 **`carry_over`** row · ATT-04/04b buckets · **must_keep** **`ATT05QC1`** + **`ATT04BQC1`** + **`ATT04QC1`** + **`ATT09QC1`** · **R-ATT-05-*** HOLD carry context · Nest `/core` DENY · PAY OUT · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-05 SEALED GWC (`ATT05QC1-MSM52GWC1`):** carry_over LVT · panel bucket · LVRULE carry cols · separate ledger · **≠ FR-05 DONE** · **must_keep RETAIN**. **Panel API (PRESENT — RETAIN cite · ≠ FR-05b consumer DONE alone):** `GET /api/hrm/attendance/leave-balance/panel` returns **5 MVP buckets** in one response (`annual` · `seniority` · `compensatory` · **`carry_over`** · `advance`) with display-ready `entitled` / `used` / **`pending`** / `available` / labels; missing rows → zeros · **no** 404 storm. **`GET …/leave-balance?leave_type=`** single-type read **PRESENT**. **Hold semantics (PRESENT — must_keep ATT-09):** submit `POST …/leave-requests` → **`pending_days +=`** on matching `employee_leave_balances` row; available = entitled − used − pending on balance/panel (**`ATT09QC1-MSLUTL9D`** · **DENY `att_leave_hold`**). **Carry vs annual (PRESENT — RETAIN ATT-05):** ledger keys **`leave_type=carry_over`** **separate** from **`annual`** — panel exposes **`carry_over`** bucket «Phép chuyển kỳ» (**DENY merge** into annual pool). **EFF picker (PRESENT partial):** effective leave types from catalog/EFF for form — **SRS:** panel SoT = **mã loại ∈ danh mục hiệu lực**, not free-text. **Submit-form consumer (GAP):** SRS Diễn biến #0a–#2 requires panel on **đơn nghỉ** when opening form · đổi loại → tính lại · nhập khoảng → dự kiến trừ (peer ATT-08 preview) · gửi đơn → hold + panel cập nhật — **FE wire on LeaveTab create path** may be **partial** vs settings/admin panel deepen (ATT-05 FE-01). **Empty catalog (GAP AC):** honest empty picker + admin guidance — **no** fake sample rows (SRS #0b). **Overlap / type invalid (RETAIN cite):** `assertNoLeaveOverlap` · balance gate — **R-ATT-05-DEDUCT** order chain **ABSENT** (non-blocking footer). **FY (HOLD):** panel `balance_year` defaults calendar HCM — **R-ATT-05-FY-CAL** · **R-ATT-05-FY** documented HOLD. **Nest `/core`:** **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-05b: NV/QL/HCNS **thấy số dư theo loại** (năm · thâm niên · bù · **chuyển kỳ** · ứng…) **trước khi gửi**; panel **chỉ đọc** — không sửa quỹ tay; loại form = **picker danh mục hiệu lực**; sau gửi hold khớp panel (**ATT-09**); hết phép → gợi ý không lương/ứng (**ATT-04b** peer). |
| **Gap class** | **GĐ1 continuous AC** on LIVE **`GET panel` + `GET by-type` + `pending_days` display** + **submit-form FE bind** + empty-catalog UX + post-submit panel refresh — **not** greenfield balance engine; **not** invent `att_leave_hold`; **not** claim API alone = ATT-05b UAT; **not** claim ATT-05 DONE from 05b seat. |
| **Constraints** | U89 · preserve **`ATT05QC1`** + full peer chain · **R-ATT-05-FY/ENGINE/DEDUCT** non-blocking HOLD · C-SLICE · U65 · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Panel only on settings; free-text type drives UI; carry merged into annual display; second hold table; claim `GET panel` = module UAT; wipe ATT-05 carry separation |

### 1.2 Relation to ATT-05 (#37) vs ATT-05b (#38)

| Seat | Scope | Disposition |
|------|-------|-------------|
| **#37 FR-UC-BP-ATT-05** | Policy carry · FY · rollover · separate ledger **admin** | **SEALED GWC** **`ATT05QC1`** · **≠ DONE** · **must_keep** |
| **#38 FR-UC-BP-ATT-05b** | **Consumer** panel on **submit form** · bind picker + hold display | **This Option A** — **RETAIN cite** panel API + **`carry_over`** row · **GAP** submit UX AC |
| **Shared** | `GET …/leave-balance/panel` · `pending_days` | **One physical API** — **DENY** duplicate Nest `/core` · **DENY** demote `carry_over` bucket |

**Lock:** ATT-05b **does not** close **R-ATT-05-FY/ENGINE/DEDUCT**; **does not** flip **`ATT05QC1`** honesty; **does not** claim **FR-05 DONE**.

### 1.3 Architecture diagram (target — Option A)

```text
  ATT-05 SEALED (ATT05QC1) · ATT-04b (ATT04BQC1) · ATT-04 (ATT04QC1) — RETAIN · ≠ DONE
  ATT-09 (ATT09QC1) pending_days · ATT-03d · peer chain · R-ATT-05-* HOLD footers
  Nest /core DENY · printable false · PAY OUT · honesty false
       │
       ▼
  ┌──────── FR-UC-BP-ATT-05b (gap-only RETAIN panel + hold bind on submit form) ─────┐
  │ RETAIN LIVE (cite — ≠ FR-05b DONE alone)                                            │
  │   GET /api/hrm/attendance/leave-balance/panel — 5 MVP buckets incl. carry_over      │
  │   GET /api/hrm/attendance/leave-balance?leave_type= — selected type detail           │
  │   pending_days on employee_leave_balances = paper held (ATT-09 must_keep)           │
  │   available = entitled − used − pending on panel items                             │
  │   carry_over row SEPARATE from annual (ATT-05 must_keep · DENY merge)                │
  │   POST leave-requests → lockPendingLeaveBalance (peer ATT-09)                        │
  │   POST preview-deduction (peer ATT-08 must_keep) for expected days                   │
  │                                                                                      │
  │ RESIDUAL unlock (BA → FE/QA — consumer gap only)                                     │
  │   R-ATT-05B-PICKER   : loại ∈ EFF/catalog — DENY free-text SoT                      │
  │   R-ATT-05B-PANEL-FE : mở form → panel; đổi loại → refetch; F5 after submit          │
  │   R-ATT-05B-HOLD-UI  : panel shows pending/hold; post-submit matches ATT-09          │
  │   R-ATT-05B-EMPTY    : catalog empty → honest empty + admin hint (SRS #0b)         │
  │   R-ATT-05B-OVERLAP  : overlap banner on form (cite assertNoLeaveOverlap)           │
  │   R-ATT-05B-ADV-HINT : hết phép → unpaid/advance hint (peer ATT-04b · non-LIVE)     │
  │   R-ATT-05B-FY-FOOTER: calendar year on panel until R-ATT-05-FY lands               │
  │   mint J-HRM-ATT-05B-* DRAFT for QA L2.5                                           │
  │   Paper F-ATT-* /att + /core = ALIAS ONLY                                            │
  └──────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼ OUT this seat
  att_leave_hold second ledger           = DENY (ATT-09)
  Nest /core dual panel SoT              = DENY
  Merge carry_over into annual display    = DENY (ATT05QC1)
  Free-text leave type drives panel       = DENY (BR-BP-LV-PANEL-01)
  Claim GET panel alone = ATT-05b DONE    = DENY
  Claim ATT-05 / ATT module UAT           = DENY
  Wipe ATT05QC1 / ATT04 / ATT09 seals     = DENY
  Invent ASSIGN / PAY / printable DONE    = DENY
```

**Label lock:** Board «Panel quỹ phép khi nộp đơn» GĐ1 = **RETAIN cite** multi-bucket panel API + **`pending_days`** hold display + **`carry_over`** separate row + **gap AC** for **submit-form** consumer bind — **not** FY rollover; **not** `att_leave_hold`; **not** Option alone = ATT UAT.  
**Hold lock (ATT-09):** Panel **`pending`** / khả dụng = **`employee_leave_balances.pending_days`** — **DENY** invent `att_leave_hold` (**`ATT09QC1-MSLUTL9D`**).

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Panel multi-bucket read | F-ATT-LEAVE-BAL panel | `GET …/leave-balance/panel` **PRESENT** | **RETAIN cite** · **≠ FR-05b consumer DONE** |
| Selected-type read | Diễn biến #1 | `GET …/leave-balance?leave_type=` **PRESENT** | **RETAIN cite** · **R-ATT-05B-PANEL-FE** |
| Bucket `carry_over` | peer ATT-05 | Panel item **PRESENT** · label VI | **RETAIN** · **DENY merge** annual |
| Bucket `advance` / unpaid hint | ATT-04b peer | Panel + policy **PRESENT** | **RETAIN cite** · advance hint **GAP** UX |
| Hold on submit | FR-UC-BP-ATT-09 · #2 | `pending_days` **PRESENT** | **must_keep** · **R-ATT-05B-HOLD-UI** |
| Available formula | BR-BP-LV-PANEL-01 | entitled−used−pending **PRESENT** | **RETAIN cite** |
| Picker ∈ catalog | #0a · BR | EFF/catalog APIs **PRESENT** | **RETAIN** · **R-ATT-05B-PICKER** AC |
| Empty catalog UX | #0b | **GAP** honest empty | **GAP** **R-ATT-05B-EMPTY** |
| Submit-form panel wire | Luồng 1–4 | Settings/admin deepen **partial** | **GAP** **R-ATT-05B-PANEL-FE** |
| Post-submit panel refresh | #2 · F5 | lock path **PRESENT** | **GAP** FE AC + QA |
| Preview days on form | Luồng 3 | ATT-08 preview **PRESENT** | **RETAIN cite** · wire peer |
| Overlap on form | Đặc biệt SRS | assert overlap **PRESENT** | **R-ATT-05B-OVERLAP** AC |
| Deduct order annual vs carry | ATT-05 GAP | single-type deduct | **HOLD footer** **R-ATT-05-DEDUCT** |
| FY on panel year | ATT-05 FY | calendar HCM default | **HOLD footer** **R-ATT-05-FY-CAL** |
| Nest `/core` | alias | **ABSENT** | **alias only** |
| ATT-05 / peers sealed | program | GWC stamps | **must_keep** · **DENY wipe** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-05b DONE** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN panel API + pending_days bind + separate carry_over row + gap submit-form consumer AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** `GET leave-balance/panel` (5 MVP buckets incl. **`carry_over`**) · **`GET leave-balance?leave_type=`** · **`pending_days`** hold semantics (**ATT-09**) · **separate** ledger keys for **`annual`** vs **`carry_over`** (**ATT-05** **`ATT05QC1`**). Unlock BA residuals **R-ATT-05B-*** for **submit-form** picker bind · panel refresh on type change · post-submit hold display · empty catalog · overlap · advance/unpaid hint footers. **HOLD** **R-ATT-05-FY/ENGINE/DEDUCT** as non-blocking. **must_keep** all sealed peers. **DENY** `att_leave_hold` · Nest `/core` · merge carry→annual · free-text SoT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (FE consumer + QA J-* on Nghỉ phép form) |
| **Risk** | Low if BA enforces picker-only + no merge display |
| **Pros** | Matches LIVE API already shipped; aligns SRS #0a–#2 with ATT-09/ATT-05 without new hold table |
| **Cons** | Not FR-05b LIVE until FE+QA consumer path; FY footer until **R-ATT-05-FY** |
| **Failure modes** | Panel only in settings; API-only QA PASS |
| **Mitigation** | J-HRM-ATT-05B-* · U65 FE-after-2xx+F5 on **đơn nghỉ** |

### Option B — invent `att_leave_hold` / Nest `/core` panel / merge carry into annual / wipe sealed carry row (REJECT)

| | |
|--|--|
| **Summary** | Second hold ledger; dual Nest `/core` balance; show carry only inside `annual` bucket; demote `carry_over` panel key |
| **Pros** | Illusion of simpler panel |
| **Cons** | Violates **`ATT09QC1`** · **`ATT05QC1`** **`att-05-ledger-sep`** · BR-BP-LV-02 · BR-BP-LV-PANEL-01 |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim `GET panel` endpoint alone = ATT-05b DONE / ATT UAT flip (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because panel API exists; skip submit-form AC; flip `attendance_uat_ready` |
| **Pros** | Fast chat claim |
| **Cons** | Violates SRS Luồng chính 1–4 · board #38 · **`ATT05QC1`** honesty · C-SLICE |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+consumer gap) | B (hold dual/merge) | C (claim DONE) |
|-----------|-------:|------------------------:|--------------------:|---------------:|
| Business value (FR-05b) | 5 | **4** | 1 | 0 |
| Preserve ATT-05/09/04 seals | 5 | **5** | 0 | 0 |
| Honesty / seal safety | 5 | **5** | 0 | 0 |
| Time to deliver | 4 | **4** | 2 | Fake PASS |
| Fit LIVE panel API | 5 | **5** | 0 | 1 |
| **Weighted** | | **high** | low | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE panel + by-type balance reads · **`pending_days`** hold bind (**ATT-09**) · **`carry_over`** bucket **separate** from **`annual`** (**ATT-05**); unlock **R-ATT-05B-*** consumer AC; **HOLD** **R-ATT-05-FY/ENGINE/DEDUCT** footers; **RETAIN** peer seals; **DENY** `att_leave_hold` · Nest `/core` · merge carry · free-text SoT · honesty flip |
| **Why selected** | BE panel spine **already LIVE**; FR-05b gap is **submit-form consumer** (picker · refresh · hold display · empty catalog) bound to **existing** hold column — not new ledger, not FY engine, not ATT-05 closure |
| **Assumptions** | FE may use panel **or** by-type GET when picker changes; overlap/preview reuse ATT-08/09 paths; advance hint cites ATT-04b without claiming 04b DONE |
| **Rejected** | **B** dual hold / merge / wipe · **C** API-alone DONE / ATT UAT |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Panel API | RETAIN `GET …/leave-balance/panel` 5 buckets | AC cite · **≠** API alone = DONE |
| O2 | `carry_over` bucket | RETAIN separate item «Phép chuyển kỳ» | AC · **DENY merge** into `annual` display |
| O3 | Hold display | RETAIN `pending` / `available` from **`pending_days`** | AC post-submit · **DENY `att_leave_hold`** |
| O4 | Picker SoT | EFF/catalog mã loại | AC **R-ATT-05B-PICKER** · DENY free-text |
| O5 | Empty catalog | Honest empty + admin hint | AC **R-ATT-05B-EMPTY** SRS #0b |
| O6 | Submit-form wire | GAP **R-ATT-05B-PANEL-FE** | AC Luồng 1–4 · J-HRM-ATT-05B-* |
| O7 | Type change | Refetch panel/by-type | AC Diễn biến đặc biệt |
| O8 | Post-submit | Panel reflects hold + F5 | AC **R-ATT-05B-HOLD-UI** · peer ATT-09 |
| O9 | Preview days | RETAIN cite ATT-08 preview | AC optional wire on form |
| O10 | Overlap | RETAIN cite assert | AC banner **R-ATT-05B-OVERLAP** |
| O11 | Advance/unpaid hint | peer ATT-04b | AC footer · **≠ 04b DONE** |
| O12 | ATT-05 peer | must_keep **`ATT05QC1`** | **≠ FR-05 DONE** from 05b |
| O13 | ATT-09 peer | must_keep **`ATT09QC1`** | **DENY `att_leave_hold`** |
| O14 | ATT-04/04b | must_keep **`ATT04QC1`** · **`ATT04BQC1`** | **DENY wipe** |
| O15 | FY footer | **R-ATT-05-FY-CAL** calendar interim | HOLD until FY CRUD |
| O16 | Deduct order | **R-ATT-05-DEDUCT** HOLD | Footer non-blocking |
| O17 | Paper `/core` | Alias only | DENY Nest dual |
| O18 | Honesty | false · C-SLICE · mint **J-HRM-ATT-05B-*** DRAFT | **≠ ATT-05b DONE** · **≠ ATT UAT** |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Deepen = later **sa API** seat only if BA stamps consumer DTO gap — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Disposition | Bước SRS |
|-------------|-------------------------------|-------------|----------|
| **F-ATT-LEAVE-BAL panel** (RETAIN) | `GET …/leave-balance/panel` | RETAIN 5 buckets incl. `carry_over` | **#1** panel |
| **F-ATT-LEAVE-BAL by-type** (RETAIN) | `GET …/leave-balance?leave_type=` | RETAIN on picker change | **#1** |
| **F-ATT-LEAVE-02 hold** (RETAIN cite) | `POST …/leave-requests` | RETAIN `pending_days` | **#2** · peer ATT-09 |
| **F-ATT-LEAVE-01 preview** (RETAIN cite) | `POST …/preview-deduction` | RETAIN peer ATT-08 | Luồng **3** |
| **F-ATT-CAT-EFF-01** (RETAIN) | effective leave types for picker | RETAIN | **#0a** |
| **F-ATT-LEAVE-BAL carry row** (RETAIN) | ledger `leave_type=carry_over` | RETAIN separate | peer ATT-05 |
| **F-ATT-LEAVE-BAL advance** (RETAIN cite) | panel `advance` bucket | RETAIN · hint GAP | peer 04b |

**DENY:** invent Nest `@Controller('core')` · invent `att_leave_hold` · merge `carry_over` into `annual` on panel · claim panel endpoint = FR-05b UAT alone.

**Display-ready cite for BA:** panel item `{ leave_type, leave_type_label, entitled_days, used_days, pending_days, available_days, remaining_days?, source, balance_year? }` · selected-type DTO same family · empty catalog state `{ effective_types: [], empty_hint_vi }` *(FE derive OK if API returns empty list)*.

---

## 6. unlock_lane

```text
BA-01 (ba-process) AC pack O1–O18 + mint J-HRM-ATT-05B-* DRAFT
  → ba-data HOLD default (no att_leave_hold · no panel schema ADD unless closable)
  → sa API-01 deepen ONLY if BA stamps DTO gap (default: RETAIN cite panel)
  → Dev-FE R-ATT-05B-PANEL-FE wire on LeaveTab submit form (allowed_paths narrow)
  → QA U65 J-HRM-ATT-05B-* (đơn nghỉ · picker · panel · hold · F5 · Nest /core 0)
  → QC GWC C-SLICE (≠ ATT-05b/ATT-05/ATT UAT · must_keep ATT05QC1+peers)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O18 AC + mint J-HRM-ATT-05B-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default | ba-data | **no** `att_leave_hold` |
| 4. sa API deepen only if stamped | sa | optional API-01 delta |
| 5. Dev-FE consumer wire | dev-fe | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-05B-* | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip |

---

## 7. must_keep / forbidden_paths / honesty locks

### must_keep (RETAIN — DENY wipe / DENY reopen without regression)

| Stamp / artifact | Lock |
|------------------|------|
| **`ATT05QC1-MSM52GWC1`** · **`ATT05QA1-MSM52CT7`** | ATT-05 carry spine · **≠ ATT-05 DONE** · **DENY wipe** · **DENY merge carry→annual** |
| **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** | ATT-04/04b · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` · **DENY `att_leave_hold`** |
| **`ATT03DQC1-MSM1CR19`** | GPS · **DENY wipe** |
| **`ATT03BQC1` · `ATT01QC1` · `ATT11QC1` · `ATT10QC1` · `ATT08QC1` · `ATT02QC1` · `PLT01QC1` · CORE-10/09/07** | peer chain · printable false · **R-ATT-01-ASSIGN open** |
| **J-HRM-ATT-05-01..06** | SEALED ATT-05 evidence · **DENY reopen** without bus regression |

### forbidden_paths (default DENY unless BA unlock lists allowed_paths)

```text
**/att_leave_hold**
apps/api/hrm-api/src/**/core.controller.ts
apps/api/hrm-api/src/attendance/leave-balance.service.ts   # demote carry_over bucket or merge into annual display logic
apps/api/hrm-api/src/attendance/leave-requests.service.ts  # invent att_leave_hold path — ATT-09 owned
honesty flags · SERVICE_READINESS promote
```

### honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-05b / FR-05b DONE** from Option A alone | **LOCKED** |
| **≠ ATT-05 / FR-05 DONE** from 05b seat | **LOCKED** |
| **≠ ATT-04 / ATT-04b DONE** (peer seals) | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=false` | **LOCKED** |
| **printable false** · PAY OUT | **LOCKED** |
| **DENY** `att_leave_hold` · Nest `/core` dual | **LOCKED** |
| **DENY** merge `carry_over` into `annual` on panel | **LOCKED** |
| **DENY** claim `GET panel` alone = consumer UAT | **LOCKED** |
| **DENY** wipe **`ATT05QC1`** carry separation | **LOCKED** |

---

## 8. completion_report

| | |
|--|--|
| **Closed** | Option **A** CONFIRMED LOCK for `UC-BP-ATT-05b` / `FR-UC-BP-ATT-05b` · RETAIN cite `GET panel` + by-type + **`pending_days`** + **`carry_over`** separate bucket · unlock **R-ATT-05B-*** consumer gaps · O1–O18 for BA · **must_keep** **`ATT05QC1`** + ATT-04/04b/09/03d · **DENY** `att_leave_hold` · Nest `/core` · merge carry · free-text SoT · **HOLD** **R-ATT-05-FY/ENGINE/DEDUCT** footers · printable false · PAY OUT · C-SLICE · **≠ ATT-05b DONE** · **≠ ATT UAT** · apps/** untouched |
| **Residual** | BA AC + **J-HRM-ATT-05B-*** · Dev-FE submit-form wire · peer **R-ATT-05-*** · **R-MAIN-EFFECTIVE-EMPTY** · **R-ATT-01-ASSIGN** |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-05b · FR-UC-BP-ATT-05b · BR-BP-LV-PANEL-01 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md (carry_over separate · must_keep ATT05QC1 · ≠ FR-05 DONE from 05b)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md (advance/unpaid hint peer · must_keep ATT04BQC1)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-05b · Diễn biến #0a–#2 · BR-BP-LV-PANEL-01)
  - docs/qa/evidence/po-hrm-att-03d-05b-be-01.md (GET panel 5 buckets · carry_over)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qc-01.md (ATT05QC1-MSM52GWC1 · DENY merge carry→annual)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md
  - O1–O18 CONFIRM (panel RETAIN · carry_over separate · pending_days hold UI · picker EFF · empty catalog · submit-form wire · post-submit F5 · overlap · advance hint footer · ATT-05/09/04 peers must_keep · FY/DEDUCT HOLD footers · paper /core alias · honesty)
  - mint J-HRM-ATT-05B-01..0n DRAFT (đơn nghỉ open form · chọn loại · panel · gửi đơn hold · F5 · Nest /core 0) · U65 FE-after-2xx+F5
  - explicit ≠ ATT-05b DONE · ≠ ATT-05 DONE · ≠ ATT-04/04b DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - DENY invent att_leave_hold · DENY Nest /core dual · DENY merge carry_over into annual panel · DENY free-text type SoT · DENY claim GET panel alone = DONE
  - must_keep: ATT05QC1-MSM52GWC1 · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · peer ATT chain · R-ATT-05-FY/ENGINE/DEDUCT footers · R-MAIN-EFFECTIVE-EMPTY · R-ATT-01-ASSIGN open
  - unlock next: ba-data HOLD default → dev-fe FE-01 (R-ATT-05B-PANEL-FE) → qa
  - ack_status PASS_TO_PM · next_owner ba-data (HOLD) or pm → dev-fe per backlog
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · honesty flip · wipe ATT05/04/09 seals · reopen J-HRM-ATT-05-* without regression
```
