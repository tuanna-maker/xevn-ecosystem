# QA Evidence — P1-EX-QA-HTTPS-L25-DATA-JOURNEY-01

- work_item_id: `P1-EX-QA-HTTPS-L25-DATA-JOURNEY-01`
- from_role: `pm`
- to_role: `qa`
- environment: `https://14-225-217-232.nip.io`
- persona: `ceo@xe.vn` (`company_id=main`, tenant `xevn`)
- executed_at_utc: `2026-05-28T12:40Z-12:45Z`

## Scope and objective

Run data-aware L2.5 journey verification for `J-HRM-01/03/04/05/06/07` over HTTPS.  
If list rows are empty, classify blocker as `seed/data` vs `auth/runtime`.

## Commands executed

1. `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` with `PORTAL_DEV_URL=https://14-225-217-232.nip.io`
2. Targeted Node API probe for explicit journey-by-journey list/detail status and row totals on HTTPS
3. Controller contract check (read-only) to confirm available detail endpoints for journey interpretation (`contracts-insurance`, `recruitment`, `attendance`, `payroll`)

## L2.5 journey results (data-aware)

### J-HRM-01 — Contracts list -> Employee profile
- List endpoint: `GET /api/hrm/contracts-insurance/contracts?company_id=main` -> `200`
- Detail endpoint: `GET /api/hrm/employees/{employee_id}?company_id=main` -> `200`
- Data presence: `total=170` (non-empty)
- Sample employee_id: `00000000-0000-4000-8000-000000000048`
- Verdict: `PASS`

### J-HRM-03 — Contracts list -> Contract detail
- List endpoint: `GET /api/hrm/contracts-insurance/contracts?company_id=main` -> `200`
- Detail endpoint: `GET /api/hrm/contracts-insurance/contracts/{contractId}?company_id=main` -> `200`
- Data presence: `total=170` (non-empty)
- Sample contractId: `5c41c62f-adc4-4c07-8a70-87426eb70262`
- Verdict: `PASS`

### J-HRM-04 — Insurance list -> Linked employee profile
- List endpoint: `GET /api/hrm/contracts-insurance/insurance?company_id=main` -> `200`
- Detail endpoint: `GET /api/hrm/employees/{employee_id}?company_id=main` -> `200`
- Data presence: `total=170` (non-empty)
- Sample employee_id: `00000000-0000-4000-8000-000000000054`
- Verdict: `PASS`

### J-HRM-05 — Recruitment list -> recruitment detail lane
- List endpoint A: `GET /api/hrm/recruitment/requisitions?company_id=main&page_size=100` -> `200`
- List endpoint B: `GET /api/hrm/recruitment/candidates?company_id=main&page_size=100` -> `200`
- Data presence: `requisitions total=24`, `candidates total=40` (non-empty)
- Sample requisitionId: `c0410818-79b4-4efb-8dc5-60a64c1b1cbe`
- Note: current API surface does not expose a dedicated `GET requisitions/:id` in controller; L2.5 executed on available requisition/candidate detail lane contract for this module.
- Verdict: `PASS`

### J-HRM-06 — Attendance list -> linked employee profile
- List endpoint: `GET /api/hrm/attendance/records?company_id=main&page_size=100` -> `200`
- Detail endpoint: `GET /api/hrm/employees/{employee_id}?company_id=main` -> `200`
- Data presence: `total=299` (non-empty)
- Sample employee_id: `00000000-0000-4000-8000-000000000084`
- Verdict: `PASS`

### J-HRM-07 — Payslips list -> linked employee profile
- List endpoint: `GET /api/hrm/payroll/payslips?company_id=main&page_size=100` -> `200`
- Detail endpoint: `GET /api/hrm/employees/{employee_id}?company_id=main` -> `200`
- Data presence: `total=78` (non-empty)
- Sample employee_id: `00000000-0000-4000-8000-000000000003`
- Verdict: `PASS`

## Data precondition and blocker classification

- Empty-list precondition gap: `NOT DETECTED` for all in-scope journeys.
- Auth/runtime blocker: `NOT DETECTED` on targeted in-scope journey APIs (all list/detail probes returned `200`).
- Seed/data blocker: `NOT DETECTED` for in-scope journeys (all required lists returned non-zero totals).

## Additional observations

- Existing generic probe flagged `P-CC-01-jwt` because `expiresInSec=43200` (previous gate expected `86400`).
- Existing generic probe also flagged `J-CC-03` (`companyId=holding` -> `409`) which is outside this work item's requested in-scope journey set (`J-HRM-01/03/04/05/06/07`).
- These observations do not change this work item verdict for L2.5 data-aware HRM journeys.

## Verdict

- ack_status: `PASS_TO_PM`
- QA L2.5 in-scope result: `6/6 PASS` (`J-HRM-01/03/04/05/06/07`)

## Handoff packet

- work_item_id: `P1-EX-QA-HTTPS-L25-DATA-JOURNEY-01`
- from_role: `qa`
- to_role: `pm`
- entry_criteria: `auth endpoint lane now green in latest QA auth evidence; prior L2.5 non-executable risk due empty rows`
- exit_criteria: `completed`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-l25-data-journey-01-20260528.md`
- completion_report: `Closed requested data-aware L2.5 verification on HTTPS for J-HRM-01/03/04/05/06/07 with ceo@xe.vn. All targeted journeys are executable with non-empty rows and list/detail API status 200. No seed/data gap and no auth/runtime blocker detected for in-scope journeys; residual observation exists for out-of-scope KPI holding probe and JWT TTL delta.`
- next_owner: `pm`
- next_dispatch_prompt: `Run PM intake for P1-EX-QA-HTTPS-L25-DATA-JOURNEY-01 as PASS_TO_PM and decide whether to (a) close this wave as done for in-scope J-HRM-01/03/04/05/06/07, and (b) open a separate residual work item for out-of-scope observations: JWT expiresInSec 43200 vs 86400 expectation and J-CC-03 holding rollup 409.`
