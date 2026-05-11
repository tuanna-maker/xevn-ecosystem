import { describe, expect, it } from 'vitest';
import {
  HrmApiClientError,
  mapCaughtFetchError,
  mapFailedHttpResponse,
  mapInvalidSuccessEnvelope,
} from './hrmApiErrors';

describe('mapCaughtFetchError', () => {
  it('maps AbortError to TIMEOUT', () => {
    const err = mapCaughtFetchError(new DOMException('Aborted', 'AbortError'));
    expect(err).toBeInstanceOf(HrmApiClientError);
    expect(err.code).toBe('TIMEOUT');
    expect(err.status).toBe(408);
  });

  it('maps generic fetch failure to NETWORK_ERROR with cause in details', () => {
    const err = mapCaughtFetchError(new TypeError('offline'));
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.status).toBe(0);
    expect(err.details).toEqual({ cause: 'offline' });
  });

  it('maps unknown rejection without Error prototype', () => {
    const err = mapCaughtFetchError('boom');
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.details).toBeUndefined();
  });
});

describe('mapFailedHttpResponse', () => {
  it('uses backend code and details when present', () => {
    const err = mapFailedHttpResponse(403, {
      success: false,
      code: 'HRM-ATT-FORBIDDEN',
      message: 'Forbidden',
      details: { field: 'x' },
    });
    expect(err.status).toBe(403);
    expect(err.code).toBe('HRM-ATT-FORBIDDEN');
    expect(err.message).toBe('Forbidden');
    expect(err.details).toEqual({ field: 'x' });
  });

  it('falls back to HTTP_<status> when body omits code', () => {
    const err = mapFailedHttpResponse(502, null);
    expect(err.code).toBe('HTTP_502');
    expect(err.message).toContain('502');
  });
});

describe('mapInvalidSuccessEnvelope', () => {
  it('uses HRM_INVALID_ENVELOPE when body is null', () => {
    const err = mapInvalidSuccessEnvelope(200, null);
    expect(err.code).toBe('HRM_INVALID_ENVELOPE');
  });

  it('preserves backend code on invalid envelope when provided', () => {
    const err = mapInvalidSuccessEnvelope(200, {
      success: true,
      code: 'HRM_INVALID_ENVELOPE',
      message: 'Bad shape',
      details: { reason: 'missing data' },
    });
    expect(err.code).toBe('HRM_INVALID_ENVELOPE');
    expect(err.details).toEqual({ reason: 'missing data' });
  });
});
