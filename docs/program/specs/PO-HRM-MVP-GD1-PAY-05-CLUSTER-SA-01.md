# PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01 — Option/F.1 · Trần BH trên tổng hợp kỳ — RETAIN rate CFG + gap ceiling consumer (bind PAY-03 GTCG chain)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PAY-01/02/03/04 + ATT peer seals · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → **ba-data** DATA-01 → **sa** API-01 F.1 → Dev/BE+FE residual → QA → QC · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-40 UC-BP-PAY-03 **SEALED** — stamp **`PAY03QC1-MSMDDGWC1`** · QA **`PAY03QA1-MSMDDHP3`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-03-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **`payroll_e2e_ready=false`** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-05` · `FR-UC-BP-PAY-05` · **BR-BP-SPL-02** · partner **REQ_L_003** · **REQ_L_004** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#46** after PAY-03 (#45 SEALED GWC) · PAY-06..09 **QUEUED** |
| **ref_pay01** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) · QC **`PAY01QC1-MSMBGWC1`** · **F-PAY-ATT-CLOSED-01** |
| **ref_pay02** | [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md) · QC **`PAY02QC1-MSMC4GWC1`** · **gd1_eval_v1** · `is_insurance_base` on salary components |
| **ref_pay03** | [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md) · [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md) · QC **`PAY03QC1-MSMDDGWC1`** · **F-PAY-GTCG-01** · **static merge peer chain** (see §4.2) |
| **ref_pay04** | [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md) · QC **`PAY04QC1-MSMCR4GWC1`** · **F-PAY-SPLIT-01** merge · **DV-14** · **HRM-PAY-SPLIT-409** (static family incl. `SI_`/`BH_`) |
| **ref_core10** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md) · **F-CORE-SI-01/02/03** · `employee_insurances` + append **`hrm_insurance_rate_period`** · enrollment **≠** rate master |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-05** · Diễn biến **#1–#2 + Thành công** · trường hợp đặc biệt «Vào giữa tháng» · cross **FR-UC-BP-PAY-04** (static vars một lần trên tổng hợp) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P2/P6** · **F-PAY-PROCESS-01** · **F-PAY-SPLIT-01** · `pay_insurance_rate_cfg` CFG pillar |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PROCESS-01** (snapshot `pay_insurance_rate_cfg` ceiling) · **F-PAY-SPLIT-01** · **F-SET-SI-01..03** (`/settings/insurance-rate-cfg`) |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§5.4** `pay_insurance_rate_cfg.ceiling_amount` · **§5.6** `pay_payslip.si_employee_amount` / `si_employer_amount` · **§5.8** + **DV-14** (no `si_*` on segment) |
| **ref_matrix** | `UC_BR_MATRIX_DEPTH.md` UC-BP-PAY-05 · **MISSING** edge · REQ_L_003 · REQ_L_004 |
| **ref_code** | **read-only cite (2026-08-10):** **`pay_insurance_rate_cfg` LIVE** — `InsuranceRateCfgService` + `pickActiveRateForPeriod` → **`HRM-SET-SI-412-MISSING`** when no active rate · **`ceiling_amount`** column on CFG · **PAY process SI ceiling consumer ABSENT** (no consolidated-base + cap math on `processPayrollPeriod` path) · **PAY-04 LIVE** — `PAY_SPLIT_STATIC_COMPONENT_PREFIXES` includes `SI_`/`BH_`/`BHXH`… + **HRM-PAY-SPLIT-409** · **PAY-03 GTCG** bag/header per sealed API-01 contract (**may be partial LIVE** post BE-01 — **bind** static plane, not claim PAY-03 module UAT). **≠ claim CFG CRUD = PAY-05 DONE**. |
| **OUT** | Trần BH **từng đoạn** rồi cộng · FE tính trần/net BH · cột trần nhập tay trên lưới kỳ lương · second rate master table in payroll · claim Settings SI CFG alone = FR-PAY-05 DONE · full PAY-06 hire→payslip e2e in this seat · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01/02/03/04 seals · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-05 / PAY module UAT** · **≠** full statutory TNCN run (**PAY-06** peer) · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-41 architecture unlock: **trần bảo hiểm một lần trên tổng hợp kỳ** (FR-UC-BP-PAY-05 · BR-BP-SPL-02) vs AS-IS (rate CFG LIVE · ceiling math ABSENT on process) — **gap-only** under U89 · **bind PAY-04 merge + PAY-03 GTCG static chain** |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-03 QC-01 GWC (`PAY03QC1-MSMDDGWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-05 · BR-BP-SPL-02 · REQ_L_003 · REQ_L_004 · F-PAY-SPLIT-01 · F-PAY-GTCG-01 (peer PAY-03) · must_keep PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1 · ≠ payroll_e2e LIVE · ≠ reopen sealed journeys |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **Settings/PAY CFG SEALED pattern:** **`public.pay_insurance_rate_cfg`** LIVE — `employee_rate_pct` / `employer_rate_pct` / **`ceiling_amount`** · admin **`/api/hrm/settings/insurance-rate-cfg`** · **`pickActiveRateForPeriod`** → **412** if missing active version (**V-13**). **CORE-10 SEALED:** **`employee_insurances`** + append **`hrm_insurance_rate_period`** — enrollment timeline **≠** master % (DATA_OWNERSHIP §9.6). **PAY-01/02/04/03 SEALED (must_keep):** closed sheet · formula process · **F-PAY-SPLIT-01** merge one Net · **DV-14** static on header only · **HRM-PAY-SPLIT-409** guards duplicate static lines (prefixes include **GTCG** + **SI_/BH_**). **PAY-03 SEALED:** **F-PAY-GTCG-01** contract — `dependents_count` + `gtgc_amount_vnd` consumer · static GTCG **once** post-merge (**bind** this seat). **SI ceiling consumer (ABSENT):** Process path does **not** compute **consolidated insurance contribution base** after segment merge · does **not** apply **`min(base, ceiling_amount)` once per period** per `insurance_type_key` · header **`si_employee_amount` / `si_employer_amount`** paper cols remain **HOLD waiver** (deduction lines C-SLICE). **Risk if ignored:** Split-month applies cap **per segment** → violates BR-BP-SPL-02 + SRS «Cấm mỗi đoạn tự áp trần rồi cộng» · double-count with GTCG static plane · false PAY UAT. |
| **Paper target** | FR-UC-BP-PAY-05: (1) Gộp thu nhập kỳ (sau split nếu có); (2) Áp **trần BH một lần** trên tổng hợp; (3) **Không** áp trần hai lần từng đoạn; (4) Mid-month hire: tỷ lệ ngày + trần theo CFG. BR-BP-SPL-02. REQ_L_004: merge đủ · trần **THIẾU** until this seat closes architecture. |
| **Gap class** | **GĐ1 continuous SI ceiling consumer** on LIVE **`pay_insurance_rate_cfg`** + sealed **PAY-04** merge — **not** reinvent rate CFG CRUD; **not** claim enrollment CRUD = PAY-05 DONE; **bind** **PAY-03** static merge ordering; **not** flip `payroll_e2e_ready`. |
| **Constraints** | U89 · preserve **PAY01QC1** + **PAY02QC1** + **PAY03QC1** + **PAY04QC1** + **ATT12QC1** + **ATT11QC1** + ATT peer chain · Nest `/core` DENY as second rate SoT · C-SLICE · DENY seed · gap-only · DENY merge buckets · DENY `att_leave_hold` · DENY reopen **J-HRM-PAY-01-*** / **J-HRM-PAY-02-*** / **J-HRM-PAY-03-*** / **J-HRM-PAY-04-*** without regression bus |
| **Failure impact if unresolved** | Board #46 stalls; REQ_L_004 trần edge stays MISSING; per-segment ceiling in split hires; regression PAY-04 409 semantics; false PAY UAT |

### 1.2 Architecture diagram (target — Option A)

```text
  Settings LIVE: pay_insurance_rate_cfg (% + ceiling_amount) · pickActiveRateForPeriod · SI-412
  CORE-10 SEALED: employee_insurances + hrm_insurance_rate_period (enrollment ≠ rate master)
  PAY-01/02 SEALED: closed sheet · gd1_eval_v1 · is_insurance_base on components
  PAY-04 SEALED: F-PAY-SPLIT-01 merge · one Net · DV-14 · HRM-PAY-SPLIT-409 (GTCG + SI static family)
  PAY-03 SEALED: F-PAY-GTCG-01 → dependents_count · gtgc_amount_vnd ONCE post-merge (peer chain)
       │
       ▼
  ┌──────────── FR-UC-BP-PAY-05 (this seat — F-PAY-SI-CEILING-01 GAP inside process) ──┐
  │                                                                                      │
  │  RETAIN (cite — ≠ PAY-05 DONE alone)                                                 │
  │    F-SET-SI-01..03 CRUD + pay_insurance_rate_cfg physical SoT                        │
  │    pickActiveRateForPeriod(period) · snapshot rate version id on process/payslip     │
  │    PAY-04 merge: sum segment_gross → consolidated period income / insurance base   │
  │    PAY-03 peer: GTCG static applied same merge plane (before/after order §4.2)       │
  │                                                                                      │
  │  NEW consumer (GAP — unlock BA → DATA → API → Dev)                                   │
  │    R-PAY-05-BASE      : insurance contribution base from merged gross + components   │
  │    R-PAY-05-CEILING   : per type min(base, ceiling_amount) ONCE on consolidated      │
  │    R-PAY-05-RATE      : active CFG per insurance_type_key · no silent 0% (V-13)      │
  │    R-PAY-05-COMPUTE   : si_employee_amount · si_employer_amount on header once       │
  │    R-PAY-05-MID-MONTH : pro-rate days + still one ceiling on period total (SRS §)    │
  │    R-PAY-05-SPLIT-BIND: cấm si_* on segment · 409 if static SI duplicated segments   │
  │    R-PAY-05-GTCG-CHAIN: bind PAY-03 static vars — no reorder that double-applies     │
  │    R-PAY-05-DENY-UI   : cấm manual ceiling override on payroll grid                  │
  │    R-PAY-05-JOURNEY   : mint J-HRM-PAY-05-* DRAFT + regression PAY-03/04 split       │
  │                                                                                      │
  │  HOLD / peer (footer — not blocking SA lock)                                           │
  │    Full period run orchestration depth = PAY-06                                        │
  │    Termination SI cutoff detail = PAY-07                                               │
  │    Progressive TNCN brackets beyond formula C-SLICE = PAY-06                         │
  └──────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  Ceiling per segment then sum          = DENY (BR-BP-SPL-02 FAIL)
  FE computes trần / si_*               = DENY (OS 28 · BE SoT)
  Manual ceiling on payroll period grid = DENY
  Second rate master in PAY module      = DENY (CFG SoT = pay_insurance_rate_cfg)
  Claim Settings SI CRUD = PAY-05 DONE  = DENY
  Flip payroll_e2e_ready / PAY UAT      = DENY
  Wipe PAY01/02/03/04 / ATT11/12        = DENY
  C-SLICE ≠ module PAY UAT

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Trần BH trên tổng hợp kỳ» GĐ1 = **consumer** of **`pay_insurance_rate_cfg.ceiling_amount`** inside **F-PAY-PROCESS-01** after **F-PAY-SPLIT-01** merge (if any) — **one** cap application on consolidated base · **not** Settings CRUD DONE alone; **not** enrollment timeline DONE alone; **C-SLICE**.  
**Spine lock:** Master % + trần = **`pay_insurance_rate_cfg`** only — **`hrm_insurance_rate_period`** links enrollment to picked CFG · **DENY** payroll-owned duplicate rate table.  
**Split lock:** **must_keep PAY04QC1** — `si_*` **forbidden** on `payroll_payslip_split_segments` · **HRM-PAY-SPLIT-409** if evaluator emits per-segment SI static lines.  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **≠** FR-UC-BP-PAY-05 module DONE from architecture doc alone.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / TechSpec / API / DB) | AS-IS LIVE | Verdict |
|------------|-----------------------------------|------------|---------|
| Rate CFG CRUD + ceiling col | §5.4 · F-SET-SI-01..03 | `pay_insurance_rate_cfg` LIVE | **must_keep RETAIN** |
| pickActiveRateForPeriod | API process cite | LIVE → **412** if missing | **RETAIN cite** |
| Enrollment timeline | CORE-10 · `hrm_insurance_rate_period` | LIVE append-only | **RETAIN cite** · **≠** rate SoT |
| Consolidated period income | FR-PAY-05 #1 · PAY-04 merge | split merge partial LIVE | **must_keep RETAIN** · **GAP** insurance base |
| Ceiling once on consolidated | BR-BP-SPL-02 · Diễn biến #2 | **ABSENT** in process | **GAP** R-PAY-05-CEILING |
| `si_*` on payslip header | DB §5.6 | waiver → lines | **GAP** R-PAY-05-HEADER · DATA optional |
| No ceiling per segment | DV-14 · SRS cấm | 409 prefixes incl. SI | **must_keep RETAIN** · **bind** PAY04 |
| GTCG once post-merge | PAY-03 sealed | consumer contract API-01 | **must_keep BIND** peer chain |
| Mid-month pro-rate + cap | SRS special | not proven | **GAP** R-PAY-05-MID-MONTH |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — RETAIN `pay_insurance_rate_cfg` + EXPAND F-PAY-SI-CEILING-01 inside F-PAY-PROCESS-01 (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** Settings **`pay_insurance_rate_cfg`** + **`pickActiveRateForPeriod`** + CORE enrollment peer. **EXPAND** internal **F-PAY-SI-CEILING-01** (logical sub-step of **F-PAY-PROCESS-01**, after **F-PAY-SPLIT-01** merge): compute **consolidated insurance base** → apply **`ceiling_amount` once** per active type → persist **`si_employee_amount` / `si_employer_amount`** once on header and/or **`SI*`/`BH*` lines** · snapshot CFG version on process · **BIND** **PAY-03** GTCG static chain (§4.2). **must_keep** PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1. **HOLD** full PAY-06 run e2e · progressive TNCN depth = **formula + PAY-06**. **≠ PAY-05 module UAT** · **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (base resolver + cap math + AC + split/GTCG bind) |
| **Risk** | Medium if base components wrong or cap applied per segment |
| **Pros** | Matches SRS/BR-BP-SPL-02/REQ_L_004 · preserves CFG LIVE · aligns PAY-04 DV-14 + PAY-03 static plane |
| **Cons** | Depends on `is_insurance_base` catalog fidelity · multi-type ceiling rules need BA AC |
| **Failure modes** | Per-segment cap · silent 0% · FE override · double static with GTCG |
| **Mitigation** | O1–O18 · regression PAY-03/04 · jest cap contracts |

### Option B — Per-segment ceiling then sum (REJECT)

| | |
|--|--|
| **Summary** | Each `pay_payslip_split_segment` runs `min(segment_base, ceiling)` then aggregate `si_*` |
| **Pros** | Mirrors naive spreadsheet |
| **Cons** | Violates BR-BP-SPL-02 · SRS «Cấm mỗi đoạn tự áp trần» · UC matrix FAIL edge · breaks PAY-04 one-static merge |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim `pay_insurance_rate_cfg` CRUD = FR-PAY-05 DONE (REJECT)

| | |
|--|--|
| **Summary** | Mark PAY-05 DONE because Settings BH rates exist; no process ceiling; flip honesty |
| **Pros** | Fast matrix green |
| **Cons** | Violates FR Diễn biến #2 · REQ_L_004 MISSING persists · C-SLICE lie |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (CFG + process cap) | B (per-segment cap) | C (HOLD/claim DONE) |
|-----------|-------:|----------------------:|--------------------:|--------------------:|
| Business value (FR-PAY-05) | 5 | **5** | 0 | 0 |
| Time to deliver | 4 | **4** | 3 | Fake PASS |
| Fit BR-BP-SPL-02 + PAY-04 merge | 5 | **5** | 0 | 1 |
| PAY-03 GTCG chain alignment | 5 | **5** | 0 | 0 |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Maintainability (ONE CFG SoT) | 5 | **5** | 0 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **RETAIN `pay_insurance_rate_cfg`** + **GAP F-PAY-SI-CEILING-01** inside **F-PAY-PROCESS-01**: consolidated base · ceiling once · `si_*` header/line once · CFG snapshot · **BIND PAY-03** GTCG static chain (§4.2); unlock **R-PAY-05-***; **RETAIN** PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1; **DENY** per-segment cap · FE SI SoT · manual grid override · claim CFG CRUD = DONE · `payroll_e2e_ready` flip · PAY module UAT · reopen sealed journeys · seed · apps/** |
| **Why selected** | SRS + DB already define CFG ceiling + header `si_*`; LIVE CFG + pick exists; gap is **process consumer on merged period total** aligned with sealed split + GTCG static rules |
| **Assumptions** | **PAY01–04 + PAY03** seals **RETAIN** · `pickActiveRateForPeriod` remains authoritative · `payroll_e2e_ready=false`. SI ceiling math **ABSENT** today — **expected** until Dev after BA/DATA/API. |
| **Rejected** | **B** — per-segment cap · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | CFG SoT | **`pay_insurance_rate_cfg`** only for % + `ceiling_amount` | AC cite §5.4 · V-13 |
| O2 | Enrollment peer | **`employee_insurances`** gates participation · **`hrm_insurance_rate_period`** append links snapshot · **≠** rewrite % | CORE-10 cite |
| O3 | Insurance base | Sum eligible **`is_insurance_base`** components on **merged** period gross (post-split) | AC-PAY-05-BASE |
| O4 | Ceiling apply | `contribution_base = min(merged_base, ceiling_amount)` **once** per `insurance_type_key` per NV per period | AC-PAY-05-CEILING |
| O5 | Multi-type | BHXH/BHYT/BHTN each pick active CFG · aggregate `si_employee_amount` / `si_employer_amount` on header | AC-PAY-05-MULTI |
| O6 | Missing rate | **412** `HRM-SET-SI-412-MISSING` · **cấm** silent 0% | V-13 · RETAIN |
| O7 | Process placement | After **F-PAY-SPLIT-01** merge · **after** **F-PAY-GTCG-01** bind (§4.2) · **must_keep** ATT-412 → FORMULA-412 | PAY02QC1 |
| O8 | Header vs line | GĐ1: `si_*` header **and/or** `SI*`/`BH*` component lines **once** — align DATA stamp | AC-PAY-05-HEADER |
| O9 | Split-month | **Cấm** `si_*` on segment rows · **409** if duplicate static SI lines | DV-14 · PAY04QC1 |
| O10 | Mid-month hire | Pro-rate **days** per SRS special · **still** one ceiling on period consolidated base | AC-PAY-05-MID |
| O11 | DENY manual UI | Payroll period/payslip mutate **rejects** body `ceiling_*` / `si_*` override fields | AC-PAY-05-DENY-MANUAL |
| O12 | Display-ready | Preview exposes `si_employee_amount`, `si_employer_amount`, picked `ceiling_amount` read-only (vi-VN money) | OS 28 |
| O13 | GTCG chain | Regression: split + GTCG update on profile → process shows **one** GTCG + **one** cap | AC-PAY-05-GTCG-CHAIN |
| O14 | Regression journeys | **DENY reopen** J-HRM-PAY-01-* · J-HRM-PAY-02-05..07 · J-HRM-PAY-03-* · J-HRM-PAY-04-05/06/08 | must_keep |
| O15 | must_keep stamps | PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + ATT12QC1 + ATT11QC1 | ≠ wipe |
| O16 | Honesty | Mint **J-HRM-PAY-05-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O17 | PAY-06 peer | Full «chạy kỳ» orchestration depth **HOLD** PAY-06 — this seat = ceiling consumer only | Footer |
| O18 | PAY-07 peer | Termination SI cutoff on final period **HOLD** PAY-07 | Footer |

### 4.2 Peer dependency — PAY-03 GTCG chain (BIND · mandatory)

| Link | Rule |
|------|------|
| **Static plane** | **GTCG** (`gtgc_amount` / `GTCG*` lines) and **SI** (`si_*` / `BH_*` lines) are both **monthly static** per **DV-14** · applied **only** after **F-PAY-SPLIT-01** merge to **one** `pay_payslip` header path. |
| **Order (SA default)** | (1) Sum **time-varying** per segment → consolidated gross/components · (2) **F-PAY-GTCG-01** resolve + persist GTCG once (**PAY03QC1**) · (3) **F-PAY-SI-CEILING-01** base + cap + `si_*` once (**this seat**) · (4) Formula/tax lines (**PAY-02** + **PAY-06** HOLD depth). BA may refine AC labels · **cấm** apply GTCG or SI **per segment row**. |
| **409 guard** | **must_keep PAY04QC1** — `PAY_SPLIT_STATIC_COMPONENT_PREFIXES` already lists **GTCG** + **SI_/BH_** · double static across segment evals → **HRM-PAY-SPLIT-409** (same guard for GTCG kép and trần kép). |
| **DATA waiver** | PAY-04 DATA **HOLD** header `si_*` cols · PAY-05 DATA may **ADD stamp** closable `si_employee_amount` / `si_employer_amount` on `payroll_payslips` (mirror `gtgc_amount` PAY-03 pattern) · until stamped, map via lines + **AC-PAY-05-DV-14**. |
| **REQ_L_003** | NPT/GTCG SoT = CORE (**PAY-03**) · trần SoT = CFG (**PAY-05**) — orthogonal masters · same **merge step** enforces «không trừ kép». |
| **Regression** | Any PAY-05 Dev wave **must** re-run **J-HRM-PAY-03-*** + **J-HRM-PAY-04-05/06/08** split static cases when PAY-03/04 consumers change. |

---

## 5. F.1 disposition (cluster lock · deepen = later API-01 seat)

| F-id | Physical / logical | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------|-------------|---------------|----------|
| **F-SET-SI-01..03** | `/settings/insurance-rate-cfg` | **must_keep RETAIN** | Master % + trần CFG | FR-PAY-05 input table |
| **F-PAY-SI-CEILING-01** (logical) | inside **F-PAY-PROCESS-01** | **GAP** unlock Dev | Base hợp nhất + áp trần một lần | Diễn biến **#1–#2** |
| **F-PAY-PROCESS-01** | `POST …/process` | **RETAIN** · **EXPAND** SI step | Orchestrator hosts ceiling | FR-PAY-05 · FR-PAY-06 peer |
| **F-PAY-SPLIT-01** (peer PAY-04) | merge step | **must_keep RETAIN** | Tổng hợp trước trần | FR-PAY-04 · **O9** |
| **F-PAY-GTCG-01** (peer PAY-03) | CB read / process | **must_keep BIND** | Static GTCG once · same plane | FR-PAY-03 · §4.2 |
| **F-PAY-FORMULA-EVAL** (peer PAY-02) | gd1_eval_v1 | **RETAIN cite** | Components `is_insurance_base` | FR-PAY-02 |
| **F-CORE-SI-01..03** (peer CORE-10) | enrollment APIs | **RETAIN cite** | Participant ≠ rate master | FR-CORE-10 |
| **`pay_payslip.si_*`** (DB) | header cols | **GAP** optional ALTER | Audit tĩnh BH | DB §5.6 · DATA stamp |

**DENY:** New public `POST /payroll/insurance-rate` CRUD GĐ1.  
**DENY:** FE PATCH payslip to set `si_*` or ceiling.  
**DENY:** Treat **F-SET-SI** existence as FR-PAY-05 module DONE.

**Display-ready cite for BA:** Process/preview `{ consolidated_insurance_base_vnd, ceiling_amount_vnd, si_employee_amount_vnd, si_employer_amount_vnd, rate_cfg_snapshot_id }` · errors **`HRM-SET-SI-412-MISSING`** · retain **`HRM-PAY-SPLIT-409`** when static SI duplicated (**PAY04**) · retain **`HRM-PAY-GTCG-403/412`** (**PAY03**) on manual override paths.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O18 + mint J-HRM-PAY-05-* DRAFT + regression PAY-03/04 split + GTCG chain (§4.2)
  → ba-data DATA-01 (closable: pay_payslip si_* header cols + DV-14 segment forbid re-assert)
  → sa API-01 F.1 deepen F-PAY-SI-CEILING-01 inside F-PAY-PROCESS-01 + bind F-PAY-GTCG-01 order
  → dev-be consolidated base + ceiling + si_* persist + deny manual + 409 bind
  → dev-fe read-only SI/ceiling on preview (no edit on payroll grid)
  → qa U65 J-HRM-PAY-05-* + regression J-HRM-PAY-03-* + J-HRM-PAY-04-05/06/08
  → qc GWC C-SLICE (≠ PAY-05 / PAY module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O18 AC + mint J-HRM-PAY-05-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data closable delta | ba-data | DATA-01 if `si_*` header migration |
| 4. sa API-01 F.1 LOCK | sa | API cluster spec |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 + regression PAY-03/04 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · **ba-data/API wave unlocked** · PAY01–04 + PAY03 + ATT stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-05 module DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Per-segment ceiling | AC / 409 | O4 · O9 · **REJECT B** |
| A | Double static with GTCG | 409 / AC | O13 · §4.2 |
| A | Silent 0% BH | Process output | O6 · V-13 |
| A | Manual ceiling on grid | API 403 | O11 |
| A | Wrong insurance base | Component audit | O3 · PAY-02 catalog |
| A | Skip merge before cap | PROCESS-AC | O7 · PAY04QC1 |
| A | Claim CFG CRUD = DONE | Evidence footer | O16 |
| A | Flip payroll_e2e_ready | Flag true | O16 DENY |
| A | Reopen PAY-03/04 seals | QA regression FAIL | O14 |
| B | Per-segment cap | BR-BP-SPL-02 | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** | RETAIN · closed-sheet · ATT-412 |
| **PAY02QC1-MSMC4GWC1** | RETAIN · formula · `is_insurance_base` |
| **PAY03QC1-MSMDDGWC1** | RETAIN · F-PAY-GTCG-01 · static once · **peer chain §4.2** |
| **PAY04QC1-MSMCR4GWC1** | RETAIN · merge · DV-14 · **HRM-PAY-SPLIT-409** |
| **ATT12QC1-MSMAIGWC1** | RETAIN |
| **ATT11QC1-MSLXTH9P** | RETAIN · close spine |
| **ATT10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| **BR-BP-SPL-02** | Trần **một lần** trên tổng hợp kỳ |
| **pay_insurance_rate_cfg** | RETAIN · **≠** PAY-05 DONE alone |
| Per-segment ceiling | **DENY** |
| FE SI / ceiling SoT | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| Honesty | **DENY** flip · U65 zero-seed |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-05: **RETAIN** `pay_insurance_rate_cfg` + `pickActiveRateForPeriod` + CORE enrollment peer; **GAP** **F-PAY-SI-CEILING-01** (consolidated base · ceiling once · `si_*` once · CFG snapshot · deny manual); **BIND** **PAY-03** GTCG static chain (§4.2) + **PAY-04** merge/DV-14/409; **R-PAY-05-***; **HOLD** PAY-06/07 depth; **must_keep** **PAY01QC1+PAY02QC1+PAY03QC1+PAY04QC1+ATT12QC1+ATT11QC1**; docs-only · no `apps/**`. |
| **next_owner** | **ba-data** (DATA-01) · **parallel** **ba-process** BA-01 AC |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01
role: ba-data
lane: governance · UC-BP-PAY-05 · FR-UC-BP-PAY-05 · BR-BP-SPL-02 · Option A CONFIRMED · bind PAY-03 GTCG chain §4.2
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md (DV-14 · si_* HOLD waiver pattern)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md (gtgc header stamp pattern · peer static plane)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5.4 pay_insurance_rate_cfg · §5.6 pay_payslip si_* · §5.8 segment forbid si_*
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md
  - CONFIRMED ADD/HOLD stamp: optional closable payroll_payslips.si_employee_amount / si_employer_amount (mirror PAY-03 gtgc pattern) · re-assert segment table FORBIDS si_* (DV-14) · RETAIN pay_insurance_rate_cfg.ceiling_amount LIVE · RETAIN hrm_insurance_rate_period peer only
  - Unlock sa PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01 F.1
  - Footer: ≠ PAY-05 module DONE · ≠ payroll_e2e_ready · DENY per-segment si_* · BIND PAY-03 static order §4.2 · no seed · no apps/**
  - ack_status PASS_TO_PM · next sa API-01 (parallel ba-process BA-01 AC if not started)
cấm: honesty flip · seed · invent second rate table · wipe PAY seals · apps/**
```
