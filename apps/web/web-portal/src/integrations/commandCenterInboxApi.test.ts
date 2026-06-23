import { describe, expect, it, vi } from 'vitest';

const { listWorkflowTasks } = vi.hoisted(() => ({
  listWorkflowTasks: vi.fn(),
}));

vi.mock('./authSession', () => ({
  getStoredUser: () => ({ userId: 'ceo@xe.vn', displayName: 'CEO' }),
}));

vi.mock('./workflowEngineApi', () => ({
  listWorkflowTasks,
}));

import {
  mapWorkflowTaskToUnifiedTask,
  resolveInboxAssigneeUserId,
  fetchCommandCenterInboxTasks,
} from './commandCenterInboxApi';

describe('commandCenterInboxApi (BR-INBOX-01 / P0-CRUD-06)', () => {
  it('resolveInboxAssigneeUserId prefers session user', () => {
    expect(resolveInboxAssigneeUserId()).toBe('ceo@xe.vn');
  });

  it('mapWorkflowTaskToUnifiedTask maps hat_key for multi-hat complete', () => {
    const task = mapWorkflowTaskToUnifiedTask({
      id: 't1',
      instance_id: 'i1',
      step_key: 'approve-dept',
      hat_key: 'dept_head',
      status: 'pending',
      assignee_user_id: 'ceo@xe.vn',
      business_type: 'hrm_payroll',
      workflow_name: 'Demo WF',
    });
    expect(task.cardId).toBe('t1');
    expect(task.workflowHatKey).toBe('dept_head');
    expect(task.sourceId).toBe('i1');
    expect(task.subtitle).toBe('Tiền lương');
  });

  it('fetchCommandCenterInboxTasks filters by logged-in assignee', async () => {
    listWorkflowTasks.mockResolvedValue([]);
    await fetchCommandCenterInboxTasks('xevn');
    expect(listWorkflowTasks).toHaveBeenCalledWith('xevn', 'pending', 'ceo@xe.vn');
  });
});
