/**
 * @CODE-MEMORY
 * Screen: Command Center Inbox deep-link helpers (unit)
 * UC: UC-HRM-REC-WF-03 · J-XBOS-01
 * BR: BR-INBOX-01
 * WorkItem: R-XHRM-REC-WF-DEEPLINK-TASKID
 * Coded: 2026-07-20
 * Purpose: Guard that Xử lý never uses instance-only synthetic cardId.
 * LastVerified: vitest inboxDeepLink.test.ts
 */
import { describe, expect, it } from 'vitest';
import type { UnifiedTask } from '../../data/command-center-types';
import {
  buildSyntheticInboxTaskFromDeepLink,
  isActionableWorkflowInboxTask,
  isInstanceOnlySyntheticInboxTask,
  matchInboxTaskForDeepLink,
  resolveActionableTaskIdFromInstanceDetail,
  withResolvedInboxTaskId,
} from './inboxDeepLink';

const realTask: UnifiedTask = {
  cardId: 'task-abc',
  sourceSystem: 'xbos-workflow',
  sourceId: 'inst-xyz',
  dedupeKey: 'wf-task-task-abc',
  statusNormalized: 'PENDING_APPROVAL',
  orgUnitId: 'main',
  moduleCode: 'hrm',
  title: 'Phê duyệt YCTD',
  assigneeUserId: 'ceo@xe.vn',
  assigneeName: 'ceo@xe.vn',
  priority: 'medium',
};

describe('inboxDeepLink (R-XHRM-REC-WF-DEEPLINK-TASKID)', () => {
  it('marks instance-only synthetic as non-actionable (must not POST instance id)', () => {
    const stub = buildSyntheticInboxTaskFromDeepLink({ instanceId: 'inst-xyz' });
    expect(isInstanceOnlySyntheticInboxTask(stub)).toBe(true);
    expect(isActionableWorkflowInboxTask(stub)).toBe(false);
    expect(stub.cardId).toBe('inst-xyz');
    expect(stub.dedupeKey).toBe('wf-inst-inst-xyz');
  });

  it('builds actionable synthetic when wfTaskId is present', () => {
    const stub = buildSyntheticInboxTaskFromDeepLink({
      instanceId: 'inst-xyz',
      taskId: 'task-abc',
    });
    expect(isInstanceOnlySyntheticInboxTask(stub)).toBe(false);
    expect(isActionableWorkflowInboxTask(stub)).toBe(true);
    expect(stub.cardId).toBe('task-abc');
    expect(stub.sourceId).toBe('inst-xyz');
  });

  it('prefers wfTaskId match over instance id when both present', () => {
    const other: UnifiedTask = { ...realTask, cardId: 'task-other', sourceId: 'inst-xyz', dedupeKey: 'wf-task-other' };
    const matched = matchInboxTaskForDeepLink([other, realTask], {
      taskId: 'task-abc',
      instanceId: 'inst-xyz',
    });
    expect(matched?.cardId).toBe('task-abc');
  });

  it('falls back to instance id match from inbox list (J-XBOS-01)', () => {
    const matched = matchInboxTaskForDeepLink([realTask], { instanceId: 'inst-xyz' });
    expect(matched?.cardId).toBe('task-abc');
  });

  it('resolves pending task id from instance detail for current assignee', () => {
    const id = resolveActionableTaskIdFromInstanceDetail(
      [
        { id: 't-admin', status: 'pending', assignee_user_id: 'admin@xe.vn' },
        { id: 't-ceo', status: 'pending', assignee_user_id: 'ceo@xe.vn' },
      ],
      'ceo@xe.vn',
    );
    expect(id).toBe('t-ceo');
  });

  it('resolves single pending task when assignee not matched', () => {
    const id = resolveActionableTaskIdFromInstanceDetail(
      [{ id: 'only-pending', status: 'pending', assignee_user_id: 'other@xe.vn' }],
      'ceo@xe.vn',
    );
    expect(id).toBe('only-pending');
  });

  it('returns null when multi-pending and no assignee match (no guess)', () => {
    const id = resolveActionableTaskIdFromInstanceDetail(
      [
        { id: 'a', status: 'pending', assignee_user_id: 'a@xe.vn' },
        { id: 'b', status: 'pending', assignee_user_id: 'b@xe.vn' },
      ],
      'ceo@xe.vn',
    );
    expect(id).toBeNull();
  });

  it('upgrades instance stub to real task id for Xử lý', () => {
    const stub = buildSyntheticInboxTaskFromDeepLink({ instanceId: 'inst-xyz' });
    const upgraded = withResolvedInboxTaskId(stub, 'task-abc');
    expect(isActionableWorkflowInboxTask(upgraded)).toBe(true);
    expect(upgraded.cardId).toBe('task-abc');
    expect(upgraded.sourceId).toBe('inst-xyz');
  });
});
