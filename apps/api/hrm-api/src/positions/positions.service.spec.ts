import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  HRM_EMP_POSITION_DEPT_REQUIRED,
  HRM_EMP_POSITION_KEY,
} from './positions.constants';
import { PositionsService } from './positions.service';

describe('PositionsService (Approach A)', () => {
  let service: PositionsService;
  let db: jest.Mocked<HrmDbService>;
  let settingsCatalogs: jest.Mocked<SettingsCatalogsService>;

  const token = signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    settingsCatalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({ code: 'D1' }),
      getEffectiveItemsForKey: jest.fn(),
    } as unknown as jest.Mocked<SettingsCatalogsService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new PositionsService(db, settingsCatalogs);
  });

  it('assertEmployeePositionAssignment allows company-scoped CEO without department', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('COUNT(*)') && sql.includes('pay_position')) {
        return { rows: [{ count: '1' }] } as never;
      }
      if (sql.includes('FROM public.pay_position') && sql.includes('LOWER(code)')) {
        return {
          rows: [
            {
              id: 'p1',
              tenant_id: 'xevn',
              company_id: 'holding',
              code: 'CEO',
              name: 'Tổng Giám đốc',
              grade_code: 'D1',
              position_scope: 'company',
              historical_note: null,
              status: 'active',
              archived_at: null,
              created_at: '2026-01-01',
              updated_at: '2026-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.assertEmployeePositionAssignment({
        persistCompanyId: 'holding',
        requestedCompanyId: 'main',
        jobTitleKey: 'CEO',
        departmentKey: null,
        authorization: `Bearer ${token}`,
      }),
    ).resolves.toBeUndefined();
  });

  it('assertEmployeePositionAssignment rejects department-scoped position without department', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('COUNT(*)') && sql.includes('pay_position')) {
        return { rows: [{ count: '2' }] } as never;
      }
      if (sql.includes('FROM public.pay_position') && sql.includes('LOWER(code)')) {
        return {
          rows: [
            {
              id: 'p2',
              tenant_id: 'xevn',
              company_id: 'holding',
              code: 'IT_ADMIN',
              name: 'Quản trị HT',
              grade_code: 'D2',
              position_scope: 'department',
              historical_note: null,
              status: 'active',
              archived_at: null,
              created_at: '2026-01-01',
              updated_at: '2026-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.assertEmployeePositionAssignment({
        persistCompanyId: 'holding',
        requestedCompanyId: 'main',
        jobTitleKey: 'IT_ADMIN',
        departmentKey: null,
        authorization: `Bearer ${token}`,
      }),
    ).rejects.toMatchObject({ code: HRM_EMP_POSITION_DEPT_REQUIRED });
  });

  it('createPosition requires grade_code', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await expect(
      service.createPosition(
        {
          company_id: 'main',
          code: 'CEO',
          name: 'CEO',
          grade_code: '',
          position_scope: 'company',
        },
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject({ code: 'GRADE_CODE_REQUIRED' });
  });

  it('createPosition rejects unknown position when invent code missing from pay_position', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('INSERT INTO public.pay_position')) {
        return {
          rows: [
            {
              id: 'p1',
              tenant_id: 'xevn',
              company_id: 'holding',
              code: 'CEO',
              name: 'CEO',
              grade_code: 'D1',
              position_scope: 'company',
              historical_note: null,
              status: 'active',
              archived_at: null,
              created_at: '2026-01-01',
              updated_at: '2026-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const created = await service.createPosition(
      {
        company_id: 'main',
        code: 'CEO',
        name: 'Tổng Giám đốc',
        grade_code: 'D1',
        position_scope: 'company',
      },
      `Bearer ${token}`,
    );
    expect(created.code).toBe('CEO');
    expect(created.position_scope).toBe('company');
  });

  it('assertEmployeePositionAssignment rejects unknown code when pay_position EFF>0', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ count: '1' }] } as never;
      }
      if (sql.includes('FROM public.pay_position')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.assertEmployeePositionAssignment({
        persistCompanyId: 'holding',
        jobTitleKey: 'UNKNOWN',
        departmentKey: null,
        authorization: `Bearer ${token}`,
      }),
    ).rejects.toMatchObject({ code: HRM_EMP_POSITION_KEY });
  });
});
