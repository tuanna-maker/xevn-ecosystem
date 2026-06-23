# Phase 1 — CRUD acceptance matrix (U28 RBAC + L2/L2.5)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-PM-CRUD-MATRIX-SYNC-07` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-06-05 (sync after QC **P1-PHASE1-QC-CRUD-MATRIX-GAPS-01** — UNTESTED gap batch **6 PASS / 3 GWC / 1 N/A / 0 FAIL**) |
| **QA evidence** | [`p1-phase1-qa-crud-matrix-20260604.md`](../qa/evidence/p1-phase1-qa-crud-matrix-20260604.md) · [`p1-phase1-qa-member-ceo-crud-20260604.md`](../qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md) · [`p1-phase1-qa-crud-journey-03-20260604.md`](../qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md) · [`p1-phase1-qa-raci-regress-20260604.md`](../qa/evidence/p1-phase1-qa-raci-regress-20260604.md) · [`p1-phase1-qa-wf-inbox-20260604.md`](../qa/evidence/p1-phase1-qa-wf-inbox-20260604.md) · [`p1-phase1-qa-hrm-emp-group-crud-20260604.md`](../qa/evidence/p1-phase1-qa-hrm-emp-group-crud-20260604.md) · [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) · [`p1-phase1-qa-crud-matrix-gaps-20260605-probe.json`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605-probe.json) |
| **QC evidence** | [`p1-phase1-qc-crud-gate-20260604.md`](../qa/evidence/p1-phase1-qc-crud-gate-20260604.md) · [`p1-phase1-qc-crud-journey-03-20260604.md`](../qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md) · [`p1-phase1-qc-crud-parity-gate-01-20260604.md`](../qa/evidence/p1-phase1-qc-crud-parity-gate-01-20260604.md) · [`p1-phase1-qc-hrm-emp-group-crud-20260604.md`](../qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md) |
| **DO evidence** | [`p1-phase1-do-hrm-emp-deploy-20260604.md`](../ops/evidence/p1-phase1-do-hrm-emp-deploy-20260604.md) |
| **SoT inputs** | [`PHASE1_PRODUCT_EXCELLENCE_ORCHESTRATION.md`](PHASE1_PRODUCT_EXCELLENCE_ORCHESTRATION.md) §3 · [`PILOT_BUSINESS_FLOW_MATRIX.md`](../qa/PILOT_BUSINESS_FLOW_MATRIX.md) · [`PROGRAM_JOURNEY_MAP.md`](PROGRAM_JOURNEY_MAP.md) · [`PILOT_BUSINESS_FLOW_BA_TRACE.md`](../qa/PILOT_BUSINESS_FLOW_BA_TRACE.md) |
| **RBAC SoT** | [`docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md`](../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md) · **U28** [`TEAM_USER_REQUIREMENTS.md`](TEAM_USER_REQUIREMENTS.md) |
| **ack_status** | **PASS_TO_PM** |

**Purpose:** Deterministic **Create / Read list / Read detail / Update / Delete|Archive** acceptance per Phase 1 module × persona. Every cell has a **testable** pass/fail rule, **UC-ID**, and **J-*** journey link. **P0** register tracks group-CEO gaps; **P0-CRUD-01..03** and **J-CC-02** read detail promoted **PASS** on nip.io per QA 2026-06-04; **Member CEO** U28-R2 **negative** cells and allowed reads promoted **PASS** per [`p1-phase1-qa-member-ceo-crud-20260604.md`](../qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md) + QC `P1-PHASE1-QC-CRUD-GATE-01`; **Member CEO** HRM contract + employee **Create / Update / Read detail** promoted **PASS** (API **MEM-CRUD-01/02**, **J-HRM-01/02** API scope parity) per [`p1-phase1-qc-crud-journey-03-20260604.md`](../qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md); **P0-CRUD-05** (CC RACI member-unit matrix **Update**, **AC-CRUD-CC-RACI-G-U-01**) promoted **PASS** per [`p1-phase1-qa-raci-regress-20260604.md`](../qa/evidence/p1-phase1-qa-raci-regress-20260604.md); **P0-CRUD-06** (workflow inbox approve, **AC-CRUD-CC-WF-G-U-01**, **J-XBOS-01** API L2.5) promoted **PASS** per [`p1-phase1-qa-wf-inbox-20260604.md`](../qa/evidence/p1-phase1-qa-wf-inbox-20260604.md) — **C-CRUDQC-02** API-closed; strict browser approve **GWC** (optional QA). **C-CRUDQC-07** (VPS pilot BE parity / deploy-verify) **CLOSED** per [`p1-phase1-qc-crud-parity-gate-01-20260604.md`](../qa/evidence/p1-phase1-qc-crud-parity-gate-01-20260604.md) — **§10** contract C/U/RD cells unchanged **PASS**; reopen only on new probe FAIL. **§9** Group CEO employee **Create / Update / Archive** promoted **PASS** per QA + QC **GO WITH CONDITIONS** [`p1-phase1-qc-hrm-emp-group-crud-20260604.md`](../qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md) — **J-HRM-02** API scope parity **PASS**; browser L2.5 **GWC** (**C-EMPGRPQC-01**). **C-RBACQC-04** (member browser L2.5) **CLOSED** per [`p1-phase1-qc-rbac-c04-close-20260604.md`](../qa/evidence/p1-phase1-qc-rbac-c04-close-20260604.md). **2026-06-05 gap batch** (QC **P1-PHASE1-QC-CRUD-MATRIX-GAPS-01**): **§7** catalog Create **PASS**; **§5** org Delete **N/A**; **§11** insurance C/U **PASS**; **§12** recruitment Update **GWC** (**C-CRUDMAT-01**); **§13** attendance C/U **PASS**; **§8** member workflow Read list **PASS**, Read detail / Update **GWC** (**C-CRUDMAT-02**).

---

## 1. U28 RBAC rules (mandatory — all cells inherit)

