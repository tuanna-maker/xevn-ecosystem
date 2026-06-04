# Dev-FE Evidence — P1-EX-FE-BE-HTTPS-RESIDUAL-03-R5

- work_item_id: `P1-EX-FE-BE-HTTPS-RESIDUAL-03-R5`
- from_role: `dev-fe`
- to_role: `qa`
- execution_time_local: `2026-05-28 (UTC+7)`
- target_runtime: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
- input_evidence: `docs/qa/evidence/p1-ex-qa-https-residual-03-r4-20260528.md` (FAIL — `fallbackAllCount=8`)

## Root Cause (R5)

QA R4 proved route-level `isHrmApiDataMode()` guards in source were insufficient on the **deployed** pilot bundle: eight `127.0.0.1:54321/rest/v1/*` requests still fired on attendance load/retry while Nest `/api/hrm/attendance/*` stayed healthy.

Contributing factors:

1. Pilot FE build ships `VITE_SUPABASE_URL=http://127.0.0.1:54321` for local dev parity — remote browsers must never call that host.
2. Attendance hooks could still reach Supabase if any guard evaluated false during hydration.
3. `AttendanceExportDialog` called Supabase directly (export path).

## Implementation (FE)

### 1) Remote localhost misconfig guard

- File: `apps/web/hrm/src/lib/hrmDataMode.ts`
- Added `isRemoteLocalhostSupabaseMisconfig()` — when `window.location.hostname` is not localhost **and** `VITE_SUPABASE_URL` points to `127.0.0.1` / `localhost`, `shouldSkipSupabaseDataFetches()` returns **true** immediately.

### 2) Supabase REST hard block at client boundary

- Files:
  - `apps/web/hrm/src/integrations/supabase/supabaseRestGuard.ts` (new)
  - `apps/web/hrm/src/integrations/supabase/client.ts`
- Wrapped `supabase.from()` — when blocked, returns a no-op PostgREST builder (empty data, **no `fetch`**).

### 3) Attendance hooks aligned to skip guard

- Switched attendance-adjacent hooks from `isHrmApiDataMode()` to `shouldSkipSupabaseDataFetches()`:
  - `useDepartments`, `useWorkShifts`, `useAttendanceRules`, `useAttendanceSheets`
  - `useLeaveRequests`, `useLeaveRequestsData`, `useAttendanceOverview`, `useAttendanceReports`
- `useLeaveRequests` update/delete now respect skip guard.

### 4) Export dialog → Nest API

- File: `apps/web/hrm/src/components/attendance/AttendanceExportDialog.tsx`
- Monthly export uses `listAttendanceRecords` (`/api/hrm/attendance/records`) instead of Supabase REST.

## Test Evidence

```bash
pnpm vitest run src/lib/hrmDataMode.test.ts src/integrations/supabase/supabaseRestGuard.test.ts src/integrations/supabase/client.restGuard.test.ts src/hooks/useAttendanceSheets.test.ts
```

Result:

- `18/18` tests PASS (includes remote-host block + client `from()` emits zero `fetch`)
- Exit code: `0`

```bash
pnpm run build
```

Result: HRM web build PASS (exit `0`).

## QA Retest Script (mandatory)

URL: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main` · account `ceo@xe.vn`

Before and after clicking **Kiểm tra lại**:

```javascript
const resources = performance.getEntriesByType("resource").map((r) => r.name);
const fallbackHits = resources.filter((u) => u.includes("127.0.0.1:54321/rest/v1/"));
({ fallbackAllCount: fallbackHits.length, fallbackSample: fallbackHits.slice(-10) });
```

**PASS when:** `fallbackAllCount === 0` both times; no `departments|attendance_sheets|work_shifts|attendance_rules|attendance_records|leave_requests` on `127.0.0.1:54321`.

Attendance probe (in-session):

```javascript
const access = localStorage.getItem("xevn_access_token") || "";
const portal = localStorage.getItem("xevn_portal_access_token") || access;
const r = await fetch("/api/hrm/attendance/records?company_id=main&page=1&page_size=10", {
  headers: { "x-access-token": access, "x-portal-access-token": portal },
  credentials: "include",
});
const body = await r.json().catch(() => ({}));
({ status: r.status, code: body?.error?.code || body?.code });
```

**PASS when:** `status === 200` and code `HRM-ATT-200` (or equivalent success).

## completion_report

- **closed_scope:**
  - Eliminated attendance-runtime Supabase REST at two layers (data-mode guard + client `from()` wrapper).
  - Routed export + existing overview/leave/records hooks through Nest skip path consistently.
  - Regression tests lock remote HTTPS + zero-network blocked REST behavior.
- **residual:**
  - Live `fallbackAllCount=0` proof requires QA on **deployed** FE bundle after DevOps deploy of this patch.

## Handoff Packet

- **next_owner:** `qa`
- **next_dispatch_prompt:** `Execute QA for work_item_id P1-EX-QA-HTTPS-RESIDUAL-03-R5 on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main with ceo@xe.vn after FE deploy per docs/qa/evidence/p1-ex-fe-be-https-residual-03-r5-20260528.md. Verify (1) fallbackAllCount=0 before and after "Kiểm tra lại" with zero 127.0.0.1:54321/rest/v1/* resources; (2) GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10 returns 200 HRM-ATT-200 in-session. Publish PASS/FAIL verdict with console resource excerpts.`
- **evidence_path:** `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r5-20260528.md`
- **ack_status:** `READY_FOR_QA`
