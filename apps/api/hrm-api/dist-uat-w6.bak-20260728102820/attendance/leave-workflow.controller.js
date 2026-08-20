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
exports.LeaveWorkflowController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const leave_workflow_bridge_1 = require("./leave-workflow.bridge");
let LeaveWorkflowController = class LeaveWorkflowController {
    bridge;
    constructor(bridge) {
        this.bridge = bridge;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async resolveManager(employeeId, companyId, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        if (!employeeId?.trim()) {
            throw new api_exception_1.ApiException('HRM-VAL-001', 'employee_id required', common_1.HttpStatus.BAD_REQUEST);
        }
        const data = await this.bridge.resolveManagerForWorkflow(employeeId.trim(), companyId?.trim());
        return (0, api_response_1.ok)(data, 'HRM-WF-RESOLVE-200', 'Manager resolved');
    }
    async terminalCallback(body, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        if (!body.leaveRequestId?.trim() || !body.terminalStatus || !body.reviewerUserId?.trim()) {
            throw new api_exception_1.ApiException('HRM-VAL-001', 'leaveRequestId, terminalStatus, reviewerUserId required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const result = await this.bridge.handleTerminalCallback({
                leaveRequestId: body.leaveRequestId.trim(),
                workflowInstanceId: body.workflowInstanceId,
                terminalStatus: body.terminalStatus,
                reviewerUserId: body.reviewerUserId.trim(),
                reviewerName: body.reviewerName,
                rejectedReason: body.rejectedReason,
            });
            return (0, api_response_1.ok)(result, 'HRM-WF-CALLBACK-200', 'Terminal callback processed');
        }
        catch (err) {
            if (err instanceof Error && err.message === 'HRM-LEAVE-404') {
                throw new api_exception_1.ApiException('HRM-LEAVE-404', 'Leave request not found', common_1.HttpStatus.NOT_FOUND);
            }
            throw err;
        }
    }
};
exports.LeaveWorkflowController = LeaveWorkflowController;
__decorate([
    (0, common_1.Get)('workflow-resolver/manager'),
    __param(0, (0, common_1.Query)('employee_id')),
    __param(1, (0, common_1.Query)('company_id')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], LeaveWorkflowController.prototype, "resolveManager", null);
__decorate([
    (0, common_1.Post)('leave-workflow/terminal'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LeaveWorkflowController.prototype, "terminalCallback", null);
exports.LeaveWorkflowController = LeaveWorkflowController = __decorate([
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [leave_workflow_bridge_1.LeaveWorkflowBridge])
], LeaveWorkflowController);
//# sourceMappingURL=leave-workflow.controller.js.map