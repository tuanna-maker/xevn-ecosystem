/**
 * D-BE-HRM-REC-JOB-GRADE-ASSERT-01 — AC-SET-CONSUMER-JG-REC-01
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  HRM_REC_GRADE_KEY,
  RecruitmentService,
} from './recruitment.service';

const JD_TEMPLATE_ID = 'c2f1a5d6-9b4e-4c07-8a31-5f6d2e7b4a10';
const REQ_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const GRADE_CODE = 'ngach_a1';

function schemaNoop(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    s.includes('DO $$')
  );
}

describe('PO-HRM-JOB-GRADES-CONSUMER-REC-BE-01', () => {
  const settingsCatalogs = {
    assertCodeInEffectiveCatalog: jest.fn(),
  } as unknown as jest.Mocked<SettingsCatalogsService>;

  const bridge = {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    settingsCatalogs.assertCodeInEffectiveCatalog.mockImplementation(async ({ code }) => ({
      code,
      label: 'Ngạch A1',
      status: 'active',
      origin: 'xbos' as const,
    }));
  });

  it('create persists job_grade_key when catalog assert passes', async () => {
    let insertParams: unknown[] | undefined;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('FROM public.job_description_templates') && s.includes('LIMIT 1')) {
          return {
            rows: [
              {
                id: JD_TEMPLATE_ID,
                code: 'JD-01',
                title: 'JD',
                job_description: null,
                requirements: null,
                is_active: true,
                position_code: 'POS',
                position_name: 'Pos',
              },
            ],
          };
        }
        if (s.includes('INSERT INTO public.job_requisitions')) {
          insertParams = params;
          return {
            rows: [
              {
                id: REQ_ID,
                company_id: 'holding',
                title: 'T',
                department: 'D',
                employment_type: 'full_time',
                headcount: 1,
                status: 'draft',
                job_description: null,
                requirements: null,
                job_template_id: JD_TEMPLATE_ID,
                headcount_mode: null,
                headcount_cell_id: null,
                target_month: null,
                hire_reason: null,
                replace_employee_id: null,
                out_of_plan_reason: null,
                approval_matrix_key: null,
                pipeline_flags_json: {},
                job_grade_key: GRADE_CODE,
                created_at: '2026-08-11',
                updated_at: '2026-08-11',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as jest.Mocked<HrmDbService>;

    const service = new RecruitmentService(db, bridge as never, undefined, undefined, settingsCatalogs);

    await service.createJobRequisition({
      company_id: 'main',
      title: 'YCTD test',
      department: 'HR',
      employment_type: 'full_time',
      headcount: 1,
      job_template_id: JD_TEMPLATE_ID,
      job_grade_key: GRADE_CODE,
    });

    expect(settingsCatalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'job_grades',
        code: GRADE_CODE,
        errorCode: HRM_REC_GRADE_KEY,
        companyId: 'holding',
      }),
    );
    expect(insertParams?.[15]).toBe(GRADE_CODE);
  });

  it('create rejects unknown job_grade_key when EFF>0', async () => {
    settingsCatalogs.assertCodeInEffectiveCatalog.mockRejectedValue(
      new ApiException(HRM_REC_GRADE_KEY, 'not in catalog', HttpStatus.BAD_REQUEST),
    );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('FROM public.job_description_templates')) {
          return {
            rows: [
              {
                id: JD_TEMPLATE_ID,
                code: 'JD-01',
                title: 'JD',
                job_description: null,
                requirements: null,
                is_active: true,
                position_code: 'POS',
                position_name: 'Pos',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as jest.Mocked<HrmDbService>;

    const service = new RecruitmentService(db, bridge as never, undefined, undefined, settingsCatalogs);

    await expect(
      service.createJobRequisition({
        company_id: 'holding',
        title: 'YCTD',
        department: 'HR',
        employment_type: 'full_time',
        headcount: 1,
        job_template_id: JD_TEMPLATE_ID,
        job_grade_key: 'bogus_grade',
      }),
    ).rejects.toMatchObject({ code: HRM_REC_GRADE_KEY });
  });

  it('update PATCH job_grade_key persists after assert', async () => {
    let updateSql = '';
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1')) {
          return {
            rows: [
              {
                company_id: 'holding',
                status: 'draft',
                workflow_instance_id: null,
                job_template_id: JD_TEMPLATE_ID,
                job_description: null,
                requirements: null,
                headcount: 1,
                headcount_mode: null,
                headcount_cell_id: null,
                hire_reason: null,
                replace_employee_id: null,
                out_of_plan_reason: null,
              },
            ],
          };
        }
        if (s.includes('UPDATE public.job_requisitions') && s.includes('job_grade_key')) {
          updateSql = s;
          return {
            rows: [
              {
                id: REQ_ID,
                company_id: 'holding',
                title: 'T',
                department: 'D',
                employment_type: 'full_time',
                headcount: 1,
                status: 'draft',
                job_description: null,
                requirements: null,
                job_template_id: JD_TEMPLATE_ID,
                workflow_instance_id: null,
                headcount_mode: null,
                headcount_cell_id: null,
                target_month: null,
                hire_reason: null,
                replace_employee_id: null,
                out_of_plan_reason: null,
                approval_matrix_key: null,
                pipeline_flags_json: {},
                job_grade_key: GRADE_CODE,
                created_at: '2026-08-11',
                updated_at: '2026-08-11',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as jest.Mocked<HrmDbService>;

    const service = new RecruitmentService(db, bridge as never, undefined, undefined, settingsCatalogs);

    const row = await service.updateJobRequisition(
      REQ_ID,
      { job_grade_key: GRADE_CODE },
      { company_id: 'holding' },
    );

    expect(settingsCatalogs.assertCodeInEffectiveCatalog).toHaveBeenCalled();
    expect(updateSql).toContain('job_grade_key');
    expect(row.job_grade_key).toBe(GRADE_CODE);
  });
});
