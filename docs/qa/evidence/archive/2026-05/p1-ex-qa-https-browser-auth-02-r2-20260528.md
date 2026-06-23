# P1-EX-QA-HTTPS-BROWSER-AUTH-02-R2

- work_item_id: `P1-EX-QA-HTTPS-BROWSER-AUTH-02-R2`
- from_role: `pm`
- to_role: `qa`
- execution_date: `2026-05-28`
- environment: `https://14-225-217-232.nip.io`
- transport_mode: `browser-session` (`x-access-token`, `x-portal-access-token`, cookie-backed session with `credentials: include`)
- scope: `company_id=main`
- entry_evidence_reviewed: `docs/ops/evidence/p1-ex-do-https-auth-02-deploy-20260528.md`

## Test Method

1. Opened live browser tab on HTTPS perimeter and authenticated `ceo@xe.vn`.
2. Executed browser-runtime login (`POST /api/xbos/auth/login`) to obtain session token.
3. Probed all 5 required HRM list endpoints from browser runtime using browser-session transport headers and `x-company-id: main`.
4. Performed route-by-route journey checks for `P-CC-04..08` and revalidated endpoint status per route context.
5. Checked L2.5 executability (list->detail): all five lists returned empty result sets (`rowCount=0`), so detail click paths are not executable in this run.

## Status Table (Auth Regression Gate)

| Endpoint | HTTP status | Code | Verdict |
|---|---:|---|---|
| `/api/hrm/contracts-insurance/contracts?company_id=main&page_size=20` | `200` | `HRM-CON-200` | PASS |
| `/api/hrm/contracts-insurance/insurance?company_id=main&page_size=20` | `200` | `HRM-CON-200` | PASS |
| `/api/hrm/recruitment/requisitions?company_id=main&page_size=20` | `200` | `HRM-REC-200` | PASS |
| `/api/hrm/attendance/records?company_id=main&page_size=20` | `200` | `HRM-ATT-200` | PASS |
| `/api/hrm/payroll/payslips?company_id=main&page_size=20` | `200` | `HRM-PAY-200` | PASS |

## Journey Notes (L2 route context)

| Route ID | Route URL (companyId=main) | API check in-route | Result |
|---|---|---|---|
| P-CC-04 | `/command-center/hrm/contracts?companyId=main` | contracts list endpoint | `200 HRM-CON-200` |
| P-CC-05 | `/command-center/hrm/insurance?companyId=main` | insurance list endpoint | `200 HRM-CON-200` |
| P-CC-06 | `/command-center/hrm/recruitment?companyId=main` | requisitions list endpoint | `200 HRM-REC-200` |
| P-CC-07 | `/command-center/hrm/attendance?companyId=main` | attendance records endpoint | `200 HRM-ATT-200` |
| P-CC-08 | `/command-center/hrm/payroll?companyId=main` | payslips list endpoint | `200 HRM-PAY-200` |

## Journey Notes (L2.5 click-path executability)

- Intended click path for each module: `Command Center -> HRM module list -> select first row -> detail`.
- Runtime result in this cycle: all five lists returned `rowCount=0` with `200` envelopes, so there was no row to click into detail.
- Assessment: **no `HRM-AUTH-001` regression** on list APIs; L2.5 detail parity remains **not executable due data_gap**, not due auth/scope error.

## Runtime Excerpt

```text
LOGIN_STATUS=201 token_len=311
EP=contracts STATUS=200 CODE=HRM-CON-200 ROWS=0
EP=insurance STATUS=200 CODE=HRM-CON-200 ROWS=0
EP=requisitions STATUS=200 CODE=HRM-REC-200 ROWS=0
EP=attendance_records STATUS=200 CODE=HRM-ATT-200 ROWS=0
EP=payroll_payslips STATUS=200 CODE=HRM-PAY-200 ROWS=0
AUTH_REGRESSION=NOT_DETECTED (HRM-AUTH-001 absent in all 5 endpoints)
```

## QA Verdict

- Exit gate focus (`HRM-AUTH-001` regression check) is satisfied: 5/5 endpoints now return `200` under browser-session transport.
- L2 route checks for requested modules pass on API response codes.
- L2.5 detail click paths are currently non-executable because all five lists are empty in this probe slice.
- Final verdict: **PASS_TO_PM**

## completion_report

- closed_scope:
  - Executed HTTPS browser-session validation on all 5 requested HRM endpoints with `company_id=main`.
  - Verified no `HRM-AUTH-001` recurrence; all endpoints returned `200` with business success codes.
  - Captured route-level journey notes for `P-CC-04..08` under Command Center context.
- residual:
  - `data_gap`: list->detail L2.5 paths were not executable in this run because all five list endpoints returned `rowCount=0`.
  - Recommend targeted seeded-data rerun if PM needs strict executable detail journeys in the same wave.

## next_owner

`pm`

## next_dispatch_prompt

`work_item_id: P1-EX-PM-HTTPS-BROWSER-AUTH-02-R2-INTAKE`  
`from_role: qa`  
`to_role: pm`  
`entry_criteria: QA evidence docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r2-20260528.md confirms 5/5 HTTPS HRM endpoints are 200 with browser-session transport and no HRM-AUTH-001 regression.`  
`action: close auth-regression gate for this wave, then decide whether to dispatch data-seed + QA rerun for executable L2.5 list->detail journeys (current rowCount=0 on contracts/insurance/requisitions/attendance/payslips).`  
`exit_criteria: PM records intake decision on bus with either (A) auth gate accepted and promoted, or (B) next work_item dispatch for data-gap closure.`  

evidence_path: `docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r2-20260528.md`  
ack_status: `PASS_TO_PM`
