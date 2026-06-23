# QA evidence — P1-PHASE1-QA-HRM-EMP-GROUP-CRUD-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-HRM-EMP-GROUP-CRUD-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-05 (probe run UTC+7 session) |
| **environment** | HTTPS pilot `https://14-225-217-232.nip.io` |
| **persona** | Group CEO `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `x-tenant-id=xevn` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §9 Group CEO |
| **journey SoT** | **J-HRM-02**, **P-CC-03** · `docs/program/PROGRAM_JOURNEY_MAP.md` |
| **entry** | PM dispatch — §9 Group CEO employee C/U/D **UNTESTED**; Read list/detail already PASS |
| **excluded** | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` (already PASS — not re-run) |

---

## Executive verdict

| AC | Operation | Verdict | HTTP / code |
|----|-----------|---------|-------------|
| **AC-CRUD-HRM-EMP-G-C-01** | Create `POST /api/hrm/employees?company_id=main` | **PASS** | **201** `HRM-EMP-201` |
| **AC-CRUD-HRM-EMP-G-RL-01** | Read list (regression) | **PASS** | **200** `HRM-EMP-200`; created row in list (`total=1101`) |
| **AC-CRUD-HRM-EMP-G-RD-01** | Read detail | **PASS** | **200** `HRM-EMP-200` on created id |
| **AC-CRUD-HRM-EMP-G-U-01** | Update `PATCH …/employees/:id` | **PASS** | **200** `HRM-EMP-202` (prior matrix note **409** not reproduced) |
| **AC-CRUD-HRM-EMP-G-D-01** | Archive `POST …/employees/:id/archive` | **PASS** | **201** `HRM-EMP-203` (SRS soft-delete) |
| **U28-R4** | List id → GET detail scope parity | **PASS** | Same id **200** after create |
| **J-HRM-02** | API list→detail parity | **PASS** | GET **200** on `2477713e-2b31-480f-90f3-9b93e15f7691` |

**Overall:** **PASS_TO_PM** — promote §9 Group CEO **Create / Update / Delete** cells; ready for QC `P1-PHASE1-QC-HRM-EMP-GROUP-CRUD-01`.

---

## Commands executed

| # | Command | Exit |
|---|---------|------|
| 1 | `$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'; node scripts/tmp-p1-phase1-group-hrm-emp-crud-probe.mjs` | **0** |

---

## Probe output (exit 0)

```
Group CEO HRM employee CRUD — https://14-225-217-232.nip.io
PASS  login ceo@xe.vn — HTTP 201 XBOS-AUTH-200 tenant=xevn
PASS  AC-CRUD-HRM-EMP-G-C-01 POST — HTTP 201 HRM-EMP-201
PASS  employee id from POST — 2477713e-2b31-480f-90f3-9b93e15f7691
PASS  U28-R4 list contains created id — total=1101
PASS  AC-CRUD-HRM-EMP-G-RD-01 GET detail — HTTP 200 HRM-EMP-200
PASS  J-HRM-02 scope parity GET — id=2477713e-2b31-480f-90f3-9b93e15f7691
PASS  AC-CRUD-HRM-EMP-G-U-01 PATCH — HTTP 200 HRM-EMP-202
PASS  AC-CRUD-HRM-EMP-G-D-01 archive — HTTP 201 HRM-EMP-203
PASS  archived hidden from default GET — HTTP 404 HRM-EMP-404
PASS  archived visible with include_archived — HTTP 200

GROUP_HRM_EMP_CRUD_OK
```

**Test artifact:** `employee_code=GRP22129997` · archived on pilot (no PII beyond QA email pattern `qa.grp.{stamp}@xe.vn`).

---

## Archive semantics (D)

| Step | Result |
|------|--------|
| `POST /api/hrm/employees/:id/archive?company_id=main` | **201** `HRM-EMP-203` |
| `GET …/:id?company_id=main` (default) | **404** `HRM-EMP-404` — excluded from active list |
| `GET …/:id?company_id=main&include_archived=true` | **200** `HRM-EMP-200` — record retained |

No **403** on archive for group CEO in this run (archive allowed per SRS).

---

## L2.5 browser (optional)

**Deferred** — API **J-HRM-02** scope parity **PASS**; embed click path `/command-center/hrm/employees` → row → profile not re-run this wave (L2 P-CC-03 load already PASS in `p1-phase1-qa-stack-l2-20260604.md`). QC may spot-check browser if strict L2.5 required.

---

## Matrix promotion

| Persona | Create | Update | Delete/Archive |
|---------|--------|--------|----------------|
| **Group CEO** | **PASS** (this run) | **PASS** (this run) | **PASS** (this run) |

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| L2.5 browser J-HRM-02 click on `/hr` embed | qc / optional qa | API parity closed |
| QA archive test row on pilot | ops | Low noise; archived employee |
| Phase 1 DONE / PROD | pm/qc | Not claimed |

---

## completion_report

- Closed **AC-CRUD-HRM-EMP-G-C-01**, **G-U-01**, **G-D-01**, **U28-R4**, **J-HRM-02** API on nip.io for group CEO.
- Confirmed employee create parity fix (`P1-PHASE1-BE-EMP-CREATE-PARITY-01`) applies to **group** persona (persist `holding`, list/get scope).
- §9 matrix updated Group CEO C/U/D → **PASS**.

## next_owner

**qc**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-HRM-EMP-GROUP-CRUD-01
from_role: pm
to_role: qc
entry_criteria: QA PASS_TO_PM docs/qa/evidence/p1-phase1-qa-hrm-emp-group-crud-20260604.md — §9 Group CEO employee Create/Update/Archive PASS on https://14-225-217-232.nip.io; probe exit 0; J-HRM-02 API scope parity PASS.
exit_criteria: Audit §9 cells vs probe log; GO or GO WITH CONDITIONS with residual list; update docs/qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md; PASS_TO_PM if no blocker.
evidence_path: docs/qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md
ack_status target: PASS_TO_PM
```

## pm_dispatch_hint

Promote `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §9 footer residual (remove “group CEO C/U/D UNTESTED”); sync `PROGRAM_JOURNEY_MAP` J-HRM-02 if browser deferred stays API-only.
