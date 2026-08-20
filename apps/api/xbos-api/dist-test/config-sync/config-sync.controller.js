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
exports.ConfigSyncController = void 0;
const common_1 = require("@nestjs/common");
const config_sync_service_1 = require("./config-sync.service");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const apply_catalog_to_members_dto_1 = require("./dto/apply-catalog-to-members.dto");
const publish_catalog_dto_1 = require("./dto/publish-catalog.dto");
let ConfigSyncController = class ConfigSyncController {
    configSyncService;
    constructor(configSyncService) {
        this.configSyncService = configSyncService;
    }
    assertInternalAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized bootstrap access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async bootstrapXevn(authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        return (0, api_response_1.ok)(await this.configSyncService.bootstrapXevnGroupConfig(), 'XBOS-CFG-200', 'XeVN catalogs bootstrapped');
    }
    async publishCatalog(catalogKey, payload, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: payload.tenantId,
            companyId: payload.companyId,
        });
        const data = await this.configSyncService.publishCatalog(catalogKey, {
            ...payload,
            tenantId: scope.tenantId,
            companyId: scope.companyId,
        });
        return (0, api_response_1.ok)(data, 'XBOS-CFG-203', 'Catalog published');
    }
    /**
     * XBOS-DM-HRM-07 / G-BM-REC-01 — Option B fan-out to member partitions.
     * Source scope uses group legal read (JWT `main` → `holding`) so group CEO can apply.
     */
    async applyCatalogToMembers(catalogKey, payload, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, {
            tenantId: payload.tenantId,
            companyId: payload.companyId,
        });
        const data = await this.configSyncService.applyCatalogToMembers(catalogKey, {
            tenantId: scope.tenantId,
            companyId: scope.companyId,
            targets: payload.targets,
            memberCompanyIds: payload.memberCompanyIds,
            actor: payload.actor,
        });
        return (0, api_response_1.ok)(data, 'XBOS-CFG-204', 'Catalog applied to members');
    }
    async getCatalogForSystem(catalogKey, target = 'hrm', tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        if (target !== 'hrm' && target !== 'xbos' && target !== 'web-portal') {
            throw new api_exception_1.ApiException('XBOS-VAL-001', 'Invalid target. Use hrm, xbos, or web-portal', common_1.HttpStatus.BAD_REQUEST);
        }
        const scope = (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, { tenantId, companyId });
        const data = await this.configSyncService.getCatalogForTarget(catalogKey, target, scope.tenantId, scope.companyId);
        return (0, api_response_1.ok)(data, 'XBOS-CFG-201', 'Catalog fetched');
    }
    async listCatalogsForSystem(target = 'hrm', tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        if (target !== 'hrm' && target !== 'xbos' && target !== 'web-portal') {
            throw new api_exception_1.ApiException('XBOS-VAL-001', 'Invalid target. Use hrm, xbos, or web-portal', common_1.HttpStatus.BAD_REQUEST);
        }
        const scope = (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, { tenantId, companyId });
        const data = await this.configSyncService.listCatalogsForTarget(target, scope.tenantId, scope.companyId);
        return (0, api_response_1.ok)(data, 'XBOS-CFG-202', 'Catalogs listed');
    }
};
exports.ConfigSyncController = ConfigSyncController;
__decorate([
    (0, common_1.Post)('bootstrap-xevn'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConfigSyncController.prototype, "bootstrapXevn", null);
__decorate([
    (0, common_1.Post)('catalog/:catalogKey/publish'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, publish_catalog_dto_1.PublishCatalogDto, String, String]),
    __metadata("design:returntype", Promise)
], ConfigSyncController.prototype, "publishCatalog", null);
__decorate([
    (0, common_1.Post)('catalog/:catalogKey/apply-to-members'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apply_catalog_to_members_dto_1.ApplyCatalogToMembersDto, String, String]),
    __metadata("design:returntype", Promise)
], ConfigSyncController.prototype, "applyCatalogToMembers", null);
__decorate([
    (0, common_1.Get)('catalog/:catalogKey'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Query)('target')),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('companyId')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigSyncController.prototype, "getCatalogForSystem", null);
__decorate([
    (0, common_1.Get)('catalogs'),
    __param(0, (0, common_1.Query)('target')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigSyncController.prototype, "listCatalogsForSystem", null);
exports.ConfigSyncController = ConfigSyncController = __decorate([
    (0, common_1.Controller)('config-sync'),
    __metadata("design:paramtypes", [config_sync_service_1.ConfigSyncService])
], ConfigSyncController);
