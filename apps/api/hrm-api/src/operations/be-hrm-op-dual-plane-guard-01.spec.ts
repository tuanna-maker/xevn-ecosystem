/**
 * D-HRM-OP-DUAL-PLANE-GUARD-01 — anti-join XBOS LE UUID on OP persist/list/summary.
 * Happy path: slug → HRM_COMPANY_UUID_BY_SLUG unchanged.
 */
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  HRM_COMPANY_UUID_BY_SLUG,
  assertHrmMappedCompanyUuidOrThrow,
  isHrmMappedCompanyUuid,
  pushCompanyIdUuidFilter,
  resolveHrmOperationsPersistCompanyId,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { OperationsService } from './operations.service';

/** Representative XBOS legal-entity UUID — NOT in HRM_COMPANY_UUID_BY_SLUG. */
const XBOS_LE_UUID = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `Bearer ${header}.${body}.${sig}`;
}

describe('D-HRM-OP-DUAL-PLANE-GUARD-01', () => {
  describe('shared map helpers', () => {
    it('isHrmMappedCompanyUuid true only for Plane B′ map', () => {
      expect(isHrmMappedCompanyUuid(HRM_COMPANY_UUID_BY_SLUG.holding)).toBe(
        true,
      );
      expect(isHrmMappedCompanyUuid(XBOS_LE_UUID)).toBe(false);
      expect(isHrmMappedCompanyUuid('holding')).toBe(false);
    });

    it('assertHrmMappedCompanyUuidOrThrow rejects LE', () => {
      expect(() => assertHrmMappedCompanyUuidOrThrow(XBOS_LE_UUID)).toThrow(
        expect.objectContaining<ApiException>({ code: 'HRM-PLANE-409' }),
      );
      expect(
        assertHrmMappedCompanyUuidOrThrow(HRM_COMPANY_UUID_BY_SLUG.finance),
      ).toBe(HRM_COMPANY_UUID_BY_SLUG.finance);
    });
  });

  describe('persist happy slug + anti-join LE', () => {
    it('slug holding → map UUID', () => {
      expect(resolveHrmOperationsPersistCompanyId(undefined, 'holding')).toBe(
        HRM_COMPANY_UUID_BY_SLUG.holding,
      );
    });

    it('slug main + group CEO → holding UUID', () => {
      const token = createInternalJwt({
        iss: 'xevn-internal',
        aud: 'xevn-api',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      expect(resolveHrmOperationsPersistCompanyId(token, 'main')).toBe(
        HRM_COMPANY_UUID_BY_SLUG.holding,
      );
    });

    it('LE UUID persist → HRM-PLANE-409', () => {
      expect(() =>
        resolveHrmOperationsPersistCompanyId(undefined, XBOS_LE_UUID),
      ).toThrow(
        expect.objectContaining<ApiException>({ code: 'HRM-PLANE-409' }),
      );
    });
  });

  describe('OperationsService list / create / summary', () => {
    let service: OperationsService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      db.query.mockResolvedValue({ rows: [] } as never);
      service = new OperationsService(db, {
        onServiceRequestCreated: jest.fn().mockResolvedValue(undefined),
        onServiceRequestDecided: jest.fn().mockResolvedValue(undefined),
      } as never);
    });

    it('createTask with LE company_id rejects before INSERT', async () => {
      await expect(
        service.createTask({
          company_id: XBOS_LE_UUID,
          title: 'Must not persist on LE plane',
          priority: 'medium',
        }),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PLANE-409' });
      expect(
        db.query.mock.calls.some((c) =>
          String(c[0]).includes('INSERT INTO public.hrm_tasks'),
        ),
      ).toBe(false);
    });

    it('createTask slug trsport maps to Plane B′ UUID', async () => {
      db.query.mockResolvedValue({
        rows: [
          {
            id: 't-ok',
            company_id: HRM_COMPANY_UUID_BY_SLUG.trsport,
            title: 'Happy slug',
            description: null,
            priority: 'low',
            status: 'todo',
            due_date: null,
            created_at: '2026-07-27T00:00:00.000Z',
            updated_at: '2026-07-27T00:00:00.000Z',
          },
        ],
      } as never);

      await service.createTask({
        company_id: 'trsport',
        title: 'Happy slug',
        priority: 'low',
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO public.hrm_tasks'),
        expect.arrayContaining([HRM_COMPANY_UUID_BY_SLUG.trsport]),
      );
    });

    it('listTasks with LE company_id rejects (no silent empty list)', async () => {
      await expect(
        service.listTasks({ company_id: XBOS_LE_UUID }),
      ).rejects.toMatchObject<ApiException>({
        code: 'HRM-PLANE-409',
      });
    });

    it('listTasks slug holding filters mapped UUID', async () => {
      db.query.mockResolvedValue({ rows: [{ total: '0' }] } as never);
      await service.listTasks({ company_id: 'holding' });
      const listCall = db.query.mock.calls.find((c) =>
        String(c[0]).includes('LIMIT'),
      );
      expect(listCall?.[1]?.[0]).toBe(HRM_COMPANY_UUID_BY_SLUG.holding);
    });

    it('getSummary with LE company_id rejects (no silent fake 0)', async () => {
      await expect(
        service.getSummary(XBOS_LE_UUID),
      ).rejects.toMatchObject<ApiException>({
        code: 'HRM-PLANE-409',
      });
      expect(
        db.query.mock.calls.some((c) =>
          String(c[0]).includes('FROM public.hrm_tasks'),
        ),
      ).toBe(false);
    });

    it('getSummary slug holding runs UUID + TEXT modes without throw', async () => {
      db.query.mockResolvedValue({ rows: [{ total: '0' }] } as never);
      const summary = await service.getSummary('holding');
      expect(summary).toEqual({
        attendance_records: 0,
        payroll_periods: 0,
        job_requisitions: 0,
        tasks: 0,
        service_requests: 0,
      });
      const taskSql =
        db.query.mock.calls.find((c) =>
          String(c[0]).includes('FROM public.hrm_tasks'),
        )?.[0] ?? '';
      expect(String(taskSql)).toContain('::uuid');
      const payrollSql =
        db.query.mock.calls.find((c) =>
          String(c[0]).includes('FROM public.payroll_periods'),
        )?.[0] ?? '';
      expect(String(payrollSql)).toContain('company_id =');
      expect(String(payrollSql)).not.toContain('::uuid');
    });

    it('pushCompanyIdUuidFilter still maps slug holding (shared helper must_keep)', () => {
      const filters: string[] = [];
      const values: unknown[] = [];
      pushCompanyIdUuidFilter(filters, values, ['holding']);
      expect(values[0]).toBe(HRM_COMPANY_UUID_BY_SLUG.holding);
    });
  });
});
