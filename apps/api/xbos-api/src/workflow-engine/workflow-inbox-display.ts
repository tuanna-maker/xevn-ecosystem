/**
 * @CODE-MEMORY
 * Screen:     Command Center Inbox — GET /workflow-engine/tasks display-ready
 * UC:         J-REC-WF-03 · UF-XBOS-08 · HP-03
 * BR:         This-wave YCTD stamp must surface without FE join / seed
 * SRS:        docs/qa/evidence/po-e2e-spine-01-qa-w2.md § SP3 / HP-03
 * TechSpec:   ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE · OS 28 display-ready
 * Purpose:    Enrich step-task rows with subject_title/display_title so Inbox
 *   cards show requisition/plan/candidate subject (stamp) for this-wave match.
 *   FE maps title from workflow_name today — keep compat by composing name · subject.
 * WorkItem:   PO-E2E-SPINE-01-BE-INBOX-01
 * Coded:      2026-08-03
 * Callers:    WorkflowEngineService.listStepTasks
 * Callees:    none (pure)
 * must_keep:  Leave/AUTH/EMP/CAT · assignee filter · U65 no seed
 * SOLID:      SRP — display enrichment only; no spawn/assignee mutation
 * LastVerified: workflow-inbox-display.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-BE-INBOX-01
 * change_mode: ADD
 * What: subjectTitle from instance context → subject_title + display_title +
 *   workflow_name compat for CC inbox this-wave stamp (holding spawn / main list)
 * Why: QA HP-03 priorRec=true but stamp absent — assignee OK, title generic
 * must_keep: leave rows unchanged when no subjectTitle
 */

export type WorkflowInboxTaskRow = Record<string, unknown> & {
  workflow_name?: string | null;
  step_key?: string | null;
  business_type?: string | null;
  business_id?: string | null;
  context?: unknown;
  subject_title?: string | null;
  display_title?: string | null;
  workflow_definition_name?: string | null;
};

export function readSubjectTitleFromContext(context: unknown): string {
  if (!context || typeof context !== 'object' || Array.isArray(context)) return '';
  const c = context as Record<string, unknown>;
  for (const key of ['subjectTitle', 'subject_title', 'businessTitle', 'business_title'] as const) {
    const raw = c[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return '';
}

/**
 * Compose Inbox card title: prefer business subject (YCTD stamp) while keeping
 * definition name as secondary signal for prior-task regex (tuyển / requisition).
 */
export function composeInboxDisplayTitle(
  workflowName: string,
  subjectTitle: string,
  stepKey?: string | null,
): string {
  const name = workflowName.trim();
  const subject = subjectTitle.trim();
  if (subject && name) return `${name} · ${subject}`;
  if (subject) return subject;
  if (name) return name;
  return String(stepKey ?? 'Nhiệm vụ phê duyệt').trim() || 'Nhiệm vụ phê duyệt';
}

export function enrichWorkflowInboxTaskRow(row: WorkflowInboxTaskRow): WorkflowInboxTaskRow {
  const workflowDefinitionName = String(row.workflow_name ?? '').trim();
  const subjectTitle = readSubjectTitleFromContext(row.context);
  const displayTitle = composeInboxDisplayTitle(
    workflowDefinitionName,
    subjectTitle,
    row.step_key,
  );
  return {
    ...row,
    subject_title: subjectTitle || null,
    display_title: displayTitle,
    workflow_definition_name: workflowDefinitionName || null,
    // FE CommandCenterInboxApi maps UnifiedTask.title from workflow_name
    workflow_name: displayTitle,
  };
}

/** Ensure Group CEO portal approver has a pending step when role fan-out omits them. */
export function ensureGroupApproverAmongInboxSteps(
  steps: Array<Record<string, unknown>>,
  groupApproverUserId: string,
): Array<Record<string, unknown>> {
  const approver = groupApproverUserId.trim().toLowerCase();
  if (!approver || steps.length === 0) return steps;
  const hasApprover = steps.some(
    (s) => String(s.assigneeUserId ?? s.assignee_user_id ?? '').trim().toLowerCase() === approver,
  );
  if (hasApprover) return steps;
  const template = steps[0] ?? {};
  return [
    ...steps,
    {
      ...template,
      assigneeUserId: approver,
      resolvedVia: 'fixed_user',
      escalated: true,
      escalationReason: 'group_approver_inbox_ensure',
    },
  ];
}
