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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const api_exception_1 = require("../common/api.exception");
const common_2 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const select_membership_dto_1 = require("./dto/select-membership.dto");
let AuthController = class AuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    async login(body) {
        const data = await this.auth.login(body.email, body.password);
        return (0, api_response_1.ok)(data, 'XBOS-AUTH-200', 'Đăng nhập thành công');
    }
    async me(authorization) {
        const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        const userId = typeof payload?.sub === 'string' ? payload.sub : typeof payload?.email === 'string' ? payload.email : null;
        if (!userId) {
            throw new api_exception_1.ApiException('XBOS-AUTH-401', 'Unauthorized', common_2.HttpStatus.UNAUTHORIZED);
        }
        const data = await this.auth.me(userId);
        return (0, api_response_1.ok)(data, 'XBOS-AUTH-200', 'Session loaded');
    }
    async selectMembership(authorization, body) {
        const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        const userId = typeof payload?.sub === 'string'
            ? payload.sub
            : typeof payload?.email === 'string'
                ? payload.email
                : null;
        if (!userId) {
            throw new api_exception_1.ApiException('XBOS-AUTH-401', 'Unauthorized', common_2.HttpStatus.UNAUTHORIZED);
        }
        const data = await this.auth.selectMembership(userId, body.tenantId);
        return (0, api_response_1.ok)(data, 'XBOS-AUTH-201', 'Đã chuyển membership');
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.PortalLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('select-membership'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, select_membership_dto_1.SelectMembershipDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "selectMembership", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
