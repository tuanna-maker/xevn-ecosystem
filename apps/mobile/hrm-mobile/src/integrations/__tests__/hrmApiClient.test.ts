import { afterEach, describe, expect, it, vi } from 'vitest';
import { RELEASE_PILOT_HRM_API_BASE_URL } from '../../config/pilotApiBase';
import {
  getDefaultBaseUrl,
  hrmRequest,
  resolveHrmCompanyHeaderId,
  resolveHrmWriteHeaderId,
} from '../hrmApiClient';

const DU_LICH_UUID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const HOLDING_UUID = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';

describe('resolveHrmCompanyHeaderId', () => {
  it('uses legal UUID when scope slug is blocked main', () => {
    expect(resolveHrmCompanyHeaderId(DU_LICH_UUID, 'main')).toBe(DU_LICH_UUID);
  });

  it('prefers membership scope slug for UAT workforce GET (holding)', () => {
    expect(resolveHrmCompanyHeaderId(HOLDING_UUID, 'holding')).toBe('holding');
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

describe('resolveHrmWriteHeaderId', () => {
  it('uses legal UUID for holding workforce writes (uat.nv0001 parity)', () => {
    expect(resolveHrmWriteHeaderId(HOLDING_UUID, 'holding')).toBe(HOLDING_UUID);
  });

  it('falls back to read resolver when uuid absent', () => {
    expect(resolveHrmWriteHeaderId('', 'holding')).toBe('holding');
  });

  it('main rollup still maps write header to legal UUID', () => {
    expect(resolveHrmWriteHeaderId(DU_LICH_UUID, 'main')).toBe(DU_LICH_UUID);
  });
});

describe('hrmRequest x-company-id header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends scope slug holding on GET list when membership slug is holding', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers['x-company-id']).toBe('holding');
      return new Response(JSON.stringify({ success: true, code: 'OK', data: [], message: '', timestamp: '' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await hrmRequest(
      {
        baseUrl: 'https://example.test',
        tenantId: 'xevn',
        companyId: 'holding',
        companyUuid: HOLDING_UUID,
        accessToken: 'Bearer test',
      },
      '/attendance/update-requests?company_id=' + HOLDING_UUID + '&status=pending',
      { method: 'GET' },
    );

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('sends legal UUID on POST approve when membership slug is holding', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers['x-company-id']).toBe(HOLDING_UUID);
      return new Response(JSON.stringify({ success: true, code: 'HRM-ATT-REQ-201', data: {}, message: '', timestamp: '' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await hrmRequest(
      {
        baseUrl: 'https://example.test',
        tenantId: 'xevn',
        companyId: 'holding',
        companyUuid: HOLDING_UUID,
        accessToken: 'Bearer test',
      },
      '/attendance/update-requests/req-1/approve',
      { method: 'POST', body: JSON.stringify({ approver_name: 'Mobile Manager' }) },
    );

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('sends legal UUID on POST leave reject when membership slug is holding', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers['x-company-id']).toBe(HOLDING_UUID);
      return new Response(JSON.stringify({ success: true, code: 'HRM-ATT-REQ-201', data: {}, message: '', timestamp: '' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await hrmRequest(
      {
        baseUrl: 'https://example.test',
        tenantId: 'xevn',
        companyId: 'holding',
        companyUuid: HOLDING_UUID,
        accessToken: 'Bearer test',
      },
      '/attendance/leave-requests/req-2/reject',
      { method: 'POST', body: JSON.stringify({ reviewer_name: 'Mobile Manager', rejected_reason: 'test' }) },
    );

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('sends legal UUID on paths when scope slug is main', async () => {
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
