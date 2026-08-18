# D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01 — Dev-FE evidence (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P0 business (sponsor) · escalates soft `R-ATT-WEEKLY-EMPTY-SPINNER` |
| **coded_at** | 2026-07-21 |
| **spec_ref** | `docs/hrm/SRS.md` UC-HRM-23 · attendance sheets TechSpec |
| **U65** | zero-seed · no fake sheet rows · no Phase1/PROD |

---

## Symptom (sponsor / QA soft)

Create / open sheet «Bảng chấm công từ 01/07/2026 đến 31/07/2026 (Công chuẩn)» → **no usable grid** + UI appears to **auto-trigger «Tải lại»** (spinner forever). May be **0 console errors** — still FAIL business. Soft residual from `d-qa-sync-8088-console-fix-01-20260721.md`.

URL retest: `http://14.225.217.232:8088` (prefer after sync) · local `/hr/attendance`.

---

## Root cause

1. **Fetch thrash (P0):** `Attendance.tsx` passed an **inline** `sheet: { start_date, end_date, name }` into `useWeeklyAttendanceSummary` every render → `useMemo([sheet])` + `useCallback` + `useEffect(() => fetch())` re-fired continuously → `isLoading` / Reload button `animate-spin` looked like auto-reload.
2. **Empty despite records 200 (soft class):** `resolveWeeklyDateRange` set API `from`/`to` to **full month** but grid columns to **first 7 days only** → mid-month punches never entered cells → `Tổng số: 0` while Network 200.

Not caused by `HrmApiSyncBanner` «Kiểm tra lại» (manual only) or RQ `refetchInterval` (sheets already had `refetchOnWindowFocus: false`).

---

## Fix (FE)

| File | Change |
|------|--------|
| `hooks/useWeeklyAttendanceSummary.ts` | **React Query** singleflight (`WEEKLY_ATTENDANCE_QUERY_KEY` + range); primitive `sheetStart`/`sheetEnd`; memoized aggregate; **no** `useEffect` fetch; spinner = initial load only; refetch manual |
| `pages/Attendance.tsx` | `useMemo` `weeklySheetContext`; Reload uses `isFetching`; settled empty / `loadError` row (no forever spinner) |
| `lib/attendanceDashboardAggregator.ts` | Prefer **current week clipped** into sheet period; align `from`/`to` with displayed days; keep Invalid-date guards / `formatDisplayDate` |

**Cấm respected:** no seed · no fake FE rows without API.

---

## BE handoff note (non-blocking for FE storm)

| Observation | Owner |
|-------------|--------|
| Creating an attendance **sheet** only persists metadata (`POST …/attendance-sheets`). It does **not** generate employee day rows. Empty grid after create with `GET …/attendance/records` → **200 `data: []`** is contract-correct until punches / generate-sheet API exists. | product / **dev-be** if SRS requires auto-roster on create |
| FE stops reload storm either way and shows settled empty-state or rows from records. | closed FE |

Network evidence for QA: after open sheet, expect **≤1–2** `GET /api/hrm/attendance/records?…from_date=&to_date=` (not continuous poll). Manual «Tải lại» may add one more.

---

## Tests

```text
pnpm exec vitest run \
  src/hooks/useWeeklyAttendanceSummary.test.ts \
  src/lib/attendanceDashboardAggregator.test.ts \
  src/hooks/d-hrm-att-leave-fetch-storm.test.ts
→ Test Files 3 passed · Tests 20 passed
```

---

## QA retest AC (browser · U65)

1. Login `ceo@xe.vn` → Chấm công → sheets.
2. Create or open «…01/07/2026 đến 31/07/2026 (Công chuẩn)».
3. Weekly view settles (**spinner stops**); «Tải lại» spins **only** on click.
4. If records exist for current week in period → employee rows; else clear empty copy (not spinner forever).
5. Dates stay `dd/MM/yyyy` via `formatDisplayDate` — **no** Invalid time.
6. Network: no records GET storm while idle on weekly view.
7. Console P0: 0 required (business AC still holds with 0 errors).

---

## Handoff

- **completion_report:** Closed FE reload loop + week window align for July sheet weekly grid. Settled empty-state when API empty. BE auto-roster on create still optional residual (document only). Vitest 20 PASS.
- **next_owner:** `qa`
- **ack_status:** **READY_FOR_QA**
- **evidence_path:** `docs/qa/evidence/d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01
from_role: pm
to_role: qa
lane: execution
priority: P0
residual_auto_fix: true
entry_criteria: FE READY_FOR_QA docs/qa/evidence/d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md; URL http://14.225.217.232:8088 preferred (sync FE first if needed); U65 zero-seed; persona ceo@xe.vn
exit_criteria: Browser — open/create Jul 2026 standard sheet → weekly grid settles (no forever spinner); «Tải lại» only on click; empty-state OR employee rows from records; ≤1–2 idle records GETs (no storm); no Invalid time; evidence docs/qa/evidence/d-hrm-att-sheet-empty-reload-loop-01-qa-20260721.md; ack_status PASS_TO_PM or FAIL with Network count
cấm: seed · fake sheet rows · Phase1/PROD
spec_ref: docs/hrm/SRS.md UC-HRM-23
```
