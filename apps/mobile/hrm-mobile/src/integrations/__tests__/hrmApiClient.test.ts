import { afterEach, describe, expect, it, vi } from 'vitest';
import { RELEASE_PILOT_HRM_API_BASE_URL } from '../../config/pilotApiBase';
import {
  formatAttendanceRecordsPostLogLine,
  getDefaultBaseUrl,
  hrmRequest,
  isAttendanceRecordsCheckInPost,
  resolveHrmCompanyHeaderId,
  resolveHrmWriteHeaderId,
} from '../hrmApiClient';

const DU_LICH_UUID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';

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

describe('MOB-04 attendance POST QA log line', () => {
  const prevDeepLink = process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK;
  const prevDevLogin = process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (prevDeepLink === undefined) delete process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK;
    else process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK = prevDeepLink;
    if (prevDevLogin === undefined) delete process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN;
    else process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = prevDevLogin;
  });

  it('isAttendanceRecordsCheckInPost matches POST check-in only', () => {
    expect(isAttendanceRecordsCheckInPost('/attendance/records', 'POST')).toBe(true);
    expect(isAttendanceRecordsCheckInPost('/attendance/records?company_id=x', 'GET')).toBe(false);
    expect(isAttendanceRecordsCheckInPost('/attendance/records?x=1', 'POST')).toBe(true);
    expect(isAttendanceRecordsCheckInPost('/attendance/update-requests', 'POST')).toBe(false);
  });

  it('formatAttendanceRecordsPostLogLine includes http from response when envelope ok', () => {
    const line = formatAttendanceRecordsPostLogLine(
      { ok: true, data: {}, code: 'HRM-ATT-201', requestId: 'r1' },
      201,
    );
    expect(line).toBe('attendance/records POST ok=true code=HRM-ATT-201 http=201');
  });

  it('emits [HRM-MOB] attendance/records POST line on qa-device QA flags', async () => {
    process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK = '1';
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = '1';
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          code: 'HRM-ATT-201',
          data: { id: 'rec-1' },
          message: '',
          timestamp: '',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await hrmRequest(
      {
        baseUrl: 'http://10.0.2.2:28001',
        tenantId: 'xevn',
        companyId: 'holding',
        companyUuid: HOLDING_UUID,
        accessToken: 'Bearer test',
      },
      '/attendance/records',
      {
        method: 'POST',
        body: JSON.stringify({
          company_id: HOLDING_UUID,
          employee_id: 'emp-1',
          check_in_channel: 'gps',
        }),
      },
    );

    expect(
      infoSpy.mock.calls.some((args) =>
        String(args[0]).includes('[HRM-MOB] attendance/records POST ok=true code=HRM-ATT-201 http=201'),
      ),
    ).toBe(true);
  });
});

describe('getDefaultBaseUrl', () => {
  it('uses deploy/dev HRM origin when env unset outside __DEV__', () => {
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
