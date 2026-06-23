# QC Gate Decision — P1-PHASE1-QC-HRM-EMP-GROUP-CRUD-01 (2026-06-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-HRM-EMP-GROUP-CRUD-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-05` |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-hrm-emp-group-crud-20260604.md` |
| **be_evidence** | `docs/qa/evidence/p1-phase1-be-emp-create-parity-20260604.md` |
| **do_evidence** | `docs/ops/evidence/p1-phase1-do-hrm-emp-deploy-20260604.md` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §9 Group CEO employees |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` · **J-HRM-02** · **P-CC-03** |

## Verdict (scoped)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **Scope** | Group CEO `ceo@xe.vn` on **HTTPS pilot** `https://14-225-217-232.nip.io` — **AC-CRUD-HRM-EMP-G-C-01**, **G-RL-01**, **G-RD-01**, **G-U-01**, **G-D-01**, **U28-R4**, **J-HRM-02** API list→detail scope parity |
| **NOT claimed** | Phase 1 program DONE; PROD-READY; strict **J-HRM-02** browser embed click path on `/hr` this wave |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-hrm-emp-group-crud-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**6/8**) |
| Failures | `ack_status` — table uses `\| **ack_status** \|` not `ack_status:` literal; `command_table` — probe uses `node scripts/…` not `pnpm run` |
| QC adjudication | **Process GWC** — substantive pack complete (work_item_id, J-HRM-02, CRUD AC table, residual, date, PORTAL_DEV_URL); **does not** block product gate |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Group CEO employee POST **201** `HRM-EMP-201` | **PRODUCT — PASS** | QA + QC probe exit **0** |
| PATCH **200** `HRM-EMP-202` (prior matrix **409** note) | **PRODUCT — PASS** | Not reproduced on nip.io |
| Archive **201** `HRM-EMP-203` + default GET **404** + `include_archived` **200** | **PRODUCT — PASS** | SRS soft-delete semantics |
| **J-HRM-02** API scope parity on created id | **PRODUCT — PASS** | List contains id; GET **200** |
| **J-HRM-02** browser list→row→profile on `/hr` embed | **PROCESS defer** | QA **DEFERRED**; QC **accepts GWC** when API parity solid (PM entry note) |
| Pilot archived QA rows | **OPS noise** | Low impact; archived employees |
| Phase 1 DONE / PROD | **OUT OF SLICE** | Not claimed |

---

## §9 matrix promotion — QC concurrence (nip.io)

| AC | Operation | QA | QC spot-check |
|----|-----------|-----|---------------|
| **AC-CRUD-HRM-EMP-G-C-01** | Create | **PASS** | **PASS** |
| **AC-CRUD-HRM-EMP-G-RL-01** | Read list | **PASS** | **PASS** (`total=1101`) |
| **AC-CRUD-HRM-EMP-G-RD-01** | Read detail | **PASS** | **PASS** |
| **AC-CRUD-HRM-EMP-G-U-01** | Update | **PASS** | **PASS** |
| **AC-CRUD-HRM-EMP-G-D-01** | Archive | **PASS** | **PASS** |
| **U28-R4** | List id → GET detail | **PASS** | **PASS** |
| **J-HRM-02** | API scope parity | **PASS** | **PASS** |

Matrix §9 Group CEO **Create / Update / Delete** cells already **PASS** (QA 2026-06-05) — QC **concurs**; no revert.

---

