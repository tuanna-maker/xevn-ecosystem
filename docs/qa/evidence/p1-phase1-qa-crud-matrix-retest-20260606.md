# QA — P1-PHASE1-QA-CRUD-MATRIX-RETST (localhost U32)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-CRUD-MATRIX-RETST` |
| **from_role** | qa |
| **to_role** | pm → dev-be / qc |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | `2026-06-06` |
| **prior evidence** | [`p1-phase1-qa-crud-matrix-gaps-20260605.md`](p1-phase1-qa-crud-matrix-gaps-20260605.md) |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |
| **policy** | U32 local-first · U34 consumer sync · Group CEO `ceo@xe.vn` only |

## Environment

| Target | Account | Notes |
|--------|---------|-------|
| **Local U32** `http://127.0.0.1:5173` | `ceo@xe.vn` / `Xevn@2026` | Portal proxy → hrm `:28001`, xbos `:28002` |
| Scope | HRM embed + Command Center | Member CEO / mobile **out of scope** this retest |

```bash
pnpm run qc:dev-stack          # exit 0
pnpm run qc:fe-be-health       # exit 0 — ALL PASS
$env:PORTAL_DEV_URL='http://127.0.0.1:5173'
node scripts/tmp-p1-phase1-qa-crud-matrix-gaps-probe.mjs      # PROBE_OK (Group CEO slice)
node scripts/tmp-p1-phase1-qa-crud-matrix-retest-probe.mjs    # extensions — see §3
```

---

## L0 — Stack health

| Gate | Result |
|------|--------|
| `qc:dev-stack` | **PASS** — hrm-api 200, xbos-api 200, web-portal 200 |
| `qc:fe-be-health` | **PASS** — login, direct HRM, portal proxy employees + catalog-sync |

---

## §1 — Group CEO gap batch re-probe (nip.io gaps → local U32)

Re-ran open **Group CEO** cells from 2026-06-05 gap batch (member CEO excluded per dispatch scope).

| AC-ID | Op | Endpoint | HTTP | Code | Verdict | Δ vs nip.io |
|-------|-----|----------|------|------|---------|-------------|
| **AC-CRUD-CC-CAT-G-C-01** | Create | `POST …/settings-catalogs/job_titles/extension-items` | **201** | `HRM-SET-209` | **PASS** | Same |
| **AC-CRUD-CC-ORG-G-D-01** | Delete | `DELETE …/org-foundation/legal-entities/{id}` | **404** | `XBOS-CFG-001` | **N/A** | Same |
| **AC-CRUD-HRM-INS-G-C-01** | Create | `POST …/insurance-policy-participants` | **201** | `HRM-INS-P-201` | **PASS** | Same — **C-CRUDMAT-04 local reproducibility CLOSED** |
| **AC-CRUD-HRM-INS-G-U-01** | Update | `PATCH …/insurance-policy-participants/:id?company_id=main` | **200** | `HRM-INS-P-200` | **PASS** | Same |
| **AC-CRUD-HRM-REC-G-U-01** | Update | `PATCH …/recruitment/requisitions/:id` | **404** | — | **GWC** | Same — headcount-proposals PATCH still works |
| **AC-CRUD-HRM-ATT-G-C-01** | Create | `POST …/attendance/records` | **201** | `HRM-ATT-201` | **PASS** | Same |
| **AC-CRUD-HRM-ATT-G-U-01** | Update | `PATCH …/attendance/records/:recordId/status` | **200** | `HRM-ATT-202` | **PASS** | Same |

**Group CEO gap batch:** **5 PASS · 1 N/A · 1 GWC · 0 FAIL**

---

## §2 — Previously UNTESTED — workflow Create (§8)

| AC-ID | Op | Endpoint | HTTP | Code | Verdict | Matrix promotion |
|-------|-----|----------|------|------|---------|------------------|
| **AC-CRUD-CC-WF-G-C-01** | Create | `POST /api/xbos/workflow-engine/instances` | **201** | `XBOS-WF-201` | **PASS** | §8 Group CEO **Create** → promote **PASS** local U32 |

