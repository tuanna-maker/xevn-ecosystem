# QC Gate Decision — P1-PHASE1-QC-CRUD-PARITY-GATE-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-CRUD-PARITY-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-04` |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md` (§ Deploy verify — `P1-PHASE1-QA-CRUD-PARITY-DEPLOY-VERIFY-01`) |
| **do_evidence** | `docs/ops/evidence/p1-phase1-do-crud-parity-deploy-20260604.md` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §3 P0 register |
| **parent QC** | `docs/qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md` (MEM-CRUD / J-HRM API slice) |

## Verdict (scoped)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **Scope** | **C-CRUDQC-07** closure on HTTPS pilot after `P1-PHASE1-DO-CRUD-PARITY-DEPLOY-01`; P0 register §3 audit |
| **NOT claimed** | Phase 1 DONE; PROD-READY; `origin/main` git parity; full browser L2.5; group CEO employee C/U UNTESTED |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**6/8**) |
| Failures | `ack_status` table format; `command_table` uses `node scripts/…` not `pnpm run` |
| QC adjudication | **Process GWC** — substantive pack complete; same class as `p1-phase1-qc-crud-journey-03-20260604.md`; **does not** block **C-CRUDQC-07** product closure |

---

## C-CRUDQC-07 — QC concurrence (CLOSED)

| Check | QA (`§ Deploy verify`) | QC R2 |
|-------|------------------------|-------|
| VPS `hrm-be` + `xbos-be` post pscp manifest (9 files) | **PASS** — probes exit **0** | Concurs |
| `tmp-p1-phase1-member-hrm-cu-probe.mjs` | Exit **0** `MEM_CRUD_JOURNEY_03_OK` | Exit **0** (2026-06-04 spot-check) |
| `tmp-phase1-be-scope-crud-probe.mjs` | Exit **0** `PROBE_OK` | Exit **0** (2026-06-04 spot-check) |
| Git push parity sources to `origin/main` | **Non-blocker** per QA | **GWC residual** — `dev-be` / PM when user requests commit |

**QC ruling:** **C-CRUDQC-07 CLOSED** for pilot/API gate. Reopen only if deploy-verify probes fail after a BE recreate without manifest parity.

---

## P0 register audit (`PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §3)

| Gap ID | QA verdict (matrix) | QC audit | Notes |
|--------|---------------------|----------|-------|
| **P0-CRUD-01** | **PASS** | **Concurs** | Member legal read detail — closed |
| **P0-CRUD-02** | **PASS** | **Concurs** | HRM contracts C/U — closed |
| **P0-CRUD-03** | **PASS** | **Concurs** | Insurance list — closed |
| **P0-CRUD-04** | **GWC** | **Concurs (bounded)** | D16-FROZEN-ALLOW-200 policy; not product FAIL |
| **P0-CRUD-05** | **PASS** | **Concurs** | RACI member matrix — closed |
| **P0-CRUD-06** | **PASS** | **Concurs** | Workflow approve API — closed |

**P0 register:** No **OPEN** or **UNTESTED** rows in §3. **Five PASS + one GWC (P0-04)** — acceptable for CRUD parity gate. **P0-04** remains policy-bounded GWC, not a blocker for **C-CRUDQC-07**.

**Matrix hygiene (process GWC):** §10 `residual` footer still lists **C-CRUDQC-07** “VPS parity → `main`” — **stale** vs this gate; **pm** / **ba-process** should sync footer after concurrence (non-blocking for API closure).

---

## Classification

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Deploy verify probes exit **0** | **PRODUCT — PASS** | **C-CRUDQC-07 CLOSED** |
| Commit/push to `main` not done | **PROCESS** | GWC residual only |
| **P0-CRUD-04** holding catalog **200** | **POLICY GWC** | Pre-existing; unchanged |
| Member browser **C-RBACQC-04** | **OUT OF SLICE** | Parent journey QC unchanged |

---

## Conditions (bounded)

| ID | Condition | Owner | Reopen trigger |
|----|-----------|-------|----------------|
| **C-CRUDQC-07-git** | Optional: commit/push parity sources to `origin/main` | `dev-be` / PM | User requests reproducible main deploy |
| **C-CRUDQC-matrix-footer** | Update matrix §10 residual — remove stale **C-CRUDQC-07** open line | `ba-process` / PM | Footer still shows OPEN after dispatch |
| **P0-CRUD-04** | D16 policy freeze | PM / dev-be | PM tightens holding negative to FAIL |
| **C-RBACQC-04** | Member browser L2.5 | `qa` (optional) | Unchanged from parent CRUD-JOURNEY-03 QC |

---

## Regression guards

| Guard | Status |
|-------|--------|
| **C-CRUDQC-07** | **CLOSED** (this gate) |
| P0 §3 rows **01/02/03/05/06** | **CLOSED** — do not reopen without new probe FAIL |
| **P0-CRUD-04** | **GWC** — explicit policy, not reopened |
| MEM-CRUD / phantom-201 | **CLOSED** per parent `p1-phase1-qc-crud-journey-03-20260604.md` |

---

## completion_report

- Audited QA `p1-phase1-qa-crud-journey-03-20260604.md` § Deploy verify; evidence pack **6/8** → process GWC only.
- **Concurs C-CRUDQC-07 CLOSED**; QC reproduced deploy-verify probes exit **0** on nip.io.
- Audited matrix §3 P0 register — **no OPEN P0**; **P0-04** bounded GWC accepted.
- Issued **GO WITH CONDITIONS** for CRUD parity pilot slice only; **NOT** Phase 1 DONE / **NOT** PROD.

## next_owner

**pm** — sync matrix §10 residual; optional **dev-be** git parity to `main` on user request.

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-CRUD-MATRIX-RESIDUAL-SYNC-01
from_role: pm
to_role: ba-process
entry_criteria: QC PASS_TO_PM docs/qa/evidence/p1-phase1-qc-crud-parity-gate-01-20260604.md — C-CRUDQC-07 CLOSED; P0 §3 concurred.
exit_criteria: Update PHASE1_CRUD_ACCEPTANCE_MATRIX.md §10 residual — mark C-CRUDQC-07 CLOSED; keep P0-04 GWC and open UNTESTED rows accurate; no Phase 1 DONE claim.
evidence_path: docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md
ack_status target: PASS_TO_PM
```

## pm_dispatch_hint

**ba-process** matrix footer sync · optional **dev-be** `P1-PHASE1-BE-CRUD-PARITY-MAIN-01` git push when user requests commit · **NOT** re-dispatch full CRUD-JOURNEY-03 QC unless deploy regresses.
