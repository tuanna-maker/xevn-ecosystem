/**
 * PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01 — YCTD Option A Wave-2.
 * Spot: Y-S2..S13 · O2 CELL-QTY · O4 MODE-UNCLASSIFIED · scope_parity · spawn UQ RETAIN.
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentService } from './recruitment.service';
import {
  HRM_YCTD_BOD_REQUIRED,
  HRM_YCTD_CELL_QTY,
  HRM_YCTD_MODE_REQUIRED,
  HRM_YCTD_MODE_UNCLASSIFIED,
  HRM_YCTD_NOT_RECEIVABLE,
  HRM_YCTD_OUT_REASON,
  HRM_YCTD_SPAWN_DUP,
  HRM_YCTD_VAL_400,
  YCTD_MATRIX_LONG_BOD,
  YCTD_MATRIX_SHORT,
  assertCellQtyOrThrow,
  assertYctdReceivableForMutateOrThrow,
  inferLegacyYctdHeadcountModeBackfill,
  isLegacyUnclassifiedMode,
  normalizeTargetMonthOrThrow,
  requireModeOrThrow,
  resolveApprovalMatrixKey,
  YCTD_LEGACY_BACKFILL_OUT_REASON_VI,
} from './yctd-requisition-gates';

const REQ_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee0001';
const CELL_ID = '11111111-2222-4333-8444-555555555555';
const PLAN_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const JD_ID = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
const EMP_ID = 'cccccccc-dddd-4eee-8fff-aaaaaaaaaaaa';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function schemaOk(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    s.includes('DO $$')
  );
}

function codeOf(err: unknown): string {
  if (err instanceof ApiException) {
    const body = err.getResponse() as { code?: string };
    return String(body?.code ?? '');
  }
  return '';
}

describe('yctd-requisition-gates helpers (Y-S*)', () => {
  it('Y-S2: requireModeOrThrow missing → MODE-REQUIRED', () => {
    expect(() => requireModeOrThrow(null)).toThrow(ApiException);
    try {
      requireModeOrThrow('');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_MODE_REQUIRED);
    }
  });

  it('Y-S4/O2: assertCellQtyOrThrow → CELL-QTY', () => {
    try {
      assertCellQtyOrThrow(5, 2);
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_CELL_QTY);
    }
  });

  it('Y-S8: matrix SHORT in_plan / LONG out_of_plan', () => {
    expect(resolveApprovalMatrixKey('in_plan')).toBe(YCTD_MATRIX_SHORT);
    expect(resolveApprovalMatrixKey('out_of_plan')).toBe(YCTD_MATRIX_LONG_BOD);
  });

  it('O4 DATA-01: infer legacy headcount_mode backfill', () => {
    expect(
      inferLegacyYctdHeadcountModeBackfill({
        headcount_mode: null,
        headcount_cell_id: CELL_ID,
      }),
    ).toEqual({
      headcount_mode: 'in_plan',
      hire_reason: 'new',
      approval_matrix_key: YCTD_MATRIX_SHORT,
    });
    expect(
      inferLegacyYctdHeadcountModeBackfill({
        headcount_mode: '',
        headcount_cell_id: null,
      }),
    ).toEqual({
      headcount_mode: 'out_of_plan',
      hire_reason: 'new',
      approval_matrix_key: YCTD_MATRIX_LONG_BOD,
      out_of_plan_reason: YCTD_LEGACY_BACKFILL_OUT_REASON_VI,
    });
    expect(
      inferLegacyYctdHeadcountModeBackfill({
        headcount_mode: 'in_plan',
        headcount_cell_id: null,
      }),
    ).toBeNull();
    expect(isLegacyUnclassifiedMode('in_plan')).toBe(false);
  });

  it('Y-S9/O4: unclassified + approved out_of_plan gates', () => {
    try {
      assertYctdReceivableForMutateOrThrow({
        status: 'open',
        headcount_mode: null,
      });
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_MODE_UNCLASSIFIED);
    }
    try {
      assertYctdReceivableForMutateOrThrow({
        status: 'approved',
        headcount_mode: 'out_of_plan',
      });
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_BOD_REQUIRED);
    }
    try {
      assertYctdReceivableForMutateOrThrow({
        status: 'pending_approval',
        headcount_mode: 'in_plan',
      });
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_NOT_RECEIVABLE);
    }
    expect(() =>
      assertYctdReceivableForMutateOrThrow({
        status: 'open_for_hire',
        headcount_mode: 'in_plan',
      }),
    ).not.toThrow();
  });
});

describe('PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01 service', () => {
  it('ensureSchema ADD Wave-2 cols + open_for_hire via bridge', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    };
    const bridge = {
      ensureSchema: jest.fn().mockImplementation(async () => {
        sqls.push(
          `ADD CONSTRAINT chk_job_requisitions_status CHECK (status IN ('open_for_hire'))`,
        );
      }),
    };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    await (
      svc as unknown as { ensureSchema: () => Promise<void> }
    ).ensureSchema();
    const joined = sqls.join('\n');
    expect(joined).toMatch(/hire_reason/);
    expect(joined).toMatch(/replace_employee_id/);
    expect(joined).toMatch(/out_of_plan_reason/);
    expect(joined).toMatch(/approval_matrix_key/);
    expect(joined).toMatch(/pipeline_flags_json/);
    expect(joined).toMatch(/open_for_hire/);
    expect(joined).toMatch(/uq_job_requisitions_spawn_cell/);
  });

  it('Y-S7: create → status draft (cấm open)', async () => {
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('FROM public.job_description_templates')) {
            return {
              rows: [
                {
                  id: JD_ID,
                  code: 'JD-01',
                  title: 'NV',
                  job_description: 'desc',
                  requirements: 'req',
                  is_active: true,
                  position_code: 'staff',
                  position_name: 'Nhân viên',
                },
              ],
            };
          }
          if (s.includes('INSERT INTO public.job_requisitions')) {
            expect(s).toMatch(/'draft'/);
            expect(s).not.toMatch(/'open'/);
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'draft',
                  job_description: 'desc',
                  requirements: 'req',
                  job_template_id: JD_ID,
                  headcount_mode: null,
                  pipeline_flags_json: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const created = await svc.createJobRequisition(
      {
        company_id: 'main',
        title: 'YCTD',
        department: 'HCNS',
        employment_type: 'full-time',
        headcount: 1,
        job_template_id: JD_ID,
      },
      groupCeoToken(),
    );
    expect(created.status).toBe('draft');
  });

  it('O2: in_plan qty vượt ô → HRM-YCTD-CELL-QTY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.job_description_templates')) {
          return {
            rows: [
              {
                id: JD_ID,
                code: 'JD-01',
                title: 'NV',
                job_description: 'd',
                requirements: 'r',
                is_active: true,
                position_code: 'staff',
                position_name: 'NV',
              },
            ],
          };
        }
        if (s.includes('FROM public.recruitment_plan_positions')) {
          return {
            rows: [
              {
                plan_id: PLAN_ID,
                plan_status: 'approved',
                company_id: 'holding',
                months_data: [
                  {
                    cell_id: CELL_ID,
                    month: 1,
                    cell_status: 'need_hire',
                    lifecycle_status: 'need_hire_approved',
                    headcount_need_hire: 2,
                    headcount_current: 1,
                    headcount_projected: null,
                  },
                ],
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.createJobRequisition(
        {
          company_id: 'main',
          title: 'YCTD',
          department: 'HCNS',
          employment_type: 'full-time',
          headcount: 9,
          headcount_mode: 'in_plan',
          headcount_cell_id: CELL_ID,
          hire_reason: 'new',
          job_template_id: JD_ID,
        },
        groupCeoToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_CELL_QTY);
    }
  });

  it('Y-S5: submit out_of_plan thiếu reason → OUT-REASON', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (
          s.includes('FROM public.job_requisitions r') &&
          s.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: REQ_ID,
                company_id: 'holding',
                title: 'YCTD',
                department: 'HCNS',
                employment_type: 'full-time',
                headcount: 1,
                status: 'draft',
                job_description: null,
                requirements: null,
                job_template_id: JD_ID,
                headcount_mode: 'out_of_plan',
                hire_reason: 'new',
                out_of_plan_reason: null,
                pipeline_flags_json: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      startRecruitmentWorkflowIfConfigured: jest.fn(),
    };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.submitJobRequisitionForApproval(
        REQ_ID,
        { company_id: 'main' },
        groupCeoToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_OUT_REASON);
    }
    expect(bridge.startRecruitmentWorkflowIfConfigured).not.toHaveBeenCalled();
  });

  it('Y-S8/S10: submit in_plan snapshots SHORT + conditions', async () => {
    let updatedMatrix: string | null = null;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (
            s.includes('FROM public.job_requisitions r') &&
            s.includes('LIMIT 1')
          ) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'draft',
                  job_description: null,
                  requirements: null,
                  job_template_id: JD_ID,
                  headcount_mode: 'in_plan',
                  headcount_cell_id: CELL_ID,
                  hire_reason: 'new',
                  out_of_plan_reason: null,
                  pipeline_flags_json: {},
                  jd_code: 'JD-01',
                  jd_title: 'NV',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          if (s.includes('FROM public.recruitment_plan_positions')) {
            return {
              rows: [
                {
                  plan_id: PLAN_ID,
                  plan_status: 'approved',
                  company_id: 'holding',
                  months_data: [
                    {
                      cell_id: CELL_ID,
                      month: 1,
                      cell_status: 'need_hire',
                      lifecycle_status: 'need_hire_approved',
                      headcount_need_hire: 2,
                      headcount_current: 1,
                      headcount_projected: null,
                    },
                  ],
                },
              ],
            };
          }
          if (
            s.includes('SELECT id::text AS id FROM public.job_requisitions')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('UPDATE public.job_requisitions') &&
            s.includes('approval_matrix_key')
          ) {
            updatedMatrix = String(params?.[6] ?? '');
            return { rows: [] };
          }
          return { rows: [] };
        }),
    };
    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue({
        workflowInstanceId: '11111111-1111-4111-8111-111111111111',
      }),
    };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const res = await svc.submitJobRequisitionForApproval(
      REQ_ID,
      { company_id: 'main' },
      groupCeoToken(),
      undefined,
      { submitterUserId: 'ceo@xe.vn', tenantId: 'xevn', companySlug: 'main' },
    );
    expect(updatedMatrix).toBe(YCTD_MATRIX_SHORT);
    expect(bridge.startRecruitmentWorkflowIfConfigured).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: { headcount_mode: 'in_plan', hire_reason: 'new' },
        approvalMatrixKey: YCTD_MATRIX_SHORT,
      }),
    );
    expect(res.approval_matrix_key).toBe(YCTD_MATRIX_SHORT);
  });

  it('Y-S9: transitions out_of_plan without BOD → approved; flags blocked', async () => {
    const state = {
      status: 'pending_approval',
      mode: 'out_of_plan',
      flags: {
        posted: false,
        has_cv: false,
        interview_started: false,
        cv_intake_allowed: false,
      },
    };
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (
            s.includes('FROM public.job_requisitions WHERE id') &&
            s.includes('headcount_mode')
          ) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  status: state.status,
                  headcount_mode: state.mode,
                  hire_reason: 'new',
                  out_of_plan_reason: 'vượt ĐB',
                  pipeline_flags_json: state.flags,
                  workflow_instance_id: null,
                },
              ],
            };
          }
          if (
            s.includes('UPDATE public.job_requisitions') &&
            s.includes('pipeline_flags_json')
          ) {
            if (s.includes('status = $1') || s.includes('SET status = $1')) {
              state.status = String(params?.[0]);
              state.flags = JSON.parse(String(params?.[2] ?? '{}'));
            } else {
              state.flags = JSON.parse(String(params?.[0] ?? '{}'));
            }
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: state.status,
                  job_description: null,
                  requirements: null,
                  job_template_id: JD_ID,
                  headcount_mode: state.mode,
                  out_of_plan_reason: 'vượt ĐB',
                  hire_reason: 'new',
                  pipeline_flags_json: state.flags,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const approved = await svc.transitionJobRequisition(
      REQ_ID,
      { action: 'approve' },
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(approved.status).toBe('approved');

    try {
      await svc.patchRequisitionPipelineFlags(
        REQ_ID,
        { posted: true },
        { company_id: 'main' },
        groupCeoToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_BOD_REQUIRED);
    }

    const receivable = await svc.transitionJobRequisition(
      REQ_ID,
      { action: 'approve', bod_complete: true },
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(receivable.status).toBe('open_for_hire');
  });

  it('R-REC-02-ALT-01: reject pending → rejected + rejected_reason; bind $1/$2 only (no unused actorId)', async () => {
    const rejectReason = 'Không đủ ngân sách quý 3';
    let updateSql = '';
    let updateParams: unknown[] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (
            s.includes('FROM public.job_requisitions WHERE id') &&
            s.includes('headcount_mode')
          ) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  status: 'pending_approval',
                  headcount_mode: 'out_of_plan',
                  hire_reason: 'new',
                  out_of_plan_reason: 'vượt ĐB',
                  pipeline_flags_json: { cv_intake_allowed: false },
                  workflow_instance_id: null,
                },
              ],
            };
          }
          if (
            s.includes('UPDATE public.job_requisitions') &&
            s.includes("status = 'rejected'")
          ) {
            updateSql = s;
            updateParams = params ?? [];
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'rejected',
                  job_description: null,
                  requirements: null,
                  job_template_id: JD_ID,
                  headcount_mode: 'out_of_plan',
                  hire_reason: 'new',
                  out_of_plan_reason: 'vượt ĐB',
                  pipeline_flags_json: { cv_intake_allowed: false },
                  rejected_reason: String(params?.[0] ?? ''),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const rejected = await svc.transitionJobRequisition(
      REQ_ID,
      { action: 'reject', rejected_reason: rejectReason },
      { company_id: 'main' },
      groupCeoToken(),
      undefined,
      { actorId: 'ceo@xe.vn' },
    );
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejected_reason).toBe(rejectReason);
    expect(updateSql).toContain('rejected_reason = $1');
    expect(updateSql).toContain('id = $2::uuid');
    expect(updateSql).not.toContain('id = $3::uuid');
    // $1=reason, $2=id, $3+=company scope — actorId must NOT occupy a hole
    expect(updateParams[0]).toBe(rejectReason);
    expect(updateParams[1]).toBe(REQ_ID);
    expect(updateParams).not.toContain('ceo@xe.vn');
  });

  it('must_keep SHORT: in_plan approve → open_for_hire + approved_by $2', async () => {
    let updateParams: unknown[] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (
            s.includes('FROM public.job_requisitions WHERE id') &&
            s.includes('headcount_mode')
          ) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  status: 'pending_approval',
                  headcount_mode: 'in_plan',
                  hire_reason: 'new',
                  pipeline_flags_json: { cv_intake_allowed: false },
                  workflow_instance_id: null,
                },
              ],
            };
          }
          if (
            s.includes('UPDATE public.job_requisitions') &&
            s.includes('SET status = $1')
          ) {
            updateParams = params ?? [];
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: String(params?.[0]),
                  job_description: null,
                  requirements: null,
                  job_template_id: JD_ID,
                  headcount_mode: 'in_plan',
                  hire_reason: 'new',
                  pipeline_flags_json: JSON.parse(String(params?.[2] ?? '{}')),
                  approved_by: params?.[1] ?? null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const open = await svc.transitionJobRequisition(
      REQ_ID,
      { action: 'approve' },
      { company_id: 'main' },
      groupCeoToken(),
      undefined,
      { actorId: 'ceo@xe.vn' },
    );
    expect(open.status).toBe('open_for_hire');
    expect(updateParams[0]).toBe('open_for_hire');
    expect(updateParams[1]).toBe('ceo@xe.vn');
    expect(JSON.parse(String(updateParams[2])).cv_intake_allowed).toBe(true);
  });

  it('O4: pipeline flags on unclassified → MODE-UNCLASSIFIED', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.job_requisitions WHERE id')) {
          return {
            rows: [
              {
                id: REQ_ID,
                company_id: 'holding',
                status: 'open',
                headcount_mode: null,
                pipeline_flags_json: {},
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.patchRequisitionPipelineFlags(
        REQ_ID,
        { cv_intake_allowed: true },
        { company_id: 'main' },
        groupCeoToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_MODE_UNCLASSIFIED);
    }
  });

  it('Y-S11: spawn UQ on manual create → SPAWN-DUP', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.job_description_templates')) {
          return {
            rows: [
              {
                id: JD_ID,
                code: 'JD-01',
                title: 'NV',
                job_description: 'd',
                requirements: 'r',
                is_active: true,
                position_code: 'staff',
                position_name: 'NV',
              },
            ],
          };
        }
        if (s.includes('FROM public.recruitment_plan_positions')) {
          return {
            rows: [
              {
                plan_id: PLAN_ID,
                plan_status: 'approved',
                company_id: 'holding',
                months_data: [
                  {
                    cell_id: CELL_ID,
                    month: 1,
                    cell_status: 'need_hire',
                    lifecycle_status: 'need_hire_approved',
                    headcount_need_hire: 2,
                    headcount_current: 1,
                    headcount_projected: null,
                  },
                ],
              },
            ],
          };
        }
        if (s.includes('SELECT id::text AS id FROM public.job_requisitions')) {
          return { rows: [{ id: 'existing-req' }] };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.createJobRequisition(
        {
          company_id: 'main',
          title: 'YCTD',
          department: 'HCNS',
          employment_type: 'full-time',
          headcount: 1,
          headcount_mode: 'in_plan',
          headcount_cell_id: CELL_ID,
          hire_reason: 'new',
          job_template_id: JD_ID,
        },
        groupCeoToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_SPAWN_DUP);
    }
  });

  it('U19 scope_parity: list company filter matches get/transitions/flags', async () => {
    const seen: string[] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('company_id')) seen.push(s);
          if (s.includes('COUNT(*)')) return { rows: [{ total: '1' }] };
          if (
            s.includes('FROM public.job_requisitions r') &&
            s.includes('ORDER BY')
          ) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'open_for_hire',
                  job_description: null,
                  requirements: null,
                  job_template_id: JD_ID,
                  headcount_mode: 'in_plan',
                  pipeline_flags_json: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          if (
            s.includes('FROM public.job_requisitions r') &&
            s.includes('LIMIT 1')
          ) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'open_for_hire',
                  job_description: null,
                  requirements: null,
                  job_template_id: JD_ID,
                  headcount_mode: 'in_plan',
                  pipeline_flags_json: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          if (s.includes('FROM public.job_requisitions WHERE id')) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  status: 'open_for_hire',
                  headcount_mode: 'in_plan',
                  pipeline_flags_json: {},
                },
              ],
            };
          }
          if (s.includes('UPDATE public.job_requisitions')) {
            const flagsJson =
              typeof params?.[0] === 'string'
                ? JSON.parse(params[0])
                : { posted: true };
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'open_for_hire',
                  job_description: null,
                  requirements: null,
                  job_template_id: JD_ID,
                  headcount_mode: 'in_plan',
                  pipeline_flags_json: flagsJson,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const auth = groupCeoToken();
    const list = await svc.listJobRequisitions({ company_id: 'main' }, auth);
    expect(list.data[0].id).toBe(REQ_ID);
    const detail = await svc.getJobRequisitionById(
      REQ_ID,
      { company_id: 'main' },
      auth,
    );
    expect(detail.company_id).toBe('holding');
    const flags = await svc.patchRequisitionPipelineFlags(
      REQ_ID,
      { internal_scan_done: true, posted: true },
      { company_id: 'main' },
      auth,
    );
    expect(flags.pipeline_flags.posted).toBe(true);
    expect(flags.pipeline_flags.internal_scan_done).toBe(true);
    expect(seen.some((q) => q.includes('company_id'))).toBe(true);
  });
});

describe('R-REC-02-TARGET-MONTH-DATE (PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01)', () => {
  it('helper: YYYY-MM → YYYY-MM-01; YYYY-MM-01 keep; null/empty → null; garbage → VAL-400', () => {
    expect(normalizeTargetMonthOrThrow('2026-09')).toBe('2026-09-01');
    expect(normalizeTargetMonthOrThrow('2026-09-01')).toBe('2026-09-01');
    expect(normalizeTargetMonthOrThrow(null)).toBeNull();
    expect(normalizeTargetMonthOrThrow(undefined)).toBeNull();
    expect(normalizeTargetMonthOrThrow('')).toBeNull();
    expect(normalizeTargetMonthOrThrow('   ')).toBeNull();
    try {
      normalizeTargetMonthOrThrow('8');
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_VAL_400);
    }
    try {
      normalizeTargetMonthOrThrow('2026-13');
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_VAL_400);
    }
    try {
      normalizeTargetMonthOrThrow('not-a-date');
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_VAL_400);
    }
  });

  it('create: target_month YYYY-MM → INSERT $12 = YYYY-MM-01 (not PG cast raw)', async () => {
    let insertParams: unknown[] | null = null;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('FROM public.job_description_templates')) {
            return {
              rows: [
                {
                  id: JD_ID,
                  code: 'JD-01',
                  title: 'NV',
                  job_description: 'desc',
                  requirements: 'req',
                  is_active: true,
                  position_code: 'staff',
                  position_name: 'Nhân viên',
                },
              ],
            };
          }
          if (s.includes('INSERT INTO public.job_requisitions')) {
            insertParams = params ?? null;
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'draft',
                  job_description: 'desc',
                  requirements: 'req',
                  job_template_id: JD_ID,
                  target_month: '2026-09-01',
                  headcount_mode: null,
                  pipeline_flags_json: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const created = await svc.createJobRequisition(
      {
        company_id: 'main',
        title: 'YCTD',
        department: 'HCNS',
        employment_type: 'full-time',
        headcount: 1,
        job_template_id: JD_ID,
        target_month: '2026-09',
      },
      groupCeoToken(),
    );
    expect(created.status).toBe('draft');
    expect(insertParams?.[11]).toBe('2026-09-01');
    expect(String(created.target_month ?? '')).toContain('2026-09-01');
  });

  it('create: target_month YYYY-MM-01 → INSERT unchanged first-day', async () => {
    let insertParams: unknown[] | null = null;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('FROM public.job_description_templates')) {
            return {
              rows: [
                {
                  id: JD_ID,
                  code: 'JD-01',
                  title: 'NV',
                  job_description: 'desc',
                  requirements: 'req',
                  is_active: true,
                  position_code: 'staff',
                  position_name: 'Nhân viên',
                },
              ],
            };
          }
          if (s.includes('INSERT INTO public.job_requisitions')) {
            insertParams = params ?? null;
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'draft',
                  job_description: 'desc',
                  requirements: 'req',
                  job_template_id: JD_ID,
                  target_month: '2026-08-01',
                  headcount_mode: null,
                  pipeline_flags_json: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    await svc.createJobRequisition(
      {
        company_id: 'main',
        title: 'YCTD',
        department: 'HCNS',
        employment_type: 'full-time',
        headcount: 1,
        job_template_id: JD_ID,
        target_month: '2026-08-01',
      },
      groupCeoToken(),
    );
    expect(insertParams?.[11]).toBe('2026-08-01');
  });

  it('create: garbage target_month → 400 HRM-YCTD-VAL-400 (no INSERT)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.job_description_templates')) {
          return {
            rows: [
              {
                id: JD_ID,
                code: 'JD-01',
                title: 'NV',
                job_description: 'desc',
                requirements: 'req',
                is_active: true,
                position_code: 'staff',
                position_name: 'Nhân viên',
              },
            ],
          };
        }
        if (s.includes('INSERT INTO public.job_requisitions')) {
          throw new Error('should not INSERT on invalid target_month');
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.createJobRequisition(
        {
          company_id: 'main',
          title: 'YCTD',
          department: 'HCNS',
          employment_type: 'full-time',
          headcount: 1,
          job_template_id: JD_ID,
          target_month: '8',
        },
        groupCeoToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_YCTD_VAL_400);
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).getStatus()).toBe(400);
    }
  });

  it('create: omit target_month → INSERT null (unchanged)', async () => {
    let insertParams: unknown[] | null = null;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('FROM public.job_description_templates')) {
            return {
              rows: [
                {
                  id: JD_ID,
                  code: 'JD-01',
                  title: 'NV',
                  job_description: 'desc',
                  requirements: 'req',
                  is_active: true,
                  position_code: 'staff',
                  position_name: 'Nhân viên',
                },
              ],
            };
          }
          if (s.includes('INSERT INTO public.job_requisitions')) {
            insertParams = params ?? null;
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'HCNS',
                  employment_type: 'full-time',
                  headcount: 1,
                  status: 'draft',
                  job_description: 'desc',
                  requirements: 'req',
                  job_template_id: JD_ID,
                  target_month: null,
                  headcount_mode: null,
                  pipeline_flags_json: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    await svc.createJobRequisition(
      {
        company_id: 'main',
        title: 'YCTD',
        department: 'HCNS',
        employment_type: 'full-time',
        headcount: 1,
        job_template_id: JD_ID,
      },
      groupCeoToken(),
    );
    expect(insertParams?.[11]).toBeNull();
  });
});
