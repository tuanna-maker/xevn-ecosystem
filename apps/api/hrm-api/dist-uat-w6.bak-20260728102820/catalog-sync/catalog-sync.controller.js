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
exports.CatalogSyncController = void 0;
const common_1 = require("@nestjs/common");
const catalog_sync_service_1 = require("./catalog-sync.service");
const api_response_1 = require("../common/api-response");
const api_exception_1 = require("../common/api.exception");
const common_2 = require("@nestjs/common");
const internal_auth_1 = require("../common/internal-auth");
const hrm_catalog_sync_scope_1 = require("../common/hrm-catalog-sync-scope");
let CatalogSyncController = class CatalogSyncController {
    catalogSyncService;
    constructor(catalogSyncService) {
        this.catalogSyncService = catalogSyncService;
    }
    assertSyncAccess(authorization, internalKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized sync access', common_2.HttpStatus.UNAUTHORIZED);
        }
    }
    pullFromXbos(catalogKey, tenantId, companyId, queryTenantId, queryCompanyId, authorization, internalApiKey) {
        this.assertSyncAccess(authorization, internalApiKey);
        const scope = (0, hrm_catalog_sync_scope_1.resolveHrmCatalogSyncScope)(authorization, {
            tenantId: tenantId ?? queryTenantId,
            companyId: companyId ?? queryCompanyId,
        });
        return this.catalogSyncService
            .pullCatalogFromXbos(catalogKey, scope.tenantId, scope.catalogCompanyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SYNC-200', 'Catalog pulled from XBOS'));
    }
    async getCatalogSyncStatus(tenantId, companyId, queryTenantId, queryCompanyId, authorization, internalApiKey) {
        this.assertSyncAccess(authorization, internalApiKey);
        const scope = (0, hrm_catalog_sync_scope_1.resolveHrmCatalogSyncScope)(authorization, {
            tenantId: tenantId ?? queryTenantId,
            companyId: companyId ?? queryCompanyId,
        });
        const data = await this.catalogSyncService.getCatalogSyncStatus(scope.tenantId, scope.catalogCompanyId);
        return (0, api_response_1.ok)(data, 'HRM-SYNC-203', 'Catalog sync status fetched');
    }
    async getLocalCatalog(catalogKey, tenantId, companyId, queryTenantId, queryCompanyId, authorization, internalApiKey) {
        this.assertSyncAccess(authorization, internalApiKey);
        const scope = (0, hrm_catalog_sync_scope_1.resolveHrmCatalogSyncScope)(authorization, {
            tenantId: tenantId ?? queryTenantId,
            companyId: companyId ?? queryCompanyId,
        });
        const data = await this.catalogSyncService.getSyncedCatalog(catalogKey, scope.tenantId, scope.catalogCompanyId);
        return (0, api_response_1.ok)(data, 'HRM-SYNC-201', 'Synced catalog fetched');
    }
    async listLocalCatalogs(tenantId, companyId, queryTenantId, queryCompanyId, authorization, internalApiKey) {
        this.assertSyncAccess(authorization, internalApiKey);
        const scope = (0, hrm_catalog_sync_scope_1.resolveHrmCatalogSyncScope)(authorization, {
            tenantId: tenantId ?? queryTenantId,
            companyId: companyId ?? queryCompanyId,
        });
        const data = await this.catalogSyncService.listSyncedCatalogs(scope.tenantId, scope.catalogCompanyId);
        return (0, api_response_1.ok)(data, 'HRM-SYNC-202', 'Synced catalogs listed');
    }
};
exports.CatalogSyncController = CatalogSyncController;
__decorate([
    (0, common_1.Post)('pull/:catalogKey'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Query)('tenantId')),
    __param(4, (0, common_1.Query)('companyId')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CatalogSyncController.prototype, "pullFromXbos", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('companyId')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogSyncController.prototype, "getCatalogSyncStatus", null);
__decorate([
    (0, common_1.Get)(':catalogKey'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Query)('tenantId')),
    __param(4, (0, common_1.Query)('companyId')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogSyncController.prototype, "getLocalCatalog", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('companyId')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogSyncController.prototype, "listLocalCatalogs", null);
exports.CatalogSyncController = CatalogSyncController = __decorate([
    (0, common_1.Controller)('catalog-sync'),
    __metadata("design:paramtypes", [catalog_sync_service_1.CatalogSyncService])
], CatalogSyncController);
//# sourceMappingURL=catalog-sync.controller.js.map