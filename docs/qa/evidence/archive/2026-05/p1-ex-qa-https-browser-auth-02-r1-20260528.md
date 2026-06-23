# P1-EX-QA-HTTPS-BROWSER-AUTH-02-R1

- work_item_id: `P1-EX-QA-HTTPS-BROWSER-AUTH-02-R1`
- from_role: `pm`
- to_role: `qa`
- execution_date: `2026-05-28`
- environment: `https://14-225-217-232.nip.io`
- transport_mode: `browser-session` (`x-access-token`, `x-portal-access-token`, cookie `xevn.portal.accessToken`)
- scope: `company_id=main`
- entry_evidence_reviewed: `P1-EX-DO-HTTPS-AUTH-02-DEPLOY` (per dispatch note)

## Test Method

1. Login via `POST /api/xbos/auth/login` with `ceo@xe.vn`.
2. Extract session token from response (`data.accessToken`), assert default scope (`defaultCompanyId=main`).
3. Call 5 required HRM endpoints on HTTPS pilot using browser-session headers/cookie and `x-company-id: main`.
4. Record status code and business error code.

## Status Table

| Endpoint | Request | HTTP status | Code | Verdict |
|---|---|---:|---|---|
| `/api/hrm/contracts-insurance/contracts?company_id=main&page_size=20` | browser-session headers + cookie | `401` | `HRM-AUTH-001` | FAIL |
| `/api/hrm/contracts-insurance/insurance?company_id=main&page_size=20` | browser-session headers + cookie | `401` | `HRM-AUTH-001` | FAIL |
| `/api/hrm/recruitment/requisitions?company_id=main&page_size=20` | browser-session headers + cookie | `401` | `HRM-AUTH-001` | FAIL |
| `/api/hrm/attendance/records?company_id=main&page_size=20` | browser-session headers + cookie | `401` | `HRM-AUTH-001` | FAIL |
| `/api/hrm/payroll/payslips?company_id=main&page_size=20` | browser-session headers + cookie | `401` | `HRM-AUTH-001` | FAIL |

## Runtime Excerpt

```text
LOGIN_STATUS=201 tenant=xevn company=main token_len=311
EP=contracts STATUS=401 CODE=HRM-AUTH-001
EP=insurance STATUS=401 CODE=HRM-AUTH-001
EP=requisitions STATUS=401 CODE=HRM-AUTH-001
EP=attendance_records STATUS=401 CODE=HRM-AUTH-001
EP=payroll_payslips STATUS=401 CODE=HRM-AUTH-001
```

## QA Verdict

- Expected by exit gate: all 5 endpoints accept browser-session transport and return non-401.
- Actual: 5/5 endpoints returned `401 HRM-AUTH-001`.
- Final verdict: **FAIL_TO_PM**

## completion_report

- closed_scope:
  - Executed HTTPS retest on all 5 requested endpoints with explicit browser-session transport and `company_id=main`.
  - Captured deterministic runtime evidence (login success + endpoint status matrix + business codes).
- residual:
  - Browser-session token transport is still rejected by HRM APIs in deployed environment.
  - Deep-fix deploy evidence is not behaviorally confirmed at runtime for this wave.

## next_owner

`dev-be`

## next_dispatch_prompt

`work_item_id: P1-EX-BE-HTTPS-BROWSER-AUTH-02-R2`
`from_role: pm`
`to_role: dev-be`
`entry_criteria: qa FAIL evidence docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r1-20260528.md confirms all 5 HTTPS HRM endpoints still return 401 HRM-AUTH-001 with browser-session transport (x-access-token/x-portal-access-token/cookie xevn.portal.accessToken) under company_id=main.`
`action: fix runtime browser-session auth extraction/guard path for HRM APIs so session token transport is accepted consistently on contracts-insurance contracts+insurance, recruitment requisitions, attendance records, payroll payslips; validate on deployed nip.io runtime (not unit-only).`
`exit_criteria: publish dev-be evidence with live runtime command output proving non-401 on all 5 endpoints using browser-session transport at https://14-225-217-232.nip.io and include regression proof for legacy Authorization header path.`

evidence_path: `docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r1-20260528.md`
ack_status: `FAIL_TO_PM`
