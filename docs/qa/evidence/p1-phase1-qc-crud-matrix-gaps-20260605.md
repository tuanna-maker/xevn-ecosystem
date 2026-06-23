# QC Gate Decision — P1-PHASE1-QC-CRUD-MATRIX-GAPS-01 (2026-06-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-CRUD-MATRIX-GAPS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-05` |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md` |
| **probe JSON** | `docs/qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605-probe.json` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §5 org · §7 catalog · §8 workflow · §11 insurance · §12 recruitment · §13 attendance |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` — **J-XBOS-01** (group WF prior PASS); member WF L2.5 deferred |

## Verdict (scoped)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **Scope** | HTTPS pilot `https://14-225-217-232.nip.io` — **10** UNTESTED matrix cells probed: **6 PASS**, **3 GWC**, **1 N/A**, **0 FAIL** (QA wave) |
| **NOT claimed** | Phase 1 program DONE; PROD-READY; full CRUD matrix closure; strict `PATCH /recruitment/requisitions/:id`; member CEO workflow detail/approve without seed |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**6/8**) |
| Failures | `ack_status` — table uses `\| **ack_status** \|` not `ack_status:` literal; `command_table` — probe uses `node scripts/…` not `pnpm run` |
| QC adjudication | **Process GWC** — substantive pack complete (work_item_id, CRUD AC table, residual, date, PORTAL_DEV_URL, probe JSON); **does not** block bounded product gate |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| QA probe exit **0** · summary **6/3/1/0** | **PRODUCT — PASS (bounded)** | Primary gate basis |
| Probe JSON ↔ QA table (10 rows) | **PROCESS — PASS** | Full concurrence on QA run @ `2026-06-05T01:34:38Z` |
| QC re-probe attendance **400** `HRM-ATT-001` duplicate `uq_attendance_company_employee_date` | **ENV / test-data** | Fixed `attendance_date=2026-06-05` — non-idempotent re-run; **does not** reopen QA PASS |
| **AC-CRUD-HRM-REC-G-U-01** no requisition PATCH; headcount **200** `HRM-REC-HC-200` | **PRODUCT — GWC** | Spec/route gap; alternate path works |
| Member CEO WF **pending=0** — RD/U not exercised | **PRODUCT — GWC** | Empty inbox; list **200** `XBOS-WF-203` valid |
| Org legal-entity DELETE **404** `XBOS-CFG-001` | **PRODUCT — N/A** | SRS archive not exposed |
| Phase 1 DONE / PROD | **OUT OF SLICE** | Not claimed |

---

## Probe JSON vs QA table — audit

| AC-ID | QA HTTP/Code | JSON | QC concurrence |
|-------|--------------|------|----------------|
| **AC-CRUD-CC-CAT-G-C-01** | **201** `HRM-SET-209` PASS | **201** `HRM-SET-209` PASS | **PASS** |
| **AC-CRUD-CC-ORG-G-D-01** | **404** `XBOS-CFG-001` N/A | **404** `XBOS-CFG-001` N/A | **PASS** |
| **AC-CRUD-HRM-INS-G-C-01** | **201** `HRM-INS-P-201` PASS | **201** `HRM-INS-P-201` PASS | **PASS** |
| **AC-CRUD-HRM-INS-G-U-01** | **200** `HRM-INS-P-200` PASS | **200** `HRM-INS-P-200` PASS | **PASS** |
| **AC-CRUD-HRM-REC-G-U-01** | **200** `HRM-REC-HC-200` GWC | **200** `HRM-REC-HC-200` GWC | **PASS (GWC)** |
| **AC-CRUD-HRM-ATT-G-C-01** | **201** `HRM-ATT-201` PASS | **201** `HRM-ATT-201` PASS | **PASS** (QA run) |
| **AC-CRUD-HRM-ATT-G-U-01** | **200** `HRM-ATT-202` PASS | **200** `HRM-ATT-202` PASS | **PASS** (QA run) |
| **AC-CRUD-CC-WF-M-RL-01** | **200** `XBOS-WF-203` PASS | **200** `XBOS-WF-203` PASS | **PASS** |
| **AC-CRUD-CC-WF-M-RD-01** | — GWC | GWC empty pending | **PASS (GWC)** |
| **AC-CRUD-CC-WF-M-U-01** | — GWC | GWC empty pending | **PASS (GWC)** |

