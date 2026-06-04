## Work item

- `work_item_id`: `P1-EX-FE-BE-HTTPS-ATTENDANCE-RESIDUAL-03`
- `from_role`: `pm`
- `to_role`: `dev-fe`
- `scope`: eliminate remaining attendance localhost fallback in portal runtime (including retry path) and prevent attendance records 401 during portal session bridge timing.

## Root cause

1. **Portal-mode detection gap on iframe route variants**
   - `getHrmPortalMode()` relied on query/storage only.
   - When query params were stripped/changed on embed navigation, some hooks could evaluate runtime as non-portal and permit Supabase fallback paths.
2. **Early API request before portal session bridge hydrated token**
   - `hrmApi.headers()` attempted auth immediately.
   - In iframe startup race, attendance list request could execute before `xevn.portal.accessToken` existed, causing transient 401 on `/api/hrm/attendance/records`.

## FE changes delivered

1. `apps/web/hrm/src/lib/hrmPortalMode.ts`
   - `getHrmPortalMode()` now treats iframe runtime (`window.self !== window.top`) as portal mode baseline.
   - Effect: portal/API mode remains active even if query string does not carry `portal=1`.

2. `apps/web/hrm/src/lib/portalAuthBridge.ts`
   - Added `waitForPortalAccessToken(timeoutMs=1500)`.
   - Waits for `xevn-portal-session-ready` event before giving up.

3. `apps/web/hrm/src/integrations/hrmApi.ts`
   - `headers()` now detects portal mode and awaits `waitForPortalAccessToken()` before composing Authorization.
   - Prevents first-load attendance requests from racing ahead of postMessage session hydration.

4. `apps/web/hrm/src/lib/portalAuthBridge.test.ts`
   - Added regression tests for delayed token arrival and timeout behavior.

## Verification evidence

### A) Targeted FE tests

Command:

```bash
cd apps/web/hrm
pnpm test -- src/lib/portalAuthBridge.test.ts src/lib/hrmDataMode.test.ts src/hooks/useAttendanceRecords.test.ts
```

Result:

- `3/3` test files passed
- `17/17` tests passed
- Includes new async bridge coverage ensuring token wait path resolves correctly.

### B) Runtime safety claim for this wave

- **Fallback guard**: attendance runtime remains in API mode for iframe/portal path regardless of query retention (`getHrmPortalMode` iframe fallback).
- **Auth guard**: attendance API header builder now waits for portal token event before issuing requests in portal mode.

These two controls close the previously observed dual condition:
- fallback traffic to `127.0.0.1:54321` in embed runtime
- attendance records `401` from early unauthenticated request

## Expected QA runtime checks (same gate as FAIL_TO_PM report)

1. Open `/hr/attendance?portal=1&companyId=main` in Command Center context.
2. Capture network before + after clicking retry.
3. Confirm:
   - `fallbackCount=0` for `127.0.0.1:54321/rest/v1/*`
   - attendance records endpoint is non-401 under portal/main scope.

## Changed files

- `apps/web/hrm/src/lib/hrmPortalMode.ts`
- `apps/web/hrm/src/lib/portalAuthBridge.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/lib/portalAuthBridge.test.ts`

## Handoff

- `ack_status`: `READY_FOR_QA`
- `evidence_path`: `docs/qa/evidence/p1-ex-fe-be-https-attendance-residual-03-20260528.md`
- `next_owner`: `qa`
- `next_dispatch_prompt`: `work_item_id: P1-EX-QA-HTTPS-ATTENDANCE-RESIDUAL-03-R1; from_role: pm; to_role: qa; entry_criteria: FE evidence docs/qa/evidence/p1-ex-fe-be-https-attendance-residual-03-20260528.md with iframe portal-mode hardening and portal-token wait path merged; action: rerun attendance runtime gate on /hr/attendance?portal=1&companyId=main including retry click path, capture network resources and in-session attendance records API probe; exit_criteria: publish docs/qa/evidence/p1-ex-qa-https-attendance-residual-03-r1-20260528.md with explicit fallbackCount and attendance records status, verdict PASS_TO_PM only when fallbackCount=0 and records endpoint non-401.`
