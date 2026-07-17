import { describe, expect, it } from 'vitest';
import { isAbortLikeError } from '@/lib/apiError';

describe('isAbortLikeError', () => {
  it('detects DOMException AbortError', () => {
    const error = new DOMException('signal is aborted without reason', 'AbortError');
    expect(isAbortLikeError(error)).toBe(true);
  });

  it('detects Error with aborted message', () => {
    expect(isAbortLikeError(new Error('signal is aborted without reason'))).toBe(true);
  });

  it('returns false for API errors', () => {
    expect(isAbortLikeError(new Error('Too many requests'))).toBe(false);
  });
});