| Rule ID | Persona | Account | Scope contract | FAIL (instant) |
|---------|---------|---------|----------------|----------------|
| **U28-R1** | Group CEO | `ceo@xe.vn` / `Xevn@2026` | JWT `tenantId=xevn`, `companyId=main`; HRM query `company_id=main`; XBOS org rollup `holding` where SRS | Legitimate group-scope **PUT/POST** returns **409/403**; empty UI masks **4xx/5xx** |
| **U28-R2** | Member CEO | `du-lich.ceo@xe.vn` / `Xevn@2026` (portal) | Member tenant only (`xe-du-lich`, …) | **200** on `group-member-units`, KPI `companyId=holding`, master vendor rollup; portal login with `xevn-uat-2026` → **401** (wrong password family) |
| **U28-R3** | Subordinate | `uat.nv0001@xe.vn`, HRBP | JWT `roleCode` + `memberships[]`; mobile `x-company-id` = UUID | Cross-tenant row visible; **409** `SCOPE_CONTEXT_MISMATCH` on own-company load |
| **U28-R4** | Scope parity | All | List resolver = GET-by-id resolver (HRM `resolveHrmListScope`, XBOS `resolveXbosGroupLegal*`) | List **200** + detail **404/409** for same id |
| **U28-R5** | Evidence | QA/QC | HTTPS pilot `https://14-225-217-232.nip.io` or local `:5175` + APIs up | Claim PASS without URL + HTTP code + envelope `code` |

**Negative PASS (member CEO):** **403** `XBOS-TENANT-403` or **409** `SCOPE_CONTEXT_MISMATCH` on group-only paths = **PASS (negative)** per U28-R2.

---

## 2. Verdict legend

| Code | Meaning | QA action |
|------|---------|-----------|
| **PASS** | AC met on last cited evidence | Regression optional |
| **FAIL** | AC violated | Defect + owner |
| **GWC** | Pass with documented residual | QC may accept bounded slice |
| **P0-GAP** | Group CEO must mutate/read; evidence **409/404/400** | Dispatch **dev-be** first |
| **N/A** | Persona must not execute op (forbidden) | Negative test only |
| **UNTESTED** | No reproducible evidence | **qa** must run before GO |

**AC-ID pattern:** `AC-CRUD-{MODULE}-{PERSONA}-{OP}` where `{PERSONA}` = `G` (group CEO), `M` (member CEO), `S` (subordinate).

---

## 3. P0 gap register (group CEO — QA verdict 2026-06-04, nip.io)

| Gap ID | Module | Op | QA verdict | Evidence / notes | Owner |
|--------|--------|-----|------------|------------------|-------|
| **P0-CRUD-01** | CC org — member legal entity | **Read detail** | **PASS** | `GET …/legal-entities/:id` + `GET …/shareholders` (`xe-du-lich`/`main`) → **200** `XBOS-ORG-200` / `XBOS-SHR-200`; U28-R4 list/detail parity | — (closed) |
| **P0-CRUD-02** | HRM contracts | **Create / Update** | **PASS** | `POST` **201** `HRM-CON-201`; `PATCH` **200** `HRM-CON-200`; detail **200**; `DELETE` **200** | — (closed) |
| **P0-CRUD-03** | HRM insurance (native list) | **Read list** | **PASS** | `GET …/insurance-policy-participants?company_id=main` → **200** `HRM-INS-200` | — (closed) |
| **P0-CRUD-04** | HRM settings catalogs | **Read list** (negative) | **GWC** | `company_id=holding` → **200** `HRM-SET-200` — policy **D16-FROZEN-ALLOW-200**; not FAIL unless PM tightens | dev-be / PM policy |
| **P0-CRUD-05** | CC RACI (member unit) | **Update** | **PASS** | `AC-CRUD-CC-RACI-G-U-01`: `GET/PUT …/raci-governance/companies/{memberUuid}/matrix` → **200** `XBOS-RACI-200` / **201** `XBOS-RACI-201`; no **409**; member `f01bb8dc-99fd-46bf-9653-21ae9f696e5a` (`XE_TMDV`); W5B RACI **9/9** | — (closed) |
| **P0-CRUD-06** | Workflow inbox | **Update** (approve) | **PASS** | **AC-CRUD-CC-WF-G-U-01**: pending list **200** `XBOS-WF-203` → instance detail **200** `XBOS-WF-204` → `POST …/tasks/{id}/complete` **201** `XBOS-WF-200` → list refresh **11** pending (was **12**); reject spot **201** `XBOS-WF-205`; `ceo@xe.vn` + `x-company-id: main`; seed `pnpm seed:workflow:inbox` | — (closed) |

**Closed P0 (regression guard — do not reopen without new FAIL):** Member legal **Update** **4/4 → 200** `XBOS-ORG-201` (`test:xbos:cc-member-save`); **J-CC-02** read detail **PASS** (API L2.5 + cited browser save @ portal-fe `68ec457`); **P0-CRUD-05** RACI member matrix cell save **PASS** (group CEO JWT `companyId=main`, member legal-entity UUID path); **P0-CRUD-06** workflow approve **PASS** (API L2.5 list→detail→complete→refresh). Source: `p1-phase1-qa-crud-matrix-20260604.md` · `p1-phase1-qa-raci-regress-20260604.md` · `p1-phase1-qa-wf-inbox-20260604.md` · BE `p1-phase1-be-scope-crud-20260604.md`.

---

## 4. Command Center — Auth / session

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **N/A** (system login) | **PASS** · AC-CRUD-AUTH-G-RL-01 · `POST /auth/login` → **201**, `expiresInSec=86400` | **PASS** · AC-CRUD-AUTH-G-RD-01 · session claims include `tenantId`, `companyId`, `memberships[]` | **N/A** | **N/A** |
| **Member CEO** | **N/A** | **PASS** · AC-CRUD-AUTH-M-RL-01 · login **201** scoped member tenant | **PASS** · AC-CRUD-AUTH-M-RD-01 · JWT **excludes** `companyId=main` rollup | **N/A** | **N/A** |
| **Subordinate** | **N/A** | **PASS** · AC-CRUD-AUTH-S-RL-01 · mobile login **200/201** | **PASS** · AC-CRUD-AUTH-S-RD-01 · `company_uuid` present for MOB | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-XBOS-AUTH-01, UC-XBOS-AUTH-02, UC-ECO-SCOPE-02 | **J-CC-01**, P-CC-01 |

