# PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01 — Option/F.1 · Khen thưởng & kỷ luật — thi hành → bảng lương

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → (ba-data if needed) → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-01 GWC Wave-11 UC-BP-CORE-02 **SEALED** — stamp `CORE02QC1-MSL80DU6` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qc-01.md` · peer QA `CORE02QA-MSL7X7SJ` |
| **uc_ids** | `UC-BP-CORE-08` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#14** after CORE-02 (#13 SEALED) |
| **ref_sa_spine** | Peer C&B ring [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) · public ring [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) · TECHSPEC P3 · F-PAY-RD-APPLY-01 **consumer OUT** — **reuse · DENY reopen sealed J-HRM-CORE-02-01..04 / J-HRM-CORE-01-* / REC without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · personnel / CORE module UAT **false** · 16 program honesty flags **false** · **DENY claim CORE-02 = CORE pillar DONE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-08** · Diễn biến #1–#5 · **BR-BP-RD-01** · partner **HR-005** · peers CORE-01/02 SEALED · PAY-01/06/07 handoff OUT |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-CORE-06** · partner **HR-005** |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-CORE-08 · BR-BP-RD-01 · status **MISSING** → this Option unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.7** `hrm_reward_discipline` · soft `payroll_period_id` / `payslip_id` · **§5.9** `pay_reward_link` optional PAY-side · **§3.2** packages / **§3.6** eins RETAIN |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-CORE-RD-01** · **F-PAY-RD-APPLY-01** (PAY consumer · OUT invent process) · peers F-CORE-EMP-01/02 SEALED · F-PAY-CB-READ-01 — **no wipe**; EXPAND physical residual |
| **OUT** | Full PAY engine / `F-PAY-PROCESS-01` invent · payslip line write this seat · Nest `/core` dual RD · invent second RD SoT abandoning LIVE rewards/discipline · claim CORE-02 packages = CORE pillar DONE · reopen sealed CORE-02 / CORE-01 / REC · seed · honesty flip · module CORE/personnel UAT · CORE-09/05/06/07 invent · ATT |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-12 architecture unlock: **KT/KL execute → payroll handoff** vs AS-IS employee rewards/discipline + decision/payroll spines |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after CORE-02 QC-01 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-CORE-08 · BR-BP-RD-01 · F-CORE-RD-01 · F-PAY-RD-APPLY-01 **OUT invent** · CORE-02 packages/eins + AuthZ-403 + CB-403 **must_keep** · CORE-01 public strip **must_keep** · Nest `/core` DENY · U19 scope_parity |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-02 SEALED (`CORE02QC1-MSL80DU6`):** C&B on Nest `/api/hrm/contracts-insurance/compensation-packages*` (+ revise/history/active) + `/api/hrm/employee-insurances*` · AuthZ **`HRM-CORE-CB-AUTHZ-403`** · public **`HRM-CORE-CB-403`** · CORE-01 public strip · Nest `/core` **DENY**. **KT/KL AS-IS partial (HR note spine):** (1) Nest `@Controller('employees')` → `GET/POST/PATCH/DELETE /api/hrm/employees/:employeeId/rewards*` + `/discipline*` via `EmployeeProfileService` on tables **`public.employee_rewards`** + **`public.employee_discipline`** (ensureSchema CREATE IF NOT EXISTS). (2) Fields: title · type · amount / penalty_amount · decision_number · status (`pending`/`approved`/`active`…) · dates — **NO** `payroll_link_status` · **NO** `payroll_period_id` · **NO** enforce / cancel-enforce action · **NO** BR-BP-RD-01 gate. (3) FE `EmployeeRewardsDiscipline` + `useEmployeeRewardsDiscipline` — HR note CRUD only. (4) **Decisions spine** Nest `@Controller('decisions')` → `/api/hrm/decisions*` = personnel decisions (bổ nhiệm / thuyên chuyển / …) — **≠** KT/KL payroll handoff SoT (soft `decision_number` ref only). (5) **Payroll spine** Nest `@Controller('payroll')` → `/api/hrm/payroll/*` + `payroll_periods` LIVE for period catalog/process peers — **OUT** invent full process/payslip apply in this seat. (6) **No** Nest `@Controller('core')` / paper `/core/reward-discipline` SoT. |
| **Paper target** | FR-UC-BP-CORE-08: (1) create KT/KL with **title first**, type, amount (if money) + **target payroll period**; (2) transition execution **Chờ → Đang/Đã thi hành** (or Hủy); (3) when Đang/Đã thi hành → variable available for period target via component engine (**CORE owns case + link**; PAY reads enforced); (4) note-only (no period) → **not** on payslip; (5) cancel before period lock → remove from open period; (6) after period lock → deny mutate locked payslip; adjust later period with audit; (7) one amount → **not** two periods at once. BR-BP-RD-01. DB §3.7 `hrm_reward_discipline` · API **F-CORE-RD-01** · PAY **F-PAY-RD-APPLY-01** consumer. |
| **Gap class** | **impl_gap residual on LIVE rewards/discipline spines** — **not** greenfield dual: (1) paper path `/core/reward-discipline` ≠ LIVE `/employees/:id/rewards|discipline` (alias/DOC-DELTA + enforce residual); (2) missing execution / `payroll_link_status` / soft `payroll_period_id`; (3) amount>0 without period not fail-closed; (4) risk invent Nest `/core` dual RD or new `hrm_reward_discipline` abandoning LIVE dual tables; (5) conflate CORE-02 C&B GWC = CORE pillar DONE or note-CRUD = FR-08 DONE; (6) invent full PAY process / payslip line write in CORE-08 seat; (7) conflate `/decisions` personnel SoT with KT/KL. |
| **Constraints** | U89 continuous · **preserve** CORE-02 packages/eins + AuthZ-403 + CB-403 · CORE-01 public strip · Nest `/core` DENY · REC seals · C-SLICE · DENY claim CORE-02 = CORE pillar DONE · DENY flip `recruitment_uat_ready` / `jd_dynamic_done` / personnel UAT · DENY seed · **cấm invent PAY full engine** · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #14 stalls; BA cannot AC thi hành→kỳ; Dev invents `/core/reward-discipline` dual or dual-writes payslip outside engine; honesty flip; regression CORE-02 / CORE-01 |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-CORE-01 (SEALED — must_keep)           UC-BP-CORE-02 (SEALED — must_keep)
  GET/PATCH /api/hrm/employees*                /contracts-insurance/compensation-packages*
  public strip · HRM-CORE-CB-403               + /employee-insurances*
  Nest /core DENY                              AuthZ-403 · bank/MST · SI change_rate
       │                                              │
       │  boundary (DENY write C&B onto public)       │
       ▼                                              ▼
  ┌─────────────────────────── FR-UC-BP-CORE-08 ───────────────────────────┐
  │                                                                         │
  │  F-CORE-RD-01 residual (physical prefer LIVE employee RD spines)        │
  │    GET/POST/PATCH …/employees/:id/rewards*                              │
  │    GET/POST/PATCH …/employees/:id/discipline*                           │
  │    + ADD enforce / cancel-enforce (or status transition) residual       │
  │    1) Title-first · kind reward|discipline · amount optional            │
  │    2) amount>0 → require soft payroll_period_id (open / adjust period)  │
  │    3) ADD payroll_link_status: none|pending_period|linked|executed      │
  │       + execution status Chờ/Đang/Đã thi hành/Hủy (BA lock enum map)    │
  │    4) Employee Hoạt động gate · U19 same resolveHrmListScope            │
  │    5) Note-only (amount null/0 + no period) → link_status=none          │
  │       → DENY appear on PAY apply                                        │
  │    paper alias ONLY: /api/hrm/core/reward-discipline (+ /enforce)       │
  │                                                                         │
  │  Boundary to PAY (OUT invent process this seat)                         │
  │    Soft pointer payroll_period_id → LIVE payroll_periods                │
  │    F-PAY-RD-APPLY-01 READ facade later (PAY pillar seats)               │
  │    CORE MAY set link_status; PAY owns payslip_line write                │
  │    DENY dual-write amount onto payslip outside engine                   │
  │                                                                         │
  │  RETAIN: CORE-01 public · CORE-02 packages/eins · CB/AuthZ 403          │
  │  RETAIN: Nest /core DENY · soft-delete · decisions ≠ RD SoT             │
  └─────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat (peer)
       ▼
  F-PAY-PROCESS-01 / payslip invent     CORE-09 HĐ · CORE-05/06 asset · ATT
  PAY-01..09 board #42+                 = peer seats
  = OUT unless separate WI

  DENY: Nest /core dual RD · second hrm_reward_discipline wipe LIVE tables
  DENY: claim CORE-02 packages = CORE pillar DONE · reopen J-CORE-02 / J-CORE-01
  Honesty: C-SLICE ≠ recruitment_uat_ready · ≠ jd_dynamic_done · ≠ CORE UAT
```

**Label lock:** «Khen thưởng & kỷ luật — thi hành → bảng lương» = **case lifecycle + payroll_link handoff** on LIVE rewards/discipline — **not** note-only forever; not decisions personnel SoT; not PAY process invent; not C&B packages mutate.  
**Spine lock:** Physical prefer `/api/hrm/employees/:id/rewards*` + `/discipline*` — paper `/core/reward-discipline` = **alias / DOC-DELTA only** — **DENY** Nest `/core` second RD SoT.  
**Boundary lock:** CORE owns case + link status + soft period; PAY owns apply-to-payslip (**OUT** this seat). CORE-02 packages/eins + AuthZ/CB-403 + CORE-01 public **must_keep**.  
**Honesty lock:** Slice GWC later **≠** `recruitment_uat_ready=true` · **≠** `jd_dynamic_done=true` · **≠** module CORE/personnel UAT · **≠** claim CORE-02 = CORE pillar DONE.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| RD create/list/update | F-CORE-RD-01 · `/core/reward-discipline` | `/employees/:id/rewards*` + `/discipline*` | **UNLOCK residual** UPGRADE · paper = **alias** |
| Unified table | §3.7 `hrm_reward_discipline` `kind` | Dual `employee_rewards` + `employee_discipline` | **RETAIN dual physical** GĐ1 · optional ba-data unify later — **DENY** wipe without migrate |
| Title / type / amount | FR-08 input | LIVE title · type · amount/penalty | **RETAIN** · UPGRADE amount≥0 + period gate |
| Execution status | Chờ / Đang / Đã thi hành / Hủy | `pending`/`approved`/`active` (HR note) | **UNLOCK residual** map / ADD enum |
| Payroll link | `payroll_link_status` + `payroll_period_id` | **ABSENT** | **UNLOCK ADD** (ba-data **LIKELY REQUIRED**) |
| Enforce action | `POST …/enforce` | **ABSENT** | **UNLOCK ADD** residual |
| Cancel before lock | FR-08 #4 | Soft delete / status only | **UNLOCK residual** cancel-enforce → unlink open period |
| Note-only no period | FR-08 special | Allowed (no gate) | **UNLOCK** AC: no period → not PAY-visible |
| One case → one open period | BR-BP-RD-01 | No guard | **UNLOCK** 409 dual-period |
| Employee Hoạt động | FR-08 precond | Scope via getEmployeeById | **RETAIN / UPGRADE** gate on create+enforce |
| Decisions personnel | — | `/api/hrm/decisions*` | **RETAIN peer** · **≠** RD SoT · soft decision_number only |
| PAY apply | F-PAY-RD-APPLY-01 | payroll process peer | **OUT** invent — contract READ only |
| Period catalog | soft → `pay_payroll_period` | LIVE `payroll_periods` | **RETAIN soft pointer** to LIVE periods |
| C&B packages / eins | CORE-02 | SEALED Wave-11 | **RETAIN must_keep** |
| Public EMP / CB-403 | CORE-01 | SEALED | **RETAIN must_keep** |
| Nest `/core` | paper alias | DENY dual (QC) | **DENY** |
| Module / honesty | program | W1–W11 C-SLICE | **DENY flip** · **DENY CORE-02=pillar DONE** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE: KT/KL execute+payroll_link on LIVE rewards/discipline (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** CORE-02 packages/eins + AuthZ-403 + CB-403 + CORE-01 public strip + Nest `/core` DENY. **Preserve** LIVE Nest `/api/hrm/employees/:id/rewards*` + `/discipline*` as **physical RD SoT** (dual tables OK GĐ1). **UPGRADE** F-CORE-RD-01 residual: execution lifecycle (Chờ→Đang/Đã thi hành/Hủy); ADD `payroll_link_status` + soft `payroll_period_id` (amount>0 require period); ADD enforce / cancel-enforce (or equivalent transition endpoints); fail-closed dual-period + locked-period mutate; note-only stays `none` (not PAY-visible). Paper `POST/GET /api/hrm/core/reward-discipline` (+ `/enforce`) = **alias / DOC-DELTA only**. Soft `decision_number` may reference decisions — **DENY** fold RD into `/decisions` SoT. **OUT** invent F-PAY-PROCESS-01 / payslip_line write / `pay_reward_link` mandatory — PAY seats own F-PAY-RD-APPLY-01. **DENY** claim CORE-02 = CORE pillar DONE. |
| **Benefits** | Closes FR-UC-BP-CORE-08 without Nest `/core` dual; reuses LIVE FE tab + profile CRUD; preserves W10–W11 must_keep; unlocks U89 #14 BA; keeps PAY boundary clean |
| **Costs** | BA AC for enum map + period gate + enforce; ba-data **LIKELY REQUIRED** for link columns on dual tables (or controlled unify); FE wire enforce + period picker; DOC-DELTA paper path alias |
| **Risks** | Dev invents Nest `/core` dual — **mitigate:** DENY + O1. Dual-writes payslip — **mitigate:** O8 OUT. Claims CORE-02=pillar DONE — **mitigate:** O9. Flip honesty — **mitigate:** O10. Wipe dual tables for greenfield — **mitigate:** O1/O5 |

### Option B — Greenfield Nest `/core/reward-discipline` + second `hrm_reward_discipline` SoT

| | |
|--|--|
| **Description** | Implement paper `/api/hrm/core/reward-discipline*` as primary Nest controller with new unified table; abandon or dual-write LIVE `employee_rewards`/`employee_discipline`; rewrite FE; optional Nest `/core` bleed. |
| **Benefits** | Paper path / single-table name fidelity |
| **Costs** | Dual SoT; break profile tab; high blast; U89 delay; risks Nest `/core` DENY regression |
| **Risks** | Regression W10–W11 · C-SLICE — **REJECT** |

### Option C — HOLD / note-CRUD = FR-08 DONE / CORE-02 = pillar DONE / invent PAY engine / honesty flip

| | |
|--|--|
| **Description** | Treat LIVE note CRUD or CORE-02 packages GWC as FR-UC-BP-CORE-08 complete; or HOLD board; or invent full PAY apply/payslip in this seat; or flip `recruitment_uat_ready` / personnel UAT. |
| **Benefits** | Short-term idle |
| **Costs** | BR-BP-RD-01 unmet; board #14 false DONE or stuck; violates U89 + honesty + mission DENY PAY invent |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-CORE-08 + BR-BP-RD-01) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **8** | 2 | 6 |
| Security / CORE-01·02 boundary + U19 | 15 | **9** | 4 | 2 |
| Reliability (ONE RD physical family · PAY boundary) | 15 | **9** | 3 | 2 |
| Maintainability (preserve rewards/discipline · Nest DENY) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **8.85** | **3.55** | **2.35** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/core/reward-discipline` as second SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | New `hrm_reward_discipline` wipe LIVE dual | Schema review | **DENY** abandon without migrate · dual RETAIN GĐ1 |
| A | Dual-write amount onto payslip outside PAY engine | Code review | **DENY** · O8 OUT · PAY owns apply |
| A | amount>0 without period still enforce | Contract test | 409/VAL fail-closed |
| A | Note-only appears on PAY apply | PAY read filter | link_status=`none` + amount null path |
| A | One case linked two open periods | UQ/service assert | **409** dual-period |
| A | Mutate after period lock | Period status check | Deny; adjust later period + audit |
| A | Fold RD into `/decisions` SoT | Scope | **DENY** · soft decision_number only |
| A | Claim CORE-02 packages = CORE pillar DONE | Review | **DENY** · O9 |
| A | Reopen sealed J-HRM-CORE-02-01..04 / J-CORE-01 / REC | Bus | **DENY reopen** without regression |
| A | Flip `recruitment_uat_ready` / `jd_dynamic_done` / CORE UAT | QC honesty | **DENY** · C-SLICE |
| A | Seed for U65 | QA evidence | **DENY** seed |
| A | Pull PAY process / CORE-09 / asset into this WI | Scope | **OUT** O8 |
| B | Dual SoT + Nest `/core` regression | Integration | Reject B |
| C | Board idle / false DONE / PAY invent | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE**: KT/KL execute + payroll_link on LIVE **`/employees/:id/rewards*`** + **`/discipline*`**; paper `/core/reward-discipline` = **alias only**; **RETAIN** CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public · Nest `/core` DENY; **OUT** invent PAY full engine |
| **Why selected** | AS-IS already has scoped RD CRUD + FE tab + sealed CORE-01/02 boundaries; residual is **execution + period link + enforce/cancel + PAY-read contract** — not greenfield Nest dual or PAY process invent; preserves W1–W11 must_keep; unlocks U89 #14 BA |
| **Assumptions** | CORE-02 F-CORE-EMP-02 / eins **SEALED RETAIN**. CORE-01 public + **`HRM-CORE-CB-403`** **RETAIN**. Nest `/core` DENY **RETAIN**. LIVE rewards/discipline **RETAIN SoT**. `payroll_periods` soft target **RETAIN**. F-PAY-RD-APPLY-01 = **PAY peer OUT**. Decisions ≠ RD SoT. `jd_dynamic_done=false` · `recruitment_uat_ready=false`. |
| **Rejected** | **B** — Nest `/core` dual / second RD SoT wipe · **C** — HOLD / note=DONE / CORE-02=pillar DONE / PAY invent / honesty flip |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | Prefer `/api/hrm/employees/:id/rewards*` + `/discipline*`; `/core/reward-discipline` (+ `/enforce`) = alias / DOC-DELTA only — **DENY** Nest `/core` dual | Cite Network paths for create/enforce |
| **O2** | Field / lifecycle matrix | Title-first · kind · amount≥0 · target period when amount>0 · execution Chờ/Đang/Đã thi hành/Hủy · `payroll_link_status` map · decision_number soft | Field matrix + BR-BP-RD-01 AC |
| **O3** | Enforce / cancel | Enforce → Đang/Đã thi hành + link period; cancel on **unlocked** period → unlink / Hủy; locked period → deny mutate | AC + error codes |
| **O4** | Note-only | amount null/0 **and** no period → `payroll_link_status=none` → **not** PAY-visible | AC special case |
| **O5** | Physical schema | **ADD** link cols on LIVE dual tables (prefer) **or** controlled unify to ONE table with migrate — **DENY** silent wipe | ba-data **LIKELY REQUIRED** |
| **O6** | Period soft target | Soft `payroll_period_id` → LIVE `payroll_periods` (open/adjust); display `payroll_period_ref` optional | Period picker AC |
| **O7** | Decisions boundary | Soft `decision_number` / ref OK — **DENY** `/decisions` as RD SoT | Scope note |
| **O8** | Peers OUT | F-PAY-RD-APPLY-01 / F-PAY-PROCESS-01 / payslip_line invent · CORE-09/05/06/07 · ATT · CORE-02b — **peer** seats only | Scope note |
| **O9** | must_keep CORE-02 / CORE-01 | RETAIN packages/eins · AuthZ-403 · CB-403 · public strip · Nest `/core` DENY · **DENY** claim CORE-02 = CORE pillar DONE · **DENY** reopen J-HRM-CORE-02-01..04 / J-HRM-CORE-01-* / REC without regression | Footer |
| **O10** | Honesty | All flags false · C-SLICE · **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / module CORE·personnel UAT | Footer every evidence |
| **O11** | Display-ready | RD DTO display-ready (labels · amount vi-VN · period label · execution status) — **no** FE invent payslip Net | FE bind |
| **O12** | Journeys | DRAFT `J-HRM-CORE-08-01..04` (create+period · enforce → link visible · cancel unlink · note-only not PAY · Nest `/core` 0 · locked period deny) | BA mint J-* |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | LIVE `/api/hrm/contracts-insurance/compensation-packages*` (+ revise/history/active) · LIVE `/employee-insurances*` · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · CORE-01 public strip · F-CORE-DEP-01 ONE SoT · Nest `/core` DENY · LIVE `/employees/:id/rewards*` + `/discipline*` as RD physical prefer · soft-delete · `resolveHrmListScope` U19 · CORE-02 stamp **`CORE02QC1-MSL80DU6`** · CORE-01 stamp **`CORE01QC1-MSL6WMS7`** · REC seals · honesty false |
| **DENY invent** | Nest `/api/hrm/core/**` as **second** RD SoT · second `hrm_reward_discipline` abandoning LIVE dual without migrate · dual-write payslip amount outside PAY engine · invent full PAY process / formula run from CORE-08 · claim CORE-02 packages = CORE pillar DONE · claim note-CRUD = FR-08 DONE · fold RD into `/decisions` SoT · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module CORE / personnel UAT / Phase1 DONE · reopen sealed J-HRM-CORE-02-01..04 / J-HRM-CORE-01-* / REC J-* without regression |
| **OUT** | F-PAY-PROCESS-01 · F-PAY-RD-APPLY-01 **implementation** · payslip invent · UC-BP-CORE-09* · CORE-05/06/07 · ATT · CORE-02b · REC-03 |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` · recruitment module UAT · personnel / CORE module UAT · `payroll_e2e_ready` |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1–W9 REC | prior GWC stamps | RETAIN |
| W10 CORE-01 | stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-01..04 | RETAIN — **DENY reopen without regression** |
| W11 CORE-02 | stamp **`CORE02QC1-MSL80DU6`** · QA `CORE02QA-MSL7X7SJ` · J-HRM-CORE-02-01..04 | RETAIN — **DENY reopen without regression** · packages **≠** CORE pillar DONE |
| Decisions spine | `/api/hrm/decisions*` | RETAIN peer — **≠** RD payroll handoff SoT |
| Payroll periods | `/api/hrm/payroll/*` · `payroll_periods` | RETAIN soft target — **OUT** process invent this seat |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| RD create/list/update | **F-CORE-RD-01** | **UPGRADE residual** | `GET/POST/PATCH/DELETE …/employees/:id/rewards*` · `…/discipline*` | `POST/GET /api/hrm/core/reward-discipline` | FR-CORE-08 Diễn biến **#1** |
| RD enforce / cancel | **F-CORE-RD-01** (part) | **ADD residual** | `POST …/rewards/:id/enforce` · `…/discipline/:id/enforce` (+ cancel) **or** PATCH status transition same SoT | `POST …/core/reward-discipline/{id}/enforce` | FR-CORE-08 **#2–#4** |
| Payroll link fields | **F-CORE-RD-01** (part) | **ADD residual** | `payroll_link_status` · soft `payroll_period_id` on LIVE dual (ba-data) | same | BR-BP-RD-01 · #3 |
| PAY apply read | **F-PAY-RD-APPLY-01** | **RETAIN peer OUT** | Internal PAY process later — filter enforced + period + amount | paper GET filter | FR-CORE-08 #3 · PAY-07 — **OUT** implement |
| C&B packages | **F-CORE-EMP-02** | **RETAIN SEALED** | `/contracts-insurance/compensation-packages*` | `/core/…/compensation` alias | FR-CORE-02 — **≠ CORE-08** |
| SI eins | **F-CORE-SI-*** | **RETAIN SEALED** | `/employee-insurances*` | paper | CORE-02 must_keep |
| Public profile | **F-CORE-EMP-01** | **RETAIN SEALED** | `/api/hrm/employees*` | `/core/employees` alias | FR-CORE-01 |
| CB / AuthZ rejects | — | **RETAIN** | **`HRM-CORE-CB-403`** · **`HRM-CORE-CB-AUTHZ-403`** | — | CORE-01/02 boundary |

**Mint family (BA/API):** expand `HRM-CORE-RD-*` (VAL-400 amount/period · ENFORCE-409 · DUAL-PERIOD-409 · LOCKED-PERIOD-409 · EMP-INACTIVE-409) · RETAIN `HRM-SCOPE-409` · RETAIN CORE-02 AuthZ/CB codes · **DENY** invent rewrite of sealed `HRM-COMP-*` / `HRM-EINS-*` / `HRM-CORE-CB-*` / public `HRM-EMP-*` success codes.

**U19:** list/get/mutate rewards · discipline · (and period soft resolve) = **same** `resolveHrmListScope` family as employee profile (company membership ladder).

**Serializer / boundary rule (F.1 intent):** RD responses **MAY** include amount + period + link_status on RD endpoints to authorized roles. Public `/employees*` responses **MUST NOT** grow C&B fields (CORE-01/02 must_keep). PAY apply **MUST** filter only enforced/linked cases with amount + matching period — note-only excluded. CORE **MUST NOT** write `pay_payslip_line` in this seat.

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12) CONFIRMED
  → ba-data DATA-01 LIKELY REQUIRED (payroll_link_status + payroll_period_id on LIVE dual · enum map)
  → sa API-01 F.1 physical LOCK (F-CORE-RD-01 UPGRADE + enforce ADD)
  → Dev BE-01 + FE-01
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA when required) + API contracts CONFIRMED per program gate.  
**cấm invent PAY full engine** until PAY pillar seats (#42+).

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | Create RD 2xx · amount>0 without period → VAL/409 · enforce → link_status linked/executed path · cancel on open period unlinks · note-only not PAY-filterable · dual-period 409 · Nest `/core` DENY · CORE-02 packages/AuthZ/CB-403 still PASS · public strip RETAIN |
| L2.5 J-* | FE: create KT/KL + period → enforce → F5 link visible · cancel → gone from open period · note-only never PAY surface · Nest `/core` 0 · no packages regression |
| L3 QC | GWC C-SLICE only · honesty false · DENY module CORE/personnel UAT · DENY claim CORE-02 = pillar DONE · DENY reopen J-CORE-02 / J-CORE-01 without regression · DENY PAY process invent as CORE-08 DONE |

**Proposed journeys (DRAFT for BA):**  
`J-HRM-CORE-08-01` create + period gate · `J-HRM-CORE-08-02` enforce → payroll_link visible F5 · `J-HRM-CORE-08-03` cancel unlink on open period / note-only not PAY · `J-HRM-CORE-08-04` Nest `/core` 0 + CORE-02 must_keep regression + locked-period deny.

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-CORE-08: UPGRADE KT/KL execute + payroll_link on LIVE `/employees/:id/rewards*` + `/discipline*`; paper `/core/reward-discipline` alias only; RETAIN CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public · Nest `/core` DENY; OUT invent PAY full engine; REJECT B Nest `/core` dual + C HOLD/note=DONE/CORE-02=pillar DONE/honesty; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-sa-01.md` |
