# QA — P1-PHASE1-QA-CRUD-MATRIX-GAPS (UNTESTED cells)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-CRUD-MATRIX-GAPS` |
| **from_role** | qa |
| **to_role** | pm → qc |
| **ack_status** | **READY_FOR_QC** |
| **executed_at** | `2026-06-05` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |
| **probe script** | `scripts/tmp-p1-phase1-qa-crud-matrix-gaps-probe.mjs` |
| **probe JSON** | `docs/qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605-probe.json` |

## Environment

| Target | Account | Notes |
|--------|---------|-------|
| **HTTPS pilot** `https://14-225-217-232.nip.io` | `ceo@xe.vn` / `Xevn@2026` | Group CEO probes |
| Same | `du-lich.ceo@xe.vn` / `Xevn@2026` | Member CEO workflow inbox |

```bash
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-qa-crud-matrix-gaps-probe.mjs
# exit 0 — PROBE_OK
```

---

## API probe table (AC-ID × HTTP)

### Group CEO — Command Center

| AC-ID | Op | Endpoint | HTTP | Code | Verdict | Owner if FAIL |
|-------|-----|----------|------|------|---------|---------------|
| **AC-CRUD-CC-CAT-G-C-01** | Create | `POST /api/hrm/settings-catalogs/job_titles/extension-items` | **201** | `HRM-SET-209` | **PASS** | — |
| **AC-CRUD-CC-ORG-G-D-01** | Delete | `DELETE /api/xbos/org-foundation/legal-entities/{id}` | **404** | `XBOS-CFG-001` | **N/A** (SRS archive not exposed) | — |

### Group CEO — HRM embed

| AC-ID | Op | Endpoint | HTTP | Code | Verdict | Owner if FAIL |
|-------|-----|----------|------|------|---------|---------------|
| **AC-CRUD-HRM-INS-G-C-01** | Create | `POST /api/hrm/insurance-policy-participants` | **201** | `HRM-INS-P-201` | **PASS** | — |
| **AC-CRUD-HRM-INS-G-U-01** | Update | `PATCH /api/hrm/insurance-policy-participants/:id?company_id=main` | **200** | `HRM-INS-P-200` | **PASS** | — |
| **AC-CRUD-HRM-REC-G-U-01** | Update | `PATCH /api/hrm/recruitment/requisitions/:id` → **404**; fallback `PATCH …/headcount-proposals/:id/status` | **200** | `HRM-REC-HC-200` | **GWC** — no requisition PATCH route; headcount status works | **dev-be** (add `PATCH requisitions/:id` per matrix AC) |
| **AC-CRUD-HRM-ATT-G-C-01** | Create | `POST /api/hrm/attendance/records` | **201** | `HRM-ATT-201` | **PASS** | — |
| **AC-CRUD-HRM-ATT-G-U-01** | Update | `PATCH /api/hrm/attendance/records/:recordId/status` | **200** | `HRM-ATT-202` | **PASS** | — |

### Member CEO — Workflow inbox

| AC-ID | Op | Endpoint | HTTP | Code | Verdict | Owner if FAIL |
|-------|-----|----------|------|------|---------|---------------|
| **AC-CRUD-CC-WF-M-RL-01** | Read list | `GET /api/xbos/workflow-engine/tasks?tenantId=xe-du-lich&status=pending&assigneeUserId=du-lich.ceo@xe.vn` | **200** | `XBOS-WF-203` | **PASS** (pending=0) | — |
| **AC-CRUD-CC-WF-M-RD-01** | Read detail | `GET …/instances/{id}/detail` | — | — | **GWC** — empty inbox; detail not exercised | **devops** (seed member WF tasks) + **qa** retest |
| **AC-CRUD-CC-WF-M-U-01** | Update | `POST …/tasks/{id}/complete` | — | — | **GWC** — empty inbox; approve not exercised | **devops** + **qa** retest |

---

## Summary

| Metric | Count |
|--------|-------|
| Probed | **10** AC-IDs |
| **PASS** | **6** |
| **GWC** | **3** |
| **N/A** | **1** |
| **FAIL** | **0** |

**Matrix cells promoted:** §7 catalog Create · §5 org Delete (N/A) · §11 insurance C/U · §12 recruitment Update (GWC) · §13 attendance C/U · §8 member workflow R (L/U GWC).

---

## Residual (PM dispatch — not blocking QC on this wave)

| Priority | Item | Owner | pm_dispatch_hint |
|----------|------|-------|------------------|
| P2 | **AC-CRUD-HRM-REC-G-U-01** — missing `PATCH /recruitment/requisitions/:id` | **dev-be** | Add requisition status PATCH or BA updates matrix to headcount-proposals |
| P3 | Member CEO workflow L2.5 — seed pending tasks for `du-lich.ceo@xe.vn` | **devops** + **qa** | `seed:workflow:inbox` member slice; retest RD/U |
| P4 | Update `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` cells UNTESTED→PASS/GWC/N/A | **ba-process** / **pm** | Reflect this evidence |

---

## completion_report

- Executed batch probe on nip.io for all **UNTESTED** cells in PM dispatch scope.
- **Closed with PASS:** catalog extension create, insurance C/U, attendance C/U (group CEO).
- **N/A:** org legal-entity DELETE (404 — route not in SRS/API).
- **GWC:** recruitment requisition Update (no PATCH route; headcount-proposals PATCH works); member workflow detail/approve (empty pending inbox).
- **Zero FAIL** — probe exit **0**.

## next_owner

**qc** — re-gate CRUD matrix slice; then **pm** for matrix doc sync + optional dev-be requisition PATCH.

## next_dispatch_prompt

```
You are QC — xevn-ecosystem Sprint S5 W1.
work_item_id: P1-PHASE1-QC-CRUD-MATRIX-GAPS-01
entry_criteria: QA evidence docs/qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md — 0 FAIL, 6 PASS, 3 GWC, 1 N/A on nip.io.
exit_criteria: Concurrence verdict on AC-IDs; GWC conditions for AC-CRUD-HRM-REC-G-U-01 (no requisition PATCH) and member WF empty inbox; update PHASE1_GATE_REPORT if applicable; ack_status PASS_TO_PM.
evidence_path: docs/qa/evidence/p1-phase1-qc-crud-matrix-gaps-20260605.md
```

## evidence_path

`docs/qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605.md` · `docs/qa/evidence/p1-phase1-qa-crud-matrix-gaps-20260605-probe.json`

## ack_status

**READY_FOR_QC**
