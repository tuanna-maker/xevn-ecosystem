# Evidence — PO-HRM-E2E-LINK-EMP-FE-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-EMP-FE-01` |
| from_role | dev-fe |
| to_role | qa |
| lane | execution |
| program | `W-ALL-PARALLEL-01` · `PO-HRM-ALL-MENU-E2E-LINK-01` |
| parent | `PO-HRM-E2E-LINK-EMP-DB-01` CONFIRMED |
| change_mode | ADD · preserve_default · code_memory_mode APPEND |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| u65 | zero-seed |
| honesty | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| SRS / SPEC | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md` §D.1/D.2/D.3/D.5/D.6/D.7 |
| SA F.1 | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md` F-CORE-DEC-01/02 · F-CORE-WH-01/02 · F-CORE-SI-02/03 · F-CORE-HTP-05 |
| DB CONFIRMED | `docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md` — enrollment=`employee_insurances`; WH=`employee_work_timeline`; SI action map; HTP=`employee_contracts.active` |
| OS 28 | Display-ready fields only — no FE-built nested write DTOs / payroll formulas |

---

## Closed scope

| AC / Cap | FE delivery |
|----------|-------------|
| AC-WH-PICK / F-CORE-WH-02 | `EmployeeWorkTimeline` CatalogSearchPicker `position_key` + `department_key` (preserve E1-A); HDSD testids; reject free-text SoT |
| AC-DEC-WH-01/02 · F-CORE-DEC-01 | `Decisions` person-bound bắt `employee_id` (`decisionPersonBound`); required marker + toast/hint when status=`effective` → WH F5 |
| AC-DEC-WH-02 surface | WH list maps `decision_id` / `decision_code` / `source_module` badge (`employeeWorkTimelineUi`) |
| AC-SI-TL · F-CORE-SI-03 | `InsuranceTimelineActionsPanel` — close\|stop\|suspend\|change_rate\|resume; POST `/employee-insurances/:id/actions`; periods display; no FE formulas |
| AC-HTP-05 · F-CORE-HTP-05 | `HireReadinessBanner` on contract tab; GET hire-readiness; **honesty unavailable** on 404 (never invent ready) |
| AC-CORE-PUB-01 §D.1 | `EmployeeFormDialog` finance tab gated `view_salary`; omit C&B fields on submit when no permission |
| API clients | `postEmployeeInsuranceAction` · `getEmployeeHireReadiness` · insurance `periods[]` type |
| Testids | `hdsd-work-timeline-*` · `hdsd-decisions-*` · `hdsd-insurance-*` · `hdsd-hire-readiness-banner` |
| @CODE-MEMORY | APPEND on touched screens/libs |

---

## Verify

```text
pnpm exec vitest run \
  src/lib/decisionPersonBound.test.ts \
  src/lib/insuranceTimelineActions.test.ts \
  src/lib/hireReadinessUi.test.ts \
  src/lib/employeeWorkTimelineUi.test.ts \
  src/lib/hdsdMutateTestIds.test.ts
→ Test Files 5 passed · Tests 16 passed
```

cwd: `apps/web/hrm`

---

## Residual (not blocking READY_FOR_QA FE)

| Residual | Owner |
|----------|-------|
| BE-01 Nest ensureSchema + POST actions + hire-readiness live | **dev-be** (peer in flight) — FE clients ready; 404 → honesty |
| Browser U65 D1–D7 click path | **qa** |
| CORE-09 contract template wizard | FE-TPL-01 later |
| AC-SI-TL-06 PAY read | PAY residual |

---

## Honesty locks

| Flag | Value |
|------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module UAT / PROD claim | **none** |
| seed | **none** |

---

## must_keep

- J-HRM-01..04 cross-nav regression
- CatalogSearchPicker SoftDel / E1-A patterns
- U65 zero-seed
- No apps/api/**

---

## Completion / handoff

| Field | Value |
|-------|--------|
| completion_report | FE EMP linkage ADD: WH picker+decision neo; QSĐ person-bound+effective hint; SI timeline actions UI; HTP-05 honesty banner; C&B gate on EmployeeForm; vitest 16 PASS; honesty false. |
| next_owner | **qa** |
| next_dispatch_prompt | § below |
| evidence_path | `docs/qa/evidence/po-hrm-e2e-link-emp-fe-01.md` |
| ack_status | **READY_FOR_QA** |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-01
from_role: pm
to_role: qa
lane: execution
program: PO-HRM-ALL-MENU-E2E-LINK-01
ack_target: PASS_TO_PM

entry_criteria:
  - FE READY: docs/qa/evidence/po-hrm-e2e-link-emp-fe-01.md
  - BE peer PO-HRM-E2E-LINK-EMP-BE-01 READY or document partial (actions/hire-readiness 404 = FE honesty PASS)
  - U65 zero-seed · browser-only · hrm_personnel_uat_ready=false

read_first:
  - docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.1–D.7
  - docs/qa/evidence/po-hrm-e2e-link-emp-fe-01.md
  - HDSD testids: hdsd-work-timeline-* · hdsd-decisions-* · hdsd-insurance-* · hdsd-hire-readiness-banner

task (browser U65):
  - WH: create/edit → CatalogSearchPicker position (cấm free-text) → Lưu → F5
  - QSĐ person-bound: thiếu NV → block; status=effective → profile WH badge decision neo after F5
  - SI: action close|stop|suspend|change_rate|resume → Network POST …/actions 2xx (or honest error if BE not up) → periods F5
  - HTP-05: contract tab banner ready|blocked|unavailable — never silent ready on 404
  - Regression J-HRM-01..04 · UF-HRM-01..04 smoke
  - cấm: seed · claim personnel UAT

exit_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md
  - matrix UF/J rows + residual list
```
