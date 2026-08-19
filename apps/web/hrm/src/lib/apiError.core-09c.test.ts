/**
 * apiError — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01 CTR VER/PDF toast taxonomy
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-09C CTR VER/PDF', () => {
  it('maps HRM-CTR-ISSUE-BLOCKED', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-ISSUE-BLOCKED', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/ban hành|thiếu|điều khoản/i);
  });

  it('maps HRM-CTR-VERSION-NOT-ISSUED', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-CTR-VERSION-NOT-ISSUED',
          message: '',
          status: 400,
        }),
        'fb',
      ),
    ).toMatch(/phát hành|issued|PDF/i);
  });

  it('maps HRM-CTR-PV-404', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-PV-404', message: '', status: 404 }),
        'fb',
      ),
    ).toMatch(/Không tìm thấy|phiên bản/i);
  });

  it('maps HRM-CTR-RENDER-FAIL', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-RENDER-FAIL', message: '', status: 500 }),
        'fb',
      ),
    ).toMatch(/PDF|snapshot|thư viện live/i);
  });

  it('RETAIN TERM-INVALID + DRIVER from 09b for VER gate', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-TERM-INVALID', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/thời hạn|thử việc/i);
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-DRIVER-REQUIRED', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/GPLX|biển số/i);
  });
});
