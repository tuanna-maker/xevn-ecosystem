# FE/BE Residual Fix Evidence — P1-EX-FE-BE-HTTPS-RESIDUAL-03-R2

- work_item_id: `P1-EX-FE-BE-HTTPS-RESIDUAL-03-R2`
- from_role: `pm`
- to_role: `dev-fe`
- execution_time_local: `2026-05-28 (UTC+7)`
- target_runtime: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`

## Scope Completed

1. Hardened HRM API auth headers in portal runtime:
   - File: `apps/web/hrm/src/integrations/hrmApi.ts`
   - Change:
     - Wait for portal token hydration up to `5000ms` before first request in portal mode.
     - Send all required token headers together when portal token exists:
       - `Authorization: Bearer <token>`
       - `x-access-token: <token>`
       - `x-portal-access-token: <token>`
2. Hardened portal `/hr` runtime to never enter Supabase fallback path:
   - File: `apps/web/hrm/src/lib/hrmDataMode.ts`
   - Change:
     - Added strict portal-proxy detector for `/hr` and `/hr/*`.
     - `isHrmApiDataMode()` now hard-forces API mode for `/hr` runtime.
     - `shouldSkipSupabaseDataFetches()` now hard-forces skip for `/hr` runtime.
3. Added regression coverage:
   - `apps/web/hrm/src/integrations/hrmApi.getEmployeeById.test.ts`
     - verifies portal token headers include `Authorization`, `x-access-token`, `x-portal-access-token`
     - verifies attendance request waits for hydrated portal token with `waitForPortalAccessToken(5000)`
   - `apps/web/hrm/src/lib/hrmDataMode.test.ts`
     - verifies `/hr/attendance` runtime forces API mode even when `VITE_HRM_USE_API=false`

## Verification Commands

```bash
pnpm --dir "apps/web/hrm" test -- src/lib/hrmDataMode.test.ts src/integrations/hrmApi.getEmployeeById.test.ts
```

Result: `PASS` (`14/14` tests).

## Runtime Baseline Recheck (Pre-Deploy)

Using browser CDP against current deployed runtime (`14-225-217-232.nip.io`), before deploying this patch:

- `fallbackAllCount`: `8`
- Fallback resources still observed:
  - `/rest/v1/departments`
  - `/rest/v1/attendance_sheets`
  - `/rest/v1/work_shifts`
  - `/rest/v1/attendance_rules`
  - `/rest/v1/attendance_records`
  - `/rest/v1/leave_requests`
- In-session attendance probe with full portal token headers:
  - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`
  - Status: `200`
  - Code: `HRM-ATT-200`

This confirms the remaining production symptom is on deployed bundle and requires QA retest on the new FE patch build.

## completion_report

- closed_scope:
  - Removed remaining portal auth race in HRM API client by waiting token hydration and sending strict browser-session token headers.
  - Added strict `/hr` runtime guard to force API-only mode and skip Supabase fallback branches.
  - Added automated regression tests for both auth header parity and `/hr` API-mode enforcement.
- residual:
  - `fallbackAllCount=0` cannot be proven on current deployed URL until patched FE build is deployed and re-tested.

## Handoff Packet

- next_owner: `qa`
- next_dispatch_prompt: `Please run QA retest for work_item_id P1-EX-QA-HTTPS-RESIDUAL-03-R2 on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn after deploying FE patch from P1-EX-FE-BE-HTTPS-RESIDUAL-03-R2. Verify (1) fallbackAllCount=0 both before and after clicking "Kiểm tra lại" with no 127.0.0.1:54321/rest/v1/* resources, and (2) in-session attendance probe GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10 returns 200 HRM-ATT-200. Promote only when both conditions pass.`
- evidence_path: `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r2-20260528.md`
- ack_status: `READY_FOR_QA`
