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
    const graph = payload.graph as { steps: unknown[] };
    expect(Array.isArray(graph.steps)).toBe(true);
    expect((graph.steps[0] as { taskName: string }).taskName).toBe('Trưởng bộ phận duyệt');
  });
});
