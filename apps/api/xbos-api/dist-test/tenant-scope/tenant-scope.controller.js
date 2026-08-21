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
exports.TenantScopeController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const tenant_scope_service_1 = require("./tenant-scope.service");
let TenantScopeController = class TenantScopeController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    resolveUserId(authorization, headerUserId, queryUserId) {
        const jwt = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        const fromJwt = (typeof jwt?.sub === 'string' && jwt.sub.trim()) ||
            (typeof jwt?.email === 'string' && jwt.email.trim()) ||
            undefined;
        return (fromJwt ?? headerUserId ?? queryUserId ?? process.env.DEV_DEFAULT_USER_ID ?? 'admin@xe.vn').trim();
    }
    async accessible(queryUserId, headerUserId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
        const items = await this.service.listAccessible(userId);
        return (0, api_response_1.ok)({ userId, items }, 'XBOS-TENANT-200', 'Accessible tenants loaded');
    }
    async groupOverview(queryUserId, headerUserId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
        const data = await this.service.groupOrgOverview(userId);
        return (0, api_response_1.ok)(data, 'XBOS-TENANT-200', 'Group org overview loaded');
    }
    async groupMemberUnits(queryUserId, headerUserId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const jwt = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
        const tenantId = (typeof jwt?.tenantId === 'string' && jwt.tenantId.trim()) ||
            (typeof jwt?.tenant_id === 'string' && jwt.tenant_id.trim()) ||
            undefined;
        const roleCode = (typeof jwt?.roleCode === 'string' && jwt.roleCode.trim()) ||
            (typeof jwt?.role_code === 'string' && jwt.role_code.trim()) ||
            undefined;
        const data = await this.service.groupMemberUnits(userId, { tenantId, roleCode });
        return (0, api_response_1.ok)(data, 'XBOS-TENANT-200', 'Group member units loaded');
    }
};
exports.TenantScopeController = TenantScopeController;
__decorate([
    (0, common_1.Get)('accessible'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TenantScopeController.prototype, "accessible", null);
__decorate([
    (0, common_1.Get)('group-org-overview'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TenantScopeController.prototype, "groupOverview", null);
__decorate([
    (0, common_1.Get)('group-member-units'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TenantScopeController.prototype, "groupMemberUnits", null);
exports.TenantScopeController = TenantScopeController = __decorate([
    (0, common_1.Controller)('tenant-scope'),
    __metadata("design:paramtypes", [tenant_scope_service_1.TenantScopeService])
], TenantScopeController);
