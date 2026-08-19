# PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01 — Option/F.1 · Giảm trừ gia cảnh từ hồ sơ — RETAIN deps SoT + gap GTCG consumer

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** second dependents SoT · **DENY** wipe PAY-01/02/04 + ATT peer seals · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → (ba-data closable delta if header cols) → API-01 deepen → Dev/BE+FE residual → QA → QC · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-39 UC-BP-PAY-04 **SEALED** — stamp **`PAY04QC1-MSMCR4GWC1`** · QA **`PAY04QA1-MSMCR401`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **`payroll_e2e_ready=false`** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-03` · `FR-UC-BP-PAY-03` · **BR-BP-PAY-02** · partner **REQ_L_003** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#45** after PAY-04 (#44 SEALED GWC) · PAY-05/06..09 **QUEUED** |
| **ref_pay01** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) · QC **`PAY01QC1-MSMBGWC1`** · **F-PAY-ATT-CLOSED-01** |
| **ref_pay02** | [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md) · QC **`PAY02QC1-MSMC4GWC1`** · **gd1_eval_v1** · `dependents_count` in formula catalog |
| **ref_pay04** | [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md) · QC **`PAY04QC1-MSMCR4GWC1`** · static **`gtgc_amount` once** on header · **HRM-PAY-SPLIT-409** · **AC-PAY-04-GTCG-HOLD** footer → **this seat** |
| **ref_core01** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) · **F-CORE-DEP-01** · `employee_dependents` ONE SoT |
| **ref_core02** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) · C&B ring · **F-PAY-CB-READ-01** peer |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-03** · Diễn biến **#1–#2 + Thành công** · trường hợp đặc biệt «Con đủ tuổi giữa năm» · cross **FR-UC-BP-PAY-04** (GTCG một lần trên tổng hợp) · **FR-UC-BP-CORE-01** (NPT public SoT) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P2** variable bag · **F-PAY-CB-READ-01** · **F-PAY-PROCESS-01** static merge · **F-PAY-SPLIT-01** static guard |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-CB-READ-01** (`dependent_count` / GTCG) · **F-PAY-PROCESS-01** · **F-CORE-DEP-01** `/employees/:id/dependents*` |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §3.3 `hrm_dependent` logical · LIVE **`public.employee_dependents`** · §5.6 `pay_payslip.gtgc_amount` · **DV-14** (no GTCG on segment) |
| **ref_matrix** | `UC_BR_MATRIX_DEPTH.md` UC-BP-PAY-03 · **PARTIAL** · REQ_L_003 |
| **ref_code** | **read-only cite (2026-08-10):** **F-CORE-DEP-01 LIVE** — `EmployeeDependentsService` + `/employees/:id/dependents*` (`is_tax_dependent`, `effective_from`/`effective_to`, soft archive). **GTCG consumer ABSENT** in payroll path — `pay-formula-variable-bag.ts` loads C&B + ATT hours **without** `dependents_count` / `gtgc_amount`; formula catalog lists `dependents_count` only in tests/constants. Split merge guards **GTCG** static family via `pay-payslip-split.constants.ts` + **HRM-PAY-SPLIT-409** (**PAY04**). **≠ claim MISSING = waive**; **≠ claim deps CRUD = PAY-03 DONE**. |
| **OUT** | Second `payroll_dependent` / `hrm_pay_gtgc` table · manual GTCG field on payroll period grid · FE tax/GTCG SoT · hardcode 11tr/4.4tr in Nest without catalog · claim CORE-01 dependents UI alone = FR-PAY-03 DONE · full progressive TNCN statutory module in this seat · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01/02/04 seals · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-03 / PAY module UAT** · **≠** full TNCN engine DONE (formula + PAY-06 peer) · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-40 architecture unlock: **giảm trừ gia cảnh từ hồ sơ đủ quyền — một nguồn cho thuế** (FR-UC-BP-PAY-03 · BR-BP-PAY-02) vs AS-IS (dependents CRUD without PAY consumer) — **gap-only** under U89 · **bind PAY-04 static-once + PAY-01/02 process** |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-04 QC-01 GWC (`PAY04QC1-MSMCR4GWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-03 · BR-BP-PAY-02 · REQ_L_003 · F-CORE-DEP-01 · F-PAY-CB-READ-01 · F-PAY-PROCESS-01 · F-PAY-SPLIT-01 static merge · must_keep PAY01QC1 + PAY02QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1 · ≠ payroll_e2e LIVE · ≠ reopen sealed journeys |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **CORE-01 SEALED:** **F-CORE-DEP-01** — `public.employee_dependents` ONE SoT · CRUD on `/api/hrm/employees/:employeeId/dependents*` · `is_tax_dependent` · `effective_from`/`effective_to` · scope U19 · **≠** duplicate payroll person master. **PAY-01/02/04 SEALED (must_keep):** closed sheet · formula process · split merge with **static GTCG family** guarded (**HRM-PAY-SPLIT-409** L1) · header `gtgc_amount` paper vs LIVE waiver (deduction lines). **PAY GTCG consumer (ABSENT):** No period-as-of resolver counting eligible tax dependents · no `dependents_count` / `gtgc_amount` injected into **F-PAY-CB-READ-01** / variable bag · no **DENY** duplicate GTCG input on payroll mutate surfaces · SRS Diễn biến #2 «Tính lương kỳ mở đọc mức hiệu lực» **not** architecture-closed for GTCG. **Risk if ignored:** HR updates NPT on profile but payroll uses stale/zero GTCG · or payroll invents parallel NPT table · double master breaks REQ_L_003 · undermines PAY-04 «static once» when formula emits per-segment GTCG lines. |
| **Paper target** | FR-UC-BP-PAY-03: (1) C&B cập nhật NPT trên hồ sơ (đủ quyền); (2) kỳ lương mở **đọc** mức GTCG hiệu lực — **không** nhập tay trùng trên bảng lương; (3) đổi NPT hợp lệ → kỳ mở dùng mức mới; (4) split-month: GTCG **một lần** trên tổng hợp (**PAY-04**); (5) con đủ tuổi giữa năm → cắt giảm trừ từ `effective_from`. BR-BP-PAY-02. |
| **Gap class** | **GĐ1 continuous GTCG consumer + AC/journey** on LIVE **F-CORE-DEP-01** — **not** reinvent dependents CRUD; **not** claim deps UI = PAY-03 module DONE; **not** flip `payroll_e2e_ready`; **bind** PAY-04 static-once invariant. |
| **Constraints** | U89 · preserve **PAY01QC1** + **PAY02QC1** + **PAY04QC1** + **ATT12QC1** + **ATT11QC1** + ATT peer chain · Nest `/core` DENY as second SoT · C-SLICE · DENY seed · gap-only · DENY merge buckets · DENY `att_leave_hold` · DENY reopen **J-HRM-PAY-01-*** / **J-HRM-PAY-02-*** / **J-HRM-PAY-04-*** without regression bus |
| **Failure impact if unresolved** | Board #45 stalls; REQ_L_003 PARTIAL persists; payroll hardcodes GTCG; FE duplicate fields; false PAY UAT; regression PAY-04 double-static guard |

