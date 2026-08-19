# BA AC pack — Wave-33 ATT cluster · UC-BP-ATT-06 (Phép nghỉ bù từ tăng ca · RETAIN quỹ `compensatory` + OT TXN + comp catalog · GAP policy/accrual engine)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-33 seat **#39**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O20 **CONFIRMED** · **ba-data HOLD default** next · dev-be/dev-fe **HOLD** until DATA stamp · **DENY** claim panel `compensatory` row / `att_ot_comp_type` catalog alone = FR-06 DONE · **DENY** ATT-06 / ATT-05/05b/04/04b / ATT UAT DONE · **printable false RETAIN** · **PAY OUT** |
| **change_mode** | **ADD** (align SA-06 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** merge `compensatory`/`carry_over` into `annual` · **no** wipe **`ATT05BQC1-MSM5SDQC1`** / peer seals) |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-05b **`ATT05BQC1-MSM5SDQC1`** (**must_keep · ≠ ATT-05b DONE**) · **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** (**pending_days · DENY `att_leave_hold`**) · **`ATT03DQC1-MSM1CR19`** · **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** · **R-ATT-05-FY** · **R-ATT-05-ENGINE** · **R-ATT-05-DEDUCT** · **R-ATT-10-DISP** P2 HOLD · **R-ATT-11-WF/EMIT** HOLD · **R-ATT-01-ASSIGN open** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-06** · Diễn biến **#1 · #2** · Luồng chính **1–3** · **BR-BP-LV-03** · peer catalog hình thức bồi thường OT (orthogonal — chọn trên đơn OT ≠ tự cộng quỹ) |
| **ref_api_paper** | **F-ATT-LEAVE-BAL** panel/by-type/grant · **F-ATT-LEAVE-02** submit · **F-ATT-OT-TXN** create/approve · **F-ATT-CAT-OTC** · **F-ATT-OT-COMP-POLICY** *(GAP)* · **F-ATT-OT-COMP-ACCRUE** *(GAP)* · **F-ATT-SHEET-01** AGG peer · **F-ATT-SHEET-02** close peer |
| **ref_db** | `employee_leave_balances` (`leave_type=compensatory`) · `overtime_requests` (`compensation_type` · `status` · `total_hours`) · `att_ot_comp_type` · `att_leave_type.category` incl. **`ot_comp`** · **DENY** physical `att_leave_hold` |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qc-01.md` (**ATT05BQC1** must_keep) |
| **Honesty** | `attendance_uat_ready=false` · **`contracts_printable_ready=false` RETAIN** · **C-SLICE-≠-MODULE** · **DENY** compensatory panel row / ot_comp catalog alone = FR-06 DONE · **DENY** ATT-06 / ATT-05/05b/04/04b / ATT UAT DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` · merge compensatory/carry→annual · accrual trigger = sheet close (ATT-11) · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-33 seat **#39** — **gap-only RETAIN** LIVE quỹ **`compensatory`** + panel bucket «Phép bù OT» (peer ATT-05b) · **`PUT …/leave-balance/tracked-entitlement`** (interim HR grant · ATT-04 path) · trừ/hold đơn nghỉ bù (**ATT-09** `pending_days`) · OT TXN create/approve · danh mục **`att_ot_comp_type`** (intent trên đơn OT — **orthogonal**) — **GAP** engine **policy toggle · hours→days · approve→accrual · draft guard · mode-OFF · idempotency · type map · panel on comp leave form · ATT-10 double-guard footer**:

