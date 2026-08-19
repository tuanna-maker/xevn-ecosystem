/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01
 * VAL-REC-CNS-02 create/update pool stage ∈ EFF · VAL-REC-CNS-05 IV soft-gate
 * RETAIN VAL-REC-CNS-01 covered by rec-pipeline-stage.app02-wire.spec.ts
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';
import { HRM_REC_IV_STAGE_DISALLOW, HRM_REC_STAGE_UNKNOWN } from './rec-pipeline-stage.constants';
import { RecPipelineStageService } from './rec-pipeline-stage.service';

const CAND_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const SPINE_CAND_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

describe('VAL-REC-CNS-02 createCandidatePool invent (CNS-BE-01)', () => {
  it('rejects invent stage when EFF >0 → HRM-REC-STAGE-UNKNOWN', async () => {
    const assertStageInEffectiveCatalog = jest
      .fn()
      .mockRejectedValue(
        new ApiException(HRM_REC_STAGE_UNKNOWN, 'not in catalog', HttpStatus.BAD_REQUEST),
      );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertStageInEffectiveCatalog } as never,
    );

    await expect(
      catalog.createCandidatePool(
        {
          company_id: 'holding',
          full_name: 'Nguyễn Văn A',
          stage: 'ghost_stage_xyz',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_REC_STAGE_UNKNOWN });
    expect(assertStageInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ stageKey: 'ghost_stage_xyz' }),
    );
  });

  it('empty EFF soft-allows create with starter stage (U65)', async () => {
    const assertStageInEffectiveCatalog = jest.fn().mockResolvedValue(null);
    const inserted = {
      id: CAND_ID,
      company_id: 'holding',
      full_name: 'Nguyễn Văn B',
      stage: 'applied',
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.candidates')) {
          return { rows: [inserted] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertStageInEffectiveCatalog } as never,
    );

    const row = await catalog.createCandidatePool(
      {
        company_id: 'holding',
        full_name: 'Nguyễn Văn B',
        stage: 'applied',
      },
      groupCeoToken(),
    );
    expect(row.stage).toBe('applied');
    expect(assertStageInEffectiveCatalog).toHaveBeenCalled();
  });

  it('updateCandidatePool rejects invent stage when EFF >0', async () => {
    const assertStageInEffectiveCatalog = jest
      .fn()
      .mockRejectedValue(
        new ApiException(HRM_REC_STAGE_UNKNOWN, 'not in catalog', HttpStatus.BAD_REQUEST),
      );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.candidates WHERE id')) {
          return {
            rows: [
              {
                company_id: 'holding',
                stage: 'applied',
                workflow_instance_id: null,
                employee_id: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      assertNotLockedOrThrow: jest.fn(),
    };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertStageInEffectiveCatalog } as never,
    );

    await expect(
      catalog.updateCandidatePool(
        CAND_ID,
        'holding',
        { stage: 'not_in_eff_catalog' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_REC_STAGE_UNKNOWN });
  });
});

