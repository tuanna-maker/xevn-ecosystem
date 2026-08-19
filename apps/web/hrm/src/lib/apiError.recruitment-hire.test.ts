import { describe, expect, it } from 'vitest';
import { toErrorMessage } from '@/lib/apiError';

describe('toErrorMessage recruitment hire (UC-BP-REC-07)', () => {
  it('maps OFFER-INVALID distinct from CANCELLED and PREFILL-FAIL', () => {
    const invalid = toErrorMessage(
      { code: 'HRM-REC-HIRE-OFFER-INVALID', message: 'raw', status: 400 },
      'fallback',
    );
    const cancelled = toErrorMessage(
      { code: 'HRM-REC-HIRE-CANCELLED', message: 'raw', status: 400 },
      'fallback',
    );
    const prefill = toErrorMessage(
      { code: 'HRM-REC-HIRE-PREFILL-FAIL', message: 'raw', status: 400 },
      'fallback',
    );
    expect(invalid).toMatch(/offer-ready|điều kiện/i);
    expect(cancelled).toMatch(/hủy/i);
    expect(prefill).toMatch(/bắt buộc|họ tên|đơn vị/i);
    expect(invalid).not.toBe(cancelled);
    expect(cancelled).not.toBe(prefill);
  });

  it('maps DUP and PAY-403 distinct from HIRE-409', () => {
    const dup = toErrorMessage(
      { code: 'HRM-REC-HIRE-DUP', message: 'raw', status: 409 },
      'fallback',
    );
    const pay = toErrorMessage(
      { code: 'HRM-REC-PAY-403', message: 'raw', status: 403 },
      'fallback',
    );
    const cross = toErrorMessage(
      { code: 'HRM-REC-HIRE-409', message: 'raw', status: 409 },
      'fallback',
    );
    expect(dup).toMatch(/xung đột|thứ hai/i);
    expect(pay).toMatch(/lương|payslip|payroll/i);
    expect(cross).toMatch(/đơn vị/i);
    expect(dup).not.toBe(cross);
  });
});
