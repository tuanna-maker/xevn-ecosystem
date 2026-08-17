/**
 * @CODE-MEMORY
 * Screen:     /hr/attendance → Nghỉ phép → Tạo yêu cầu
 * UC:          UC-HRM-09
 * SRS:         docs/hrm/SRS.md § leave requests
 * TechSpec:    docs/hrm/TECHSPEC.md § attendance leave overlap
 * Purpose:     Chọn cửa sổ ngày nghỉ không trùng pending/approved — tránh POST 409 khi U65 mutate lặp.
 * WorkItem:    D-HDSD-MUTATE-FE-09
 * Coded:       2026-08-01
 * must_keep:   U65 no seed; harness vẫn có thể gõ dd/MM/yyyy — FE prefill hỗ trợ QA
 * LastVerified: leaveRequestDateWindow.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT
 * change_mode: FIX
 * What: Restore from git 43c479a — LeaveTab transitive (Attendance eager import)
 * Why: Full mount chain after LeaveOverviewRecentPanel / ClockIn / debounce restore
 * must_keep: LeaveTab create/list path; overlap prefill; U65 no seed
 */

export type LeaveDateRange = {
  start_date: string;
  end_date: string;
  status?: string;
};

const OVERLAP_STATUSES = new Set(['pending', 'approved']);

function parseIsoDay(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

function toViDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

function isOccupied(
  start: Date,
  end: Date,
  occupied: readonly LeaveDateRange[],
): boolean {
  for (const row of occupied) {
    if (row.status && !OVERLAP_STATUSES.has(row.status)) continue;
    const oStart = parseIsoDay(row.start_date);
    const oEnd = parseIsoDay(row.end_date);
    if (!oStart || !oEnd) continue;
    if (rangesOverlap(start, end, oStart, oEnd)) return true;
  }
  return false;
}

/**
 * Pick a 3-day leave window starting ≥10 months ahead, salted by stamp/time to avoid U65 overlap 409.
 */
export function pickNonOverlappingLeaveWindow(
  occupied: readonly LeaveDateRange[],
  salt: string | number = Date.now(),
): { startIso: string; endIso: string; startVi: string; endVi: string } {
  const saltStr = String(salt);
  let hash = 0;
  for (let i = 0; i < saltStr.length; i += 1) {
    hash = (hash * 31 + saltStr.charCodeAt(i)) | 0;
  }
  const combined = Math.abs(hash ^ (typeof salt === 'number' ? salt : hash));

  const base = new Date();
  base.setHours(12, 0, 0, 0);
  base.setMonth(base.getMonth() + 10 + (combined % 14));
  base.setDate(1 + (combined % 26));

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const start = new Date(base);
    start.setDate(base.getDate() + attempt * 4);
    const end = new Date(start);
    end.setDate(start.getDate() + 2);
    if (!isOccupied(start, end, occupied)) {
      const startIso = toIsoDate(start);
      const endIso = toIsoDate(end);
      return {
        startIso,
        endIso,
        startVi: toViDate(startIso),
        endVi: toViDate(endIso),
      };
    }
  }

  const fallbackStart = new Date(base);
  fallbackStart.setFullYear(fallbackStart.getFullYear() + 2);
  const fallbackEnd = new Date(fallbackStart);
  fallbackEnd.setDate(fallbackStart.getDate() + 2);
  const startIso = toIsoDate(fallbackStart);
  const endIso = toIsoDate(fallbackEnd);
  return {
    startIso,
    endIso,
    startVi: toViDate(startIso),
    endVi: toViDate(endIso),
  };
}
