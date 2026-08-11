import { describe, expect, it } from 'vitest';
import { parseViDisplayToIsoDate, formatIsoDateToViDisplay } from '@xevn/ui';

/**
 * FID-P0-FE-DATE-01 — SoT parse must accept single-digit day/month
 * and emit zero-padded ISO for @IsDateString BE DTOs.
 */
describe('FID-P0-FE-DATE-01 ViDatePickerField SoT parse', () => {
  it('accepts single-digit day/month → padded ISO', () => {
    expect(parseViDisplayToIsoDate('1/1/2026')).toBe('2026-01-01');
    expect(parseViDisplayToIsoDate('01/07/2026')).toBe('2026-07-01');
    expect(parseViDisplayToIsoDate('31/7/2026')).toBe('2026-07-31');
  });

  it('rejects invalid calendar dates', () => {
    expect(parseViDisplayToIsoDate('32/01/2026')).toBeNull();
    expect(parseViDisplayToIsoDate('1/13/2026')).toBeNull();
  });

  it('display always dd/MM/yyyy when ISO valid', () => {
    expect(formatIsoDateToViDisplay('2026-01-01')).toBe('01/01/2026');
    expect(formatIsoDateToViDisplay('2026-07-31')).toBe('31/07/2026');
  });
});
