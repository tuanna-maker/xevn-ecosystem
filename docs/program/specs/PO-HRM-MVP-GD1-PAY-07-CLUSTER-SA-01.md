# PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01 — Option/F.1 · Tất toán nghỉ việc — RETAIN PAY-01..06 process order · gap F-PAY-TERM-SETTLE-01 orchestration (peer CORE/ATT)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PAY-01..06 + ATT peer seals · **DENY** PAY mutate leave balance / cắt BH / thu hồi TS (CORE/ATT owners) · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → **ba-data** DATA-01 → **sa** API-01 F.1 → Dev/BE+FE residual → QA → QC · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-42 UC-BP-PAY-06 **SEALED** — stamp **`PAY06QC1-MSMECGWC1`** · QA **`PAY06QA1-MSMECGBI`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`** (SI timeline peer · **≠** PAY cắt BH) · **`payroll_e2e_ready=false`** · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-07` · `FR-UC-BP-PAY-07` · **BR-BP-TERM-01** · partner **REQ_L_002** (P6 settlement pointer) |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#48** after PAY-06 (#47 SEALED GWC) · PAY-08..09 **QUEUED** |
| **ref_pay01..06** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) … [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md) · QC stamps **PAY01QC1..PAY06QC1** · normative **PAY-01..06 process order** §4.2 (extends PAY-06 §4.2) |
| **ref_core_peers** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md) · **R-CORE-06-CLOSED-01** `asset_checklist_ack` tín hiệu · [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) · **F-PAY-RD-APPLY-01** KT/KL kỳ cuối · [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md) · **R-CORE-10-PAY-06 OUT** — CORE owns BH lifecycle · PAY **reads** `si_cutoff_done` checklist only · **F-CORE-TERM-01** (paper) **ABSENT** AS-IS — unlock BA soft TERM case path |
| **ref_att_peers** | **ATT-05** carry/FY peer · **R-ATT-05-TERMINATION-PAY** OUT footer — PAY consumes **display-ready** leave cashout inputs · **ATT-11** closed sheet gate (**PAY-01**) · **DENY** PAY mutate `leave_balance` / grant ledger |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-07** · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · đặc biệt «Nghỉ giữa kỳ» → **PAY-04** split peer |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P6** · **F-PAY-TERM-SETTLE-01** orchestrate reads · **F-PAY-PROCESS-01** hosts final run · biến tĩnh tháng **một lần** (GTCG · SI · TNCN) |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-TERM-SETTLE-01** · **`POST …/termination-settle`** *hoặc* process flag `include_terminations=true` · peer **F-CORE-TERM-01** · **F-PAY-PROCESS-01** |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_termination_settlement`** · `hrm_termination.final_settlement_id` · `pay_payslip.is_final_pay` · **`termination_settlement_id`** — **physical tables ABSENT** AS-IS (grep 2026-08-10 payroll module) |
| **ref_matrix** | `UC_BR_MATRIX_DEPTH` / program board UC-BP-PAY-07 · **PARTIAL** · REQ_L_002 |
| **ref_code** | **read-only cite (2026-08-10):** **`processPayrollPeriod`** · **`enrollPayrollPeriod`** LIVE (**PAY-06**) · **`decisions.service`** maps `hrd_02` → `termination` event_type (WH only — **≠** `hrm_termination` SoT) · **`employee-profile`** soft `termination_context_id` on list DTO (**HOLD** — no TERM PK invent) · **`pay_termination_settlement`** writer **ABSENT** · **`F-PAY-TERM-SETTLE-01`** route **ABSENT** · **≠** claim PAY-06 process alone = FR-PAY-07 DONE |
| **OUT** | PAY tự cắt BH · PAY mutate quỹ phép · PAY thu hồi tài sản · invent `hrm_termination` Nest `/core` dual SoT · claim CORE-06/CORE-10 DONE · claim settlement stub = PAY-07 DONE · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01..06 seals · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-07 / PAY module UAT** · **≠** full hire→termination→payslip browser e2e · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-43 architecture unlock: **tất toán nghỉ việc — kỳ lương cuối** (FR-UC-BP-PAY-07 · BR-BP-TERM-01) vs AS-IS (PAY-01..06 pipeline LIVE/partial · termination settlement **ABSENT**) — **gap-only** under U89 · **RETAIN PAY-01..06 normative process order** · **peer read** CORE-06/08/10 + ATT-05 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-06 QC-01 GWC (`PAY06QC1-MSMECGWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-07 · BR-BP-TERM-01 · F-PAY-TERM-SETTLE-01 · F-PAY-PROCESS-01 · F-CORE-TERM-01 (peer) · R-CORE-06-CLOSED-01 · R-CORE-10-PAY-06 OUT · R-ATT-05-TERMINATION-PAY OUT · must_keep PAY01QC1..PAY06QC1 + ATT12QC1 + ATT11QC1 · ≠ payroll_e2e LIVE |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **PAY-01..06 SEALED (must_keep):** closed sheet gate · formula · GTCG once · split merge · SI ceiling · enroll/process/TNCN GWC slice (partial FE/browser HOLD per PAY06 QC). **PAY-07 surfaces:** **ABSENT** — no `pay_termination_settlement` · no `POST …/termination-settle` · no `is_final_pay` writer · no checklist gate `409` for missing asset/SI ack. **Peers LIVE (cite — ≠ PAY-07 DONE):** CORE-06 soft-return on `employee_assets` (**≠** termination checklist closed flag) · CORE-10 SI enrollment/timeline CRUD (**CORE** owns cắt BH — PAY reads flag only) · CORE-08 RD link columns (partial) · ATT leave balances/panel (**ATT** owns số phép — PAY reads for formula). **Paper:** `hrm_termination` + `pay_termination_settlement` + final payslip pointer. **Risk if ignored:** PAY implements BH cut/leave mutate/asset return (boundary violation) · false module DONE · bypass PAY-01 closed sheet · double static deductions on final segment · honesty flip. |
| **Paper target** | FR-UC-BP-PAY-07: lệnh nghỉ → checklist (CORE-06 · BH · phép) → đưa biến tất toán vào **kỳ cuối** (cần bảng công chốt nếu còn ngày công) → phiếu `is_final_pay` + audit settlement · công thức trong engine PAY-02 — **không hardcode**. Nghỉ giữa kỳ → đoạn đến ngày chịu trách nhiệm (**PAY-04**). |
| **Gap class** | **GĐ1 continuous settlement orchestration** on LIVE **F-PAY-PROCESS-01** — **RETAIN** PAY-01..06 steps · **EXPAND** **F-PAY-TERM-SETTLE-01** (checklist read · upsert settlement · final payslip bind) · **not** duplicate CORE/ATT ownership · **HOLD** full `F-CORE-TERM-01` UI depth until CORE wave · **not** flip `payroll_e2e_ready`. |
| **Constraints** | U89 · preserve **PAY01QC1..PAY06QC1** + ATT seals · Nest `/core` DENY as payroll SoT · C-SLICE · DENY seed · gap-only · **DENY** PAY cross-pillar mutate · **DENY** reopen **J-HRM-PAY-01..06-*** without regression bus |
| **Failure impact if unresolved** | Board #48 stalls; REQ_L_002 PARTIAL; false termination UAT; regression PAY-04 split / PAY-05 SI cutoff / PAY-06 TNCN static plane |

