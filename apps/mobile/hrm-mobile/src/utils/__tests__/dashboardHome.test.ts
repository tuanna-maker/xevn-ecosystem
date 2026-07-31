import { describe, expect, it } from 'vitest';
import type { MobileMembership } from '../../context/AuthContext';
import {
  formatPendingRequestsLine,
  formatUpcomingLeaveLine,
  pickUpcomingLeaves,
  resolveHomeDisplayName,
  resolveHomeGreeting,
  resolveTodayCheckInSummary,
  type LeaveHomeRow,
} from '../dashboardHome';

const memberships: MobileMembership[] = [
  {
    tenant_id: 't1',
    company_id: 'holding',
    company_uuid: 'uuid-1',
    employee_id: 'emp-1',
    employee_code: 'NV001',
    employee_name: 'Nguyễn Văn A',
    company_display: 'XeVN Holding',
    is_primary: true,
  },
];

describe('dashboardHome', () => {
  it('resolveHomeGreeting uses active membership and Vietnamese company label', () => {
    const g = resolveHomeGreeting(memberships, 'emp-1', 'holding');
    expect(g.displayName).toBe('Nguyễn Văn A');
    expect(g.companyLabel).toBe('Tập đoàn XeVN');
  });

  it('resolveHomeGreeting prefers profile full_name over membership', () => {
    const g = resolveHomeGreeting(memberships, 'emp-1', 'holding', {
      profileFullName: 'UAT NV0001',
    });
    expect(g.displayName).toBe('UAT NV0001');
  });

  it('resolveHomeDisplayName uses profile before membership', () => {
    expect(resolveHomeDisplayName('Huỳnh Văn An', memberships, 'emp-1')).toBe('Huỳnh Văn An');
    expect(resolveHomeDisplayName(null, memberships, 'emp-1')).toBe('Nguyễn Văn A');
    expect(resolveHomeDisplayName('', [], '')).toBe('bạn');
  });

  it('resolveHomeGreeting falls back when no membership', () => {
    const g = resolveHomeGreeting([], '', '');
    expect(g.displayName).toBe('bạn');
    expect(g.companyLabel).toBe('Chưa chọn công ty');
  });

  it('resolveHomeGreeting hides raw slug when no membership display', () => {
    const g = resolveHomeGreeting([], '', 'du-lich');
    expect(g.displayName).toBe('bạn');
    expect(g.companyLabel).toBe('—');
  });

  it('pickUpcomingLeaves filters future approved/pending only', () => {
    const rows: LeaveHomeRow[] = [
      { id: '1', leave_type: 'annual', start_date: '2026-06-01', end_date: '2026-06-02', status: 'approved' },
      { id: '2', leave_type: 'sick', start_date: '2026-06-10', end_date: '2026-06-11', status: 'approved' },
      { id: '3', leave_type: 'annual', start_date: '2026-07-01', end_date: '2026-07-03', status: 'pending' },
      { id: '4', leave_type: 'annual', start_date: '2026-08-01', end_date: '2026-08-02', status: 'rejected' },
    ];
    const upcoming = pickUpcomingLeaves(rows, '2026-06-07');
    expect(upcoming.map((r) => r.id)).toEqual(['2', '3']);
  });

  it('formatUpcomingLeaveLine uses vi-VN range and leave label', () => {
    const line = formatUpcomingLeaveLine({
      id: 'x',
      leave_type: 'LVT_01',
      start_date: '2026-08-08',
      end_date: '2026-08-11',
      status: 'approved',
    });
    expect(line).toBe('08/08/2026 – 11/08/2026 · Nghỉ phép năm');
  });

  it('resolveTodayCheckInSummary formats check-in time', () => {
    const withTime = resolveTodayCheckInSummary(true, '2026-06-07T08:02:00.000Z');
    expect(withTime.status).toBe('present');
    expect(withTime.summary).toMatch(/Chấm lúc/);

    const empty = resolveTodayCheckInSummary(false, null);
    expect(empty.summary).toBe('Chưa chấm công hôm nay');
    expect(empty.status).toBe('pending');
  });

  it('formatPendingRequestsLine pluralizes correctly', () => {
    expect(formatPendingRequestsLine(0, 0)).toBe('Không có đơn chờ duyệt');
    expect(formatPendingRequestsLine(1, 0)).toBe('1 đơn chờ duyệt');
    expect(formatPendingRequestsLine(1, 2)).toBe('3 đơn chờ duyệt');
  });
});
