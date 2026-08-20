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
exports.HomeController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const scope_context_1 = require("../common/scope-context");
const get_home_summary_query_dto_1 = require("./dto/get-home-summary.query.dto");
const home_service_1 = require("./home.service");
let HomeController = class HomeController {
    homeService;
    constructor(homeService) {
        this.homeService = homeService;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized home access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    getSummary(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        const scopeCompanyId = (0, hrm_list_scope_1.normalizeHomeSummaryCompanyId)(authorization, query.company_id ?? headerCompanyId ?? '');
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: scopeCompanyId });
        return this.homeService
            .getSummary({ ...query, company_id: scopeCompanyId }, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-HOME-200', 'Home summary loaded'));
    }
};
exports.HomeController = HomeController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, get_home_summary_query_dto_1.GetHomeSummaryQueryDto]),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "getSummary", null);
exports.HomeController = HomeController = __decorate([
    (0, common_1.Controller)('home'),
    __metadata("design:paramtypes", [home_service_1.HomeService])
], HomeController);
//# sourceMappingURL=home.controller.js.map