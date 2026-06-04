import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeesService } from './employees.service';

const EMPLOYEE_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const ASSET_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const SKILL_ID = '0f64dc03-01ee-4eb2-b408-6ea2f8f9d2bb';

function groupCeoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

describe('EmployeeProfileService (BR-360-SOURCE-01 / P1-EX-BE-02)', () => {
  let profile: EmployeeProfileService;
  let employees: jest.Mocked<EmployeesService>;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = { query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as jest.Mocked<HrmDbService>;
    employees = {
      getEmployeeById: jest.fn().mockResolvedValue({
        id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        company_id: 'holding',
      }),
    } as unknown as jest.Mocked<EmployeesService>;
    profile = new EmployeeProfileService(db, employees);
  });

  it('returns empty training list with scope-checked employee (360 Nest stub)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await profile.listTraining(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      { company_id: 'main' },
      `Bearer ${token}`,
    );
    expect(res.total).toBe(0);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM public.employee_trainings'),
      expect.any(Array),
    );
  });

  it('returns empty degrees list with scope-checked employee', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await profile.listDegrees(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      { company_id: 'main' },
      `Bearer ${token}`,
    );
    expect(res.total).toBe(0);
    expect(res.phase).toBe('P1-stub-read');
    expect(employees.getEmployeeById).toHaveBeenCalledWith(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      { company_id: 'main' },
      `Bearer ${token}`,
    );
  });

  describe('profile asset mutate scope (P1-RESID-C02 / C-QUAL-02 / TM CE-05)', () => {
    it('updateAsset peeks row and allows holding company_id under group CEO main', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_assets')) {
          return { rows: [{ company_id: 'holding' }] };
        }
        if (typeof sql === 'string' && sql.includes('UPDATE public.employee_assets')) {
          return {
            rows: [{ id: ASSET_ID, employee_id: EMPLOYEE_ID, company_id: 'holding', asset_name: 'Laptop' }],
          };
        }
        return { rows: [] };
      });

      const row = await profile.updateAsset(
        ASSET_ID,
        EMPLOYEE_ID,
        { company_id: 'main' },
        { asset_name: 'Laptop' },
        `Bearer ${token}`,
      );
      expect(row.asset_name).toBe('Laptop');
      const peekCall = db.query.mock.calls.find(([sql]) =>
        String(sql).includes('SELECT company_id FROM public.employee_assets'),
      );
      expect(peekCall?.[1]).toEqual([ASSET_ID, EMPLOYEE_ID]);
    });

    it('updateAsset rejects corrupt asset row outside rollup scope (HRM-EMP-PROFILE-409)', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_assets')) {
          return { rows: [{ company_id: 'other-co' }] };
        }
        return { rows: [] };
      });

      await expect(
        profile.updateAsset(
          ASSET_ID,
          EMPLOYEE_ID,
          { company_id: 'main' },
          { asset_name: 'Laptop' },
          `Bearer ${token}`,
        ),
      ).rejects.toThrow(expect.objectContaining<ApiException>({ code: 'HRM-EMP-PROFILE-409' }));

      const updateCall = db.query.mock.calls.find(([sql]) =>
        String(sql).includes('UPDATE public.employee_assets'),
      );
      expect(updateCall).toBeUndefined();
    });

    it('deleteAsset peeks row and allows holding company_id under group CEO main', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_assets')) {
          return { rows: [{ company_id: 'holding' }] };
        }
        if (typeof sql === 'string' && sql.includes('DELETE FROM public.employee_assets')) {
          return { rows: [{ id: ASSET_ID }] };
        }
        return { rows: [] };
      });

      const result = await profile.deleteAsset(ASSET_ID, EMPLOYEE_ID, { company_id: 'main' }, `Bearer ${token}`);
      expect(result.id).toBe(ASSET_ID);
      const deleteCall = db.query.mock.calls.find(([sql]) =>
        String(sql).includes('DELETE FROM public.employee_assets'),
      );
      expect(deleteCall?.[1]).toEqual([ASSET_ID, EMPLOYEE_ID]);
    });

    it('deleteAsset rejects corrupt asset row outside rollup scope (HRM-EMP-PROFILE-409)', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_assets')) {
          return { rows: [{ company_id: 'other-co' }] };
        }
        return { rows: [] };
      });

      await expect(
        profile.deleteAsset(ASSET_ID, EMPLOYEE_ID, { company_id: 'main' }, `Bearer ${token}`),
      ).rejects.toThrow(expect.objectContaining<ApiException>({ code: 'HRM-EMP-PROFILE-409' }));

      const deleteCall = db.query.mock.calls.find(([sql]) =>
        String(sql).includes('DELETE FROM public.employee_assets'),
      );
      expect(deleteCall).toBeUndefined();
    });
  });

  describe('skill create/patch payload compatibility (P1-HRM-CRUD-BE-FIX-W1)', () => {
    it('createSkill then updateSkill(proficiency) succeeds in one sequence', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('ALTER TABLE public.employee_assets')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO public.employee_skills')) {
          return {
            rows: [{ id: SKILL_ID, employee_id: EMPLOYEE_ID, company_id: 'holding', name: 'TypeScript', level: 50 }],
          };
        }
        if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_skills')) {
          return { rows: [{ company_id: 'holding' }] };
        }
        if (typeof sql === 'string' && sql.includes('UPDATE public.employee_skills')) {
          return {
            rows: [{ id: SKILL_ID, employee_id: EMPLOYEE_ID, company_id: 'holding', name: 'TypeScript', level: 90 }],
          };
        }
        return { rows: [] };
      });

      const created = await profile.createSkill(
        EMPLOYEE_ID,
        { company_id: 'main' },
        { name: 'TypeScript', category: 'technical', level: 50 },
        `Bearer ${token}`,
      );
      const patched = await profile.updateSkill(
        String(created.id),
        EMPLOYEE_ID,
        { company_id: 'main' },
        { proficiency: 'advanced' },
        `Bearer ${token}`,
      );

      expect(created.name).toBe('TypeScript');
      expect(patched.level).toBe(90);
      const updateCall = db.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.employee_skills'));
      expect(updateCall?.[1]).toEqual([SKILL_ID, EMPLOYEE_ID, 90]);
    });

    it('updateSkill accepts proficiency alias and persists to level column', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_skills')) {
          return { rows: [{ company_id: 'holding' }] };
        }
        if (typeof sql === 'string' && sql.includes('UPDATE public.employee_skills')) {
          return {
            rows: [
              { id: SKILL_ID, employee_id: EMPLOYEE_ID, company_id: 'holding', level: 90, name: 'TypeScript' },
            ],
          };
        }
        if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('ALTER TABLE public.employee_assets')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const row = await profile.updateSkill(
        SKILL_ID,
        EMPLOYEE_ID,
        { company_id: 'main' },
        { proficiency: 'advanced' },
        `Bearer ${token}`,
      );

      expect(row.level).toBe(90);
      const updateCall = db.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.employee_skills'));
      expect(updateCall?.[1]).toEqual([SKILL_ID, EMPLOYEE_ID, 90]);
    });
  });
});
