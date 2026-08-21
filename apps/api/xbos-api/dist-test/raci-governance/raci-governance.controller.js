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
exports.RaciGovernanceController = void 0;
/**
 * @CODE-MEMORY
 * Screen:     Command Center / Org — tab Nhiệm vụ và RACI (UF-XBOS-07)
 * UC:         UC-RACI-02 · FR-XBOS-RACI-02
 * BR:         Scope parity list/get-mutate cùng resolveCompanyMatrixScope (G-SCOPE-W2-RACI)
 * SRS:        SRS_XBOS_KHACH.md §3.13 FR-XBOS-RACI-02 Diễn biến #1–8
 * TechSpec:   docs/xbos/TECHSPEC.md §14.14 · ref_srs FR-XBOS-RACI-02
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — company_raci_matrix_cell · raci_activity_catalog
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints A–D (F.1)
 * Purpose:    Cấp catalog RACI, ma trận theo pháp nhân, upsert/clear ô, capabilities/coverage —
 *             FE vẽ lưới và lưu ô không lan sang pháp nhân khác; F5 còn dữ liệu.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01 (Nest DTO edge; OpenAPI align; runtime must_keep)
 * Coded:      2026-07-27
 *
 * Callers:
 *   - web-portal raciGovernanceApi.ts → GET/PUT /api/xbos/raci-governance/*
 *
 * Callees:
 *   - resolveCompanyMatrixScope / resolveTenantOnlyContext → RaciGovernanceService
 *   - OrgFoundationService.resolveLegalEntityPartition (UUID path)
 *
 * FE-Actions:
 *   | Thao tác | Handler | API |
 *   |----------|---------|-----|
 *   | Mở tab RACI | load catalog+matrix | GET catalog · GET …/matrix |
 *   | Lưu ô | upsert cell | PUT …/matrix/cell |
 *   | Xóa ô | clear letters | PUT …/matrix/cell raci_letters="" |
 *
 * BE-Chain:
 *   listCatalog → raci_activity_catalog / version
 *   getCompanyMatrix → merge default_matrix ⊕ company_raci_matrix_cell
 *   upsertMatrixCell → UpsertRaciMatrixCellRequestDto → upsert cell + raci_matrix_audit_log
 *
 * Impact:     Đổi scope resolver hoặc letters pattern → UF-XBOS-07 FAIL / 409 sai pháp nhân
 * must_keep:  UF-XBOS-07 🟢 · cùng resolver GET matrix ↔ PUT cell · empty letters = clear · U65 no seed
 * SOLID:      Controller = transport/auth/scope; Service = merge/persist RACI
 * LastVerified: raci-governance.controller.spec.ts · upsert-raci-matrix-cell.dto.spec.ts · be-xbos-oa-dto-p2-01-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-RACI-CC-01
 * change_mode: ADD
 * What: Neo CODE-MEMORY + OpenAPI F.1 (Mục đích/Nghiệp vụ/Bước SRS) cho raci-governance/*
 * Why:  U71 API_DESIGN pair xong — sync contract docs; cấm đổi runtime UF-07
 * SRS:  §3.13 FR-XBOS-RACI-02
 * TechSpec: §14.14 · G-OA-W2-RACI-01 CLOSED (yaml)
 * db_design: DB_DESIGN_XBOS_RACI_RBAC.md
 * api_design: API_DESIGN_XBOS_RACI_RBAC.md §1–4
 * must_keep: Hành vi matrix merge / scope / envelope codes không đổi
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-DTO-P2-01
 * change_mode: UPGRADE
 * What: Edge body UpsertRaciMatrixCellRequestDto (class-validator) thay Record
 * Why:  Đóng G-DTO-W2-RACI-01 — harden validate tại Nest edge + OpenAPI align
 * SRS:  §3.13 FR-XBOS-RACI-02 Diễn biến #4–#6
 * TechSpec: §14.14 · G-DTO-W2-RACI-01 CLOSED
 * db_design: DB_DESIGN_XBOS_RACI_RBAC.md company_raci_matrix_cell
 * api_design: API_DESIGN Endpoint C
 * must_keep: UF-XBOS-07 merge/scope/clear-empty letters; không đổi resolver
 */
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const org_foundation_service_1 = require("../org-foundation/org-foundation.service");
const upsert_raci_matrix_cell_dto_1 = require("./dto/upsert-raci-matrix-cell.dto");
const raci_governance_service_1 = require("./raci-governance.service");
let RaciGovernanceController = class RaciGovernanceController {
    service;
    orgFoundation;
    constructor(service, orgFoundation) {
        this.service = service;
        this.orgFoundation = orgFoundation;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    /** Path `companies/:companyId` may be `main` or legal-entity UUID (member tab). */
    async resolveCompanyMatrixScope(authorization, tenantId, companyId, pathCompanyKey) {
        const pathKey = pathCompanyKey.trim();
        if (!(0, xbos_group_legal_scope_1.isLegalEntityUuid)(pathKey)) {
            return (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: pathKey });
        }
        const jwtScope = (0, xbos_group_legal_scope_1.resolveRaciMatrixJwtScope)(authorization, { tenantId, companyId });
        const partition = await this.orgFoundation.resolveLegalEntityPartition(pathKey);
        if (!partition) {
            throw new api_exception_1.ApiException('XBOS-RACI-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
        }
        (0, xbos_group_legal_scope_1.assertJwtMayReadLegalEntityPartition)(authorization, jwtScope, partition);
        return { tenantId: partition.tenantId, companyId: pathKey };
    }
    async catalog(domain, tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        return (0, api_response_1.ok)(await this.service.listCatalog(scope.tenantId, domain), 'XBOS-RACI-200', 'RACI catalog loaded');
    }
    async matrix(pathCompanyId, domain, tenantId, headerCompanyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = await this.resolveCompanyMatrixScope(authorization, tenantId, headerCompanyId, pathCompanyId);
        return (0, api_response_1.ok)(await this.service.getCompanyMatrix(scope.tenantId, scope.companyId, domain), 'XBOS-RACI-200', 'Company RACI matrix loaded');
    }
    async capabilities(activityCode, tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        return (0, api_response_1.ok)(await this.service.listCapabilities(scope.tenantId, activityCode), 'XBOS-RACI-200', 'Capabilities loaded');
    }
    async coverage(pathCompanyId, tenantId, headerCompanyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = await this.resolveCompanyMatrixScope(authorization, tenantId, headerCompanyId, pathCompanyId);
        return (0, api_response_1.ok)(await this.service.getCoverage(scope.tenantId, scope.companyId), 'XBOS-RACI-200', 'Coverage loaded');
    }
    async upsertCell(pathCompanyId, body, tenantId, headerCompanyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = await this.resolveCompanyMatrixScope(authorization, tenantId, headerCompanyId, pathCompanyId);
        return (0, api_response_1.ok)(await this.service.upsertMatrixCell(scope.tenantId, scope.companyId, {
            activity_id: body.activity_id,
            org_column_id: body.org_column_id,
            raci_letters: body.raci_letters ?? '',
            actor_id: body.actor_id,
        }), 'XBOS-RACI-201', 'Matrix cell saved');
    }
};
exports.RaciGovernanceController = RaciGovernanceController;
__decorate([
    (0, common_1.Get)('catalog'),
    __param(0, (0, common_1.Query)('domain')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RaciGovernanceController.prototype, "catalog", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/matrix'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('domain')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RaciGovernanceController.prototype, "matrix", null);
__decorate([
    (0, common_1.Get)('capabilities'),
    __param(0, (0, common_1.Query)('activityCode')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RaciGovernanceController.prototype, "capabilities", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/coverage'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RaciGovernanceController.prototype, "coverage", null);
__decorate([
    (0, common_1.Put)('companies/:companyId/matrix/cell'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_raci_matrix_cell_dto_1.UpsertRaciMatrixCellRequestDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RaciGovernanceController.prototype, "upsertCell", null);
exports.RaciGovernanceController = RaciGovernanceController = __decorate([
    (0, common_1.Controller)('raci-governance'),
    __metadata("design:paramtypes", [raci_governance_service_1.RaciGovernanceService,
        org_foundation_service_1.OrgFoundationService])
], RaciGovernanceController);
