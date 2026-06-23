# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R4

- work_item_id: `P1-EX-QA-HTTPS-RESIDUAL-03-R4`
- from_role: `pm`
- to_role: `qa`
- execution_time_local: `2026-05-28 (UTC+7)`
- runtime_url: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
- account: `ceo@xe.vn` (portal session via `xevn.portal.accessToken`, `tokenLength=311`)
- prerequisite: devops deploy patch R4 + dev-fe fix R4 submitted

## Scope Executed (runtime)

1. Browser runtime on live HTTPS attendance URL (after portal session established).
2. Captured `performance` resource fallback baseline (`127.0.0.1:54321/rest/v1/*`).
3. In-session probe: `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=5`.
4. Clicked **`Kiểm tra lại`** on attendance sync banner.
5. Re-checked fallback counts and re-ran attendance + impacted list probes (`employees`, `contracts`, `recruitment`, `payroll`).

## Runtime Results

### A) Attendance fallback-zero gate (mandatory)

| Checkpoint | `fallbackAllCount` | `fallbackAttendanceCount` | Verdict |
|------------|-------------------|---------------------------|---------|
| Before `Kiểm tra lại` | **8** | **7** | FAIL |
| After `Kiểm tra lại` | **8** | **8** | FAIL |

Matched localhost samples (unchanged pattern):

- `http://127.0.0.1:54321/rest/v1/departments?...company_id=eq.main...`
- `http://127.0.0.1:54321/rest/v1/attendance_sheets?...`
- `http://127.0.0.1:54321/rest/v1/work_shifts?...`
- `http://127.0.0.1:54321/rest/v1/attendance_rules?...`
- `http://127.0.0.1:54321/rest/v1/attendance_records?...attendance_date=eq.2026-05-28`
- `http://127.0.0.1:54321/rest/v1/leave_requests?...` (year + week ranges)

**Expected:** `fallbackAllCount = 0` and no `127.0.0.1:54321/rest/v1/*` traffic after retry.

**Verdict:** **FAIL** — R4 did not clear localhost Supabase fallback on attendance runtime.

### B) Attendance records probe (mandatory)

| When | HTTP | Code | Message |
|------|------|------|---------|
| Before retry | 200 | `HRM-ATT-200` | Attendance records listed |
| After retry | 200 | `HRM-ATT-200` | Attendance records listed |

**Verdict:** **PASS**

### C) UI sync banner (informational)

- Banner: `HRM API Sync CONNECTED` — `Đã kết nối HRM API. Có 0 danh mục đã sync từ XBOS.`
- No `HRM API Sync ERROR` on page after `Kiểm tra lại`.
- Attendance module UI rendered (Tổng quan, Chấm công, charts).

### D) Impacted HRM list auth/session (5 probes)

| Probe | HTTP | Code |
|-------|------|------|
| EMP-LIST | 200 | `HRM-EMP-200` |
| CON-LIST | 200 | `HRM-CON-200` |
| REC-LIST | 200 | `HRM-REC-200` |
| PAY-LIST | 200 | `HRM-PAY-200` |
| ATT-RECORDS | 200 | `HRM-ATT-200` |

**Verdict:** **PASS** (no `HRM-AUTH-001`).

## Overall QA Verdict

- **ack_status:** `FAIL_TO_PM`
- **Reason:** Mandatory fallback-zero gate still open (`fallbackAllCount=8` before and after `Kiểm tra lại`). Attendance records probe and auth/session probes are green, but residual **P1-EX-HTTPS-RESIDUAL-03** cannot close until localhost fallback traffic is eliminated.

## Delta vs R3

| Criterion | R3 | R4 |
|-----------|----|----|
| `fallbackAllCount` after retry | 8 | **8** (no improvement) |
| Attendance probe | 200 | 200 |
| Auth 5-list probes | 5/5 200 | 5/5 200 |
| Sync banner | (not recorded) | CONNECTED |

## completion_report

- **closed_scope:**
  - Executed live browser QA on requested HTTPS attendance URL with `ceo@xe.vn` portal session.
  - Verified attendance records probe **200** before and after `Kiểm tra lại`.
  - Verified impacted HRM list flows **5/5** HTTP 200 in-session.
- **residual:**
  - Localhost Supabase fallback persists (`fallbackAllCount=8`); R4 patch did not meet zero-fallback exit criterion.

## Handoff Packet

- **next_owner:** `dev-fe`
- **next_dispatch_prompt:** `Execute P1-EX-FE-BE-HTTPS-RESIDUAL-03-R5: on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main (ceo@xe.vn), eliminate ALL runtime requests to http://127.0.0.1:54321/rest/v1/* (departments, attendance_sheets, work_shifts, attendance_rules, attendance_records, leave_requests) so fallbackAllCount=0 before AND after clicking "Kiểm tra lại". Route attendance data through Nest /api/hrm/* only. Keep attendance/records and 5 impacted list probes at HTTP 200. Provide READY_FOR_QA with before/after resource counts and deploy evidence.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r4-20260528.md`
- **ack_status:** `FAIL_TO_PM`
