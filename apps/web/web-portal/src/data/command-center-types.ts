/**
 * Command Center shared types (M-CC-13 — types only, no runtime mock seed).
 */

export type PersonaRole = 'bod' | 'manager' | 'employee';

export type PortalStatusNormalized =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_APPROVAL'
  | 'DONE'
  | 'CANCELLED';

export interface RailModuleItem {
  moduleCode: string;
  label: string;
  /** Internal portal navigation path */
  href: string;
  allowedRoles: PersonaRole[];
  disabled?: boolean;
  disabledReason?: string;
}

export interface UnifiedTask {
  cardId: string;
  sourceSystem: string;
  sourceId: string;
  dedupeKey: string;
  statusNormalized: PortalStatusNormalized;
  orgUnitId: string;
  moduleCode: string;
  title: string;
  subtitle?: string;
  /**
   * BE workflow `business_type` (e.g. hrm_leave) — used for HDSD leave Duyệt label
   * (R-SPINE-WEB-APPROVE-UX-01). Optional on synthetic deep-link stubs.
   */
  businessType?: string;
  assigneeUserId: string;
  assigneeName: string;
  /** workflow-engine step hat_key — required for multi-hat approve on same instance (BR-XBOS-MULTI-HAT-01). */
  workflowHatKey?: string;
  dueAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PortalAlert {
  id: string;
  moduleCode: string;
  orgUnitId: string;
  level: 'info' | 'warn' | 'critical';
  title: string;
  detail: string;
  sourceSystem: string;
}

export interface KpiSparkPoint {
  label: string;
  value: number;
}

export interface CommandCenterWorkspaceMeta {
  asOf: string;
  dataSyncNote?: string;
}
