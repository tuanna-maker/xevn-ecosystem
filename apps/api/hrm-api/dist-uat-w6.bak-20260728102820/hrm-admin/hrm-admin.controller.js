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
exports.HrmAdminController = void 0;
const common_1 = require("@nestjs/common");
const hrm_admin_service_1 = require("./hrm-admin.service");
const create_company_admin_dto_1 = require("./dto/create-company-admin.dto");
const create_platform_admin_dto_1 = require("./dto/create-platform-admin.dto");
const invite_employees_dto_1 = require("./dto/invite-employees.dto");
const reset_user_password_dto_1 = require("./dto/reset-user-password.dto");
const api_response_1 = require("../common/api-response");
let HrmAdminController = class HrmAdminController {
    hrmAdminService;
    constructor(hrmAdminService) {
        this.hrmAdminService = hrmAdminService;
    }
    createPlatformAdmin(authorization, body) {
        return this.hrmAdminService
            .createPlatformAdmin(authorization, body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-201', 'Platform admin created'));
    }
    createCompanyAdmin(authorization, body) {
        return this.hrmAdminService
            .createCompanyAdmin(authorization, body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-202', 'Company admin created or updated'));
    }
    inviteEmployees(authorization, body) {
        return this.hrmAdminService
            .inviteEmployees(authorization, body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-203', 'Employee invitation batch processed'));
    }
    resetUserPassword(authorization, body) {
        return this.hrmAdminService
            .resetUserPassword(authorization, body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-204', 'User credential updated'));
    }
    listAdminCompanies(authorization) {
        return this.hrmAdminService
            .listAdminCompanies(authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-205', 'Admin companies listed'));
    }
    listCompanyMemberships(authorization, companyId) {
        return this.hrmAdminService
            .listCompanyMemberships(authorization, companyId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-206', 'Company memberships listed'));
    }
    upsertCompanyMembership(authorization, body) {
        return this.hrmAdminService
            .upsertCompanyMembership(authorization, body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-207', 'Company membership saved'));
    }
    updateCompanyMembership(authorization, membershipId, body) {
        return this.hrmAdminService
            .updateCompanyMembership(authorization, membershipId, body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-208', 'Company membership updated'));
    }
    deleteCompanyMembership(authorization, membershipId) {
        return this.hrmAdminService
            .deleteCompanyMembership(authorization, membershipId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ADMIN-209', 'Company membership deleted'));
    }
};
exports.HrmAdminController = HrmAdminController;
__decorate([
    (0, common_1.Post)('platform-admin'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_platform_admin_dto_1.CreatePlatformAdminDto]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "createPlatformAdmin", null);
__decorate([
    (0, common_1.Post)('company-admin'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_company_admin_dto_1.CreateCompanyAdminDto]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "createCompanyAdmin", null);
__decorate([
    (0, common_1.Post)('invite-employee'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, invite_employees_dto_1.InviteEmployeesDto]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "inviteEmployees", null);
__decorate([
    (0, common_1.Post)('reset-user-password'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reset_user_password_dto_1.ResetUserPasswordDto]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "resetUserPassword", null);
__decorate([
    (0, common_1.Get)('companies'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "listAdminCompanies", null);
__decorate([
    (0, common_1.Get)('company-memberships'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "listCompanyMemberships", null);
__decorate([
    (0, common_1.Post)('company-memberships'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "upsertCompanyMembership", null);
__decorate([
    (0, common_1.Patch)('company-memberships/:membershipId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('membershipId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "updateCompanyMembership", null);
__decorate([
    (0, common_1.Delete)('company-memberships/:membershipId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('membershipId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HrmAdminController.prototype, "deleteCompanyMembership", null);
exports.HrmAdminController = HrmAdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [hrm_admin_service_1.HrmAdminService])
], HrmAdminController);
//# sourceMappingURL=hrm-admin.controller.js.map