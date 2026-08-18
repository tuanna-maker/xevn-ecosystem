# PO-MFD-M2-ATT-OVERVIEW-01 — Overview time filter (year wire + honesty)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-OVERVIEW-01` |
| **role** | dev-fe |
| **date** | 2026-08-04 |
| **change_mode** | FIX |
| **preserve_default** | true |
| **u65_zero_seed** | true |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | qa |
| **Attendance CLOSED** | **false** — slice only; not uat_done |

---

## spec_read_ack

| Artifact | Read |
|----------|------|
| **srs** | `docs/hrm/SRS.md` — no dedicated FR for overview day/week/month grain; dashboard pulse / attendance ops referenced via matrix C1 |
| **backlog** | `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md` P1-1 — pass `overviewTimeFilter` to API **or** display-only SPEC_GAP |
| **enterprise map** | `HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` C1 — time filter local-only PARTIAL; recommend WIRE year or honesty |
| **matrix** | rows ~1, 4, 5 (C1 overview filter / late list / balance surface) |
| **tech_spec / DTO** | Nest `AttendanceOverviewQueryDto` — **`company_id` + optional `year` only** (no period/from/to) |
| **fe** | `Attendance.tsx` `renderOverview` · `useAttendanceOverview` · `fetchAttendanceOverview` |
| **sponsor_confirm** | PM dispatch 2026-08-04 · bus `pm -> dev-fe \| DISPATCHED PO-MFD-M2-ATT-OVERVIEW-01` |
| **uc_ids** | Overview UC **UNMAPPED** in by-uc pack (ba residual) |
| **change_mode** | FIX |

### spec says / code did (before)

| Spec / contract | Before FE |
|-----------------|-----------|
| Nest overview query = `year` optional | Hook supported `year` but page passed `undefined` |
| UI Select day/week/month/… | Local `overviewTimeFilter` — **never** sent to API (fake filter) |

---

## Decision (fail-closed)

1. **API supports:** `year` only → **WIRE** Select `this-year` / `last-year` → `resolveOverviewApiYear` → `useAttendanceOverview(year)` → GET `?year=`.
2. **API does NOT support:** day/week/month/quarter/custom → **removed** from Select; honesty label «chỉ hiển thị theo năm» + `OVERVIEW_PERIOD_SPEC_GAP` for **ba-process**.
3. **Do not fake** period query params.

---

## Fix (FE)

| Item | Detail |
|------|--------|
| Helper | `lib/attendanceOverviewTimeFilter.ts` — year map + SPEC_GAP constant + unsupported list |
| Hook | `useAttendanceOverview` — expose `error`, `year`; clear error on retry |
| Page | Overview Select year-only; `data-testid` honesty/loading/error/retry; Customize disabled (no API) |
| CODE-MEMORY | APPEND on Attendance.tsx, helper, hook |

## must_keep (regression)

| Path | Status |
|------|--------|
| CLOCK / SHEETS / LEAVE / OT / REQUESTS / REPORTS | untouched |
| RECORDS edit (R3 GWC) | untouched |
| SETTINGS-EMP Refresh/Import | untouched |
| No seed | yes |

---

## Residual (ba-process — SPEC_GAP)

| id | Note |
|----|------|
| `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` | Need FR + Nest `period`/`from`/`to` (or product hide) for day/week/month/quarter filters. Year grain is LIVE via query. |
| Charts FR | P2-1 `PO-MFD-M2-ATT-OVERVIEW-CHARTS-01` — out of this slice |

---

## Verify

```text
cd apps/web/hrm
pnpm exec vitest run \
  src/lib/__tests__/attendanceOverviewTimeFilter.test.ts \
  src/hooks/useAttendanceOverview.test.ts \
  src/pages/__tests__/attendanceOverviewYearFilter.source.test.ts
```

**Result:** 3 files · **7/7 PASS** (2026-08-04).

---

## QA browser AC (U65 · zero-seed)

`work_item_id`: `PO-MFD-M2-ATT-OVERVIEW-01-QA`

1. Login persona with Attendance (e.g. `ceo@xe.vn` / OU member) → Chấm công → **Tổng quan**.
2. Assert `overview-year-filter-honesty` visible (năm / không claim ngày-tuần-tháng API).
3. Network: GET `/api/hrm/attendance/overview?company_id=…&year=<current>` **2xx**.
4. Switch **Năm trước** → GET refetch with `year=current-1`; loading then cards update or empty honest.
5. No Select options today/this-week/this-month/custom.
6. Force fail (optional): stop hrm-api → error Alert + Thử lại.
7. **Do not** claim Attendance CLOSED / matrix uat_done.

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-OVERVIEW-01-QA
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true

entry_criteria:
  - FE READY_FOR_QA evidence: docs/qa/evidence/po-mfd-m2-att-overview-01-fe.md
  - L0 stack up (hrm-api + portal)
  - browser-only; cấm seed

AC:
  1. Tổng quan shows year filter + honesty «theo năm» (testid overview-year-filter-honesty)
  2. GET overview includes year=; switching last-year refetches year-1
  3. No fake day/week/month Select; loading/empty/error paths honest
  4. must_keep: RECORDS edit / SETTINGS-EMP / CLOCK/SHEETS/LEAVE/OT/REQUESTS/REPORTS no regression
  5. NOT Attendance CLOSED · uat_done false

exit_criteria:
  - evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qa.md
  - ack_status PASS_TO_PM or FAIL with residual
  - residual SPEC_GAP period grain → ba-process if product still needs day/week/month FR

hdsd_align: Chấm công → Tổng quan · filter năm
```

---

## Files

- `apps/web/hrm/src/lib/attendanceOverviewTimeFilter.ts` (new)
- `apps/web/hrm/src/lib/__tests__/attendanceOverviewTimeFilter.test.ts` (new)
- `apps/web/hrm/src/hooks/useAttendanceOverview.ts`
- `apps/web/hrm/src/hooks/useAttendanceOverview.test.ts`
- `apps/web/hrm/src/pages/Attendance.tsx`
- `apps/web/hrm/src/pages/__tests__/attendanceOverviewYearFilter.source.test.ts` (new)
