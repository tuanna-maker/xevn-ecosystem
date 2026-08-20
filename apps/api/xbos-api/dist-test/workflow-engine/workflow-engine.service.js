"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkflowEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const jwt_sign_1 = require("../common/jwt-sign");
const resolve_hrm_api_base_url_1 = require("../common/resolve-hrm-api-base-url");
const api_exception_1 = require("../common/api.exception");
const xbos_db_service_1 = require("../db/xbos-db.service");
const resolver_data_source_1 = require("./resolver-data-source");
const resolver_registry_1 = require("./resolver-registry");
const workflow_apply_scope_1 = require("./workflow-apply-scope");
const workflow_catalog_constants_1 = require("./workflow-catalog.constants");
function normalizeJsonbPayload(value) {
    if (value === undefined || value === null) {
        return '{}';
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return '{}';
        }
        try {
            JSON.parse(trimmed);
            return trimmed;
        }
        catch {
            return '{}';
        }
    }
    return JSON.stringify(value);
}
function parseGraphObject(raw) {
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
        return {};
    }
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return raw;
    }
    return {};
}
function resolveHandlerInboxTarget(handlerRoleId) {
    const role = handlerRoleId.trim().toLowerCase();
    if (role === 'bod' || role === 'group_ceo' || role === 'raci_ceo') {
        return { hatKey: 'group_ceo', assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER };
    }
    if (role.startsWith('raci_')) {
        return { hatKey: role, assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER };
    }
    return { hatKey: role || 'default', assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER };
}
function normalizePersistCompanyId(companyId) {
    const c = (companyId ?? workflow_catalog_constants_1.MASTER_COMPANY_HOLDING).trim().toLowerCase();
    return c === 'main' ? workflow_catalog_constants_1.MASTER_COMPANY_HOLDING : c;
}
function internalApiKey() {
    return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
}
let WorkflowEngineService = WorkflowEngineService_1 = class WorkflowEngineService {
    db;
    logger = new common_1.Logger(WorkflowEngineService_1.name);
    resolverRegistry;
    constructor(db) {
        this.db = db;
        this.resolverRegistry = new resolver_registry_1.ResolverRegistry(new resolver_data_source_1.XbosResolverDataSource(db));
    }
    async listDefinitions(tenantId, companyId) {
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_workflow_definition
       WHERE tenant_id = $1 AND status <> 'deleted'
         AND ($2::text IS NULL OR company_id IS NULL OR company_id = $2)
       ORDER BY workflow_code, version DESC`, [tenantId, companyId ?? null]);
        return rows;
    }
    async upsertDefinition(tenantId, companyId, definitionId, body) {
        const code = String(body.workflowCode ?? body.workflow_code ?? body.code ?? body.definitionKey ?? '').trim();
        const name = String(body.name ?? '').trim();
        const nested = body.payload ?? undefined;
        const graphPayload = body.graph ?? nested?.graph ?? body.steps ?? nested?.steps ?? {};
        const conditionsPayload = body.conditions ?? nested?.conditions ?? {};
        const graphJson = normalizeJsonbPayload(graphPayload);
        const conditionsJson = normalizeJsonbPayload(conditionsPayload);
        const category = String(body.category ?? 'general');
        const scopeLevel = String(body.scopeLevel ?? body.scope_level ?? 'group');
        const status = body.status != null ? String(body.status) : null;
        if (definitionId) {
            if (!name) {
                throw new api_exception_1.ApiException('XBOS-WF-400', 'name is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const { rows } = await this.db.query(`UPDATE public.xbos_workflow_definition SET
          name = $3, category = $4, scope_level = $5, graph = $6::jsonb, conditions = $7::jsonb,
          status = COALESCE($8, status), updated_at = NOW()
         WHERE id = $1::uuid AND tenant_id = $2 RETURNING *`, [definitionId, tenantId, name, category, scopeLevel, graphJson, conditionsJson, status]);
            if (!rows[0])
                throw new api_exception_1.ApiException('XBOS-WF-404', 'Definition not found', common_1.HttpStatus.NOT_FOUND);
            return rows[0];
        }
        if (!code || !name) {
            throw new api_exception_1.ApiException('XBOS-WF-400', 'workflowCode and name required', common_1.HttpStatus.BAD_REQUEST);
        }
        // Option B dual partition: UNIQUE(tenant_id, workflow_code, version) — persist explicit
        // version from FE or allocate MAX+1 (INSERT previously omitted version → always DEFAULT 1).
        const version = await this.resolveDefinitionInsertVersion(tenantId, code, body.version);
        try {
            const { rows } = await this.db.query(`INSERT INTO public.xbos_workflow_definition (
          tenant_id, workflow_code, name, category, scope_level, company_id, version, graph, conditions, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10) RETURNING *`, [
                tenantId,
                code,
                name,
                category,
                scopeLevel,
                companyId,
                version,
                graphJson,
                conditionsJson,
                status ?? 'draft',
            ]);
            await this.maybeSpawnDefinitionInboxTask(tenantId, companyId, rows[0], body);
            return rows[0];
        }
        catch (err) {
            const pgCode = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
            if (pgCode === '23505') {
                throw new api_exception_1.ApiException('XBOS-WF-409', `Workflow definition version conflict for ${code} v${version} — use a new version for another company partition`, common_1.HttpStatus.CONFLICT, { workflowCode: code, version });
            }
            throw err;
        }
    }
    /**
     * Allocate definition version for INSERT.
     * Prefer body.version when ≥1; else MAX(version)+1 for (tenant, code).
     */
    async resolveDefinitionInsertVersion(tenantId, workflowCode, requested) {
        const raw = typeof requested === 'number'
            ? requested
            : typeof requested === 'string'
                ? Number(requested.trim())
                : NaN;
        if (Number.isFinite(raw) && raw >= 1) {
            return Math.floor(raw);
        }
        const { rows } = await this.db.query(`SELECT MAX(version)::int AS max_v
       FROM public.xbos_workflow_definition
       WHERE tenant_id = $1 AND workflow_code = $2`, [tenantId, workflowCode]);
        return (rows[0]?.max_v ?? 0) + 1;
    }
    async ensureHrmLeaveApprovalWorkflow() {
        const body = (0, workflow_catalog_constants_1.buildHrmLeaveApprovalWorkflowDefinition)();
        const existing = await this.findActiveDefinitionByCode(workflow_catalog_constants_1.MASTER_TENANT_XEVN, body.workflowCode);
        if (existing) {
            return existing;
        }
        return this.upsertDefinition(workflow_catalog_constants_1.MASTER_TENANT_XEVN, workflow_catalog_constants_1.MASTER_COMPANY_HOLDING, null, body);
    }
    /**
     * BM-BE-REC-WF-SPAWN-MEMBER-01 — parity leave ensure for recruitment codes so
     * SPAWN-MISSING is not caused by missing active definition after canvas apply.
     */
    async ensureHrmRecruitmentWorkflowByCode(workflowCode) {
        const code = workflowCode.trim();
        const existing = await this.findActiveDefinitionByCode(workflow_catalog_constants_1.MASTER_TENANT_XEVN, code);
        if (existing)
            return existing;
        let body = null;
        if (code === workflow_catalog_constants_1.WF_HRM_REQUISITION_APPROVAL_CODE) {
            body = (0, workflow_catalog_constants_1.buildHrmRequisitionApprovalDefinition)();
        }
        else if (code === workflow_catalog_constants_1.WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE) {
            body = (0, workflow_catalog_constants_1.buildHrmRecruitmentPlanApprovalDefinition)();
        }
        else if (code === workflow_catalog_constants_1.WF_HRM_CANDIDATE_PIPELINE_CODE) {
            body = (0, workflow_catalog_constants_1.buildHrmCandidatePipelineDefinition)();
        }
        if (!body)
            return null;
        return this.upsertDefinition(workflow_catalog_constants_1.MASTER_TENANT_XEVN, workflow_catalog_constants_1.MASTER_COMPANY_HOLDING, null, body);
    }
    async resolveApplyingEntityPartition(applyingEntityId) {
        const id = applyingEntityId.trim();
        if (!(0, workflow_apply_scope_1.isLegalEntityUuid)(id))
            return null;
        try {
            const { rows } = await this.db.query(`SELECT tenant_id, company_id FROM public.xbos_legal_entity
         WHERE id = $1::uuid AND status IS DISTINCT FROM 'deleted'
         LIMIT 1`, [id]);
            const row = rows[0];
            if (!row)
                return null;
            return { tenantId: String(row.tenant_id), companyId: String(row.company_id) };
        }
        catch {
            return null;
        }
    }
    recruitmentFallbackInboxSteps(graphSteps) {
        const sorted = (0, resolver_registry_1.sortWorkflowSteps)(graphSteps);
        const first = sorted[0];
        const stepKey = String(first?.stepKey ?? first?.step_key ?? first?.id ?? 'requisition_approval');
        return [
            {
                stepKey,
                hatKey: 'group_ceo',
                assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER,
                dueAt: null,
                resolvedVia: 'fixed_user',
                escalated: true,
                escalationReason: 'recruitment_spawn_resolver_fallback',
            },
        ];
    }
    leaveFallbackInboxSteps(graphSteps) {
        const sorted = (0, resolver_registry_1.sortWorkflowSteps)(graphSteps);
        const first = sorted[0];
        const stepKey = String(first?.stepKey ?? first?.step_key ?? first?.id ?? 'manager_approval');
        return [
            {
                stepKey,
                hatKey: 'group_ceo',
                assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER,
                dueAt: null,
                resolvedVia: 'fixed_user',
                escalated: true,
                escalationReason: 'leave_spawn_resolver_fallback',
            },
        ];
    }
    spawnResolverFallbackSteps(workflowCode, graphSteps) {
        if ((0, workflow_apply_scope_1.isHrmLeaveWorkflowCode)(workflowCode)) {
            return this.leaveFallbackInboxSteps(graphSteps);
        }
        if ((0, workflow_apply_scope_1.isHrmRecruitmentWorkflowCode)(workflowCode)) {
            return this.recruitmentFallbackInboxSteps(graphSteps);
        }
        return [];
    }
    definitionStatusIsActive(saved, body) {
        const fromBody = body.status != null ? String(body.status).trim().toLowerCase() : '';
        const fromSaved = saved.status != null ? String(saved.status).trim().toLowerCase() : '';
        return fromBody === 'active' || fromSaved === 'active';
    }
    async hasPendingTaskForDefinition(definitionId) {
        const { rows } = await this.db.query(`SELECT EXISTS(
         SELECT 1
         FROM public.xbos_workflow_step_task t
         JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
         WHERE i.definition_id = $1::uuid
           AND t.status = 'pending'
       ) AS exists`, [definitionId]);
        return Boolean(rows[0]?.exists);
    }
    async buildDefinitionInboxSteps(graphSteps) {
        const sorted = (0, resolver_registry_1.sortWorkflowSteps)(graphSteps);
        const inboxSteps = [];
        for (const step of sorted) {
            const handlerRoleId = String(step.handlerRoleId ?? step.handler_role_id ?? step.hatKey ?? step.hat_key ?? 'default');
            const target = resolveHandlerInboxTarget(handlerRoleId);
            inboxSteps.push({
                stepKey: String(step.id ?? step.stepKey ?? step.step_key ?? `step-${inboxSteps.length + 1}`),
                hatKey: target.hatKey,
                assigneeUserId: String(step.assigneeUserId ?? step.assignee_user_id ?? target.assigneeUserId),
                dueAt: step.dueAt ?? step.due_at ?? null,
            });
        }
        if (inboxSteps.length === 0) {
            inboxSteps.push({
                stepKey: 'definition_review',
                hatKey: 'group_ceo',
                assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER,
            });
        }
        return inboxSteps;
    }
    async resolveStepsForGraph(graphSteps, ctx, activeOrder) {
        const sorted = (0, resolver_registry_1.sortWorkflowSteps)(graphSteps);
        const targetOrder = activeOrder ?? Number(sorted[0]?.order ?? sorted[0]?.step_order ?? 1);
        const activeSteps = sorted.filter((s) => Number(s.order ?? s.step_order ?? targetOrder) === targetOrder);
        const inboxSteps = [];
        if (!(0, resolver_data_source_1.isDynamicResolverEnabled)()) {
            return this.buildDefinitionInboxSteps(activeSteps.length > 0 ? activeSteps : sorted);
        }
        for (const step of activeSteps.length > 0 ? activeSteps : sorted.slice(0, 1)) {
            const stepKey = String(step.stepKey ?? step.step_key ?? `step-${inboxSteps.length + 1}`);
            const assignees = await this.resolverRegistry.resolveStepTasks(step, { ...ctx, stepKey });
            for (const assignee of assignees) {
                inboxSteps.push((0, resolver_registry_1.toInboxStepPayload)(step, assignee));
            }
        }
        return inboxSteps;
    }
    /** UF-XBOS-08 / U64 — canvas save spawns CC inbox task without seed script. */
    async maybeSpawnDefinitionInboxTask(tenantId, companyId, saved, body) {
        if (!this.definitionStatusIsActive(saved, body)) {
            return { spawned: false };
        }
        const definitionId = String(saved.id ?? '');
        if (!definitionId)
            return { spawned: false };
        if (await this.hasPendingTaskForDefinition(definitionId)) {
            return { spawned: false };
        }
        const graphRaw = saved.graph ?? body.graph ?? body.steps ?? body.payload;
        const graphSteps = (0, resolver_registry_1.extractWorkflowGraphSteps)(graphRaw);
        const steps = await this.buildDefinitionInboxSteps(graphSteps);
        const workflowCode = String(saved.workflow_code ?? body.workflowCode ?? body.code ?? '');
        const workflowName = String(saved.name ?? body.name ?? workflowCode);
        const instance = await this.startInstance(tenantId, normalizePersistCompanyId(companyId), {
            definitionId,
            businessType: workflow_catalog_constants_1.WF_BUSINESS_TYPE_DEFINITION_REVIEW,
            businessId: definitionId,
            context: {
                source: 'workflow_definition_save',
                workflowCode,
                workflowName,
                spawnedAt: new Date().toISOString(),
            },
            steps,
        });
        return { instanceId: String(instance.id), spawned: true };
    }
    async startInstanceFromWorkflowCode(tenantId, companyId, body) {
        const workflowCode = String(body.workflowCode ?? body.workflow_code ?? '').trim();
        const businessType = String(body.businessType ?? body.business_type ?? '').trim();
        const businessId = String(body.businessId ?? body.business_id ?? '').trim();
        const submitter = (body.submitter ?? {});
        const submitterUserId = String(submitter.userId ?? submitter.user_id ?? '').trim();
        const submitterEmployeeId = String(submitter.employeeId ?? submitter.employee_id ?? '').trim();
        const submitterCompanyId = String(submitter.companyId ?? submitter.company_id ?? '').trim();
        const bodyContext = body.context ?? {};
        const contextMemberCompanyId = String(bodyContext.memberCompanyId ?? bodyContext.member_company_id ?? '').trim();
        const contextMemberTenantId = String(bodyContext.memberTenantId ?? bodyContext.member_tenant_id ?? '').trim();
        const contextEntityCompanyId = String(bodyContext.entityCompanyId ?? bodyContext.entity_company_id ?? '').trim();
        if (!workflowCode || !businessType || !businessId || !submitterEmployeeId) {
            throw new api_exception_1.ApiException('XBOS-WF-400', 'workflowCode, businessType, businessId, submitter.employeeId required', common_1.HttpStatus.BAD_REQUEST);
        }
        const persistCompanyId = normalizePersistCompanyId(companyId);
        const partition = {
            spawnCompanyId: contextEntityCompanyId || persistCompanyId,
            spawnTenantId: tenantId,
            contextMemberCompanyId: contextMemberCompanyId || undefined,
            contextMemberTenantId: contextMemberTenantId || undefined,
        };
        // Option B: prefer member override matching spawn company; else group-wide.
        // Recruitment defs SoT under master tenant — member JWT tenant still partitions via context.
        let definition = await this.findActiveDefinitionByCode(tenantId, workflowCode, partition);
        if (!definition &&
            (0, workflow_apply_scope_1.isHrmRecruitmentWorkflowCode)(workflowCode) &&
            tenantId.trim().toLowerCase() !== workflow_catalog_constants_1.MASTER_TENANT_XEVN) {
            definition = await this.findActiveDefinitionByCode(workflow_catalog_constants_1.MASTER_TENANT_XEVN, workflowCode, partition);
        }
        if (!definition && workflowCode === workflow_catalog_constants_1.WF_HRM_LEAVE_APPROVAL_CODE) {
            definition = await this.ensureHrmLeaveApprovalWorkflow();
        }
        if (!definition && (0, workflow_apply_scope_1.isHrmRecruitmentWorkflowCode)(workflowCode)) {
            // nest build: ensure* may return null when code is unknown — do not widen definition to null
            const ensured = await this.ensureHrmRecruitmentWorkflowByCode(workflowCode);
            if (ensured) {
                definition = ensured;
            }
        }
        if (!definition) {
            throw new api_exception_1.ApiException('XBOS-WF-404', 'Active workflow definition not found', common_1.HttpStatus.NOT_FOUND);
        }
        const def = definition;
        const applyingEntityId = (0, workflow_apply_scope_1.parseApplyingEntityIdFromGraph)(def.graph);
        const resolvedPartition = applyingEntityId
            ? await this.resolveApplyingEntityPartition(applyingEntityId)
            : null;
        if (!(0, workflow_apply_scope_1.definitionAppliesToSpawnScope)({
            spawnCompanyId: persistCompanyId,
            spawnTenantId: tenantId,
            contextMemberCompanyId,
            contextMemberTenantId,
            applyingEntityId,
            resolvedPartition,
        })) {
            throw new api_exception_1.ApiException('XBOS-WF-409', 'Workflow definition applyingEntity does not match spawn company scope', common_1.HttpStatus.CONFLICT);
        }
        const graphSteps = (0, resolver_registry_1.extractWorkflowGraphSteps)(def.graph);
        const ctx = {
            tenantId,
            companyId: persistCompanyId,
            submitter: {
                userId: submitterUserId,
                employeeId: submitterEmployeeId,
                companyId: submitterCompanyId,
                companySlug: typeof submitter.companySlug === 'string' ? submitter.companySlug : undefined,
            },
            businessType,
            businessId,
            stepKey: String(graphSteps[0]?.stepKey ?? graphSteps[0]?.step_key ?? 'step-1'),
        };
        let steps;
        const hasSpawnFallback = (0, workflow_apply_scope_1.isHrmRecruitmentWorkflowCode)(workflowCode) || (0, workflow_apply_scope_1.isHrmLeaveWorkflowCode)(workflowCode);
        try {
            steps = await this.resolveStepsForGraph(graphSteps, ctx);
            if (steps.length === 0 && hasSpawnFallback) {
                this.logger.warn(`XBOS-WF-SPAWN-RESOLVER-FALLBACK code=${workflowCode} reason=empty_steps applyingEntityId=${applyingEntityId || '(group)'}`);
                steps = this.spawnResolverFallbackSteps(workflowCode, graphSteps);
            }
        }
        catch (err) {
            if (!hasSpawnFallback) {
                throw err;
            }
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.warn(`XBOS-WF-SPAWN-RESOLVER-FALLBACK code=${workflowCode} reason=${msg} applyingEntityId=${applyingEntityId || '(group)'}`);
            steps = this.spawnResolverFallbackSteps(workflowCode, graphSteps);
        }
        const firstOrder = Number((0, resolver_registry_1.sortWorkflowSteps)(graphSteps)[0]?.order ?? 1);
        return this.startInstance(tenantId, persistCompanyId, {
            definitionId: def.id,
            businessType,
            businessId,
            context: {
                ...bodyContext,
                submitter,
                workflowCode,
                currentStepOrder: firstOrder,
                applyingEntityId: applyingEntityId || null,
                applyingEntityPartition: resolvedPartition,
            },
            steps,
        });
    }
    async startInstance(tenantId, companyId, body) {
        const definitionId = String(body.definitionId ?? '');
        const businessType = String(body.businessType ?? '');
        const businessId = String(body.businessId ?? '');
        if (!definitionId || !businessType || !businessId) {
            throw new api_exception_1.ApiException('XBOS-WF-400', 'definitionId, businessType, businessId required', common_1.HttpStatus.BAD_REQUEST);
        }
        const { rows: instRows } = await this.db.query(`INSERT INTO public.xbos_workflow_instance (tenant_id, company_id, definition_id, business_type, business_id, context)
       VALUES ($1,$2,$3::uuid,$4,$5,$6::jsonb) RETURNING *`, [tenantId, companyId, definitionId, businessType, businessId, JSON.stringify(body.context ?? {})]);
        const instance = instRows[0];
        const steps = body.steps ?? [];
        for (const step of steps) {
            await this.db.query(`INSERT INTO public.xbos_workflow_step_task (instance_id, step_key, hat_key, assignee_user_id, assignment_id, due_at, payload)
         VALUES ($1::uuid,$2,$3,$4,$5::uuid,$6::timestamptz,$7::jsonb)`, [
                instance.id,
                step.stepKey ?? step.id,
                step.hatKey ?? step.handlerRoleId ?? 'default',
                step.assigneeUserId ?? null,
                step.assignmentId ?? null,
                step.dueAt ?? null,
                JSON.stringify(step),
            ]);
        }
        return instRows[0];
    }
    async listStepTasks(filters) {
        const clauses = ['1=1'];
        const params = [];
        let idx = 1;
        if (filters.status) {
            clauses.push(`t.status = $${idx++}`);
            params.push(filters.status);
        }
        else {
            clauses.push(`t.status = 'pending'`);
        }
        if (filters.assigneeUserId) {
            clauses.push(`t.assignee_user_id = $${idx++}`);
            params.push(filters.assigneeUserId);
        }
        if (filters.tenantId) {
            clauses.push(`i.tenant_id = $${idx++}`);
            params.push(filters.tenantId);
        }
        if (filters.businessType) {
            clauses.push(`i.business_type = $${idx++}`);
            params.push(filters.businessType);
        }
        const { rows } = await this.db.query(`
      SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id, i.status AS instance_status,
             i.context, i.definition_id, d.workflow_code, d.name AS workflow_name
      FROM public.xbos_workflow_step_task t
      JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
      JOIN public.xbos_workflow_definition d ON d.id = i.definition_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY t.created_at DESC
      LIMIT 200
    `, params);
        return rows;
    }
    async getTaskById(taskId) {
        const { rows } = await this.db.query(`SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id, i.status AS instance_status, i.context
       FROM public.xbos_workflow_step_task t
       JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
       WHERE t.id = $1::uuid`, [taskId]);
        if (!rows[0])
            throw new api_exception_1.ApiException('XBOS-WF-404', 'Task not found', common_1.HttpStatus.NOT_FOUND);
        return rows[0];
    }
    async getInstanceWithTasks(instanceId) {
        const { rows: inst } = await this.db.query(`SELECT i.*, d.workflow_code, d.name AS workflow_name
       FROM public.xbos_workflow_instance i
       JOIN public.xbos_workflow_definition d ON d.id = i.definition_id
       WHERE i.id = $1::uuid`, [instanceId]);
        if (!inst[0])
            throw new api_exception_1.ApiException('XBOS-WF-404', 'Instance not found', common_1.HttpStatus.NOT_FOUND);
        const { rows: tasks } = await this.db.query(`SELECT * FROM public.xbos_workflow_step_task WHERE instance_id = $1::uuid ORDER BY created_at`, [instanceId]);
        return { instance: inst[0], tasks };
    }
    async maybeAdvanceSequentialStep(instanceId) {
        const detail = await this.getInstanceWithTasks(instanceId);
        const inst = detail.instance;
        const pending = detail.tasks.filter((t) => t.status === 'pending');
        if (pending.length > 0)
            return;
        const { rows: defRows } = await this.db.query(`SELECT graph FROM public.xbos_workflow_definition WHERE id = $1::uuid`, [inst.definition_id]);
        const graphSteps = (0, resolver_registry_1.extractWorkflowGraphSteps)(defRows[0]?.graph);
        const sorted = (0, resolver_registry_1.sortWorkflowSteps)(graphSteps);
        const currentOrder = Number(inst.context?.currentStepOrder ?? sorted[0]?.order ?? 1);
        const nextSteps = sorted.filter((s) => Number(s.order ?? s.step_order ?? 0) > currentOrder);
        if (nextSteps.length === 0)
            return;
        const nextOrder = Number(nextSteps[0].order ?? nextSteps[0].step_order ?? currentOrder + 1);
        const submitter = (inst.context?.submitter ?? {});
        const ctx = {
            tenantId: inst.tenant_id,
            companyId: inst.company_id,
            submitter: {
                userId: String(submitter.userId ?? submitter.user_id ?? ''),
                employeeId: String(submitter.employeeId ?? submitter.employee_id ?? ''),
                companyId: String(submitter.companyId ?? submitter.company_id ?? ''),
            },
            businessType: inst.business_type,
            businessId: inst.business_id,
            stepKey: String(nextSteps[0].stepKey ?? nextSteps[0].step_key ?? 'step-next'),
        };
        const inboxSteps = await this.resolveStepsForGraph(graphSteps, ctx, nextOrder);
        for (const step of inboxSteps) {
            await this.db.query(`INSERT INTO public.xbos_workflow_step_task (instance_id, step_key, hat_key, assignee_user_id, assignment_id, due_at, payload)
         VALUES ($1::uuid,$2,$3,$4,$5::uuid,$6::timestamptz,$7::jsonb)`, [
                instanceId,
                step.stepKey,
                step.hatKey,
                step.assigneeUserId,
                step.assignmentId ?? null,
                step.dueAt ?? null,
                JSON.stringify(step),
            ]);
        }
        await this.db.query(`UPDATE public.xbos_workflow_instance
       SET context = context || $2::jsonb, updated_at = NOW()
       WHERE id = $1::uuid`, [instanceId, JSON.stringify({ currentStepOrder: nextOrder })]);
    }
    async notifyHrmLeaveTerminal(instance, terminalStatus, reviewerUserId, reason) {
        if (String(instance.business_type) !== workflow_catalog_constants_1.WF_BUSINESS_TYPE_HRM_LEAVE)
            return;
        const context = (instance.context ?? {});
        const memberTenantId = String(context.memberTenantId ?? context.member_tenant_id ?? workflow_catalog_constants_1.MASTER_TENANT_XEVN);
        const memberCompanyId = String(context.memberCompanyId ?? context.member_company_id ?? 'holding');
        let bearer;
        try {
            bearer = (0, jwt_sign_1.signServiceJwt)({
                sub: 'xbos-be',
                svc: 'workflow-engine',
                tenantId: memberTenantId,
                companyId: memberCompanyId,
                roles: ['service'],
            });
        }
        catch {
            bearer = undefined;
        }
        const headers = {
            'x-internal-api-key': internalApiKey(),
            'content-type': 'application/json',
            'x-tenant-id': memberTenantId,
            'x-company-id': memberCompanyId,
        };
        if (bearer)
            headers.authorization = `Bearer ${bearer}`;
        try {
            const res = await fetch(`${(0, resolve_hrm_api_base_url_1.resolveHrmApiBaseUrl)()}/api/hrm/attendance/leave-workflow/terminal`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    leaveRequestId: String(instance.business_id),
                    workflowInstanceId: String(instance.id ?? ''),
                    terminalStatus,
                    reviewerUserId,
                    reviewerName: reviewerUserId,
                    rejectedReason: reason ?? null,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                this.logger.warn(`HRM leave terminal callback failed: ${res.status} ${text.slice(0, 200)}`);
            }
        }
        catch (err) {
            this.logger.warn(`HRM leave terminal callback error: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    isRecruitmentBusinessType(businessType) {
        return (businessType === workflow_catalog_constants_1.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN ||
            businessType === workflow_catalog_constants_1.WF_BUSINESS_TYPE_HRM_REQUISITION ||
            businessType === workflow_catalog_constants_1.WF_BUSINESS_TYPE_HRM_CANDIDATE);
    }
    buildHrmServiceHeaders(instance) {
        const context = (instance.context ?? {});
        const memberTenantId = String(context.memberTenantId ?? context.member_tenant_id ?? workflow_catalog_constants_1.MASTER_TENANT_XEVN);
        const memberCompanyId = String(context.memberCompanyId ?? context.member_company_id ?? 'holding');
        let bearer;
        try {
            bearer = (0, jwt_sign_1.signServiceJwt)({
                sub: 'xbos-be',
                svc: 'workflow-engine',
                tenantId: memberTenantId,
                companyId: memberCompanyId,
                roles: ['service'],
            });
        }
        catch {
            bearer = undefined;
        }
        const headers = {
            'x-internal-api-key': internalApiKey(),
            'content-type': 'application/json',
            'x-tenant-id': memberTenantId,
            'x-company-id': memberCompanyId,
        };
        if (bearer)
            headers.authorization = `Bearer ${bearer}`;
        return headers;
    }
    /**
     * ADDITIVE recruitment notify — does not alter leave terminal URL/contract.
     */
    async notifyHrmRecruitmentCallback(instance, mode, reviewerUserId, extras) {
        const businessType = String(instance.business_type ?? '');
        if (!this.isRecruitmentBusinessType(businessType))
            return;
        const headers = this.buildHrmServiceHeaders(instance);
        const path = mode === 'step'
            ? '/api/hrm/recruitment/workflow/step'
            : '/api/hrm/recruitment/workflow/terminal';
        const body = mode === 'step'
            ? {
                businessType,
                businessId: String(instance.business_id ?? ''),
                workflowInstanceId: String(instance.id ?? ''),
                stepKey: extras?.stepKey ?? 'step',
                taskType: extras?.taskType ?? extras?.stepKey ?? '',
                taskId: extras?.taskId,
                reviewerUserId,
                reviewerName: reviewerUserId,
            }
            : {
                businessType,
                businessId: String(instance.business_id ?? ''),
                workflowInstanceId: String(instance.id ?? ''),
                terminalStatus: extras?.terminalStatus ?? 'completed',
                reviewerUserId,
                reviewerName: reviewerUserId,
                rejectedReason: extras?.reason ?? null,
            };
        try {
            const res = await fetch(`${(0, resolve_hrm_api_base_url_1.resolveHrmApiBaseUrl)()}${path}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                this.logger.warn(`HRM recruitment ${mode} callback failed: ${res.status} ${text.slice(0, 200)}`);
            }
        }
        catch (err) {
            this.logger.warn(`HRM recruitment ${mode} callback error: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    async rejectStepTask(taskId, body) {
        const userId = String(body.userId ?? '');
        const reason = String(body.reason ?? body.reviewNote ?? '');
        const { rows: beforeRows } = await this.db.query(`SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id, i.context, i.id AS instance_id
       FROM public.xbos_workflow_step_task t
       JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
       WHERE t.id = $1::uuid`, [taskId]);
        const before = beforeRows[0];
        const { rows } = await this.db.query(`UPDATE public.xbos_workflow_step_task
       SET status = 'rejected', completed_at = NOW(), payload = payload || $2::jsonb, updated_at = NOW()
       WHERE id = $1::uuid AND status = 'pending'
       RETURNING *`, [taskId, JSON.stringify({ rejectedBy: userId, reason })]);
        if (!rows[0])
            throw new api_exception_1.ApiException('XBOS-WF-404', 'Task not found or not pending', common_1.HttpStatus.NOT_FOUND);
        const task = rows[0];
        await this.db.query(`UPDATE public.xbos_workflow_instance SET status = 'rejected', updated_at = NOW() WHERE id = $1::uuid`, [task.instance_id]);
        await this.db.query(`UPDATE public.xbos_workflow_step_task SET status = 'skipped', updated_at = NOW()
       WHERE instance_id = $1::uuid AND status = 'pending' AND id <> $2::uuid`, [task.instance_id, taskId]);
        if (before) {
            await this.notifyHrmLeaveTerminal({
                ...before,
                id: before.instance_id,
            }, 'rejected', userId, reason);
            await this.notifyHrmRecruitmentCallback({
                ...before,
                id: before.instance_id,
            }, 'terminal', userId, { reason, terminalStatus: 'rejected' });
        }
        return rows[0];
    }
    async applyParallelAnyPolicy(instanceId, completedTaskId, parallelGroupId) {
        await this.db.query(`UPDATE public.xbos_workflow_step_task
       SET status = 'skipped',
           payload = payload || '{"autoSkipped":true,"skipReason":"parallel_any_first_wins"}'::jsonb,
           updated_at = NOW()
       WHERE instance_id = $1::uuid
         AND id <> $2::uuid
         AND status = 'pending'
         AND payload->>'parallelGroupId' = $3`, [instanceId, completedTaskId, parallelGroupId]);
    }
    /**
     * Safety net for role/escalation fan-out that lacked parallelGroupId
     * (pre-TERMINAL-01 spawns). Same step_key + hat_key → any-of-role first wins.
     * Skipped when explicit parallel_group policy=all (must wait for all children).
     */
    async applySameStepHatAnyPolicy(instanceId, completedTaskId, stepKey, hatKey) {
        const sk = stepKey.trim();
        const hk = hatKey.trim().toLowerCase();
        if (!sk || !hk)
            return;
        await this.db.query(`UPDATE public.xbos_workflow_step_task
       SET status = 'skipped',
           payload = COALESCE(payload, '{}'::jsonb) || '{"autoSkipped":true,"skipReason":"same_step_hat_any_first_wins"}'::jsonb,
           updated_at = NOW()
       WHERE instance_id = $1::uuid
         AND id <> $2::uuid
         AND status = 'pending'
         AND step_key = $3
         AND lower(hat_key) = $4`, [instanceId, completedTaskId, sk, hk]);
    }
    async completeStepTask(taskId, body) {
        const userId = String(body.userId ?? '');
        const hatKey = String(body.hatKey ?? '');
        const { rows: taskRows } = await this.db.query(`SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id, i.context, i.id AS instance_id
       FROM public.xbos_workflow_step_task t
       JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
       WHERE t.id = $1::uuid`, [taskId]);
        const task = taskRows[0];
        if (!task)
            throw new api_exception_1.ApiException('XBOS-WF-404', 'Task not found', common_1.HttpStatus.NOT_FOUND);
        const instanceId = String(task.instance_id ?? '');
        const sameUserOtherHats = await this.db.query(`SELECT id, hat_key, status FROM public.xbos_workflow_step_task
       WHERE instance_id = $1::uuid AND assignee_user_id = $2 AND status = 'pending' AND id <> $3::uuid`, [instanceId, userId, taskId]);
        if (sameUserOtherHats.rows.length > 0 && !hatKey) {
            throw new api_exception_1.ApiException('XBOS-WF-422', 'Multi-hat approval: hatKey required (BR-XBOS-MULTI-HAT-01)', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const taskPayload = task.payload && typeof task.payload === 'object'
            ? task.payload
            : typeof task.payload === 'string'
                ? JSON.parse(task.payload)
                : {};
        const parallelGroupId = String(taskPayload.parallelGroupId ?? '');
        const parallelPolicy = String(taskPayload.parallelPolicy ?? 'all').toLowerCase();
        const { rows } = await this.db.query(`UPDATE public.xbos_workflow_step_task SET status = 'completed', completed_at = NOW(), payload = payload || $2::jsonb, updated_at = NOW()
       WHERE id = $1::uuid AND ($3::text = '' OR hat_key = $3) RETURNING *`, [taskId, JSON.stringify({ approvedBy: userId, hatKey }), hatKey]);
        if (parallelGroupId && parallelPolicy === 'any') {
            await this.applyParallelAnyPolicy(instanceId, taskId, parallelGroupId);
        }
        else if (!(parallelGroupId && parallelPolicy === 'all')) {
            // XHRM-REC-WF-BE-TERMINAL-01: legacy multi-assignee same hat without parallelGroupId
            const stepKeyForSkip = String(task.step_key ?? taskPayload.stepKey ?? '');
            const hatKeyForSkip = String(task.hat_key ?? taskPayload.hatKey ?? hatKey ?? '');
            await this.applySameStepHatAnyPolicy(instanceId, taskId, stepKeyForSkip, hatKeyForSkip);
        }
        await this.maybeAdvanceSequentialStep(instanceId);
        const pendingOnInstance = await this.db.query(`SELECT id FROM public.xbos_workflow_step_task WHERE instance_id = $1::uuid AND status = 'pending'`, [instanceId]);
        const instanceCompleted = pendingOnInstance.rows.length === 0;
        const stepKey = String(task.step_key ?? taskPayload.stepKey ?? '');
        const taskType = String(taskPayload.taskType ?? taskPayload.task_type ?? task.step_key ?? '');
        // JOIN selects i.id AS instance_id but t.* keeps step-task UUID on `id`.
        // Mirror rejectStepTask: remap id → instance_id for HRM workflowInstanceId.
        const notifyInstance = {
            ...task,
            id: instanceId,
        };
        // Always notify recruitment step first (incl. final step → map stage before terminal).
        await this.notifyHrmRecruitmentCallback(notifyInstance, 'step', userId, {
            stepKey,
            taskType,
            taskId: String(task.id ?? taskId),
        });
        if (instanceCompleted) {
            await this.db.query(`UPDATE public.xbos_workflow_instance SET status = 'completed', updated_at = NOW() WHERE id = $1::uuid`, [instanceId]);
            await this.notifyHrmLeaveTerminal(notifyInstance, 'completed', userId);
            await this.notifyHrmRecruitmentCallback(notifyInstance, 'terminal', userId, {
                terminalStatus: 'completed',
            });
        }
        return { task: rows[0], pendingHats: sameUserOtherHats.rows, instanceCompleted };
    }
    /**
     * Without `partition`: legacy highest-version active (ensure / catalog).
     * With `partition` (Option B): member override → group-wide → G-BM-REC-02 applicable.
     */
    async findActiveDefinitionByCode(tenantId, workflowCode, partition) {
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_workflow_definition
       WHERE tenant_id = $1 AND workflow_code = $2 AND status = 'active'
       ORDER BY version DESC`, [tenantId, workflowCode]);
        if (!rows[0])
            return null;
        if (!partition) {
            return rows[0] ?? null;
        }
        const candidates = [];
        for (const row of rows) {
            const applying = (0, workflow_apply_scope_1.parseApplyingEntityIdFromGraph)(row.graph);
            let resolvedPartition = null;
            if (applying && (0, workflow_apply_scope_1.isLegalEntityUuid)(applying)) {
                resolvedPartition = await this.resolveApplyingEntityPartition(applying);
            }
            candidates.push({
                ...row,
                resolvedPartition,
            });
        }
        return (0, workflow_apply_scope_1.pickActiveDefinitionForCompanyPartition)(candidates, partition);
    }
    async listInstances(tenantId, companyId, status) {
        const { rows } = await this.db.query(`SELECT i.*, d.workflow_code, d.name AS workflow_name
       FROM public.xbos_workflow_instance i
       JOIN public.xbos_workflow_definition d ON d.id = i.definition_id
       WHERE i.tenant_id = $1 AND i.company_id = $2 AND ($3::text IS NULL OR i.status = $3)
       ORDER BY i.created_at DESC`, [tenantId, companyId, status ?? null]);
        return rows;
    }
    async upsertReportingRoute(tenantId, companyId, body) {
        const { rows } = await this.db.query(`INSERT INTO public.xbos_reporting_route (tenant_id, company_id, report_level, recipient_user_id, recipient_assignment_id, workflow_category)
       VALUES ($1,$2,$3,$4,$5::uuid,$6) RETURNING *`, [tenantId, companyId, body.reportLevel, body.recipientUserId ?? null, body.recipientAssignmentId ?? null, body.workflowCategory ?? null]);
        return rows[0];
    }
    async listReportingRoutes(tenantId, companyId) {
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_reporting_route WHERE tenant_id = $1 AND company_id = $2 AND status = 'active'`, [tenantId, companyId]);
        return rows;
    }
};
exports.WorkflowEngineService = WorkflowEngineService;
exports.WorkflowEngineService = WorkflowEngineService = WorkflowEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService])
], WorkflowEngineService);
