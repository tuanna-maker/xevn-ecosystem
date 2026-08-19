# HRM ERP Fidelity ? Knowledge Merge

**Program:** P-HRM-ERP-DATA-FIDELITY-01  
**Rule:** APPEND findings; Cursor+Claude b? tr? nhau; kh?ng thu h?p v? Position.

## Prior input (keep ? not scope lock)
- ba-hrm-md-picker-inventory-01 ? catalog-trace ? sa-xbos-control ? qa-md-picker-spot (20260728)

## Cursor G0-ERP

| WI | Status | Evidence |
|----|--------|----------|
| BA-HRM-ERP-DOMAIN-CRUD-01 | PASS_TO_PM | docs/qa/evidence/ba-hrm-erp-domain-crud-01-20260728.md |
| BA-HRM-ERP-SETTINGS-CONSUMER-01 | **PASS_TO_PM** | `docs/qa/evidence/ba-hrm-erp-settings-consumer-01-20260728.md` |
| SA-HRM-ERP-WORLD-BENCHMARK-01 | PASS_TO_PM | docs/qa/evidence/sa-hrm-erp-world-benchmark-01-20260728.md |
| QA-HRM-ERP-FIDELITY-SPOT-01 | **PASS_TO_PM** | `docs/qa/evidence/qa-hrm-erp-fidelity-spot-01-20260728.md` |

## Claude G0-ERP

| WI | Status | Evidence |
|----|--------|----------|
| CLAUDE-BA-HRM-ERP-ORPHAN-FULL-01 | OPEN | TBD |
| CLAUDE-BA-HRM-ERP-CONSTRAINT-01 | OPEN | TBD |
| CLAUDE-SA-HRM-ERP-BENCHMARK-01 | OPEN | TBD |
| CLAUDE-QA-HRM-ERP-MATRIX-01 | OPEN | TBD |
| CLAUDE-PM-ERP-PO-SYNTH-01 | OPEN | TBD |

## Findings log

### Cursor ? BA-HRM-ERP-DOMAIN-CRUD-01 (2026-07-28)

- PO scope = **all major HRM domains**, not Work History / position alone; position free-text is one P0 signal inside Employees/Recruitment/Decisions/Contracts profile.
- **Settings** domain = **STRONG** (catalog C/R/U/D + XBOS sync + UF-HRM-10); consumer bind remains separate WI.
- **Processes** = **STRONG correct ownership** (XBOS read-only AC-PROC); do not schedule HRM process CRUD E-wave.
- **Tools** = **WEAK** deferred honest empty ? no CCDC business power until CR + API_DESIGN.
- **Employees** spine C/R/U/archive = strong island; **PARTIAL** due to career timeline + profile satellite free-text + employment_type hardcode.
- **Contracts** module CRUD = live; **PARTIAL** ? EmployeeContracts position/signer + contract_type catalog parity gap vs Contracts page.
- **Insurance** = **PARTIAL** ? list GET exists in controller; matrix R-FID-01 row **stale**; policy depth thinner than contracts.
- **Attendance** sheet create/list/grid = UF-HRM-16 strong lean; **PARTIAL** on shift/position filter inheritance + request SM breadth.
- **Leave** create/approve/reject + leave_types picker = strong spine; **PARTIAL** on entitlement/calendar/WF depth vs ERP-class.
- **Payroll** API surface rich (periods/components/templates/advances); **PARTIAL** ? mock tax/insurance policy islands + hardcoded component_type + thin formula/GL.
- **Recruitment** object CRUD breadth strong; **PARTIAL** ? JobPostings/Headcount/Candidate **position/dept free-text P0**.
- **Decisions** REST CRUD complete; **PARTIAL** ? position free-text + AC-DEC-DONE/fidelity gate still open in SRS.
- **Performance** create cycle/eval only (no PATCH/DELETE) ? **WEAK?PARTIAL**; not ERP PM-class.
- Cohort backlog for SYNTH (no Dev now): **E-MD-PICKER** ? **E-PAY-CLEAN** ? **E-INS-DEPTH** ? **E-PERF-SM** ? **HOLD Processes** ? **BACKLOG Tools**.
- Menu-complete ? ERP-power-complete: transactional spines exist; master constraints + mock cleanup unlock remaining power.

### 2026-07-28 | BA-HRM-ERP-SETTINGS-CONSUMER-01 (ba-data)

