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
exports.AssetRequestController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const asset_request_service_1 = require("./asset-request.service");
let AssetRequestController = class AssetRequestController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async list(tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)({ items: await this.service.list(scope.tenantId, scope.companyId) }, 'XBOS-AST-200', 'Asset requests loaded');
    }
    async create(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)(await this.service.create(scope.tenantId, scope.companyId, body), 'XBOS-AST-201', 'Asset request created');
    }
    async transition(requestId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)(await this.service.transition(scope.tenantId, scope.companyId, requestId, body.status, body.actor ?? 'system'), 'XBOS-AST-200', 'Status updated');
    }
};
exports.AssetRequestController = AssetRequestController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetRequestController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetRequestController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':requestId/transition'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetRequestController.prototype, "transition", null);
exports.AssetRequestController = AssetRequestController = __decorate([
    (0, common_1.Controller)('asset-requests'),
    __metadata("design:paramtypes", [asset_request_service_1.AssetRequestService])
], AssetRequestController);
