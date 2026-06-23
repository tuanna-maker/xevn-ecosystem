import { describe, expect, it } from 'vitest';
import type { InboxHubRow } from '../dashboardHub';
import {
  aggregateAttendanceStats,
  buildDefaultEssStatCards,
  buildEssStatCards,
  defaultEssDashboardDate,
  filterAnnouncementInboxRows,
  mapFallbackAnnouncements,
  resolveAnnouncementTitleVi,
  resolveInboxEventTypeVi,
  resolveRoleSubtitle,
  resolveTimeBasedGreeting,
  resolveWorkflowStatusVi,
} from '../dashboardEss';

describe('dashboardEss', () => {
  it('resolveTimeBasedGreeting varies by hour', () => {
    expect(resolveTimeBasedGreeting('An', 9)).toBe('Chào buổi sáng, An');
    expect(resolveTimeBasedGreeting('An', 14)).toBe('Chào buổi chiều, An');
    expect(resolveTimeBasedGreeting('An', 20)).toBe('Chào buổi tối, An');
  });

  it('resolveRoleSubtitle maps known keys and Vietnamese fallback', () => {
    expect(resolveRoleSubtitle('hr_staff')).toBe('Nhân sự');
    expect(resolveRoleSubtitle('DRIVER')).toBe('Lái xe');
    expect(resolveRoleSubtitle('custom_role')).toBe('Nhân viên');
    expect(resolveRoleSubtitle(null)).toBe('Nhân viên');
  });

  it('resolveWorkflowStatusVi localizes payslip and leave statuses', () => {
    expect(resolveWorkflowStatusVi('paid')).toBe('Đã thanh toán');
    expect(resolveWorkflowStatusVi('pending')).toBe('Chờ duyệt');
    expect(resolveWorkflowStatusVi('active')).toBe('Đang làm việc');
    expect(resolveWorkflowStatusVi('unknown_enum')).toBe('Đang xử lý');
  });

  it('resolveInboxEventTypeVi avoids raw English event keys', () => {
    expect(resolveInboxEventTypeVi('leave_request.created')).toBe('Đơn nghỉ phép');
    expect(resolveInboxEventTypeVi('broadcast')).toBe('Thông báo chung');
  });

  it('mapFallbackAnnouncements uses Vietnamese when title missing', () => {
    const rows: InboxHubRow[] = [
      {
        id: '1',
        event_type: 'leave_request.created',
        payload: {},
        read_at: null,
        created_at: '2026-06-08T08:00:00Z',
      },
    ];
    const ann = mapFallbackAnnouncements(rows);
    expect(ann[0].title).toBe('Đơn nghỉ phép');
    expect(ann[0].title).not.toContain('leave_request');
  });

  it('resolveAnnouncementTitleVi prefers human title over event key', () => {
    expect(resolveAnnouncementTitleVi('Town hall', 'broadcast')).toBe('Town hall');
    expect(resolveAnnouncementTitleVi('leave_request.created', 'leave_request.created')).toBe(
      'Đơn nghỉ phép',
    );
  });

  it('aggregateAttendanceStats counts present/late/absent', () => {
    const rows = [
      { employee_id: 'e1', attendance_date: '2026-06-08', status: 'present' },
      { employee_id: 'e2', attendance_date: '2026-06-08', status: 'absent' },
      { employee_id: 'e3', attendance_date: '2026-06-08', status: 'pending', check_in_at: '2026-06-08T09:15:00Z' },
    ];
    const stats = aggregateAttendanceStats(rows, { isManager: true, dateIso: '2026-06-08' });
    expect(stats.totalWork).toBe(1);
    expect(stats.late).toBe(1);
    expect(stats.absence).toBe(1);
  });

  it('aggregateAttendanceStats marks self absent when no record on or before today', () => {
    const today = defaultEssDashboardDate();
    const stats = aggregateAttendanceStats([], {
      isManager: false,
      employeeId: 'e1',
      dateIso: today,
    });
    expect(stats.absence).toBe(1);
  });

  it('filterAnnouncementInboxRows keeps broadcast types', () => {
    const rows: InboxHubRow[] = [
      {
        id: '1',
        event_type: 'broadcast',
        payload: { title: 'Town hall' },
        read_at: null,
        created_at: '2026-06-08T08:00:00Z',
      },
      {
        id: '2',
        event_type: 'leave_request.created',
        payload: {},
        read_at: null,
        created_at: '2026-06-08T09:00:00Z',
      },
    ];
    const ann = filterAnnouncementInboxRows(rows);
    expect(ann).toHaveLength(1);
    expect(ann[0].title).toBe('Town hall');
  });

  it('buildDefaultEssStatCards seeds four zero-value rows for above-fold hydrate', () => {
    const cards = buildDefaultEssStatCards(false);
    expect(cards).toHaveLength(4);
    expect(cards.every((c) => c.value === '0' || c.value === '—')).toBe(true);
  });

  it('buildEssStatCards returns four cards with persona labels', () => {
    const mgr = buildEssStatCards({
      isManager: true,
      activeTeamCount: 12,
      offWorkCount: 2,
      leaveRequestsCount: 3,
      myLeavesCount: 5,
    });
    expect(mgr).toHaveLength(4);
    expect(mgr[0].id).toBe('active_team');
    expect(mgr[2].title).toBe('Đơn chờ duyệt');

    const nv = buildEssStatCards({
      isManager: false,
      activeTeamCount: 8,
      offWorkCount: 1,
      leaveRequestsCount: 1,
      myLeavesCount: 4,
    });
    expect(nv[2].title).toBe('Đơn chờ');
  });
});
