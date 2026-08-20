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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const list_inbox_query_dto_1 = require("./dto/list-inbox.query.dto");
const mark_inbox_read_dto_1 = require("./dto/mark-inbox-read.dto");
const mark_inbox_read_query_dto_1 = require("./dto/mark-inbox-read.query.dto");
const register_push_token_dto_1 = require("./dto/register-push-token.dto");
const hrm_inbox_service_1 = require("./hrm-inbox.service");
const push_outbound_service_1 = require("./push-outbound.service");
let NotificationsController = class NotificationsController {
    inbox;
    push;
    constructor(inbox, push) {
        this.inbox = inbox;
        this.push = push;
    }
    assertBusinessAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized notifications access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    listInbox(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        const limit = query.limit ?? 40;
        return this.inbox
            .listInbox(query.company_id, query.employee_id, limit, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-NOTIF-200', 'Inbox listed'));
    }
    markInboxRead(notificationId, authorization, internalApiKey, query, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.inbox
            .markRead(notificationId, query.company_id, body.viewer_employee_id)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-NOTIF-202', 'Marked read'));
    }
    registerPushToken(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.push
            .upsertToken(body.company_id, body.employee_id, body.platform, body.token)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-NOTIF-201', 'Push token registered'));
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('inbox'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_inbox_query_dto_1.ListInboxQueryDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "listInbox", null);
__decorate([
    (0, common_1.Patch)('inbox/:notificationId/read'),
    __param(0, (0, common_1.Param)('notificationId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, mark_inbox_read_query_dto_1.MarkInboxReadQueryDto,
        mark_inbox_read_dto_1.MarkInboxReadDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markInboxRead", null);
__decorate([
    (0, common_1.Post)('push-tokens'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, register_push_token_dto_1.RegisterPushTokenDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "registerPushToken", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [hrm_inbox_service_1.HrmInboxService,
        push_outbound_service_1.PushOutboundService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map