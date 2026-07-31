import { describe, expect, it } from 'vitest';
import { resolveAttendanceTimelineBadge } from '../attendanceTimelineBadge';

describe('resolveAttendanceTimelineBadge', () => {
  it('maps present to on-time success pill', () => {
    const badge = resolveAttendanceTimelineBadge({ status: 'present' });
    expect(badge).toEqual({
      kind: 'on_time',
      label: 'Đúng giờ',
      tone: 'success',
      status: 'present',
    });
  });

  it('maps explicit late to warning pill', () => {
    const badge = resolveAttendanceTimelineBadge({ status: 'late', check_in_at: '2026-06-08T09:15:00Z' });
    expect(badge.kind).toBe('late');
    expect(badge.label).toBe('Đi muộn');
    expect(badge.tone).toBe('warning');
  });

  it('maps pending with check-in to late (dashboardEss parity)', () => {
    const badge = resolveAttendanceTimelineBadge({
      status: 'pending',
      check_in_at: '2026-06-08T09:15:00Z',
    });
    expect(badge).toMatchObject({ kind: 'late', label: 'Đi muộn', tone: 'warning' });
  });

  it('maps absent and pending-without-check-in to danger pill', () => {
    expect(resolveAttendanceTimelineBadge({ status: 'absent' })).toMatchObject({
      kind: 'absent',
      label: 'Vắng mặt',
      tone: 'danger',
    });
    expect(resolveAttendanceTimelineBadge({ status: 'pending' })).toMatchObject({
      kind: 'absent',
      label: 'Vắng mặt',
      tone: 'danger',
    });
  });

  it('maps leave to info pill', () => {
    const badge = resolveAttendanceTimelineBadge({ status: 'leave' });
    expect(badge).toMatchObject({ kind: 'leave', label: 'Nghỉ phép', tone: 'info' });
  });

  it('unknown attendance status → em dash + neutral (U72 M-F-08)', () => {
    const badge = resolveAttendanceTimelineBadge({ status: 'weird_enum_x' });
    expect(badge.label).toBe('—');
    expect(badge.tone).toBe('neutral');
    expect(badge.label).not.toBe('weird_enum_x');
  });
});
