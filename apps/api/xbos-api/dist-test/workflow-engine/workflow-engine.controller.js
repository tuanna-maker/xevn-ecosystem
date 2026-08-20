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
exports.WorkflowEngineController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const workflow_engine_service_1 = require("./workflow-engine.service");
let WorkflowEngineController = class WorkflowEngineController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async listDefinitions(tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)({ items: await this.service.listDefinitions(scope.tenantId, scope.companyId) }, 'XBOS-WF-200', 'Definitions loaded');
    }
    async createDefinition(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)(await this.service.upsertDefinition(scope.tenantId, scope.companyId, null, body), 'XBOS-WF-201', 'Definition saved');
    }
    async updateDefinition(definitionId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)(await this.service.upsertDefinition(scope.tenantId, scope.companyId, definitionId, body), 'XBOS-WF-201', 'Definition saved');
    }
    async startInstance(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        if (body.workflowCode || body.workflow_code) {
            return (0, api_response_1.ok)(await this.service.startInstanceFromWorkflowCode(scope.tenantId, scope.companyId, body), 'XBOS-WF-201', 'Instance started');
        }
        return (0, api_response_1.ok)(await this.service.startInstance(scope.tenantId, scope.companyId, body), 'XBOS-WF-201', 'Instance started');
    }
    async startInstanceAlias(body, tenantId, companyId, authorization, internalApiKey) {
        return this.startInstance(body, tenantId, companyId, authorization, internalApiKey);
    }
    async listInstances(status, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)({ items: await this.service.listInstances(scope.tenantId, scope.companyId, status) }, 'XBOS-WF-200', 'Instances loaded');
    }
    async listTasks(assigneeUserId, tenantId, status, businessType, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        return (0, api_response_1.ok)({
            items: await this.service.listStepTasks({
                assigneeUserId,
                tenantId,
                status,
                businessType,
            }),
        }, 'XBOS-WF-203', 'Tasks loaded');
    }
    async instanceDetail(instanceId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        return (0, api_response_1.ok)(await this.service.getInstanceWithTasks(instanceId), 'XBOS-WF-204', 'Instance detail loaded');
    }
    async completeTask(taskId, body, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        return (0, api_response_1.ok)(await this.service.completeStepTask(taskId, body), 'XBOS-WF-200', 'Task completed');
    }
    async rejectTask(taskId, body, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        return (0, api_response_1.ok)(await this.service.rejectStepTask(taskId, body), 'XBOS-WF-205', 'Task rejected');
    }
    async listRoutes(tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)({ items: await this.service.listReportingRoutes(scope.tenantId, scope.companyId) }, 'XBOS-WF-200', 'Routes loaded');
    }
    async createRoute(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)(await this.service.upsertReportingRoute(scope.tenantId, scope.companyId, body), 'XBOS-WF-201', 'Route saved');
    }
};
exports.WorkflowEngineController = WorkflowEngineController;
__decorate([
    (0, common_1.Get)('definitions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "listDefinitions", null);
__decorate([
    (0, common_1.Post)('definitions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "createDefinition", null);
__decorate([
    (0, common_1.Put)('definitions/:definitionId'),
    __param(0, (0, common_1.Param)('definitionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "updateDefinition", null);
__decorate([
    (0, common_1.Post)('instances'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "startInstance", null);
__decorate([
    (0, common_1.Post)('instances/start'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "startInstanceAlias", null);
__decorate([
    (0, common_1.Get)('instances'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "listInstances", null);
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Query)('assigneeUserId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('businessType')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "listTasks", null);
__decorate([
    (0, common_1.Get)('instances/:instanceId/detail'),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "instanceDetail", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/complete'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "completeTask", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/reject'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "rejectTask", null);
__decorate([
    (0, common_1.Get)('reporting-routes'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "listRoutes", null);
__decorate([
    (0, common_1.Post)('reporting-routes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "createRoute", null);
exports.WorkflowEngineController = WorkflowEngineController = __decorate([
    (0, common_1.Controller)('workflow-engine'),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], WorkflowEngineController);
