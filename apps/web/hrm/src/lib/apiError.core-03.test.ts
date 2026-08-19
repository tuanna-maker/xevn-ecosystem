/**
 * apiError — PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01 CHK toast taxonomy
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('apiError CORE-03 CHK', () => {
  it('maps HRM-EMP-DOC-TYPE-UNKNOWN invent KEY', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-EMP-DOC-TYPE-UNKNOWN', message: '', status: 400 }),
      ),
    ).toMatch(/catalog hiệu lực|Loại giấy tờ/i);
  });

  it('maps HRM-CORE-CHK-VAL-400', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CORE-CHK-VAL-400', message: '', status: 400 }),
      ),
    ).toMatch(/checklist|không hợp lệ/i);
  });

  it('maps HRM-CORE-CHK-CONFLICT-409', () => {
    expect(
      toErrorMessage(
        new ApiClientError({
          code: 'HRM-CORE-CHK-CONFLICT-409',
          message: '',
          status: 409,
        }),
      ),
    ).toMatch(/cùng mã|active/i);
  });

  it('maps HRM-CORE-CHK-404', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-CORE-CHK-404', message: '', status: 404 }),
      ),
    ).toMatch(/không tìm thấy|checklist/i);
  });
});
