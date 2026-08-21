import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceService } from '../attendance/attendance.service';
import { AttendanceConfigService } from '../attendance/attendance-config.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import { RecruitmentService } from './recruitment.service';

/** D-CRUDMAT-REC-RD-01 · D-CRUDMAT-ATT-RD-01 · J-HRM-05 · J-HRM-06 scope_parity */
describe('P1-PHASE1-BE-CRUD-RD-PARITY-01 scope_parity', () => {
  describe('RecruitmentService.getJobRequisitionById', () => {
    let service: RecruitmentService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      db.query.mockResolvedValue({ rows: [] } as never);
      const bridge = {
        ensureSchema: jest.fn().mockResolvedValue(undefined),
        assertNotLockedOrThrow: jest.fn(),
        startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
      };
      service = new RecruitmentService(db, bridge as never);
    });

    it('finds holding requisition when group CEO requests company_id=main (J-HRM-05)', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      const requisitionId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.job_requisitions') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: requisitionId,
                company_id: 'holding',
                title: 'Backend Engineer',
                department: 'Engineering',
                employment_type: 'full_time',
                status: 'open',
                created_at: '2026-04-23T00:00:00.000Z',
                updated_at: '2026-04-23T00:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.getJobRequisitionById(
        requisitionId,
        { company_id: 'main' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.id).toBe(requisitionId);
      expect(result.company_id).toBe('holding');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('company_id = ANY'),
        expect.arrayContaining([requisitionId, expect.any(Array)]),
      );
    });

    it('returns HRM-REC-404 when requisition id is outside rollup scope', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.job_requisitions') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.getJobRequisitionById(
          '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
          { company_id: 'main' },
          `Bearer ${token}`,
        ),
      ).rejects.toMatchObject({ code: 'HRM-REC-404' });
    });
  });

  describe('AttendanceService.getRecordById', () => {
    let service: AttendanceService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      db.query.mockResolvedValue({ rows: [] } as never);
      service = new AttendanceService(
        db,
        { fanoutCheckIn: jest.fn() } as unknown as AttendanceEventFanoutService,
        // ensureSchema() delegates work-site DDL to AttendanceConfigService — DI-only stub.
        {
          ensureWorkSitesSchema: jest.fn(),
        } as unknown as AttendanceConfigService,
      );
    });

    it('finds record via workforce scope when group CEO requests company_id=main (J-HRM-06)', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      const recordId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.attendance_records') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: recordId,
                company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                employee_id: '8d846eb9-fcf7-4fe3-8987-24c503d80ce3',
                attendance_date: '2026-04-23',
                check_in_at: null,
                check_out_at: null,
                status: 'present',
                note: null,
                created_by: 'hrm-api',
                created_at: '2026-04-23T00:00:00.000Z',
                updated_at: '2026-04-23T00:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.getRecordById(
        recordId,
        { company_id: 'main' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.id).toBe(recordId);
      const getSql =
        db.query.mock.calls.find(
          (c) =>
            String(c[0]).includes('FROM public.attendance_records') &&
            String(c[0]).includes('LIMIT 1'),
        )?.[0] ?? '';
      expect(String(getSql)).toContain('employee_id IN');
    });

    it('returns HRM-ATT-404 when record id is outside workforce scope', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.attendance_records') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.getRecordById(
          'f76f23f7-3683-4120-81b7-5126ee997b8e',
          { company_id: 'main' },
          `Bearer ${token}`,
        ),
      ).rejects.toMatchObject({ code: 'HRM-ATT-404' });
    });
  });
});
