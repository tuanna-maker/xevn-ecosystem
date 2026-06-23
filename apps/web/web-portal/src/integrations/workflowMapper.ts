import {
  WF_NODE_BOD,
  WF_NODE_END_OK,
  WF_NODE_END_REJECT,
  WORKFLOW_TRANSITION_KINDS,
  createDefaultTransitions,
  ensureTransitions,
  type WorkflowDefinition,
  type WorkflowGraphStep,
  type WorkflowGraphTransition,
  type WorkflowStepAction,
  type WorkflowTransitionKind,
} from '../data/workflow-graph';

export type WorkflowDefinitionApiRow = {
  id: string;
  workflow_code?: string;
  name?: string;
  graph?: unknown;
  company_id?: string | null;
  category?: string;
  scope_level?: string;
  status?: string;
};

function parseGraphValue(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return {};
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (Array.isArray(raw)) return {};
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}

/**
 * Accept workflow-engine graph as `{ steps: [...] }` or a bare step array (D-8088-WF-DEF-01).
 */
export function extractGraphSteps(raw: unknown): unknown {
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw;
  const graph = parseGraphValue(raw);
  const steps = graph.steps ?? graph.nodes;
  return Array.isArray(steps) ? steps : [];
}

function normalizeStepAction(value: unknown): WorkflowStepAction {
  const v = String(value ?? 'approve').toLowerCase();
  if (v === 'sign') return 'sign';
  if (v === 'input') return 'input';
  return 'approve';
}

function normalizeTransitionKind(value: unknown): WorkflowTransitionKind | null {
  const kind = String(value ?? '').toLowerCase();
  if (kind === 'approve' || kind === 'reject' || kind === 'exception') return kind;
  return null;
}

function hatKeyToHandlerRole(hatKey: string): string {
  if (hatKey === 'group_ceo') return 'bod';
  if (hatKey.startsWith('raci_')) return hatKey;
  return hatKey || 'staff';
}

function normalizeTransitions(
  raw: unknown,
  order: number,
  totalSteps: number,
  nextStepId: string | null,
): WorkflowGraphTransition[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const mapped = raw
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const row = entry as Record<string, unknown>;
        const kind = normalizeTransitionKind(row.kind);
        if (!kind) return null;
        return {
          kind,
          destinationId: String(
            row.destinationId ?? row.destination_id ?? WF_NODE_END_OK,
          ),
        };
      })
      .filter((t): t is WorkflowGraphTransition => t !== null);
    if (mapped.length > 0) return ensureTransitions(mapped);
  }

  const approveTo = nextStepId ?? WF_NODE_END_OK;
  const rejectTo = order >= totalSteps ? WF_NODE_END_REJECT : nextStepId ?? WF_NODE_END_REJECT;
  return createDefaultTransitions({
    approveTo,
    rejectTo,
    exceptionTo: WF_NODE_BOD,
  });
}

/**
 * Normalize workflow-engine definition graph steps (canvas, seed inbox, catalog runtime).
 * UC-XBOS-CC-06 — FE canvas reads `GET /workflow-engine/definitions` graph JSONB.
 */
export function normalizeGraphSteps(rawSteps: unknown): WorkflowGraphStep[] {
  if (!Array.isArray(rawSteps)) return [];

  const sorted = [...rawSteps]
    .map((raw, index) => ({ raw, index }))
    .sort((a, b) => {
      const rowA = a.raw as Record<string, unknown>;
      const rowB = b.raw as Record<string, unknown>;
      const ao = Number(rowA.order ?? a.index + 1);
      const bo = Number(rowB.order ?? b.index + 1);
      return ao - bo;
    });

  const stepIds = sorted.map(({ raw, index }) => {
    const row = raw as Record<string, unknown>;
    const order = Number(row.order ?? index + 1);
    return String(row.id ?? row.stepKey ?? row.step_key ?? `step-${order}`);
  });

  return sorted.map(({ raw, index }, idx) => {
    const row = raw as Record<string, unknown>;
    const order = Number(row.order ?? index + 1);
    const id = stepIds[idx]!;
    const nextStepId = idx < sorted.length - 1 ? stepIds[idx + 1]! : null;
    const taskName = String(row.taskName ?? row.label ?? row.name ?? '—');
    const handlerRoleId = hatKeyToHandlerRole(
      String(
        row.handlerRoleId ??
          row.hatKey ??
          row.hat_key ??
          row.roleHat ??
          row.role_hat ??
          'staff',
      ),
    );
    const stepAction = normalizeStepAction(row.stepAction ?? row.action);
    const slaHours = Number(row.slaHours ?? row.sla_hours ?? 24);
    const relatedModuleId = String(
      row.relatedModuleId ?? row.related_module_id ?? row.moduleHint ?? 'xbos',
    );
    const transitions = normalizeTransitions(
      row.transitions,
      order,
      sorted.length,
      nextStepId,
    );
    return {
      id,
      order,
      taskName,
      handlerRoleId,
      stepAction,
      slaHours,
      relatedModuleId,
      transitions,
    };
  });
}

export function apiRowToWorkflowDefinition(row: WorkflowDefinitionApiRow): WorkflowDefinition {
  const graph = parseGraphValue(row.graph);
  const steps = normalizeGraphSteps(extractGraphSteps(row.graph));
  const totalFromSteps = steps.reduce((sum, step) => sum + step.slaHours, 0);

  return {
    id: String(row.id),
    code: String(row.workflow_code ?? graph.code ?? ''),
    name: String(row.name ?? ''),
    applyingEntityId: String(graph.applyingEntityId ?? graph.applying_entity_id ?? row.company_id ?? ''),
    triggerEvent: String(graph.triggerEvent ?? graph.trigger_event ?? ''),
    totalSlaHours: Number(graph.totalSlaHours ?? graph.total_sla_hours ?? totalFromSteps),
    steps,
  };
}

export function workflowDefinitionToApiPayload(def: WorkflowDefinition): Record<string, unknown> {
  return {
    workflowCode: def.code,
    code: def.code,
    name: def.name,
    category: 'general',
    scopeLevel: 'group',
    graph: {
      code: def.code,
      applyingEntityId: def.applyingEntityId,
      triggerEvent: def.triggerEvent,
      totalSlaHours: def.totalSlaHours,
      steps: def.steps,
    },
    conditions: {},
    status: 'active',
  };
}

/** @internal test helper */
export function isCanvasReadyGraphStep(step: WorkflowGraphStep): boolean {
  return (
    Boolean(step.id) &&
    Boolean(step.taskName) &&
    WORKFLOW_TRANSITION_KINDS.every((kind) =>
      step.transitions.some((t) => t.kind === kind && Boolean(t.destinationId)),
    )
  );
}
