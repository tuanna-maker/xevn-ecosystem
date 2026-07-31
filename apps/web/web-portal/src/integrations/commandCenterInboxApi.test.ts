import { describe, expect, it, vi } from 'vitest';

const { listWorkflowTasks, mockStoredUser } = vi.hoisted(() => ({
  listWorkflowTasks: vi.fn(),
  mockStoredUser: { current: { userId: 'ceo@xe.vn', displayName: 'CEO' } as Record<string, string> | null },
}));

vi.mock('./authSession', () => ({
  getStoredUser: () => mockStoredUser.current,
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

  it('resolveInboxAssigneeUserId falls back to stored email when userId absent', () => {
    mockStoredUser.current = { email: 'ceo@xe.vn' };
    expect(resolveInboxAssigneeUserId()).toBe('ceo@xe.vn');
    mockStoredUser.current = { userId: 'ceo@xe.vn', displayName: 'CEO' };
  });

  it('mapWorkflowTaskToUnifiedTask labels hrm_leave for inbox cards', () => {
    const task = mapWorkflowTaskToUnifiedTask({
      id: 't-leave',
      instance_id: 'i-leave',
      status: 'pending',
      assignee_user_id: 'ceo@xe.vn',
      business_type: 'hrm_leave',
      workflow_name: 'Phê duyệt nghỉ phép',
    });
    expect(task.subtitle).toBe('Nghỉ phép');
    expect(task.title).toBe('Phê duyệt nghỉ phép');
    expect(task.moduleCode).toBe('hrm');
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
