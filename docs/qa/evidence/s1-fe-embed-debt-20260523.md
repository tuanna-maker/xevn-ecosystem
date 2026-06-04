# S1-FE-DEBT — HRM embed Supabase debt closure

**work_item_id:** S1-FE-DEBT  
**date:** 2026-05-23  
**role:** dev-fe  
**ack_status:** READY_FOR_QA

## Problem

Command Center iframe (P-CC-05..08) showed `ERR_CONNECTION_REFUSED` to `127.0.0.1:54321` while Nest/proxy L2 passed — legacy hooks/components still called Supabase REST on load or tab switch.

## Fix pattern

- `shouldSkipSupabaseDataFetches()` / `isPortalEmbedApiMode()` gates all reads and writes.
- Reads: Nest `hrmApi` (`listJobRequisitions`, `listRecruitmentCandidates`, `listLeaveRequests`, `listEmployees`) or empty state when no API.
- Writes in portal mode: blocked with toast (no silent Supabase fallback).

## Files touched (main)

| Area | Files |
|------|--------|
| Core | `apps/web/hrm/src/lib/hrmDataMode.ts`, `hrmDataMode.test.ts` |
| Recruitment | `JobPostingsTab.tsx`, `CandidatesTab.tsx`, `CandidateSourceStats.tsx`, `useKanbanCandidates.ts`, `useRecruitmentPlans.ts`, `useCandidateEvaluations.ts`, `jobPostingsPortal.test.ts` |
| Attendance | `useAttendanceSheets.ts`, `useLeaveRequests.ts`, `useLateEarlyRequests.ts`, `useOvertimeRequests.ts`, `useBusinessTripRequests.ts`, `useShiftChangeRequests.ts`, `useWorkShifts.ts`, `useAttendanceRules.ts`, `*.test.ts` |
| Insurance / payroll | `AddInsuranceDialog.tsx`, `SalesDataTab.tsx`, `useSalesData.ts`, `SalaryTemplateBuilder.tsx` |
| Employee | `EmployeeWorkTimeline.tsx` |

## Build / test evidence

```text
pnpm -C apps/web/hrm test   → 16 files, 30 tests PASS (exit 0)
pnpm -C apps/web/hrm build  → PASS (exit 0)
```

## QA L2 (P-CC-05..08)

- Login: `ceo@xe.vn` / `Xevn@2026` @ `http://127.0.0.1:5175`
- Per route: Network tab — **no** required request to `:54321`; Nest `/api/hrm/*` 200 or empty+200
- Console: no `ERR_CONNECTION_REFUSED` on initial load for insurance, recruitment (dashboard + jobs tab), attendance overview, payroll overview

## Residual risk

- Recruitment/attendance **write** paths still toast-blocked in portal until Nest CRUD endpoints exist.
- Salary template builder still uses Supabase for template CRUD when opened outside embed.
- Deep recruitment tabs (interviews, campaigns, headcount) still Supabase-backed when user navigates to them — out of P-CC-06 initial-load scope.