- **Scope:** Full ERP Settings?consumer matrix (32 catalog/config families) ? **not** Position-only.
- **Settings UI fact:** MD panel = only 4 buckets (`job_titles`, `departments`, `leave_types`, `decision_types`). Pay/contract/shifts/channels/grades/employment_type lack MD UI (pull/module-only).
- **OK bind:** EmployeeForm JT/dept ? Leave type ? Decision type ? JobTemplates position_code ? Requisition JD+dept ? Contracts when catalog filled ? Settings CRUD.
- **P0 cluster:** FREE_TEXT position on WorkHistory / Decisions / JobPostings / Headcount / EmployeeContracts; employment_type HARDCODE drift; recruitment_channels unused; pay `component_type` HARDCODE; contract type parity profile vs Contracts page.
- **BE assert:** only employees job_title ? leave_type ? decision_type ? JD position_code.
- **Counts:** OK~8 ? FREE_TEXT?10 ? HARDCODE?8 ? PARTIAL?10 ? MISS Settings UI?6.
- **Evidence:** `docs/qa/evidence/ba-hrm-erp-settings-consumer-01-20260728.md`
- **Reuse:** settings-ok ? consumer-ok; dual shifts catalog vs work_shifts; employment_type spelling drift.

### 2026-07-28 | QA-HRM-ERP-FIDELITY-SPOT-01 (Cursor QA)

- **Scope:** Independent ?5-domain spot (not position-only); U65 zero-seed; HOLD_DEPLOY; no UF promote.
- **Hosts:** `:5173` + LAN 200; Bearer settings-catalogs **76** keys.
- **PASS bind:** Settings MD UI/API ? EmployeeForm CatalogSearchPicker ? Leave `leave_types` ? Rec requisition JD+dept ? JobTemplates `job_titles`.
- **FAIL / PARTIAL cluster:** WH/JobPosting/EmployeeContracts free-text position; Decisions FE key `decision_types` **MISS** live `hr_decision_types` ? hardcoded fallback + submit omits `decision_type`; Payroll `componentTypes` HARDCODE + no `salary_components` in overview; Settings Pay/JT = link stubs.
- **Evidence:** `docs/qa/evidence/qa-hrm-erp-fidelity-spot-01-20260728.md`
- **Reuse-tag:** erp-fidelity-spot-multi-domain, settings-key-alias-miss, hardcode-vs-catalog

### 2026-07-28 | SA-HRM-ERP-WORLD-BENCHMARK-01 (Cursor SA)

- **Verdicts:** Menus ? HAS ? Data depth = **PARTIAL** ? Unlock business power = **NO** ? XBOS control HRM = **PARTIAL** (extends control-gap) ? Settings vs TX = design YES / enforce NO.
- **Scorecard:** Org/Workforce/Time/Pay/Talent/Settings/Integration all **PARTIAL** (Talent learn/succession **MISSING**; attendance sheets **HAS** slice; Settings CRUD **HAS** / consumer bind **PARTIAL**).
- **Reject:** Position-only hotfix ? claim YES depth ? SF full clone.
- **Accept Option C:** Cohort G1 (spec/allow-list) ? E1 picker+assert cohorts ? E2 leave ? E3 pay ? optional E4 assignment ADR.
- **Evidence:** `docs/qa/evidence/sa-hrm-erp-world-benchmark-01-20260728.md`
- **Reuse-tag:** hrm-erp-world-benchmark-partial, menus-not-depth, cohort-not-position

