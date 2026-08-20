/**
 * PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-02 — F-REC-IV-04 projection id
 * residual R-REC-IV-PROJ-ID · list/get ACTIVE active_interview_id parity
 */
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentService } from './recruitment.service';

const CAND_ID = '0e3f95b7-cf1b-469f-a0f8-4c91f3f35f80';
const IV_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const REQ_ID = '733e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const ACTIVE_AT = '2099-09-15T10:00:00.000Z';

function activeCandidateRow() {
  return {
    id: CAND_ID,
    company_id: 'holding',
    requisition_id: REQ_ID,
    full_name: 'Candidate Active IV',
    email: 'active-iv@xe.vn',
    source: 'web',
    status: 'interview',
    created_at: '2026-08-09T00:00:00.000Z',
    updated_at: '2026-08-09T00:00:00.000Z',
    yctd_title: 'YCTD',
    position_code: 'DRV',
    position_name: 'Lái xe',
    active_interview_id: IV_ID,
    active_interview_status: 'scheduled',
    active_interview_at: ACTIVE_AT,
  };
}

describe('PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-02 active_interview_id projection', () => {
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

  it('listCandidates embeds nested + flat active_interview_id when ACTIVE', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('CREATE TABLE') ||
        sql.includes('ALTER TABLE') ||
        sql.includes('DO $$')
      ) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('pool_candidate_id') ||
        sql.includes('FROM public.candidates')
      ) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('SELECT COUNT(*)') &&
        sql.includes('recruitment_candidates')
      ) {
        return { rows: [{ total: '1' }] } as never;
      }
      if (
        sql.includes('LEFT JOIN LATERAL') &&
        sql.includes('FROM public.recruitment_candidates')
      ) {
        return { rows: [activeCandidateRow()] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listCandidates({ company_id: 'holding' });
    expect(result.data[0]?.active_interview_id).toBe(IV_ID);
    expect(result.data[0]?.active_interview).toMatchObject({
      has_active_interview: true,
      active_interview_id: IV_ID,
      active_interview_status: 'scheduled',
      active_interview_at: ACTIVE_AT,
      active_interview_badge_label: 'Đã có lịch',
    });
  });

  it('getCandidateById embeds nested + flat active_interview_id (list/get parity)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('CREATE TABLE') ||
        sql.includes('ALTER TABLE') ||
        sql.includes('DO $$')
      ) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('LEFT JOIN LATERAL') &&
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [activeCandidateRow()] } as never;
      }
      return { rows: [] } as never;
    });

    const detail = await service.getCandidateById(CAND_ID, 'holding');
    expect(detail.active_interview_id).toBe(IV_ID);
    expect(detail.active_interview).toMatchObject({
      has_active_interview: true,
      active_interview_id: IV_ID,
      active_interview_status: 'scheduled',
      active_interview_at: ACTIVE_AT,
    });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ai.id AS active_interview_id'),
      expect.any(Array),
    );
  });

  it('inactive candidate projection clears active_interview_id', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('SELECT COUNT(*)') &&
        sql.includes('recruitment_candidates')
      ) {
        return { rows: [{ total: '1' }] } as never;
      }
      if (
        sql.includes('LEFT JOIN LATERAL') &&
        sql.includes('FROM public.recruitment_candidates')
      ) {
        return {
          rows: [
            {
              ...activeCandidateRow(),
              active_interview_id: null,
              active_interview_status: null,
              active_interview_at: null,
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listCandidates({ company_id: 'holding' });
    expect(result.data[0]?.active_interview_id).toBeNull();
    expect(result.data[0]?.active_interview).toMatchObject({
      has_active_interview: false,
      active_interview_id: null,
      active_interview_badge_label: null,
    });
  });
});