### 1.2 Architecture diagram (target — Option A)

```text
  CORE-01 SEALED (must_keep): F-CORE-DEP-01
  /employees/:id/dependents* → employee_dependents ONE SoT
  is_tax_dependent · effective_from/to · archived_at
       │
       │  DENY: second payroll_dependents table · DENY: GTCG on public EMP PATCH
       ▼
  ┌──────────── FR-UC-BP-PAY-03 (this seat — GTCG consumer GAP) ─────────────┐
  │                                                                            │
  │  RETAIN (cite — ≠ PAY-03 DONE alone)                                       │
  │    F-CORE-DEP-01 CRUD + scope · CORE-02 C&B ring boundary                  │
  │    PAY-01 closed sheet · PAY-02 gd1_eval_v1 + dependents_count catalog key │
  │    PAY-04 static merge: gtgc_amount / GTCG lines ONCE on header (DV-14)    │
  │                                                                            │
  │  NEW consumer (GAP — unlock BA → API → Dev)                                │
  │    R-PAY-03-RESOLVE   : as-of payroll period, count eligible tax NPT       │
  │    R-PAY-03-AMOUNT    : map statutory mức (self + per-NPT) from CFG/catalog │
  │    R-PAY-03-BAG       : inject dependents_count · gtgc_amount_vnd into bag │
  │    R-PAY-03-PROCESS   : F-PAY-PROCESS-01 step after CB read · before/merge  │
  │    R-PAY-03-HEADER    : persist gtgc once (header col and/or deduction line) │
  │    R-PAY-03-DENY-UI   : cấm manual GTCG/NPT on payroll grid · 403/validation │
  │    R-PAY-03-AGE-CUT   : mid-year age-out · effective_to from SRS special    │
  │    R-PAY-03-JOURNEY   : mint J-HRM-PAY-03-* DRAFT + regression PAY-01/02/04 │
  │                                                                            │
  │  HOLD / peer (footer — not blocking SA lock)                                 │
  │    Full progressive TNCN brackets / khấu trừ lũy tiến detail = formula+PAY-06 │
  │    BR-BP-SPL-02 SI ceiling depth = PAY-05                                  │
  └────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  Payroll UI manual GTCG field        = DENY (BR-BP-PAY-02)
  Second dependents master in PAY     = DENY (REQ_L_003 · O5 CORE-DEP-ONE)
  FE computes gtgc_amount             = DENY (OS 28 · BE SoT)
  GTCG per split segment row          = DENY (DV-14 · PAY04QC1)
  Claim F-CORE-DEP-01 alone = DONE    = DENY
  Flip payroll_e2e_ready / PAY UAT    = DENY
  Wipe PAY01/02/04 / ATT11/12         = DENY
  C-SLICE ≠ module PAY UAT

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Giảm trừ gia cảnh từ hồ sơ» GĐ1 = **consumer** of **F-CORE-DEP-01** into **F-PAY-CB-READ-01** / process bag + **one** static GTCG application aligned with **PAY-04** merge — **not** reinvent NPT CRUD; **not** full statutory tax module DONE; **C-SLICE**.  
**Spine lock:** Physical dependents = **`employee_dependents`** only — paper `hrm_dependent` = **alias/DOC-DELTA**.  
**Split lock:** **must_keep PAY04QC1** — GTCG remains **static monthly** on payslip header path; segment rows **forbidden** `gtgc_amount`; **HRM-PAY-SPLIT-409** if evaluator emits duplicate static GTCG across segments.  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **≠** FR-UC-BP-PAY-03 module DONE from architecture doc alone.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / TechSpec / API / DB) | AS-IS LIVE | Verdict |
|------------|-----------------------------------|------------|---------|
| Dependents CRUD ONE SoT | F-CORE-DEP-01 · §3.3 | `employee_dependents` + controller | **must_keep RETAIN** |
| `is_tax_dependent` + effective dates | FR-PAY-03 input | columns LIVE | **RETAIN cite** · **GAP** age-cut rules AC |
| F-PAY-CB-READ-01 GTCG | API map `dependent_count` | C&B bag partial · **no deps count** | **GAP** R-PAY-03-BAG |
| `dependents_count` formula var | PAY-02 catalog | constant listed · **not loaded** | **GAP** R-PAY-03-BAG |
| `gtgc_amount` on payslip header | DB §5.6 | waiver → lines/deduction | **GAP** R-PAY-03-HEADER · ba-data optional ALTER |
| No manual GTCG on payroll | BR-BP-PAY-02 Diễn biến #3 | not enforced FE/BE | **GAP** R-PAY-03-DENY-UI |
| Period-open reads new NPT | BR-BP-PAY-02 | not proven U65 | **GAP** AC + journey |
| Split static once | PAY-04 · DV-14 | split service + 409 L1 | **must_keep RETAIN** · **bind** PAY03 |
| Statutory mức (self/NPT) | UC matrix depth | tenant CFG TBD | **GAP** R-PAY-03-AMOUNT · catalog |
| Closed sheet / formula order | PAY01/02 seals | LIVE | **must_keep RETAIN** |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — RETAIN F-CORE-DEP-01 + EXPAND F-PAY-CB-READ-01 GTCG consumer + process/header once (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** **`employee_dependents`** ONE SoT (**F-CORE-DEP-01**) and sealed **PAY-01/02/04** boundaries. **EXPAND** internal **F-PAY-CB-READ-01** (logical sub-step **F-PAY-GTCG-01** — no new public CRUD API GĐ1) to: resolve eligible tax dependents **as-of payroll period** · compute **`dependents_count`** + **`gtgc_amount_vnd`** from **tenant statutory config / platform catalog** (not hardcoded in service) · inject into variable bag for **gd1_eval_v1** · persist **once** on payslip header and/or **`GTCG*` deduction line** · **DENY** manual GTCG on payroll surfaces. **must_keep** PAY01QC1 + PAY02QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1. **HOLD** full TNCN bracket engine detail = **formula + PAY-06** peer · **HOLD** SI ceiling depth = **PAY-05**. **≠ PAY-03 module UAT** · **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (resolver rules + bag + AC + split alignment) |
| **Risk** | Medium if age-cut / effective window wrong or static applied per segment |
| **Pros** | Matches SRS/BR-BP-PAY-02/REQ_L_003 · preserves CORE-01/O5 · aligns PAY-04 DV-14 |
| **Cons** | Depends on statutory CFG source of truth · formula may still be C-SLICE for tax lines |
| **Failure modes** | Double master NPT · stale count · manual payroll override · segment GTCG |
| **Mitigation** | O1–O16 · regression PAY-04-05/08 · jest resolver contracts |

### Option B — Payroll-owned dependents / manual GTCG column on period grid (REJECT)

| | |
|--|--|
| **Summary** | Clone NPT into `payroll_employee_dependents` or allow C&B to type GTCG on payroll run screen |
| **Pros** | Faster demo without profile sync |
| **Cons** | Violates BR-BP-PAY-02 · REQ_L_003 «NPT tách khỏi hồ sơ» · O5 CORE-DEP-ONE FAIL · double master |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim F-CORE-DEP-01 CRUD = FR-PAY-03 DONE / skip bag consumer (REJECT)

| | |
|--|--|
| **Summary** | Mark PAY-03 DONE because dependents API exists; no `dependents_count` in process; flip honesty |
| **Pros** | Fast matrix green |
| **Cons** | Violates FR Diễn biến #2 · QC PAY-04 GTCG-HOLD footer · C-SLICE lie |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (deps SoT + consumer) | B (payroll master/manual) | C (HOLD/claim DONE) |
|-----------|-------:|------------------------:|--------------------------:|--------------------:|
| Business value (FR-PAY-03) | 5 | **5** | 1 | 0 |
| Time to deliver | 4 | **4** | 3 | Fake PASS |
| Fit BR-BP-PAY-02 + CORE-01 | 5 | **5** | 0 | 1 |
| PAY-04 static-once alignment | 5 | **5** | 2 | 0 |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Maintainability (ONE SoT) | 5 | **5** | 0 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **RETAIN F-CORE-DEP-01** + **GAP F-PAY-GTCG consumer** inside **F-PAY-CB-READ-01** / **F-PAY-PROCESS-01**: period-as-of eligible NPT count · statutory amount map · bag vars · header/line once · **DENY** payroll manual GTCG · **bind PAY04** static merge; unlock **R-PAY-03-***; **RETAIN** PAY01QC1 + PAY02QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1; **DENY** second table · FE tax SoT · segment `gtgc_amount` · claim deps CRUD = DONE · `payroll_e2e_ready` flip · PAY module UAT · reopen sealed journeys · seed · apps/** |
| **Why selected** | SRS already defines single-source GTCG; LIVE deps spine exists; gap is **payroll read + enforce no duplicate entry** — not alternate product shape |
| **Assumptions** | **PAY01QC1** + **PAY02QC1** + **PAY04QC1** **RETAIN** · `employee_dependents` is physical SoT · statutory amounts configurable per tenant · `payroll_e2e_ready=false`. GTCG consumer **ABSENT** in bag today — **expected** until Dev after BA/API. |
| **Rejected** | **B** — payroll master / manual grid · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | ONE SoT | All NPT mutations via **F-CORE-DEP-01** only | AC cite O5 · REQ_L_003 |
| O2 | Eligibility predicate | Count rows: `archived_at IS NULL` · `is_tax_dependent=true` · effective window **intersects** payroll period | AC-PAY-03-COUNT |
| O3 | As-of date | Use period **`payroll_period.to_date`** (or policy `as_of` — BA pick one) | AC-PAY-03-ASOF |
| O4 | Mid-year age-out | SRS special: set/end `effective_to` when child ages out · count drops from date | AC-PAY-03-AGE-CUT |
| O5 | Statutory amounts | Self + per-NPT VND from **tenant/platform catalog** — **cấm** magic numbers only in Nest | AC-PAY-03-CFG |
| O6 | Bag keys | `dependents_count` (int) · `gtgc_amount_vnd` or evaluator alias per PAY-02 catalog | AC-PAY-03-BAG |
| O7 | Process placement | After **F-PAY-CB-READ-01** · before eval/merge · **must_keep** ATT-412 → FORMULA-412 order | PAY02QC1 |
| O8 | Header vs line | GĐ1: `gtgc_amount` header **and/or** `GTCG` component line **once** — align DATA waiver §6.3 | AC-PAY-03-HEADER |
| O9 | Split-month | **must_keep PAY04** — static GTCG **only** post-merge header path · **409** if duplicated | AC-PAY-03-SPLIT-ONCE |
| O10 | DENY manual UI | Payroll period / payslip mutate **rejects** body fields `gtgc_*` / `dependent_count` override | AC-PAY-03-DENY-MANUAL |
| O11 | AuthZ | Update NPT: profile/C&B roles per CORE-01; **read** for process: PAY orchestrator internal | AC-PAY-03-AUTHZ |
| O12 | Display-ready | Process/preview exposes `dependents_count`, `gtgc_amount_vnd` read-only for C&B (vi-VN money) | OS 28 |
| O13 | Regression | **DENY reopen** J-HRM-PAY-01-* · J-HRM-PAY-02-05..07 · J-HRM-PAY-04-05/06/08 · J-HRM-CORE-01 deps | must_keep |
| O14 | must_keep stamps | PAY01QC1 + PAY02QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1 | ≠ wipe |
| O15 | Honesty | Mint **J-HRM-PAY-03-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O16 | PAY-05/06 peer | SI ceiling detail **PAY-05** · full run/hire e2e **PAY-06** — GTCG seat ≠ tax engine DONE | Footer |

---

## 5. F.1 disposition (cluster lock · deepen = later API-01 seat)

| F-id | Physical / logical | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------|-------------|---------------|----------|
| **F-CORE-DEP-01** | `/employees/:id/dependents*` | **must_keep RETAIN** | ONE SoT NPT | FR-CORE-01 · FR-PAY-03 input |
| **F-PAY-CB-READ-01** | internal facade | **RETAIN partial** · **EXPAND** GTCG slice | Nạp `dependent_count` + GTCG vào bag | FR-PAY-03 **#2** · FR-PAY-01 **#3** |
| **F-PAY-GTCG-01** (logical) | inside CB read / process | **GAP** unlock Dev | Đếm NPT · tính mức · không CRUD | Diễn biến **#1–#2** |
| **F-PAY-PROCESS-01** | `POST …/process` | **RETAIN** · **EXPAND** static GTCG persist | Ghi một lần trên phiếu | FR-PAY-03 **#2** |
| **F-PAY-SPLIT-01** (peer PAY-04) | merge step | **must_keep RETAIN** | Cấm GTCG kép đoạn | FR-PAY-04 · **O9** |
| **F-PAY-FORMULA-EVAL** (peer PAY-02) | gd1_eval_v1 | **RETAIN cite** · consume `dependents_count` | Biến công thức | FR-PAY-02 |
| **pay_payslip.gtgc_amount** (DB) | header col | **GAP** optional ALTER | Audit tĩnh | DB §5.6 · DATA HOLD waiver |

**DENY:** New public `POST /payroll/dependents` CRUD GĐ1.  
**DENY:** FE PATCH payslip to set GTCG.  
**DENY:** Treat **F-CORE-DEP-01** existence as FR-PAY-03 module DONE.

**Display-ready cite for BA:** Bag `{ dependents_count, gtgc_amount_vnd, … }` · payslip preview `{ gtgc_amount_vnd | deduction line GTCG* }` · errors **`HRM-PAY-GTCG-403`** (manual override) · retain **`HRM-PAY-SPLIT-409`** when static duplicated (**PAY04**).

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O16 + mint J-HRM-PAY-03-* DRAFT + regression PAY-01/02/04/CORE-01 deps
  → ba-data DATA-01 (optional: pay_payslip.gtgc_amount + statutory CFG table if closable)
  → sa API-01 F.1 deepen F-PAY-CB-READ-01 / F-PAY-GTCG-01 / F-PAY-PROCESS-01
  → dev-be resolver + bag + deny manual + header/line persist
  → dev-fe read-only GTCG on preview (no edit on payroll grid)
  → qa U65 J-HRM-PAY-03-* + regression J-HRM-PAY-04-05/08 + CORE-01 dependents mutate→process
  → qc GWC C-SLICE (≠ PAY-03 / PAY module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O16 AC + mint J-HRM-PAY-03-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data closable delta | ba-data | DATA-01 if header/CFG migration |
| 4. sa API-01 F.1 LOCK | sa | API cluster spec |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 + regression PAY-01/02/04 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · PAY01QC1 + PAY02QC1 + PAY04QC1 + ATT12+ATT11 stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-03 module DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Double NPT master | Schema/AC | O1 · **REJECT B** |
| A | Manual GTCG on payroll | API/FE 403 | O10 |
| A | GTCG per segment | DV-14 / 409 | O9 · PAY04QC1 |
| A | Stale count after profile update | U65 F5 process | O2 · O3 · journey |
| A | Hardcoded 11tr/4.4tr | Code review | O5 catalog |
| A | Skip formula/process order | PROCESS-AC | O7 · PAY02QC1 |
| A | Claim deps CRUD = DONE | Evidence footer | O15 |
| A | Flip payroll_e2e_ready | Flag true | O15 DENY |
| A | Reopen PAY-04 split seals | QA regression FAIL | O13 |
| B | Double master | REQ_L_003 | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** | RETAIN · closed-sheet · ATT-412 |
| **PAY02QC1-MSMC4GWC1** | RETAIN · formula · process order · gd1_eval_v1 |
| **PAY04QC1-MSMCR4GWC1** | RETAIN · static GTCG once · **HRM-PAY-SPLIT-409** |
| **ATT12QC1-MSMAIGWC1** | RETAIN |
| **ATT11QC1-MSLXTH9P** | RETAIN · close spine |
| **F-CORE-DEP-01** | RETAIN ONE SoT · **no** second deps table |
| **BR-BP-PAY-02** | One source · no payroll duplicate entry |
| **BR-BP-SPL-01** | GTCG static once with split (**PAY-04**) |
| Nest `/core` dual SoT | **DENY** |
| FE GTCG / count SoT | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| Claim deps API = PAY-03 DONE | **DENY** |
| Honesty | **DENY** flip · U65 zero-seed |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-03: **RETAIN** **F-CORE-DEP-01** `employee_dependents` ONE SoT; **GAP** **F-PAY-GTCG-01** consumer inside **F-PAY-CB-READ-01** / **F-PAY-PROCESS-01** (period-as-of eligible NPT · statutory CFG amounts · `dependents_count` + `gtgc_amount_vnd` bag · header/line once · **DENY** manual payroll GTCG); **R-PAY-03-RESOLVE/AMOUNT/BAG/PROCESS/HEADER/DENY-UI/AGE-CUT/JOURNEY**; **bind** **PAY04QC1** static-once + **HRM-PAY-SPLIT-409**; **HOLD** full TNCN depth **PAY-06** · SI **PAY-05**; **must_keep** **PAY01QC1+PAY02QC1+PAY04QC1+ATT12QC1+ATT11QC1**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** (BA-01 AC pack) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-03 · FR-UC-BP-PAY-03 · BR-BP-PAY-02 · REQ_L_003 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md (F-CORE-DEP-01 ONE SoT)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md (static GTCG once · PAY04QC1)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md (dependents_count formula var · PAY02QC1)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-03
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-CB-READ-01 · F-CORE-DEP-01
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.3 · §5.6 gtgc_amount
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-01.md (PAY04QC1 · must_keep PAY01+PAY02)
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY04QC1-MSMCR4GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain · payroll_e2e_ready=false · U65 zero-seed
exit_criteria: docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md · O1–O16 CONFIRMED · AC-PAY-03-* · mint J-HRM-PAY-03-01..08 DRAFT · regression J-HRM-PAY-01-01/02/04/06 · J-HRM-PAY-02-05..07 · J-HRM-PAY-04-05/08 · J-HRM-CORE-01 dependents path · explicit ≠ PAY-03/FR-PAY-03 DONE · ≠ payroll_e2e_ready · ≠ PAY module UAT · C-SLICE · DENY second deps table · DENY manual GTCG on payroll · PASS_TO_PM unlock ba-data/API
cấm: apps/** · seed · honesty flip · reopen PAY-01/02/04 seals without bus
```