**Evidence:** `p1-ex-qa-https-p-cc-01-jwt-01-20260604.md` · `p1-phase1-qc-full-rbac-20260604.md`

---

## 5. Command Center — Org / member legal entity

**Entity:** legal entity (đơn vị thành viên) · **Route:** P-CC-02 · **J-CC-02**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **GWC** · AC-CRUD-CC-ORG-G-C-01 · `POST …/legal-entities` valid body → **201** `XBOS-ORG-201` OR UI «Thêm đơn vị» disabled with explicit copy (document which) | **PASS** · AC-CRUD-CC-ORG-G-RL-01 · `GET tenant-scope/group-member-units` → **200**, ≥1 row | **PASS** · AC-CRUD-CC-ORG-G-RD-01 · `GET …/legal-entities/:id` + shareholders preload (`xe-du-lich`/`main`) → **200**; **FAIL** if **409** (nip.io 2026-06-04) | **PASS** · AC-CRUD-CC-ORG-G-U-01 · `PUT …/legal-entities/:id` all member slugs → **200** `XBOS-ORG-201`; **FAIL** if **409/403** | **N/A** · AC-CRUD-CC-ORG-G-D-01 · `DELETE …/legal-entities/{id}` → **404** `XBOS-CFG-001` — SRS archive route not exposed (nip.io 2026-06-05) |
| **Member CEO** | **PASS (negative)** · AC-CRUD-CC-ORG-M-C-01 · `POST …/legal-entities` (`xevn`/`main`) → **409** `SCOPE_CONTEXT_MISMATCH` | **PASS (negative)** · AC-CRUD-CC-ORG-M-RL-01 · `group-member-units` → **403** `XBOS-TENANT-403` | **PASS (negative)** · cross-tenant `GET …/legal-entities/:id` (`xevn`/`main`) → **409**; **PASS** · own tenant GET → **200** `XBOS-ORG-200` | **PASS** · AC-CRUD-CC-ORG-M-U-01 · PUT only within own tenant `{slug}/main` → **200** `XBOS-ORG-201`; **FAIL** if cross-tenant | **N/A** |
| **Subordinate** | **N/A** | **N/A** | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-CC-03, UC-CC-04, UC-XBOS-ORG-01, UC-XBOS-ORG-03, UC-XBOS-TENANT-03 | **J-CC-02**, P-CC-02 |

**Evidence:** `p1-phase1-qa-crud-matrix-20260604.md` (J-CC-02 read detail **PASS** nip.io) · `p1-phase1-qa-member-ceo-crud-20260604.md` (member negatives + own legal GET/PUT **200**) · `p1-cc-qa-member-legal-save-l25-20260604.md` (PUT + browser L2.5) · `test:xbos:cc-member-save` 4/4 · [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) (**AC-CRUD-CC-ORG-G-D-01** **N/A**) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md)

---

## 6. Command Center — KPI / dashboard rollup

**Entity:** KPI rollup · **J-CC-03**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **N/A** (KPI compute batch) | **PASS** · AC-CRUD-CC-KPI-G-RL-01 · `GET /kpi-engine/rollup?companyId=holding` + session `main` → **200**; no **409** on dashboard load | **PASS** · AC-CRUD-CC-KPI-G-RD-01 · drill-down card → KPI series **200** or empty+**200** | **N/A** (config KPI = master data) | **N/A** |
| **Member CEO** | **N/A** | **PASS (negative)** · AC-CRUD-CC-KPI-M-RL-01 · rollup `companyId=holding` → **409** `SCOPE_CONTEXT_MISMATCH` (not **200**) | **N/A** | **N/A** | **N/A** |
| **Subordinate** | **N/A** | **N/A** | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-XBOS-KPI-03, UC-XBOS-KPI-04, UC-XBOS-DASH-01, UC-XBOS-CC-05 | **J-CC-03** |

**Evidence:** `p1-ex-qa-https-post-deploy-20260603.md` · `p1-phase1-qc-full-rbac-20260604.md` (member **409**)

---

## 7. Command Center — Catalog governance (HRM DM inbox)

**Entity:** catalog governance task · **P-CC-09**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **PASS** · AC-CRUD-CC-CAT-G-C-01 · `POST /api/hrm/settings-catalogs/job_titles/extension-items` → **201** `HRM-SET-209` (nip.io 2026-06-05) | **PASS** · AC-CRUD-CC-CAT-G-RL-01 · `GET …/catalog-governance/inbox` → **200** `XBOS-CAT-212`; empty+**200** OK | **PASS** · AC-CRUD-CC-CAT-G-RD-01 · open task row → detail **200** | **PASS** · AC-CRUD-CC-CAT-G-U-01 · `POST …/tasks/:id/approve` with pending task → **201** `XBOS-CAT-201`; **FAIL** **409** on legitimate approver | **N/A** |
| **Member CEO** | **N/A** | **UNTESTED** · AC-CRUD-CC-CAT-M-RL-01 · inbox only if member has approver role — else **403** | **N/A** | **UNTESTED** | **N/A** |
| **Subordinate** | **N/A** | **N/A** | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-XBOS-CAT-03, UC-XBOS-CAT-04, UC-XBOS-CAT-05 | **J-HRM-08** (governance), P-CC-09 |

