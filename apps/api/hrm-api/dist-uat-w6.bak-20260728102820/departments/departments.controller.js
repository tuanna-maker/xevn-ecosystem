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
exports.DepartmentsController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const departments_service_1 = require("./departments.service");
const create_department_dto_1 = require("./dto/create-department.dto");
const list_departments_query_dto_1 = require("./dto/list-departments.query.dto");
const update_department_dto_1 = require("./dto/update-department.dto");
let DepartmentsController = class DepartmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized departments access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    list(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listDepartments(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEPT-200', 'Departments listed'));
    }
    getById(departmentId, authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.service
            .getDepartmentById(departmentId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEPT-200', 'Department loaded'));
    }
    create(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .createDepartment(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEPT-201', 'Department created'));
    }
    update(departmentId, authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .updateDepartment(departmentId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEPT-200', 'Department updated'));
    }
    remove(departmentId, authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.service
            .deleteDepartment(departmentId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEPT-200', 'Department deleted'));
    }
};
exports.DepartmentsController = DepartmentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_departments_query_dto_1.ListDepartmentsQueryDto]),
    __metadata("design:returntype", void 0)
], DepartmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':departmentId'),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], DepartmentsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", void 0)
], DepartmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':departmentId'),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_department_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", void 0)
], DepartmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':departmentId'),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], DepartmentsController.prototype, "remove", null);
exports.DepartmentsController = DepartmentsController = __decorate([
    (0, common_1.Controller)('departments'),
    __metadata("design:paramtypes", [departments_service_1.DepartmentsService])
], DepartmentsController);
//# sourceMappingURL=departments.controller.js.map