import { describe, expect, it } from 'vitest';
import { formatHrmError, formatHrmSuccess } from '../mapApiError';

describe('formatHrmSuccess', () => {
  it('maps HRM-ATT-REQ-203 to user-facing Vietnamese', () => {
    expect(formatHrmSuccess('HRM-ATT-REQ-203')).toBe('Đã duyệt đơn chỉnh sửa chấm công');
  });
});

describe('formatHrmError', () => {
  it('formats failed API result', () => {
    expect(
      formatHrmError({
        ok: false,
        code: 'HRM-ERR-VALIDATION',
        message: 'Invalid payload',
        requestId: 'r1',
      }),
    ).toBe('HRM-ERR-VALIDATION: Invalid payload');
  });
});
