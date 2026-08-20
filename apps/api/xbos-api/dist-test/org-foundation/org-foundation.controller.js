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
exports.OrgFoundationController = void 0;
const common_1 = require("@nestjs/common");
const legal_entity_body_interceptor_1 = require("./interceptors/legal-entity-body.interceptor");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const org_foundation_service_1 = require("./org-foundation.service");
const upsert_legal_entity_dto_1 = require("./dto/upsert-legal-entity.dto");
let OrgFoundationController = class OrgFoundationController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    readScope(headers) {
        return (0, xbos_group_legal_scope_1.resolveXbosGroupLegalReadScopeContext)(headers.authorization, {
            tenantId: headers.tenantId,
            companyId: headers.companyId,
        });
    }
    mutationScope(headers) {
        return (0, xbos_group_legal_scope_1.resolveXbosGroupLegalMutationScopeContext)(headers.authorization, {
            tenantId: headers.tenantId,
            companyId: headers.companyId,
        });
    }
    resolveUserId(authorization) {
        const jwt = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        const fromJwt = (typeof jwt?.sub === 'string' && jwt.sub.trim()) ||
            (typeof jwt?.email === 'string' && jwt.email.trim()) ||
            undefined;
        return fromJwt;
    }
    async getLegalEntity(entityId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        this.readScope({ tenantId, companyId, authorization });
        const jwtScope = (0, xbos_group_legal_scope_1.resolveRaciMatrixJwtScope)(authorization, { tenantId, companyId });
        const partition = await this.service.resolveLegalEntityPartition(entityId);
        if (!partition) {
            throw new api_exception_1.ApiException('XBOS-ORG-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
        }
        (0, xbos_group_legal_scope_1.assertJwtMayReadLegalEntityPartition)(authorization, jwtScope, partition);
        const data = await this.service.getLegalEntityById(entityId);
        return (0, api_response_1.ok)(data, 'XBOS-ORG-200', 'Legal entity loaded');
    }
    async listLegalEntities(tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.readScope({ tenantId, companyId, authorization });
        const data = await this.service.listLegalEntities(scope.tenantId, scope.companyId);
        return (0, api_response_1.ok)({ items: data }, 'XBOS-ORG-200', 'Legal entities loaded');
    }
    async createLegalEntity(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        const data = await this.service.upsertLegalEntity(scope.tenantId, scope.companyId, null, body);
        return (0, api_response_1.ok)(data, 'XBOS-ORG-201', 'Legal entity saved');
    }
    async upsertLegalEntity(entityId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        const data = await this.service.upsertLegalEntity(scope.tenantId, scope.companyId, entityId, body);
        return (0, api_response_1.ok)(data, 'XBOS-ORG-201', 'Legal entity saved');
    }
    async orgTree(legalEntityId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const entityId = legalEntityId?.trim();
        if (entityId) {
            this.readScope({ tenantId, companyId, authorization });
            const tree = await this.service.listOrgTreeForLegalEntity(entityId);
            return (0, api_response_1.ok)({ mode: 'single', tree, legalEntityId: entityId }, 'XBOS-ORG-200', 'Org tree loaded for legal entity');
        }
        const scope = this.readScope({ tenantId, companyId, authorization });
        const data = await this.service.listOrgTree(scope.tenantId, scope.companyId, this.resolveUserId(authorization));
        const isGroup = Array.isArray(data) && data.length > 0 && 'tenantId' in data[0];
        if (isGroup) {
            const groups = data;
            const flatTree = groups.flatMap((entry) => (Array.isArray(entry.tree) ? entry.tree : []));
            return (0, api_response_1.ok)({ mode: 'group', groups, tree: flatTree }, 'XBOS-ORG-200', 'Group org trees loaded');
        }
        return (0, api_response_1.ok)({ mode: 'single', tree: data }, 'XBOS-ORG-200', 'Org tree loaded');
    }
    async createOrgUnit(body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        const data = await this.service.upsertOrgUnit(scope.tenantId, scope.companyId, null, body);
        return (0, api_response_1.ok)(data, 'XBOS-ORG-201', 'Org unit saved');
    }
    async upsertOrgUnit(unitId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        const data = await this.service.upsertOrgUnit(scope.tenantId, scope.companyId, unitId, body);
        return (0, api_response_1.ok)(data, 'XBOS-ORG-201', 'Org unit saved');
    }
    async deleteOrgUnit(unitId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        const data = await this.service.deleteOrgUnit(scope.tenantId, scope.companyId, unitId);
        return (0, api_response_1.ok)(data, 'XBOS-ORG-204', 'Org unit deleted');
    }
    /** UC-XBOS-10 — alias for portal probes expecting business-lines path (SRS: segments/:id/promote). */
    async promoteBusinessLine(body, tenantId, companyId, authorization, internalApiKey) {
        const segmentId = (body.segmentId ?? body.payload?.segmentId)?.trim();
        if (!segmentId) {
            throw new api_exception_1.ApiException('XBOS-ORG-400', 'segmentId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const { segmentId: _segmentId, ...legalBody } = body;
        return this.promoteSegment(segmentId, legalBody, tenantId, companyId, authorization, internalApiKey);
    }
    async promoteSegment(segmentId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.readScope({ tenantId, companyId, authorization });
        const data = await this.service.promoteSegment(scope.tenantId, scope.companyId, segmentId, body);
        return (0, api_response_1.ok)(data, 'XBOS-ORG-202', 'Segment promoted to subsidiary');
    }
};
exports.OrgFoundationController = OrgFoundationController;
__decorate([
    (0, common_1.Get)('legal-entities/:entityId'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "getLegalEntity", null);
__decorate([
    (0, common_1.Get)('legal-entities'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "listLegalEntities", null);
__decorate([
    (0, common_1.Post)('legal-entities'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_legal_entity_dto_1.UpsertLegalEntityDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "createLegalEntity", null);
__decorate([
    (0, common_1.Put)('legal-entities/:entityId'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_legal_entity_dto_1.UpsertLegalEntityDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "upsertLegalEntity", null);
__decorate([
    (0, common_1.Get)('org-units/tree'),
    __param(0, (0, common_1.Query)('legal_entity_id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "orgTree", null);
__decorate([
    (0, common_1.Post)('org-units'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "createOrgUnit", null);
__decorate([
    (0, common_1.Put)('org-units/:unitId'),
    __param(0, (0, common_1.Param)('unitId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "upsertOrgUnit", null);
__decorate([
    (0, common_1.Delete)('org-units/:unitId'),
    __param(0, (0, common_1.Param)('unitId')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "deleteOrgUnit", null);
__decorate([
    (0, common_1.Post)('business-lines/promote'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "promoteBusinessLine", null);
__decorate([
    (0, common_1.Post)('segments/:segmentId/promote'),
    __param(0, (0, common_1.Param)('segmentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrgFoundationController.prototype, "promoteSegment", null);
exports.OrgFoundationController = OrgFoundationController = __decorate([
    (0, common_1.Controller)('org-foundation'),
    (0, common_1.UseInterceptors)(legal_entity_body_interceptor_1.LegalEntityBodyInterceptor),
    __metadata("design:paramtypes", [org_foundation_service_1.OrgFoundationService])
], OrgFoundationController);
