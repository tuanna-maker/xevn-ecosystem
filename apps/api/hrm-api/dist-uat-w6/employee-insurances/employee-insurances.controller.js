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
exports.EmployeeInsurancesController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const create_employee_insurance_dto_1 = require("./dto/create-employee-insurance.dto");
const list_employee_insurances_query_dto_1 = require("./dto/list-employee-insurances.query.dto");
const update_employee_insurance_dto_1 = require("./dto/update-employee-insurance.dto");
const employee_insurances_service_1 = require("./employee-insurances.service");
let EmployeeInsurancesController = class EmployeeInsurancesController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized employee insurances access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    list(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .list(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EINS-200', 'Employee insurances listed'));
    }
    getById(insuranceId, authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.service
            .getById(insuranceId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EINS-200', 'Employee insurance loaded'));
    }
    create(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .create(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EINS-201', 'Employee insurance created'));
    }
    update(insuranceId, authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .update(insuranceId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EINS-200', 'Employee insurance updated'));
    }
    remove(insuranceId, authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.service
            .remove(insuranceId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EINS-200', 'Employee insurance deleted'));
    }
};
exports.EmployeeInsurancesController = EmployeeInsurancesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_employee_insurances_query_dto_1.ListEmployeeInsurancesQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeeInsurancesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':insuranceId'),
    __param(0, (0, common_1.Param)('insuranceId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], EmployeeInsurancesController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_employee_insurance_dto_1.CreateEmployeeInsuranceDto]),
    __metadata("design:returntype", void 0)
], EmployeeInsurancesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':insuranceId'),
    __param(0, (0, common_1.Param)('insuranceId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_employee_insurance_dto_1.UpdateEmployeeInsuranceDto]),
    __metadata("design:returntype", void 0)
], EmployeeInsurancesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':insuranceId'),
    __param(0, (0, common_1.Param)('insuranceId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], EmployeeInsurancesController.prototype, "remove", null);
exports.EmployeeInsurancesController = EmployeeInsurancesController = __decorate([
    (0, common_1.Controller)('employee-insurances'),
    __metadata("design:paramtypes", [employee_insurances_service_1.EmployeeInsurancesService])
], EmployeeInsurancesController);
//# sourceMappingURL=employee-insurances.controller.js.map