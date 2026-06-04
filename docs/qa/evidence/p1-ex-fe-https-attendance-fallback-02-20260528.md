# FE Evidence — P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-02

- work_item_id: `P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-02`
- from_role: `pm`
- to_role: `dev-fe`
- execution_time_local: `2026-05-28 14:33-14:37 (UTC+7)`
- target_scope: `/hr/attendance?portal=1&companyId=main`

## Root Cause Analysis

QA reported fallback traffic (`127.0.0.1:54321`) including:
- `departments`
- `work_shifts`
- `attendance_rules`
- `attendance_sheets`
- `attendance_records`
- `leave_requests`

The remaining leak was caused by data-mode gating that still allowed Supabase when `VITE_HRM_USE_API=false`, even on portal/embed runtime. In that state, attendance-adjacent hooks still executed Supabase branches.

## Changes Implemented

1. Forced API mode in portal/embed runtime:
   - Updated `src/lib/hrmDataMode.ts`:
     - `isHrmApiDataMode()` now returns `true` whenever portal mode or portal session is detected, regardless of env override.
2. Removed attendance-adjacent dependence on embed/session-only skip logic:
   - Updated `src/hooks/useDepartments.ts` to gate by `isHrmApiDataMode()`.
   - Updated `src/hooks/useWorkShifts.ts` to gate by `isHrmApiDataMode()`.
3. Adjusted regression tests:
   - Updated `src/lib/hrmDataMode.test.ts` with new case:
     - `VITE_HRM_USE_API=false` + portal context => `isHrmApiDataMode() === true`.

## Simulated Check (Fallback Gate)

Simulated gate target:
- In portal attendance runtime (`portal=1&companyId=main`), API mode is now forced `true`.
- All attendance hooks already guarded by API mode (`useAttendanceOverview`, `useAttendanceReports`, `useAttendanceRules`, `useAttendanceSheets`, leave/attendance request hooks) now deterministically bypass Supabase fallback branches in this runtime.

Simulated verdict for this FE patch:
- `fallbackCount=0` expected for attendance runtime after reload action (`Kiểm tra lại`) under portal scope.

## Verification Commands

Executed:
- `pnpm vitest run src/lib/hrmDataMode.test.ts` -> PASS (`9/9`)
- `pnpm vitest run src/hooks/useAttendanceOverview.test.ts src/hooks/useAttendanceSheets.test.ts` -> PASS (`2/2`)

## completion_report

- closed_scope:
  - Identified remaining attendance runtime fallback vectors tied to API-mode gating.
  - Enforced portal attendance runtime to API-only data mode.
  - Updated attendance-adjacent hooks and regression tests.
- residual:
  - Live browser/network recheck on HTTPS pilot remains for QA confirmation (`fallbackCount` must be observed from runtime resources by QA).

## Handoff Packet

- next_owner: `qa`
- next_dispatch_prompt: `Retest work_item P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-02 on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn. Click "Kiểm tra lại", capture performance resource entries, and verify fallbackCount to 127.0.0.1:54321 is exactly 0 while /api/hrm/attendance/* remains healthy. If PASS, mark READY_FOR_QC/PASS_TO_PM with updated evidence.`
- evidence_path: `docs/qa/evidence/p1-ex-fe-https-attendance-fallback-02-20260528.md`
- ack_status: `READY_FOR_QA`
