import { describe, expect, it } from 'vitest';
import {
  formatPayTimesheetStatusLabelVi,
  isPayTimesheetClosedForBind,
  resolvePayAtt412UserMessage,
  sortSheetsForPayBindPicker,
} from '@/lib/payPay01BindRing';

describe('payPay01BindRing', () => {
  it('maps closed status for bind gate', () => {
    expect(isPayTimesheetClosedForBind('closed')).toBe(true);
    expect(isPayTimesheetClosedForBind('submitted')).toBe(false);
    expect(formatPayTimesheetStatusLabelVi('closed')).toBe('Đã chốt');
  });

  it('resolvePayAtt412UserMessage for HRM-PAY-ATT-412', () => {
    const msg = resolvePayAtt412UserMessage('HRM-PAY-ATT-412', undefined);
    expect(msg).toMatch(/chốt/i);
    expect(msg).toMatch(/ATT-11/);
  });

  it('sortSheetsForPayBindPicker prefers closed headers', () => {
    const sorted = sortSheetsForPayBindPicker([
      { status: 'submitted', start_date: '2026-08-01', name: 'B' },
      { status: 'closed', start_date: '2026-07-01', name: 'A' },
    ]);
    expect(sorted[0].status).toBe('closed');
  });
});
