# QA — P1-PHASE1-QA-RACI-REGRESS-01 (P0-CRUD-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-RACI-REGRESS-01` |
| **gap_id** | **P0-CRUD-05** |
| **ac_id** | `AC-CRUD-CC-RACI-G-U-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | `2026-06-04` (UTC) |
| **persona** | Group CEO `ceo@xe.vn` / `Xevn@2026` |
| **environment** | HTTPS pilot `PORTAL_DEV_URL=https://14-225-217-232.nip.io` |

## Executive verdict

| Check | Verdict |
|-------|---------|
| Member-unit RACI matrix **GET** (legal-entity UUID, group JWT) | **PASS** — HTTP **200** `XBOS-RACI-200` (not **409**) |
| Member-unit RACI matrix cell **PUT** (save) | **PASS** — HTTP **200** `XBOS-RACI-201`, reload **persisted** |
| Regression guard **W5B** RACI slice | **PASS** — **9/9** |

**P0-CRUD-05** promoted from **UNTESTED** → **PASS** on nip.io. Historical **409** `SCOPE_CONTEXT_MISMATCH` on member UUID matrix **not reproduced**.

---

## Commands executed

```text
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-qa-raci-regress-probe.mjs
  → exit 0, verdict PASS (JSON below)

PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-close-qa-w5b-raci-probes.mjs
  → exit 0, 9/9 PASS (W5B-RACI-02-CELL-PUT XBOS-RACI-201)

PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-fix-raci-scope-01-probe.mjs
  → exit 1 — FAIL: no member legal entity UUID in list (legal-entities filter tenant_id≠xevn empty on pilot)
  → superseded by regress probe (group-member-units → UUID path)
```

---

## P0-CRUD-05 — member unit scope (authoritative)

| Step | API | HTTP | Code | Verdict |
|------|-----|------|------|---------|
| Login | `POST /api/xbos/auth/login` | 200 | — | **PASS** |
| Resolve member | `GET /api/xbos/tenant-scope/group-member-units` | 200 | `XBOS-TENANT-200` | **PASS** — picked first UUID member |
| Read matrix | `GET /api/xbos/raci-governance/companies/{memberUuid}/matrix` | **200** | `XBOS-RACI-200` | **PASS** — **235** rows |
| Save cell | `PUT /api/xbos/raci-governance/companies/{memberUuid}/matrix/cell` | **200** | `XBOS-RACI-201` | **PASS** |
| Persist check | `GET …/matrix` reload same `activity_id` + `org_column_id` | — | — | **PASS** — `persisted: true` |

**Member unit under test:**

| Field | Value |
|-------|--------|
| **memberUuid** | `f01bb8dc-99fd-46bf-9653-21ae9f696e5a` |
| **code** | `XE_TMDV` |
| **name** | Công ty Cổ phần Thương mại và Dịch vụ X.E |
| **JWT scope** | `tenantId=xevn`, `companyId=main` (group CEO) |

**Cell PUT payload (sanitized):**

- `activity_id`: `d76b2d55-9fea-4e77-ac87-92bd43abb9d7` (non `seed-*` catalog id)
- `org_column_id`: `ceo`
- `raci_letters`: `R`

**409 check:** Neither GET nor PUT returned **409** / `SCOPE_CONTEXT_MISMATCH`.

---

## W5B regression slice (cross-check)

| Probe ID | Verdict | Notes |
|----------|---------|-------|
| W5B-RACI-01-CATALOG | **PASS** | `XBOS-RACI-200` |
| W5B-RACI-02-MATRIX | **PASS** | member or `main` matrix **200** |
| W5B-RACI-02-CELL-PUT | **PASS** | `XBOS-RACI-201` |
| W5B-RACI-03-CAPS | **PASS** | |
| W5B-RACI-06-COVERAGE | **PASS** | |

---

## L2 / L2.5 note

This wave is **API CRUD** for **UC-RACI-02** / matrix **Update** on member legal-entity UUID. Full browser **J-CC-02** RACI tab click path not re-run (prior W5B/TM evidence: member matrix **409** closed in repo + API retest here). **C-RBACQC-04** member browser L2.5 matrix remains **DEFERRED** per CRUD matrix §PM dispatch — not required to close P0-CRUD-05 API cell.

---

## Residual (not blocking P0-CRUD-05)

| Priority | Item | Owner |
|----------|------|-------|
| P2 | `tmp-p1-fix-raci-scope-01-probe.mjs` legal-entities picker empty on pilot | qa / dev-be — align probe with `group-member-units` |
| P3 | **P0-CRUD-06** workflow approve | dev-fe + seed |
| P4 | Browser RACI tab L2.5 (**C-RBACQC-04**) | qa (deferred) |

---

## completion_report

- Closed **P1-PHASE1-QA-RACI-REGRESS-01** / **P0-CRUD-05**: group CEO saves RACI matrix cell on **member legal-entity UUID** on nip.io — **200/201**, no **409**.
- **AC-CRUD-CC-RACI-G-U-01** **PASS**; W5B RACI **9/9** regression **PASS**.
- **Not promoted:** P0-CRUD-06; full member-browser RACI L2.5.

## next_owner

**pm**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-BA-CRUD-MATRIX-SYNC-03 (or PM matrix hygiene)
from_role: pm
to_role: ba-process
entry_criteria: QA evidence P0-CRUD-05 PASS at docs/qa/evidence/p1-phase1-qa-raci-regress-20260604.md
exit_criteria: PHASE1_CRUD_ACCEPTANCE_MATRIX.md P0-CRUD-05 row → PASS; bus INTAKE logged
evidence_path: docs/qa/evidence/p1-phase1-qa-raci-regress-20260604.md
ack_status target: PASS_TO_PM

Promote P0-CRUD-05 (CC RACI member unit Update) from UNTESTED to PASS on nip.io per QA RACI regress 2026-06-04. No dev-be dispatch unless user reports new 409. Optional: dispatch qa for C-RBACQC-04 browser RACI tab when PM prioritizes L2.5.
```

## evidence_path

`docs/qa/evidence/p1-phase1-qa-raci-regress-20260604.md`

## ack_status

**PASS_TO_PM**
