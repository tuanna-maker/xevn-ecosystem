# Evidence — PO-HRM-E2E-LINK-EMP-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-BE-02` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution · FIX · preserve_default · code_memory APPEND |
| **parent** | `PO-HRM-E2E-LINK-EMP-QA-01` FAIL_TO_PM · residual **R-EMP-SI-DUAL-SOT** |
| **date** | 2026-08-06 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |

---

## Honesty locks (unchanged)

| Flag | Value |
|------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| U65 zero-seed | **true** (no seed; bridge copies natural record identity only) |
| Module UAT / PROD claim | **none** |
| Invent amounts | **denied** — bridge/create denorm contribution = **0** |
| Dual enrollment SoT | **closed** — ONE = `employee_insurances` |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| QA residual | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md` · R-EMP-SI-DUAL-SOT |
| BA spine | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md` §D.5 |
| SA | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md` F-CORE-SI-02/03 |
| DB | `docs/program/specs/PO-HRM-E2E-LINK-EMP-DB-01.md` enrollment SoT = `employee_insurances` ONE · records ≠ enrollment |
| BE-01 must_keep | WH/HTP/SI actions append · scope_parity · no second SoT invented |

---

## Root cause

| Surface | AS-IS (broken) | TO-BE (FIX) |
|---------|----------------|-------------|
| `GET /contracts-insurance/insurance` | `employee_insurance_records` | `employee_insurances` (+ idempotent bridge from legacy records) |
| `GET /employee-insurances` | empty while records had natural rows | same enrollment table after bridge |
| `POST /employee-insurances/:id/actions` | unreachable — id from list ≠ enrollment | list `id` / `enrollment_id` = enrollment PK |

---

## Implemented (FIX)

| Change | Path |
|--------|------|
| Shared bridge helper | `apps/api/hrm-api/src/employee-insurances/insurance-enrollment-bridge.ts` |
| List/get bridge before read | `employee-insurances.service.ts` |
| List/create/get/update/expiring → enrollment SoT | `contracts-insurance.service.ts` |
| DTO `enrollment_id` (= id) | `InsuranceListItemDto` |
| CODE-MEMORY APPEND | both services + bridge |
| Jest | `po-hrm-e2e-link-emp-be-02.spec.ts` + contracts list/expiring mocks |

### Bridge rules (U65 / no invent)

1. Copy `id` UUID from natural `employee_insurance_records` → `employee_insurances` (actions reuse list id).
2. `contribution` / `employer_contribution` = **0** (unknown — not invented commercial figures).
3. Skip when id already enrolled or open identity twin (employee+company+provider+policy) exists.
4. Not a seed script — only promotes rows already present in legacy list table.

### must_keep (BE-01)

- WH `decision_id` / HTP-05 hire-readiness — **untouched**
- SI action enum + append `hrm_insurance_rate_period` — **kept**
- Scope parity `company_id=main` rollup on list/get — **kept**

---

## Verification

```text
pnpm exec jest --testPathPatterns="po-hrm-e2e-link-emp-be-02|po-hrm-e2e-link-emp-be-01|employee-insurances.service.spec|contracts-insurance.service.spec" --no-coverage
→ Test Suites: 4 passed · Tests: 47 passed
```

---

## Contract notes for FE / QA

| Surface | Behavior after FIX |
|---------|-------------------|
| Insurance module list | `GET …/contracts-insurance/insurance` → enrollment rows; `enrollment_id` === `id` |
| Profile SI timeline | `GET …/employee-insurances` → same SoT (after bridge on first list) |
| Actions | `POST …/employee-insurances/:id/actions` with list row `id` |
| Create BH (CI) | `POST …/contracts-insurance/insurance` writes **enrollment** (not legacy SoT) |

---

## Residual

| Residual | Owner |
|----------|-------|
| Browser D5 retest (actions on natural row) + D1 FE | **qa** `PO-HRM-E2E-LINK-EMP-QA-01` (+ FE-02 if D1 still open) |
| Claim UAT flags | **forbidden** until QA PASS |
| Legacy `employee_insurance_records` table | retained as bridge source only — **not** enrollment SoT |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed R-EMP-SI-DUAL-SOT: bridge legacy records→`employee_insurances` (same UUID, amounts 0); listInsurance/create/get/update/expiring on enrollment SoT; employee-insurances list/get/actions see same ids; jest 47 PASS; CODE-MEMORY APPEND; honesty false; no seed; WH/HTP must_keep. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-be-02.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-EMP-BE-02 READY_FOR_QA
u65: zero-seed · browser-only · hrm_personnel_uat_ready=false

entry_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-be-02.md
  - restart hrm-api if needed so bridge + enrollment list path is live
  - FE-02 D1 if READY else retest D5 first

task:
  - Retest D5: GET contracts-insurance/insurance has rows → same ids on GET employee-insurances → POST …/employee-insurances/:id/actions (close|suspend|…) → periods append + F5
  - Keep J-HRM-01..04; D2/D6 regression
  - Retest D1 if FE-02 landed
cấm: seed · claim UAT on FAIL · API-only PASS
exit: docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md (or -02 retest) · PASS_TO_PM / FAIL_TO_PM
```
