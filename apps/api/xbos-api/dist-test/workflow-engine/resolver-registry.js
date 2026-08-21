"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolverRegistry = void 0;
exports.dedupeAssigneesByUserId = dedupeAssigneesByUserId;
exports.stampAnyOfSameHatPolicy = stampAnyOfSameHatPolicy;
exports.extractWorkflowGraphSteps = extractWorkflowGraphSteps;
exports.sortWorkflowSteps = sortWorkflowSteps;
exports.toInboxStepPayload = toInboxStepPayload;
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
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const workflow_catalog_constants_1 = require("./workflow-catalog.constants");
const resolver_data_source_1 = require("./resolver-data-source");
/** Case-insensitive unique assignees (membership casing variants). */
function dedupeAssigneesByUserId(assignees) {
    const seen = new Set();
    const out = [];
    for (const a of assignees) {
        const id = String(a.assigneeUserId ?? '')
            .trim()
            .toLowerCase();
        if (!id || seen.has(id))
            continue;
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
function stampAnyOfSameHatPolicy(assignees) {
    if (assignees.length <= 1)
        return assignees;
    if (assignees.some((a) => a.parallelGroupId))
        return assignees;
    const hats = new Set(assignees.map((a) => String(a.hatKey ?? '').trim().toLowerCase()).filter(Boolean));
    if (hats.size !== 1)
        return assignees;
    const groupId = (0, node_crypto_1.randomUUID)();
    return assignees.map((a) => ({
        ...a,
        parallelGroupId: groupId,
        parallelPolicy: 'any',
    }));
}
class ResolverRegistry {
    data;
    options;
    logger = new common_1.Logger(ResolverRegistry.name);
    constructor(data, options = {}) {
        this.data = data;
        this.options = options;
    }
    validateStepResolver(step) {
        const resolverType = (0, resolver_data_source_1.parseResolverType)(step);
        (0, resolver_data_source_1.assertKnownResolverType)(resolverType);
        const config = (0, resolver_data_source_1.parseResolverConfig)(step);
        if (resolverType === 'parallel_group') {
            const policy = String(config.parallel_policy ?? config.parallelPolicy ?? '').trim().toLowerCase();
            if (policy !== 'all' && policy !== 'any') {
                throw new api_exception_1.ApiException('XBOS-WF-400', 'parallel_group requires parallel_policy all|any', common_1.HttpStatus.BAD_REQUEST);
            }
            const childTypes = config.resolver_types ?? config.resolverTypes;
            if (!Array.isArray(childTypes) || childTypes.length === 0) {
                throw new api_exception_1.ApiException('XBOS-WF-400', 'parallel_group requires resolver_types[]', common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async resolveStepTasks(step, ctx) {
        this.validateStepResolver(step);
        const resolverType = (0, resolver_data_source_1.parseResolverType)(step);
        const config = (0, resolver_data_source_1.parseResolverConfig)(step);
        const stepKey = String(step.stepKey ?? step.step_key ?? ctx.stepKey);
        const parallelGroupId = resolverType === 'parallel_group' ? (0, node_crypto_1.randomUUID)() : undefined;
        const parallelPolicy = resolverType === 'parallel_group'
            ? String(config.parallel_policy ?? config.parallelPolicy ?? 'all').toLowerCase()
            : undefined;
        const resolved = await this.resolveWithSelfApproveGuard(resolverType, config, { ...ctx, stepKey }, 0, parallelGroupId, parallelPolicy);
        if (resolved.length === 0) {
            throw new api_exception_1.ApiException('XBOS-WF-422', 'Resolver returned zero assignees after escalation', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        // XHRM-REC-WF-BE-TERMINAL-01: dedupe + any-of-same-hat for role/escalation fan-out
        return stampAnyOfSameHatPolicy(dedupeAssigneesByUserId(resolved));
    }
    async resolveWithSelfApproveGuard(resolverType, config, ctx, escalationTier, parallelGroupId, parallelPolicy, depth = 0) {
        const raw = await this.resolveCore(resolverType, config, ctx, escalationTier, parallelGroupId, parallelPolicy);
        const output = [];
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
    async escalateSelfApprove(ctx, config, depth) {
        const managerEmployeeId = await this.data.queryManagerEmployeeId(ctx.submitter.employeeId);
        if (managerEmployeeId) {
            const managerCtx = {
                ...ctx,
                submitter: {
                    ...ctx.submitter,
                    employeeId: managerEmployeeId,
                },
            };
            return this.resolveWithSelfApproveGuard('direct_manager', {}, managerCtx, 2, undefined, undefined, depth);
        }
        return this.resolveEscalationChain(ctx, config, 1, depth);
    }
    async resolveCore(resolverType, config, ctx, escalationTier, parallelGroupId, parallelPolicy) {
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
                (0, resolver_data_source_1.assertKnownResolverType)(resolverType);
                return [];
        }
    }
    async resolveFixedUser(config, ctx, escalationTier, parallelGroupId, parallelPolicy) {
        const userId = String(config.user_id ?? config.userId ?? '').trim().toLowerCase();
        if (!userId) {
            throw new api_exception_1.ApiException('XBOS-WF-400', 'fixed_user requires user_id', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!(await this.data.isUserActive(userId))) {
            throw new api_exception_1.ApiException('XBOS-WF-422', 'fixed_user inactive', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
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
    async resolveDirectManager(config, ctx, escalationTier, parallelGroupId, parallelPolicy) {
        const managerUserId = await this.data.queryDirectManagerUserId(ctx.submitter.employeeId, ctx.submitter.companyId);
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
    async resolvePositionTemplate(config, ctx, escalationTier, parallelGroupId, parallelPolicy) {
        const positionCode = String(config.position_code ?? config.positionCode ?? '').trim();
        if (!positionCode) {
            throw new api_exception_1.ApiException('XBOS-WF-400', 'position_template requires position_code', common_1.HttpStatus.BAD_REQUEST);
        }
        const companyId = (0, resolver_data_source_1.normalizeResolverCompanyId)(ctx.companyId, config);
        const assignments = await this.data.queryPositionAssignments(ctx.tenantId, companyId, positionCode);
        if (assignments.length > 0) {
            return assignments.map((a) => ({
                assigneeUserId: a.userId,
                hatKey: a.hatKey,
                assignmentId: a.assignmentId,
                resolvedVia: 'position_template',
                escalated: escalationTier > 0,
                escalationReason: escalationTier > 0 ? 'escalation_tier' : undefined,
                parallelGroupId,
                parallelPolicy,
            }));
        }
        return this.resolveEscalationChain(config, ctx, escalationTier, 0, parallelGroupId, parallelPolicy);
    }
    async resolveRoleCode(config, ctx, escalationTier, parallelGroupId, parallelPolicy) {
        const roleCode = String(config.role_code ?? config.roleCode ?? '').trim();
        const tenantId = String(config.tenant_id ?? config.tenantId ?? ctx.tenantId).trim();
        if (!roleCode) {
            throw new api_exception_1.ApiException('XBOS-WF-400', 'role_code requires role_code', common_1.HttpStatus.BAD_REQUEST);
        }
        const members = await this.data.queryRoleMembership(tenantId, roleCode);
        if (members.length === 0) {
            throw new api_exception_1.ApiException('XBOS-WF-422', 'role_code zero assignees', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return members.map((userId) => ({
            assigneeUserId: userId,
            hatKey: roleCode.toLowerCase(),
            resolvedVia: 'role_code',
            escalated: escalationTier > 0,
            parallelGroupId,
            parallelPolicy,
        }));
    }
    async resolveParallelGroup(config, ctx, escalationTier) {
        const childTypes = (config.resolver_types ?? config.resolverTypes);
        const childConfigs = (config.resolver_configs ?? config.resolverConfigs ?? []);
        const parallelPolicy = String(config.parallel_policy ?? config.parallelPolicy ?? 'all').toLowerCase();
        const parallelGroupId = (0, node_crypto_1.randomUUID)();
        const tasks = [];
        for (let i = 0; i < childTypes.length; i += 1) {
            const childType = String(childTypes[i] ?? '').trim().toLowerCase();
            const childConfig = childConfigs[i] && typeof childConfigs[i] === 'object' && !Array.isArray(childConfigs[i])
                ? childConfigs[i]
                : {};
            const childResolved = await this.resolveCore(childType, childConfig, ctx, escalationTier, parallelGroupId, parallelPolicy);
            tasks.push(...childResolved);
        }
        if (tasks.length === 0) {
            return this.resolveEscalationChain(config, ctx, escalationTier, 0, parallelGroupId, parallelPolicy);
        }
        return tasks;
    }
    async resolveEscalationChain(configOrCtx, ctxOrConfig, escalationTier, depth, parallelGroupId, parallelPolicy) {
        const ctx = ('submitter' in configOrCtx ? configOrCtx : ctxOrConfig);
        const config = ('submitter' in configOrCtx ? ctxOrConfig : configOrCtx);
        const companyId = (0, resolver_data_source_1.normalizeResolverCompanyId)(ctx.companyId, config);
        const chroCode = (0, resolver_data_source_1.defaultEscalationPositionCode)(config);
        const chroAssignments = await this.data.queryPositionAssignments(ctx.tenantId, companyId, chroCode);
        if (chroAssignments.length > 0) {
            this.emitEscalation(ctx, 'position_template', config, 1);
            return chroAssignments.map((a) => ({
                assigneeUserId: a.userId,
                hatKey: a.hatKey,
                assignmentId: a.assignmentId,
                resolvedVia: 'position_template',
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
                resolvedVia: 'role_code',
                escalated: true,
                escalationReason: 'group_ceo',
                parallelGroupId,
                parallelPolicy,
            }));
        }
        this.emitEscalation(ctx, 'fixed_user', { user_id: workflow_catalog_constants_1.GROUP_APPROVER_USER }, 3);
        return [
            {
                assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER,
                hatKey: 'group_ceo',
                resolvedVia: 'fixed_user',
                escalated: true,
                escalationReason: 'GROUP_APPROVER_USER',
                parallelGroupId,
                parallelPolicy,
            },
        ];
    }
    emitEscalation(ctx, resolverType, originalConfig, escalationTier) {
        const log = {
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
exports.ResolverRegistry = ResolverRegistry;
function extractWorkflowGraphSteps(raw) {
    if (Array.isArray(raw))
        return raw;
    if (raw && typeof raw === 'object') {
        const graph = raw;
        const steps = graph.steps ?? graph.nodes;
        if (Array.isArray(steps))
            return steps;
    }
    if (typeof raw === 'string') {
        try {
            return extractWorkflowGraphSteps(JSON.parse(raw));
        }
        catch {
            return [];
        }
    }
    return [];
}
function sortWorkflowSteps(steps) {
    return [...steps].sort((a, b) => {
        const orderA = Number(a.order ?? a.step_order ?? 0);
        const orderB = Number(b.order ?? b.step_order ?? 0);
        return orderA - orderB;
    });
}
function toInboxStepPayload(step, assignee) {
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
