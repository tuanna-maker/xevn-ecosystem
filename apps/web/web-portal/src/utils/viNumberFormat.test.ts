import { describe, expect, it } from 'vitest';
import { formatViGroupedInteger, parseViGroupedInteger } from './viNumberFormat';

describe('viNumberFormat', () => {
  it('formats >= 1000 with dot grouping', () => {
    expect(formatViGroupedInteger(999)).toBe('999');
    expect(formatViGroupedInteger(1000)).toBe('1.000');
    expect(formatViGroupedInteger(500000000000)).toBe('500.000.000.000');
  });

  it('parses grouped and plain input', () => {
    expect(parseViGroupedInteger('1.234.567')).toBe(1234567);
    expect(parseViGroupedInteger('500000000000')).toBe(500000000000);
    expect(parseViGroupedInteger('')).toBe(0);
  });
});
