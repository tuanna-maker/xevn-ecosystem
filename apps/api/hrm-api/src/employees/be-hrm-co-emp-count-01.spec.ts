import { signServiceJwt } from '../common/jwt-sign';
import { HRM_COMPANY_UUID_BY_SLUG, HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { buildEmployeeSummaryByCompany } from './employee-summary';
import { EmployeesService } from './employees.service';

/**
 * D-HRM-CO-EMP-COUNT-BE-01 — summary.by_company Plane B operating slugs.
 * spec_ref: AC-CO-EMP · BR-CO-EMP-01 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · resolveHrmListScope parity
 */
describe('D-HRM-CO-EMP-COUNT-BE-01 employees summary by_company', () => {
  describe('buildEmployeeSummaryByCompany', () => {
    it('zero-fills all 5 group rollup slugs and merges pilot UUID → holding', () => {
      const rows = buildEmployeeSummaryByCompany(
        [
          {
            company_id: 'holding',
            total: '100',
            active_count: '90',
            inactive_count: '10',
            archived_count: '0',
          },
          {
            company_id: HRM_COMPANY_UUID_BY_SLUG.holding,
            total: '5',
            active_count: '5',
            inactive_count: '0',
            archived_count: '0',
          },
          {
            company_id: 'trsport',
            total: '200',
            active_count: '180',
            inactive_count: '20',
            archived_count: '1',
          },
        ],
        [...HRM_GROUP_MEMBER_COMPANY_SLUGS],
      );

      expect(rows).toHaveLength(5);
      expect(rows.map((r) => r.company_id)).toEqual([...HRM_GROUP_MEMBER_COMPANY_SLUGS]);
      expect(rows.find((r) => r.company_id === 'holding')).toEqual({
        company_id: 'holding',
        total: 105,
        active_count: 95,
        inactive_count: 10,
        archived_count: 0,
      });
      expect(rows.find((r) => r.company_id === 'trsport')?.total).toBe(200);
      expect(rows.find((r) => r.company_id === 'logistics')?.total).toBe(0);
      expect(rows.every((r) => !/^[0-9a-f-]{36}$/i.test(r.company_id))).toBe(true);
    });

    it('drops unknown legal-entity UUID keys (CẤM count by XBOS LE UUID)', () => {
      const rows = buildEmployeeSummaryByCompany(
        [
          {
            company_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
            total: '99',
            active_count: '99',
            inactive_count: '0',
            archived_count: '0',
          },
          {
            company_id: 'finance',
            total: '3',
            active_count: '3',
            inactive_count: '0',
            archived_count: '0',
          },
        ],
        ['finance'],
      );
      expect(rows).toEqual([
        {
          company_id: 'finance',
          total: 3,
          active_count: 3,
          inactive_count: 0,
          archived_count: 0,
        },
      ]);
    });
  });

  describe('EmployeesService.getEmployeesSummary by_company', () => {
    let service: EmployeesService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new EmployeesService(db);
    });

    it('group CEO company_id=main returns 5 operating slugs with counts ≥0 and some >0', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            aggregate: {
              total: '1107',
              active_count: '1050',
              inactive_count: '57',
              archived_count: '3',
              new_hires_last_30_days: '24',
              total_payroll: '18500000000',
              employees_with_salary: '900',
              salary_range_above_30m: '120',
              salary_range_20_30m: '340',
              salary_range_15_20m: '200',
              salary_range_below_15m: '240',
            },
            by_department: [],
            by_company: [
              {
                company_id: 'holding',
                total: '120',
                active_count: '110',
                inactive_count: '10',
                archived_count: '0',
              },
              {
                company_id: 'trsport',
                total: '400',
                active_count: '380',
                inactive_count: '20',
                archived_count: '1',
              },
              {
                company_id: 'logistics',
                total: '250',
                active_count: '240',
                inactive_count: '10',
                archived_count: '0',
              },
              {
                company_id: 'finance',
                total: '180',
                active_count: '170',
                inactive_count: '10',
                archived_count: '1',
              },
              {
                company_id: 'services',
                total: '157',
                active_count: '150',
                inactive_count: '7',
                archived_count: '1',
              },
            ],
            recent: [],
          },
        ],
      } as never);

      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      const result = await service.getEmployeesSummary(
        { company_id: 'main' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.by_company).toHaveLength(5);
      expect(result.by_company.map((r) => r.company_id)).toEqual([...HRM_GROUP_MEMBER_COMPANY_SLUGS]);
      expect(result.by_company.every((r) => r.total >= 0)).toBe(true);
      expect(result.by_company.some((r) => r.total > 0)).toBe(true);
      expect(result.by_company.find((r) => r.company_id === 'trsport')).toMatchObject({
        total: 400,
        active_count: 380,
      });

      const sql = String(db.query.mock.calls[0]?.[0] ?? '');
      expect(sql).toContain('by_company AS');
      expect(sql).toContain('GROUP BY company_id');
      expect(sql).toContain('company_id = ANY');
      const values = db.query.mock.calls[0]?.[1] as unknown[] | undefined;
      expect(values?.[0]).toEqual(expect.arrayContaining([...HRM_GROUP_MEMBER_COMPANY_SLUGS]));
    });

    it('member slug scope returns single by_company row (scope_parity)', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            aggregate: {
              total: '40',
              active_count: '38',
              inactive_count: '2',
              archived_count: '0',
              new_hires_last_30_days: '0',
              total_payroll: '0',
              employees_with_salary: '0',
              salary_range_above_30m: '0',
              salary_range_20_30m: '0',
              salary_range_15_20m: '0',
              salary_range_below_15m: '0',
            },
            by_department: [],
            by_company: [
              {
                company_id: 'holding',
                total: '40',
                active_count: '38',
                inactive_count: '2',
                archived_count: '0',
              },
            ],
            recent: [],
          },
        ],
      } as never);

      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      const result = await service.getEmployeesSummary(
        { company_id: 'holding' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.by_company).toEqual([
        {
          company_id: 'holding',
          total: 40,
          active_count: 38,
          inactive_count: 2,
          archived_count: 0,
        },
      ]);
    });
  });
});