**Evidence:** `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-09 PASS S2 · ADR write-scope strict on approve · [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) (**AC-CRUD-CC-CAT-G-C-01** **PASS**) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md)

---

## 8. Command Center — Workflow / inbox tasks

**Entity:** workflow task / approval session · **J-XBOS-01**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **UNTESTED** · AC-CRUD-CC-WF-G-C-01 · start workflow instance → **201** | **PASS** · AC-CRUD-CC-WF-G-RL-01 · `GET …/workflow-engine/tasks?status=pending&assigneeUserId=ceo@xe.vn` → **200** `XBOS-WF-203` (assignee filter) | **PASS** · AC-CRUD-CC-WF-G-RD-01 · `GET …/instances/{id}/detail` → **200** `XBOS-WF-204` | **PASS** · AC-CRUD-CC-WF-G-U-01 · `POST …/tasks/{id}/complete` → **201** `XBOS-WF-200`; reject → **201** `XBOS-WF-205`; **GWC** strict browser drawer (BR-INBOX-01) | **N/A** |
| **Member CEO** | **N/A** | **PASS** · AC-CRUD-CC-WF-M-RL-01 · `GET …/workflow-engine/tasks?tenantId=xe-du-lich&status=pending&assigneeUserId=du-lich.ceo@xe.vn` → **200** `XBOS-WF-203` (pending=0 valid; nip.io 2026-06-05) | **GWC** · AC-CRUD-CC-WF-M-RD-01 · `GET …/instances/{id}/detail` — empty inbox; detail not exercised (**C-CRUDMAT-02**) | **GWC** · AC-CRUD-CC-WF-M-U-01 · `POST …/tasks/{id}/complete` — empty inbox; approve not exercised (**C-CRUDMAT-02**) | **N/A** |
| **Subordinate** | **N/A** | **N/A** | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-XBOS-14, UC-XBOS-WF-04, UC-XBOS-WF-05, UC-CC-P0-06 | **J-XBOS-01** — API L2.5 approve **PASS**; journey map sync → **pm** |

**Evidence:** [`p1-phase1-qa-wf-inbox-20260604.md`](../qa/evidence/p1-phase1-qa-wf-inbox-20260604.md) · [`p1-phase1-fe-wf-inbox-20260604.md`](../qa/evidence/p1-phase1-fe-wf-inbox-20260604.md) · `PROGRAM_JOURNEY_MAP.md` J-XBOS-01 (PM promote) · `PHASE1_UX_BENCHMARK_ASSESSMENT.md` BR-INBOX-01 · [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) (member **M-RL PASS** · **M-RD/M-U GWC**) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md)

---

## 9. HRM embed — Employees

**Entity:** employee · **P-CC-03** · **J-HRM-02**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **PASS** · AC-CRUD-HRM-EMP-G-C-01 · `POST /api/hrm/employees` valid DTO → **201** `HRM-EMP-201` (nip.io 2026-06-05 QA probe) | **PASS** · AC-CRUD-HRM-EMP-G-RL-01 · `GET …/employees?company_id=main&page_size≤100` → **200** `HRM-EMP-200`; ≥1 row OR empty+**200** | **PASS** · AC-CRUD-HRM-EMP-G-RD-01 · `GET …/employees/:id?company_id=main` → **200**; UI no «Không tìm thấy» when list row exists | **PASS** · AC-CRUD-HRM-EMP-G-U-01 · `PATCH …/employees/:id` field `full_name` → **200** `HRM-EMP-202` (nip.io 2026-06-05) | **PASS** · AC-CRUD-HRM-EMP-G-D-01 · `POST …/employees/:id/archive` → **201** `HRM-EMP-203`; default GET **404** after archive (nip.io 2026-06-05) |
| **Member CEO** | **PASS** · AC-CRUD-HRM-EMP-M-C-01 · `POST …/employees?company_id=main` → **201** `HRM-EMP-201` (member tenant only) | **PASS** · AC-CRUD-HRM-EMP-M-RL-01 · list member `company_id` → **200**; count > 0 post seed | **PASS** · AC-CRUD-HRM-EMP-M-RD-01 · `GET …/employees/:id?company_id=main` → **200** on **newly created** id (**J-HRM-02** API scope parity) | **PASS** · AC-CRUD-HRM-EMP-M-U-01 · `PATCH …/employees/:id` → **200** `HRM-EMP-202` | **N/A** |
| **Subordinate** | **N/A** | **PASS** · AC-CRUD-HRM-EMP-S-RL-01 · self scope list → **200**; no other-tenant rows | **PASS** · AC-CRUD-HRM-EMP-S-RD-01 · own profile **200** | **GWC** · AC-CRUD-HRM-EMP-S-U-01 · self-service fields only | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-HRM-21 | **J-HRM-02**, P-CC-03 |

**Evidence:** `p1-ex-qa-01-r4-20260526.md` · `p1-close-qa-w5b-20260525.md` · `p1-phase1-qa-member-ceo-crud-20260604.md` (member list/detail seed) · `p1-phase1-qa-crud-journey-03-20260604.md` · `p1-phase1-qc-crud-journey-03-20260604.md` (**MEM-CRUD-02**, probe exit **0**) · `p1-phase1-do-hrm-emp-deploy-20260604.md` · [`p1-phase1-qa-hrm-emp-group-crud-20260604.md`](../qa/evidence/p1-phase1-qa-hrm-emp-group-crud-20260604.md) (**Group CEO C/U/D**, probe exit **0**) · [`p1-phase1-qc-hrm-emp-group-crud-20260604.md`](../qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md) (**QC GWC** concurrence, spot-check exit **0**) · `PROGRAM_JOURNEY_MAP.md` **J-HRM-02** (API PASS / browser **C-EMPGRPQC-01**) · `employee-post-phantom-201` **CLOSED**

---

## 10. HRM embed — Contracts

**Entity:** contract · **P-CC-04** · **J-HRM-01**, **J-HRM-03**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **PASS** · AC-CRUD-HRM-CON-G-C-01 · `POST …/contracts-insurance/contracts` → **201** `HRM-CON-201`; **FAIL** **400** `HRM-VAL-001` (nip.io 2026-06-04) | **PASS** · AC-CRUD-HRM-CON-G-RL-01 · `GET …/contracts?company_id=main` → **200** `HRM-CON-200` | **PASS** · AC-CRUD-HRM-CON-G-RD-01 · drawer/detail **200**; click NV → employee **200** (J-HRM-01) | **PASS** · AC-CRUD-HRM-CON-G-U-01 · `PATCH …/contracts/:id` → **200**; **FAIL** if create blocked | **PASS** · AC-CRUD-HRM-CON-G-D-01 · `DELETE` → **200** (nip.io probe) |
| **Member CEO** | **PASS** · AC-CRUD-HRM-CON-M-C-01 · `POST …/contracts-insurance/contracts` → **201** `HRM-CON-201` | **PASS** · AC-CRUD-HRM-CON-M-RL-01 · `GET …/contracts?company_id=main` → **200** (nip.io 2026-06-04) | **PASS** · AC-CRUD-HRM-CON-M-RD-01 · `GET …/contracts/:id?company_id=main` → **200** (**J-HRM-01** linked employee **200**) | **PASS** · AC-CRUD-HRM-CON-M-U-01 · `PATCH …/contracts/:id` → **200** `HRM-CON-200` | **N/A** |
| **Subordinate** | **N/A** | **N/A** | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-HRM-25 (HĐ) | **J-HRM-01**, **J-HRM-03**, P-CC-04 |

**Evidence:** `p1-phase1-qa-crud-matrix-20260604.md` (P0-CRUD-02 closed, group CEO) · `p1-phase1-qa-crud-journey-03-20260604.md` · `p1-phase1-qc-crud-journey-03-20260604.md` (**MEM-CRUD-01**) · `p1-phase1-qc-crud-parity-gate-01-20260604.md` (**C-CRUDQC-07 CLOSED**) · `p1-phase1-do-crud-parity-deploy-20260604.md` · `c-w2qc-01-crud-matrix-close-20260602.md` · `PILOT_BUSINESS_FLOW_BA_TRACE.md` UC25-*

**Residual (post C-CRUDQC-07):** **C-CRUDQC-07 CLOSED** — deploy-verify + `MEM-CRUD-01` contract probes exit **0** on nip.io; group/member CEO §10 cells stay **PASS**. **C-CRUDQC-06** orphan contract GET **404** — regression watch only. **C-CRUDQC-07-git** — optional `origin/main` commit/push (process GWC; does not reopen §10). **P0-04** holding catalog **GWC** unchanged.

---

## 11. HRM embed — Insurance

**Entity:** insurance participation / BHXH row · **P-CC-05** · **J-HRM-04**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **PASS** · AC-CRUD-HRM-INS-G-C-01 · `POST …/insurance-policy-participants` → **201** `HRM-INS-P-201` (nip.io 2026-06-05) | **PASS** · AC-CRUD-HRM-INS-G-RL-01 · native `GET …/insurance-policy-participants?company_id=main` → **200** `HRM-INS-200` (nip.io 2026-06-04); contracts proxy also **200** | **PASS** · AC-CRUD-HRM-INS-G-RD-01 · employee link → **200** (J-HRM-04) | **PASS** · AC-CRUD-HRM-INS-G-U-01 · `PATCH …/insurance-policy-participants/:id?company_id=main` → **200** `HRM-INS-P-200` (nip.io 2026-06-05) | **N/A** |
| **Member CEO** | **N/A** | **UNTESTED** | **UNTESTED** | **N/A** | **N/A** |
| **Subordinate** | **N/A** | **N/A** | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-HRM-25 (BHXH) | **J-HRM-04**, P-CC-05 |

**Evidence:** `p1-phase1-qa-crud-matrix-20260604.md` (P0-CRUD-03 closed) · `p1-ex-qa-01-r4` J-HRM-04 PASS · BR-INS-01 UX gap · [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) (**AC-CRUD-HRM-INS-G-C-01** / **G-U-01** **PASS**) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md)

---

## 12. HRM embed — Recruitment

**Entity:** requisition · **P-CC-06** · **J-HRM-05**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **GWC** · AC-CRUD-HRM-REC-G-C-01 · deep create gated — PASS if UI shows disabled+reason OR `POST …/requisitions` → **201** | **PASS** · AC-CRUD-HRM-REC-G-RL-01 · `GET …/recruitment/requisitions?company_id=main` → **200** `HRM-REC-200` | **PASS** · AC-CRUD-HRM-REC-G-RD-01 · requisition/candidate detail **200** | **GWC** · AC-CRUD-HRM-REC-G-U-01 · `PATCH …/recruitment/requisitions/:id` → **404**; alternate `PATCH …/headcount-proposals/:id/status` → **200** `HRM-REC-HC-200` (**C-CRUDMAT-01** — strict requisition PATCH deferred unless sponsor requires) | **N/A** |
| **Member CEO** | **UNTESTED** | **UNTESTED** | **UNTESTED** | **N/A** | **N/A** |
| **Subordinate** | **N/A** | **N/A** | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-HRM-22 | **J-HRM-05**, P-CC-06 |

**Evidence:** `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-06 PASS · `PILOT_BUSINESS_FLOW_BA_TRACE.md` UC22-* · [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) (**AC-CRUD-HRM-REC-G-U-01** **GWC**) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md)

