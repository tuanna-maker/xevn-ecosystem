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
exports.InfrastructureController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const upsert_infrastructure_settings_dto_1 = require("./dto/upsert-infrastructure-settings.dto");
const infrastructure_service_1 = require("./infrastructure.service");
let InfrastructureController = class InfrastructureController {
    infrastructureService;
    constructor(infrastructureService) {
        this.infrastructureService = infrastructureService;
    }
    assertInternalAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async getSettings(tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const data = await this.infrastructureService.getSettings(scope.tenantId, scope.companyId);
        return (0, api_response_1.ok)(data, 'XBOS-INFRA-200', 'Infrastructure settings loaded');
    }
    async getSummary(tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const data = await this.infrastructureService.getSummary(scope.tenantId, scope.companyId);
        return (0, api_response_1.ok)(data, 'XBOS-INFRA-210', 'Infrastructure summary loaded');
    }
    async upsertSettings(dto, tenantId, companyId, authorization, internalApiKey) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const data = await this.infrastructureService.upsertSettings(scope.tenantId, scope.companyId, dto);
        return (0, api_response_1.ok)(data, 'XBOS-INFRA-201', 'Infrastructure settings saved');
    }
};
exports.InfrastructureController = InfrastructureController;
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_infrastructure_settings_dto_1.UpsertInfrastructureSettingsDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "upsertSettings", null);
exports.InfrastructureController = InfrastructureController = __decorate([
    (0, common_1.Controller)('infrastructure'),
    __metadata("design:paramtypes", [infrastructure_service_1.InfrastructureService])
], InfrastructureController);
