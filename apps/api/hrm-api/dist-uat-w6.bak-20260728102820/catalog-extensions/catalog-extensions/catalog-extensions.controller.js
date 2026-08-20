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
exports.CatalogExtensionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const catalog_extensions_service_1 = require("./catalog-extensions.service");
let CatalogExtensionsController = class CatalogExtensionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized catalog access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    listSalesData(authorization, internalApiKey, companyId, periodMonth, periodYear) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { companyId });
        return this.service
            .listSalesData(companyId, periodMonth ? Number(periodMonth) : undefined, periodYear ? Number(periodYear) : undefined, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SALES-200', 'Sales data listed'));
    }
    createSalesData(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.createSalesData(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-SALES-201', 'Sales record created'));
    }
    updateSalesData(id, authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.updateSalesData(id, companyId, body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-SALES-200', 'Sales record updated'));
    }
    deleteSalesData(id, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.deleteSalesData(id, companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-SALES-200', 'Sales record deleted'));
    }
    syncSalesData(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.syncSalesData(companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-SALES-202', 'Sales data synced'));
    }
    listBonusPolicies(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.listBonusPolicies(companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-BONUS-200', 'Bonus policies listed'));
    }
    createBonusPolicy(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.createBonusPolicy(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-BONUS-201', 'Bonus policy created'));
    }
    updateBonusPolicy(id, authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.updateBonusPolicy(id, companyId, body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-BONUS-200', 'Bonus policy updated'));
    }
    deleteBonusPolicy(id, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.deleteBonusPolicy(id, companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-BONUS-200', 'Bonus policy deleted'));
    }
    listBonusParticipants(policyId, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service
            .listBonusPolicyParticipants(policyId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-BONUS-200', 'Bonus participants listed'));
    }
    createBonusParticipant(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service
            .createBonusPolicyParticipant(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-BONUS-201', 'Bonus participant created'));
    }
    listInsuranceParticipants(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service
            .listInsurancePolicyParticipants(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-INS-P-200', 'Insurance participants listed'));
    }
    createInsuranceParticipant(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service
            .createInsurancePolicyParticipant(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-INS-P-201', 'Insurance participant created'));
    }
    updateInsuranceParticipant(id, authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service
            .updateInsurancePolicyParticipant(id, companyId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-INS-P-200', 'Insurance participant updated'));
    }
    deleteInsuranceParticipant(id, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service
            .deleteInsurancePolicyParticipant(id, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-INS-P-200', 'Insurance participant deleted'));
    }
    listTaxParticipants(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.listTaxPolicyParticipants(companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-TAX-200', 'Tax participants listed'));
    }
    createTaxParticipant(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.createTaxPolicyParticipant(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-TAX-201', 'Tax participant created'));
    }
    updateTaxParticipant(id, authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.updateTaxPolicyParticipant(id, companyId, body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-TAX-200', 'Tax participant updated'));
    }
    deleteTaxParticipant(id, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.deleteTaxPolicyParticipant(id, companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-TAX-200', 'Tax participant deleted'));
    }
    listFaceData(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.listFaceData(companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-FACE-200', 'Face data listed'));
    }
    upsertFaceData(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.upsertFaceData(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-FACE-201', 'Face data saved'));
    }
    deleteFaceData(employeeId, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.deleteFaceData(employeeId, companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-FACE-200', 'Face data deleted'));
    }
    getSubscription(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.getCompanySubscription(companyId, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-SUB-200', 'Subscription loaded'));
    }
    upgradeSubscription(authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.upgradeCompanySubscription(companyId, body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-SUB-201', 'Subscription upgraded'));
    }
    listGuideContent(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.listGuideContent(companyId).then((data) => (0, api_response_1.ok)(data, 'HRM-GUIDE-200', 'Guide content listed'));
    }
    upsertGuideContent(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.upsertGuideContent(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-GUIDE-201', 'Guide content saved'));
    }
    deleteGuideContent(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.service.deleteGuideContent(body).then((data) => (0, api_response_1.ok)(data, 'HRM-GUIDE-200', 'Guide content deleted'));
    }
    async getUploadedFile(companyId, filename, authorization, res) {
        const file = await this.service.readUploadedFile(companyId, filename, authorization);
        res.set('Cache-Control', 'public, max-age=3600');
        return new common_1.StreamableFile(file.buffer, {
            type: file.mimetype,
            disposition: `inline; filename="${file.filename}"`,
        });
    }
    uploadFile(file, feature, companyId, authorization, internalApiKey) {
        this.assertAccess(authorization, internalApiKey);
        if (!companyId?.trim()) {
            throw new api_exception_1.ApiException('HRM-FILE-400', 'Query parameter company_id is required', common_1.HttpStatus.BAD_REQUEST);
        }
        (0, scope_context_1.resolveScopeContext)(authorization, { companyId: companyId.trim() });
        if (!file?.buffer?.length) {
            throw new api_exception_1.ApiException('HRM-FILE-400', 'Multipart file field "file" is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.service
            .storeUploadedFile(companyId.trim(), authorization, feature || 'upload', {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-FILE-201', 'File stored'));
    }
};
exports.CatalogExtensionsController = CatalogExtensionsController;
__decorate([
    (0, common_1.Get)('sales-data'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __param(3, (0, common_1.Query)('period_month')),
    __param(4, (0, common_1.Query)('period_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "listSalesData", null);
__decorate([
    (0, common_1.Post)('sales-data'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "createSalesData", null);
__decorate([
    (0, common_1.Patch)('sales-data/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "updateSalesData", null);
__decorate([
    (0, common_1.Delete)('sales-data/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "deleteSalesData", null);
__decorate([
    (0, common_1.Post)('sales-data/sync'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "syncSalesData", null);
__decorate([
    (0, common_1.Get)('bonus-policies'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "listBonusPolicies", null);
__decorate([
    (0, common_1.Post)('bonus-policies'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "createBonusPolicy", null);
__decorate([
    (0, common_1.Patch)('bonus-policies/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "updateBonusPolicy", null);
__decorate([
    (0, common_1.Delete)('bonus-policies/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "deleteBonusPolicy", null);
__decorate([
    (0, common_1.Get)('bonus-policies/:policyId/participants'),
    __param(0, (0, common_1.Param)('policyId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "listBonusParticipants", null);
__decorate([
    (0, common_1.Post)('bonus-policies/participants'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "createBonusParticipant", null);
__decorate([
    (0, common_1.Get)('insurance-policy-participants'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "listInsuranceParticipants", null);
__decorate([
    (0, common_1.Post)('insurance-policy-participants'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "createInsuranceParticipant", null);
__decorate([
    (0, common_1.Patch)('insurance-policy-participants/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "updateInsuranceParticipant", null);
__decorate([
    (0, common_1.Delete)('insurance-policy-participants/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "deleteInsuranceParticipant", null);
__decorate([
    (0, common_1.Get)('tax-policy-participants'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "listTaxParticipants", null);
__decorate([
    (0, common_1.Post)('tax-policy-participants'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "createTaxParticipant", null);
__decorate([
    (0, common_1.Patch)('tax-policy-participants/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "updateTaxParticipant", null);
__decorate([
    (0, common_1.Delete)('tax-policy-participants/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "deleteTaxParticipant", null);
__decorate([
    (0, common_1.Get)('face-data'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "listFaceData", null);
__decorate([
    (0, common_1.Post)('face-data'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "upsertFaceData", null);
__decorate([
    (0, common_1.Delete)('face-data/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "deleteFaceData", null);
__decorate([
    (0, common_1.Get)('company-subscription'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Post)('company-subscription/upgrade'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "upgradeSubscription", null);
__decorate([
    (0, common_1.Get)('guide-content'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "listGuideContent", null);
__decorate([
    (0, common_1.Post)('guide-content'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "upsertGuideContent", null);
__decorate([
    (0, common_1.Delete)('guide-content'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "deleteGuideContent", null);
__decorate([
    (0, common_1.Get)('files/:companyId/:filename'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CatalogExtensionsController.prototype, "getUploadedFile", null);
__decorate([
    (0, common_1.Post)('files/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 10 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('feature')),
    __param(2, (0, common_1.Query)('company_id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CatalogExtensionsController.prototype, "uploadFile", null);
exports.CatalogExtensionsController = CatalogExtensionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [catalog_extensions_service_1.CatalogExtensionsService])
], CatalogExtensionsController);
//# sourceMappingURL=catalog-extensions.controller.js.map