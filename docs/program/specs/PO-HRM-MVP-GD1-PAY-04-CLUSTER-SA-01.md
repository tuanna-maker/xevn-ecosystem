# PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01 — Option/F.1 · Gộp lương giữa kỳ (split-month) — RETAIN PAY boundaries + gap orchestration

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PAY-01/02 + ATT peer seals · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → (ba-data closable delta) → API-01 deepen → Dev/BE+FE residual → QA → QC · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-38 UC-BP-PAY-02 **SEALED** — stamp **`PAY02QC1-MSMC4GWC1`** · QA **`PAY02QA1-MSMC4HJT`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **`payroll_e2e_ready=false`** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-04` · `FR-UC-BP-PAY-04` · **BR-BP-SPL-01** · **BR-BP-SPL-02** (peer PAY-05) · partner **REQ_L_004** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#44** after PAY-02 (#43 SEALED GWC) · PAY-03/05/06..09 **QUEUED** |
| **ref_pay01** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) · API-01 · QC **`PAY01QC1-MSMBGWC1`** · **F-PAY-ATT-CLOSED-01** · **HRM-PAY-ATT-412** |
| **ref_pay02** | [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md) · API-01 · QC **`PAY02QC1-MSMC4GWC1`** · **gd1_eval_v1** · process order **ATT-412 → FORMULA-412** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-04** · Diễn biến **#1–#3 + FAIL GTCG kép + Thành công** · cross **FR-UC-BP-PAY-08** (một Net) · **FR-UC-BP-PAY-06** (chạy kỳ peer) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P6** · **F-PAY-SPLIT-01** (pointer) · runtime inside **F-PAY-PROCESS-01** · **P1–P4** must_keep |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-SPLIT-01** · **F-PAY-PROCESS-01** step (4) · **`HRM-PAY-SPLIT-409`** · **F-PAY-PAYSLIP-01** optional `segments[]` display |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §5.6 `pay_payslip` (header static vars) · §5.8 **`pay_payslip_split_segment`** · DV-13/DV-14 |
| **ref_code** | **read-only cite (2026-08-10):** split orchestration **ABSENT** in `apps/api/hrm-api` payroll process path (no `split`/`HRM-PAY-SPLIT` symbol) — **≠ claim MISSING = waive**; paper + DB logical **PRESENT** · process still **gd1_eval_v1 C-SLICE** per PAY-02 seal |
| **OUT** | Hai phiếu net / NV / kỳ · FE merge Net · hardcode ngày 15 · đọc Leave/OT HTTP cho giờ đoạn · claim F-PAY-SPLIT pointer alone = FR-PAY-04 DONE · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01/02/ATT seals · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-04 / PAY module UAT** · **≠** full statutory TNCN/BH (PAY-03/05) · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-39 architecture unlock: **gộp lương khi đổi điều kiện giữa kỳ — một Net, không GTCG kép** (FR-UC-BP-PAY-04 · BR-BP-SPL-01) vs AS-IS (paper P6 only) — **gap-only** under U89 · **bind PAY-01 closed sheet + PAY-02 formula process order** |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-02 QC-01 GWC (`PAY02QC1-MSMC4GWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-04 · BR-BP-SPL-01 · BR-BP-SPL-02 (trần BH peer PAY-05) · REQ_L_004 · F-PAY-SPLIT-01 · F-PAY-CB-READ-01 · F-PAY-PROCESS-01 · must_keep PAY01QC1 + PAY02QC1 + ATT12QC1 + ATT11QC1 · Q-PAY-F-3 · ≠ payroll_e2e LIVE · ≠ reopen sealed journeys |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **PAY-01 SEALED (`PAY01QC1-MSMBGWC1`):** closed-sheet bind · **HRM-PAY-ATT-412** · **F-PAY-ATT-CLOSED-01** bag · **≠ PAY-01 module UAT**. **PAY-02 SEALED (`PAY02QC1-MSMC4GWC1`):** formula lifecycle + **gd1_eval_v1** process path · order **ATT-412 → FORMULA-412** · **≠ PAY-02 module UAT** · J-01..04 browser HOLD. **Split-month (ABSENT runtime):** Paper **F-PAY-SPLIT-01** + DB **`pay_payslip_split_segment`** + API step inside **F-PAY-PROCESS-01** — **no** implemented detect/segment/merge/fail-double-GTCG in Nest payroll process (grep 2026-08-10). **Risk if ignored:** process may emit **one gross/net per full period** ignoring mid-period compensation effective dates → **violates BR-BP-SPL-01** when CORE timeline has change inside period. **SRS:** UC matrix depth **MISSING (edge P0)** — this seat unlocks architecture + BA AC, not claim DONE. |
| **Paper target** | FR-UC-BP-PAY-04: Detect NV có đổi lương/bậc/HĐ trong kỳ → tách **N đoạn** theo `effective_from` CORE/HĐ → tính **biến thời gian** (giờ, gross đoạn, PC theo ngày) **cộng dồn** → **biến tĩnh tháng** (TNCN, GTCG, trần BH) **một lần** trên header → **một** phiếu Net preview · **FAIL** nếu GTCG/trần BH nhân đôi · **cấm** hai phiếu Net cùng NV cùng kỳ chỉ vì split. |
| **Gap class** | **GĐ1 continuous orchestration + physical segment audit + AC/journey** on top of sealed PAY-01/02 — **not** greenfield payroll; **not** claim split pointer = module DONE; **not** flip `payroll_e2e_ready`; **not** full PAY-03 dependents engine or PAY-05 ceiling policy depth in this seat alone. |
| **Constraints** | U89 · preserve **PAY01QC1** + **PAY02QC1** + **ATT12QC1** + **ATT11QC1** + ATT peer chain · Nest `/core` DENY as hour SoT · C-SLICE · DENY seed · gap-only · DENY merge buckets · DENY `att_leave_hold` · DENY reopen **J-HRM-PAY-01-*** / **J-HRM-PAY-02-*** / **J-HRM-ATT-12-*** without regression bus |
| **Failure impact if unresolved** | Board #44 stalls; double GTCG on split hires/promotions; two payslips per employee per period; false PAY UAT; breaks REQ_L_004 P0 edge |

