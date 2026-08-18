# Evidence — PO-HRM-E2E-LINK-EMP-FE-04

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-FE-04` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution · FIX · preserve_default · code_memory APPEND |
| **parent** | `PO-HRM-E2E-LINK-EMP-QA-01` R3 FAIL_TO_PM · residual **R-EMP-SI-ACTION-COMPANY-ID-BODY** |
| **date** | 2026-08-06 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **u65** | zero-seed |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| QA R3 D5 | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r3.md` §D5 — POST 400 `HRM-VAL-001` body missing `company_id` |
| FE-03 | `docs/qa/evidence/po-hrm-e2e-link-emp-fe-03.md` — tab=insurance mount CLOSED (UI); HDSD testids must_keep |
| BE DTO (read-only) | `apps/api/hrm-api/src/employee-insurances/dto/insurance-action.dto.ts` — `company_id` string required; `employee_amount` / `employer_amount`; `change_reason` |
| SPEC | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md` §D.5 · SA F-CORE-SI-03 |

---

## Root cause (R3)

| Observation | Meaning |
|-------------|---------|
| Network | `POST …/employee-insurances/:id/actions?company_id=main` → **400** `HRM-VAL-001` |
| Message | `company_id must be a string` (ValidationPipe on undefined body field) |
| FE | `postEmployeeInsuranceAction` put `company_id` in **query only**; JSON body lacked `company_id` |
| DTO | `InsuranceActionDto.company_id` is required in **body** |

---

## Implemented (FIX)

| Change | Path |
|--------|------|
| `buildInsuranceActionBody` requires `company_id`; emits DTO wire names | `src/lib/insuranceTimelineActions.ts` |
| change_rate → `employee_amount` / `employer_amount` (form aliases remapped) | same |
| notes → `change_reason` | same |
| Panel passes `company_id: currentCompanyId` | `InsuranceTimelineActionsPanel.tsx` |
| `HrmInsuranceTimelineActionPayload` + POST merge body `company_id` (query kept) | `integrations/hrmApi.ts` |
| Vitest: company_id required + DTO field asserts | `insuranceTimelineActions.test.ts` |
| @CODE-MEMORY APPEND | helpers · panel · hrmApi payload |

### must_keep (verified untouched)

- D1 WH neo · D2 CatalogSearchPicker · D6 HTP-05
- FE-03 `?tab=insurance` + `hdsd-insurance-enrollments-root` / `hdsd-insurance-timeline-root` / action+submit testids
- No `apps/api/**` · no seed · no invent amounts · no personnel UAT claim

### solid_convention_ack

| Item | Status |
|------|--------|
| FE–BE boundary | FE pass-through body only; no rate formulas on FE |
| Display-ready periods | `mapInsurancePeriods` unchanged (read `employee_amount`/`employer_amount`) |
| List fields | **not** touched this wave |

---

## HDSD / harness hooks (unchanged from FE-03)

| Testid | Purpose |
|--------|---------|
| `hdsd-profile-open-insurance-tab` | CTA open insurance tab |
| `?tab=insurance` | Deep-link |
| `hdsd-insurance-enrollments-root` | Tab mounted |
| `hdsd-insurance-timeline-root` | Action panel |
| `hdsd-insurance-action-{action}-{enrollmentId}` | Action buttons |
| `hdsd-insurance-action-submit` | Dialog Lưu |
| `hdsd-insurance-periods-list` | Periods after POST/F5 |

Suggested QA R4 path:

```text
/hr/employees/{insuranceEmpId}?companyId=main&tab=insurance
→ assert enrollmentsRoot + timelineRoot
→ click hdsd-insurance-action-suspend-{id} → Lưu
→ Network: POST …/actions?company_id=main  body includes "company_id":"main" → 2xx
→ F5 periods / status reflect action
→ smoke D1/D2/D6 (no regression)
```

---

## Verify

```text
pnpm exec vitest run \
  src/hooks/useEmployeeInsurance.test.ts \
  src/lib/insuranceTimelineActions.test.ts \
  src/lib/employeeProfileTabGroups.test.ts \
  src/lib/hdsdMutateTestIds.test.ts \
  src/lib/decisionPersonBound.test.ts \
  src/lib/hireReadinessUi.test.ts \
  src/lib/employeeWorkTimelineUi.test.ts
→ Test Files 7 passed · Tests 31 passed
```

cwd: `apps/web/hrm`

---

## Honesty locks

| Flag | Value |
|------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module UAT / PROD claim | **none** |
| seed | **none** |

---

## Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed R-EMP-SI-ACTION-COMPANY-ID-BODY: SI action POST JSON now includes `company_id` + DTO amount fields (`employee_amount`/`employer_amount`); query kept; FE-03 HDSD mount/testids preserved; vitest 31 PASS; honesty false; no apps/api; D1/D2/D6 must_keep. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-fe-04.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-01
round: R4
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-EMP-FE-04 READY_FOR_QA
u65: zero-seed
focus: D5 SI timeline action mutate + smoke D1/D2/D6
honesty: hrm_personnel_uat_ready=false

entry_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-fe-04.md
  - FE-03 mount path still: ?tab=insurance → enrollmentsRoot + timelineRoot

task:
  - Browser U65: /hr/employees/{id}?tab=insurance → suspend (or change_rate) → Lưu
  - Assert POST …/employee-insurances/:id/actions body JSON includes company_id string (e.g. main) — not query-only
  - Expect 2xx (not 400 HRM-VAL-001); FE after 2xx + F5 periods/status
  - Smoke regression: D1 WH neo · D2 WH picker · D6 HTP-05
  - cấm seed; cấm claim personnel UAT on narrow PASS

exit: PASS_TO_PM or FAIL_TO_PM with residual id
evidence: docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r4.md
```
