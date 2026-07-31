import { describe, expect, it } from 'vitest';
import {
  WF_NODE_BOD,
  WF_NODE_END_OK,
  WF_NODE_END_REJECT,
} from '../data/workflow-graph';
import {
  apiRowToWorkflowDefinition,
  extractGraphSteps,
  isCanvasReadyGraphStep,
  normalizeGraphSteps,
  workflowDefinitionToApiPayload,
} from './workflowMapper';

/** Matches `scripts/seed-workflow-inbox-sample.mjs` MINIMAL_GRAPH step shape. */
const SEED_INBOX_STEP = {
  id: 'wf-step-1',
  order: 1,
  label: 'Trưởng bộ phận duyệt',
  handlerRoleId: 'dept_head',
  slaHours: 24,
  action: 'approve',
  transitions: [
    { kind: 'approve', destinationId: 'wf-end-success' },
    { kind: 'reject', destinationId: 'wf-end-reject' },
    { kind: 'exception', destinationId: 'wf-bod-special' },
  ],
};

describe('workflowMapper', () => {
  it('normalizes seed inbox graph (label/action) to canvas steps', () => {
    const steps = normalizeGraphSteps([SEED_INBOX_STEP]);
    expect(steps).toHaveLength(1);
    expect(steps[0]?.taskName).toBe('Trưởng bộ phận duyệt');
    expect(steps[0]?.stepAction).toBe('approve');
    expect(steps[0]?.handlerRoleId).toBe('dept_head');
    expect(steps[0]?.transitions.find((t) => t.kind === 'approve')?.destinationId).toBe(
      'wf-end-success',
    );
    expect(isCanvasReadyGraphStep(steps[0]!)).toBe(true);
  });

  it('normalizes catalog runtime steps (stepKey/hatKey/name)', () => {
    const steps = normalizeGraphSteps([
      {
        stepKey: 'group_catalog_approval',
        name: 'Tập đoàn phê duyệt danh mục',
        order: 2,
        hatKey: 'group_ceo',
      },
    ]);
    expect(steps[0]?.id).toBe('group_catalog_approval');
    expect(steps[0]?.taskName).toBe('Tập đoàn phê duyệt danh mục');
    expect(steps[0]?.handlerRoleId).toBe('bod');
    expect(steps[0]?.transitions).toHaveLength(3);
  });

  it('chains multi-step graphs with default transitions when missing', () => {
    const steps = normalizeGraphSteps([
      { stepKey: 'a', name: 'Bước A', order: 1 },
      { stepKey: 'b', name: 'Bước B', order: 2 },
    ]);
    expect(steps[0]?.transitions.find((t) => t.kind === 'approve')?.destinationId).toBe('b');
    expect(steps[1]?.transitions.find((t) => t.kind === 'approve')?.destinationId).toBe(
      WF_NODE_END_OK,
    );
    expect(steps[1]?.transitions.find((t) => t.kind === 'reject')?.destinationId).toBe(
      WF_NODE_END_REJECT,
    );
    expect(steps[1]?.transitions.find((t) => t.kind === 'exception')?.destinationId).toBe(
      WF_NODE_BOD,
    );
  });

  it('extractGraphSteps accepts bare array graph (VPS seed shape)', () => {
    const steps = extractGraphSteps([{ stepKey: 'review', name: 'Duyệt', order: 1 }]);
    expect(Array.isArray(steps)).toBe(true);
    expect(steps).toHaveLength(1);
  });

  it('apiRowToWorkflowDefinition maps graph stored as step array not {steps:[]}', () => {
    const def = apiRowToWorkflowDefinition({
      id: 'def-array-graph',
      workflow_code: 'WF-CAT-01',
      name: 'Phê duyệt danh mục',
      company_id: 'main',
      graph: [{ stepKey: 'group_catalog_approval', name: 'Tập đoàn phê duyệt', order: 1, hatKey: 'group_ceo' }],
    });
    expect(def.steps).toHaveLength(1);
    expect(def.steps[0]?.taskName).toBe('Tập đoàn phê duyệt');
    expect(def.steps[0]?.handlerRoleId).toBe('bod');
  });

  it('apiRowToWorkflowDefinition maps roleHat on catalog runtime steps', () => {
    const def = apiRowToWorkflowDefinition({
      id: 'def-role-hat',
      workflow_code: 'WF-RH-01',
      name: 'Catalog approver',
      graph: [{ stepKey: 'review', name: 'Review', order: 1, roleHat: 'catalog_approver' }],
    });
    expect(def.steps[0]?.handlerRoleId).toBe('catalog_approver');
  });

  it('apiRowToWorkflowDefinition maps workflow-engine DB row', () => {
    const def = apiRowToWorkflowDefinition({
      id: 'def-uuid-1',
      workflow_code: 'WF-INBOX-DEMO',
      name: 'Quy trình demo inbox',
      company_id: 'main',
      graph: {
        applyingEntityId: 'xevn',
        triggerEvent: 'seed.inbox.demo',
        totalSlaHours: 48,
        steps: [SEED_INBOX_STEP],
      },
    });
    expect(def.id).toBe('def-uuid-1');
    expect(def.code).toBe('WF-INBOX-DEMO');
    expect(def.steps).toHaveLength(1);
    expect(def.totalSlaHours).toBe(48);
  });

  it('round-trips canvas payload for PUT /workflow-engine/definitions/:id', () => {
    const def = apiRowToWorkflowDefinition({
      id: 'def-2',
      workflow_code: 'WF-TD-01',
      name: 'Phê duyệt tuyển dụng',
      graph: { steps: [SEED_INBOX_STEP], totalSlaHours: 24 },
    });
    const payload = workflowDefinitionToApiPayload(def);
    expect(payload.workflowCode).toBe('WF-TD-01');
    expect(payload.category).toBe('general');
    expect(payload.conditions).toEqual({});
    const graph = payload.graph as { steps: unknown[] };
    expect(Array.isArray(graph.steps)).toBe(true);
    expect((graph.steps[0] as { taskName: string }).taskName).toBe('Trưởng bộ phận duyệt');
  });

  it('XHRM-REC-WF: recruitment code payload sets businessType + taskType (J-REC-WF-01)', () => {
    const def = apiRowToWorkflowDefinition({
      id: 'def-rec',
      workflow_code: 'hrm_requisition_approval',
      name: 'Phê duyệt yêu cầu tuyển dụng HRM',
      graph: {
        steps: [
          {
            id: 'requisition_approval',
            order: 1,
            name: 'Phê duyệt yêu cầu tuyển',
            taskType: 'rec_req_approve',
            resolver_type: 'direct_manager',
            resolver_config: { fallback_role_code: 'hrbp' },
            transitions: [
              { kind: 'approve', destinationId: 'wf-end-success' },
              { kind: 'reject', destinationId: 'wf-end-reject' },
              { kind: 'exception', destinationId: 'wf-bod-special' },
            ],
          },
        ],
      },
    });
    expect(def.steps[0]?.taskType).toBe('rec_req_approve');
    expect(def.steps[0]?.resolverType).toBe('direct_manager');
    const payload = workflowDefinitionToApiPayload(def);
    expect(payload.status).toBe('active');
    expect(payload.category).toBe('hrm_recruitment');
    expect(payload.conditions).toEqual({ businessType: 'hrm_requisition' });
    const step = (payload.graph as { steps: Array<Record<string, unknown>> }).steps[0]!;
    expect(step.stepKey).toBe('requisition_approval');
    expect(step.taskType).toBe('rec_req_approve');
    expect(step.resolver_type).toBe('direct_manager');
  });

  it('AC-CD-F4-06: preserves resolver_type through load → edit → PUT → reload', () => {
    const leaveStep = {
      stepKey: 'manager_approval',
      name: 'Quản lý trực tiếp phê duyệt',
      order: 1,
      resolver_type: 'direct_manager',
      resolver_config: { fallback_role_code: 'hrbp' },
      allowsReject: true,
    };
    const def = apiRowToWorkflowDefinition({
      id: 'def-leave',
      workflow_code: 'hrm_leave_approval',
      name: 'Phê duyệt đơn nghỉ phép HRM',
      graph: { steps: [leaveStep] },
    });
    expect(def.steps[0]?.resolverType).toBe('direct_manager');
    expect(def.steps[0]?.resolverConfig).toEqual({ fallback_role_code: 'hrbp' });

    const edited = {
      ...def,
      steps: def.steps.map((s) => ({
        ...s,
        resolverType: 'position_template' as const,
        resolverConfig: { position_code: 'TRUONG_PHONG', company_id: 'main' },
      })),
    };
    const payload = workflowDefinitionToApiPayload(edited);
    const graph = payload.graph as { steps: Array<Record<string, unknown>> };
    expect(graph.steps[0]?.resolver_type).toBe('position_template');
    expect(graph.steps[0]?.resolver_config).toEqual({
      position_code: 'TRUONG_PHONG',
      company_id: 'main',
    });

    const reloaded = apiRowToWorkflowDefinition({
      id: 'def-leave',
      workflow_code: 'hrm_leave_approval',
      name: 'Phê duyệt đơn nghỉ phép HRM',
      graph: payload.graph,
    });
    expect(reloaded.steps[0]?.resolverType).toBe('position_template');
    expect(reloaded.steps[0]?.resolverConfig).toEqual({
      position_code: 'TRUONG_PHONG',
      company_id: 'main',
    });
  });

  it('AC-CD-F4-07 canvas: parallel_group resolver round-trips', () => {
    const steps = normalizeGraphSteps([
      {
        id: 'parallel-1',
        order: 1,
        taskName: 'Duyệt song song',
        resolverType: 'parallel_group',
        resolverConfig: {
          resolver_types: ['direct_manager', 'position_template'],
          parallel_policy: 'all',
        },
      },
    ]);
    expect(steps[0]?.resolverType).toBe('parallel_group');
    const payload = workflowDefinitionToApiPayload({
      id: 'd',
      code: 'WF-P',
      name: 'P',
      applyingEntityId: 'main',
      triggerEvent: 't',
      totalSlaHours: 24,
      steps,
    });
    const apiStep = (payload.graph as { steps: Array<Record<string, unknown>> }).steps[0];
    expect(apiStep?.resolver_type).toBe('parallel_group');
    expect((apiStep?.resolver_config as { parallel_policy: string }).parallel_policy).toBe('all');
  });
});
