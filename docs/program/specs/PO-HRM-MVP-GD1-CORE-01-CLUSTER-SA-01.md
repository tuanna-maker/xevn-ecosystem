# PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01 — Option/F.1 · Hồ sơ vòng công khai (hành chính / phúc lợi)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → (ba-data if needed) → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-01 GWC Wave-9 UC-BP-REC-07 **SEALED** — stamp `REC07QC1-MSL5WXU5` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-CORE-01` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#12** after REC-07 (#11) |
| **ref_sa_spine** | Peer hire [`PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md) · EMP link [`PO-HRM-E2E-LINK-EMP-SA-01.md`](./PO-HRM-E2E-LINK-EMP-SA-01.md) F-CORE-EMP-01/02 ring · F-CORE-HTP-05 — **reuse · DENY reopen sealed REC-00..07 / J-HRM-REC-07-01..04 without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · personnel / CORE module UAT **false** · 16 program honesty flags **false** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-01** · Diễn biến #1–#4 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 · **BR-BP-SEC-01** · peers CORE-02 / CORE-01a OUT-or-handoff |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **REQ_HR_001** / **HR-001** |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-CORE-01 · BR-BP-SEC-01 · status **PARTIAL** → this Option unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.1** `hrm_employee` public · **§3.3** `hrm_dependent` · **§3.2** C&B **OUT** this seat · `candidate_id` soft audit REC |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-CORE-EMP-01** · peers F-CORE-EMP-02 · F-CORE-HTP-05 · F-REC-HIRE-01 SEALED — **no wipe**; EXPAND physical residual |
| **OUT** | **UC-BP-CORE-02** C&B mutate · **UC-BP-CORE-01a** QSĐ→WH deep · Nest `/rec` dual · invent second EMP SoT · claim REC-07 hire = CORE profile DONE · reopen sealed REC-00..07 / J-HRM-REC-07-01..04 · seed · honesty flip · module REC/CORE UAT |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-10 architecture unlock: **Public employee profile ring** (admin / welfare) vs AS-IS EMP spine + REC-07 hire soft-link handoff |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after REC-07 QC-01 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-CORE-01 · BR-BP-SEC-01 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 · F-CORE-EMP-01 · F-CORE-HTP-05 · F-REC-HIRE-01 (SEALED handoff) · U19 scope_parity · GW-HRM-02 (REC ↛ PAY) |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **EMP spine LIVE:** Nest `@Controller('employees')` → `GET/POST/PATCH /api/hrm/employees*` on `public.employees` (+ `custom_fields` JSONB · open status catalog · `candidate_id` soft reverse from REC-07). **No** Nest `@Controller('core')` / `/api/hrm/core/employees*` SoT. **Partial ring UX:** `EmployeeFormDialog` gates C&B fields by `view_salary` (AC-CORE-PUB-01 FE partial) but **same form schema** still carries `salary` / `bank_*` / `tax_code` / SI numbers; profile still has `EmployeeSalary` surface; list summary still aggregates salary bands (`EMPLOYEE_SALARY_NUM_SQL`). **Dependents / quà 1/6:** paper `hrm_dependent` — **ABSENT** as first-class Nest CRUD on employee public profile (payroll tax uses dependent **count** only — ≠ CORE-01 person rows). **REC-07 SEALED (`REC07QC1-MSL5WXU5`):** accept-offer create+prefill → `pending_docs` + soft `recruitment_candidates.employee_id` + reverse `employees.candidate_id` + APP-02 hired-outcome + HTP-05 — handoff **into** CORE profile, **≠** CORE-01 public ring DONE. |
| **Paper target** | FR-UC-BP-CORE-01: (1) open public profile / dashboard read; (2) serializer returns **public-only** fields; (3) save admin / personal / dependents on public SoT; (4) F5 still no C&B leak; (5) welfare filter uses dependent DOB / eligibility — **not** C&B ring; (6) salary/NH/MST/SI detail → CORE-02 / HĐ–BH only. BR-BP-SEC-01 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01. |
| **Gap class** | **impl_gap residual on LIVE EMP spine** — **not** greenfield dual: (1) paper path `/core/employees` ≠ LIVE `/employees` (alias/DOC-DELTA needed); (2) public serializer + PATCH reject C&B keys incomplete (BE may still accept / expose C&B-shaped keys via custom_fields or legacy cols); (3) dependents person rows ABSENT; (4) risk invent Nest `/core` dual EMP SoT or second `hrm_employee` table; (5) conflate REC-07 hire create = CORE-01 DONE; (6) reopen sealed J-HRM-REC-07 / Nest `/rec` dual; (7) pull CORE-02 / CORE-01a into this seat. |
| **Constraints** | U89 continuous · **preserve** REC-00..07 seals · EMP create/list/get · HTP-05 · soft `candidate_id` · C-SLICE · DENY Nest `/rec` dual · DENY second EMP SoT · DENY claim REC-07 hire = CORE profile DONE · DENY flip `recruitment_uat_ready` / `jd_dynamic_done` · DENY seed · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #12 stalls; BA cannot AC ring split; Dev invents `/core/employees` dual or empty rewrite of EMP; honesty flip; regression hire soft-link / HTP; C&B leak on public F5 |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-07 (SEALED — must_keep)                 F-CORE-HTP-05 (RETAIN LIVE)
  POST …/recruitment/…/accept-offer                 GET …/employees/:id/hire-readiness
  create+prefill → employees.pending_docs
  soft stamp + reverse candidate_id
  APP-02 hired-outcome ONLY
       │
       │  employee_id handoff (≠ CORE-01 DONE)
       ▼
  ┌─────────────────────────── FR-UC-BP-CORE-01 ───────────────────────────┐
  │                                                                         │
  │  F-CORE-EMP-01 residual (physical prefer LIVE)                          │
  │    GET/PATCH /api/hrm/employees/:id  (+ list GET /employees)            │
  │    1) Public-only serializer (strip/omit C&B keys)                      │
  │    2) PATCH admin/personal/welfare fields ONLY                          │
  │    3) Body contains C&B keys → HRM-CORE-CB-403 (or mint peer)           │
  │    4) F5 reload → still no salary/NH/MST/SI detail on public DTO        │
  │    paper alias ONLY: GET/PATCH /api/hrm/core/employees/{id}             │
  │                                                                         │
  │  F-CORE-DEP-01 residual (ADD or UPGRADE if stub found)                  │
  │    CRUD dependents on employee — relation + DOB for quà 1/6             │
  │    physical prefer: /api/hrm/employees/:id/dependents*                  │
  │    paper hrm_dependent / employee_dependents — ONE SoT                  │
  │                                                                         │
  │  RETAIN: resolveHrmListScope U19 · soft-delete · candidate_id soft      │
  │  RETAIN: EMP open status / custom_fields consumer allow-list peers      │
  └─────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat (peer)
       ▼
  F-CORE-EMP-02 compensation          CORE-01a DEC→WH
  CORE-02 C&B ring                    F-CORE-DEC/WH family
  = next board #13 / peer seats       = OUT reopen unless separate WI

  DENY: Nest /rec dual · second EMP table · claim hire = public ring DONE
  Honesty: C-SLICE ≠ recruitment_uat_ready · ≠ jd_dynamic_done · ≠ CORE UAT
```

**Label lock:** «Hồ sơ vòng công khai» = **admin + welfare (dependents) public ring** on LIVE EMP — not C&B mutate; not QSĐ→WH; not accept-offer hire.  
**Spine lock:** Nest physical `/api/hrm/employees*` — **DENY** greenfield Nest `/core/employees*` as second SoT (paper `/core/*` = **alias / DOC-DELTA only**).  
**Hire lock:** REC-07 soft-link + HTP-05 **RETAIN** — **DENY** claim hire create = CORE-01 DONE.  
**Ring lock:** Public GET/PATCH **must_keep** BR-BP-SEC-01 — C&B only via CORE-02 peer.  
**Honesty lock:** Slice GWC later **≠** `recruitment_uat_ready=true` · **≠** `jd_dynamic_done=true` · **≠** module CORE/REC UAT.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Public get/patch | F-CORE-EMP-01 · `/core/employees/{id}` | `/api/hrm/employees*` LIVE | **UNLOCK residual** UPGRADE serializer + CB reject · paper = **alias** |
| Public field set | §3.1 name/code/dept/position/phone/email/status | LIVE employees + custom_fields | **RETAIN SoT** · BA field matrix |
| C&B exclusion | BR-BP-SEC-01 · AC-CORE-PUB-01/02 | FE partial `view_salary` gate; BE/summary still salary-aware | **UNLOCK residual** strip/reject + F5 AC |
| C&B mutate surface | F-CORE-EMP-02 | EmployeeSalary / form finance tab | **OUT** → CORE-02 (#13) |
| Dependents / quà 1/6 | §3.3 `hrm_dependent` | ABSENT person CRUD on EMP public | **UNLOCK residual** ADD |
| Tax dependent flag | `is_tax_dependent` (C&B consumer) | Payroll count only | **BA lock** — public may store person; tax flag may gate by role (O6) |
| Hire create+soft-link | F-REC-HIRE-01 | SEALED Wave-9 | **RETAIN must_keep** · **DENY = CORE-01 DONE** |
| HTP hire-readiness | F-CORE-HTP-05 | LIVE `GET …/hire-readiness` | **RETAIN** |
| Reverse `candidate_id` | §3.1 soft audit | LIVE ADD from REC-07 | **RETAIN** |
| APP-02 hired-outcome | F-REC-APP-02 | SEALED | **RETAIN · DENY reopen** |
| Nest `/rec` | paper alias only | DENY dual (QC) | **DENY** |
| QSĐ → work history | CORE-01a | Peer EMP-SA-01 | **OUT** this seat |
| Scope parity U19 | special | `resolveHrmListScope` | **RETAIN** |
| Module / honesty | program | W1–W9 C-SLICE | **DENY flip** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE: Public ring on LIVE `/employees*` + dependents ADD (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** Nest `/api/hrm/employees*` + REC-07 soft-link/`candidate_id` + HTP-05 + open status/custom_fields consumers. **UPGRADE** F-CORE-EMP-01 physical on LIVE path: public-only serializer; PATCH rejects C&B keys (`HRM-CORE-CB-403` family); F5 proves no leak. **ADD** dependents CRUD (F-CORE-DEP-01) for welfare / quà 1/6 on ONE SoT (`employee_dependents` / paper `hrm_dependent` alias). Paper `GET/PATCH /api/hrm/core/employees/{id}` = **alias / DOC-DELTA only** — **DENY** second Nest EMP SoT. **OUT** CORE-02 compensation write · CORE-01a DEC→WH · claim REC-07 hire = this UC DONE. |
| **Benefits** | Closes FR-UC-BP-CORE-01 ring split without dual EMP; preserves hire handoff; unlocks U89 #12 BA; minimal blast vs greenfield `/core` |
| **Costs** | BA AC for field matrix + dependents + CB-403 mint; ba-data **LIKELY REQUIRED** for dependents physical + public column allow-list; FE residual to hide/redirect C&B (AC-CORE-CB-MAP-01) |
| **Risks** | Dev invents `/core/employees` dual — **mitigate:** DENY + O1. Claims hire = CORE DONE — **mitigate:** O9. Flip honesty — **mitigate:** O10. Pull CORE-02 into seat — **mitigate:** O8 OUT |

### Option B — Greenfield Nest `/core/employees*` + second EMP / dependents SoT

| | |
|--|--|
| **Description** | Implement paper `/api/hrm/core/employees*` as primary Nest controller with new `hrm_employee*` tables dual-write or abandon LIVE `/employees`; rewrite FE bind; optional Nest `/rec` bleed. |
| **Benefits** | Paper path name fidelity |
| **Costs** | Dual SoT; break REC-07 soft-link consumers · HTP · list/summary · catalog; high blast |
| **Risks** | Regression W1–W9 · C-SLICE · U89 delay — **REJECT** |

### Option C — HOLD / claim REC-07 hire = CORE-01 DONE / flip honesty / C&B-on-public forever

| | |
|--|--|
| **Description** | Treat accept-offer create+prefill GWC or existing EmployeeForm as FR-UC-BP-CORE-01 complete; or HOLD board; or flip `recruitment_uat_ready` / personnel UAT; leave C&B fields on public form as “good enough”. |
| **Benefits** | Short-term idle |
| **Costs** | BR-BP-SEC-01 unmet; dependents/welfare missing; board #12 false DONE or stuck; violates U89 + honesty HOLD |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-CORE-01 + ring split) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **8** | 2 | 7 |
| Security / BR-BP-SEC-01 + U19 | 15 | **9** | 4 | 3 |
| Reliability (ONE EMP SoT + hire soft-link) | 15 | **9** | 3 | 3 |
| Maintainability (preserve REC-07 · HTP · EMP) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **8.85** | **3.55** | **2.80** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/core/employees` as second SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Second `hrm_employee` / ignore LIVE `employees` | Schema review | **DENY** second EMP SoT |
| A | Public GET still returns salary/NH/MST/SI | QA F5 AC-CORE-PUB-02 | Serializer strip + CB-403 |
| A | PATCH accepts C&B keys silently | Contract test | Reject body keys · mint `HRM-CORE-CB-403` |
| A | Dependents invent as PAY SoT rewrite | Scope | ONE dependents SoT · PAY reads later · **DENY** invent payroll |
| A | Claim REC-07 hire = CORE-01 DONE | Review | **DENY** · O9 |
| A | Reopen sealed J-HRM-REC-07-01..04 / REC-00..06 | Bus | **DENY reopen** without regression |
| A | Nest `/rec` dual | L1 / browser | **DENY** |
| A | Flip `recruitment_uat_ready` / `jd_dynamic_done` / CORE UAT | QC honesty | **DENY** · C-SLICE |
| A | Seed for U65 | QA evidence | **DENY** seed |
| A | Pull CORE-02 compensation write into this WI | Scope | **OUT** O8 |
| A | Pull CORE-01a QSĐ→WH as required for CORE-01 GWC | Scope | **OUT** O8 · peer |
| B | Dual SoT + break hire soft-link | Integration | Reject B |
| C | Board idle / false DONE | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE**: public ring on LIVE `/api/hrm/employees*` + **ADD** dependents; paper `/core/employees` = **alias only** |
| **Why selected** | AS-IS already has EMP spine + REC-07 soft-link + HTP-05; residual is **ring enforcement + welfare dependents** — not greenfield Nest dual; preserves W1–W9 must_keep; unlocks U89 #12 BA |
| **Assumptions** | REC-07 F-REC-HIRE-01 **SEALED RETAIN**. HTP-05 **RETAIN**. `employees.candidate_id` soft **RETAIN**. APP-02 **RETAIN**. CORE-02 / CORE-01a = peer OUT. `jd_dynamic_done=false` · `recruitment_uat_ready=false`. Custom-field consumer allow-list peers **RETAIN** (no invent Nest CF definition SoT). |
| **Rejected** | **B** — Nest `/core` dual / second EMP SoT · **C** — HOLD / hire=CORE DONE / honesty flip / C&B-on-public forever |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | `/api/hrm/employees*` only; `/core/employees*` = alias / DOC-DELTA | Cite Network path for get/patch public |
| **O2** | Public field allow-list | Name, code, work email/phone, personal phone, dept, position_key, manager, status (open catalog), hire/start dates, emergency contact, address/CCCD as checklist — **no** salary/NH/MST/SI detail | Field matrix + AC-CORE-PUB |
| **O3** | C&B reject | PATCH/POST body with C&B keys → **403** `HRM-CORE-CB-403` (RETAIN/mint) · GET public DTO omits those keys even if legacy DB cols exist | AC + mint codes |
| **O4** | FE surface | Non-C&B roles: no finance inputs on create/edit public; C&B block **hidden or redirect** to CORE-02 / HĐ–BH (AC-CORE-CB-MAP-01) — **not** same-form mutate | FE AC U65 |
| **O5** | Dependents | **ADD** person rows: relation + DOB (+ name) for quà 1/6; soft-delete; scope = employee company | ba-data **REQUIRED** · AC welfare |
| **O6** | Tax flag | `is_tax_dependent` may exist on row but **tax detail / GTCG mutate** = CORE-02 / PAY-03 peer — public may show limited welfare view without C&B leak | Boundary AC |
| **O7** | Hire handoff | Employee from REC-07 appears on public list/get with prefill + `pending_docs` · soft `candidate_id` visible display-ready if BA wants audit — **DENY** re-key UV fields as “new CORE create” | AC link from hire · **≠** reopen J-07 without regression |
| **O8** | Peers OUT | CORE-02 F-CORE-EMP-02 · CORE-01a DEC/WH · CORE-03 checklist · CORE-09/10 — **peer** seats only | Scope note |
| **O9** | must_keep REC | RETAIN F-REC-HIRE-01 · APP-02 · HTP-05 · soft stamp · Nest `/recruitment/*` · DENY Nest `/rec` · DENY claim hire = CORE-01 DONE · DENY reopen J-HRM-REC-07-01..04 / REC-00..06 without regression | Footer |
| **O10** | Honesty | All flags false · C-SLICE · **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / module CORE·REC UAT | Footer every evidence |
| **O11** | Display-ready | List/get/patch public DTO display-ready (labels) — **no** FE join invent for dept/position/status | FE bind |
| **O12** | Journeys | DRAFT `J-HRM-CORE-01-01..04` (open public · save admin F5 · CB reject/hide · dependents welfare) | BA mint J-* |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | LIVE `/api/hrm/employees*` SoT · soft-delete · `resolveHrmListScope` U19 · open employment status / document / custom-field **consumer** peers · `employees.candidate_id` soft · F-REC-HIRE-01 accept-offer create+prefill+soft-link · F-REC-APP-02 hired-outcome · F-CORE-HTP-05 hire-readiness · REC-00..07 sealed GWC stamps · honesty false |
| **DENY invent** | Nest `/api/hrm/core/employees*` as **second** SoT · Nest `/rec` dual · second EMP table · second dependents SoT · claim REC-07 hire = CORE-01 DONE · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module REC or CORE UAT / Phase1 DONE · reopen sealed J-HRM-REC-07-01..04 or REC-00..06 J-* without regression · invent PAY/payslip from CORE-01 · invent CORE-02 compensation write in this WI · invent CORE-01a QSĐ→WH as required for this seat GWC |
| **OUT** | UC-BP-CORE-02 C&B mutate · UC-BP-CORE-01a deep · UC-BP-CORE-03/09/10 invent · REC-03 Campaign |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` · recruitment module UAT · personnel / CORE module UAT |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1–W8 REC | prior GWC stamps | RETAIN |
| W9 REC-07 | stamp **`REC07QC1-MSL5WXU5`** · QA `REC07QA2-MSL5SJDU` · J-HRM-REC-07-01..04 | RETAIN — **DENY reopen without regression** · hire soft-link **≠** CORE-01 DONE |
| EMP HTP / link | F-CORE-HTP-05 · EMP-SA-01 overlays | RETAIN — deepen only via named WI |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| Get / patch public profile | **F-CORE-EMP-01** | **UPGRADE residual** | `GET/PATCH /api/hrm/employees/:id` (+ `GET /employees` list public projection) | `GET/PATCH /api/hrm/core/employees/{id}` | FR-CORE-01 Diễn biến **#1–#4** · AC-CORE-PUB-01/02 |
| Dependents welfare | **F-CORE-DEP-01** | **ADD residual** | `GET/POST/PATCH/DELETE /api/hrm/employees/:id/dependents*` (BA lock verbs) | paper `hrm_dependent` | FR-CORE-01 #3–#4 · quà 1/6 |
| C&B compensation | **F-CORE-EMP-02** | **OUT this seat** | — (peer CORE-02) | `/core/employees/{id}/compensation` | FR-CORE-02 |
| Hire readiness | **F-CORE-HTP-05** | **RETAIN** | `GET /api/hrm/employees/:id/hire-readiness` | — | REC-07 handoff · AC-HTP-05 |
| Accept-offer hire | **F-REC-HIRE-01** | **RETAIN SEALED** | `POST /api/hrm/recruitment/applications/:id/accept-offer` | `/rec/…/accept-offer` alias | FR-07 — **≠ CORE-01** |
| Stage hired-outcome | **F-REC-APP-02** | **RETAIN** | `POST …/candidates/:id/transitions` | — | FR-05/07 |

**Mint family (BA/API):** `HRM-CORE-CB-403` RETAIN/expand · `HRM-CORE-PUB-*` / `HRM-CORE-DEP-*` as needed · RETAIN `HRM-SCOPE-409` · `HRM-EMP-*` create codes · `HRM-HTP-NO-ACTIVE-CONTRACT` · **DENY** invent `HRM-REC-*` rewrite.

**U19:** list employees / get employee / patch public / dependents = **same** `resolveHrmListScope` as hire get-by-id.

**Serializer rule (F.1 intent):** Public response **MUST NOT** include `base_salary` / `salary` / `bank_*` / `tax_code` / `tax_id` / `social_insurance_no` / detailed SI rates — even if legacy storage exists; mutate of those keys on this endpoint **MUST** fail closed.

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12) CONFIRMED
  → ba-data DATA-01 LIKELY REQUIRED (dependents physical + public allow-list / CB strip map)
  → sa API-01 F.1 physical LOCK (F-CORE-EMP-01 UPGRADE · F-CORE-DEP-01 ADD)
  → Dev BE-01 + FE-01
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA when required) + API contracts CONFIRMED per program gate.

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | GET public omits C&B; PATCH admin 2xx; PATCH with salary/NH/MST → CB-403; dependents CRUD 2xx; scope 409; Nest `/rec` DENY; hire soft-link still resolvable |
| L2.5 J-* | FE: open hồ sơ công khai → save hành chính → F5 no C&B leak · dependents for quà 1/6 · non-C&B role cannot edit finance · hire-created emp visible without re-key |
| L3 QC | GWC C-SLICE only · honesty false · DENY module CORE/REC UAT · DENY claim REC-07 = CORE-01 |

**Proposed journeys (DRAFT for BA):**  
`J-HRM-CORE-01-01` open+save public · `J-HRM-CORE-01-02` F5 no C&B leak · `J-HRM-CORE-01-03` dependents welfare · `J-HRM-CORE-01-04` CB reject / redirect map.

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-CORE-01: UPGRADE public ring on LIVE `/employees*` + ADD dependents; paper `/core/employees` alias only; RETAIN REC-07 hire soft-link · HTP-05 · APP-02; REJECT B Nest `/core` dual EMP + C HOLD/hire=CORE DONE/honesty; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-sa-01.md` |