Instance: `d4c6ffc6-01a0-4b45-97d3-77b8b0ef017d` · businessId `qa-crud-retest-{stamp}`

---

## §3 — U34 consumer sync (create → list without F5)

API-level consumer sync: POST create → immediate GET list must include new entity (U34 §1b).

| Check-ID | Entity | Create | List consumer | Verdict | Owner if FAIL |
|----------|--------|--------|---------------|---------|---------------|
| **U34-CC-CAT-G-C-01** | Catalog extension | **201** `HRM-SET-209` | Governance task queued / extension accepted | **PASS** | dev-fe |
| **U34-HRM-INS-G-C-01** | Insurance participant | **201** `HRM-INS-P-201` | List **3→4** incl. new id | **PASS** | dev-fe |
| **U34-HRM-ATT-G-C-01** | Attendance record | **201** `HRM-ATT-201` | Row visible in list (page cap 50) | **PASS** | dev-fe |
| **U34-CC-WF-G-C-01** | Workflow instance | **201** `XBOS-WF-201` | Pending tasks **+1** for assignee | **PASS** | dev-fe |

**U34 spot:** **4/4 PASS** at API list layer on localhost.

---

## §4 — L2.5 J-* spot (Group CEO HRM + CC)

| Journey | Click / API path | HTTP | Code | Verdict | Notes |
|---------|------------------|------|------|---------|-------|
| **J-XBOS-01** | `GET …/tasks?assignee=ceo@xe.vn` → `GET …/instances/{id}/detail` | **200** / **200** | `XBOS-WF-203` / `XBOS-WF-204` | **PASS** | pending=2 after WF create probe |
| **J-HRM-02** | employees list → `GET …/employees/:id?company_id=main` | **200** | `HRM-EMP-200` | **PASS** | scope parity OK |
| **J-HRM-04** | insurance row → `GET …/employees/:id?company_id=main` (employee link) | **200** | `HRM-EMP-200` | **PASS** | Matrix AC uses employee link, not GET insurance/:id |
| **J-HRM-05** | requisitions list → `GET …/requisitions/:id?company_id=main` | **404** | `HRM-DATA-404` | **FAIL** | **scope_parity** — route missing · tag **D-CRUDMAT-REC-RD-01** |
| **J-HRM-06** | attendance list → `GET …/attendance/records/:recordId` | **404** | `HRM-DATA-404` | **GWC** | UI uses list row; no GET-by-id route · **D-CRUDMAT-ATT-RD-01** |

---

## §5 — Summary

| Metric | Count |
|--------|-------|
| Group CEO CRUD gap re-probe | **5 PASS · 1 N/A · 1 GWC · 0 FAIL** |
| New UNTESTED closed | **AC-CRUD-CC-WF-G-C-01 PASS** |
| U34 consumer sync | **4/4 PASS** |
| L2.5 spot | **3 PASS · 1 FAIL · 1 GWC** |
| **Blocking FAIL (CRUD C/U/D ops)** | **0** |
| **L2.5 scope_parity FAIL** | **1** (J-HRM-05) |

**Matrix cells promotable (local U32):** §8 WF Group CEO **Create** → **PASS** · §7/11/13 Group CEO C/U remain **PASS** · §12 REC Update stays **GWC**.

---

## §6 — Defect register (PM → dev lanes)

