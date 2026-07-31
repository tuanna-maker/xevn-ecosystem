import { describe, expect, it } from 'vitest';
import {
  formatHrmDate,
  formatHrmDateRange,
  formatHrmDateTime,
  formatHrmCurrency,
  parseAmount,
  parseHrmDateOnly,
  sanitizeSeedDisplay,
} from '../formatHrm';

describe('formatHrm', () => {
  it('parseHrmDateOnly handles YYYY-MM-DD without drift', () => {
    const d = parseHrmDateOnly('2026-08-08');
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(7);
    expect(d?.getDate()).toBe(8);
  });

  it('parseHrmDateOnly handles ISO timestamp', () => {
    const d = parseHrmDateOnly('2026-08-08T00:00:00.000Z');
    expect(d?.getDate()).toBe(8);
  });

  it('formatHrmDate returns dd/MM/yyyy vi-VN style', () => {
    expect(formatHrmDate('2026-08-08')).toBe('08/08/2026');
    expect(formatHrmDate('2026-08-08T00:00:00.000Z')).toBe('08/08/2026');
  });

  it('formatHrmDate returns dash for invalid values', () => {
    expect(formatHrmDate(null)).toBe('—');
    expect(formatHrmDate('')).toBe('—');
    expect(formatHrmDate('0')).toBe('—');
  });

  it('formatHrmDateTime returns dd/MM/yyyy HH:mm', () => {
    const out = formatHrmDateTime('2026-08-08T14:30:00.000Z');
    expect(out).toMatch(/^08\/08\/2026 \d{2}:\d{2}$/);
  });

  it('formatHrmDateTime returns dash for invalid values', () => {
    expect(formatHrmDateTime(null)).toBe('—');
    expect(formatHrmDateTime('')).toBe('—');
  });

  it('sanitizeSeedDisplay hides seed: prefix', () => {
    expect(sanitizeSeedDisplay('seed:p1-hrm-leave-001')).toBe('Dữ liệu mẫu UAT');
    expect(sanitizeSeedDisplay('SEED:foo')).toBe('Dữ liệu mẫu UAT');
  });

  it('sanitizeSeedDisplay passes through normal text', () => {
    expect(sanitizeSeedDisplay('Nghỉ việc riêng')).toBe('Nghỉ việc riêng');
    expect(sanitizeSeedDisplay(null)).toBe('—');
    expect(sanitizeSeedDisplay('')).toBe('—');
  });

  it('formatHrmDateRange joins start and end with en-dash', () => {
    expect(formatHrmDateRange('2026-08-08', '2026-08-11')).toBe('08/08/2026 – 11/08/2026');
    expect(formatHrmDateRange('2026-08-08', '2026-08-08')).toBe('08/08/2026');
  });

  it('parseAmount normalizes string and number inputs', () => {
    expect(parseAmount(1_500_000)).toBe(1_500_000);
    expect(parseAmount('2500000.5')).toBe(2_500_000.5);
    expect(parseAmount('invalid')).toBe(0);
  });

  it('parseAmount accepts vi-VN thousand grouping (D-UX-VI-FORMAT-MOBILE-01)', () => {
    expect(parseAmount('15.000.000')).toBe(15_000_000);
    expect(parseAmount('1.500.000,5')).toBe(1_500_000.5);
    expect(parseAmount('20,000,000')).toBe(20_000_000);
  });

  it('formatHrmCurrency uses Intl vi-VN VND', () => {
    const out = formatHrmCurrency(1_500_000);
    expect(out).toContain('1');
    expect(out).toMatch(/₫|VND|đ/i);
  });
});
