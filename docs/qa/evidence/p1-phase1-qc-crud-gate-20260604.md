# QC Gate Decision — P1-PHASE1-QC-CRUD-GATE-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-CRUD-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-04` |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |

## Verdict (scoped)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **Scope** | Member CEO `du-lich.ceo@xe.vn` on **HTTPS pilot** — **U28-R2** negative controls (**403/409**), allowed P-CC-03..08 reads, own legal **GET/PUT 200**, **J-HRM-02** list→detail **200**; master vendor rollup **409** (negative **PASS**) |
| **NOT claimed** | Phase 1 program DONE; PROD-READY; member HRM contract/employee **C/U**; P0-CRUD-05/06; full browser L2.5 re-run this wave; local L0/L1 |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**3/8**) |
| Failures | `work_item_id` / `ack_status` / `command_table` — table-field format (values present in `\| Field \| Value \|` rows) |
| QC adjudication | **Process GWC** — substantive pack complete (P0 table, negatives, commands exit **0**, residual, handoff); same waiver class as `p1-phase1-qc-crud-journey-20260604.md` (**7/8**); **does not** block product gate |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| QC spot-check login **502** on nip.io (2026-06-04 session) | **ENV** | Does **not** overturn QA same-day probes **exit 0** when pilot was up |
| `xevn-uat-2026` on `du-lich.ceo@xe.vn` → **401** | **ENV/doc** | **C-MEMPWD-01** — portal SoT is **`Xevn@2026`**; QA recorded both |
| Member GMU **403**, KPI holding **409**, vendor rollup **409**, group legal POST **409** | **PRODUCT — PASS (negative)** | U28-R2 instant-fail rule **not** triggered |
| Own legal GET/PUT **200**, P-CC-03..08 **200**, J-HRM-02 detail **200** | **PRODUCT — PASS** | Matrix cells promoted |
| Group CEO GET shareholders (member headers) **200** | **PRODUCT — PASS** | **C-RBACQC-02 CLOSED** (chain from scope deploy + QA verify) |
| Member contract/employee **C/U** | **UNTESTED** | **MEM-CRUD-01/02** — next QA wave |
| P0-CRUD-05/06 | **UNTESTED** | Unchanged program gaps |

---

## QA adjudication — concurrence

| QA slice | QA verdict | QC R1 |
|----------|------------|-------|
| U28-R2 negatives (GMU, KPI, cross-tenant legal, vendor) | **PASS** | **PASS** |
| Allowed reads P-CC-03..08 | **PASS** | **PASS** |
| Own legal PUT/GET | **PASS** | **PASS** |
| J-HRM-02 scope parity | **PASS** | **PASS** |
| Login `xevn-uat-2026` | **FAIL (ENV/doc)** | **GWC** — product tests use **`Xevn@2026`** |
| HRM contract/employee **C/U** | **UNTESTED** | **UNTESTED** |
| Browser J-CC-02 save click | Not re-run | **PASS (cited)** — `qc-p1-cc-member-legal-save-l25-20260604.md` @ **`68ec457`** |

**Instant FAIL rule:** No **200** on `group-member-units`, KPI `companyId=holding`, or master vendor rollup for member CEO — **satisfied**.

---

## Matrix promotion (member CEO column)

| Section | Cells promoted | Notes |
|---------|----------------|-------|
| §5 CC org | **PASS (negative)** create/list/detail cross-tenant; **PASS** own GET/PUT | `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` updated |
| §6 CC KPI | Already **PASS (negative)** | No change |
| §9 HRM employees | **PASS** read detail (**J-HRM-02**) | Was **UNTESTED** |
| §10 HRM contracts | **PASS** read list | **C/U** remain **UNTESTED** |
| §8–§15 other embeds | Reads implied by QA P-CC totals; payroll/recruitment/attendance member rows stay **UNTESTED** unless cited | QA probe totals only |

---

## C-RBACQC-02 closure (full RBAC register)

