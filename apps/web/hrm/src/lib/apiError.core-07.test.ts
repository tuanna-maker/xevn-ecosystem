/**
 * apiError — CORE-07 activate GATE codes
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-07 activate', () => {
  it('maps HRM-EMP-ACT-CHECKLIST-INCOMPLETE 409', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-EMP-ACT-CHECKLIST-INCOMPLETE',
          message: '',
          status: 409,
        }),
      ),
    ).toMatch(/Checklist giấy tờ bắt buộc chưa đủ/i);
  });

  it('maps HRM-EMP-ACT-400', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-EMP-ACT-400',
          message: '',
          status: 400,
        }),
      ),
    ).toMatch(/ngày hiệu lực/i);
  });
});
