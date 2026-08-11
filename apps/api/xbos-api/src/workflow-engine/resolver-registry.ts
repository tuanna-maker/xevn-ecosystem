/**
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-07-WF-DYNAMIC-BE-FIX-01
 * direct_manager: assign HRM-resolved manager email without requiring
 * xbos_user_tenant_membership (mobile UAT managers lack portal rows).
 * Empty-set escalation only when manager resolve returns null (BR-CD-F4-04).
 * Cite: ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5.1/§6 · F4 AC-CD-F4-01/02.
 * Paired with hrm leave-workflow.bridge TEXT company_id fix (no ::uuid).
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-TERMINAL-01
 * Multi-member role_code / group_ceo escalation fan-out: dedupe assignees by
 * lower(userId) + stamp parallelPolicy=any (same hat) so first approve wins
 * (AC-REC-WF-03 / J-03 under U65 Group CEO without admin inbox).
 * must_keep: parallel_group explicit policy · leave direct_manager single assignee · F4.
 * Cite: ADR-WORKFLOW-RESOLVER-DYNAMIC §6–§7 · BA AC-REC-WF-03.
 */
import { HttpStatus, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { GROUP_APPROVER_USER } from './workflow-catalog.constants';
import {
  assertKnownResolverType,
  defaultEscalationPositionCode,
  normalizeResolverCompanyId,
  parseResolverConfig,
  parseResolverType,
} from './resolver-data-source';
import type {
  ParallelPolicy,
  ResolvedAssignee,
  ResolverDataSource,
  ResolverEscalationLog,
  ResolverRuntimeContext,
  ResolverType,
  WorkflowGraphStepRow,
} from './resolver-registry.types';

export type ResolverRegistryOptions = {
  onEscalation?: (log: ResolverEscalationLog) => void;
};

/** Case-insensitive unique assignees (membership casing variants). */
export function dedupeAssigneesByUserId(assignees: ResolvedAssignee[]): ResolvedAssignee[] {
  const seen = new Set<string>();
  const out: ResolvedAssignee[] = [];
  for (const a of assignees) {
    const id = String(a.assigneeUserId ?? '')
      .trim()
      .toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ ...a, assigneeUserId: id });
  }
  return out;
}

/**
 * When N assignees share one hatKey and no parallelGroupId yet (role_code /
 * escalation fan-out), treat as any-of-role — first complete wins (BR-CD-F4-03).
 * Does not override explicit parallel_group stamping.
 */
export function stampAnyOfSameHatPolicy(assignees: ResolvedAssignee[]): ResolvedAssignee[] {
  if (assignees.length <= 1) return assignees;
  if (assignees.some((a) => a.parallelGroupId)) return assignees;
  const hats = new Set(assignees.map((a) => String(a.hatKey ?? '').trim().toLowerCase()).filter(Boolean));
  if (hats.size !== 1) return assignees;
  const groupId = randomUUID();
  return assignees.map((a) => ({
    ...a,
    parallelGroupId: groupId,
    parallelPolicy: 'any' as ParallelPolicy,
  }));
}

export class ResolverRegistry {
  private readonly logger = new Logger(ResolverRegistry.name);

  constructor(
    private readonly data: ResolverDataSource,
    private readonly options: ResolverRegistryOptions = {},
  ) {}

