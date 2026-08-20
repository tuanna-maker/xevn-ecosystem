/**
 * D-BE-ERP-E3-01 — assertStatusTransition + Perf PATCH/DELETE + Ins policy CRUD + KEY asserts.
 * U65: no seed — catalog assert mocked.
 */
import 'reflect-metadata';
import { ApiException } from './common/api.exception';
import {
  assertStatusTransition,
  HRM_SM_001,
} from './common/assert-status-transition';
import { signServiceJwt } from './common/jwt-sign';
import {
  ContractsInsuranceService,
  HRM_INS_INSURER_KEY,
  HRM_INS_POL_002,
  HRM_INS_TYPE_KEY,
} from './contracts-insurance/contracts-insurance.service';
import {
  HRM_PERF_DEL_BLOCK,
  HRM_PERF_KPI_KEY,
  HRM_PERF_LOCKED,
  PerformanceService,
} from './performance/performance.service';
import { resolveCatalogFamily } from './settings-catalogs/hrm-settings-master-keys';

function ceoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'group_ceo',
  })}`;
}

function ddlAwareQuery(
  extra?: (sql: string, params?: unknown[]) => { rows: unknown[] } | null,
) {
  return jest.fn().mockImplementation((sql: string, params?: unknown[]) => {
    const s = String(sql);
    if (
      s.includes('CREATE TABLE') ||
      s.includes('ALTER TABLE') ||
      s.includes('CREATE INDEX') ||
      s.includes('CREATE UNIQUE') ||
      s.includes('DROP CONSTRAINT')
    ) {
      return Promise.resolve({ rows: [] });
    }
    const hit = extra?.(s, params);
    if (hit) return Promise.resolve(hit);
    return Promise.resolve({ rows: [] });
  });
}

describe('D-BE-ERP-E3-01 assertStatusTransition', () => {
  it('idempotent from===to', () => {
    expect(() =>
      assertStatusTransition({
        domain: 'performance_evaluation',
        from: 'draft',
        to: 'draft',
      }),
    ).not.toThrow();
  });

  it('eval draft→completed skip → HRM-SM-001', () => {
    try {
      assertStatusTransition({
        domain: 'performance_evaluation',
        from: 'draft',
        to: 'completed',
      });
      fail('expected throw');
    } catch (e) {
      expect(e).toMatchObject<ApiException>({ code: HRM_SM_001 });
    }
  });

  it('cycle closed→active → HRM-SM-001', () => {
    try {
      assertStatusTransition({
        domain: 'performance_cycle',
        from: 'closed',
        to: 'active',
      });
      fail('expected throw');
    } catch (e) {
      expect(e).toMatchObject<ApiException>({ code: HRM_SM_001 });
    }
  });

  it('policy active→draft → HRM-SM-001', () => {
    try {
      assertStatusTransition({
        domain: 'insurance_policy',
        from: 'active',
        to: 'draft',
      });
      fail('expected throw');
    } catch (e) {
      expect(e).toMatchObject<ApiException>({ code: HRM_SM_001 });
    }
  });

  it('leave approved→pending → HRM-SM-001', () => {
    try {
      assertStatusTransition({
        domain: 'leave',
        from: 'approved',
        to: 'pending',
      });
      fail('expected throw');
    } catch (e) {
      expect(e).toMatchObject<ApiException>({ code: HRM_SM_001 });
    }
  });

  it('eval draft→submitted allowed', () => {
    expect(() =>
      assertStatusTransition({
        domain: 'performance_evaluation',
        from: 'draft',
        to: 'submitted',
      }),
    ).not.toThrow();
  });
});

describe('D-BE-ERP-E3-01 catalog family aliases', () => {
  it('insurers aliases resolve', () => {
    expect(resolveCatalogFamily('insurers').storageKey).toBe('insurers');
    expect(resolveCatalogFamily('insurance_providers').familyId).toBe(
      'insurers',
    );
    expect(resolveCatalogFamily('kpi_metrics').storageKey).toBe('kpi_library');
  });
});

describe('D-BE-ERP-E3-01 PerformanceService', () => {
  const cycleRow = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    company_id: 'holding',
    cycle_name: '2026 H1',
    start_date: '2026-01-01',
    end_date: '2026-06-30',
    status: 'draft' as const,
    created_by: 'hr',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  it('updateCycle draft→active OK; closed content → HRM-PERF-LOCKED', async () => {
    const db = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.performance_cycles') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [cycleRow] };
        }
        if (sql.includes('UPDATE public.performance_cycles')) {
          return { rows: [{ ...cycleRow, status: 'active' }] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new PerformanceService(db as never);
    const updated = await svc.updateCycle(
      cycleRow.id,
      { status: 'active' },
      'holding',
      ceoAuth(),
    );
    expect(updated.status).toBe('active');

    const closedDb = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.performance_cycles') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [{ ...cycleRow, status: 'closed' }] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const closedSvc = new PerformanceService(closedDb as never);
    await expect(
      closedSvc.updateCycle(
        cycleRow.id,
        { cycle_name: 'X' },
        'holding',
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_PERF_LOCKED });
  });

  it('deleteCycle with submitted eval → HRM-PERF-DEL-BLOCK', async () => {
    const db = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.performance_cycles') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [cycleRow] };
        }
        if (
          sql.includes('COUNT(*)') &&
          sql.includes('performance_evaluations')
        ) {
          return { rows: [{ total: '1' }] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new PerformanceService(db as never);
    await expect(
      svc.deleteCycle(cycleRow.id, 'holding', ceoAuth()),
    ).rejects.toMatchObject<ApiException>({
      code: HRM_PERF_DEL_BLOCK,
    });
  });

  it('updateEvaluation invents kpi_code → HRM-PERF-KPI-KEY', async () => {
    const evalRow = {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      cycle_id: cycleRow.id,
      score: 80,
      summary: 'ok',
      reviewer: 'mgr',
      status: 'draft' as const,
      kpi_code: null,
      job_grade_key: null,
      department_key: null,
      kpi_name: null,
      submitted_at: null,
      approved_at: null,
      completed_at: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    const db = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.performance_evaluations') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [evalRow] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockRejectedValue(new ApiException(HRM_PERF_KPI_KEY, 'invent', 400)),
    };
    const svc = new PerformanceService(db as never, catalogs as never);
    await expect(
      svc.updateEvaluation(
        evalRow.id,
        { kpi_code: 'FAKE' },
        'holding',
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_PERF_KPI_KEY });
  });

  it('updateEvaluation draft→completed skip → HRM-SM-001', async () => {
    const evalRow = {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      cycle_id: cycleRow.id,
      score: 80,
      summary: 'ok',
      reviewer: 'mgr',
      status: 'draft' as const,
      kpi_code: null,
      job_grade_key: null,
      department_key: null,
      kpi_name: null,
      submitted_at: null,
      approved_at: null,
      completed_at: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    const db = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.performance_evaluations') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [evalRow] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new PerformanceService(db as never);
    await expect(
      svc.updateEvaluation(
        evalRow.id,
        { status: 'completed' },
        'holding',
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_SM_001 });
  });
});

describe('D-BE-ERP-E3-01 ContractsInsuranceService policies', () => {
  it('createInsurancePolicy invents insurer → HRM-INS-INSURER-KEY', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockImplementation(async (opts: { catalogKey: string }) => {
          if (opts.catalogKey === 'insurers') {
            throw new ApiException(HRM_INS_INSURER_KEY, 'invent', 400);
          }
          return { code: 'BHXH', label: 'BHXH' };
        }),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await expect(
      svc.createInsurancePolicy(
        {
          company_id: 'holding',
          policy_code: 'P1',
          policy_name: 'Policy 1',
          insurer_key: 'NOPE',
          insurance_type: 'BHXH',
          effective_date: '2026-01-01',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_INS_INSURER_KEY });
  });

  it('createInsurancePolicy invents type → HRM-INS-TYPE-KEY', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockImplementation(
          async (opts: { catalogKey: string; code: string }) => {
            if (opts.catalogKey === 'insurance_types') {
              throw new ApiException(HRM_INS_TYPE_KEY, 'invent', 400);
            }
            return { code: opts.code, label: opts.code };
          },
        ),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await expect(
      svc.createInsurancePolicy(
        {
          company_id: 'holding',
          policy_code: 'P1',
          policy_name: 'Policy 1',
          insurer_key: 'BV',
          insurance_type: 'NOPE',
          effective_date: '2026-01-01',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_INS_TYPE_KEY });
  });

  it('createInsurancePolicy happy path persists insurer_key code', async () => {
    const db = {
      query: ddlAwareQuery((sql) => {
        if (sql.includes('INSERT INTO public.hrm_insurance_policies')) {
          return {
            rows: [
              {
                id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
                company_id: 'holding',
                policy_code: 'P1',
                policy_name: 'Policy 1',
                insurer_key: 'BV',
                insurer_label: 'Bao Viet',
                insurance_type: 'BHXH',
                effective_date: '2026-01-01',
                expiry_date: null,
                status: 'draft',
                notes: null,
                created_by: null,
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
            ],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockImplementation(
          async (opts: { code: string; catalogKey: string }) => ({
            code: opts.code,
            label: opts.catalogKey === 'insurers' ? 'Bao Viet' : opts.code,
          }),
        ),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    const row = await svc.createInsurancePolicy(
      {
        company_id: 'holding',
        policy_code: 'P1',
        policy_name: 'Policy 1',
        insurer_key: 'BV',
        insurance_type: 'BHXH',
        effective_date: '2026-01-01',
      },
      ceoAuth(),
    );
    expect(row.insurer_key).toBe('BV');
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'insurers',
        code: 'BV',
        errorCode: HRM_INS_INSURER_KEY,
      }),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'insurance_types',
        code: 'BHXH',
        errorCode: HRM_INS_TYPE_KEY,
      }),
    );
  });

  it('updateInsurancePolicy active→draft → HRM-SM-001', async () => {
    const policy = {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      company_id: 'holding',
      policy_code: 'P1',
      policy_name: 'Policy 1',
      insurer_key: 'BV',
      insurer_label: 'Bao Viet',
      insurance_type: 'BHXH',
      effective_date: '2026-01-01',
      expiry_date: null,
      status: 'active' as const,
      notes: null,
      created_by: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    const db = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.hrm_insurance_policies') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [policy] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new ContractsInsuranceService(db as never);
    await expect(
      svc.updateInsurancePolicy(
        policy.id,
        { status: 'draft' },
        'holding',
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_SM_001 });
  });

  it('createInsurancePolicy duplicate → HRM-INS-POL-002', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.hrm_insurance_policies')) {
          const err = new Error('dup') as Error & { code: string };
          err.code = '23505';
          throw err;
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockResolvedValue({ code: 'BV', label: 'Bao Viet' }),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await expect(
      svc.createInsurancePolicy(
        {
          company_id: 'holding',
          policy_code: 'P1',
          policy_name: 'Policy 1',
          insurer_key: 'BV',
          insurance_type: 'BHXH',
          effective_date: '2026-01-01',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_INS_POL_002 });
  });

  it('createInsuranceRecord requires insurer_key', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = { assertCodeInEffectiveCatalog: jest.fn() };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await expect(
      svc.createInsuranceRecord(
        {
          company_id: 'holding',
          employee_id: '11111111-1111-4111-8111-111111111111',
          policy_number: 'X-1',
          expiry_date: '2026-12-31',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_INS_INSURER_KEY });
  });
});
