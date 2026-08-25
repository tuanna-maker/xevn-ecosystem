import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/apiError';

const listDepartments = vi.fn();
const getSettingsCatalogsOverview = vi.fn();
const getEmployeesSummary = vi.fn();

vi.mock('@/integrations/hrmApi', () => ({
  listDepartments: (...args: unknown[]) => listDepartments(...args),
  getSettingsCatalogsOverview: (...args: unknown[]) => getSettingsCatalogsOverview(...args),
  getEmployeesSummary: (...args: unknown[]) => getEmployeesSummary(...args),
}));

vi.mock('@/lib/hrmSpreadsheetScope', () => ({
  resolveHrmSpreadsheetScope: (companyId: string) =>
    companyId ? { tenantId: 'xevn', companyId } : null,
  resolveHrmSettingsCatalogScope: (companyId: string) =>
    companyId ? { tenantId: 'xevn', companyId } : null,
  getPortalJwtRoleCode: vi.fn(() => null),
  getPortalJwtTenantId: vi.fn(() => null),
}));

import {
  departmentMergeKey,
  departmentPickerOptionsFromCompanyRows,
  enrichDepartmentRowsWithEmployeeCounts,
  loadCompanyDepartments,
  mapHrmDepartmentRow,
  mergeDepartmentCatalogRows,
  mergeDepartmentPickerOptions,
  __resetCompanyDepartmentsInflightForTests,
} from './hrmDepartmentCatalog';
import {
  getPortalJwtRoleCode,
  getPortalJwtTenantId,
} from '@/lib/hrmSpreadsheetScope';

