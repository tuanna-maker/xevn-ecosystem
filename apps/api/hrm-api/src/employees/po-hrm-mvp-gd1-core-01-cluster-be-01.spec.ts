/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
 * Purpose: Jest — public strip · CB-403 · deps CRUD · summary gate · U19 · DENY silent strip
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeDependentsService } from './employee-dependents.service';
import {
  assertNoCorePublicCbDenyKeys,
  collectCorePublicCbDenyKeys,
  filterPublicCustomFields,
  HRM_CORE_CB_403,
  HRM_CORE_DEP_404,
  HRM_CORE_DEP_VAL_400,
  isCorePublicCbDenyKey,
  resolveDependentRelationLabel,
  wantsCompensationSummary,
} from './employee-public-ring';
import { EmployeesService } from './employees.service';

describe('PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01', () => {
  describe('employee-public-ring helpers', () => {
    it('detects DATA §4.3 deny families', () => {
      expect(isCorePublicCbDenyKey('salary')).toBe(true);
      expect(isCorePublicCbDenyKey('base_salary')).toBe(true);
      expect(isCorePublicCbDenyKey('bank_account')).toBe(true);
      expect(isCorePublicCbDenyKey('tax_code')).toBe(true);
      expect(isCorePublicCbDenyKey('mst')).toBe(true);
      expect(isCorePublicCbDenyKey('social_insurance_number')).toBe(true);
      expect(isCorePublicCbDenyKey('bhxh_rate')).toBe(true);
      expect(isCorePublicCbDenyKey('phone_number')).toBe(false);
      expect(isCorePublicCbDenyKey('department')).toBe(false);
    });

    it('filterPublicCustomFields strips CB keys and keeps public', () => {
      const filtered = filterPublicCustomFields({
        phone_number: '0901',
        salary: '15000000',
        bank_account: '123',
        department: 'Vận hành',
        mst: '01',
      });
      expect(filtered).toEqual({
        phone_number: '0901',
        department: 'Vận hành',
      });
      expect(filtered).not.toHaveProperty('salary');
      expect(filtered).not.toHaveProperty('bank_account');
      expect(filtered).not.toHaveProperty('mst');
    });

    it('assertNoCorePublicCbDenyKeys throws HRM-CORE-CB-403 (no silent strip)', () => {
      expect(collectCorePublicCbDenyKeys({ salary: '1' })).toEqual(['salary']);
      expect(
        collectCorePublicCbDenyKeys({ custom_fields: { bank_name: 'VCB' } }),
      ).toEqual(['custom_fields.bank_name']);
      try {
        assertNoCorePublicCbDenyKeys({ custom_fields: { salary: '9' } });
        fail('expected CB-403');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        const ex = error as ApiException;
        expect(ex.code).toBe(HRM_CORE_CB_403);
        expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('relation_label display-ready + compensation include gate', () => {
      expect(resolveDependentRelationLabel('child')).toBe('Con');
      expect(resolveDependentRelationLabel('spouse')).toBe('Vợ/Chồng');
      expect(resolveDependentRelationLabel('custom_uncle')).toBe(
        'custom_uncle',
      );
      expect(wantsCompensationSummary(undefined)).toBe(false);
      expect(wantsCompensationSummary('compensation_summary')).toBe(true);
      expect(wantsCompensationSummary('foo,compensation_summary')).toBe(true);
    });
  });

  describe('EmployeesService public ring', () => {
    let service: EmployeesService;
    let db: jest.Mocked<HrmDbService>;

    const empRow = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      avatar_url: null,
      candidate_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      custom_fields: {
        phone_number: '0901',
        salary: '20000000',
        bank_account: '999',
        tax_code: '010',
        department: 'Ban điều hành',
      },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    beforeEach(() => {
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      db.query.mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('hrm_catalog_extension_items')) {
          if (s.includes('COUNT')) return { rows: [{ c: '0' }] };
          return { rows: [] };
        }
        return { rows: [] };
      });
      service = new EmployeesService(db);
    });

    it('GET strips CB keys from custom_fields (O2) and exposes soft candidate_id', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockResolvedValueOnce({ rows: [empRow] } as never);

      const result = await service.getEmployeeById(
        empRow.id,
        { company_id: 'main' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.candidate_id).toBe(empRow.candidate_id);
      expect(result.custom_fields).toEqual({
        phone_number: '0901',
        department: 'Ban điều hành',
      });
      expect(result.custom_fields).not.toHaveProperty('salary');
      expect(result).not.toHaveProperty('salary');
    });

    it('PATCH with salary in custom_fields → 403 HRM-CORE-CB-403 (O3 no silent strip)', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      await expect(
        service.updateEmployee(
          empRow.id,
          { custom_fields: { phone_number: '0902', salary: '1' } },
          'main',
          `Bearer ${token}`,
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({
        code: HRM_CORE_CB_403,
        status: HttpStatus.FORBIDDEN,
      });
      // Fail-closed before persist — no SELECT/UPDATE yet.
      expect(db.query).not.toHaveBeenCalled();
    });

    it('POST create with top-level bank_account → 403 HRM-CORE-CB-403', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      await expect(
        service.createEmployee(
          {
            company_id: 'main',
            employee_code: 'NVX',
            email: 'x@xe.vn',
            full_name: 'X',
            bank_account: '123',
          } as never,
          `Bearer ${token}`,
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: HRM_CORE_CB_403 });
    });

    it('summary default omits compensation SoT; include=compensation_summary unlocks (VAL-D-06)', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      const bundled = {
        rows: [
          {
            aggregate: {
              total: '10',
              active_count: '9',
              inactive_count: '1',
              archived_count: '0',
              new_hires_last_30_days: '0',
              total_payroll: '999',
              employees_with_salary: '5',
              salary_range_above_30m: '1',
              salary_range_20_30m: '2',
              salary_range_15_20m: '1',
              salary_range_below_15m: '1',
            },
            by_department: [
              { department: 'Ops', count: '10', avg_salary: '100' },
            ],
            by_company: [],
            recent: [],
          },
        ],
      };
      db.query.mockResolvedValueOnce(bundled as never);
      const gated = await service.getEmployeesSummary(
        { company_id: 'main' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );
      expect(gated.compensation_summary_included).toBe(false);
      expect(gated.payroll.total).toBe(0);
      expect(gated.by_department[0]?.avg_salary).toBeNull();
      expect(gated.salary_ranges.every((r) => r.count === 0)).toBe(true);

      db.query.mockResolvedValueOnce(bundled as never);
      const open = await service.getEmployeesSummary(
        { company_id: 'main', include: 'compensation_summary' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );
      expect(open.compensation_summary_included).toBe(true);
      expect(open.payroll.total).toBe(999);
      expect(open.by_department[0]?.avg_salary).toBe(100);
    });
  });

  describe('EmployeeDependentsService F-CORE-DEP-01', () => {
    let service: EmployeeDependentsService;
    let db: jest.Mocked<HrmDbService>;

    const parent = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: null,
      archived_at: null,
      avatar_url: null,
      custom_fields: {},
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    beforeEach(() => {
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new EmployeeDependentsService(db);
    });

    it('POST missing DOB → HRM-CORE-DEP-VAL-400', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      // ensureSchema + parent load not reached when VAL fails first after schema — mock schema OK
      db.query.mockResolvedValue({ rows: [] } as never);
      await expect(
        service.createDependent(
          parent.id,
          { company_id: 'main' },
          {
            full_name: 'Con A',
            relation_code: 'child',
            date_of_birth: '',
          },
          `Bearer ${token}`,
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: HRM_CORE_DEP_VAL_400 });
    });

    it('POST create returns relation_label; soft-delete → DEP-404 on get', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      const depId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
      db.query
        // ensureSchema x4
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        // parent load
        .mockResolvedValueOnce({ rows: [parent] } as never)
        // insert
        .mockResolvedValueOnce({
          rows: [
            {
              id: depId,
              employee_id: parent.id,
              company_id: 'holding',
              full_name: 'Nguyen Be',
              relation_code: 'child',
              date_of_birth: '2018-06-01',
              is_tax_dependent: false,
              effective_from: null,
              effective_to: null,
              archived_at: null,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T00:00:00.000Z',
            },
          ],
        } as never);

      const created = await service.createDependent(
        parent.id,
        { company_id: 'main' },
        {
          full_name: 'Nguyen Be',
          relation_code: 'child',
          date_of_birth: '2018-06-01',
        },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );
      expect(created.relation_label).toBe('Con');
      expect(created.company_id).toBe('holding');

      db.query
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [parent] } as never)
        .mockResolvedValueOnce({ rows: [] } as never);

      await expect(
        service.getDependentById(
          parent.id,
          depId,
          { company_id: 'main' },
          `Bearer ${token}`,
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: HRM_CORE_DEP_404 });
    });

    it('U19 — parent out of member scope → EMP-404 before deps mutate', async () => {
      const token = signServiceJwt({
        sub: 'du-lich.ceo@xe.vn',
        tenantId: 'xe-du-lich',
        companyId: 'main',
        roleCode: 'subsidiary_ceo',
      });
      db.query
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never)
        .mockResolvedValueOnce({ rows: [] } as never); // parent not in member scope

      await expect(
        service.listDependents(
          parent.id,
          { company_id: 'main' },
          `Bearer ${token}`,
          { tenantId: 'xe-du-lich' },
        ),
      ).rejects.toMatchObject({ code: 'HRM-EMP-404' });
    });
  });
});
