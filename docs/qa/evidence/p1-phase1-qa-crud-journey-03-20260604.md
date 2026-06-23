# QA evidence — P1-PHASE1-QA-CRUD-JOURNEY-03 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-CRUD-JOURNEY-03` · deploy verify `P1-PHASE1-QA-CRUD-PARITY-DEPLOY-VERIFY-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 (retest post `P1-PHASE1-DO-HRM-EMP-DEPLOY-01`; deploy verify post `P1-PHASE1-DO-CRUD-PARITY-DEPLOY-01`) |
| **environment** | HTTPS pilot `https://14-225-217-232.nip.io` |
| **persona** | Member CEO `du-lich.ceo@xe.vn` / `Xevn@2026` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §9–§10 (member columns) |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` · `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| **entry** | `docs/ops/evidence/p1-phase1-do-hrm-emp-deploy-20260604.md` · `docs/ops/evidence/p1-phase1-do-crud-parity-deploy-20260604.md` |

---

## Deploy verify — P1-PHASE1-QA-CRUD-PARITY-DEPLOY-VERIFY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-CRUD-PARITY-DEPLOY-VERIFY-01` |
| **entry** | `docs/ops/evidence/p1-phase1-do-crud-parity-deploy-20260604.md` (DevOps READY_FOR_QA) |
| **VPS** | `14.225.217.232` — `hrm-be` + `xbos-be` recreate post **C-CRUDQC-07** pscp manifest (9 files) |
| **verdict** | **PASS** — both nip.io probes exit **0** |

### Commands (QA re-run)

| # | Command | Exit | Verdict |
|---|---------|------|---------|
| 2 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs` | **0** | **PASS** — `MEM_CRUD_JOURNEY_03_OK` |
| 3 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs` | **0** | **PASS** — `PROBE_OK` |

### Probe output (deploy verify)

**Member HRM (`du-lich.ceo@xe.vn`):**

```
PASS  MEM-CRUD-01 contract POST/PATCH/GET detail — 201/200/200
PASS  MEM-CRUD-02 employee POST/PATCH — 201 HRM-EMP-201 / 200 HRM-EMP-202
PASS  J-HRM-02 scope parity GET — HTTP 200 id=3bc8bb54-e1b3-418b-b22f-91b3acce19ce
PASS  J-HRM-01 contract→employee — HTTP 200
PASS  negative contracts holding — HTTP 409
MEM_CRUD_JOURNEY_03_OK
```

**Group CEO scope CRUD (`ceo@xe.vn`):**

```
PASS  GET legal-entity — HTTP 200 XBOS-ORG-200
PASS  GET shareholders — HTTP 200 XBOS-SHR-200
PASS  PUT XE_DU_LICH — HTTP 200 XBOS-ORG-201
PASS  member CEO blocked on xevn/main rollup — HTTP 409
PROBE_OK
```

### QC condition closure

| Condition | Prior | QA verdict | Notes |
|-----------|-------|------------|-------|
| **C-CRUDQC-07** | OPEN — VPS `pscp` parity drift vs `main` | **CLOSED** | Pilot BE matches parity manifest; API probes **PASS** on `https://14-225-217-232.nip.io` after `P1-PHASE1-DO-CRUD-PARITY-DEPLOY-01`. Commit/push sources to `main` remains **dev-be/PM** ops (non-blocker for API gate). |

---

## Executive verdict

| Slice | Verdict | Notes |
|-------|---------|-------|
| **MEM-CRUD-01** — member HRM contract **C/U** | **PASS** | `POST` **201** `HRM-CON-201`; `PATCH` **200** `HRM-CON-200`; GET detail **200** (retest — prior orphan-contract GET gap not reproduced when list row resolves) |
| **MEM-CRUD-02** — member employee **Create** | **PASS** | `POST` **201** `HRM-EMP-201`; `PATCH` **200** `HRM-EMP-202`; `GET` **200** — post DevOps `hrm-be` employee parity deploy |
| **MEM-CRUD-02** — member employee **Update** | **PASS** | Same run on newly created id |
| **J-HRM-01** (contract → employee API) | **PASS** | Linked `employee_id` → employee **200** |
| **J-HRM-02** (new employee list→detail) | **PASS** | Scope parity GET **200** on created id |
| **C-RBACQC-04** (member browser L2.5) | **DEFERRED** | API slice sufficient; browser `du-lich.ceo` isolation optional follow-up |
| Prior defect | **CLOSED** | `employee-post-phantom-201` — fixed on pilot after `P1-PHASE1-BE-EMP-CREATE-PARITY-01` + DO deploy |

**Overall:** **PASS_TO_PM** — promote **MEM-CRUD-01**, **MEM-CRUD-02**, **J-HRM-02**, **AC-CRUD-HRM-EMP-M-C-01** on nip.io.

---

## Commands executed

