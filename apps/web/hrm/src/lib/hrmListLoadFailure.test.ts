import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/apiError';
import {
  HRM_LIST_LOAD_FAILED_SHORT,
  isListFetchFailureEmpty,
  isRateLimitApiError,
} from './hrmListLoadFailure';

describe('hrmListLoadFailure (D-HRM-INS-EMPTY-MASK-01 · D-P1-HRM-INTSVC-429-SILENT-EMPTY-01)', () => {
  it('isListFetchFailureEmpty only when error + zero rows', () => {
    expect(isListFetchFailureEmpty('RATE-429', 0)).toBe(true);
    expect(isListFetchFailureEmpty('  ', 0)).toBe(false);
    expect(isListFetchFailureEmpty('err', 3)).toBe(false);
    expect(isListFetchFailureEmpty(null, 0)).toBe(false);
  });

  it('isRateLimitApiError covers status and code', () => {
    expect(
      isRateLimitApiError(
        new ApiClientError({ status: 429, code: 'RATE-429', message: 'Too many' }),
      ),
    ).toBe(true);
    expect(isRateLimitApiError({ status: 429 })).toBe(true);
    expect(isRateLimitApiError({ code: 'RATE-429' })).toBe(true);
    expect(isRateLimitApiError(new ApiClientError({ status: 500, code: 'X' }))).toBe(false);
  });

  it('exposes non-empty short label (never 0 / hyphen)', () => {
    expect(HRM_LIST_LOAD_FAILED_SHORT).not.toBe('0');
    expect(HRM_LIST_LOAD_FAILED_SHORT).not.toBe('-');
    expect(HRM_LIST_LOAD_FAILED_SHORT.length).toBeGreaterThan(0);
  });
});
