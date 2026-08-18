# Evidence — PO-HRM-E2E-LINK-EMP-BE-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-EMP-BE-01` |
| from_role | dev-be |
| to_role | qa |
| lane | execution |
| parent | `PO-HRM-E2E-LINK-EMP-DB-01` CONFIRMED |
| program | `W-ALL-PARALLEL-01` · `PO-HRM-ALL-MENU-E2E-LINK-01` |
| change_mode | ADD · preserve_default · code_memory APPEND |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |

---

## Honesty locks (unchanged)

| Flag | Value |
|------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| U65 zero-seed | **true** (no seed in evidence) |
| Module UAT / PROD claim | **none** |
| Dual WH / enrollment SoT | **forbidden — not invented** |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| SA TechSpec | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md` §3 F-CORE-DEC/WH/SI/HTP · §4 DB |
| DB confirm | `docs/program/specs/PO-HRM-E2E-LINK-EMP-DB-01.md` CONFIRMED + `po-hrm-e2e-link-emp-db-01.md` |
| BA spine | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md` §D.2/D.5/D.6 |
| AS-IS Nest | `decisions.service` · `employee-profile.service` · `employee-insurances.service` · `employees.service` |

---

## Implemented (ADD)

### Schema (`ensureSchema`)

| Target | ADD |
|--------|-----|
| `employee_work_timeline` | `decision_id`, `source_module`, `archived_at` + UQ partial `(decision_id) WHERE NOT NULL AND archived_at IS NULL` + IX `(employee_id, event_date)` |
| `hr_decisions` | `department_key` |
| `employee_insurances` | optional `policy_id`, `si_number`, `archived_at` |
| **NEW** `hrm_insurance_rate_period` | append-only period table + open-period UQ + indexes |

### F-ids

| F-id | Behavior |
|------|----------|
| **F-CORE-DEC-01** | Person-bound (`appointment`/`transfer`) require `employee_id` → `HRM-DEC-EMP-REQUIRED`; denorm name from `employees` in scope |
| **F-CORE-DEC-02** | `status='effective'` → UPSERT WH by `decision_id` (`source_module=decision`); cancel/expire/delete → soft-archive WH |
| **F-CORE-WH-01** | List WH display-ready + `decision_code` join; hide `archived_at` |
| **F-CORE-WH-02** | Reject free-text SoT → `HRM-WH-PICK-REQUIRED`; empty catalog → `HRM-WH-PICK-EMPTY-CATALOG`; soft-archive delete |
| **F-CORE-SI-02/03** | GET enrollment + `periods[]`; `POST /employee-insurances/:id/actions` close\|stop\|suspend\|change_rate\|resume append period |
| **F-CORE-HTP-05** | `GET /employees/:id/hire-readiness` — active `employee_contracts` same `company_id` + date window; blocker `HRM-HTP-NO-ACTIVE-CONTRACT` (no 500) |

### Scope parity (U19)

- Decisions list/get — `resolveHrmListScope` + `pushCompanyIdFilter` (unchanged + covered)
- Insurance list/get — same resolver
- Hire readiness — `getEmployeeById` same scope as list

---

## Verification

```text
pnpm exec jest --testPathPatterns="po-hrm-e2e-link-emp-be-01|decisions.service.spec|employee-insurances.service.spec|employee-profile.service.spec" --no-coverage
→ Test Suites: 4 passed · Tests: 27 passed
```

New suite: `apps/api/hrm-api/src/employees/po-hrm-e2e-link-emp-be-01.spec.ts`

---

## Contract notes for FE

| Surface | Method / path |
|---------|----------------|
| QSĐ person-bound | `POST/PATCH /api/hrm/decisions` — require `employee_id` for appointment/transfer; set `status=effective` to write WH |
| WH list | `GET /api/hrm/employees/:id/work-timeline` — `position_key`, `decision_id`, `decision_code` |
| WH mutate | `POST/PATCH …/work-timeline` — `position_key` required |
| SI actions | `POST /api/hrm/employee-insurances/:id/actions` body `{ company_id, action, effective_from, … }` |
| HTP-05 | `GET /api/hrm/employees/:id/hire-readiness?company_id=` |

---

## Residual

| Residual | Owner |
|----------|-------|
| FE WH picker · SI action buttons · C&B hide D1 | **dev-fe** `PO-HRM-E2E-LINK-EMP-FE-01` |
| Browser U65 D1–D7 zero-seed | **qa** after FE |
| AC-SI-TL-06 PAY period read | PAY seat |
| Claim UAT flags | **forbidden** until QA PASS |

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | ADD schema WH `decision_id`/`source_module`/`archived_at` + `hrm_insurance_rate_period`; F-CORE-DEC-01/02 person-bound + effective UPSERT WH; WH-02 picker reject; SI-03 actions append; HTP-05 hire-readiness; jest 27 PASS; CODE-MEMORY APPEND; honesty false; no seed; no dual SoT. |
| next_owner | **qa** (parallel FE if FE READY) |
| next_dispatch_prompt | See below |
| evidence_path | `docs/qa/evidence/po-hrm-e2e-link-emp-be-01.md` |
| ack_status | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-01
from_role: pm
to_role: qa
entry: BE READY_FOR_QA docs/qa/evidence/po-hrm-e2e-link-emp-be-01.md (+ FE if PASS)
u65: zero-seed · browser FE only · hrm_personnel_uat_ready=false until PASS
UF/J: D1 QSĐ person-bound → effective → WH tab; D2 WH picker reject free-text; D5 SI actions timeline; D6 HTP hire-readiness; D7 scope_parity main↔holding
cấm: seed · claim UAT on FAIL · API-only PASS
exit: evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md · PASS_TO_PM / FAIL_TO_PM
```
