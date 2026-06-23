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
  baseUrl: 'https://14-225-217-232.nip.io',
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
                full_name: 'Nguyễn A',
                job_title_key: 'engineer',
                status: 'active',
                hired_at: null,
              },
              {
                id: 'emp-2',
                company_id: 'holding',
                employee_code: 'NV002',
                email: 'b@xe.vn',
                full_name: 'Trần B',
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
    expect(hrmRequest.mock.calls[0][1]).not.toContain('page_size=200');
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
      if (path.includes('page=1&')) {
        return {
          ok: true,
          data: { total: DIRECTORY_PAGE_SIZE + 1, data: page1Rows },
          code: 'HRM-EMP-DIR-200',
          message: 'OK',
          requestId: 'r1',
        };
      }
      if (path.includes('page=2&')) {
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

  it('returns error when no employees in scope', async () => {
    hrmRequest.mockResolvedValue({
      ok: true,
      data: { data: [] },
      code: 'HRM-EMP-200',
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

    expect(result.ok).toBe(false);
    expect(result.members).toHaveLength(0);
  });
});
