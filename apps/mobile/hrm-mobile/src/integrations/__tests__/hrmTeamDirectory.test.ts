import { beforeEach, describe, expect, it, vi } from 'vitest';

const { hrmRequest } = vi.hoisted(() => ({
  hrmRequest: vi.fn(),
}));

vi.mock('../hrmApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hrmApiClient')>();
  return {
    ...actual,
    hrmRequest,
  };
});

import { DIRECTORY_PAGE_SIZE, loadTeamDirectoryWithAttendance } from '../hrmTeamDirectory';

const auth = {
  baseUrl: 'http://127.0.0.1:28001',
  accessToken: 'token',
  tenantId: 'xevn',
  companyId: 'holding',
  companyUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
};

describe('loadTeamDirectoryWithAttendance', () => {
  beforeEach(() => {
    hrmRequest.mockReset();
  });

  it('joins employees list with today attendance records', async () => {
    hrmRequest.mockImplementation(async (_auth, path: string) => {
      if (path.startsWith('/employees?')) {
        return {
          ok: true,
          data: {
            data: [
              {
                id: 'emp-1',
                company_id: 'holding',
                employee_code: 'NV001',
                email: 'a@xe.vn',
                full_name: 'Nguyá»…n A',
                job_title_key: 'engineer',
                status: 'active',
                hired_at: null,
              },
              {
                id: 'emp-2',
                company_id: 'holding',
                employee_code: 'NV002',
                email: 'b@xe.vn',
                full_name: 'Tráº§n B',
                job_title_key: 'manager',
                status: 'active',
                hired_at: null,
              },
            ],
          },
          code: 'HRM-EMP-200',
          message: 'OK',
          requestId: 'r1',
        };
      }
      if (path.startsWith('/attendance/records?')) {
        return {
          ok: true,
          data: {
            data: [
              {
                employee_id: 'emp-1',
                attendance_date: '2026-06-09',
                status: 'present',
                check_in_at: '2026-06-09T01:00:00.000Z',
              },
            ],
          },
          code: 'HRM-ATT-200',
          message: 'OK',
          requestId: 'r2',
        };
      }
      return { ok: false, code: '404', message: 'not found', requestId: 'x' };
    });

    const result = await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'holding',
      attendanceCompanyId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      isManager: true,
      employeeId: 'mgr-1',
      date: '2026-06-09',
    });

    expect(result.ok).toBe(true);
    expect(result.members).toHaveLength(2);
    expect(result.members[0].checkInStatus).toBe('checked_in');
    expect(result.members[1].checkInStatus).toBe('not_checked_in');
    expect(hrmRequest.mock.calls[0][1]).toContain('view=directory');
    expect(hrmRequest.mock.calls[0][1]).toContain(`page_size=${DIRECTORY_PAGE_SIZE}`);
    expect(DIRECTORY_PAGE_SIZE).toBeLessThanOrEqual(50);
    expect(hrmRequest.mock.calls[0][1]).not.toContain('page_size=200');
    expect(hrmRequest.mock.calls[0][1]).not.toContain('q=');
  });

  it('sends q when search has at least 2 characters (SRS R1 / AC-DIR-01)', async () => {
    hrmRequest.mockImplementation(async (_auth, path: string) => {
      if (path.startsWith('/employees?')) {
        return {
          ok: true,
          data: {
            data: [
              {
                id: 'emp-1',
                company_id: 'holding',
                employee_code: 'NV001',
                email: 'a@xe.vn',
                full_name: 'Nguyá»…n VÄƒn A',
                job_title_key: 'staff',
                status: 'active',
                hired_at: null,
              },
            ],
            total: 1,
          },
          code: 'HRM-EMP-DIR-200',
          message: 'OK',
          requestId: 'r1',
        };
      }
      if (path.startsWith('/attendance/records?')) {
        return { ok: true, data: { data: [] }, code: 'HRM-ATT-200', message: 'OK', requestId: 'r2' };
      }
      return { ok: false, code: '404', message: 'not found', requestId: 'x' };
    });

    const result = await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'holding',
      attendanceCompanyId: 'holding',
      isManager: true,
      employeeId: 'mgr-1',
      search: 'Nguyá»…n',
      date: '2026-06-09',
    });

    expect(result.ok).toBe(true);
    expect(result.members).toHaveLength(1);
    expect(hrmRequest.mock.calls[0][1]).toContain('q=');
    expect(decodeURIComponent(String(hrmRequest.mock.calls[0][1]))).toContain('Nguyá»…n');
  });

  it('does not send q when search is under 2 characters', async () => {
    hrmRequest.mockImplementation(async (_auth, path: string) => {
      if (path.startsWith('/employees?')) {
        return { ok: true, data: { data: [], total: 0 }, code: 'HRM-EMP-DIR-200', message: 'OK', requestId: 'r1' };
      }
      if (path.startsWith('/attendance/records?')) {
        return { ok: true, data: { data: [] }, code: 'HRM-ATT-200', message: 'OK', requestId: 'r2' };
      }
      return { ok: false, code: '404', message: 'not found', requestId: 'x' };
    });

    await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'holding',
      attendanceCompanyId: 'holding',
      isManager: false,
      employeeId: 'e1',
      search: 'N',
      date: '2026-06-09',
    });

    expect(hrmRequest.mock.calls[0][1]).not.toMatch(/[?&]q=/);
  });

  it('returns ok empty list when search has no matches (SRS R2)', async () => {
    hrmRequest.mockImplementation(async (_auth, path: string) => {
      if (path.startsWith('/employees?')) {
        return { ok: true, data: { data: [], total: 0 }, code: 'HRM-EMP-DIR-200', message: 'OK', requestId: 'r1' };
      }
      if (path.startsWith('/attendance/records?')) {
        return { ok: true, data: { data: [] }, code: 'HRM-ATT-200', message: 'OK', requestId: 'r2' };
      }
      return { ok: false, code: '404', message: 'not found', requestId: 'x' };
    });

    const result = await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'holding',
      attendanceCompanyId: 'holding',
      isManager: false,
      employeeId: 'e1',
      search: 'ZzNoMatch',
      date: '2026-06-09',
    });

    expect(result.ok).toBe(true);
    expect(result.members).toHaveLength(0);
  });

  it('surfaces API validation error instead of silent empty list', async () => {
    hrmRequest.mockResolvedValue({
      ok: false,
      code: 'HRM-VAL-001',
      message: 'page_size must not be greater than 100',
      requestId: 'r-val',
      httpStatus: 400,
    });

    const result = await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'trsport',
      attendanceCompanyId: '32a3cdcb-c534-4e47-80f9-d2f156e65094',
      isManager: true,
      employeeId: 'mgr-1',
      date: '2026-06-09',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.members).toHaveLength(0);
    expect(result.message).toContain('HRM-VAL-001');
  });

  it('paginates directory employees when total exceeds page size', async () => {
    const page1Rows = Array.from({ length: DIRECTORY_PAGE_SIZE }, (_, i) => ({
      id: `emp-${i}`,
      company_id: 'trsport',
      employee_code: `NV${String(i).padStart(3, '0')}`,
      email: `e${i}@xe.vn`,
      full_name: `NV ${i}`,
      job_title_key: 'staff',
      status: 'active',
      hired_at: null,
    }));
    const page2Rows = [
      {
        id: 'emp-last',
        company_id: 'trsport',
        employee_code: 'NV999',
        email: 'last@xe.vn',
        full_name: 'NV Last',
        job_title_key: 'staff',
        status: 'active',
        hired_at: null,
      },
    ];

    hrmRequest.mockImplementation(async (_auth, path: string) => {
      if (path.includes('page=1&') || path.includes('page=1')) {
        if (path.startsWith('/attendance/records?')) {
          return { ok: true, data: { data: [] }, code: 'HRM-ATT-200', message: 'OK', requestId: 'r3' };
        }
        return {
          ok: true,
          data: { total: DIRECTORY_PAGE_SIZE + 1, data: page1Rows },
          code: 'HRM-EMP-DIR-200',
          message: 'OK',
          requestId: 'r1',
        };
      }
      if (path.includes('page=2')) {
        return {
          ok: true,
          data: { total: DIRECTORY_PAGE_SIZE + 1, data: page2Rows },
          code: 'HRM-EMP-DIR-200',
          message: 'OK',
          requestId: 'r2',
        };
      }
      if (path.startsWith('/attendance/records?')) {
        return { ok: true, data: { data: [] }, code: 'HRM-ATT-200', message: 'OK', requestId: 'r3' };
      }
      return { ok: false, code: '404', message: 'not found', requestId: 'x' };
    });

    const result = await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'trsport',
      attendanceCompanyId: '32a3cdcb-c534-4e47-80f9-d2f156e65094',
      isManager: true,
      employeeId: 'mgr-1',
      date: '2026-06-09',
    });

    expect(result.ok).toBe(true);
    expect(result.members).toHaveLength(DIRECTORY_PAGE_SIZE + 1);
    const employeeCalls = hrmRequest.mock.calls.filter((c) =>
      String(c[1]).startsWith('/employees?'),
    );
    expect(employeeCalls).toHaveLength(2);
  });

  it('returns ok empty when no employees in scope (API honest empty)', async () => {
    hrmRequest.mockResolvedValue({
      ok: true,
      data: { data: [] },
      code: 'HRM-EMP-DIR-200',
      message: 'OK',
      requestId: 'r1',
    });

    const result = await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'holding',
      attendanceCompanyId: 'holding',
      isManager: false,
      employeeId: 'e1',
      date: '2026-06-09',
    });

    expect(result.ok).toBe(true);
    expect(result.members).toHaveLength(0);
  });

  it('uses Plane B slug on wire company_id (not inventing LE UUID)', async () => {
    hrmRequest.mockImplementation(async (_auth, path: string) => {
      if (path.startsWith('/employees?')) {
        return {
          ok: true,
          data: { data: [], total: 0 },
          code: 'HRM-EMP-DIR-200',
          message: 'OK',
          requestId: 'r1',
        };
      }
      if (path.startsWith('/attendance/records?')) {
        return { ok: true, data: { data: [] }, code: 'HRM-ATT-200', message: 'OK', requestId: 'r2' };
      }
      return { ok: false, code: '404', message: 'not found', requestId: 'x' };
    });

    await loadTeamDirectoryWithAttendance({
      auth,
      listCompanyId: 'holding',
      attendanceCompanyId: auth.companyUuid!,
      isManager: true,
      employeeId: 'mgr-1',
      date: '2026-06-09',
    });

    expect(hrmRequest.mock.calls[0][1]).toContain('company_id=holding');
    expect(hrmRequest.mock.calls[0][1]).toContain('view=directory');
    expect(hrmRequest.mock.calls[0][1]).toContain(`page_size=${DIRECTORY_PAGE_SIZE}`);
    expect(DIRECTORY_PAGE_SIZE).toBe(30);
  });
});
