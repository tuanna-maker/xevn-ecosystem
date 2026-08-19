/**
 * apiError — PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01 AST toast taxonomy
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-05 AST', () => {
  it('maps HRM-EMP-ASSET-SERIAL-CONFLICT 409', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-EMP-ASSET-SERIAL-CONFLICT',
          message: '',
          status: 409,
        }),
      ),
    ).toMatch(/serial|Đang sử dụng|cấp phát/i);
  });

  it('maps HRM-EMP-ASSET-DELETE-FORBIDDEN', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-EMP-ASSET-DELETE-FORBIDDEN',
          message: '',
          status: 409,
        }),
      ),
    ).toMatch(/Thu hồi|xóa cứng|CORE-06/i);
  });

  it('maps HRM-EMP-ASSET-VAL-400', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-EMP-ASSET-VAL-400', message: '', status: 400 }),
      ),
    ).toMatch(/không hợp lệ|tài sản/i);
  });

  it('maps HRM-EMP-PROFILE-404', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-EMP-PROFILE-404', message: '', status: 404 }),
      ),
    ).toMatch(/không tìm thấy/i);
  });
});
