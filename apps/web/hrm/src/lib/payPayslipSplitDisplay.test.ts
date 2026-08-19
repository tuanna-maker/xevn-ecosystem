import { describe, expect, it } from 'vitest';
import {
  formatPayHoursPayable,
  formatPayMoneyVnd,
  formatPaySegmentDate,
  normalizePayslipSplitSegments,
  payslipSplitPreviewVisible,
} from './payPayslipSplitDisplay';

describe('payPayslipSplitDisplay (PAY-04 FE-01)', () => {
  it('formats money vi-VN', () => {
    expect(formatPayMoneyVnd(15_000_000)).toMatch(/15/);
    expect(formatPayMoneyVnd(null)).toBe('—');
  });

  it('formats hours without thousand grouping', () => {
    expect(formatPayHoursPayable(176.5)).toBe('176.5');
    expect(formatPayHoursPayable(1000)).toBe('1000');
  });

  it('formats segment dates dd/MM/yyyy', () => {
    expect(formatPaySegmentDate('2026-04-01')).toBe('01/04/2026');
    expect(formatPaySegmentDate('')).toBe('—');
  });

  it('sorts segments by segmentSeq', () => {
    const sorted = normalizePayslipSplitSegments([
      {
        segmentSeq: 2,
        effectiveFrom: '2026-04-16',
        effectiveTo: '2026-04-30',
        baseSalarySnapshotVnd: 20_000_000,
        hoursPayable: 80,
        segmentGrossVnd: 10_000_000,
      },
      {
        segmentSeq: 1,
        effectiveFrom: '2026-04-01',
        effectiveTo: '2026-04-15',
        baseSalarySnapshotVnd: 15_000_000,
        hoursPayable: 96,
        segmentGrossVnd: 12_000_000,
      },
    ]);
    expect(sorted.map((s) => s.segmentSeq)).toEqual([1, 2]);
  });

  it('preview visible when split flag or segments present', () => {
    expect(payslipSplitPreviewVisible(false, [])).toBe(false);
    expect(payslipSplitPreviewVisible(true, [])).toBe(true);
    expect(
      payslipSplitPreviewVisible(false, [
        {
          segmentSeq: 1,
          effectiveFrom: '2026-04-01',
          effectiveTo: '2026-04-30',
          baseSalarySnapshotVnd: null,
          hoursPayable: null,
          segmentGrossVnd: 0,
        },
      ]),
    ).toBe(true);
  });
});