---

## 13. HRM embed — Attendance

**Entity:** attendance record · **P-CC-07** · **J-HRM-06**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **PASS** · AC-CRUD-HRM-ATT-G-C-01 · `POST …/attendance/records` → **201** `HRM-ATT-201` (nip.io 2026-06-05 QA first-run) | **PASS** · AC-CRUD-HRM-ATT-G-RL-01 · `GET …/attendance/records` → **200** `HRM-ATT-200`; no **409** load | **PASS** · AC-CRUD-HRM-ATT-G-RD-01 · record detail **200**; date ≠ `01/01/1970` | **PASS** · AC-CRUD-HRM-ATT-G-U-01 · `PATCH …/attendance/records/:recordId/status` → **200** `HRM-ATT-202` (nip.io 2026-06-05) | **N/A** |
| **Member CEO** | **N/A** | **UNTESTED** | **N/A** | **N/A** | **N/A** |
| **Subordinate** | **PASS** · AC-CRUD-HRM-ATT-S-C-01 · mobile check-in **201** UUID scope (M-02) | **PASS** · AC-CRUD-HRM-ATT-S-RL-01 · own records | **N/A** | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-HRM-23, UC-HRM-MOB-04 | **J-HRM-06**, P-CC-07, J-MOB-02 |

**Evidence:** `PILOT_BUSINESS_FLOW_BA_TRACE.md` UC23-E2 (1970 date) · `p1-ex-qa-https-j-hrm-06-01-r6-20260529.md` · [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) (**AC-CRUD-HRM-ATT-G-C-01** / **G-U-01** **PASS**) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md) (QC re-probe duplicate **ENV** — **C-CRUDMAT-04**)

