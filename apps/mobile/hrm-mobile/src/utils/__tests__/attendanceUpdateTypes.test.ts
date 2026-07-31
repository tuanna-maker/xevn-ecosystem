import { describe, expect, it } from 'vitest';
import {
  resolveAttendanceChangeTypeVi,
  resolveUpdateTypeLabel,
} from '../attendanceUpdateTypes';

describe('resolveAttendanceChangeTypeVi — MOB-UX-15d', () => {
  it('maps wire tokens including check_in_out seed value', () => {
    expect(resolveAttendanceChangeTypeVi('check_in')).toBe('Giờ vào');
    expect(resolveAttendanceChangeTypeVi('check_out')).toBe('Giờ ra');
    expect(resolveAttendanceChangeTypeVi('check_in_out')).toBe('Giờ vào và ra');
    expect(resolveAttendanceChangeTypeVi('both')).toBe('Giờ vào và ra');
    expect(resolveAttendanceChangeTypeVi('forgot_check')).toBe('Quên chấm công');
  });

  it('passes through already-localized copy', () => {
    expect(resolveAttendanceChangeTypeVi('Quên check-out')).toBe('Quên check-out');
    expect(resolveAttendanceChangeTypeVi('Sửa giờ vào')).toBe('Sửa giờ vào');
  });

  it('sanitizes seed and HRM codes', () => {
    expect(resolveAttendanceChangeTypeVi('seed:uat-update')).toBe('Chỉnh sửa chấm công');
    expect(resolveAttendanceChangeTypeVi('HRM-ATT-REQ-203')).toBe('Chỉnh sửa chấm công');
  });

  it('unknown wire tokens → em dash (U72 M-F-07, no snake→spaces)', () => {
    expect(resolveAttendanceChangeTypeVi('foo_bar')).toBe('—');
    expect(resolveAttendanceChangeTypeVi('custom_edit')).toBe('—');
  });

  it('resolveUpdateTypeLabel delegates to the same mapper', () => {
    expect(resolveUpdateTypeLabel('check_in_out')).toBe('Giờ vào và ra');
  });
});