  validateStepResolver(step: WorkflowGraphStepRow): void {
    const resolverType = parseResolverType(step);
    assertKnownResolverType(resolverType);
    const config = parseResolverConfig(step);
    if (resolverType === 'parallel_group') {
      const policy = String(config.parallel_policy ?? config.parallelPolicy ?? '').trim().toLowerCase();
      if (policy !== 'all' && policy !== 'any') {
        throw new ApiException(
          'XBOS-WF-400',
          'parallel_group requires parallel_policy all|any',
          HttpStatus.BAD_REQUEST,
        );
      }
      const childTypes = config.resolver_types ?? config.resolverTypes;
      if (!Array.isArray(childTypes) || childTypes.length === 0) {
        throw new ApiException(
          'XBOS-WF-400',
          'parallel_group requires resolver_types[]',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async resolveStepTasks(
    step: WorkflowGraphStepRow,
    ctx: ResolverRuntimeContext,
  ): Promise<ResolvedAssignee[]> {
    this.validateStepResolver(step);
    const resolverType = parseResolverType(step) as ResolverType;
    const config = parseResolverConfig(step);
    const stepKey = String(step.stepKey ?? step.step_key ?? ctx.stepKey);
    const parallelGroupId =
      resolverType === 'parallel_group' ? randomUUID() : undefined;
    const parallelPolicy =
      resolverType === 'parallel_group'
        ? (String(config.parallel_policy ?? config.parallelPolicy ?? 'all').toLowerCase() as ParallelPolicy)
        : undefined;

    const resolved = await this.resolveWithSelfApproveGuard(
      resolverType,
      config,
      { ...ctx, stepKey },
      0,
      parallelGroupId,
      parallelPolicy,
    );

    if (resolved.length === 0) {
      throw new ApiException(
        'XBOS-WF-422',
        'Resolver returned zero assignees after escalation',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    // XHRM-REC-WF-BE-TERMINAL-01: dedupe + any-of-same-hat for role/escalation fan-out
    return stampAnyOfSameHatPolicy(dedupeAssigneesByUserId(resolved));
  }

  private async resolveWithSelfApproveGuard(
    resolverType: ResolverType,
    config: Record<string, unknown>,
    ctx: ResolverRuntimeContext,
    escalationTier: number,
    parallelGroupId?: string,
    parallelPolicy?: ParallelPolicy,
    depth = 0,
  ): Promise<ResolvedAssignee[]> {
    const raw = await this.resolveCore(resolverType, config, ctx, escalationTier, parallelGroupId, parallelPolicy);
    const output: ResolvedAssignee[] = [];

    for (const assignee of raw) {
      if (assignee.autoSkipped) {
        output.push(assignee);
        continue;
      }
      if (assignee.assigneeUserId === ctx.submitter.userId && depth < 2) {
        const escalated = await this.escalateSelfApprove(ctx, config, depth + 1);
        if (escalated.length > 0) {
          output.push(...escalated);
          continue;
        }
      }
      output.push(assignee);
    }
    return output;
  }

  private async escalateSelfApprove(
    ctx: ResolverRuntimeContext,
    config: Record<string, unknown>,
    depth: number,
  ): Promise<ResolvedAssignee[]> {
    const managerEmployeeId = await this.data.queryManagerEmployeeId(ctx.submitter.employeeId);
    if (managerEmployeeId) {
      const managerCtx: ResolverRuntimeContext = {
        ...ctx,
        submitter: {
          ...ctx.submitter,
          employeeId: managerEmployeeId,
        },
      };
      return this.resolveWithSelfApproveGuard(
        'direct_manager',
        {},
        managerCtx,
        2,
        undefined,
        undefined,
        depth,
      );
    }
    return this.resolveEscalationChain(ctx, config, 1, depth);
  }

  private async resolveCore(
    resolverType: ResolverType,
    config: Record<string, unknown>,
    ctx: ResolverRuntimeContext,
    escalationTier: number,
    parallelGroupId?: string,
    parallelPolicy?: ParallelPolicy,
  ): Promise<ResolvedAssignee[]> {
    switch (resolverType) {
      case 'fixed_user':
        return this.resolveFixedUser(config, ctx, escalationTier, parallelGroupId, parallelPolicy);
      case 'direct_manager':
        return this.resolveDirectManager(config, ctx, escalationTier, parallelGroupId, parallelPolicy);
      case 'position_template':
        return this.resolvePositionTemplate(config, ctx, escalationTier, parallelGroupId, parallelPolicy);
      case 'role_code':
        return this.resolveRoleCode(config, ctx, escalationTier, parallelGroupId, parallelPolicy);
      case 'parallel_group':
        return this.resolveParallelGroup(config, ctx, escalationTier);
      default:
        assertKnownResolverType(resolverType);
        return [];
    }
  }

  private async resolveFixedUser(
    config: Record<string, unknown>,
    ctx: ResolverRuntimeContext,
    escalationTier: number,
    parallelGroupId?: string,
    parallelPolicy?: ParallelPolicy,
  ): Promise<ResolvedAssignee[]> {
    const userId = String(config.user_id ?? config.userId ?? '').trim().toLowerCase();
    if (!userId) {
      throw new ApiException('XBOS-WF-400', 'fixed_user requires user_id', HttpStatus.BAD_REQUEST);
    }
    if (!(await this.data.isUserActive(userId))) {
      throw new ApiException('XBOS-WF-422', 'fixed_user inactive', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const hatKey = String(config.hat_key ?? config.hatKey ?? 'fixed_user').trim().toLowerCase();
    return [
      {
        assigneeUserId: userId,
        hatKey,
        resolvedVia: 'fixed_user',
        escalated: escalationTier > 0,
        escalationReason: escalationTier > 0 ? 'escalation_tier' : undefined,
        parallelGroupId,
        parallelPolicy,
      },
    ];
  }

  private async resolveDirectManager(
    config: Record<string, unknown>,
    ctx: ResolverRuntimeContext,
    escalationTier: number,
    parallelGroupId?: string,
    parallelPolicy?: ParallelPolicy,
  ): Promise<ResolvedAssignee[]> {
    const managerUserId = await this.data.queryDirectManagerUserId(
      ctx.submitter.employeeId,
      ctx.submitter.companyId,
    );
    // BR-CD-F4-02: HRM manager email is the assignee SoT. Do not require
    // xbos_user_tenant_membership (mobile UAT managers often lack portal rows);
    // empty-set escalation only when manager resolve returns null (BR-CD-F4-04).
    // CD-FB-07-WF-DYNAMIC-BE-FIX-01 residual after company_id TEXT fix.
    if (managerUserId) {
      return [
        {
          assigneeUserId: managerUserId,
          hatKey: 'direct_manager',
          resolvedVia: 'direct_manager',
          escalated: escalationTier > 0,
          escalationReason: escalationTier > 0 ? 'escalation_tier' : undefined,
          parallelGroupId,
          parallelPolicy,
        },
      ];
    }

    const fallbackRole = String(config.fallback_role_code ?? config.fallbackRoleCode ?? 'hrbp').trim();
    const roleMembers = await this.data.queryRoleMembership(ctx.tenantId, fallbackRole);
    const activeRoleMember = roleMembers.find((u) => u);
    if (activeRoleMember) {
      return [
        {
          assigneeUserId: activeRoleMember,
          hatKey: fallbackRole.toLowerCase(),
          resolvedVia: 'direct_manager',
          escalated: true,
          escalationReason: 'manager_missing_fallback_role',
          parallelGroupId,
          parallelPolicy,
        },
      ];
    }

    return this.resolveEscalationChain(config, ctx, escalationTier, 0, parallelGroupId, parallelPolicy);
  }

  private async resolvePositionTemplate(
    config: Record<string, unknown>,
    ctx: ResolverRuntimeContext,
    escalationTier: number,
    parallelGroupId?: string,
    parallelPolicy?: ParallelPolicy,
  ): Promise<ResolvedAssignee[]> {
    const positionCode = String(config.position_code ?? config.positionCode ?? '').trim();
    if (!positionCode) {
      throw new ApiException('XBOS-WF-400', 'position_template requires position_code', HttpStatus.BAD_REQUEST);
    }
    const companyId = normalizeResolverCompanyId(ctx.companyId, config);
    const assignments = await this.data.queryPositionAssignments(ctx.tenantId, companyId, positionCode);
    if (assignments.length > 0) {
      return assignments.map((a) => ({
        assigneeUserId: a.userId,
        hatKey: a.hatKey,
        assignmentId: a.assignmentId,
        resolvedVia: 'position_template' as const,
        escalated: escalationTier > 0,
        escalationReason: escalationTier > 0 ? 'escalation_tier' : undefined,
        parallelGroupId,
        parallelPolicy,
      }));
    }
    return this.resolveEscalationChain(config, ctx, escalationTier, 0, parallelGroupId, parallelPolicy);
  }

  private async resolveRoleCode(
    config: Record<string, unknown>,
    ctx: ResolverRuntimeContext,
    escalationTier: number,
    parallelGroupId?: string,
    parallelPolicy?: ParallelPolicy,
  ): Promise<ResolvedAssignee[]> {
    const roleCode = String(config.role_code ?? config.roleCode ?? '').trim();
    const tenantId = String(config.tenant_id ?? config.tenantId ?? ctx.tenantId).trim();
    if (!roleCode) {
      throw new ApiException('XBOS-WF-400', 'role_code requires role_code', HttpStatus.BAD_REQUEST);
    }
    const members = await this.data.queryRoleMembership(tenantId, roleCode);
    if (members.length === 0) {
      throw new ApiException('XBOS-WF-422', 'role_code zero assignees', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return members.map((userId) => ({
      assigneeUserId: userId,
      hatKey: roleCode.toLowerCase(),
      resolvedVia: 'role_code' as const,
      escalated: escalationTier > 0,
      parallelGroupId,
      parallelPolicy,
    }));
  }

  private async resolveParallelGroup(
    config: Record<string, unknown>,
    ctx: ResolverRuntimeContext,
    escalationTier: number,
  ): Promise<ResolvedAssignee[]> {
    const childTypes = (config.resolver_types ?? config.resolverTypes) as unknown[];
    const childConfigs = (config.resolver_configs ?? config.resolverConfigs ?? []) as unknown[];
    const parallelPolicy = String(config.parallel_policy ?? config.parallelPolicy ?? 'all').toLowerCase() as ParallelPolicy;
    const parallelGroupId = randomUUID();
    const tasks: ResolvedAssignee[] = [];

    for (let i = 0; i < childTypes.length; i += 1) {
      const childType = String(childTypes[i] ?? '').trim().toLowerCase() as ResolverType;
      const childConfig =
        childConfigs[i] && typeof childConfigs[i] === 'object' && !Array.isArray(childConfigs[i])
          ? (childConfigs[i] as Record<string, unknown>)
          : {};
      const childResolved = await this.resolveCore(
        childType,
        childConfig,
        ctx,
        escalationTier,
        parallelGroupId,
        parallelPolicy,
      );
      tasks.push(...childResolved);
    }

    if (tasks.length === 0) {
      return this.resolveEscalationChain(config, ctx, escalationTier, 0, parallelGroupId, parallelPolicy);
    }
    return tasks;
  }

  private async resolveEscalationChain(
    configOrCtx: Record<string, unknown> | ResolverRuntimeContext,
    ctxOrConfig: ResolverRuntimeContext | Record<string, unknown>,
    escalationTier: number,
    depth: number,
    parallelGroupId?: string,
    parallelPolicy?: ParallelPolicy,
  ): Promise<ResolvedAssignee[]> {
    const ctx = ('submitter' in configOrCtx ? configOrCtx : ctxOrConfig) as ResolverRuntimeContext;
    const config = ('submitter' in configOrCtx ? ctxOrConfig : configOrCtx) as Record<string, unknown>;
    const companyId = normalizeResolverCompanyId(ctx.companyId, config);

    const chroCode = defaultEscalationPositionCode(config);
    const chroAssignments = await this.data.queryPositionAssignments(ctx.tenantId, companyId, chroCode);
    if (chroAssignments.length > 0) {
      this.emitEscalation(ctx, 'position_template', config, 1);
      return chroAssignments.map((a) => ({
        assigneeUserId: a.userId,
        hatKey: a.hatKey,
        assignmentId: a.assignmentId,
        resolvedVia: 'position_template' as const,
        escalated: true,
        escalationReason: 'CHRO',
        parallelGroupId,
        parallelPolicy,
      }));
    }

    const ceoMembers = await this.data.queryRoleMembership(ctx.tenantId, 'group_ceo');
    if (ceoMembers.length > 0) {
      this.emitEscalation(ctx, 'role_code', { role_code: 'group_ceo' }, 2);
      return ceoMembers.map((userId) => ({
        assigneeUserId: userId,
        hatKey: 'group_ceo',
        resolvedVia: 'role_code' as const,
        escalated: true,
        escalationReason: 'group_ceo',
        parallelGroupId,
        parallelPolicy,
      }));
    }

    this.emitEscalation(ctx, 'fixed_user', { user_id: GROUP_APPROVER_USER }, 3);
    return [
      {
        assigneeUserId: GROUP_APPROVER_USER,
        hatKey: 'group_ceo',
        resolvedVia: 'fixed_user',
        escalated: true,
        escalationReason: 'GROUP_APPROVER_USER',
        parallelGroupId,
        parallelPolicy,
      },
    ];
  }

  private emitEscalation(
    ctx: ResolverRuntimeContext,
    resolverType: ResolverType,
    originalConfig: Record<string, unknown>,
    escalationTier: number,
  ): void {
    const log: ResolverEscalationLog = {
      code: 'WF-ERR-RESOLVE-ESCALATE',
      tenantId: ctx.tenantId,
      stepKey: ctx.stepKey,
      resolver_type: resolverType,
      original_config: originalConfig,
      escalation_tier: escalationTier,
      businessType: ctx.businessType,
      businessId: ctx.businessId,
    };
    this.logger.warn(JSON.stringify(log));
    this.options.onEscalation?.(log);
  }
}

export function extractWorkflowGraphSteps(raw: unknown): WorkflowGraphStepRow[] {
  if (Array.isArray(raw)) return raw as WorkflowGraphStepRow[];
  if (raw && typeof raw === 'object') {
    const graph = raw as Record<string, unknown>;
    const steps = graph.steps ?? graph.nodes;
    if (Array.isArray(steps)) return steps as WorkflowGraphStepRow[];
  }
  if (typeof raw === 'string') {
    try {
      return extractWorkflowGraphSteps(JSON.parse(raw) as unknown);
    } catch {
      return [];
    }
  }
  return [];
}

export function sortWorkflowSteps(steps: WorkflowGraphStepRow[]): WorkflowGraphStepRow[] {
  return [...steps].sort((a, b) => {
    const orderA = Number(a.order ?? a.step_order ?? 0);
    const orderB = Number(b.order ?? b.step_order ?? 0);
    return orderA - orderB;
  });
}

export function toInboxStepPayload(
  step: WorkflowGraphStepRow,
  assignee: ResolvedAssignee,
): Record<string, unknown> {
  return {
    stepKey: String(step.stepKey ?? step.step_key ?? assignee.hatKey),
    hatKey: assignee.hatKey,
    assigneeUserId: assignee.assigneeUserId,
    assignmentId: assignee.assignmentId ?? null,
    dueAt: step.dueAt ?? step.due_at ?? null,
    parallelGroupId: assignee.parallelGroupId ?? null,
    parallelPolicy: assignee.parallelPolicy ?? null,
    resolvedVia: assignee.resolvedVia,
    escalated: assignee.escalated,
    escalationReason: assignee.escalationReason ?? null,
    autoSkipped: assignee.autoSkipped ?? false,
    skipReason: assignee.skipReason ?? null,
  };
}
