import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';

/**
 * BM-BE-REC-CAND-GET-BY-ID-01 · R-REC-WF-04-02 · J-REC-WF-04 scope_parity
 * Group CEO company_id=main must load ids returned by list (holding/member company_id).
 */
describe('BM-BE-REC-CAND-GET-BY-ID-01 scope_parity', () => {
  const ceoToken = () =>
    signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

  describe('RecruitmentCatalogService.getCandidatePoolById (Lane B)', () => {
    let service: RecruitmentCatalogService;
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
      service = new RecruitmentCatalogService(db, bridge as never);
    });

    it('finds holding pool candidate when group CEO requests company_id=main', async () => {
      const candidateId = '289a9388-22c5-49be-a795-f498a0c72436';
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) {
          return { rows: [] } as never;
        }
        if (sql.includes('FROM public.candidates') && sql.includes('LIMIT 1')) {
          return {
            rows: [
              {
                id: candidateId,
                company_id: 'holding',
                full_name: 'QA Pool 1780114706910',
                stage: 'hired',
                employee_id: '678b9cb2-1111-4111-8111-678b9cb21111',
                workflow_instance_id: null,
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.getCandidatePoolById(candidateId, 'main', `Bearer ${ceoToken()}`);

      expect(result.id).toBe(candidateId);
      expect(result.company_id).toBe('holding');
      expect(result.stage).toBe('hired');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('company_id = ANY'),
        expect.arrayContaining([candidateId, expect.any(Array)]),
      );
    });

    it('returns HRM-REC-CP-404 when pool id is outside rollup scope', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) {
          return { rows: [] } as never;
        }
        if (sql.includes('FROM public.candidates') && sql.includes('LIMIT 1')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.getCandidatePoolById(
          '289a9388-22c5-49be-a795-f498a0c72436',
          'main',
          `Bearer ${ceoToken()}`,
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-CP-404' });
    });
  });

  describe('RecruitmentService.getCandidateById (Lane A spine)', () => {
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

    it('finds holding spine candidate when group CEO requests company_id=main', async () => {
      const candidateId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS') || sql.includes('ALTER TABLE')) {
          return { rows: [] } as never;
        }
        if (sql.includes('FROM public.recruitment_candidates') && sql.includes('LIMIT 1')) {
          return {
            rows: [
              {
                id: candidateId,
                company_id: 'holding',
                requisition_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
                full_name: 'Spine Candidate',
                email: 'spine@xe.vn',
                source: 'referral',
                status: 'applied',
                created_at: '2026-07-22T00:00:00.000Z',
                updated_at: '2026-07-22T00:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.getCandidateById(
        candidateId,
        'main',
        `Bearer ${ceoToken()}`,
        { tenantId: 'xevn' },
      );

      expect(result.id).toBe(candidateId);
      expect(result.company_id).toBe('holding');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('company_id = ANY'),
        expect.arrayContaining([candidateId, expect.any(Array)]),
      );
    });

    it('returns HRM-REC-404 when spine id is outside rollup scope', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS') || sql.includes('ALTER TABLE')) {
          return { rows: [] } as never;
        }
        if (sql.includes('FROM public.recruitment_candidates') && sql.includes('LIMIT 1')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.getCandidateById(
          'a1b2c3d4-e5f6-4789-a012-3456789abcde',
          'main',
          `Bearer ${ceoToken()}`,
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-404' });
    });
  });
});
