/**
 * apiError — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01 CTR-CL toast taxonomy
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-09A CTR-CL', () => {
  it('maps HRM-CTR-CL-REQUIRED', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-CL-REQUIRED', message: '', status: 400 }),
        'fb',
      ),
    ).toMatch(/mã|tiêu đề|nội dung/i);
  });

  it('maps HRM-CTR-CL-CODE-CONFLICT', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-CL-CODE-CONFLICT', message: '', status: 409 }),
        'fb',
      ),
    ).toMatch(/phát hành|Tăng phiên bản|activate|snapshot/i);
  });

  it('maps HRM-CTR-CL-404', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CTR-CL-404', message: '', status: 404 }),
        'fb',
      ),
    ).toMatch(/Không tìm thấy|phạm vi/i);
  });
});
