# PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01 — Option/F.1 · Phép chuyển kỳ (bảo lưu theo FY tenant) — RETAIN carry_over bucket + policy carry fields · HOLD FY CRUD + rollover engine

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** after ATT-04b QC GWC) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** PAY termination bridge invent DONE · **DENY** wipe ATT-04b/04/03d seals · **DENY** honesty flip · **DENY** claim ATT-05 / ATT UAT DONE · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD) → API/FE/BE residual only after contracts · **cấm apps/** until BA CONFIRMED (this seat docs-only) |
| **depends_on** | QC GWC **`ATT04BQC1-MSM3S8QC1`** · `docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md` · QA **`ATT04BQA1-MSM3S8FG`** · **must_keep** **`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`** (≠ ATT-04b DONE) · **`ATT03DQC1-MSM1CR19`** · **`ATT09QC1-MSLUTL9D`** (**DENY `att_leave_hold`**) · full ATT/PLT/CORE peer chain · **R-ATT-04B-OVER-BAL** · **R-ATT-04B-CAP-CRUD** · **R-MAIN-EFFECTIVE-EMPTY** (non-blocking) · **R-ATT-04-FY** → **re-home** **R-ATT-05-FY** · **R-ATT-04-ENGINE** → **re-home** **R-ATT-05-ENGINE** · **R-ATT-01-ASSIGN open** · Nest `/core` **DENY** · **≠ ATT UAT** · PAY OUT · printable **false** |
| **uc_ids** | `UC-BP-ATT-05` · `FR-UC-BP-ATT-05` · **BR-BP-LV-02** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#37** Wave-33 after ATT-04b (#36 SEALED GWC) |
| **ref_sa_spine** | ATT-04 Option A [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) · ATT-04 DATA FY HOLD [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md) · ATT-04b [`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md) · ATT-09 hold [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) · engine HOLD [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md) |
| **ref_honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · product_go **false** · **DENY claim ATT-05 / FR-05 DONE alone** · **DENY claim panel `carry_over` bucket = FR-05 DONE** · **DENY claim policy `carry_over_expire_rule` col alone = FR-05 DONE** · **DENY claim ATT-04 / ATT-04b DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-05** · Diễn biến **#1 · #2** · **BR-BP-LV-02** · tiên quyết: chính sách mang sang + mốc cắt FY tenant (CRUD) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · F-ATT-CAT-LVT · F-ATT-LVRULE-* · F-ATT-LEAVE-BAL panel · **F-ATT-LEAVE-04** **HOLD** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — `allowsCarryOver` · `carryOverExpireRule` · `carry_cap_days` · panel `carry_over` · **F-ATT-LEAVE-04** year-end rollover (outline) · paper `carried_in` · **F-PAY-* termination leave settlement** **OUT invent DONE** GĐ1 |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `allows_carry_over` · category `carry_over` · §4.4b `carry_over_expire_rule` · `carry_cap_days` · balance paper `carried_in` · **DENY** physical `att_leave_hold` |
| **ref_code** | **read-only cite:** `leave-balance.service` `MVP_LEAVE_BALANCE_TYPES` + `carry_over` labels · `att-leave-type.service` `allows_carry_over` · `att-leave-accrual-policy.service` `carry_over_expire_rule` / `carry_cap_days` · `calendarYearInHoChiMinh()` for `balance_year` · **no** rollover job · **no** FY config API · grep **0** `att_leave_hold` CREATE |
| **OUT** | Nest `/core` dual · wipe ATT-04/04b/03d/… peers · invent `att_leave_hold` · PAY termination payout bridge LIVE · F-ATT-LEAVE-04 rollover LIVE as slice DONE · merge carry into `annual` silently · hardcode 01/04 FY for all tenants · claim panel/policy col = FR-05 DONE · ATT UAT flip · seed · reopen seals |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-33 architecture unlock: **Phép chuyển kỳ (bảo lưu theo FY tenant)** (FR-UC-BP-ATT-05 · BR-BP-LV-02) vs AS-IS LIVE carry_over catalog/panel/policy schema + calendar `balance_year` — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after ATT-04b QC GWC (`ATT04BQC1-MSM3S8QC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-05 · peer ATT-04/04b RETAIN · ATT-09 hold/settle · ATT-05b panel · **R-ATT-04-FY** (ATT-04 DATA HOLD) · **R-ATT-04-ENGINE** · must_keep **`ATT04BQC1`** + **`ATT04BQC1`** · Nest `/core` DENY · PAY OUT · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-04b SEALED GWC (`ATT04BQC1-MSM3S8QC1`):** advance/unpaid residuals HOLD — **must_keep RETAIN — DENY wipe**. **ATT-04 SEALED (`ATT04QC1-MSM22G4W`):** LVT/LVRULE/grant — **must_keep**. **Carry-over type spine (PRESENT — RETAIN cite · ≠ FR-05 DONE):** `att_leave_type.category=carry_over` · `allows_carry_over` on types (**F-ATT-CAT-LVT**). **Panel bucket (PRESENT — RETAIN cite):** MVP panel always includes `carry_over` with label «Phép chuyển kỳ» (**F-ATT-LEAVE-BAL panel** · peer ATT-05b). **Policy carry metadata (PRESENT — RETAIN cite):** `att_leave_accrual_policy.carry_over_expire_rule` · `carry_cap_days` CRUD via **F-ATT-LVRULE-01..04** — **≠** year-end rollover job · **≠** mốc cắt FY tenant CRUD. **Ledger rows (PRESENT — partial):** `employee_leave_balances` with `leave_type=carry_over` + `balance_year` INT — **bucket = calendar year HCM** (`calendarYearInHoChiMinh`) · **not** tenant FY window. **Paper `carried_in` (ABSENT):** LIVE ledger has entitled/used/pending/advanced — **no** `carried_in` column wire (**ATT-04 DATA-01**). **Year-end rollover (ABSENT):** no job moving annual remainder → `carry_over` entitled (**F-ATT-LEAVE-04 · R-ATT-04-ENGINE HOLD**). **Expire at cut milestone (ABSENT):** no job zeroing carry balance per `carry_over_expire_rule`. **Deduct order annual vs carry (ABSENT):** leave submit uses single `leave_type` row — no configured priority chain (**peer ATT-09**). **FY start month CRUD (ABSENT):** dedicated API/table — **R-ATT-04-FY HOLD** from ATT-04 DATA-01. **Termination payout (OUT):** SRS đơn giá trả khi nghỉ → **PAY module** · **≠ invent DONE** ATT slice. **ATT-09 hold (must_keep):** `pending_days` · **DENY** `att_leave_hold`. Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-05: Cuối năm FY chuyển số còn sang quỹ chuyển kỳ (nếu bật); trong thời hạn bảo lưu trừ theo thứ tự cấu hình; đến mốc cắt hủy số còn; nghỉ việc trả tiền theo chính sách; quỹ chuyển kỳ **tách audit** — không trộn im lặng vào phép năm; mốc cắt **CRUD theo FY tenant** — **cấm** hardcode 01/04 mọi công ty. |
| **Gap class** | **GĐ1 continuous AC pack** on LIVE carry_over **type + panel + policy carry cols + separate ledger key** + residuals **FY CRUD · FY-aware balance_year · rollover job · expire job · deduct order · carried_in wire (optional)** — **HOLD** engine/PAY termination with shared **F-ATT-LEAVE-04** / PAY waves · **≠** claim MVP bucket = FR-05 DONE. |
| **Constraints** | U89 · preserve full ATT peer stamp chain · **R-ATT-04B-*** / **R-MAIN-EFFECTIVE-EMPTY** non-blocking carry · C-SLICE · U65 · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Dev hardcodes calendar year / 01/04; merges carry into `annual` entitled; runs rollover without FY config; adds `att_leave_hold`; claims panel 5th bucket = ATT-05 UAT; wipes ATT-04 grant paths |

### 1.2 Relation to **R-ATT-04-FY** (ATT-04 cluster)

| Artifact | ATT-04 disposition | ATT-05 disposition (this seat) |
|----------|-------------------|--------------------------------|
| **`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01` O5** | **R-ATT-04-FY** HOLD dedicated FY CRUD | **Re-home → `R-ATT-05-FY`** — **same backlog owner wave** (program row #37) |
| **`PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01`** | FY **not closable ADD** from LIVE alone · only `balance_year` INT | **ATT-05 ba-data** may stamp **closable ADD** for `att_leave_fiscal_config` (or equivalent) **or** continue **HOLD** with waiver — **does not auto-close R-ATT-04-FY on ATT-04 QC** |
| **AS-IS `balance_year`** | Calendar bucket cited | **GAP `R-ATT-05-FY-CAL`** — resolve year key from tenant FY config when FY ADD lands |
| **Engine** | **R-ATT-04-ENGINE** HOLD F-ATT-LEAVE-04 accrue | **Re-home → `R-ATT-05-ENGINE`** — shared job adds **rollover + expire** steps **after** accrue outline |

**Lock:** ATT-04 GWC **`ATT04QC1-MSM22G4W`** **does not** require FY LIVE for its C-SLICE; ATT-05 **owns** FY physicalization decision next — **no regression** on ATT-04 seals.

### 1.3 Architecture diagram (target — Option A)

```text
  ATT-04b SEALED (ATT04BQC1) · ATT-04 SEALED (ATT04QC1) — LVT/LVRULE/grant RETAIN · ≠ DONE
  ATT-03d..CORE stamps · ATT-09 pending_days · R-ATT-04B-* HOLD carry · R-MAIN-EFFECTIVE-EMPTY P2
  Nest /core DENY · printable false · PAY OUT · honesty false
       │
       ▼
  ┌──────── FR-UC-BP-ATT-05 (gap-only RETAIN carry spine + HOLD FY/engine/PAY) ─────────┐
  │ RETAIN LIVE (cite — ≠ FR-05 DONE alone)                                              │
  │   category carry_over + allows_carry_over on att_leave_type (F-ATT-CAT-LVT)          │
  │   panel MVP bucket carry_over + label VI (F-ATT-LEAVE-BAL · peer 05b)               │
  │   policy carry_over_expire_rule · carry_cap_days (F-ATT-LVRULE CRUD)                 │
  │   ledger rows leave_type=carry_over · balance_year (calendar AS-IS)                  │
  │                                                                                      │
  │ RESIDUAL unlock (BA → DATA/API/FE/BE — closable gap only)                            │
  │   R-ATT-05-FY        : FY start month + cut milestone CRUD per tenant (was R-ATT-04-FY) │
  │   R-ATT-05-FY-CAL    : balance_year / period key from FY config (not hardcode HCM cal) │
  │   R-ATT-05-ROLLOVER  : cuối FY annual remainder → carry_over entitled — HOLD ENGINE  │
  │   R-ATT-05-EXPIRE    : mốc cắt forfeit per carry_over_expire_rule — HOLD ENGINE      │
  │   R-ATT-05-DEDUCT    : thứ tự trừ annual vs carry on submit (peer ATT-09)           │
  │   R-ATT-05-CARRIED-IN: paper carried_in vs separate carry row — DATA stamp           │
  │   R-ATT-05-TERMINATION-PAY: nghỉ việc trả tiền — PAY OUT · footer only             │
  │   R-ATT-05-ADMIN     : HCNS CRUD mang sang / mốc cắt AC + HDSD                     │
  │   R-ATT-05-≠DONE     : ≠ ATT-05 DONE · ≠ ATT-04/04b DONE · ≠ ATT UAT               │
  │   Paper F-ATT-* /att + /core = ALIAS ONLY                                            │
  └──────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼ OUT this seat
  att_leave_hold second ledger           = DENY (ATT-09 pending_days)
  PAY termination settlement LIVE        = DENY (PAY OUT · UC-BP-PAY-07 peer)
  F-ATT-LEAVE-04 rollover LIVE = slice DONE = DENY (R-ATT-05-ENGINE HOLD)
  Merge carry into annual silently       = DENY (BR-BP-LV-02 separate audit)
  Hardcode 01/04 FY all tenants          = DENY (SRS + SPONSOR_CHOT_LOCK)
  Wipe ATT-04/04b LVT/LVRULE/grant       = DENY
  Claim panel carry_over alone = DONE    = DENY
  Nest /core dual · printable invent      = DENY
```

**Label lock:** Board «Phép chuyển kỳ» GĐ1 = **RETAIN cite** carry_over type + panel + policy carry columns + separate ledger key + **gap AC** for FY CRUD · FY-aware year key · rollover/expire jobs · deduct order — **not** calendar hardcode; **not** PAY settlement this slice; **not** Option alone = ATT UAT.  
**Hold lock (ATT-09):** Submit hold = **`pending_days`** — **DENY** physical `att_leave_hold` (**`ATT09QC1-MSLUTL9D`**).

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Loại chuyển kỳ | category `carry_over` · `allows_carry_over` | **PRESENT** on `att_leave_type` | **RETAIN cite** · **≠ FR-05 DONE** |
| Panel «Phép chuyển kỳ» | FR-05b peer | MVP `carry_over` bucket **PRESENT** | **RETAIN cite** **R-ATT-05-PANEL** |
| Mốc hết hạn / trần mang | `carry_over_expire_rule` · `carry_cap_days` | Policy cols + LVRULE API **PRESENT** | **RETAIN cite** · **≠** expire **job** LIVE |
| Quỹ tách theo loại | BR-BP-LV-02 | `leave_type=carry_over` row **PRESENT** | **RETAIN** · **DENY** merge into `annual` |
| `balance_year` bucket | FY tenant | **Calendar HCM year** only | **GAP** **R-ATT-05-FY-CAL** |
| FY start + mốc cắt CRUD | SRS tiên quyết | **ABSENT** dedicated | **HOLD/GAP** **R-ATT-05-FY** (was **R-ATT-04-FY**) |
| Cuối FY rollover | Diễn biến **#1** mang sang | **ABSENT** job | **HOLD** **R-ATT-05-ROLLOVER** · **R-ATT-05-ENGINE** |
| Cắt / hủy số còn | Diễn biến **#2** | **ABSENT** job | **HOLD** **R-ATT-05-EXPIRE** |
| Thứ tự trừ khi nộp | SRS đặc biệt | Single-type deduct **PRESENT** | **GAP** **R-ATT-05-DEDUCT** |
| Paper `carried_in` | DB § balance | **ABSENT** col | **HOLD/GAP** **R-ATT-05-CARRIED-IN** · ba-data |
| Trả tiền nghỉ việc | SRS input | **OUT** PAY | **DENY invent DONE** **R-ATT-05-TERMINATION-PAY** |
| Hold on submit | ATT-09 | `pending_days` **PRESENT** | **must_keep** · **DENY** `att_leave_hold` |
| ATT-04/04b peers | sealed | GWC | **must_keep RETAIN** · **DENY wipe** |
| Paper `/att` + `/core` | alias | Nest `/core` **ABSENT** | **alias only** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-05 DONE** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN carry_over spine + policy carry fields + separate ledger key + gap FY/engine AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** `carry_over` catalog category · `allows_carry_over` · MVP panel bucket · **F-ATT-LVRULE** `carry_over_expire_rule` / `carry_cap_days` · ledger rows keyed `carry_over` + `balance_year` (calendar AS-IS). Unlock BA residuals **R-ATT-05-*** including **re-home** **R-ATT-04-FY** → **R-ATT-05-FY** and **R-ATT-04-ENGINE** → **R-ATT-05-ENGINE** (rollover + expire steps on **F-ATT-LEAVE-04**). **HOLD** job writers until ba-data stamps closable ADD. **must_keep** **`ATT04BQC1`** + **`ATT04QC1`** + **`ATT03DQC1`** + ATT-09 **`pending_days`**. **DENY** `att_leave_hold` · PAY termination LIVE · silent merge into annual · hardcode FY month. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | High (FY entity + engine wave shared with accrue) |
| **Risk** | Medium until FY ADD + engine scoped; low if BA enforces separate carry row + no calendar hardcode |
| **Pros** | Matches AS-IS spine already shipped; clarifies ATT-05 owns FY backlog deferred from ATT-04; preserves BR-BP-LV-02 audit separation |
| **Cons** | Not FR-05 LIVE until engine + FY CRUD waves; calendar `balance_year` interim |
| **Failure modes** | Panel bucket claimed DONE; rollover without FY; PAY settlement in ATT slice |
| **Mitigation** | O1–O12 · C-SLICE · U65 · cite ATT-04 DATA HOLD |

### Option B — PAY bridge LIVE / invent `att_leave_hold` / merge carry into annual / wipe ATT-04 policy (REJECT)

| | |
|--|--|
| **Summary** | Ship termination payout in ATT-05 slice; add `att_leave_hold`; store carry only in `annual.entitled`; demote separate `carry_over` row |
| **Pros** | Illusion of full BR-BP-LV-02 in one sprint |
| **Cons** | Violates ATT-09 seal · PAY OUT · ATT-04 must_keep · BR-BP-LV-02 audit · DB §4.4b writer chain |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim panel `carry_over` + policy cols = FR-05 DONE / engine LIVE / honesty flip (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because fifth MVP bucket + `carry_over_expire_rule` column exist; run rollover as GWC without FY CRUD; flip `attendance_uat_ready` |
| **Pros** | Fast chat claim |
| **Cons** | Violates board #37 · SRS Diễn biến #1/#2 · SPONSOR «FY CRUD tenant» · C-SLICE |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap) | B (PAY/hold/merge) | C (claim DONE) |
|-----------|-------:|---------------:|-------------------:|---------------:|
| Business value (FR-05) | 5 | **4** | 2 | 0 |
| Preserve ATT-04/04b/09 + BR audit | 5 | **5** | 1 | 0 |
| Honesty / seal safety | 5 | **5** | 1 | 0 |
| Time to deliver | 4 | **3** | 2 | Fake PASS |
| Fit deferred R-ATT-04-FY/ENGINE | 5 | **5** | 0 | 0 |
| **Weighted** | | **high** | low | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE carry_over type + panel + policy carry metadata + separate ledger key; unlock **R-ATT-05-***; **re-home** **R-ATT-04-FY** / **R-ATT-04-ENGINE**; **HOLD** rollover/expire jobs with **F-ATT-LEAVE-04**; **RETAIN** peer seals; **DENY** `att_leave_hold` · PAY termination LIVE · merge into annual · FY hardcode · honesty flip |
| **Why selected** | AS-IS already exposes carry_over as **distinct leave_type** and policy carry fields; FR-05 gap is **tenant FY CRUD · FY-aware period key · automated rollover/expire · deduct order** — not greenfield panel bucket, not PAY slice, not second hold ledger |
| **Assumptions** | **R-ATT-05-ENGINE** shares implementation wave with accrue evaluator (**Q-LEAVE-ACCRUAL**); FY physical table closable only after ba-data; termination payout routes to **UC-BP-PAY-07** |
| **Rejected** | **B** PAY/`att_leave_hold`/merge annual · **C** claim DONE / engine LIVE / ATT UAT |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Type carry | RETAIN category `carry_over` + `allows_carry_over` | AC bind · **≠** type alone = FR-05 DONE |
| O2 | Panel bucket | RETAIN MVP `carry_over` label | AC read · peer ATT-05b cite |
| O3 | Policy carry meta | RETAIN `carry_over_expire_rule` · `carry_cap_days` CRUD | AC admin · **≠** col alone = expire job DONE |
| O4 | Separate ledger | RETAIN `leave_type=carry_over` row | AC audit separation · **DENY** merge annual |
| O5 | FY CRUD | **HOLD/GAP** **R-ATT-05-FY** (was **R-ATT-04-FY**) | AC mốc cắt CRUD · ba-data ADD or HOLD footer |
| O6 | FY vs calendar year | **GAP** **R-ATT-05-FY-CAL** | AC when FY lands · interim calendar documented |
| O7 | Rollover job | **HOLD** **R-ATT-05-ROLLOVER** w/ ENGINE | Footer Diễn biến **#1** · U65 **≠ seed** job |
| O8 | Expire at cut | **HOLD** **R-ATT-05-EXPIRE** w/ ENGINE | Footer Diễn biến **#2** cắt |
| O9 | Deduct order | **GAP** **R-ATT-05-DEDUCT** | AC + ATT-09 cross-ref |
| O10 | `carried_in` | **HOLD/GAP** **R-ATT-05-CARRIED-IN** | DATA stamp vs separate row only |
| O11 | Hold semantics | `pending_days` RETAIN | **DENY** `att_leave_hold` |
| O12 | ATT-04/04b peers | must_keep **`ATT04QC1`** · **`ATT04BQC1`** | **DENY wipe** LVT/LVRULE/grant/advance |
| O13 | PAY termination | **OUT** | Footer **R-ATT-05-TERMINATION-PAY** · PAY-07 |
| O14 | Paper `/core` | Alias only | DENY Nest dual |
| O15 | Honesty | false · C-SLICE · mint **J-HRM-ATT-05-*** DRAFT | **≠ ATT-05 DONE** · **≠ ATT UAT** |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Disposition | Bước SRS |
|-------------|-------------------------------|-------------|----------|
| **F-ATT-CAT-LVT** (RETAIN) | `…/leave-types*` · `allowsCarryOver` · category | RETAIN | Tiên quyết |
| **F-ATT-LVRULE** (RETAIN) | `…/leave-accrual-policies*` · carry rule cols | RETAIN CRUD meta | Policy mang sang |
| **F-ATT-LEAVE-BAL panel** (RETAIN) | `GET …/leave-balance/panel` | RETAIN `carry_over` | peer 05b |
| **F-ATT-LEAVE-BAL carry row** (RETAIN) | ledger `leave_type=carry_over` | RETAIN separate | BR-BP-LV-02 |
| **F-ATT-FY-01** (GAP/HOLD) | *(future)* tenant FY CRUD | **R-ATT-05-FY** | Tiên quyết SRS |
| **F-ATT-LEAVE-04 rollover** (HOLD) | `POST …/leave-balances/accrue` + year-end step | **R-ATT-05-ENGINE** | **#1** mang sang |
| **F-ATT-LEAVE-04 expire** (HOLD) | job step on cut date | **R-ATT-05-EXPIRE** | **#2** cắt |
| **F-ATT-LEAVE-02/03 deduct** (GAP) | leave-requests | GAP order chain | Đặc biệt SRS |
| **F-PAY-LEAVE-SETTLE** (OUT) | PAY module | OUT invent DONE | Nghỉ việc |

**DENY:** invent Nest `@Controller('core')` · invent `att_leave_hold` · claim F-ATT-LEAVE-04 rollover LIVE = this slice DONE · wipe ATT-04/04b paths · PAY settlement as ATT-05 exit.

**Display-ready cite for BA:** policy `{ carryOverExpireRule, carryCapDays, carryOverExpireRuleLabelVi? }` · balance carry row `{ leave_type: carry_over, balance_year, entitled_days, used_days, pending_days, available_days, source }` · FY config `{ fiscalYearStartMonth, carryCutoverRule, statusLabelVi? }` *(when ADD)*.

---

## 6. unlock_lane

```text
BA-01 (ba-process) AC pack O1–O15 + mint J-HRM-ATT-05-* DRAFT
  → ba-data HOLD default (FY entity ADD only if closable · carried_in optional · DENY att_leave_hold)
  → sa API-01 F.1 deepen RETAIN cite + FY/rollover stubs ONLY if stamped
  → Dev-BE HOLD invent job unless DATA+API stamped · Dev-FE FY admin + panel deepen
  → QA U65 J-HRM-ATT-05-* (carry panel · policy carry cols · separate row · FY HOLD footer · Nest /core 0)
  → QC GWC C-SLICE (≠ ATT-05/ATT-04/ATT UAT · printable false · must_keep ATT04+ATT04b+ATT03d)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O15 AC + mint J-HRM-ATT-05-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD / ADD FY (+ optional carried_in) | ba-data | **no** `att_leave_hold` |
| 4. sa API F.1 cite RETAIN (+ FY stub if stamped) | sa | API-01 delta |
| 5. Dev-FE/BE wire ONLY if stamped | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-05-* | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip |

---

## 7. must_keep / forbidden_paths / honesty locks

### must_keep (RETAIN — DENY wipe / DENY reopen without regression)

| Stamp / artifact | Lock |
|------------------|------|
| **`ATT04BQC1-MSM3S8QC1`** · **`ATT04BQA1-MSM3S8FG`** | ATT-04b advance/residual HOLD · **≠ ATT-04b DONE** · **DENY wipe** |
| **`ATT04QC1-MSM22G4W`** · **`ATT04QA1-MSM21P8W`** | ATT-04 LVT/LVRULE/grant · **≠ ATT-04 DONE** · **DENY wipe** |
| **`ATT03DQC1-MSM1CR19`** | GPS work-sites* · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` · **DENY `att_leave_hold`** |
| **`ATT03BQC1` · `ATT01QC1` · `ATT11QC1` · `ATT10QC1` · `ATT08QC1` · `ATT02QC1` · `PLT01QC1` · CORE-10/09/07** | peer stamps · printable false · **R-ATT-01-ASSIGN open** |
| **J-HRM-ATT-04B-01..06** | SEALED evidence · **DENY reopen** without bus regression |
| **R-ATT-04B-OVER-BAL** · **R-ATT-04B-CAP-CRUD** · **R-MAIN-EFFECTIVE-EMPTY** | carry context · non-blocking |

### forbidden_paths (default DENY unless BA+DATA unlock lists allowed_paths)

```text
**/att_leave_hold**
apps/api/hrm-api/src/**/core.controller.ts
apps/api/hrm-api/src/attendance/att-leave-type.service.ts      # wipe allows_carry_over — ATT-04 owned
apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.ts  # wipe carry cols — ATT-04 owned
apps/api/hrm-api/src/attendance/leave-balance.service.ts       # demote carry_over bucket — ATT-04/05b owned
**/attendance_work_sites**                                     # ATT-03d owned
**/pay/** *leave_settlement* *termination*leave*                # PAY OUT — not ATT-05 slice DONE
honesty flags · SERVICE_READINESS promote
```

### honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-05 / FR-05 DONE** from Option A alone | **LOCKED** |
| **≠ ATT-04 / ATT-04b / FR-04 / FR-04b DONE** (peer seals) | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=false` | **LOCKED** |
| **printable false** · PAY OUT | **LOCKED** |
| **DENY** `att_leave_hold` · Nest `/core` dual · PAY termination LIVE | **LOCKED** |
| **DENY** F-ATT-LEAVE-04 rollover/expire LIVE = slice DONE | **LOCKED** |
| **DENY** claim panel `carry_over` + policy cols = FR-05 DONE | **LOCKED** |
| **DENY** merge carry into `annual` silently | **LOCKED** |
| **DENY** hardcode FY 01/04 all tenants | **LOCKED** |
| **DENY** wipe ATT-04/04b LVT/LVRULE/grant | **LOCKED** |

---

## 8. completion_report

| | |
|--|--|
| **Closed** | Option **A** CONFIRMED LOCK for `UC-BP-ATT-05` / `FR-UC-BP-ATT-05` · RETAIN cite carry_over type + panel + policy carry metadata + separate ledger key · **re-home** **R-ATT-04-FY** → **R-ATT-05-FY** · **R-ATT-04-ENGINE** → **R-ATT-05-ENGINE** · residuals **R-ATT-05-*** mapped · O1–O15 for BA · unlock_lane BA→DATA→API→FE/BE · Nest `/core` DENY · must_keep ATT04b+ATT04+ATT03d+ATT09 · **DENY** `att_leave_hold` · ENGINE/PAY HOLD · printable false · PAY OUT · C-SLICE · **≠ ATT-05 DONE** · **≠ ATT UAT** · apps/** untouched |
| **Residual** | BA AC + **J-HRM-ATT-05-*** · ba-data FY ADD decision · engine rollover/expire wave · peer **R-ATT-04B-*** / **R-MAIN-EFFECTIVE-EMPTY** carry · **R-ATT-01-ASSIGN** |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-05 · FR-UC-BP-ATT-05 · BR-BP-LV-02 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md (R-ATT-04-FY re-home · DENY wipe ATT04)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md (FY HOLD notes · balance_year calendar)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md (must_keep ATT04BQC1 — DENY wipe)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-05 · Diễn biến #1 · #2 · BR-BP-LV-02)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (allowsCarryOver · carryOverExpireRule · carry_cap_days · F-ATT-LEAVE-04 HOLD · DENY att_leave_hold physical)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (§4.4 carry_over · §4.4b carry cols · carried_in paper · DENY att_leave_hold)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md (ATT04BQC1-MSM3S8QC1 · carry residuals)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md
  - O1–O15 CONFIRM (carry_over type · panel · policy carry cols · separate ledger · FY CRUD HOLD/GAP · FY-CAL · rollover HOLD · expire HOLD · deduct order GAP · carried_in HOLD · ATT-09 must_keep · ATT-04/04b must_keep · PAY termination OUT · paper /core alias · honesty)
  - mint J-HRM-ATT-05-01..0n DRAFT (policy carry admin · panel carry row · FY config HOLD footer · rollover/expire ENGINE footer · deduct order · Nest /core 0) · U65 FE-after-2xx+F5
  - explicit ≠ ATT-05 DONE · ≠ ATT-04/04b DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - DENY invent att_leave_hold · DENY PAY termination LIVE in ATT slice · DENY F-ATT-LEAVE-04 rollover LIVE claim · DENY merge carry into annual · DENY hardcode 01/04 FY · DENY wipe ATT-04/04b LVT/LVRULE/grant
  - must_keep: ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT03DQC1-MSM1CR19 · ATT09QC1-MSLUTL9D · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10/09/07 · R-ATT-04B-* · R-MAIN-EFFECTIVE-EMPTY carry · R-ATT-01-ASSIGN open
  - unlock next: ba-data HOLD (FY ADD only if closable · optional carried_in · no att_leave_hold)
  - ack_status PASS_TO_PM · next_owner ba-data
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · invent PAY settlement DONE · honesty flip · wipe ATT-04/04b paths · reopen sealed peers
```
