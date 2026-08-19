/**
 * PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01 — XBOS spawn identity + Y-S9 terminal (U65 ceo@ inbox).
 */
import {
  RecruitmentWorkflowBridge,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
} from './recruitment-workflow.bridge';

const instanceId = 'c5e626cf-90b8-44b6-94c0-6cc82214d452';
const requisitionId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const submitterEmpId = '11111111-1111-4111-8111-111111111111';

function buildBridge(queryMock: jest.Mock) {
  const catalogSync = {
    buildXbosUpstreamHeaders: jest.fn().mockReturnValue({ authorization: 'Bearer t' }),
  };
  const db = { query: queryMock };
  return new RecruitmentWorkflowBridge(catalogSync as never, db as never);
}

describe('PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01', () => {
  it('spawn: submitter.userId is employeeId UUID (not portal email) for BR-WF-04 inbox approve', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: instanceId } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('pending_approval')) return { rows: [] };
      if (sql.includes('AS subject')) return { rows: [{ subject: 'YCTD QA' }] };
      if (sql.includes('SET workflow_instance_id')) return { rows: [] };
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);

    await bridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: requisitionId,
      companyId: 'main',
      companySlug: 'main',
      submitterUserId: 'ceo@xe.vn',
      submitterEmployeeId: submitterEmpId,
      conditions: { headcount_mode: 'out_of_plan', hire_reason: 'new' },
    });

    const startBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? '{}')) as {
      submitter?: { userId?: string; employeeId?: string; submitterPortalEmail?: string };
    };
    expect(startBody.submitter?.userId).toBe(submitterEmpId);
    expect(startBody.submitter?.employeeId).toBe(submitterEmpId);
    expect(startBody.submitter?.userId).not.toBe('ceo@xe.vn');
    expect(startBody.submitter?.submitterPortalEmail).toBe('ceo@xe.vn');
  });

  it('Y-S9 terminal: out_of_plan pending_approval → open_for_hire (single-leg WF + cv_intake)', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('SELECT status') && sql.includes('job_requisitions')) {
        return {
          rows: [
            {
              status: 'pending_approval',
              workflow_instance_id: instanceId,
              headcount_mode: 'out_of_plan',
              pipeline_flags_json: { cv_intake_allowed: false },
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.job_requisitions')) {
        return { rows: [{ status: 'open_for_hire' }] };
      }
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);

    const result = await bridge.handleTerminalCallback({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: requisitionId,
      workflowInstanceId: instanceId,
      terminalStatus: 'completed',
      reviewerUserId: 'ceo@xe.vn',
    });

    expect(result.applied).toBe(true);
    expect(result.status).toBe('open_for_hire');
    const updateCall = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('UPDATE public.job_requisitions'),
    );
    expect(updateCall?.[1]?.[1]).toBe('open_for_hire');
    const flags = JSON.parse(String(updateCall?.[1]?.[3] ?? '{}')) as { cv_intake_allowed?: boolean };
    expect(flags.cv_intake_allowed).toBe(true);
  });

  it('Y-S9 terminal: second leg approved → open_for_hire + cv_intake_allowed', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('SELECT status') && sql.includes('job_requisitions')) {
        return {
          rows: [
            {
              status: 'approved',
              workflow_instance_id: instanceId,
              headcount_mode: 'out_of_plan',
              pipeline_flags_json: { cv_intake_allowed: false },
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.job_requisitions')) {
        return { rows: [{ status: 'open_for_hire' }] };
      }
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);

    const result = await bridge.handleTerminalCallback({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: requisitionId,
      workflowInstanceId: instanceId,
      terminalStatus: 'completed',
      reviewerUserId: 'ceo@xe.vn',
    });

    expect(result.applied).toBe(true);
    expect(result.status).toBe('open_for_hire');
    const updateCall = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('UPDATE public.job_requisitions'),
    );
    const flags = JSON.parse(String(updateCall?.[1]?.[3] ?? '{}')) as { cv_intake_allowed?: boolean };
    expect(flags.cv_intake_allowed).toBe(true);
  });
});
