"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCALATION_MASTER_TENANT = exports.XbosResolverDataSource = void 0;
exports.createInMemoryResolverDataSource = createInMemoryResolverDataSource;
exports.defaultEscalationPositionCode = defaultEscalationPositionCode;
exports.normalizeResolverCompanyId = normalizeResolverCompanyId;
exports.parseResolverType = parseResolverType;
exports.parseResolverConfig = parseResolverConfig;
exports.isDynamicResolverEnabled = isDynamicResolverEnabled;
exports.newParallelGroupId = newParallelGroupId;
exports.assertKnownResolverType = assertKnownResolverType;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const resolve_hrm_api_base_url_1 = require("../common/resolve-hrm-api-base-url");
const workflow_catalog_constants_1 = require("./workflow-catalog.constants");
function internalApiKey() {
    return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
}
class XbosResolverDataSource {
    db;
    constructor(db) {
        this.db = db;
    }
    async isUserActive(userId) {
        const normalized = userId.trim().toLowerCase();
        if (!normalized)
            return false;
        const { rows } = await this.db.query(`SELECT EXISTS(
         SELECT 1 FROM public.xbos_user_tenant_membership
         WHERE lower(user_id) = $1 AND status = 'active'
       ) AS active`, [normalized]);
        return Boolean(rows[0]?.active);
    }
    async queryPositionAssignments(tenantId, companyId, positionCode) {
        const { rows } = await this.db.query(`SELECT a.user_id, a.id::text AS id, t.code
       FROM public.xbos_position_assignment a
       JOIN public.xbos_position_template t ON t.id = a.position_template_id
       WHERE a.tenant_id = $1
         AND a.company_id = $2
         AND lower(t.code) = lower($3)
         AND a.status = 'active'
         AND a.user_id IS NOT NULL
         AND (a.valid_to IS NULL OR a.valid_to >= CURRENT_DATE)`, [tenantId, companyId, positionCode]);
        return rows
            .filter((r) => r.user_id?.trim())
            .map((r) => ({
            userId: r.user_id.trim().toLowerCase(),
            assignmentId: r.id,
            hatKey: r.code.trim().toLowerCase(),
        }));
    }
    async queryRoleMembership(tenantId, roleCode) {
        // DISTINCT on lower(trim(...)) — casing variants must not fan-out duplicate tasks
        // (XHRM-REC-WF-BE-TERMINAL-01: 2× admin@xe.vn blocked CEO-only terminal).
        const { rows } = await this.db.query(`SELECT DISTINCT lower(trim(user_id)) AS user_id
       FROM public.xbos_user_tenant_membership
       WHERE tenant_id = $1
         AND lower(role_code) = lower($2)
         AND status = 'active'
         AND user_id IS NOT NULL
         AND trim(user_id) <> ''`, [tenantId, roleCode]);
        return rows.map((r) => r.user_id).filter(Boolean);
    }
    async queryDirectManagerUserId(employeeId, companyId) {
        try {
            const res = await fetch(`${(0, resolve_hrm_api_base_url_1.resolveHrmApiBaseUrl)()}/api/hrm/attendance/workflow-resolver/manager?employee_id=${encodeURIComponent(employeeId)}&company_id=${encodeURIComponent(companyId)}`, {
                method: 'GET',
                headers: {
                    'x-internal-api-key': internalApiKey(),
                    'content-type': 'application/json',
                },
            });
            if (!res.ok)
                return null;
            const json = (await res.json());
            const managerUserId = json.data?.manager_user_id;
            return typeof managerUserId === 'string' && managerUserId.trim()
                ? managerUserId.trim().toLowerCase()
                : null;
        }
        catch {
            return null;
        }
    }
    async queryManagerEmployeeId(employeeId) {
        try {
            const res = await fetch(`${(0, resolve_hrm_api_base_url_1.resolveHrmApiBaseUrl)()}/api/hrm/attendance/workflow-resolver/manager?employee_id=${encodeURIComponent(employeeId)}`, {
                method: 'GET',
                headers: {
                    'x-internal-api-key': internalApiKey(),
                    'content-type': 'application/json',
                },
            });
            if (!res.ok)
                return null;
            const json = (await res.json());
            const managerEmployeeId = json.data?.manager_employee_id;
            return typeof managerEmployeeId === 'string' && managerEmployeeId.trim()
                ? managerEmployeeId.trim()
                : null;
        }
        catch {
            return null;
        }
    }
}
exports.XbosResolverDataSource = XbosResolverDataSource;
function createInMemoryResolverDataSource(seed) {
    const positionAssignments = seed.positionAssignments ?? [];
    const roleMembers = seed.roleMembers ?? [];
    const managers = seed.managers ?? {};
    const managerEmployeeIds = seed.managerEmployeeIds ?? {};
    const activeUsers = seed.activeUsers ?? new Set();
    return {
        isUserActive: async (userId) => activeUsers.size === 0 || activeUsers.has(userId.toLowerCase()),
        queryPositionAssignments: async (tenantId, companyId, positionCode) => positionAssignments
            .filter((a) => a.tenantId === tenantId &&
            a.companyId === companyId &&
            a.positionCode.toLowerCase() === positionCode.toLowerCase())
            .map((a) => ({
            userId: a.userId.toLowerCase(),
            assignmentId: a.assignmentId,
            hatKey: positionCode.toLowerCase(),
        })),
        queryRoleMembership: async (tenantId, roleCode) => {
            const seen = new Set();
            const out = [];
            for (const r of roleMembers) {
                if (r.tenantId !== tenantId || r.roleCode.toLowerCase() !== roleCode.toLowerCase())
                    continue;
                const id = r.userId.trim().toLowerCase();
                if (!id || seen.has(id))
                    continue;
                seen.add(id);
                out.push(id);
            }
            return out;
        },
        queryDirectManagerUserId: async (employeeId) => managers[employeeId] ?? null,
        queryManagerEmployeeId: async (employeeId) => managerEmployeeIds[employeeId] ?? null,
    };
}
function defaultEscalationPositionCode(config) {
    const fromConfig = config.escalation_position_code ?? config.escalationPositionCode;
    return typeof fromConfig === 'string' && fromConfig.trim() ? fromConfig.trim() : 'CHRO';
}
function normalizeResolverCompanyId(companyId, config) {
    const fromConfig = config.company_id ?? config.companyId;
    if (typeof fromConfig === 'string' && fromConfig.trim()) {
        const c = fromConfig.trim().toLowerCase();
        return c === 'main' ? 'holding' : c;
    }
    const c = companyId.trim().toLowerCase();
    return c === 'main' ? 'holding' : c;
}
function parseResolverType(step) {
    const explicit = step.resolver_type ?? step.resolverType;
    if (typeof explicit === 'string' && explicit.trim()) {
        return explicit.trim().toLowerCase();
    }
    const assignee = step.assigneeUserId ?? step.assignee_user_id;
    if (typeof assignee === 'string' && assignee.trim()) {
        return 'fixed_user';
    }
    const handlerRoleId = step.handlerRoleId ?? step.handler_role_id;
    if (typeof handlerRoleId === 'string' && handlerRoleId.trim()) {
        return 'fixed_user';
    }
    return 'fixed_user';
}
function parseResolverConfig(step) {
    const raw = step.resolver_config ?? step.resolverConfig;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return raw;
    }
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
        }
        catch {
            return {};
        }
    }
    const assignee = step.assigneeUserId ?? step.assignee_user_id;
    if (typeof assignee === 'string' && assignee.trim()) {
        return { user_id: assignee.trim() };
    }
    const handlerRoleId = String(step.handlerRoleId ?? step.handler_role_id ?? '').trim();
    if (handlerRoleId) {
        return { user_id: workflow_catalog_constants_1.GROUP_APPROVER_USER, hat_key: handlerRoleId };
    }
    return {};
}
function isDynamicResolverEnabled() {
    return process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED !== 'false';
}
function newParallelGroupId() {
    return (0, node_crypto_1.randomUUID)();
}
function assertKnownResolverType(resolverType) {
    const known = new Set([
        'fixed_user',
        'position_template',
        'direct_manager',
        'role_code',
        'parallel_group',
    ]);
    if (!known.has(resolverType)) {
        throw new api_exception_1.ApiException('XBOS-WF-400', `Unknown resolver_type: ${resolverType}`, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.ESCALATION_MASTER_TENANT = workflow_catalog_constants_1.MASTER_TENANT_XEVN;
