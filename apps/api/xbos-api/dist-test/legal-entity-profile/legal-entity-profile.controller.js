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
exports.LegalEntityProfileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const legal_entity_profile_service_1 = require("./legal-entity-profile.service");
let LegalEntityProfileController = class LegalEntityProfileController {
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
    async listShareholders(entityId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.readScope({ tenantId, companyId, authorization });
        const items = await this.service.listShareholders(scope.tenantId, scope.companyId, entityId);
        return (0, api_response_1.ok)({ items }, 'XBOS-SHR-200', 'Shareholders loaded');
    }
    async createShareholder(entityId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        return (0, api_response_1.ok)(await this.service.createShareholder(scope.tenantId, scope.companyId, entityId, body), 'XBOS-SHR-201', 'Shareholder saved');
    }
    async updateShareholder(entityId, shareholderId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        return (0, api_response_1.ok)(await this.service.updateShareholder(scope.tenantId, scope.companyId, entityId, shareholderId, body), 'XBOS-SHR-201', 'Shareholder saved');
    }
    async deleteShareholder(entityId, shareholderId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        return (0, api_response_1.ok)(await this.service.deleteShareholder(scope.tenantId, scope.companyId, entityId, shareholderId), 'XBOS-SHR-204', 'Shareholder deleted');
    }
    async listDocuments(entityId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.readScope({ tenantId, companyId, authorization });
        const items = await this.service.listDocuments(scope.tenantId, scope.companyId, entityId);
        return (0, api_response_1.ok)({ items }, 'XBOS-DOC-200', 'Documents loaded');
    }
    async createDocument(entityId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        return (0, api_response_1.ok)(await this.service.createDocument(scope.tenantId, scope.companyId, entityId, body), 'XBOS-DOC-201', 'Document saved');
    }
    async updateDocument(entityId, documentId, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        return (0, api_response_1.ok)(await this.service.updateDocument(scope.tenantId, scope.companyId, entityId, documentId, body), 'XBOS-DOC-201', 'Document saved');
    }
    async deleteDocument(entityId, documentId, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        return (0, api_response_1.ok)(await this.service.deleteDocument(scope.tenantId, scope.companyId, entityId, documentId), 'XBOS-DOC-204', 'Document deleted');
    }
    async uploadDocument(entityId, documentId, file, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const scope = this.mutationScope({ tenantId, companyId, authorization });
        return (0, api_response_1.ok)(await this.service.uploadDocumentFile(scope.tenantId, scope.companyId, entityId, documentId, file), 'XBOS-DOC-201', 'File uploaded');
    }
    async streamFile(documentId, res) {
        const { stream, mimeType, fileName } = await this.service.streamDocumentFile(documentId);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
        stream.pipe(res);
    }
};
exports.LegalEntityProfileController = LegalEntityProfileController;
__decorate([
    (0, common_1.Get)('legal-entities/:entityId/shareholders'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "listShareholders", null);
__decorate([
    (0, common_1.Post)('legal-entities/:entityId/shareholders'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "createShareholder", null);
__decorate([
    (0, common_1.Put)('legal-entities/:entityId/shareholders/:shareholderId'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Param)('shareholderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "updateShareholder", null);
__decorate([
    (0, common_1.Delete)('legal-entities/:entityId/shareholders/:shareholderId'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Param)('shareholderId')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "deleteShareholder", null);
__decorate([
    (0, common_1.Get)('legal-entities/:entityId/documents'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "listDocuments", null);
__decorate([
    (0, common_1.Post)('legal-entities/:entityId/documents'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Put)('legal-entities/:entityId/documents/:documentId'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Param)('documentId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Delete)('legal-entities/:entityId/documents/:documentId'),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Param)('documentId')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Post)('legal-entities/:entityId/documents/:documentId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 26 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Param)('documentId')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Headers)('authorization')),
    __param(6, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('legal-documents/:documentId/file'),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LegalEntityProfileController.prototype, "streamFile", null);
exports.LegalEntityProfileController = LegalEntityProfileController = __decorate([
    (0, common_1.Controller)('org-foundation'),
    __metadata("design:paramtypes", [legal_entity_profile_service_1.LegalEntityProfileService])
], LegalEntityProfileController);
