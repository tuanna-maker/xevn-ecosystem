# Dev-FE Evidence — P1-EX-FE-BE-HTTPS-RESIDUAL-03-R4

- work_item_id: `P1-EX-FE-BE-HTTPS-RESIDUAL-03-R4`
- from_role: `dev-fe`
- to_role: `qa`
- execution_time_local: `2026-05-28 (UTC+7)`
- scope: attendance runtime residual closure for HTTPS portal path hardening

## Entry Criteria Consumed

- Reviewed latest attendance residual QA evidence showing strict gate failure:
  - fallback traffic still present (`127.0.0.1:54321/rest/v1/*`)
  - runtime attendance probe still observed `401` in QA run
- Confirmed PM dispatch requests concrete owner action for R4 closure wave.

## Root Cause Analysis (R4)

- Existing attendance hard guard in `hrmDataMode` only matched:
  - `/attendance`
  - `/attendance/*`
- Runtime can execute attendance module on nested paths (for example proxy/shell routes), where this exact-prefix guard may not match early enough.
- When guard does not match, attendance-adjacent hooks can still execute Supabase fetch branches (`departments`, `work_shifts`, `attendance_rules`, `attendance_sheets`, `leave_requests`) before portal/session context is fully hydrated.

## Implementation (FE)

1. Hardened attendance runtime path detection in `apps/web/hrm/src/lib/hrmDataMode.ts`:
   - Replaced strict prefix-only check with path-segment detection (`segments.includes('attendance')`).
   - Effect: nested routes such as `/hr/attendance` and `/command-center/hrm/attendance` are treated as API-only attendance runtime.
2. Added regression in `apps/web/hrm/src/lib/hrmDataMode.test.ts`:
   - New test: `forces true for nested attendance runtime path`.
   - Verifies `isHrmApiDataMode()` and `shouldSkipSupabaseDataFetches()` both remain `true` on `/command-center/hrm/attendance` even when `VITE_HRM_USE_API=false`.

## Test Evidence

Command executed:

```bash
pnpm vitest run src/lib/hrmDataMode.test.ts
```

Observed result:

- `1` test file passed
- `12/12` tests passed
- Exit code: `0`

## completion_report

- closed_scope:
  - Closed FE attendance path-matching gap that could allow localhost fallback on nested attendance routes.
  - Added deterministic regression coverage for nested attendance runtime routing.
  - Verified targeted test suite pass.
- residual:
  - Runtime HTTPS validation is still required by QA for:
    - `fallbackAllCount=0` before/after retry
    - in-session attendance records probe returning non-401 (expected 200)
  - No BE code change was required in this wave; keep BE on standby if QA still captures auth instability after FE route hardening.

## Handoff Packet

- next_owner: `qa`
- next_dispatch_prompt: `Execute QA rerun for work_item_id P1-EX-QA-HTTPS-RESIDUAL-03-R4 on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn. Validate two strict gates: (1) performance resource entries show fallbackAllCount=0 with no 127.0.0.1:54321/rest/v1/* before and after clicking "Kiểm tra lại"; (2) in-session GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10 returns 200. Publish evidence with console/http excerpts and PASS/FAIL verdict.`
- evidence_path: `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r4-20260528.md`
- ack_status: `READY_FOR_QA`
