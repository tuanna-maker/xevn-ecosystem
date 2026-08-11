/** ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5 — normative resolver types */
export type ResolverType =
  | 'fixed_user'
  | 'position_template'
  | 'direct_manager'
  | 'role_code'
  | 'parallel_group';

export type ParallelPolicy = 'all' | 'any';

export type ResolverRuntimeContext = {
  tenantId: string;
  companyId: string;
  submitter: {
    userId: string;
    employeeId: string;
    companyId: string;
    companySlug?: string;
  };
  businessType: string;
  businessId: string;
  stepKey: string;
};

export type ResolvedAssignee = {
  assigneeUserId: string;
  hatKey: string;
  assignmentId?: string;
  resolvedVia: ResolverType;
  escalated: boolean;
  escalationReason?: string;
  parallelGroupId?: string;
  parallelPolicy?: ParallelPolicy;
  autoSkipped?: boolean;
  skipReason?: string;
};

export type WorkflowGraphStepRow = Record<string, unknown>;

export type ResolverDataSource = {
  isUserActive(userId: string): Promise<boolean>;
  queryPositionAssignments(
    tenantId: string,
    companyId: string,
    positionCode: string,
  ): Promise<Array<{ userId: string; assignmentId: string; hatKey: string }>>;
  queryRoleMembership(tenantId: string, roleCode: string): Promise<string[]>;
  queryDirectManagerUserId(employeeId: string, companyId: string): Promise<string | null>;
  queryManagerEmployeeId(employeeId: string): Promise<string | null>;
};

export type ResolverEscalationLog = {
  code: 'WF-ERR-RESOLVE-ESCALATE';
  tenantId: string;
  stepKey: string;
  resolver_type: ResolverType;
  original_config: Record<string, unknown>;
  escalation_tier: number;
  businessType: string;
  businessId: string;
};
