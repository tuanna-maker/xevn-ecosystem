import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/apiError';

const listDepartments = vi.fn();
const getSettingsCatalogsOverview = vi.fn();

vi.mock('@/integrations/hrmApi', () => ({
  listDepartments: (...args: unknown[]) => listDepartments(...args),
  getSettingsCatalogsOverview: (...args: unknown[]) => getSettingsCatalogsOverview(...args),
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

  it('merges HRM rows with settings catalog (HRM wins on duplicate code)', async () => {
    listDepartments.mockResolvedValue({
      data: [
        {
          id: 'd-new',
          company_id: 'main',
          name: 'Phòng mới',
          code: 'phong_moi',
          status: 'active',
        },
      ],
    });
    getSettingsCatalogsOverview.mockResolvedValue({
      catalogs: [
        {
          catalogKey: 'departments',
          effectiveItems: [
            { label: 'Phòng Nhân sự', code: 'nhan_su', status: 'active' },
            { label: 'Phòng Tài chính', code: 'tai_chinh', status: 'active' },
          ],
        },
      ],
    });

    const result = await loadCompanyDepartments('main');

    expect(result.fetchError).toBeNull();
    expect(result.rows).toHaveLength(3);
    expect(result.rows.map((r) => r.name)).toEqual(
      expect.arrayContaining(['Phòng mới', 'Phòng Nhân sự', 'Phòng Tài chính']),
    );
    expect(getSettingsCatalogsOverview).toHaveBeenCalled();
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

  it('group CEO loads department catalog for JWT tenant only (no cross-tenant 409)', async () => {
    vi.mocked(getPortalJwtRoleCode).mockReturnValue('group_ceo');
    vi.mocked(getPortalJwtTenantId).mockReturnValue('xevn');
    listDepartments.mockResolvedValue({ data: [] });
    getSettingsCatalogsOverview.mockImplementation(async (scope: { tenantId: string }) => {
      if (scope.tenantId === 'xevn') {
        return {
          catalogs: [
            {
              catalogKey: 'departments',
              effectiveItems: [{ label: 'Phòng Tập đoàn', code: 'xevn_dept', status: 'active' }],
            },
          ],
        };
      }
      return { catalogs: [] };
    });

    const result = await loadCompanyDepartments('main');

    expect(result.fetchError).toBeNull();
    expect(result.rows.map((r) => r.name)).toEqual(['Phòng Tập đoàn']);
    expect(getSettingsCatalogsOverview.mock.calls).toHaveLength(1);
    expect(getSettingsCatalogsOverview.mock.calls[0]?.[0]?.tenantId).toBe('xevn');
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

  it('falls back to settings catalog when HRM list is empty', async () => {
    listDepartments.mockResolvedValue({ data: [] });
    getSettingsCatalogsOverview.mockResolvedValue({
      catalogs: [
        {
          catalogKey: 'departments',
          effectiveItems: [{ label: 'Phòng Kế toán', code: 'KT', status: 'active' }],
        },
      ],
    });

    const result = await loadCompanyDepartments('main');

    expect(result.fetchError).toBeNull();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.name).toBe('Phòng Kế toán');
  });

  it('surfaces HRM error when both sources fail or stay empty after HRM error', async () => {
    listDepartments.mockRejectedValue(
      new ApiClientError({ code: 'RATE-429', message: 'Too many requests', status: 429 }),
    );
    getSettingsCatalogsOverview.mockResolvedValue({ catalogs: [] });

    const result = await loadCompanyDepartments('main');

    expect(result.rows).toHaveLength(0);
    expect(result.fetchError).toContain('429');
  });

  it('returns catalog rows when HRM fails but catalog has data', async () => {
    listDepartments.mockRejectedValue(
      new ApiClientError({ code: 'HRM-DEPT-500', message: 'Server error', status: 500 }),
    );
    getSettingsCatalogsOverview.mockResolvedValue({
      catalogs: [
        {
          catalogKey: 'department_catalog',
          effectiveItems: [{ label: 'Xưởng dịch vụ', code: 'XD', status: 'active' }],
        },
      ],
    });

    const result = await loadCompanyDepartments('main');

    expect(result.fetchError).toBeNull();
    expect(result.rows[0]?.name).toBe('Xưởng dịch vụ');
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
