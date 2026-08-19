/**
 * U72 — statusLabel never returns raw English / snake_case (M-F-01..M-F-03).
 */
import { describe, expect, it } from 'vitest';
import { statusLabel } from '../mapApiError';

describe('statusLabel — D-MOB-U72-LABEL-FE-01', () => {
  it('maps contract / insurance statuses (M-F-01)', () => {
    expect(statusLabel('active')).toBe('Đang hiệu lực');
    expect(statusLabel('expired')).toBe('Hết hạn');
    expect(statusLabel('terminated')).toBe('Chấm dứt');
  });

  it('maps payroll / payslip statuses (M-F-02)', () => {
    expect(statusLabel('draft')).toBe('Nháp');
    expect(statusLabel('processed')).toBe('Đã xử lý');
    expect(statusLabel('paid')).toBe('Đã trả');
    expect(statusLabel('closed')).toBe('Đã đóng');
  });

  it('maps leave / update lifecycle including cancelled (M-F-03)', () => {
    expect(statusLabel('pending')).toBe('Chờ duyệt');
    expect(statusLabel('approved')).toBe('Đã duyệt');
    expect(statusLabel('rejected')).toBe('Từ chối');
    expect(statusLabel('cancelled')).toBe('Đã hủy');
  });

  it('unknown / empty → em dash — never raw English', () => {
    expect(statusLabel('')).toBe('—');
    expect(statusLabel('CUSTOM_STATUS_X')).toBe('—');
    expect(statusLabel('snake_case_enum')).toBe('—');
    expect(statusLabel('CUSTOM_STATUS_X')).not.toBe('CUSTOM_STATUS_X');
  });
});