describe('VAL-REC-CNS-05 IV soft-gate (CNS-BE-01)', () => {
  it('assertInterviewScheduleAllowed → HRM-REC-IV-400-STAGE-DISALLOW when flag false', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.rec_pipeline_stage') && s.includes('archived_at IS NULL')) {
          return {
            rows: [
              {
                id: 'stg-1',
                company_id: 'holding',
                stage_key: 'screening',
                name_vi: 'Sàng lọc',
                sort_order: 10,
                is_terminal: false,
                is_hired_outcome: false,
                is_reject_outcome: false,
                allows_interview_schedule: false,
                wf_task_type_key: null,
                color_token: null,
                metadata_json: null,
                status: 'active',
                archived_at: null,
                created_at: '2026-08-08T00:00:00.000Z',
                updated_at: '2026-08-08T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const svc = new RecPipelineStageService(db);
    await expect(
      svc.assertInterviewScheduleAllowed({
        companyId: 'holding',
        stageKey: 'screening',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_REC_IV_STAGE_DISALLOW });
  });

  it('scheduleInterview blocks when stage disallows (≠ one-active 409)', async () => {
    const assertInterviewScheduleAllowed = jest
      .fn()
      .mockRejectedValue(
        new ApiException(
          HRM_REC_IV_STAGE_DISALLOW,
          'stage does not allow interview schedule',
          HttpStatus.BAD_REQUEST,
        ),
      );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.recruitment_candidates WHERE')) {
          return {
            rows: [{ id: SPINE_CAND_ID, company_id: 'holding', status: 'screening' }],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const service = new RecruitmentService(
      db,
      bridge as never,
      { assertInterviewScheduleAllowed } as never,
    );

    await expect(
      service.scheduleInterview(
        {
          company_id: 'holding',
          candidate_id: SPINE_CAND_ID,
          scheduled_at: '2099-08-08T09:00:00.000Z',
          interviewer: 'HR Lead',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_REC_IV_STAGE_DISALLOW });
    expect(assertInterviewScheduleAllowed).toHaveBeenCalled();
  });

  it('createInterview catalog soft-gates on pool candidate.stage', async () => {
    const assertInterviewScheduleAllowed = jest
      .fn()
      .mockRejectedValue(
        new ApiException(
          HRM_REC_IV_STAGE_DISALLOW,
          'stage does not allow interview schedule',
          HttpStatus.BAD_REQUEST,
        ),
      );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.candidates WHERE id')) {
          return { rows: [{ stage: 'offer', company_id: 'holding' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertInterviewScheduleAllowed } as never,
    );

    await expect(
      catalog.createInterview(
        {
          company_id: 'holding',
          candidate_id: CAND_ID,
          candidate_name: 'Test',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_REC_IV_STAGE_DISALLOW });
  });

  it('RETAIN one-active: schedule still 409 when active exists and stage allows', async () => {
    const assertInterviewScheduleAllowed = jest.fn().mockResolvedValue({
      stageKey: 'interview',
      allowsInterviewSchedule: true,
    });

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.recruitment_candidates WHERE')) {
          return {
            rows: [{ id: SPINE_CAND_ID, company_id: 'holding', status: 'interview' }],
          };
        }
        if (
          s.includes('FROM public.recruitment_interviews') &&
          s.includes("AND status IN ('scheduled', 'confirmed')")
        ) {
          return { rows: [{ id: 'active-1' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const service = new RecruitmentService(
      db,
      bridge as never,
      { assertInterviewScheduleAllowed } as never,
    );

    await expect(
      service.scheduleInterview({
        company_id: 'holding',
        candidate_id: SPINE_CAND_ID,
        scheduled_at: '2099-08-08T10:00:00.000Z',
        interviewer: 'HR Lead',
      }),
    ).rejects.toMatchObject({ code: 'HRM-REC-IV-409-ACTIVE' });
  });
});

describe('VAL-REC-CNS-01 RETAIN APP-02 (pointer)', () => {
  it('updateCandidateApplicationStage still asserts invent → UNKNOWN', async () => {
    const assertStageInEffectiveCatalog = jest
      .fn()
      .mockRejectedValue(
        new ApiException(HRM_REC_STAGE_UNKNOWN, 'not in catalog', HttpStatus.BAD_REQUEST),
      );
    const APP_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.candidate_applications ca')) {
          return {
            rows: [
              {
                id: APP_ID,
                candidate_id: CAND_ID,
                company_id: 'holding',
                cand_employee_id: null,
                cand_company_id: 'holding',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertStageInEffectiveCatalog } as never,
    );

    await expect(
      catalog.updateCandidateApplicationStage(APP_ID, 'holding', 'ghost', groupCeoToken()),
    ).rejects.toMatchObject({ code: HRM_REC_STAGE_UNKNOWN });
  });
});
