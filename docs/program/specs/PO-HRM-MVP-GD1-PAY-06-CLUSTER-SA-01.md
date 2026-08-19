# PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01 — Option/F.1 · Chạy kỳ lương + TNCN lũy tiến — RETAIN PAY-01..05 process order · gap run + tax consumer (HOLD tax depth BA)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PAY-01..05 + ATT peer seals · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → **ba-data** DATA-01 → **sa** API-01 F.1 → Dev/BE+FE residual → QA → QC · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-41 UC-BP-PAY-05 **SEALED** — stamp **`PAY05QC1-MSMDU2GWC1`** · QA **`PAY05QA1-MSMDU2I5`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **`payroll_e2e_ready=false`** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-06` · `FR-UC-BP-PAY-06` · **BR-BP-LC-04** · **BR-BP-TS-03** · partner **REQ_L_001** |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#47** after PAY-05 (#46 SEALED GWC) · PAY-07..09 **QUEUED** |
| **ref_pay01** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) · QC **`PAY01QC1-MSMBGWC1`** · **F-PAY-ATT-CLOSED-01** · eligibility **`NO_CLOSED_SHEET`** |
| **ref_pay02** | [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md) · QC **`PAY02QC1-MSMC4GWC1`** · **gd1_eval_v1** · **`THUE_TNCN_HT`** catalog starter · published formula bind |
| **ref_pay03** | [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md) · QC **`PAY03QC1-MSMDDGWC1`** · **F-PAY-GTCG-01** · static once post-merge |
| **ref_pay04** | [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md) · QC **`PAY04QC1-MSMCR4GWC1`** · **F-PAY-SPLIT-01** · **DV-14** · **HRM-PAY-SPLIT-409** |
| **ref_pay05** | [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md) · [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md) · QC **`PAY05QC1-MSMDU2GWC1`** · **F-PAY-SI-CEILING-01** · normative **PAY-01..05 process order** §4.2 |
| **ref_settings_tax** | [`PO-HRM-SETTINGS-DEFAULTS-DATA-01.md`](./PO-HRM-SETTINGS-DEFAULTS-DATA-01.md) · **`pay_tax_regime`** (`progressive_vn`) · **`pay_tax_personal_deduction`** · **`pay_tax_dependent_deduction`** · **F-SET-TAX-01** — **regime hint ≠ full engine** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-06** · Diễn biến **#1–#7 + FAIL + Thành công** · **AC-PAY-HIRE-01..05** · trường hợp đặc biệt «Hire giữa tháng» → **PAY-04** peer |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P2/P6** · **F-PAY-PROCESS-01** orchestrator · biến tĩnh tháng TNCN/GTCG/trần **một lần** trên tổng hợp |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PROCESS-01** · **`POST …/payroll/periods/{id}/enroll`** · **`POST …/process`** · header `tax_amount` / `net` / `gross` |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_payslip.tax_amount`** (TNCN một lần trên gộp) · DATA-05 **HOLD waiver** until this wave DATA stamp |
| **ref_matrix** | `UC_BR_MATRIX_DEPTH.md` UC-BP-PAY-06 · **PARTIAL** · REQ_L_001 |
| **ref_code** | **read-only cite (2026-08-10):** **`enrollPayrollPeriod`** LIVE — `POST /api/hrm/payroll/periods/{id}/enroll` · **`loadPayrollEligibility`** LIVE · **`processPayrollPeriod`** LIVE — auto-upsert payslips for eligible when count=0 · **`assertNoPayGtgcOverrideInBody`** / **`assertNoPaySiOverrideInBody`** · **F-PAY-SI-CEILING** resolver **partial LIVE** (PAY-05 GWC) · **`SettingsTaxParamsService`** + **`pay_tax_*`** KV LIVE · **`THUE_TNCN_HT`** starter component · **progressive TNCN engine on process path ABSENT** (no consolidated `tax_amount` once · no bracket consumer) · **≠ claim enroll/process stub = FR-PAY-06 DONE**. |
| **OUT** | FE tự tính net/TNCN · nhập tay `tax_amount` trên lưới kỳ · second tax bracket master in payroll module (duplicate Settings) · claim enroll alone = PAY-06 DONE · full statutory Luật TNCN + YTD ledger GĐ1 · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01..05 seals · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-06 / PAY module UAT** · **≠** full hire→payslip browser e2e (**J-HRM-PAY-05-02** residual HOLD carries) · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-42 architecture unlock: **chạy kỳ lương khi NV Hoạt động + bảng công chốt** + **TNCN lũy tiến orchestration** (FR-UC-BP-PAY-06 · BR-BP-LC-04) vs AS-IS (enroll/process LIVE · progressive tax consumer ABSENT) — **gap-only** under U89 · **RETAIN PAY-01..05 normative process order** |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-05 QC-01 GWC (`PAY05QC1-MSMDU2GWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-06 · BR-BP-LC-04 · BR-BP-TS-03 · REQ_L_001 · AC-PAY-HIRE-01..05 · F-PAY-PROCESS-01 · F-PAY-TNCN-01 (logical GAP) · must_keep PAY01QC1..PAY05QC1 + ATT12QC1 + ATT11QC1 · ≠ payroll_e2e LIVE · ≠ reopen sealed journeys |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **PAY-01..05 SEALED (must_keep):** closed sheet gate · formula publish + **gd1_eval_v1** · GTCG once · split merge · SI ceiling consumer (GWC slice — may be partial FE/browser). **PAY-06 surfaces LIVE (cite — ≠ DONE):** (1) **`GET` eligibility** — `eligible` / `reasons[]` incl. **`NO_CLOSED_SHEET`**. (2) **`POST …/periods/{id}/enroll`** — draft period only · eligible filter · **`HRM-PAY-ENROLL-EMPTY`**. (3) **`POST …/process`** — **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`** · auto-create payslip rows for eligible when none exist · pipeline steps per PAY-05 API order (split → GTCG → SI GAP/partial). **ABSENT / residual:** Full **AC-PAY-HIRE-04/05** FE-after-2xx + F5 browser matrix · **`tax_amount`** header persist **once** on consolidated period income · **F-PAY-TNCN-01** progressive engine (taxable income bag → bracket apply → `THUE_TNCN_HT` / header) · period **lock** depth (**PAY-08** peer) · **`payroll_e2e_ready`**. **Risk if ignored:** Sponsor sees «chạy đợt» without honest empty reasons · FE computes net/TNCN · double static tax per split segment · false PAY UAT / honesty flip. |
| **Paper target** | FR-UC-BP-PAY-06: C&B **Lương** → kỳ nháp → tiên quyết PAY-01/02 → **đưa NV / chạy đợt** → danh sách phiếu cập nhật ngay + F5 còn · hệ thống chạy công thức (không FE net) · biến tĩnh tháng **TNCN một lần** trên tổng hợp (SRS cross PAY-04/05). AC-PAY-HIRE-01..05. BR-BP-LC-04. |
| **Gap class** | **GĐ1 continuous run orchestration AC + TNCN consumer** on LIVE **F-PAY-PROCESS-01** — **RETAIN** enroll/process/eligibility · **not** reinvent PAY-01..05 steps · **HOLD** full statutory tax depth where **BA** confirms (bracket admin matrix · YTD · luật ngoài C-SLICE) · **not** flip `payroll_e2e_ready`. |
| **Constraints** | U89 · preserve **PAY01QC1..PAY05QC1** + **ATT12QC1** + **ATT11QC1** + ATT peer chain · Nest `/core` DENY as payroll SoT · C-SLICE · DENY seed · gap-only · DENY merge buckets · DENY `att_leave_hold` · DENY reopen **J-HRM-PAY-01..05-*** without regression bus |
| **Failure impact if unresolved** | Board #47 stalls; REQ_L_001 PARTIAL persists; hire→kỳ UX false success; per-segment TNCN; regression PAY-03/04/05 static plane |

### 1.2 Architecture diagram (target — Option A)

```text
  PAY-01 SEALED: closed sheet · HRM-PAY-ATT-412 · eligibility reasons
  PAY-02 SEALED: published formula · gd1_eval_v1 · THUE_TNCN_HT catalog · COMP-01
  PAY-03 SEALED: F-PAY-GTCG-01 once post-merge
  PAY-04 SEALED: F-PAY-SPLIT-01 merge · DV-14 · HRM-PAY-SPLIT-409
  PAY-05 SEALED: F-PAY-SI-CEILING-01 after GTCG · si_* once (GWC slice)
  Settings LIVE: pay_tax_* KV (regime hint) · pay_insurance_rate_cfg peer
       │
       ▼
  ┌──────────── FR-UC-BP-PAY-06 (this seat — RUN + TNCN GAP inside process) ─────┐
  │                                                                               │
  │  RETAIN (cite — ≠ PAY-06 DONE alone)                                          │
  │    POST …/periods/{id}/enroll · draft-only · eligible filter                  │
  │    GET eligibility · AC-PAY-HIRE-01 reasons (NO_CLOSED_SHEET, …)              │
  │    POST …/process · F-PAY-PROCESS-01 orchestrator host                        │
  │    Normative order PAY-01..05 (§4.2) — ATT-412 → … → SI ceiling → …           │
  │    assertNoPayGtgcOverrideInBody · assertNoPaySiOverrideInBody (extend tax)   │
  │                                                                               │
  │  NEW consumer / AC (GAP — unlock BA → DATA → API → Dev)                       │
  │    R-PAY-06-RUN       : AC-PAY-HIRE-02/04/05 enroll+process FE persistence    │
  │    R-PAY-06-ENROLL-AC : đưa NV / chạy đợt · empty có lý do · không success giả │
  │    R-PAY-06-TAX-BAG   : taxable income inputs (gross − GTCG − SI − flags)       │
  │    R-PAY-06-TNCN      : F-PAY-TNCN-01 progressive apply ONCE on consolidated    │
  │    R-PAY-06-HEADER    : tax_amount once on header · THUE_TNCN_HT line once      │
  │    R-PAY-06-SPLIT-BIND: cấm tax_amount per segment · 409 static tax duplicate │
  │    R-PAY-06-SETTINGS  : read pay_tax_regime + deduction KV · 412 if missing     │
  │    R-PAY-06-DENY-UI   : cấm manual tax_amount / net override on payroll grid    │
  │    R-PAY-06-JOURNEY   : mint J-HRM-PAY-06-* DRAFT + regression PAY-01..05      │
  │                                                                               │
  │  HOLD / peer (footer — BA depth lock)                                           │
  │    Full bracket matrix CRUD admin · YTD cumulative ledger · 13th month        │
  │    Period lock / preview polish = PAY-08                                        │
  │    Termination final period = PAY-07                                            │
  │    Mid-hire pro-rate tax edge beyond formula C-SLICE = BA O-series              │
  └───────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  FE computes net / TNCN                    = DENY (OS 28 · AC-PAY-HIRE luồng)
  tax per segment then sum                  = DENY (static monthly once · DV-14 peer)
  Manual tax_amount on period grid          = DENY
  Claim enroll API alone = PAY-06 DONE      = DENY
  Flip payroll_e2e_ready / PAY UAT        = DENY
  Wipe PAY01..05                            = DENY
  C-SLICE ≠ module PAY UAT

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Tính lương kỳ + TNCN lũy tiến» GĐ1 = **RETAIN** LIVE enroll/eligibility/process spine + **GAP** **F-PAY-RUN-01** (hire AC) + **F-PAY-TNCN-01** (progressive consumer **once** on merged period) **inside** **F-PAY-PROCESS-01** **after** **F-PAY-SI-CEILING-01** · **before** final **gd1_eval_v1** net reconciliation per BA AC · **not** enroll stub DONE alone; **C-SLICE**.  
**Order lock:** **must_keep** normative steps **PAY-01..05** per [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md) §4 — **cấm** insert TNCN before GTCG/SI static plane · **cấm** reorder ATT-412 / FORMULA-412.  
**Tax depth lock:** Settings **`pay_tax_*`** = **parameters** (regime + mức giảm trừ) · **HOLD** full Luật bracket table / YTD / ngoài C-SLICE until **BA** closes **O19–O22** — SA does **not** invent statutory tables in this seat.  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **≠** FR-UC-BP-PAY-06 module DONE from architecture doc alone.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Eligibility + reasons | AC-PAY-HIRE-01 · PAY-01 | `loadPayrollEligibility` LIVE | **must_keep RETAIN** |
| Enroll / chạy đợt API | Diễn biến #4 · AC-PAY-HIRE-02 | `POST …/enroll` LIVE | **RETAIN cite** · **GAP** FE AC 04/05 |
| Process orchestrator | F-PAY-PROCESS-01 | `processPayrollPeriod` LIVE | **must_keep RETAIN** · **BIND** PAY-05 order |
| Auto payslip on first process | AC-PAY-HIRE-01 | upsert when count=0 LIVE | **RETAIN cite** |
| GTCG / split / SI steps | PAY-03/04/05 sealed | partial LIVE | **must_keep BIND** |
| `pay_tax_regime` + deductions KV | F-SET-TAX-01 | Settings LIVE | **RETAIN cite** · **≠** engine |
| Progressive TNCN compute | FR-PAY-06 · SRS biến tĩnh tháng | **ABSENT** | **GAP** F-PAY-TNCN-01 |
| `tax_amount` header once | DB `pay_payslip.tax_amount` | waiver / absent writer | **GAP** R-PAY-06-HEADER |
| No TNCN per segment | DV-14 static family | 409 prefixes peer | **must_keep BIND** PAY04 |
| Period lock / preview | Diễn biến #7 | partial | **HOLD** PAY-08 |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — RETAIN F-PAY-PROCESS-01 + PAY-01..05 order · EXPAND F-PAY-RUN-01 + F-PAY-TNCN-01 inside process (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** enroll · eligibility · **`processPayrollPeriod`** · sealed **PAY-01..05** pipeline order. **EXPAND** **F-PAY-RUN-01** (logical): AC pack **AC-PAY-HIRE-01..05** + journeys. **EXPAND** **F-PAY-TNCN-01** (logical sub-step **after** **F-PAY-SI-CEILING-01**): build taxable income bag from merged components + Settings **`pay_tax_*`** → apply **progressive_vn** C-SLICE brackets (BA-owned table or formula line — **HOLD depth O19–O22**) → persist **`tax_amount`** once on header + **`THUE_TNCN_HT`** line once · deny manual overrides. **must_keep** PAY01QC1..PAY05QC1. **HOLD** PAY-07/08 · full YTD · **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | High (run FE AC + tax bag + static bind) |
| **Risk** | High if tax before SI/GTCG or per-segment |
| **Pros** | Matches FR-UC-BP-PAY-06 + REQ_L_001 · preserves PAY-05 order · honest C-SLICE |
| **Cons** | Statutory depth needs BA bracket decision · depends on PAY-05 SI LIVE fidelity |
| **Failure modes** | FE net · fake enroll success · double TNCN with GTCG/SI |
| **Mitigation** | O1–O22 · regression PAY-01..05 · U65 hire journeys |

### Option B — FE progressive tax + BE only stores lines (REJECT)

| | |
|--|--|
| **Summary** | UI calculates TNCN/net; BE accepts posted `tax_amount` |
| **Pros** | Fast spreadsheet parity |
| **Cons** | Violates FR Diễn biến #3–#5 · AC-PAY-HIRE · OS 28 · split-month static rules |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim enroll+process stub = FR-PAY-06 DONE (REJECT)

| | |
|--|--|
| **Summary** | Mark PAY-06 DONE because APIs exist; no TNCN consumer; flip honesty |
| **Pros** | Fast matrix green |
| **Cons** | REQ_L_001 PARTIAL · UC matrix FAIL · C-SLICE lie |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (process + tax GAP) | B (FE tax) | C (HOLD/claim DONE) |
|-----------|-------:|----------------------:|-----------:|--------------------:|
| Business value (FR-PAY-06) | 5 | **5** | 1 | 0 |
| PAY-01..05 order fidelity | 5 | **5** | 0 | 1 |
| Time to deliver | 4 | **3** | 4 | Fake PASS |
| Security / scope U19 | 4 | **5** | 1 | Honesty breach |
| Maintainability (ONE process SoT) | 5 | **5** | 0 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..05 normative order** (§4.2); **GAP** **F-PAY-RUN-01** + **F-PAY-TNCN-01** inside process after SI ceiling; **BIND** static monthly plane (GTCG + SI + TNCN once); unlock **R-PAY-06-***; **HOLD** tax statutory depth **O19–O22** for **BA**; **DENY** FE tax/net SoT · manual grid tax · enroll alone DONE · `payroll_e2e_ready` flip · PAY module UAT · wipe seals · seed · apps/** |
| **Why selected** | SRS + API already anchor run on **F-PAY-PROCESS-01**; LIVE enroll/process exist; gap is **hire AC + progressive consumer once** aligned with sealed PAY-03/04/05 static rules |
| **Assumptions** | **PAY01..05** seals **RETAIN** · PAY-05 SI consumer path stable enough to precede tax · `payroll_e2e_ready=false`. TNCN math **ABSENT** today — expected until Dev after BA/DATA/API. |
| **Rejected** | **B** — FE tax · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Run SoT | **`F-PAY-PROCESS-01`** single orchestrator — enroll is **separate** `POST …/enroll` then process | AC cite FR-PAY-06 #4–#5 |
| O2 | Hire eligibility | NV **Hoạt động** đúng pháp nhân · hire giữa tháng → **PAY-04** split peer | AC-PAY-HIRE-01 |
| O3 | Empty list honesty | Trống phải có **lý do** (`NO_CLOSED_SHEET`, `NO_FORMULA`, …) — không im lặng | AC-PAY-HIRE-01/04 |
| O4 | Success integrity | **Cấm** toast success khi API không persist payslip/enroll | AC-PAY-HIRE-02 |
| O5 | FE after 2xx | Lưới phiếu cập nhật ngay · F5 còn phiếu | AC-PAY-HIRE-04/05 · U65 |
| O6 | Period overlap | Kỳ không chồng · locked kỳ từ chối mutate | AC-PAY-HIRE-03 |
| O7 | Process placement | **must_keep PAY-05 API order** §4.2 — TNCN **after** SI ceiling · **before** final net eval per AC | AC-PAY-06-PROCESS-ORDER |
| O8 | Taxable income bag | Merged gross/components − **GTCG** − **SI** employee (display-ready fields) ± flags **`pay_tax_*`** | AC-PAY-06-TAX-BAG |
| O9 | Regime | Read **`pay_tax_regime.code=progressive_vn`** · missing → **412** **`HRM-SET-TAX-412-MISSING`** (align F-SET-TAX-01) | AC-PAY-06-REGIME |
| O10 | Personal / dependent deduction | Use Settings KV **`pay_tax_personal_deduction`** · **`pay_tax_dependent_deduction`** × **`dependents_count`** (**PAY-03**) | AC-PAY-06-DEDUCT |
| O11 | Progressive apply | **`tax_amount`** + **`THUE_TNCN_HT`** line **once** on header path — **cấm** per-segment | AC-PAY-06-TNCN-ONCE |
| O12 | Header vs line | GĐ1: **`tax_amount`** header **and/or** **`THUE_TNCN_HT`** line — align DATA stamp | AC-PAY-06-HEADER |
| O13 | Split bind | **409** if static tax duplicated on segments (**extend** `PAY_SPLIT_STATIC_COMPONENT_PREFIXES` family if needed) | AC-PAY-06-SPLIT · PAY04QC1 |
| O14 | DENY manual UI | Process/enroll body rejects `tax_amount`, `net_amount`, `manual_tax_*` overrides | AC-PAY-06-DENY-MANUAL |
| O15 | Display-ready | Preview exposes `tax_amount_vnd`, regime snapshot, deduction breakdown read-only (vi-VN money) | OS 28 |
| O16 | Regression | **DENY reopen** J-HRM-PAY-01..05 sealed paths without bus | must_keep |
| O17 | must_keep stamps | PAY01QC1..PAY05QC1 + ATT12QC1 + ATT11QC1 | ≠ wipe |
| O18 | Honesty | Mint **J-HRM-PAY-06-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O19 | **Bracket source (HOLD depth)** | **SA default:** C-SLICE = **fixed statutory ladder** in BE constants **or** single published formula line — **not** both SoT | **BA CONFIRM** — no SA invent full Luật |
| O20 | **YTD / cumulative (HOLD)** | **HOLD** — monthly period run only GĐ1 | **BA CONFIRM** footer |
| O21 | **13th month / bonus (HOLD)** | **HOLD** PAY-09 peer | Footer |
| O22 | **Mid-hire tax pro-rate (HOLD)** | Split gross via PAY-04 · tax still **once** on merged — edge AC deferred | **BA CONFIRM** · PAY-05 J-05-07 peer |

### 4.2 Peer dependency — PAY-01..05 process order (RETAIN · mandatory)

| Step | Function | Seal / cite |
|------|----------|-------------|
| (1) | Scope + period guards | PAY-06 |
| (2) | **`loadPayrollEligibility`** → **`HRM-PAY-ATT-412`** | **PAY01QC1** |
| (3) | **F-PAY-ATT-CLOSED-01** per employee | **PAY01QC1** |
| (4) | **F-PAY-CB-READ-01** + GTCG bag slice | **PAY03QC1** |
| (5) | **F-PAY-RD-APPLY-01** if in pipeline | CORE-08 cite |
| (6) | **F-PAY-SPLIT-01** merge | **PAY04QC1** |
| (7) | **F-PAY-GTCG-01** persist once | **PAY03QC1** |
| (8) | **F-PAY-SI-CEILING-01** base + cap + `si_*` once | **PAY05QC1** |
| **(9) GAP** | **F-PAY-TNCN-01** taxable bag + progressive + **`tax_amount`** once | **this seat** |
| (10) | Published formula → **`HRM-PAY-FORMULA-412`** · **gd1_eval_v1** net/lines | **PAY02QC1** |
| (11) | Body guards: GTCG + SI + **tax** manual fields → **403** family | PAY-03/05 extend |

**Static plane (BIND):** **GTCG** + **SI** + **TNCN** are **monthly static** on **one** merged header — **DV-14** · **HRM-PAY-SPLIT-409** peer.

**Enroll vs process:** **`POST …/enroll`** may run **before** **`POST …/process`**; process **may** auto-create payslips when empty — **AC** must cover both paths without duplicate/conflict (**O1**).

---

## 5. F.1 disposition (cluster lock · deepen = later API-01 seat)

| F-id | Physical / logical | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------|-------------|---------------|----------|
| **F-PAY-PROCESS-01** | `POST …/process` | **must_keep RETAIN** · **EXPAND** tax step | Orchestrator hosts TNCN | FR-PAY-06 #5–#6 |
| **F-PAY-RUN-01** (logical) | enroll + eligibility + period draft | **GAP** AC / FE | Đưa NV · chạy đợt | Diễn biến **#4–#6** |
| **F-PAY-TNCN-01** (logical) | inside process | **GAP** unlock Dev | TNCN lũy tiến một lần | FR-PAY-06 · SRS biến tĩnh |
| **F-SET-TAX-01** | Settings `pay_tax_*` | **must_keep RETAIN** | Tham số thuế | Input · **≠** DONE alone |
| **F-PAY-GTCG-01** | peer PAY-03 | **must_keep BIND** | GTCG once | FR-PAY-03 |
| **F-PAY-SI-CEILING-01** | peer PAY-05 | **must_keep BIND** | SI once before tax | FR-PAY-05 |
| **F-PAY-SPLIT-01** | peer PAY-04 | **must_keep RETAIN** | Merge before static | FR-PAY-04 |
| **F-PAY-FORMULA-*** | peer PAY-02 | **must_keep RETAIN** | gd1_eval_v1 · THUE_TNCN_HT | FR-PAY-02 |
| **`pay_payslip.tax_amount`** | header col | **GAP** optional ALTER | Audit TNCN | DB · DATA stamp |

**DENY:** New public `POST /payroll/tax-compute` CRUD GĐ1 (tax runs **inside** process unless BA waives with ADR).  
**DENY:** FE PATCH payslip to set `tax_amount` / `net_amount`.  
**DENY:** Treat **enroll endpoint existence** as FR-PAY-06 module DONE.

**Display-ready cite for BA:** Process/preview `{ taxable_income_vnd, personal_deduction_vnd, dependent_deduction_vnd, tax_amount_vnd, pay_tax_regime_code }` · errors **`HRM-SET-TAX-412-MISSING`** · retain **`HRM-PAY-SPLIT-409`** when static tax duplicated.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O22 + mint J-HRM-PAY-06-* DRAFT + regression PAY-01..05 + hire U65 (AC-PAY-HIRE-*)
  → ba-data DATA-01 (closable: payroll_payslips.tax_amount header · DV-14 segment forbid tax_* re-assert)
  → sa API-01 F.1 deepen F-PAY-TNCN-01 + F-PAY-RUN-01 inside F-PAY-PROCESS-01 + bind §4.2 order
  → dev-be tax bag + progressive C-SLICE + tax_amount persist + deny manual + 403/412 bind
  → dev-fe Lương enroll/process UX (no net/tax calc) + list refresh AC-PAY-HIRE-04/05
  → qa U65 J-HRM-PAY-06-* + regression J-HRM-PAY-01..05
  → qc GWC C-SLICE (≠ PAY-06 / PAY module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O22 AC + mint J-HRM-PAY-06-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data closable delta | ba-data | DATA-01 if `tax_amount` header migration |
| 4. sa API-01 F.1 LOCK | sa | API cluster spec |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 + regression PAY-01..05 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · **ba-process unlocked** · PAY01..05 + ATT stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-06 module DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | TNCN before SI/GTCG | AC / order test | O7 · §4.2 |
| A | Per-segment tax | BR static monthly | O11 · O13 · **REJECT** pattern |
| A | FE net/tax SoT | Network/body | O14 · **REJECT B** |
| A | Fake enroll success | AC-PAY-HIRE-02 | O4 |
| A | Silent empty grid | AC-PAY-HIRE-04 | O3 · O5 |
| A | Missing tax settings | Process output | O9 |
| A | Claim enroll = DONE | Evidence footer | O18 |
| A | Flip payroll_e2e_ready | Flag true | O18 DENY |
| A | Reopen PAY-01..05 | QA regression FAIL | O16 |
| B | FE tax | FR-PAY-06 | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** | RETAIN · closed-sheet · ATT-412 · eligibility |
| **PAY02QC1-MSMC4GWC1** | RETAIN · formula · gd1_eval_v1 · THUE_TNCN_HT |
| **PAY03QC1-MSMDDGWC1** | RETAIN · GTCG once |
| **PAY04QC1-MSMCR4GWC1** | RETAIN · merge · DV-14 · 409 |
| **PAY05QC1-MSMDU2GWC1** | RETAIN · SI ceiling once · **before** TNCN step |
| **ATT12QC1-MSMAIGWC1** | RETAIN |
| **ATT11QC1-MSLXTH9P** | RETAIN · close spine |
| **PAY-01..05 process order** | **RETAIN** §4.2 — **cấm** reorder |
| **BR-BP-LC-04** | Active + closed sheet → payslip path |
| **pay_tax_* Settings** | RETAIN · **≠** PAY-06 DONE alone |
| FE net / TNCN SoT | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| Tax depth O19–O22 | **HOLD** until BA CONFIRM |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-06: **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..05 normative order** (§4.2) + LIVE enroll/eligibility cite; **GAP** **F-PAY-RUN-01** (AC-PAY-HIRE-01..05) + **F-PAY-TNCN-01** (taxable bag · progressive once · `tax_amount` header · Settings `pay_tax_*`); **BIND** GTCG+SI static plane; **HOLD** tax statutory depth **O19–O22** for **BA**; **must_keep** **PAY01QC1..PAY05QC1+ATT12QC1+ATT11QC1**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** BA-01 AC |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-06 · FR-UC-BP-PAY-06 · BR-BP-LC-04 · BR-BP-TS-03 · REQ_L_001 · Option A CONFIRMED · RETAIN PAY-01..05 process order §4.2
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md (normative process order · step 9 TNCN GAP)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md (AC pattern · honesty footer)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-06 · AC-PAY-HIRE-01..05
  - docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md (pay_tax_* KV)
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md
  - CONFIRMED AC O1–O22: AC-PAY-HIRE-01..05 · AC-PAY-06-* (process order · tax bag · TNCN once · deny manual · split bind)
  - HOLD footers explicit for O19–O22 (bracket source · YTD · 13th · mid-hire tax) — BA CONFIRM not SA invent
  - Mint J-HRM-PAY-06-01..08 DRAFT + regression J-HRM-PAY-01..05 (U65 FE-after-2xx+F5 where in-scope)
  - Unlock ba-data PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01
  - Footer: ≠ PAY-06 / FR-UC-BP-PAY-06 DONE · ≠ payroll_e2e_ready · DENY FE tax/net · RETAIN PAY-01..05 order · no seed · no apps/**
  - ack_status PASS_TO_PM · next ba-data DATA-01
cấm: honesty flip · seed · reorder PAY-01..05 pipeline · wipe PAY seals · apps/**
```