1. **Quỹ `compensatory`** = ledger/panel bucket **tách** — **≠** row alone = FR-06 DONE (**O1**).
2. **Interim grant** = `tracked-entitlement` sau chuỗi FE approve OT (hoặc HR) — **label interim** until **R-ATT-06-ACCRUE** LIVE (**O2**).
3. **Deduct + hold** = `POST leave-requests` loại `ot_comp`/`compensatory` + **`pending_days`** — **DENY `att_leave_hold`** (**O3**).
4. **OT comp catalog** = `att_ot_comp_type` + `compensation_type` on create — **≠** accrual engine DONE (**O4**).
5. **Approve OT today** = `status=approved` only — baseline pre-engine (**O5**).
6. **Policy + ratio** = GAP **R-ATT-06-POLICY** (**O6–O7**).
7. **Approve→accrue** = GAP SRS Diễn biến **#1** **R-ATT-06-ACCRUE** (**O8**).
8. **Draft / OFF / idempotency / type map / panel FE** = residuals **R-ATT-06-*** (**O9–O13**).
9. **ATT-10 / ATT-11** = context gates only — close **≠** accrual trigger (**O14–O15**).
10. **Peers ATT-05b/05/04/09** = **must_keep** — **≠** claim DONE from 06 seat (**O16–O18**).
11. **Honesty + J-*** = mint **`J-HRM-ATT-06-01..07` DRAFT** (**O19–O20**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS | Bật/tắt chế độ bù OT (GAP policy) · cấu hình tỷ lệ giờ→ngày (GAP) · interim `tracked-entitlement` khi engine chưa LIVE |
| Quản lý | Duyệt OT trên UI (U65) · **không** dùng seed/API giả accrual |
| Nhân viên | Nộp OT chọn `compensatory_leave` (hoặc mã map leave-comp) · nộp đơn nghỉ bù |
| Hệ thống | Panel read-only · approve OT (today: status only) · lock pending on leave submit |
| ATT-05b / ATT-09 / ATT-04 / ATT-10 / ATT-11 | Peers **must_keep** — **≠** claim DONE from 06 seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O20 CONFIRM · AC-ATT-06-* · residuals **R-ATT-06-*** · J-HRM-ATT-06-* DRAFT | Impl `apps/**` / migration / seed |
| RETAIN cite compensatory ledger + OT TXN + comp catalog | Nest `/core` SoT · invent `att_leave_hold` |
| GAP AC policy/accrual engine + panel on comp leave + mode-OFF | PAY DONE · ATT module UAT flip |
| Unlock **ba-data HOLD** default | Claim catalog/panel alone = FR-06 DONE |

### SA Option A — BA CONFIRM (đóng O1–O20)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | `compensatory` ledger/panel | **YES RETAIN** — `employee_leave_balances.leave_type=compensatory` · panel item «Phép bù OT» via **`GET …/leave-balance/panel`** (peer 05b) · bucket **separate** from `annual` and **`carry_over`** — **AC-ATT-06-COMP-BUCKET** · **AC-ATT-06-≠-PANEL-DONE** |
| **O2** | HR grant interim | **YES RETAIN** — **`PUT …/leave-balance/tracked-entitlement`** upserts `entitled_days` for `compensatory` · U65 product path after **FE approve OT** (or HR admin) until **R-ATT-06-ACCRUE** LIVE · evidence **must label «interim»** · **≠** claim engine DONE — **AC-ATT-06-INTERIM-GRANT** |
| **O3** | Deduct + hold | **YES RETAIN** — `POST …/leave-requests` with loại ∈ catalog mapping **`compensatory`/`ot_comp`** → balance assert + **`pending_days`** (**`ATT09QC1`**) · **DENY** invent `att_leave_hold` — **AC-ATT-06-DEDUCT-HOLD** · **AC-ATT-06-MK-ATT09** |
| **O4** | OT comp catalog orthogonal | **YES RETAIN** — Nest **`att_ot_comp_type`** CRUD + assert on OT create (`HRM-ATT-OT-COMP-KEY`) marks **intent** on `overtime_requests.compensation_type` · **≠** automated accrual · **≠** FR-06 DONE alone — **AC-ATT-06-CAT-ORTH** · **AC-ATT-06-≠-CATALOG-DONE** |
| **O5** | Approve OT TXN baseline | **YES RETAIN** — `POST …/overtime-requests/:id/approve` today flips **`status=approved` only** · **no** `entitled_days` mutation pre-engine — **AC-ATT-06-OT-APPROVE-BASE** |
| **O6** | Policy toggle | **YES GAP** — tenant «chế độ bù OT» ON/OFF CRUD (**R-ATT-06-POLICY**) · SRS tiên quyết — **AC-ATT-06-POLICY-TOGGLE** |
| **O7** | Hours→days ratio | **YES GAP** — tenant CRUD tỷ lệ quy đổi giờ→ngày for OT-comp (**R-ATT-06-POLICY**) · ratio > 0 when ON — **AC-ATT-06-HOURS-DAYS** |
| **O8** | Approve→accrual engine | **YES GAP** — when policy ON ∧ OT `approved` ∧ `compensation_type` maps to leave-comp → **+quỹ `compensatory`** idempotent per OT id (**R-ATT-06-ACCRUE**) · SRS Diễn biến **#1** · U65 chain: approve OT → (engine **or** interim grant) → panel ↑ — **AC-ATT-06-ACCRUE-ENGINE** |
| **O9** | Draft guard | **YES** — **không** cộng quỹ từ OT `draft`/`pending`/`rejected` (**R-ATT-06-DRAFT**) — **AC-ATT-06-DRAFT-GUARD** |
| **O10** | Mode OFF mid-year | **YES** — tắt chế độ → **ngừng cộng mới** · quỹ đã có vẫn dùng + đơn nghỉ bù vẫn trừ được (**R-ATT-06-OFF-MID**) — **AC-ATT-06-MODE-OFF** |
| **O11** | Idempotency | **YES** — approve/retry same OT id **không** double-credit quỹ; reject-after-accrue rules documented (**R-ATT-06-IDEM**) — **AC-ATT-06-IDEM** |
| **O12** | Type map | **YES** — `att_leave_type.category=ot_comp` ↔ panel/deduct `compensatory` (**R-ATT-06-TYPE-MAP**) — **AC-ATT-06-TYPE-MAP** |
| **O13** | Panel on comp leave form | **YES GAP wire** — peer **R-ATT-05B-PANEL-FE** / **R-ATT-06-PANEL-FE**: đơn nghỉ loại bù hiển thị bucket `compensatory` on submit form — **AC-ATT-06-PANEL-FE** |
| **O14** | ATT-10 AGG guard | **YES HOLD footer** — when accrual LIVE: OT chọn hình thức nghỉ bù must **exclude/reduce** payable `ot_hours_weighted` per **BR-BP-LV-03** (**R-ATT-06-AGG** · **R-ATT-06-PAY-DOUBLE**) — non-blocking until engine — **AC-ATT-06-AGG-FOOTER** |
| **O15** | ATT-11 trigger | **YES explicit DENY** — chốt bảng công / `close` **≠** trigger cộng quỹ (SRS **#1** = duyệt OT) — **AC-ATT-06-≠-SHEET-CLOSE-TRIGGER** |
| **O16** | ATT-05b peer | **YES must_keep** — **`ATT05BQC1-MSM5SDQC1`** · panel on submit · **≠ ATT-05b DONE** — **AC-ATT-06-MK-ATT05B** |
| **O17** | ATT-05 carry peer | **YES must_keep** — **`ATT05QC1-MSM52GWC1`** · **`carry_over`** separate · **DENY merge** compensatory or carry into `annual` — **AC-ATT-06-MK-ATT05** · **AC-ATT-06-≠-MERGE-BUCKETS** |
| **O18** | ATT-04/04b + ATT-09 | **YES must_keep** — **`ATT04QC1`** · **`ATT04BQC1`** · **`ATT09QC1`** · **DENY wipe** — **AC-ATT-06-MK-ATT04** · **AC-ATT-06-MK-ATT04B** |
| **O19** | Paper `/core` | **YES** — `/att` + `/core` alias only · Network SoT `/api/hrm/attendance/*` — **AC-ATT-06-PATH** |
| **O20** | Honesty / journeys | **YES false** — mint **`J-HRM-ATT-06-01..07` DRAFT** · U65 · C-SLICE · **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05/05b/04/04b DONE** · **≠ ATT UAT** — **AC-ATT-06-H** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Panel compensatory (RETAIN) | **`GET …/leave-balance/panel`** | F-ATT-LEAVE-BAL panel | **#2** đủ quỹ |
| By-type compensatory (RETAIN) | **`GET …/leave-balance?leave_type=compensatory`** | F-ATT-LEAVE-BAL by-type | **#2** |
| Interim grant (RETAIN) | **`PUT …/leave-balance/tracked-entitlement`** | F-ATT-LEAVE-BAL grant | **#1** interim |
| Submit comp leave (RETAIN) | **`POST …/leave-requests`** | F-ATT-LEAVE-02 | **#2** |
| OT create (RETAIN) | **`POST …/overtime-requests`** | F-ATT-OT-TXN create | input |
| OT approve (RETAIN + GAP hook) | **`POST …/overtime-requests/:id/approve`** | F-ATT-OT-TXN approve | **#1** |
| Comp type catalog (RETAIN) | **`GET/PUT …/ot-comp-types*`** | F-ATT-CAT-OTC | orthogonal |
| Policy (GAP) | **`GET/PUT …/ot-comp-leave-policy`** *(proposed)* | F-ATT-OT-COMP-POLICY | tiên quyết |
| Accrual side-effect (GAP) | on approve *(proposed)* | F-ATT-OT-COMP-ACCRUE | **#1** |
| AGG context (RETAIN peer) | **`POST …/attendance-sheets/:id/aggregate`** | F-ATT-SHEET-01 | Luồng **3** OFF |
| Close context (RETAIN peer) | **`POST …/attendance-sheets/:id/close`** | F-ATT-SHEET-02 | **≠** accrual trigger |

**Invariant ATT-06-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` SoT = **FAIL**.

**Invariant ATT-06-≠-PANEL-DONE:** Claim `compensatory` panel row or `GET panel` 200 alone = FR-06 / ATT-06 DONE = **FAIL O1/O20**.

**Invariant ATT-06-≠-CATALOG-DONE:** Claim `att_ot_comp_type` catalog LIVE = FR-06 DONE = **FAIL O4/O20**.

**Invariant ATT-06-≠-MERGE:** Fold `compensatory` or `carry_over` into `annual` display/ledger = **FAIL O17** · **`ATT05QC1`**.

**Invariant ATT-06-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O3/O18**.

**Invariant ATT-06-≠-SHEET-TRIGGER:** Accrual only on sheet close (ATT-11) = **FAIL O15** · SRS **#1** = approve OT.

**Invariant ATT-06-INTERIM-LABEL:** U65 path using `tracked-entitlement` without «interim» label when engine absent = **FAIL O2/O20**.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05b / FR-05b DONE** (`ATT05BQC1`) · **≠ ATT-05 / FR-05 DONE** (`ATT05QC1`) · **≠ ATT-04 / ATT-04b DONE** (`ATT04QC1` · `ATT04BQC1`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-09 `pending_days` · ATT-03d · ATT-10/11 context only · **R-ATT-05-*** footers · **R-ATT-06-AGG/PAY-DOUBLE** HOLD · **R-ATT-01-ASSIGN open** · DENY `att_leave_hold` · DENY merge compensatory/carry→annual · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-33 #39 · Option A) |
|---|----------------------|--------------------------------|
| Quỹ `compensatory` | Ledger + panel bucket **PRESENT** | **RETAIN cite** (**O1**) · **≠** DONE alone |
| `tracked-entitlement` | **PRESENT** (ATT-04) | **RETAIN interim** (**O2**) |
| Leave deduct + hold | **PRESENT** (ATT-09) | **RETAIN** on comp type (**O3**) |
| `att_ot_comp_type` + OT create assert | **PRESENT** | **RETAIN orthogonal** (**O4**) |
| Approve OT | Status flip only | **RETAIN baseline** (**O5**) · **GAP** accrual hook (**O8**) |
| Policy toggle / hours→days | **ABSENT** | **GAP AC** (**O6–O7**) |
| Auto accrual on approve | **ABSENT** | **GAP AC** (**O8**) |
| Draft / OFF / idem / type map | Partial / **ABSENT** | **GAP AC** (**O9–O12**) |
| Panel on comp leave form | Peer 05b partial | **GAP** **R-ATT-06-PANEL-FE** (**O13**) |
| ATT-10 `ot_hours_weighted` | All approved OT | **RETAIN** + **AGG footer** when engine LIVE (**O14**) |
| ATT-11 close | Lock sheet | **≠** accrual trigger (**O15**) |
| ATT-05b sealed | **`ATT05BQC1`** GWC | **must_keep** (**O16**) |

### 1.1 Residual map **R-ATT-06-*** (engine unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-ATT-06-POLICY** | Toggle ON/OFF + hours→days CRUD | **IN-SCOPE GAP** | **ba-data** (physicalize if closable) → **dev-be** |
| **R-ATT-06-ACCRUE** | Approve OT → +quỹ when policy ON + comp maps leave | **IN-SCOPE GAP** | **dev-be** after DATA |
| **R-ATT-06-DRAFT** | Reject accrual from non-approved OT | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-ATT-06-OFF-MID** | Mode OFF stops new accrual only | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-ATT-06-IDEM** | Per-OT idempotent credit / reversal rules | **IN-SCOPE AC** | **dev-be** |
| **R-ATT-06-TYPE-MAP** | `ot_comp` ↔ `compensatory` | **IN-SCOPE AC** | **dev-be** / **dev-fe** picker |
| **R-ATT-06-PANEL-FE** | Panel `compensatory` on đơn nghỉ bù | **IN-SCOPE GAP** (peer 05b) | **dev-fe** |
| **R-ATT-06-AGG** | ATT-10 payable OT guard when accrual LIVE | **HOLD footer** | **dev-be** when engine LIVE |
| **R-ATT-06-PAY-DOUBLE** | BR-BP-LV-03 no double PAY | **HOLD footer** | PAY slice OUT |
| **R-ATT-06-≠DONE** | Honesty | **IN-SCOPE** | **qc** |

**Carry (non-blocking):** **R-ATT-05-FY** · **R-ATT-05-ENGINE** · **R-ATT-05-DEDUCT** · **R-ATT-10-DISP** · **R-ATT-11-WF** · **R-ATT-01-ASSIGN** — **do not block** 06 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LV-03** | OT đã duyệt · chế độ ON · comp maps leave | Cộng quỹ `compensatory` theo tỷ lệ | Quỹ tăng · PAY không nhân hệ số OT lần nữa khi đã quy đổi | AC-ATT-06-ACCRUE · J-03/04 |
| **BR-BP-LV-03-NO-DRAFT** | OT chưa `approved` | Từ chối accrual | Không cộng quỹ | AC-ATT-06-DRAFT · J-03 alt |
| **BR-BP-LV-03-OFF** | Chế độ OFF | Approve OT | OT vào bảng công (ATT-10) · **no** new accrual | AC-ATT-06-MODE-OFF · J-07 |
| **BR-BP-LV-03-DEDUCT** | Đơn nghỉ bù · đủ quỹ | Trừ `compensatory` + hold | `pending_days` khớp panel | AC-ATT-06-DEDUCT-HOLD · J-05/06 |
| **BR-BP-LV-PANEL-01** (peer 05b) | Mở đơn nghỉ bù | Panel read | NV thấy bucket bù trước gửi | AC-ATT-06-PANEL-FE · J-05 |
| **BR-BP-LV-06** (peer ATT-09) | Submit tracked | `pending_days +=` | **DENY** `att_leave_hold` | J-06 |
| **BR-BP-LV-02-SEP** (peer ATT-05) | Multi-bucket panel | Display | **`carry_over`** · **`compensatory`** **≠** merged into `annual` | AC-ATT-06-≠-MERGE · J-02 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| Tiên quyết | Toggle + tỷ lệ | **POLICY-TOGGLE** · **HOURS-DAYS** | **J-HRM-ATT-06-01** | **F-ATT-OT-COMP-POLICY** GAP |
| **#1** | Duyệt OT · chế độ ON | **ACCRUE-ENGINE** or **INTERIM-GRANT** | **J-HRM-ATT-06-03** · **J-04** | approve + accrual GAP |
| **#2** | Đơn nghỉ bù · đủ quỹ | **DEDUCT-HOLD** · **PANEL-FE** | **J-HRM-ATT-06-05** · **J-06** | leave-requests RETAIN |
| Luồng **3** | Tắt chế độ | **MODE-OFF** | **J-HRM-ATT-06-07** | policy GAP |
| Đặc biệt | OT nháp | **DRAFT-GUARD** | **J-HRM-ATT-06-03** alt | approve baseline |
| Đặc biệt | Catalog comp type | **CAT-ORTH** | **J-HRM-ATT-06-02** | F-ATT-CAT-OTC RETAIN |
| O20 | Seals · ≠DONE | **AC-ATT-06-H** | **J-HRM-ATT-06-07** (footer) | — |

### 3.1 AC-ATT-06 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-06-PATH** | Any 06 path | Network | Physical `/api/hrm/attendance/*` only · Nest `/core` SoT **0** | U65 · J-* |
| **AC-ATT-06-COMP-BUCKET** | Panel LIVE | Load panel | Item `leave_type=compensatory` / label «Phép bù OT» · separate from `annual` and `carry_over` | O1 · J-02 |
| **AC-ATT-06-≠-PANEL-DONE** | Panel row exists | DONE claim | **FAIL** if compensatory row alone = FR-06 DONE | O1/O20 |
| **AC-ATT-06-INTERIM-GRANT** | Engine absent · policy ON or HR path | After **FE** approve OT **2xx** | Optional **`PUT tracked-entitlement`** **2xx** · panel `entitled`/`available` ↑ · evidence tags **interim** | O2 · J-04 · U65 |
| **AC-ATT-06-≠-CATALOG-DONE** | Catalog exists | DONE claim | **FAIL** if `att_ot_comp_type` alone = FR-06 DONE | O4/O20 |
| **AC-ATT-06-CAT-ORTH** | Create OT | Chọn `compensatory_leave` (EFF) | `compensation_type` persisted · **no** auto quỹ until accrual/interim | O4 · J-02 |
| **AC-ATT-06-OT-APPROVE-BASE** | OT pending | Approve **2xx** | `status=approved` · pre-engine: **no** balance mutation unless interim/engine path | O5 · J-03 |
| **AC-ATT-06-POLICY-TOGGLE** | HCNS | CRUD policy | Mode ON/OFF persisted · visible on next OT accrual decision | O6 · J-01 |
| **AC-ATT-06-HOURS-DAYS** | Mode ON | Save ratio | ratio > 0 · used in accrual calc when engine LIVE | O7 · J-01 |
| **AC-ATT-06-ACCRUE-ENGINE** | Mode ON · OT approved · comp maps leave | Approve (or post-approve hook) | `compensatory` `entitled_days` ↑ by `f(hours,ratio)` · idempotent per OT id | O8 · J-04 |
| **AC-ATT-06-DRAFT-GUARD** | OT draft/pending | Attempt accrual | **No** quỹ increase | O9 · J-03 alt |
| **AC-ATT-06-MODE-OFF** | Mode OFF | Approve new OT comp-leave | **No** new accrual · existing quỹ usable · submit comp leave still OK | O10 · J-07 |
| **AC-ATT-06-IDEM** | Same OT id | Double approve/retry | Single credit unit to quỹ | O11 |
| **AC-ATT-06-TYPE-MAP** | Picker `ot_comp` type | Submit leave | Deduct targets `compensatory` row | O12 · J-05 |
| **AC-ATT-06-PANEL-FE** | NV · đơn nghỉ bù | Open form | Panel shows `compensatory` bucket on **submit form** (peer 05b) · **GET panel** **2xx** | O13 · J-05 · U65 |
| **AC-ATT-06-DEDUCT-HOLD** | Đủ quỹ comp | Submit leave **2xx** | `pending` ↑ on compensatory · **F5** · **≠** `att_leave_hold` | O3 · J-06 · U65 |
| **AC-ATT-06-AGG-FOOTER** | Engine LIVE | QC doc | ATT-10 AGG excludes/reduces payable OT for comp-leave OT — **HOLD** until engine | O14 |
| **AC-ATT-06-≠-SHEET-CLOSE-TRIGGER** | Sheet closed | Accrual claim | **FAIL** if close alone credited quỹ | O15 |
| **AC-ATT-06-MK-ATT05B** | Footer | Evidence | **`ATT05BQC1-MSM5SDQC1`** · **≠ ATT-05b DONE** | O16 |
| **AC-ATT-06-MK-ATT05** | Footer | Evidence | **`ATT05QC1-MSM52GWC1`** · **DENY merge** buckets | O17 |
| **AC-ATT-06-MK-ATT04** | 06 wave | Dev paths | **No** wipe ATT-04 grant · **`ATT04QC1`** | O18 |
| **AC-ATT-06-MK-ATT04B** | 06 wave | Dev paths | **No** wipe ATT-04b · **`ATT04BQC1`** | O18 |
| **AC-ATT-06-MK-ATT09** | Footer | Evidence | **`ATT09QC1-MSLUTL9D`** · **DENY `att_leave_hold`** | O3/O18 |
| **AC-ATT-06-MK-ATT10-11** | Context | Evidence | **`ATT10QC1`** · **`ATT11QC1`** · **≠** ATT-10/11 DONE alone | O14/O15 |
| **AC-ATT-06-≠-MERGE-BUCKETS** | Panel/ledger | Display | **No** merge `compensatory` or `carry_over` into `annual` | O17 |
| **AC-ATT-06-H** | Program | QC GWC | `attendance_uat_ready=false` · **≠ ATT-06 DONE** · **≠ ATT-05/05b/04/04b DONE** · **≠ ATT UAT** · C-SLICE | O20 · J-07 |

---

## 4. J-HRM-ATT-06-* DRAFT (narrow · U65 · Nest `/core` 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-ATT-06-01** | **policy** | **Chế độ bù OT + tỷ lệ giờ→ngày (GAP hoặc doc interim)** | Login `ceo@xe.vn` → HRM embed → Cài đặt / chính sách chấm công (path SRS) → xem/cấu hình toggle «bù OT» + ratio khi API LIVE · nếu engine chưa LIVE: evidence ghi **HOLD policy UI** + dùng interim path J-04 · Nest `/core` **0** · no seed | AC-ATT-06-POLICY/HOURS-DAYS · O6/O7 · **DRAFT** · *conditional until BE* |
| **J-HRM-ATT-06-02** | **catalog** | **OT chọn hình thức `compensatory_leave` từ danh mục** | Chấm công → **Tăng ca** → Tạo đơn → picker `compensation_type` từ **`att_ot_comp_type`** EFF · **không** free-text lạ · `POST overtime-requests` **2xx** · **≠** auto quỹ tại create | AC-ATT-06-CAT-ORTH · O4 · **DRAFT** |
| **J-HRM-ATT-06-03** | **ot-approve** | **Duyệt OT (baseline + draft guard)** | QL duyệt đơn J-02 → `POST …/approve` **2xx** · pre-engine: quỹ **chưa** tăng unless interim/engine · thử duyệt OT nháp → **no** accrual | AC-ATT-06-OT-APPROVE-BASE/DRAFT · O5/O9 · **DRAFT** |
| **J-HRM-ATT-06-04** | **accrue** | **Sau duyệt OT → quỹ bù tăng (engine hoặc interim grant)** | **Path A (engine LIVE):** approve J-03 → panel `compensatory` `entitled`/`available` ↑ · **Path B (interim U65):** approve **2xx** → HCNS/FE **`PUT tracked-entitlement`** **2xx** → panel ↑ · **FE-after-2xx** + **F5** · label **interim** in evidence if no engine · Nest `/core` **0** | AC-ATT-06-ACCRUE/INTERIM · O2/O8 · **DRAFT** |
| **J-HRM-ATT-06-05** | **consumer** | **Đơn nghỉ bù — panel bucket trên form** | Nghỉ phép → Tạo đơn → chọn loại **nghỉ bù** (`ot_comp`) → panel hiện bucket **Phép bù OT** · `GET panel` **2xx** · peer **ATT05BQC1** submit-form panel | AC-ATT-06-PANEL-FE · O13 · **DRAFT** |
| **J-HRM-ATT-06-06** | **consumer** | **Gửi đơn nghỉ bù → hold + F5** | Đủ quỹ comp · nhập khoảng hợp lệ → **Gửi** `POST leave-requests` **2xx** · FE-after-2xx: `pending` ↑ trên `compensatory` · **F5** persisted · **≠** `att_leave_hold` | AC-ATT-06-DEDUCT-HOLD · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-06-07** | **cross** | **Mode OFF · seals · ≠DONE** | (a) Tắt chế độ → approve OT comp-leave mới → **no** new accrual · quỹ cũ vẫn nộp đơn được (b) Nest `/core` **0** (c) **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05b/05/04/04b DONE** · **≠ ATT UAT** · must_keep **`ATT05BQC1`** · **`ATT05QC1`** · **`ATT04QC1`** · **`ATT04BQC1`** · **`ATT09QC1`** · **`ATT03DQC1`** · **`ATT10QC1`** · **`ATT11QC1`** · **DENY merge** compensatory/carry→annual · printable false · PAY OUT · **R-ATT-06-AGG** footer HOLD | AC-ATT-06-MODE-OFF/H/MK-* · O10/O20 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip readiness · **narrow ≠ full ATT/PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§60** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-ATT-06-POLICY** | Toggle + hours→days API/DB | **GAP** | **ba-data** → **dev-be** |
| **G-ATT-06-ACCRUE** | Approve hook credit quỹ | **GAP** | **dev-be** |
| **G-ATT-06-PANEL-FE** | Comp leave form panel | **GAP** (extends 05b) | **dev-fe** |
| **G-ATT-06-OT-PICKER-FE** | OT compensation_type picker wire | **GAP partial** | **dev-fe** |
| **H-ATT-06-AGG** | ATT-10 double-count guard | **HOLD footer** | **dev-be** when engine LIVE |
| **H-ATT-06-PAY-DOUBLE** | BR-BP-LV-03 PAY slice | **HOLD** | PAY OUT |
| **H-ATT-06-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |
| **H-ATT-06-POLICY-SCHEMA** | Policy/accrual ledger ADD | **HOLD default** | **ba-data** only if BA stamps closable physical |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **HOLD default** `PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01` — confirm **DENY** `att_leave_hold` · **no** merge `compensatory` into `annual` · ADD policy/accrual tables **only** if closable + BA stamp | DATA-01 PASS_TO_PM |
| **sa** | API-01 deepen **F-ATT-OT-COMP-POLICY** / **F-ATT-OT-COMP-ACCRUE** if DATA stamped | optional API-01 |
| **dev-be** | **HOLD** approve hook + policy until DATA CONFIRMED | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** OT comp picker + panel on comp leave (narrow) until BA/DATA | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-ATT-06-02..06** mandatory · J-01/07 conditional/HOLD | PASS_TO_PM |
| **qc** | GWC C-SLICE · ≠ ATT-06/ATT-05/05b/04/04b/ATT UAT · must_keep full peer chain | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O20 CONFIRMED** for UC-BP-ATT-06 / FR-UC-BP-ATT-06 / BR-BP-LV-03 against SA Option A: **RETAIN cite** `compensatory` quỹ/panel + interim `tracked-entitlement` + leave deduct/hold (ATT-09) + OT TXN + `att_ot_comp_type` catalog orthogonal; **GAP** **R-ATT-06-POLICY/ACCRUE/DRAFT/OFF-MID/IDEM/TYPE-MAP/PANEL-FE**; ATT-10/11 context gates (AGG + close **≠** accrual trigger); AC-ATT-06-*; mint **J-HRM-ATT-06-01..07 DRAFT** (U65); unlock **ba-data HOLD** default; explicit **≠ ATT-06 DONE** · **≠ ATT-05b/05/04/04b DONE** · **≠ ATT UAT** · printable **false** · **C-SLICE** · **PAY OUT** · must_keep **`ATT05BQC1`** + full peer chain · **DENY** `att_leave_hold` · **DENY** merge compensatory/carry→annual · **DENY** panel/catalog-alone DONE |
| **Residual (open)** | ba-data DATA-01 HOLD · sa API-01 optional · dev-be accrual/policy · dev-fe OT+comp leave panel · QA J-* · QC GWC · **R-ATT-06-AGG** footer |
| **next_owner** | **ba-data** (HOLD default) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data HOLD default)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #39)
lane: governance · UC-BP-ATT-06 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (employee_leave_balances.compensatory · overtime_requests · att_ot_comp_type · DENY att_leave_hold · DENY merge compensatory into annual)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days SoT)
entry_criteria: BA O1–O20 CONFIRMED · default RETAIN cite compensatory ledger + OT TXN — no schema ADD unless policy/accrual physicalization closable
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md
  - HOLD default: RETAIN leave_type=compensatory separate from annual/carry_over · RETAIN pending_days on employee_leave_balances · DENY physical att_leave_hold · DENY merge compensatory/carry into annual display keys
  - ADD only if closable + BA stamp: ot-comp-leave-policy row · accrual idempotency ledger (else explicit HOLD waiver with owner+trigger)
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge compensatory or carry_over into annual · honesty flip
```

### 7.2 next_dispatch_prompt (copy-ready — pm orchestration hint)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-PM-01
role: pm
lane: governance
entry_criteria: BA-01 PASS_TO_PM @ docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md · must_keep ATT05BQC1-MSM5SDQC1 through ATT-11 seals
exit_criteria:
  - Dispatch ba-data DATA-01 HOLD (parallel) · hold dev-be/dev-fe until DATA PASS
  - Update PO_HRM_MVP_GD1_CONTINUOUS.md seat #39 BA stamped · PILOT_BUSINESS_FLOW_BA_TRACE §60
  - No attendance_uat_ready flip · C-SLICE honesty
cấm: claim ATT-06 or ATT module UAT DONE from BA pack alone
```
