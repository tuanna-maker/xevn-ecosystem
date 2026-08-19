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

import { updateAttendanceStatus } from './hrmApi';

/** JWT payload: { companyId: "trsport", tenantId: "xevn" } */
const JWT_TRSPORT =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJ0cnNwb3J0IiwidGVuYW50SWQiOiJ4ZXZuIn0.';

const attendanceRow = {
  id: 'att-rec-r3-1',
  company_id: 'trsport',
  employee_id: 'emp-7',
  employee_code: 'VTH-0007',
  employee_name: 'Phan Văn An',
  department: 'Ops',
  attendance_date: '2026-08-04',
  check_in_at: '2026-08-04T01:00:00.000Z',
  check_out_at: null,
  status: 'pending',
  note: null,
  created_by: null,
  updated_by: 'uat-nv0007',
  created_at: '2026-08-04T01:00:00.000Z',
  updated_at: '2026-08-04T07:00:00.000Z',
};

describe('PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE — records status PATCH mutate scope', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    history.replaceState(null, '', '/hr/attendance?portal=1&tenantId=xevn&companyId=trsport');
    hasPortalSession.mockReturnValue(true);
    getPortalAccessToken.mockReturnValue(JWT_TRSPORT);
    getPortalSessionUser.mockReturnValue({ userId: 'uat-nv0007' });
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

  it('NV JWT companyId=trsport → x-company-id=trsport on PATCH status (not main)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-ATT-202',
        message: 'Updated',
        data: attendanceRow,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-att-status-trsport' } as Crypto);

    await updateAttendanceStatus(
      'att-rec-r3-1',
      { status: 'pending', note: 'QA R3 scope', updated_by: 'uat-nv0007' },
      'trsport',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('/api/hrm/attendance/records/att-rec-r3-1/status');
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers['x-company-id']).toBe('trsport');
    expect(headers['x-company-id']).not.toBe('main');
    expect(headers['x-tenant-id']).toBe('xevn');
    expect(options?.method).toBe('PATCH');
  });
});
