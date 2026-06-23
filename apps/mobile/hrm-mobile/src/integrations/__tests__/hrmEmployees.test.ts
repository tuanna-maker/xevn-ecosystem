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

import type { MobileMembership } from '../../context/AuthContext';
import {
  fetchEmployeeById,
  hydrateEmployeeMetaForRequest,
  mergeEmployeeRequestMeta,
  resolveEmployeeMetaFromMemberships,
} from '../hrmEmployees';

const UAT_MEMBERSHIPS: MobileMembership[] = [
  {
    tenant_id: 'xevn',
    company_id: 'holding',
    company_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    employee_id: 'emp-uat-0001',
    employee_code: 'UAT0001',
    employee_name: 'Nguyễn Văn An',
    company_display: 'Tập đoàn XeVN',
    is_primary: true,
  },
];

const auth = {
  baseUrl: 'https://14-225-217-232.nip.io',
  accessToken: 'token',
  tenantId: 'xevn',
  companyId: 'holding',
  companyUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
};

describe('resolveEmployeeMetaFromMemberships', () => {
  it('returns code/name for uat.nv0001 parity membership', () => {
    const meta = resolveEmployeeMetaFromMemberships(UAT_MEMBERSHIPS, 'emp-uat-0001');
    expect(meta).toEqual({
      employee_code: 'UAT0001',
      employee_name: 'Nguyễn Văn An',
      department: '',
    });
  });

  it('falls back to primary membership when employee_id differs', () => {
    const meta = resolveEmployeeMetaFromMemberships(UAT_MEMBERSHIPS, 'other-id');
    expect(meta?.employee_code).toBe('UAT0001');
    expect(meta?.employee_name).toBe('Nguyễn Văn An');
  });

  it('returns null when memberships lack code and name', () => {
    const meta = resolveEmployeeMetaFromMemberships(
      [{ ...UAT_MEMBERSHIPS[0], employee_code: '', employee_name: '' }],
      'emp-uat-0001',
    );
    expect(meta).toBeNull();
  });
});

describe('mergeEmployeeRequestMeta', () => {
  it('prefers API row over membership when both present', () => {
    const merged = mergeEmployeeRequestMeta(
      { employee_code: 'OLD', employee_name: 'Old Name', department: '' },
      {
        id: 'emp-uat-0001',
        company_id: 'holding',
        employee_code: 'UAT0001',
        email: 'uat.nv0001@xe.vn',
        full_name: 'Nguyễn Văn An',
        job_title_key: 'hr_staff',
        status: 'active',
        hired_at: null,
      },
    );
    expect(merged).toEqual({
      employee_code: 'UAT0001',
      employee_name: 'Nguyễn Văn An',
      department: 'hr_staff',
    });
  });

  it('keeps membership when API returns null (G-PERSONA-A1)', () => {
    const merged = mergeEmployeeRequestMeta(
      { employee_code: 'UAT0001', employee_name: 'Nguyễn Văn An', department: '' },
      null,
    );
    expect(merged?.employee_code).toBe('UAT0001');
    expect(merged?.employee_name).toBe('Nguyễn Văn An');
  });
});

describe('fetchEmployeeById', () => {
  beforeEach(() => {
    hrmRequest.mockReset();
  });

  it('uses GET /employees/:id before list pagination', async () => {
    hrmRequest.mockResolvedValueOnce({
      ok: true,
      data: {
        id: 'emp-uat-0001',
        company_id: 'holding',
        employee_code: 'UAT0001',
        email: 'uat.nv0001@xe.vn',
        full_name: 'Nguyễn Văn An',
        job_title_key: null,
        status: 'active',
        hired_at: null,
      },
      code: 'HRM-EMP-200',
      requestId: 'r1',
    });

    const row = await fetchEmployeeById(auth, 'emp-uat-0001');
    expect(row?.employee_code).toBe('UAT0001');
    expect(hrmRequest).toHaveBeenCalledTimes(1);
    expect(hrmRequest.mock.calls[0][1]).toMatch(/\/employees\/emp-uat-0001\?/);
  });

  it('falls back to list scan when direct GET fails', async () => {
    hrmRequest
      .mockResolvedValueOnce({ ok: false, code: 'HRM-EMP-404', message: 'not found', requestId: 'r1' })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          total: 1,
          data: [
            {
              id: 'emp-uat-0001',
              company_id: 'holding',
              employee_code: 'UAT0001',
              email: 'uat.nv0001@xe.vn',
              full_name: 'Nguyễn Văn An',
              job_title_key: null,
              status: 'active',
              hired_at: null,
            },
          ],
        },
        code: 'HRM-EMP-200',
        requestId: 'r2',
      });

    const row = await fetchEmployeeById(auth, 'emp-uat-0001');
    expect(row?.full_name).toBe('Nguyễn Văn An');
    expect(hrmRequest).toHaveBeenCalledTimes(2);
  });
});

describe('hydrateEmployeeMetaForRequest', () => {
  beforeEach(() => {
    hrmRequest.mockReset();
  });

  it('returns membership meta when API fails (leave create G-PERSONA-A1)', async () => {
    hrmRequest.mockResolvedValue({ ok: false, code: 'HRM-ERR', message: 'fail', requestId: 'r' });

    const meta = await hydrateEmployeeMetaForRequest(auth, UAT_MEMBERSHIPS, 'emp-uat-0001');
    expect(meta).toEqual({
      employee_code: 'UAT0001',
      employee_name: 'Nguyễn Văn An',
      department: '',
    });
  });

  it('merges API department when direct GET succeeds', async () => {
    hrmRequest.mockResolvedValueOnce({
      ok: true,
      data: {
        id: 'emp-uat-0001',
        company_id: 'holding',
        employee_code: 'UAT0001',
        email: 'uat.nv0001@xe.vn',
        full_name: 'Nguyễn Văn An',
        job_title_key: 'sales_exec',
        status: 'active',
        hired_at: null,
      },
      code: 'HRM-EMP-200',
      requestId: 'r1',
    });

    const meta = await hydrateEmployeeMetaForRequest(auth, UAT_MEMBERSHIPS, 'emp-uat-0001');
    expect(meta?.department).toBe('sales_exec');
    expect(meta?.employee_code).toBe('UAT0001');
  });
});
