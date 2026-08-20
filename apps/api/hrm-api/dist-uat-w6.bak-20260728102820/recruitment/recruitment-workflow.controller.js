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
exports.RecruitmentWorkflowController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const recruitment_workflow_bridge_1 = require("./recruitment-workflow.bridge");
const BUSINESS_TYPES = new Set([
    recruitment_workflow_bridge_1.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
    recruitment_workflow_bridge_1.WF_BUSINESS_TYPE_HRM_REQUISITION,
    recruitment_workflow_bridge_1.WF_BUSINESS_TYPE_HRM_CANDIDATE,
]);
let RecruitmentWorkflowController = class RecruitmentWorkflowController {
    bridge;
    constructor(bridge) {
        this.bridge = bridge;
    }
    assertInternal(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    normalizeBusinessType(raw) {
        const value = String(raw ?? '').trim();
        if (!BUSINESS_TYPES.has(value)) {
            throw new api_exception_1.ApiException('HRM-VAL-001', 'businessType must be hrm_recruitment_plan | hrm_requisition | hrm_candidate', common_1.HttpStatus.BAD_REQUEST);
        }
        return value;
    }
    async stepCallback(body, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const businessType = this.normalizeBusinessType(body.businessType);
        const businessId = String(body.businessId ?? '').trim();
        const workflowInstanceId = String(body.workflowInstanceId ?? '').trim();
        const stepKey = String(body.stepKey ?? '').trim();
        const taskType = String(body.taskType ?? body.task_type ?? '').trim();
        const reviewerUserId = String(body.reviewerUserId ?? '').trim();
        if (!businessId || !workflowInstanceId || !stepKey || !taskType || !reviewerUserId) {
            throw new api_exception_1.ApiException('HRM-VAL-001', 'businessId, workflowInstanceId, stepKey, taskType, reviewerUserId required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const result = await this.bridge.handleStepCallback({
                businessType,
                businessId,
                workflowInstanceId,
                stepKey,
                taskType,
                taskId: body.taskId,
                reviewerUserId,
                reviewerName: body.reviewerName,
            });
            return (0, api_response_1.ok)(result, 'HRM-REC-WF-CALLBACK-200', 'Step callback processed');
        }
        catch (err) {
            if (err instanceof Error && err.message === 'HRM-REC-WF-STAGE-UNMAPPED') {
                throw new api_exception_1.ApiException('HRM-REC-WF-STAGE-UNMAPPED', `Unmapped taskType: ${taskType}`, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
            if (err instanceof Error && err.message === 'HRM-REC-CP-404') {
                throw new api_exception_1.ApiException('HRM-REC-CP-404', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
            }
            throw err;
        }
    }
    async terminalCallback(body, authorization, internalApiKey) {
        this.assertInternal(authorization, internalApiKey);
        const businessType = this.normalizeBusinessType(body.businessType);
        const businessId = String(body.businessId ?? '').trim();
        const workflowInstanceId = String(body.workflowInstanceId ?? '').trim();
        const terminalStatus = body.terminalStatus;
        const reviewerUserId = String(body.reviewerUserId ?? '').trim();
        if (!businessId || !workflowInstanceId || !terminalStatus || !reviewerUserId) {
            throw new api_exception_1.ApiException('HRM-VAL-001', 'businessId, workflowInstanceId, terminalStatus, reviewerUserId required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (terminalStatus !== 'completed' && terminalStatus !== 'rejected') {
            throw new api_exception_1.ApiException('HRM-VAL-001', 'terminalStatus must be completed | rejected', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const result = await this.bridge.handleTerminalCallback({
                businessType,
                businessId,
                workflowInstanceId,
                terminalStatus,
                reviewerUserId,
                reviewerName: body.reviewerName,
                rejectedReason: body.rejectedReason,
            });
            return (0, api_response_1.ok)(result, 'HRM-REC-WF-CALLBACK-200', 'Terminal callback processed');
        }
        catch (err) {
            if (err instanceof Error && err.message === 'HRM-REC-PLAN-404') {
                throw new api_exception_1.ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (err instanceof Error && err.message === 'HRM-REC-404') {
                throw new api_exception_1.ApiException('HRM-REC-404', 'Job requisition not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (err instanceof Error && err.message === 'HRM-REC-CP-404') {
                throw new api_exception_1.ApiException('HRM-REC-CP-404', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
            }
            throw err;
        }
    }
};
exports.RecruitmentWorkflowController = RecruitmentWorkflowController;
__decorate([
    (0, common_1.Post)('workflow/step'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RecruitmentWorkflowController.prototype, "stepCallback", null);
__decorate([
    (0, common_1.Post)('workflow/terminal'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RecruitmentWorkflowController.prototype, "terminalCallback", null);
exports.RecruitmentWorkflowController = RecruitmentWorkflowController = __decorate([
    (0, common_1.Controller)('recruitment'),
    __metadata("design:paramtypes", [recruitment_workflow_bridge_1.RecruitmentWorkflowBridge])
], RecruitmentWorkflowController);
//# sourceMappingURL=recruitment-workflow.controller.js.map