---

## 14. HRM embed — Payroll

**Entity:** payslip · **P-CC-08** · **J-HRM-07**

| Persona | Create | Read list | Read detail | Update | Delete/Archive |
|---------|--------|-----------|-------------|--------|----------------|
| **Group CEO** | **N/A** (payroll run batch) | **PASS** · AC-CRUD-HRM-PAY-G-RL-01 · `GET …/payroll/payslips?company_id=main` → **200** `HRM-PAY-200` | **PASS** · AC-CRUD-HRM-PAY-G-RD-01 · payslip detail **200** (J-HRM-07) | **N/A** | **N/A** |
| **Member CEO** | **N/A** | **UNTESTED** | **UNTESTED** | **N/A** | **N/A** |
| **Subordinate** | **N/A** | **GWC** · AC-CRUD-HRM-PAY-S-RL-01 · mobile list — API **200** vs device empty = **FAIL** device | **GWC** · AC-CRUD-HRM-PAY-S-RD-01 · J-MOB-04 | **N/A** | **N/A** |

| UC-ID | J-* / P-CC |
|-------|------------|
| UC-HRM-24 | **J-HRM-07**, P-CC-08, J-MOB-04 |

**Evidence:** `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-08 · `PROGRAM_JOURNEY_MAP.md` J-MOB-04 FAIL device

---

## 15. Mobile — consolidated (Phase 1 boundary)

| Module | Group CEO | Member CEO | Subordinate |
|--------|-----------|------------|-------------|
| Leave / approve | **N/A** | **UNTESTED** | **FAIL** · J-MOB-03/05 · **409** `HRM-AUTH-001` / empty list vs API pending |
| Payslip | **N/A** | **UNTESTED** | **FAIL** · J-MOB-04 |
| Check-in | **N/A** | **N/A** | **PASS** · J-MOB-02 |

**Evidence:** `PROGRAM_JOURNEY_MAP.md` J-MOB-03..05 · `p1-p100-w10-device-02-20260531.md`

---

## 16. Business rule cross-cut (CRUD precondition)

| BR-ID | Condition | Action | Outcome | Maps to |
|-------|-----------|--------|---------|---------|
| BR-CRUD-SCOPE-01 | JWT `companyId` ≠ query `company_id` | Reject | **409** `SCOPE_CONTEXT_MISMATCH` | All modules |
| BR-CRUD-SCOPE-02 | Group CEO reads member legal | Use `resolveXbosGroupLegalReadScope` parity | **200** on GET | P0-CRUD-01 **PASS** |
| BR-CRUD-SCOPE-03 | Member CEO calls group rollup | Deny | **403/409** (PASS negative) | U28-R2 |
| BR-CRUD-EMPTY-01 | Valid scope + zero rows | Return **200** empty | UI empty state | L2 alternate |
| BR-CRUD-DTO-01 | POST/PATCH body ≠ OpenAPI DTO | Reject | **400** `HRM-VAL-001` / `XBOS-VAL-001` | P0-CRUD-02 **PASS** |
| BR-CRUD-PARITY-01 | List returns id visible | GET-by-id same resolver | **200** | U28-R4 |

---

## 17. QA execution pack (downstream)

```bash
# L0
pnpm run qc:dev-stack

# L1
pnpm run test:system:uat

# L2 + L2.5 (pilot)
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs

# CC member legal mutate regression
pnpm run test:xbos:cc-member-save

# CRUD fail-closed (local, when stack up)
$env:PORTAL_DEV_URL='http://127.0.0.1:5175'; node scripts/tmp-c-w2qc-01-crud-matrix-close.mjs

# Member CEO HRM C/U (nip.io — MEM-CRUD-01/02)
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'; node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs

# P0-CRUD-05 RACI member matrix (nip.io)
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-qa-raci-regress-probe.mjs

# P0-CRUD-06 workflow inbox approve (local xbos :28002)
pnpm seed:workflow:inbox
node scripts/tmp-p1-phase1-qa-wf-inbox-probe.mjs