| Defect ID | AC / J-* | Symptom | Owner | Priority | Dispatch hint |
|-----------|----------|---------|-------|----------|---------------|
| **D-CRUDMAT-REC-RD-01** | **J-HRM-05** · `AC-CRUD-HRM-REC-G-RD-01` | List returns requisition id; `GET /api/hrm/recruitment/requisitions/:id` → **404** `HRM-DATA-404` | **dev-be** | **P1** | Add GET-by-id with `resolveHrmListScope` parity + spec test |
| **D-CRUDMAT-REC-U-01** | **AC-CRUD-HRM-REC-G-U-01** | `PATCH …/requisitions/:id` → **404**; headcount-proposals status PATCH works | **dev-be** | **P2** | Add requisition status PATCH or BA matrix → headcount-only (**C-CRUDMAT-01** carry) |
| **D-CRUDMAT-ATT-RD-01** | **J-HRM-06** · `AC-CRUD-HRM-ATT-G-RD-01` | `GET …/attendance/records/:recordId` → **404** | **dev-be** | **P2** | Add GET record by id for deep-link / scope parity |
| **D-CRUDMAT-INS-RD-01** | Optional deep link | `GET …/insurance-policy-participants/:id` → **404** | **dev-be** | **P3** | Low — **J-HRM-04 employee link PASS**; add only if deep link required |

No **dev-fe** / **devops** defects blocking this wave — U34 list sync PASS at API layer.

---

## Residual (non-blocking)

| Item | Owner | Notes |
|------|-------|-------|
| **C-CRUDMAT-01** | dev-be | Requisition PATCH GWC — unchanged |
| **C-CRUDMAT-02** | devops + qa | Member CEO workflow empty inbox — out of scope |
| **C-CRUDQC-02** | qa | Strict browser WF drawer BR-INBOX-01 — optional |
| Browser U34 on HRM embed tabs | dev-fe + qa | API U34 PASS; full browser no-F5 on P-CC-05/06/07 not re-run this batch |

---

## completion_report

- Re-ran **Group CEO** open CRUD gap cells on **localhost U32** (`ceo@xe.vn`) — **0 FAIL** on Create/Update/Delete probes; local reproducibility confirms nip.io 2026-06-05 results (**C-CRUDMAT-04 CLOSED**).
- Closed matrix **UNTESTED**: **AC-CRUD-CC-WF-G-C-01** workflow instance create **PASS** + U34 pending task sync.
- U34 consumer sync **4/4 PASS** (catalog extension, insurance, attendance, workflow) at API list layer.
- L2.5 spot: **J-XBOS-01**, **J-HRM-02**, **J-HRM-04** PASS; **J-HRM-05 FAIL** (missing GET requisition by id — **D-CRUDMAT-REC-RD-01**); **J-HRM-06 GWC** (missing GET attendance by id).
- **NOT** Phase 1 DONE / **NOT** PROD.

## next_owner

**pm** — dispatch **dev-be** `D-CRUDMAT-REC-RD-01` (P1); then **qc** optional re-gate local CRUD matrix slice.

## next_dispatch_prompt

```
You are Dev-BE — xevn-ecosystem Sprint S5.
work_item_id: P1-PHASE1-BE-CRUD-RD-PARITY-01
entry_criteria: QA FAIL D-CRUDMAT-REC-RD-01 docs/qa/evidence/p1-phase1-qa-crud-matrix-retest-20260606.md — GET /api/hrm/recruitment/requisitions/:id returns 404 while list HRM-REC-200 includes id (localhost ceo@xe.vn company_id=main).
exit_criteria: GET-by-id 200 with same scope resolver as listJobRequisitions; regression spec in recruitment.controller.spec.ts; optional PATCH requisitions/:id for D-CRUDMAT-REC-U-01; ack_status READY_FOR_QA.
evidence_path: docs/qa/evidence/p1-phase1-be-crud-rd-parity-20260606.md
Also consider D-CRUDMAT-ATT-RD-01 GET attendance/records/:recordId (P2).
```

## evidence_path

- [`p1-phase1-qa-crud-matrix-retest-20260606.md`](p1-phase1-qa-crud-matrix-retest-20260606.md)
- [`p1-phase1-qa-crud-matrix-retest-20260606-probe.json`](p1-phase1-qa-crud-matrix-retest-20260606-probe.json)
- Overwritten local run: [`p1-phase1-qa-crud-matrix-gaps-20260605-probe.json`](p1-phase1-qa-crud-matrix-gaps-20260605-probe.json) (portal=`127.0.0.1:5173`)

## ack_status

**PASS_TO_PM**
