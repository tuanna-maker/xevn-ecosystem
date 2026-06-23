# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R3

- work_item_id: `P1-EX-QA-HTTPS-RESIDUAL-03-R3`
- from_role: `pm`
- to_role: `qa`
- execution_time_local: `2026-05-28 (UTC+7)`
- runtime_url: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
- account: `ceo@xe.vn`
- prerequisite: latest residual fix wave completed and bus state `PASS_TO_PM`

## Scope Executed (runtime)

1. Opened live HTTPS attendance page:
   - `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
2. Captured fallback traffic baseline from runtime resource entries.
3. Ran impacted HRM auth/session probes in-browser session (token + portal headers):
   - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=5`
   - `GET /api/hrm/employees?company_id=main&page=1&page_size=5`
   - `GET /api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5`
   - `GET /api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=5`
   - `GET /api/hrm/payroll/payslips?company_id=main&page=1&page_size=5`
4. Clicked `Kiểm tra lại` on attendance page.
5. Re-checked fallback traffic and re-ran attendance records probe.

## Runtime Results

### A) Attendance fallback-zero gate

- Before `Kiểm tra lại`:
  - `fallbackAllCount = 8`
  - `fallbackAttendanceCount = 7`
  - Matched localhost samples include:
    - `http://127.0.0.1:54321/rest/v1/attendance_sheets?...`
    - `http://127.0.0.1:54321/rest/v1/work_shifts?...`
    - `http://127.0.0.1:54321/rest/v1/attendance_rules?...`
    - `http://127.0.0.1:54321/rest/v1/attendance_records?...`
    - `http://127.0.0.1:54321/rest/v1/leave_requests?...`
- After `Kiểm tra lại`:
  - `fallbackAllCount = 8`
  - `fallbackAttendanceCount = 7`
  - Same localhost fallback pattern remains.

Verdict for fallback criterion: **FAIL** (expected zero localhost fallback requests).

### B) Attendance records probe

- Probe endpoint:
  - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=5`
- Before and after retry:
  - HTTP `200`
  - code: `HRM-ATT-200`
  - message: `Attendance records listed`

Verdict for attendance probe criterion: **PASS**.

### C) Auth/session health for impacted HRM flows

- Runtime session token detected:
  - `tokenPresent = true` (`tokenLength = 311`)
- In-session probe results:
  - `EMP-LIST`: `200` `HRM-EMP-200`
  - `CON-LIST`: `200` `HRM-CON-200`
  - `REC-LIST`: `200` `HRM-REC-200`
  - `PAY-LIST`: `200` `HRM-PAY-200`
  - `ATT-RECORDS`: `200` `HRM-ATT-200`

Verdict for auth/session criterion: **PASS** (no `HRM-AUTH-001` on impacted list flows).

## Overall QA Verdict

- `ack_status: FAIL_TO_PM`
- Reason:
  - Mandatory fallback-zero gate is still open (`fallbackAllCount` remains `8` before and after `Kiểm tra lại`).
  - Attendance probe and auth/session health are green, but release residual cannot close while localhost fallback traffic persists.

## completion_report

- closed_scope:
  - Executed immediate runtime QA on requested HTTPS attendance URL and account.
  - Verified attendance records probe is `200` and remains `200` after retry.
  - Verified session/auth health on impacted HRM list flows (`5/5` probes `200`).
- residual:
  - Localhost fallback traffic to `127.0.0.1:54321/rest/v1/*` still present (`fallbackAllCount=8`) before and after retry.

## Handoff Packet

- next_owner: `dev-fe`
- next_dispatch_prompt: `Execute residual auto-fix for P1-EX-FE-BE-HTTPS-RESIDUAL-03-R4 on attendance runtime path in apps/web/hrm. Reproduce on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main (ceo@xe.vn), remove all localhost fallback calls to 127.0.0.1:54321/rest/v1/* including after clicking "Kiểm tra lại", and keep impacted HRM probes (attendance/employees/contracts/recruitment/payroll with company_id=main) at HTTP 200. Provide READY_FOR_QA evidence with before/after fallback counts and runtime probe table.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260528.md`
- ack_status: `FAIL_TO_PM`
