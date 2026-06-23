# P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-01 — Enforce API-only attendance path

| Field | Value |
|---|---|
| work_item_id | `P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-01` |
| from_role | `pm` |
| to_role | `dev-fe` |
| date | `2026-05-28` |
| source QA fail | `docs/qa/evidence/p1-ex-qa-https-attendance-08-r1-20260528.md` |
| target ack_status | `READY_FOR_QA` |

## Problem diagnosed

- QA recorded runtime fallback calls to Supabase/local endpoints (`127.0.0.1:54321/rest/v1/...`) from attendance area, including `attendance_rules`.
- Attendance hooks used `shouldSkipSupabaseDataFetches()` which only skips Supabase when embed/session signals are present; this left a path where attendance screens could still hit Supabase fallback even with API mode enabled.

## Implemented fixes

Updated attendance module hooks to use strict API mode guard (`isHrmApiDataMode()`) instead of portal/session-only guard:

- `apps/web/hrm/src/hooks/useAttendanceRules.ts`
- `apps/web/hrm/src/hooks/useAttendanceSheets.ts`
- `apps/web/hrm/src/hooks/useAttendanceOverview.ts`
- `apps/web/hrm/src/hooks/useAttendanceReports.ts`
- `apps/web/hrm/src/hooks/useLeaveRequests.ts`
- `apps/web/hrm/src/hooks/useLeaveRequestsData.ts`

This makes attendance module behavior deterministic:

- `VITE_HRM_USE_API=true` -> attendance flows do **not** execute Supabase/local fallback queries.
- `VITE_HRM_USE_API=false` -> legacy Supabase behavior remains available by explicit env opt-out.

## Before/after network proof

### Before (QA evidence)

- From `docs/qa/evidence/p1-ex-qa-https-attendance-08-r1-20260528.md`: runtime showed requests to `127.0.0.1:54321/rest/v1/attendance_rules` and related fallback resources in portal attendance flow.

### After (FE code-path proof)

- Attendance hooks now route by `isHrmApiDataMode()` gate (env-driven), not embed/session-derived skip logic.
- Under `VITE_HRM_USE_API=true` (portal HTTPS target mode), attendance hooks short-circuit Supabase branches and do not issue local fallback requests.

## Verification evidence

### Test command

```bash
pnpm vitest --run src/hooks/useAttendanceRecords.test.ts src/hooks/useAttendanceOverview.test.ts src/hooks/useAttendanceSheets.test.ts src/hooks/useLeaveRequests.test.ts src/lib/hrmDataMode.test.ts
```

### Result

- **PASS** — 5 files, 12 tests passed.
- Edited files lint check: **no linter errors**.

## completion_report

- Closed:
  - Attendance module now enforces API-mode guard for all impacted attendance hooks, removing Supabase/local fallback path in portal HTTPS API mode.
  - Included hooks that previously triggered attendance/leave/rules Supabase reads under partial embed/session detection.
  - Ran targeted regression tests and lint checks successfully.
- Residual:
  - Live browser/network retest on HTTPS environment is pending QA execution to capture post-fix runtime trace.

## next_owner

- `qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-01-R1
from_role: pm
to_role: qa
ack_status target: PASS_TO_PM

Please retest attendance portal HTTPS flow after FE fallback guard fix:
1) Login ceo@xe.vn / Xevn@2026.
2) Open /command-center/hrm/attendance (iframe mode with portal=1&companyId=main).
3) Capture DevTools network and verify NO requests to:
   - 127.0.0.1:54321/rest/v1/attendance_rules
   - 127.0.0.1:54321/rest/v1/attendance_sheets
   - any /rest/v1/leave_requests fallback
4) Verify attendance data/rules/overview tabs still render via /api/hrm/attendance/* APIs.
5) Attach before/after screenshot or HAR snippet and verdict.

Evidence path: docs/qa/evidence/p1-ex-qa-https-attendance-fallback-01-r1-20260528.md
Reference FE evidence: docs/qa/evidence/p1-ex-fe-https-attendance-fallback-01-20260528.md
```

## evidence_path

- `docs/qa/evidence/p1-ex-fe-https-attendance-fallback-01-20260528.md`

## ack_status

- `READY_FOR_QA`
