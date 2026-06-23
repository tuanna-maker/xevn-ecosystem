# QA evidence — P1-PHASE1-QA-MEMBER-CEO-CRUD-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-MEMBER-CEO-CRUD-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 |
| **environment** | HTTPS pilot `PORTAL_DEV_URL=https://14-225-217-232.nip.io` |
| **persona** | Member CEO `du-lich.ceo@xe.vn` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §1 U28-R2, §5–§10 member columns |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` · `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |

---

## Executive verdict

| Slice | Verdict | Notes |
|-------|---------|-------|
| Member CEO **negative** RBAC (403/409 on group rollup) | **PASS** | GMU **403**, KPI holding **409**, xevn/main legal **409**, group POST **409**, master vendor **409** |
| Member CEO **allowed** reads (P-CC-03..08) | **PASS** | All **200**; no `SCOPE_CONTEXT_MISMATCH` on member HRM embed |
| Member CEO **allowed** org mutation (own legal PUT) | **PASS** | `PUT …/legal-entities/:id` (`xe-du-lich`/`main`) → **200** `XBOS-ORG-201` |
| **J-HRM-02** scope parity (list→detail) | **PASS** | `GET …/employees/:id` **200** for list row `8d846eb9-…` |
| Login with dispatch password `xevn-uat-2026` | **FAIL (ENV/doc)** | **401** — portal tourism CEO uses **`Xevn@2026`** per seed/HDSD |
| Matrix member HRM **Create/Update** (contracts, employees) | **UNTESTED** | Out of this wave API slice — see residual |
| **P0-CRUD-05/06** (RACI, workflow approve) | **UNTESTED** | Unchanged program gaps |

**Overall:** **PASS_TO_PM** for U28-R2 member-scope negatives + allowed member mutations on nip.io (portal password).

---

## Password matrix (dispatch vs product)

| Password | `POST /api/xbos/auth/login` | Product use |
|----------|----------------------------|-------------|
| `xevn-uat-2026` (per dispatch) | **401** `XBOS-AUTH-401` | Mobile UAT 1000 NV (`uat.nv####@xe.vn`) — **not** portal tourism CEO |
| `Xevn@2026` (portal SoT) | **201** + JWT | **Authoritative** for `du-lich.ceo@xe.vn` Command Center / HRM embed |

**GWC:** Evidence records both; product verdict uses **`Xevn@2026`**. PM/BA should align dispatch text or seed `xevn-uat-2026` on portal user if sponsor requires single password.

---

## Commands executed

| # | Command | Exit | Verdict |
|---|---------|------|---------|
| 1 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-member-ceo-crud-probe.mjs` | **0** | **PASS** (portal password suite) |
| 2 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs` | **0** | **PASS** — member block on `xevn/main` **409** |
| 3 | Inline master-vendor negative (member token, `tenantId=xevn`) | — | **PASS** both paths **409** |

---

## Negative controls (U28-R2 — PASS = 403 or 409)

| AC-ID | Check | HTTP | Envelope | Verdict |
|-------|-------|------|----------|---------|
| AC-CRUD-CC-ORG-M-RL-01 | `GET /tenant-scope/group-member-units` | **403** | `XBOS-TENANT-403` | **PASS** (negative) |
| AC-CRUD-CC-KPI-M-RL-01 | `GET /kpi-engine/rollup?companyId=holding` | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (negative) |
| AC-CRUD-CC-ORG-M-C-01 | `POST /org-foundation/legal-entities` (`xevn`/`main`) | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (negative) |
| — | `GET /org-foundation/legal-entities/:id` (`xevn`/`main`) rollup | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (negative) |
| U28-R2 vendor | `GET /business-master/vendors/items?tenantId=xevn&companyId=main` | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (negative) |
| U28-R2 vendor | `GET /business-master/vendors?tenantId=xevn&companyId=main` | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (negative) |

**Instant FAIL rule avoided:** No **200** on group-member-units, KPI holding rollup, or master vendor rollup for member CEO.

---

## Allowed member mutations / reads

| AC-ID | Operation | Path / action | HTTP | Code | Verdict |
|-------|-----------|---------------|------|------|---------|
| AC-CRUD-CC-ORG-M-U-01 | **Update** | `PUT /org-foundation/legal-entities/11d2bb7b-…` (`xe-du-lich`/`main`) | **200** | `XBOS-ORG-201` | **PASS** |
| AC-CRUD-CC-ORG-M-RD-01 | **Read detail** | `GET` same entity (`xe-du-lich`/`main`) | **200** | `XBOS-ORG-200` | **PASS** |
| AC-CRUD-HRM-EMP-M-RL-01 | **Read list** | `GET /api/hrm/employees?company_id=main` | **200** | `HRM-EMP-200` | **PASS** (total **10**) |
| AC-CRUD-HRM-CON-M-RL-01 | **Read list** | contracts surface | **200** | — | **PASS** (total **5**) |
| — | P-CC-05..08 embed | insurance / recruitment / attendance / payroll | **200** | — | **PASS** |
| AC-CRUD-HRM-EMP-M-RD-01 | **Read detail** | `GET /employees/8d846eb9-…?company_id=main` | **200** | — | **PASS** (**J-HRM-02**) |

**Scope parity (U28-R4):** List total **10**; detail for first row **200** — no list/detail split.

---

## P-CC / J-* table (member CEO — this run)