| Item | Prior (R2) | This gate |
|------|------------|-----------|
| **C-RBACQC-02** | **OPEN** — shareholders **409** with member registry headers | **CLOSED** — QA `p1-phase1-qa-full-rbac-20260604.md` + `p1-phase1-qa-scope-crud-journey-20260604.md` + `p1-phase1-qc-crud-journey-20260604.md` probe **200** `XBOS-SHR-200`; matrix **P0-CRUD-01** read detail includes shareholders **200** |

**QC session:** `tmp-phase1-be-scope-crud-probe.mjs` **502** (ENV) — closure stands on QA/deploy chain; monitor **devops** for nip.io flaps — **does not** reopen **C-RBACQC-02** without new **409** on shareholders row.

**Artifact update:** `docs/qa/evidence/p1-phase1-qc-full-rbac-r2-20260604.md` — **C-RBACQC-02** → **CLOSED**.

---

## L2.5 journey coverage (U19)

| Journey | Layer | QC verdict |
|---------|-------|------------|
| **J-CC-02** | API read + own PUT | **PASS** |
| **J-CC-02** | Browser save | **PASS (cited)** — prior CC QC @ `68ec457` |
| **J-CC-03** | KPI negative **409** | **PASS (negative)** |
| **J-HRM-02** | List→detail API | **PASS** |
| **J-HRM-01..07** (member browser) | — | **Deferred** — **C-RBACQC-04** |

---

## Open conditions (bounded)

| ID | Item | Owner |
|----|------|-------|
| **C-MEMPWD-01** | Dispatch password vs portal `Xevn@2026` | ba-docs / pm |
| **MEM-CRUD-01/02** | Member contract/employee **C/U** | qa |
| **C-CRUDQC-01..02** | RACI save · workflow approve (group P0) | dev-be / dev-fe |
| **C-RBACQC-04** | Member + HRBP browser L2.5 depth | qa |
| **C-CRUDQC-04** | Local L0/L1 + W2 matrix script | devops + qa |
| Program | `phase1:gate` G4/G5, PROD | pm |

---

## completion_report

- **Closed:** Member CEO **U28-R2** negative + allowed-read slice on nip.io (QA adjudicated **PASS**); matrix member cells promoted; **C-RBACQC-02** shareholders **200** **CLOSED** in `p1-phase1-qc-full-rbac-r2-20260604.md`.
- **GWC:** Evidence pack **3/8** format (process only); **C-MEMPWD-01** password doc mismatch.
- **Open:** Member HRM **C/U**; P0-CRUD-05/06; local stack; **C-RBACQC-04** browser depth.
- **NOT:** Phase 1 DONE · PROD-READY.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-CRUD-MATRIX-03
from_role: pm
to_role: pm
lane: governance

QC PASS_TO_PM: P1-PHASE1-QC-CRUD-GATE-01 → GO WITH CONDITIONS member CEO U28-R2 on nip.io (docs/qa/evidence/p1-phase1-qc-crud-gate-20260604.md). PHASE1_CRUD_ACCEPTANCE_MATRIX.md updated; C-RBACQC-02 CLOSED in p1-phase1-qc-full-rbac-r2-20260604.md.

1) Task ba-docs (optional) — C-MEMPWD-01: align dispatch password table (portal du-lich.ceo uses Xevn@2026, not xevn-uat-2026).
2) Task qa — P1-PHASE1-QA-CRUD-JOURNEY-03: member HRM contract/employee C/U (MEM-CRUD-01/02); C-RBACQC-04 member browser J-* when nip.io stable.
3) Task devops — nip.io 502 flap monitor; re-run tmp-phase1-be-scope-crud-probe.mjs exit 0 when stack up (regression guard for C-RBACQC-02).
4) Task dev-fe + dev-be — P0-CRUD-06 workflow approve / P0-CRUD-05 RACI only on user regression or matrix FAIL.

Do NOT claim Phase 1 DONE or PROD. residual_auto_fix: true
```

## evidence_path

`docs/qa/evidence/p1-phase1-qc-crud-gate-20260604.md`

## ack_status

**PASS_TO_PM** — **GO WITH CONDITIONS** for **member CEO U28-R2 CRUD/RBAC** on **nip.io**. **NOT** Phase 1 DONE · **NOT** PROD.
