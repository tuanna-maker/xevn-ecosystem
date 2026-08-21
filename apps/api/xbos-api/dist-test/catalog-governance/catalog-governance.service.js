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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogGovernanceService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const resolve_hrm_api_base_url_1 = require("../common/resolve-hrm-api-base-url");
const workflow_catalog_constants_1 = require("../workflow-engine/workflow-catalog.constants");
const workflow_engine_service_1 = require("../workflow-engine/workflow-engine.service");
function parseWorkflowGraphSteps(raw) {
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
            return parseWorkflowGraphSteps(JSON.parse(raw));
        }
        catch {
            return [];
        }
    }
    return [];
}
function catalogApprovalStepAssignee(steps) {
    const approval = steps.find((s) => String(s.stepKey ?? s.step_key ?? '') === 'group_catalog_approval');
    if (!approval)
        return null;
    const assignee = approval.assigneeUserId ?? approval.assignee_user_id;
    return typeof assignee === 'string' ? assignee.trim().toLowerCase() : null;
}
let CatalogGovernanceService = class CatalogGovernanceService {
    workflow;
    constructor(workflow) {
        this.workflow = workflow;
    }
    internalKey() {
        return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
    }
    resolveMemberScopeFromContext(context) {
        if (!context || typeof context !== 'object') {
            return {};
        }
        const ctx = context;
        const tenantId = typeof ctx.memberTenantId === 'string' ? ctx.memberTenantId.trim() : undefined;
        const companyId = typeof ctx.memberCompanyId === 'string' ? ctx.memberCompanyId.trim() : undefined;
        return { tenantId, companyId };
    }
    async hrmFetch(path, init = {}) {
        const { reviewerUserId, tenantId, companyId, ...fetchInit } = init;
        const headers = {
            'x-internal-api-key': this.internalKey(),
            'content-type': 'application/json',
            ...(reviewerUserId ? { 'x-user-id': reviewerUserId } : {}),
            ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
            ...(companyId ? { 'x-company-id': companyId } : {}),
        };
        const res = await fetch(`${(0, resolve_hrm_api_base_url_1.resolveHrmApiBaseUrl)()}${path}`, {
            ...fetchInit,
            headers: { ...headers, ...fetchInit.headers },
        });
        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        }
        catch {
            throw new api_exception_1.ApiException('XBOS-CAT-502', 'HRM upstream error', common_1.HttpStatus.BAD_GATEWAY, {
                status: res.status,
                body: text.slice(0, 200),
            });
        }
        if (!res.ok || json.success === false) {
            throw new api_exception_1.ApiException('XBOS-CAT-502', json.message ?? 'HRM call failed', res.status, json);
        }
        return json.data;
    }
    async ensureXeDuLichCatalogWorkflow() {
        const body = (0, workflow_catalog_constants_1.buildXeDuLichCatalogWorkflowDefinition)();
        const existing = await this.workflow.findActiveDefinitionByCode(workflow_catalog_constants_1.MASTER_TENANT_XEVN, body.workflowCode);
        if (existing) {
            const existingSteps = parseWorkflowGraphSteps(existing.graph);
            const canonicalAssignee = workflow_catalog_constants_1.GROUP_APPROVER_USER.toLowerCase();
            const currentAssignee = catalogApprovalStepAssignee(existingSteps);
            if (currentAssignee !== canonicalAssignee) {
                return this.workflow.upsertDefinition(workflow_catalog_constants_1.MASTER_TENANT_XEVN, workflow_catalog_constants_1.MASTER_COMPANY_HOLDING, String(existing.id), {
                    ...body,
                    name: String(existing.name ?? body.name),
                });
            }
            return existing;
        }
        return this.workflow.upsertDefinition(workflow_catalog_constants_1.MASTER_TENANT_XEVN, workflow_catalog_constants_1.MASTER_COMPANY_HOLDING, null, body);
    }
    async startCatalogApprovalWorkflow(payload) {
        const definition = await this.ensureXeDuLichCatalogWorkflow();
        const def = definition;
        const batchDetail = (await this.hrmFetch(`/api/hrm/settings-catalogs/batches/${encodeURIComponent(payload.batchId)}`, {
            method: 'GET',
            tenantId: payload.memberTenantId,
            companyId: payload.memberCompanyId,
        }));
        const approvalStep = def.graph?.steps?.find((s) => s.stepKey === 'group_catalog_approval');
        const instance = await this.workflow.startInstance(workflow_catalog_constants_1.MASTER_TENANT_XEVN, workflow_catalog_constants_1.MASTER_COMPANY_HOLDING, {
            definitionId: def.id,
            businessType: workflow_catalog_constants_1.WF_BUSINESS_TYPE_HRM_CATALOG,
            businessId: payload.batchId,
            context: {
                memberTenantId: payload.memberTenantId,
                memberCompanyId: payload.memberCompanyId,
                batchId: payload.batchId,
                requesterUserId: payload.requesterUserId ?? null,
                itemCount: batchDetail.items?.length ?? 0,
                items: batchDetail.items ?? [],
            },
            steps: approvalStep
                ? [
                    {
                        stepKey: approvalStep.stepKey,
                        hatKey: approvalStep.hatKey ?? 'group_ceo',
                        assigneeUserId: workflow_catalog_constants_1.GROUP_APPROVER_USER,
                    },
                ]
                : [],
        });
        const inst = instance;
        await this.hrmFetch(`/api/hrm/settings-catalogs/batches/${encodeURIComponent(payload.batchId)}/workflow`, {
            method: 'POST',
            tenantId: payload.memberTenantId,
            companyId: payload.memberCompanyId,
            body: JSON.stringify({ workflowInstanceId: inst.id }),
        });
        return { workflowInstanceId: inst.id, definitionId: def.id, batchId: payload.batchId };
    }
    async listApprovalInbox(assigneeUserId) {
        const tasks = await this.workflow.listStepTasks({
            assigneeUserId,
            tenantId: workflow_catalog_constants_1.MASTER_TENANT_XEVN,
            status: 'pending',
            businessType: workflow_catalog_constants_1.WF_BUSINESS_TYPE_HRM_CATALOG,
        });
        return { items: tasks };
    }
    async getApprovalDetail(instanceId) {
        const detail = await this.workflow.getInstanceWithTasks(instanceId);
        const inst = detail.instance;
        const memberScope = this.resolveMemberScopeFromContext(inst.context);
        const batchDetail = await this.hrmFetch(`/api/hrm/settings-catalogs/batches/${encodeURIComponent(String(inst.business_id))}`, {
            method: 'GET',
            tenantId: memberScope.tenantId,
            companyId: memberScope.companyId,
        });
        return { ...detail, batchDetail };
    }
    async actOnTask(taskId, decision, reviewerUserId, reviewNote) {
        const task = (await this.workflow.getTaskById(taskId));
        const batchId = String(task.business_id);
        const memberScope = this.resolveMemberScopeFromContext(task.context);
        if (decision === 'reject') {
            await this.workflow.rejectStepTask(taskId, { userId: reviewerUserId, reviewNote });
            await this.hrmFetch(`/api/hrm/settings-catalogs/batches/${encodeURIComponent(batchId)}/review`, {
                method: 'POST',
                reviewerUserId,
                tenantId: memberScope.tenantId,
                companyId: memberScope.companyId,
                body: JSON.stringify({ decision: 'rejected', review_note: reviewNote ?? null }),
            });
            return { decision: 'rejected', batchId, taskId };
        }
        const result = await this.workflow.completeStepTask(taskId, {
            userId: reviewerUserId,
            hatKey: task.hat_key || 'group_ceo',
            reviewNote,
        });
        if (result.instanceCompleted) {
            await this.hrmFetch(`/api/hrm/settings-catalogs/batches/${encodeURIComponent(batchId)}/review`, {
                method: 'POST',
                reviewerUserId,
                tenantId: memberScope.tenantId,
                companyId: memberScope.companyId,
                body: JSON.stringify({ decision: 'approved', review_note: reviewNote ?? null }),
            });
        }
        return { decision: 'approved', batchId, taskId, ...result };
    }
    listPendingExtensionRequests(tenantId) {
        const q = new URLSearchParams({ status: 'pending' });
        if (tenantId)
            q.set('tenantId', tenantId);
        return this.hrmFetch(`/api/hrm/settings-catalogs/extension-requests?${q.toString()}`, {
            method: 'GET',
        });
    }
};
exports.CatalogGovernanceService = CatalogGovernanceService;
exports.CatalogGovernanceService = CatalogGovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], CatalogGovernanceService);
