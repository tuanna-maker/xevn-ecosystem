/**
 * @CODE-MEMORY
 * Screen:     /attendance → Tổng quan — lọc thời gian
 * UC:         UNMAPPED overview period (matrix C1 #1) · FR gap → ba-process
 * BR:         Fail-closed — không fake day/week/month khi Nest không có query
 * SRS:        docs/hrm/SRS.md (overview dashboard pulse) · matrix C1
 * TechSpec:   AttendanceOverviewQueryDto — company_id + year only
 * Purpose:    Map UI năm → query `year`; ghi SPEC_GAP ngày/tuần/tháng/quý.
 * WorkItem:   PO-MFD-M2-ATT-OVERVIEW-01
 * Coded:      2026-08-04
 * Callers:    Attendance.tsx renderOverview · useAttendanceOverview(year)
 * Callees:    GET /api/hrm/attendance/overview?company_id&year
 * must_keep:  Không invent period/from/to; CLOCK/SHEETS/LEAVE/OT/REQUESTS/REPORTS/RECORDS không đụng
 * SOLID:      Pure map tách khỏi page — testable không mount Attendance
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-OVERVIEW-01
 * change_mode: FIX
 * What: Helper resolveOverviewApiYear + SPEC_GAP note; thay Select day/week giả
 * Why: overviewTimeFilter local-only PARTIAL · ENTERPRISE_API_MAP C1
 */

/** Nest `AttendanceOverviewQueryDto` — only optional period grain is calendar year. */
export type OverviewYearFilter = 'this-year' | 'last-year';

export const OVERVIEW_PERIOD_SPEC_GAP =
  'GET /attendance/overview không hỗ trợ period/from/to (ngày/tuần/tháng/quý). Chỉ `year` — SPEC_GAP ba-process nếu cần grain mịn hơn.';

export function resolveOverviewApiYear(
  filter: OverviewYearFilter,
  now: Date = new Date(),
): number {
  const y = now.getFullYear();
  return filter === 'last-year' ? y - 1 : y;
}

/** Values that must not appear as wired filter options until BE adds period params. */
export const OVERVIEW_UNSUPPORTED_TIME_FILTERS = [
  'today',
  'yesterday',
  'this-week',
  'last-week',
  'this-month',
  'last-month',
  'this-quarter',
  'custom',
] as const;
