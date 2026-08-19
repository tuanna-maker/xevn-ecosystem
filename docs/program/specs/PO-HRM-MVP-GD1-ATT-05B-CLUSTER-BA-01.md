# BA AC pack — Wave-33 ATT cluster · UC-BP-ATT-05b (Panel quỹ phép khi nộp đơn · RETAIN panel API + pending_days hold · GAP submit-form consumer wire)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-33 seat **#38**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O18 **CONFIRMED** · Dev-FE **UNLOCK** `R-ATT-05B-PANEL-FE` · **ba-data HOLD default** (no `att_leave_hold` · no panel schema ADD unless BA stamps DTO gap) · **DENY** claim `GET panel` alone = FR-05b DONE · **DENY** claim ATT-05b / ATT-05 / ATT-04 / ATT-04b / ATT UAT DONE · **printable false RETAIN** · **PAY OUT** |
| **change_mode** | **ADD** (align SA-05B gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** merge `carry_over` into `annual` on panel · **no** wipe **`ATT05QC1-MSM52GWC1`** / ATT-04/04b/09/03d seals) |
| **uc_ids** | `UC-BP-ATT-05b` · `FR-UC-BP-ATT-05b` · **BR-BP-LV-PANEL-01** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-05 **`ATT05QC1-MSM52GWC1`** (**must_keep · DENY merge carry→annual**) · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** (**pending_days · DENY `att_leave_hold`**) · **`ATT03DQC1-MSM1CR19`** · **R-ATT-05-FY** · **R-ATT-05-ENGINE** · **R-ATT-05-DEDUCT** · **R-ATT-05-FY-CAL** footers · **R-MAIN-EFFECTIVE-EMPTY** (non-blocking) · **R-ATT-01-ASSIGN open** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-05b** · Diễn biến **#0a · #0b · #1 · #2** · Luồng chính **1–4** · **BR-BP-LV-PANEL-01** · peer **FR-UC-BP-ATT-09** hold · **FR-UC-BP-ATT-05** `carry_over` row |
| **ref_api_paper** | **F-ATT-LEAVE-BAL panel** · **F-ATT-LEAVE-BAL by-type** · **F-ATT-CAT-EFF-01** picker · **F-ATT-LEAVE-01** preview-deduction · **F-ATT-LEAVE-02** submit hold · peer ATT-05 carry row |
| **ref_db** | `employee_leave_balances` (`entitled_days` · `used_days` · **`pending_days`**) · per-type rows incl. **`carry_over`** **separate** from **`annual`** · **DENY** physical `att_leave_hold` |
| **ref_evidence** | `docs/qa/evidence/po-hrm-att-03d-05b-be-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qc-01.md` |
| **Honesty** | `attendance_uat_ready=false` · **`contracts_printable_ready=false` RETAIN** · **C-SLICE-≠-MODULE** · **DENY** claim panel API alone = FR-05b DONE · **DENY** ATT-05b / ATT-05 / ATT-04 / ATT-04b / ATT UAT DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` · merge carry→annual panel · free-text leave type SoT · wipe ATT05/04/09 seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-33 seat **#38** — **gap-only RETAIN** LIVE `GET …/leave-balance/panel` (5 MVP buckets incl. **`carry_over`**) · `GET …/leave-balance?leave_type=` · **`pending_days`** hold (**ATT-09**) · **separate** `annual` vs `carry_over` display — **consumer GAP** on **đơn nghỉ** submit form:

1. **Panel API** = LIVE 5 buckets — **≠** API alone = FR-05b DONE (**O1**).
2. **`carry_over` bucket** = «Phép chuyển kỳ» **tách** khỏi `annual` — **DENY merge** (**O2** · **`ATT05QC1`**).
3. **Hold display** = `pending` / `available` từ **`pending_days`** — **DENY `att_leave_hold`** (**O3** · **`ATT09QC1`**).
4. **Picker SoT** = mã loại ∈ danh mục hiệu lực — **DENY** free-text (**O4** · **R-ATT-05B-PICKER**).
5. **Empty catalog** = ô trống + hướng dẫn admin — **không** bịa mẫu (**O5** · SRS **#0b**).
6. **Submit-form wire** = mở form → panel; đổi loại → refetch; preview days; overlap (**O6–O10** · **R-ATT-05B-PANEL-FE**).
7. **Post-submit** = hold khớp panel + **F5** (**O8** · **R-ATT-05B-HOLD-UI**).
8. **Peers ATT-05/09/04/04b** = **must_keep** seals — **≠** claim DONE từ seat 05b (**O12–O14**).
9. **FY / deduct footers** = **HOLD** non-blocking (**O15–O16**).
10. **Honesty + J-*** = mint **`J-HRM-ATT-05B-01..06` DRAFT** (**O18**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân viên / Quản lý | Mở form đơn nghỉ · chọn loại từ picker · xem panel · gửi đơn |
| HCNS | (peer) danh mục loại phép hiệu lực · quỹ theo ATT-04…07 |
| Hệ thống | Panel read-only · preview-deduction · `lockPendingLeaveBalance` → `pending_days` |
| ATT-05 / ATT-09 / ATT-04 / ATT-04b | Peers **must_keep** — **≠** claim DONE from 05b seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O18 CONFIRM · AC-ATT-05B-* · residuals **R-ATT-05B-*** · J-HRM-ATT-05B-* DRAFT | Impl `apps/**` / migration / seed |
| RETAIN cite panel + by-type + hold column semantics | Nest `/core` SoT · invent `att_leave_hold` |
| GAP AC submit-form consumer bind on LeaveTab | FY rollover · PAY · ATT-05 closure |
| Unlock **dev-fe** `R-ATT-05B-PANEL-FE` · **ba-data HOLD** confirm | Claim FR-05b / ATT-05b / ATT-05 / ATT UAT DONE |

### SA Option A — BA CONFIRM (đóng O1–O18)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Panel API | **YES RETAIN** — `GET …/leave-balance/panel` 5 buckets (`annual` · `seniority` · `compensatory` · **`carry_over`** · `advance`) · display-ready entitled/used/**pending**/available · **≠** endpoint alone = FR-05b DONE — **AC-ATT-05B-PANEL-API** · **AC-ATT-05B-≠-API-DONE** |
| **O2** | `carry_over` bucket | **YES RETAIN** — bucket riêng «Phép chuyển kỳ» · **DENY** gộp số vào cột/hàng `annual` trên panel — **AC-ATT-05B-CARRY-SEP** · **`ATT05QC1`** |
| **O3** | Hold display | **YES RETAIN** — panel `pending` = **`employee_leave_balances.pending_days`** · available = entitled − used − pending · **DENY** invent `att_leave_hold` — **AC-ATT-05B-HOLD-DISPLAY** · **AC-ATT-05B-MK-ATT09** |
| **O4** | Picker SoT | **YES** — loại form = mã từ **F-ATT-CAT-EFF-01** / catalog hiệu lực · **DENY** ô chữ tự do làm SoT panel — **AC-ATT-05B-PICKER** · **R-ATT-05B-PICKER** |
| **O5** | Empty catalog | **YES GAP AC** — SRS **#0b**: picker trống trung thực + hint quản trị danh mục · **không** seed/fake row — **AC-ATT-05B-EMPTY** · **R-ATT-05B-EMPTY** |
| **O6** | Submit-form wire | **YES GAP** — Luồng chính **1–4** trên **đơn nghỉ** (LeaveTab create): load panel khi mở form — **AC-ATT-05B-FORM-PANEL** · **R-ATT-05B-PANEL-FE** |
| **O7** | Type change | **YES** — đổi loại → refetch `GET panel` và/hoặc `GET ?leave_type=` · panel tính lại theo loại mới — **AC-ATT-05B-TYPE-REFETCH** |
| **O8** | Post-submit | **YES** — sau `POST …/leave-requests` **2xx**: bucket matching type shows **pending** tăng · **F5** persisted · peer ATT-09 — **AC-ATT-05B-POST-HOLD** · **R-ATT-05B-HOLD-UI** |
| **O9** | Preview days | **YES RETAIN cite** — `POST …/preview-deduction` (ATT-08) khi nhập khoảng nghỉ · panel/dự kiến trừ cập nhật — **AC-ATT-05B-PREVIEW** (wire on form) |
| **O10** | Overlap | **YES** — hai đơn chồng ngày → chặn + banner form (cite `assertNoLeaveOverlap`) — **AC-ATT-05B-OVERLAP** · **R-ATT-05B-OVERLAP** |
| **O11** | Advance/unpaid hint | **YES footer** — hết phép → gợi ý không lương/ứng (peer ATT-04b) · **≠ ATT-04b DONE** — **AC-ATT-05B-ADV-HINT** · **R-ATT-05B-ADV-HINT** |
| **O12** | ATT-05 peer | **YES must_keep** — **`ATT05QC1-MSM52GWC1`** · carry spine · **≠ FR-05 DONE** from 05b seat — **AC-ATT-05B-MK-ATT05** |
| **O13** | ATT-09 peer | **YES must_keep** — **`ATT09QC1-MSLUTL9D`** · **DENY `att_leave_hold`** — **AC-ATT-05B-MK-ATT09** |
| **O14** | ATT-04/04b | **YES must_keep** — **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · **DENY wipe** — **AC-ATT-05B-MK-ATT04** · **AC-ATT-05B-MK-ATT04B** |
| **O15** | FY footer | **YES HOLD** — panel `balance_year` interim calendar HCM · **R-ATT-05-FY-CAL** · **R-ATT-05-FY** until CRUD lands — **AC-ATT-05B-FY-FOOTER** |
| **O16** | Deduct order | **YES HOLD footer** — **R-ATT-05-DEDUCT** non-blocking on 05b consumer slice — **AC-ATT-05B-DEDUCT-FOOTER** |
| **O17** | Paper `/core` | **YES** — `/att` + `/core` alias only · Network SoT `/api/hrm/attendance/*` — **AC-ATT-05B-PATH** |
| **O18** | Honesty / journeys | **YES false** — mint **`J-HRM-ATT-05B-01..06` DRAFT** · U65 · C-SLICE · **≠ ATT-05b DONE** · **≠ ATT-05 DONE** · **≠ ATT-04/04b DONE** · **≠ ATT UAT** — **AC-ATT-05B-H** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Panel read (RETAIN) | **`GET …/leave-balance/panel`** | F-ATT-LEAVE-BAL panel | **#1** · Luồng **2** |
| Selected type (RETAIN) | **`GET …/leave-balance?leave_type=`** | F-ATT-LEAVE-BAL by-type | **#1** · O7 |
| Effective types (RETAIN) | effective leave types API | F-ATT-CAT-EFF-01 | **#0a** |
| Preview days (RETAIN cite) | **`POST …/preview-deduction`** | F-ATT-LEAVE-01 | Luồng **3** |
| Submit + hold (RETAIN cite) | **`POST …/leave-requests`** | F-ATT-LEAVE-02 | **#2** · Luồng **4** |
| `carry_over` row (RETAIN peer) | ledger `leave_type=carry_over` | F-ATT-LEAVE-BAL carry | peer ATT-05 · O2 |

