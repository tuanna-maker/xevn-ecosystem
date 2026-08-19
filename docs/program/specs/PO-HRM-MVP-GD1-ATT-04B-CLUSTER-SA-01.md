# PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01 — Option/F.1 · Ứng phép & thời điểm cấp / không lương bù trừ — RETAIN catalog flag + panel + balance gate · HOLD cap/offset engine

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** · **U88** after ATT-04 QC GWC) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** PAY bridge invent DONE · **DENY** wipe ATT-04 LVT/LVRULE/grant · **DENY** honesty flip · **DENY** claim ATT-04/ATT-04b/ATT UAT DONE · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD) → API/FE/BE residual only after contracts · **cấm apps/** until BA CONFIRMED (this seat docs-only) |
| **depends_on** | QC GWC **`ATT04QC1-MSM22G4W`** · `docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qc-01.md` · QA **`ATT04QA1-MSM21P8W`** · **must_keep** **`ATT03DQC1-MSM1CR19`** GPS · **`ATT04QC1-MSM22G4W`** (ATT-04 ≠ DONE · C-SLICE) · full ATT/PLT/CORE peer chain · **`ATT09QC1-MSLUTL9D`** (**DENY `att_leave_hold`**) · **R-ATT-04-FY** · **R-ATT-04-ENGINE HOLD** · **R-ATT-01-ASSIGN open** · Nest `/core` **DENY** · **≠ ATT UAT** · PAY OUT · printable **false** |
| **uc_ids** | `UC-BP-ATT-04b` · `FR-UC-BP-ATT-04b` · **BR-BP-LV-07** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#36** Wave-33 after ATT-04 (#35 SEALED GWC) |
| **ref_sa_spine** | ATT-04 Option A [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) · ATT-09 hold [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) · peer balance [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) · engine HOLD [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md) |
| **ref_honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · product_go **false** · **DENY claim ATT-04b / FR-04b DONE alone** · **DENY claim ATT-04 DONE** · **DENY claim allows_advance catalog + panel advance bucket = FR-04b DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04b** · Diễn biến **#1 · #2** · BR-BP-LV-07 · tiên quyết: loại ứng bật · trần & quy tắc trừ CRUD |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` § ATT · peer F-ATT-CAT-LVT · F-ATT-LEAVE-02/03 · F-ATT-LEAVE-04 **HOLD** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — `allows_advance` · balance `advanced` (paper) · **F-ATT-LEAVE-02/03** (paper cites `att_leave_hold` — **physical = `pending_days` only per ATT-09 seal**) · **F-PAY-ADV-BRIDGE-01** **OUT invent DONE** GĐ1 |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `allows_advance` · § balance `advanced` · policy `allow_negative` · **DENY** physical `att_leave_hold` table |
| **ref_code** | **read-only cite:** `att-leave-type.service` (`allows_advance`, category `advance`) · `leave-balance.service` (panel MVP `advance` · labels `unpaid`) · `leave-requests.service` **`assertSufficientLeaveBalance`** → **400** when `total_days > available` (**no** advance/unpaid branch) · available = `entitled − used − pending` (**no** `advanced` wire in AS-IS) |
| **OUT** | Nest `/core` dual · wipe ATT-04/03d/… peers · invent `att_leave_hold` · invent PAY advance bridge DONE · F-ATT-LEAVE-04 accrue + **offset-on-grant job LIVE** this slice · Settings sole cap SoT · claim catalog `allows_advance` = FR-04b DONE · claim ATT-04 DONE · ATT UAT flip · seed · reopen seals |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-33 architecture unlock: **Ứng phép & thời điểm cấp / không lương bù trừ** (FR-UC-BP-ATT-04b · BR-BP-LV-07) vs AS-IS LIVE catalog flag + panel bucket + hard balance reject — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after ATT-04 QC GWC (`ATT04QC1-MSM22G4W`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-04b · peer ATT-04 RETAIN (LVT/LVRULE/grant) · ATT-09 hold · BR-BP-LV-07 · R-ATT-04-FY · R-ATT-04-ENGINE · must_keep ATT03D · Nest `/core` DENY · PAY OUT · ≠ ATT UAT |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-04 SEALED GWC (`ATT04QC1-MSM22G4W`):** leave-types* · leave-accrual-policies* · tracked-entitlement · panel — **must_keep RETAIN — DENY wipe**. **Catalog advance flag (PRESENT — RETAIN cite · ≠ FR-04b DONE):** `att_leave_type.allows_advance` + category `advance` via **F-ATT-CAT-LVT** (peer ATT-04). **Panel bucket (PRESENT — RETAIN cite):** MVP panel includes `advance` + label map includes `unpaid` (**F-ATT-LEAVE-BAL panel** · peer ATT-05b). **Submit balance gate (PRESENT — partial):** `leave-requests` **`assertSufficientLeaveBalance`** — if balance row exists and `total_days > available` → **400** `HRM_LEAVE_VAL_BALANCE` (**Tắt ứng / chặn vượt số dư** behavior). **Available formula AS-IS:** `entitled − used − pending` — **does not** subtract paper `advanced` column (**wire GAP**). **Over-balance branch (ABSENT):** no «đề xuất ứng hoặc không lương» UX/API (SRS Diễn biến **#1**). **Trần ứng CRUD (ABSENT):** no tenant CRUD for % cap / max advance days bound to policy (**SRS input table**). **Cách trừ kỳ sau (ABSENT):** no config for deduct-now vs on-next-grant (**HOLD** with accrue engine). **Bù trừ khi cấp quỹ mới (ABSENT):** no offset job on grant (**F-ATT-LEAVE-04 · R-ATT-04-ENGINE HOLD**). **ATT-09 hold (must_keep):** `pending_days` on `employee_leave_balances` · **DENY** `att_leave_hold`. **PAY advance bridge (OUT):** paper **F-PAY-ADV-BRIDGE-01** — **≠ invent DONE** GĐ1 continuous ATT slice. Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-04b: CRUD trần ứng + cách trừ; nộp vượt số dư → ứng trong trần hoặc không lương; duyệt đặc biệt khi cấu hình; bù trừ khi cấp quỹ mới — **không** khẳng định nghiệm thu module ATT/nghỉ phép. |
| **Gap class** | **GĐ1 continuous AC pack** on LIVE catalog flag + panel + existing reject gate + residuals **cap CRUD · over-balance branch · unpaid path · advanced column wire · offset-on-grant HOLD** — **≠** invent PAY · **≠** second hold ledger · **≠** wipe ATT-04. |
| **Constraints** | U89 · preserve **`ATT04QC1-MSM22G4W`** + **`ATT03DQC1-MSM1CR19`** + full peer chain · **R-ATT-04-FY/ENGINE** footers non-blocking · C-SLICE · U65 · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Dev ships PAY bridge as ATT-04b DONE; adds `att_leave_hold`; claims `allows_advance=true` = UAT; breaks ATT-09 hold; runs offset accrue as slice DONE; wipes ATT-04 grant paths |

### 1.2 Architecture diagram (target — Option A)

```text
  ATT-04 SEALED (ATT04QC1) — LVT/LVRULE/grant/panel RETAIN · ≠ ATT-04 DONE
  ATT-03d..CORE stamps · ATT-09 pending_days · R-ATT-04-FY · R-ATT-04-ENGINE HOLD
  Nest /core DENY · printable false · PAY OUT · honesty false
       │
       ▼
  ┌──────── FR-UC-BP-ATT-04b (gap-only RETAIN + HOLD engine/PAY) ─────────────────┐
  │ RETAIN LIVE (cite — ≠ FR-04b DONE alone)                                       │
  │   allows_advance + category advance on att_leave_type (F-ATT-CAT-LVT)          │
  │   panel advance bucket + unpaid labels (F-ATT-LEAVE-BAL panel)                 │
  │   assertSufficientLeaveBalance hard reject when over available (ATT-09 path)   │
  │                                                                                │
  │ RESIDUAL unlock (BA → DATA/API/FE — closable gap only)                         │
  │   R-ATT-04B-CAP-CRUD   : trần ứng %/ngày CRUD per tenant (policy/tenant)     │
  │   R-ATT-04B-DEDUCT-MODE: trừ kỳ sau vs khi cấp — **HOLD** w/ ENGINE            │
  │   R-ATT-04B-OVER-BAL   : vượt số dư → đề xuất ứng/unpaid (≠ reject-only)       │
  │   R-ATT-04B-UNPAID-TYPE: hết phép → không lương tách loại + vẫn check quỹ     │
  │   R-ATT-04B-ADVANCED-WIRE: balance.advanced in available formula (DATA stamp)  │
  │   R-ATT-04B-OFFSET     : bù trừ khi cấp mới — **HOLD** F-ATT-LEAVE-04/ENGINE   │
  │   R-ATT-04B-SPL-APPROVE: duyệt đặc biệt vượt trần — AC when cap exists         │
  │   R-ATT-04B-≠DONE      : ≠ ATT-04b DONE · ≠ ATT-04 DONE · ≠ ATT UAT            │
  │   Paper F-ATT-* /att + /core = ALIAS ONLY                                      │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼ OUT this seat
  att_leave_hold second ledger          = DENY (ATT-09 pending_days)
  F-PAY-ADV-BRIDGE-01 LIVE = slice DONE = DENY (PAY OUT)
  F-ATT-LEAVE-04 offset job LIVE        = DENY (R-ATT-04-ENGINE HOLD)
  Wipe ATT-04 LVT/LVRULE/grant          = DENY
  Claim allows_advance + panel = DONE   = DENY
  Nest /core dual · PAY/printable invent = DENY
```

**Label lock:** Board «Ứng phép & … bù trừ» GĐ1 = **RETAIN cite** catalog `allows_advance` + panel `advance`/`unpaid` labels + **existing over-balance reject** + **gap AC** for cap CRUD · over-balance branch · advanced wire · offset **HOLD** — **not** PAY bridge DONE; **not** `att_leave_hold`; **not** Option alone = ATT UAT.  
**Hold lock (ATT-09):** Submit hold = **`pending_days`** — **DENY** physical `att_leave_hold` (**`ATT09QC1-MSLUTL9D`**).  
**Peer lock (ATT-04):** **DENY** demote or wipe **`ATT04QC1-MSM22G4W`** artifacts (leave-types · policies · tracked-entitlement).

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Loại cho phép ứng | `allows_advance` · BR-BP-LV-07 | Column + API on leave-types **PRESENT** | **RETAIN cite** · **≠ FR-04b DONE** |
| Panel bucket «Ứng phép» | FR-05b peer | `advance` in MVP panel **PRESENT** | **RETAIN cite** **R-ATT-04B-PANEL** |
| Label không lương | unpaid type | Label map **PRESENT** · AGG unpaid hours **PRESENT** | **RETAIN cite** · path ≠ full UC |
| Tắt ứng → chặn vượt | SRS rule | **400** balance when over available **PRESENT** | **RETAIN** **R-ATT-04B-GATE-REJECT** |
| Đề xuất ứng / không lương khi vượt | Diễn biến **#1** | **ABSENT** (reject only) | **GAP** **R-ATT-04B-OVER-BAL** |
| Trần ứng CRUD | SRS input table | **ABSENT** dedicated | **HOLD/GAP** **R-ATT-04B-CAP-CRUD** · ba-data |
| Cách trừ kỳ sau | SRS input | **ABSENT** | **HOLD** **R-ATT-04B-DEDUCT-MODE** · w/ ENGINE |
| Cột `advanced` trong available | DB § balance | **ABSENT** in leave-balance/leave-requests wire | **GAP** **R-ATT-04B-ADVANCED-WIRE** |
| Bù trừ khi cấp quỹ | Diễn biến **#2** | **ABSENT** job | **HOLD** **R-ATT-04B-OFFSET** · **R-ATT-04-ENGINE** |
| Duyệt đặc biệt vượt trần | SRS | **ABSENT** | **GAP** after cap AC |
| Hold on submit | ATT-09 | `pending_days` **PRESENT** | **must_keep** · **DENY** `att_leave_hold` |
| ATT-04 catalog/policy/grant | peer | SEALED GWC | **must_keep RETAIN** · **DENY wipe** |
| PAY advance bridge | F-PAY-ADV-BRIDGE-01 | **OUT** GĐ1 | **DENY invent DONE** |
| Paper `/att` + `/core` | alias | Nest `/core` **ABSENT** | **alias only** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-04b DONE** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN catalog flag + panel + balance reject + gap AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** `allows_advance` on **F-ATT-CAT-LVT** · panel `advance`/`unpaid` labels · **ATT-09** `pending_days` hold + **hard reject** when over available (current `assertSufficientLeaveBalance`). Unlock BA residuals **R-ATT-04B-*** for cap CRUD · over-balance branch · unpaid type path · `advanced` wire (DATA stamp) · **HOLD** offset-on-grant with **R-ATT-04-ENGINE**. **must_keep** **`ATT04QC1-MSM22G4W`** ATT-04 paths · **DENY** `att_leave_hold` · **DENY** PAY bridge LIVE · **DENY** wipe LVT/LVRULE/grant. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (spine partial LIVE; residuals = cap + branch UX + advanced column + engine HOLD) |
| **Risk** | Low if BA separates reject-only vs full 04b · does not claim catalog flag = DONE |
| **Pros** | Aligns ATT-09 · ATT-04 seal · SRS «triển khai theo giai đoạn»; clear HOLD for offset/PAY |
| **Cons** | Not full FR-04b until cap + branch + offset waves; FE proposal UX unwired |
| **Failure modes** | Treat reject-only as FR-04b DONE; PAY bridge in ATT slice; second hold table |
| **Mitigation** | O1–O12 · C-SLICE · U65 · ENGINE/FY footers cite ATT-04 |

### Option B — PAY bridge LIVE / invent `att_leave_hold` / Settings sole cap / wipe ATT-04 (REJECT)

| | |
|--|--|
| **Summary** | Ship **F-PAY-ADV-BRIDGE-01** as ATT-04b DONE; add `att_leave_hold`; store cap only in Settings MD; demote Nest balance gate |
| **Pros** | Illusion of payroll-integrated advance |
| **Cons** | Violates ATT-09 seal · PAY OUT · ATT-04 must_keep · dual hold SoT · ADR ATT writer chain |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim `allows_advance` + panel = FR-04b DONE / offset engine LIVE / honesty flip (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because catalog flag + panel bucket exist; run F-ATT-LEAVE-04 offset as GWC; flip `attendance_uat_ready`; conflate with ATT-04 DONE |
| **Pros** | Fast chat claim |
| **Cons** | Violates board #36 · SRS Diễn biến #1/#2 · ATT-04 honesty · C-SLICE |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap) | B (PAY/hold dual) | C (claim DONE) |
|-----------|-------:|---------------:|------------------:|---------------:|
| Business value (FR-04b) | 5 | **4** | 2 | 0 |
| Preserve ATT-04 + ATT-09 | 5 | **5** | 1 | 0 |
| Honesty / seal safety | 5 | **5** | 1 | 0 |
| Time to deliver | 4 | **4** | 2 | Fake PASS |
| Fit peer ENGINE HOLD | 5 | **5** | 1 | 0 |
| **Weighted** | | **high** | low | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE `allows_advance` + panel buckets + balance reject gate; unlock **R-ATT-04B-*** residuals; **HOLD** offset-on-grant with **R-ATT-04-ENGINE**; **RETAIN** **`ATT04QC1-MSM22G4W`** + **`ATT03DQC1-MSM1CR19`** + ATT-09 **`pending_days`**; **DENY** `att_leave_hold` · PAY bridge LIVE · wipe ATT-04 · honesty flip |
| **Why selected** | AS-IS already enforces «chặn vượt số dư» and exposes catalog/panel hooks; FR-04b gap is **cap CRUD · over-balance branch · advanced wire · offset job** — not greenfield PAY or second hold ledger |
| **Assumptions** | Offset-on-grant shares **F-ATT-LEAVE-04** engine wave with ATT-04 accrue · Cap fields closable on `att_leave_accrual_policy` or tenant extension — **ba-data** stamps before BE |
| **Rejected** | **B** PAY/`att_leave_hold`/Settings sole · **C** claim DONE / engine LIVE / ATT UAT |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Catalog ứng | RETAIN `allows_advance` on F-ATT-CAT-LVT | AC bind type · **≠** flag alone = FR-04b DONE |
| O2 | Panel | RETAIN `advance` + unpaid labels | AC panel read · peer ATT-05b cite |
| O3 | Gate reject | RETAIN 400 when over available (ứng OFF path) | AC «Tắt ứng → chặn» · U65 Network |
| O4 | Over-balance branch | **GAP** propose advance/unpaid | AC Diễn biến **#1** · FE-after-2xx when cap ON |
| O5 | Trần ứng CRUD | **HOLD/GAP** until DATA stamp | AC input table · no hardcode % |
| O6 | Cách trừ | **HOLD** with ENGINE | Footer **R-ATT-04B-DEDUCT-MODE** XOR closable ADD |
| O7 | `advanced` column | **GAP** wire in available | DATA stamp · **≠** `att_leave_hold` |
| O8 | Bù trừ khi cấp | **HOLD** F-ATT-LEAVE-04 | Footer **R-ATT-04B-OFFSET** · cite **R-ATT-04-ENGINE** |
| O9 | Hold semantics | `pending_days` RETAIN | Cross-ref ATT-09 · **DENY** `att_leave_hold` |
| O10 | ATT-04 peer | must_keep **`ATT04QC1-MSM22G4W`** | **DENY wipe** LVT/LVRULE/grant |
| O11 | PAY / printable | OUT invent DONE | **DENY** F-PAY-ADV-BRIDGE LIVE |
| O12 | Honesty | false · C-SLICE · mint **J-HRM-ATT-04B-*** DRAFT | **≠ ATT-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Deepen = later **sa API** seat after BA (+ ba-data HOLD) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Disposition | Bước SRS |
|-------------|-------------------------------|-------------|----------|
| **F-ATT-CAT-LVT** (RETAIN) | `…/leave-types*` · `allows_advance` | RETAIN | Tiên quyết FR-04b |
| **F-ATT-LEAVE-BAL panel** (RETAIN) | `GET …/leave-balance/panel` | RETAIN `advance` bucket | peer 05b |
| **F-ATT-LEAVE-02/03** (RETAIN+GAP) | `POST …/leave-requests` + balance | RETAIN reject · GAP branch | **#1** |
| **F-ATT-LEAVE-BAL advanced** (GAP) | balance read/write | GAP wire `advanced` | DB paper |
| **F-ATT-LVRULE cap** (GAP/HOLD) | policy/tenant fields | CAP CRUD | SRS input |
| **F-ATT-LEAVE-04** (HOLD) | accrue + offset on grant | **HOLD** w/ ENGINE | **#2** |
| **F-PAY-ADV-BRIDGE-01** (OUT) | PAY module | **OUT invent DONE** GĐ1 | — |

**DENY:** invent Nest `@Controller('core')` · invent `att_leave_hold` · claim F-ATT-LEAVE-04 offset LIVE = this slice DONE · wipe ATT-04 paths · PAY bridge as ATT-04b exit.

---

## 6. unlock_lane

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-ATT-04B-* DRAFT
  → ba-data HOLD (cap/advanced cols ADD only if closable · DENY att_leave_hold)
  → sa API-01 F.1 deepen RETAIN cite + wire residual ONLY if stamped
  → Dev-FE over-balance proposal UX · Dev-BE HOLD invent unless DATA stamps ADD
  → QA U65 J-HRM-ATT-04B-* (allows_advance · reject path · cap ON branch when wired · Nest /core 0)
  → QC GWC C-SLICE (≠ ATT-04b/ATT-04/ATT UAT · printable false · must_keep ATT04+ATT03d)
```

---

## 7. must_keep / forbidden_paths / honesty locks

### must_keep (RETAIN — DENY wipe / DENY reopen without regression)

| Stamp / artifact | Lock |
|------------------|------|
| **`ATT04QC1-MSM22G4W`** · **`ATT04QA1-MSM21P8W`** | ATT-04 LVT/LVRULE/grant/panel · **≠ ATT-04 DONE** · **DENY wipe** in 04b waves |
| **`ATT03DQC1-MSM1CR19`** | GPS work-sites* · **DENY wipe** |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` · **DENY `att_leave_hold`** |
| **`ATT03BQC1` · `ATT01QC1` · `ATT11QC1` · `ATT10QC1` · `ATT08QC1` · `ATT02QC1` · `PLT01QC1` · CORE-10/09/07** | peer stamps · printable false · **R-ATT-01-ASSIGN open** |
| **R-ATT-04-FY** · **R-ATT-04-ENGINE** | footer HOLD · non-blocking |

### forbidden_paths (default DENY unless BA+DATA unlock)

```text
**/att_leave_hold**
apps/api/hrm-api/src/**/core.controller.ts
apps/api/hrm-api/src/attendance/att-leave-type.service.ts      # wipe allows_advance — ATT-04 owned
apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.ts  # wipe policies — ATT-04 owned
apps/api/hrm-api/src/attendance/leave-balance.service.ts       # demote tracked-entitlement — ATT-04/09 owned
**/attendance_work_sites**                                     # ATT-03d owned
**/pay/** *advance_request*                                    # PAY OUT — not ATT-04b slice DONE
honesty flags · SERVICE_READINESS promote
```

### honesty locks (mandatory)

| Claim | Verdict |
|-------|---------|
| **≠ ATT-04b / FR-04b DONE** from Option A alone | **LOCKED** |
| **≠ ATT-04 / FR-04 DONE** (peer **`ATT04QC1`**) | **LOCKED** |
| **≠ ATT module UAT** · `attendance_uat_ready=false` | **LOCKED** |
| **printable false** · PAY OUT | **LOCKED** |
| **DENY** `att_leave_hold` · Nest `/core` dual · PAY bridge LIVE | **LOCKED** |
| **DENY** F-ATT-LEAVE-04 offset LIVE = slice DONE | **LOCKED** |
| **DENY** claim `allows_advance` + panel = FR-04b DONE | **LOCKED** |
| **DENY** wipe ATT-04 LVT/LVRULE/grant | **LOCKED** |

---

## 8. completion_report

| | |
|--|--|
| **Closed** | Option **A** CONFIRMED for `UC-BP-ATT-04b` / `FR-UC-BP-ATT-04b` · RETAIN cite `allows_advance` · panel advance/unpaid labels · balance reject gate · residuals **R-ATT-04B-*** · O1–O12 · **HOLD** offset/engine/PAY · must_keep **`ATT04QC1`** + full peer chain · **DENY** `att_leave_hold` · **≠ ATT-04b/ATT-04/ATT UAT** · apps/** untouched |
| **Residual** | BA AC + **J-HRM-ATT-04B-*** · ba-data HOLD (cap/advanced · no hold table) · API/FE/BE/QA/QC waves |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-ATT-04b · FR-UC-BP-ATT-04b · BR-BP-LV-07 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md (must_keep ATT04 — DENY wipe)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md (FR-UC-BP-ATT-04b · Diễn biến #1 · #2)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (allows_advance · advanced paper · F-ATT-LEAVE-02/03 · DENY att_leave_hold physical)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (allows_advance · advanced · allow_negative · DENY att_leave_hold table)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md (pending_days · DENY att_leave_hold)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qc-01.md (ATT04QC1-MSM22G4W · ≠ ATT-04 DONE)
entry_criteria: SA Option A CONFIRMED · U65 zero-seed · no apps/** · no seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md
  - O1–O12 CONFIRM (allows_advance · panel · reject gate · over-balance branch GAP · cap CRUD · deduct HOLD · advanced wire · offset HOLD · ATT-09 must_keep · ATT-04 must_keep · PAY OUT · honesty)
  - mint J-HRM-ATT-04B-01..0n DRAFT (cap config · over-balance propose · unpaid type · reject when advance OFF · offset footer HOLD · Nest /core 0) · U65 FE-after-2xx+F5
  - explicit ≠ ATT-04b DONE · ≠ ATT-04 DONE · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - DENY invent att_leave_hold · DENY PAY-ADV-BRIDGE LIVE · DENY F-ATT-LEAVE-04 offset LIVE claim · DENY wipe ATT-04 LVT/LVRULE/grant
  - must_keep: ATT04QC1-MSM22G4W · ATT03DQC1-MSM1CR19 · ATT09QC1-MSLUTL9D · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10/09/07 · R-ATT-04-FY · R-ATT-04-ENGINE HOLD · R-ATT-01-ASSIGN open
  - unlock next: ba-data HOLD (cap/advanced ADD only if closable · no att_leave_hold)
  - ack_status PASS_TO_PM · next_owner ba-data
cấm: apps/** · seed · invent att_leave_hold · invent Nest /core · invent PAY bridge DONE · honesty flip · wipe ATT-04 paths · reopen sealed peers
```
