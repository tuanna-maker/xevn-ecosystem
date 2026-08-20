/**
 * PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01 — UC-BP-REC-05
 * ensureSchema history + open-CHK · POST transitions · GET stage-history · U19
 */
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_REC_STAGE_EMPTY_CATALOG,
  HRM_REC_STAGE_HISTORY_FAIL,
  HRM_REC_STAGE_REJECT_REASON,
  HRM_REC_STAGE_REVERSE_FORBIDDEN,
  HRM_REC_STAGE_UNKNOWN,
} from './rec-pipeline-stage.constants';
import { RecruitmentService } from './recruitment.service';

const CAND_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const REQ_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
const HOLDING = 'holding';
const MEMBER = 'du-lich';

function stageRow(overrides: {
  stageKey: string;
  sortOrder: number;
  isRejectOutcome?: boolean;
  isHiredOutcome?: boolean;
}) {
  return {
    id: `stg-${overrides.stageKey}`,
    companyId: HOLDING,
    stageKey: overrides.stageKey,
    nameVi: overrides.stageKey,
    sortOrder: overrides.sortOrder,
    isTerminal: false,
    isHiredOutcome: overrides.isHiredOutcome ?? false,
    isRejectOutcome: overrides.isRejectOutcome ?? false,
    allowsInterviewSchedule: true,
    wfTaskTypeKey: null,
    colorToken: null,
    metadata: null,
    status: 'active',
    source: 'rec_native' as const,
    catalogKind: 'rec_pipeline_stage' as const,
    archivedAt: null,
    updatedAt: '2026-08-09T00:00:00.000Z',
    createdAt: '2026-08-09T00:00:00.000Z',
  };
}

const EFF_DEFAULT = {
  total: 3,
  hiredOutcomeKey: 'hired' as string | null,
  data: [
    stageRow({ stageKey: 'screening', sortOrder: 10 }),
    stageRow({ stageKey: 'interview', sortOrder: 20 }),
    stageRow({ stageKey: 'rejected', sortOrder: 90, isRejectOutcome: true }),
  ],
};

