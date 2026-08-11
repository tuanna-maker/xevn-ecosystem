/**
 * @CODE-MEMORY
 * Screen: Jest — RecruitmentWorkflowBridge map/lock/spawn/callback
 * UC: UC-HRM-REC-WF-02..06 · VAL-REC-WF-01..12
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2–§6
 * WorkItem: XHRM-REC-WF-BE-SPAWN-02
 * must_keep: LeaveWorkflowBridge untouched · AC-CD-F6-* stage codes
 */
import {
  isRecruitmentWorkflowLocked,
  mapRecTaskTypeToStage,
  RecruitmentWorkflowBridge,
  WF_BUSINESS_TYPE_HRM_CANDIDATE,
  WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
} from './recruitment-workflow.bridge';

describe('RecruitmentWorkflowBridge map + lock helpers', () => {
  it('VAL-REC-WF-03: maps rec_* task types 1:1 to F6 stages', () => {
    expect(mapRecTaskTypeToStage('rec_intake')).toBe('new');
    expect(mapRecTaskTypeToStage('rec_screening')).toBe('screening');
    expect(mapRecTaskTypeToStage('rec_interview')).toBe('interview');
    expect(mapRecTaskTypeToStage('rec_offer')).toBe('offer');
  });

  it('BM-BE-REC-WF-04: maps bare F6 step_key (intake|screening|…) to stages', () => {
    expect(mapRecTaskTypeToStage('intake')).toBe('new');
    expect(mapRecTaskTypeToStage('screening')).toBe('screening');
    expect(mapRecTaskTypeToStage('interview')).toBe('interview');
    expect(mapRecTaskTypeToStage('offer')).toBe('offer');
    expect(mapRecTaskTypeToStage('SCREENING')).toBe('screening');
  });

  it('VAL-REC-WF-04: unmapped taskType returns null (fail-closed)', () => {
    expect(mapRecTaskTypeToStage('rec_unknown')).toBeNull();
    expect(mapRecTaskTypeToStage('manager_approval')).toBeNull();
    expect(mapRecTaskTypeToStage('')).toBeNull();
  });

  it('VAL-REC-WF-09/10: LOCKED only when instance active and non-terminal', () => {
    expect(isRecruitmentWorkflowLocked('inst-1', 'screening', 'candidate')).toBe(true);
    expect(isRecruitmentWorkflowLocked('inst-1', 'hired', 'candidate')).toBe(false);
    expect(isRecruitmentWorkflowLocked(null, 'screening', 'candidate')).toBe(false);
    expect(isRecruitmentWorkflowLocked('inst-1', 'pending_approval', 'plan')).toBe(true);
    expect(isRecruitmentWorkflowLocked('inst-1', 'approved', 'plan')).toBe(false);
    expect(isRecruitmentWorkflowLocked('inst-1', 'pending_approval', 'requisition')).toBe(true);
    expect(isRecruitmentWorkflowLocked('inst-1', 'open', 'requisition')).toBe(false);
  });
});

