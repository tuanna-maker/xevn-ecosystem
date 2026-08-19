import { describe, expect, it } from 'vitest';
import { RELEASE_PILOT_HRM_API_BASE_URL } from '../../config/pilotApiBase';
import { normalizeHrmBaseUrl } from '../normalizeHrmBaseUrl';

describe('normalizeHrmBaseUrl', () => {
  it('returns pilot fallback for empty input', () => {
    expect(normalizeHrmBaseUrl('', RELEASE_PILOT_HRM_API_BASE_URL)).toBe(
      RELEASE_PILOT_HRM_API_BASE_URL,
    );
  });

  it('strips trailing slash and path from deep-link base_url', () => {
    expect(normalizeHrmBaseUrl('http://14.225.217.232:3001/')).toBe('http://14.225.217.232:3001');
    expect(normalizeHrmBaseUrl('http://14.225.217.232:3001/api/hrm')).toBe(
      'http://14.225.217.232:3001',
    );
  });

  it('rejects non-http schemes', () => {
    expect(normalizeHrmBaseUrl('xevn://qa-login', 'http://127.0.0.1:3001')).toBe(
      'http://127.0.0.1:3001',
    );
  });

  it('accepts localhost for emulator dev', () => {
    expect(normalizeHrmBaseUrl('http://10.0.2.2:3001')).toBe('http://10.0.2.2:3001');
  });
});
