# QA Retest Evidence — P1-EX-QA-HTTPS-ATTENDANCE-FALLBACK-02

- work_item_id: `P1-EX-QA-HTTPS-ATTENDANCE-FALLBACK-02`
- from_role: `qa`
- to_role: `pm`
- execution_time_local: `2026-05-28 13:34-13:37 (UTC+7)`
- account: `ceo@xe.vn`
- target_url: `https://14-225-217-232.nip.io/hr/attendance?portal=1&tenantId=xevn&companyId=main`
- scope_context: `portal=1`, `companyId=main`, `tenantId=xevn`

## Entry Criteria Check

- FE fix reference found: `docs/qa/evidence/p1-ex-fe-https-attendance-fallback-01-20260528.md`.
- Retest objective: verify attendance remains healthy and has **no** fallback requests to `127.0.0.1:54321`.

## Test Actions

1. Opened attendance runtime route with `portal=1&companyId=main`.
2. Captured interactive page snapshot and confirmed Attendance dashboard rendered.
3. Clicked `Kiểm tra lại` to force refresh/runtime data pull.
4. Collected `performance.getEntriesByType('resource')` and filtered:
   - fallback patterns: `127.0.0.1:54321`, `/rest/v1/attendance_rules`, `/rest/v1/attendance_records`, `/rest/v1/time_off_requests`
   - attendance API patterns: `/api/hrm/attendance/*`
5. Collected attendance API resource statuses from runtime resource timing entries.

## Observed Runtime Evidence

### A) Fallback traffic check (hard gate)

- `fallbackCount`: **9** (expected: `0`)
- Representative fallback requests observed:
  - `http://127.0.0.1:54321/rest/v1/departments?...company_id=eq.main...`
  - `http://127.0.0.1:54321/rest/v1/attendance_sheets?...company_id=eq.main...`
  - `http://127.0.0.1:54321/rest/v1/work_shifts?...company_id=eq.main...`
  - `http://127.0.0.1:54321/rest/v1/attendance_rules?select=*&company_id=eq.main`
  - `http://127.0.0.1:54321/rest/v1/attendance_records?...attendance_date=...`
  - `http://127.0.0.1:54321/rest/v1/leave_requests?...status=eq.approved...`

### B) Attendance UI/API health signal

- Page remained renderable with attendance dashboard widgets and no red sync-error banner text.
- Attendance API resource requests were present (`hrmAttendanceApiCount`: `4`), including:
  - `/api/hrm/attendance/records?company_id=main&page_size=100` -> `responseStatus: 200`
  - `/api/hrm/attendance/leave-requests?company_id=main&page_size=50` -> `responseStatus: 200`
  - `/api/hrm/attendance/update-requests?company_id=main&page_size=50` -> `responseStatus: 400` (non-blocking for this fallback gate, but retained as residual API quality note)

## Verdict

- ack_status: **FAIL_TO_PM**
- verdict_reason:
  - Mandatory gate "no 127.0.0.1:54321 fallback requests" is **not met**.
  - Runtime still issues multiple Supabase local fallback calls despite attendance UI and partial API health.

## completion_report

- closed_scope:
  - Re-executed HTTPS attendance fallback retest on required account/scope.
  - Verified live runtime network behavior after `Kiểm tra lại`.
  - Produced objective counts and concrete URL evidence.
- residual_open:
  - `attendance-fallback-still-active`: local fallback calls persist (`fallbackCount=9`), so FE fallback-removal objective remains open.
  - `attendance-update-requests-400`: one attendance endpoint still returns 400 in runtime resource timing (`page_size=50` path).

## Handoff Packet

- next_owner: `pm` (dispatch `dev-fe`, and `dev-be` if endpoint contract issue confirmed)
- next_dispatch_prompt: `Please dispatch dev-fe for P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-02-R2 to remove all attendance runtime fallback calls to 127.0.0.1:54321 on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main (ceo@xe.vn). Exit when performance resource entries show fallbackCount=0 after Kiểm tra lại and attendance API routes stay healthy; include updated evidence file and PASS_TO_QA handoff.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-attendance-fallback-02-20260528.md`
- needed_by: `immediate (P1 residual auto-fix)`
- pm_dispatch_hint: `P1-EX-FE-HTTPS-ATTENDANCE-FALLBACK-02-R2 — remove 127.0.0.1 attendance fallback traffic and keep API parity`

