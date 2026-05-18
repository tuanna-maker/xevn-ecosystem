import type { WorkflowDefinition, WorkflowGraphStep } from '../data/workflow-graph';

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

function asSteps(value: unknown): WorkflowGraphStep[] {
  if (!value || typeof value !== 'object') return [];
  const graph = value as Record<string, unknown>;
  if (Array.isArray(graph.steps)) return graph.steps as WorkflowGraphStep[];
  return [];
}

export function apiRowToWorkflowDefinition(row: WorkflowDefinitionApiRow): WorkflowDefinition {
  const graph =
    row.graph && typeof row.graph === 'object' ? (row.graph as Record<string, unknown>) : {};
  return {
    id: String(row.id),
    code: String(row.workflow_code ?? graph.code ?? ''),
    name: String(row.name ?? ''),
    applyingEntityId: String(graph.applyingEntityId ?? row.company_id ?? ''),
    triggerEvent: String(graph.triggerEvent ?? ''),
    totalSlaHours: Number(graph.totalSlaHours ?? 0),
    steps: asSteps(graph),
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
