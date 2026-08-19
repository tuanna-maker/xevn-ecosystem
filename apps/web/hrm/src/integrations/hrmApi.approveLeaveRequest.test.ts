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

import { approveLeaveRequest, cancelLeaveRequest, rejectLeaveRequest } from './hrmApi';

/** JWT payload: { companyId: "trsport", tenantId: "xevn" } */
const JWT_TRSPORT =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJ0cnNwb3J0IiwidGVuYW50SWQiOiJ4ZXZuIn0.';

const leaveRow = {
  id: 'lr-at12-1',
  company_id: 'trsport',
  employee_id: 'emp-7',
  employee_code: 'VTH-0007',
  employee_name: 'Phan Văn An',
  leave_type: 'LVT_01',
  start_date: '2026-08-10',
  end_date: '2026-08-10',
  reason: 'Nghỉ phép',
  status: 'approved',
  requested_at: '2026-08-04T01:00:00.000Z',
  reviewed_at: '2026-08-04T02:00:00.000Z',
  reviewed_by: 'QL VTH-0002',
  department: 'Ops',
  position: 'Staff',
  total_days: '1',
  handover_to: null,
  handover_tasks: null,
  approver_employee_id: 'emp-2',
  rejected_reason: null,
};

describe('PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01 — leave approve mutate scope', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    history.replaceState(null, '', '/hr/attendance?portal=1&tenantId=xevn&companyId=trsport');
    hasPortalSession.mockReturnValue(true);
    getPortalAccessToken.mockReturnValue(JWT_TRSPORT);
    getPortalSessionUser.mockReturnValue({ userId: 'mgr-nv0002' });
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

  it('mgr JWT companyId=trsport → x-company-id=trsport on leave approve (not main)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-LEAVE-200',
        message: 'Approved',
        data: leaveRow,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-leave-approve-trsport' } as Crypto);

    await approveLeaveRequest(
      'lr-at12-1',
      { reviewer_name: 'QL VTH-0002', reviewer_employee_id: 'emp-2' },
      'trsport',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('/api/hrm/attendance/leave-requests/lr-at12-1/approve');
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers['x-company-id']).toBe('trsport');
    expect(headers['x-company-id']).not.toBe('main');
    expect(headers['x-tenant-id']).toBe('xevn');
  });

  it('mgr JWT companyId=trsport → x-company-id=trsport on leave reject', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-LEAVE-200',
        message: 'Rejected',
        data: { ...leaveRow, status: 'rejected', rejected_reason: 'Không đủ số dư' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-leave-reject-trsport' } as Crypto);

    await rejectLeaveRequest(
      'lr-at12-1',
      {
        reviewer_name: 'QL VTH-0002',
        reviewer_employee_id: 'emp-2',
        rejected_reason: 'Không đủ số dư',
      },
      'trsport',
    );

    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers['x-company-id']).toBe('trsport');
    expect(headers['x-company-id']).not.toBe('main');
  });

  it('mgr JWT companyId=trsport → x-company-id=trsport on leave cancel', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-LEAVE-205',
        message: 'Cancelled',
        data: { ...leaveRow, status: 'cancelled' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-leave-cancel-trsport' } as Crypto);

    await cancelLeaveRequest(
      'lr-at12-1',
      {
        reviewer_name: 'QL VTH-0002',
        reviewer_employee_id: 'emp-2',
      },
      'trsport',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('/api/hrm/attendance/leave-requests/lr-at12-1/cancel');
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers['x-company-id']).toBe('trsport');
    expect(headers['x-company-id']).not.toBe('main');
  });
});
