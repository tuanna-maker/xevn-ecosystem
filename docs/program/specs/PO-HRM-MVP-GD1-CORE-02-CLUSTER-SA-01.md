# PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01 — Option/F.1 · Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → (ba-data if needed) → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-01 GWC Wave-10 UC-BP-CORE-01 **SEALED** — stamp `CORE01QC1-MSL6WMS7` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qc-01.md` · peer QA `CORE01QA-MSL6U0AV` |
| **uc_ids** | `UC-BP-CORE-02` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#13** after CORE-01 (#12 SEALED) |
| **ref_sa_spine** | Peer public ring [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) · DATA/API CORE-01 · EMP link [`PO-HRM-E2E-LINK-EMP-SA-01.md`](./PO-HRM-E2E-LINK-EMP-SA-01.md) F-CORE-EMP-02 intent · compensation CD-FB-08 LIVE — **reuse · DENY reopen sealed J-HRM-CORE-01-01..04 / REC-00..07 without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · personnel / CORE module UAT **false** · 16 program honesty flags **false** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-02** · Diễn biến #1–#4 · **AC-CORE-CB-01/02** · **BR-BP-SEC-02** · peers CORE-01 SEALED · CORE-02b / CORE-09 / CORE-10 / PAY OUT-or-handoff |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **HR-001** / **PAY-001** |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-CORE-02 · BR-BP-SEC-02 · status **PARTIAL** → this Option unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.2** `hrm_employee_compensation` · **§3.6** enrollment / rate period · **§3.3** dependents GTCG **consumer** (ONE SoT from CORE-01) · **§3.1** public **no** C&B cols |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-CORE-EMP-02** · peers F-CORE-EMP-01 SEALED · F-PAY-CB-READ-01 · F-CORE-SI-* · F-PLT-PAY-COMP consumer — **no wipe**; EXPAND physical residual |
| **OUT** | **UC-BP-CORE-02b** profile groups metadata · **UC-BP-CORE-01a** QSĐ→WH · Nest `/core` dual EMP · invent second compensation SoT abandoning LIVE packages · claim CORE-01 public ring = C&B DONE · reopen sealed CORE-01 / REC · seed · honesty flip · module CORE/personnel UAT · PAY run / payslip invent |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-11 architecture unlock: **C&B employee profile ring** (salary / insurance / tax / bank) vs AS-IS EMP spine + **CORE-01 public allow-list boundary** |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after CORE-01 QC-01 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-CORE-02 · BR-BP-SEC-02 · AC-CORE-CB-01/02 · F-CORE-EMP-02 · F-CORE-EMP-01 **SEALED must_keep** · F-CORE-DEP-01 ONE SoT · `HRM-CORE-CB-403` · U19 scope_parity · GW-HRM-02 (REC ↛ PAY) |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-01 SEALED (`CORE01QC1-MSL6WMS7`):** public GET/PATCH on Nest `@Controller('employees')` → `/api/hrm/employees*` — public-only serializer + **§4.3 CB deny-list → `HRM-CORE-CB-403`** + F5 no leak + dependents `/employees/:id/dependents*` ONE SoT + summary default **no** compensation bands (`include=compensation_summary` gate) + Nest `/core` **DENY**. **C&B AS-IS partial:** (1) **Salary / PC versioned LIVE** — `EmployeeCompensationService` → `POST/GET …/contracts-insurance/compensation-packages*` + revise + history + active on `employee_compensation_packages|lines|history` (versioned `effective_from`/`effective_to`; contract soft `compensation_package_id`). (2) **SI enrollment LIVE** — `@Controller('employee-insurances')` → `/api/hrm/employee-insurances*` on `employee_insurances` (paper §3.6 alias). (3) **Bank / MST** — still often legacy `custom_fields` / form keys; **denied** on public EMP but **no** first-class C&B versioned home sealed as FR-02. (4) **FE** — `EmployeeSalary` behind `view_salary` but still payslip-skewed / local allowances; profile IA still pin salary surface (EMP-SPEC D1 residual). (5) **No** Nest `@Controller('core')` / paper `/core/employees/{id}/compensation` SoT. |
| **Paper target** | FR-UC-BP-CORE-02: (1) C&B opens mật ring with AuthZ + access audit; (2) view/edit salary·PC·NH·MST·SI detail by **effective date** → new version; (3) PAY reads **effective** vars — **not** public EMP DTO; (4) after C&B save, public CORE-01 F5 still **no** leak (AC-CORE-CB-02); (5) dependents GTCG from **ONE** public deps SoT — no duplicate payroll person entry; (6) kiêm nhiệm: C&B CT A ↛ mật CT B. BR-BP-SEC-02 · AC-CORE-CB-01/02. |
| **Gap class** | **impl_gap residual on LIVE C&B spines** — **not** greenfield dual: (1) paper path `/core/employees/{id}/compensation` ≠ LIVE `/contracts-insurance/compensation-packages*` (alias/DOC-DELTA + AuthZ/audit residual); (2) bank/MST physical home incomplete vs §3.2; (3) SI rate-period append may still be thin vs overwrite risk (§3.6 ADD); (4) risk invent Nest `/core` dual EMP/compensation or second `hrm_employee_compensation` abandoning packages; (5) conflate CORE-01 public GWC = C&B DONE; (6) reopen sealed J-HRM-CORE-01 / write C&B onto public EMP; (7) pull CORE-02b / CORE-09 print / PAY process into this seat. |
| **Constraints** | U89 continuous · **preserve** CORE-01 public strip + CB-403 + dependents ONE SoT · Nest `/core` DENY · REC seals · C-SLICE · DENY claim CORE-01 = C&B DONE · DENY flip `recruitment_uat_ready` / `jd_dynamic_done` / personnel UAT · DENY seed · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #13 stalls; BA cannot AC mật ring; Dev invents `/core/compensation` dual or reopens public EMP for salary write; honesty flip; regression CORE-01 strip / CB-403 / deps |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-CORE-01 (SEALED — must_keep)              F-CORE-DEP-01 (RETAIN ONE SoT)
  GET/PATCH /api/hrm/employees*                   …/employees/:id/dependents*
  public allow-list · CB deny → HRM-CORE-CB-403   is_tax_dependent flag (GTCG consumer)
  F5 no C&B leak · Nest /core DENY
       │
       │  boundary (DENY write C&B onto public)
       ▼
  ┌─────────────────────────── FR-UC-BP-CORE-02 ───────────────────────────┐
  │                                                                         │
  │  F-CORE-EMP-02 residual (physical prefer LIVE packages)                 │
  │    GET/POST/revise …/contracts-insurance/compensation-packages*         │
  │    + history + active                                                   │
  │    1) AuthZ C&B (view_salary / membership) + access audit residual      │
  │    2) Versioned base + allowance lines (effective_from)                 │
  │    3) ADD residual bank_* / tax_id on C&B SoT (ba-data) — NOT public    │
  │    4) After mutate → public GET still omit (AC-CORE-CB-02)              │
  │    paper alias ONLY: GET/PATCH /api/hrm/core/employees/{id}/compensation│
  │                                                                         │
  │  F-CORE-SI-* residual (physical prefer LIVE employee-insurances*)       │
  │    Enrollment ONE SoT · rate timeline ADD if overwrite gap              │
  │    Catalog KEY consumer peers RETAIN (INS-TYPE / INSURER)               │
  │                                                                         │
  │  RETAIN: resolveHrmListScope U19 · soft-delete · salary_components CNS  │
  │  RETAIN: summary include=compensation_summary (C&B only)                │
  │  RETAIN: F-PAY-CB-READ-01 peer reads active package — OUT PAY process   │
  └─────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat (peer)
       ▼
  CORE-02b profile groups          CORE-09/10 deep print/catalog admin
  CORE-01a DEC→WH                  PAY process / payslip invent
  = board #19 / peer seats         = OUT unless separate WI

  DENY: Nest /core dual EMP · second compensation table wipe packages
  DENY: claim CORE-01 public = C&B DONE · reopen J-HRM-CORE-01-01..04
  Honesty: C-SLICE ≠ recruitment_uat_ready · ≠ jd_dynamic_done · ≠ CORE UAT
