import { describe, expect, it } from 'vitest';
import { toErrorMessage } from '@/lib/apiError';

describe('toErrorMessage recruitment mail + eval (UC-BP-REC-06)', () => {
  it('maps MAIL-CC-REQUIRED distinct from TEMPLATE-INACTIVE', () => {
    const cc = toErrorMessage(
      { code: 'HRM-REC-MAIL-CC-REQUIRED', message: 'raw', status: 400 },
      'fallback',
    );
    const inactive = toErrorMessage(
      { code: 'HRM-REC-MAIL-TEMPLATE-INACTIVE', message: 'raw', status: 400 },
      'fallback',
    );
    expect(cc).toMatch(/CC/i);
    expect(inactive).toMatch(/Mẫu thư/i);
    expect(cc).not.toBe(inactive);
  });

  it('maps EVAL PASSFAIL / NEO / ROUND-GATE distinct', () => {
    const pf = toErrorMessage(
      { code: 'HRM-REC-EVAL-PASSFAIL-REQUIRED', message: 'raw', status: 400 },
      'fallback',
    );
    const neo = toErrorMessage(
      { code: 'HRM-REC-EVAL-NEO-REQUIRED', message: 'raw', status: 400 },
      'fallback',
    );
    const round = toErrorMessage(
      { code: 'HRM-REC-EVAL-ROUND-GATE', message: 'raw', status: 400 },
      'fallback',
    );
    expect(pf).toMatch(/Pass|Fail|Đạt/i);
    expect(neo).toMatch(/YCTD/i);
    expect(round).toMatch(/phỏng vấn|TERMINAL|kết thúc/i);
    expect(pf).not.toBe(neo);
    expect(neo).not.toBe(round);
  });

  it('maps PROVIDER-FAIL as no-stage message', () => {
    const msg = toErrorMessage(
      { code: 'HRM-REC-MAIL-PROVIDER-FAIL', message: 'raw', status: 400 },
      'fallback',
    );
    expect(msg).toMatch(/không đổi giai đoạn/i);
  });
});