# UNTESTED gap batch (nip.io — 10 AC-IDs)
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-qa-crud-matrix-gaps-probe.mjs
```

**Evidence file (QA publish):** [`docs/qa/evidence/p1-phase1-qa-crud-matrix-20260604.md`](../qa/evidence/p1-phase1-qa-crud-matrix-20260604.md) — P0-01..03 **PASS**, J-CC-02 read detail **PASS** on nip.io. [`p1-phase1-qa-crud-journey-03-20260604.md`](../qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md) — member contract/employee **C/U** + **J-HRM-01/02** API **PASS** (QC concurrence [`p1-phase1-qc-crud-journey-03-20260604.md`](../qa/evidence/p1-phase1-qc-crud-journey-03-20260604.md)). [`p1-phase1-qa-raci-regress-20260604.md`](../qa/evidence/p1-phase1-qa-raci-regress-20260604.md) — **P0-CRUD-05** **PASS**, W5B RACI **9/9**. [`p1-phase1-qa-wf-inbox-20260604.md`](../qa/evidence/p1-phase1-qa-wf-inbox-20260604.md) — **P0-CRUD-06** **PASS**, **J-XBOS-01** API L2.5 approve. [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) — gap batch **6 PASS / 3 GWC / 1 N/A / 0 FAIL** (QC [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md) **GO WITH CONDITIONS**).

---

## 18. Handoff — BA sync → PM (`P1-PHASE1-BA-CRUD-MATRIX-SYNC-05`)

| Field | Value |
|-------|-------|
| **completion_report** | Audited **§9** Group CEO employee cells — **no stale UNTESTED** for C/U/D; all five ops **PASS** with AC-IDs; QC evidence line added. Concurred **PROGRAM_JOURNEY_MAP.md** **J-HRM-02** (API PASS · browser **C-EMPGRPQC-01** GWC). **§3** P0 register unchanged — **no OPEN/UNTESTED** P0 rows; **P0-04** **GWC** (D16). HRM-EMP group CEO slice **DONE** for CRUD matrix wave. |
| **residual** | **C-RBACQC-03** **CLOSED** (nip.io `phase1:gate --strict` + A1 capabilities exit **0**, QC `P1-PHASE1-QC-PROGRAM-GATE-03` 2026-06-05); **C-RBACQC-05** **CLOSED** → §19 `P1-PHASE1-BA-JOURNEY-SYNC-06`; **C-RBACQC-03-LOCAL** optional local `qc:dev-stack` reproducibility → devops; **C-EMPGRPQC-01** optional browser P-CC-03; **C-EMPGRPQC-02** QA pack format (process); **C-CRUDQC-02** strict browser WF optional; **C-CRUDQC-06** orphan GET **404** watch; **C-CRUDQC-07-git** optional `main` commit. Gap-batch UNTESTED cells → §20 `P1-PHASE1-PM-CRUD-MATRIX-SYNC-07`. **NOT** Phase 1 DONE / **NOT** PROD. |
| **next_owner** | **pm** (post §19 journey sync) |
| **evidence_path** | `docs/qa/evidence/p1-phase1-qc-program-gate-03-20260605.md` · `docs/qa/evidence/p1-phase1-qa-program-gate-03-20260605.md` |
| **ack_status** | **PASS_TO_PM** |

### PM dispatch list (copy-ready — post BA-CRUD-MATRIX-SYNC-05)

| Priority | work_item_id | Role | Scope |
|----------|--------------|------|-------|
| 1 | `P1-PHASE1-BA-JOURNEY-SYNC-06` | ba-process | **C-RBACQC-05** — `PROGRAM_JOURNEY_MAP.md` + `USER_SERVICE_STATUS` sync post program gate |
| 2 | `P1-PHASE1-QA-HRM-EMP-BROWSER-L25-01` | qa | **C-EMPGRPQC-01** — optional strict **J-HRM-02** browser P-CC-03 embed click (only if sponsor requires) |
| — | `P1-PHASE1-QC-PROGRAM-GATE-03` | qc | **DONE** — **C-RBACQC-03 CLOSED** (nip.io strict gate GWC) |
| — | `P1-PHASE1-QA-PROGRAM-GATE-03` | qa | **DONE** — strict gate + A1 capabilities nip.io |
| 3 | `P1-PHASE1-BE-CRUD-PARITY-MAIN-01` | dev-be / devops | **GWC** — **C-CRUDQC-07-git** only when user requests `main` commit |
| — | `P1-PHASE1-QC-HRM-EMP-GROUP-CRUD-01` | qc | **DONE** — §9 group CEO employee C/U/D **GWC** |
| — | `P1-PHASE1-BA-CRUD-MATRIX-SYNC-05` | ba-process | **DONE** — §9 QC evidence + §18 dispatch sync |
| — | `P1-PHASE1-QC-CRUD-PARITY-GATE-01` | qc | **DONE** — **C-CRUDQC-07 CLOSED** |
| — | `P1-PHASE1-QC-RBAC-C04-CLOSE-01` | qc | **DONE** — **C-RBACQC-04 CLOSED** |
| — | `P1-PHASE1-BA-CRUD-MATRIX-SYNC-04` | ba-process | **DONE** — P0-06 **PASS** |
| — | `P1-PHASE1-QA-WF-INBOX-01` | qa | **DONE** — P0-CRUD-06 **PASS** |

---

## 19. Handoff — BA journey sync → PM (`P1-PHASE1-BA-JOURNEY-SYNC-06`)

| Field | Value |
|-------|-------|
| **completion_report** | Audited **`PROGRAM_JOURNEY_MAP.md`** — **J-HRM-02** (API PASS · browser **C-EMPGRPQC-01** GWC) and **J-XBOS-01** (API L2.5 PASS · browser GWC optional) **concurred** with QC program gate evidence; header + incident log updated for **C-RBACQC-03 CLOSED** (2026-06-05). Cross-checked **`USER_SERVICE_STATUS.md`** vs **`SERVICE_READINESS_UAT_PRODUCTION.md`** — **no contradictory PROD claims** (both NOT PROD-READY; interim nip.io GWC ≠ fully live). Fixed USER_SERVICE summary table formatting. **`EVIDENCE_INDEX.md`** rows added for program gate QA/QC + this sync. **`C-RBACQC-05 CLOSED**. |
| **residual** | **C-RBACQC-03-LOCAL** optional local `qc:dev-stack`; **C-EMPGRPQC-01** optional browser J-HRM-02; **C-CRUDQC-02** strict browser WF; member workflow **M-RL PASS** / **M-RD/M-U GWC** per §20; program G4/G5 / Phase 1 DONE open. **NOT** PROD. |
| **next_owner** | **pm** |
| **evidence_path** | `docs/program/PROGRAM_JOURNEY_MAP.md` · `docs/program/SERVICE_READINESS_UAT_PRODUCTION.md` §6 · `docs/program/USER_SERVICE_STATUS.md` · `docs/program/EVIDENCE_INDEX.md` · `docs/qa/evidence/p1-phase1-qc-program-gate-03-20260605.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 20. Handoff — BA CRUD matrix gap sync → PM (`P1-PHASE1-PM-CRUD-MATRIX-SYNC-07`)

| Field | Value |
|-------|-------|
| **completion_report** | Synced **10** UNTESTED cells from QC **P1-PHASE1-QC-CRUD-MATRIX-GAPS-01** (QA probe exit **0**, nip.io 2026-06-05): **§7** catalog Group CEO **Create** → **PASS** (`AC-CRUD-CC-CAT-G-C-01`, **201** `HRM-SET-209`); **§5** org Group CEO **Delete** → **N/A** (`AC-CRUD-CC-ORG-G-D-01`, **404** `XBOS-CFG-001`); **§11** insurance Group CEO **Create / Update** → **PASS** (`HRM-INS-P-201` / `HRM-INS-P-200`); **§13** attendance Group CEO **Create / Update** → **PASS** (`HRM-ATT-201` / `HRM-ATT-202`); **§8** member workflow **Read list** → **PASS** (`XBOS-WF-203` pending=0); **§12** recruitment Group CEO **Update** → **GWC**; **§8** member workflow **Read detail / Update** → **GWC**. Evidence lines linked in §5/7/8/11/12/13 + §17. **Zero FAIL** on QA first run. **NOT** Phase 1 DONE / **NOT** PROD. |
| **residual** | See **GWC conditions** below — all **deferred** unless sponsor/user triggers reopen. |
| **next_owner** | **pm** |
| **evidence_path** | [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md) · [`p1-phase1-qa-crud-matrix-gaps-20260605-probe.json`](../qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605-probe.json) · [`p1-phase1-qc-crud-matrix-gaps-20260605.md`](../qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md) |
| **ack_status** | **PASS_TO_PM** |

### GWC conditions (C-CRUDMAT-01..04)

| ID | Condition | Owner | Priority | Status | Reopen trigger |
|----|-----------|-------|----------|--------|----------------|
| **C-CRUDMAT-01** | **AC-CRUD-HRM-REC-G-U-01** — no `PATCH /api/hrm/recruitment/requisitions/:id`; alternate `PATCH …/headcount-proposals/:id/status` → **200** `HRM-REC-HC-200` works. Matrix documents headcount-proposals as SoT; strict requisition PATCH **deferred** unless sponsor requires. | **dev-be** (optional) or **ba-process** (SoT) | **P2** | **DEFERRED** — sponsor optional | Sponsor requires strict AC-CRUD-HRM-REC-G-U-01 on requisition route |
| **C-CRUDMAT-02** | Member CEO workflow **J-XBOS-01** L2.5 — `du-lich.ceo@xe.vn` inbox **pending=0**; **M-RD** / **M-U** not exercised. List contract **PASS**; detail/approve need seed. | **devops** + **qa** | **P3** | **DEFERRED** — optional seed | User defect on member inbox approve; sponsor wants member WF L2.5 closure |
| **C-CRUDMAT-03** | QA evidence pack format — `verify:qc:evidence-pack` **6/8** (`ack_status:` line + `pnpm` command table). | **qa** | **P4** | **OPEN** (process) | Next pack verify **<6/8** without substantive CRUD |
| **C-CRUDMAT-04** | Probe idempotency — attendance **Create** fails on QC re-run (**400** duplicate `uq_attendance_company_employee_date`); QA first-run **PASS** stands. | **qa** | **P4** | **OPEN** (process) | QC re-probe false FAIL on duplicate |

### PM dispatch list (copy-ready — post CRUD-MATRIX-SYNC-07)

| Priority | work_item_id | Role | Scope | Trigger |
|----------|--------------|------|-------|---------|
| — | `P1-PHASE1-PM-CRUD-MATRIX-SYNC-07` | ba-process | **DONE** — matrix §5/7/8/11/12/13 UNTESTED→PASS/GWC/N/A | Always after QC PASS_TO_PM |
| — | `P1-PHASE1-QC-CRUD-MATRIX-GAPS-01` | qc | **DONE** — **GO WITH CONDITIONS** 6/3/1/0 | — |
| — | `P1-PHASE1-QA-CRUD-MATRIX-GAPS` | qa | **DONE** — probe exit **0** | — |
| Optional P2 | `P1-PHASE1-BE-REC-REQ-PATCH-01` | dev-be | Add `PATCH /recruitment/requisitions/:id` | **Only if sponsor requires strict C-CRUDMAT-01** — else **defer** |
| Optional P3 | `P1-PHASE1-DO-WF-MEMBER-SEED-01` | devops + qa | `seed:workflow:inbox` member slice; retest **M-RD/M-U** | Sponsor wants **J-XBOS-01** member L2.5 |
| P4 | `P1-PHASE1-QA-EVIDENCE-PACK-FMT-01` | qa | **C-CRUDMAT-03** pack format | Next QC wave |
| P4 | `P1-PHASE1-QA-PROBE-IDEMPOTENCY-01` | qa | **C-CRUDMAT-04** dynamic date / cleanup | Next attendance re-probe |

### Business rule delta (recruitment Update — C-CRUDMAT-01)

| BR-ID | Condition | Action | Outcome | Maps to |
|-------|-----------|--------|---------|---------|
| BR-REC-UPDATE-01 | Group CEO updates requisition status | Primary matrix AC expects `PATCH …/requisitions/:id` | Route **404** — not exposed | **GWC** — use headcount-proposals path |
| BR-REC-UPDATE-02 | Headcount proposal status change | `PATCH …/headcount-proposals/:id/status` with valid body | **200** `HRM-REC-HC-200` | **PASS** alternate (current SoT for wave) |

**Remaining UNTESTED (not in this batch):** §7 member catalog **M-RL/M-U**; §12 member recruitment; §13 member attendance list; §14 member payroll; §15 mobile; §8 group WF **Create** — dispatch separate waves.

---

*Maintained by BA-Process · update after each CRUD wave verdict.*
