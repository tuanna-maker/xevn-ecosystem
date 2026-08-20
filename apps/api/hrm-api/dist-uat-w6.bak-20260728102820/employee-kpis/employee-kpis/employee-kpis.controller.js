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
exports.EmployeeKpisController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const create_employee_kpi_dto_1 = require("./dto/create-employee-kpi.dto");
const list_employee_kpis_query_dto_1 = require("./dto/list-employee-kpis.query.dto");
const employee_kpis_service_1 = require("./employee-kpis.service");
let EmployeeKpisController = class EmployeeKpisController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized employee KPI access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    list(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service.list(query, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-KPI-200', 'Employee KPIs listed'));
    }
    create(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service.create(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-KPI-201', 'Employee KPI created'));
    }
    remove(kpiId, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service.remove(kpiId, companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-KPI-200', 'Employee KPI deleted'));
    }
};
exports.EmployeeKpisController = EmployeeKpisController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_employee_kpis_query_dto_1.ListEmployeeKpisQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeeKpisController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_employee_kpi_dto_1.CreateEmployeeKpiDto]),
    __metadata("design:returntype", void 0)
], EmployeeKpisController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':kpiId'),
    __param(0, (0, common_1.Param)('kpiId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], EmployeeKpisController.prototype, "remove", null);
exports.EmployeeKpisController = EmployeeKpisController = __decorate([
    (0, common_1.Controller)('employee-kpis'),
    __metadata("design:paramtypes", [employee_kpis_service_1.EmployeeKpisService])
], EmployeeKpisController);
//# sourceMappingURL=employee-kpis.controller.js.map