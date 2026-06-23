import { beforeEach, describe, expect, it, vi } from 'vitest';

const { xbosFetch } = vi.hoisted(() => ({
  xbosFetch: vi.fn(),
}));

vi.mock('./xbosHttp', () => ({
  xbosFetch,
  xbosGetData: vi.fn(),
}));

vi.mock('./authSession', () => ({
  getStoredUser: () => ({ userId: 'ceo@xe.vn', displayName: 'CEO' }),
}));

import {
  applyWorkflowInboxTaskDecision,
  buildWorkflowTaskActionPayload,
} from './workflowEngineApi';

describe('workflowEngineApi inbox decisions (P0-CRUD-06)', () => {
  beforeEach(() => {
    xbosFetch.mockReset();
    xbosFetch.mockResolvedValue({ data: { ok: true } });
  });

  it('buildWorkflowTaskActionPayload includes hatKey and userId for approve', () => {
    expect(
      buildWorkflowTaskActionPayload({ workflowHatKey: 'dept_head' }, 'approved', 'ceo@xe.vn'),
    ).toEqual({
      outcome: 'approved',
      userId: 'ceo@xe.vn',
      hatKey: 'dept_head',
    });
  });

  it('buildWorkflowTaskActionPayload adds reason for reject', () => {
    expect(buildWorkflowTaskActionPayload({}, 'rejected')).toMatchObject({
      outcome: 'rejected',
      userId: 'ceo@xe.vn',
      reason: 'rejected_from_portal',
    });
  });

  it('applyWorkflowInboxTaskDecision posts to complete when approved', async () => {
    await applyWorkflowInboxTaskDecision(
      { cardId: 'task-uuid-1', workflowHatKey: 'dept_head' },
      'approved',
      'xevn',
    );
    expect(xbosFetch).toHaveBeenCalledWith(
      '/workflow-engine/tasks/task-uuid-1/complete',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          outcome: 'approved',
          userId: 'ceo@xe.vn',
          hatKey: 'dept_head',
        }),
      }),
    );
  });

  it('applyWorkflowInboxTaskDecision posts to reject when rejected', async () => {
    await applyWorkflowInboxTaskDecision({ cardId: 'task-uuid-2' }, 'rejected', 'xevn');
    expect(xbosFetch).toHaveBeenCalledWith(
      '/workflow-engine/tasks/task-uuid-2/reject',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('rejected_from_portal'),
      }),
    );
  });
});