| ID | Layer | Verdict | Evidence |
|----|-------|---------|----------|
| P-CC-01 | Login (`Xevn@2026`) | **PASS** | HTTP **201** |
| P-CC-02 | Group member units | **PASS** (negative **403**) | — |
| J-CC-03 | KPI holding | **PASS** (negative **409**) | — |
| P-CC-03..08 | HRM embed load | **PASS** | totals 10 / 5 / 5 / 0 / 27 / 9 |
| J-HRM-02 | List→employee detail | **PASS** | id `8d846eb9-fcf7-4fe3-8987-24c503d80ce3` |
| J-CC-02 | Member legal read/update (API) | **PASS** | PUT **200** `XBOS-ORG-201` |

**Not re-run:** Browser L2.5 J-CC-02 save click (prior `p1-cc-qa-member-legal-save-l25-20260604.md` @ portal-fe **PASS**).

---

## CRUD matrix — member CEO column promotion

| Module | Op | Prior matrix | QA verdict (nip.io) |
|--------|-----|--------------|---------------------|
| CC org | Negative list/detail/update cross-tenant | **PASS** negatives | **PASS** (unchanged) |
| CC org | **U** own tenant PUT | **PASS** | **PASS** (regression) |
| CC KPI | Negative rollup | **PASS** | **PASS** |
| HRM employees | **R** list + detail | **PASS** / **UNTESTED** detail | **PASS** both |
| HRM contracts | **C/U** | **UNTESTED** | **UNTESTED** |
| HRM employees | **C/U** | **UNTESTED** | **UNTESTED** |
| CC workflow / RACI | **U** | **UNTESTED** | **UNTESTED** |

---

## Residual / open gaps

| ID | Item | Severity | Owner | pm_dispatch_hint |
|----|------|----------|-------|------------------|
| **C-MEMPWD-01** | Dispatch cited `xevn-uat-2026` for `du-lich.ceo` — **401** on portal | **Low (doc)** | **ba-docs** / **pm** | Align `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` / HDSD password table with portal `Xevn@2026` |
| **P0-CRUD-05** | RACI matrix save member unit | **Medium** | **dev-be** | `P1-PHASE1-BE-RACI-REGRESS-01` if user reports **409** |
| **P0-CRUD-06** | Workflow approve step | **Medium** | **dev-fe** + seed | `P1-PHASE1-FE-WF-INBOX-01` |
| **MEM-CRUD-01** | Member HRM contract **C/U** | **Low** | **qa** | Next wave `P1-PHASE1-QA-CRUD-JOURNEY-03` or extend matrix probe |
| **MEM-CRUD-02** | Member employee **C/U** | **Low** | **qa** + **dev-be** | Same |
| **ENV-LOCAL** | `qc:dev-stack` / `tmp-c-w2qc-01-crud-matrix-close.mjs` @ local | **Low** | **devops** | `P1-PHASE1-PM-CRUD-MATRIX-02` when local L0/L1 needed |

---

## Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | Executed member CEO CRUD slice on nip.io: all U28-R2 negatives **403/409**; allowed P-CC-03..08 **200**; own legal **GET/PUT 200**; J-HRM-02 detail **200**. Portal login requires **`Xevn@2026`** (not `xevn-uat-2026`). Promotes matrix member negative/read cells; HRM contract/employee **C/U** and P0-05/06 remain **UNTESTED**. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | Task **qc** `P1-PHASE1-QC-CRUD-GATE-01`: adjudicate member CEO column on `docs/qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md` + `p1-phase1-qa-crud-matrix-20260604.md`; promote U28-R2 member cells in `PHASE1_CRUD_ACCEPTANCE_MATRIX.md`. Task **ba-docs** (optional): fix password dispatch mismatch **C-MEMPWD-01**. Task **qa** `P1-PHASE1-QA-CRUD-JOURNEY-03` for member HRM contract/employee **C/U** when PM prioritizes. Do **not** claim Phase 1 DONE. |
| **pm_dispatch_hint** | **qc** `P1-PHASE1-QC-CRUD-GATE-01` · **ba-docs** password table **C-MEMPWD-01** · **qa** member HRM **C/U** **MEM-CRUD-01/02** · **dev-fe** **P0-CRUD-06** · **dev-be** **P0-CRUD-05** only on user regression |
| **evidence_path** | `docs/qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md` |
| **ack_status** | **PASS_TO_PM** |

---

## Probe log (excerpt — `Xevn@2026`)

```text
PASS  login — HTTP 201
PASS  P-CC-02 group-member-units (negative) — HTTP 403 XBOS-TENANT-403
PASS  J-CC-03 KPI holding rollup (negative) — HTTP 409 SCOPE_CONTEXT_MISMATCH
PASS  GET legal-entity xevn/main rollup (negative) — HTTP 409 SCOPE_CONTEXT_MISMATCH
PASS  POST legal-entity group scope (negative) — HTTP 409 SCOPE_CONTEXT_MISMATCH
PASS  GET own legal entity (allowed read) — HTTP 200 XBOS-ORG-200
PASS  PUT own legal entity (allowed mutation) — HTTP 200 XBOS-ORG-201
PASS  P-CC-03 employees (allowed read) — HTTP 200 total=10
PASS  P-CC-04 contracts (allowed read) — HTTP 200 total=5
PASS  P-CC-05 insurance (allowed read) — HTTP 200 total=5
PASS  P-CC-06 recruitment (allowed read) — HTTP 200 total=0
PASS  P-CC-07 attendance (allowed read) — HTTP 200 total=27
PASS  P-CC-08 payroll (allowed read) — HTTP 200 total=9
PASS  J-HRM-02 list→detail (scope parity) — HTTP 200 id=8d846eb9-fcf7-4fe3-8987-24c503d80ce3
MEMBER_CEO_PROBE_OK (Xevn@2026 — portal SoT)
```
