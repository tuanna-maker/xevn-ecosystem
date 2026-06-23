# P1-EX-BE-HTTPS-BROWSER-AUTH-02

- work_item_id: `P1-EX-BE-HTTPS-BROWSER-AUTH-02`
- from_role: `pm`
- to_role: `dev-be`
- execution_date: `2026-05-28`
- scope: deep root-cause fix for browser session token transport (`company_id=main`) on HRM list APIs

## Root-cause findings

1. **Auth verification fragility across services/environments**  
   HRM auth verification only trusted `SERVICE_JWT_SECRET` (or local dev fallback), while deployed environments can expose JWT secret under legacy names (`JWT_SECRET`, `ACCESS_TOKEN_SECRET`, `XBOS_JWT_SECRET`).  
   Result: browser session token from portal login could be structurally valid but still fail signature verification at HRM boundary -> `401 HRM-AUTH-001`.

2. **Controller-local normalization was not sufficient as a system boundary**  
   Browser fallback extraction (`x-access-token`, `x-portal-access-token`, cookie) existed only at selected controller methods.  
   Missing centralized normalization increased drift risk and made auth behavior depend on route-level implementation details.

3. **Cookie transport parser was brittle**  
   Cookie extraction accepted only one cookie key and did not robustly normalize quoted values.

## Implemented fix

### A) Centralized request normalization (global middleware)

- Added global pre-controller middleware in `src/main.ts`:
  - normalizes browser auth fallback into canonical `authorization: Bearer <token>`
  - applies for all routes, not only patched controllers.

### B) Hardened token extraction and verification

- Updated `src/common/internal-auth.ts`:
  - Added `normalizeAuthorizationHeaderInPlace()` shared boundary helper.
  - Hardened cookie parser:
    - strips quoted values
    - supports fallback cookie names:
      - `xevn.portal.accessToken`
      - `xevn.portal.access_token`
      - `xevn_portal_access_token`
  - Expanded JWT secret resolution for verification:
    - `SERVICE_JWT_SECRET`
    - `JWT_SECRET`
    - `ACCESS_TOKEN_SECRET`
    - `XBOS_JWT_SECRET`
    - dev fallback only outside production.

### C) Signing compatibility alignment

- Updated `src/common/jwt-sign.ts` to use the same secret fallback chain for token signing consistency.

## Regression tests added

- New file: `src/common/internal-auth.spec.ts`
  - `x-access-token` -> normalized authorization.
  - existing `authorization` remains canonical.
  - quoted cookie token fallback is accepted.
  - underscored cookie key fallback is accepted.
  - production verification works with `JWT_SECRET` fallback.

## Verification commands and results

```bash
pnpm --filter hrm-api test -- src/common/internal-auth.spec.ts src/contracts-insurance/contracts-insurance.controller.spec.ts src/recruitment/recruitment.controller.spec.ts src/attendance/attendance.controller.spec.ts src/payroll/payroll.controller.spec.ts
```

- Result: `PASS` (5 suites, 35 tests).

## Runtime probe (current perimeter before deploy promotion)

```text
LOGIN_STATUS=201 token_len=311
EP=contracts STATUS=401 CODE=HRM-AUTH-001
EP=insurance STATUS=401 CODE=HRM-AUTH-001
EP=requisitions STATUS=401 CODE=HRM-AUTH-001
EP=attendance_records STATUS=401 CODE=HRM-AUTH-001
EP=payroll_payslips STATUS=401 CODE=HRM-AUTH-001
```

- This probe confirms baseline failure on current running HTTPS instance prior to promoting this backend fix.

## completion_report

- closed_scope:
  - Completed deep root-cause fix at shared auth boundary (middleware + verifier + parser), not controller-only patch.
  - Added regression tests for browser transport normalization and secret fallback verification.
  - Verified impacted auth controller suites remain passing.
- residual:
  - HTTPS live non-401 acceptance for the 5 endpoints requires deployment of this change to the running perimeter instance, then QA retest.

## next_owner

`qa`

## next_dispatch_prompt

`work_item_id: P1-EX-QA-HTTPS-BROWSER-AUTH-02-R1`  
`from_role: pm`  
`to_role: qa`  
`entry_criteria: deploy includes docs/qa/evidence/p1-ex-be-https-browser-auth-02-20260528.md changes (global auth normalization + JWT secret fallback + internal-auth regression tests).`  
`action: retest browser-session auth transport on https://14-225-217-232.nip.io for company_id=main with x-access-token/x-portal-access-token/cookie path; verify all 5 endpoints non-401: contracts, insurance, requisitions, attendance records, payroll payslips.`  
`exit_criteria: publish docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r1-20260528.md with status table showing 5/5 non-401 and verdict PASS_TO_PM.`  

evidence_path: `docs/qa/evidence/p1-ex-be-https-browser-auth-02-20260528.md`  
ack_status: `READY_FOR_QA`
