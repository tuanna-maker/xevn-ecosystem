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
exports.OperationsController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const create_service_request_dto_1 = require("./dto/create-service-request.dto");
const create_task_dto_1 = require("./dto/create-task.dto");
const decide_service_request_dto_1 = require("./dto/decide-service-request.dto");
const list_service_requests_query_dto_1 = require("./dto/list-service-requests.query.dto");
const list_tasks_query_dto_1 = require("./dto/list-tasks.query.dto");
const update_service_request_dto_1 = require("./dto/update-service-request.dto");
const update_task_status_dto_1 = require("./dto/update-task-status.dto");
const operations_service_1 = require("./operations.service");
let OperationsController = class OperationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized operations access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    createTask(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .createTask(body, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OPS-201', 'Task created'));
    }
    listTasks(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listTasks(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OPS-200', 'Tasks listed'));
    }
    updateTaskStatus(taskId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service
            .updateTaskStatus(taskId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OPS-202', 'Task updated'));
    }
    getSummary(authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service
            .getSummary(companyId, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OPS-200', 'Summary generated'));
    }
    createServiceRequest(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .createServiceRequest(body, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SVC-201', 'Service request created'));
    }
    listServiceRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listServiceRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SVC-200', 'Service requests listed'));
    }
    updateServiceRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service
            .updateServiceRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SVC-202', 'Service request updated'));
    }
    deleteServiceRequest(requestId, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service
            .deleteServiceRequest(requestId, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SVC-205', 'Service request deleted'));
    }
    approveServiceRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service
            .approveServiceRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SVC-203', 'Service request approved'));
    }
    rejectServiceRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service
            .rejectServiceRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SVC-204', 'Service request rejected'));
    }
};
exports.OperationsController = OperationsController;
__decorate([
    (0, common_1.Post)('tasks'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_tasks_query_dto_1.ListTasksQueryDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "listTasks", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId/status'),
    __param(0, (0, common_1.Param)('taskId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_task_status_dto_1.UpdateTaskStatusDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "updateTaskStatus", null);
__decorate([
    (0, common_1.Get)('reports/summary'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('tenant_id')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)('service-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_service_request_dto_1.CreateServiceRequestDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "createServiceRequest", null);
__decorate([
    (0, common_1.Get)('service-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_service_requests_query_dto_1.ListServiceRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "listServiceRequests", null);
__decorate([
    (0, common_1.Patch)('service-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_service_request_dto_1.UpdateServiceRequestDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "updateServiceRequest", null);
__decorate([
    (0, common_1.Delete)('service-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "deleteServiceRequest", null);
__decorate([
    (0, common_1.Post)('service-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_service_request_dto_1.DecideServiceRequestDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "approveServiceRequest", null);
__decorate([
    (0, common_1.Post)('service-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_service_request_dto_1.DecideServiceRequestDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "rejectServiceRequest", null);
exports.OperationsController = OperationsController = __decorate([
    (0, common_1.Controller)('operations'),
    __metadata("design:paramtypes", [operations_service_1.OperationsService])
], OperationsController);
//# sourceMappingURL=operations.controller.js.map