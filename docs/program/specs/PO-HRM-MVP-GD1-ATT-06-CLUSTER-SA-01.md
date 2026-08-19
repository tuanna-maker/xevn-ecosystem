# PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01 — Option/F.1 · Phép bù OT (tích lũy từ tăng ca) — RETAIN quỹ `compensatory` + OT TXN + catalog hình thức bồi thường · gap engine duyệt→cộng quỹ

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** after ATT-05b QC GWC) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** merge carry→annual · **DENY** wipe ATT peer seals · **DENY** honesty flip · **DENY** claim ATT-06 / ATT module UAT DONE · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD default) → API/BE residual only after BA stamps · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC GWC **`ATT05BQC1-MSM5SDQC1`** · `docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qc-01.md` · seat **#38 SEALED** · **must_keep** **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** (**DENY `att_leave_hold`**) · **`ATT03DQC1-MSM1CR19`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **R-ATT-05-FY** · **R-ATT-05-ENGINE** · **R-ATT-05-DEDUCT** · **R-ATT-10-DISP** P2 HOLD · **R-ATT-11-WF/EMIT** HOLD footers · **R-ATT-01-ASSIGN open** · Nest `/core` **DENY** · **≠ ATT UAT** · PAY OUT · printable **false** |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#39** Wave-33 after ATT-05b (#38 SEALED GWC) |
| **ref_sa_spine** | ATT-05b panel [`PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md) · ATT-05 carry [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md) · ATT-04 grant [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) · ATT-09 hold [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) · ATT-10 AGG [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md) · ATT-11 sign [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) · OT comp catalog peer [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md) · BE cite panel/OT paths in peer QA/BE evidence |
| **ref_honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · product_go **false** · **DENY claim ATT-06 / FR-06 DONE alone** · **DENY claim compensatory panel bucket = FR-06 LIVE** · **DENY claim OT comp catalog = FR-06 DONE** · **DENY claim ATT-05/05b/04/04b DONE from 06 seat** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-06** · Diễn biến **#1 · #2** · Luồng chính **1–3** · **BR-BP-LV-03** · peer SRS v0.40/0.41 danh mục loại tăng ca / hình thức bồi thường (**orthogonal** — chọn hình thức trên đơn OT ≠ tự động cộng quỹ phép) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · **F-ATT-LEAVE-BAL** (`compensatory` bucket) · **F-ATT-CAT-OTC** (`att_ot_comp_type`) · **F-ATT-SHEET-01** OT weighted (ATT-10) · **F-ATT-LEAVE-04** accrue outline HOLD (peer ATT-04) · **F-ATT-LEAVE-02** submit hold (ATT-09) |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — panel · tracked-entitlement · leave-requests · overtime-requests · ot-comp-types* · aggregate peer · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` — `employee_leave_balances` (`leave_type` incl. **`compensatory`**) · `overtime_requests` (`compensation_type` TEXT · `status` · `total_hours`) · `att_ot_comp_type` · `att_leave_type.category` includes **`ot_comp`** · **DENY** physical `att_leave_hold` |
| **ref_code** | **read-only cite:** `leave-balance.service` **`MVP_LEAVE_BALANCE_TYPES`** incl. **`compensatory`** · `GET …/leave-balance/panel` · `PUT …/leave-balance/tracked-entitlement` · `LeaveRequestsService` deduct + **`pending_days`** hold · `attendance-requests.service` **`createOvertimeRequest`** + **`approveOvertimeRequest`** (status flip **only** — **no** `entitled_days` mutation) · `att-ot-comp-type.service` · `att-timesheet-line-aggregate` approved OT → **`ot_hours_weighted`** (**ignores** `compensation_type` today) · **no** `hours_to_days` OT-comp tenant toggle in hrm-api grep |
| **OUT** | Nest `/core` dual accrual SoT · wipe ATT-05/05b/04/04b/09/03d seals · invent `att_leave_hold` · merge **`compensatory`** into **`annual`** or **`carry_over`** · merge carry→annual (ATT-05) · invent ASSIGN/PAY/printable DONE · claim **`GET panel` compensatory row alone** = ATT-06 DONE · claim **`att_ot_comp_type` catalog alone** = ATT-06 DONE · ATT UAT flip · reopen sealed **J-HRM-ATT-05B** without regression · seed |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-33 architecture unlock: **Phép nghỉ bù từ tăng ca** (FR-UC-BP-ATT-06 · BR-BP-LV-03) vs AS-IS LIVE quỹ `compensatory` + OT TXN + catalog hình thức bồi thường — **gap engine** «duyệt OT → cộng quỹ» under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after ATT-05b QC GWC (`ATT05BQC1-MSM5SDQC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-06 · BR-BP-LV-03 · REQ_NP_004 · must_keep full ATT peer chain through **ATT05BQC1** · bind **ATT-10** (phễu OT tính lương) · **ATT-11** (chốt bảng công PAY gate) · Nest `/core` DENY · PAY OUT · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-05b SEALED (`ATT05BQC1-MSM5SDQC1`):** panel on submit form · **`carry_over`** separate · **`pending_days`** hold bind · **≠ FR-05b/ATT-05b DONE** · **must_keep**. **Quỹ `compensatory` (PRESENT — RETAIN cite · ≠ FR-06 DONE):** `employee_leave_balances.leave_type=compensatory` · panel bucket «Phép bù OT» via **`GET …/leave-balance/panel`** (peer ATT-05b · **DENY merge** into `annual`/`carry_over`). **HR grant path (PRESENT — RETAIN cite ATT-04):** **`PUT …/leave-balance/tracked-entitlement`** upserts `entitled_days` for **`compensatory`** (product path · U65 — **not** auto OT engine). **Trừ quỹ khi nghỉ (PRESENT — RETAIN cite ATT-09):** `POST …/leave-requests` with loại ∈ catalog mapping **`compensatory`/`ot_comp`** → balance gate + **`pending_days`** hold (**`ATT09QC1`** · **DENY `att_leave_hold`**). **OT TXN (PRESENT):** `overtime_requests` create/approve/reject · `total_hours` · `status` · **`compensation_type`** TEXT (default `salary`) · assert ∈ **`att_ot_comp_type`** when EFF>0 (**`HRM-ATT-OT-COMP-KEY`**). **`approveOvertimeRequest`:** updates `status=approved` **only** — **no** increment `employee_leave_balances` for `compensatory`. **Danh mục hình thức bồi thường (PRESENT — orthogonal peer):** Nest **`att_ot_comp_type`** admin CRUD + starter `salary` \| `compensatory_leave` — marks **intent on OT row** at create · **≠** accrual engine. **ATT-10 AGG (PRESENT — context gate):** approved OT (all `compensation_type`) → **`ot_hours_weighted`** on `att_timesheet_line` · **BR-BP-TS-01** OT already × coefficient in funnel · **no** filter for `compensatory_leave` today → **double-convert risk** when accrual engine lands (**R-ATT-06-PAY-DOUBLE** footer). **ATT-11 sign/close (PRESENT — context gate):** terminal **closed** sheet + line lock · **PAY-01** reads closed sheet (**OUT** invent PAY DONE) · **not** SRS trigger for OT→leave (SRS Diễn biến **#1** = **duyệt OT**). **ABSENT / GAP:** tenant **toggle** «chế độ bù OT» ON/OFF · **CRUD tỷ lệ giờ→ngày** for OT-comp · **automated accrual** on approve when `compensation_type` maps to leave-comp + policy ON · **idempotent** accrual ledger / reversal on reject-after-accrue · **draft OT** guard (status≠approved) · **mode OFF mid-year** stop-new-accrual AC. **Nest `@Controller('core')`:** **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-06: khi công ty **bật** chế độ · **OT đã duyệt** (không nháp) · tỷ lệ giờ→ngày cấu hình → **cộng quỹ phép bù**; NV **nộp đơn nghỉ bù** → trừ đúng loại; **tắt chế độ** → OT chỉ vào bảng công (ATT-10) không cộng phép mới; **PAY** không nhân hệ số OT lần nữa khi đã quy đổi phép (**BR-BP-LV-03**). |
| **Gap class** | **GĐ1 continuous AC** on LIVE **`compensatory` ledger + panel + leave deduct + OT TXN + comp_type catalog** + **residual automated accrual engine + policy toggle + hours→days + ATT-10 PAY-double guard** — **not** greenfield panel; **not** conflate OT comp **catalog** with FR-06 DONE; **not** use ATT-11 close as accrual trigger; **not** invent `att_leave_hold`. |
| **Constraints** | U89 · preserve **`ATT05BQC1`** + **`ATT05QC1`** + **`ATT04BQC1`** + **`ATT04QC1`** + **`ATT09QC1`** + **`ATT03DQC1`** + ATT-10/11 seals · **DENY merge carry→annual** · **R-ATT-05-*** HOLD footers · C-SLICE · U65 · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Team treats `compensatory` panel row or `att_ot_comp_type` as FR-06 LIVE; builds accrual on **sheet close** (wrong trigger); double-count OT in AGG + leave; merges OT-comp into annual pool; invents `att_leave_hold`; wipes ATT-05b carry separation |

### 1.2 Relation to ATT-10 (AGG) and ATT-11 (sign/close) — context gates

| Seat | Role for ATT-06 | SA lock |
|------|-----------------|--------|
| **#30 FR-UC-BP-ATT-10** | **Phễu giờ công:** mọi OT `approved` → `ot_hours_weighted` (× hệ số loại tăng ca) | **RETAIN cite** · OT vào bảng công **độc lập** với quỹ phép · khi engine accrual LIVE → **R-ATT-06-AGG** AC: OT chọn hình thức **nghỉ bù** phải **không** hoặc **giảm trừ** khỏi payable OT theo BR-BP-LV-03 (**HOLD** until engine · non-blocking footer GWC) |
| **#31 FR-UC-BP-ATT-11** | **Chốt bảng công** trước PAY; `status=closed` + `line_locked` | **RETAIN cite** · **≠** trigger cộng quỹ bù (SRS **#1** = duyệt OT) · **≠** thay `approveOvertimeRequest` · PAY đọc sheet closed (**PAY-01 OUT**) |
| **Shared** | Cùng nguồn `overtime_requests` | Một TXN · **DENY** Nest `/core` second SoT · accrual side-effect **chỉ** trên approve path (target) hoặc **interim** HR `tracked-entitlement` (LIVE today) |

### 1.3 Architecture diagram (target — Option A)

```text
  ATT-05b (ATT05BQC1) · ATT-05 (ATT05QC1) · ATT-04/04b · ATT-09 · ATT-03d — SEALED must_keep
  ATT-10 (ATT10QC1) AGG · ATT-11 (ATT11QC1) sign — SEALED context gates · ≠ DONE alone
  Nest /core DENY · printable false · PAY OUT · honesty false · DENY merge carry→annual
       │
       ▼
  ┌──────── FR-UC-BP-ATT-06 (gap-only RETAIN spine + accrual engine residuals) ────┐
  │ RETAIN LIVE (cite — ≠ FR-06 DONE alone)                                          │
  │   employee_leave_balances.leave_type=compensatory + panel bucket «Phép bù OT»    │
  │   PUT tracked-entitlement (HR grant · ATT-04 path · U65 interim accrual)          │
  │   POST leave-requests → deduct compensatory + pending_days (ATT-09)             │
  │   overtime_requests TXN + approve/reject (status only today)                      │
  │   att_ot_comp_type catalog + create assert HRM-ATT-OT-COMP-KEY (intent on OT)     │
  │                                                                                  │
  │ RESIDUAL unlock (BA → DATA/API/BE — engine gap)                                  │
  │   R-ATT-06-POLICY   : tenant toggle OT-comp mode ON/OFF + hours→days CRUD        │
  │   R-ATT-06-ACCRUE   : on approve OT (approved ∧ comp maps to leave) → +quỹ      │
  │   R-ATT-06-DRAFT    : reject accrual from draft/pending OT (SRS rule)            │
  │   R-ATT-06-OFF-MID  : mode OFF → stop new accrual; existing quỹ usable           │
  │   R-ATT-06-IDEM     : idempotent accrual per OT id · reversal on reject rules    │
  │   R-ATT-06-TYPE-MAP : att_leave_type category ot_comp ↔ panel compensatory       │
  │   R-ATT-06-PANEL-FE : panel shows compensatory on đơn nghỉ bù (peer 05b wire)    │
  │   R-ATT-06-AGG      : ATT-10 exclude/flag compensatory_leave OT when accrual LIVE│
  │   R-ATT-06-PAY-DOUBLE: footer BR-BP-LV-03 until PAY-01 slice                     │
  │   mint J-HRM-ATT-06-* DRAFT for QA L2.5                                        │
  │   Paper F-ATT-* /att + /core = ALIAS ONLY                                      │
  └──────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼ OUT this seat
  att_leave_hold second ledger              = DENY (ATT-09)
  Nest /core dual accrual SoT               = DENY
  Merge compensatory into annual/carry      = DENY (ATT-05 + panel)
  Accrual trigger = sheet close (ATT-11)      = DENY (SRS approve OT)
  Claim panel row / ot_comp catalog = DONE  = DENY
  Claim ATT-05/05b/04/ATT UAT               = DENY
  Wipe ATT05BQC1 / ATT05QC1 / peer seals    = DENY
  Invent ASSIGN / PAY / printable DONE      = DENY
```

**Label lock:** Board «Phép bù OT» GĐ1 = **RETAIN cite** `compensatory` quỹ + deduct/hold peers + OT TXN + comp_type catalog **+ gap AC** for **policy + approve→accrual engine + ATT-10 double-guard** — **not** catalog alone; **not** panel alone; **not** ATT UAT.  
**Interim lock (U65):** Until **R-ATT-06-ACCRUE** LIVE, AC may use **`PUT tracked-entitlement`** as **HR product grant** after **FE approve OT** chain — **must label interim** · **≠** claim engine DONE.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / BR-BP-LV-03) | AS-IS LIVE | Verdict |
|------------|---------------------------|------------|---------|
| Quỹ phép bù OT | Diễn biến #1–#2 | `compensatory` ledger + panel bucket | **RETAIN cite** · **≠ FR-06 DONE** |
| HR cấp quỹ bù | Cấu hình / điều chỉnh | `PUT tracked-entitlement` | **RETAIN cite** · **interim** until accrual engine |
| Trừ khi nghỉ bù | #2 | leave-requests + balance assert | **RETAIN cite** · peer ATT-09 hold |
| Panel hiển thị bù | peer 05b | `GET panel` item `compensatory` | **RETAIN cite** · **R-ATT-06-PANEL-FE** |
| OT đơn + duyệt | #1 input | create/approve OT TXN | **RETAIN cite** · approve **no** accrual yet |
| Hình thức bồi thường OT | SRS v0.41 catalog | `att_ot_comp_type` + `compensation_type` | **RETAIN cite** · **orthogonal** · **≠ accrual** |
| Toggle chế độ bù | Tiên quyết SRS | **ABSENT** dedicated API | **GAP** **R-ATT-06-POLICY** |
| Tỷ lệ giờ→ngày | Tiên quyết SRS | **ABSENT** OT-comp specific | **GAP** **R-ATT-06-POLICY** |
| Duyệt OT → cộng quỹ | Diễn biến #1 | **ABSENT** auto mutation | **GAP** **R-ATT-06-ACCRUE** |
| Không cộng từ nháp | Quy tắc SRS | status guard partial | **GAP** AC **R-ATT-06-DRAFT** |
| Tắt giữa năm | Đặc biệt SRS | **ABSENT** | **GAP** **R-ATT-06-OFF-MID** |
| OT vào bảng công | Luồng 3 OFF | ATT-10 `ot_hours_weighted` | **RETAIN cite** · context gate |
| Không double PAY | BR-BP-LV-03 | AGG ignores `compensation_type` | **HOLD footer** **R-ATT-06-AGG** |
| Chốt bảng công | PAY prereq | ATT-11 close | **RETAIN cite** · **≠** accrual trigger |
| `pending_days` hold | peer ATT-09 | **PRESENT** | **must_keep** · **DENY `att_leave_hold`** |
| `carry_over` separate | peer ATT-05 | panel row | **RETAIN** · **DENY merge** annual |
| Nest `/core` | alias | **ABSENT** | **alias only** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-06 DONE** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN compensatory quỹ + OT TXN + comp catalog + gap policy/accrual engine AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** `compensatory` balance/panel · **PUT tracked-entitlement** interim grant · **leave-requests** deduct + **ATT-09** `pending_days` · **overtime_requests** + **`att_ot_comp_type`** (intent only) · **ATT-10** AGG context + **ATT-11** close context. Unlock BA residuals **R-ATT-06-*** for toggle · hours→days · **approve→accrual** engine · draft guard · mode-OFF · idempotency · type map · panel on comp leave form · AGG double-guard footer. **HOLD** PAY double until PAY slice. **must_keep** all sealed peers. **DENY** `att_leave_hold` · merge buckets · Nest `/core`. |
| **Scope** | Docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium–high (engine + policy + cross ATT-10) |
| **Risk** | Low if BA separates **catalog** vs **accrual DONE** and uses interim tracked-entitlement with honesty |
| **Pros** | Matches LIVE ledger + OT spine; SRS #2 partially testable today; clear engine boundary |
| **Cons** | Full FR-06 needs BE approve hook + policy tables |
| **Failure modes** | Catalog LIVE claimed as ATT-06 DONE; accrual on sheet close |
| **Mitigation** | J-HRM-ATT-06-* · U65 FE approve→(interim grant OR engine) → panel → leave deduct → F5 |

### Option B — invent `att_leave_hold` / Nest `/core` accrual / merge compensatory into annual / wipe ATT-05 carry (REJECT)

| | |
|--|--|
| **Summary** | Second hold ledger; `/core` accrual SoT; fold OT-comp into `annual` panel; demote `carry_over` |
| **Pros** | Illusion of one pool |
| **Cons** | Violates **`ATT09QC1`** · **`ATT05QC1`** / **`ATT05BQC1`** · BR-BP-LV-03 type separation |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim compensatory panel or `att_ot_comp_type` alone = ATT-06 DONE / ATT UAT flip (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because bucket or catalog exists; skip approve→accrual AC; flip `attendance_uat_ready` |
| **Pros** | Fast chat claim |
| **Cons** | Violates SRS Diễn biến #1 · UC_BR_MATRIX **PARTIAL** · board #39 · peer honesty |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+engine gap) | B (dual/merge) | C (claim DONE) |
|-----------|-------:|----------------------:|---------------:|---------------:|
| Business value (FR-06) | 5 | **4** | 1 | 0 |
| Preserve ATT-05/09/04/05b seals | 5 | **5** | 0 | 0 |
| Honesty / seal safety | 5 | **5** | 0 | 0 |
| ATT-10/11 gate correctness | 4 | **4** | 1 | 0 |
| Time to deliver | 4 | **3** | 2 | Fake PASS |
| Fit LIVE ledger + OT TXN | 5 | **5** | 0 | 2 |
| **Weighted** | | **high** | low | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE `compensatory` quỹ + panel + deduct/hold peers + OT TXN + comp_type catalog; unlock **R-ATT-06-*** engine/policy AC; **HOLD** **R-ATT-06-AGG/PAY-DOUBLE** until accrual + PAY slices; **RETAIN** ATT-10/11 as **context gates**; **DENY** `att_leave_hold` · merge buckets · Nest `/core` · honesty flip |
| **Why selected** | SRS core gap is **automated accrual on OT approve** + **policy toggle/ratio** — not panel/catalog greenfield; LIVE already exposes **compensatory** bucket and **manual grant** path for U65 interim |
| **Assumptions** | `compensatory_leave` comp code maps to accrual when engine lands; leave type picker uses EFF with category **`ot_comp`**; ATT-05b panel wire covers comp leave form display |
| **Rejected** | **B** dual hold / merge · **C** catalog/panel-alone DONE / ATT UAT |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | `compensatory` ledger/panel | RETAIN bucket separate | AC cite · **≠** row alone = DONE |
| O2 | HR grant interim | RETAIN `PUT tracked-entitlement` until engine | AC label **interim** · U65 path |
| O3 | Deduct + hold | RETAIN leave-requests + `pending_days` | AC · **DENY `att_leave_hold`** |
| O4 | OT comp catalog | RETAIN `att_ot_comp_type` orthogonal | AC · **≠** FR-06 DONE |
| O5 | Approve OT TXN | RETAIN status flip today | AC pre-engine baseline |
| O6 | Policy toggle | GAP **R-ATT-06-POLICY** | AC CRUD + ON/OFF behavior |
| O7 | Hours→days ratio | GAP **R-ATT-06-POLICY** | AC tenant config |
| O8 | Approve→accrual | GAP **R-ATT-06-ACCRUE** | AC Diễn biến **#1** · FE chain |
| O9 | Draft guard | SRS rule | AC **R-ATT-06-DRAFT** |
| O10 | Mode OFF mid-year | SRS đặc biệt | AC **R-ATT-06-OFF-MID** |
| O11 | Idempotency | Engine design | AC **R-ATT-06-IDEM** |
| O12 | Type map | `ot_comp` ↔ `compensatory` | AC **R-ATT-06-TYPE-MAP** |
| O13 | Panel on comp leave | peer 05b | AC **R-ATT-06-PANEL-FE** |
| O14 | ATT-10 AGG guard | footer when engine LIVE | AC **R-ATT-06-AGG** HOLD |
| O15 | ATT-11 trigger | **not** accrual trigger | AC explicit cite |
| O16 | ATT-05/05b peers | must_keep **`ATT05BQC1`** **`ATT05QC1`** | **DENY merge carry→annual** |
| O17 | ATT-09 peer | must_keep **`ATT09QC1`** | **DENY `att_leave_hold`** |
| O18 | ATT-04/04b | must_keep **`ATT04QC1`** **`ATT04BQC1`** | **DENY wipe** |
| O19 | Paper `/core` | Alias only | DENY Nest dual |
| O20 | Honesty | false · C-SLICE · mint **J-HRM-ATT-06-*** | **≠ ATT-06 / ATT UAT DONE** |

---

## 5. F.1 API map sketch (§F.1 — mục đích · nghiệp vụ · bước SRS)

> Physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core/*` = **alias only** · deepen = later **sa API** seat after BA stamps.

| F-id (cite) | METHOD/path (prefer) | Mục đích (VI) | Nghiệp vụ xử lý (BE) | Bước SRS (FR-UC-BP-ATT-06) | Disposition |
|-------------|----------------------|---------------|----------------------|----------------------------|-------------|
| **F-ATT-LEAVE-BAL panel** | `GET …/leave-balance/panel` | Hiển thị quỹ bù trên đơn/panel | Aggregate `employee_leave_balances` incl. **`compensatory`** | **#2** đủ quỹ trước nghỉ | **RETAIN cite** · peer 05b |
| **F-ATT-LEAVE-BAL by-type** | `GET …/leave-balance?leave_type=compensatory` | Chi tiết quỹ bù theo loại | Read single row · zeros if missing | **#2** | **RETAIN cite** |
| **F-ATT-LEAVE-BAL grant** | `PUT …/leave-balance/tracked-entitlement` | HR cấp/điều chỉnh quỹ bù | Upsert `entitled_days` scoped · U19 | **#1** interim until engine | **RETAIN cite** · **≠ engine DONE** |
| **F-ATT-LEAVE-02 submit** | `POST …/leave-requests` | Nộp đơn nghỉ bù | Assert balance · `pending_days` lock | **#2** trừ quỹ | **RETAIN cite** · ATT-09 |
| **F-ATT-LEAVE-01 preview** | `POST …/preview-deduction` | Dự kiến ngày trừ | Peer ATT-08 funnel | **#2** alt | **RETAIN cite** |
| **F-ATT-OT-TXN create** | `POST …/overtime-requests` | Tạo OT | Persist hours · `compensation_type` assert EFF | Input OT (tiên quyết) | **RETAIN cite** |
| **F-ATT-OT-TXN approve** | `POST …/overtime-requests/:id/approve` | Duyệt OT | Today: `status=approved` only | **#1** | **RETAIN cite** · **GAP** accrual hook **R-ATT-06-ACCRUE** |
| **F-ATT-CAT-OTC** | `GET/PUT …/ot-comp-types*` | Danh mục hình thức bồi thường | CRUD `att_ot_comp_type` | Orthogonal SRS v0.41 | **RETAIN cite** · **≠ FR-06 DONE** |
| **F-ATT-OT-COMP-POLICY** *(paper)* | `GET/PUT …/ot-comp-leave-policy` *(proposed)* | Bật/tắt chế độ · tỷ lệ giờ→ngày | Tenant policy row · validate ratio>0 | Tiên quyết SRS | **GAP** **R-ATT-06-POLICY** |
| **F-ATT-OT-COMP-ACCRUE** *(paper)* | side-effect on approve *(proposed)* | Cộng quỹ sau duyệt | approved ∧ policy ON ∧ comp maps leave → +days idempotent | **#1** | **GAP** **R-ATT-06-ACCRUE** |
| **F-ATT-SHEET-01 AGG** | `POST …/attendance-sheets/:id/aggregate` | OT vào phễu lương | Σ approved OT × coef → `ot_hours_weighted` | Luồng 3 OFF · PAY peer | **RETAIN cite** · ATT-10 · **R-ATT-06-AGG** footer |
| **F-ATT-SHEET-02 close** | `POST …/attendance-sheets/:id/close` | Chốt bảng công | Lock lines · `status=closed` | PAY prereq · **≠** accrual | **RETAIN cite** · ATT-11 |

**DENY:** invent Nest `@Controller('core')` · invent `att_leave_hold` · merge `compensatory` into `annual`/`carry_over` · claim any single row above = FR-06 UAT alone.

---

## 6. unlock_lane

```text
BA-01 (ba-process) AC pack O1–O20 + mint J-HRM-ATT-06-* DRAFT
  → ba-data HOLD default (policy/accrual physicalize only if BA stamps — no att_leave_hold)
  → sa API-01 deepen F-ATT-OT-COMP-POLICY / F-ATT-OT-COMP-ACCRUE if stamped
  → dev-be BE-01 approve hook + policy (HOLD until BA CONFIRMED)
  → dev-fe FE-01 OT comp picker + panel on comp leave (narrow · peer 05b)
  → QA U65 J-HRM-ATT-06-* (approve OT → quỹ → đơn nghỉ bù → F5 · Nest /core 0)
  → QC GWC C-SLICE (≠ ATT-06/ATT UAT · must_keep full peer chain)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + **PASS_TO_PM** |
| 2. BA O1–O20 AC + J-HRM-ATT-06-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default | ba-data | **no** `att_leave_hold` |
| 4. sa API-01 if stamped | sa | F.1 physicalize policy/accrual |
| 5. dev-be / dev-fe | execution | HOLD until BA CONFIRMED |
| 6. QA / QC | execution | U65 · C-SLICE honesty |

---

## 7. must_keep / forbidden_paths / honesty locks

### must_keep (RETAIN — DENY wipe / DENY reopen without regression)

| Stamp / artifact | Lock |
|------------------|------|
| **`ATT05BQC1-MSM5SDQC1`** · **`ATT05BQA1-MSM5SD3P`** | ATT-05b panel · **≠ ATT-05b DONE** · **DENY wipe** |
| **`ATT05QC1-MSM52GWC1`** | ATT-05 carry · **DENY merge carry→annual** · **≠ ATT-05 DONE** |
| **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** | ATT-04/04b · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` · **DENY `att_leave_hold`** |
| **`ATT03DQC1-MSM1CR19`** | GPS · **DENY wipe** |
| **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** | AGG + sign context · **≠ ATT-10/11 DONE alone** |
| **`ATT03BQC1` · `ATT01QC1` · `ATT08QC1` · `ATT02QC1` · `PLT01QC1` · CORE-10/09/07** | peer chain · printable false · **R-ATT-01-ASSIGN open** |
| **J-HRM-ATT-05B-01..06** | SEALED 05b · **DENY reopen** without bus regression |

### forbidden_paths (default DENY unless BA unlock lists allowed_paths)

```text
**/att_leave_hold**
apps/api/hrm-api/src/**/core.controller.ts
apps/api/hrm-api/src/attendance/leave-balance.service.ts   # merge compensatory into annual/carry display
apps/api/hrm-api/src/attendance/leave-requests.service.ts  # invent att_leave_hold — ATT-09 owned
honesty flags · SERVICE_READINESS promote
```

### honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-06 / FR-06 DONE** from Option A alone | **LOCKED** |
| **≠ ATT-05 / ATT-05b / ATT-04 / ATT-04b DONE** from 06 seat | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=true` | **LOCKED** |
| **Compensatory panel row alone = FR-06 LIVE** | **DENIED** |
| **`att_ot_comp_type` catalog alone = FR-06 DONE** | **DENIED** |
| **Merge carry→annual · merge compensatory into annual** | **DENIED** |
| **Invent `att_leave_hold` · Nest `/core` dual** | **DENIED** |
| **Invent ASSIGN / PAY / printable DONE** | **DENIED** (PAY OUT) |
| **Seed in UAT evidence** | **DENIED** (U65) |
| **C-SLICE-≠-MODULE** | **RETAIN** |

---

## 8. Validation and acceptance evidence plan (SA → BA/QA)

| Layer | Plan |
|-------|------|
| **L0** | `qc:fe-be-health` · Nest `/core` leave **0** |
| **L2** | Settings OT-comp-types · OT tab · LeaveTab (no banner storm) |
| **L2.5** | **J-HRM-ATT-06-*** DRAFT: (1) policy ON (or interim grant) (2) create OT `compensatory_leave` (3) approve OT (4) panel `compensatory` ↑ (5) submit comp leave (6) hold + F5 (7) mode OFF stops new accrual AC |
| **Honesty** | Evidence block **≠ ATT-06 DONE** · **≠ ATT UAT** · interim grant labeled if engine absent |
| **Regression** | **DENY reopen J-HRM-ATT-05B** without stamp · must_keep panel `carry_over` separate |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-ATT-06: RETAIN LIVE `compensatory` quỹ/panel + tracked-entitlement interim + leave deduct/hold (ATT-09) + OT TXN + `att_ot_comp_type` catalog; GAP **R-ATT-06-POLICY/ACCRUE/DRAFT/OFF-MID/IDEM/TYPE-MAP/PANEL-FE**; ATT-10/11 bound as context gates (AGG + close ≠ accrual trigger); **DENY** att_leave_hold · merge buckets · Nest /core · catalog/panel-alone DONE; must_keep **ATT05BQC1+ATT05QC1+ATT04BQC1+ATT04QC1+ATT09+ATT03D+ATT10+ATT11**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** (BA-01 AC pack) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-06 · FR-UC-BP-ATT-06 · BR-BP-LV-03 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md (panel compensatory · carry_over separate · must_keep ATT05BQC1)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md (DENY merge carry→annual · ATT05QC1)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md (tracked-entitlement interim grant)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md (ot_hours_weighted context · R-ATT-06-AGG footer)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md (close ≠ accrual trigger)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md (orthogonal catalog)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-06 · Diễn biến #1–#2 · BR-BP-LV-03)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qc-01.md (ATT05BQC1-MSM5SDQC1 must_keep)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md
  - O1–O20 CONFIRM (compensatory RETAIN · interim tracked-entitlement · deduct/hold · OT TXN · comp catalog orthogonal · policy/accrual GAP · draft/mode-off/idempotency · type map · panel FE · ATT-10/11 gates · peers must_keep · honesty)
  - mint J-HRM-ATT-06-01..0n DRAFT (policy ON or interim grant · OT compensatory_leave · approve · panel ↑ · comp leave submit · hold · F5 · mode OFF AC · Nest /core 0) · U65 FE-after-2xx+F5
  - explicit ≠ ATT-06 DONE · ≠ ATT-05/05b/04/04b DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - DENY invent att_leave_hold · DENY Nest /core dual · DENY merge compensatory/carry into annual · DENY claim catalog/panel alone = DONE · DENY accrual trigger = sheet close
  - must_keep: ATT05BQC1-MSM5SDQC1 · ATT05QC1-MSM52GWC1 · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · ATT10QC1-MSLWGUYH · ATT11QC1-MSLXTH9P · peer ATT chain · R-ATT-05-* footers · R-ATT-01-ASSIGN open
  - unlock next: ba-data HOLD default → sa API-01 (if policy/accrual physicalize stamped) → dev-be/dev-fe HOLD until CONFIRMED
  - ack_status PASS_TO_PM · next_owner ba-data (HOLD) or pm
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · honesty flip · wipe ATT05BQC1/05/04 seals · reopen J-HRM-ATT-05B without regression
```