describe('hrmDepartmentCatalog (P1-HRM-MENU-COMPANY-DEPT-STUB)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPortalJwtRoleCode).mockReturnValue(null);
    vi.mocked(getPortalJwtTenantId).mockReturnValue(null);
    getSettingsCatalogsOverview.mockResolvedValue({ catalogs: [] });
    listDepartments.mockResolvedValue({ data: [] });
    getEmployeesSummary.mockResolvedValue({ by_department: [] });
    __resetCompanyDepartmentsInflightForTests();
  });

  it('mapHrmDepartmentRow maps HRM API rows', () => {
    const row = mapHrmDepartmentRow({
      id: 'd1',
      company_id: 'main',
      name: 'Phòng Nhân sự',
      code: 'HR',
      parent_id: null,
      level: 1,
      employee_count: 12,
      status: 'active',
    });
    expect(row.id).toBe('d1');
    expect(row.name).toBe('Phòng Nhân sự');
    expect(row.employee_count).toBe(12);
  });

  it('returns merged department rows from GET /departments (BE union)', async () => {
    listDepartments.mockResolvedValue({
      data: [
        {
          id: 'd-new',
          company_id: 'main',
          name: 'Phòng mới',
          code: 'phong_moi',
          status: 'active',
        },
        {
          id: 'd-hr',
          company_id: 'main',
          name: 'Phòng Nhân sự',
          code: 'nhan_su',
          status: 'active',
        },
        {
          id: 'd-tc',
          company_id: 'main',
          name: 'Phòng Tài chính',
          code: 'tai_chinh',
          status: 'active',
        },
      ],
    });

    const result = await loadCompanyDepartments('main');

    expect(result.fetchError).toBeNull();
    expect(result.rows).toHaveLength(3);
    expect(result.rows.map((r) => r.name)).toEqual(
      expect.arrayContaining(['Phòng mới', 'Phòng Nhân sự', 'Phòng Tài chính']),
    );
    expect(getSettingsCatalogsOverview).not.toHaveBeenCalled();
  });

  it('mergeDepartmentCatalogRows keeps same code distinct per tenant in rollup mode', () => {
    const merged = mergeDepartmentCatalogRows(
      [],
      [
        {
          id: 'v-ns',
          name: 'Phòng Nhân sự',
          code: 'nhan_su',
          company_id: 'main',
          tenant_id: 'visun',
          parent_id: null,
          level: 1,
          sort_order: 0,
          status: 'active',
          description: null,
          manager_name: null,
          manager_email: null,
          employee_count: 0,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
        {
          id: 't-ns',
          name: 'Phòng Nhân sự',
          code: 'nhan_su',
          company_id: 'main',
          tenant_id: 'xe-tmdv',
          parent_id: null,
          level: 1,
          sort_order: 0,
          status: 'active',
          description: null,
          manager_name: null,
          manager_email: null,
          employee_count: 0,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
      true,
    );
    expect(merged).toHaveLength(2);
    expect(departmentMergeKey(merged[0]!, true)).not.toBe(departmentMergeKey(merged[1]!, true));
  });

  it('group CEO receives rollup rows from GET /departments only', async () => {
    vi.mocked(getPortalJwtRoleCode).mockReturnValue('group_ceo');
    vi.mocked(getPortalJwtTenantId).mockReturnValue('xevn');
    listDepartments.mockResolvedValue({
      data: [
        {
          id: 'xevn_dept',
          company_id: 'main',
          tenant_id: 'xevn',
          name: 'Phòng Tập đoàn',
          code: 'xevn_dept',
          status: 'active',
        },
      ],
    });

    const result = await loadCompanyDepartments('main');

    expect(listDepartments).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'main', rollup_tenants: true }),
      expect.anything(),
    );
    expect(result.fetchError).toBeNull();
    expect(result.rows.map((r) => r.name)).toEqual(['Phòng Tập đoàn']);
    expect(getSettingsCatalogsOverview).not.toHaveBeenCalled();
  });

  it('mergeDepartmentCatalogRows prefers HRM metadata for same code', () => {
    const merged = mergeDepartmentCatalogRows(
      [
        {
          id: 'uuid-1',
          name: 'Phòng Nhân sự',
          code: 'nhan_su',
          company_id: 'main',
          parent_id: null,
          level: 1,
          sort_order: 0,
          status: 'active',
          description: null,
          manager_name: null,
          manager_email: null,
          employee_count: 5,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
      [
        {
          id: 'catalog-dept-0',
          name: 'Phòng Nhân sự',
          code: 'nhan_su',
          company_id: 'main',
          parent_id: null,
          level: 1,
          sort_order: 0,
          status: 'active',
          description: null,
          manager_name: null,
          manager_email: null,
          employee_count: 0,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe('uuid-1');
    expect(departmentMergeKey(merged[0]!)).toBe('code:nhan_su');
  });

  it('mergeDepartmentCatalogRows pairs HRM row without code to catalog row by name', () => {
    const merged = mergeDepartmentCatalogRows(
      [
        {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          name: 'Phòng Điều Phối Hàng Hóa',
          code: null,
          company_id: 'main',
          parent_id: null,
          level: 1,
          sort_order: 0,
          status: 'active',
          description: null,
          manager_name: null,
          manager_email: null,
          employee_count: 40,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
      [
        {
          id: 'phong_dphh',
          name: 'Phòng Điều Phối Hàng Hóa',
          code: 'phong_dphh',
          company_id: 'main',
          parent_id: null,
          level: 1,
          sort_order: 0,
          status: 'active',
          description: null,
          manager_name: null,
          manager_email: null,
          employee_count: 0,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(merged[0]?.code).toBe('phong_dphh');
  });

  it('coalesces parallel loads into one listDepartments call (R-DEPT-FETCH-X2)', async () => {
    let resolveList: (value: { data: Array<{ id: string; company_id: string; name: string; status: string }> }) => void =
      () => undefined;
    listDepartments.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    );

    const a = loadCompanyDepartments('main');
    const b = loadCompanyDepartments('main');
    expect(listDepartments).toHaveBeenCalledTimes(1);

    resolveList({
      data: [{ id: 'd1', company_id: 'main', name: 'Ban Giám đốc', status: 'active' }],
    });
    getSettingsCatalogsOverview.mockResolvedValue({ catalogs: [] });

    const [ra, rb] = await Promise.all([a, b]);
    expect(ra.rows).toHaveLength(1);
    expect(rb.rows).toHaveLength(1);
    expect(listDepartments).toHaveBeenCalledTimes(1);
  });

  it('returns catalog-only rows from GET /departments when HRM table is empty', async () => {
    listDepartments.mockResolvedValue({
      data: [
        {
          id: 'KT',
          company_id: 'main',
          name: 'Phòng Kế toán',
          code: 'KT',
          status: 'active',
        },
      ],
    });

    const result = await loadCompanyDepartments('main');

    expect(result.fetchError).toBeNull();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.name).toBe('Phòng Kế toán');
    expect(getSettingsCatalogsOverview).not.toHaveBeenCalled();
  });

  it('surfaces HRM error when GET /departments fails', async () => {
    listDepartments.mockRejectedValue(
      new ApiClientError({ code: 'RATE-429', message: 'Too many requests', status: 429 }),
    );

    const result = await loadCompanyDepartments('main');

    expect(result.rows).toHaveLength(0);
    expect(result.fetchError).toContain('429');
  });

  it('enriches department rows with employees/summary by_department headcounts', async () => {
    listDepartments.mockResolvedValue({
      data: [
        {
          id: 'd-cntt',
          company_id: 'main',
          name: 'Phòng CNTT',
          code: 'phong_cntt',
          status: 'active',
          employee_count: 0,
        },
      ],
    });
    getEmployeesSummary.mockResolvedValue({
      by_department: [{ department: 'phong_cntt', count: 4, avg_salary: null }],
    });

    const result = await loadCompanyDepartments('main');

    expect(getEmployeesSummary).toHaveBeenCalledWith({ company_id: 'main' });
    expect(result.rows.find((r) => r.code === 'phong_cntt')?.employee_count).toBe(4);
  });
});

describe('enrichDepartmentRowsWithEmployeeCounts', () => {
  it('matches department code case-insensitively', () => {
    const enriched = enrichDepartmentRowsWithEmployeeCounts(
      [
        {
          id: 'd1',
          name: 'Phòng CNTT',
          code: 'phong_cntt',
          company_id: 'main',
          parent_id: null,
          level: 1,
          sort_order: 0,
          status: 'active',
          description: null,
          manager_name: null,
          manager_email: null,
          employee_count: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      [{ department: 'PHONG_CNTT', count: 2 }],
    );
    expect(enriched[0]?.employee_count).toBe(2);
  });
});

describe('departmentPickerOptionsFromCompanyRows', () => {
  it('maps active rows to picker options (code SoT, id fallback)', () => {
    const opts = departmentPickerOptionsFromCompanyRows([
      {
        id: 'uuid-1',
        name: 'Phòng Nhân sự',
        code: 'nhan_su',
        company_id: 'main',
        parent_id: null,
        level: 1,
        sort_order: 0,
        status: 'active',
        description: null,
        manager_name: null,
        manager_email: null,
        employee_count: 0,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'uuid-2',
        name: 'Phòng mới',
        code: null,
        company_id: 'main',
        parent_id: null,
        level: 1,
        sort_order: 1,
        status: 'active',
        description: null,
        manager_name: null,
        manager_email: null,
        employee_count: 0,
        created_at: '',
        updated_at: '',
      },
    ]);
    expect(opts).toHaveLength(2);
    expect(opts.find((o) => o.value === 'nhan_su')?.label).toBe('Phòng Nhân sự');
    expect(opts.find((o) => o.value === 'uuid-2')?.label).toBe('Phòng mới');
  });
});

describe('mergeDepartmentPickerOptions', () => {
  it('primary HRM options override catalog duplicates', () => {
    const merged = mergeDepartmentPickerOptions(
      [{ value: 'hr', label: 'HR (HRM)', code: 'hr' }],
      [{ value: 'hr', label: 'HR (catalog)', code: 'hr' }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.label).toBe('HR (HRM)');
  });
});
