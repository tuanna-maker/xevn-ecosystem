import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';

describe('FE-HRM-G-AT10-02-TOAST-01 — leave create VAL codes', () => {
  it('maps HRM-LEAVE-VAL-OVERLAP (409) to clear Vietnamese toast', () => {
    const msg = toErrorMessage(
      new ApiClientError({
        code: 'HRM-LEAVE-VAL-OVERLAP',
        status: 409,
        message: 'Leave request overlaps an existing pending or approved leave',
        details: { conflicting_id: 'lr-1', conflicting_status: 'pending' },
      }),
      'fallback',
    );
    expect(msg).toContain('trùng');
    expect(msg).not.toBe('Leave request overlaps an existing pending or approved leave');
    expect(msg).not.toBe('fallback');
  });

  it('maps HRM-LEAVE-VAL-BALANCE (400) with available/requested days', () => {
    const msg = toErrorMessage(
      new ApiClientError({
        code: 'HRM-LEAVE-VAL-BALANCE',
        status: 400,
        message: 'Insufficient leave balance for requested total_days',
        details: {
          available_days: 2,
          requested_days: 5,
          leave_type: 'annual',
          balance_year: 2026,
        },
      }),
      'fallback',
    );
    expect(msg).toContain('Còn 2 ngày');
    expect(msg).toContain('yêu cầu 5 ngày');
    expect(msg).not.toContain('Insufficient leave balance');
  });

  it('maps HRM-LEAVE-VAL-BALANCE without details to static VI', () => {
    const msg = toErrorMessage(
      new ApiClientError({
        code: 'HRM-LEAVE-VAL-BALANCE',
        status: 400,
        message: 'Insufficient leave balance for requested total_days',
      }),
      'fallback',
    );
    expect(msg).toContain('số dư phép');
    expect(msg).not.toBe('fallback');
  });
});