### 1.2 Architecture diagram (target — Option A)

```text
  PAY-01 SEALED: closed sheet · ATT-412 · F-PAY-ATT-CLOSED-01 (must_keep)
  PAY-02 SEALED: published formula · gd1_eval_v1 · ATT-412 → FORMULA-412 (must_keep)
  ATT-11/12 SEALED: close spine · ≠ PAY trigger alone
       │
       ▼
  ┌──────────── FR-UC-BP-PAY-04 (this seat — F-PAY-SPLIT-01 GAP inside process) ──┐
  │                                                                                 │
  │  RETAIN boundaries (cite — ≠ PAY-04 DONE alone)                                 │
  │    Process only after closed bind + published formula policy (PAY-01/02)        │
  │    Hour vars per segment from closed att_timesheet_line (prorate by date)       │
  │    C&B effective timeline from CORE ring (F-PAY-CB-READ-01) — not public ring   │
  │                                                                                 │
  │  NEW orchestration (GAP — unlock BA → DATA/API → Dev)                           │
  │    R-PAY-04-DETECT    : effective_from(s) intersect payroll period              │
  │    R-PAY-04-SEGMENT   : build 1..N segments [from, to] · snapshot base CB       │
  │    R-PAY-04-EVAL-PER  : gd1_eval_v1 (or successor) per segment → segment_gross  │
  │    R-PAY-04-MERGE     : sum time-varying · apply static once on pay_payslip hdr │
  │    R-PAY-04-AUDIT-DB  : N rows pay_payslip_split_segment → 1 payslip_id         │
  │    R-PAY-04-FAIL-409  : HRM-PAY-SPLIT-409 if double GTCG/BH static detected     │
  │    R-PAY-04-PREVIEW-AC: C&B sees one Net + segment breakdown display-ready      │
  │    R-PAY-04-JOURNEY   : mint J-HRM-PAY-04-* DRAFT + regression PAY-01/02/ATT    │
  │                                                                                 │
  │  HOLD / peer (footer — not blocking SA lock)                                      │
  │    BR-BP-SPL-02 full ceiling math detail = PAY-05                               │
  │    GTCG dependents depth = PAY-03                                               │
  │    Full hire→payslip e2e = PAY-06 · payslip ESS security = PAY-08               │
  └─────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  Two payslips net / NV / period     = DENY (BR-BP-SPL-01 FAIL)
  FE computes merge / GTCG once       = DENY (OS 28 · BE SoT)
  Static vars per segment             = DENY (DV-14 · SRS FAIL)
  Hardcode cut day 15                 = DENY (SRS input table)
  Leave/OT HTTP for segment hours     = DENY (must_keep PAY01 · Q-PAY-F-3)
  Claim paper F-PAY-SPLIT = DONE      = DENY
  Flip payroll_e2e_ready / PAY UAT    = DENY
  Wipe PAY01QC1 / PAY02QC1 / ATT11/12 = DENY
  C-SLICE ≠ module PAY UAT

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Gộp lương giữa kỳ» GĐ1 = **orchestration step F-PAY-SPLIT-01 inside F-PAY-PROCESS-01** after sealed PAY-01/02 invariants · **one** `pay_payslip` per employee per period · **N** `pay_payslip_split_segment` audit rows · **not** full tax/BH statutory module DONE; **not** PAY-05 ceiling policy alone; **C-SLICE**.  
**Spine lock:** Split **never** bypasses closed sheet or published-formula guards · segment hours **only** from **F-PAY-ATT-CLOSED-01** proration — **DENY** parallel Leave/OT HTTP.  
**Cut lock:** Mốc cắt = **ngày hiệu lực HR** từ CORE/compensation timeline — **DENY** default ngày 15 unless period config explicitly defines cut (SRS open question → BA O4).  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **≠** FR-UC-BP-PAY-04 module DONE from architecture doc alone.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / TechSpec / API / DB) | AS-IS LIVE | Verdict |
|------------|-----------------------------------|------------|---------|
| Closed sheet before process | PAY-01 · BR-BP-TS-03 | bind + 412 | **must_keep RETAIN** |
| Formula process order | PAY-02 GWC | ATT-412 → FORMULA-412 | **must_keep RETAIN** |
| gd1_eval_v1 per period | PAY-02 | evaluator stub | **RETAIN cite** · **per-segment GAP** |
| F-PAY-SPLIT-01 orchestration | API_DESIGN · TECHSPEC P6 | **ABSENT** in process | **GAP** R-PAY-04-* |
| `pay_payslip_split_segment` table | DB §5.8 logical | **unverified migration** | **GAP** ba-data/API closable |
| One net / NV / period | BR-BP-SPL-01 · DV-13 | paper rule | **GAP enforce** |
| Static vars once on header | BR-BP-SPL-01 · DV-14 | `pay_payslip` columns paper | **GAP merge** |
| Double GTCG fail | Diễn biến FAIL · HRM-PAY-SPLIT-409 | **ABSENT** | **GAP** R-PAY-04-FAIL-409 |
| CORE effective dates | Diễn biến #1 | F-PAY-CB-READ-01 partial | **GAP** R-PAY-04-DETECT |
| Trần BH on consolidated | BR-BP-SPL-02 | PAY-05 queued | **HOLD peer** PAY-05 |
| GTCG dependents | PAY-03 | queued | **HOLD peer** PAY-03 |
| Preview one Net + segments | Diễn biến Thành công | PAY-08 peer | **GAP** R-PAY-04-PREVIEW-AC |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — ORCHESTRATE F-PAY-SPLIT-01 inside process + segment table + merge static once (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** PAY-01 closed-sheet boundary + PAY-02 formula/process order. **EXPAND** **F-PAY-PROCESS-01** with internal **F-PAY-SPLIT-01**: detect CORE effective changes in period → build segments → evaluate time-varying per segment (reuse **gd1_eval_v1** bag scoped per segment) → **merge** to **one** `pay_payslip` with static `tax_amount`/`gtgc_amount`/`si_*` **once** → persist **`pay_payslip_split_segment`** audit rows → **409** on double static. Unlock BA **R-PAY-04-*** AC + journeys. **must_keep** PAY01QC1 + PAY02QC1 + ATT12QC1 + ATT11QC1. **HOLD** full SPL-02 ceiling policy depth = **PAY-05** · full GTCG engine = **PAY-03**. **≠ PAY-04 module UAT** · **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium–high (orchestration + DB segment + AC; builds on sealed PAY-01/02) |
| **Risk** | Medium if segment hour proration wrong or static applied per segment |
| **Pros** | Matches SRS/BR-BP-SPL-01/DB/API paper · preserves boundaries · REQ_L_004 P0 edge |
| **Cons** | Depends on CORE effective timeline fidelity · gd1_eval_v1 still C-SLICE for tax lines |
| **Failure modes** | Two payslips · double GTCG · open sheet vars in segment |
| **Mitigation** | O1–O18 · regression PAY-01/02 · jest contract tests |

### Option B — Two payslips per segment + FE merge Net (REJECT)

| | |
|--|--|
| **Summary** | Emit one payslip per segment; portal sums Net; FE applies GTCG once visually |
| **Pros** | Simpler BE insert |
| **Cons** | Violates BR-BP-SPL-01 · DV-13 · SRS Diễn biến FAIL «hai phiếu net» · OS 28 FE SoT |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim paper F-PAY-SPLIT pointer = FR-PAY-04 DONE / skip segment DB (REJECT)

| | |
|--|--|
| **Summary** | Declare DONE because API_DESIGN has F-PAY-SPLIT-01 paragraph; no runtime; flip honesty; demote PAY-02 evaluator depth |
| **Pros** | Fast matrix green |
| **Cons** | Violates REQ_L_004 MISSING edge · C-SLICE lie · QC PAY-02 honesty |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (orchestrate+merge) | B (two payslips+FE) | C (HOLD/claim DONE) |
|-----------|-------:|----------------------:|--------------------:|--------------------:|
| Business value (FR-PAY-04) | 5 | **5** | 0 | 0 |
| Time to deliver | 4 | **3** | 4 | Fake PASS |
| Fit BR-BP-SPL-01 + PAY-01/02 | 5 | **5** | 0 | 1 |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability (BE SoT) | 5 | **5** | 0 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ORCHESTRATE F-PAY-SPLIT-01**: internal process step after PAY-01/02 guards; **one** payslip header; **N** segment rows; static monthly vars **once**; **HRM-PAY-SPLIT-409** on double static; unlock **R-PAY-04-***; **RETAIN** PAY01QC1 + PAY02QC1 + ATT12QC1 + ATT11QC1 + ATT peer chain; **DENY** two nets · FE merge · hardcode day 15 default · Leave/OT HTTP · claim pointer = DONE · `payroll_e2e_ready` flip · PAY module UAT · reopen sealed journeys · seed · apps/** |
| **Why selected** | Paper P6 + SRS FR already define invariant; PAY-01/02 seals provide prerequisites; gap is **orchestration + persistence + AC** — not alternate product shape |
| **Assumptions** | **PAY01QC1** + **PAY02QC1** **RETAIN** · CORE compensation timeline exposes `effective_from` within period (CORE-02 ring) · closed sheet lines allow date-bounded proration · `payroll_e2e_ready=false`. Split runtime **ABSENT** today — **expected** until Dev wave after BA/API. |
| **Rejected** | **B** — two payslips + FE merge · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | One Net invariant | Exactly **one** active `pay_payslip.net` per `(payroll_period_id, employee_id)` when split | AC cite BR-BP-SPL-01 · DV-13 |
| O2 | Segment audit | **N** `pay_payslip_split_segment` rows → **one** `payslip_id` | DB §5.8 |
| O3 | Time vs static | Segment stores **segment_gross** / hours; **cấm** `gtgc_amount` per segment | DV-14 |
| O4 | Cut date | Default = CORE `effective_from` · period cut config **optional** · **cấm** hardcode 15 | SRS input table |
| O5 | Multi-change month | **N>2** segments allowed · still one static merge | SRS special case |
| O6 | Hour proration | Segment hours from **closed** lines only · date filter | must_keep PAY01 |
| O7 | Detect source | F-PAY-CB-READ-01 timeline · not public CORE ring | D5 |
| O8 | Eval per segment | Call evaluator with segment-scoped bag · sum gross components | R-PAY-04-EVAL-PER |
| O9 | Static merge order | After sum segment gross → apply tax/GTCG/BH **once** on header | Diễn biến #3 |
| O10 | FAIL double GTCG | **HRM-PAY-SPLIT-409** · no silent fix | Diễn biến FAIL |
| O11 | Preview UX | One Net + breakdown `segments[]` display-ready (vi-VN money) | Diễn biến #5 |
| O12 | Process order | **must_keep** ATT-412 → formula bind → **then** split detect/merge | PAY02QC1 |
| O13 | Regression | **DENY reopen** J-HRM-PAY-01-* · J-HRM-PAY-02-05..07 · J-HRM-ATT-12-07 · J-ATT-07-* · J-ATT-06-04 | must_keep |
| O14 | must_keep stamps | PAY01QC1 + PAY02QC1 + ATT12QC1 + ATT11QC1 | ≠ wipe |
| O15 | Honesty | Mint **J-HRM-PAY-04-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O16 | PAY-05 peer | BR-BP-SPL-02 ceiling detail **HOLD** PAY-05 — split seat cites header `si_*` once | Footer |
| O17 | PAY-03 peer | Dependents/GTCG inputs **HOLD** PAY-03 — read CORE snapshot GĐ1 | Footer |
| O18 | Mid-month hire | Pro-rate first segment per SRS special · same merge rules | AC edge |

---

## 5. F.1 disposition (cluster lock · deepen = later API-01 seat)

| F-id | Physical / logical | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------|-------------|---------------|----------|
| **F-PAY-SPLIT-01** | Inside `POST …/payroll/periods/{id}/process` | **GAP** unlock Dev | Detect · segment · merge · một Net | Diễn biến **#1–#3** · FAIL |
| **F-PAY-PROCESS-01** | same endpoint | **RETAIN partial** · **EXPAND** step (4) | Orchestrator hosts split | FR-PAY-06 peer · **≠ DONE alone** |
| **F-PAY-ATT-CLOSED-01** (peer PAY-01) | internal bag | **must_keep RETAIN** | Giờ đoạn từ sheet chốt | PAY-01 · O6 |
| **F-PAY-CB-READ-01** | internal | **RETAIN partial** · **GAP** timeline | Ngày hiệu lực đổi | Diễn biến **#1** |
| **F-PAY-FORMULA-EVAL** (peer PAY-02) | gd1_eval_v1 | **RETAIN cite** · **per-segment GAP** | Gross đoạn | Diễn biến **#2** |
| **F-PAY-PAYSLIP-01** | GET payslips | **GAP** optional `segments[]` | Preview một Net | Thành công |
| **pay_payslip_split_segment** (DB) | table | **GAP** migration closable | Audit đoạn | DB §5.8 |

**DENY:** HTTP API bắt buộc riêng cho split GĐ1 (paper: internal only).  
**DENY:** `split_segments_json` blob as SoT — rows in **`pay_payslip_split_segment`** per API_DESIGN deprecation note.  
**DENY:** treat **F-PAY-SPLIT-01** paragraph existence as FR-PAY-04 module DONE.

**Display-ready cite for BA:** Process result `{ split: true, segment_count, net, segments[{ segment_seq, effective_from, effective_to, hours_payable, segment_gross }] }` · payslip header `{ gross, net, tax_amount, gtgc_amount, si_employee_amount, … }` · errors **`HRM-PAY-SPLIT-409`** · retain **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`**.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O18 + mint J-HRM-PAY-04-* DRAFT + regression PAY-01/02/ATT peers
  → ba-data DATA-01 (closable: pay_payslip_split_segment + DV-13/14 if migration needed)
  → sa API-01 F.1 deepen F-PAY-SPLIT-01 inside F-PAY-PROCESS-01
  → dev-be orchestration + segment persistence + 409 guard
  → dev-fe preview breakdown (display-only · no FE net SoT)
  → qa U65 J-HRM-PAY-04-* + regression J-HRM-PAY-01-* + J-HRM-PAY-02-05..07
  → qc GWC C-SLICE (≠ PAY-04 / PAY module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O18 AC + mint J-HRM-PAY-04-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data closable delta | ba-data | DATA-01 if migration |
| 4. sa API-01 F.1 LOCK | sa | API cluster spec |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 + regression PAY-01/02 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · PAY01QC1 + PAY02QC1 + ATT12+ATT11 stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-04 module DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Two payslips same period | DB UQ / AC | O1 · **REJECT B** |
| A | GTCG twice | 409 / AC | O10 |
| A | Static on each segment | DV-14 audit | O3 · O9 |
| A | Draft sheet hours in segment | ATT-412 | O6 · must_keep PAY01 |
| A | Skip formula order | PROCESS-AC | O12 · PAY02QC1 |
| A | Claim split doc = DONE | Evidence footer | O15 |
| A | Flip payroll_e2e_ready | Flag true | O15 DENY |
| A | Reopen PAY-01/02 journeys | QA regression FAIL | O13 |
| B | FE merge Net | OS 28 violation | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** | RETAIN · closed-sheet · ATT-412 · F-PAY-ATT-CLOSED-01 |
| **PAY02QC1-MSMC4GWC1** | RETAIN · formula · process order · gd1_eval_v1 C-SLICE |
| **ATT12QC1-MSMAIGWC1** | RETAIN · ≠ FR-12 DONE |
| **ATT11QC1-MSLXTH9P** | RETAIN · close spine |
| **ATT10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| **J-HRM-PAY-01-01..07** | RETAIN PASS · regression mandatory |
| **J-HRM-PAY-02-05..07** | RETAIN PASS · regression mandatory |
| **BR-BP-SPL-01** | One Net · no double GTCG |
| **BR-BP-SPL-02** | Header trần BH once — detail **PAY-05** peer |
| Nest `/core` hour SoT | **DENY** |
| Two payslips / FE merge | **DENY** |
| Hardcode ngày 15 | **DENY** default |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| Claim F-PAY-SPLIT pointer = DONE | **DENY** |
| Honesty | **DENY** flip · U65 zero-seed |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-04: **RETAIN** PAY-01 closed-sheet + PAY-02 formula/process order; **GAP** **F-PAY-SPLIT-01** orchestration (detect · segment · per-segment eval · merge static once · **`pay_payslip_split_segment`** · **HRM-PAY-SPLIT-409**); **R-PAY-04-DETECT/SEGMENT/EVAL-PER/MERGE/AUDIT-DB/FAIL-409/PREVIEW-AC/JOURNEY**; **HOLD** BR-BP-SPL-02 depth **PAY-05** · GTCG **PAY-03**; **must_keep** **PAY01QC1+PAY02QC1+ATT12QC1+ATT11QC1**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** (BA-01 AC pack) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-04 · FR-UC-BP-PAY-04 · BR-BP-SPL-01 · BR-BP-SPL-02 (peer PAY-05 footer) · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md (must_keep PAY01 · F-PAY-ATT-CLOSED-01)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md (must_keep PAY02 · process order · gd1_eval_v1 C-SLICE)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-04
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-SPLIT-01 · F-PAY-PROCESS-01 step (4)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5.6 pay_payslip · §5.8 pay_payslip_split_segment · DV-13/DV-14
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-qc-01.md (PAY02QC1-MSMC4GWC1 · must_keep PAY01+ATT11/12)
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + full ATT peer chain · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md
  - AC O1–O18 from SA §4.1 · mint J-HRM-PAY-04-* DRAFT (detect mid-period change · N segments · one Net · no double GTCG · HRM-PAY-SPLIT-409 FAIL path · preview segments display-ready · regression J-HRM-PAY-01-* + J-HRM-PAY-02-05..07 + J-HRM-ATT-12-07 + J-HRM-ATT-07-03..05 + J-HRM-ATT-06-04)
  - Footer: ≠ PAY-04 / FR-UC-BP-PAY-04 module DONE · ≠ payroll_e2e_ready · ≠ PAY module UAT · BR-BP-SPL-02 ceiling detail = PAY-05 HOLD · GTCG dependents = PAY-03 HOLD · DENY two payslips · DENY FE net merge · DENY hardcode day 15 · DENY merge buckets · DENY att_leave_hold · DENY reopen sealed PAY-01/02/ATT without regression bus
  - ack_status PASS_TO_PM · next ba-data DATA-01 if migration closable
cấm: honesty flip · seed · claim API pointer alone = DONE · apps/**
```
