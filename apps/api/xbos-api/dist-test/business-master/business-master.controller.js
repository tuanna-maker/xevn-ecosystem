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
exports.BusinessMasterController = void 0;
/**
 * @CODE-MEMORY
 * Screen:     Command Center — catalog văn bản / đo lường / giá (UF-XBOS-14)
 * UC:         UC-CC-P0-05 · FR-CC-P0-05
 * BR:         JWT main→holding partition; autosave ≠ catalog-gov publish
 * SRS:        SRS_XBOS_KHACH.md §3.15 FR-CC-P0-05 Diễn biến #1–7
 * TechSpec:   docs/xbos/TECHSPEC.md §14.16 · ref_srs FR-CC-P0-05
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — xbos_business_master_entries CC partitions
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints H–I (F.1)
 * Purpose:    List + autosave business-master domain command_center_catalogs
 *             (kinds regulations|measurements|pricing) cho FE CC catalogs.
 * WorkItem:   BE-XBOS-OA-RACI-CC-01 (OpenAPI F.1 deepen; runtime must_keep)
 * Coded:      2026-07-27
 *
 * Callers:
 *   - web-portal commandCenterCatalogApi.ts → GET/PUT /api/xbos/business-master/command_center_catalogs/items*
 *
 * Callees:
 *   - resolveXbosGroupLegal*ScopeContext → BusinessMasterService list/upsert
 *
 * FE-Actions:
 *   | Thao tác | Handler | API |
 *   |----------|---------|-----|
 *   | Mở catalog CC | list items | GET …/command_center_catalogs/items |
 *   | Sửa ô autosave | upsert partition/flat | PUT …/items/{itemId} |
 *
 * BE-Chain:
 *   list → xbos_business_master_entries domain=command_center_catalogs
 *   upsert partition/flat → payload.rows JSONB · amount số thuần
 *
 * Impact:     Đổi kind enum / scope holding → UF-XBOS-14 FAIL hoặc ghi nhầm pháp nhân
 * must_keep:  UF-XBOS-14 🟢 · empty list hợp lệ · không publishVersionChange · U65 no seed
 * SOLID:      Controller = transport/scope; Service = domain whitelist + CC merge
 * LastVerified: docs/qa/evidence/be-xbos-oa-raci-cc-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-RACI-CC-01
 * change_mode: ADD
 * What: Neo CODE-MEMORY + OpenAPI F.1 cho command_center_catalogs kinds/examples
 * Why:  U71 API_DESIGN Endpoints H–I — sync contract; cấm đổi runtime UF-14
 * SRS:  §3.15 FR-CC-P0-05
 * TechSpec: §14.16 · G-OA-W2-CC-CAT-01 CLOSED (yaml)
 * db_design: DB_DESIGN_XBOS_RACI_RBAC.md
 * api_design: API_DESIGN_XBOS_RACI_RBAC.md §8–9
 * must_keep: Partition kinds + autosave semantics không đổi
 */
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const business_master_service_1 = require("./business-master.service");
let BusinessMasterController = class BusinessMasterController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertInternalAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    /** UC-ECO-MASTER-01 — minimal read path: domain catalog + scope (SRS §8.1). */
    listDomains(tenantId, companyId, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, {
            tenantId: tenantId ?? headerTenantId,
            companyId: companyId ?? headerCompanyId,
        });
        const domains = this.service.listDomainCatalog();
        return (0, api_response_1.ok)({
            tenantId: scope.tenantId,
            companyId: scope.companyId,
            domains,
            total: domains.length,
        }, 'XBOS-MASTER-200', 'Business master domains listed');
    }
    async list(domain, tenantId, companyId, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        return this.listDomainItems(domain, tenantId ?? headerTenantId, companyId ?? headerCompanyId, authorization, internalApiKey);
    }
    /** Alias for view-completeness / portal probes (`/business-master/:domain`). */
    async listDomainShortcut(domain, tenantId, companyId, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        if (domain === 'domains') {
            return this.listDomains(tenantId, companyId, authorization, internalApiKey, headerTenantId, headerCompanyId);
        }
        return this.listDomainItems(domain, tenantId ?? headerTenantId, companyId ?? headerCompanyId, authorization, internalApiKey);
    }
    async listDomainItems(domain, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, { tenantId, companyId });
        const data = await this.service.list(scope.tenantId, scope.companyId, domain);
        return (0, api_response_1.ok)({ items: data, data, tenantId: scope.tenantId, companyId: scope.companyId }, 'XBOS-MASTER-200', 'Business master items loaded');
    }
    resolveWriteScope(authorization, tenantId, companyId, domain) {
        if (domain === 'dept_system_templates' || domain === 'command_center_catalogs') {
            const resolved = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
            return (0, xbos_group_legal_scope_1.resolveXbosGroupLegalMutationScopeContext)(authorization, resolved);
        }
        // Scope parity (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE): list reads holding; writes must match.
        return (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(authorization, { tenantId, companyId });
    }
    async upsert(domain, itemId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = this.resolveWriteScope(authorization, tenantId, companyId, domain);
        const data = await this.service.upsert(scope.tenantId, scope.companyId, domain, itemId, body);
        return (0, api_response_1.ok)(data, 'XBOS-MASTER-201', 'Business master item saved');
    }
    async remove(domain, itemId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = this.resolveWriteScope(authorization, tenantId, companyId, domain);
        const data = await this.service.remove(scope.tenantId, scope.companyId, domain, itemId);
        return (0, api_response_1.ok)(data, 'XBOS-MASTER-204', 'Business master item deleted');
    }
};
exports.BusinessMasterController = BusinessMasterController;
__decorate([
    (0, common_1.Get)('domains'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], BusinessMasterController.prototype, "listDomains", null);
__decorate([
    (0, common_1.Get)(':domain/items'),
    __param(0, (0, common_1.Param)('domain')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __param(5, (0, common_1.Headers)('x-tenant-id')),
    __param(6, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessMasterController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':domain'),
    __param(0, (0, common_1.Param)('domain')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __param(5, (0, common_1.Headers)('x-tenant-id')),
    __param(6, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessMasterController.prototype, "listDomainShortcut", null);
__decorate([
    (0, common_1.Put)(':domain/items/:itemId'),
    __param(0, (0, common_1.Param)('domain')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessMasterController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':domain/items/:itemId'),
    __param(0, (0, common_1.Param)('domain')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessMasterController.prototype, "remove", null);
exports.BusinessMasterController = BusinessMasterController = __decorate([
    (0, common_1.Controller)('business-master'),
    __metadata("design:paramtypes", [business_master_service_1.BusinessMasterService])
], BusinessMasterController);
