# P1-EX-QA-HTTPS-BROWSER-AUTH-01C-R1

- work_item_id: `P1-EX-QA-HTTPS-BROWSER-AUTH-01C-R1`
- from_role: `pm`
- to_role: `qa`
- execution_date: `2026-05-28`
- environment: `https://14-225-217-232.nip.io`
- persona: `ceo@xe.vn` (`company_id=main`)
- entry_evidence_reviewed: `docs/qa/evidence/p1-ex-be-https-browser-auth-01-20260528.md`

## Scope

Retest HTTPS browser/API auth behavior for `company_id=main` using portal browser session token transport path (browser-style token propagation) and verify non-401 for:

1. `/api/hrm/contracts-insurance/contracts`
2. `/api/hrm/contracts-insurance/insurance`
3. `/api/hrm/recruitment/requisitions`
4. `/api/hrm/attendance/records`
5. `/api/hrm/payroll/payslips`

## Method

1. Authenticate via portal login endpoint:
   - `POST /api/xbos/auth/login`
   - capture `access_token`, tenant/company defaults.
2. Call each target endpoint with browser-session style auth transport:
   - `x-access-token`
   - `x-portal-access-token`
   - cookie `xevn.portal.accessToken=...`
   - `x-company-id: main`
3. Record HTTP status and business code if present.

## Request/Response Status Table

| Endpoint | Request mode | Status | Non-401 gate |
|---|---|---:|---|
| `/api/hrm/contracts-insurance/contracts?company_id=main&page_size=20` | Browser-auth session headers/cookie | `401` | `FAIL` |
| `/api/hrm/contracts-insurance/insurance?company_id=main&page_size=20` | Browser-auth session headers/cookie | `401` | `FAIL` |
| `/api/hrm/recruitment/requisitions?company_id=main&page_size=20` | Browser-auth session headers/cookie | `401` | `FAIL` |
| `/api/hrm/attendance/records?company_id=main&page_size=20` | Browser-auth session headers/cookie | `401` | `FAIL` |
| `/api/hrm/payroll/payslips?company_id=main&page_size=20` | Browser-auth session headers/cookie | `401` | `FAIL` |

## Runtime Excerpt

```text
LOGIN_STATUS=201 tenant=xevn company=main token_len=311
EP=contracts STATUS=401
EP=insurance STATUS=401
EP=requisitions STATUS=401
EP=attendance_records STATUS=401
EP=payroll_payslips STATUS=401
```

## QA Verdict

- PASS criteria expected by entry contract: all 5 endpoints non-401 on browser-auth path.
- Actual: 5/5 returned `401`.
- Verdict: **FAIL**

## completion_report

- closed_scope:
  - Executed live HTTPS retest on all 5 required HRM endpoints for `company_id=main`.
  - Produced request/response status evidence with explicit non-401 gate result.
- residual:
  - Browser-auth fallback/session token propagation still not accepted by target HRM APIs in pilot runtime (`401` across all 5).
  - Entry claim from dev-be evidence is not yet confirmed in deployed environment.

## next_owner

`dev-be`

## next_dispatch_prompt

`work_item_id: P1-EX-BE-HTTPS-BROWSER-AUTH-01C-R2`
`from_role: pm`
`to_role: dev-be`
`entry_criteria: qa FAIL evidence docs/qa/evidence/p1-ex-qa-https-browser-auth-01c-r1-20260528.md confirms 5/5 endpoints still 401 on browser-auth session transport (x-access-token/cookie) for company_id=main.`
`action: fix runtime auth extraction/validation path so browser session token transport is accepted (x-access-token, x-portal-access-token, xevn.portal.accessToken cookie) on: contracts-insurance contracts+insurance, recruitment requisitions, attendance records, payroll payslips; verify deployed environment not only unit tests.`
`exit_criteria: publish dev-be evidence with live curl/Invoke-WebRequest outputs showing non-401 for all 5 endpoints on https://14-225-217-232.nip.io using browser-auth transport; include commit/deploy reference and regression command output.`

evidence_path: `docs/qa/evidence/p1-ex-qa-https-browser-auth-01c-r1-20260528.md`
ack_status: `FAIL_TO_PM`
