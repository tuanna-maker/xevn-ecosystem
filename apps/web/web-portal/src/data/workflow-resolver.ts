/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cấu hình → Quy trình (graph + canvas step drawer)
 * UC:         UC-XBOS-13 (resolver extension) · AC-CD-F4-06
 * BR:         BR-CD-F4-02..04 · ADR-WORKFLOW-RESOLVER-DYNAMIC §5
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §4.3–4.5
 * TechSpec:   docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md §5
 * Purpose:    Normative FE labels + default resolver_config for canvas edit/persist.
 * WorkItem:   CD-FB-07-WF-CANVAS-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - workflow-graph.ts / workflowMapper.ts / WorkflowStepResolverFields.tsx
 *
 * Callees:
 *   - N/A (pure constants/helpers)
 *
 * FE-Actions:
 *   | User action              | Handler                         | Lib / RPC              |
 *   |--------------------------|---------------------------------|------------------------|
 *   | Select resolver_type     | patchWorkflowStepRow            | PUT definitions/:id    |
 *
 * Impact:     Wrong enum → XBOS-WF-400 on save or silent drop after F5
 * must_keep:  ADR enum values; snake_case wire keys on PUT; U65 no seed
 * SOLID:      SRP — resolver catalog separate from graph layout/canvas
 * LastVerified: workflowMapper.test.ts round-trip resolver_type
 */

/** ADR-WORKFLOW-RESOLVER-DYNAMIC §5.1 */
export type WorkflowResolverType =
  | 'fixed_user'
  | 'position_template'
  | 'direct_manager'
  | 'role_code'
  | 'parallel_group'
  | 'payload_reference'
  | 'matrix_lookup';

export type WorkflowResolverConfig = Record<string, unknown>;

export const WORKFLOW_RESOLVER_TYPES: ReadonlyArray<{
  id: WorkflowResolverType;
  label: string;
}> = [
  { id: 'direct_manager', label: 'Quản lý trực tiếp (direct_manager)' },
  { id: 'position_template', label: 'Chức danh (position_template)' },
  { id: 'parallel_group', label: 'Song song (parallel_group)' },
  { id: 'fixed_user', label: 'User cố định (fixed_user)' },
  { id: 'role_code', label: 'Mã vai trò (role_code)' },
  { id: 'payload_reference', label: 'Theo dữ liệu form (payload_reference)' },
  { id: 'matrix_lookup', label: 'Ma trận phê duyệt (matrix_lookup)' },
];

export const WORKFLOW_RESOLVER_TYPE_LABELS: Record<WorkflowResolverType, string> = {
  direct_manager: 'Quản lý trực tiếp',
  position_template: 'Chức danh',
  parallel_group: 'Song song',
  fixed_user: 'User cố định',
  role_code: 'Mã vai trò',
  payload_reference: 'Theo dữ liệu form',
  matrix_lookup: 'Ma trận phê duyệt',
};

const KNOWN = new Set<string>(WORKFLOW_RESOLVER_TYPES.map((t) => t.id));

export function isWorkflowResolverType(value: unknown): value is WorkflowResolverType {
  return typeof value === 'string' && KNOWN.has(value);
}

export function normalizeResolverType(raw: unknown): WorkflowResolverType | undefined {
  if (!isWorkflowResolverType(raw)) return undefined;
  return raw;
}

export function defaultResolverConfig(type: WorkflowResolverType): WorkflowResolverConfig {
  switch (type) {
    case 'direct_manager':
      return { fallback_role_code: 'hrbp' };
    case 'position_template':
      return { position_code: '', company_id: 'main' };
    case 'fixed_user':
      return { user_id: '' };
    case 'role_code':
      return { role_code: '', tenant_id: 'xevn' };
    case 'parallel_group':
      return {
        resolver_types: ['direct_manager', 'position_template'],
        resolver_configs: [{}, { position_code: '', company_id: 'main' }],
        parallel_policy: 'all',
      };
    case 'payload_reference':
      return { field_path: 'payload.department.managerId', fallback_role_code: 'admin' };
    case 'matrix_lookup':
      return { matrix_code: 'APPROVAL_MATRIX_1', context_fields: ['payload.position_code'] };
    default:
      return {};
  }
}

export function workflowResolverLabel(type: WorkflowResolverType | undefined): string {
  if (!type) return 'Legacy (hat / cố định)';
  return WORKFLOW_RESOLVER_TYPE_LABELS[type] ?? type;
}