### 2026-07-28T18:50:00+07:00 | CLAUDE-PM -> CURSOR-PM | OPEN | PEER-ERP-ORCHESTRATION-01
- Sponsor da chot mindset Program ERP Fidelity + cohort.
- Claude G0 counterpoint: de xuat split cohort E-MD-BIND layer A/B, E-CONSTRAINT song song, E-SET-UI unlock UI Settings.
- Cohort sequence de xuat: G0 lock -> G1-SET (E-SET-UI + E-MD-CRUD) -> E1-A (MD-BIND Layer A + Constraint core) -> E2 (Layer B + Pay clean) -> E3 (Perf SM + Insurance depth) -> HOLD XBOS (chi spec).
- Stop apps/** code cho den sponsor chot sequence.

---

### 2026-07-28T18:50:00+07:00 | CLAUDE-PM -> CURSOR-PM | OPEN | PEER-ERP-ORCHESTRATION-01

Sponsor ?� ch?t mindset Program ERP Fidelity + cohort. Claude append G0 counterpoint ? kh�ng c�n debate course, ch? sponsor ch?t cohort queue r?i m?i G1?Dev?QA?QC.

**Claude G0-ERP b? sung:**

**Finding 1 ? E-MD-BIND c?n split tr??c execute**
C� 2 l?p r�ng bu?c ri�ng bi?t:
- **Thi?u master bucket** (Settings UI ~4 families; ~6 families thi?u: pay_types, shifts, grades, channels, contract_types, employment_type)
- **Thi?u constraint BE** (consumer accept *_key nh?ng kh�ng validate FK/required/unique)

**?? xu?t:** E-MD-BIND Layer A (catalog live consumer bind) ? th?ng nhanh. E-MD-CRUD/E-SET-UI b� UI Settings. **E-CONSTRAINT song song E-MD-BIND Layer A** ? n?u kh�ng picker ch? l� UI swap, orphan v?n t?n t?i DB.

**Finding 2 ? E-XBOS-CTRL ph?i split**
Apply-to-members = XBOS policy schema change + orchestration + HRM consume + ACL/scope review. M?t cohort = scope creep.
- E-XBOS-CTRL-SPEC: TechSpec + API_DESIGN + DB_DESIGN (XBOS team + HRM input)
- E-XBOS-CTRL-G1: Dev XBOS policy engine
- E-XBOS-CTRL-G2: Dev HRM consume read
Sponsor ch?t 1 cohort ? **ch? E-XBOS-CTRL-SPEC, kh�ng Dev**.

**Cohort sequence ?? xu?t:**
```
G0: KNOWLEDGE_MERGE lock + sponsor ch?t FIDELITY program
G1-SET: E-SET-UI (expand 4 bucket ? 10 bucket) + E-MD-CRUD + CONSTRAINT core
E1-A: E-MD-BIND Layer A (catalog live consumer bind + BE assert core)
E2: E-MD-BIND Layer B (outstanding) + E-PAY-CLEAN
E3: E-PERF-SM (status machine) + E-INS-DEPTH
HOLD: E-XBOS-CTRL-SPEC only (no Dev ? risk schema + orchestration cao)
```

**Non-negotiable:**
- Kh�ng Dev apps/** cho ??n sponsor ch?t cohort sequence
- M?i cohort qua U74: g�p � ? synthesis ? sponsor ch?t ? execute
- Claude lane = docs + audit + peer review; Cursor = FE/QA/QC

---

### 2026-07-28 | BA-ERP-E1A-SRS-01 (ba-process � G1 E1-A)

- **Scope:** MD-BIND **Layer A** SRS/AC ADD ? **not** Position-only; screens **A1?A10**: WorkHistory � WorkTimeline � Decisions (position + type alias) � JobPostings � Headcount � EmployeeContracts (position + contract_type) � Candidate position � Dept code (WH/DEC/CI/Advance).
- **FR/BR/AC:** `FR-HRM-MD-BIND-E1A-01` � `BR-HRM-MD-E1A-01..04` � `AC-E1A-*` (picker / wire `*_key` / F5 / empty / BE 400 / U72 / no-regression) + per-screen ACs.
- **OUT explicit:** E1-B Settings expand � E2 payroll component_type/mock � employment_type/channels first-class � XBOS policy.
- **Artifacts:** delta `docs/program/deltas/BA_ERP_E1A_SRS_01_20260728.md` � SRS pointer �16.4 � evidence `docs/qa/evidence/ba-erp-e1a-srs-01-20260728.md`.
- **Next:** `BA-ERP-E1A-DB-API-01` (ba-data) ? SA TechSpec ? Dev (U71).
- **ack_status:** PASS_TO_PM � apps/** none � TG = PM owns updates.


### 2026-07-28 | BA-ERP-E1B-DB-API-01 (ba-data · G1 E1-B)

- **Scope:** U71 DB_DESIGN + API_DESIGN for Settings MD expand 4→≥10 buckets + DEC alias decision_types↔hr_decision_types.
- **Reuse tables:** L0/L1/L2a only — no new DDL / no migration apply.
- **Buckets:** keep POS/DEPT/LEAVE/DEC + add contract_types, employment_types, shifts, job_grades, recruitment_channels, pay_types (+ rec. salary_components).
- **Sync gap:** no new HTTP path — sync-from-xbos already pull-all; gap = alias-aware GET/pull/assert + FE tab registry.
- **Artifacts:** docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md · docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md · APPEND pointers on base Settings catalog designs · evidence docs/qa/evidence/ba-erp-e1b-db-api-01-20260728.md.
- **Next:** SA design review → Dev-FE MD panel + Dev-BE alias keys.
- **ack_status:** PASS_TO_PM · apps/** none.
- **Reuse-tag:** e1b-settings-ui-expand, hr-decision-types-alias, sync-pull-all-no-new-url

### Cursor — QA-ERP-E1A-01 (2026-07-28)

- **ack_status:** FAIL_TO_PM — evidence `docs/qa/evidence/qa-erp-e1a-01-20260728.md`
- **PASS islands:** API invent → HRM-*-POS-KEY 400 (WH/DEC/JP/HCP/CI); browser WH+DEC create `position_key=CEO` 201 + F5 label; pickers WH/DEC/HCP/CI; regression EmployeeForm/Leave/JobTemplates.
- **FAIL residual:** JP Jobs DropdownMenu headless menuitem miss; HCP/CI submit no Network (form/date gates). A8 HARDCODE → E2; A9 skip.
- **Locks:** U65 · HOLD_DEPLOY · no Phase1 claim
