# PO-UC-TC-W4-FE-ATT-WORKSHIFT-UPDATE-LOOP-01

**work_item_id:** PO-UC-TC-W4-FE-ATT-WORKSHIFT-UPDATE-LOOP-01  
**role:** dev-fe  
**ack_status:** READY_FOR_QA  
**date:** 2026-08-04

## Symptom (before)

Browser console when opening HRM Attendance → tab Ca / settings:

```
Warning: Maximum update depth exceeded...
  at Attendance (Attendance.tsx:335)
  at useWorkShifts.ts:68 (setIsLoading)
  at useWorkShifts.ts:70 (setShifts)
```

## Root cause

`useWorkShifts.ts` defined `h = (key) => t(\`hk.workShift.${key}\`)` as a **new function every render**.  
`fetchShifts` `useCallback` depended on `h` → new callback every render →  
`useEffect(..., [fetchShifts, enabled])` re-ran indefinitely → `setIsLoading` / `setShifts` storm.

## Fix (after)

- Removed unstable `h` helper.
- Toast/error strings use stable `t('hk.workShift.*')` directly (same pattern as `useLeaveRequests.ts`).
- `fetchShifts` deps: `[currentCompanyId, toast, t]` only.
- CRUD / `bulkDeleteShifts` / `refetch` unchanged; i18n keys preserved.
- `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` appended on `useWorkShifts.ts`.

## Files touched

- `apps/web/hrm/src/hooks/useWorkShifts.ts`

## Automated verify

```bash
cd apps/web/hrm && pnpm test
```

Result: **630 passed / 1 failed** — failure is pre-existing `useEmployeePicker.test.ts` (Leave.tsx source string `CD-FB-07-LEAVE-CREATE-COMPANY-UUID`), unrelated to `useWorkShifts.ts`.

(No dedicated `useWorkShifts` unit test in package.)

## QA smoke (required — U65 browser-only, no seed)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login `ceo@xe.vn` / `Xevn@2026` | Portal OK |
| 2 | Navigate HRM → **Chấm công** (Attendance) | Page loads |
| 3 | Open tab **Ca làm việc** / ca settings | List loads; **no** "Maximum update depth" in console |
| 4 | DevTools Console | No repeated `setIsLoading`/`setShifts` storm |
| 5 | Optional: create/edit/delete one ca from UI | Toast i18n; list refetch after 2xx + F5 |

**J-***: Attendance embed journey per `PROGRAM_JOURNEY_MAP.md` (HRM attendance module).  
**Out of scope:** Vite HMR `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`.

## Residual

None for this work item. Other hooks with same `h` pattern (e.g. `useAttendanceRules`) not changed in this slice.

---

## QA verdict (PO-UC-TC-W4-QA-ATT-WORKSHIFT-LOOP-01)

**ack_status:** **PASS_TO_PM** · 2026-08-04 · commit dc930c5  
**Seat:** 🟢 loop AC (no Maximum update depth; 1× `work-shifts` GET; 0 storm in 5s idle; shifts table visible)  
**Optional CRUD/F5:** ⚪ not run (loop-only)  
**Detail:** `docs/qa/evidence/po-uc-tc-w4-qa-att-workshift-loop-01.md` · screenshot `docs/qa/evidence/screens/po-uc-tc-w4-qa-att-workshift-loop-01/shifts-list-tab.png`
