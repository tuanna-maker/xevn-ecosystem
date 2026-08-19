# BA AC pack — Wave-33 ATT cluster · UC-BP-ATT-05 (Phép chuyển kỳ · RETAIN carry_over type + panel + policy carry cols · HOLD FY/engine · GAP deduct order)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-33 seat **#37**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O15 **CONFIRMED** · Dev **HOLD** · **unlock ba-data DATA-01** (FY ADD only if closable · optional `carried_in` · **DENY** `att_leave_hold`) · **DENY** claim panel `carry_over` + policy cols = FR-05 DONE · **DENY** claim ATT-05 / ATT-04 / ATT-04b / ATT UAT DONE · **printable false RETAIN** · **PAY OUT** |
| **change_mode** | **ADD** (align SA-05 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** wipe ATT-04/04b LVT/LVRULE/grant · **no** F-ATT-LEAVE-04 rollover LIVE claim · **no** PAY termination LIVE · **no** merge carry into `annual`) |
| **uc_ids** | `UC-BP-ATT-05` · `FR-UC-BP-ATT-05` · **BR-BP-LV-02** |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-04b **`ATT04BQC1-MSM3S8QC1`** · QC ATT-04 **`ATT04QC1-MSM22G4W`** · **`ATT03DQC1-MSM1CR19`** · **`ATT09QC1-MSLUTL9D`** · **R-ATT-04-FY** → **re-home `R-ATT-05-FY`** · **R-ATT-04-ENGINE** → **re-home `R-ATT-05-ENGINE`** · **R-ATT-04B-OVER-BAL** · **R-ATT-04B-CAP-CRUD** · **R-MAIN-EFFECTIVE-EMPTY** (non-blocking carry) · **R-ATT-01-ASSIGN open** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md` |
| **ref_data** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md` (FY HOLD from ATT-04 · `balance_year` calendar AS-IS) |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-05** · Diễn biến **#1 · #2** · Luồng chính **1–4** · **BR-BP-LV-02** · peer **FR-UC-BP-ATT-05b** panel cite |
| **ref_api_paper** | **F-ATT-CAT-LVT** (`allowsCarryOver` · category `carry_over`) · **F-ATT-LVRULE** (`carryOverExpireRule` · `carry_cap_days`) · **F-ATT-LEAVE-BAL panel** (`carry_over`) · ledger `leave_type=carry_over` · **F-ATT-FY-01** GAP/HOLD · **F-ATT-LEAVE-04** rollover/expire **HOLD** · **F-PAY-LEAVE-SETTLE** **OUT** |
| **ref_db** | §4.4 `allows_carry_over` · category `carry_over` · §4.4b `carry_over_expire_rule` · `carry_cap_days` · paper `carried_in` · **DENY** physical `att_leave_hold` |
| **Honesty** | `attendance_uat_ready=false` · **`contracts_printable_ready=false` RETAIN** · **C-SLICE-≠-MODULE** · **DENY** claim type + panel + policy cols = FR-05 DONE · **DENY** ATT-05 / ATT-04 / ATT-04b / ATT UAT DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` · PAY termination LIVE · wipe ATT-04/04b paths · F-ATT-LEAVE-04 rollover/expire LIVE this slice · merge carry into annual · hardcode 01/04 FY all tenants · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-33 seat #37 — **gap-only RETAIN** LIVE `carry_over` catalog + panel bucket + policy carry metadata + ledger row tách · residuals **FY CRUD · FY-CAL · rollover · expire · deduct order · carried_in** — **re-home** backlog FY/engine từ ATT-04:

1. **Loại chuyển kỳ** = LIVE `category=carry_over` + `allows_carry_over` on **F-ATT-CAT-LVT** (peer ATT-04) — **≠** type alone = FR-05 DONE (**O1**).
2. **Panel «Phép chuyển kỳ»** = MVP bucket `carry_over` + label VI (**F-ATT-LEAVE-BAL** · peer ATT-05b) — **RETAIN cite** (**O2**).
3. **Metadata mang sang** = `carry_over_expire_rule` · `carry_cap_days` CRUD via **F-ATT-LVRULE** — **≠** expire **job** DONE (**O3**).
4. **Quỹ tách audit** = ledger `leave_type=carry_over` row — **DENY** silent merge into `annual` (**BR-BP-LV-02** · **O4**).
5. **FY start + mốc cắt CRUD** = **HOLD/GAP** **R-ATT-05-FY** (was **R-ATT-04-FY**) — ba-data ADD or HOLD footer (**O5**).
6. **Khóa kỳ `balance_year`** = calendar HCM AS-IS · **GAP** **R-ATT-05-FY-CAL** when FY lands (**O6**).
7. **Cuối FY rollover** = Diễn biến **#1** «Mang sang» — **HOLD** **R-ATT-05-ROLLOVER** w/ **R-ATT-05-ENGINE** (**O7**).
8. **Cắt / hủy số còn** = Diễn biến **#2** — **HOLD** **R-ATT-05-EXPIRE** w/ ENGINE (**O8**).
9. **Thứ tự trừ annual vs carry** = SRS đặc biệt — **GAP** **R-ATT-05-DEDUCT** · cross ATT-09 (**O9**).
10. **Paper `carried_in`** = **HOLD/GAP** **R-ATT-05-CARRIED-IN** — DATA stamp vs row-only (**O10**).
11. **Hold on submit** = **`pending_days`** — **must_keep ATT-09** · **DENY** `att_leave_hold` (**O11**).
12. **ATT-04 / ATT-04b peers** = **must_keep `ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** — **DENY wipe** (**O12**).
13. **Trả tiền nghỉ việc** = **OUT** **UC-BP-PAY-07** · **R-ATT-05-TERMINATION-PAY** footer only (**O13**).
14. **Paper `/core`** = alias only — Nest physical **DENY** (**O14**).
15. **Honesty / journeys** = mint **`J-HRM-ATT-05-01..06` DRAFT** · **≠ ATT-05 DONE** · **≠ ATT UAT** (**O15**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / C&B | CRUD `allows_carry_over` · policy `carry_over_expire_rule` / `carry_cap_days` · (when wired) FY start month + mốc cắt |
| Nhân viên | Xem panel quỹ chuyển kỳ khi nộp đơn (peer 05b) · nộp phép (deduct order when wired) |
| Hệ thống | (when ENGINE stamped) rollover cuối FY · expire tại mốc cắt · **không** seed job trong U65 |
| ATT-04 / ATT-04b / ATT-09 / PAY | Peers **must_keep / OUT** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O15 CONFIRM · AC-ATT-05-* · residuals **R-ATT-05-*** · re-home FY/engine · J-HRM-ATT-05-* DRAFT | Impl `apps/**` / migration / seed |
| RETAIN cite LIVE type + panel + policy carry + separate ledger key | Nest `/core` SoT · invent `att_leave_hold` |
| GAP/HOLD FY · ENGINE rollover/expire · deduct · carried_in | PAY termination LIVE · hardcode 01/04 |
| Unlock **ba-data DATA-01** | Claim FR-05 / ATT-05 / ATT-04 / ATT-04b / ATT UAT DONE |

### SA Option A — BA CONFIRM (đóng O1–O15)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Type carry | **YES RETAIN** — `category=carry_over` + `allows_carry_over` on **F-ATT-CAT-LVT** · bind loại phép · **≠** type alone = FR-05 DONE — **AC-ATT-05-CAT-CARRY** · **AC-ATT-05-≠-TYPE-DONE** |
| **O2** | Panel bucket | **YES RETAIN** — panel bucket `carry_over` + label «Phép chuyển kỳ» · peer **FR-UC-BP-ATT-05b** — **AC-ATT-05-PANEL** |
| **O3** | Policy carry meta | **YES RETAIN** — `carry_over_expire_rule` · `carry_cap_days` CRUD **F-ATT-LVRULE** · **≠** column alone = expire **job** DONE — **AC-ATT-05-POLICY-CARRY** |
| **O4** | Separate ledger | **YES RETAIN** — `leave_type=carry_over` row in `employee_leave_balances` · **DENY** merge entitled into `annual` silently — **AC-ATT-05-LEDGER-SEP** · **BR-BP-LV-02** |
| **O5** | FY CRUD | **HOLD/GAP** — **R-ATT-05-FY** (re-home **R-ATT-04-FY**) · mốc cắt + tháng bắt đầu FY tenant CRUD · ba-data ADD or HOLD — **AC-ATT-05-FY-HOLD** |
| **O6** | FY vs calendar | **GAP** — **R-ATT-05-FY-CAL** · `balance_year` from tenant FY when ADD lands · interim calendar HCM documented — **AC-ATT-05-FY-CAL-GAP** |
| **O7** | Rollover job | **HOLD** — Diễn biến **#1** · annual remainder → `carry_over` entitled · **R-ATT-05-ROLLOVER** + **R-ATT-05-ENGINE** · **DENY** U65 seed job = slice DONE — **AC-ATT-05-ROLLOVER-HOLD** |
| **O8** | Expire at cut | **HOLD** — Diễn biến **#2** · forfeit per `carry_over_expire_rule` · **R-ATT-05-EXPIRE** · **DENY** LIVE = slice DONE — **AC-ATT-05-EXPIRE-HOLD** |
| **O9** | Deduct order | **GAP** — dùng đồng thời phép mới + mang sang · thứ tự trừ một SoT · peer ATT-09 submit — **AC-ATT-05-DEDUCT-GAP** |
| **O10** | `carried_in` | **HOLD/GAP** — paper column vs separate row only · **R-ATT-05-CARRIED-IN** · ba-data stamp — **AC-ATT-05-CARRIED-IN-HOLD** |
| **O11** | Hold semantics | **YES** — **`pending_days`** RETAIN (**`ATT09QC1-MSLUTL9D`**) · **DENY** invent `att_leave_hold` — **AC-ATT-05-MK-ATT09** |
| **O12** | ATT-04/04b peers | **YES must_keep** — **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · **DENY wipe** LVT/LVRULE/grant/advance — **AC-ATT-05-MK-ATT04** · **AC-ATT-05-MK-ATT04B** |
| **O13** | PAY termination | **YES OUT** — payout nghỉ việc = **UC-BP-PAY-07** · **≠ invent DONE** GĐ1 ATT slice — **AC-ATT-05-PAY-OUT** · **R-ATT-05-TERMINATION-PAY** footer |
| **O14** | Paper `/core` | **YES** — `/att` + `/core` alias only · Network SoT = `/api/hrm/attendance/*` — **AC-ATT-05-PATH** |
| **O15** | Honesty / journeys | **YES false** — mint **`J-HRM-ATT-05-01..06` DRAFT** · U65 · C-SLICE · **≠ ATT-05 DONE** · **≠ ATT-04/04b DONE** · **≠ ATT UAT** — **AC-ATT-05-H** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Catalog carry (RETAIN) | **`PATCH/POST …/leave-types*`** `allows_carry_over` · category | F-ATT-CAT-LVT | Tiên quyết FR-05 |
| Panel carry (RETAIN) | **`GET …/leave-balance/panel`** bucket `carry_over` | F-ATT-LEAVE-BAL | peer 05b · O2 |
| Policy carry meta (RETAIN) | **`…/leave-accrual-policies*`** carry cols | F-ATT-LVRULE | Policy mang sang · O3 |
| Ledger carry row (RETAIN) | balance GET · `leave_type=carry_over` | F-ATT-LEAVE-BAL carry row | BR-BP-LV-02 · O4 |
| FY config (GAP/HOLD) | *(future)* tenant FY CRUD | F-ATT-FY-01 | Tiên quyết SRS · O5 |
| Rollover / expire (HOLD) | accrue / job steps | F-ATT-LEAVE-04 | **#1** · **#2** · O7/O8 |
| Deduct order (GAP) | **`POST …/leave-requests`** | F-ATT-LEAVE-02/03 | Đặc biệt SRS · O9 |
| Termination payout (OUT) | PAY module | F-PAY-LEAVE-SETTLE | Luồng chính 4 · O13 |

**Invariant ATT-05-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` SoT = **FAIL**.

**Invariant ATT-05-≠-PANEL-DONE:** Claim panel `carry_over` bucket + policy `carry_over_expire_rule` col alone = FR-05 DONE = **FAIL O2/O3/O15**.

**Invariant ATT-05-≠-MERGE:** Increase `annual.entitled` instead of separate `carry_over` row = **FAIL O4** · **BR-BP-LV-02**.

**Invariant ATT-05-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O11**.

**Invariant ATT-05-ENGINE:** Claim F-ATT-LEAVE-04 rollover/expire LIVE = this slice DONE = **FAIL O7/O8/O15**.

**Invariant ATT-05-FY-HARDCODE:** UI/API fixes 01/04 for all tenants without FY CRUD = **FAIL O5/O6**.

**Invariant ATT-05-PAY:** Invent PAY termination settlement DONE in ATT slice = **FAIL O13**.

**Invariant ATT-05-MK-ATT04:** Wipe/demote ATT-04/04b leave-types/policies/grant/advance in ATT-05 wave = **FAIL O12**.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-05 / FR-05 DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT-04b DONE** (`ATT04BQC1-MSM3S8QC1`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-04 LVT/LVRULE/grant · ATT-04b advance residuals · ATT-09 `pending_days` · ATT-03d `ATT03DQC1-MSM1CR19` · full peer chain · **R-ATT-05-FY** (ex **R-ATT-04-FY**) · **R-ATT-05-ENGINE** (ex **R-ATT-04-ENGINE**) · carry **R-ATT-04B-*** · **R-MAIN-EFFECTIVE-EMPTY** non-blocking · DENY `att_leave_hold` · DENY rollover LIVE · DENY PAY termination LIVE · DENY merge carry into annual · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-33 #37 · Option A) |
|---|----------------------|--------------------------------|
| `carry_over` type + `allows_carry_over` | **PRESENT** | **RETAIN cite** (**O1**) · **≠** FR-05 DONE alone |
| Panel `carry_over` | MVP bucket **PRESENT** | **RETAIN cite** (**O2**) |
| Policy carry cols | LVRULE CRUD **PRESENT** | **RETAIN cite** (**O3**) · **≠** expire job |
| Separate ledger row | `leave_type=carry_over` **PRESENT** | **RETAIN** (**O4**) · **DENY** merge annual |
| FY CRUD | **ABSENT** | **HOLD/GAP** **R-ATT-05-FY** (**O5**) |
| `balance_year` | Calendar HCM INT | **GAP** **R-ATT-05-FY-CAL** (**O6**) |
| Rollover job | **ABSENT** | **HOLD** (**O7**) · **R-ATT-05-ENGINE** |
| Expire job | **ABSENT** | **HOLD** (**O8**) |
| Deduct order | Single-type deduct | **GAP** (**O9**) |
| `carried_in` column | **ABSENT** wire | **HOLD/GAP** (**O10**) |
| Hold submit | `pending_days` **PRESENT** | **must_keep ATT-09** (**O11**) |
| ATT-04 / ATT-04b | SEALED GWC | **must_keep** (**O12**) |
| Termination payout | OUT PAY | **DENY invent DONE** (**O13**) |
| Honesty | C-SLICE | **false RETAIN** (**O15**) |

### 1.1 Re-home map (ATT-04 → ATT-05 — normative)

| Prior ID (ATT-04 cluster) | ATT-05 owner ID | BA ruling | Unlock |
|---------------------------|-----------------|-----------|--------|
| **R-ATT-04-FY** | **R-ATT-05-FY** | **HOLD/GAP** — dedicated FY start month + mốc cắt CRUD per tenant · **ATT-04 GWC does not close FY** | **ba-data DATA-01** ADD or HOLD footer |
| **R-ATT-04-ENGINE** | **R-ATT-05-ENGINE** | **HOLD** — shared **F-ATT-LEAVE-04** wave: accrue outline (ATT-04) + **rollover** (**R-ATT-05-ROLLOVER**) + **expire** (**R-ATT-05-EXPIRE**) | ENGINE program wave after FY closable |
| *(ATT-04 DATA O5)* | **R-ATT-05-FY-CAL** | **GAP** — resolve period key from FY config · interim **calendar `balance_year`** documented | After **R-ATT-05-FY** ADD |
| *(new ATT-05)* | **R-ATT-05-DEDUCT** | **GAP** — deduct priority annual vs carry on submit | dev-be + ba-data order config |
| *(new ATT-05)* | **R-ATT-05-CARRIED-IN** | **HOLD/GAP** — paper `carried_in` vs row-only | **ba-data** optional ADD |
| *(new ATT-05)* | **R-ATT-05-PANEL** | **RETAIN** — cite MVP bucket | QA J-02 |
| *(new ATT-05)* | **R-ATT-05-TERMINATION-PAY** | **OUT** — footer PAY-07 | PAY program |
| *(new ATT-05)* | **R-ATT-05-ADMIN** | **GAP partial** — HCNS CRUD mang sang / mốc cắt AC + HDSD when FY wired | dev-fe after DATA |
| *(new ATT-05)* | **R-ATT-05-≠DONE** | **IN-SCOPE footer** | QC GWC |

**Carry (non-blocking):** **R-ATT-04B-OVER-BAL** · **R-ATT-04B-CAP-CRUD** · **R-MAIN-EFFECTIVE-EMPTY** — remain open on program board; **do not block** ATT-05 BA closure.

### 1.2 Disposition **R-ATT-05-FY** (HOLD/GAP — re-home R-ATT-04-FY)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-FY` |
| **Scope** | **HOLD/GAP** — SRS tiên quyết: chính sách mang sang + **mốc cắt CRUD theo FY tenant** · entity e.g. `att_leave_fiscal_config` **ADD only if closable** |
| **OUT** | Hardcode 01/04 all tenants · claim `balance_year` INT = FY DONE |
| **Rationale** | FR-05 tiên quyết · SA O5 · ATT-04 DATA-01 FY **not closable** from LIVE alone |
| **ba-data** | Stamp ADD or explicit HOLD + waiver path |
| **QA note** | **J-HRM-ATT-05-05** **conditional** — PASS when DATA+FE wired; else **HOLD footer** |

### 1.3 Disposition **R-ATT-05-FY-CAL** (GAP)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-FY-CAL` |
| **Scope** | **GAP** — ledger `balance_year` / period key derived from tenant FY config · AS-IS = `calendarYearInHoChiMinh()` |
| **OUT** | Silent calendar forever after FY ADD |
| **Depends** | **R-ATT-05-FY** stamped |
| **QA note** | Footer on J-05/J-06 until ENGINE+FY land |

### 1.4 Disposition **R-ATT-05-ROLLOVER** (HOLD)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-ROLLOVER` |
| **Scope** | **HOLD** — Diễn biến **#1** «Mang sang» · cuối FY: annual remainder → `carry_over` entitled (if policy allows) |
| **OUT** | Manual SQL/seed year-end · claim without FY config |
| **Rationale** | **F-ATT-LEAVE-04** · **R-ATT-05-ENGINE** |
| **U65** | **FAIL** evidence if job run via seed/API bypass |

### 1.5 Disposition **R-ATT-05-EXPIRE** (HOLD)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-EXPIRE` |
| **Scope** | **HOLD** — Diễn biến **#2** cắt · zero/forfeit carry per `carry_over_expire_rule` + mốc cắt |
| **OUT** | Policy col alone = expire DONE |
| **Rationale** | SRS **#2** · SA O8 |

### 1.6 Disposition **R-ATT-05-DEDUCT** (GAP)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-DEDUCT` |
| **Scope** | **GAP** — «Dùng đồng thời phép mới và mang sang» · thứ tự trừ theo cấu hình một SoT · integrate ATT-09 hold |
| **OUT** | Always deduct `annual` first without config |
| **Rationale** | SRS đặc biệt · SA O9 |

### 1.7 Disposition **R-ATT-05-CARRIED-IN** (HOLD/GAP)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-CARRIED-IN` |
| **Scope** | **HOLD/GAP** — paper `carried_in` on balance vs separate `carry_over` row only (LIVE = row-only) |
| **OUT** | Second shadow ledger |
| **ba-data** | Optional ADD if closable · **no** `att_leave_hold` |

### 1.8 Disposition **R-ATT-05-PANEL** (RETAIN)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-PANEL` |
| **Scope** | **IN-SCOPE RETAIN** — read panel · bucket `carry_over` · label VI |
| **OUT** | Claim panel alone = FR-05 DONE |

### 1.9 Disposition **R-ATT-05-TERMINATION-PAY** (OUT)

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-TERMINATION-PAY` |
| **Scope** | **OUT** — Luồng chính 4 · đơn giá CB-BH · **UC-BP-PAY-07** |
| **OUT** | ATT slice payout LIVE |

### 1.10 Disposition **R-ATT-05-≠DONE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-05-≠DONE` |
| **Scope** | **IN-SCOPE footer** — **≠ ATT-05 DONE** · **≠ ATT-04/04b DONE** · **≠ ATT UAT** |
| **OUT** | Honesty flip · panel+policy = DONE |

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-LV-02** | Policy bật mang sang | Cuối FY rollover (when ENGINE) | Quỹ `carry_over` tách audit | AC-ATT-05-ROLLOVER-HOLD · J-06 footer |
| **BR-BP-LV-02-SEP** | Có số mang sang | Ledger | **Separate** `carry_over` row · **DENY** merge vào `annual` | AC-ATT-05-LEDGER-SEP · J-04 |
| **BR-BP-LV-02-CUT** | Đến mốc cắt FY tenant | Expire job (when ENGINE) | Forfeit đúng rule | AC-ATT-05-EXPIRE-HOLD · J-06 |
| **BR-BP-LV-02-FY** | Mọi tenant | FY CRUD | **Không** fix một ngày lịch cho mọi công ty | AC-ATT-05-FY-HOLD · J-05 |
| **BR-BP-LV-02-DEDUCT** | Nộp phép dùng cả annual + carry | Config order | Trừ đúng thứ tự một SoT | AC-ATT-05-DEDUCT-GAP · J-04 |
| **BR-BP-LV-06** (peer) | Submit tracked | `pending_days` hold | **must_keep ATT-09** | AC-ATT-05-MK-ATT09 |
| **BR-BP-LV-PANEL-01** (peer) | Form đơn | Panel đọc quỹ | Bucket `carry_over` visible when data | AC-ATT-05-PANEL · J-02 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| Tiên quyết | Loại + policy mang sang | **AC-ATT-05-CAT-CARRY** · **POLICY-CARRY** | **J-HRM-ATT-05-01** · **J-03** | **F-ATT-CAT-LVT** · **F-ATT-LVRULE** RETAIN |
| peer 05b | Panel chuyển kỳ | **AC-ATT-05-PANEL** | **J-HRM-ATT-05-02** | **GET panel** RETAIN |
| **#1** | Mang sang | **ROLLOVER-HOLD** | **J-06** footer | **F-ATT-LEAVE-04 HOLD** |
| **#2** | Cắt / trả tiền | **EXPIRE-HOLD** · **PAY-OUT** | **J-06** | expire HOLD · PAY OUT |
| Luồng 2–3 | Bảo lưu · cắt | FY + CAL + EXPIRE | **J-05** · **J-06** | **F-ATT-FY-01** GAP |
| Đặc biệt | Thứ tự trừ | **DEDUCT-GAP** | **J-04** | **F-ATT-LEAVE-02/03** GAP |
| BR audit | Quỹ tách | **LEDGER-SEP** | **J-04** | carry row RETAIN |
| O15 | Seals · ≠DONE | **AC-ATT-05-H** | **J-HRM-ATT-05-06** | — |

### 3.1 AC-ATT-05 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-05-PATH** | Any ATT-05 path | Network | Physical `/api/hrm/attendance/*` only · Nest `/core` SoT **0** | U65 · J-* |
| **AC-ATT-05-CAT-CARRY** | HCNS · loại phép ATT-04 path | Bật `allows_carry_over` / category `carry_over` → Lưu | **2xx** · F5 persisted · **≠** FR-05 DONE alone | O1 · J-01 |
| **AC-ATT-05-PANEL** | NV mở form đơn + panel | Load panel | Bucket **`carry_over`** + label «Phép chuyển kỳ» when ledger data · read-only · F5 | O2 · J-02 |
| **AC-ATT-05-POLICY-CARRY** | HCNS · policy LVRULE path | Sửa `carry_over_expire_rule` / `carry_cap_days` → Lưu | **2xx** · F5 · **≠** expire job DONE | O3 · J-03 |
| **AC-ATT-05-LEDGER-SEP** | NV có quỹ annual + carry | GET balance/panel | Distinct **`carry_over`** row/fields · **no** silent merge into `annual` entitled | O4 · J-04 |
| **AC-ATT-05-FY-HOLD** | SRS FY tiên quyết | QC/Dev claim | **HOLD** until ba-data ADD + admin UI or documented residual | O5 · J-05 |
| **AC-ATT-05-FY-CAL-GAP** | FY ADD landed | Ledger year key | `balance_year` follows FY config · **FAIL** hardcode 01/04 | O6 · post-FY |
| **AC-ATT-05-ROLLOVER-HOLD** | Year-end | Job | Footer **HOLD** · **FAIL** rollover LIVE = slice DONE · **no seed** | O7 · J-06 |
| **AC-ATT-05-EXPIRE-HOLD** | Mốc cắt | Job | Footer **HOLD** · **FAIL** expire LIVE = slice DONE | O8 · J-06 |
| **AC-ATT-05-DEDUCT-GAP** | Submit leave spanning buckets | POST leave-requests | **HOLD/GAP** until order config wired · cross ATT-09 hold | O9 · J-04 conditional |
| **AC-ATT-05-CARRIED-IN-HOLD** | DATA stamp | Balance | **HOLD** until ba-data · **≠** `att_leave_hold` | O10 |
| **AC-ATT-05-MK-ATT09** | Footer | Any evidence | **`ATT09QC1-MSLUTL9D`** · `pending_days` · **DENY** `att_leave_hold` | O11 |
| **AC-ATT-05-MK-ATT04** | ATT-05 wave | Dev paths | **No** wipe ATT-04 LVT/LVRULE/grant · **`ATT04QC1-MSM22G4W`** | O12 |
| **AC-ATT-05-MK-ATT04B** | ATT-05 wave | Dev paths | **No** wipe advance paths · **`ATT04BQC1-MSM3S8QC1`** | O12 |
| **AC-ATT-05-PAY-OUT** | Termination payout | Footer | **FAIL** PAY settlement LIVE in ATT slice | O13 |
| **AC-ATT-05-≠-PANEL-DONE** | Panel+policy cite | DONE claim | **FAIL** if bucket+cols alone = FR-05 DONE | O2/O3/O15 |
| **AC-ATT-05-H** | Program | QC GWC | `attendance_uat_ready=false` · **≠ ATT-05 DONE** · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · C-SLICE | O15 · J-06 |

---

## 4. J-HRM-ATT-05-* DRAFT (narrow · U65 · Nest `/core` 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-ATT-05-01** | **admin** | **Bật mang sang trên loại phép** | Login `ceo@xe.vn` → HRM embed → Cài đặt / Loại phép (ATT-04 path) → chọn loại `carry_over` hoặc bật **Cho phép mang sang** (`allows_carry_over`) → Lưu → **F5** còn · Network **F-ATT-CAT-LVT** 2xx · Nest `/core` 0 · no seed · ≠ type=FR-05 DONE | AC-ATT-05-CAT-CARRY/PATH · O1 · **DRAFT** |
| **J-HRM-ATT-05-02** | **consumer** | **Panel bucket Phép chuyển kỳ** | Nghỉ phép → mở form đơn → panel hiện bucket **Phép chuyển kỳ** (`carry_over`) khi có số liệu · F5 · peer 05b · Nest `/core` 0 | AC-ATT-05-PANEL · O2 · **DRAFT** |
| **J-HRM-ATT-05-03** | **admin** | **CRUD rule mang sang trên chính sách cấp** | Chính sách cấp phép (LVRULE ATT-04 path) → sửa **Quy tắc hết hạn mang sang** / **Trần ngày mang** (`carry_over_expire_rule` · `carry_cap_days`) → Lưu **2xx** · F5 · **≠** expire job DONE | AC-ATT-05-POLICY-CARRY · O3 · **DRAFT** |
| **J-HRM-ATT-05-04** | **consumer** | **Quỹ carry tách khỏi phép năm (RETAIN)** | Cùng persona có cả `annual` và `carry_over` trên panel/balance GET → số liệu **tách** · không gộp im lặng vào cột phép năm · (when deduct wired) nộp phép → hold `pending_days` đúng bucket · **Else** deduct order **HOLD footer** | AC-ATT-05-LEDGER-SEP/DEDUCT-GAP · O4/O9 · **DRAFT** · deduct **conditional** |
| **J-HRM-ATT-05-05** | **admin** | **CRUD FY tenant (GAP)** | **When DATA+UI wired:** Cài đặt phép → tháng bắt đầu FY + mốc cắt bảo lưu → Lưu **2xx** · F5 · **không** hardcode 01/04 · **Else HOLD:** footer in QC — interim `balance_year` calendar only | AC-ATT-05-FY-HOLD · O5/O6 · **DRAFT** · **conditional** |
| **J-HRM-ATT-05-06** | **cross** | **Seals · ENGINE HOLD · ≠DONE** | Nest `/core` **0** · **ROLLOVER HOLD** · **EXPIRE HOLD** · **FY-CAL GAP** · **CARRIED-IN HOLD** · **PAY termination OUT** · **≠ ATT-05 DONE** · **≠ ATT-04 DONE** · **≠ ATT-04b DONE** · **≠ ATT UAT** · must_keep **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT03DQC1-MSM1CR19`** · **`ATT09QC1-MSLUTL9D`** · peer stamps · **R-ATT-05-FY** (ex R-ATT-04-FY) · **R-ATT-05-ENGINE** (ex R-ATT-04-ENGINE) · carry **R-ATT-04B-*** · **R-MAIN-EFFECTIVE-EMPTY** non-blocking · printable false · PAY OUT · DENY `att_leave_hold` · DENY merge annual · DENY rollover LIVE · no reopen sealed J-04B-* | AC-ATT-05-H/MK-*/ROLLOVER/EXPIRE · O7–O15 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip readiness · **narrow ≠ full ATT/PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§58** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-ATT-05-FY** | FY start month + mốc cắt CRUD | **GAP/HOLD** — re-home **R-ATT-04-FY** | **ba-data** → dev-fe/dev-be |
| **G-ATT-05-FY-CAL** | `balance_year` from FY | **GAP** — after FY ADD | dev-be |
| **H-ATT-05-ROLLOVER** | Cuối FY mang sang | **HOLD** — **R-ATT-05-ENGINE** | engine wave |
| **H-ATT-05-EXPIRE** | Cắt forfeit | **HOLD** — **R-ATT-05-ENGINE** | engine wave |
| **G-ATT-05-DEDUCT** | Thứ tự trừ annual vs carry | **GAP** | dev-be + config DATA |
| **H-ATT-05-CARRIED-IN** | Paper `carried_in` | **HOLD/GAP** optional ADD | **ba-data** |
| **H-ATT-05-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |
| **OUT-ATT-05-TERMINATION-PAY** | Trả tiền nghỉ việc | **OUT** PAY-07 | PAY program |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK** `PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01` — FY entity **ADD only if closable** · optional `carried_in` · **DENY** `att_leave_hold` | DATA-01 PASS_TO_PM |
| **sa** | F.1 deepen RETAIN + FY/rollover stubs ONLY if stamped | API-01 |
| **dev-fe** | FY admin + panel deepen (when stamped) | READY_FOR_QA |
| **dev-be** | HOLD invent rollover/expire/deduct unless DATA+API stamps | HOLD default |
| **qa** | U65 J-HRM-ATT-05-* · J-01..04 RETAIN paths mandatory · J-05 conditional | PASS_TO_PM |
| **qc** | GWC C-SLICE · ≠ ATT-05/04/04b/ATT UAT · must_keep seals | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack O1–O15 **CONFIRMED** for UC-BP-ATT-05 / FR-UC-BP-ATT-05 / BR-BP-LV-02 against SA Option A: RETAIN LIVE **`carry_over` type + panel + policy carry metadata + separate ledger key**; **re-home** **R-ATT-04-FY** → **R-ATT-05-FY** · **R-ATT-04-ENGINE** → **R-ATT-05-ENGINE**; GAP/HOLD residuals **R-ATT-05-FY-CAL · ROLLOVER · EXPIRE · DEDUCT · CARRIED-IN**; AC-ATT-05-*; mint **J-HRM-ATT-05-01..06 DRAFT** (U65); unlock **ba-data DATA-01**; explicit **≠ ATT-05 DONE** · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · printable **false** · **C-SLICE** · **PAY OUT** · must_keep **`ATT04QC1-MSM22G4W`** + **`ATT04BQC1-MSM3S8QC1`** + **`ATT09QC1-MSLUTL9D`** + **`ATT03DQC1-MSM1CR19`** · **DENY** `att_leave_hold` · **DENY** rollover LIVE · **DENY** PAY termination LIVE · **DENY** merge carry into annual |
| **Residual (open)** | ba-data FY/carried_in stamp · sa API F.1 · FE FY admin · BE ENGINE wave · QA U65 J-* · QC GWC · carry **R-ATT-04B-*** · **R-MAIN-EFFECTIVE-EMPTY** |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01
role: ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #37)
lane: governance · UC-BP-ATT-05 · FR-UC-BP-ATT-05 · BR-BP-LV-02 · Option A CONFIRMED · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md (FY HOLD baseline · balance_year calendar · re-home to R-ATT-05-FY)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md (must_keep ATT04 — DENY wipe LVT/LVRULE/grant)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md (must_keep ATT04BQC1 — DENY wipe advance)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (§4.4 carry_over · §4.4b carry cols · carried_in paper · DENY att_leave_hold)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (allowsCarryOver · carryOverExpireRule · carry_cap_days · panel carry_over · F-ATT-LEAVE-04 HOLD · F-ATT-FY-01 GAP)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md (ATT04BQC1-MSM3S8QC1)
entry_criteria: BA-01 O1–O15 CONFIRMED · re-home R-ATT-04-FY→R-ATT-05-FY · R-ATT-04-ENGINE→R-ATT-05-ENGINE · mint J-HRM-ATT-05-01..06 DRAFT · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md
  - HOLD default: RETAIN allows_carry_over · category carry_over on att_leave_type · policy carry_over_expire_rule/carry_cap_days · employee_leave_balances leave_type=carry_over + balance_year (calendar interim) · pending_days (ATT-09) · DENY physical att_leave_hold invent
  - ADD only if closable: att_leave_fiscal_config (or equivalent) for R-ATT-05-FY · optional carried_in on balance ledger — migration scope + ref_srs Diễn biến #1/#2
  - Map columns ↔ API DTO ↔ AC-ATT-05-* · no wipe ATT-04 §4.4/4.4b · no wipe ATT-04b advance · no wipe ATT-03d work-sites
  - explicit ≠ ATT-05 DONE · ≠ ATT-04/04b DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT · DENY merge carry into annual
  - ack_status PASS_TO_PM · unlock sa API-01 / dev residual
must_keep: ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT03DQC1-MSM1CR19 · ATT09QC1-MSLUTL9D · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · R-ATT-05-FY · R-ATT-05-ENGINE HOLD · R-ATT-04B-* carry · R-MAIN-EFFECTIVE-EMPTY non-blocking · R-ATT-01-ASSIGN open
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · invent PAY termination DONE · F-ATT-LEAVE-04 rollover LIVE claim · honesty flip · wipe ATT-04/04b paths · hardcode 01/04 FY all tenants
```