**Summary row:** JSON `pass:6 fail:0 gwc:3 na:1` matches QA § Summary.

---

## QC spot-check (2026-06-05)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-qa-crud-matrix-gaps-probe.mjs
# exit 1 — PROBE_FAIL (attendance duplicate on re-run)
```

| AC-ID | QC re-run | QA reference | QC adjudication |
|-------|-----------|--------------|-----------------|
| Catalog / org / insurance / recruitment | Aligns QA | **PASS** / **N/A** / **PASS** / **GWC** | **Concurs** |
| **AC-CRUD-HRM-ATT-G-C-01** | **400** duplicate key | **201** `HRM-ATT-201` | **ENV** — accept QA first-run PASS |
| **AC-CRUD-HRM-ATT-G-U-01** | skipped | **200** `HRM-ATT-202` | **ENV** — chained skip |
| Member WF list / RD / U | **200** pending=0 · GWC · GWC | Same | **Concurs** |

Spot-check confirms nip.io stack reachable and non-attendance cells reproducible; attendance failure is **probe idempotency**, not API regression.

---

## GWC adjudication (mandatory)

### AC-CRUD-HRM-REC-G-U-01 — recruitment Update

| Item | Detail |
|------|--------|
| Matrix expectation | `PATCH /api/hrm/recruitment/requisitions/:id` → **200** |
| Observed | Requisition PATCH → **404**; fallback `PATCH …/headcount-proposals/:id/status` → **200** `HRM-REC-HC-200` |
| QC verdict | **GWC ACCEPTED** — alternate headcount path proves update semantics; matrix cell may promote **GWC** not strict PASS |
| PM dispatch | **dev-be** `PATCH requisitions/:id` **only if sponsor requires strict AC**; else **ba-process** delta matrix to headcount-proposals path |

### Member CEO workflow — empty inbox (AC-CRUD-CC-WF-M-RD-01 / M-U-01)

| Item | Detail |
|------|--------|
| Observed | `GET …/tasks?tenantId=xe-du-lich&assigneeUserId=du-lich.ceo@xe.vn` → **200** `XBOS-WF-203` **pending=0** |
| RD/U | Not exercised — no task id |
| QC verdict | **GWC ACCEPTED** — list contract valid; detail/approve require data |
| PM dispatch | **devops** member `seed:workflow:inbox` slice **optional** (P3); **qa** retest RD/U when seeded — **not blocking** this wave |

---

## Matrix promotion — QC concurrence

| Matrix § | Cells | QC promote |
|----------|-------|------------|
| §7 Catalog | Group CEO **Create** | **PASS** |
| §5 Org foundation | Group CEO **Delete** | **N/A** |
| §11 Insurance | Group CEO **Create / Update** | **PASS** |
| §12 Recruitment | Group CEO **Update** | **GWC** |
| §13 Attendance | Group CEO **Create / Update** | **PASS** (QA run) |
| §8 Workflow | Member CEO **Read list** | **PASS** |
| §8 Workflow | Member CEO **Read detail / Update** | **GWC** |

**PM / ba-process:** sync `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` UNTESTED → above statuses (QA residual P4).

---

## L2.5 journey coverage (U19)

| Journey | Layer | QC verdict | Notes |
|---------|-------|------------|-------|
| **J-XBOS-01** | Group CEO API approve | **PASS** (prior wave) | Not re-run; group WF cells out of this batch |
| **J-XBOS-01** | Member CEO list→detail→complete | **GWC DEFERRED** | Empty member inbox |
| **J-HRM-*** | Insurance / attendance / recruitment API | **API only** | No browser L2.5 required for this work_item |

This wave is **CRUD matrix API gap closure** — L2.5 browser depth **not** mandatory per PM entry; member WF L2.5 remains open.

---

## Conditions (bounded)

| ID | Condition | Owner | Priority | Reopen trigger |
|----|-----------|-------|----------|----------------|
| **C-CRUDMAT-01** | Add `PATCH /recruitment/requisitions/:id` or BA matrix documents headcount-proposals as SoT | `dev-be` or `ba-process` | **P2** | Sponsor requires strict AC-CRUD-HRM-REC-G-U-01 |
| **C-CRUDMAT-02** | Member CEO workflow seed + retest RD/U on nip.io | `devops` + `qa` | **P3** | User defect on member inbox approve |
| **C-CRUDMAT-03** | QA evidence pack format (`ack_status:` line + `pnpm` command table) | `qa` | **P4** | Next pack verify **<6/8** without substantive CRUD |
| **C-CRUDMAT-04** | Probe idempotency for attendance (dynamic date or cleanup) | `qa` | **P4** | QC re-probe false FAIL on duplicate |

---

## PM dispatch recommendation

| Priority | Action | Owner | Trigger |
|----------|--------|-------|---------|
| **Now** | Sync matrix §5/7/8/11/12/13 cells from this evidence | `pm` / `ba-process` | Always after PASS_TO_PM |
| **Optional P2** | Recruitment requisition PATCH route | `dev-be` | Sponsor strict AC only |
| **Optional P3** | `seed:workflow:inbox` member slice for `du-lich.ceo@xe.vn` | `devops` | Product wants member WF L2.5 closure |
| **Defer** | `phase1:gate` / program closeout | `qc` / `pm` | Separate program gate — **NOT** this slice |

---

## Regression guards (unchanged)

| Guard | Status |
|-------|--------|
| **P0-CRUD-06** group WF approve | **CLOSED** (prior wave) |
| Insurance / attendance prior PASS | Not regressed on QA first run |
| Member CEO U28-R2 negatives | Separate wave — not in scope |

---

## completion_report

- Audited QA evidence + probe JSON; **10/10** row concurrence on QA execution.
- Evidence pack verify **6/8** — process GWC only.
- QC spot-check: **8/10** cells match live; attendance re-run duplicate classified **ENV** — QA PASS stands.
- **GO WITH CONDITIONS** for CRUD matrix UNTESTED gap batch: **6 PASS**, **3 GWC**, **1 N/A**, **0 FAIL**.
- **NOT** Phase 1 DONE / **NOT** PROD.

## next_owner

**pm** — matrix doc sync; optional dispatch **dev-be** (requisition PATCH) or **devops** (member WF seed) per sponsor priority.

## next_dispatch_prompt

```
You are PM — xevn-ecosystem Sprint S5 W1.
work_item_id: P1-PHASE1-PM-CRUD-MATRIX-SYNC-01
entry_criteria: QC PASS_TO_PM docs/qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md — GWC bounded slice 6 PASS / 3 GWC / 1 N/A.
exit_criteria: (1) Update PHASE1_CRUD_ACCEPTANCE_MATRIX.md §5/7/8/11/12/13 cells UNTESTED→PASS/GWC/N/A per QC table; (2) Dispatch dev-be P1-PHASE1-BE-REC-REQ-PATCH-01 only if sponsor requires strict AC-CRUD-HRM-REC-G-U-01; else defer C-CRUDMAT-01; (3) Optional devops seed member WF if sponsor wants J-XBOS-01 member L2.5; (4) Ghi bus PASS_TO_USER — NOT Phase 1 DONE.
evidence_path: docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md
ack_status: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md`

## ack_status

**PASS_TO_PM**
