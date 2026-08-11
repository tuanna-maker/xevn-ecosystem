import { describe, expect, it } from 'vitest';
import {
  CLOCK_IN_ATTENDANCE_TYPE,
  isClockInAttendanceType,
  isLegacyClockInType,
  resolveClockInMethod,
} from './clockInMethods';

describe('clockInMethods', () => {
  it('treats clock-in hub and legacy types as clock-in attendance', () => {
    expect(isClockInAttendanceType(CLOCK_IN_ATTENDANCE_TYPE)).toBe(true);
    expect(isClockInAttendanceType('checkinout')).toBe(true);
    expect(isClockInAttendanceType('qrcode')).toBe(true);
    expect(isClockInAttendanceType('sheets')).toBe(false);
  });

  it('maps legacy submenu ids to methods', () => {
    expect(isLegacyClockInType('faceid')).toBe(true);
    expect(resolveClockInMethod('checkinout', 'gps')).toBe('manual');
    expect(resolveClockInMethod('qrcode', 'manual')).toBe('qrcode');
    expect(resolveClockInMethod('faceid', 'manual')).toBe('faceid');
    expect(resolveClockInMethod('gps', 'manual')).toBe('gps');
  });

  it('keeps selected method on clock-in hub', () => {
    expect(resolveClockInMethod(CLOCK_IN_ATTENDANCE_TYPE, 'qrcode')).toBe('qrcode');
    expect(resolveClockInMethod(CLOCK_IN_ATTENDANCE_TYPE, 'manual')).toBe('manual');
  });
});
