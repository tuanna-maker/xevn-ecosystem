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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogGovernanceController = void 0;
const common_1 = require("@nestjs/common");
const api_response_1 = require("../common/api-response");
const api_exception_1 = require("../common/api.exception");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const workflow_catalog_constants_1 = require("../workflow-engine/workflow-catalog.constants");
const config_sync_service_1 = require("../config-sync/config-sync.service");
const publish_catalog_dto_1 = require("../config-sync/dto/publish-catalog.dto");
const catalog_governance_service_1 = require("./catalog-governance.service");
const start_catalog_workflow_dto_1 = require("./dto/start-catalog-workflow.dto");
let CatalogGovernanceController = class CatalogGovernanceController {
    governance;
    configSync;
    constructor(governance, configSync) {
        this.governance = governance;
        this.configSync = configSync;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized catalog governance access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    /** Group CEO reads and catalog approval acts — JWT `main` maps to legal partition `holding` (ADR C2). */
    resolveGroupReadScope(authorization, tenantId, companyId) {
        return (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, {
            tenantId: tenantId?.trim() || workflow_catalog_constants_1.MASTER_TENANT_XEVN,
            companyId: companyId?.trim() || workflow_catalog_constants_1.MASTER_COMPANY_HOLDING,
        });
    }
    /** Group CEO writes — strict JWT∩query match. */
    resolveGroupWriteScope(authorization, tenantId, companyId) {
        return (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: tenantId?.trim() || workflow_catalog_constants_1.MASTER_TENANT_XEVN,
            companyId: companyId?.trim() || workflow_catalog_constants_1.MASTER_COMPANY_HOLDING,
        });
    }
    /** XBOS-DM-HRM-09 — SRS alias for catalog version publish (delegates to config-sync). */
    async publishCatalogVersion(body, catalogKey = 'job_titles', authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, {
            tenantId: body.tenantId,
            companyId: body.companyId,
        });
        const data = await this.configSync.publishCatalog(catalogKey, {
            tenantId: scope.tenantId,
            companyId: scope.companyId,
            name: body.name,
            domain: body.domain,
            assignedTo: body.assignedTo,
            items: body.items,
            actor: body.actor,
        });
        return (0, api_response_1.ok)(data, 'XBOS-CFG-203', 'Catalog published via catalog-governance');
    }
    async seedWorkflow(tenantId, companyId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        this.resolveGroupWriteScope(authorization, tenantId, companyId);
        const data = await this.governance.ensureXeDuLichCatalogWorkflow();
        return (0, api_response_1.ok)(data, 'XBOS-CAT-210', 'HRM catalog approval workflow seeded');
    }
    async startWorkflow(body, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        const memberScope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: body.memberTenantId,
            companyId: body.memberCompanyId,
        });
        const data = await this.governance.startCatalogApprovalWorkflow({
            batchId: body.batchId,
            memberTenantId: memberScope.tenantId,
            memberCompanyId: memberScope.companyId,
            requesterUserId: body.requesterUserId,
        });
        return (0, api_response_1.ok)(data, 'XBOS-CAT-211', 'Catalog approval workflow started');
    }
    async inbox(assigneeUserId, tenantId, companyId, headerUserId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        this.resolveGroupReadScope(authorization, tenantId, companyId);
        const user = assigneeUserId?.trim() || headerUserId?.trim() || 'ceo@xe.vn';
        const data = await this.governance.listApprovalInbox(user);
        return (0, api_response_1.ok)(data, 'XBOS-CAT-212', 'Catalog approval inbox');
    }
    async instanceDetail(instanceId, tenantId, companyId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        this.resolveGroupReadScope(authorization, tenantId, companyId);
        const data = await this.governance.getApprovalDetail(instanceId);
        return (0, api_response_1.ok)(data, 'XBOS-CAT-213', 'Catalog approval detail');
    }
    async approveTask(taskId, body, tenantId, companyId, reviewerUserId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        this.resolveGroupReadScope(authorization, tenantId, companyId);
        const reviewer = reviewerUserId?.trim() || 'ceo@xe.vn';
        const data = await this.governance.actOnTask(taskId, 'approve', reviewer, body?.review_note);
        return (0, api_response_1.ok)(data, 'XBOS-CAT-201', 'Catalog extension approved via workflow');
    }
    async rejectTask(taskId, body, tenantId, companyId, reviewerUserId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        this.resolveGroupReadScope(authorization, tenantId, companyId);
        const reviewer = reviewerUserId?.trim() || 'ceo@xe.vn';
        const data = await this.governance.actOnTask(taskId, 'reject', reviewer, body?.review_note);
        return (0, api_response_1.ok)(data, 'XBOS-CAT-202', 'Catalog extension rejected via workflow');
    }
    async listPending(tenantId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        const data = await this.governance.listPendingExtensionRequests(scope.tenantId);
        return (0, api_response_1.ok)(data, 'XBOS-CAT-200', 'Pending HRM catalog extension requests');
    }
};
exports.CatalogGovernanceController = CatalogGovernanceController;
__decorate([
    (0, common_1.Post)('publish'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('catalogKey')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_catalog_dto_1.PublishCatalogDto, Object, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "publishCatalogVersion", null);
__decorate([
    (0, common_1.Post)('workflows/seed-xe-du-lich-catalog'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "seedWorkflow", null);
__decorate([
    (0, common_1.Post)('workflows/start'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [start_catalog_workflow_dto_1.StartCatalogWorkflowDto, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "startWorkflow", null);
__decorate([
    (0, common_1.Get)('inbox'),
    __param(0, (0, common_1.Query)('assigneeUserId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('x-user-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "inbox", null);
__decorate([
    (0, common_1.Get)('instances/:instanceId'),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "instanceDetail", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/approve'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('companyId')),
    __param(4, (0, common_1.Headers)('x-user-id')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "approveTask", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/reject'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('companyId')),
    __param(4, (0, common_1.Headers)('x-user-id')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "rejectTask", null);
__decorate([
    (0, common_1.Get)('extension-requests'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogGovernanceController.prototype, "listPending", null);
exports.CatalogGovernanceController = CatalogGovernanceController = __decorate([
    (0, common_1.Controller)('catalog-governance'),
    __metadata("design:paramtypes", [catalog_governance_service_1.CatalogGovernanceService,
        config_sync_service_1.ConfigSyncService])
], CatalogGovernanceController);