**Invariant ATT-05B-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` SoT = **FAIL**.

**Invariant ATT-05B-≠-API-DONE:** Claim `GET panel` 200 alone = FR-05b / ATT-05b DONE = **FAIL O1/O18**.

**Invariant ATT-05B-≠-MERGE:** Hiển thị `carry_over` chỉ trong bucket `annual` hoặc ẩn bucket `carry_over` = **FAIL O2** · **`ATT05QC1`**.

**Invariant ATT-05B-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O3/O13**.

**Invariant ATT-05B-PICKER:** Panel driven by free-text type field not in catalog = **FAIL O4**.

**Invariant ATT-05B-SETTINGS-ONLY:** Panel chỉ trên settings/admin · không trên form đơn nghỉ = **FAIL O6/O18**.

**Invariant ATT-05B-MK-ATT05:** Claim FR-05 DONE or wipe carry separation from 05b wave = **FAIL O12**.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-05b / FR-05b DONE** · **≠ ATT-05 / FR-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT-04b DONE** (`ATT04BQC1-MSM3S8QC1`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-09 `pending_days` · ATT-03d · **R-ATT-05-FY/ENGINE/DEDUCT/FY-CAL** footers · **R-MAIN-EFFECTIVE-EMPTY** non-blocking · **R-ATT-01-ASSIGN open** · DENY `att_leave_hold` · DENY merge carry→annual · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-33 #38 · Option A) |
|---|----------------------|--------------------------------|
| `GET panel` 5 buckets | **PRESENT** | **RETAIN cite** (**O1**) · **≠** consumer DONE |
| `carry_over` separate | Panel bucket **PRESENT** | **RETAIN** (**O2**) · **DENY** merge |
| `pending_days` hold | **PRESENT** (ATT-09) | **RETAIN** on panel (**O3**) |
| EFF picker API | **PRESENT** | **RETAIN** + **GAP** form bind (**O4**) |
| Empty catalog UX | **GAP** | **AC** honest empty (**O5**) |
| Submit-form panel | Settings deepen **partial** | **GAP** LeaveTab wire (**O6–O10**) |
| Post-submit F5 | BE lock **PRESENT** | **GAP** FE AC (**O8**) |
| Preview on form | ATT-08 **PRESENT** | **RETAIN** wire peer (**O9**) |
| Overlap | BE assert **PRESENT** | **GAP** form banner (**O10**) |
| Advance hint | ATT-04b peer | **GAP** footer UX (**O11**) |
| ATT-05 sealed | **`ATT05QC1`** GWC | **must_keep** (**O12**) |
| FY / deduct | HOLD footers | **non-blocking** (**O15–O16**) |

### 1.1 Residual map **R-ATT-05B-*** (consumer unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-ATT-05B-PICKER** | Loại ∈ EFF/catalog on form | **IN-SCOPE AC** | **dev-fe** |
| **R-ATT-05B-PANEL-FE** | Panel on đơn nghỉ open/change/submit | **IN-SCOPE GAP** | **dev-fe** (primary) |
| **R-ATT-05B-HOLD-UI** | pending/available after submit + F5 | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-ATT-05B-EMPTY** | Catalog empty SRS #0b | **IN-SCOPE GAP** | **dev-fe** |
| **R-ATT-05B-OVERLAP** | Overlap banner on form | **IN-SCOPE AC** | **dev-fe** |
| **R-ATT-05B-ADV-HINT** | Unpaid/advance hint | **IN-SCOPE footer** | **dev-fe** (non-LIVE 04b OK) |
| **R-ATT-05B-FY-FOOTER** | Calendar year on panel | **HOLD** peer **R-ATT-05-FY-CAL** | footer only |
| **R-ATT-05B-≠DONE** | Honesty | **IN-SCOPE** | **qc** |

**Carry (non-blocking):** **R-ATT-05-FY** · **R-ATT-05-ENGINE** · **R-ATT-05-DEDUCT** · **R-ATT-04B-*** · **R-MAIN-EFFECTIVE-EMPTY** — **do not block** 05b BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LV-PANEL-01** | Mở form đơn nghỉ | Panel đọc quỹ theo loại | NV thấy entitled/used/pending/available trước gửi | AC-ATT-05B-FORM-PANEL · J-01 |
| **BR-BP-LV-PANEL-01-READ** | Panel render | Chỉ đọc | **Không** sửa quỹ tay trên panel | J-02 |
| **BR-BP-LV-PANEL-01-PICKER** | Catalog có phần tử | Picker danh mục | **DENY** free-text SoT | AC-ATT-05B-PICKER · J-03 |
| **BR-BP-LV-PANEL-01-EMPTY** | Catalog trống | Empty + hint | **Không** fake sample | AC-ATT-05B-EMPTY · J-05 |
| **BR-BP-LV-02-SEP** (peer ATT-05) | Panel multi-bucket | Display | **`carry_over`** bucket **separate** from `annual` | AC-ATT-05B-CARRY-SEP · J-02 |
| **BR-BP-LV-06** (peer ATT-09) | Submit tracked | `pending_days +=` | Panel `pending` khớp · **DENY** `att_leave_hold` | AC-ATT-05B-POST-HOLD · J-04 |
| **BR-BP-LV-07** (peer 04b) | Hết phép | Hint | Gợi ý ứng/không lương footer | AC-ATT-05B-ADV-HINT · J-06 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#0a** | Mở form · catalog | **PICKER** · **FORM-PANEL** | **J-HRM-ATT-05B-01** | **F-ATT-CAT-EFF-01** RETAIN |
| **#0b** | Catalog trống | **EMPTY** | **J-HRM-ATT-05B-05** | empty list RETAIN |
| **#1** | Chọn loại · panel | **TYPE-REFETCH** · **CARRY-SEP** | **J-HRM-ATT-05B-02** · **J-03** | panel + by-type RETAIN |
| **#2** | Gửi đơn · hold | **POST-HOLD** | **J-HRM-ATT-05B-04** | **F-ATT-LEAVE-02** RETAIN |
| Luồng **3** | Nhập khoảng · dự kiến trừ | **PREVIEW** | **J-03** (step) | preview RETAIN |
| Luồng **4** | Hold + panel | **HOLD-DISPLAY** | **J-04** | pending_days RETAIN |
| Đặc biệt | Đổi loại | **TYPE-REFETCH** | **J-03** | refetch |
| Đặc biệt | Chồng ngày | **OVERLAP** | **J-04** alt | assert RETAIN |
| Đặc biệt | Mã lạ | **PICKER** reject | **J-03** | 4xx |
| O18 | Seals · ≠DONE | **AC-ATT-05B-H** | **J-HRM-ATT-05B-06** | — |

### 3.1 AC-ATT-05B pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-05B-PATH** | Any 05b path | Network | Physical `/api/hrm/attendance/*` only · Nest `/core` SoT **0** | U65 · J-* |
| **AC-ATT-05B-PANEL-API** | BE LIVE | Probe/doc cite | `GET panel` returns 5 buckets incl. `carry_over` · zeros not 404 storm | O1 · cite only ≠ DONE |
| **AC-ATT-05B-≠-API-DONE** | Panel API exists | DONE claim | **FAIL** if endpoint alone = FR-05b DONE | O1/O18 |
| **AC-ATT-05B-CARRY-SEP** | NV mở form + panel | Render buckets | Distinct **`carry_over`** row/section «Phép chuyển kỳ» · **no** merge into `annual` display | O2 · J-02 |
| **AC-ATT-05B-HOLD-DISPLAY** | Có `pending_days` | Panel load | `pending` + `available` = entitled − used − pending on item | O3 · J-02/J-04 |
| **AC-ATT-05B-PICKER** | Catalog có loại | Mở form | Dropdown/select từ effective types · **no** free-text SoT | O4 · J-03 |
| **AC-ATT-05B-EMPTY** | Catalog trống (U65: tenant honest empty) | Mở form | Picker empty · hint VI quản trị loại phép · **no** invented options | O5 · J-05 |
| **AC-ATT-05B-FORM-PANEL** | NV · tab Nghỉ phép · Tạo đơn | Mở form | Panel quỹ visible **on submit form** (not settings-only) · `GET panel` or by-type **2xx** same session | O6 · J-01 · U65 |
| **AC-ATT-05B-TYPE-REFETCH** | Form mở | Đổi loại phép | Network refetch panel/by-type · UI cập nhật số theo loại mới | O7 · J-03 |
| **AC-ATT-05B-POST-HOLD** | Đủ số dư · loại ∈ catalog | Gửi đơn **2xx** | Panel bucket matching type: `pending` tăng · **F5** còn · peer ATT-09 | O8 · J-04 · U65 |
| **AC-ATT-05B-PREVIEW** | Nhập from/to | Blur/change dates | `POST preview-deduction` **2xx** · số ngày dự kiến hiển thị (peer ATT-08) | O9 · J-03 |
| **AC-ATT-05B-OVERLAP** | Đơn approved/pending trùng ngày | Gửi | **4xx** overlap · FE banner · không tạo đơn | O10 · J-04 |
| **AC-ATT-05B-ADV-HINT** | `available` = 0 hoặc vượt | Nhập đơn | Footer/hint unpaid/advance (peer 04b) · **≠** claim 04b DONE | O11 · J-06 footer |
| **AC-ATT-05B-MK-ATT05** | Footer | Evidence | **`ATT05QC1-MSM52GWC1`** · **≠ FR-05 DONE** from 05b · **DENY merge** | O12 |
| **AC-ATT-05B-MK-ATT09** | Footer | Evidence | **`ATT09QC1-MSLUTL9D`** · **DENY `att_leave_hold`** | O13 |
| **AC-ATT-05B-MK-ATT04** | 05b wave | Dev paths | **No** wipe ATT-04 LVT/LVRULE/grant · **`ATT04QC1`** | O14 |
| **AC-ATT-05B-MK-ATT04B** | 05b wave | Dev paths | **No** wipe advance paths · **`ATT04BQC1`** | O14 |
| **AC-ATT-05B-FY-FOOTER** | Panel year label | QC | Calendar interim documented · **≠** FY CRUD DONE | O15 · J-06 |
| **AC-ATT-05B-DEDUCT-FOOTER** | Submit | QC | **R-ATT-05-DEDUCT** HOLD non-blocking | O16 · J-06 |
| **AC-ATT-05B-H** | Program | QC GWC | `attendance_uat_ready=false` · **≠ ATT-05b DONE** · **≠ ATT-05/04/04b DONE** · **≠ ATT UAT** · C-SLICE | O18 · J-06 |

---

## 4. J-HRM-ATT-05B-* DRAFT (narrow · U65 · Nest `/core` 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-ATT-05B-01** | **consumer** | **Mở form đơn → panel quỹ trên đơn nghỉ** | Login `ceo@xe.vn` → HRM embed → Chấm công / **Nghỉ phép** → **Tạo đơn** (LeaveTab) → panel hiện **trên form** (annual · seniority · compensatory · **Phép chuyển kỳ** · ứng…) · Network `GET …/leave-balance/panel` **2xx** · **F5** còn · Nest `/core` **0** · no seed · **≠** settings-only · **≠** API-alone = DONE | AC-ATT-05B-FORM-PANEL/PATH · O1/O6 · **DRAFT** |
| **J-HRM-ATT-05B-02** | **consumer** | **Bucket chuyển kỳ tách khỏi phép năm** | Cùng form · khi có số liệu: bucket/row **`carry_over`** («Phép chuyển kỳ») **tách** khỏi `annual` · **DENY** gộp im lặng · F5 · must_keep **`ATT05QC1`** | AC-ATT-05B-CARRY-SEP · O2 · **DRAFT** |
| **J-HRM-ATT-05B-03** | **consumer** | **Picker danh mục · đổi loại · preview** | Chọn loại từ **dropdown catalog** (EFF) · **không** free-text SoT → đổi loại khác → panel refetch **2xx** · nhập khoảng nghỉ → preview-deduction **2xx** khi wired · Nest `/core` **0** | AC-ATT-05B-PICKER/TYPE-REFETCH/PREVIEW · O4/O7/O9 · **DRAFT** |
| **J-HRM-ATT-05B-04** | **consumer** | **Gửi đơn → hold trên panel + F5** | Chọn loại tracked · nhập khoảng hợp lệ · **Gửi** → `POST leave-requests` **2xx** · FE-after-2xx: `pending` tăng trên bucket đúng loại · **F5** persisted · **≠** `att_leave_hold` table | AC-ATT-05B-POST-HOLD/HOLD-DISPLAY · O3/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-05B-05** | **consumer** | **Danh mục trống (SRS #0b)** | Tenant/catalog hiệu lực **trống** (honest — no seed) → mở form → picker **empty** + hint quản trị · **no** fake leave types · Nest `/core` **0** | AC-ATT-05B-EMPTY · O5 · **DRAFT** · *conditional persona/tenant* |
| **J-HRM-ATT-05B-06** | **cross** | **Overlap · hints · seals · ≠DONE** | (a) Overlap: đơn trùng ngày → **4xx** + banner · (b) **FY/DEDUCT footer** · advance hint footer · Nest `/core` **0** · **≠ ATT-05b DONE** · **≠ ATT-05 DONE** (`ATT05QC1`) · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · must_keep **`ATT09QC1`** · **`ATT03DQC1`** · **`ATT04QC1`** · **`ATT04BQC1`** · **R-ATT-05-FY/ENGINE/DEDUCT** · **R-MAIN-EFFECTIVE-EMPTY** · **R-ATT-01-ASSIGN open** · printable false · PAY OUT · DENY merge annual · DENY `att_leave_hold` | AC-ATT-05B-OVERLAP/ADV-HINT/H/MK-* · O10–O18 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence on **đơn nghỉ** path · QC GWC C-SLICE only · **≠** auto-flip readiness · **narrow ≠ full ATT/PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§59** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-ATT-05B-FORM-PANEL** | Panel on LeaveTab submit | **GAP** — primary delivery | **dev-fe** `R-ATT-05B-PANEL-FE` |
| **G-ATT-05B-EMPTY** | Empty catalog UX | **GAP** | **dev-fe** |
| **G-ATT-05B-OVERLAP-FE** | Overlap banner | **GAP** partial | **dev-fe** |
| **G-ATT-05B-ADV-HINT** | Unpaid/advance hint | **GAP footer** | **dev-fe** |
| **H-ATT-05B-FY-FOOTER** | `balance_year` calendar | **HOLD** — **R-ATT-05-FY-CAL** | non-blocking |
| **H-ATT-05B-DEDUCT** | Deduct order | **HOLD** — **R-ATT-05-DEDUCT** | dev-be when in scope |
| **H-ATT-05B-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |
| **H-ATT-05B-PANEL-SCHEMA** | DB panel ADD | **HOLD default** — RETAIN cite API | **ba-data** only if DTO gap stamped |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **HOLD default** `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01` — confirm **DENY** `att_leave_hold` · **no** panel table ADD unless BA stamps consumer DTO gap | DATA-01 PASS_TO_PM (short HOLD doc) |
| **sa** | API deepen **ONLY** if BA stamps DTO gap (default: **RETAIN cite panel**) | optional API-01 |
| **dev-fe** | **UNLOCK** `R-ATT-05B-PANEL-FE` · picker · refetch · hold UI · empty · overlap · hint footers on LeaveTab | READY_FOR_QA |
| **dev-be** | **HOLD** — panel/hold already LIVE; no merge carry logic | unless API stamp |
| **qa** | U65 **J-HRM-ATT-05B-01..04** mandatory on đơn nghỉ · J-05 conditional · J-06 cross | PASS_TO_PM |
| **qc** | GWC C-SLICE · ≠ ATT-05b/05/04/04b/ATT UAT · must_keep **`ATT05QC1`** + peers | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O18 CONFIRMED** for UC-BP-ATT-05b / FR-UC-BP-ATT-05b / BR-BP-LV-PANEL-01 against SA Option A: **RETAIN cite** `GET panel` + by-type + **`pending_days`** + **`carry_over`** separate bucket; **GAP** consumer **R-ATT-05B-*** on submit form; AC-ATT-05B-*; mint **J-HRM-ATT-05B-01..06 DRAFT** (U65); unlock **dev-fe** `R-ATT-05B-PANEL-FE` + **ba-data HOLD**; explicit **≠ ATT-05b DONE** · **≠ ATT-05 DONE** (`ATT05QC1`) · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · printable **false** · **C-SLICE** · **PAY OUT** · must_keep seals · **DENY** `att_leave_hold` · **DENY** merge carry→annual · **DENY** claim API alone = DONE |
| **Residual (open)** | dev-fe submit-form wire · ba-data HOLD stamp · optional sa API DTO · QA U65 J-* · QC GWC · **R-ATT-05-FY/ENGINE/DEDUCT** footers |
| **next_owner** | **dev-fe** (primary) · **ba-data** (parallel HOLD) |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — dev-fe primary)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01
role: dev-fe
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #38)
lane: execution · UC-BP-ATT-05b · FR-UC-BP-ATT-05b · BR-BP-LV-PANEL-01 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md (carry_over separate · ATT05QC1 must_keep)
  - docs/qa/evidence/po-hrm-att-03d-05b-be-01.md (GET panel 5 buckets)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-05b · #0a–#2 · Luồng 1–4)
entry_criteria: BA O1–O18 CONFIRMED · L0 qc:fe-be-health 0 · U65 zero-seed · no invent att_leave_hold · no merge carry→annual display
exit_criteria:
  - Wire R-ATT-05B-PANEL-FE on LeaveTab create: open form → GET panel/by-type · type change refetch · preview-deduction peer · post-submit pending display · F5
  - R-ATT-05B-PICKER (EFF catalog) · R-ATT-05B-EMPTY honest empty+hint · R-ATT-05B-OVERLAP banner · R-ATT-05B-ADV-HINT footer (peer 04b non-DONE OK)
  - allowed_paths: apps/hrm-fe/** LeaveTab / leave create path only (narrow)
  - must_keep: ATT05QC1-MSM52GWC1 · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · DENY Nest /core dual · DENY wipe carry_over bucket
  - regression: vitest touched modules · build PASS
  - ack_status READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-fe-01.md
  - pm_dispatch_hint: QA PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QA-01 · J-HRM-ATT-05B-01..06 U65
cấm: seed · invent att_leave_hold · merge carry_into annual panel · honesty flip · claim ATT-05b/ATT-05/ATT UAT DONE · demote carry_over bucket in API
```

### 7.2 next_dispatch_prompt (copy-ready — ba-data parallel HOLD)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #38)
lane: governance · UC-BP-ATT-05b · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (employee_leave_balances · pending_days · carry_over row · DENY att_leave_hold)
entry_criteria: BA O1–O18 CONFIRMED · default RETAIN cite panel API — no schema ADD unless DTO gap stamped
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-DATA-01.md
  - HOLD default: RETAIN pending_days on employee_leave_balances · separate leave_type=carry_over · DENY physical att_leave_hold · no panel table invent
  - ADD only if closable + BA stamp: consumer display DTO field gap (else explicit HOLD waiver)
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge carry into annual
```
