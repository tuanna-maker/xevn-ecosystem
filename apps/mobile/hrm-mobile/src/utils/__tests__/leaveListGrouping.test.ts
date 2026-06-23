import { describe, expect, it } from 'vitest';
import {
  formatLeaveSubmissionSectionTitle,
  groupLeaveRowsBySubmissionDate,
  resolveLeaveSubmissionDateKey,
} from '../leaveListGrouping';

describe('leaveListGrouping (MOB-UX-07 J-MOB-26)', () => {
  it('groups rows by requested_at date newest first', () => {
    const sections = groupLeaveRowsBySubmissionDate([
      {
        id: 'a',
        leave_type: 'annual',
        start_date: '2026-06-01',
        end_date: '2026-06-02',
        status: 'pending',
        employee_name: 'A',
        requested_at: '2026-06-05T10:00:00Z',
      },
      {
        id: 'b',
        leave_type: 'sick',
        start_date: '2026-06-10',
        end_date: '2026-06-11',
        status: 'approved',
        employee_name: 'B',
        requested_at: '2026-06-08T08:00:00Z',
      },
    ]);
    expect(sections).toHaveLength(2);
    expect(sections[0].key).toBe('2026-06-08');
    expect(sections[0].data).toHaveLength(1);
    expect(sections[1].key).toBe('2026-06-05');
  });

  it('falls back to created_at then unknown', () => {
    expect(resolveLeaveSubmissionDateKey({ id: 'x', leave_type: 'annual', start_date: '', end_date: '', status: 'pending', employee_name: null, created_at: '2026-06-12T00:00:00Z' })).toBe('2026-06-12');
    expect(formatLeaveSubmissionSectionTitle('2026-06-12')).toBe('12/06/2026');
    expect(formatLeaveSubmissionSectionTitle('unknown')).toBe('Không rõ ngày gửi');
  });
});
