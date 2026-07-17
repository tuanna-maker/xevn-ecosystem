# D-HRM-ATT-LEAVE-FETCH-STORM — FE fix evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HRM-ATT-LEAVE-FETCH-STORM` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **from** | QA FAIL `docs/qa/evidence/p1-hrm-menu-attendance-20260717.md` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed (no seed used) |

---

## Root cause

`useLeaveRequests` and `useAttendanceSheets` put an inline `h = (key) => t(...)` (and `toast`/`t`) inside `useCallback` deps for the list fetcher. Every render created a new `h` → new `fetch*` identity → `useEffect([fetch*])` re-ran → abort/refetch storm → `RATE-429` → UI «Không thể tải danh sách đơn nghỉ phép»; Network showed `attendance-sheets` ×N and dozens of `leave-requests`.

## Fix

| Hook | Change |
|------|--------|
| `useLeaveRequests` | React Query `LEAVE_REQUESTS_QUERY_KEY` + stable `[companyId, status]`; `refetchOnWindowFocus: false`; `retry: 1`; error toast once via ref (not in queryKey/deps loop) |
| `useAttendanceSheets` | React Query `ATTENDANCE_SHEETS_QUERY_KEY` + stable `[companyId]`; same RQ guards; `enabled` gate preserved |
| `useLeaveRequestsData` | Shares same leave queryKey (Dashboard ↔ LeaveTab singleflight) |

No AbortController on every dep change — RQ cancels in-flight only on unmount / key change.

## Files

- `apps/web/hrm/src/hooks/useLeaveRequests.ts`
- `apps/web/hrm/src/hooks/useAttendanceSheets.ts`
- `apps/web/hrm/src/hooks/useLeaveRequestsData.ts`
- `apps/web/hrm/src/hooks/d-hrm-att-leave-fetch-storm.test.ts`
- `apps/web/hrm/src/hooks/useLeaveRequests.test.ts` / `useAttendanceSheets.test.ts` / `useLeaveRequestsData.test.ts`

## Tests

```text
pnpm exec vitest run src/hooks/d-hrm-att-leave-fetch-storm.test.ts \
  src/hooks/useLeaveRequests.test.ts \
  src/hooks/useLeaveRequestsData.test.ts \
  src/hooks/useAttendanceSheets.test.ts
→ Test Files  4 passed (4)
→ Tests      11 passed (11)
```

## QA retest (browser — U65)

| Check | Pass when |
|-------|-----------|
| Login `ceo@xe.vn` → `/command-center/hrm/attendance` → tab **Nghỉ phép** | List loads; no RATE-429 banner |
| Network `GET .../leave-requests?company_id=main` | ≤2 in-flight (ideally 1); no AbortError storm |
| Tab **Chấm công** → sheets submenu | `attendance-sheets` not ×N (≤2) |
| Console | No repeated `Error fetching leave requests: RATE-429` |
| L2.5 J-HRM-06 | Leave row → employee profile without 429 |

**cấm:** seed.

## Residual

- Other attendance hooks (`useWorkShifts`, `useOvertimeRequests`, …) still use the same `h`+deps anti-pattern — out of this work_item scope; open follow-up if QA sees storms on those tabs.
- Live browser verify on `:8088` deferred to QA (this wave = unit + structural proof).

## Handoff

- `next_owner`: qa
- `ack_status`: READY_FOR_QA
