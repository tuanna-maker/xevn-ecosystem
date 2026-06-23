import { describe, expect, it } from 'vitest';
import {
  filterPayslipsForPeriod,
  formatPayslipHeroNet,
  hasDisplayableNetAmount,
  splitPayslipHeroAndHistory,
} from '../payrollPayslips';

const row = (id: string, period_id: string, net_amount: number | null = 1) => ({
  id,
  period_id,
  period_label: 'Kỳ 06/2026',
  employee_name: 'NV',
  gross_amount: 1,
  deduction_amount: 0,
  net_amount,
  status: 'paid',
  currency: 'VND',
});

describe('filterPayslipsForPeriod', () => {
  it('returns rows matching period_id when present', () => {
    const rows = [row('a', 'p1'), row('b', 'p2')];
    expect(filterPayslipsForPeriod(rows, 'p1')).toEqual([row('a', 'p1')]);
  });

  it('falls back to all rows when period_id filter would be empty (J-MOB-04)', () => {
    const rows = [row('a', 'p-other')];
    expect(filterPayslipsForPeriod(rows, 'p-wrong')).toEqual(rows);
  });

  it('returns all rows when periodId omitted', () => {
    const rows = [row('a', 'p1')];
    expect(filterPayslipsForPeriod(rows)).toEqual(rows);
  });
});

describe('splitPayslipHeroAndHistory (J-MOB-34)', () => {
  it('uses first row as hero and rest as history', () => {
    const rows = [row('latest', 'p2', 20_000_000), row('older', 'p1', 18_000_000)];
    expect(splitPayslipHeroAndHistory(rows)).toEqual({
      hero: rows[0],
      history: [rows[1]],
    });
  });

  it('returns null hero for empty list', () => {
    expect(splitPayslipHeroAndHistory([])).toEqual({ hero: null, history: [] });
  });

  it('history empty when only one payslip', () => {
    const rows = [row('only', 'p1')];
    expect(splitPayslipHeroAndHistory(rows)).toEqual({
      hero: rows[0],
      history: [],
    });
  });
});

describe('formatPayslipHeroNet (BR-ZEN-03)', () => {
  it('masks null net_amount', () => {
    expect(formatPayslipHeroNet(null)).toBe('—');
  });

  it('masks undefined net_amount', () => {
    expect(formatPayslipHeroNet(undefined)).toBe('—');
  });

  it('formats valid net_amount in VND', () => {
    expect(formatPayslipHeroNet(15_000_000, 'VND')).toContain('15');
  });

  it('hasDisplayableNetAmount rejects null', () => {
    expect(hasDisplayableNetAmount(null)).toBe(false);
    expect(hasDisplayableNetAmount(0)).toBe(true);
  });
});
