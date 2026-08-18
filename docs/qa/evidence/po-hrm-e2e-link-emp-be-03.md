# Evidence — PO-HRM-E2E-LINK-EMP-BE-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-BE-03` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution · U65 zero-seed |
| **parent** | `PO-HRM-E2E-LINK-EMP-QA-01` R2 FAIL · residual **R-EMP-DEC-WH-NEO-CATALOG** |
| **change_mode** | FIX · preserve_default · code_memory APPEND |
| **date** | 2026-08-06 |
| **ack_status** | **READY_FOR_QA** |

---

## Honesty locks (unchanged)

| Flag | Value |
|------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| U65 zero-seed | **true** (no seed) |
| Module UAT / PROD claim | **none** |
| Dual WH SoT | **forbidden — not invented** |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| QA residual | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r2.md` §D1 |
| SA F.1 | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md` F-CORE-DEC-01/02 |
| DB | `docs/program/specs/PO-HRM-E2E-LINK-EMP-DB-01.md` person-bound + effective |
| Live catalog | Settings `hr_decision_types`: **HRD_01** Bổ nhiệm · **HRD_02** Miễn nhiệm · **HRD_03** Kỷ luật |

---

## Root cause (closed)

| Symptom | Cause |
|---------|--------|
| POST `type=HRD_01` `status=effective` → 201 · `work_history_id=null` | `PERSON_BOUND_DECISION_TYPES` / WH neo only `appointment`\|`transfer` |
| POST `type=appointment` → 400 `HRM-DEC-TYPE` | Catalog SoT (correct) — free-text neo unreachable on natural FE path |

---

## FIX (ADD mapping — no seed)

| Export / behavior | Detail |
|-------------------|--------|
| `PERSON_BOUND_DECISION_TYPES` | + `hrd_01` · `hrd_02` · `hrd_03` (keep `appointment`\|`transfer`) |
| `WORK_HISTORY_NEO_DECISION_TYPES` | `appointment` · `transfer` · `hrd_01` · `hrd_02` (**not** `hrd_03` discipline) |
| `resolveWorkHistoryEventType` | HRD_01 → `appointment` · HRD_02 → `termination` · transfer → `transfer` |
| `create`/`update` effective | UPSERT WH by `decision_id` when neo type; return `work_history_id` |
| must_keep | Catalog `HRM-DEC-TYPE` assert · soft FK · BE-01/02 scope parity · FE form path untouched |

### Files

- `apps/api/hrm-api/src/decisions/decisions.service.ts` (CODE-MEMORY APPEND)
- `apps/api/hrm-api/src/decisions/po-hrm-e2e-link-emp-be-03.spec.ts` (**new**)
- `apps/api/hrm-api/src/employees/po-hrm-e2e-link-emp-be-01.spec.ts` (assert HRD_01 in set)

---

## Verification

```text
pnpm exec jest --runInBand --testPathPatterns="po-hrm-e2e-link-emp-be-03|po-hrm-e2e-link-emp-be-01|decisions.service.spec" --no-coverage
→ Test Suites: 3 passed · Tests: 22 passed
```

---

## Contract notes for FE / QA

| Surface | Expectation |
|---------|-------------|
| Natural browser | Catalog type **HRD_01** + status **effective** + `employee_id` + `position_key` → POST 201 with **`work_history_id` ≠ null** |
| WH F5 | Row `decision_id` = decision.id · `source_module=decision` · `decision_code` via join |
| FE hint | Align `decisionPersonBound` with catalog codes `HRD_01`/`HRD_02`/`HRD_03` (parallel FE if still only legacy neo) |
| HRD_03 | Person-bound `employee_id` required; **no** WH invent |

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| R-EMP-DEC-WH-NEO-CATALOG | **CLOSED** (BE) | QA R3 must prove browser D1 |
| R-EMP-SI-FE-ACTION-UI | **dev-fe** | Parallel FE-03 — not this WI |
| FE person-bound set vs HRD_* | **dev-fe** (optional same wave) | Badge/hint if FE set still legacy-only |
| Claim UAT flags | **forbidden** until QA R3 PASS |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | FIX R-EMP-DEC-WH-NEO-CATALOG: map live `HRD_01`/`HRD_02` → person-bound + F-CORE-DEC-02 WH UPSERT; HRD_03 person-bound only; legacy appointment\|transfer kept; jest 22 PASS; CODE-MEMORY APPEND; honesty false; no seed; FE form path untouched. |
| **next_owner** | **qa** (`PO-HRM-E2E-LINK-EMP-QA-01` R3) — after FE-03 if SI actions still open |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-be-03.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-01
round: R3
from_role: pm
to_role: qa
lane: execution
u65: zero-seed · hrm_personnel_uat_ready=false
parent: PO-HRM-E2E-LINK-EMP-BE-03 READY_FOR_QA (+ FE-03 if SI READY)

entry_criteria:
  - restart hrm-api so decisions.service dist includes BE-03 neo map
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-be-03.md
  - prior R2 FAIL docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r2.md

task:
  - D1: FE /hr/decisions → Thêm → type catalog HRD_01 (Bổ nhiệm) + employee + position + status effective → POST 201 work_history_id ≠ null; WH F5 decision_id/source_module=decision; badge/hint
  - Regression: D2 WH picker · D6 HTP-05 · J-HRM-01..04
  - D5: only if FE-03 READY — else keep R-EMP-SI-FE-ACTION-UI open
  - cấm: seed · claim hrm_personnel_uat_ready

exit: PASS_TO_PM or FAIL_TO_PM with residual ids
evidence: docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r3.md
```
