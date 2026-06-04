import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/apiError';

const getPortalAccessToken = vi.fn();
const getPortalSessionUser = vi.fn();
const waitForPortalAccessToken = vi.fn();

vi.mock('@/lib/portalAuthBridge', () => ({
  getPortalAccessToken: () => getPortalAccessToken(),
  getPortalSessionUser: () => getPortalSessionUser(),
  waitForPortalAccessToken: (...args: unknown[]) => waitForPortalAccessToken(...args),
  hasPortalSession: () => true,
}));

import { getEmployeeById, listAttendanceRecords } from './hrmApi';

describe('getEmployeeById', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    getPortalAccessToken.mockReset();
    getPortalSessionUser.mockReset();
    waitForPortalAccessToken.mockReset();
  });

  it('prefers main scope first and retries another scope after 409', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          code: 'SCOPE_CONTEXT_MISMATCH',
          message: 'Scope mismatch',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 'HRM-EMP-200',
          message: 'Employee retrieved',
          data: {
            id: 'emp-1',
            company_id: 'subsidiary-a',
            employee_code: 'NV0001',
            email: 'nv0001@xe.vn',
            full_name: 'Nguyen Van A',
            job_title_key: 'staff',
            status: 'active',
            hired_at: '2025-01-01',
            archived_at: null,
            custom_fields: {},
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-02T00:00:00.000Z',
          },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-1' } as Crypto);
    getPortalAccessToken.mockReturnValue('portal-token');
    getPortalSessionUser.mockReturnValue({ userId: 'user-1' });

    const employee = await getEmployeeById('emp-1', ['subsidiary-a', 'main']);

    expect(employee?.id).toBe('emp-1');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstUrl = String(fetchMock.mock.calls[0]?.[0]);
    const secondUrl = String(fetchMock.mock.calls[1]?.[0]);
    expect(firstUrl).toContain('company_id=main');
    expect(secondUrl).toContain('company_id=subsidiary-a');
    expect(firstUrl).not.toContain('include_archived');
    expect(secondUrl).not.toContain('include_archived');
    const firstOptions = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const firstHeaders = (firstOptions?.headers ?? {}) as Record<string, string>;
    expect(firstHeaders.Authorization).toBe('Bearer portal-token');
    expect(firstHeaders['x-access-token']).toBe('portal-token');
    expect(firstHeaders['x-portal-access-token']).toBe('portal-token');
  });

  it('matches employee id case-insensitively', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-EMP-200',
        message: 'Employee retrieved',
        data: {
          id: '00000000-0000-4000-8000-000000000021',
          company_id: 'main',
          employee_code: 'NV0021',
          email: 'nv0021@xe.vn',
          full_name: 'Nguyen NhanSu0021',
          job_title_key: 'staff',
          status: 'active',
          hired_at: '2025-01-01',
          archived_at: null,
          custom_fields: {},
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-02T00:00:00.000Z',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-case' } as Crypto);
    getPortalAccessToken.mockReturnValue('portal-token');
    getPortalSessionUser.mockReturnValue({ userId: 'user-1' });

    const employee = await getEmployeeById(
      '00000000-0000-4000-8000-000000000021',
      ['main'],
    );

    expect(employee?.full_name).toBe('Nguyen NhanSu0021');
  });

  it('returns null on all 404 scopes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          code: 'HRM-DATA-404',
          message: 'Not found',
        }),
      });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-2' } as Crypto);
    getPortalAccessToken.mockReturnValue('portal-token');
    getPortalSessionUser.mockReturnValue({ userId: 'user-1' });

    const employee = await getEmployeeById('missing', ['main']);

    expect(employee).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws non-scope API errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        code: 'HRM-SYS-001',
        message: 'System error',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-3' } as Crypto);
    getPortalAccessToken.mockReturnValue('portal-token');
    getPortalSessionUser.mockReturnValue({ userId: 'user-1' });

    await expect(getEmployeeById('emp-1', ['main'])).rejects.toBeInstanceOf(ApiClientError);
  });

  it('waits for portal token before attendance request', async () => {
    history.replaceState(null, '', '/hr/attendance?portal=1&companyId=main');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 'HRM-ATT-200',
        message: 'Attendance records retrieved',
        data: { total: 0, page: 1, page_size: 10, data: [] },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-4' } as Crypto);
    getPortalAccessToken.mockReturnValue(null);
    waitForPortalAccessToken.mockResolvedValue('hydrated-token');
    getPortalSessionUser.mockReturnValue({ userId: 'user-portal' });

    await listAttendanceRecords({ company_id: 'main', page: 1, page_size: 10 });

    expect(waitForPortalAccessToken).toHaveBeenCalledWith(5000);
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer hydrated-token');
    expect(headers['x-access-token']).toBe('hydrated-token');
    expect(headers['x-portal-access-token']).toBe('hydrated-token');
  });
});
