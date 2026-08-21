import { signServiceJwt } from '../common/jwt-sign';
import { HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { EmployeeRow } from './employee-directory.types';
import { EmployeesService } from './employees.service';

/**
 * P1-HRM-SCALE-BE-W2 — list/summary query-count remediation.
 * must_keep: ORDER BY created_at DESC, id DESC; scope parity list↔summary; pagination uniqueness.
 */
describe('P1-HRM-SCALE-BE-W2 list/summary round-trip reduction', () => {
  const sharedCreatedAt = '2026-06-01T00:00:00.000Z';

  function buildRows(totalRows: number): EmployeeRow[] {
    return Array.from({ length: totalRows }, (_, i) => {
      const n = String(i + 1).padStart(4, '0');
      const slug =
        HRM_GROUP_MEMBER_COMPANY_SLUGS[
          i % HRM_GROUP_MEMBER_COMPANY_SLUGS.length
        ];
      return {
        id: `20000000-0000-4000-8000-00000000${n}`,
        company_id: slug,
        employee_code: `W2${n}`,
        email: `w2${n}@xe.vn`,
        full_name: `Scale Employee ${n}`,
        job_title_key: null,
        manager_id: null,
        status: 'active',
        hired_at: null,
        archived_at: null,
        avatar_url: null,
        custom_fields: { tenant_id: 'xevn' },
        created_at: sharedCreatedAt,
        updated_at: sharedCreatedAt,
      };
    });
  }

  function sortStableDesc(rows: EmployeeRow[]): EmployeeRow[] {
    return [...rows].sort((a, b) => {
      const byCreated = b.created_at.localeCompare(a.created_at);
      if (byCreated !== 0) return byCreated;
      return b.id.localeCompare(a.id);
    });
  }

  it('listEmployees uses one SQL round-trip with COUNT(*) OVER and stable ORDER BY', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            ...buildRows(1)[0],
            list_total: '1',
          },
        ],
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new EmployeesService(db);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const result = await service.listEmployees(
      { company_id: 'main', page: 1, page_size: 50 },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );

    expect(db.query).toHaveBeenCalledTimes(1);
    const sql = String(db.query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('COUNT(*) OVER()');
    expect(sql).toContain('ORDER BY created_at DESC, id DESC');
    expect(sql).toContain('company_id');
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('multi-page list remains unique under tied created_at (window total)', async () => {
    const store = buildRows(120);
    const pageSize = 50;
    const db = {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        const text = String(sql);
        if (
          text.includes('FROM public.employees') &&
          text.includes('ORDER BY created_at DESC, id DESC') &&
          text.includes('COUNT(*) OVER()')
        ) {
          const pageSizeArg = Number(params?.[params.length - 2]);
          const offset = Number(params?.[params.length - 1]);
          const sorted = sortStableDesc(store);
          return {
            rows: sorted.slice(offset, offset + pageSizeArg).map((row) => ({
              ...row,
              list_total: String(store.length),
            })),
          };
        }
        if (text.includes('SELECT COUNT(*)::text AS total')) {
          return { rows: [{ total: String(store.length) }] };
        }
        throw new Error(
          `Unexpected SQL in BE-W2 regression: ${text.slice(0, 140)}`,
        );
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    const service = new EmployeesService(db);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const auth = `Bearer ${token}`;
    const scopeCtx = { tenantId: 'xevn' };

    const page1 = await service.listEmployees(
      { company_id: 'main', page: 1, page_size: pageSize },
      auth,
      scopeCtx,
    );
    const page2 = await service.listEmployees(
      { company_id: 'main', page: 2, page_size: pageSize },
      auth,
      scopeCtx,
    );
    const page3 = await service.listEmployees(
      { company_id: 'main', page: 3, page_size: pageSize },
      auth,
      scopeCtx,
    );

    const merged = [...page1.data, ...page2.data, ...page3.data];
    expect(merged).toHaveLength(120);
    expect(new Set(merged.map((r) => r.id)).size).toBe(120);
    expect(page1.total).toBe(120);
    expect(page2.total).toBe(120);
  });

  it('getEmployeesSummary uses one bundled CTE round-trip with same rollup scope', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            aggregate: {
              total: '1107',
              active_count: '1050',
              inactive_count: '57',
              archived_count: '0',
              new_hires_last_30_days: '24',
              total_payroll: '18500000000',
              employees_with_salary: '900',
              salary_range_above_30m: '120',
              salary_range_20_30m: '340',
              salary_range_15_20m: '200',
              salary_range_below_15m: '240',
            },
            by_department: [
              { department: 'Vận hành', count: '400', avg_salary: '18000000' },
            ],
            recent: [
              {
                id: '11111111-1111-4111-8111-111111111111',
                employee_code: 'NV1107',
                full_name: 'Nguyễn Văn Mới',
                status: 'active',
                hired_at: '2026-06-01',
                avatar_url: null,
              },
            ],
          },
        ],
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new EmployeesService(db);
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

    expect(db.query).toHaveBeenCalledTimes(1);
    const sql = String(db.query.mock.calls[0]?.[0] ?? '');
    const values = db.query.mock.calls[0]?.[1];
    expect(sql).toContain('WITH scoped AS');
    expect(sql).toContain('salary_range_above_30m');
    expect(sql).toContain('company_id = ANY');
    expect(values?.[0]).toEqual(expect.arrayContaining(['holding']));
    expect(result.total).toBe(1107);
    expect(result.by_department[0]?.count).toBe(400);
    expect(result.new_hires.recent).toHaveLength(1);
  });
});
