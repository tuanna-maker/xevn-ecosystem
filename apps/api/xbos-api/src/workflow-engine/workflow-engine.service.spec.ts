import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { WorkflowEngineService } from './workflow-engine.service';

describe('WorkflowEngineService (UC-XBOS-13 / W3-5)', () => {
  const query = jest.fn();
  const service = new WorkflowEngineService({ query } as unknown as XbosDbService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates definition with graph object without unused SQL params (W3-5)', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'def-1', name: 'QA WF', workflow_code: 'QA-WF' }] });
    const result = await service.upsertDefinition('xevn', 'main', 'def-1', {
      name: 'QA WF',
      code: 'QA-WF',
      graph: { nodes: [{ id: 'start', type: 'start' }], edges: [] },
      status: 'active',
    });
    expect(result).toMatchObject({ id: 'def-1' });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE public.xbos_workflow_definition'),
      expect.arrayContaining(['def-1', 'xevn', 'QA WF']),
    );
    const params = query.mock.calls[0][1] as unknown[];
    expect(params).toHaveLength(8);
    expect(typeof params[5]).toBe('string');
    expect(JSON.parse(String(params[5]))).toMatchObject({ nodes: expect.any(Array) });
  });

  it('accepts workflow_code alias on create', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ max_v: null }] })
      .mockResolvedValueOnce({ rows: [{ id: 'new-def', version: 1 }] });
    await service.upsertDefinition('xevn', null, null, {
      workflow_code: 'WF-DEMO',
      name: 'Demo',
      graph: {},
    });
    expect(query.mock.calls[0][0]).toContain('MAX(version)');
    expect(query.mock.calls[1][1]).toEqual(
      expect.arrayContaining(['xevn', 'WF-DEMO', 'Demo', 1]),
    );
  });

  it('D-HRM-REC-WF-OPTION-B-DUAL-01: INSERT persists body.version (no UNIQUE false-fail)', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'visun-def', version: 2, status: 'draft' }] });
    await service.upsertDefinition('xevn', 'holding', null, {
      workflowCode: 'hrm_requisition_approval',
      name: 'YCTD VISUN',
      version: 2,
      status: 'draft',
      graph: { applyingEntityId: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665' },
    });
    expect(query).toHaveBeenCalledTimes(1);
    const params = query.mock.calls[0][1] as unknown[];
    expect(query.mock.calls[0][0]).toContain('version');
    expect(params).toEqual(
      expect.arrayContaining(['xevn', 'hrm_requisition_approval', 'YCTD VISUN', 2]),
    );
  });

  it('requires name on PUT', async () => {
    await expect(
      service.upsertDefinition('xevn', 'main', 'def-1', { code: 'WF-1', graph: {} }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-WF-400',
      getStatus: expect.any(Function),
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('returns 404 when UPDATE matches no row', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(
      service.upsertDefinition('xevn', 'main', '00000000-0000-4000-8000-000000000099', {
        name: 'Missing',
        graph: {},
      }),
    ).rejects.toMatchObject({ code: 'XBOS-WF-404' });
  });

  it('XHRM-REC-WF-BE-TERMINAL-01: complete same-step-hat siblings → instanceCompleted (legacy fan-out)', async () => {
    const taskId = 'f39b3a70-0000-4000-8000-000000000001';
    const instanceId = 'ccca977f-0000-4000-8000-000000000001';
    const ceoTask = {
      id: taskId,
      instance_id: instanceId,
      step_key: 'requisition_approval',
      hat_key: 'group_ceo',
      assignee_user_id: 'ceo@xe.vn',
      payload: {},
      tenant_id: 'xevn',
      company_id: 'holding',
      business_type: 'general',
      business_id: 'req-1',
      context: {},
      status: 'pending',
    };

    query
      // 1 load task
      .mockResolvedValueOnce({ rows: [ceoTask] })
      // 2 same-user other hats
      .mockResolvedValueOnce({ rows: [] })
      // 3 UPDATE complete
      .mockResolvedValueOnce({ rows: [{ ...ceoTask, status: 'completed' }] })
      // 4 applySameStepHatAnyPolicy UPDATE skip siblings
      .mockResolvedValueOnce({ rows: [] })
      // 5 getInstanceWithTasks — instance
      .mockResolvedValueOnce({
        rows: [
          {
            id: instanceId,
            definition_id: 'def-1',
            context: { currentStepOrder: 1 },
            business_type: 'general',
            business_id: 'req-1',
            tenant_id: 'xevn',
            company_id: 'holding',
          },
        ],
      })
      // 6 getInstanceWithTasks — tasks (siblings already skipped; none pending)
      .mockResolvedValueOnce({
        rows: [
          { id: taskId, status: 'completed', step_key: 'requisition_approval', hat_key: 'group_ceo' },
          { id: 'admin-1', status: 'skipped', step_key: 'requisition_approval', hat_key: 'group_ceo' },
          { id: 'admin-2', status: 'skipped', step_key: 'requisition_approval', hat_key: 'group_ceo' },
        ],
      })
      // 7 pendingOnInstance
      .mockResolvedValueOnce({ rows: [] })
      // 8 UPDATE instance completed
      .mockResolvedValueOnce({ rows: [] });

    const result = await service.completeStepTask(taskId, { userId: 'ceo@xe.vn' });
    expect(result.instanceCompleted).toBe(true);

    const skipCall = query.mock.calls.find(
      (c) => typeof c[0] === 'string' && String(c[0]).includes('same_step_hat_any_first_wins'),
    );
    expect(skipCall).toBeTruthy();
    expect(skipCall?.[1]).toEqual([instanceId, taskId, 'requisition_approval', 'group_ceo']);
  });

  it('XHRM-REC-WF-BE-TERMINAL-01: parallel_group policy=all does not same-hat skip', async () => {
    const taskId = 'task-par-1';
    const instanceId = 'inst-par-1';
    const task = {
      id: taskId,
      instance_id: instanceId,
      step_key: 'parallel_exec',
      hat_key: 'direct_manager',
      assignee_user_id: 'manager.a@xe.vn',
      payload: { parallelGroupId: 'pg-1', parallelPolicy: 'all' },
      tenant_id: 'xevn',
      company_id: 'holding',
      business_type: 'general',
      business_id: 'x-1',
      context: {},
    };

    query
      .mockResolvedValueOnce({ rows: [task] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ ...task, status: 'completed' }] })
      // maybeAdvance — still pending sibling
      .mockResolvedValueOnce({
        rows: [
          {
            id: instanceId,
            definition_id: 'def-1',
            context: {},
            business_type: 'general',
            business_id: 'x-1',
            tenant_id: 'xevn',
            company_id: 'holding',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { id: taskId, status: 'completed' },
          { id: 'task-par-2', status: 'pending', hat_key: 'hcns' },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ id: 'task-par-2' }] });

    const result = await service.completeStepTask(taskId, { userId: 'manager.a@xe.vn' });
    expect(result.instanceCompleted).toBe(false);
    const skipCall = query.mock.calls.find(
      (c) => typeof c[0] === 'string' && String(c[0]).includes('same_step_hat_any_first_wins'),
    );
    expect(skipCall).toBeUndefined();
  });

  it('XHRM-REC-WF-BE-COMPLETE-INSTANCE-01: complete terminal notify uses instance_id not task id', async () => {
    const taskId = 'a4e08de5-0000-4000-8000-000000000001';
    const instanceId = '49b385f8-0000-4000-8000-000000000001';
    const reqId = '784509c3-0000-4000-8000-000000000001';
    const ceoTask = {
      id: taskId,
      instance_id: instanceId,
      step_key: 'requisition_approval',
      hat_key: 'group_ceo',
      assignee_user_id: 'ceo@xe.vn',
      payload: { parallelGroupId: 'pg-rec', parallelPolicy: 'any', taskType: 'rec_requisition_approve' },
      tenant_id: 'xevn',
      company_id: 'holding',
      business_type: 'hrm_requisition',
      business_id: reqId,
      context: { memberTenantId: 'xevn', memberCompanyId: 'holding' },
      status: 'pending',
    };

    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: async () => '' });
    const prevFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      query
        .mockResolvedValueOnce({ rows: [ceoTask] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...ceoTask, status: 'completed' }] })
        // applyParallelAnyPolicy
        .mockResolvedValueOnce({ rows: [] })
        // maybeAdvanceSequentialStep — getInstanceWithTasks instance + tasks
        .mockResolvedValueOnce({
          rows: [
            {
              id: instanceId,
              definition_id: 'def-1',
              context: { currentStepOrder: 1 },
              business_type: 'hrm_requisition',
              business_id: reqId,
              tenant_id: 'xevn',
              company_id: 'holding',
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            { id: taskId, status: 'completed', step_key: 'requisition_approval', hat_key: 'group_ceo' },
            { id: 'admin-sib', status: 'skipped', step_key: 'requisition_approval', hat_key: 'group_ceo' },
          ],
        })
        // pendingOnInstance empty → terminal
        .mockResolvedValueOnce({ rows: [] })
        // UPDATE instance completed
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.completeStepTask(taskId, { userId: 'ceo@xe.vn' });
      expect(result.instanceCompleted).toBe(true);

      const recCalls = fetchMock.mock.calls.filter((c) =>
        String(c[0]).includes('/api/hrm/recruitment/workflow/'),
      );
      expect(recCalls.length).toBeGreaterThanOrEqual(2);

      const stepBody = JSON.parse(String((recCalls[0][1] as RequestInit).body));
      expect(stepBody.workflowInstanceId).toBe(instanceId);
      expect(stepBody.workflowInstanceId).not.toBe(taskId);
      expect(stepBody.taskId).toBe(taskId);
      expect(stepBody.businessId).toBe(reqId);

      const terminalCall = recCalls.find((c) => String(c[0]).includes('/terminal'));
      expect(terminalCall).toBeTruthy();
      const terminalBody = JSON.parse(String((terminalCall![1] as RequestInit).body));
      expect(terminalBody.workflowInstanceId).toBe(instanceId);
      expect(terminalBody.workflowInstanceId).not.toBe(taskId);
      expect(terminalBody.terminalStatus).toBe('completed');
      expect(terminalBody.businessId).toBe(reqId);
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it('XHRM-REC-WF-BE-COMPLETE-INSTANCE-01: reject terminal still remaps id → instance_id (J-06 must_keep)', async () => {
    const taskId = '59656e16-0000-4000-8000-000000000001';
    const instanceId = '284db120-0000-4000-8000-000000000001';
    const reqId = 'req-reject-1';
    const before = {
      id: taskId,
      instance_id: instanceId,
      step_key: 'requisition_approval',
      hat_key: 'group_ceo',
      business_type: 'hrm_requisition',
      business_id: reqId,
      context: { memberTenantId: 'xevn', memberCompanyId: 'holding' },
      tenant_id: 'xevn',
      company_id: 'holding',
    };

    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: async () => '' });
    const prevFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      query
        .mockResolvedValueOnce({ rows: [before] })
        .mockResolvedValueOnce({ rows: [{ ...before, status: 'rejected' }] })
        .mockResolvedValueOnce({ rows: [] }) // instance → rejected
        .mockResolvedValueOnce({ rows: [] }); // skip siblings

      await service.rejectStepTask(taskId, { userId: 'ceo@xe.vn', reason: 'no' });

      const terminalCall = fetchMock.mock.calls.find((c) =>
        String(c[0]).includes('/api/hrm/recruitment/workflow/terminal'),
      );
      expect(terminalCall).toBeTruthy();
      const body = JSON.parse(String((terminalCall![1] as RequestInit).body));
      expect(body.workflowInstanceId).toBe(instanceId);
      expect(body.workflowInstanceId).not.toBe(taskId);
      expect(body.terminalStatus).toBe('rejected');
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it('BM-BE-REC-WF-SPAWN-MEMBER-01: applyingEntityId=VISUN + Group CEO holding still starts', async () => {
    const visunId = 'dfb107a7-99e3-433a-94e5-f78ce8b2d665';
    const defId = '944c9abf-a566-4e45-965c-ce441632e746';
    const empId = '678b9cb2-1111-4111-8111-111111111111';
    const prevResolver = process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
    process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = 'false';

    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: defId,
            workflow_code: 'hrm_requisition_approval',
            status: 'active',
            graph: {
              applyingEntityId: visunId,
              steps: [
                {
                  stepKey: 'requisition_approval',
                  order: 1,
                  handlerRoleId: 'group_ceo',
                  resolver_type: 'direct_manager',
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ tenant_id: 'visun', company_id: 'main' }] }) // Option B enrich
      .mockResolvedValueOnce({ rows: [{ tenant_id: 'visun', company_id: 'main' }] }) // apply-scope
      .mockResolvedValueOnce({ rows: [{ id: 'inst-visun-apply-1', status: 'running' }] })
      .mockResolvedValueOnce({ rows: [] });

    try {
      const result = await service.startInstanceFromWorkflowCode('xevn', 'holding', {
        workflowCode: 'hrm_requisition_approval',
        businessType: 'hrm_requisition',
        businessId: '4757395f-c8d3-4a68-b657-599b2c91bd89',
        submitter: {
          userId: 'ceo@xe.vn',
          employeeId: empId,
          companyId: 'holding',
          companySlug: 'holding',
        },
        context: { memberTenantId: 'xevn', memberCompanyId: 'holding' },
      });
      expect(result).toMatchObject({ id: 'inst-visun-apply-1' });
      const insertCall = query.mock.calls.find((c) =>
        String(c[0]).includes('INSERT INTO public.xbos_workflow_instance'),
      );
      expect(insertCall).toBeTruthy();
      const contextJson = String((insertCall![1] as unknown[])[5]);
      expect(JSON.parse(contextJson)).toMatchObject({
        applyingEntityId: visunId,
        workflowCode: 'hrm_requisition_approval',
      });
    } finally {
      if (prevResolver === undefined) delete process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
      else process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = prevResolver;
    }
  });

  it('BM-BE-REC-WF-SPAWN-MEMBER-01: recruitment resolver failure → soft GROUP_APPROVER fallback', async () => {
    const empId = '678b9cb2-2222-4222-8222-222222222222';
    const prevResolver = process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
    process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = 'true';

    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'def-rec-fallback-1',
            workflow_code: 'hrm_requisition_approval',
            status: 'active',
            graph: {
              applyingEntityId: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
              steps: [
                {
                  stepKey: 'requisition_approval',
                  order: 1,
                  resolver_type: 'fixed_user',
                  resolver_config: {},
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ tenant_id: 'visun', company_id: 'main' }] }) // partition enrich
      .mockResolvedValueOnce({ rows: [{ tenant_id: 'visun', company_id: 'main' }] }) // apply-scope resolve
      .mockResolvedValueOnce({ rows: [{ id: 'inst-fallback-1', status: 'running' }] })
      .mockResolvedValueOnce({ rows: [] });

    try {
      const result = await service.startInstanceFromWorkflowCode('xevn', 'holding', {
        workflowCode: 'hrm_requisition_approval',
        businessType: 'hrm_requisition',
        businessId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        submitter: { userId: 'ceo@xe.vn', employeeId: empId, companyId: 'holding' },
      });
      expect(result).toMatchObject({ id: 'inst-fallback-1' });
      const stepInsert = query.mock.calls.find((c) =>
        String(c[0]).includes('INSERT INTO public.xbos_workflow_step_task'),
      );
      expect(stepInsert).toBeTruthy();
      expect(stepInsert![1]).toEqual(
        expect.arrayContaining(['inst-fallback-1', 'requisition_approval', 'group_ceo', 'ceo@xe.vn']),
      );
    } finally {
      if (prevResolver === undefined) delete process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
      else process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = prevResolver;
    }
  });

  it('D-HRM-REC-WF-OPTION-B-BE-01: member spawn picks member def not higher-version group', async () => {
    const visunId = 'dfb107a7-99e3-433a-94e5-f78ce8b2d665';
    const empId = '678b9cb2-3333-4333-8333-333333333333';
    const prevResolver = process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
    process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = 'false';

    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'def-group-v3',
            workflow_code: 'hrm_requisition_approval',
            status: 'active',
            company_id: 'holding',
            version: 3,
            graph: {
              applyingEntityId: '',
              steps: [{ stepKey: 'group_step', order: 1, handlerRoleId: 'group_ceo' }],
            },
          },
          {
            id: 'def-visun-v2',
            workflow_code: 'hrm_requisition_approval',
            status: 'active',
            company_id: 'visun',
            version: 2,
            graph: {
              applyingEntityId: visunId,
              steps: [{ stepKey: 'visun_step', order: 1, handlerRoleId: 'group_ceo' }],
            },
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ tenant_id: 'visun', company_id: 'main' }] }) // enrich visun
      .mockResolvedValueOnce({ rows: [{ tenant_id: 'visun', company_id: 'main' }] }) // apply-scope
      .mockResolvedValueOnce({ rows: [{ id: 'inst-option-b-member', status: 'running' }] })
      .mockResolvedValueOnce({ rows: [] });

    try {
      const result = await service.startInstanceFromWorkflowCode('xevn', 'visun', {
        workflowCode: 'hrm_requisition_approval',
        businessType: 'hrm_requisition',
        businessId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        submitter: { userId: 'visun.ceo@xe.vn', employeeId: empId, companyId: 'visun' },
        context: { memberTenantId: 'visun', memberCompanyId: 'visun', entityCompanyId: 'visun' },
      });
      expect(result).toMatchObject({ id: 'inst-option-b-member' });
      const insertCall = query.mock.calls.find((c) =>
        String(c[0]).includes('INSERT INTO public.xbos_workflow_instance'),
      );
      expect(insertCall![1][2]).toBe('def-visun-v2');
      const contextJson = JSON.parse(String((insertCall![1] as unknown[])[5]));
      expect(contextJson.applyingEntityId).toBe(visunId);
      expect(contextJson.workflowCode).toBe('hrm_requisition_approval');
    } finally {
      if (prevResolver === undefined) delete process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
      else process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = prevResolver;
    }
  });

  it('D-HRM-REC-WF-OPTION-B-BE-01: holding spawn picks group def not higher-version member', async () => {
    const visunId = 'dfb107a7-99e3-433a-94e5-f78ce8b2d665';
    const empId = '678b9cb2-4444-4444-8444-444444444444';
    const prevResolver = process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
    process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = 'false';

    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'def-visun-v9',
            workflow_code: 'hrm_requisition_approval',
            status: 'active',
            company_id: 'visun',
            version: 9,
            graph: {
              applyingEntityId: visunId,
              steps: [{ stepKey: 'visun_only', order: 1, handlerRoleId: 'group_ceo' }],
            },
          },
          {
            id: 'def-group-v1',
            workflow_code: 'hrm_requisition_approval',
            status: 'active',
            company_id: 'holding',
            version: 1,
            graph: {
              applyingEntityId: '',
              steps: [{ stepKey: 'group_step', order: 1, handlerRoleId: 'group_ceo' }],
            },
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ tenant_id: 'visun', company_id: 'main' }] }) // enrich member
      .mockResolvedValueOnce({ rows: [{ id: 'inst-option-b-group', status: 'running' }] })
      .mockResolvedValueOnce({ rows: [] });

    try {
      const result = await service.startInstanceFromWorkflowCode('xevn', 'holding', {
        workflowCode: 'hrm_requisition_approval',
        businessType: 'hrm_requisition',
        businessId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        submitter: { userId: 'ceo@xe.vn', employeeId: empId, companyId: 'holding' },
        context: { memberTenantId: 'xevn', memberCompanyId: 'holding', entityCompanyId: 'holding' },
      });
      expect(result).toMatchObject({ id: 'inst-option-b-group' });
      const insertCall = query.mock.calls.find((c) =>
        String(c[0]).includes('INSERT INTO public.xbos_workflow_instance'),
      );
      expect(insertCall![1][2]).toBe('def-group-v1');
      const contextJson = JSON.parse(String((insertCall![1] as unknown[])[5]));
      expect(contextJson.applyingEntityId).toBeNull();
    } finally {
      if (prevResolver === undefined) delete process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED;
      else process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED = prevResolver;
    }
  });
});
