/**
 * @CODE-MEMORY
 * Screen: Command Center Inbox · deep-link drawer (J-XBOS-01 / J-REC-WF-03/06)
 * UC: UC-HRM-REC-WF-03 · J-XBOS-01
 * BR: BR-INBOX-01 — complete/reject must POST `/workflow-engine/tasks/:taskId` (not instance id)
 * SRS: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md § Inbox duyệt
 * TechSpec: XBOS workflow-engine tasks complete/reject
 * Purpose: Resolve actionable task id for CC inbox deep links. Instance id opens detail;
 *   synthetic cardId=instanceId caused brief reject/complete 404 (R-XHRM-REC-WF-DEEPLINK-TASKID).
 * WorkItem: R-XHRM-REC-WF-DEEPLINK-TASKID
 * Coded: 2026-07-20
 * Callers: CommandCenterPage → openInboxTaskDetail / deep-link effects / drawer action gate
 * Callees: UnifiedTask cardId · instance detail pending rows
 * FEActions: Deep-link open → match wfTaskId|inbox|pending detail → Xử lý uses task id
 * Impact: Wrong cardId → POST tasks/{instanceId} 404; must_keep J-02/03/06 card path OK
 * must_keep: J-REC-WF-02/03/06 GWC; wfInstanceId still valid for detail fetch (J-XBOS-01)
 * SOLID: Pure deep-link/task-id resolution — no React/fetch here
 * LastVerified: inboxDeepLink.test.ts
 */

import type { UnifiedTask } from '../../data/command-center-types';

const INSTANCE_SYNTHETIC_PREFIX = 'wf-inst-';

/** Instance-only stub before inbox/detail hydrates a real step task id. */
export function isInstanceOnlySyntheticInboxTask(task: {
  cardId: string;
  sourceId: string;
  dedupeKey: string;
}): boolean {
  return task.dedupeKey.startsWith(INSTANCE_SYNTHETIC_PREFIX);
}

/** True when complete/reject may safely use `task.cardId` as workflow step task id. */
export function isActionableWorkflowInboxTask(task: {
  cardId: string;
  sourceId: string;
  dedupeKey: string;
}): boolean {
  const id = task.cardId.trim();
  if (!id) return false;
  if (isInstanceOnlySyntheticInboxTask(task)) return false;
  return true;
}

export function buildSyntheticInboxTaskFromDeepLink(opts: {
  instanceId: string;
  taskId?: string | null;
}): UnifiedTask {
  const instanceId = opts.instanceId.trim();
  const taskId = opts.taskId?.trim();
  if (taskId) {
    return {
      cardId: taskId,
      sourceId: instanceId,
      sourceSystem: 'xbos-workflow',
      dedupeKey: `wf-task-${taskId}`,
      statusNormalized: 'PENDING_APPROVAL',
      orgUnitId: '',
      moduleCode: 'business',
      title: 'Chi tiết quy trình',
      assigneeUserId: '',
      assigneeName: '',
      priority: 'medium',
    };
  }
  return {
    cardId: instanceId,
    sourceId: instanceId,
    sourceSystem: 'xbos-workflow',
    dedupeKey: `${INSTANCE_SYNTHETIC_PREFIX}${instanceId}`,
    statusNormalized: 'PENDING_APPROVAL',
    orgUnitId: '',
    moduleCode: 'business',
    title: 'Chi tiết quy trình',
    assigneeUserId: '',
    assigneeName: '',
    priority: 'medium',
  };
}

export function matchInboxTaskForDeepLink(
  tasks: UnifiedTask[],
  opts: { taskId?: string | null; instanceId?: string | null },
): UnifiedTask | undefined {
  const taskId = opts.taskId?.trim();
  if (taskId) {
    const byCard = tasks.find((t) => t.cardId === taskId);
    if (byCard) return byCard;
  }
  const instanceId = opts.instanceId?.trim();
  if (instanceId) {
    return tasks.find((t) => t.sourceId === instanceId);
  }
  return undefined;
}

/**
 * Prefer assignee's pending step; else single pending task on the instance.
 * Returns null when ambiguous (multi-pending) so FE does not guess wrong id.
 */
export function resolveActionableTaskIdFromInstanceDetail(
  detailTasks: Record<string, unknown>[],
  assigneeUserId?: string | null,
): string | null {
  const pending = detailTasks.filter((row) => {
    const status = String(row.status ?? 'pending').toLowerCase();
    return status === 'pending' || status === 'in_progress';
  });
  const assignee = assigneeUserId?.trim();
  if (assignee) {
    const mine = pending.find((row) => String(row.assignee_user_id ?? '') === assignee);
    const id = mine?.id != null ? String(mine.id).trim() : '';
    if (id) return id;
  }
  if (pending.length === 1) {
    const id = pending[0]?.id != null ? String(pending[0].id).trim() : '';
    return id || null;
  }
  return null;
}

/** Upgrade instance-only stub once a real step task id is known. */
export function withResolvedInboxTaskId(
  task: UnifiedTask,
  taskId: string,
): UnifiedTask {
  const id = taskId.trim();
  if (!id || task.cardId === id) return { ...task, dedupeKey: `wf-task-${id}` };
  return {
    ...task,
    cardId: id,
    dedupeKey: `wf-task-${id}`,
  };
}