## QC spot-check (2026-06-05)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-group-hrm-emp-crud-probe.mjs
# exit 0 — GROUP_HRM_EMP_CRUD_OK
```

| Step | QC run | QA run (reference) |
|------|--------|-------------------|
| Login `ceo@xe.vn` | **PASS** HTTP **201** | **PASS** |
| POST create | **PASS** **201** `HRM-EMP-201` | **PASS** |
| Created id | `ddf9a6c9-5421-4a65-a2f8-7ab0e2ea87f5` | `2477713e-2b31-480f-90f3-9b93e15f7691` |
| List contains id | **PASS** `total=1101` | **PASS** |
| GET detail / J-HRM-02 | **PASS** **200** | **PASS** |
| PATCH | **PASS** **200** `HRM-EMP-202` | **PASS** |
| Archive + 404 default / 200 archived | **PASS** | **PASS** |

Probe log aligns with QA § Probe output — no contradictory HTTP codes.

---

## L2.5 journey coverage (U19)

| Journey | Layer | QC verdict | Notes |
|---------|-------|------------|-------|
| **J-HRM-02** | API scope parity (created id GET **200**) | **PASS** | Mandatory for this work_item |
| **J-HRM-02** | Browser P-CC-03 → row → employee profile | **GWC DEFERRED** | **C-EMPGRPQC-01** — L2 P-CC-03 load PASS in stack L2 evidence |
| **J-HRM-01..07** | Other group browser depth | **OUT OF SLICE** | Unchanged |
| **P-CC-03** | Tab load (L2) | **PASS** (prior wave) | Not re-run this QC gate |

**Rule:** QA PASS with API-only **J-HRM-02** is **acceptable GWC** per PM entry; QC does **not** NO-GO for missing browser click when probe + scope parity **PASS**.

---

## Conditions (bounded)

| ID | Condition | Owner | Reopen trigger |
|----|-----------|-------|----------------|
| **C-EMPGRPQC-01** | Group CEO **J-HRM-02** browser embed click path `/command-center/hrm/employees` → row → profile | `qa` (optional) | User defect on group CEO employee detail navigation |
| **C-EMPGRPQC-02** | QA evidence pack format (`ack_status:` line + `pnpm` in command table) | `qa` | Next wave pack verify **<6/8** without substantive CRUD |
| **C-EMPGRPQC-03** | Pilot archived QA probe employees | `ops` / `devops` | N/A unless seed cleanup requested |

---

## Regression guards (unchanged)

| Guard | Status |
|-------|--------|
| `employee-post-phantom-201` | **CLOSED** (BE create parity + DO deploy) |
| **C-CRUDQC-07** | **CLOSED** (pilot deploy parity) |
| Member CEO **MEM-CRUD-02** | Separate wave — not regressed by this gate |
| **phase1:gate** / G4–G5 | **OPEN** — **NOT** Phase 1 DONE |

---

## Residual (post-QC)

| Item | Owner | Notes |
|------|-------|-------|
| **C-EMPGRPQC-01** browser L2.5 | `qa` | Optional strict pass |
| §3 P0 register / RACI / WF / member personas | `pm` | Unchanged from CRUD parity gates |
| Phase 1 DONE / PROD | `pm` / `qc` | **NOT** claimed |

---

## completion_report

- Audited QA `p1-phase1-qa-hrm-emp-group-crud-20260604.md` §9 vs probe log — **concurs** all AC **PASS** on nip.io.
- QC reproduced `tmp-p1-phase1-group-hrm-emp-crud-probe.mjs` exit **0** (independent ids; same HTTP semantics).
- Issued **GO WITH CONDITIONS** — group CEO §9 employee **C/U/D** + **J-HRM-02** API promotable; browser L2.5 **C-EMPGRPQC-01** deferred; QA pack **6/8** process GWC only.
- **NOT** Phase 1 DONE / **NOT** PROD-READY.

## next_owner

**pm**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-HRM-EMP-GROUP-CRUD-CLOSE-01
from_role: qc
to_role: pm
entry_criteria: QC PASS_TO_PM docs/qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md — GO WITH CONDITIONS §9 group CEO employee C/U/D + J-HRM-02 API on nip.io; C-EMPGRPQC-01 browser optional.
exit_criteria: Confirm PHASE1_CRUD_ACCEPTANCE_MATRIX §9 footer no stale "UNTESTED" for group C/U/D; update PROGRAM_JOURNEY_MAP J-HRM-02 note (API PASS / browser GWC); dispatch next P0 from §3 or governance (RACI/WF/member) per TEAM_WORKING_NOW; do NOT claim Phase 1 DONE.
evidence_path: docs/qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md
ack_status target: PASS_TO_PM
```

## pm_dispatch_hint

Slice closed for **P1-PHASE1-QC-HRM-EMP-GROUP-CRUD-01**. Next execution: open §3 P0 item or **P1-PHASE1-QA-*** for **C-EMPGRPQC-01** browser only if sponsor requires strict L2.5 — else proceed program backlog (WF/RACI/member).
