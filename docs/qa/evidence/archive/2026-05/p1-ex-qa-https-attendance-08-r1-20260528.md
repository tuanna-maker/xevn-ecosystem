# P1-EX-QA-HTTPS-ATTENDANCE-08-R1 - Runtime retest (HTTPS attendance)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-ATTENDANCE-08-R1` |
| from_role | `pm` |
| to_role | `qa` |
| date | `2026-05-28` |
| base_url | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| target_url | `/command-center/hrm/attendance?portal=1&companyId=main` |
| runtime_url | `/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| entry_criteria | previous attempt `FAIL_TO_PM` due interrupted runtime retest |
| ack_status | **FAIL_TO_PM** |

---

## Executive verdict

Retest remains **FAIL_TO_PM**.

- **Load/UI state:** Attendance page loads and shows `HRM API Sync CONNECTED`.
- **API state:** Core attendance endpoints are reachable (`records 200`, `leave-requests 200`, `catalog-sync/status 200`).
- **Blocking defect:** Runtime still triggers **Supabase fallback** calls on `127.0.0.1:54321`, including `attendance_rules`.
- **Regression note:** `attendance/update-requests` currently returns `400 HRM-VAL-001` for the tested query shape, needs BE/FE contract alignment review.

Because the wave requirement explicitly says **no Supabase attendance_rules fallback**, this wave cannot be promoted to QC.

---

## Runtime evidence (browser/CDP)

### 1) Command Center route + scope params

- URL loaded: `https://14-225-217-232.nip.io/command-center/hrm/attendance?portal=1&companyId=main`
- Page shell confirms iframe source:
  - `https://14-225-217-232.nip.io/hr/attendance?portal=1&tenantId=xevn&companyId=main`
- Session storage contains portal auth keys (`xevn.portal.accessToken`, tenant/company scope keys).

### 2) Attendance module load/state

- Runtime page: `https://14-225-217-232.nip.io/hr/attendance?portal=1&tenantId=xevn&companyId=main`
- Page title: `UNICOM HRM - Hệ thống quản lý nhân sự`
- Snapshot shows attendance dashboard rendered with controls and charts.
- Screenshot captured with visible banner:
  - `HRM API Sync CONNECTED`
  - `Đã kết nối HRM API. Có 0 danh mục đã sync từ XBOS.`

### 3) Attendance API probe (in-browser fetch with CEO token)

| Endpoint | HTTP | Code | Result |
|---|---:|---|---|
| `/api/hrm/attendance/records?company_id=main&page_size=100` | 200 | `HRM-ATT-200` | PASS |
| `/api/hrm/attendance/leave-requests?company_id=main&page_size=50` | 200 | `HRM-LEAVE-200` | PASS |
| `/api/hrm/catalog-sync/status?company_id=main` | 200 | `HRM-SYNC-203` | PASS |
| `/api/hrm/attendance/update-requests?company_id=main&page_size=50` | 400 | `HRM-VAL-001` | FAIL (contract/query validation mismatch) |

### 4) Supabase fallback detection (blocking)

CDP resource capture shows Supabase/local REST calls from attendance runtime:

- `http://127.0.0.1:54321/rest/v1/attendance_rules?select=*&company_id=eq.main`
- `http://127.0.0.1:54321/rest/v1/attendance_records?...`
- `http://127.0.0.1:54321/rest/v1/leave_requests?...`
- `http://127.0.0.1:54321/rest/v1/departments?...`
- `http://127.0.0.1:54321/rest/v1/work_shifts?...`

Observed fallback count in runtime resources: **11** hits matching `127.0.0.1:54321` / `supabase` / `attendance_rules`.

This violates exit requirement: **no Supabase attendance_rules fallback**.

---

## Gate decision

| Criterion | Expected | Actual | Verdict |
|---|---|---|---|
| HTTPS attendance route load | Load with `?portal=1&companyId=main` | Loads and renders | PASS |
| State banner | No sync error regression | `HRM API Sync CONNECTED` | PASS |
| API health | Attendance API path stable | Mixed (3 pass, 1 fail 400) | FAIL |
| No Supabase fallback | No `127.0.0.1:54321` attendance fallback | `attendance_rules` + other Supabase calls observed | **FAIL (blocker)** |
| Console/runtime safety | No fallback-related runtime degradation | Fallback pattern still active (risk of local refusal path) | FAIL |

Final gate: **FAIL_TO_PM** (not `READY_FOR_QC`).

---

## completion_report

- Closed scope:
  - Re-ran full runtime retest for HTTPS attendance with required account and query parameters.
  - Verified load/state/API behavior under live browser session.
  - Captured definitive fallback evidence for `attendance_rules` path.
- Residual/blockers:
  - Supabase fallback remains active in attendance runtime (`127.0.0.1:54321`), including `attendance_rules`.
  - `attendance/update-requests` query path returns `400 HRM-VAL-001` under tested URL shape.

## next_owner

`dev-fe` (primary), with `dev-be` support for attendance update-requests contract check.

## next_dispatch_prompt

```text
work_item_id: P1-EX-FE-BE-HTTPS-ATTENDANCE-08-R4
from_role: pm
to_role: dev-fe
cc_role: dev-be
ack_status target: READY_FOR_QA

Context:
QA retest FAIL on HTTPS attendance runtime:
- docs/qa/evidence/p1-ex-qa-https-attendance-08-r1-20260528.md
- URL: /command-center/hrm/attendance?portal=1&companyId=main (ceo@xe.vn)

Blocking findings:
1) Attendance runtime still calls Supabase/local REST fallback:
   - http://127.0.0.1:54321/rest/v1/attendance_rules?...
   - plus attendance_records/leave_requests/departments/work_shifts
2) /api/hrm/attendance/update-requests?company_id=main&page_size=50 returns 400 HRM-VAL-001.

Required fixes:
1) Remove/disable Supabase fallback for attendance runtime in portal mode; force Nest API path only.
2) Ensure attendance_rules data source no longer depends on 127.0.0.1:54321 in HTTPS pilot runtime.
3) Align FE query params with BE DTO for update-requests (or update DTO safely) so list endpoint returns 200 for intended list query.
4) Provide regression evidence for:
   - /api/hrm/attendance/records
   - /api/hrm/attendance/update-requests
   - /api/hrm/attendance/leave-requests
   - no 127.0.0.1:54321 resource hits on attendance page.

Exit criteria:
- QA rerun on same URL/account shows no Supabase fallback hits and API list endpoints return expected statuses.
- Handoff with evidence and ack_status READY_FOR_QA.
```

## evidence_path

`docs/qa/evidence/p1-ex-qa-https-attendance-08-r1-20260528.md`
