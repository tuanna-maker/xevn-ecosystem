import { describe, expect, it } from 'vitest';
import {
  WORK_SHIFT_BOOTSTRAP_FALLBACK,
  WORK_SHIFT_UAT_HONESTY,
  formatWorkShiftTime,
  resolveWorkShiftLabel,
  workShiftToPickerOption,
  workShiftsToPickerOptions,
} from './workShiftCatalog';

describe('workShiftCatalog', () => {
  it('honesty flag stays false (FE không flip attendance UAT)', () => {
    expect(WORK_SHIFT_UAT_HONESTY).toBe(false);
  });

  it('bootstrap fallback = 5-id morning|afternoon|night|office|flexible', () => {
    expect(WORK_SHIFT_BOOTSTRAP_FALLBACK.map((s) => s.code)).toEqual([
      'morning',
      'afternoon',
      'night',
      'office',
      'flexible',
    ]);
  });

  it('formatWorkShiftTime ghép khung giờ; an toàn khi thiếu', () => {
    expect(formatWorkShiftTime('06:00', '14:00')).toBe('06:00 - 14:00');
    expect(formatWorkShiftTime('08:00', null)).toBe('08:00');
    expect(formatWorkShiftTime(null, null)).toBe('');
  });

  it('workShiftToPickerOption bind value=code (Nest key) — display-ready name/time', () => {
    const opt = workShiftToPickerOption({
      code: 'CA_SANG',
      name: 'Ca sáng',
      start_time: '06:00',
      end_time: '14:00',
    });
    expect(opt).toEqual({ code: 'CA_SANG', name: 'Ca sáng', time: '06:00 - 14:00' });
  });

  it('workShiftToPickerOption fallback name=code khi thiếu name (không invent)', () => {
    const opt = workShiftToPickerOption({ code: 'night', name: '', start_time: '22:00', end_time: '06:00' });
    expect(opt.name).toBe('night');
  });

  it('workShiftsToPickerOptions loại row thiếu code', () => {
    const opts = workShiftsToPickerOptions([
      { code: 'a', name: 'A', start_time: '08:00', end_time: '17:00' },
      { code: '', name: 'X', start_time: '', end_time: '' },
    ]);
    expect(opts).toHaveLength(1);
    expect(opts[0].code).toBe('a');
  });

  it('resolveWorkShiftLabel: code khớp → name; không khớp → raw; rỗng → —', () => {
    const options = [{ code: 'CA_SANG', name: 'Ca sáng', time: '06:00 - 14:00' }];
    expect(resolveWorkShiftLabel(options, 'CA_SANG')).toBe('Ca sáng');
    expect(resolveWorkShiftLabel(options, 'ca_sang')).toBe('Ca sáng'); // case-insensitive
    expect(resolveWorkShiftLabel(options, 'Ca sáng (legacy)')).toBe('Ca sáng (legacy)'); // legacy giữ nguyên
    expect(resolveWorkShiftLabel(options, '')).toBe('—');
    expect(resolveWorkShiftLabel(options, null)).toBe('—');
  });
});
