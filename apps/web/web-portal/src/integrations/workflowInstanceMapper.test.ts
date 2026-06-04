import { describe, expect, it } from 'vitest';
import type { WorkflowGraphStep } from '../data/workflow-graph';
import {
  apiRowToWorkflowInstanceListItem,
  buildStepRuntimeStatusMap,
  countInstancesByDefinitionId,
  normalizeWorkflowInstanceDetail,
  resolveStepRuntimeStatus,
  workflowInstanceStatusLabelVi,
} from './workflowInstanceMapper';

describe('workflowInstanceMapper', () => {
  it('maps API instance list row', () => {
    const item = apiRowToWorkflowInstanceListItem({
      id: 'i1',
      definition_id: 'd1',
      workflow_code: 'WF-TD',
      workflow_name: 'Tuyển dụng',
      status: 'pending',
      business_type: 'hrm_leave',
      business_id: 'b1',
      created_at: '2026-05-23T10:00:00Z',
    });
    expect(item.id).toBe('i1');
    expect(item.definitionId).toBe('d1');
    expect(item.workflowCode).toBe('WF-TD');
  });

  it('normalizes instance detail with tasks array', () => {
    const detail = normalizeWorkflowInstanceDetail({
      instance: { id: 'i1', status: 'pending' },
      tasks: [{ step_key: 'ws-1', status: 'completed' }],
    });
    expect(detail?.instance.id).toBe('i1');
    expect(detail?.tasks).toHaveLength(1);
  });

  it('builds step runtime status map from tasks', () => {
    const map = buildStepRuntimeStatusMap([
      { step_key: 'ws-1', status: 'completed' },
      { step_key: 'ws-2', status: 'pending' },
    ]);
    expect(map['ws-1']).toBe('completed');
    expect(map['ws-2']).toBe('pending');
  });

  it('resolves runtime status by step id or order key', () => {
    const map = buildStepRuntimeStatusMap([{ step_key: 'step-2', status: 'rejected' }]);
    const step: WorkflowGraphStep = {
      id: 'other-id',
      order: 2,
      taskName: 'X',
      handlerRoleId: 'dept_head',
      stepAction: 'approve',
      slaHours: 1,
      relatedModuleId: 'hr',
      transitions: [],
    };
    expect(resolveStepRuntimeStatus({ ...step, id: 'ws-other', order: 3 }, map)).toBeUndefined();
    expect(resolveStepRuntimeStatus(step, map)).toBe('rejected');
  });

  it('counts instances per definition', () => {
    const counts = countInstancesByDefinitionId([
      apiRowToWorkflowInstanceListItem({ id: '1', definition_id: 'd1' }),
      apiRowToWorkflowInstanceListItem({ id: '2', definition_id: 'd1' }),
      apiRowToWorkflowInstanceListItem({ id: '3', definition_id: 'd2' }),
    ]);
    expect(counts.d1).toBe(2);
    expect(counts.d2).toBe(1);
  });

  it('labels instance status in Vietnamese', () => {
    expect(workflowInstanceStatusLabelVi('completed')).toBe('Hoàn thành');
    expect(workflowInstanceStatusLabelVi('unknown')).toBe('unknown');
  });
});
