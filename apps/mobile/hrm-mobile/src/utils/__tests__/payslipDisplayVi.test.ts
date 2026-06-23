import { describe, expect, it } from 'vitest';

import { resolvePayslipPeriodLabelVi } from '../payslipDisplayVi';

describe('resolvePayslipPeriodLabelVi — MOB-UX-16e', () => {
  it('replaces holding slug suffix with Vietnamese company label', () => {
    expect(resolvePayslipPeriodLabelVi('Kỳ lương 05/2026 — holding')).toBe(
      'Kỳ lương 05/2026 — Tập đoàn XeVN',
    );
    expect(resolvePayslipPeriodLabelVi('Kỳ lương 05/2026 - holding')).toBe(
      'Kỳ lương 05/2026 — Tập đoàn XeVN',
    );
  });

  it('maps trsport slug suffix', () => {
    expect(resolvePayslipPeriodLabelVi('Tháng 4/2026 — trsport')).toBe(
      'Tháng 4/2026 — Khối Vận tải X.E',
    );
  });

  it('preserves clean period labels without slug', () => {
    expect(resolvePayslipPeriodLabelVi('Kỳ 06/2026')).toBe('Kỳ 06/2026');
    expect(resolvePayslipPeriodLabelVi('Tháng 5/2026')).toBe('Tháng 5/2026');
  });

  it('falls back for empty input', () => {
    expect(resolvePayslipPeriodLabelVi('')).toBe('Kỳ lương');
    expect(resolvePayslipPeriodLabelVi(null)).toBe('Kỳ lương');
  });
});
