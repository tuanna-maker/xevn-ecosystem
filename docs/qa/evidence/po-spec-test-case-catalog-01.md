# Evidence — PO-SPEC-TEST-CASE-CATALOG-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-SPEC-TEST-CASE-CATALOG-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` Wave **T1** (+ report stub T3 seed) |
| **ack_status** | **PASS_TO_PM** |
| **locks** | U65 · no seed · no invent ladder `T_L1`/`N` · no UAT DONE claim |

---

## 1. Deliverables created

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Master Test Case Catalog | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` | **53 TC** ≥40 |
| 2 | Test Report stub/header | `docs/qa/reports/PO_SPEC_TEST_REPORT.md` | v0 rollup TC ↔ evidence |
| 3 | This evidence | `docs/qa/evidence/po-spec-test-case-catalog-01.md` | handoff |

**Not in this wave:** `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` (T2) — see `next_dispatch_prompt`.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `docs/brand-new-documents-20270801/SRS_VN.md` | §3 WF 2-level / anti self-approve · §4 HRM employee/leave/recruitment · §5 Mobile leave+approve |
| `TECH_SPEC_VN.md` | §1–2 runtime/auth · §5 attachment storage |
| `API_CONTRACT_VN.md` | §2 workflows · §3 employees / attendance / leave / payroll / recruitment candidates |
| `DB_DESIGN_VN.md` | referenced via manager_id / leave evidence |
| `SRS_NEW` / `TECH_SPEC_NEW` / `API_CONTRACT_NEW` | **Not present on disk** in this workspace listing — FR-UC-* retained from BA matrix + prior evidence cites; pack restore = residual docs |
| `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` | HP/LV/AT cases · GAP-LEAVE-LADDER-01 |
| `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` | SPINE-01/02/03 AC |

---

## 3. Catalog coverage check (exit)

| Requirement | Result |
|-------------|--------|
| ≥40 TC with TC-ID · UC/FR · TechSpec · API · Layer · Type · Steps · Expected · Automate · Status | **PASS** — 53 TC |
| SPINE-01 hire/candidates/inbox | TC-HP-01..14 + UNIT-REC |
| SPINE-02 leave attach/approve/ladder | TC-LV-01..16 + UNIT-LEAVE |
| SPINE-03 late nav/submit | TC-AT-01..08 |
| manager_id UC-H01 | TC-MGR-01..06 |
| LV-03/04 → EVIDENCED (GWC) | TC-LV-05/07 mapped to w1-r1 + QC |
| LV-02 → BLOCKED/SPEC_GAP | TC-LV-03 — **no invent T_L1** |
| Map existing evidence paths | Report §2 table |
| No seed / no UAT DONE | Honored |

---

## 4. Honest gaps called out in catalog

| Gap | Catalog handling |
|-----|------------------|
| Candidates FE POST 400 | TC-HP-06 **FAIL** |
| Leave L2 day ladder | TC-LV-03 **SPEC_GAP** |
| Mobile AT nav | TC-AT-01 **BLOCKED** |
| SRS_NEW pack file missing locally | Cited SRS_VN + BA FR codes; restore pack for denser § |

---

## completion_report

- Closed T1: master catalog **53** TC covering SPINE-01/02/03 + manager_id + unit hooks; columns per program §2.1.
- Seeded T3 report stub with TC→evidence rollup (PASS/FAIL/BLOCKED/PLANNED/SPEC_GAP).
- LV-02 ladder held SPEC_GAP; LV-03/04 GWC mapped EVIDENCED; HP-04 FAIL preserved.
- Residual: Unit Test Plan T2 not written this wave; product FAIL/BLOCKED remain for Dev/QA execution waves — catalog does not claim UAT DONE.

## next_owner

`qa` (+ `dev-be` cite) — Unit Test Plan wave; then PM for spine FAIL residual dispatch.

## next_dispatch_prompt

```text
work_item_id: PO-SPEC-UNIT-TEST-PLAN-01
from_role: pm
to_role: qa
lane: execution
priority: P0
program: docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md Wave T2
entry_criteria: catalog docs/qa/PO_SPEC_TEST_CASE_CATALOG.md exists (53 TC); API_CONTRACT_VN.md; grep jest under apps/api/hrm-api + xbos-api for spine P0
deliverable: CREATE docs/qa/PO_SPEC_UNIT_TEST_PLAN.md
scope P0 endpoints:
  - POST/approve leave-requests (+ VAL-ATT, VAL-BALANCE, VAL-OVERLAP, attachment_url)
  - POST recruitment/candidates (whitelist / CreateCandidateDto)
  - PATCH employees/:id manager_id (assertManagerAssignment)
  - leave-workflow.bridge + recruitment-workflow.bridge spawn
  - attendance update-requests create/approve
columns: Endpoint · BR/SRS bước · Unit cases (input→expect) · Existing spec file · Gap COVERED|MISSING
exit_criteria: every P0 endpoint row has COVERED or MISSING; MISSING list copy-ready for Task dev-be; update docs/qa/reports/PO_SPEC_TEST_REPORT.md §4; evidence docs/qa/evidence/po-spec-unit-test-plan-01.md; ack_status PASS_TO_PM
cấm: seed · invent ladder N/T_L1 · claim UAT DONE · write production apps/** (plan only)
read_first: PO_SPEC_TEST_SUITE_PROGRAM.md §2.2 · PO_SPEC_TEST_CASE_CATALOG.md § UNIT rows · API_CONTRACT_VN.md
```

## evidence_path

`docs/qa/evidence/po-spec-test-case-catalog-01.md`

## ack_status

**PASS_TO_PM**
