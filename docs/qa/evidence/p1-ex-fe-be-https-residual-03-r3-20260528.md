# FE Residual Fix Evidence - P1-EX-FE-BE-HTTPS-RESIDUAL-03-R3

- work_item_id: `P1-EX-FE-BE-HTTPS-RESIDUAL-03-R3`
- from_role: `pm`
- to_role: `dev-fe`
- execution_time_local: `2026-05-28 (UTC+7)`
- target_runtime: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
- input_evidence:
  - `docs/qa/evidence/p1-ex-qa-https-residual-03-r2-20260528.md`
  - `docs/qa/evidence/p1-ex-qc-https-residual-03-r2-20260528.md`

## Scope Completed

1. Hardened attendance runtime API-mode detection to prevent any Supabase fallback in `/attendance` path:
   - File: `apps/web/hrm/src/lib/hrmDataMode.ts`
   - Added `isAttendanceRuntimePath()` and force `isHrmApiDataMode()` to return `true` for:
     - `/attendance`
     - `/attendance/*`
   - Extended `shouldSkipSupabaseDataFetches()` to explicitly skip Supabase for attendance runtime path.

2. Extended regression coverage for attendance path hardening:
   - File: `apps/web/hrm/src/lib/hrmDataMode.test.ts`
   - Updated non-portal false case to `/employees` (true non-attendance baseline).
   - Added test to verify `/attendance` always enforces API mode and Supabase skip when `VITE_HRM_USE_API=false`.

## Why this closes the residual

QA R2 showed localhost fallback resources remained in attendance runtime:
- `/rest/v1/departments`
- `/rest/v1/attendance_sheets`
- `/rest/v1/work_shifts`
- `/rest/v1/attendance_rules`
- `/rest/v1/attendance_records`
- `/rest/v1/leave_requests`

Those calls are all guarded by API-mode switches in attendance hooks. By hard-forcing API mode at the attendance route level, fallback branches are blocked even if portal query/session context drifts during runtime transitions.

## Verification Commands

```bash
pnpm --dir "apps/web/hrm" test -- src/lib/hrmDataMode.test.ts src/integrations/hrmApi.getEmployeeById.test.ts
```

Result:
- `src/lib/hrmDataMode.test.ts`: `11/11` PASS
- `src/integrations/hrmApi.getEmployeeById.test.ts`: `4/4` PASS
- Total: `15/15` PASS

## completion_report

- closed_scope:
  - Attendance runtime now hard-enforces API-only mode on `/attendance` path, preventing Supabase fallback execution caused by portal context drift.
  - Regression tests updated to lock this behavior and protect prior portal-token/auth fixes.
- residual:
  - Live HTTPS runtime proof (`fallbackAllCount=0` before/after `Kiểm tra lại`) still requires QA execution on deployed FE bundle.

## Handoff Packet

- next_owner: `qa`
- next_dispatch_prompt: `Please execute QA retest for work_item_id P1-EX-QA-HTTPS-RESIDUAL-03-R3 on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn after FE deploy of evidence docs/qa/evidence/p1-ex-fe-be-https-residual-03-r3-20260528.md. Verify (1) fallbackAllCount=0 before and after clicking "Kiểm tra lại" with no 127.0.0.1:54321/rest/v1/* resources, and (2) in-session attendance probe GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10 returns 200 HRM-ATT-200. Publish explicit PASS/FAIL verdict with runtime excerpts.`
- evidence_path: `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r3-20260528.md`
- ack_status: `READY_FOR_QA`
