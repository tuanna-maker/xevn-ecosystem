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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_context_1 = require("../common/hrm-list-scope-context");
const scope_context_1 = require("../common/scope-context");
const create_payroll_period_dto_1 = require("./dto/create-payroll-period.dto");
const list_payroll_periods_query_dto_1 = require("./dto/list-payroll-periods.query.dto");
const list_payroll_payslips_query_dto_1 = require("./dto/list-payroll-payslips.query.dto");
const create_salary_template_dto_1 = require("./dto/create-salary-template.dto");
const list_salary_templates_query_dto_1 = require("./dto/list-salary-templates.query.dto");
const update_salary_template_dto_1 = require("./dto/update-salary-template.dto");
const create_advance_request_dto_1 = require("./dto/create-advance-request.dto");
const decide_advance_request_dto_1 = require("./dto/decide-advance-request.dto");
const list_advance_requests_query_dto_1 = require("./dto/list-advance-requests.query.dto");
const add_payment_record_dto_1 = require("./dto/add-payment-record.dto");
const process_payment_dto_1 = require("./dto/process-payment.dto");
const payroll_service_1 = require("./payroll.service");
const payroll_catalog_service_1 = require("./payroll-catalog.service");
let PayrollController = class PayrollController {
    payrollService;
    payrollCatalog;
    constructor(payrollService, payrollCatalog) {
        this.payrollService = payrollService;
        this.payrollCatalog = payrollCatalog;
    }
    assertBusinessAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized payroll access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    createPayrollPeriod(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.payrollService
            .createPayrollPeriod(body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-201', 'Payroll period created'));
    }
    listPayrollPeriods(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.payrollService
            .listPayrollPeriods(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Payroll periods listed'));
    }
    processPayrollPeriod(periodId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollService
            .processPayrollPeriod(periodId, scope.companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-202', 'Payroll period processed'));
    }
    closePayrollPeriod(periodId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollService
            .closePayrollPeriod(periodId, scope.companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-203', 'Payroll period closed'));
    }
    listPayslips(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertBusinessAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.payrollService
            .listPayslips(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Payroll payslips listed'));
    }
    listSalaryTemplates(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.payrollService
            .listSalaryTemplates(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Salary templates listed'));
    }
    createSalaryTemplate(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.payrollService
            .createSalaryTemplate(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-201', 'Salary template created'));
    }
    updateSalaryTemplate(templateId, authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.payrollService
            .updateSalaryTemplate(templateId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Salary template updated'));
    }
    listSalaryTemplateComponents(templateId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollService
            .listSalaryTemplateComponents(templateId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Salary template components listed'));
    }
    addSalaryTemplateComponent(templateId, authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollService
            .addSalaryTemplateComponent(templateId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-201', 'Salary template component added'));
    }
    updateSalaryTemplateComponent(componentRowId, authorization, internalApiKey, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollService
            .updateSalaryTemplateComponent(componentRowId, companyId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Salary template component updated'));
    }
    removeSalaryTemplateComponent(componentRowId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollService
            .removeSalaryTemplateComponent(componentRowId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Salary template component removed'));
    }
    duplicateSalaryTemplate(templateId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollService
            .duplicateSalaryTemplate(templateId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-201', 'Salary template duplicated'));
    }
    deleteSalaryTemplate(templateId, authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.payrollService
            .deleteSalaryTemplate(templateId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Salary template deleted'));
    }
    payrollReconciliationSummary(authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.payrollService
            .getPayrollReconciliationSummary(scope.companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PAY-200', 'Payroll reconciliation summary'));
    }
    listAdvanceRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.payrollService
            .listAdvanceRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADV-200', 'Advance requests listed'));
    }
    createAdvanceRequest(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollService
            .createAdvanceRequest(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADV-201', 'Advance request created'));
    }
    listAdvanceRequestEmployees(requestId, authorization, internalApiKey, tenantId, companyId, queryCompanyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: queryCompanyId ?? companyId });
        return this.payrollService
            .listAdvanceRequestEmployees(requestId, scope.companyId, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADV-200', 'Advance request employees listed'));
    }
    approveAdvanceRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollService
            .approveAdvanceRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADV-203', 'Advance request approved'));
    }
    rejectAdvanceRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollService
            .rejectAdvanceRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADV-204', 'Advance request rejected'));
    }
    listSalaryComponents(authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollCatalog
            .listSalaryComponents(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-200', 'Salary components listed'));
    }
    listSalaryComponentCategories(authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollCatalog
            .listSalaryComponentCategories(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-200', 'Salary component categories listed'));
    }
    createSalaryComponent(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .createSalaryComponent(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-201', 'Salary component created'));
    }
    updateSalaryComponent(componentId, authorization, internalApiKey, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .updateSalaryComponent(componentId, body, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-200', 'Salary component updated'));
    }
    deleteSalaryComponent(componentId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .deleteSalaryComponent(componentId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-200', 'Salary component deleted'));
    }
    createSalaryComponentCategory(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .createSalaryComponentCategory(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-201', 'Salary component category created'));
    }
    deleteSalaryComponentCategory(categoryId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .deleteSalaryComponentCategory(categoryId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-200', 'Salary component category deleted'));
    }
    listPaymentBatches(authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollCatalog
            .listPaymentBatches(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-200', 'Payment batches listed'));
    }
    listPaymentBatchRecords(batchId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .listPaymentBatchRecords(batchId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-200', 'Payment records listed'));
    }
    createPaymentBatch(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .createPaymentBatch(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-201', 'Payment batch created'));
    }
    updatePaymentBatch(batchId, authorization, internalApiKey, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .updatePaymentBatch(batchId, body, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-200', 'Payment batch updated'));
    }
    deletePaymentBatch(batchId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .deletePaymentBatch(batchId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-200', 'Payment batch deleted'));
    }
    addPaymentBatchRecord(batchId, authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .addPaymentRecord(batchId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-201', 'Payment record added'));
    }
    processPaymentRecord(batchId, recordId, authorization, internalApiKey, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .processPaymentRecord(batchId, recordId, companyId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-202', 'Payment record processed'));
    }
    processPaymentBatch(batchId, authorization, internalApiKey, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.payrollCatalog
            .processAllPaymentsInBatch(batchId, companyId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-PB-202', 'Payment batch processed'));
    }
    markAdvanceRequestPaid(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.payrollService
            .markAdvanceRequestPaid(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADV-205', 'Advance request marked paid'));
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('periods'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_payroll_period_dto_1.CreatePayrollPeriodDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createPayrollPeriod", null);
__decorate([
    (0, common_1.Get)('periods'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_payroll_periods_query_dto_1.ListPayrollPeriodsQueryDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listPayrollPeriods", null);
__decorate([
    (0, common_1.Post)('periods/:periodId/process'),
    __param(0, (0, common_1.Param)('periodId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "processPayrollPeriod", null);
__decorate([
    (0, common_1.Post)('periods/:periodId/close'),
    __param(0, (0, common_1.Param)('periodId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "closePayrollPeriod", null);
__decorate([
    (0, common_1.Get)('payslips'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_payroll_payslips_query_dto_1.ListPayrollPayslipsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listPayslips", null);
__decorate([
    (0, common_1.Get)('salary-templates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_salary_templates_query_dto_1.ListSalaryTemplatesQueryDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listSalaryTemplates", null);
__decorate([
    (0, common_1.Post)('salary-templates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_salary_template_dto_1.CreateSalaryTemplateDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createSalaryTemplate", null);
__decorate([
    (0, common_1.Patch)('salary-templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_salary_template_dto_1.UpdateSalaryTemplateDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "updateSalaryTemplate", null);
__decorate([
    (0, common_1.Get)('salary-templates/:templateId/components'),
    __param(0, (0, common_1.Param)('templateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listSalaryTemplateComponents", null);
__decorate([
    (0, common_1.Post)('salary-templates/:templateId/components'),
    __param(0, (0, common_1.Param)('templateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "addSalaryTemplateComponent", null);
__decorate([
    (0, common_1.Patch)('salary-template-components/:componentRowId'),
    __param(0, (0, common_1.Param)('componentRowId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "updateSalaryTemplateComponent", null);
__decorate([
    (0, common_1.Delete)('salary-template-components/:componentRowId'),
    __param(0, (0, common_1.Param)('componentRowId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "removeSalaryTemplateComponent", null);
__decorate([
    (0, common_1.Post)('salary-templates/:templateId/duplicate'),
    __param(0, (0, common_1.Param)('templateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "duplicateSalaryTemplate", null);
__decorate([
    (0, common_1.Delete)('salary-templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "deleteSalaryTemplate", null);
__decorate([
    (0, common_1.Get)('reports/reconciliation'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "payrollReconciliationSummary", null);
__decorate([
    (0, common_1.Get)('advance-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_advance_requests_query_dto_1.ListAdvanceRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listAdvanceRequests", null);
__decorate([
    (0, common_1.Post)('advance-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_advance_request_dto_1.CreateAdvanceRequestDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createAdvanceRequest", null);
__decorate([
    (0, common_1.Get)('advance-requests/:requestId/employees'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listAdvanceRequestEmployees", null);
__decorate([
    (0, common_1.Post)('advance-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_advance_request_dto_1.DecideAdvanceRequestDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "approveAdvanceRequest", null);
__decorate([
    (0, common_1.Post)('advance-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_advance_request_dto_1.DecideAdvanceRequestDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "rejectAdvanceRequest", null);
__decorate([
    (0, common_1.Get)('salary-components'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listSalaryComponents", null);
__decorate([
    (0, common_1.Get)('salary-component-categories'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listSalaryComponentCategories", null);
__decorate([
    (0, common_1.Post)('salary-components'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createSalaryComponent", null);
__decorate([
    (0, common_1.Patch)('salary-components/:componentId'),
    __param(0, (0, common_1.Param)('componentId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "updateSalaryComponent", null);
__decorate([
    (0, common_1.Delete)('salary-components/:componentId'),
    __param(0, (0, common_1.Param)('componentId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "deleteSalaryComponent", null);
__decorate([
    (0, common_1.Post)('salary-component-categories'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createSalaryComponentCategory", null);
__decorate([
    (0, common_1.Delete)('salary-component-categories/:categoryId'),
    __param(0, (0, common_1.Param)('categoryId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "deleteSalaryComponentCategory", null);
__decorate([
    (0, common_1.Get)('payment-batches'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listPaymentBatches", null);
__decorate([
    (0, common_1.Get)('payment-batches/:batchId/records'),
    __param(0, (0, common_1.Param)('batchId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listPaymentBatchRecords", null);
__decorate([
    (0, common_1.Post)('payment-batches'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createPaymentBatch", null);
__decorate([
    (0, common_1.Patch)('payment-batches/:batchId'),
    __param(0, (0, common_1.Param)('batchId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "updatePaymentBatch", null);
__decorate([
    (0, common_1.Delete)('payment-batches/:batchId'),
    __param(0, (0, common_1.Param)('batchId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "deletePaymentBatch", null);
__decorate([
    (0, common_1.Post)('payment-batches/:batchId/records'),
    __param(0, (0, common_1.Param)('batchId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, add_payment_record_dto_1.AddPaymentRecordDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "addPaymentBatchRecord", null);
__decorate([
    (0, common_1.Post)('payment-batches/:batchId/records/:recordId/process'),
    __param(0, (0, common_1.Param)('batchId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('recordId', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, String, process_payment_dto_1.ProcessPaymentDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "processPaymentRecord", null);
__decorate([
    (0, common_1.Post)('payment-batches/:batchId/process'),
    __param(0, (0, common_1.Param)('batchId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, process_payment_dto_1.ProcessPaymentDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "processPaymentBatch", null);
__decorate([
    (0, common_1.Post)('advance-requests/:requestId/mark-paid'),
    __param(0, (0, common_1.Param)('requestId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_advance_request_dto_1.DecideAdvanceRequestDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "markAdvanceRequestPaid", null);
exports.PayrollController = PayrollController = __decorate([
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService,
        payroll_catalog_service_1.PayrollCatalogService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map