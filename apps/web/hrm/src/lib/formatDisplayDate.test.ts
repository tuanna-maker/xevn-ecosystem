import { describe, expect, it } from 'vitest';
import { formatDisplayDate } from './formatDisplayDate';

describe('formatDisplayDate', () => {
  it('formats ISO dates', () => {
    expect(formatDisplayDate('2025-01-05')).toBe('05/01/2025');
  });

  it('formats ISO datetime with custom pattern', () => {
    expect(formatDisplayDate('2025-01-05T14:30:00.000Z', 'dd/MM/yyyy HH:mm')).toMatch(
      /\d{2}\/\d{2}\/2025 \d{2}:\d{2}/,
    );
  });

  it('does not throw on period_label MM/yyyy', () => {
    expect(formatDisplayDate('01/2025')).toBe('01/2025');
  });

  it('does not throw on invalid API garbage', () => {
    expect(formatDisplayDate('not-a-date')).toBe('—');
    expect(formatDisplayDate('1970-01-01T00:00:00.000Z')).toBe('01/01/1970');
  });

  it('returns em dash for empty', () => {
    expect(formatDisplayDate(null)).toBe('—');
    expect(formatDisplayDate('')).toBe('—');
    expect(formatDisplayDate(undefined)).toBe('—');
  });
});