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
exports.SettingsCatalogsController = void 0;
const common_1 = require("@nestjs/common");
const api_response_1 = require("../common/api-response");
const api_exception_1 = require("../common/api.exception");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const scope_context_1 = require("../common/scope-context");
const append_extension_items_dto_1 = require("./dto/append-extension-items.dto");
const list_catalog_picker_query_dto_1 = require("./dto/list-catalog-picker.query.dto");
const request_removal_dto_1 = require("./dto/request-removal.dto");
const settings_catalogs_service_1 = require("./settings-catalogs.service");
const settings_catalog_item_dto_1 = require("./dto/settings-catalog-item.dto");
let SettingsCatalogsController = class SettingsCatalogsController {
    settingsCatalogs;
    constructor(settingsCatalogs) {
        this.settingsCatalogs = settingsCatalogs;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized settings-catalog access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    resolveCatalogMutationCompanyId(authorization, tenantId, companyIdHeader, bodyCompanyId) {
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId,
            companyId: bodyCompanyId || companyIdHeader,
        });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        return { tenantId: scope.tenantId, catalogCompanyId };
    }
    overview(authorization, internalApiKey, tenantId, companyId, queryCompanyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? queryCompanyId });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        return this.settingsCatalogs
            .getOverview(scope.tenantId, catalogCompanyId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-200', 'Settings catalogs overview'));
    }
    createCatalogItem(body, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const { tenantId: resolvedTenantId, catalogCompanyId } = this.resolveCatalogMutationCompanyId(authorization, tenantId, companyId, body.company_id);
        return this.settingsCatalogs
            .upsertCatalogItem(resolvedTenantId, { ...body, company_id: catalogCompanyId })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-201', 'Settings catalog item created'));
    }
    updateCatalogItem(body, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const { tenantId: resolvedTenantId, catalogCompanyId } = this.resolveCatalogMutationCompanyId(authorization, tenantId, companyId, body.company_id);
        return this.settingsCatalogs
            .upsertCatalogItem(resolvedTenantId, { ...body, company_id: catalogCompanyId })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-202', 'Settings catalog item updated'));
    }
    deleteCatalogItem(body, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const { tenantId: resolvedTenantId, catalogCompanyId } = this.resolveCatalogMutationCompanyId(authorization, tenantId, companyId, body.company_id);
        return this.settingsCatalogs
            .deleteCatalogItem(resolvedTenantId, { ...body, company_id: catalogCompanyId })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-200', 'Settings catalog item deleted'));
    }
    syncFromXbos(authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        return this.settingsCatalogs
            .syncAllFromXbos(scope.tenantId, catalogCompanyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-201', 'XBOS catalogs pulled into HRM'));
    }
    seedGroupEmployeeImportAll(authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        return this.settingsCatalogs
            .seedGroupEmployeeImportCatalogAllTenants()
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-205', 'Group employee import catalogs seeded for all tenants'));
    }
    seedGroupEmployeeImport(authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.settingsCatalogs
            .seedGroupEmployeeImportCatalog(scope.tenantId, scope.companyId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-206', 'Group employee import catalogs seeded for tenant'));
    }
    seedTourismFleet(authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        return this.settingsCatalogs
            .seedTourismFleetCatalog()
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-207', 'Tourism fleet catalogs seeded for xe-du-lich'));
    }
    seedTenantPositionCatalogAll(authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        return this.settingsCatalogs
            .seedTenantPositionCatalogAllTenants()
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-208', 'Tenant position catalogs seeded for all member tenants'));
    }
    seedTenantPositionCatalog(authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.settingsCatalogs
            .seedTenantPositionCatalog(scope.tenantId, scope.companyId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-209', 'Tenant position catalog seeded'));
    }
    getBatch(batchId, authorization, internalApiKey, tenantId, companyId, queryCompanyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? queryCompanyId });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        return this.settingsCatalogs
            .getExtensionBatchDetail(batchId, scope.tenantId, catalogCompanyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-220', 'Extension batch detail'));
    }
    attachWorkflow(batchId, body, authorization, internalApiKey, tenantId, companyId, queryCompanyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? queryCompanyId });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        return this.settingsCatalogs
            .attachWorkflowToBatch(batchId, body.workflowInstanceId, scope.tenantId, catalogCompanyId, authorization)
            .then(() => (0, api_response_1.ok)({ batchId, workflowInstanceId: body.workflowInstanceId }, 'HRM-SET-221', 'Workflow linked'));
    }
    reviewBatch(batchId, body, authorization, internalApiKey, tenantId, companyId, queryCompanyId, reviewerUserId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? queryCompanyId });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        const reviewer = reviewerUserId?.trim() || 'xbos-admin';
        return this.settingsCatalogs
            .reviewExtensionBatch(batchId, body.decision, reviewer, body.review_note, scope.tenantId, catalogCompanyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-222', 'Extension batch reviewed'));
    }
    listExtensionRequests(status, tenantId, companyId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        return this.settingsCatalogs
            .listExtensionRequests({ status, tenantId, companyId })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-210', 'Catalog extension requests listed'));
    }
    approveExtensionRequest(requestId, body, authorization, internalApiKey, reviewerUserId) {
        this.assertAccess(authorization, internalApiKey);
        const reviewer = reviewerUserId?.trim() || 'xbos-admin';
        return this.settingsCatalogs
            .reviewExtensionRequest(requestId, 'approved', reviewer, body?.review_note)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-211', 'Catalog extension request approved'));
    }
    rejectExtensionRequest(requestId, body, authorization, internalApiKey, reviewerUserId) {
        this.assertAccess(authorization, internalApiKey);
        const reviewer = reviewerUserId?.trim() || 'xbos-admin';
        return this.settingsCatalogs
            .reviewExtensionRequest(requestId, 'rejected', reviewer, body?.review_note)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-212', 'Catalog extension request rejected'));
    }
    seedEmployeeProfileTemplate(authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.settingsCatalogs
            .seedEmployeeProfileTemplate(scope.tenantId, scope.companyId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-204', 'Employee profile catalog template seeded'));
    }
    listCatalogPickerItems(catalogKey, query, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId,
            companyId: companyId ?? query.company_id,
        });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        return this.settingsCatalogs
            .listPickerItems(scope.tenantId, catalogCompanyId, catalogKey, {
            q: query.q,
            active: query.active,
            status: query.status,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-200', 'Settings catalog picker items'));
    }
    appendExtension(catalogKey, body, authorization, internalApiKey, tenantId, companyId, catalogWriteMode, userId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        const immediateRequested = catalogWriteMode?.trim().toLowerCase() === 'immediate';
        const immediate = immediateRequested && body.bulkSync === true;
        if (immediate) {
            return this.settingsCatalogs
                .appendExtensionItems(scope.tenantId, catalogCompanyId, catalogKey, body.items)
                .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-202', 'HRM catalog extensions saved'));
        }
        return this.settingsCatalogs
            .submitExtensionItemsForApproval(scope.tenantId, catalogCompanyId, catalogKey, body.items, {
            userId: userId ?? undefined,
            email: userId?.includes('@') ? userId : undefined,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-209', data.message));
    }
    requestFieldRemoval(catalogKey, body, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
        return this.settingsCatalogs
            .requestFieldRemoval(scope.tenantId, catalogCompanyId, catalogKey, body)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SET-203', 'Catalog field removal request submitted'));
    }
};
exports.SettingsCatalogsController = SettingsCatalogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "overview", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_catalog_item_dto_1.SettingsCatalogItemMutationDto, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "createCatalogItem", null);
__decorate([
    (0, common_1.Patch)('items'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_catalog_item_dto_1.SettingsCatalogItemMutationDto, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "updateCatalogItem", null);
__decorate([
    (0, common_1.Delete)('items'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "deleteCatalogItem", null);
__decorate([
    (0, common_1.Post)('sync-from-xbos'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "syncFromXbos", null);
__decorate([
    (0, common_1.Post)('seed/group-employee-import-all'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "seedGroupEmployeeImportAll", null);
__decorate([
    (0, common_1.Post)('seed/group-employee-import'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "seedGroupEmployeeImport", null);
__decorate([
    (0, common_1.Post)('seed/tourism-fleet'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "seedTourismFleet", null);
__decorate([
    (0, common_1.Post)('seed/tenant-position-catalog-all'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "seedTenantPositionCatalogAll", null);
__decorate([
    (0, common_1.Post)('seed/tenant-position-catalog'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "seedTenantPositionCatalog", null);
__decorate([
    (0, common_1.Get)('batches/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "getBatch", null);
__decorate([
    (0, common_1.Post)('batches/:batchId/workflow'),
    __param(0, (0, common_1.Param)('batchId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "attachWorkflow", null);
__decorate([
    (0, common_1.Post)('batches/:batchId/review'),
    __param(0, (0, common_1.Param)('batchId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)('company_id')),
    __param(7, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "reviewBatch", null);
__decorate([
    (0, common_1.Get)('extension-requests'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "listExtensionRequests", null);
__decorate([
    (0, common_1.Post)('extension-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "approveExtensionRequest", null);
__decorate([
    (0, common_1.Post)('extension-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "rejectExtensionRequest", null);
__decorate([
    (0, common_1.Post)('seed/employee-profile-template'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "seedEmployeeProfileTemplate", null);
__decorate([
    (0, common_1.Get)(':catalogKey/items'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, list_catalog_picker_query_dto_1.ListCatalogPickerQueryDto, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "listCatalogPickerItems", null);
__decorate([
    (0, common_1.Post)(':catalogKey/extension-items'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Headers)('x-catalog-write-mode')),
    __param(7, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, append_extension_items_dto_1.AppendExtensionItemsDto, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "appendExtension", null);
__decorate([
    (0, common_1.Post)(':catalogKey/removal-requests'),
    __param(0, (0, common_1.Param)('catalogKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_removal_dto_1.RequestCatalogFieldRemovalDto, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SettingsCatalogsController.prototype, "requestFieldRemoval", null);
exports.SettingsCatalogsController = SettingsCatalogsController = __decorate([
    (0, common_1.Controller)('settings-catalogs'),
    __metadata("design:paramtypes", [settings_catalogs_service_1.SettingsCatalogsService])
], SettingsCatalogsController);
//# sourceMappingURL=settings-catalogs.controller.js.map