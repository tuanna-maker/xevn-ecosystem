# BA-HRM-ERP-SETTINGS-CONSUMER-01 — Full ERP Settings→consumer matrix

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-ERP-SETTINGS-CONSUMER-01` |
| **from_role** | pm |
| **to_role** | ba-data |
| **lane** | governance G0-ERP — **no** `apps/**` · **no** migrations · **no** seed |
| **program** | `P-HRM-ERP-DATA-FIDELITY-01` · `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md` |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **extends** | `ba-hrm-md-catalog-trace-01-20260728.md` · `ba-hrm-md-picker-inventory-01-20260728.md` · `ba-hrm-settings-master-data-01-20260723.md` — **extend**, not copy-only |
| **read_first** | DB/API_DESIGN Settings · DANH_MUC · linkage §3 · prior MD trace |

---

## 0. Method & legend

**Question per row (PO / ERP-class):** (A) Must this be Settings-configured? (B) Does XeVN have Settings UI and/or API? (C) XBOS SoT publishable? (D) Do **all** consumers load list by **code**? (E) BE assert on mutate?

| Bind | Meaning |
|------|---------|
| **OK** | Select/combo persists **catalog code**; BE assert when mutate (where applicable) |
| **PARTIAL** | UI Select exists but value=**label/name**, or only some screens bind, or Settings API without Settings UI bucket |
| **MISS** | No Settings surface for key that ERP expects configurable |
| **FREE_TEXT** | Input invents SoT (label as value) |
| **HARDCODE** | Fixed FE/BE enum / constant array — not Settings `effectiveItems` |

**Settings UI reality (2026-07-28):** `MasterDataSettingsPanel` buckets = **only** `job_titles` · `departments` · `leave_types` · `decision_types`. Pay / contract / shifts / recruitment channels / grades / employment_type = **not** in MD panel (may still exist via `GET/POST settings-catalogs` + `sync-from-xbos` pull-all remote keys + module CRUD).

**BE assert callers of `assertCodeInEffectiveCatalog` (grep):** `employees` (`job_title_key`) · `leave-requests` (`leave_type`) · `decisions` (`decision_type`) · `recruitment-catalog` job-templates (`position_code`). **Not** used for: work-timeline position, contracts type, employment_type, shifts, channels, allowance_code, WH dept.

---

## 1. Master matrix — catalog_or_config × Settings × XBOS × consumers × bind × BE assert

### 1.1 Org / position family (ERP: Department · Position · Grade)

| catalog_or_config | Settings UI/API? | XBOS SoT? | Consumer screens | Bind | BE assert? |
|-------------------|------------------|-----------|------------------|------|------------|
| **`job_titles`** (+ alias `positions`, `employee_positions`) | **UI YES** (MD bucket Chức danh · writeKey `job_titles`) · API `GET/POST settings-catalogs*` · sync-from-xbos | **YES** DM §7–10,60 · publish→pull | Settings OK; **EmployeeFormDialog** CatalogSearchPicker → `job_title_key`; **JobTemplatesTab** `position_code`; Profile display | **OK** (those screens) | **YES** employees + job-templates |
| same | same | same | **EmployeeWorkHistory** «Vị trí» | **FREE_TEXT** | **NO** (TEXT `position`) |
| same | same | same | **Decisions** form «Vị trí»; **JobPostingsTab** position; **HeadcountProposalTab** `position_name`; **EmployeeContracts** position; **CandidateFormDialog** position | **FREE_TEXT** | **NO** |
| same | same | same | Attendance sheet «vị trí» from `employees.position` strings | **PARTIAL** / derived | **NO** |
| same | same | same | SalaryTemplateBuilder «vị trí» from employee job_title set | **PARTIAL** | **NO** |
| **`departments`** (+ `department_catalog`, `org_departments`) | **UI YES** (MD bucket) · API same | **YES** DM §3,9 | EmployeeFormDialog + JobRequisitionsTab CatalogSearchPicker | **OK** | Soft / field-level (no dedicated assert helper everywhere) |
| same | same | same | WorkHistory / Decisions / EmployeeContracts / AdvanceRequestsTab Select `dept.name` | **PARTIAL** (name-as-value) | **NO** code assert |
| same | same | same | JobPostingsTab / HeadcountProposalTab department | **FREE_TEXT** | **NO** |
| **`job_grades`** (grades / band) | **UI NO** MD panel · API pull if XBOS assigned | **YES** DM §37–42 (linkage) | Recruitment / JD grade fields | **MISS** / **HARDCODE** residual | **NO** |
| Cost center `cost_centers` | UI NO · API pullable (linkage §3) | Optional XBOS | Payroll / reports | **MISS** consumer picker | **NO** |

### 1.2 Leave / attendance / shifts

| catalog_or_config | Settings UI/API? | XBOS SoT? | Consumer screens | Bind | BE assert? |
|-------------------|------------------|-----------|------------------|------|------------|
| **`leave_types`** | **UI YES** · API YES | **YES** DM §30 | LeaveTab CatalogSearchPicker; Settings leaveTypes | **OK** | **YES** leave create |
| same | same | same | Mobile `leaveTypeLabels` / chart color maps | **HARDCODE** display fallback (label map) | N/A display |
| **`shifts`** (catalog key linkage) vs **`work_shifts`** table | Catalog: pullable · **no** MD Settings bucket · **Module CRUD** Attendance work-shifts API | DM §31 XBOS intended | Attendance shifts tab = company `work_shifts` CRUD (not Settings catalog picker) | **PARTIAL** — company TX config, **not** Settings catalog_key UI | Table CRUD only; **no** catalog assert |
| Attendance update-request types DM §29 | No MD bucket | YES intended | Update-request forms | **MISS** / enum residual | **NO** catalog assert |

### 1.3 Decisions / contracts / employment

| catalog_or_config | Settings UI/API? | XBOS SoT? | Consumer screens | Bind | BE assert? |
|-------------------|------------------|-----------|------------------|------|------------|
| **`decision_types`** | **UI YES** · API YES | **YES** DM §28 | Decisions CatalogSearchPicker | **OK** (type) | **YES** |
| same | — | — | Decisions **position** / signer_position | **FREE_TEXT** | **NO** |
| **`contract_types`** | **UI NO** MD · API overview/pull YES | **YES** DM §27 | **Contracts.tsx** Select from catalog (+ `CONTRACT_TYPE_OPTIONS` fallback) | **PARTIAL** (OK if items; HARDCODE fallback if empty) | **NO** `assertCodeInEffectiveCatalog` |
| same | — | — | **EmployeeContracts** `CONTRACT_TYPES_KEYS` only | **HARDCODE** | **NO** |
| **`employment_type`** (ERP employment class) | Embedded in field catalog unit `select:full-time|…` seed meta · **no** first-class Settings bucket | Partial (field unit / DM §21 related) | EmployeeFormDialog · JobRequisitions · JobPostings · SalaryTemplate · Headcount | **HARDCODE** FE enums (`full-time` / `full_time` drift) | **NO** |
| Gender / ethnicity / education select values DM §22–25 | Field catalogs `hrm_employee_*_fields` | YES intended | EmployeeForm gender Select; labelMaps male/female | **HARDCODE** / field-unit | **NO** catalog assert |
| Emergency relation DM §26 | Field catalogs | YES | Profile emergency | **PARTIAL** | **NO** |

### 1.4 Payroll / pay components

| catalog_or_config | Settings UI/API? | XBOS SoT? | Consumer screens | Bind | BE assert? |
|-------------------|------------------|-----------|------------------|------|------------|
| **`salary_components`** / `payroll_components` | **UI NO** MD bucket · FR-HRM-SC-PAY-01 · **Payroll module CRUD** `salary_components` table · API settings key optional | Hybrid DM §32–34 | SalaryComponentsTab CRUD rows | **PARTIAL** — company component rows OK as TX master; **not** Settings catalog picker for nature | Table CRUD |
| `component_type` nature | Should be Settings enum / catalog | XBOS nature intended | `useSalaryComponents.componentTypes` fixed VI list | **HARDCODE** | Default `'Lương'` BE residual |
| `payroll_templates` | Pull key · no MD UI | YES | Templates / periods | **PARTIAL** | — |
| Allowance codes DM §33 | Should bind salary_components / allowance catalog | YES | EmployeeCompensationPanel draft codes `PHU_CAP_*` + Select | **HARDCODE** bootstrap codes + **PARTIAL** picker | Soft / prior VAL-SET-MD-05 intent |
| Payment method / period enums | Product enums | Optional | Payroll dialogs | **HARDCODE** | N/A |
| `kpi_library` | Pullable | DM §63,71 | Dashboard / performance | **PARTIAL** / reports | — |

### 1.5 Recruitment channels / stages / JD

| catalog_or_config | Settings UI/API? | XBOS SoT? | Consumer screens | Bind | BE assert? |
|-------------------|------------------|-----------|------------------|------|------------|
| **`recruitment_channels`** (candidate source) DM §39 | **UI NO** · API pullable | **YES** | CandidatesTab / CandidateSourceStats `getSourceConfig` hardcode; CandidateForm `source` free/default | **HARDCODE** / **FREE_TEXT** | **NO** |
| Interview / candidate status DM §40–42 | No MD Settings | YES | Interview DTOs / tabs | **HARDCODE** enums (prior G-ORPH-BE-10) | DTO `@IsIn` local |
| Campaign types DM §37–38 | No MD Settings | YES | Plans / campaigns | **MISS** | **NO** |
| Job templates (company JD library) | Company CRUD recruitment API (not Settings catalog_key) | XBOS channels separate | JobTemplatesTab + Requisition JD picker | **OK** for JD id + **OK** position_code | **YES** position_code |

### 1.6 Field schemas / import / fleet / ops / workflow

| catalog_or_config | Settings UI/API? | XBOS SoT? | Consumer screens | Bind | BE assert? |
|-------------------|------------------|-----------|------------------|------|------------|
| `hrm_employee_basic/personal/work/finance_fields` | Settings overview / field editors | DM §15–20 | EmployeeForm dynamic fields; import | **PARTIAL** OK for schema; select values often unit HARDCODE | Import validation partial |
| Spreadsheet headers / aliases | Settings + import catalogs | YES | Import/export | **PARTIAL** EN/VI drift residual | SHEET-422 path |
| `hrm_fleet_*` | Fleet / settings group | DM §46–54 | Fleet vehicles | **HARDCODE** residual in tourism-fleet seed labels | — |
| `operations_request_types` | Pullable | DM §35 | Internal services / ops tasks | **HARDCODE** priority/status residual | — |
| Workflow codes §55–58 | Read-only sync | XBOS SoT | Processes menu | **OK** read-only / empty honest | No HRM mutate |
| RACI / CC catalogs §64–72 | XBOS / CC | YES | Embed CC | Out of HRM Settings consumer depth this WI | — |

---

## 2. Summary counts

| Dimension | Count |
|-----------|------:|
| Distinct **catalog_or_config** rows in §1 (logical keys/families) | **32** |
| Settings **UI bucket present** (MD panel) | **4** (`job_titles`, `departments`, `leave_types`, `decision_types`) |
| Settings/API pull path exists but **no MD UI** (or module-only) | **≥12** (contract_types, shifts, salary_components, recruitment_channels, job_grades, employment_type, field catalogs, fleet, ops, kpi, cost_centers, payroll_templates, …) |
| Consumer bind **OK** (primary happy path) | **8** families/screens (emp form JT/dept, leave type, decision type, JD template+dept+position_code, Contracts when catalog filled, Settings itself) |
| **FREE_TEXT** consumer hits (position/dept invent) | **≥10** screen×field (extend inventory #1,9,16–21,24 + Decisions/Contracts) |
| **HARDCODE** enums | **≥8** (employment_type×N, component_type, contract profile types, gender map, candidate source, interview status, leave color/labels mobile, allowance draft codes) |
| **PARTIAL** (name Select / fallback / module≠Settings) | **≥10** |
| **MISS** Settings UI for ERP-expected config | **≥6** (grades, channels, employment_type first-class, shift catalog vs work_shifts split, attendance update types, campaign types) |
| BE `assertCodeInEffectiveCatalog` coverage | **4** mutate paths only |

**Interpretation:** XeVN has a **working L0→L1→L2a pipe** and a **narrow Settings MD UI**. ERP-class fidelity fails on **(1) orphan consumers** still free-texting catalog fields, **(2) whole domains never given Settings UI** (channels, grades, employment_type, pay nature), **(3) BE assert sparse** outside leave/decision/job_title/JD position.

---

## 3. P0 list (any domain — not Position-only)

| ID | Domain | Gap | Severity | Suggested post-sponsor WI |
|----|--------|-----|----------|---------------------------|
| **P0-WH-POS** | Career / MD | Work History Vị trí Input + no `position_key` + no BE assert | **P0** | `D-FE-HRM-WH-POSITION-PICKER-01` + `D-BE-HRM-WH-POSITION-KEY-01` |
| **P0-DEC-POS** | Decisions | Decisions form Vị trí free-text | **P0** | fold FE picker WI |
| **P0-REC-POS** | Recruitment | JobPostings position+dept Input; Headcount `position_name`+dept Input | **P0** | `D-FE-HRM-REC-POSITION-DEPT-PICKER-01` |
| **P0-CI-POS** | Contracts (profile) | EmployeeContracts position free-text | **P0** | same FE cohort |
| **P0-CI-TYPE-PARITY** | Contracts | Profile contracts HARDCODE types while Contracts page can use catalog | **P0/P1** | `D-FE-HRM-CI-CONTRACT-TYPE-CATALOG-01` |
| **P0-EMP-TYPE** | Cross | `employment_type` HARDCODE + `full-time`/`full_time` drift; no Settings SoT | **P0** data governance | G1 FR+catalog_key `employment_types` + FE unify |
| **P0-REC-CHANNEL** | Recruitment | Candidate `source` not from `recruitment_channels` | **P0** ERP | Settings UI + picker + BE assert |
| **P0-PAY-NATURE** | Payroll | `component_type` HARDCODE vs FR-HRM-SC-PAY-01 | **P0/P1** | Settings nature enum + SalaryComponentsTab bind |
| **P1-DEPT-CODE** | Org | Multiple Select `dept.name` (WH, Decisions, Contracts, Advance) | **P1** | CatalogSearchPicker value=code |
| **P1-SHIFTS-SOT** | Attendance | Dual model: XBOS `shifts` catalog vs HRM `work_shifts` CRUD — Settings consumer unclear | **P1** | SA ownership ADR + consumer bind |
| **P1-GRADES** | Recruitment | `job_grades` pull listed; no Settings UI / consumer | **P1** | MD bucket or Recruitment settings |
| **P2-ATT-POS-FILTER** | Attendance | Sheet filter from free-text employee positions | **P2** | after P0 position keys |

**Must_keep:** Do not rewrite Settings merge / XBOS L0; preserve EmployeeFormDialog / LeaveTab / Decisions.type / JobTemplates position_code **OK** paths; U65 no seed evidence; no Dev until U74 SYNTH + sponsor chốt E-wave **by domain cohort**.

---

## 4. Validation expectations (for E-waves — not implemented here)

| VAL-ID | Condition | Expected |
|--------|-----------|----------|
| VAL-ERP-SC-01 | Mutate catalog-backed field with unknown code | **400** + free-text SoT forbidden message |
| VAL-ERP-SC-02 | Empty Settings catalog | Honest empty + CTA Settings/sync — no invent options |
| VAL-ERP-SC-03 | Persist wire = **code**; UI shows **label** (U72) | F5 row label correct; Network body has code |
| VAL-ERP-SC-04 | Dept/position on **all** mutate forms | Same CatalogSearchPicker family as EmployeeForm |
| VAL-ERP-SC-05 | employment_type / contract_type / channel | One canonical code set across modules (no full-time vs full_time) |
| VAL-ERP-SC-06 | scope_parity U19 | settings list/items + consumer company partition same resolver (`main`→holding) |

---

## 5. Traceability spine (sample)

| Spec | API | DB | FE | Test / journey |
|------|-----|----|----|----------------|
| BR-HRM-MD-01 · AC-HRM-PICKER-01 | `GET …/settings-catalogs/{key}/items` | synced + extension | All mutate pickers | UF Settings + consumer · J-* |
| FR-HRM-SC-POS-01 | sync-from-xbos · items | `job_titles` / `departments` | MD panel + EmployeeForm | UF-HRM-10 · AC-FID-10 |
| FR-HRM-SC-LEAVE-01 | leave create assert | `leave_requests.leave_type` | LeaveTab | UF leave |
| FR-HRM-SC-DEC-01 | decisions assert | `hr_decisions.decision_type` | Decisions type | AC-DEC-* |
| FR-HRM-SC-PAY-01 | payroll components | `salary_components` + optional catalog | SalaryComponentsTab | P0-PAY-NATURE open |
| DM §27 contract_types | pull + overview | synced | Contracts vs EmployeeContracts | parity P0-CI-TYPE |
| DM §31/39 shifts / channels | pull | synced / work_shifts | Attendance / Candidates | P1-SHIFTS · P0-REC-CHANNEL |
| Prior MD trace | — | `employee_work_timeline.position` TEXT | WorkHistory | P0-WH-POS |

---

## 6. Data quality risks

| Risk | Mitigation |
|------|------------|
| Settings OK ≠ all consumers OK | Matrix bind column per screen (this evidence) — never close on Settings CRUD alone |
| Dual employment_type spellings | Canonical catalog codes + migrate map |
| `shifts` catalog vs `work_shifts` table | SA ownership before Dev dual-write |
| Contract type catalog vs HARDCODE profile form | Unify to one picker SoT |
| Historical free-text rows | Soft label snapshot + optional backfill; new rows require code |
| U65 seed temptation when catalogs empty | BLOCKED-DATA + FE Settings sync/extension only |

---

## 7. Residuals (governance)

- Claude peer: orphan-full + constraint WIs → merge SYNTH  
- SA world benchmark + XBOS control gap (parallel)  
- BA-process domain CRUD form completeness (sibling G0)  
- No Dev `apps/**` until sponsor chốt E-wave cohorts  

---

## Handoff

```yaml
work_item_id: BA-HRM-ERP-SETTINGS-CONSUMER-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-hrm-erp-settings-consumer-01-20260728.md
knowledge_merge: docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md (APPENDED)
lane: governance
apps_touched: none
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: SYNTH-HRM-ERP-FIDELITY-01 (after Claude G0 seats PASS or timeout)
from_role: pm
to_role: pm (Cursor-PM) + peer Claude
entry_criteria: Cursor BA-HRM-ERP-SETTINGS-CONSUMER-01 PASS_TO_PM at docs/qa/evidence/ba-hrm-erp-settings-consumer-01-20260728.md; sibling BA-HRM-ERP-DOMAIN-CRUD-01 + SA-HRM-ERP-WORLD-BENCHMARK-01 + QA-HRM-ERP-FIDELITY-SPOT-01 + Claude orphan/constraint/benchmark findings in HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md
exit_criteria: SYNTH table agree/diverge; P0 backlog by domain cohort (WH/DEC/REC/CI position FREE_TEXT; employment_type; recruitment_channels; pay nature; contract_type parity; shifts SoT) — U74 sponsor chốt BEFORE any apps/** Dev
cấm: thu hẹp chỉ Vị trí; Dev apps/** trước sponsor chốt; seed U65; Phase1/PROD claim
```

---

**ack_status:** `PASS_TO_PM`
