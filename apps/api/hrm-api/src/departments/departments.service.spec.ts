import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { DepartmentsService } from './departments.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let db: jest.Mocked<HrmDbService>;
  let settingsCatalogs: jest.Mocked<SettingsCatalogsService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    settingsCatalogs = {
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([]),
      upsertCatalogItem: jest.fn().mockResolvedValue({ upserted: 1 }),
    } as unknown as jest.Mocked<SettingsCatalogsService>;
    service = new DepartmentsService(db, settingsCatalogs);
  });

  it('listDepartments scopes company_id for group CEO main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.departments')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.listDepartments({ company_id: 'main' }, `Bearer ${token}`);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
    expect(settingsCatalogs.getEffectiveItemsForKey).toHaveBeenCalled();
  });

  it('getDepartmentById returns 404 when row missing', async () => {
    await expect(
      service.getDepartmentById('00000000-0000-4000-8000-000000000001', 'main'),
    ).rejects.toMatchObject({
      code: 'HRM-DEPT-404',
    });
  });

  it('listDepartments attaches live employee counts from custom_fields.department', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employees')) {
        return {
          rows: [{ company_id: 'main', dept_key: 'phong_cntt', headcount: 3 }],
        } as never;
      }
      if (sql.includes('FROM public.departments')) {
        return {
          rows: [
            {
              id: 'd1',
              company_id: 'main',
              tenant_id: 'xevn',
              parent_id: null,
              name: 'Phòng CNTT',
              code: 'phong_cntt',
              description: null,
              manager_name: null,
              manager_email: null,
              employee_count: 0,
              level: 1,
              sort_order: 0,
              status: 'active',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listDepartments(
      { company_id: 'main' },
      `Bearer ${token}`,
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0].employee_count).toBe(3);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("custom_fields->>'department'"),
      expect.any(Array),
    );
  });

  it('listDepartments without rollup_tenants narrows to JWT tenant catalog', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.departments')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
    settingsCatalogs.getEffectiveItemsForKey.mockResolvedValue([
      { code: 'xevn_dept', label: 'Phòng Tập đoàn', status: 'active' },
    ]);

    const result = await service.listDepartments(
      { company_id: 'main', rollup_tenants: false },
      `Bearer ${token}`,
    );

    expect(result.data.map((row) => row.name)).toEqual(['Phòng Tập đoàn']);
    expect(settingsCatalogs.getEffectiveItemsForKey).toHaveBeenCalledTimes(1);
    expect(settingsCatalogs.getEffectiveItemsForKey).toHaveBeenCalledWith(
      'xevn',
      expect.any(String),
      'departments',
    );
  });
});
