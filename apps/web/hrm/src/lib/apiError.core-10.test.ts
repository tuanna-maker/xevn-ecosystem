/**
 * apiError — CORE-10 ACTION-400 / HRM-SI-ACTION-400 surface
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError, toErrorMessage } from './apiError';

describe('toErrorMessage CORE-10 SI actions', () => {
  it('surfaces HRM-SI-ACTION-400 with căn cứ / effective_from hint', () => {
    const msg = toErrorMessage(
      new ApiClientError({
        code: 'HRM-SI-ACTION-400',
        message: 'raw',
        status: 400,
      }),
      'fallback',
    );
    expect(msg).toMatch(/căn cứ|suspend_reason|hiệu lực/i);
  });

  it('surfaces ACTION-400 alias', () => {
    const msg = toErrorMessage(
      new ApiClientError({
        code: 'ACTION-400',
        message: 'raw',
        status: 400,
      }),
      'fallback',
    );
    expect(msg).toMatch(/ACTION-400|căn cứ|hiệu lực/i);
  });
});
