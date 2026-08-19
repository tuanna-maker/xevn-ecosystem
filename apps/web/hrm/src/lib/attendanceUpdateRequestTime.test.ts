import { describe, expect, it } from 'vitest';
import {
  buildAttendanceUpdateRequestTimeFields,
  composeAttendanceDateTimeIso,
  formatAttendanceRequestedTimeDisplay,
} from './attendanceUpdateRequestTime';

describe('composeAttendanceDateTimeIso', () => {
  it('composes yyyy-MM-dd + HH:mm into ISO timestamptz (local wall clock)', () => {
    const iso = composeAttendanceDateTimeIso('2026-07-26', '08:00');
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const d = new Date(iso!);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(26);
    expect(d.getHours()).toBe(8);
    expect(d.getMinutes()).toBe(0);
  });

  it('composes from Date + 17:30', () => {
    const day = new Date(2026, 6, 26);
    const iso = composeAttendanceDateTimeIso(day, '17:30');
    expect(iso).toBeTruthy();
    const d = new Date(iso!);
    expect(d.getHours()).toBe(17);
    expect(d.getMinutes()).toBe(30);
  });

  it('passes through existing ISO datetime', () => {
    const raw = '2026-04-22T08:00:00.000Z';
    expect(composeAttendanceDateTimeIso('2026-04-22', raw)).toBe(raw);
  });

  it('returns undefined for empty / invalid HH:mm', () => {
    expect(composeAttendanceDateTimeIso('2026-07-26', '')).toBeUndefined();
    expect(composeAttendanceDateTimeIso('2026-07-26', '25:99')).toBeUndefined();
    expect(composeAttendanceDateTimeIso('not-a-date', '08:00')).toBeUndefined();
  });

  it('never emits bare HH:mm (BE TIMESTAMPTZ reject)', () => {
    const iso = composeAttendanceDateTimeIso('2026-07-26', '08:00');
    expect(iso).not.toBe('08:00');
    expect(iso).toContain('T');
  });
});

describe('buildAttendanceUpdateRequestTimeFields', () => {
  it('forgot_check includes both ISO check-in and check-out', () => {
    const fields = buildAttendanceUpdateRequestTimeFields({
      attendanceDate: '2026-07-26',
      updateType: 'forgot_check',
      requestedCheckIn: '08:00',
      requestedCheckOut: '17:30',
    });
    expect(fields.requested_check_in).toMatch(/T/);
    expect(fields.requested_check_out).toMatch(/T/);
    expect(fields.requested_check_in).not.toBe('08:00');
    expect(fields.requested_check_out).not.toBe('17:30');
    expect(new Date(fields.requested_check_out!).getTime()).toBeGreaterThan(
      new Date(fields.requested_check_in!).getTime(),
    );
  });

  it('check_in omits check-out; check_out omits check-in', () => {
    const onlyIn = buildAttendanceUpdateRequestTimeFields({
      attendanceDate: '2026-07-26',
      updateType: 'check_in',
      requestedCheckIn: '08:00',
      requestedCheckOut: '17:30',
    });
    expect(onlyIn.requested_check_in).toBeTruthy();
    expect(onlyIn.requested_check_out).toBeUndefined();

    const onlyOut = buildAttendanceUpdateRequestTimeFields({
      attendanceDate: '2026-07-26',
      updateType: 'check_out',
      requestedCheckIn: '08:00',
      requestedCheckOut: '17:30',
    });
    expect(onlyOut.requested_check_in).toBeUndefined();
    expect(onlyOut.requested_check_out).toBeTruthy();
  });
});

describe('formatAttendanceRequestedTimeDisplay', () => {
  it('formats ISO back to HH:mm for list/detail', () => {
    const iso = composeAttendanceDateTimeIso('2026-07-26', '08:00')!;
    expect(formatAttendanceRequestedTimeDisplay(iso)).toBe('08:00');
  });

  it('keeps bare HH:mm and maps empty to em dash', () => {
    expect(formatAttendanceRequestedTimeDisplay('17:30')).toBe('17:30');
    expect(formatAttendanceRequestedTimeDisplay(null)).toBe('—');
  });
});