### 1.2 Architecture diagram (target — Option A)

```text
  PAY-01 SEALED: closed sheet · HRM-PAY-ATT-412 · eligibility
  PAY-02 SEALED: published formula · gd1_eval_v1 · Q-PAY-FORMULA for leave/severance lines
  PAY-03 SEALED: F-PAY-GTCG-01 once post-merge
  PAY-04 SEALED: F-PAY-SPLIT-01 · mid-month termination segment
  PAY-05 SEALED: F-PAY-SI-CEILING-01 · si_* once (final period SI base)
  PAY-06 SEALED: F-PAY-RUN-01 + F-PAY-TNCN-01 once on merged header
  CORE-06 GWC: asset assignment SoT · R-CORE-06-CLOSED-01 gap (ack tín hiệu)
  CORE-08 GWC: KT/KL → payroll_period_id peer
  CORE-10 GWC: BH lifecycle · PAY reads si_cutoff_done (CORE writes)
  ATT-05/11: leave balance display · closed sheet
       │
       ▼
  ┌──────────── FR-UC-BP-PAY-07 (this seat — TERM SETTLE GAP on process spine) ────┐
  │                                                                                  │
  │  RETAIN (must_keep PAY-01..06 order §4.2 — cấm reorder · cấm skip ATT-412)      │
  │    F-PAY-PROCESS-01 orchestrator for final period run                            │
  │    Mid-month end_date → F-PAY-SPLIT-01 (PAY04QC1) before static plane            │
  │                                                                                  │
  │  NEW orchestration (GAP — F-PAY-TERM-SETTLE-01)                                  │
  │    R-PAY-07-TERM-READ    : read hrm_termination / soft TERM case (BA path)       │
  │    R-PAY-07-CHECKLIST    : asset_checklist_ack · si_cutoff_done · leave inputs   │
  │                            · reward_discipline_included (flags — owners CORE/ATT) │
  │    R-PAY-07-409-GAP      : HRM-PAY-TERM-409 when mandatory checklist open       │
  │    R-PAY-07-SETTLE-UPSERT: pay_termination_settlement draft→ready→posted       │
  │    R-PAY-07-FINAL-PAYSLIP: pay_payslip is_final_pay=true + settlement_id link   │
  │    R-PAY-07-PROCESS-BIND : termination-settle then process OR process flag       │
  │    R-PAY-07-FORMULA      : leave cashout / severance via published formula only  │
  │    R-PAY-07-DENY-MUTATE  : cấm PAY PATCH leave balance · cấm PAY POST SI stop    │
  │    R-PAY-07-JOURNEY      : mint J-HRM-PAY-07-* DRAFT + regression PAY-01..06     │
  │                                                                                  │
  │  HOLD / peer (footer)                                                            │
  │    Full F-CORE-TERM-01 lệnh nghỉ UI + hrm_termination physical = CORE program   │
  │    Period lock / payslip security polish = PAY-08                               │
  │    13th month / bonus = PAY-09                                                  │
  └──────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  PAY cuts insurance / mutates leave / returns assets     = DENY (API_DESIGN F.1 boundary)
  FE hardcode leave payout / severance                    = DENY (PAY-02 · OS 28)
  Final pay without closed sheet                          = DENY (PAY-01 · DV-09)
  Static tax/GTCG/SI per termination segment then sum     = DENY (DV-14 · PAY04/05/06)
  Claim process API alone = PAY-07 DONE                   = DENY
  Flip payroll_e2e_ready / PAY UAT                        = DENY
  Wipe PAY01..06                                          = DENY

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Lệnh nghỉ việc — tất toán kỳ cuối» GĐ1 = **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..06** order · **GAP** **F-PAY-TERM-SETTLE-01** (checklist read · settlement row · final payslip) **around** same process spine · **peer** CORE-06/08/10 + ATT-05 **emit/read only** · **not** PAY pillar stealing BH/leave/asset ownership.  
**Order lock:** Final run **must** execute **steps (1)–(11)** per PAY-06 §4.2 (ATT-412 → … → TNCN → formula) — **cấm** settlement writer that bypasses closed sheet or static-once rules.  
**Term lock:** Physical `hrm_termination` may lag CORE program — **BA** may define **soft TERM case** + manual checklist entry **without** inventing Nest `/core` dual SoT (**O3**).  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · **≠** FR-UC-BP-PAY-07 module DONE from architecture doc alone.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Closed sheet precondition | PAY-01 · DV-09 | `HRM-PAY-ATT-412` LIVE | **must_keep RETAIN** |
| Mid-month segment | FR-PAY-07 đặc biệt · PAY-04 | F-PAY-SPLIT-01 LIVE | **must_keep BIND** PAY04QC1 |
| Process + static plane | PAY-03/05/06 | partial LIVE | **must_keep BIND** |
| Formula severance/leave lines | PAY-02 · Q-PAY-FORMULA | gd1_eval_v1 LIVE | **RETAIN cite** · **GAP** term vars |
| `pay_termination_settlement` | DB §5.10 | **ABSENT** | **GAP** DATA + Dev |
| `POST …/termination-settle` | F-PAY-TERM-SETTLE-01 | **ABSENT** | **GAP** API + Dev |
| Checklist flags ack | `si_cutoff_done` · `leave_cashout_done` · `asset_checklist_ack` | **ABSENT** writer | **GAP** · read from peers |
| `is_final_pay` payslip | DB | **ABSENT** / not wired | **GAP** |
| `hrm_termination` / F-CORE-TERM-01 | CORE peer | Nest route **ABSENT** | **HOLD** CORE program · **BA soft path O3** |
| CORE-06 asset signal | R-CORE-06-CLOSED-01 | soft-return only | **GAP** closed flag |
| CORE-10 SI stop | CORE owns | enrollment/timeline LIVE | **READ** `si_cutoff_done` only |
| ATT leave cashout amount | ATT-05 OUT | panel/balance LIVE | **READ** display-ready · **DENY** PAY mutate |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — RETAIN F-PAY-PROCESS-01 + PAY-01..06 order · EXPAND F-PAY-TERM-SETTLE-01 orchestration (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** full **PAY-01..06** pipeline for **final period** run. **EXPAND** **F-PAY-TERM-SETTLE-01**: read termination case + checklist flags (CORE-06/10/08 · ATT display) → **409** if mandatory gaps → upsert **`pay_termination_settlement`** → bind **`is_final_pay`** payslip via **`F-PAY-PROCESS-01`** (dedicated `POST …/termination-settle` **or** process flag — **one** SoT per API-01). **must_keep** PAY01QC1..PAY06QC1. **HOLD** full `F-CORE-TERM-01` · PAY-08/09 · **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | High (cross-pillar checklist + final pay + regression) |
| **Risk** | High if PAY mutates CORE/ATT or skips static-once |
| **Pros** | Matches API_DESIGN boundary · preserves PAY-06 order · honest C-SLICE |
| **Cons** | Depends on CORE-06 closed signal + TERM case BA path |
| **Failure modes** | PAY cuts BH · FE leave payout · settlement without closed sheet |
| **Mitigation** | O1–O22 · regression PAY-01..06 · U65 termination journeys |

### Option B — PAY owns BH cut + leave cashout mutate + asset return (REJECT)

| | |
|--|--|
| **Summary** | Single PAY endpoint mutates insurance, leave ledger, assets |
| **Pros** | One-click «tất toán» |
| **Cons** | Violates **F-PAY-TERM-SETTLE-01** «không PAY tự cắt BH / thu hồi TS / mutate leave» · ADR pillar boundary |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim PAY-06 process stub = FR-PAY-07 DONE (REJECT)

| | |
|--|--|
| **Summary** | Mark PAY-07 DONE because payroll process exists; no settlement row |
| **Pros** | Fast matrix green |
| **Cons** | REQ_L_002 PARTIAL · UC matrix FAIL · C-SLICE lie |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (settle orchestration) | B (PAY owns all) | C (HOLD/claim DONE) |
|-----------|-------:|-------------------------:|-----------------:|--------------------:|
| Business value (FR-PAY-07) | 5 | **5** | 2 | 0 |
| PAY-01..06 order fidelity | 5 | **5** | 1 | 1 |
| Pillar boundary integrity | 5 | **5** | 0 | 1 |
| Time to deliver | 4 | **3** | 4 | Fake PASS |
| Maintainability (ONE process SoT) | 5 | **5** | 0 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..06 normative order** (§4.2); **GAP** **F-PAY-TERM-SETTLE-01** orchestration + **`pay_termination_settlement`** + final payslip bind; **READ** peer flags only; **BIND** PAY-04 mid-month + PAY-05 SI cutoff on final period + PAY-06 TNCN once; unlock **R-PAY-07-***; **HOLD** full `F-CORE-TERM-01` physical for **CORE/BA**; **DENY** PAY mutate CORE/ATT · FE hardcode payout · honesty flip · wipe seals · seed · apps/** |
| **Why selected** | Paper API already defines PAY as **orchestrator reads + final payslip writer** — not BH/leave/asset owner; LIVE process spine exists; gap is settlement record + checklist gates + `is_final_pay` |
| **Assumptions** | **PAY01..06** seals **RETAIN** · PAY-06 TNCN/SI order stable · `payroll_e2e_ready=false`. Settlement tables **ABSENT** today — expected until DATA/Dev after BA/API. |
| **Rejected** | **B** — PAY owns CORE/ATT mutate · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Settle SoT | **`F-PAY-TERM-SETTLE-01`** dedicated endpoint **xor** `process` flag — **one** winner in API-01 | AC cite FR-PAY-07 #3–#4 |
| O2 | Preconditions | **Closed sheet** mandatory when period has workdays (**PAY-01**) · else **412** | Diễn biến #3 |
| O3 | TERM case source | **HOLD** physical `hrm_termination` until CORE — GĐ1 **soft case** (decision `hrd_02` + employee `resigned` + date) **allowed** if BA documents | Luồng #1 |
| O4 | Asset gate | **`asset_checklist_ack`** = CORE-06 closed signal (**0** mandatory `assigned`) — **≠** soft Profile Thu hồi alone | CORE-06 · SRS #1 |
| O5 | SI gate | **`si_cutoff_done`** read from CORE-10 timeline — **PAY không POST stop** | SRS cắt BH |
| O6 | Leave cashout | Amounts via **formula vars** from ATT display-ready — **PAY không mutate balance** | ATT-05 OUT · Q-PAY-FORMULA |
| O7 | KT/KL kỳ cuối | **CORE-08** `reward_discipline_included` + **F-PAY-RD-APPLY-01** in process order | SRS KT/KL |
| O8 | Mid-month end | **`termination_date`** drives **F-PAY-SPLIT-01** segment — static plane still **once** on header | PAY04QC1 |
| O9 | SI on final period | **F-PAY-SI-CEILING-01** with cutoff base — peer PAY-05 **O18** footer now **in scope** for final run only | PAY05QC1 |
| O10 | TNCN on final | **F-PAY-TNCN-01** once on merged header — same as PAY-06 **O11** | PAY06QC1 |
| O11 | Settlement lifecycle | `draft→ready→posted` — **cấm** posted→draft | DB §5.11 |
| O12 | Final payslip flag | `is_final_pay=true` + `termination_settlement_id` on header | DB |
| O13 | Checklist 409 | **`HRM-PAY-TERM-409`** stable code when mandatory flag false per tenant policy | AC-PAY-07-409 |
| O14 | DENY manual UI | Cấm FE nhập tay tiền phép / trợ cấp nghỉ trên lưới — chỉ formula output | OS 28 |
| O15 | Display-ready | Preview: checklist snapshot + `settlement_status` + final net read-only (vi-VN) | OS 28 |
| O16 | Regression | **DENY reopen** J-HRM-PAY-01..06 sealed without bus | must_keep |
| O17 | must_keep stamps | PAY01QC1..PAY06QC1 + ATT12QC1 + ATT11QC1 | ≠ wipe |
| O18 | Honesty | Mint **J-HRM-PAY-07-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O19 | **Severance formula vars (HOLD)** | C-SLICE variable names in `required_vars_json` — **not** SA invent amounts | **BA CONFIRM** |
| O20 | **Negative leave / debt (HOLD)** | Đối trừ nợ phép — policy ATT | **BA CONFIRM** |
| O21 | **Multi-company termination (HOLD)** | Kiêm nhiệm scope — ADR ladder | **BA CONFIRM** |
| O22 | **Posted settlement immutability (HOLD)** | Void/adjustment path = PAY-08 peer | Footer |

### 4.2 Peer dependency — PAY-01..06 process order (RETAIN · mandatory for final run)

| Step | Function | Seal / cite |
|------|----------|-------------|
| (0) | **F-PAY-TERM-SETTLE-01** preflight: TERM read + checklist flags | **this seat** |
| (1) | Scope + period guards | PAY-07 |
| (2) | **`loadPayrollEligibility`** → **`HRM-PAY-ATT-412`** | **PAY01QC1** |
| (3) | **F-PAY-ATT-CLOSED-01** per employee | **PAY01QC1** |
| (4) | **F-PAY-CB-READ-01** + GTCG bag | **PAY03QC1** |
| (5) | **F-PAY-RD-APPLY-01** KT/KL thi hành | **CORE08QC1** |
| (6) | **F-PAY-SPLIT-01** if termination mid-period | **PAY04QC1** |
| (7) | **F-PAY-GTCG-01** persist once | **PAY03QC1** |
| (8) | **F-PAY-SI-CEILING-01** final-period SI base + cutoff read | **PAY05QC1** |
| (9) | **F-PAY-TNCN-01** once | **PAY06QC1** |
| (10) | Published formula → severance/leave lines + **gd1_eval_v1** | **PAY02QC1** |
| (11) | Body guards: GTCG + SI + tax manual → **403** family | PAY-03/05/06 |
| (12) | Upsert **`pay_termination_settlement`** · link **`is_final_pay`** | **this seat GAP** |

**Business order (BIND):** SRS «chốt công → tất toán → lương cuối» = **(3) closed sheet** before **(12) settlement posted** before **employee status resigned** side effects (CORE peer — **not** PAY activate).

**Enroll vs final settle:** **`POST …/enroll`** may still apply for final period draft — settlement **must not** claim success without **(12)** + visible payslip (**O18**).

---

## 5. F.1 disposition (cluster lock · deepen = later API-01 seat)

| F-id | Physical / logical | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------|-------------|---------------|----------|
| **F-PAY-PROCESS-01** | `POST …/process` | **must_keep RETAIN** · final run host | Chạy lương kỳ cuối | FR-PAY-07 #3 |
| **F-PAY-TERM-SETTLE-01** | `POST …/termination-settle` or flag | **GAP** unlock Dev | Tất toán checklist + settlement | Diễn biến **#1–#2** |
| **F-PAY-SPLIT-01** | peer PAY-04 | **must_keep BIND** | Nghỉ giữa kỳ | Đặc biệt |
| **F-PAY-SI-CEILING-01** | peer PAY-05 | **must_keep BIND** | SI kỳ cuối | FR-PAY-07 BH |
| **F-PAY-TNCN-01** | peer PAY-06 | **must_keep BIND** | TNCN một lần | Static plane |
| **F-PAY-RD-APPLY-01** | peer CORE-08 | **must_keep BIND** | KT/KL kỳ cuối | SRS |
| **F-CORE-TERM-01** | CORE | **HOLD** peer | Lệnh nghỉ SoT | Luồng #1 |
| **F-CORE-AST-02** | CORE-06 | **READ** ack | Thu hồi TS | Checklist |
| **F-CORE-SI-*** | CORE-10 | **READ** cutoff | Cắt BH | **≠** PAY write |
| **`pay_termination_settlement`** | P6 table | **GAP** DATA | Audit flags | DB §5.10 |
| **`pay_payslip.is_final_pay`** | header | **GAP** optional ALTER | Phiếu cuối | DB |

**DENY:** PAY `POST` insurance stop · PAY `PATCH` leave balance · PAY asset return endpoints.  
**DENY:** New Nest `/core/termination-settle` dual SoT (physical **`/api/hrm/payroll/*`** prefer).  
**DENY:** Treat **PAY-06 process LIVE** alone as FR-PAY-07 DONE.

**Display-ready cite for BA:** `{ termination_id, settlement_status, checklist: { asset_ack, si_cutoff, leave_cashout, rd_included }, is_final_pay, final_net_vnd }` · errors **`HRM-PAY-TERM-409`** · **`HRM-PAY-ATT-412`** retain.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O22 + mint J-HRM-PAY-07-* DRAFT + regression PAY-01..06 + U65 termination path
  → ba-data DATA-01 (closable: pay_termination_settlement · is_final_pay · hrm_termination pointer HOLD/soft)
  → sa API-01 F.1 deepen F-PAY-TERM-SETTLE-01 + bind §4.2 + peer READ contracts
  → dev-be settlement upsert + checklist 409 + final payslip bind + deny CORE/ATT mutate
  → dev-fe C&B termination settle UX (no manual payout) + checklist display
  → qa U65 J-HRM-PAY-07-* + regression J-HRM-PAY-01..06
  → qc GWC C-SLICE (≠ PAY-07 / PAY module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O22 AC + mint J-HRM-PAY-07-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data closable delta | ba-data | DATA-01 P6 tables/cols |
| 4. sa API-01 F.1 LOCK | sa | API cluster spec |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 + regression PAY-01..06 | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · **ba-process unlocked** · PAY01..06 + ATT stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-07 module DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | PAY mutates leave/SI | API review | **REJECT B** · O5/O6 |
| A | Final pay without closed sheet | DV-09 test | O2 |
| A | Checklist bypass | 409 missing | O4 · O13 |
| A | Per-segment static on termination | DV-14 | O8 · O10 |
| A | FE hardcode severance | Network/body | O14 |
| A | Claim process = PAY-07 DONE | Evidence footer | O18 |
| A | Flip payroll_e2e_ready | Flag true | O18 DENY |
| A | Reopen PAY-01..06 | QA regression FAIL | O16 |
| B | Pillar violation | Architecture | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** | RETAIN · closed-sheet · ATT-412 |
| **PAY02QC1-MSMC4GWC1** | RETAIN · formula · term line vars |
| **PAY03QC1-MSMDDGWC1** | RETAIN · GTCG once |
| **PAY04QC1-MSMCR4GWC1** | RETAIN · mid-month split |
| **PAY05QC1-MSMDU2GWC1** | RETAIN · SI ceiling final period |
| **PAY06QC1-MSMECGWC1** | RETAIN · TNCN once before formula net |
| **ATT12QC1-MSMAIGWC1** · **ATT11QC1-MSLXTH9P** | RETAIN |
| **CORE06QC1-MSLID363** | READ asset ack · **≠** invent PAY asset return |
| **CORE10QC1-MSLP0EJB** | READ SI cutoff · **≠** PAY cut BH |
| **PAY-01..06 process order** | **RETAIN** §4.2 — **cấm** reorder |
| **BR-BP-TERM-01** | Checklist before final post |
| PAY mutate CORE/ATT | **DENY** |
| FE severance/leave SoT | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| apps/** | **CẤM** until contracts after BA/DATA/API |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-07: **RETAIN** **F-PAY-PROCESS-01** + **PAY-01..06 normative order** (§4.2) + sealed pipeline cite; **GAP** **F-PAY-TERM-SETTLE-01** (checklist read · `pay_termination_settlement` · `is_final_pay` · **409** gates); **BIND** PAY-04 mid-month · PAY-05/06 static plane; **READ** CORE-06/08/10 + ATT-05 peers — **DENY** PAY mutate BH/leave/asset; **HOLD** full **F-CORE-TERM-01** for CORE/BA **O3**; **must_keep** **PAY01QC1..PAY06QC1+ATT12QC1+ATT11QC1**; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** BA-01 AC |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-07 · FR-UC-BP-PAY-07 · BR-BP-TERM-01 · REQ_L_002 · Option A CONFIRMED · RETAIN PAY-01..06 process order §4.2
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md (process order · TNCN once)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md (AC pattern · honesty footer)
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md (asset_checklist_ack peer)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-07
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-TERM-SETTLE-01
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + CORE06QC1-MSLID363 + CORE10QC1-MSLP0EJB peer chain · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md
  - CONFIRMED AC O1–O22: checklist gates · settlement lifecycle · final payslip · mid-month split · deny PAY mutate CORE/ATT · deny FE manual payout
  - HOLD footers explicit for O19–O22 (formula vars · negative leave · multi-company · void path)
  - Mint J-HRM-PAY-07-01..08 DRAFT + regression J-HRM-PAY-01..06 (U65 FE-after-2xx+F5 where in-scope)
  - Unlock ba-data PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01
  - Footer: ≠ PAY-07 / FR-UC-BP-PAY-07 DONE · ≠ payroll_e2e_ready · DENY PAY cut BH / mutate leave · RETAIN PAY-01..06 order · no seed · no apps/**
  - ack_status PASS_TO_PM · next ba-data DATA-01
cấm: honesty flip · seed · reorder PAY pipeline · wipe PAY seals · PAY mutate CORE/ATT pillars · apps/**
```
