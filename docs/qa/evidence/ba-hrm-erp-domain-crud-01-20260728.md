# BA-HRM-ERP-DOMAIN-CRUD-01 — HRM ERP domain CRUD scorecard (G0-ERP)

**work_item_id:** `BA-HRM-ERP-DOMAIN-CRUD-01`  
**from_role:** pm → **to_role:** ba-process  
**lane:** governance G0-ERP — **no** `apps/**` · **no** seed · **no** Phase1 claim  
**date:** 2026-07-28  
**program:** `P-HRM-ERP-DATA-FIDELITY-01` · `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md`

## PO question (sponsor mindset)

> Menu đủ chưa đủ. Mỗi domain: form CRUD + create-new + ràng buộc (required / FK / uniqueness / status machine) đã **đủ sức mạnh nghiệp vụ ERP** chưa? Còn thin / mock / free-text / thiếu validation ở đâu?

**Position free-text** = triệu chứng ví dụ (input từ `ba-hrm-md-picker-inventory-01`) — **không** khóa phạm vi scorecard này.

---

## Method

| Source | Use |
|--------|-----|
| `docs/hrm/SRS.md` §13–§16 | UC embed + BR-HRM-MD-01 + FR-HRM-SC-* + AC-DEC / AC-PROC / AC-CO-* |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | Menu ↔ API ↔ FK ↔ density |
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` | UC pack HRM-EM / CI / AT / PR / RC / SC / PF / OP |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §4 | UF-HRM mutate / menu load flags (input — not re-claim) |
| Prior G0 picker | `docs/qa/evidence/ba-hrm-md-picker-inventory-01-20260728.md` |
| Grep read-only | Controllers `apps/api/hrm-api/src/**` + FE pages under `apps/web/hrm/src` (no edits) |

### Verdict legend (domain power)

| Verdict | Meaning |
|---------|---------|
| **STRONG** | Create/read/update (+ delete or soft-delete where SRS requires) live; constraints (FK/catalog/required/status) match SRS enough to unlock core ERP use of the domain |
| **PARTIAL** | Spine C/R/U exists and some UF 🟢, but thin constraints, orphan pickers, mock islands, missing delete/status depth, or fidelity NOT DONE |
| **WEAK** | Deferred / mock / stub / wrong-ownership CRUD / no create path / cannot unlock domain business power |

### CRUD column shorthand

`C` = create-new FE→API · `R` = list/detail · `U` = update · `D` = delete or archive/restore · `—` = out of scope by SRS (e.g. LE invent on HRM)

---

## Domain scorecard (≥10 domains)

| Domain | C | R | U | D | Constraints (required / FK / unique / status) | Spec ref | Verdict | Top gaps (P0–P3) |
|--------|---|---|---|---|-----------------------------------------------|----------|---------|------------------|
| **1. Company / Org** | — (LE invent = XBOS) | ✅ | ✅ legal PUT bind | — | Headcount from `employees/summary` (BR-CO-HC-01); industry ← `business_lines` ≠ `entity_type` (FR-HRM-CO-IND-01); slug↔LE bridge | UC-HRM-CO-01 · FR-HRM-CO-HC-01 · FR-HRM-CO-IND-01 · matrix `company` | **PARTIAL** | **P1** Org tree / dept master SoT still XBOS-heavy — HRM Company is enrich+display, not full org CRUD. **P2** Create-company dialog must never toast-save without XBOS API (FID-P0-FE-CO-BIND). **P3** Member CEO negative scope already UF-tested — keep. |
| **2. Employees** | ✅ | ✅ | ✅ | ✅ archive/restore | `employee_id` SoT; dept/job_title **CatalogSearchPicker** on EmployeeFormDialog; soft-delete not hard delete; scope 409 | HRM-EM-01..05 · UC-HRM-21 · BR-HRM-MD-01 · FR-HRM-SC-POS-01 | **PARTIAL** | **P0** Career/Work History **position Input** (orphan picker). **P1** Profile satellite (contracts/decisions tabs) free-text position/signer. **P2** `employment_type` hardcoded Select (not Settings). **P3** EmployeeJobList dept narrative N/A. Spine create/list/edit = strong island. |
| **3. Contracts** | ✅ | ✅ | ✅ | ✅ | FK `employee_id`; `contract_types` catalog (+ FE fallback hardcode); expiring alerts HRM-CI-04 | HRM-CI-01..06 · UC-HRM-25 · UF-HRM-02 🟢 | **PARTIAL** | **P0** `EmployeeContracts.position` free-text. **P1** Profile contract_type hardcoded vs Contracts page catalog. **P1** signer_position free-text. **P2** Density R_distinct ≥0.95 = fidelity seed/FE create volume — not CRUD wire. |
| **4. Insurance (BH)** | ✅ POST | ✅ GET list (+ expiring) | 🟡 thin | 🟡 participant delete | FK employee; policy participant rows; R-FID-01 list API **exists in controller** (matrix row stale vs code) | HRM-CI-02/07 · UC-HRM-25 · UF-HRM-04 🟢 load | **PARTIAL** | **P1** Full policy CRUD / insurer catalog bind thinner than contracts. **P1** Matrix still documents R-FID-01 gap — **reconcile matrix** (list GET present). **P2** Density ≥0.95 after HĐ. **P3** Payroll mock «insurance policy participants» island (see Payroll). |
| **5. Attendance** | ✅ records + **sheets** + OT/trip/late/shift | ✅ | ✅ patch status / sheet | ✅ sheet/request deletes | Sheet lifecycle AT-14; employee FK on records; shifts catalog; **status** approve/reject on requests | UC-HRM-23 · HRM-AT-01..14 · UF-HRM-16 🟢 | **PARTIAL→STRONG lean** | **P1** Sheet grid «Công chuẩn» empty+storm was fixed — keep regression. **P2** Position filter on sheet inherits employee free-text set. **P2** Shift codes Settings→consumer spot (cohort with ba-data). **P0 none on sheet create path** (UF-HRM-16). |
| **6. Leave** | ✅ | ✅ | approve/reject (status SM) | — (reject/cancel path) | `leave_types` **CatalogSearchPicker** PASS; status pending→approved/rejected; employee FK | UC-HRM-10 · HRM-AT-10..13 · FR-HRM-SC-LEAVE-01 | **PARTIAL** | **P1** Entitlement / balance / calendar / holiday rules thinner than Workday-class (orphan #3 WF XBOS). **P2** Chart leave colors Settings (orphan #10). Create+approve spine = strong. |
| **7. Payroll** | ✅ periods / components / templates / advances / batches | ✅ payslips | ✅ process/close / patch | ✅ components/templates/batches | Period status process→close; component codes; template↔component FK; advance approve/reject | HRM-PR-01..06 · UC-HRM-24/28 · FR-HRM-SC-PAY-01 | **PARTIAL** | **P0** Legacy **mock blocks** in `Payroll.tsx` (tax/insurance policy participants comments). **P1** `component_type` hardcoded (picker inventory #27). **P1** Tax settlement edit often **BLOCKED-DATA** under U65 empty. **P2** Template «vị trí áp dụng» derived from employees / readOnly — not Settings multi-select. **P2** Formula/GL depth ≠ full ERP. |
| **8. Recruitment** | ✅ req / JD / posting / candidate / interview / headcount / plans | ✅ | ✅ patch status/stage | ✅ postings/templates/candidates (pool) | Pipeline stage SM; JD catalog picker PASS on templates/YCTD; optional FK candidate↔req | UC-HRM-22/30 · HRM-RC-01..06 · UF-HRM-12 🟢 | **PARTIAL** | **P0** JobPostings **position+department Input**; Headcount **position_name+department Input**; Candidate position Input. **P2** employment_type hardcoded. Surface CRUD breadth = strong; identity master bind = weak. |
| **9. Decisions** | ✅ | ✅ | ✅ | ✅ | `decision_types` CatalogSearchPicker PASS; scope ladder; employee_id optional UUID; live-empty OK | UC-HRM-27 · FR-HRM-SC-DEC-01 · AC-DEC-01..04 · AC-DEC-DENSITY | **PARTIAL** | **P0** Decisions **position** Input; **P2** signer_position. **P1** Product **NOT DONE** until AC-DEC-DENSITY + browser mutate evidence kept current (SRS status). API CRUD complete ≠ ERP decision power (workflow link thin). |
| **10. Settings / Catalogs** | ✅ items + extension | ✅ | ✅ | ✅ + removal workflow | XBOS sync; extension approve/reject batches; catalog_key FR map SC-* | HRM-SC-01..09 · SRS §16.2 · UF-HRM-10 🟢 | **STRONG** | **P2** Consumer bind uneven (separate WI SETTINGS-CONSUMER) — Settings **domain itself** unlocks master CRUD. **P3** Metadata workflow id chrome on Settings leaf (menu sweep C-01). |
| **11. Processes / Policies** | ❌ by design | ✅ catalog RO | ❌ | ❌ | XBOS SoT §55–58; **cấm** HRM mutate; empty honest | SRS §13.1 · XBOS-DM-HRM-14 · AC-PROC-01..04 · BR-PROC-* | **STRONG** *(correct ownership)* | **P3** Catalog empty until sync — not a CRUD defect. Fake Add toast already removed. Do **not** schedule E-wave HRM process CRUD. |
| **12. Tools & equipment** | ❌ deferred | 🟡 empty/view | ❌ | ❌ | No Phase-1 REST; honest stub — no fake toast | matrix `tools_equipment` Deferred · `ToolsEquipment.tsx` CODE-MEMORY | **WEAK** | **P1** No asset assign / custody / FK to employee — cannot unlock CCDC nghiệp vụ. Keep deferred until CR; **cấm** fake CRUD. |
| **13. Performance** *(bonus)* | ✅ cycle + eval | ✅ | ❌ no PATCH on controller | ❌ no DELETE | cycle dates; eval score; employee_id; status label U72 | HRM-PF-01..04 | **WEAK→PARTIAL** | **P1** No update/delete cycle; evaluation SM thin vs ERP PM. **P2** KPI library bind depth. Create-only = thin power. |
| **14. Tasks / Internal services** *(bonus)* | ✅ | ✅ | ✅ status | ✅ SV delete | request types catalog; optional employee FK; approve/reject SV | HRM-OP-01..04 · HRM-SV-01..06 · FR-HRM-OP-01 | **PARTIAL** | **P2** Enum/status lock FR-OP; density ≥5 tasks/company fidelity. Not P0 for ERP master-data wave. |

---

## PO synthesis — enough business power?

| Question | Answer |
|----------|--------|
| **Enough menus?** | Yes — sidebar covers ERP HRM surface (Company→Settings + Tools deferred). |
| **Enough transactional CRUD spines?** | **Yes for Employees, Contracts, Attendance sheets, Leave requests, Recruitment objects, Decisions, Settings.** |
| **Enough constraints / master fidelity?** | **No.** Orphan Settings→consumer (position/dept free-text clusters), hardcoded enums, Payroll mock islands, Insurance thinner than Contracts, Performance create-only, Tools deferred. |
| **Unlock full ERP power?** | **Not yet.** Closest to ERP-class: Settings + Leave type bind + Employee form pickers + Attendance sheet lifecycle. Furthest: Tools, Performance depth, Payroll policy mocks, Recruitment/Decisions/WorkHistory identity free-text. |
| **Thin / mock / free-text summary** | **Free-text P0 cluster** (picker inventory): WorkHistory, Decisions, JobPostings, Headcount, EmployeeContracts. **Mock:** Payroll tax/insurance policy participant blocks. **Deferred honest:** Tools. **Read-only correct:** Processes. |

---

## Spec says / Code does (cross-domain)

| Spec | Observed (2026-07-28 grep/docs) |
|------|----------------------------------|
| BR-HRM-MD-01 + AC-HRM-PICKER-01 | Settings CRUD **STRONG**; consumer bind **uneven** (PASS islands + FAIL cluster) |
| UC-HRM-27 AC-DEC-DONE | API+UI CRUD exist; fidelity/DONE gate still open in SRS wording |
| Processes AC-PROC | FE read-only — aligns SRS (not a CRUD gap) |
| Insurance R-FID-01 | Controller has `GET …/insurance` — **matrix §2.1 row outdated** (residual: BA-data/matrix sync) |
| Tools deferred | Honest empty — aligns matrix; business power **WEAK** by design |
| UF-HRM mutate samples | Several 🟢 load/mutate flags — **≠** domain STRONG for ERP constraints |

---

## Cohort map for G1 / E waves (no Dev this WI)

| Cohort | Domains | G1 (spec/delta) | E-wave later (after U74 + sponsor chốt) |
|--------|---------|-----------------|----------------------------------------|
| **E-MD-PICKER** | Employees career, Decisions, Recruitment posting/headcount, Contracts profile | Confirm AC already locked — implement bind | FE CatalogSearchPicker + optional `position_key` |
| **E-PAY-CLEAN** | Payroll | Mark mock islands forbidden in SRS/TechSpec if missing | Remove mock policy tabs / wire live or hide |
| **E-INS-DEPTH** | Insurance | Reconcile matrix R-FID-01; AC policy CRUD depth | FE/BE parity with contracts |
| **E-PERF-SM** | Performance | AC update/delete + KPI bind | BE PATCH/DELETE + FE |
| **HOLD** | Processes | none | **no** HRM CRUD |
| **BACKLOG-CR** | Tools | CR only | New API_DESIGN before Dev |
| **G1-MATRIX** | All | Refresh linkage matrix insurance row + domain power column | — |

---

## Out of scope

- `apps/**` edits · seed · Phase1/PROD claim · position-only report · Dev dispatch this WI

## Handoff

```yaml
work_item_id: BA-HRM-ERP-DOMAIN-CRUD-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-hrm-erp-domain-crud-01-20260728.md
knowledge_merge: docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md (appended)
domains_scored: 14
strong: 2 (Settings; Processes-correct-RO)
partial: 10
weak: 2 (Tools; Performance thin)
```

### next_dispatch_prompt (copy-ready — G1/E cohorts, **no Dev**)

```text
work_item_id: SYNTH-HRM-ERP-FIDELITY-01 (after peer Claude G0 seats land)
from_role: pm
to_role: pm (Cursor SYNTH) + wait CLAUDE-PM-ERP-PO-SYNTH-01 if OPEN
entry_criteria:
  - docs/qa/evidence/ba-hrm-erp-domain-crud-01-20260728.md PASS_TO_PM
  - BA-HRM-ERP-SETTINGS-CONSUMER-01 + SA-HRM-ERP-WORLD-BENCHMARK-01 + QA-HRM-ERP-FIDELITY-SPOT-01 evidence in merge
  - Claude orphan/constraint/benchmark/matrix entries appended to HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md
exit_criteria:
  - docs/program/HRM_ERP_FIDELITY_PEER_SYNTHESIS.md: agree/diverge table; sponsor-ready backlog by cohort
    E-MD-PICKER | E-PAY-CLEAN | E-INS-DEPTH | E-PERF-SM | HOLD Processes | BACKLOG Tools
  - U74: Claude góp ý + Cursor SYNTHESIS + sponsor chốt BEFORE any apps/** Dev
cấm: Dev apps/**; seed; Phase1 claim; plan only «fix Vị trí»
pm_note: If SETTINGS-CONSUMER / SA / QA still DISPATCHED — do not SYNTH early; intake those PASS_TO_PM first
```

---

**ack_status:** `PASS_TO_PM`
