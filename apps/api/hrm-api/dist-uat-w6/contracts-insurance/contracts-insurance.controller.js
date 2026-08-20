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
exports.ContractsInsuranceController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_context_1 = require("../common/hrm-list-scope-context");
const scope_context_1 = require("../common/scope-context");
const contracts_insurance_service_1 = require("./contracts-insurance.service");
const create_compensation_package_dto_1 = require("./dto/create-compensation-package.dto");
const create_contract_dto_1 = require("./dto/create-contract.dto");
const create_insurance_record_dto_1 = require("./dto/create-insurance-record.dto");
const list_compensation_query_dto_1 = require("./dto/list-compensation.query.dto");
const list_expiring_query_dto_1 = require("./dto/list-expiring.query.dto");
const list_contracts_query_dto_1 = require("./dto/list-contracts.query.dto");
const update_contract_dto_1 = require("./dto/update-contract.dto");
const employee_compensation_service_1 = require("./employee-compensation.service");
let ContractsInsuranceController = class ContractsInsuranceController {
    service;
    compensation;
    constructor(service, compensation) {
        this.service = service;
        this.compensation = compensation;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized contracts/insurance access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    createCompensationPackage(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.compensation
            .createPackage(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-COMP-201', 'Compensation package created'));
    }
    getActiveCompensationPackage(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.compensation
            .getActivePackage(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-COMP-200', 'Active compensation package'));
    }
    listCompensationPackages(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.compensation
            .listPackages(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-COMP-200', 'Compensation packages listed'));
    }
    getCompensationPackageById(authorization, internalApiKey, tenantId, headerCompanyId, packageId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.compensation
            .getPackageById(packageId, query.company_id ?? headerCompanyId ?? 'main', authorization, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-COMP-200', 'Compensation package detail'));
    }
    reviseCompensationPackage(authorization, internalApiKey, tenantId, headerCompanyId, packageId, body, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId,
            companyId: query.company_id ?? headerCompanyId,
        });
        return this.compensation
            .revisePackage(packageId, body, query.company_id ?? headerCompanyId ?? 'main', authorization, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-COMP-201', 'Compensation package revised'));
    }
    listCompensationHistory(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.compensation
            .listHistory(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-COMP-200', 'Compensation history listed'));
    }
    createContract(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .createContract(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-201', 'Contract created'));
    }
    createInsurance(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service
            .createInsuranceRecord(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-202', 'Insurance record created'));
    }
    listExpiringContracts(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listExpiringContracts(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-200', 'Expiring contracts listed'));
    }
    listInsurance(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listInsurance(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-200', 'Insurance listed'));
    }
    listInsurancePolicyParticipants(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listInsurance(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-INS-200', 'Insurance policy participants listed'));
    }
    listExpiringInsurance(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listExpiringInsurance(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-200', 'Expiring insurance listed'));
    }
    listContracts(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .listContracts(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-200', 'Contracts listed'));
    }
    getContractById(authorization, internalApiKey, tenantId, headerCompanyId, contractId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service
            .getContractById(contractId, query.company_id ?? headerCompanyId ?? 'main', authorization, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-200', 'Contract detail'));
    }
    updateContract(authorization, internalApiKey, tenantId, headerCompanyId, contractId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: headerCompanyId });
        return this.service
            .updateContract(contractId, body, headerCompanyId ?? 'main', authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-200', 'Contract updated'));
    }
    deleteContract(authorization, internalApiKey, tenantId, headerCompanyId, contractId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: headerCompanyId });
        return this.service
            .deleteContract(contractId, headerCompanyId ?? 'main', authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-CON-200', 'Contract deleted'));
    }
};
exports.ContractsInsuranceController = ContractsInsuranceController;
__decorate([
    (0, common_1.Post)('compensation-packages'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_compensation_package_dto_1.CreateCompensationPackageDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "createCompensationPackage", null);
__decorate([
    (0, common_1.Get)('compensation-packages/active'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_compensation_query_dto_1.ListCompensationQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "getActiveCompensationPackage", null);
__decorate([
    (0, common_1.Get)('compensation-packages'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_compensation_query_dto_1.ListCompensationQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "listCompensationPackages", null);
__decorate([
    (0, common_1.Get)('compensation-packages/:packageId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('packageId', new common_1.ParseUUIDPipe())),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, list_compensation_query_dto_1.ListCompensationQueryDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "getCompensationPackageById", null);
__decorate([
    (0, common_1.Post)('compensation-packages/:packageId/revise'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('packageId', new common_1.ParseUUIDPipe())),
    __param(5, (0, common_1.Body)()),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, create_compensation_package_dto_1.ReviseCompensationPackageDto,
        list_compensation_query_dto_1.ListCompensationQueryDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "reviseCompensationPackage", null);
__decorate([
    (0, common_1.Get)('compensation-history'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_compensation_query_dto_1.ListCompensationQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "listCompensationHistory", null);
__decorate([
    (0, common_1.Post)('contracts'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_contract_dto_1.CreateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "createContract", null);
__decorate([
    (0, common_1.Post)('insurance'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_insurance_record_dto_1.CreateInsuranceRecordDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "createInsurance", null);
__decorate([
    (0, common_1.Get)('contracts/expiring'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_expiring_query_dto_1.ListExpiringQueryDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "listExpiringContracts", null);
__decorate([
    (0, common_1.Get)('insurance'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_contracts_query_dto_1.ListContractsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "listInsurance", null);
__decorate([
    (0, common_1.Get)('insurance-policy-participants'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_contracts_query_dto_1.ListContractsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "listInsurancePolicyParticipants", null);
__decorate([
    (0, common_1.Get)('insurance/expiring'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_expiring_query_dto_1.ListExpiringQueryDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "listExpiringInsurance", null);
__decorate([
    (0, common_1.Get)('contracts'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_contracts_query_dto_1.ListContractsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "listContracts", null);
__decorate([
    (0, common_1.Get)('contracts/:contractId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('contractId', new common_1.ParseUUIDPipe())),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, list_contracts_query_dto_1.ListContractsQueryDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "getContractById", null);
__decorate([
    (0, common_1.Patch)('contracts/:contractId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('contractId')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, update_contract_dto_1.UpdateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "updateContract", null);
__decorate([
    (0, common_1.Delete)('contracts/:contractId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('contractId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], ContractsInsuranceController.prototype, "deleteContract", null);
exports.ContractsInsuranceController = ContractsInsuranceController = __decorate([
    (0, common_1.Controller)('contracts-insurance'),
    __metadata("design:paramtypes", [contracts_insurance_service_1.ContractsInsuranceService,
        employee_compensation_service_1.EmployeeCompensationService])
], ContractsInsuranceController);
//# sourceMappingURL=contracts-insurance.controller.js.map