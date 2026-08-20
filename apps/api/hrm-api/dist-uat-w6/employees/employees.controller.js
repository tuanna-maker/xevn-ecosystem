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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_context_1 = require("../common/hrm-list-scope-context");
const scope_context_1 = require("../common/scope-context");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const get_employee_query_dto_1 = require("./dto/get-employee.query.dto");
const employee_summary_query_dto_1 = require("./dto/employee-summary.query.dto");
const list_employees_query_dto_1 = require("./dto/list-employees.query.dto");
const update_employee_dto_1 = require("./dto/update-employee.dto");
const employee_profile_list_query_dto_1 = require("./dto/employee-profile-list.query.dto");
const employee_profile_service_1 = require("./employee-profile.service");
const employee_directory_1 = require("./employee-directory");
const employees_service_1 = require("./employees.service");
let EmployeesController = class EmployeesController {
    employeesService;
    employeeProfile;
    constructor(employeesService, employeeProfile) {
        this.employeesService = employeesService;
        this.employeeProfile = employeeProfile;
    }
    assertBusinessAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized employee access', common_2.HttpStatus.UNAUTHORIZED);
        }
    }
    createEmployee(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.employeesService
            .createEmployee(body, authorization, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-201', 'Employee created'));
    }
    listEmployees(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        const scopeContext = (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId);
        if ((0, employee_directory_1.isDirectoryView)(query.view)) {
            return this.employeesService
                .listEmployeeDirectory(query, authorization, scopeContext)
                .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-DIR-200', 'Employee directory listed'));
        }
        return this.employeesService
            .listEmployees(query, authorization, scopeContext)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-200', 'Employees listed'));
    }
    getEmployeesSummary(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        const scopeContext = (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId);
        return this.employeesService
            .getEmployeesSummary(query, authorization, scopeContext)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-SUMMARY-200', 'Employee summary loaded'));
    }
    listEmployeeDegrees(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listDegrees(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee degrees listed'));
    }
    listEmployeeTraining(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listTraining(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee training listed'));
    }
    listEmployeeAssets(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listAssets(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee assets listed'));
    }
    createEmployeeAsset(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .createAsset(employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-201', 'Employee asset created'));
    }
    updateEmployeeAsset(employeeId, assetId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .updateAsset(assetId, employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-202', 'Employee asset updated'));
    }
    deleteEmployeeAsset(employeeId, assetId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .deleteAsset(assetId, employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee asset deleted'));
    }
    listEmployeeSkills(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listSkills(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee skills listed'));
    }
    createEmployeeSkill(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .createSkill(employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-201', 'Employee skill created'));
    }
    updateEmployeeSkill(employeeId, skillId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .updateSkill(skillId, employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-202', 'Employee skill updated'));
    }
    deleteEmployeeSkill(employeeId, skillId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .deleteSkill(skillId, employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee skill deleted'));
    }
    listEmployeeWorkTimeline(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listWorkTimeline(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee work timeline listed'));
    }
    createEmployeeWorkTimeline(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .createWorkTimelineItem(employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-201', 'Work timeline item created'));
    }
    updateEmployeeWorkTimeline(employeeId, itemId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .updateWorkTimelineItem(itemId, employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-202', 'Work timeline item updated'));
    }
    deleteEmployeeWorkTimeline(employeeId, itemId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .deleteWorkTimelineItem(itemId, employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Work timeline item deleted'));
    }
    listEmployeeResumeFiles(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listResumeFiles(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee resume files listed'));
    }
    createEmployeeResumeFile(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .createResumeFile(employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-201', 'Resume file created'));
    }
    deleteEmployeeResumeFile(employeeId, fileId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .deleteResumeFile(fileId, employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Resume file deleted'));
    }
    listEmployeeRewards(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listRewards(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee rewards listed'));
    }
    listEmployeeDiscipline(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .listDiscipline(employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee discipline listed'));
    }
    createEmployeeReward(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .createReward(employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-201', 'Employee reward created'));
    }
    updateEmployeeReward(employeeId, rewardId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .updateReward(rewardId, employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-202', 'Employee reward updated'));
    }
    deleteEmployeeReward(employeeId, rewardId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .deleteReward(rewardId, employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee reward deleted'));
    }
    createEmployeeDiscipline(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .createDiscipline(employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-201', 'Employee discipline created'));
    }
    updateEmployeeDiscipline(employeeId, disciplineId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .updateDiscipline(disciplineId, employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-202', 'Employee discipline updated'));
    }
    deleteEmployeeDiscipline(employeeId, disciplineId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .deleteDiscipline(disciplineId, employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee discipline deleted'));
    }
    createEmployeeTraining(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .createTraining(employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-201', 'Employee training created'));
    }
    updateEmployeeTraining(employeeId, trainingId, authorization, internalApiKey, tenantId, headerCompanyId, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .updateTraining(trainingId, employeeId, query, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-202', 'Employee training updated'));
    }
    deleteEmployeeTraining(employeeId, trainingId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.employeeProfile
            .deleteTraining(trainingId, employeeId, query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-PROFILE-200', 'Employee training deleted'));
    }
    getEmployeeById(employeeId, authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        const scopeContext = (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId);
        if ((0, employee_directory_1.isDirectoryView)(query.view)) {
            return this.employeesService
                .getEmployeeDirectoryById(employeeId, query, authorization, scopeContext)
                .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-200', 'Employee directory profile retrieved'));
        }
        return this.employeesService
            .getEmployeeById(employeeId, query, authorization, scopeContext)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-200', 'Employee retrieved'));
    }
    updateEmployee(employeeId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.employeesService
            .updateEmployee(employeeId, body, scope.companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-202', 'Employee updated'));
    }
    archiveEmployee(employeeId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.employeesService
            .archiveEmployee(employeeId, scope.companyId, authorization, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-203', 'Employee archived'));
    }
    restoreEmployee(employeeId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.employeesService
            .restoreEmployee(employeeId, scope.companyId, authorization, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-EMP-204', 'Employee restored'));
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_employees_query_dto_1.ListEmployeesQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployees", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, employee_summary_query_dto_1.EmployeeSummaryQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getEmployeesSummary", null);
__decorate([
    (0, common_1.Get)(':employeeId/degrees'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeDegrees", null);
__decorate([
    (0, common_1.Get)(':employeeId/training'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeTraining", null);
__decorate([
    (0, common_1.Get)(':employeeId/assets'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeAssets", null);
__decorate([
    (0, common_1.Post)(':employeeId/assets'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployeeAsset", null);
__decorate([
    (0, common_1.Patch)(':employeeId/assets/:assetId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('assetId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __param(7, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateEmployeeAsset", null);
__decorate([
    (0, common_1.Delete)(':employeeId/assets/:assetId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('assetId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "deleteEmployeeAsset", null);
__decorate([
    (0, common_1.Get)(':employeeId/skills'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeSkills", null);
__decorate([
    (0, common_1.Post)(':employeeId/skills'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployeeSkill", null);
__decorate([
    (0, common_1.Patch)(':employeeId/skills/:skillId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('skillId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __param(7, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateEmployeeSkill", null);
__decorate([
    (0, common_1.Delete)(':employeeId/skills/:skillId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('skillId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "deleteEmployeeSkill", null);
__decorate([
    (0, common_1.Get)(':employeeId/work-timeline'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeWorkTimeline", null);
__decorate([
    (0, common_1.Post)(':employeeId/work-timeline'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployeeWorkTimeline", null);
__decorate([
    (0, common_1.Patch)(':employeeId/work-timeline/:itemId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __param(7, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateEmployeeWorkTimeline", null);
__decorate([
    (0, common_1.Delete)(':employeeId/work-timeline/:itemId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "deleteEmployeeWorkTimeline", null);
__decorate([
    (0, common_1.Get)(':employeeId/resume-files'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeResumeFiles", null);
__decorate([
    (0, common_1.Post)(':employeeId/resume-files'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployeeResumeFile", null);
__decorate([
    (0, common_1.Delete)(':employeeId/resume-files/:fileId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "deleteEmployeeResumeFile", null);
__decorate([
    (0, common_1.Get)(':employeeId/rewards'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeRewards", null);
__decorate([
    (0, common_1.Get)(':employeeId/discipline'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "listEmployeeDiscipline", null);
__decorate([
    (0, common_1.Post)(':employeeId/rewards'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployeeReward", null);
__decorate([
    (0, common_1.Patch)(':employeeId/rewards/:rewardId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('rewardId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __param(7, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateEmployeeReward", null);
__decorate([
    (0, common_1.Delete)(':employeeId/rewards/:rewardId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('rewardId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "deleteEmployeeReward", null);
__decorate([
    (0, common_1.Post)(':employeeId/discipline'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployeeDiscipline", null);
__decorate([
    (0, common_1.Patch)(':employeeId/discipline/:disciplineId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('disciplineId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __param(7, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateEmployeeDiscipline", null);
__decorate([
    (0, common_1.Delete)(':employeeId/discipline/:disciplineId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('disciplineId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "deleteEmployeeDiscipline", null);
__decorate([
    (0, common_1.Post)(':employeeId/training'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "createEmployeeTraining", null);
__decorate([
    (0, common_1.Patch)(':employeeId/training/:trainingId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('trainingId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __param(7, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateEmployeeTraining", null);
__decorate([
    (0, common_1.Delete)(':employeeId/training/:trainingId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('trainingId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object, employee_profile_list_query_dto_1.EmployeeProfileListQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "deleteEmployeeTraining", null);
__decorate([
    (0, common_1.Get)(':employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, get_employee_query_dto_1.GetEmployeeQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getEmployeeById", null);
__decorate([
    (0, common_1.Patch)(':employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_employee_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateEmployee", null);
__decorate([
    (0, common_1.Post)(':employeeId/archive'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "archiveEmployee", null);
__decorate([
    (0, common_1.Post)(':employeeId/restore'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "restoreEmployee", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService,
        employee_profile_service_1.EmployeeProfileService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map