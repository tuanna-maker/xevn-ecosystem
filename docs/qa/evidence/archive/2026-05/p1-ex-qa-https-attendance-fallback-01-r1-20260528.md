# QA Evidence - P1-EX-QA-HTTPS-ATTENDANCE-FALLBACK-01-R1

- work_item_id: `P1-EX-QA-HTTPS-ATTENDANCE-FALLBACK-01-R1`
- from_role: `pm`
- to_role: `qa`
- date: `2026-05-28`
- environment: `https://14-225-217-232.nip.io`
- account/scope: `ceo@xe.vn` + `?portal=1&tenantId=xevn&companyId=main`
- target route: `P-CC-07 /hr/attendance`

## Entry criteria validation

- FE fix "Supabase fallback in attendance UI" was marked completed in bus tail (as provided in dispatch).
- Retest executed on HTTPS attendance page with command-center portal query scope.

## Test execution

1. Opened HTTPS page:
   - `https://14-225-217-232.nip.io/hr/attendance?portal=1&tenantId=xevn&companyId=main`
2. Captured page runtime snapshot:
   - Page loaded attendance shell and widgets without crash.
3. Ran CDP runtime resource inspection (`performance.getEntriesByType('resource')`) for fallback signatures:
   - Filtered patterns: `127.0.0.1:54321`, `attendance_rules`, `attendance_sheets`, `work_shifts`, `attendance_records`.
4. Triggered page refresh action via UI button `Kiểm tra lại` and re-checked traces.
5. Checked API/resource evidence for HRM API and fallback coexistence.
6. Collected regression context from source:
   - `apps/web/hrm/src/pages/Attendance.tsx` still imports and uses:
     - `useAttendanceSheets`
     - `useWorkShifts`
     - `useAttendanceRules`
   - Those hooks still use Supabase tables:
     - `attendance_sheets`
     - `work_shifts`
     - `attendance_rules`

## Runtime evidence

### Network/resource evidence (CDP)

- `fallbackHitCount: 8` on the HTTPS attendance runtime.
- Observed fallback calls include:
  - `http://127.0.0.1:54321/rest/v1/attendance_rules?...company_id=eq.main`
  - `http://127.0.0.1:54321/rest/v1/attendance_sheets?...company_id=eq.main`
  - `http://127.0.0.1:54321/rest/v1/work_shifts?...company_id=eq.main`
  - `http://127.0.0.1:54321/rest/v1/attendance_records?...company_id=eq.main...`
  - `http://127.0.0.1:54321/rest/v1/leave_requests?...company_id=eq.main...`

### API evidence

- HRM API resources were also present (`/api/hrm/attendance/*`) with `hrmApiHitCount: 3`, specifically:
  - `/api/hrm/attendance/records?company_id=main&page_size=100`
  - `/api/hrm/attendance/update-requests?company_id=main&page_size=50`
  - `/api/hrm/attendance/leave-requests?company_id=main&page_size=50`
- This indicates mixed mode remains: API calls exist, but local Supabase fallback requests are still executed.

### Console/error excerpt

- Explicit fetch to local fallback origin from the same page context returned:
  - `TypeError: Failed to fetch`
- This matches unsafe/invalid local fallback behavior under HTTPS pilot and confirms fallback path is still active.

## Result vs exit criteria

- Required condition: "local Supabase fallback calls (127.0.0.1:54321, attendance_rules and related) are eliminated after FE fix."
- Actual: fallback calls are still emitted at runtime on HTTPS attendance page.
- Verdict: `FAIL_TO_PM`

## Regression notes

- Regression scope is narrowed to attendance runtime data layer fallback paths (rules/sheets/shifts/records related).
- The page is not fully broken (attendance shell loads), but quality gate fails because forbidden local fallback traffic persists.
- Risk:
  - HTTPS command-center users can still hit local endpoint attempts.
  - Produces unstable behavior and noisy runtime failures.

## Handoff packet

- ack_status: `FAIL_TO_PM`
- completion_report:
  - Closed: HTTPS attendance retest executed with required account/scope and runtime evidence captured (network/API/console/source-regression notes).
  - Residual: local fallback requests to `127.0.0.1:54321` still occur (`attendance_rules` and related endpoints), so no-fallback gate is not satisfied.
- next_owner: `dev-fe`
- next_dispatch_prompt: `work_item_id: P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-01-R2; from_role: pm; to_role: dev-fe; entry_criteria: QA evidence docs/qa/evidence/p1-ex-qa-https-attendance-fallback-01-r1-20260528.md shows active fallback calls to 127.0.0.1:54321 on /hr/attendance with companyId=main; action: remove remaining Supabase fallback execution path in attendance runtime (useAttendanceRules/useAttendanceSheets/useWorkShifts and related calls) for portal HTTPS mode so no request to 127.0.0.1:54321 is emitted; add/adjust tests proving embed/portal mode skips fallback and uses HRM API only; exit_criteria: local/pilot verification logs + targeted FE tests + bus packet READY_FOR_QA.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-attendance-fallback-01-r1-20260528.md`
- pm_dispatch_hint: `P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-01-R2 - attendance runtime still emits local Supabase fallback requests under HTTPS portal mode.`
