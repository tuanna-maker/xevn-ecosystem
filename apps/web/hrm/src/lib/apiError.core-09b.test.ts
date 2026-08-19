/**
 * apiError — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01 CTR pack/preview toast taxonomy
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-09B CTR pack/preview', () => {
  it('maps HRM-CTR-TPL-NONE', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-TPL-NONE', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/mẫu|Cài đặt|Điều khoản/i);
  });

  it('maps HRM-CTR-PACK-INVALID', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-PACK-INVALID', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/Gói nghề|Chung|Lái xe/i);
  });

  it('maps HRM-CTR-TPL-PACK-MISMATCH', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-TPL-PACK-MISMATCH', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/không khớp|mẫu|IT_OFFICE|DRIVER/i);
  });

  it('maps HRM-CTR-DRIVER-REQUIRED', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-DRIVER-REQUIRED', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/GPLX|biển số|Lái xe/i);
  });
});
