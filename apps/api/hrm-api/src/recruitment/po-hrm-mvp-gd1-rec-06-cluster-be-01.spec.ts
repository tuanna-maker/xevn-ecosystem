/**
 * PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01 — UC-BP-REC-06
 * ensureSchema mail outbox+log · POST/GET mail · eval YCTD neo · Pass/Fail · ROUND-GATE · soft archive · U19
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_REC_EVAL_NEO_REQUIRED,
  HRM_REC_EVAL_PASSFAIL_REQUIRED,
  HRM_REC_EVAL_ROUND_GATE,
  HRM_REC_MAIL_CC_REQUIRED,
  HRM_REC_MAIL_PROVIDER_FAIL,
  HRM_REC_MAIL_TEMPLATE_INACTIVE,
} from './rec-mail-eval.constants';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';

const CAND_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const REQ_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
const OUTBOX_ID = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0';
const EVAL_ID = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01';
const IV_ID = 'e5f6a7b8-c9d0-4123-e456-789abcdef012';
const HOLDING = 'holding';
const MEMBER = 'du-lich';
const TRSPORT = 'trsport';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

describe('PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01 mail + YCTD eval', () => {
  let service: RecruitmentService;
  let catalog: RecruitmentCatalogService;
  let db: jest.Mocked<Pick<HrmDbService, 'query' | 'withTransaction'>>;

  const candidateRow = {
    id: CAND_ID,
    company_id: HOLDING,
    requisition_id: REQ_ID,
    full_name: 'Nguyễn Văn A',
    email: 'a@xe.vn',
    source: 'referral',
    status: 'interview',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(() => {
    process.env.HRM_MAIL_PROVIDER = 'local';
    db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn(async (fn) => fn(db.query)),
    };
    service = new RecruitmentService(
      db as unknown as HrmDbService,
      mockBridge() as never,
    );
    catalog = new RecruitmentCatalogService(
      db as unknown as HrmDbService,
      mockBridge() as never,
    );
  });

  afterEach(() => {
    delete process.env.HRM_MAIL_PROVIDER;
  });

  it('ensureSchema ADD rec_mail_outbox + rec_mail_log (DATA-01)', async () => {
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
    expect(joined).toMatch(
      /CREATE TABLE IF NOT EXISTS public\.rec_mail_outbox/,
    );
    expect(joined).toMatch(/CREATE TABLE IF NOT EXISTS public\.rec_mail_log/);
    expect(joined).toMatch(/chk_rec_mail_outbox_neo/);
    expect(joined).not.toMatch(
      /CREATE TABLE IF NOT EXISTS public\.mail_outbox\b/,
    );
    expect(joined).not.toMatch(/\/rec\//);
  });

  it('ensureWave2Schema UPGRADE candidate_evaluations neo + archived_at', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    await catalog.listCandidateEvaluations(HOLDING);
    const joined = sqlLog.join('\n');
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS recruitment_candidate_id/);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS application_id/);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS archived_at/);
    expect(joined).toMatch(/ALTER COLUMN candidate_id DROP NOT NULL/);
    expect(joined).toMatch(/evaluation_criteria_templates[\s\S]*archived_at/);
  });

  it('POST mail happy — outbox sent + ≥1 log · no stage UPDATE', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      sqlLog.push(sql);
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      if (sql.includes('INSERT INTO public.rec_mail_outbox')) {
        return {
          rows: [
            {
              id: params?.[0] ?? OUTBOX_ID,
              company_id: HOLDING,
              recruitment_candidate_id: CAND_ID,
              application_id: null,
              requisition_id: REQ_ID,
              template_code: 'fail_cv',
              to_emails_json: ['a@xe.vn'],
              cc_emails_json: null,
              payload_json: null,
              status: 'sent',
              queued_at: '2026-08-09T01:00:00.000Z',
              sent_at: '2026-08-09T01:00:01.000Z',
              error_message: null,
            },
          ],
        } as never;
      }
      if (sql.includes('FROM public.rec_mail_log')) {
        return {
          rows: [
            {
              attempt_no: 1,
              result: 'sent',
              error_message: null,
              provider_ref: 'local-test',
              logged_at: '2026-08-09T01:00:01.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('SELECT status FROM public.recruitment_candidates')) {
        return { rows: [{ status: 'interview' }] } as never;
      }
      return { rows: [] } as never;
    });

    const dto = await service.enqueueCandidateMail(
      CAND_ID,
      { template_code: 'fail_cv', to: ['a@xe.vn'] },
      HOLDING,
    );
    expect(dto.status).toBe('sent');
    expect(dto.log.length).toBeGreaterThanOrEqual(1);
    expect(dto.recruitment_candidate_id).toBe(CAND_ID);
    expect(
      sqlLog.some((s) => s.includes('INSERT INTO public.rec_mail_log')),
    ).toBe(true);
    expect(
      sqlLog.some(
        (s) =>
          s.includes('UPDATE public.recruitment_candidates') &&
          s.includes('SET status'),
      ),
    ).toBe(false);
  });

  it('SMTP unset (not local) → HRM-REC-MAIL-PROVIDER-FAIL · no fake sent', async () => {
    delete process.env.HRM_MAIL_PROVIDER;
    delete process.env.HRM_SMTP_USER;
    delete process.env.HRM_SMTP_PASS;
    delete process.env.HRM_MAIL_FROM;
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      if (sql.includes('INSERT INTO public.rec_mail_outbox')) {
        return {
          rows: [
            {
              id: params?.[0] ?? OUTBOX_ID,
              company_id: HOLDING,
              recruitment_candidate_id: CAND_ID,
              application_id: null,
              requisition_id: REQ_ID,
              template_code: 'fail_cv',
              to_emails_json: ['a@xe.vn'],
              cc_emails_json: null,
              payload_json: null,
              status: 'failed',
              queued_at: '2026-08-09T01:00:00.000Z',
              sent_at: null,
              error_message: 'Chưa cấu hình',
            },
          ],
        } as never;
      }
      if (sql.includes('FROM public.rec_mail_log')) {
        return {
          rows: [
            {
              attempt_no: 1,
              result: 'failed',
              error_message: 'Chưa cấu hình',
              provider_ref: null,
              logged_at: '2026-08-09T01:00:01.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('SELECT status FROM public.recruitment_candidates')) {
        return { rows: [{ status: 'interview' }] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      service.enqueueCandidateMail(
        CAND_ID,
        { template_code: 'fail_cv', to: ['a@xe.vn'] },
        HOLDING,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_MAIL_PROVIDER_FAIL });
    process.env.HRM_MAIL_PROVIDER = 'local';
  });

  it('interview_invite missing CC → HRM-REC-MAIL-CC-REQUIRED · no outbox INSERT', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      service.enqueueCandidateMail(
        CAND_ID,
        {
          template_code: 'interview_invite',
          to: ['a@xe.vn'],
          cc_interviewers: [],
        },
        HOLDING,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_MAIL_CC_REQUIRED });
    expect(
      db.query.mock.calls.some(([sql]) =>
        String(sql).includes('INSERT INTO public.rec_mail_outbox'),
      ),
    ).toBe(false);
  });

  it('unknown template → HRM-REC-MAIL-TEMPLATE-INACTIVE', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      service.enqueueCandidateMail(
        CAND_ID,
        { template_code: 'invent_tpl', to: ['a@xe.vn'] },
        HOLDING,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_MAIL_TEMPLATE_INACTIVE });
  });

  it('provider fail persists failed + log · throws PROVIDER-FAIL · stage unchanged', async () => {
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      if (sql.includes('INSERT INTO public.rec_mail_outbox')) {
        return {
          rows: [
            {
              id: params?.[0] ?? OUTBOX_ID,
              company_id: HOLDING,
              recruitment_candidate_id: CAND_ID,
              application_id: null,
              requisition_id: REQ_ID,
              template_code: 'fail_cv',
              to_emails_json: ['a@xe.vn'],
              cc_emails_json: null,
              payload_json: null,
              status: 'failed',
              queued_at: '2026-08-09T01:00:00.000Z',
              sent_at: null,
              error_message: 'Simulated provider failure (GĐ1)',
            },
          ],
        } as never;
      }
      if (sql.includes('FROM public.rec_mail_log')) {
        return {
          rows: [
            {
              attempt_no: 1,
              result: 'failed',
              error_message: 'Simulated provider failure (GĐ1)',
              provider_ref: null,
              logged_at: '2026-08-09T01:00:01.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('SELECT status FROM public.recruitment_candidates')) {
        return { rows: [{ status: 'interview' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.enqueueCandidateMail(
        CAND_ID,
        {
          template_code: 'fail_cv',
          to: ['a@xe.vn'],
          simulate_provider_fail: true,
        },
        HOLDING,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_MAIL_PROVIDER_FAIL });
    expect(
      db.query.mock.calls.some(([sql]) =>
        String(sql).includes('INSERT INTO public.rec_mail_log'),
      ),
    ).toBe(true);
  });

  it('GET mail empty [] 200 display-ready', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [candidateRow] } as never;
      }
      return { rows: [] } as never;
    });
    const listed = await service.listCandidateMail(CAND_ID, {
      company_id: HOLDING,
    });
    expect(listed).toEqual({ total: 0, data: [] });
  });

  it('eval create Pass + neo YCTD → HRM-REC-EVAL path OK', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return {
          rows: [{ id: CAND_ID, company_id: HOLDING, status: 'interview' }],
        } as never;
      }
      if (
        sql.includes('FROM public.recruitment_interviews') &&
        sql.includes('status = ANY')
      ) {
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.candidate_evaluations')) {
        return {
          rows: [
            {
              id: EVAL_ID,
              company_id: HOLDING,
              candidate_id: null,
              recruitment_candidate_id: CAND_ID,
              application_id: null,
              interview_id: null,
              template_id: null,
              result: 'pass',
              scores: [],
              salary_recommendation: 15000000,
              overall_feedback: 'OK',
              recommendation: 'hire',
              evaluated_at: '2026-08-09T02:00:00.000Z',
              evaluator_name: 'HR',
              evaluator_email: 'hr@xe.vn',
              total_score: 8,
              weighted_score: 8,
              archived_at: null,
              created_at: '2026-08-09T02:00:00.000Z',
              updated_at: '2026-08-09T02:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const row = await catalog.createCandidateEvaluation({
      company_id: HOLDING,
      recruitment_candidate_id: CAND_ID,
      result: 'pass',
      scores: [{ key: 'tech', score: 8 }],
      salary_recommendation: 15000000,
    });
    expect(row.result).toBe('pass');
    expect(row.row_class).toBe('FR06_YCTD');
    expect(row.recruitment_candidate_id).toBe(CAND_ID);
    expect(row.scores_json).toEqual(row.scores);
  });

  it('eval create group CEO company_id=main + UV trsport → OK (not HRM-REC-409 scope)', async () => {
    let insertedCompanyId: string | null = null;
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return {
          rows: [{ id: CAND_ID, company_id: TRSPORT, status: 'interview' }],
        } as never;
      }
      if (
        sql.includes('FROM public.recruitment_interviews') &&
        sql.includes('status = ANY')
      ) {
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.candidate_evaluations')) {
        insertedCompanyId = String(params?.[1] ?? '');
        return {
          rows: [
            {
              id: EVAL_ID,
              company_id: TRSPORT,
              candidate_id: null,
              recruitment_candidate_id: CAND_ID,
              application_id: null,
              interview_id: null,
              template_id: null,
              result: 'pass',
              scores: [],
              salary_recommendation: null,
              overall_feedback: null,
              recommendation: 'hire',
              evaluated_at: '2026-08-22T02:00:00.000Z',
              evaluator_name: 'CEO',
              evaluator_email: 'ceo@xe.vn',
              total_score: 4,
              weighted_score: 4.2,
              archived_at: null,
              created_at: '2026-08-22T02:00:00.000Z',
              updated_at: '2026-08-22T02:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const row = await catalog.createCandidateEvaluation(
      {
        company_id: 'main',
        recruitment_candidate_id: CAND_ID,
        result: 'pass',
        scores: [{ criterion_name: 'Giao tiếp', actual_score: 4 }],
      },
      groupCeoToken(),
    );
    expect(row.result).toBe('pass');
    expect(insertedCompanyId).toBe(TRSPORT);
    expect(row.recruitment_candidate_id).toBe(CAND_ID);
  });

  it('eval pool-only chốt → HRM-REC-EVAL-NEO-REQUIRED', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await expect(
      catalog.createCandidateEvaluation({
        company_id: HOLDING,
        candidate_id: 'f6a7b8c9-d0e1-4234-f567-89abcdef0123',
        result: 'pass',
      }),
    ).rejects.toMatchObject({ code: HRM_REC_EVAL_NEO_REQUIRED });
  });

  it('eval chốt missing pass|fail → HRM-REC-EVAL-PASSFAIL-REQUIRED', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_candidates')) {
        return {
          rows: [{ id: CAND_ID, company_id: HOLDING, status: 'interview' }],
        } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      catalog.createCandidateEvaluation({
        company_id: HOLDING,
        recruitment_candidate_id: CAND_ID,
        result: 'pending',
      }),
    ).rejects.toMatchObject({ code: HRM_REC_EVAL_PASSFAIL_REQUIRED });
  });

  it('eval ROUND-GATE when ACTIVE interview exists', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_candidates')) {
        return {
          rows: [{ id: CAND_ID, company_id: HOLDING, status: 'interview' }],
        } as never;
      }
      if (
        sql.includes('FROM public.recruitment_interviews') &&
        sql.includes('status = ANY')
      ) {
        return { rows: [{ id: IV_ID }] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      catalog.createCandidateEvaluation({
        company_id: HOLDING,
        recruitment_candidate_id: CAND_ID,
        result: 'pass',
      }),
    ).rejects.toMatchObject({ code: HRM_REC_EVAL_ROUND_GATE });
  });

  it('eval soft-delete sets archived_at (DENY hard DELETE SoT)', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      if (sql.includes('SELECT id, company_id, recruitment_candidate_id')) {
        return {
          rows: [
            {
              id: EVAL_ID,
              company_id: HOLDING,
              recruitment_candidate_id: CAND_ID,
              application_id: null,
              candidate_id: null,
              archived_at: null,
            },
          ],
        } as never;
      }
      if (
        sql.includes('UPDATE public.candidate_evaluations') &&
        sql.includes('archived_at')
      ) {
        return {
          rows: [{ id: EVAL_ID, archived_at: '2026-08-09T03:00:00.000Z' }],
        } as never;
      }
      return { rows: [] } as never;
    });
    const out = await catalog.deleteCandidateEvaluation(EVAL_ID, HOLDING);
    expect(out.archived_at).toBeTruthy();
    expect(
      sqlLog.some((s) =>
        s.includes('DELETE FROM public.candidate_evaluations'),
      ),
    ).toBe(false);
  });

  it('U19 list mail uses same resolveHrmListScope company filter as get-by-id', async () => {
    const memberCand = { ...candidateRow, company_id: MEMBER };
    let sawCompanyFilter = false;
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        if (sql.includes('company_id')) sawCompanyFilter = true;
        return { rows: [memberCand] } as never;
      }
      return { rows: [] } as never;
    });
    const listed = await service.listCandidateMail(CAND_ID, {
      company_id: MEMBER,
    });
    expect(listed.total).toBe(0);
    expect(sawCompanyFilter).toBe(true);
  });

  it('DENY Nest /rec dual · no second mail SoT invent in ensureSchema', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    await expect(
      service.getCandidateById(CAND_ID, HOLDING),
    ).rejects.toBeInstanceOf(ApiException);
    const joined = sqlLog.join('\n');
    expect(joined).toMatch(/rec_mail_outbox/);
    expect(joined).not.toMatch(
      /CREATE TABLE IF NOT EXISTS public\.rec_interview_evaluation\b/,
    );
    expect(joined).not.toMatch(/Controller\('rec'\)/);
  });
});
