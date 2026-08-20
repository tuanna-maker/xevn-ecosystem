/**
 * PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01 — UC-BP-REC-06a residual BE
 * one-active · no_show TERMINAL · R-A · PAST/CANCEL CFG · soft-gate ≠ 409
 */
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentService } from './recruitment.service';

const FUTURE_AT = '2099-09-15T10:00:00.000Z';
const FUTURE_AT_2 = '2099-09-16T11:00:00.000Z';
const PAST_AT = '2020-01-01T09:00:00.000Z';
const IV_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const CAND_ID = '0e3f95b7-cf1b-469f-a0f8-4c91f3f35f80';

describe('PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01 interview residual', () => {
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

  it('ensureSchema CHECK includes no_show + ADD cancel_reason', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    // trigger ensureSchema via schedule path (candidate miss after DDL)
    await expect(
      service.scheduleInterview({
        company_id: 'holding',
        candidate_id: CAND_ID,
        scheduled_at: FUTURE_AT,
        interviewer: 'HR Lead',
      }),
    ).rejects.toMatchObject({ code: 'HRM-REC-405' });
    const joined = sqlLog.join('\n');
    expect(joined).toMatch(/no_show/);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS cancel_reason/i);
    expect(joined).toMatch(/uniq_recruitment_interviews_active_candidate/);
  });

  it('RETAIN one-active 409 when ACTIVE exists', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates WHERE') &&
        sql.includes('LIMIT 1')
      ) {
        return {
          rows: [{ id: CAND_ID, company_id: 'holding', status: 'interview' }],
        } as never;
      }
      if (sql.includes('hrm_company_settings')) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('FROM public.recruitment_interviews') &&
        sql.includes("status IN ('scheduled', 'confirmed')")
      ) {
        return {
          rows: [
            { id: 'active-1', status: 'scheduled', scheduled_at: FUTURE_AT },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.scheduleInterview({
        company_id: 'holding',
        candidate_id: CAND_ID,
        scheduled_at: FUTURE_AT_2,
        interviewer: 'HR Lead',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-IV-409-ACTIVE' });
  });

  it('no_show TERMINAL unlocks create (ACTIVE filter empty)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates WHERE') &&
        sql.includes('LIMIT 1')
      ) {
        return {
          rows: [{ id: CAND_ID, company_id: 'holding', status: 'interview' }],
        } as never;
      }
      if (sql.includes('hrm_company_settings')) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('FROM public.recruitment_interviews') &&
        sql.includes("status IN ('scheduled', 'confirmed')")
      ) {
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.recruitment_interviews')) {
        return {
          rows: [
            {
              id: 'iv-round-2',
              company_id: 'holding',
              candidate_id: CAND_ID,
              scheduled_at: FUTURE_AT_2,
              interviewer: 'HR Lead',
              status: 'scheduled',
              cancel_reason: null,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const created = await service.scheduleInterview({
      company_id: 'holding',
      candidate_id: CAND_ID,
      scheduled_at: FUTURE_AT_2,
      interviewer: 'HR Lead',
    });
    expect(created.id).toBe('iv-round-2');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("status IN ('scheduled', 'confirmed')"),
      expect.arrayContaining(['holding', CAND_ID]),
    );
  });

  it('status → no_show succeeds from scheduled', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_interviews WHERE id')) {
        return {
          rows: [
            {
              company_id: 'holding',
              candidate_id: CAND_ID,
              status: 'scheduled',
            },
          ],
        } as never;
      }
      if (sql.includes('UPDATE public.recruitment_interviews')) {
        return {
          rows: [
            {
              id: IV_ID,
              company_id: 'holding',
              candidate_id: CAND_ID,
              scheduled_at: FUTURE_AT,
              interviewer: 'HR Lead',
              status: 'no_show',
              cancel_reason: null,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const updated = await service.updateInterviewStatus(
      IV_ID,
      { status: 'no_show' },
      'holding',
    );
    expect(updated.status).toBe('no_show');
  });

  it('INVALID-TRANSITION when status update on TERMINAL', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_interviews WHERE id')) {
        return {
          rows: [
            {
              company_id: 'holding',
              candidate_id: CAND_ID,
              status: 'cancelled',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.updateInterviewStatus(IV_ID, { status: 'completed' }, 'holding'),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-REC-IV-400-INVALID-TRANSITION',
    });
  });

  it('CANCEL-REASON when CFG required and reason empty', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_interviews WHERE id')) {
        return {
          rows: [
            {
              company_id: 'holding',
              candidate_id: CAND_ID,
              status: 'scheduled',
            },
          ],
        } as never;
      }
      if (sql.includes('FROM public.hrm_company_settings')) {
        return { rows: [{ value_json: { value: true } }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.updateInterviewStatus(IV_ID, { status: 'cancelled' }, 'holding'),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-REC-IV-400-CANCEL-REASON',
    });
  });

  it('cancel without reason OK when CFG unset (default optional)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_interviews WHERE id')) {
        return {
          rows: [
            {
              company_id: 'holding',
              candidate_id: CAND_ID,
              status: 'confirmed',
            },
          ],
        } as never;
      }
      if (sql.includes('hrm_company_settings')) {
        return { rows: [] } as never;
      }
      if (sql.includes('UPDATE public.recruitment_interviews')) {
        return {
          rows: [
            {
              id: IV_ID,
              company_id: 'holding',
              candidate_id: CAND_ID,
              scheduled_at: FUTURE_AT,
              interviewer: 'HR Lead',
              status: 'cancelled',
              cancel_reason: null,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const updated = await service.updateInterviewStatus(
      IV_ID,
      { status: 'cancelled' },
      'holding',
    );
    expect(updated.status).toBe('cancelled');
  });

  it('PAST-DATETIME on create when CFG default BLOCK', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates WHERE') &&
        sql.includes('LIMIT 1')
      ) {
        return {
          rows: [{ id: CAND_ID, company_id: 'holding', status: 'interview' }],
        } as never;
      }
      if (sql.includes('hrm_company_settings')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.scheduleInterview({
        company_id: 'holding',
        candidate_id: CAND_ID,
        scheduled_at: PAST_AT,
        interviewer: 'HR Lead',
      }),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-REC-IV-400-PAST-DATETIME',
    });
  });

  it('allows past create when CFG allow_past_interview_schedule=true', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates WHERE') &&
        sql.includes('LIMIT 1')
      ) {
        return {
          rows: [{ id: CAND_ID, company_id: 'holding', status: 'interview' }],
        } as never;
      }
      if (sql.includes('FROM public.hrm_company_settings')) {
        return { rows: [{ value_json: true }] } as never;
      }
      if (
        sql.includes('FROM public.recruitment_interviews') &&
        sql.includes("status IN ('scheduled', 'confirmed')")
      ) {
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.recruitment_interviews')) {
        return {
          rows: [
            {
              id: 'iv-past-ok',
              company_id: 'holding',
              candidate_id: CAND_ID,
              scheduled_at: PAST_AT,
              interviewer: 'HR Lead',
              status: 'scheduled',
              cancel_reason: null,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const created = await service.scheduleInterview({
      company_id: 'holding',
      candidate_id: CAND_ID,
      scheduled_at: PAST_AT,
      interviewer: 'HR Lead',
    });
    expect(created.id).toBe('iv-past-ok');
  });

  it('R-A reschedule updates same id on ACTIVE', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_interviews WHERE id')) {
        return {
          rows: [
            {
              company_id: 'holding',
              status: 'scheduled',
              interviewer: 'HR Lead',
            },
          ],
        } as never;
      }
      if (sql.includes('hrm_company_settings')) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('UPDATE public.recruitment_interviews') &&
        sql.includes('scheduled_at')
      ) {
        return {
          rows: [
            {
              id: IV_ID,
              company_id: 'holding',
              candidate_id: CAND_ID,
              scheduled_at: FUTURE_AT_2,
              interviewer: 'HR Lead 2',
              status: 'scheduled',
              cancel_reason: null,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const updated = await service.rescheduleInterview(
      IV_ID,
      { scheduled_at: FUTURE_AT_2, interviewer: 'HR Lead 2' },
      'holding',
    );
    expect(updated.id).toBe(IV_ID);
    expect(updated.scheduled_at).toBe(FUTURE_AT_2);
    expect(updated.status).toBe('scheduled');
  });

  it('R-A on TERMINAL → INVALID-TRANSITION (no silent revive)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_interviews WHERE id')) {
        return {
          rows: [
            {
              company_id: 'holding',
              status: 'no_show',
              interviewer: 'HR Lead',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.rescheduleInterview(
        IV_ID,
        { scheduled_at: FUTURE_AT_2 },
        'holding',
      ),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-REC-IV-400-INVALID-TRANSITION',
    });
  });
});
