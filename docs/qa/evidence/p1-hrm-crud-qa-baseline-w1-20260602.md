# P1-HRM-CRUD-QA-BASELINE-W1

- work_item_id: `P1-HRM-CRUD-QA-BASELINE-W1`
- date: `2026-06-02`
- tester: `qa`
- environment: local (`portal=http://127.0.0.1:5173`, `hrm-api=:28001`, `xbos-api=:28002`)
- account slice: `ceo@xe.vn` / `company_id=main`

## Automated checks executed

1. `pnpm run qc:dev-stack` -> PASS (3/3)
2. `pnpm run qc:fe-be-health` -> PASS (all checks)
3. `pnpm run test:system:uat` -> PASS (`37/37`, report at `docs/qa/evidence/system-integration-uat-report.json`)
4. `PORTAL_DEV_URL=http://127.0.0.1:5173 pnpm run test:pilot:flows` -> PASS (`13/13`)
5. `node scripts/tmp-p1-100-qa-fe-w1-smoke.mjs` -> PASS (`24/24`)
6. `node scripts/tmp-p1-bnd-qa-fe-smoke.mjs` -> PASS (`5/5`)
7. `node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs` -> FAIL (`30/31`) with one CRUD failure (skills patch)

## CRUD verification matrix

Legend: `PASS` = verified executable with expected code; `PARTIAL` = not fully validated in this wave; `FAIL` = verified mismatch.

| module | action | route/screen | expected | actual | verdict | defect_id |
|---|---|---|---|---|---|---|
| employees | C | `POST /api/hrm/employees` | 200/201 | Not executed in this wave (payload contract not stabilized in this baseline run) | PARTIAL | |
| employees | R | `GET /api/hrm/employees?page_size=100&company_id=main` (`P-CC-03`) | 200 + list/empty | 200 `HRM-EMP-200` (pilot + health + UAT probes) | PASS | |
| employees | U | `PATCH /api/hrm/employees/:employeeId` | 200/201 | Not executed in this wave | PARTIAL | |
| employees | D | archive/restore (`POST /employees/:employeeId/archive|restore`) | 200/201 | Not executed in this wave | PARTIAL | |
| contracts | C | `POST /api/hrm/contracts-insurance/contracts` | 200/201 | Not executed in this wave | PARTIAL | |
| contracts | R | `GET /api/hrm/contracts-insurance/contracts?company_id=main` (`P-CC-04`) | 200 + list/empty | 200 `HRM-CON-200` | PASS | |
| contracts | U | `PATCH /api/hrm/contracts-insurance/contracts/:contractId` | 200/201 | Not executed in this wave | PARTIAL | |
| contracts | D | `DELETE /api/hrm/contracts-insurance/contracts/:contractId` | 200/204 | Not executed in this wave | PARTIAL | |
| insurance | C | `POST /api/hrm/contracts-insurance/insurance` | 200/201 | Not executed in this wave | PARTIAL | |
| insurance | R | `GET /api/hrm/contracts-insurance/insurance?company_id=main` (`P-CC-05`) | 200 + list/empty | 200 `HRM-CON-200` | PASS | |
| insurance | U | `PATCH /api/hrm/employee-insurances/:insuranceId` | 200/201 | Not executed in this wave | PARTIAL | |
| insurance | D | `DELETE /api/hrm/employee-insurances/:insuranceId` | 200/204 | Not executed in this wave | PARTIAL | |
| decisions | C | `POST /api/hrm/decisions` | 200/201 | Not executed in this wave | PARTIAL | |
| decisions | R | `GET /api/hrm/decisions?company_id=main` | 200 + list/empty | Not executed in this wave | PARTIAL | |
| decisions | U | `PATCH /api/hrm/decisions/:decisionId` | 200/201 | Not executed in this wave | PARTIAL | |
| decisions | D | `DELETE /api/hrm/decisions/:decisionId` | 200/204 | Not executed in this wave | PARTIAL | |
| recruitment | C | `POST /api/hrm/recruitment/job-postings` | 200/201 | 201 `HRM-REC-JP-201` | PASS | |
| recruitment | R | `GET /api/hrm/recruitment/requisitions?company_id=main&page_size=100` (`P-CC-06`) | 200 + list/empty | 200 `HRM-REC-200` | PASS | |
| recruitment | U | `PATCH /api/hrm/recruitment/job-postings/:id` | 200/201 | 200 `HRM-REC-JP-200` | PASS | |
| recruitment | D | `DELETE /api/hrm/recruitment/job-postings/:id` | 200/204 | 200 `HRM-REC-JP-200` | PASS | |
| attendance | C | `POST /api/hrm/attendance/records` and `POST /api/hrm/attendance/leave-requests` | 200/201 | PASS in UAT P5 flow (`attendance-record-create-list-db`, `leave-request-create-list-db`) | PASS | |
| attendance | R | `GET /api/hrm/attendance/records?company_id=main&page_size=100` (`P-CC-07`) | 200 + list/empty | 200 `HRM-ATT-200` | PASS | |
| attendance | U | `PATCH /api/hrm/attendance/work-shifts/:shiftId` | 200/201 | Not executed (`work-shifts` create/delete only executed) | PARTIAL | |
| attendance | D | `DELETE /api/hrm/attendance/work-shifts/:shiftId` | 200/204 | 200 `HRM-WS-200` | PASS | |
| payroll | C | `POST /api/hrm/payroll/salary-components` and `POST /api/hrm/payroll/payment-batches` | 200/201 | 201 `HRM-SC-201`, 201 `HRM-PB-201` | PASS | |
| payroll | R | `GET /api/hrm/payroll/payslips?company_id=main&page_size=100` (`P-CC-08`) | 200 + list/empty | 200 `HRM-PAY-200` | PASS | |
| payroll | U | `PATCH /api/hrm/payroll/salary-components/:id` and advance state transitions (`approve/reject/mark-paid`) | 200/201 | 200 `HRM-SC-200`, 201 `HRM-ADV-203/204/205` | PASS | |
| payroll | D | `DELETE /api/hrm/payroll/salary-components/:id`, `DELETE /payment-batches/:id` | 200/204 | 200 `HRM-SC-200`, 200 `HRM-PB-200` | PASS | |
| settings | C | `POST /api/hrm/settings-catalogs/*` | 200/201 | Not executed in this wave | PARTIAL | |
| settings | R | `GET /api/hrm/settings-catalogs` (`P-CC-04a`) | 200 | 200 `HRM-SET-200` | PASS | |
| settings | U | review/approve flows in settings catalogs | 200/201 | Not executed in this wave | PARTIAL | |
| settings | D | removal requests / governed delete-like flow | 200/204 | Not executed in this wave | PARTIAL | |
| leave | C | `POST /api/hrm/attendance/leave-requests` | 200/201 | PASS in UAT (`leave-request-create-list-db`) | PASS | |
| leave | R | `GET /api/hrm/attendance/leave-requests?company_id=main` | 200 + list/empty | Covered in UAT role journeys and manager flow | PASS | |
| leave | U | `POST /api/hrm/attendance/leave-requests/:id/approve` | 200/201 | PASS in UAT P6 (`manager-approve-leave-sample`) | PASS | |
| leave | D | delete/cancel leave request endpoint | 200/204 | Endpoint not covered by current scripts in this wave | PARTIAL | |

