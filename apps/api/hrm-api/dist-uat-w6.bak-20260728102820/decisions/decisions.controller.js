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
exports.DecisionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const decisions_service_1 = require("./decisions.service");
const create_decision_dto_1 = require("./dto/create-decision.dto");
const list_decisions_query_dto_1 = require("./dto/list-decisions.query.dto");
const update_decision_dto_1 = require("./dto/update-decision.dto");
let DecisionsController = class DecisionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized decisions access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    list(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.service.listDecisions(query, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-DEC-200', 'Decisions listed'));
    }
    create(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.service.createDecision(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-DEC-201', 'Decision created'));
    }
    getById(authorization, internalApiKey, tenantId, headerCompanyId, decisionId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.service
            .getDecisionById(decisionId, companyId ?? headerCompanyId ?? 'main', authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEC-200', 'Decision detail'));
    }
    update(authorization, internalApiKey, tenantId, headerCompanyId, decisionId, queryCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        const companyId = body.company_id ?? queryCompanyId ?? headerCompanyId;
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.service
            .updateDecision(decisionId, { ...body, company_id: companyId }, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEC-200', 'Decision updated'));
    }
    uploadFile(decisionId, file, authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        if (!file?.buffer?.length) {
            throw new api_exception_1.ApiException('HRM-DEC-400', 'Multipart file field "file" is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.service
            .saveDecisionFile(decisionId, companyId ?? headerCompanyId ?? 'main', authorization, {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEC-201', 'Decision file stored'));
    }
    remove(authorization, internalApiKey, tenantId, headerCompanyId, decisionId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.service
            .deleteDecision(decisionId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-DEC-200', 'Decision deleted'));
    }
};
exports.DecisionsController = DecisionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_decisions_query_dto_1.ListDecisionsQueryDto]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_decision_dto_1.CreateDecisionDto]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':decisionId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('decisionId')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':decisionId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('decisionId')),
    __param(5, (0, common_1.Query)('company_id')),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, Object, update_decision_dto_1.UpdateDecisionDto]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':decisionId/files'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('decisionId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __param(4, (0, common_1.Headers)('x-tenant-id')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Delete)(':decisionId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Param)('decisionId')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "remove", null);
exports.DecisionsController = DecisionsController = __decorate([
    (0, common_1.Controller)('decisions'),
    __metadata("design:paramtypes", [decisions_service_1.DecisionsService])
], DecisionsController);
//# sourceMappingURL=decisions.controller.js.map