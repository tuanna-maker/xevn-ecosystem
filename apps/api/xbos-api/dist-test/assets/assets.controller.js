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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const assets_service_1 = require("./assets.service");
const asset_common_dto_1 = require("./dto/asset-common.dto");
const create_asset_dto_1 = require("./dto/create-asset.dto");
const list_assets_query_dto_1 = require("./dto/list-assets.query.dto");
const update_asset_dto_1 = require("./dto/update-asset.dto");
let AssetsController = class AssetsController {
    assetsService;
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    canonicalModuleMap = {
        hrm: 'hrm-admin',
        'hrm-admin': 'hrm-admin',
        fleet: 'operations',
        operations: 'operations',
        accounting: 'finance-tax',
        'finance-tax': 'finance-tax',
    };
    assertInternalAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    parseCanonicalModule(rawModuleCode) {
        if (!rawModuleCode)
            return null;
        const normalized = rawModuleCode.trim().toLowerCase();
        return this.canonicalModuleMap[normalized] ?? null;
    }
    resolveAuthoritativeModule(authorization, moduleCodeHeaderRaw) {
        const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        const claimValue = typeof jwtPayload?.mod === 'string'
            ? jwtPayload.mod
            : typeof jwtPayload?.module_code === 'string'
                ? jwtPayload.module_code
                : undefined;
        const claimModule = this.parseCanonicalModule(claimValue);
        if (!claimModule) {
            throw new api_exception_1.ApiException('ASSET-OWN-002', `Missing or invalid token module claim. Use one of: ${asset_common_dto_1.assetOwnerModules.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        const headerModule = this.parseCanonicalModule(moduleCodeHeaderRaw);
        if (moduleCodeHeaderRaw && !headerModule) {
            throw new api_exception_1.ApiException('ASSET-OWN-002', `Invalid x-module-code header. Use one of: ${asset_common_dto_1.assetOwnerModules.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        if (headerModule && headerModule !== claimModule) {
            throw new api_exception_1.ApiException('ASSET-MOD-409', `Module mismatch between token claim '${claimModule}' and x-module-code '${headerModule}'`, common_1.HttpStatus.CONFLICT);
        }
        return claimModule;
    }
    async createAsset(dto, moduleCodeRaw, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId: dto.tenantId, companyId: dto.companyId });
        const moduleCode = this.resolveAuthoritativeModule(authorization, moduleCodeRaw);
        const data = await this.assetsService.createAsset({ ...dto, tenantId: scope.tenantId, companyId: scope.companyId }, moduleCode);
        return (0, api_response_1.ok)(data, 'ASSET-REG-201', 'Asset created');
    }
    async listAssets(query, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId: query.tenantId, companyId: query.companyId });
        const data = await this.assetsService.listAssets({
            ...query,
            tenantId: scope.tenantId,
            companyId: scope.companyId,
        });
        return (0, api_response_1.ok)(data, 'ASSET-REG-200', 'Assets listed');
    }
    async getAssetById(assetId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const data = await this.assetsService.getAssetById(assetId, scope.tenantId, scope.companyId);
        return (0, api_response_1.ok)(data, 'ASSET-REG-200', 'Asset fetched');
    }
    async updateAsset(assetId, tenantId, companyId, dto, moduleCodeRaw, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const moduleCode = this.resolveAuthoritativeModule(authorization, moduleCodeRaw);
        const data = await this.assetsService.updateAsset(assetId, scope.tenantId, scope.companyId, dto, moduleCode);
        return (0, api_response_1.ok)(data, 'ASSET-REG-200', 'Asset updated');
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-module-code')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asset_dto_1.CreateAssetDto, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createAsset", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_assets_query_dto_1.ListAssetsQueryDto, String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "listAssets", null);
__decorate([
    (0, common_1.Get)(':assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssetById", null);
__decorate([
    (0, common_1.Patch)(':assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Headers)('x-module-code')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_asset_dto_1.UpdateAssetDto, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "updateAsset", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