## Prioritized defect list (business impact)

| priority | defect_id | title | impact | evidence |
|---|---|---|---|---|
| P1 | HRM-CRUD-W1-001 | Employee skills update fails after successful create | Employee profile CRUD is not consistently executable: create skill succeeds, immediate patch returns 400 `HRM-EMP-PROFILE-400`; blocks correction/edit flow for HR operations. | `tmp-p1-qual-qa-fe-w2-smoke.mjs` (`skills-create` pass, `skills-patch` fail) |
| P2 | HRM-CRUD-W1-002 | Decisions CRUD baseline not executed yet | Objective completeness claim cannot be 100% for decisions because C/R/U/D path is still unverified in this wave. | Matrix rows `decisions` = PARTIAL |
| P2 | HRM-CRUD-W1-003 | Settings/contract/insurance full CUD not executed yet | Some modules currently validated mainly on Read + selected writes, not full CUD; residual uncertainty for update/delete contracts. | Matrix rows `contracts`, `insurance`, `settings` = PARTIAL |

## Baseline verdict

- Overall baseline status: **PARTIAL (not 100%)**
- What is objectively strong:
  - Stack/L1/L2 smoke are green (`qc:dev-stack`, `qc:fe-be-health`, `test:system:uat`, `test:pilot:flows`)
  - Recruitment/payroll core CRUD probes are mostly green
  - Leave operational flow (create + manager approve) is green
- What is objectively unfinished:
  - Full CRUD coverage for decisions/settings/contracts/insurance/employees core record mutation is incomplete in this wave
  - One reproducible functional defect exists in employee skills update (`HRM-CRUD-W1-001`)

## Repro commands

```bash
pnpm run qc:dev-stack
pnpm run qc:fe-be-health
pnpm run test:system:uat
$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; pnpm run test:pilot:flows
node scripts/tmp-p1-100-qa-fe-w1-smoke.mjs
node scripts/tmp-p1-bnd-qa-fe-smoke.mjs
node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs
```

## Handoff status

- ack_status: `PASS_TO_PM`
- completion_report: Baseline matrix published with explicit PASS/PARTIAL/FAIL and one reproducible P1 defect; system is not 100% CRUD-complete for HRM scope-2 at this time.
- next_owner: `pm` (dispatch `dev-be`, then `qa` retest)
