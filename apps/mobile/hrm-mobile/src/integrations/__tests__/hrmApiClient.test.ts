import { afterEach, describe, expect, it, vi } from 'vitest';
import { RELEASE_PILOT_HRM_API_BASE_URL } from '../../config/pilotApiBase';
import { getDefaultBaseUrl, hrmRequest, resolveHrmCompanyHeaderId } from '../hrmApiClient';

const DU_LICH_UUID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

describe('resolveHrmCompanyHeaderId', () => {
  it('prefers membership company_uuid over scope slug main', () => {
    expect(resolveHrmCompanyHeaderId(DU_LICH_UUID, 'main')).toBe(DU_LICH_UUID);
  });

  it('uses slug only when no uuid is present', () => {
    expect(resolveHrmCompanyHeaderId('', 'holding')).toBe('holding');
  });

  it('blocks scope slug main without legal uuid', () => {
    expect(resolveHrmCompanyHeaderId(undefined, 'main')).toBe('');
  });

  it('falls back to companyId when it is already a uuid', () => {
    expect(resolveHrmCompanyHeaderId('', DU_LICH_UUID)).toBe(DU_LICH_UUID);
  });
});

describe('hrmRequest x-company-id header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends membership UUID on approve/pending paths, not literal main', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers['x-company-id']).toBe(DU_LICH_UUID);
      return new Response(JSON.stringify({ success: true, code: 'OK', data: [], message: '', timestamp: '' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await hrmRequest(
      {
        baseUrl: 'https://example.test',
        tenantId: 'tenant-du-lich',
        companyId: 'main',
        companyUuid: DU_LICH_UUID,
        accessToken: 'Bearer test',
      },
      '/attendance/leave-requests?company_id=' + DU_LICH_UUID + '&status=pending',
      { method: 'GET' },
    );

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe('getDefaultBaseUrl', () => {
  it('uses HTTPS pilot origin when env unset outside __DEV__', () => {
    const prevEnv = process.env.EXPO_PUBLIC_HRM_API_BASE_URL;
    const prevDev = (globalThis as { __DEV__?: boolean }).__DEV__;
    delete process.env.EXPO_PUBLIC_HRM_API_BASE_URL;
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    try {
      expect(getDefaultBaseUrl()).toBe(RELEASE_PILOT_HRM_API_BASE_URL);
    } finally {
      if (prevEnv !== undefined) process.env.EXPO_PUBLIC_HRM_API_BASE_URL = prevEnv;
      else delete process.env.EXPO_PUBLIC_HRM_API_BASE_URL;
      if (prevDev === undefined) delete (globalThis as { __DEV__?: boolean }).__DEV__;
      else (globalThis as { __DEV__?: boolean }).__DEV__ = prevDev;
    }
  });
});
