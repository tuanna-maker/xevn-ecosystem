# QC Gate Decision — P1-PHASE1-QC-CRUD-JOURNEY-03 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-CRUD-JOURNEY-03` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-04` |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md` |
| **do_evidence** | `docs/ops/evidence/p1-phase1-do-hrm-emp-deploy-20260604.md` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` § HRM employees / contracts (member CEO) |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` · `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |

## Verdict (scoped)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **Scope** | Member CEO `du-lich.ceo@xe.vn` on **HTTPS pilot** `https://14-225-217-232.nip.io` — **MEM-CRUD-01** contract **C/U** + GET detail, **MEM-CRUD-02** employee **C/U** + scope-parity GET, **J-HRM-01** contract→employee link, **J-HRM-02** API list→detail on **newly created** employee id |
| **NOT claimed** | Phase 1 program DONE; PROD-READY; full member CEO browser L2.5 matrix (**C-RBACQC-04**); group CEO P0-CRUD-05/06; HRBP persona; local L0/L1 |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**6/8**) |
| Failures | `ack_status` — table uses `\| **ack_status** \|` not `ack_status:` literal; `command_table` — probe uses `node scripts/…` not `pnpm run` (script still has exit **0**/**1** rows) |
| QC adjudication | **Process GWC** — substantive pack complete (work_item_id, J-*, CRUD tables, residual, date, PORTAL_DEV_URL); same waiver class as `p1-phase1-qc-crud-journey-20260604.md` (**7/8**); **does not** block product gate |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Prior DevOps probe exit **1** (contract GET **404** orphan row) | **PRODUCT — superseded** | QA retest + QC spot-check **GET 200** — not reproduced |
| `employee-post-phantom-201` (POST **201** + GET **404**) | **PRODUCT — CLOSED** | Post `P1-PHASE1-BE-EMP-CREATE-PARITY-01` + DO `hrm-be` recreate |
| MEM-CRUD-01/02 + J-HRM-01/02 API chain | **PRODUCT — PASS** | QA probe exit **0**; QC reproduced exit **0** |
| Negative `company_id=holding` contracts | **PRODUCT — PASS (negative)** | **409** `SCOPE_CONTEXT_MISMATCH` |
| **C-RBACQC-04** member browser L2.5 full matrix | **PROCESS defer** | QA **DEFERRED**; QC **waives** for this API CRUD wave only |
| VPS parity via `pscp` (not on `origin/main`) | **PROCESS** | **C-CRUDQC-05** — dev-be/PM merge parity to main |
| Orphan contract GET without `employee_id` | **PRODUCT watch** | **C-CRUDQC-06** — reopen if probe regresses |

---

## MEM-CRUD / AC promotion — QC concurrence (nip.io)

| Slice | QA | QC R1 | Matrix AC (member CEO) |
|-------|-----|-------|------------------------|
| **MEM-CRUD-01** contract C/U + detail | **PASS** | **PASS** | Promote **AC-CRUD-HRM-CON-M-C-01**, **AC-CRUD-HRM-CON-M-U-01**; list/detail cells |
| **MEM-CRUD-02** employee C/U + GET new id | **PASS** | **PASS** | Promote **AC-CRUD-HRM-EMP-M-C-01**, **AC-CRUD-HRM-EMP-M-U-01** |
| Prior **FAIL_TO_PM** phantom create | **CLOSED** | **CLOSED** | Aligns with DO deploy evidence |

**QC spot-check (2026-06-04):**

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs
# exit 0 — MEM_CRUD_JOURNEY_03_OK (all steps PASS; new ids on this run)
```

---

## L2.5 journey coverage (U19)

| Journey | Layer | QC verdict | Evidence |
|---------|-------|------------|----------|
| **J-HRM-02** | API scope parity (created id GET **200**) | **PASS** | QA + QC probe |
| **J-HRM-02** | Browser list→row→click detail | **DEFERRED** | **C-RBACQC-04** — not blocking API MEM-CRUD wave |
| **J-HRM-01** | Contract → linked employee **200** | **PASS** | Probe |
| **J-HRM-03..07** | Member browser / other modules | **OUT OF SLICE** | Unchanged from CRUD-GATE-01 |
| **C-RBACQC-04** | Member + HRBP full P-CC + J-HRM browser | **OPEN (waived here)** | Optional **qa** when isolated session ready |

**Rule:** Mandatory **J-HRM-02** for this work_item = API scope parity on member-created employee — **PASS**. Full member browser L2.5 remains parent **C-RBACQC-04**, explicitly **not** required to promote MEM-CRUD-01/02.

---

## Conditions (bounded)

| ID | Condition | Owner | Reopen trigger |
|----|-----------|-------|----------------|
| **C-RBACQC-04** | Member CEO (+ HRBP) browser L2.5 on nip.io | `qa` | User UI defect on `du-lich.ceo` HRM embed |
| **C-CRUDQC-05** | Sync `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` member contract/employee **C/U** cells to **PASS** | `ba-process` | Matrix still **UNTESTED** after PM dispatch |
| **C-CRUDQC-06** | Orphan contract GET **404** without `employee_id` | `dev-be` | Probe `MEM-CRUD-01 contract GET detail` → **404** |
| **C-CRUDQC-07** | Merge VPS `pscp` parity sources to `main` + standard deploy | `dev-be` / `devops` | **CLOSED** (QA 2026-06-04) — pilot probes exit **0** per `p1-phase1-qa-crud-journey-03-20260604.md` § Deploy verify; git push to `main` optional residual |

---

## Regression guards (unchanged)

| Guard | Status |
|-------|--------|
| **C-RBACQC-01** | **CLOSED** (scope probe chain) |
| **C-RBACQC-02** | **CLOSED** (shareholders **200** group slice) |
| Member legal **PUT** `test:xbos:cc-member-save` | Not re-run this wave — no regression signal in MEM-CRUD probe |
| P0-CRUD-05 RACI / P0-CRUD-06 workflow | **UNTESTED** — out of slice |

---

## completion_report

- Audited `p1-phase1-qa-crud-journey-03-20260604.md` + DO deploy chain; evidence pack **6/8** → **process GWC** only.
- QC reproduced `tmp-p1-phase1-member-hrm-cu-probe.mjs` exit **0** on nip.io — concurs **MEM-CRUD-01/02**, **J-HRM-01/02** API **PASS**; **employee-post-phantom-201** **CLOSED**.
- Issued **GO WITH CONDITIONS** for member CEO HRM contract/employee **C/U** API slice; **C-RBACQC-04** browser waiver accepted for this wave.
- **NOT** Phase 1 DONE / **NOT** PROD.

## next_owner

**pm** — dispatch **ba-process** matrix sync; optional **qa** **C-RBACQC-04** browser; track **C-CRUDQC-05..07**.

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-BA-CRUD-MATRIX-SYNC-02
from_role: pm
to_role: ba-process
entry_criteria: QC PASS_TO_PM P1-PHASE1-QC-CRUD-JOURNEY-03 — MEM-CRUD-01/02 + J-HRM-02 API PASS on nip.io per docs/qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md.
exit_criteria: Update docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md member CEO HRM contract + employee Create/Update/Read-detail cells to PASS with evidence link; residual section lists P0-CRUD-05/06 UNTESTED unchanged.
evidence_path: docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md
ack_status target: PASS_TO_PM
```

## pm_dispatch_hint

Promote member MEM-CRUD slice on bus · optional `qa` `P1-PHASE1-QA-MEMBER-PERSONA-NIPIO-01` for **C-RBACQC-04** · **dev-be** merge VPS employee parity to `main`.
