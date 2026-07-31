import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentService } from './recruitment.service';

/** D-CRUDMAT-REC-U-01 · AC-CRUD-HRM-REC-G-U-01 · scope_parity */
describe('P1-PHASE1-BE-REC-PATCH-01 scope_parity', () => {
  describe('RecruitmentService.updateJobRequisition', () => {
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

    it('updates holding requisition when group CEO requests company_id=main (AC-CRUD-HRM-REC-G-U-01)', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      const requisitionId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1')) {
          return {
            rows: [{ company_id: 'holding', status: 'open', workflow_instance_id: null }],
          } as never;
        }
        if (sql.includes('UPDATE public.job_requisitions')) {
          return {
            rows: [
              {
                id: requisitionId,
                company_id: 'holding',
                title: 'Backend Engineer',
                department: 'Engineering',
                employment_type: 'full_time',
                status: 'on_hold',
                created_at: '2026-04-23T00:00:00.000Z',
                updated_at: '2026-06-07T00:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.updateJobRequisition(
        requisitionId,
        { status: 'on_hold' },
        { company_id: 'main' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.id).toBe(requisitionId);
      expect(result.status).toBe('on_hold');
      expect(result.company_id).toBe('holding');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE public.job_requisitions'),
        expect.arrayContaining(['on_hold', requisitionId, expect.any(Array)]),
      );
      const updateSql =
        db.query.mock.calls.find((c) => String(c[0]).includes('UPDATE public.job_requisitions'))?.[0] ?? '';
      expect(String(updateSql)).toContain('company_id = ANY');
    });

    it('returns HRM-REC-404 when requisition id is outside rollup scope', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.updateJobRequisition(
          '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
          { status: 'on_hold' },
          { company_id: 'main' },
          `Bearer ${token}`,
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-404' });
    });

    it('returns HRM-REC-409 when requisition company_id is outside rollup scope (P1-02)', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1')) {
          return {
            rows: [{ company_id: 'other-co', status: 'open', workflow_instance_id: null }],
          } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.updateJobRequisition(
          '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
          { status: 'closed' },
          { company_id: 'main' },
          `Bearer ${token}`,
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-409' });
    });
  });
});
