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
exports.MobileAuthController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const mobile_login_dto_1 = require("./dto/mobile-login.dto");
const mobile_refresh_dto_1 = require("./dto/mobile-refresh.dto");
const mobile_select_membership_dto_1 = require("./dto/mobile-select-membership.dto");
const mobile_auth_service_1 = require("./mobile-auth.service");
let MobileAuthController = class MobileAuthController {
    mobileAuth;
    constructor(mobileAuth) {
        this.mobileAuth = mobileAuth;
    }
    login(tenantId, companyId, body) {
        const hint = tenantId?.trim() && companyId?.trim()
            ? { tenantId: tenantId.trim(), companyId: companyId.trim() }
            : undefined;
        return this.mobileAuth
            .login(body, hint)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-AUTH-200', 'Mobile login successful'));
    }
    selectMembership(authorization, body) {
        const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        const email = typeof payload?.sub === 'string' ? payload.sub : '';
        if (!email) {
            throw new api_exception_1.ApiException('HRM-AUTH-401', 'Cần access token hợp lệ', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.mobileAuth
            .selectMembership(email, body.employee_id)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-AUTH-203', 'Membership selected'));
    }
    refresh(body) {
        return this.mobileAuth
            .refresh(body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-AUTH-201', 'Token refreshed'));
    }
};
exports.MobileAuthController = MobileAuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, mobile_login_dto_1.MobileLoginDto]),
    __metadata("design:returntype", void 0)
], MobileAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('select-membership'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mobile_select_membership_dto_1.MobileSelectMembershipDto]),
    __metadata("design:returntype", void 0)
], MobileAuthController.prototype, "selectMembership", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_refresh_dto_1.MobileRefreshDto]),
    __metadata("design:returntype", void 0)
], MobileAuthController.prototype, "refresh", null);
exports.MobileAuthController = MobileAuthController = __decorate([
    (0, common_1.Controller)('auth/mobile'),
    __metadata("design:paramtypes", [mobile_auth_service_1.MobileAuthService])
], MobileAuthController);
//# sourceMappingURL=mobile-auth.controller.js.map