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
  inboxApproveActionLabelVi,
  isHrmLeaveInboxTask,
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
    expect(task.businessType).toBe('hrm_leave');
  });

  it('R-SPINE-WEB-APPROVE-UX-01: leave approve label is Duyệt', () => {
    const leave = mapWorkflowTaskToUnifiedTask({
      id: 't-leave-2',
      instance_id: 'i-leave-2',
      status: 'pending',
      assignee_user_id: 'ceo@xe.vn',
      business_type: 'hrm_leave',
      workflow_name: 'Phê duyệt đơn nghỉ phép HRM',
    });
    expect(isHrmLeaveInboxTask(leave)).toBe(true);
    expect(inboxApproveActionLabelVi(leave)).toBe('Duyệt');
    expect(inboxApproveActionLabelVi({ businessType: 'hrm_requisition', title: 'YCTD' })).toBe(
      'Xử lý nhanh',
    );
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

  it('PO-E2E-SPINE-01-BE-INBOX-01: prefers display_title / subject_title for this-wave stamp', () => {
    const task = mapWorkflowTaskToUnifiedTask({
      id: 't-rec',
      instance_id: '5590cbb1-80ff-4c1b-af72-4a78ce3a3782',
      status: 'pending',
      assignee_user_id: 'ceo@xe.vn',
      business_type: 'hrm_requisition',
      workflow_name: 'Phê duyệt yêu cầu tuyển dụng HRM',
      subject_title: 'YCTD HireToPay SP2SDD8FM8',
      display_title: 'Phê duyệt yêu cầu tuyển dụng HRM · YCTD HireToPay SP2SDD8FM8',
    });
    expect(task.title).toContain('SP2SDD8FM8');
    expect(task.subtitle).toMatch(/tuyển|YCTD|requisition/i);
  });

  it('fetchCommandCenterInboxTasks filters by logged-in assignee', async () => {
    listWorkflowTasks.mockResolvedValue([]);
    await fetchCommandCenterInboxTasks('xevn');
    expect(listWorkflowTasks).toHaveBeenCalledWith('xevn', 'pending', 'ceo@xe.vn', undefined);
  });
});
