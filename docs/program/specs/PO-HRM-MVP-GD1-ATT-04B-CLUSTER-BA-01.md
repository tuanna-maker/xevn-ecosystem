# BA AC pack — Wave-33 ATT cluster · UC-BP-ATT-04b (Ứng phép & không lương bù trừ · RETAIN catalog flag + panel + balance gate · GAP cap/branch/wire)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-33 seat **#36**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **unlock ba-data DATA-01** (cap/advanced ADD only if closable · **DENY** `att_leave_hold`) · **DENY** claim `allows_advance` + panel = FR-04b DONE · **DENY** claim ATT-04b / ATT-04 / ATT UAT DONE · **printable false RETAIN** · **PAY OUT** |
| **change_mode** | **ADD** (align SA-04B gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** wipe ATT-04 LVT/LVRULE/grant · **no** F-PAY-ADV-BRIDGE LIVE · **no** F-ATT-LEAVE-04 offset LIVE claim) |
| **uc_ids** | `UC-BP-ATT-04b` · `FR-UC-BP-ATT-04b` · **BR-BP-LV-07** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-04 **`ATT04QC1-MSM22G4W`** (**must_keep · DENY wipe**) · **`ATT03DQC1-MSM1CR19`** · **`ATT09QC1-MSLUTL9D`** (**pending_days · DENY `att_leave_hold`**) · full ATT peer chain · **R-ATT-04-FY** · **R-ATT-04-ENGINE HOLD** · **R-ATT-01-ASSIGN open** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04b** · Diễn biến **#1 · #2** · **BR-BP-LV-07** · peer **FR-UC-BP-ATT-05b** panel cite |
| **ref_api_paper** | **F-ATT-CAT-LVT** (`allows_advance`) · **F-ATT-LEAVE-BAL panel** (`advance` bucket) · **F-ATT-LEAVE-02/03** (submit + balance) · balance `advanced` (paper GAP) · **F-ATT-LVRULE cap** (GAP/HOLD) · **F-ATT-LEAVE-04** offset **HOLD** · **F-PAY-ADV-BRIDGE-01** **OUT** |
| **ref_db** | §4.4 `allows_advance` · balance `advanced` · `allow_negative` · **DENY** physical `att_leave_hold` |
| **Honesty** | `attendance_uat_ready=false` · **`contracts_printable_ready=false` RETAIN** · **C-SLICE-≠-MODULE** · **DENY** claim catalog flag + panel = FR-04b DONE · **DENY** ATT-04b / ATT-04 / ATT UAT DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` · PAY bridge LIVE · wipe ATT-04 paths · F-ATT-LEAVE-04 offset LIVE this slice · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-33 seat #36 — **gap-only RETAIN** LIVE `allows_advance` + panel `advance`/`unpaid` + hard balance reject + residuals **cap CRUD · over-balance branch · advanced wire · offset HOLD**:

1. **Catalog ứng** = LIVE `allows_advance` + category `advance` on **F-ATT-CAT-LVT** (peer ATT-04) — **explicit ≠** FR-04b DONE from flag alone (**O1**).
2. **Panel buckets** = MVP panel `advance` + label map `unpaid` (**F-ATT-LEAVE-BAL panel** · peer ATT-05b) — **RETAIN cite** (**O2**).
3. **Gate reject (ứng OFF)** = `assertSufficientLeaveBalance` → **400** `HRM_LEAVE_VAL_BALANCE` when `total_days > available` — BR «Tắt ứng → chặn vượt số dư» (**O3**).
4. **Over-balance branch** = SRS Diễn biến **#1** «đề xuất ứng hoặc không lương» — **GAP** until cap + FE wired (**O4**).
5. **Trần ứng CRUD** = SRS input table (% / max days) — **HOLD/GAP** until **ba-data** stamp (**O5**).
6. **Cách trừ kỳ sau** = **HOLD** with **R-ATT-04-ENGINE** / **R-ATT-04B-DEDUCT-MODE** (**O6**).
7. **`advanced` column wire** = available formula must include paper `advanced` when stamped — **GAP** **R-ATT-04B-ADVANCED-WIRE** (**O7**).
8. **Bù trừ khi cấp quỹ** = Diễn biến **#2** — **HOLD** **F-ATT-LEAVE-04** offset job (**O8**).
9. **Hold on submit** = **`pending_days`** — **must_keep ATT-09** · **DENY** `att_leave_hold` (**O9**).
10. **ATT-04 peer** = **must_keep `ATT04QC1-MSM22G4W`** — LVT/LVRULE/grant/panel — **DENY wipe** (**O10**).
11. **PAY / printable** = **OUT invent DONE** (**O11**).
12. **Mint** `J-HRM-ATT-04B-01..06` DRAFT · honesty **false** · **≠ ATT-04b / ATT-04 / ATT UAT** (**O12**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / C&B | CRUD trần ứng (when wired) · bật `allows_advance` trên loại phép (ATT-04 catalog path) |
| Nhân viên | Nộp đơn · chọn loại · thấy panel · (when wired) chọn ứng / không lương khi vượt số dư |
| Quản lý | Duyệt đặc biệt vượt trần (when cap AC exists) |
| Hệ thống | Balance gate · `pending_days` hold (ATT-09) · panel read |
| ATT-04 / ATT-09 / PAY | Peers **must_keep / OUT** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-ATT-04B-* · residuals **R-ATT-04B-*** · J-HRM-ATT-04B-* DRAFT | Impl `apps/**` / migration / seed |
| RETAIN cite LIVE flag + panel + reject gate | Nest `/core` SoT · invent `att_leave_hold` |
| GAP AC for cap · branch · advanced wire (explicit HOLD until DATA/FE) | F-PAY-ADV-BRIDGE LIVE · offset job LIVE |
| Unlock **ba-data DATA-01** | Claim FR-04b / ATT-04b / ATT-04 / ATT UAT DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Catalog ứng | **YES RETAIN** — `allows_advance` on **F-ATT-CAT-LVT** · bind loại phép · category `advance` when applicable · **≠** flag alone = FR-04b DONE — **AC-ATT-04B-CAT-ADV** · **AC-ATT-04B-≠-FLAG-DONE** |
| **O2** | Panel | **YES RETAIN** — panel bucket `advance` + labels `unpaid` · peer **FR-UC-BP-ATT-05b** · read-only panel — **AC-ATT-04B-PANEL** |
| **O3** | Gate reject | **YES RETAIN** — ứng OFF (type không cho ứng hoặc policy path) · nộp `total_days > available` → **400** `HRM_LEAVE_VAL_BALANCE` · U65 Network — **AC-ATT-04B-GATE-REJECT** · BR «Tắt ứng → chặn» |
| **O4** | Over-balance branch | **GAP** — Diễn biến **#1** · when ứng ON + trong trần → UX/API «đề xuất ứng hoặc không lương» · **HOLD browser J-04** until cap DATA + FE wire — **AC-ATT-04B-OVER-BAL** (conditional) |
| **O5** | Trần ứng CRUD | **HOLD/GAP** — SRS input (% quỹ / max ngày) · **no hardcode** · unlock after **ba-data** stamp on policy/tenant — **AC-ATT-04B-CAP-HOLD** |
| **O6** | Cách trừ | **HOLD** — trừ ngay vs khi cấp năm mới · XOR closable ADD with **R-ATT-04-ENGINE** — **AC-ATT-04B-DEDUCT-HOLD** |
| **O7** | `advanced` wire | **GAP** — `available = entitled − used − pending − advanced` (when column stamped) · **≠** `att_leave_hold` — **AC-ATT-04B-ADVANCED-WIRE** (conditional post-DATA) |
| **O8** | Bù trừ khi cấp | **HOLD** — Diễn biến **#2** · **F-ATT-LEAVE-04** offset-on-grant · cite **R-ATT-04-ENGINE** · **DENY** LIVE = slice DONE — **AC-ATT-04B-OFFSET-HOLD** |
| **O9** | Hold semantics | **YES** — **`pending_days`** RETAIN (**`ATT09QC1-MSLUTL9D`**) · **DENY** invent `att_leave_hold` — **AC-ATT-04B-MK-ATT09** |
| **O10** | ATT-04 peer | **YES must_keep** — **`ATT04QC1-MSM22G4W`** · **DENY wipe** LVT/LVRULE/grant/panel in 04b waves — **AC-ATT-04B-MK-ATT04** |
| **O11** | PAY / printable | **YES OUT** — **F-PAY-ADV-BRIDGE-01** **≠ invent DONE** GĐ1 · printable **false** — **AC-ATT-04B-PAY-OUT** |
| **O12** | Honesty / journeys | **YES false** — mint **`J-HRM-ATT-04B-01..06` DRAFT** · U65 · C-SLICE · **≠ ATT-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** — **AC-ATT-04B-H** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Catalog `allows_advance` (RETAIN) | **`PATCH/POST …/leave-types*`** field `allows_advance` | F-ATT-CAT-LVT | Tiên quyết FR-04b |
| Panel advance/unpaid (RETAIN) | **`GET …/leave-balance/panel`** | F-ATT-LEAVE-BAL | peer 05b · O2 |
| Submit + balance gate (RETAIN+GAP) | **`POST …/leave-requests`** + balance read | F-ATT-LEAVE-02/03 | **#1** |
| Cap CRUD (GAP/HOLD) | policy/tenant extension fields | F-ATT-LVRULE cap | SRS input · O5 |
| Balance `advanced` (GAP) | balance GET/ledger | DB paper column | O7 |
| Offset on grant (HOLD) | accrue job | F-ATT-LEAVE-04 | **#2** · O8 |
| PAY bridge (OUT) | PAY module | F-PAY-ADV-BRIDGE-01 | — |

**Invariant ATT-04B-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` SoT = **FAIL**.

**Invariant ATT-04B-≠-FLAG-DONE:** Claim `allows_advance=true` + panel `advance` bucket alone = FR-04b DONE = **FAIL O1/O2/O12**.

**Invariant ATT-04B-≠-REJECT-ONLY-DONE:** Claim hard **400** reject-only = full Diễn biến **#1** DONE = **FAIL O4/O12**.

**Invariant ATT-04B-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O9**.

**Invariant ATT-04B-MK-ATT04:** Wipe/demote ATT-04 leave-types/policies/grant in 04b wave = **FAIL O10**.

**Invariant ATT-04B-OFFSET:** Claim F-ATT-LEAVE-04 offset-on-grant LIVE = this slice DONE = **FAIL O8/O12**.

**Invariant ATT-04B-PAY:** Invent PAY advance bridge DONE in ATT slice = **FAIL O11**.

**Wire codes (RETAIN):** `HRM_LEAVE_VAL_BALANCE` (over available · reject path) · sealed ATT-09/04/08 codes · **DENY** invent Nest `/core` error family as SoT.

**Available formula (normative target after DATA stamp):** AS-IS `available = entitled − used − pending`; TO-BE when **O7** stamped: subtract **`advanced_days`** (paper `advanced`) — until stamp, AC-ATT-04B-ADVANCED-WIRE = **HOLD footer**.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-04b / FR-04b DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-04 LVT/LVRULE/grant · ATT-09 `pending_days` · ATT-03d `ATT03DQC1-MSM1CR19` · full peer chain · DENY `att_leave_hold` · DENY F-ATT-LEAVE-04 offset LIVE · DENY PAY bridge LIVE · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-33 #36 · Option A) |
|---|----------------------|--------------------------------|
| `allows_advance` on type | Column + API **PRESENT** | **RETAIN cite** (**O1**) · **≠** FR-04b DONE alone |
| Panel `advance` / `unpaid` labels | MVP panel **PRESENT** | **RETAIN cite** (**O2**) |
| Over-balance reject | **400** when `total_days > available` **PRESENT** | **RETAIN** ứng OFF path (**O3**) |
| Propose ứng / không lương | **ABSENT** | **GAP** Diễn biến **#1** (**O4**) |
| Trần ứng CRUD | **ABSENT** dedicated | **HOLD/GAP** (**O5**) · ba-data |
| Cách trừ kỳ sau | **ABSENT** | **HOLD** (**O6**) |
| `advanced` in available | **ABSENT** wire | **GAP** (**O7**) |
| Offset on grant | **ABSENT** job | **HOLD** (**O8**) · R-ATT-04-ENGINE |
| Hold submit | `pending_days` **PRESENT** | **must_keep ATT-09** (**O9**) |
| ATT-04 catalog/grant | SEALED GWC | **must_keep** (**O10**) |
| PAY bridge | OUT GĐ1 | **DENY invent DONE** (**O11**) |
| Honesty | C-SLICE | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-04B-CAP-CRUD** (GAP/HOLD)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-CAP-CRUD` |
| **Scope** | **GAP** — SRS input: trần ứng % quỹ / số ngày · CRUD per tenant · bind policy when closable |
| **OUT** | Hardcode % in FE · Settings MD sole cap SoT |
| **Rationale** | FR-04b input table · SA O5 |
| **ba-data** | **ADD only if closable** on `att_leave_accrual_policy` or tenant extension — **no** `att_leave_hold` |
| **QA note** | **J-HRM-ATT-04B-05** browser AC **conditional** — PASS when DATA+FE wired; else **HOLD footer** in QC GWC |

### 1.2 Disposition **R-ATT-04B-OVER-BAL** (GAP)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-OVER-BAL` |
| **Scope** | **GAP** — when ứng ON + trong trần: FE dialog/API branch «ứng phép» vs «nghỉ không lương» instead of blind reject |
| **OUT** | Claim reject-only = Diễn biến **#1** DONE |
| **Rationale** | SRS **#1** · SA O4 |
| **Depends** | **R-ATT-04B-CAP-CRUD** stamped (min: max advance days known) |
| **QA note** | **J-HRM-ATT-04B-04** **HOLD** until dev-fe + cap wired |

### 1.3 Disposition **R-ATT-04B-UNPAID-TYPE** (GAP)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-UNPAID-TYPE` |
| **Scope** | **GAP partial** — hết phép → loại không lương tách · vẫn check quỹ trước khi ghi (BR-BP-LV-07) |
| **OUT** | Free-text unpaid on form as SoT |
| **Rationale** | SRS quy tắc · label map **RETAIN cite** |
| **Wire** | Consumer path peer ATT-08/09 EFF · unpaid category on **F-ATT-CAT-LVT** |

### 1.4 Disposition **R-ATT-04B-ADVANCED-WIRE** (GAP)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-ADVANCED-WIRE` |
| **Scope** | **GAP** — ledger/balance exposes `advanced` (or equivalent) · included in available formula in **leave-requests** + panel consistency |
| **OUT** | Second hold table · PAY ledger as SoT |
| **Rationale** | DB paper column · SA O7 |
| **ba-data** | Stamp column + migration scope before BE wire |

### 1.5 Disposition **R-ATT-04B-GATE-REJECT** (RETAIN)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-GATE-REJECT` |
| **Scope** | **IN-SCOPE RETAIN** — `assertSufficientLeaveBalance` · **400** when over available · ứng OFF path |
| **OUT** | Claim = full FR-04b DONE |
| **Rationale** | BR «Tắt ứng → chặn» · SA O3 |

### 1.6 Disposition **R-ATT-04B-PANEL** (RETAIN)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-PANEL` |
| **Scope** | **IN-SCOPE RETAIN** — read panel · bucket `advance` · labels `unpaid` |
| **OUT** | Claim panel alone = FR-04b DONE |
| **Rationale** | peer ATT-05b · SA O2 |

### 1.7 Disposition **R-ATT-04B-OFFSET** (HOLD)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-OFFSET` |
| **Scope** | **HOLD** — Diễn biến **#2** bù trừ khi cấp quỹ mới |
| **OUT** | Run offset job in U65 evidence as slice DONE |
| **Rationale** | **F-ATT-LEAVE-04** · **R-ATT-04-ENGINE** · SA O8 |

### 1.8 Disposition **R-ATT-04B-DEDUCT-MODE** (HOLD)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-DEDUCT-MODE` |
| **Scope** | **HOLD** — cách trừ kỳ sau (trừ ngay quỹ tương lai vs khi cấp năm mới) |
| **OUT** | Invent without ENGINE wave |
| **Rationale** | SRS input · SA O6 |

### 1.9 Disposition **R-ATT-04B-SPL-APPROVE** (GAP after cap)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-SPL-APPROVE` |
| **Scope** | **GAP deferred** — duyệt đặc biệt vượt trần when config requires |
| **OUT** | Invent before **R-ATT-04B-CAP-CRUD** AC exists |
| **Rationale** | SRS «Duyệt đặc biệt» |

### 1.10 Disposition **R-ATT-04B-≠DONE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-04B-≠DONE` |
| **Scope** | **IN-SCOPE footer** — **≠ ATT-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** |
| **OUT** | Honesty flip · catalog flag = DONE |

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LV-07** | Loại ứng bật · trong trần (when cap exists) | Cho phép ứng trong trần | Hold ứng / ghi `advanced` (when wired) | AC-ATT-04B-OVER-BAL · J-04 |
| **BR-BP-LV-07-OFF** | Ứng tắt hoặc loại không `allows_advance` | `total_days > available` | **400** `HRM_LEAVE_VAL_BALANCE` | AC-ATT-04B-GATE-REJECT · J-03 |
| **BR-BP-LV-07-CAP** | Vượt trần ứng | Chặn | **400** / validation (when cap wired) | AC-ATT-04B-CAP · J-05 |
| **BR-BP-LV-07-UNPAID** | Hết phép có cấu hình | Gợi ý / chọn không lương | Loại unpaid tách · vẫn pre-check quỹ | AC-ATT-04B-UNPAID · J-04 |
| **BR-BP-LV-06** (peer) | Submit tracked | `pending_days` hold | **must_keep ATT-09** | AC-ATT-04B-MK-ATT09 |
| **BR-BP-LV-PANEL-01** (peer) | Form đơn | Panel đọc quỹ | Bucket `advance` visible when data exists | AC-ATT-04B-PANEL · J-02 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| Tiên quyết | Loại ứng bật | **AC-ATT-04B-CAT-ADV** | **J-HRM-ATT-04B-01** | **F-ATT-CAT-LVT** RETAIN |
| peer 05b | Panel ứng / không lương | **AC-ATT-04B-PANEL** | **J-HRM-ATT-04B-02** | **GET panel** RETAIN |
| **#1** | Nộp vượt số dư | **GATE-REJECT** + **OVER-BAL GAP** | **J-03** · **J-04** | **F-ATT-LEAVE-02/03** |
| Quy tắc OFF | Tắt ứng → chặn | **AC-ATT-04B-GATE-REJECT** | **J-03** | assert balance |
| Input table | Trần ứng CRUD | **AC-ATT-04B-CAP-HOLD** | **J-05** | **F-ATT-LVRULE cap** GAP |
| **#2** | Bù trừ khi cấp | **AC-ATT-04B-OFFSET-HOLD** | **J-06** | **F-ATT-LEAVE-04 HOLD** |
| O7 | `advanced` wire | **AC-ATT-04B-ADVANCED-WIRE** | footer on J-02/J-03 | balance GAP |
| O12 | Seals · ≠DONE | **AC-ATT-04B-H** | **J-HRM-ATT-04B-06** | — |

### 3.1 AC-ATT-04B pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-04B-PATH** | Any 04b path | Network | Physical `/api/hrm/attendance/*` only · Nest `/core` SoT **0** | U65 · J-* |
| **AC-ATT-04B-CAT-ADV** | HCNS · loại phép ATT-04 path | Bật/tắt `allows_advance` → Lưu | **2xx** · F5 field persisted · **≠** FR-04b DONE alone | O1 · J-01 |
| **AC-ATT-04B-PANEL** | NV mở form đơn + panel | Chọn loại tracked | Panel shows buckets incl. **`advance`** when ledger data · label **`unpaid`** map present · read-only | O2 · J-02 |
| **AC-ATT-04B-GATE-REJECT** | Type ứng OFF · `available < total_days` | Gửi đơn | **400** `HRM_LEAVE_VAL_BALANCE` · FE banner/toast · **no** silent success | O3 · J-03 · U65 |
| **AC-ATT-04B-OVER-BAL** | ứng ON · cap configured · wired FE | Nộp vượt available trong trần | UX «ứng» vs «không lương» · POST branch **2xx** · FE-after-2xx · F5 | O4 · J-04 · **conditional** |
| **AC-ATT-04B-CAP-HOLD** | SRS cap table | QC/Dev claim | **HOLD** until ba-data ADD + admin UI or API residual documented | O5 · J-05 |
| **AC-ATT-04B-DEDUCT-HOLD** | SRS deduct mode | QC evidence | Footer **HOLD** · **FAIL** claim LIVE without ENGINE | O6 · J-06 |
| **AC-ATT-04B-ADVANCED-WIRE** | DATA stamp `advanced` | Balance + submit | `available` subtracts advanced · panel consistent · **≠** `att_leave_hold` | O7 · post-DATA |
| **AC-ATT-04B-OFFSET-HOLD** | Grant new entitlement | Job | Footer **HOLD** · **FAIL** offset LIVE = slice DONE | O8 · J-06 |
| **AC-ATT-04B-MK-ATT09** | Footer | Any evidence | **`ATT09QC1-MSLUTL9D`** · `pending_days` · **DENY** `att_leave_hold` | O9 |
| **AC-ATT-04B-MK-ATT04** | 04b wave | Dev paths | **No** wipe ATT-04 LVT/LVRULE/grant · **`ATT04QC1-MSM22G4W`** | O10 |
| **AC-ATT-04B-PAY-OUT** | PAY program | Footer | **FAIL** F-PAY-ADV-BRIDGE LIVE in ATT slice | O11 |
| **AC-ATT-04B-≠-FLAG-DONE** | Catalog+panel cite | DONE claim | **FAIL** if flag+panel alone = FR-04b DONE | O1/O2/O12 |
| **AC-ATT-04B-H** | Program | QC GWC | `attendance_uat_ready=false` · **≠ ATT-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** · C-SLICE | O12 · J-06 |

---

## 4. J-HRM-ATT-04B-* DRAFT (narrow · U65 · Nest `/core` 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-ATT-04B-01** | **admin** | **Bật ứng trên loại phép** | Login `ceo@xe.vn` → HRM embed → Cài đặt / Loại phép (ATT-04 path) → chọn loại → bật **Cho phép ứng phép** (`allows_advance`) → Lưu → **F5** còn · Network **F-ATT-CAT-LVT** 2xx · Nest `/core` 0 · no seed · ≠ flag=FR-04b DONE | AC-ATT-04B-CAT-ADV/PATH · O1 · **DRAFT** |
| **J-HRM-ATT-04B-02** | **consumer** | **Panel bucket ứng / nhãn không lương** | Nghỉ phép → mở form đơn → chọn loại tracked → panel hiện bucket **Ứng phép** (`advance`) khi có số liệu · nhãn loại không lương đúng map · F5 · Nest `/core` 0 | AC-ATT-04B-PANEL · O2 · peer 05b · **DRAFT** |
| **J-HRM-ATT-04B-03** | **consumer** | **Chặn vượt số dư (ứng OFF)** | Loại **không** cho ứng · nhập khoảng nghỉ vượt **Khả dụng** → Gửi → **400** `HRM_LEAVE_VAL_BALANCE` · FE lỗi rõ · không row đơn thành công · Network cùng bước UI · F5 không tạo đơn · no seed | AC-ATT-04B-GATE-REJECT · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-04B-04** | **consumer** | **Đề xuất ứng / không lương (GAP)** | **When cap+FE wired:** ứng ON · vượt available trong trần → dialog đề xuất **Ứng phép** hoặc **Không lương** → chọn → Gửi **2xx** · panel/hold cập nhật · F5 · **Else HOLD:** footer in QC — reject-only ≠ #1 DONE | AC-ATT-04B-OVER-BAL/UNPAID · O4 · **DRAFT** · **conditional** |
| **J-HRM-ATT-04B-05** | **admin** | **CRUD trần ứng (GAP)** | **When DATA+UI wired:** Settings/policy path → nhập % / max ngày ứng → Lưu **2xx** · F5 · vượt trần → chặn · **Else HOLD:** API/DB residual doc only | AC-ATT-04B-CAP-HOLD · O5 · **DRAFT** · **conditional** |
| **J-HRM-ATT-04B-06** | **cross** | **Seals · HOLD · ≠DONE** | Nest `/core` **0** · **OFFSET HOLD** · **DEDUCT HOLD** · **ADVANCED-WIRE HOLD** (until DATA) · **≠ ATT-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** · must_keep **`ATT04QC1-MSM22G4W`** · **`ATT03DQC1-MSM1CR19`** · **`ATT09QC1-MSLUTL9D`** · peer stamps · printable false · PAY OUT · DENY `att_leave_hold` · DENY PAY bridge · DENY offset LIVE · no reopen sealed J-* | AC-ATT-04B-H/MK-*/OFFSET/DEDUCT · O6–O12 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip readiness · **narrow ≠ full ATT/PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§57** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-ATT-04B-CAP** | Trần ứng % / max ngày CRUD | **GAP** — **HOLD** browser until ba-data + FE/BE | **ba-data** → dev-fe/dev-be |
| **G-ATT-04B-OVER-BAL** | Đề xuất ứng / không lương | **GAP** — **HOLD** J-04 until cap + branch wired | dev-fe + dev-be |
| **G-ATT-04B-ADVANCED-WIRE** | Cột `advanced` in available | **GAP** — **HOLD** until DATA stamp | **ba-data** → dev-be |
| **H-ATT-04B-OFFSET** | Bù trừ khi cấp quỹ | **HOLD** — **F-ATT-LEAVE-04** · **R-ATT-04-ENGINE** | engine wave |
| **H-ATT-04B-DEDUCT** | Cách trừ kỳ sau | **HOLD** — XOR ENGINE closable ADD | ba-data + ENGINE |
| **H-ATT-04B-SPL-APPROVE** | Duyệt đặc biệt vượt trần | **GAP deferred** — after cap AC | ba-process delta if needed |
| **H-ATT-04B-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK** `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01` — cap fields + `advanced` column **ADD only if closable** · **DENY** `att_leave_hold` | DATA-01 PASS_TO_PM |
| **sa** | F.1 deepen RETAIN + GAP wire paths · after DATA | API-01 |
| **dev-fe** | Over-balance proposal UX · cap admin (when stamped) | READY_FOR_QA |
| **dev-be** | HOLD invent branch/advanced unless DATA stamps | HOLD default |
| **qa** | U65 J-HRM-ATT-04B-* · J-03 reject path mandatory · J-04/05 conditional | PASS_TO_PM |
| **qc** | GWC C-SLICE · ≠ ATT-04b/ATT-04/ATT UAT · must_keep ATT04+ATT03d+ATT09 | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack O1–O12 **CONFIRMED** for UC-BP-ATT-04b / FR-UC-BP-ATT-04b / BR-BP-LV-07 against SA Option A: RETAIN LIVE **`allows_advance` + panel `advance`/`unpaid` + balance reject gate**; GAP/HOLD residuals **R-ATT-04B-CAP-CRUD · OVER-BAL · ADVANCED-WIRE · OFFSET · DEDUCT-MODE**; AC-ATT-04B-*; mint **J-HRM-ATT-04B-01..06 DRAFT** (U65); unlock **ba-data DATA-01**; explicit **≠ ATT-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** · printable **false** · **C-SLICE** · **PAY OUT** · must_keep **`ATT04QC1-MSM22G4W`** + **`ATT09QC1-MSLUTL9D`** + **`ATT03DQC1-MSM1CR19`** · **DENY** `att_leave_hold` · **DENY** PAY bridge · **DENY** offset LIVE claim |
| **Residual (open)** | ba-data cap/advanced stamp · sa API F.1 · FE over-balance + cap UI · BE wire · QA U65 J-* · QC GWC |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01
role: ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #36)
lane: governance · UC-BP-ATT-04b · FR-UC-BP-ATT-04b · BR-BP-LV-07 · Option A CONFIRMED · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md (must_keep ATT04 — DENY wipe LVT/LVRULE/grant)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (allows_advance · advanced · allow_negative · DENY att_leave_hold table)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-CAT-LVT · F-ATT-LEAVE-02/03 · panel · advanced paper)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qc-01.md (ATT04QC1-MSM22G4W)
entry_criteria: BA-01 O1–O12 CONFIRMED · mint J-HRM-ATT-04B-01..06 DRAFT · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md
  - HOLD default: RETAIN allows_advance on att_leave_type · employee_leave_balances pending_days (ATT-09) · DENY physical att_leave_hold invent
  - ADD only if closable: advance cap fields on policy/tenant extension · advanced column on balance ledger — migration scope + ref_srs Diễn biến #1/#2 partial
  - Map columns ↔ API DTO ↔ AC-ATT-04B-* · no wipe ATT-04 §4.4/4.4b grant paths · no wipe ATT-03d work-sites
  - explicit ≠ ATT-04b DONE · ≠ ATT-04 DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - ack_status PASS_TO_PM · unlock sa API-01 / dev residual
must_keep: ATT04QC1-MSM22G4W · ATT03DQC1-MSM1CR19 · ATT09QC1-MSLUTL9D · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · R-ATT-04-FY · R-ATT-04-ENGINE HOLD · R-ATT-01-ASSIGN open
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · invent PAY bridge DONE · honesty flip · wipe ATT-04 LVT/LVRULE/grant · F-ATT-LEAVE-04 offset LIVE claim
```
