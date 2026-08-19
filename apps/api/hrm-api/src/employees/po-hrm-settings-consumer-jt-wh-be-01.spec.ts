/**
 * D-BE-HRM-WH-POSITION-KEY-01 — AC-SET-CONSUMER-JT-WH-01 (job_titles → work-timeline).
 * U65: no seed — catalog assert mocked via SettingsCatalogsService.
 */
import 'reflect-metadata';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import {
  EmployeeProfileService,
  HRM_WH_PICK_EMPTY_CATALOG,
  HRM_WH_PICK_REQUIRED,
} from './employee-profile.service';

const EMP_ID = '22222222-2222-4222-8222-222222222222';

function ceoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'group_ceo',
  })}`;
}

function ddlAwareQuery(extra?: (sql: string, params?: unknown[]) => { rows: unknown[] } | null) {
  return jest.fn().mockImplementation((sql: string, params?: unknown[]) => {
    const s = String(sql);
    if (
      s.includes('CREATE TABLE') ||
      s.includes('ALTER TABLE') ||
      s.includes('CREATE INDEX') ||
      s.includes('CREATE UNIQUE')
    ) {
      return Promise.resolve({ rows: [] });
    }
    const hit = extra?.(s, params);
    if (hit) return Promise.resolve(hit);
    return Promise.resolve({ rows: [] });
  });
}

function mockEmployeeLookup() {
  return {
    getEmployeeById: jest.fn().mockResolvedValue({
      id: EMP_ID,
      company_id: 'holding',
      full_name: 'Nguyen Van A',
    }),
  };
}

describe('D-BE-HRM-WH-POSITION-KEY-01 AC-SET-CONSUMER-JT-WH-01', () => {
  it('POST work-timeline requires position_key ∈ effective job_titles', async () => {
    const insertSql: string[] = [];
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('INSERT INTO public.employee_work_timeline')) {
          insertSql.push(sql);
          return {
            rows: [
              {
                id: params?.[0],
                position_key: 'TP_KD',
                position: 'Trưởng phòng Kinh doanh',
                event_date: '2026-08-01',
                title: 'Bổ nhiệm',
              },
            ],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'TP_KD',
        label: 'Trưởng phòng Kinh doanh',
        status: 'active',
      }),
    };
    const svc = new EmployeeProfileService(db as never, mockEmployeeLookup() as never, catalogs as never);
    const row = await svc.createWorkTimelineItem(
      EMP_ID,
      { company_id: 'holding' },
      {
        event_date: '2026-08-01',
        title: 'Bổ nhiệm',
        position_key: 'TP_KD',
      },
      ceoAuth(),
    );
    expect(row.position_key).toBe('TP_KD');
    expect(row.position).toBe('Trưởng phòng Kinh doanh');
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'job_titles',
        code: 'TP_KD',
        companyId: 'holding',
        errorCode: HRM_WH_PICK_REQUIRED,
      }),
    );
    expect(insertSql.join(' ')).toMatch(/position_key/);
  });

  it('POST rejects unknown position_key (catalog assert fail-closed)', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockRejectedValue(
        new ApiException(HRM_WH_PICK_REQUIRED, 'not in catalog', HttpStatus.BAD_REQUEST),
      ),
    };
    const svc = new EmployeeProfileService(db as never, mockEmployeeLookup() as never, catalogs as never);
    await expect(
      svc.createWorkTimelineItem(
        EMP_ID,
        { company_id: 'holding' },
        { event_date: '2026-08-01', title: 'x', position_key: 'INVENTED_CODE' },
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_WH_PICK_REQUIRED });
  });

  it('PATCH work-timeline asserts job_titles when position_key sent', async () => {
    const updateSets: string[] = [];
    const db = {
      query: ddlAwareQuery((sql) => {
        if (sql.includes('SELECT company_id FROM public.employee_work_timeline')) {
          return { rows: [{ company_id: 'holding' }] };
        }
        if (sql.includes('UPDATE public.employee_work_timeline')) {
          updateSets.push(sql);
          return {
            rows: [{ id: 'wh-item-1', position_key: 'NV_KD', position: 'Nhân viên Kinh doanh' }],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'NV_KD',
        label: 'Nhân viên Kinh doanh',
        status: 'active',
      }),
    };
    const svc = new EmployeeProfileService(db as never, mockEmployeeLookup() as never, catalogs as never);
    await svc.updateWorkTimelineItem(
      'wh-item-1',
      EMP_ID,
      { company_id: 'holding' },
      { position_key: 'NV_KD' },
      ceoAuth(),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ catalogKey: 'job_titles', code: 'NV_KD' }),
    );
    expect(updateSets.join(' ')).toMatch(/position_key/);
  });

  it('empty job_titles catalog → HRM-WH-PICK-EMPTY-CATALOG (no free-text escape)', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockRejectedValue(
        new ApiException(HRM_WH_PICK_REQUIRED, 'no active items in catalog', HttpStatus.BAD_REQUEST),
      ),
    };
    const svc = new EmployeeProfileService(db as never, mockEmployeeLookup() as never, catalogs as never);
    await expect(
      svc.createWorkTimelineItem(
        EMP_ID,
        { company_id: 'holding' },
        { event_date: '2026-08-01', title: 'x', position_key: 'CEO' },
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_WH_PICK_EMPTY_CATALOG });
  });

  it('scope parity: employee company_id=main resolves job_titles assert to holding (Settings GET items)', async () => {
    const insertSql: string[] = [];
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('INSERT INTO public.employee_work_timeline')) {
          insertSql.push(sql);
          return {
            rows: [
              {
                id: params?.[0],
                position_key: 'ceo',
                position: 'Giám đốc',
                event_date: '2026-08-01',
                title: 'QA scope',
              },
            ],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'ceo',
        label: 'Giám đốc',
        status: 'active',
      }),
    };
    const employees = {
      getEmployeeById: jest.fn().mockResolvedValue({
        id: EMP_ID,
        company_id: 'main',
        full_name: 'Le Van C',
      }),
    };
    const svc = new EmployeeProfileService(db as never, employees as never, catalogs as never);
    await svc.createWorkTimelineItem(
      EMP_ID,
      { company_id: 'main' },
      {
        event_date: '2026-08-01',
        title: 'QA scope',
        position_key: 'ceo',
        department_key: 'DEPT_01',
      },
      ceoAuth(),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'job_titles',
        code: 'ceo',
        companyId: 'holding',
      }),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'departments',
        code: 'DEPT_01',
        companyId: 'holding',
      }),
    );
    expect(insertSql.join(' ')).toMatch(/position_key/);
  });
});
