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
exports.FleetController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const scope_context_1 = require("../common/scope-context");
const fleet_service_1 = require("./fleet.service");
let FleetController = class FleetController {
    fleet;
    constructor(fleet) {
        this.fleet = fleet;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized fleet access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    listVehicles(authorization, internalApiKey, tenantId, companyId, queryCompanyId, status, limitRaw) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const requestedCompany = (queryCompanyId ?? companyId ?? scope.companyId).trim();
        const listScope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompany, { tenantId: scope.tenantId });
        const limit = limitRaw ? Number(limitRaw) : undefined;
        return this.fleet
            .listVehicles(scope.tenantId, listScope.companyIds, { status, limit })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-FLEET-200', 'Fleet vehicles listed'));
    }
};
exports.FleetController = FleetController;
__decorate([
    (0, common_1.Get)('vehicles'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], FleetController.prototype, "listVehicles", null);
exports.FleetController = FleetController = __decorate([
    (0, common_1.Controller)('fleet'),
    __metadata("design:paramtypes", [fleet_service_1.FleetService])
], FleetController);
//# sourceMappingURL=fleet.controller.js.map