import { describe, expect, it } from 'vitest';
import { formatHrmError } from '../mapApiError';

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
