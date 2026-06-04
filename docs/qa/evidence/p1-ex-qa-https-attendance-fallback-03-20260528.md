# QA Retest Evidence — P1-EX-QA-HTTPS-ATTENDANCE-FALLBACK-03

- work_item_id: `P1-EX-QA-HTTPS-ATTENDANCE-FALLBACK-03`
- from_role: `qa`
- to_role: `pm`
- execution_time_local: `2026-05-28 14:35-14:40 (UTC+7)`
- account: `ceo@xe.vn`
- target_url: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
- scope_context: `portal=1`, `companyId=main`

## Entry Criteria Check

- Dev-FE deep-fix handoff was received from PM for runtime retest.
- Retest objective is strict: fallback calls to `127.0.0.1:54321` must be zero, including after retry action (`Kiểm tra lại`).

## Test Actions

1. Opened HTTPS attendance runtime page with requested scope (`portal=1&companyId=main`).
2. Captured initial runtime resource evidence from `performance.getEntriesByType('resource')`.
3. Verified page-level state and interacted with retry action `Kiểm tra lại`.
4. Captured post-retry delta resources and checked fallback signatures:
   - `127.0.0.1:54321`
   - `/rest/v1/attendance_rules`
   - `/rest/v1/attendance_records`
   - `/rest/v1/leave_requests`
5. Probed attendance API from the same runtime context:
   - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

## Observed Runtime Evidence

### A) Fallback traffic gate

- Initial resource scan on attendance page:
  - `fallbackAllCount`: **8** (expected `0`)
  - Representative requests observed:
    - `http://127.0.0.1:54321/rest/v1/departments?...company_id=eq.main...`
    - `http://127.0.0.1:54321/rest/v1/attendance_sheets?...company_id=eq.main...`
    - `http://127.0.0.1:54321/rest/v1/work_shifts?...company_id=eq.main...`
    - `http://127.0.0.1:54321/rest/v1/attendance_rules?select=*&company_id=eq.main`
    - `http://127.0.0.1:54321/rest/v1/attendance_records?...attendance_date=...`
    - `http://127.0.0.1:54321/rest/v1/leave_requests?...status=eq.approved...`
- After retry action (`Kiểm tra lại`), delta scan:
  - `deltaCount`: `2`
  - `fallbackDeltaCount`: `0`
  - Total fallback remained non-zero (`fallbackAllCount=8`) => hard gate remains failed.

### B) Attendance UI/API health

- UI rendered successfully and showed `HRM API Sync CONNECTED`.
- Runtime API probe result:
  - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10` -> **401** (`attendanceHealthOk=false`)
- Resource list contains attendance API request entries, but direct runtime health probe is unauthorized.

## Verdict

- ack_status: **FAIL_TO_PM**
- verdict_reason:
  - Strict no-fallback gate is not satisfied because local Supabase fallback traffic still exists (`fallbackAllCount=8`).
  - Attendance API health is not fully healthy in runtime probe (`401` on attendance records endpoint).

## completion_report

- closed_scope:
  - Completed full HTTPS attendance runtime retest with required account/scope.
  - Verified fallback behavior before and after retry action.
  - Verified attendance UI state plus runtime attendance API probe result.
- residual_open:
  - `attendance-fallback-still-active`: local fallback calls to `127.0.0.1:54321/rest/v1/*` remain in runtime.
  - `attendance-api-auth-401`: attendance records runtime probe returned 401.

## Handoff Packet

- next_owner: `pm`
- next_dispatch_prompt: `Please dispatch dev-fe (and coordinate dev-be for auth/session if needed) for P1-EX-FE-BE-HTTPS-ATTENDANCE-FALLBACK-03-R1. Re-test target: https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn. Exit when performance resource entries show fallbackAllCount=0 (no 127.0.0.1:54321/rest/v1 requests) including after clicking "Kiểm tra lại", and attendance records API runtime probe returns 200 in-session. Provide updated evidence and READY_FOR_QA handoff.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-attendance-fallback-03-20260528.md`
- needed_by: `immediate (P1 residual auto-fix)`
- pm_dispatch_hint: `P1-EX-FE-BE-HTTPS-ATTENDANCE-FALLBACK-03-R1 — remove localhost fallback and restore attendance API runtime auth`
