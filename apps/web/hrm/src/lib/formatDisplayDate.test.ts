import { describe, expect, it } from 'vitest';
import {
  formatDisplayDate,
  formatPayrollPayDateCell,
  payslipPayDateLabel,
} from './formatDisplayDate';

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

describe('EmployeeSalary payDate row (D-HRM-EMP-SALARY-INVALID-DATE-01)', () => {
  const invalidPayDateRows: Array<{ id: string; payDate: string | null | undefined }> = [
    { id: 'null', payDate: null },
    { id: 'undefined', payDate: undefined },
    { id: 'empty', payDate: '' },
    { id: 'period-mm-yyyy', payDate: '07/2026' },
    { id: 'period-yyyy-mm', payDate: '2026-07' },
    { id: 'garbage', payDate: 'not-a-date' },
    { id: 'whitespace', payDate: '   ' },
  ];

  it('never throws RangeError on invalid/null payDate rows', () => {
    for (const row of invalidPayDateRows) {
      expect(() => formatPayrollPayDateCell(row.payDate)).not.toThrow();
      expect(() => payslipPayDateLabel(row.payDate)).not.toThrow();
    }
  });

  it('renders safe labels for invalid payDate rows', () => {
    expect(formatPayrollPayDateCell(null)).toBe('—');
    expect(formatPayrollPayDateCell(undefined)).toBe('—');
    expect(formatPayrollPayDateCell('')).toBe('—');
    expect(formatPayrollPayDateCell('not-a-date')).toBe('—');
    expect(formatPayrollPayDateCell('07/2026')).toBe('07/2026');
    expect(formatPayrollPayDateCell('2026-07')).toBe('2026-07');
    expect(formatPayrollPayDateCell('2026-07-15')).toBe('15/07/2026');
  });

  it('simulates payroll table cell path (former crash line)', () => {
    // Previously: format(new Date(payroll.payDate), 'dd/MM/yyyy') threw Invalid time value
    const payroll = { payDate: '01/2025' as string | null };
    const cell = formatPayrollPayDateCell(payroll.payDate);
    expect(cell).toBe('01/2025');

    payroll.payDate = null;
    expect(formatPayrollPayDateCell(payroll.payDate)).toBe('—');
  });
});
