/**
 * Toast taxonomy — CORE-02 AuthZ / OVERLAP / VAL (+ RETAIN CB-403 public)
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-02 toast codes', () => {
  it('maps HRM-CORE-CB-AUTHZ-403 (≠ public CB-403)', () => {
    const msg = toErrorMessage(
      new ApiClientError({ code: 'HRM-CORE-CB-AUTHZ-403', message: '', status: 403 }),
      'fallback',
    );
    expect(msg.toLowerCase()).toMatch(/quyền|c&b|view_salary|mật/);
    expect(msg).not.toMatch(/hồ sơ công khai/);
  });

  it('maps HRM-COMP-409-OVERLAP and alias HRM-CORE-CB-OVERLAP-409', () => {
    for (const code of ['HRM-COMP-409-OVERLAP', 'HRM-CORE-CB-OVERLAP-409'] as const) {
      const msg = toErrorMessage(
        new ApiClientError({ code, message: '', status: 409 }),
        'fallback',
      );
      expect(msg.toLowerCase()).toMatch(/chồng|hiệu lực|khóa/);
    }
  });

  it('maps HRM-CORE-CB-VAL-400', () => {
    const msg = toErrorMessage(
      new ApiClientError({ code: 'HRM-CORE-CB-VAL-400', message: '', status: 400 }),
      'fallback',
    );
    expect(msg.toLowerCase()).toMatch(/hiệu lực|change_rate|c&b|hợp lệ/);
  });

  it('retains HRM-CORE-CB-403 public deny', () => {
    const msg = toErrorMessage(
      new ApiClientError({ code: 'HRM-CORE-CB-403', message: '', status: 403 }),
      'fallback',
    );
    expect(msg.toLowerCase()).toMatch(/công khai/);
  });
});
