import { HttpStatus } from '@nestjs/common';
import { signServiceJwt } from '../common/jwt-sign';
import { ApiException } from '../common/api.exception';
import { HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { EmployeeRow } from './employee-directory.types';
import {
  decodeEmployeeListCursor,
  encodeEmployeeListCursor,
  encodeEmployeeListCursorFromRow,
  toEmployeeListCursorIso,
} from './employee-list-cursor';
import { EmployeesService } from './employees.service';

/**
 * CD-FB-05-PERF-BE — keyset cursor on GET /employees (+ summary still 1-RT for dashboard).
 * must_keep: OFFSET when no cursor; ORDER BY created_at DESC, id DESC; leave/recruit/F5 untouched.
 */
describe('CD-FB-05-PERF-BE employees cursor pagination', () => {
  const sharedCreatedAt = '2026-06-01T00:00:00.000Z';

  function buildRows(totalRows: number): EmployeeRow[] {
    return Array.from({ length: totalRows }, (_, i) => {
      const n = String(i + 1).padStart(4, '0');
      const slug =
        HRM_GROUP_MEMBER_COMPANY_SLUGS[
          i % HRM_GROUP_MEMBER_COMPANY_SLUGS.length
        ];
      return {
        id: `30000000-0000-4000-8000-00000000${n}`,
        company_id: slug,
        employee_code: `C5${n}`,
        email: `c5${n}@xe.vn`,
        full_name: `Cursor Employee ${n}`,
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

  describe('employee-list-cursor codec', () => {
    it('round-trips created_at + id', () => {
      const id = '11111111-1111-4111-8111-111111111111';
      const encoded = encodeEmployeeListCursor(sharedCreatedAt, id);
      expect(decodeEmployeeListCursor(encoded)).toEqual({
        createdAt: sharedCreatedAt,
        id,
      });
    });

    it('encodes pg Date as ISO-8601 (not Date.toString / GMT+0700)', () => {
      const id = '11111111-1111-4111-8111-111111111111';
      // Simulate node-pg timestamptz → JS Date (local TZ may print GMT+0700)
      const pgDate = new Date('2026-06-05T05:01:39.000Z');
      const encoded = encodeEmployeeListCursor(pgDate, id);
      const decodedUtf8 = Buffer.from(encoded, 'base64url').toString('utf8');
      expect(decodedUtf8).toBe(`${pgDate.toISOString()}\n${id}`);
      expect(decodedUtf8).not.toMatch(/GMT\+/i);
      expect(decodedUtf8).not.toMatch(/Indochina/i);
      expect(decodeEmployeeListCursor(encoded)).toEqual({
        createdAt: '2026-06-05T05:01:39.000Z',
        id,
      });
    });

    it('normalizes non-ISO Date.toString payload on decode (legacy page-1 cursor)', () => {
      const id = '22222222-2222-4222-8222-222222222222';
      const localeTs = 'Fri Jun 05 2026 12:01:39 GMT+0700 (Indochina Time)';
      const legacyEncoded = Buffer.from(`${localeTs}\n${id}`, 'utf8').toString(
        'base64url',
      );
      const decoded = decodeEmployeeListCursor(legacyEncoded);
      expect(decoded.createdAt).toBe('2026-06-05T05:01:39.000Z');
      expect(decoded.createdAt).toMatch(/Z$/);
      expect(decoded.id).toBe(id);
      // Re-encode must stay ISO for SQL ::timestamptz
      const reEncoded = encodeEmployeeListCursor(decoded.createdAt, decoded.id);
      expect(Buffer.from(reEncoded, 'base64url').toString('utf8')).toBe(
        `2026-06-05T05:01:39.000Z\n${id}`,
      );
    });

    it('preserves microsecond ISO from SQL created_at_cursor (no Date truncation)', () => {
      const id = '33333333-3333-4333-8333-333333333333';
      const withMicros = '2026-06-05T05:01:39.993456Z';
      expect(toEmployeeListCursorIso(withMicros)).toBe(withMicros);
      const encoded = encodeEmployeeListCursorFromRow({
        id,
        created_at: new Date('2026-06-05T05:01:39.993Z'), // would truncate
        created_at_cursor: withMicros,
      });
      expect(Buffer.from(encoded, 'base64url').toString('utf8')).toBe(
        `${withMicros}\n${id}`,
      );
      expect(decodeEmployeeListCursor(encoded).createdAt).toBe(withMicros);
    });

    it('rejects garbage cursor', () => {
      expect(() => decodeEmployeeListCursor('not-a-cursor')).toThrow();
    });
  });

  describe('EmployeesService.listEmployees cursor mode', () => {
    it('uses keyset SQL (no OFFSET) and returns next_cursor', async () => {
      const sorted = sortStableDesc(buildRows(5));
      const pageRows = sorted.slice(0, 2).map((row) => ({
        ...row,
        list_total: '5',
      }));
      // +1 peek row for hasMore
      const peek = { ...sorted[2], list_total: '5' };
      const db = {
        query: jest.fn().mockResolvedValue({ rows: [...pageRows, peek] }),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      const service = new EmployeesService(db);
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      const cursor = encodeEmployeeListCursor(
        sorted[0].created_at,
        sorted[0].id,
      );

      const result = await service.listEmployees(
        { company_id: 'main', cursor, page_size: 2 },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(db.query).toHaveBeenCalledTimes(1);
      const sql = String(db.query.mock.calls[0]?.[0] ?? '');
      expect(sql).toContain('WITH scoped AS');
      expect(sql).toContain('(created_at, id) <');
      expect(sql).not.toMatch(/OFFSET\s+\$/);
      expect(sql).toContain('ORDER BY created_at DESC, id DESC');
      expect(result.total).toBe(5);
      expect(result.data).toHaveLength(2);
      expect(result.next_cursor).toBe(
        encodeEmployeeListCursor(pageRows[1].created_at, pageRows[1].id),
      );
    });

    it('returns next_cursor=null on final page', async () => {
      const sorted = sortStableDesc(buildRows(3));
      const lastTwo = sorted
        .slice(1)
        .map((row) => ({ ...row, list_total: '3' }));
      const db = {
        query: jest.fn().mockResolvedValue({ rows: lastTwo }),
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
        {
          company_id: 'main',
          cursor: encodeEmployeeListCursor(sorted[0].created_at, sorted[0].id),
          page_size: 2,
        },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.data).toHaveLength(2);
      expect(result.next_cursor).toBeNull();
    });

    it('rejects invalid cursor with HRM-EMP-CURSOR-001', async () => {
      const db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      const service = new EmployeesService(db);
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      await expect(
        service.listEmployees(
          { company_id: 'main', cursor: '%%%bad%%%' },
          `Bearer ${token}`,
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({
        code: 'HRM-EMP-CURSOR-001',
        status: HttpStatus.BAD_REQUEST,
      } satisfies Partial<ApiException>);
      expect(db.query).not.toHaveBeenCalled();
    });

    it('rejects cursor with view=directory (HRM-EMP-CURSOR-002)', async () => {
      const db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      const service = new EmployeesService(db);
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      await expect(
        service.listEmployees(
          {
            company_id: 'main',
            view: 'directory',
            cursor: encodeEmployeeListCursor(
              sharedCreatedAt,
              '11111111-1111-4111-8111-111111111111',
            ),
          },
          `Bearer ${token}`,
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: 'HRM-EMP-CURSOR-002' });
    });

    it('OFFSET path remains when cursor absent (must_keep) and still exposes next_cursor', async () => {
      const sorted = sortStableDesc(buildRows(3));
      const page1 = sorted
        .slice(0, 2)
        .map((row) => ({ ...row, list_total: '3' }));
      const db = {
        query: jest.fn().mockResolvedValue({ rows: page1 }),
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
        { company_id: 'main', page: 1, page_size: 2 },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      const sql = String(db.query.mock.calls[0]?.[0] ?? '');
      expect(sql).toMatch(/OFFSET\s+\$/);
      expect(sql).not.toContain('WITH scoped AS');
      expect(result.next_cursor).toBe(
        encodeEmployeeListCursor(page1[1].created_at, page1[1].id),
      );
    });

    it('page-1 next_cursor from pg Date encodes ISO; page-2 bind uses ISO (CURSOR-TZ)', async () => {
      const sorted = sortStableDesc(buildRows(4));
      const pgCreated = new Date('2026-06-05T05:01:39.000Z');
      const page1Rows = sorted.slice(0, 2).map((row, i) => ({
        ...row,
        // Runtime: node-pg returns Date for timestamptz (typed as string on EmployeeRow)
        created_at: pgCreated as unknown as string,
        list_total: '4',
        id: sorted[i].id,
      }));
      const page2Rows = sorted.slice(2, 4).map((row) => ({
        ...row,
        created_at: '2026-06-01T00:00:00.000Z',
        list_total: '4',
      }));
      const db = {
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: page1Rows })
          .mockResolvedValueOnce({ rows: page2Rows }),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      const service = new EmployeesService(db);
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      const page1 = await service.listEmployees(
        { company_id: 'main', page: 1, page_size: 2 },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );
      expect(page1.next_cursor).toBeTruthy();
      const rawPayload = Buffer.from(page1.next_cursor!, 'base64url').toString(
        'utf8',
      );
      expect(rawPayload).toMatch(/^2026-06-05T05:01:39\.000Z\n/);
      expect(rawPayload).not.toMatch(/GMT\+/i);

      const page2 = await service.listEmployees(
        { company_id: 'main', cursor: page1.next_cursor!, page_size: 2 },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );
      expect(page2.data).toHaveLength(2);
      const cursorParams = db.query.mock.calls[1]?.[1] as unknown[];
      // keyset binds: …, createdAt ISO, id, fetchSize
      expect(cursorParams[cursorParams.length - 3]).toBe(
        '2026-06-05T05:01:39.000Z',
      );
      expect(String(cursorParams[cursorParams.length - 3])).not.toMatch(
        /GMT\+/i,
      );
    });

    it('scope parity: cursor list still applies company_id filters for main JWT', async () => {
      const db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      const service = new EmployeesService(db);
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      await service.listEmployees(
        {
          company_id: 'main',
          cursor: encodeEmployeeListCursor(
            sharedCreatedAt,
            '11111111-1111-4111-8111-111111111111',
          ),
          page_size: 50,
        },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      const sql = String(db.query.mock.calls[0]?.[0] ?? '');
      const params = db.query.mock.calls[0]?.[1] as unknown[];
      expect(sql).toContain('company_id');
      expect(
        params.some((p) => Array.isArray(p) || typeof p === 'string'),
      ).toBe(true);
    });
  });
});
