import { describe, expect, it } from 'vitest';
import {
  isAttendanceLeaveStatus,
  resolveAttendanceLeaveDisplayLabel,
} from './attendanceLeaveDisplay';

describe('attendanceLeaveDisplay — PO-HRM-ATT-LEAVE-FUNNEL-FE-01', () => {
  it('isAttendanceLeaveStatus accepts leave / on_leave', () => {
    expect(isAttendanceLeaveStatus('leave')).toBe(true);
    expect(isAttendanceLeaveStatus('on_leave')).toBe(true);
    expect(isAttendanceLeaveStatus('present')).toBe(false);
    expect(isAttendanceLeaveStatus(null)).toBe(false);
  });

  it('binds status_label · leave_type_label when both present and distinct', () => {
    expect(
      resolveAttendanceLeaveDisplayLabel({
        status: 'leave',
        status_label: 'Nghỉ phép',
        leave_type_label: 'Phép năm',
      }),
    ).toBe('Nghỉ phép · Phép năm');
  });

  it('falls back to status_label then Nghỉ phép', () => {
    expect(
      resolveAttendanceLeaveDisplayLabel({
        status: 'leave',
        status_label: 'Nghỉ phép',
        leave_type_label: null,
      }),
    ).toBe('Nghỉ phép');
    expect(
      resolveAttendanceLeaveDisplayLabel({
        status: 'leave',
      }),
    ).toBe('Nghỉ phép');
  });

  it('uses leave_type_label alone when equal to status_label', () => {
    expect(
      resolveAttendanceLeaveDisplayLabel({
        status: 'leave',
        status_label: 'Nghỉ phép',
        leave_type_label: 'Nghỉ phép',
      }),
    ).toBe('Nghỉ phép');
  });

  it('non-leave prefers status_label without inventing leave join', () => {
    expect(
      resolveAttendanceLeaveDisplayLabel({
        status: 'present',
        status_label: 'Có mặt',
      }),
    ).toBe('Có mặt');
  });
});
