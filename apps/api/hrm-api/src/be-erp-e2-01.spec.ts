/**
 * D-BE-ERP-E2-01 — pay_types / contract_types assert + salary component unique.
 * U65: no seed — catalog assert mocked.
 *
 * @CODE-MEMORY-CHANGE 2026-08-24 PO-HRM-CTR-CREATE-CATALOG-PARITY-01
 * What: tests — holding catalog partition for contract_types; department_key HRM fallback
 * Spec: docs/program/specs/PO-HRM-CTR-CREATE-CATALOG-PARITY-01.md
 * Evidence: docs/qa/evidence/po-hrm-ctr-create-catalog-parity-01.md
 */
import 'reflect-metadata';
import { ApiException } from './common/api.exception';
import { signServiceJwt } from './common/jwt-sign';
import {
  ContractsInsuranceService,
  HRM_CON_POS_KEY,
  HRM_CON_TYPE_KEY,
} from './contracts-insurance/contracts-insurance.service';
import {
  HRM_PAY_TYPE_KEY,
  HRM_SC_002,
  PayrollCatalogService,
} from './payroll/payroll-catalog.service';

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
      s.includes('DROP DEFAULT')
    ) {
      return Promise.resolve({ rows: [] });
    }
    const hit = extra?.(s, params);
    if (hit) return Promise.resolve(hit);
    return Promise.resolve({ rows: [] });
  });
}

