import { describe, expect, it } from 'vitest';
import { buildProfileStatusMetrics } from '../profileWorkMetrics';

describe('buildProfileStatusMetrics', () => {
  it('builds 2×3 grid with leave balance, pending, attendance', () => {
    const metrics = buildProfileStatusMetrics({
      leaveBalance: {
        company_id: 'holding',
        employee_id: 'e1',
        leave_type: 'annual',
        balance_year: 2026,
        year: 2026,
        period: 2026,
        entitled_days: 12,
        used_days: 3,
        pending_days: 1,
        remaining_days: 8,
        available_days: 8,
        as_of: '2026-06-09',
        source: 'employee_leave_balances',
      },
      pendingLeaveCount: 1,
      pendingUpdateCount: 0,
      hasAttendanceToday: true,
      checkInAt: '2026-06-09T08:15:00.000Z',
      employmentStatus: 'active',
    });

    expect(metrics).toHaveLength(6);
    expect(metrics[0].label).toBe('Phép được hưởng');
    expect(metrics[0].value).toBe('12');
    expect(metrics[1].value).toBe('8');
    expect(metrics[4].value).toBe('1');
    expect(metrics[5].label).toBe('Chấm công hôm nay');
    expect(metrics[5].tone).toBe('success');
  });

  it('uses stub dashes when leave balance missing', () => {
    const metrics = buildProfileStatusMetrics({
      leaveBalance: null,
      pendingLeaveCount: 0,
      pendingUpdateCount: 0,
      hasAttendanceToday: false,
      checkInAt: null,
      employmentStatus: 'active',
    });

    expect(metrics[0].value).toBe('—');
    expect(metrics[5].tone).toBe('warning');
  });
});
