/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cấu hình → Hệ thống quy trình (canvas persist)
 * UC:         UC-XBOS-CC-06 · UC-XBOS-13 · UC-HRM-REC-WF-01 · AC-CD-F4-06
 * BR:         BR-CD-F4-02..04 · BR-REC-WF-01 · BR-REC-WF-14
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §4.5 ·
 *             docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md §6
 * TechSpec:   docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md §5 ·
 *             docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3–§5
 * Purpose:    Map workflow-engine DB rows ↔ canvas WorkflowDefinition; round-trip
 *             resolver_type; enrich PUT/POST with stepKey / taskType /
 *             conditions.businessType for recruitment bridge spawn (U65).
 * WorkItem:   CD-FB-07-WF-CANVAS-01 · XHRM-REC-WF-FE-CANVAS-01
 * Coded:      2026-05 (baseline) · UPGRADE 2026-07-19
 *
 * Callers:
 *   - CommandCenterPage.tsx → apiRowToWorkflowDefinition / workflowDefinitionToApiPayload
 *   - workflowEngineApi.ts consumers
 *
 * Callees:
 *   - GET/PUT /workflow-engine/definitions → graph JSONB
 *   - hrm-recruitment-workflow-presets (businessType / category)
 *
 * FE-Actions:
 *   | Lưu quy trình | saveWorkflow | workflowDefinitionToApiPayload |
 *   | F5 / reload list | load definitions | normalizeGraphSteps |
 *   | Mẫu QT tuyển dụng | openRecruitmentWorkflowPreset | same payload path |
 *
 * Impact:     Dropping resolver_type / taskType / businessType → SPAWN-MISSING or STAGE-UNMAPPED
 * must_keep:  snake_case resolver_type on wire; F6 rec_* taskType; Leave/catalog graphs; U65 no seed
 * change_mode: UPGRADE
 * SOLID:      SRP — transport mapping only
 * LastVerified: workflowMapper.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: XHRM-REC-WF-FE-CANVAS-01
 * What: category/conditions.businessType from recruitment codes; taskType round-trip; hatKey for bod
 * Why: J-REC-WF-01 create active hrm_* defs via FE so submit-workflow can spawn
 * must_keep: Prior CD-FB-07 resolver_type round-trip; UF-HRM-12; AC-CD-F6-*
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: CD-FB-07-WF-CANVAS-01
 * What: FE canvas/graph edit resolver_type + resolver_config; normalize/PUT preserve after F5
 * Why: QC C-CD-FB-07-02 / AC-CD-F4-06 PARTIAL — resolver dropped on load/save
 * must_keep: XHRM-REC taskType/businessType; closed TEXT/uuid P0; U65 no seed
 */

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
  type WorkflowResolverConfig,
  type WorkflowStepAction,
  type WorkflowTransitionKind,
} from '../data/workflow-graph';
import {
  businessTypeForWorkflowCode,
  categoryForWorkflowCode,
} from '../data/hrm-recruitment-workflow-presets';
import { normalizeResolverType } from '../data/workflow-resolver';

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

function hatKeyForHandlerRole(handlerRoleId: string): string {
  if (handlerRoleId === 'bod') return 'group_ceo';
  return handlerRoleId;
}

function normalizeResolverConfig(raw: unknown): WorkflowResolverConfig | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  return { ...(raw as WorkflowResolverConfig) };
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
    const resolverType = normalizeResolverType(row.resolver_type ?? row.resolverType);
    const resolverConfig = normalizeResolverConfig(
      row.resolver_config ?? row.resolverConfig,
    );
    const taskTypeRaw = row.taskType ?? row.task_type;
    const taskType =
      typeof taskTypeRaw === 'string' && taskTypeRaw.trim() ? taskTypeRaw.trim() : undefined;
    const step: WorkflowGraphStep = {
      id,
      order,
      taskName,
      handlerRoleId,
      stepAction,
      slaHours,
      relatedModuleId,
      transitions,
    };
    if (resolverType) {
      step.resolverType = resolverType;
      step.resolverConfig = resolverConfig ?? {};
    }
    if (taskType) {
      step.taskType = taskType;
    }
    return step;
  });
}

/** Serialize FE step → API graph step (keeps canvas fields + ADR resolver wire keys). */
export function graphStepToApiStep(step: WorkflowGraphStep): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: step.id,
    stepKey: step.id,
    order: step.order,
    taskName: step.taskName,
    name: step.taskName,
    label: step.taskName,
    handlerRoleId: step.handlerRoleId,
    hatKey: hatKeyForHandlerRole(step.handlerRoleId),
    stepAction: step.stepAction,
    action: step.stepAction,
    slaHours: step.slaHours,
    relatedModuleId: step.relatedModuleId,
    transitions: step.transitions,
  };
  if (step.taskType?.trim()) {
    out.taskType = step.taskType.trim();
    out.task_type = step.taskType.trim();
  }
  if (step.resolverType) {
    out.resolver_type = step.resolverType;
    out.resolverType = step.resolverType;
    const cfg = step.resolverConfig ?? {};
    out.resolver_config = cfg;
    out.resolverConfig = cfg;
  }
  return out;
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
  const code = String(def.code ?? '').trim();
  const businessType = businessTypeForWorkflowCode(code);
  return {
    workflowCode: code,
    code,
    name: def.name,
    category: categoryForWorkflowCode(code),
    scopeLevel: 'group',
    graph: {
      code,
      applyingEntityId: def.applyingEntityId,
      triggerEvent: def.triggerEvent,
      totalSlaHours: def.totalSlaHours,
      steps: def.steps.map(graphStepToApiStep),
    },
    conditions: businessType ? { businessType } : {},
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
