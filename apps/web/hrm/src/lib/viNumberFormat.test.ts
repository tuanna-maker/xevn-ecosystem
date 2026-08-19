import { describe, expect, it } from 'vitest';
import {
  formatViGroupedInteger,
  parseViGroupedInteger,
  ViGroupedIntegerInput,
} from './viNumberFormat';
import { formatDisplayDate, VI_DATE_DISPLAY_PATTERN } from './formatDisplayDate';

describe('D-UX-VI-FORMAT-SHARED-01 HRM dual export', () => {
  it('re-exports VI integer helpers', () => {
    expect(formatViGroupedInteger(1000)).toBe('1.000');
    expect(parseViGroupedInteger('1.234.567')).toBe(1234567);
    expect(typeof ViGroupedIntegerInput).toBe('function');
  });

  it('formatDisplayDate defaults dd/MM/yyyy via @xevn/ui', () => {
    expect(VI_DATE_DISPLAY_PATTERN).toBe('dd/MM/yyyy');
    expect(formatDisplayDate('2025-01-05')).toBe('05/01/2025');
  });
});
