/**
 * PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01 — F-CORE-EMP-02 UPGRADE + SI PATCH fail-closed
 * UC-BP-CORE-02 · API-01 · DATA §4 · BA O1–O12 · U19 · U65 no seed
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  hasCompensationCbMembership,
  HRM_CORE_CB_AUTHZ_403,
  HRM_CORE_CB_OVERLAP_409,
  HRM_CORE_CB_VAL_400,
} from './compensation-cb-authz';
import { EmployeeCompensationService } from './employee-compensation.service';
import { EmployeeInsurancesService } from '../employee-insurances/employee-insurances.service';

function groupCeoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function employeeAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'uat.nv0001@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'employee',
  })}`;
}

function subsidiaryCeoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  })}`;
}

describe('PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01', () => {
  const employeeId = '16f5e2c5-8fbb-4500-8c82-623950f7055e';
  const packageId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

  describe('AuthZ membership helper', () => {
    it('allows group_ceo · denies employee · denies subsidiary_ceo without claim', () => {
      expect(hasCompensationCbMembership(groupCeoAuth())).toBe(true);
      expect(hasCompensationCbMembership(employeeAuth())).toBe(false);
      expect(hasCompensationCbMembership(subsidiaryCeoAuth())).toBe(false);
    });

    it('allows subsidiary_ceo when JWT has view_salary permission', () => {
      const auth = `Bearer ${signServiceJwt({
        sub: 'du-lich.ceo@xe.vn',
        tenantId: 'xe-du-lich',
        companyId: 'main',
        roleCode: 'subsidiary_ceo',
        permissions: [{ module: 'employees', action: 'view_salary' }],
      })}`;
      expect(hasCompensationCbMembership(auth)).toBe(true);
    });
  });

  describe('EmployeeCompensationService bank/MST + AuthZ', () => {
    let service: EmployeeCompensationService;
    let db: jest.Mocked<HrmDbService>;
    let historySnapshots: Record<string, unknown>[] = [];

    beforeEach(() => {
      historySnapshots = [];
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('ALTER TABLE') ||
          s.includes('UPDATE public.employee_compensation_lines') ||
          s.includes('INSERT INTO public.hrm_cb_access_audit')
        ) {
          return { rows: [] } as never;
        }
        if (
          s.includes('FROM public.employees e') &&
          s.includes('e.id = $1::uuid')
        ) {
          return {
            rows: [
              {
                id: employeeId,
                company_id: 'holding',
                status: 'active',
                employment_status: 'active',
              },
            ],
          } as never;
        }
        if (
          s.includes('FROM public.employee_compensation_packages p') &&
          s.includes('effective_from::date <=')
        ) {
          return { rows: [] } as never;
        }
        if (s.includes('INSERT INTO public.employee_compensation_packages')) {
          return {
            rows: [
              {
                id: packageId,
                company_id: 'holding',
                employee_id: employeeId,
                contract_id: null,
                version: 1,
                supersedes_package_id: null,
                effective_from: '2026-08-01',
                effective_to: null,
                currency: 'VND',
                change_reason: 'initial',
                bank_account: params?.[8] ?? null,
                bank_name: params?.[9] ?? null,
                bank_branch: params?.[10] ?? null,
                tax_id: params?.[11] ?? null,
                created_at: '2026-08-01T00:00:00.000Z',
                updated_at: '2026-08-01T00:00:00.000Z',
              },
            ],
          } as never;
        }
        if (s.includes('INSERT INTO public.employee_compensation_lines')) {
          return {
            rows: [
              {
                id: 'line-1',
                package_id: packageId,
                line_type: params?.[2] ?? 'base',
                amount: params?.[3] ?? 0,
                currency: 'VND',
                allowance_code: null,
                component_code: 'base',
                taxable: true,
                note: null,
                sort_order: 0,
                created_at: '2026-08-01T00:00:00.000Z',
              },
            ],
          } as never;
        }
        if (s.includes('INSERT INTO public.employee_compensation_history')) {
          const snapRaw = params?.[7];
          historySnapshots.push(
            typeof snapRaw === 'string'
              ? (JSON.parse(snapRaw) as Record<string, unknown>)
              : (snapRaw as Record<string, unknown>),
          );
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });
      service = new EmployeeCompensationService(db);
    });

    it('ensureSchema ADD bank_account/bank_name/bank_branch/tax_id + audit (DATA §4)', async () => {
      await service.ensureCompensationSchema();
      const ddl = db.query.mock.calls.map(([sql]) => String(sql)).join('\n');
      expect(ddl).toMatch(/ADD COLUMN IF NOT EXISTS bank_account/);
      expect(ddl).toMatch(/ADD COLUMN IF NOT EXISTS bank_name/);
      expect(ddl).toMatch(/ADD COLUMN IF NOT EXISTS bank_branch/);
      expect(ddl).toMatch(/ADD COLUMN IF NOT EXISTS tax_id/);
      expect(ddl).toMatch(/hrm_cb_access_audit/);
      expect(ddl).not.toMatch(/CREATE TABLE.*hrm_employee_compensation[^_]/i);
      expect(ddl).not.toMatch(/@Controller\(['\"]core['\"]\)/);
    });

    it('create persists bank/MST · history snapshot MUST include bank/MST · display-ready amount', async () => {
      const result = await service.createPackage(
        {
          company_id: 'holding',
          employee_id: employeeId,
          effective_from: '2026-08-01',
          bank_account: '0123456789',
          bank_name: 'Vietcombank',
          bank_branch: 'Hà Nội',
          tax_id: '0312345678',
          lines: [{ line_type: 'base', amount: 15_000_000 }],
        },
        groupCeoAuth(),
      );
      expect(result.bank_account).toBe('0123456789');
      expect(result.bank_name).toBe('Vietcombank');
      expect(result.tax_id).toBe('0312345678');
      expect(result.lines[0].amount_display).toMatch(/15/);
      expect(historySnapshots[0]).toMatchObject({
        bank_account: '0123456789',
        bank_name: 'Vietcombank',
        bank_branch: 'Hà Nội',
        tax_id: '0312345678',
      });
      expect(historySnapshots[0].lines).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ line_type: 'base', amount: 15_000_000 }),
        ]),
      );
    });

    it('AuthZ: employee open/mutate → 403 HRM-CORE-CB-AUTHZ-403 + audit insert', async () => {
      await expect(
        service.createPackage(
          {
            company_id: 'holding',
            employee_id: employeeId,
            effective_from: '2026-08-01',
            lines: [{ line_type: 'base', amount: 10_000_000 }],
          },
          employeeAuth(),
        ),
      ).rejects.toMatchObject({ code: HRM_CORE_CB_AUTHZ_403 });

      expect(
        db.query.mock.calls.some(([sql]) =>
          String(sql).includes('INSERT INTO public.hrm_cb_access_audit'),
        ),
      ).toBe(true);
    });

    it('AuthZ: subsidiary_ceo without claim → 403', async () => {
      await expect(
        service.listPackages(
          { company_id: 'main', employee_id: employeeId },
          subsidiaryCeoAuth(),
        ),
      ).rejects.toMatchObject({ code: HRM_CORE_CB_AUTHZ_403 });
    });

    it('RETAIN HRM-COMP-409-OVERLAP with alias HRM-CORE-CB-OVERLAP-409', async () => {
      db.query.mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] } as never;
        }
        if (s.includes('INSERT INTO public.hrm_cb_access_audit'))
          return { rows: [] } as never;
        if (s.includes('FROM public.employees e')) {
          return {
            rows: [
              {
                id: employeeId,
                company_id: 'holding',
                status: 'active',
                employment_status: 'active',
              },
            ],
          } as never;
        }
        if (
          s.includes('FROM public.employee_compensation_packages p') &&
          s.includes('effective_from::date <=')
        ) {
          return { rows: [{ id: 'overlap-1' }] } as never;
        }
        return { rows: [] } as never;
      });

      try {
        await service.createPackage(
          {
            company_id: 'holding',
            employee_id: employeeId,
            effective_from: '2026-08-01',
            lines: [{ line_type: 'base', amount: 12_000_000 }],
          },
          groupCeoAuth(),
        );
        fail('expected overlap');
      } catch (err) {
        const ex = err as ApiException;
        expect(ex.code).toBe('HRM-COMP-409-OVERLAP');
        expect(ex.details).toEqual(
          expect.objectContaining({ alias: HRM_CORE_CB_OVERLAP_409 }),
        );
      }
    });

    it('revise copy-forward bank/MST when omitted', async () => {
      const priorId = packageId;
      const newId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
      db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('ALTER TABLE') ||
          s.includes('INSERT INTO public.hrm_cb_access_audit') ||
          s.includes('UPDATE public.employee_compensation_packages')
        ) {
          return { rows: [] } as never;
        }
        if (
          s.includes('FROM public.employee_compensation_packages p') &&
          s.includes('p.id = $1::uuid')
        ) {
          return {
            rows: [
              {
                id: priorId,
                company_id: 'holding',
                employee_id: employeeId,
                contract_id: null,
                version: 1,
                supersedes_package_id: null,
                effective_from: '2026-01-01',
                effective_to: null,
                currency: 'VND',
                change_reason: 'initial',
                bank_account: '999888777',
                bank_name: 'Techcombank',
                bank_branch: 'Q1',
                tax_id: '0102030405',
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
            ],
          } as never;
        }
        if (
          s.includes('FROM public.employee_compensation_packages p') &&
          s.includes('effective_from::date <=')
        ) {
          return { rows: [] } as never;
        }
        if (s.includes('INSERT INTO public.employee_compensation_packages')) {
          return {
            rows: [
              {
                id: newId,
                company_id: 'holding',
                employee_id: employeeId,
                contract_id: null,
                version: 2,
                supersedes_package_id: priorId,
                effective_from: '2026-09-01',
                effective_to: null,
                currency: 'VND',
                change_reason: 'raise',
                bank_account: params?.[10] ?? null,
                bank_name: params?.[11] ?? null,
                bank_branch: params?.[12] ?? null,
                tax_id: params?.[13] ?? null,
                created_at: '2026-09-01T00:00:00.000Z',
                updated_at: '2026-09-01T00:00:00.000Z',
              },
            ],
          } as never;
        }
        if (s.includes('INSERT INTO public.employee_compensation_lines')) {
          return {
            rows: [
              {
                id: 'line-2',
                package_id: newId,
                line_type: 'base',
                amount: 16_000_000,
                currency: 'VND',
                allowance_code: null,
                component_code: 'base',
                taxable: true,
                note: null,
                sort_order: 0,
                created_at: '2026-09-01T00:00:00.000Z',
              },
            ],
          } as never;
        }
        if (s.includes('INSERT INTO public.employee_compensation_history')) {
          const snapRaw = params?.[7];
          historySnapshots.push(
            typeof snapRaw === 'string'
              ? (JSON.parse(snapRaw) as Record<string, unknown>)
              : (snapRaw as Record<string, unknown>),
          );
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      const revised = await service.revisePackage(
        priorId,
        {
          effective_from: '2026-09-01',
          lines: [{ line_type: 'base', amount: 16_000_000 }],
        },
        'holding',
        groupCeoAuth(),
      );
      expect(revised.bank_account).toBe('999888777');
      expect(revised.bank_name).toBe('Techcombank');
      expect(revised.tax_id).toBe('0102030405');
      expect(historySnapshots[0]).toMatchObject({
        bank_account: '999888777',
        bank_name: 'Techcombank',
        tax_id: '0102030405',
      });
    });

    it('DENY Nest /core dual invent in compensation service source', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('node:fs') as typeof import('node:fs');
      const path = require('node:path') as typeof import('node:path');
      const src = fs.readFileSync(
        path.join(__dirname, 'employee-compensation.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/@Controller\(['\"]core['\"]\)/);
      expect(src).not.toMatch(/CREATE TABLE.*hrm_employee_compensation\b/i);
    });
  });

  describe('SI PATCH contribution fail-closed', () => {
    it('PATCH contribution delta → 400 HRM-CORE-CB-VAL-400 redirect change_rate', async () => {
      const enrollId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('CREATE TABLE') ||
            s.includes('CREATE INDEX') ||
            s.includes('ALTER TABLE')
          ) {
            return { rows: [] } as never;
          }
          if (
            s.includes('FROM public.employee_insurances') &&
            s.includes('LIMIT 1')
          ) {
            return {
              rows: [
                {
                  id: enrollId,
                  employee_id: employeeId,
                  company_id: 'holding',
                  type: 'social',
                  provider: 'BHXH',
                  policy_number: null,
                  start_date: '2026-01-01',
                  end_date: null,
                  contribution: 1_000_000,
                  employer_contribution: 2_000_000,
                  status: 'active',
                  notes: null,
                  policy_id: null,
                  si_number: null,
                  archived_at: null,
                  created_at: '2026-01-01T00:00:00.000Z',
                  updated_at: '2026-01-01T00:00:00.000Z',
                },
              ],
            } as never;
          }
          if (s.includes('FROM public.hrm_insurance_rate_period')) {
            return { rows: [] } as never;
          }
          return { rows: [] } as never;
        }),
      } as unknown as jest.Mocked<HrmDbService>;

      const svc = new EmployeeInsurancesService(db);
      await expect(
        svc.update(
          enrollId,
          { company_id: 'holding', contribution: 1_500_000 },
          groupCeoAuth(),
        ),
      ).rejects.toMatchObject({
        code: HRM_CORE_CB_VAL_400,
        details: expect.objectContaining({ redirect_action: 'change_rate' }),
      });

      expect(db.query).not.toHaveBeenCalledWith(
        expect.stringContaining('UPDATE public.employee_insurances'),
        expect.anything(),
      );
    });
  });
});
