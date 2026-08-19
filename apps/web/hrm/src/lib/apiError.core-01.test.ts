/**
 * Toast taxonomy — CORE-01 CB-403 / DEP-*
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-01 toast codes', () => {
  it('maps HRM-CORE-CB-403', () => {
    const msg = toErrorMessage(
      new ApiClientError({ code: 'HRM-CORE-CB-403', message: '', status: 403 }),
      'fallback',
    );
    expect(msg.toLowerCase()).toMatch(/công khai|lương|mst|bhxh/);
  });

  it('maps HRM-CORE-DEP-VAL-400', () => {
    const msg = toErrorMessage(
      new ApiClientError({ code: 'HRM-CORE-DEP-VAL-400', message: '', status: 400 }),
      'fallback',
    );
    expect(msg.toLowerCase()).toMatch(/phụ thuộc|ngày sinh|quan hệ/);
  });

  it('maps HRM-CORE-DEP-404', () => {
    const msg = toErrorMessage(
      new ApiClientError({ code: 'HRM-CORE-DEP-404', message: '', status: 404 }),
      'fallback',
    );
    expect(msg.toLowerCase()).toMatch(/phụ thuộc|không tìm thấy/);
  });
});
