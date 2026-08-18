# Evidence — PO-HRM-E2E-LINK-EMP-FE-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-FE-03` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution · FIX · preserve_default · code_memory APPEND |
| **parent** | `PO-HRM-E2E-LINK-EMP-QA-01` R2 FAIL_TO_PM · residual **R-EMP-SI-FE-ACTION-UI** |
| **date** | 2026-08-06 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **u65** | zero-seed |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| QA R2 D5 | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r2.md` §D5 — `timelineRoot=false` · no action buttons |
| SPEC | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md` §D.5 |
| SA | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md` F-CORE-SI-02/03 |
| BE-02 | `docs/qa/evidence/po-hrm-e2e-link-emp-be-02.md` — enrollment id ∩ contracts-insurance CLOSED |
| FE-01 panel | `InsuranceTimelineActionsPanel` already wired — mount path was missing |

---

## Root cause (R2)

| Observation | Meaning |
|-------------|---------|
| API SoT | `employee-insurances` count=2 · id overlap with CI · enrollment usable |
| Browser network on emp `22222222-…` | GET employee + work-timeline only — **no** `GET …/employee-insurances` |
| UI | Insurance tab lives under **HR group popover** (`profile-group-tab-insurance`); harness text click `/Bảo hiểm/` does not open nested panel → `EmployeeInsurance` never mounts → `hdsd-insurance-timeline-root` absent |

**Not** dual-SoT (BE-02 CLOSED). FE action path unreachable because tab not opened.

---

## Implemented (FIX)

| Change | Path |
|--------|------|
| Deep-link `?tab=insurance` + URL sync on tab select | `EmployeeProfile.tsx` · `parseProfileTabParam` |
| Always-visible CTA «Bảo hiểm & Phúc lợi» → opens/pins insurance tab | `hdsd-profile-open-insurance-tab` |
| Enrollments root + row `data-enrollment-id` | `EmployeeInsurance.tsx` · `hdsd-insurance-enrollments-root` |
| Map `enrollment_id ?? id` for POST actions; enrich periods via get-by-id | `useEmployeeInsurance.ts` · `getEmployeeInsurance` |
| Periods map `employee_amount`/`employer_amount` display-ready | `insuranceTimelineActions.ts` |
| HDSD ids | `insuranceEnrollmentsRoot` · `profileOpenInsuranceTab` |
| @CODE-MEMORY APPEND | Profile · EmployeeInsurance · panel · hook · tab groups · hdsd ids |

### must_keep

- D2 WH CatalogSearchPicker · D6 HTP-05 · FE-02 QSĐ form HDSD — **untouched**
- No `apps/api/**` · no seed · no invent amounts · no UAT claim
- Do **not** hide `InsuranceTimelineActionsPanel` when enrollments exist

---

## HDSD / harness hooks (D5)

| Testid | Purpose |
|--------|---------|
| `hdsd-profile-open-insurance-tab` | General CTA — text matches «Bảo hiểm & Phúc lợi» |
| `?tab=insurance` | Direct deep-link (pins tab) |
| `profile-group-tab-insurance` | Nested HR group pick (existing) |
| `hdsd-insurance-enrollments-root` | Tab mounted + list surface |
| `hdsd-insurance-timeline-root` | Action panel root (per enrollment) |
| `hdsd-insurance-action-{close\|stop\|suspend\|change_rate\|resume}-{enrollmentId}` | Action buttons |
| `hdsd-insurance-action-submit` | Dialog Lưu |
| `hdsd-insurance-periods-list` | Periods after POST/F5 |

Suggested QA open path:

```text
/hr/employees/{insuranceEmpId}?companyId=main&tab=insurance
→ assert hdsd-insurance-enrollments-root + hdsd-insurance-timeline-root
→ click hdsd-insurance-action-change_rate-{id} → submit → F5 periods
```

Or: open profile → click `hdsd-profile-open-insurance-tab` (label Bảo hiểm & Phúc lợi).

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
→ Test Files 7 passed · Tests 30 passed
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
| **completion_report** | Closed R-EMP-SI-FE-ACTION-UI FE path: nested Insurance tab reachable via `?tab=insurance` + CTA; enrollments SoT map enrollment_id; timeline panel + action testids when rows exist; periods enrich get-by-id; vitest 30 PASS; honesty false; D2/D6/FE-02 must_keep. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-fe-03.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-EMP-FE-03 READY_FOR_QA
round: R3
u65: zero-seed · browser-only · hrm_personnel_uat_ready=false

entry_criteria:
  - FE-03 evidence docs/qa/evidence/po-hrm-e2e-link-emp-fe-03.md
  - BE-02 dual-SoT CLOSED (enrollment ids usable)
  - Prefer open /hr/employees/{insuranceEmpId}?tab=insurance OR click hdsd-profile-open-insurance-tab

task:
  - Retest D5: timelineRoot=true · click action → POST …/employee-insurances/:id/actions 2xx → periods + F5
  - Keep D2 WH · D6 HTP · J-HRM-01..04 regression
  - D1 WH neo still owned by BE-03 if open — do not claim module UAT

exit: docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r3.md · PASS_TO_PM / FAIL_TO_PM
cấm: seed · claim hrm_personnel_uat_ready · API-only PASS for D5
```
