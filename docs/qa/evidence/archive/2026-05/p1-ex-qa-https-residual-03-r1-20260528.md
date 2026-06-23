# QA Runtime Validation — P1-EX-QA-HTTPS-RESIDUAL-03-R1

- work_item_id: `P1-EX-QA-HTTPS-RESIDUAL-03-R1`
- from_role: `pm`
- to_role: `qa`
- execution_time_local: `2026-05-28 (UTC+7)`
- account: `ceo@xe.vn`
- target_runtime: `https://14-225-217-232.nip.io`
- scope_context: `portal=1`, `companyId=main`

## Entry Criteria

- Reviewed latest FE/BE residual-fix handoff context for:
  1) browser-session auth acceptance on HRM list endpoints
  2) attendance fallback zero-call gate (including retry path)

## Test Actions

1. Logged in via `POST /api/xbos/auth/login` using `ceo@xe.vn`.
2. Replayed 5 required HRM endpoints with browser-session transport:
   - `x-access-token`
   - `x-portal-access-token`
   - cookie `xevn.portal.accessToken`
   - `x-company-id: main`
3. Opened attendance runtime URL:
   - `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
4. Captured resource evidence before retry and after clicking `Kiểm tra lại`.
5. Probed in-session attendance API from runtime page:
   - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

## Result A — Auth Browser-Session Endpoints

`LOGIN_STATUS=201 token_len=311 defaultCompanyId=main`

| Endpoint | HTTP status | Code | Expected |
|---|---:|---|---|
| `/api/hrm/contracts-insurance/contracts?company_id=main&page_size=20` | `200` | `HRM-CON-200` | non-401 |
| `/api/hrm/contracts-insurance/insurance?company_id=main&page_size=20` | `200` | `HRM-CON-200` | non-401 |
| `/api/hrm/recruitment/requisitions?company_id=main&page_size=20` | `200` | `HRM-REC-200` | non-401 |
| `/api/hrm/attendance/records?company_id=main&page_size=20` | `200` | `HRM-ATT-200` | non-401 |
| `/api/hrm/payroll/payslips?company_id=main&page_size=20` | `200` | `HRM-PAY-200` | non-401 |

Verdict for residual (1): **PASS** (5/5 non-401).

## Result B — Attendance Fallback Zero Gate (Including Retry)

Runtime page snapshot after load and retry (`Kiểm tra lại`) remained functional, but fallback gate failed:

- `fallbackAllCount`: `8` (expected `0`)
- `fallbackDeltaCount` after retry: `0` (no new fallback calls on retry, but total still non-zero)
- Representative fallback resource hits still present:
  - `http://127.0.0.1:54321/rest/v1/attendance_rules?...`
  - `http://127.0.0.1:54321/rest/v1/attendance_records?...`
  - `http://127.0.0.1:54321/rest/v1/leave_requests?...`

In-session attendance probe:

- `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`
- Response: `401` (`HRM-AUTH-001`)

Verdict for residual (2): **FAIL** (localhost fallback traffic not zero + runtime attendance probe unauthorized).

## Overall QA Verdict

- ack_status: **FAIL_TO_PM**
- reason:
  - Residual (1) is closed.
  - Residual (2) is still open and is release-blocking per zero-fallback gate.

## completion_report

- closed_scope:
  - Executed required HTTPS runtime validation for both residuals with specified account and scope.
  - Confirmed browser-session auth now works on all 5 required HRM endpoints.
- residual_open:
  - Attendance runtime still emits localhost fallback traffic (`127.0.0.1:54321/rest/v1/*`).
  - Attendance in-session API probe remains unauthorized (`401 HRM-AUTH-001`).

## Handoff Packet

- next_owner: `dev-fe` (coordinate `dev-be` for attendance auth/session path as needed)
- next_dispatch_prompt: `work_item_id: P1-EX-FE-BE-HTTPS-RESIDUAL-03-R2; from_role: pm; to_role: dev-fe; entry_criteria: QA evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r1-20260528.md shows residual (1) fixed (5/5 HRM browser-session endpoints now 200) but residual (2) still failing with fallbackAllCount=8 on /hr/attendance and runtime attendance probe 401 HRM-AUTH-001 after retry path. action: remove all remaining localhost Supabase fallback calls in attendance runtime for portal mode and ensure in-session attendance records API uses accepted browser-session auth path under companyId=main; coordinate dev-be if guard extraction differs by attendance endpoint. exit_criteria: published FE/BE evidence proving fallbackAllCount=0 before and after clicking \"Kiểm tra lại\" and attendance runtime probe /api/hrm/attendance/records?company_id=main&page=1&page_size=10 returns 200 on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-residual-03-r1-20260528.md`
- needed_by: `immediate (P1 residual auto-fix)`
- pm_dispatch_hint: `P1-EX-FE-BE-HTTPS-RESIDUAL-03-R2 — attendance fallback zero gate + in-session auth 401`
