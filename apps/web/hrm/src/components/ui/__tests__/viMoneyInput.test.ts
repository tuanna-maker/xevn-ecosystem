import { describe, expect, it } from 'vitest';
import { amountStringToNumber, numberToAmountString } from '../ViMoneyInput';
import { formatViGroupedInteger, parseViGroupedInteger } from '@/lib/viNumberFormat';

describe('ViMoneyInput helpers (D-UX-VI-FORMAT-HRM-01)', () => {
  it('amountStringToNumber strips grouping and empties → 0', () => {
    expect(amountStringToNumber('')).toBe(0);
    expect(amountStringToNumber(undefined)).toBe(0);
    expect(amountStringToNumber('20.000.000')).toBe(20_000_000);
    expect(amountStringToNumber('15000000')).toBe(15_000_000);
  });

  it('numberToAmountString keeps API-ready digit strings', () => {
    expect(numberToAmountString(0)).toBe('');
    expect(numberToAmountString(20_000_000)).toBe('20000000');
  });

  it('round-trip via SoT format/parse stays numeric', () => {
    const typed = formatViGroupedInteger(20_000_000);
    expect(typed).toBe('20.000.000');
    expect(parseViGroupedInteger(typed)).toBe(20_000_000);
  });
});
