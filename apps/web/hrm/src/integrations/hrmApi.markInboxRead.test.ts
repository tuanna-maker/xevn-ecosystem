import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getPortalAccessToken = vi.fn();
const getPortalSessionUser = vi.fn();
const waitForPortalAccessToken = vi.fn();
const hasPortalSession = vi.fn(() => true);

vi.mock('@/lib/portalAuthBridge', () => ({
  getPortalAccessToken: () => getPortalAccessToken(),
  getPortalSessionUser: () => getPortalSessionUser(),
  waitForPortalAccessToken: (...args: unknown[]) => waitForPortalAccessToken(...args),
  hasPortalSession: () => hasPortalSession(),
}));

import { markHrmInboxNotificationRead } from './hrmApi';

const JWT_TRSPORT =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJ0cnNwb3J0IiwidGVuYW50SWQiOiJ4ZXZuIn0.';

/** Pilot OU UUID — mirrors HRM_COMPANY_UUID_BY_SLUG.trsport */
const TRSPORT_COMPANY_UUID = '10000000-0000-4000-8000-000000000002';

describe('PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01 — mark inbox read company UUID', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    history.replaceState(null, '', '/hr/notifications?portal=1&tenantId=xevn&companyId=trsport');
    hasPortalSession.mockReturnValue(true);
    getPortalAccessToken.mockReturnValue(JWT_TRSPORT);
    getPortalSessionUser.mockReturnValue({ userId: 'uat-nv0001' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    getPortalAccessToken.mockReset();
    getPortalSessionUser.mockReset();
    waitForPortalAccessToken.mockReset();
    hasPortalSession.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('PATCH inbox read resolves slug company_id → UUID query (HRM-NOTIF-202)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-NOTIF-202',
        message: 'Marked read',
        data: {
          id: 'notif-1',
          company_id: TRSPORT_COMPANY_UUID,
          event_type: 'leave_request.created',
          read_at: '2026-08-04T05:00:00.000Z',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-inbox-mark-read' } as Crypto);

    const result = await markHrmInboxNotificationRead('notif-1', {
      company_id: 'trsport',
      viewer_employee_id: 'emp-uat-0001',
    });

    expect(result.read_at).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('/api/hrm/notifications/inbox/notif-1/read');
    expect(requestUrl).toContain(`company_id=${encodeURIComponent(TRSPORT_COMPANY_UUID)}`);
    expect(requestUrl).not.toContain('company_id=trsport');
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(options?.method).toBe('PATCH');
    expect(JSON.parse(String(options?.body))).toEqual({ viewer_employee_id: 'emp-uat-0001' });
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers['x-company-id']).toBe('trsport');
  });

  it('PATCH inbox read passes through UUID company_id unchanged', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-NOTIF-202',
        message: 'Marked read',
        data: {
          id: 'notif-2',
          company_id: TRSPORT_COMPANY_UUID,
          event_type: 'leave_request.created',
          read_at: '2026-08-04T05:01:00.000Z',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-inbox-mark-uuid' } as Crypto);

    await markHrmInboxNotificationRead('notif-2', {
      company_id: TRSPORT_COMPANY_UUID,
      viewer_employee_id: 'emp-uat-0001',
    });

    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain(`company_id=${encodeURIComponent(TRSPORT_COMPANY_UUID)}`);
  });
});
