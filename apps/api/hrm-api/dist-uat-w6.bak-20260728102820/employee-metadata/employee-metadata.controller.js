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
exports.EmployeeMetadataController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const decide_employee_metadata_change_dto_1 = require("./dto/decide-employee-metadata-change.dto");
const list_employee_metadata_change_requests_query_dto_1 = require("./dto/list-employee-metadata-change-requests.query.dto");
const submit_employee_metadata_change_dto_1 = require("./dto/submit-employee-metadata-change.dto");
const employee_metadata_service_1 = require("./employee-metadata.service");
let EmployeeMetadataController = class EmployeeMetadataController {
    employeeMetadataService;
    constructor(employeeMetadataService) {
        this.employeeMetadataService = employeeMetadataService;
    }
    assertBusinessAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized employee metadata access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    submitChangeRequest(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.employeeMetadataService
            .submitChangeRequest(body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-META-201', 'Metadata change request submitted'));
    }
    listChangeRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeMetadataService
            .listChangeRequests(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-META-200', 'Metadata change requests listed'));
    }
    approveChangeRequest(changeRequestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.employeeMetadataService
            .approveChangeRequest(changeRequestId, body, scope.companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-META-202', 'Metadata change request approved'));
    }
    rejectChangeRequest(changeRequestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.employeeMetadataService
            .rejectChangeRequest(changeRequestId, body, scope.companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-META-203', 'Metadata change request rejected'));
    }
    listAuditLogs(authorization, internalApiKey, tenantId, companyId, employeeId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.employeeMetadataService
            .listAuditLogs(companyId, employeeId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-META-204', 'Metadata audit logs listed'));
    }
};
exports.EmployeeMetadataController = EmployeeMetadataController;
__decorate([
    (0, common_1.Post)('change-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, submit_employee_metadata_change_dto_1.SubmitEmployeeMetadataChangeDto]),
    __metadata("design:returntype", void 0)
], EmployeeMetadataController.prototype, "submitChangeRequest", null);
__decorate([
    (0, common_1.Get)('change-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_employee_metadata_change_requests_query_dto_1.ListEmployeeMetadataChangeRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeeMetadataController.prototype, "listChangeRequests", null);
__decorate([
    (0, common_1.Post)('change-requests/:changeRequestId/approve'),
    __param(0, (0, common_1.Param)('changeRequestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_employee_metadata_change_dto_1.DecideEmployeeMetadataChangeDto]),
    __metadata("design:returntype", void 0)
], EmployeeMetadataController.prototype, "approveChangeRequest", null);
__decorate([
    (0, common_1.Post)('change-requests/:changeRequestId/reject'),
    __param(0, (0, common_1.Param)('changeRequestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_employee_metadata_change_dto_1.DecideEmployeeMetadataChangeDto]),
    __metadata("design:returntype", void 0)
], EmployeeMetadataController.prototype, "rejectChangeRequest", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Query)('employee_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], EmployeeMetadataController.prototype, "listAuditLogs", null);
exports.EmployeeMetadataController = EmployeeMetadataController = __decorate([
    (0, common_1.Controller)('employee-metadata'),
    __metadata("design:paramtypes", [employee_metadata_service_1.EmployeeMetadataService])
], EmployeeMetadataController);
//# sourceMappingURL=employee-metadata.controller.js.map