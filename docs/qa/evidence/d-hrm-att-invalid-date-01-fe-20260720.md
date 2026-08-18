# D-HRM-ATT-INVALID-DATE-01 — FE evidence (2026-07-20)

**work_item_id:** `D-HRM-ATT-INVALID-DATE-01`  
**from_role:** dev-fe  
**to_role:** qa  
**ack_status:** READY_FOR_QA  
**spec_ref:** `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` · prior `D-HRM-EMP-SALARY-INVALID-DATE-01`  
**U65:** no seed

## Symptom (sponsor)

```
Uncaught RangeError: Invalid time value
  at format (...)
  at renderWeeklyAttendance (Attendance.tsx:~1926)
URL: http://14.225.217.232:8088/hr/... Attendance (Chấm công weekly)
```

Root cause: `date-fns` `format(new Date(\`${weeklyRange.from}T00:00:00\`))` when `from`/`to` (or sheet period) is null/garbage/`MM/yyyy` → Invalid Date → white crash. Same class as EmployeeSalary `period_label`.

## Fix (display-only — no attendance calc change)

| Area | Change |
|------|--------|
| `attendanceDashboardAggregator.ts` | `formatWeeklyRangeTitleLabels` / `formatWeeklyRangeSubtitle` via `formatDisplayDate`; `resolveWeeklyDateRange` falls back to current week on bad sheet dates; `buildWeeklyDayHeaderFallback` skips Invalid Date; table `attendance_date` via `formatDisplayDate` |
| `Attendance.tsx` `renderWeeklyAttendance` | Uses safe title labels + header fallback (no raw `format(new Date(...))`) |
| Sheets list period | `formatDisplayDate(start/end)` instead of `toLocaleDateString` on raw API |
| Leave Calendar buttons | `formatSafeCalendarDate` (`isValid` gate) |

## Verify

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/attendanceDashboardAggregator.test.ts --reporter=dot
```

**Result:** 10 passed (5 regression + 5 invalid-date suite) — 2026-07-20.

## QA browser AC (U65 · FE-only)

1. Login `ceo@xe.vn` / `Xevn@2026` on `:8088` (or local portal HRM embed).
2. Menu **Chấm công** → open a sheet / weekly view (`attendanceViewMode=weekly`).
3. **PASS:** page must NOT white-crash; no console `RangeError: Invalid time value`.
4. Title/subtitle dates show `dd/MM/yyyy` or `—` for bad values — never throw.
5. Optional: sheets list period column shows safe labels.

## Residual

- None for crash class. Browser L2.5 on `:8088` not run in this FE lane (handoff QA).
- Out of scope: attendance business calc, seed, Phase1/PROD claim.

## Files

- `apps/web/hrm/src/lib/attendanceDashboardAggregator.ts`
- `apps/web/hrm/src/lib/attendanceDashboardAggregator.test.ts`
- `apps/web/hrm/src/pages/Attendance.tsx`

## next_dispatch_prompt

```
work_item_id: D-HRM-ATT-INVALID-DATE-01
from_role: pm
to_role: qa
entry_criteria: FE READY_FOR_QA; evidence docs/qa/evidence/d-hrm-att-invalid-date-01-fe-20260720.md; U65 zero-seed
exit_criteria: Browser Chấm công weekly on :8088 — no white-crash, no Invalid time value; matrix note; PASS_TO_PM or FAIL with console stack
cấm: seed · Phase1/PROD · reopen salary Invalid time without retest
```
