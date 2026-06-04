# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R2

- work_item_id: `P1-EX-QA-HTTPS-RESIDUAL-03-R2`
- from_role: `pm`
- to_role: `qa`
- execution_time_local: `2026-05-28 (UTC+7)`
- runtime_url: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
- account: `ceo@xe.vn`
- related_ready_for_qa_evidence:
  - `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r2-20260528.md`
  - `docs/ops/evidence/p1-ex-do-https-l25-data-seed-01-20260528.md`

## Scope Executed (runtime, no prep-only)

1. Opened live HTTPS runtime page:
   - `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
2. Captured baseline fallback traffic count from browser runtime resources.
3. Executed in-session attendance probe:
   - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`
4. Clicked `Kiểm tra lại` and re-checked fallback traffic count.
5. Ran scripted L2.5 journey recheck on same perimeter:
   - `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs`

## Runtime Results

### A) Attendance fallback gate (`127.0.0.1:54321/rest/v1/*`)

- Before click `Kiểm tra lại`:
  - `fallbackAllCount = 8`
  - Sample matched resources:
    - `/rest/v1/departments`
    - `/rest/v1/attendance_sheets`
    - `/rest/v1/work_shifts`
    - `/rest/v1/attendance_rules`
    - `/rest/v1/attendance_records`
    - `/rest/v1/leave_requests`
- After click `Kiểm tra lại`:
  - `fallbackAllCount = 8`
  - Same localhost fallback pattern remains present.

Verdict for criterion #2: **FAIL** (expected `fallbackAllCount = 0` and no localhost fallback traffic).

### B) In-session attendance probe

- Endpoint:
  - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`
- Result:
  - HTTP `200`
  - code: `HRM-ATT-200`

Verdict for criterion #3: **PASS**.

### C) L2.5 list->detail executable journeys (seeded data)

Probe command result:

- `J-HRM-01` PASS
- `J-HRM-02` PASS
- `J-HRM-03` PASS
- `J-HRM-04` PASS
- `J-HRM-05` PASS
- `J-HRM-06` PASS
- `J-HRM-07` PASS
- Summary: `L2.5 journeys 7/7 PASS`

Verdict for criterion #4: **PASS** (journeys remain executable with seeded data).

## Overall QA Verdict

- `ack_status: FAIL_TO_PM`
- Reason:
  - Residual gate is still open because attendance runtime continues to emit fallback requests to `127.0.0.1:54321/rest/v1/*` before and after `Kiểm tra lại`.
  - Although attendance API probe is now `200` and L2.5 journeys are executable, criterion #2 is mandatory and unmet.

## completion_report

- closed_scope:
  - Re-ran requested live runtime retest on target HTTPS attendance page with `ceo@xe.vn`.
  - Confirmed attendance API probe now returns `200 HRM-ATT-200`.
  - Confirmed L2.5 `J-HRM-01..07` remains executable (`7/7 PASS`) with seeded data.
- residual:
  - `fallbackAllCount` remains `8` both before and after clicking `Kiểm tra lại`.
  - Localhost fallback traffic `127.0.0.1:54321/rest/v1/*` still exists in runtime resource entries.

## Handoff Packet

- next_owner: `dev-fe`
- next_dispatch_prompt: `Please execute residual_auto_fix for work_item_id P1-EX-FE-BE-HTTPS-RESIDUAL-03-R3 on apps/web/hrm attendance runtime. Reproduce at https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn and remove all remaining localhost fallback requests (127.0.0.1:54321/rest/v1/*) in portal /hr mode, including after clicking "Kiểm tra lại". Keep /api/hrm/attendance/records?company_id=main&page=1&page_size=10 at 200 HRM-ATT-200, add/extend regression tests proving fallbackAllCount=0 behavior in portal mode, then provide READY_FOR_QA evidence with exact runtime probe outputs.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-residual-03-r2-20260528.md`
- ack_status: `FAIL_TO_PM`
