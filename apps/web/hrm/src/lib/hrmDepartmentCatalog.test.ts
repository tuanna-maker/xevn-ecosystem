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
}));

import {
  loadCompanyDepartments,
  mapHrmDepartmentRow,
  __resetCompanyDepartmentsInflightForTests,
} from './hrmDepartmentCatalog';

describe('hrmDepartmentCatalog (P1-HRM-MENU-COMPANY-DEPT-STUB)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('prefers HRM /departments when rows exist', async () => {
    listDepartments.mockResolvedValue({
      data: [{ id: 'd1', company_id: 'main', name: 'Ban Giám đốc', status: 'active' }],
    });

    const result = await loadCompanyDepartments('main');

    expect(result.fetchError).toBeNull();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.name).toBe('Ban Giám đốc');
    expect(getSettingsCatalogsOverview).not.toHaveBeenCalled();
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
