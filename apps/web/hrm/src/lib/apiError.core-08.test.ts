/**
 * apiError — PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01 RD toast taxonomy
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-08 RD', () => {
  it('maps HRM-CORE-RD-VAL-400', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CORE-RD-VAL-400', message: '', status: 400 }),
      ),
    ).toMatch(/tiêu đề|kỳ lương|số tiền/i);
  });

  it('maps HRM-CORE-RD-ENFORCE-409', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CORE-RD-ENFORCE-409', message: '', status: 409 }),
      ),
    ).toMatch(/thi hành|kỳ|trạng thái/i);
  });

  it('maps HRM-CORE-RD-DUAL-PERIOD-409', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-CORE-RD-DUAL-PERIOD-409',
          message: '',
          status: 409,
        }),
      ),
    ).toMatch(/hai kỳ|một khoản/i);
  });

  it('maps HRM-CORE-RD-LOCKED-PERIOD-409', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-CORE-RD-LOCKED-PERIOD-409',
          message: '',
          status: 409,
        }),
      ),
    ).toMatch(/khóa|phiếu lương/i);
  });

  it('maps HRM-CORE-RD-EMP-INACTIVE-409', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-CORE-RD-EMP-INACTIVE-409',
          message: '',
          status: 409,
        }),
      ),
    ).toMatch(/Hoạt động/i);
  });

  it('maps PERIOD-404 and RD-404', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CORE-RD-PERIOD-404', message: '', status: 404 }),
      ),
    ).toMatch(/kỳ lương/i);
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CORE-RD-404', message: '', status: 404 }),
      ),
    ).toMatch(/khen thưởng|kỷ luật|không tìm/i);
  });
});