| # | Command | Exit | Verdict |
|---|---------|------|---------|
| 1 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs` | **0** | **PASS** — `MEM_CRUD_JOURNEY_03_OK` |
| Prior (pre-deploy) | Same probe | **1** | Employee phantom create — superseded |

---

## Probe output (retest — exit 0)

```
Member HRM C/U probe — https://14-225-217-232.nip.io
PASS  login du-lich.ceo — HTTP 201 XBOS-AUTH-200
PASS  MEM-CRUD-01 contract POST — HTTP 201 HRM-CON-201
PASS  MEM-CRUD-01 contract list find — id=90b170f3-cd84-46f8-970a-938c89c72bb3
PASS  MEM-CRUD-01 contract PATCH — HTTP 200 HRM-CON-200
PASS  MEM-CRUD-01 contract GET detail — HTTP 200
PASS  MEM-CRUD-02 employee POST — HTTP 201 HRM-EMP-201
PASS  MEM-CRUD-02 employee id — 5ea74a05-6de0-4365-a1d2-4f672da31c80
PASS  MEM-CRUD-02 employee PATCH — HTTP 200 HRM-EMP-202
PASS  J-HRM-02 scope parity GET — HTTP 200 id=5ea74a05-6de0-4365-a1d2-4f672da31c80
PASS  J-HRM-01 contract→employee — HTTP 200
PASS  negative contracts holding — HTTP 409 SCOPE_CONTEXT_MISMATCH

MEM_CRUD_JOURNEY_03_OK
```

---

## MEM-CRUD-01 — Contract C/U (member CEO)

| Step | Method / path | HTTP | Code | Verdict |
|------|---------------|------|------|---------|
| Login | `POST /api/xbos/auth/login` | **201** | `XBOS-AUTH-200` | **PASS** |
| **Create** | `POST /api/hrm/contracts-insurance/contracts` | **201** | `HRM-CON-201` | **PASS** |
| List find | `GET …/contracts?company_id=main` | **200** | — | **PASS** |
| **Update** | `PATCH …/contracts/{id}?company_id=main` | **200** | `HRM-CON-200` | **PASS** |
| Read detail | `GET …/contracts/{id}?company_id=main` | **200** | — | **PASS** |
| Negative | `GET …/contracts?company_id=holding` | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** |

**AC promotion:** `AC-CRUD-HRM-CON-M-C-01`, `AC-CRUD-HRM-CON-M-U-01` → **PASS** on nip.io.

---

## MEM-CRUD-02 — Employee C/U (member CEO)

| Step | Method / path | HTTP | Code | Verdict |
|------|---------------|------|------|---------|
| **Create** | `POST /api/hrm/employees?company_id=main` | **201** | `HRM-EMP-201` | **PASS** |
| **Update** | `PATCH …/employees/{newId}?company_id=main` | **200** | `HRM-EMP-202` | **PASS** |
| Read detail (new id) | `GET …/employees/{newId}?company_id=main` | **200** | `HRM-EMP-200` | **PASS** — **J-HRM-02** scope parity |

**AC promotion:** `AC-CRUD-HRM-EMP-M-C-01`, `AC-CRUD-HRM-EMP-M-U-01` → **PASS** on nip.io.

---

## J-* / P-CC (this run)

| ID | Layer | Verdict | Evidence |
|----|-------|---------|----------|
| P-CC-04 | Contract mutate API | **PASS** | MEM-CRUD-01 table |
| **J-HRM-01** | Contract → employee link | **PASS** | **200** on linked `employee_id` |
| **J-HRM-02** | List → detail (new create) | **PASS** | GET **200** on created employee id |
| **C-RBACQC-04** | Member browser L2.5 full matrix | **DEFERRED** | API slice closed for this wave |

---

## Residual (not blocking this wave)

| Item | Owner | Notes |
|------|-------|-------|
| `C-RBACQC-04` browser L2.5 with isolated `du-lich.ceo` session | `qa` (optional) | API MEM-CRUD/J-HRM slices PASS |
| Commit/push C-CRUDQC-07 sources to `origin/main` | `dev-be` / PM | **C-CRUDQC-07** API closure **PASS** on pilot; git sync optional |
| Orphan contract GET without `employee_id` | `dev-be` (separate) | DevOps saw **404** on one run; **not reproduced** on QA retest exit **0** — track only if probe regresses |

---

## completion_report

- Re-ran member HRM C/U probe on nip.io after `P1-PHASE1-DO-HRM-EMP-DEPLOY-01` — exit **0**, all in-scope checks **PASS**.
- **Deploy verify (`P1-PHASE1-QA-CRUD-PARITY-DEPLOY-VERIFY-01`):** Re-ran member HRM + XBOS scope probes after `P1-PHASE1-DO-CRUD-PARITY-DEPLOY-01` — both exit **0** on nip.io.
- **C-CRUDQC-07** **CLOSED** for QA/QC gate (pilot parity + scope CRUD API **PASS**).
- Promoted **MEM-CRUD-02** employee create/update and **J-HRM-02** scope parity; **MEM-CRUD-01** contract chain **PASS**.
- Prior **FAIL_TO_PM** (`employee-post-phantom-201`) **closed** on pilot.
- **C-RBACQC-04** browser depth still deferred (non-blocker for API CRUD wave).

## next_owner

**pm** → dispatch **qc** (gate promotion) or matrix sync **ba-process**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-CRUD-JOURNEY-03
from_role: pm
to_role: qc
entry_criteria: QA PASS_TO_PM docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md — MEM-CRUD-01/02 + J-HRM-02 PASS on https://14-225-217-232.nip.io; probe exit 0.
exit_criteria: Audit L2 API slice vs PHASE1_CRUD_ACCEPTANCE_MATRIX §9–10; confirm employee create parity closed; GO or GWC with C-RBACQC-04 browser waiver if applicable; evidence docs/qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md.
evidence_path: docs/qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md
ack_status target: PASS_TO_PM
```

## pm_dispatch_hint

**qc** `P1-PHASE1-QC-CRUD-JOURNEY-03` · **ba-process** sync matrix member Create/Update cells to **PASS** · optional **qa** `C-RBACQC-04` browser when session isolated.