```

**Label lock:** «Hồ sơ vòng C&B» = **salary · PC · bank · MST · SI detail** on LIVE compensation / insurance spines — **not** public EMP mutate; not CORE-02b metadata; not hire; not PAY run.  
**Spine lock:** Physical prefer `/api/hrm/contracts-insurance/compensation-packages*` + `/api/hrm/employee-insurances*` — paper `/core/employees/{id}/compensation` = **alias / DOC-DELTA only** — **DENY** Nest `/core` second EMP/compensation SoT.  
**Boundary lock:** CORE-01 public strip + **`HRM-CORE-CB-403`** + dependents ONE SoT **must_keep** — C&B write **never** via public `/employees*` body.  
**Honesty lock:** Slice GWC later **≠** `recruitment_uat_ready=true` · **≠** `jd_dynamic_done=true` · **≠** module CORE/personnel UAT · **≠** claim CORE-01 = C&B DONE.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| C&B get/patch facade | F-CORE-EMP-02 · `/core/employees/{id}/compensation` | `/contracts-insurance/compensation-packages*` LIVE | **UNLOCK residual** UPGRADE AuthZ/audit + bank/MST home · paper = **alias** |
| Salary / PC versioned | §3.2 `base_salary` · `allowances_json` · `effective_from` | `employee_compensation_packages|lines|history` revise/active | **RETAIN SoT** · UPGRADE residual (AuthZ · component CNS · overlap) |
| Bank / MST | §3.2 `bank_*` · `tax_id` | Legacy CF / form — **denied** on public | **UNLOCK residual** ADD on C&B SoT (ba-data) |
| SI enrollment | §3.6 `employee_insurances` | Nest `/employee-insurances*` LIVE | **RETAIN / UPGRADE** residual |
| SI rate timeline | §3.6 `hrm_insurance_rate_period` | Often on enrollment row (overwrite risk) | **BA/data** — ADD period if required for FR-02 |
| Public EMP | F-CORE-EMP-01 | SEALED Wave-10 | **RETAIN must_keep** · **DENY = C&B DONE** |
| CB reject on public | `HRM-CORE-CB-403` | SEALED | **RETAIN** |
| Dependents / GTCG | §3.3 · PAY-03 read | `employee_dependents` SEALED · `is_tax_dependent` | **RETAIN ONE SoT** · C&B **consumer** only · **DENY** second deps |
| Summary salary bands | C&B dashboard | `include=compensation_summary` gate | **RETAIN** — C&B role only |
| Nest `/core` | paper alias | DENY dual (QC) | **DENY** |
| CORE-02b groups | FR-02b | Settings / later | **OUT** #19 |
| Contract print / SI catalog admin | CORE-09/10 | Peers sealed/partial | **OUT** invent deep |
| PAY process | F-PAY-PROCESS-01 | Peer | **OUT** — read facade only |
| Scope parity U19 | special | `resolveHrmListScope` on packages/insurances | **RETAIN** |
| Module / honesty | program | W1–W10 C-SLICE | **DENY flip** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE: C&B on LIVE compensation-packages + employee-insurances (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** CORE-01 public ring (strip · `HRM-CORE-CB-403` · dependents ONE SoT · Nest `/core` DENY). **Preserve** LIVE Nest `/api/hrm/contracts-insurance/compensation-packages*` (+ revise/history/active) as **salary/PC version SoT** and `/api/hrm/employee-insurances*` as **enrollment SoT**. **UPGRADE** F-CORE-EMP-02 physical residual: C&B AuthZ + access-audit; bank/MST columns or C&B extension on package/header (**ba-data**); ensure post-mutate public F5 still clean (AC-CORE-CB-02); FE bind mật surface (`view_salary`) to packages — not public form finance. Paper `GET/PATCH /api/hrm/core/employees/{id}/compensation` = **alias / DOC-DELTA only**. **OUT** CORE-02b · CORE-01a · PAY process · claim CORE-01 = C&B DONE. |
| **Benefits** | Closes FR-UC-BP-CORE-02 without dual EMP/compensation; preserves Wave-10 must_keep; reuses CD-FB-08 versioning already LIVE; unlocks U89 #13 BA |
| **Costs** | BA AC for AuthZ/audit + bank/MST physical + SI timeline boundary; ba-data **LIKELY REQUIRED** for bank/tax (+ rate period if ADD); FE residual away from payslip-skew / local allowance invent |
| **Risks** | Dev invents Nest `/core` dual — **mitigate:** DENY + O1. Writes salary onto public EMP — **mitigate:** O3 RETAIN CB-403. Claims CORE-01 = C&B DONE — **mitigate:** O9. Flip honesty — **mitigate:** O10. Second compensation table wipe packages — **mitigate:** O1/O5 |

### Option B — Greenfield Nest `/core/employees/{id}/compensation` + second `hrm_employee_compensation` SoT

| | |
|--|--|
| **Description** | Implement paper `/api/hrm/core/…/compensation` as primary Nest controller with new tables dual-write or abandon LIVE `employee_compensation_packages*`; rewrite FE; optional Nest `/core` EMP dual bleed. |
| **Benefits** | Paper path name fidelity |
| **Costs** | Dual SoT; break CD-FB-08 · contract package pointer · PAY active read · CORE-01 boundary tests; high blast |
| **Risks** | Regression W10 public ring · C-SLICE · U89 delay — **REJECT** |

### Option C — HOLD / claim CORE-01 public = C&B DONE / flip honesty / C&B-on-public forever

| | |
|--|--|
| **Description** | Treat Wave-10 public strip GWC or legacy `EmployeeSalary`/form finance as FR-UC-BP-CORE-02 complete; or HOLD board; or flip `recruitment_uat_ready` / personnel UAT; re-enable salary write on public EMP. |
| **Benefits** | Short-term idle |
| **Costs** | BR-BP-SEC-02 unmet; AC-CORE-CB-01/02 unmet; board #13 false DONE or stuck; violates U89 + honesty HOLD |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-CORE-02 + BR-BP-SEC-02) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **8** | 2 | 7 |
| Security / public boundary + U19 | 15 | **9** | 4 | 2 |
| Reliability (ONE compensation + CORE-01 strip) | 15 | **9** | 3 | 2 |
| Maintainability (preserve packages · deps · CB-403) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **8.85** | **3.55** | **2.55** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/core/employees` or `/core/…/compensation` as second SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Second `hrm_employee_compensation` ignore LIVE packages | Schema review | **DENY** second compensation SoT · packages = SoT |
| A | C&B PATCH via public `/employees*` | Contract test | RETAIN **`HRM-CORE-CB-403`** · AC-CORE-CB-01 |
| A | After C&B save, public F5 leaks salary/NH/MST/SI | QA AC-CORE-CB-02 | Serializer strip RETAIN · no write to public cols |
| A | Second dependents SoT for GTCG | Scope | **DENY** · ONE `employee_dependents` · C&B consumer |
| A | Claim CORE-01 public = C&B DONE | Review | **DENY** · O9 |
| A | Reopen sealed J-HRM-CORE-01-01..04 / REC seals | Bus | **DENY reopen** without regression |
| A | Nest `/rec` dual | L1 / browser | **DENY** |
| A | Flip `recruitment_uat_ready` / `jd_dynamic_done` / CORE UAT | QC honesty | **DENY** · C-SLICE |
| A | Seed for U65 | QA evidence | **DENY** seed |
| A | Pull CORE-02b / CORE-09 / PAY process into this WI | Scope | **OUT** O8 |
| B | Dual SoT + break package/PAY active | Integration | Reject B |
| C | Board idle / false DONE | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE**: C&B ring on LIVE **`/contracts-insurance/compensation-packages*`** + **`/employee-insurances*`**; paper `/core/employees/{id}/compensation` = **alias only**; **RETAIN** CORE-01 public strip · **`HRM-CORE-CB-403`** · dependents ONE SoT · Nest `/core` DENY |
| **Why selected** | AS-IS already has versioned compensation packages + SI enrollment + sealed public boundary; residual is **AuthZ/audit + bank/MST home + FE mật bind + F5 isolation** — not greenfield Nest dual; preserves W1–W10 must_keep; unlocks U89 #13 BA |
| **Assumptions** | CORE-01 F-CORE-EMP-01 / F-CORE-DEP-01 **SEALED RETAIN**. `HRM-CORE-CB-403` **RETAIN**. Packages/history/active **RETAIN SoT**. `employee_insurances` **RETAIN** enrollment SoT. PAY reads active package (peer) **OUT** process invent. CORE-02b / CORE-01a / CORE-09 deep = peer OUT. `jd_dynamic_done=false` · `recruitment_uat_ready=false`. |
| **Rejected** | **B** — Nest `/core` dual / second compensation SoT · **C** — HOLD / CORE-01=C&B DONE / honesty flip / C&B-on-public forever |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | Prefer `/api/hrm/contracts-insurance/compensation-packages*` (+ revise/history/active) and `/api/hrm/employee-insurances*`; `/core/employees/{id}/compensation` = alias / DOC-DELTA only — **DENY** Nest `/core` dual | Cite Network paths for C&B mutate |
| **O2** | Field matrix C&B | Base salary + allowance lines (versioned) · bank_account/bank_name · tax_id/MST · SI number / rates timeline — **not** on public EMP DTO | Field matrix + AC-CORE-CB-01/02 |
| **O3** | Public boundary | Public PATCH/POST with C&B keys → **403** `HRM-CORE-CB-403` **RETAIN**; C&B mutate **only** on F-CORE-EMP-02 / SI paths | AC regression J-CORE-01 + J-CORE-02 |
| **O4** | AuthZ + audit | Membership C&B / `view_salary` (or peer permission) required to open/mutate mật; CEO without C&B → deny; access log residual (BR-BP-SEC-02) | AC + mint codes if needed |
| **O5** | Versioning | Revise closes prior segment · append history — **no** silent overwrite of paid period (409 peer) | AC effective_from · overlap |
| **O6** | Bank/MST physical | **ADD** onto compensation package header (or ONE C&B extension table) — **DENY** public `employees` cols / CF as SoT | ba-data **REQUIRED** |
| **O7** | Dependents GTCG | **RETAIN** ONE `employee_dependents` · C&B may set/consume `is_tax_dependent` — **DENY** duplicate person entry on payroll | Boundary AC |
| **O8** | Peers OUT | CORE-02b · CORE-01a · CORE-09 print deep · CORE-10 catalog **admin** invent · PAY process/payslip — **peer** seats only; SI **consumer** KEY assert RETAIN | Scope note |
| **O9** | must_keep CORE-01 | RETAIN public strip · CB-403 · deps · Nest `/core` DENY · **DENY** claim CORE-01 = C&B DONE · **DENY** reopen J-HRM-CORE-01-01..04 / REC seals without regression | Footer |
| **O10** | Honesty | All flags false · C-SLICE · **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / module CORE·personnel UAT | Footer every evidence |
| **O11** | Display-ready | C&B DTO display-ready (labels · amounts · effective dates) — **no** FE invent second SoT from payslip alone | FE bind |
| **O12** | Journeys | DRAFT `J-HRM-CORE-02-01..04` (open mật AuthZ · save version F5 · public still clean · SI/bank/tax path · deny non-C&B) | BA mint J-* |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | LIVE `/api/hrm/employees*` public strip · **`HRM-CORE-CB-403`** · F-CORE-DEP-01 `employee_dependents` ONE SoT · Nest `/core` DENY · LIVE `employee_compensation_packages|lines|history` · LIVE `/employee-insurances*` · soft-delete · `resolveHrmListScope` U19 · salary_components **consumer** assert · CORE-01 stamp **`CORE01QC1-MSL6WMS7`** · REC seals · honesty false |
| **DENY invent** | Nest `/api/hrm/core/**` as **second** EMP/compensation SoT · second compensation table abandoning packages · second dependents SoT · write C&B onto public `/employees*` · claim CORE-01 public = C&B DONE · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module CORE / personnel UAT / Phase1 DONE · reopen sealed J-HRM-CORE-01-01..04 or REC J-* without regression · invent PAY/payslip process from CORE-02 · invent CORE-02b / CORE-01a as required for this seat GWC |
| **OUT** | UC-BP-CORE-02b metadata · UC-BP-CORE-01a deep · UC-BP-CORE-09/10 invent deep · PAY process · REC-03 Campaign |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` · recruitment module UAT · personnel / CORE module UAT · `payroll_e2e_ready` |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1–W9 REC | prior GWC stamps | RETAIN |
| W10 CORE-01 | stamp **`CORE01QC1-MSL6WMS7`** · QA `CORE01QA-MSL6U0AV` · J-HRM-CORE-01-01..04 | RETAIN — **DENY reopen without regression** · public ring **≠** C&B DONE |
| CD-FB-08 packages | compensation create/revise/history/active | RETAIN SoT — deepen AuthZ/bank/MST via named WI |
| EMP HTP / hire | F-CORE-HTP-05 · F-REC-HIRE-01 | RETAIN — **OUT** reopen as CORE-02 scope |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| C&B compensation ring | **F-CORE-EMP-02** | **UPGRADE residual** | `GET/POST …/contracts-insurance/compensation-packages*` · `POST …/:id/revise` · `GET …/history` · `GET …/active` (+ optional thin facade under `/employees/:id/compensation` **same SoT**) | `GET/PATCH /api/hrm/core/employees/{id}/compensation` | FR-CORE-02 Diễn biến **#1–#4** · AC-CORE-CB-01/02 |
| Bank / MST on C&B | **F-CORE-EMP-02** (part) | **ADD residual** | Columns/extension on package SoT (ba-data) — **not** public EMP | same alias | FR-CORE-02 input · #2 |
| SI enrollment | **F-CORE-SI-02/03** (or peer ids BA lock) | **RETAIN / UPGRADE** | `GET/POST/PATCH …/employee-insurances*` | paper enrollment | FR-CORE-02 SI · CORE-10 consumer |
| SI rate period | **F-CORE-SI-RATE** (BA mint) | **ADD residual if gap** | `hrm_insurance_rate_period` append-only | paper §3.6 | FR-CORE-02 timeline |
| Public profile | **F-CORE-EMP-01** | **RETAIN SEALED** | `GET/PATCH /api/hrm/employees*` | `/core/employees/{id}` alias | FR-CORE-01 — **≠ CORE-02** |
| Dependents | **F-CORE-DEP-01** | **RETAIN** | `…/employees/:id/dependents*` | `hrm_dependent` | GTCG consumer · FR-CORE-02 NPT |
| PAY C&B read | **F-PAY-CB-READ-01** | **RETAIN peer** | Active package + deps count + SI | internal | PAY-01 #3 — **OUT** process |
| CB reject public | — | **RETAIN** | Public body deny → **`HRM-CORE-CB-403`** | — | BR-BP-SEC-01/02 boundary |

**Mint family (BA/API):** RETAIN **`HRM-CORE-CB-403`** · expand `HRM-CORE-CB-*` / compensation overlap **409** family as needed · RETAIN `HRM-SCOPE-409` · `HRM-SC-COMP-KEY` consumer · SI `HRM-INS-*` / `HRM-EINS-*` · **DENY** invent rewrite of sealed `HRM-CORE-DEP-*` / `HRM-EMP-*` public success codes.

**U19:** list/get/revise packages · insurances · public employees · dependents = **same** `resolveHrmListScope` family (company membership ladder).

**Serializer rule (F.1 intent):** C&B responses **MAY** include salary/NH/MST/SI **only** on C&B endpoints to authorized roles. Public `/employees*` responses **MUST NOT** include those keys after CORE-02 mutate (AC-CORE-CB-02).

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12) CONFIRMED
  → ba-data DATA-01 LIKELY REQUIRED (bank/MST on C&B SoT · optional SI rate period)
  → sa API-01 F.1 physical LOCK (F-CORE-EMP-02 UPGRADE · SI residual)
  → Dev BE-01 + FE-01
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA when required) + API contracts CONFIRMED per program gate.

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | C&B AuthZ deny non-C&B; create/revise package 2xx; bank/MST persist on C&B SoT; public GET omits C&B; public PATCH salary → CB-403; SI path 2xx; Nest `/core` DENY; deps ONE SoT |
| L2.5 J-* | FE: C&B opens mật → save version → F5 public clean · non-C&B cannot open salary · SI/bank/tax on C&B surface · no Nest `/core` hits |
| L3 QC | GWC C-SLICE only · honesty false · DENY module CORE/personnel UAT · DENY claim CORE-01 = C&B DONE · DENY reopen J-CORE-01 without regression |

**Proposed journeys (DRAFT for BA):**  
`J-HRM-CORE-02-01` open mật + AuthZ · `J-HRM-CORE-02-02` save version + F5 · `J-HRM-CORE-02-03` public still clean (AC-CORE-CB-02) · `J-HRM-CORE-02-04` non-C&B deny / Nest `/core` 0 / CB-403 on public.

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-CORE-02: UPGRADE C&B ring on LIVE compensation-packages + employee-insurances; paper `/core/…/compensation` alias only; RETAIN CORE-01 public strip · CB-403 · dependents ONE SoT · Nest `/core` DENY; REJECT B Nest `/core` dual + C HOLD/CORE-01=C&B DONE/honesty; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-sa-01.md` |