describe('PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01 stage transition + timeline', () => {
  let service: RecruitmentService;
  let db: jest.Mocked<Pick<HrmDbService, 'query' | 'withTransaction'>>;
  let catalog: { listEffective: jest.Mock };

  const candidateRow = {
    id: CAND_ID,
    company_id: HOLDING,
    requisition_id: REQ_ID,
    full_name: 'Nguyễn Văn A',
    email: 'a@xe.vn',
    source: 'referral',
    status: 'screening',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(() => {
    db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn(async (fn) => fn(db.query)),
    };
    catalog = {
      listEffective: jest.fn().mockResolvedValue(EFF_DEFAULT),
    };
    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      assertNotLockedOrThrow: jest.fn(),
      startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
    };
    service = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
      catalog as never,
    );
  });

  function stubEnsureThenCandidate(row = candidateRow) {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [row] } as never;
      }
      if (sql.includes('hrm_company_settings')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
  }

  it('ensureSchema ADD rec_candidate_stage_history + open-CHK (DROP closed-six)', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    await expect(
      service.getCandidateById(CAND_ID, HOLDING),
    ).rejects.toMatchObject({ code: 'HRM-REC-404' });
    const joined = sqlLog.join('\n');
    expect(joined).toMatch(/rec_candidate_stage_history/);
    expect(joined).toMatch(/chk_recruitment_candidates_status_open/);
    expect(joined).toMatch(/DROP CONSTRAINT chk_recruitment_candidates_status/);
    expect(joined).toMatch(/ix_rec_csh_candidate_changed/);
    // FORBIDDEN closed-six as sole SoT on CREATE for new installs
    expect(joined).not.toMatch(
      /chk_recruitment_candidates_status CHECK \(status IN \('new', 'screening'/,
    );
  });

  it('POST transition happy: atomic UPDATE status + INSERT history', async () => {
    stubEnsureThenCandidate();
    const historyId = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0';
    db.withTransaction.mockImplementation(async (fn) => {
      const q = jest.fn(async (sql: string) => {
        if (sql.includes('UPDATE public.recruitment_candidates')) {
          return {
            rows: [
              {
                ...candidateRow,
                status: 'interview',
                updated_at: '2026-08-09T01:00:00.000Z',
              },
            ],
          } as never;
        }
        if (sql.includes('INSERT INTO public.rec_candidate_stage_history')) {
          return {
            rows: [
              {
                id: historyId,
                company_id: HOLDING,
                recruitment_candidate_id: CAND_ID,
                application_id: null,
                from_stage: 'screening',
                to_stage: 'interview',
                note: null,
                desired_salary: null,
                changed_by: null,
                changed_at: '2026-08-09T01:00:00.000Z',
              },
            ],
          } as never;
        }
        throw new Error(`unexpected txn sql: ${sql.slice(0, 80)}`);
      });
      return fn(q as never);
    });

    const result = await service.transitionCandidateStage(
      CAND_ID,
      { to_stage: 'interview' },
      HOLDING,
    );
    expect(result.stage).toBe('interview');
    expect(result.history_id).toBe(historyId);
    expect(result.history).toMatchObject({
      from_stage: 'screening',
      to_stage: 'interview',
      company_id: HOLDING,
    });
    expect(db.withTransaction).toHaveBeenCalled();
  });

  it('UNKNOWN when to_stage ∉ EFF and EFF>0', async () => {
    stubEnsureThenCandidate();
    await expect(
      service.transitionCandidateStage(
        CAND_ID,
        { to_stage: 'invent_stage' },
        HOLDING,
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_STAGE_UNKNOWN });
    expect(db.withTransaction).not.toHaveBeenCalled();
  });

  it('EMPTY-CATALOG when EFF=0', async () => {
    stubEnsureThenCandidate();
    catalog.listEffective.mockResolvedValue({
      total: 0,
      data: [],
      hiredOutcomeKey: null,
    });
    await expect(
      service.transitionCandidateStage(
        CAND_ID,
        { to_stage: 'interview' },
        HOLDING,
      ),
    ).rejects.toMatchObject<ApiException>({
      code: HRM_REC_STAGE_EMPTY_CATALOG,
    });
  });

  it('REJECT-REASON when reject-class note empty', async () => {
    stubEnsureThenCandidate();
    await expect(
      service.transitionCandidateStage(
        CAND_ID,
        { to_stage: 'rejected' },
        HOLDING,
      ),
    ).rejects.toMatchObject<ApiException>({
      code: HRM_REC_STAGE_REJECT_REASON,
    });
    expect(db.withTransaction).not.toHaveBeenCalled();
  });

  it('reject with note OK', async () => {
    stubEnsureThenCandidate();
    db.withTransaction.mockImplementation(async (fn) => {
      const q = jest.fn(async (sql: string) => {
        if (sql.includes('UPDATE public.recruitment_candidates')) {
          return { rows: [{ ...candidateRow, status: 'rejected' }] } as never;
        }
        if (sql.includes('INSERT INTO public.rec_candidate_stage_history')) {
          return {
            rows: [
              {
                id: 'hist-rej',
                company_id: HOLDING,
                recruitment_candidate_id: CAND_ID,
                application_id: null,
                from_stage: 'screening',
                to_stage: 'rejected',
                note: 'Không phù hợp kỹ năng',
                desired_salary: 25000000,
                changed_by: null,
                changed_at: '2026-08-09T02:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });
      return fn(q as never);
    });
    const result = await service.transitionCandidateStage(
      CAND_ID,
      {
        to_stage: 'rejected',
        note: 'Không phù hợp kỹ năng',
        desired_salary: 25_000_000,
      },
      HOLDING,
    );
    expect(result.stage).toBe('rejected');
    expect(result.history?.note).toBe('Không phù hợp kỹ năng');
    expect(result.history?.desired_salary).toBe(25_000_000);
  });

  it('REVERSE-FORBIDDEN when CFG allow_reverse_stage=false', async () => {
    const interviewCand = { ...candidateRow, status: 'interview' };
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('SELECT c.id, c.company_id, c.requisition_id') &&
        sql.includes('FROM public.recruitment_candidates c')
      ) {
        return { rows: [interviewCand] } as never;
      }
      if (sql.includes('hrm_company_settings')) {
        return { rows: [{ value_json: false }] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      service.transitionCandidateStage(
        CAND_ID,
        { to_stage: 'screening' },
        HOLDING,
      ),
    ).rejects.toMatchObject<ApiException>({
      code: HRM_REC_STAGE_REVERSE_FORBIDDEN,
    });
    expect(db.withTransaction).not.toHaveBeenCalled();
  });

  it('reverse allowed when CFG default true (unset)', async () => {
    stubEnsureThenCandidate({ ...candidateRow, status: 'interview' });
    db.withTransaction.mockImplementation(async (fn) => {
      const q = jest.fn(async (sql: string) => {
        if (sql.includes('UPDATE public.recruitment_candidates')) {
          return { rows: [{ ...candidateRow, status: 'screening' }] } as never;
        }
        if (sql.includes('INSERT INTO public.rec_candidate_stage_history')) {
          return {
            rows: [
              {
                id: 'hist-rev',
                company_id: HOLDING,
                recruitment_candidate_id: CAND_ID,
                application_id: null,
                from_stage: 'interview',
                to_stage: 'screening',
                note: null,
                desired_salary: null,
                changed_by: null,
                changed_at: '2026-08-09T03:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });
      return fn(q as never);
    });
    const result = await service.transitionCandidateStage(
      CAND_ID,
      { to_stage: 'screening' },
      HOLDING,
    );
    expect(result.stage).toBe('screening');
    expect(result.history?.from_stage).toBe('interview');
  });

  it('same-key no-op: 2xx without history INSERT', async () => {
    stubEnsureThenCandidate();
    const result = await service.transitionCandidateStage(
      CAND_ID,
      { to_stage: 'screening' },
      HOLDING,
    );
    expect(result.stage).toBe('screening');
    expect(result.history_id).toBeNull();
    expect(db.withTransaction).not.toHaveBeenCalled();
  });

  it('HISTORY-FAIL when INSERT returns empty (txn throws → mint)', async () => {
    stubEnsureThenCandidate();
    db.withTransaction.mockImplementation(async (fn) => {
      const q = jest.fn(async (sql: string) => {
        if (sql.includes('UPDATE public.recruitment_candidates')) {
          return { rows: [{ ...candidateRow, status: 'interview' }] } as never;
        }
        if (sql.includes('INSERT INTO public.rec_candidate_stage_history')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });
      return fn(q as never);
    });
    await expect(
      service.transitionCandidateStage(
        CAND_ID,
        { to_stage: 'interview' },
        HOLDING,
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_STAGE_HISTORY_FAIL });
  });

  it('GET stage-history display-ready + empty [] OK', async () => {
    stubEnsureThenCandidate();
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      if (sql.includes('FROM public.rec_candidate_stage_history')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
    const empty = await service.listCandidateStageHistory(CAND_ID, {
      company_id: HOLDING,
    });
    expect(empty.data).toEqual([]);
    expect(empty.stage).toBe('screening');

    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      if (sql.includes('FROM public.rec_candidate_stage_history')) {
        return {
          rows: [
            {
              id: 'h1',
              company_id: HOLDING,
              recruitment_candidate_id: CAND_ID,
              application_id: null,
              from_stage: 'new',
              to_stage: 'screening',
              note: null,
              desired_salary: null,
              changed_by: null,
              changed_at: '2026-08-08T10:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });
    const listed = await service.listCandidateStageHistory(CAND_ID, {
      company_id: HOLDING,
    });
    expect(listed.data[0]).toMatchObject({
      id: 'h1',
      from_stage: 'new',
      to_stage: 'screening',
      recruitment_candidate_id: CAND_ID,
      company_id: HOLDING,
    });
  });

  it('U19 scope_parity: list filters company_id same as get/transition/timeline', async () => {
    const listSql: string[] = [];
    db.query.mockImplementation(async (sql: string, values?: unknown[]) => {
      if (
        sql.includes('CREATE TABLE') ||
        sql.includes('ALTER TABLE') ||
        sql.includes('CREATE INDEX') ||
        sql.includes('DO $$')
      ) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('COUNT')
      ) {
        listSql.push(`COUNT:${JSON.stringify(values)}`);
        return { rows: [{ total: '0' }] } as never;
      }
      if (
        sql.includes('FROM public.recruitment_candidates AS c') ||
        sql.includes('FROM public.recruitment_candidates c')
      ) {
        listSql.push(
          `SEL:${sql.includes('company_id')}:${JSON.stringify(values)}`,
        );
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
    await service.listCandidates({
      company_id: MEMBER,
      page: 1,
      page_size: 10,
    });
    expect(
      listSql.some((s) => s.includes(MEMBER) || s.includes('company')),
    ).toBe(true);

    // get / transition / timeline all use pushRequisitionCompanyFilter on candidate load
    stubEnsureThenCandidate({ ...candidateRow, company_id: MEMBER });
    await expect(
      service.getCandidateById(CAND_ID, MEMBER),
    ).resolves.toMatchObject({ company_id: MEMBER });

    db.withTransaction.mockImplementation(async (fn) => {
      const q = jest.fn(async (sql: string) => {
        if (sql.includes('UPDATE')) {
          return {
            rows: [
              { ...candidateRow, company_id: MEMBER, status: 'interview' },
            ],
          } as never;
        }
        if (sql.includes('INSERT')) {
          return {
            rows: [
              {
                id: 'h-u19',
                company_id: MEMBER,
                recruitment_candidate_id: CAND_ID,
                application_id: null,
                from_stage: 'screening',
                to_stage: 'interview',
                note: null,
                desired_salary: null,
                changed_by: null,
                changed_at: '2026-08-09T04:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });
      return fn(q as never);
    });
    catalog.listEffective.mockResolvedValue({
      total: 2,
      hiredOutcomeKey: null,
      data: [
        stageRow({ stageKey: 'screening', sortOrder: 10 }),
        stageRow({ stageKey: 'interview', sortOrder: 20 }),
      ].map((r) => ({ ...r, companyId: MEMBER })),
    });
    stubEnsureThenCandidate({ ...candidateRow, company_id: MEMBER });
    const tr = await service.transitionCandidateStage(
      CAND_ID,
      { to_stage: 'interview' },
      MEMBER,
    );
    expect(tr.company_id).toBe(MEMBER);

    stubEnsureThenCandidate({ ...candidateRow, company_id: MEMBER });
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [{ ...candidateRow, company_id: MEMBER }] } as never;
      }
      if (sql.includes('FROM public.rec_candidate_stage_history')) {
        expect(sql).toMatch(/company_id/);
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
    const tl = await service.listCandidateStageHistory(CAND_ID, {
      company_id: MEMBER,
    });
    expect(tl.company_id).toBe(MEMBER);
  });

  it('DENY reopen: no Nest /rec dual · no second history table invent in ensureSchema', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    await expect(
      service.getCandidateById(CAND_ID, HOLDING),
    ).rejects.toMatchObject({
      code: 'HRM-REC-404',
    });
    const joined = sqlLog.join('\n');
    expect(joined).not.toMatch(
      /CREATE TABLE IF NOT EXISTS public\.candidate_stage_history\b/,
    );
    expect(joined).toMatch(
      /CREATE TABLE IF NOT EXISTS public\.rec_candidate_stage_history/,
    );
  });
});
