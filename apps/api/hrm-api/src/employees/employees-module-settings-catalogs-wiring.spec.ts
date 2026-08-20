/**
 * @CODE-MEMORY
 * Screen:     EmployeesModule DI wiring — SettingsCatalogsService (job_titles SoT)
 * UC:         AC-PLT-EMP-01b · VAL-EMP-POS-CNS-03 · F-EMP-POS-CNS-02
 * BR:         BR-PLT-02 · L-EMP-POS-01 Option A
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md Option A
 * Purpose:    Fail-closed: EmployeesModule MUST import SettingsCatalogsModule so invent assert
 *             is not an Optional runtime no-op (R-PLT-EMP-POS-BE-01).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  no Nest emp_position · Option A job_titles · peer HRM-CON-POS-KEY
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsModule } from '../settings-catalogs/settings-catalogs.module';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { EmployeesModule } from './employees.module';
import { EmployeesService, HRM_EMP_POSITION_KEY } from './employees.service';

describe('EmployeesModule SettingsCatalogs wiring (EMP-POSITION-CATALOG-BE-01)', () => {
  it('EmployeesModule imports SettingsCatalogsModule (DI fail-closed)', () => {
    const imports = Reflect.getMetadata('imports', EmployeesModule) as
      | unknown[]
      | undefined;
    expect(imports).toBeDefined();
    expect(imports).toContain(SettingsCatalogsModule);
  });

  it('compiled EmployeesModule resolves SettingsCatalogsService into EmployeesService', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [EmployeesModule],
    })
      .overrideProvider(HrmDbService)
      .useValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    const catalogs = moduleRef.get(SettingsCatalogsService, { strict: false });
    expect(catalogs).toBeDefined();
    const employees = moduleRef.get(EmployeesService);
    expect(employees).toBeDefined();

    const injected = (employees as any).settingsCatalogs as
      | SettingsCatalogsService
      | undefined;
    expect(injected).toBe(catalogs);
  });
});

describe('EmployeesService invent job_title_key → HRM-EMP-POSITION-KEY (EFF>0)', () => {
  let service: EmployeesService;
  let db: jest.Mocked<HrmDbService>;
  let assertCode: jest.Mock;
  let getEffectiveItemsForKey: jest.Mock;

  beforeEach(() => {
    db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('hrm_catalog_extension_items')) {
          if (s.includes('COUNT')) return { rows: [{ c: '0' }] };
          return { rows: [] };
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    assertCode = jest
      .fn()
      .mockRejectedValue(
        new ApiException(
          HRM_EMP_POSITION_KEY,
          "job_title_key 'INVENT_FREE_TEXT_POS' is not in job_titles catalog (free-text SoT forbidden)",
          400,
        ),
      );
    getEffectiveItemsForKey = jest.fn().mockResolvedValue([
      {
        code: 'CEO',
        label: 'Giám đốc',
        unit: null,
        status: 'active',
        origin: 'xbos',
      },
      {
        code: 'STAFF',
        label: 'Nhân viên',
        unit: null,
        status: 'active',
        origin: 'xbos',
      },
    ]);

    const catalogs = {
      getEffectiveItemsForKey,
      assertCodeInEffectiveCatalog: assertCode,
    } as unknown as SettingsCatalogsService;

    service = new EmployeesService(db, catalogs);
  });

  it('VAL-EMP-POS-CNS-03: update invent job_title_key when EFF>0 → HRM-EMP-POSITION-KEY (no UPDATE)', async () => {
    const existing = {
      id: 'e1',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'nv@xe.vn',
      full_name: 'NV Test',
      job_title_key: 'STAFF',
      manager_id: null,
      status: 'active',
      hired_at: null,
      archived_at: null,
      avatar_url: null,
      custom_fields: {},
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [existing] } as never);

    await expect(
      service.updateEmployee(
        'e1',
        { job_title_key: 'INVENT_FREE_TEXT_POS' },
        'holding',
        undefined,
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_EMP_POSITION_KEY });

    expect(getEffectiveItemsForKey).toHaveBeenCalledWith(
      'xevn',
      'holding',
      'job_titles',
    );
    expect(assertCode).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'job_titles',
        code: 'INVENT_FREE_TEXT_POS',
        errorCode: HRM_EMP_POSITION_KEY,
      }),
    );
    const updateCalls = db.query.mock.calls.filter((c) =>
      String(c[0]).includes('UPDATE public.employees'),
    );
    expect(updateCalls).toHaveLength(0);
  });

  it('VAL-EMP-POS-CNS-03 create: invent job_title_key when EFF>0 → HRM-EMP-POSITION-KEY', async () => {
    await expect(
      service.createEmployee(
        {
          company_id: 'holding',
          employee_code: 'NVINV01',
          email: 'invent@xe.vn',
          full_name: 'Invent Title',
          job_title_key: 'NOT_IN_CATALOG_XYZ',
        },
        undefined,
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_EMP_POSITION_KEY });
    expect(assertCode).toHaveBeenCalled();
  });

  it('AC-PLT-EMP-01c: EFF=0 soft skip invent (no seed · no KEY)', async () => {
    getEffectiveItemsForKey.mockResolvedValueOnce([]);
    const existing = {
      id: 'e2',
      company_id: 'holding',
      employee_code: 'NV002',
      email: 'nv2@xe.vn',
      full_name: 'NV Soft',
      job_title_key: null,
      manager_id: null,
      status: 'active',
      hired_at: null,
      archived_at: null,
      avatar_url: null,
      custom_fields: {},
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    };
    db.query
      .mockResolvedValueOnce({ rows: [existing] } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            ...existing,
            job_title_key: 'ANY_WHEN_EMPTY',
            updated_at: '2026-08-08T00:00:00.000Z',
          },
        ],
      } as never);

    const result = await service.updateEmployee(
      'e2',
      { job_title_key: 'ANY_WHEN_EMPTY' },
      'holding',
      undefined,
      { tenantId: 'xevn' },
    );

    expect(assertCode).not.toHaveBeenCalled();
    expect(result.job_title_key).toBe('ANY_WHEN_EMPTY');
  });

  it('missing SettingsCatalogsService (unit construct) remains soft no-op — wiring test covers module DI', async () => {
    const soft = new EmployeesService(db);
    const existing = {
      id: 'e3',
      company_id: 'holding',
      employee_code: 'NV003',
      email: 'nv3@xe.vn',
      full_name: 'NV Soft Di',
      job_title_key: 'STAFF',
      manager_id: null,
      status: 'active',
      hired_at: null,
      archived_at: null,
      avatar_url: null,
      custom_fields: {},
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    };
    db.query
      .mockResolvedValueOnce({ rows: [existing] } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            ...existing,
            job_title_key: 'INVENT_NO_DI',
            updated_at: '2026-08-08T00:00:00.000Z',
          },
        ],
      } as never);

    const result = await soft.updateEmployee(
      'e3',
      { job_title_key: 'INVENT_NO_DI' },
      'holding',
    );
    expect(result.job_title_key).toBe('INVENT_NO_DI');
  });
});
