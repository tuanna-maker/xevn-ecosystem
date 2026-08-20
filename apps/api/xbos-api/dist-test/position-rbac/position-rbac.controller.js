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
exports.PositionRbacController = void 0;
/**
 * @CODE-MEMORY
 * Screen:     Settings / Position RBAC + assignments (UF-XBOS-13)
 * UC:         UC-XBOS-11/12 · UC-CC-P0-04 · FR-CC-P0-04
 * BR:         Tenant-only permission matrix; assignment company scope; WF soft assignment_id
 * SRS:        SRS_XBOS_KHACH.md §3.14 FR-CC-P0-04 Diễn biến #1–7
 * TechSpec:   docs/xbos/TECHSPEC.md §14.15 · COMMAND_CENTER_P0_TECHSPEC.md §4
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — xbos_cc_permission_matrix_cell · xbos_position_assignment
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints E–G
 * Purpose:    Templates/assignments/grants + GET/PUT permission matrix theo roleId —
 *             FE Settings checkbox xem/ghi/xóa/duyệt + dataScope; F5 còn đúng role.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - web-portal positionRbacApi.ts → GET/PUT /api/xbos/position-rbac/matrix
 *
 * Callees:
 *   - resolveTenantOnlyContext / resolveScopeContext → PositionRbacService
 *
 * FE-Actions:
 *   | Thao tác | Handler | API |
 *   |----------|---------|-----|
 *   | Mở matrix | fetchPermissionMatrix | GET matrix?roleId= |
 *   | Lưu checkbox | savePermissionMatrix | PUT matrix |
 *
 * BE-Chain:
 *   getPermissionMatrix → xbos_cc_permission_matrix_cell
 *   savePermissionMatrix → upsert ON CONFLICT (tenant, role, row)
 *
 * Impact:     Đổi camelCase row fields / dataScope enum → UF-XBOS-13 FAIL
 * must_keep:  UF-XBOS-13 🟢 · tenant-only matrix · WF soft assignment cite · U65 no seed
 * SOLID:      Controller = transport/auth; Service = persist matrix/assignments
 * LastVerified: position-rbac.controller.spec.ts · save-permission-matrix.dto.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-DTO-P2-01
 * change_mode: UPGRADE
 * What: SavePermissionMatrixRequestDto + PermissionMatrixRowDto at PUT matrix edge; OpenAPI depth
 * Why:  Đóng G-DTO-W2-POS-01 — schema F.1 vs API_DESIGN E–F
 * SRS:  §3.14 FR-CC-P0-04
 * TechSpec: §14.15 · G-DTO-W2-POS-01 CLOSED
 * db_design: xbos_cc_permission_matrix_cell
 * api_design: API_DESIGN Endpoints E–F
 * must_keep: UF-XBOS-13 runtime flags/partition; không wipe WF/catalog-gov
 */
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const save_permission_matrix_dto_1 = require("./dto/save-permission-matrix.dto");
const position_rbac_service_1 = require("./position-rbac.service");
let PositionRbacController = class PositionRbacController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async listTemplates(tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        return (0, api_response_1.ok)({ items: await this.service.listTemplates(scope.tenantId) }, 'XBOS-POS-200', 'Templates loaded');
    }
    async createTemplate(body, tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        return (0, api_response_1.ok)(await this.service.upsertTemplate(scope.tenantId, null, body), 'XBOS-POS-201', 'Template saved');
    }
    async updateTemplate(templateId, body, tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        return (0, api_response_1.ok)(await this.service.upsertTemplate(scope.tenantId, templateId, body), 'XBOS-POS-201', 'Template saved');
    }
    async listAssignments(tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)({ items: await this.service.listAssignments(scope.tenantId, scope.companyId) }, 'XBOS-POS-200', 'Assignments loaded');
    }
    async createAssignment(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)(await this.service.upsertAssignment(scope.tenantId, scope.companyId, null, body), 'XBOS-POS-201', 'Assignment saved');
    }
    async listPermissions(tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        return (0, api_response_1.ok)({ items: await this.service.listPermissionDefinitions(scope.tenantId) }, 'XBOS-POS-200', 'Permissions loaded');
    }
    async createPermission(body, tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        return (0, api_response_1.ok)(await this.service.upsertPermissionDefinition(scope.tenantId, null, body), 'XBOS-POS-201', 'Permission saved');
    }
    async conflicts(permissionId, assignmentId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const rows = await this.service.checkGrantConflicts(scope.tenantId, scope.companyId, permissionId, assignmentId);
        return (0, api_response_1.ok)({ conflicts: rows }, 'XBOS-POS-200', 'Conflict check complete');
    }
    async grant(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return (0, api_response_1.ok)(await this.service.grantPermission(scope.tenantId, scope.companyId, body), 'XBOS-POS-201', 'Permission granted');
    }
    async getMatrix(roleId, tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        if (!roleId?.trim()) {
            throw new api_exception_1.ApiException('XBOS-POS-400', 'roleId query required', common_1.HttpStatus.BAD_REQUEST);
        }
        const rows = await this.service.getPermissionMatrix(scope.tenantId, roleId);
        return (0, api_response_1.ok)({ roleId, rows }, 'XBOS-POS-200', 'Permission matrix loaded');
    }
    async saveMatrix(body, tenantId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, { tenantId });
        const rows = (body.rows ?? []).map((r) => ({
            rowId: r.rowId,
            view: Boolean(r.view),
            write: Boolean(r.write),
            delete: Boolean(r.delete),
            approve: Boolean(r.approve),
            dataScope: r.dataScope ?? 'personal',
        }));
        const saved = await this.service.savePermissionMatrix(scope.tenantId, body.roleId, rows);
        return (0, api_response_1.ok)({ roleId: body.roleId, rows: saved }, 'XBOS-POS-201', 'Permission matrix saved');
    }
    async upsertJd(templateId, body, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        return (0, api_response_1.ok)(await this.service.upsertJobDescription(templateId, body), 'XBOS-POS-201', 'Job description saved');
    }
};
exports.PositionRbacController = PositionRbacController;
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Get)('assignments'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "listAssignments", null);
__decorate([
    (0, common_1.Post)('assignments'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "listPermissions", null);
__decorate([
    (0, common_1.Post)('permissions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "createPermission", null);
__decorate([
    (0, common_1.Get)('grants/conflicts'),
    __param(0, (0, common_1.Query)('permissionId')),
    __param(1, (0, common_1.Query)('assignmentId')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "conflicts", null);
__decorate([
    (0, common_1.Post)('grants'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "grant", null);
__decorate([
    (0, common_1.Get)('matrix'),
    __param(0, (0, common_1.Query)('roleId')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "getMatrix", null);
__decorate([
    (0, common_1.Put)('matrix'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_permission_matrix_dto_1.SavePermissionMatrixRequestDto, String, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "saveMatrix", null);
__decorate([
    (0, common_1.Put)('job-descriptions/:templateId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], PositionRbacController.prototype, "upsertJd", null);
exports.PositionRbacController = PositionRbacController = __decorate([
    (0, common_1.Controller)('position-rbac'),
    __metadata("design:paramtypes", [position_rbac_service_1.PositionRbacService])
], PositionRbacController);