describe('RecruitmentWorkflowBridge callbacks', () => {
  const candidateId = '3f2a0c8e-1111-2222-3333-444455556666';
  const instanceId = '9aa1bb22-cccc-dddd-eeee-fff000111222';

  function buildBridge(queryMock: jest.Mock) {
    return new RecruitmentWorkflowBridge(
      {
        buildXbosUpstreamHeaders: () => ({
          'x-internal-api-key': 'test',
          'x-tenant-id': 'xevn',
          'x-company-id': 'holding',
        }),
      } as never,
      { query: queryMock } as never,
    );
  }

  it('VAL-REC-WF-03: step rec_interview → stage interview', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('SELECT stage') && sql.includes('FROM public.candidates')) {
        return {
          rows: [
            {
              stage: 'screening',
              workflow_instance_id: instanceId,
              wf_callback_fingerprint: null,
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.candidates') && sql.includes('SET stage')) {
        return { rows: [{ stage: 'interview' }] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleStepCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      stepKey: 'interview',
      taskType: 'rec_interview',
      taskId: 'task-1',
      reviewerUserId: 'approver@xe.vn',
    });
    expect(result).toEqual({ applied: true, stage: 'interview' });
  });

  it('BM-BE-REC-WF-04: bare screening taskType → stage screening + fingerprint', async () => {
    const queryMock = jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('SELECT stage') && sql.includes('FROM public.candidates')) {
        return {
          rows: [
            {
              stage: 'new',
              workflow_instance_id: instanceId,
              wf_callback_fingerprint: null,
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.candidates') && sql.includes('SET stage')) {
        expect(params?.[1]).toBe('screening');
        expect(String(params?.[2])).toContain(`${instanceId}:screening:`);
        return { rows: [{ stage: 'screening' }] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleStepCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      stepKey: 'screening',
      taskType: 'screening',
      taskId: 'task-bare-screening',
      reviewerUserId: 'ceo@xe.vn',
    });
    expect(result).toEqual({ applied: true, stage: 'screening' });
    expect(queryMock.mock.calls.some((c) => String(c[0]).includes('wf_callback_fingerprint'))).toBe(
      true,
    );
  });

  it('BM-BE-REC-WF-04: rec_screening still maps → stage screening', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('SELECT stage') && sql.includes('FROM public.candidates')) {
        return {
          rows: [
            {
              stage: 'new',
              workflow_instance_id: instanceId,
              wf_callback_fingerprint: null,
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.candidates') && sql.includes('SET stage')) {
        return { rows: [{ stage: 'screening' }] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleStepCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      stepKey: 'screening',
      taskType: 'rec_screening',
      taskId: 'task-rec-screening',
      reviewerUserId: 'ceo@xe.vn',
    });
    expect(result).toEqual({ applied: true, stage: 'screening' });
  });

  it('BM-BE-REC-WF-04: empty taskType falls back to bare stepKey', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('SELECT stage') && sql.includes('FROM public.candidates')) {
        return {
          rows: [
            {
              stage: 'new',
              workflow_instance_id: instanceId,
              wf_callback_fingerprint: null,
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.candidates') && sql.includes('SET stage')) {
        return { rows: [{ stage: 'screening' }] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleStepCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      stepKey: 'screening',
      taskType: '',
      taskId: 'task-stepkey-only',
      reviewerUserId: 'ceo@xe.vn',
    });
    expect(result).toEqual({ applied: true, stage: 'screening' });
  });

  it('VAL-REC-WF-04: unmapped taskType throws STAGE-UNMAPPED', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const bridge = buildBridge(queryMock);
    await expect(
      bridge.handleStepCallback({
        businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
        businessId: candidateId,
        workflowInstanceId: instanceId,
        stepKey: 'x',
        taskType: 'rec_unknown',
        reviewerUserId: 'approver@xe.vn',
      }),
    ).rejects.toThrow('HRM-REC-WF-STAGE-UNMAPPED');
  });

  it('VAL-REC-WF-06: terminal completed without hire AC → CALLBACK-SKIP', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.candidates') && sql.includes('SELECT stage')) {
        return {
          rows: [
            {
              stage: 'offer',
              workflow_instance_id: instanceId,
              employee_id: null,
            },
          ],
        };
      }
      if (sql.includes('FROM public.employees')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleTerminalCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      terminalStatus: 'completed',
      reviewerUserId: 'approver@xe.vn',
    });
    expect(result.applied).toBe(false);
    expect(result.skipReason).toBe('hire_ac_unmet');
    expect(result.stage).toBe('offer');
  });

  it('VAL-REC-WF-05: terminal completed with employee_id → hired', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.candidates') && sql.includes('SELECT stage')) {
        return {
          rows: [
            {
              stage: 'offer',
              workflow_instance_id: instanceId,
              employee_id: 'emp-1',
            },
          ],
        };
      }
      if (sql.includes("SET stage = 'hired'")) {
        return { rows: [{ stage: 'hired' }] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleTerminalCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      terminalStatus: 'completed',
      reviewerUserId: 'approver@xe.vn',
    });
    expect(result).toEqual({ applied: true, stage: 'hired' });
  });

  it('VAL-REC-WF-07: terminal rejected → stage rejected', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.candidates') && sql.includes('SELECT stage')) {
        return {
          rows: [
            {
              stage: 'interview',
              workflow_instance_id: instanceId,
              employee_id: null,
            },
          ],
        };
      }
      if (sql.includes("SET stage = 'rejected'")) {
        return { rows: [{ stage: 'rejected' }] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleTerminalCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      terminalStatus: 'rejected',
      reviewerUserId: 'approver@xe.vn',
      rejectedReason: 'Not a fit',
    });
    expect(result).toEqual({ applied: true, stage: 'rejected' });
  });

  it('VAL-REC-WF-08: duplicate terminal → applied false', async () => {
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.candidates') && sql.includes('SELECT stage')) {
        return {
          rows: [
            {
              stage: 'hired',
              workflow_instance_id: instanceId,
              employee_id: 'emp-1',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);
    const result = await bridge.handleTerminalCallback({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      terminalStatus: 'completed',
      reviewerUserId: 'approver@xe.vn',
    });
    expect(result.applied).toBe(false);
    expect(result.skipReason).toBe('already_terminal');
  });

  it('plan/req step → CALLBACK-SKIP noop', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const bridge = buildBridge(queryMock);
    const plan = await bridge.handleStepCallback({
      businessType: WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      stepKey: 'plan_approval',
      taskType: 'rec_plan_approve',
      reviewerUserId: 'approver@xe.vn',
    });
    expect(plan).toEqual({ applied: false, skipReason: 'plan_req_step_noop' });

    const req = await bridge.handleStepCallback({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: candidateId,
      workflowInstanceId: instanceId,
      stepKey: 'requisition_approval',
      taskType: 'rec_req_approve',
      reviewerUserId: 'approver@xe.vn',
    });
    expect(req).toEqual({ applied: false, skipReason: 'plan_req_step_noop' });
  });

  it('VAL-REC-WF-01/02: spawn success persists instance; spawn fail logs SPAWN-MISSING', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const submitterEmpId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const bridge = buildBridge(queryMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: instanceId } }),
    });
    const okSpawn = await bridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
      businessId: candidateId,
      companyId: 'holding',
      companySlug: 'holding',
      submitterUserId: 'ceo@xe.vn',
      submitterEmployeeId: submitterEmpId,
    });
    expect(okSpawn).toEqual({ workflowInstanceId: instanceId });
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('SET workflow_instance_id'),
      expect.arrayContaining([candidateId, instanceId]),
    );
    const startBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? '{}')) as {
      submitter?: { employeeId?: string };
    };
    expect(startBody.submitter?.employeeId).toBe(submitterEmpId);

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ success: false, code: 'XBOS-WF-404' }),
    });
    const miss = await bridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: candidateId,
      companyId: 'holding',
      companySlug: 'holding',
      submitterEmployeeId: submitterEmpId,
    });
    expect(miss).toBeNull();
  });

  it('XHRM-REC-WF-BE-SPAWN-01: resolves employeeId from email when def active → instance id', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const submitterEmpId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('UPDATE') && sql.includes('pending_approval')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.employees') && sql.includes('lower(email)')) {
        return { rows: [{ id: submitterEmpId }] };
      }
      if (sql.includes('SET workflow_instance_id')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { id: instanceId } }),
    });

    const result = await bridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: candidateId,
      companyId: 'holding',
      companySlug: 'holding',
      submitterUserId: 'ceo@xe.vn',
      // no submitterEmployeeId — must resolve via email
    });

    expect(result).toEqual({ workflowInstanceId: instanceId });
    expect(result?.workflowInstanceId).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as {
      workflowCode: string;
      businessType: string;
      businessId: string;
      submitter: { employeeId: string; userId: string };
    };
    expect(body.workflowCode).toBe('hrm_requisition_approval');
    expect(body.businessType).toBe(WF_BUSINESS_TYPE_HRM_REQUISITION);
    expect(body.businessId).toBe(candidateId);
    expect(body.submitter.employeeId).toBe(submitterEmpId);
    expect(body.submitter.userId).toBe('ceo@xe.vn');
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('SET workflow_instance_id'),
      expect.arrayContaining([candidateId, instanceId]),
    );
  });

  it('XHRM-REC-WF-BE-SPAWN-01: unresolved submitter.employeeId → SPAWN-MISSING (no XBOS call)', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.employees')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.user_company_memberships')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);

    const miss = await bridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      companyId: 'main',
      companySlug: 'main',
      submitterUserId: 'unknown@xe.vn',
    });
    expect(miss).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('XHRM-REC-WF-BE-SPAWN-02: Group CEO ceo@xe.vn with no email row → ensure holding employee → instance id', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const queryMock = jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('UPDATE') && sql.includes('pending_approval')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.user_company_memberships')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.employees') && sql.includes('lower(email)')) {
        return { rows: [] };
      }
      if (sql.includes('lower(employee_code)') && sql.includes('PORTAL-GCEO')) {
        return { rows: [] };
      }
      if (sql.includes('11111111-1111-4111-8111-111111111111')) {
        return { rows: [] };
      }
      if (sql.includes('INSERT INTO public.employees')) {
        expect(params?.[3]).toBe('ceo@xe.vn');
        expect(params?.[2]).toBe('PORTAL-GCEO');
        return { rows: [] };
      }
      if (sql.includes('SET workflow_instance_id')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { id: instanceId } }),
    });

    const result = await bridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: candidateId,
      companyId: 'holding',
      companySlug: 'holding',
      submitterUserId: 'ceo@xe.vn',
    });

    expect(result).toEqual({ workflowInstanceId: instanceId });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as {
      submitter: { employeeId: string; userId: string };
    };
    expect(body.submitter.userId).toBe('ceo@xe.vn');
    expect(body.submitter.employeeId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.employees'),
      expect.arrayContaining(['holding', 'PORTAL-GCEO', 'ceo@xe.vn']),
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('SET workflow_instance_id'),
      expect.arrayContaining([candidateId, instanceId]),
    );
  });

  it('XHRM-REC-WF-BE-SPAWN-02: membership.employee_id resolves when email miss', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const memberEmpId = 'd4e5f6a7-b8c9-0123-def0-234567890123';

    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      if (sql.includes('UPDATE') && sql.includes('pending_approval')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.employees') && sql.includes('lower(email)')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.user_company_memberships')) {
        return { rows: [{ employee_id: memberEmpId }] };
      }
      if (sql.includes('SET workflow_instance_id')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = buildBridge(queryMock);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { id: instanceId } }),
    });

    const result = await bridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: candidateId,
      companyId: 'holding',
      companySlug: 'holding',
      submitterUserId: 'ceo@xe.vn',
    });

    expect(result).toEqual({ workflowInstanceId: instanceId });
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as { submitter: { employeeId: string } };
    expect(body.submitter.employeeId).toBe(memberEmpId);
    expect(queryMock).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.employees'),
      expect.anything(),
    );
  });

  it('assertNotLockedOrThrow raises HRM-REC-WF-LOCKED', () => {
    const bridge = buildBridge(jest.fn());
    expect(() =>
      bridge.assertNotLockedOrThrow(instanceId, 'screening', 'candidate'),
    ).toThrow('HRM-REC-WF-LOCKED');
    expect(() => bridge.assertNotLockedOrThrow(null, 'screening', 'candidate')).not.toThrow();
  });
});
