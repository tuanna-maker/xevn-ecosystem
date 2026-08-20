/**
 * D-HDSD-MUTATE-BE-03 — job-templates list scope_parity (jd-library ↔ GET job-templates).
 * QA-HDSD-MUTATE-RET-03-HRM-R11: jd-library tbody count=1 vs create dialog effectiveTemplates=[] triage.
 * U65: no seed — mock SQL only.
 */
import { signServiceJwt } from '../common/jwt-sign';
import { RecruitmentCatalogService } from './recruitment-catalog.service';

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

function groupCeoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

describe('D-HDSD-MUTATE-BE-03 listJobDescriptionTemplates scope_parity', () => {
  it('lists holding-partition JD when group CEO requests company_id=main (rollup ANY)', async () => {
    const templateId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const listSqlParams: unknown[][] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (s.includes('CREATE TABLE') || s.includes('ALTER TABLE')) {
            return { rows: [] };
          }
          if (s.includes('FROM public.job_description_templates')) {
            listSqlParams.push(params ?? []);
            return {
              rows: [
                {
                  id: templateId,
                  company_id: 'holding',
                  code: 'JD-HDSDUS0BK',
                  title: 'QA JD HDSDUS0BK',
                  position_name: 'Tổng Giám đốc',
                  position_code: 'CEO',
                  job_description: null,
                  requirements: null,
                  notes: null,
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
    );

    const result = await svc.listJobDescriptionTemplates(
      'main',
      groupCeoAuth(),
    );

    expect(result.total).toBe(1);
    expect(result.data[0]?.company_id).toBe('holding');
    expect(result.data[0]?.code).toBe('JD-HDSDUS0BK');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.arrayContaining(['holding'])]),
    );
    expect(listSqlParams[0]?.[0]).toEqual(
      expect.arrayContaining([
        'holding',
        'trsport',
        'logistics',
        'finance',
        'services',
      ]),
    );
  });

  it('create persists main→holding so list rollup finds new JD (parity with resolveHrmPersistCompanyIdText)', async () => {
    const insertParams: unknown[][] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (s.includes('CREATE TABLE') || s.includes('ALTER TABLE')) {
            return { rows: [] };
          }
          if (
            s.includes(
              'SELECT id FROM public.job_description_templates WHERE company_id',
            )
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.job_description_templates')) {
            insertParams.push(params ?? []);
            return {
              rows: [
                {
                  id: params?.[0],
                  company_id: params?.[1],
                  code: params?.[2],
                  title: params?.[3],
                  position_code: params?.[5],
                  is_active: true,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'CEO',
        label: 'Tổng Giám đốc',
        status: 'active',
      }),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
      catalogs as never,
    );

    const created = await svc.createJobDescriptionTemplate(
      {
        company_id: 'main',
        code: 'JD-MAIN-PERSIST',
        title: 'JD from main query',
        position_code: 'CEO',
      },
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );

    expect(created.company_id).toBe('holding');
    expect(insertParams[0]?.[1]).toBe('holding');
  });
});
