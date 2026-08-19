import { describe, expect, it } from 'vitest';
import { toErrorMessage } from '@/lib/apiError';

describe('toErrorMessage recruitment stage transition (UC-BP-REC-05)', () => {
  it('maps REJECT-REASON distinct from UNKNOWN', () => {
    const reject = toErrorMessage(
      { code: 'HRM-REC-STAGE-REJECT-REASON', message: 'raw', status: 400 },
      'fallback',
    );
    const unknown = toErrorMessage(
      { code: 'HRM-REC-STAGE-UNKNOWN', message: 'raw', status: 400 },
      'fallback',
    );
    expect(reject).toContain('lý do');
    expect(unknown).toContain('catalog hiệu lực');
    expect(reject).not.toBe(unknown);
  });

  it('maps REVERSE-FORBIDDEN and EMPTY-CATALOG distinct from REJECT', () => {
    const reverse = toErrorMessage(
      { code: 'HRM-REC-STAGE-REVERSE-FORBIDDEN', message: 'raw', status: 400 },
      'fallback',
    );
    const empty = toErrorMessage(
      { code: 'HRM-REC-STAGE-EMPTY-CATALOG', message: 'raw', status: 400 },
      'fallback',
    );
    const reject = toErrorMessage(
      { code: 'HRM-REC-STAGE-REJECT-REASON', message: 'raw', status: 400 },
      'fallback',
    );
    expect(reverse).toContain('đảo chiều');
    expect(empty).toContain('Cài đặt');
    expect(reverse).not.toBe(reject);
    expect(empty).not.toBe(reject);
  });
});