describe('D-BE-ERP-E2-01 PayrollCatalogService pay_types + unique', () => {
  it('ensureSchema drops VI default and creates unique (company_id, lower(code))', async () => {
    const ddl: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        ddl.push(String(sql));
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new PayrollCatalogService(db as never);
    await svc.listSalaryComponents('holding', ceoAuth());
    const joined = ddl.join('\n');
    expect(joined).toMatch(/ALTER COLUMN component_type DROP DEFAULT/);
    expect(joined).toMatch(/uq_salary_components_company_code/);
    expect(joined).toMatch(/lower\(code\)/);
    expect(joined).not.toMatch(/DEFAULT 'Lương'/);
  });

  it('create rejects missing component_type with HRM-PAY-TYPE-KEY (no Lương fallback)', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = { assertCodeInEffectiveCatalog: jest.fn() };
    const svc = new PayrollCatalogService(db as never, catalogs as never);
    await expect(
      svc.createSalaryComponent(
        { company_id: 'holding', code: 'BASIC', name: 'Lương cơ bản' },
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TYPE_KEY });
    expect(catalogs.assertCodeInEffectiveCatalog).not.toHaveBeenCalled();
  });

  it('create invents nature → HRM-PAY-TYPE-KEY via pay_types assert', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockRejectedValue(new ApiException(HRM_PAY_TYPE_KEY, 'invent', 400)),
    };
    const svc = new PayrollCatalogService(db as never, catalogs as never);
    await expect(
      svc.createSalaryComponent(
        {
          company_id: 'holding',
          code: 'BASIC',
          name: 'Lương cơ bản',
          component_type: 'Lương',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TYPE_KEY });
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'pay_types',
        code: 'Lương',
        errorCode: HRM_PAY_TYPE_KEY,
      }),
    );
  });

  it('create happy path persists catalog code (not VI invent)', async () => {
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('SELECT id FROM public.salary_components')) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO public.salary_components')) {
          return {
            rows: [
              {
                id: params?.[0],
                company_id: 'holding',
                code: 'BASIC',
                component_type: 'base_salary',
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
        code: 'base_salary',
        label: 'Lương cơ bản',
        status: 'active',
      }),
    };
    const svc = new PayrollCatalogService(db as never, catalogs as never);
    const row = await svc.createSalaryComponent(
      {
        company_id: 'holding',
        code: 'BASIC',
        name: 'Lương cơ bản',
        component_type: 'base_salary',
      },
      ceoAuth(),
    );
    expect(row.component_type).toBe('base_salary');
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ catalogKey: 'pay_types', code: 'base_salary' }),
    );
  });

  it('create duplicate code → HRM-SC-002', async () => {
    const db = {
      query: ddlAwareQuery((sql) => {
        if (sql.includes('SELECT id FROM public.salary_components')) {
          return { rows: [{ id: 'existing-1' }] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'base_salary',
        label: 'Lương cơ bản',
        status: 'active',
      }),
    };
    const svc = new PayrollCatalogService(db as never, catalogs as never);
    await expect(
      svc.createSalaryComponent(
        {
          company_id: 'holding',
          code: 'BASIC',
          name: 'Dup',
          component_type: 'base_salary',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_SC_002 });
  });

  it('update invents component_type → HRM-PAY-TYPE-KEY', async () => {
    const db = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.salary_components') &&
          sql.includes('WHERE id')
        ) {
          return {
            rows: [
              {
                company_id: 'holding',
                archived_at: null,
                component_type: 'base_salary',
                is_system: false,
              },
            ],
          };
        }
        if (sql.includes('FROM public.hrm_allowance_deduction_types')) {
          return { rows: [] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockRejectedValue(new ApiException(HRM_PAY_TYPE_KEY, 'invent', 400)),
    };
    const svc = new PayrollCatalogService(db as never, catalogs as never);
    await expect(
      svc.updateSalaryComponent(
        '11111111-1111-4111-8111-111111111111',
        { component_type: 'NOT_IN_CATALOG' },
        'holding',
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TYPE_KEY });
  });
});

describe('D-BE-ERP-E2-01 ContractsInsuranceService contract_types', () => {
  it('create invents contract_type → HRM-CON-TYPE-KEY', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockImplementation(
          async (opts: { catalogKey: string; errorCode: string }) => {
            if (opts.catalogKey === 'contract_types') {
              throw new ApiException(HRM_CON_TYPE_KEY, 'invent', 400);
            }
            return { code: 'NV_KD', label: 'NV', status: 'active' };
          },
        ),
      getEffectiveItemsForKey: jest
        .fn()
        .mockResolvedValue([{ code: 'NV_KD', label: 'NV', status: 'active' }]),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await expect(
      svc.createContract(
        {
          company_id: 'holding',
          employee_id: '11111111-1111-4111-8111-111111111111',
          contract_type: 'FAKE_TYPE',
          start_date: '2026-01-01',
          position_key: 'NV_KD',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_CON_TYPE_KEY });
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'contract_types',
        code: 'FAKE_TYPE',
        errorCode: HRM_CON_TYPE_KEY,
      }),
    );
  });

  it('create asserts contract_types then keeps E1-A position_key', async () => {
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('INSERT INTO public.employee_contracts')) {
          return {
            rows: [
              {
                id: params?.[0],
                contract_type: 'indefinite',
                position_key: 'NV_KD',
                end_date: null,
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
            label: opts.code,
            status: 'active',
          }),
        ),
      getEffectiveItemsForKey: jest
        .fn()
        .mockResolvedValue([{ code: 'NV_KD', label: 'NV', status: 'active' }]),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await svc.createContract(
      {
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
      },
      ceoAuth(),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'contract_types',
        errorCode: HRM_CON_TYPE_KEY,
      }),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'job_titles',
        errorCode: HRM_CON_POS_KEY,
      }),
    );
  });

  it('create maps group CEO main persist → holding catalog partition for contract_types', async () => {
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('INSERT INTO public.employee_contracts')) {
          return {
            rows: [
              {
                id: params?.[0],
                contract_type: 'HDLD_XDHN_12',
                position_key: 'NV_KD',
                end_date: '2027-01-01',
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
          async (opts: { code: string; catalogKey: string; companyId: string }) => ({
            code: opts.code,
            label: opts.code,
            status: 'active',
          }),
        ),
      getEffectiveItemsForKey: jest
        .fn()
        .mockResolvedValue([{ code: 'NV_KD', label: 'NV', status: 'active' }]),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    const auth = `Bearer ${signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    })}`;
    await svc.createContract(
      {
        company_id: 'main',
        employee_id: '11111111-1111-4111-8111-111111111111',
        contract_type: 'HDLD_XDHN_12',
        start_date: '2026-01-01',
        end_date: '2027-01-01',
        position_key: 'NV_KD',
      },
      auth,
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'contract_types',
        companyId: 'holding',
        code: 'HDLD_XDHN_12',
      }),
    );
  });

  it('create accepts department_key from HRM departments when absent from catalog', async () => {
    const db = {
      query: jest.fn().mockImplementation((sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('DROP DEFAULT')
        ) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('FROM public.departments')) {
          return Promise.resolve({
            rows: [{ id: 'dept-1', code: 'PHONG_QLPT' }],
          });
        }
        if (s.includes('INSERT INTO public.employee_contracts')) {
          return Promise.resolve({
            rows: [{ id: params?.[0], department_key: 'PHONG_QLPT' }],
          });
        }
        if (s.includes('FROM public.employees')) {
          return Promise.resolve({ rows: [{ job_title_key: 'ACCOUNTANT' }] });
        }
        return Promise.resolve({ rows: [] });
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockImplementation(
          async (opts: { code: string; catalogKey: string }) => ({
            code: opts.code,
            label: opts.code,
            status: 'active',
          }),
        ),
      getEffectiveItemsForKey: jest.fn().mockImplementation(async (_t, _c, key) => {
        if (key === 'departments') return [];
        if (key === 'contract_types') {
          return [{ code: 'HDLD_XDHN_12', label: '12m', status: 'active' }];
        }
        if (key === 'job_titles') {
          return [{ code: 'ACCOUNTANT', label: 'KT', status: 'active' }];
        }
        return [];
      }),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    const auth = `Bearer ${signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    })}`;
    await svc.createContract(
      {
        company_id: 'main',
        employee_id: '11111111-1111-4111-8111-111111111111',
        contract_type: 'HDLD_XDHN_12',
        start_date: '2026-04-01',
        end_date: '2027-04-01',
        position_key: 'ACCOUNTANT',
        department_key: 'PHONG_QLPT',
        signed_at: '2026-04-01',
        work_arrangement: 'chinh_thuc',
        salary_ratio_percent: 100,
      },
      auth,
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM public.departments'),
      expect.any(Array),
    );
  });

  it('update invents contract_type → HRM-CON-TYPE-KEY', async () => {
    const db = {
      query: ddlAwareQuery((sql) => {
        if (
          sql.includes('FROM public.employee_contracts') &&
          sql.includes('WHERE id')
        ) {
          return { rows: [{ id: 'con-1', company_id: 'holding' }] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockRejectedValue(new ApiException(HRM_CON_TYPE_KEY, 'invent', 400)),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await expect(
      svc.updateContract(
        'con-1',
        { contract_type: 'INVENT' },
        'holding',
        ceoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_CON_TYPE_KEY });
  });
});

describe('D-BE-ERP-E2-01 non-goals', () => {
  it('payroll controller has no tax-settlement invent routes', () => {
    const fs = require('node:fs') as typeof import('node:fs');

    const path = require('node:path') as typeof import('node:path');
    const ctrl = fs.readFileSync(
      path.join(__dirname, 'payroll', 'payroll.controller.ts'),
      'utf8',
    );
    expect(ctrl).not.toMatch(/tax-settlement|tax_settlements|TaxSettlement/);
  });
});
