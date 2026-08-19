/**
 * @CODE-MEMORY
 * Screen: ContractWorkspace — bootstrap C&B khi tạo hợp đồng
 * UC: J-HRM-CTR-CB-BOOT-01 · BR-CTR-CB-BOOT-01..04
 * BR: Hai mức base/si_base độc lập; mutate theo membership C&B; packages là ONE SoT
 * SRS: docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md §3–§5 · §10b
 * TechSpec: docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md §14
 * Purpose: Khóa regression AuthZ, VAL, overlap, whitelist mã hệ thống và snapshot si_base.
 * WorkItem: D-BE-CTR-CB-BOOT-01
 * Coded: 2026-08-12
 * Callers: Jest
 * Callees: EmployeeCompensationService · ContractsInsuranceService
 * FEActions: ContractWorkspace POST packages rồi GET create-context
 * BEChain: packages → lines base/si_base → create-context snapshot
 * Impact: Sai regression làm HCNS không nhập được BH hoặc snapshot lấy nhầm lương cơ bản.
 * must_keep: Không seed; không Nest /core; không cột lương BH trên employee_contracts.
 * SOLID: Test theo contract API, không kiểm tra chi tiết triển khai ngoài invariant.
 * LastVerified: pnpm --filter hrm-api test -- --runInBand d-be-ctr-cb-boot-01.cb-boot.spec.ts
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_CORE_CB_VAL_400 } from './compensation-cb-authz';
import { ContractsInsuranceService } from './contracts-insurance.service';
import {
  CompensationPackageDetail,
  EmployeeCompensationService,
} from './employee-compensation.service';

const EMPLOYEE_ID = '16f5e2c5-8fbb-4500-8c82-623950f7055e';
const PACKAGE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function auth(
  roleCode: string,
  permissions?: Array<{ module: string; action: string }>,
): string {
  return `Bearer ${signServiceJwt({
    sub: `${roleCode}@xe.vn`,
    tenantId: 'xevn',
    companyId: 'main',
    roleCode,
    permissions,
  })}`;
}

function packageRow(
  lines: CompensationPackageDetail['lines'],
): CompensationPackageDetail {
  return {
    id: PACKAGE_ID,
    company_id: 'holding',
    employee_id: EMPLOYEE_ID,
    contract_id: null,
    version: 1,
    supersedes_package_id: null,
    effective_from: '2026-08-12',
    effective_to: null,
    currency: 'VND',
    change_reason: 'ctr_workspace_bootstrap',
    bank_account: null,
    bank_name: null,
    bank_branch: null,
    tax_id: null,
    created_at: '2026-08-12T00:00:00.000Z',
    updated_at: '2026-08-12T00:00:00.000Z',
    lines,
  };
}

function line(
  lineType: 'base' | 'allowance',
  amount: number,
  componentCode: string,
  allowanceCode: string | null,
): CompensationPackageDetail['lines'][number] {
  return {
    id:
      componentCode === 'base'
        ? '11111111-1111-4111-8111-111111111101'
        : '11111111-1111-4111-8111-111111111102',
    package_id: PACKAGE_ID,
    line_type: lineType,
    amount,
    currency: 'VND',
    allowance_code: allowanceCode,
    component_code: componentCode,
    taxable: true,
    note: null,
    sort_order: componentCode === 'base' ? 0 : 1,
    created_at: '2026-08-12T00:00:00.000Z',
  };
}

describe('D-BE-CTR-CB-BOOT-01', () => {
  function createCompensationService(
    queryImpl?: (
      sql: string,
      params?: unknown[],
    ) => { rows: unknown[] } | Promise<{ rows: unknown[] }>,
  ): { service: EmployeeCompensationService; db: jest.Mocked<HrmDbService> } {
    const db = {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        if (queryImpl) return (await queryImpl(sql, params)) as never;
        return { rows: [] } as never;
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    return { service: new EmployeeCompensationService(db), db };
  }

  it('AuthZ 403: vai trò HCNS không tự cấp quyền C&B; membership write mới được mutate', async () => {
    const { service } = createCompensationService();
    const payload = {
      company_id: 'holding',
      employee_id: EMPLOYEE_ID,
      effective_from: '2026-08-12',
      change_reason: 'ctr_workspace_bootstrap',
      lines: [
        {
          line_type: 'base' as const,
          amount: 12_000_000,
          component_code: 'base',
        },
        {
          line_type: 'allowance' as const,
          amount: 10_000_000,
          allowance_code: 'si_base',
          component_code: 'si_base',
        },
      ],
    };

    await expect(
      service.createPackage(payload, auth('hrbp')),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-CORE-CB-AUTHZ-403',
    });

    const permitted = auth('hrbp', [
      { module: 'compensation', action: 'write' },
    ]);
    await expect(
      service.createPackage(payload, permitted),
    ).rejects.not.toMatchObject<ApiException>({
      code: 'HRM-CORE-CB-AUTHZ-403',
    });
  });

  it.each([
    ['base bằng 0', 0, 10_000_000],
    ['si_base bằng 0', 12_000_000, 0],
  ])('VAL-400 khi bootstrap %s', async (_case, baseAmount, siBaseAmount) => {
    const { service } = createCompensationService();
    await expect(
      service.createPackage(
        {
          company_id: 'holding',
          employee_id: EMPLOYEE_ID,
          effective_from: '2026-08-12',
          change_reason: 'ctr_workspace_bootstrap',
          lines: [
            { line_type: 'base', amount: baseAmount, component_code: 'base' },
            {
              line_type: 'allowance',
              amount: siBaseAmount,
              allowance_code: 'si_base',
              component_code: 'si_base',
            },
          ],
        },
        auth('group_ceo'),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_CORE_CB_VAL_400 });
  });

  it('accepts base + si_base without catalog seed and persists distinct amounts', async () => {
    const insertedAmounts: number[] = [];
    const { service, db } = createCompensationService((sql, params) => {
      if (sql.includes('FROM public.employees e')) {
        return {
          rows: [
            {
              id: EMPLOYEE_ID,
              company_id: 'holding',
              status: 'active',
              employment_status: 'active',
            },
          ],
        };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages p') &&
        sql.includes('effective_from::date <=')
      ) {
        return { rows: [] };
      }
      if (sql.includes('INSERT INTO public.employee_compensation_packages')) {
        return { rows: [packageRow([])] };
      }
      if (sql.includes('INSERT INTO public.employee_compensation_lines')) {
        const amount = Number(params?.[3]);
        const componentCode = String(params?.[6]);
        insertedAmounts.push(amount);
        return {
          rows: [
            line(
              params?.[2] as 'base' | 'allowance',
              amount,
              componentCode,
              typeof params?.[5] === 'string' ? params[5] : null,
            ),
          ],
        };
      }
      return { rows: [] };
    });

    const result = await service.createPackage(
      {
        company_id: 'holding',
        employee_id: EMPLOYEE_ID,
        effective_from: '2026-08-12',
        change_reason: 'ctr_workspace_bootstrap',
        lines: [
          { line_type: 'base', amount: 12_000_000, component_code: 'base' },
          {
            line_type: 'allowance',
            amount: 10_000_000,
            allowance_code: 'si_base',
            component_code: 'si_base',
          },
        ],
      },
      auth('group_ceo'),
    );

    expect(insertedAmounts).toEqual([12_000_000, 10_000_000]);
    expect(result.lines.map((row) => row.component_code)).toEqual([
      'base',
      'si_base',
    ]);
    expect(
      db.query.mock.calls.some(([sql]) =>
        String(sql).includes('FROM public.salary_components'),
      ),
    ).toBe(false);
  });

  it('OVERLAP-409 giữ nguyên khi đã có package chồng ngày hiệu lực', async () => {
    const { service } = createCompensationService((sql) => {
      if (sql.includes('FROM public.employees e')) {
        return {
          rows: [
            {
              id: EMPLOYEE_ID,
              company_id: 'holding',
              status: 'active',
              employment_status: 'active',
            },
          ],
        };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages p') &&
        sql.includes('effective_from::date <=')
      ) {
        return { rows: [{ id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' }] };
      }
      return { rows: [] };
    });

    await expect(
      service.createPackage(
        {
          company_id: 'holding',
          employee_id: EMPLOYEE_ID,
          effective_from: '2026-08-12',
          change_reason: 'ctr_workspace_bootstrap',
          lines: [
            { line_type: 'base', amount: 12_000_000, component_code: 'base' },
            {
              line_type: 'allowance',
              amount: 10_000_000,
              allowance_code: 'si_base',
              component_code: 'si_base',
            },
          ],
        },
        auth('group_ceo'),
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-COMP-409-OVERLAP' });
  });

  it('create-context lấy insurance_salary_vnd từ si_base, không fallback base', async () => {
    const db = {
      query: jest.fn((sql: string) => {
        if (sql.includes('SELECT e.id, e.company_id::text AS company_id')) {
          return {
            rows: [
              {
                id: EMPLOYEE_ID,
                company_id: 'holding',
                full_name: 'Nguyễn Văn Lái',
                employee_code: 'NV-001',
                custom_fields: {},
                signer_name: null,
                signer_position: null,
                signer_position_key: null,
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const activePackage = packageRow([
      line('base', 12_000_000, 'base', null),
      line('allowance', 10_000_000, 'SI_BASE', 'si_base'),
    ]);
    const compensation = {
      getActivePackage: jest.fn().mockResolvedValue(activePackage),
    } as unknown as EmployeeCompensationService;
    const service = new ContractsInsuranceService(
      db,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      compensation,
      undefined,
    );

    const context = await service.getContractCreateContext(
      EMPLOYEE_ID,
      { company_id: 'holding' },
      auth('group_ceo'),
    );

    expect(context.compensation_snapshot).toMatchObject({
      base_salary_vnd: 12_000_000,
      insurance_salary_vnd: 10_000_000,
      cb_masked: false,
    });
  });
});
