import { describe, expect, it } from 'vitest';
import { resolveLeaveTypeColor, resolveLeaveTypeLabel } from '../../../i18n/leaveTypes';
import { formatHrmDate, formatHrmDateRange, sanitizeSeedDisplay } from '../../../utils/formatHrm';
import {
  leaveStatusSectionOrder,
  leaveStatusSectionTitles,
  resolveLeaveStatusGroup,
} from '../../../utils/leaveRequest';
import type { DetailMetric } from '../DetailMetricGrid';

/** Mirrors LeaveRequestDetailScreen metric grid contract (web LeaveTab L842–868). */
function buildLeaveDetailMetrics(row: {
  leave_type: string;
  total_days: string | number;
  start_date: string;
  end_date: string;
}): DetailMetric[] {
  return [
    { label: 'Loại nghỉ', value: '', leaveTypeCode: row.leave_type },
    { label: 'Số ngày', value: `${row.total_days} ngày` },
    { label: 'Từ ngày', value: formatHrmDate(row.start_date) },
    { label: 'Đến ngày', value: formatHrmDate(row.end_date) },
  ];
}

describe('leave UX-02 parity (LeaveHeroCard + DetailMetricGrid)', () => {
  it('AC-MUX-04: detail metrics expose 4 grid cells with vi-VN dates', () => {
    const metrics = buildLeaveDetailMetrics({
      leave_type: 'annual',
      total_days: 4,
      start_date: '2026-08-08',
      end_date: '2026-08-11',
    });
    expect(metrics).toHaveLength(4);
    expect(metrics[0].leaveTypeCode).toBe('annual');
    expect(resolveLeaveTypeLabel('annual')).toBe('Nghỉ phép năm');
    expect(metrics[1].value).toBe('4 ngày');
    expect(metrics[2].value).toBe('08/08/2026');
    expect(metrics[3].value).toBe('11/08/2026');
    expect(resolveLeaveTypeColor('annual')).toMatch(/^#/);
  });

  it('AC-MUX-03: list subtitle uses date range not ISO', () => {
    expect(formatHrmDateRange('2026-08-08', '2026-08-11')).toBe('08/08/2026 – 11/08/2026');
  });

  it('AC-MUX-05: seed reason sanitized for DetailNoteBlock', () => {
    expect(sanitizeSeedDisplay('seed:uat-leave-01')).toBe('Dữ liệu mẫu UAT');
  });

  it('list sections follow iOS grouped order (Chờ duyệt first)', () => {
    expect(leaveStatusSectionOrder[0]).toBe('pending');
    expect(leaveStatusSectionTitles.pending).toBe('Chờ duyệt');
    expect(resolveLeaveStatusGroup('pending')).toBe('pending');
  });
});
