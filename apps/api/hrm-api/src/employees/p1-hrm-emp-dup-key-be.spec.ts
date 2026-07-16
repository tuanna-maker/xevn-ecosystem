import { signServiceJwt } from '../common/jwt-sign';
import { HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { EmployeeRow } from './employee-directory.types';
import { EmployeesService } from './employees.service';

/**
 * P1-HRM-EMP-DUP-KEY-BE — React duplicate key on Employees DataTable.
 * Root cause: OFFSET pagination with ORDER BY created_at only → page overlap when
 * many rows share the same created_at (bulk seed). FE listAllEmployees concatenates pages.
 * Fix: ORDER BY created_at DESC, id DESC (stable cursor).
 */
describe('P1-HRM-EMP-DUP-KEY-BE employees list stable pagination', () => {
  const sharedCreatedAt = '2026-06-01T00:00:00.000Z';
  const pageSize = 50;
  const totalRows = 120;

  function buildRows(): EmployeeRow[] {
    return Array.from({ length: totalRows }, (_, i) => {
      const n = String(i + 1).padStart(4, '0');
      const slug = HRM_GROUP_MEMBER_COMPANY_SLUGS[i % HRM_GROUP_MEMBER_COMPANY_SLUGS.length];
      return {
        id: `10000000-0000-4000-8000-00000000${n}`,
        company_id: slug,
        employee_code: `EMP${n}`,
        email: `emp${n}@xe.vn`,
        full_name: `Employee ${n}`,
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

  it('list SQL uses created_at DESC, id DESC under group main scope', async () => {
    const db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query
      .mockResolvedValueOnce({ rows: [{ total: '0' }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    const service = new EmployeesService(db);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await service.listEmployees(
      { company_id: 'main', page: 1, page_size: 20 },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );

    const listSql = String(db.query.mock.calls[1]?.[0] ?? '');
    expect(listSql).toContain('ORDER BY created_at DESC, id DESC');
    expect(listSql).not.toMatch(/ORDER BY created_at DESC\s*(LIMIT|;)/);
  });

  it('multi-page list under main/group scope never returns duplicate ids (tied created_at)', async () => {
    const store = buildRows();
    const db = {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        const text = String(sql);
        if (text.includes('COUNT(*)')) {
          return { rows: [{ total: String(store.length) }] };
        }
        if (
          text.includes('FROM public.employees') &&
          text.includes('ORDER BY created_at DESC, id DESC')
        ) {
          expect(text).toContain('ORDER BY created_at DESC, id DESC');
          const pageSizeArg = Number(params?.[params.length - 2]);
          const offset = Number(params?.[params.length - 1]);
          const sorted = sortStableDesc(store);
          return { rows: sorted.slice(offset, offset + pageSizeArg) };
        }
        throw new Error(`Unexpected SQL in dup-key regression: ${text.slice(0, 120)}`);
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
    expect(merged.length).toBe(totalRows);
    const ids = merged.map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('directory list SQL uses id ASC tiebreaker', async () => {
    const db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query
      .mockResolvedValueOnce({ rows: [{ total: '0' }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    const service = new EmployeesService(db);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await service.listEmployeeDirectory(
      { company_id: 'main', page: 1, page_size: 30 },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );

    const listSql = String(db.query.mock.calls[1]?.[0] ?? '');
    expect(listSql).toContain('ORDER BY full_name ASC, employee_code ASC, id ASC');
  });
});
