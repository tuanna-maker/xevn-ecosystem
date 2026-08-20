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
exports.OperatingUnitsController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const operating_units_service_1 = require("./operating-units.service");
let OperatingUnitsController = class OperatingUnitsController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized operating-units access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    list(authorization, internalApiKey, tenantId, headerCompanyId) {
        this.assertAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId,
            companyId: headerCompanyId,
        });
        return this.service
            .listOperatingUnits(authorization, { tenantId: scope.tenantId })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OPU-200', 'Operating units listed'));
    }
};
exports.OperatingUnitsController = OperatingUnitsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], OperatingUnitsController.prototype, "list", null);
exports.OperatingUnitsController = OperatingUnitsController = __decorate([
    (0, common_1.Controller)('operating-units'),
    __metadata("design:paramtypes", [operating_units_service_1.OperatingUnitsService])
], OperatingUnitsController);
//# sourceMappingURL=operating-units.controller.js.map