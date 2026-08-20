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
exports.RecruitmentController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_context_1 = require("../common/hrm-list-scope-context");
const scope_context_1 = require("../common/scope-context");
const create_candidate_dto_1 = require("./dto/create-candidate.dto");
const create_job_posting_dto_1 = require("./dto/create-job-posting.dto");
const create_job_requisition_dto_1 = require("./dto/create-job-requisition.dto");
const create_job_template_dto_1 = require("./dto/create-job-template.dto");
const list_candidates_table_query_dto_1 = require("./dto/list-candidates-table.query.dto");
const list_candidates_query_dto_1 = require("./dto/list-candidates.query.dto");
const list_job_postings_query_dto_1 = require("./dto/list-job-postings.query.dto");
const get_job_requisition_query_dto_1 = require("./dto/get-job-requisition.query.dto");
const list_job_requisitions_query_dto_1 = require("./dto/list-job-requisitions.query.dto");
const schedule_interview_dto_1 = require("./dto/schedule-interview.dto");
const update_candidate_pool_dto_1 = require("./dto/update-candidate-pool.dto");
const update_interview_status_dto_1 = require("./dto/update-interview-status.dto");
const update_job_requisition_dto_1 = require("./dto/update-job-requisition.dto");
const update_job_template_dto_1 = require("./dto/update-job-template.dto");
const recruitment_catalog_service_1 = require("./recruitment-catalog.service");
const recruitment_service_1 = require("./recruitment.service");
const resolve_submitter_user_id_1 = require("./resolve-submitter-user-id");
let RecruitmentController = class RecruitmentController {
    recruitmentService;
    recruitmentCatalog;
    constructor(recruitmentService, recruitmentCatalog) {
        this.recruitmentService = recruitmentService;
        this.recruitmentCatalog = recruitmentCatalog;
    }
    assertAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized recruitment access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    listJobPostings(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.recruitmentCatalog
            .listJobPostings(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JP-200', 'Job postings listed'));
    }
    createJobPosting(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.recruitmentCatalog
            .createJobPosting(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JP-201', 'Job posting created'));
    }
    updateJobPosting(jobPostingId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.recruitmentCatalog
            .updateJobPosting(jobPostingId, body, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JP-200', 'Job posting updated'));
    }
    deleteJobPosting(jobPostingId, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.recruitmentCatalog
            .deleteJobPosting(jobPostingId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JP-200', 'Job posting deleted'));
    }
    updateCandidatePoolStage(candidateId, authorization, internalApiKey, companyId, stage, employeeId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .updateCandidatePoolStage(candidateId, companyId, stage, authorization, employeeId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CP-200', 'Candidate stage updated'));
    }
    listInterviewsCatalog(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .listInterviews(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-INT-200', 'Interviews listed'));
    }
    createInterviewCatalog(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .createInterview(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-INT-201', 'Interview created'));
    }
    updateInterviewCatalog(interviewId, authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .updateInterview(interviewId, body, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-INT-200', 'Interview updated'));
    }
    deleteInterviewCatalog(interviewId, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .deleteInterview(interviewId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-INT-200', 'Interview deleted'));
    }
    listCandidatesPool(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.recruitmentCatalog
            .listCandidatesTable(query, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CP-200', 'Candidates pool listed'));
    }
    getCandidatePool(candidateId, authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.recruitmentCatalog
            .getCandidatePoolById(candidateId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CP-200', 'Candidate pool row loaded'));
    }
    listCandidateApplications(authorization, internalApiKey, tenantId, headerCompanyId, companyId, jobPostingId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.recruitmentCatalog
            .listCandidateApplications(companyId, authorization, jobPostingId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CA-200', 'Candidate applications listed'));
    }
    createCandidateApplication(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .createCandidateApplication(body.company_id, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CA-201', 'Candidate application created'));
    }
    deleteCandidateApplication(applicationId, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .deleteCandidateApplication(applicationId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CA-200', 'Candidate application deleted'));
    }
    updateCandidateApplicationStage(applicationId, authorization, internalApiKey, companyId, stage, employeeId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .updateCandidateApplicationStage(applicationId, companyId, stage, authorization, employeeId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CA-200', 'Candidate application updated'));
    }
    listHeadcountProposals(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .listHeadcountProposals(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-HC-200', 'Headcount proposals listed'));
    }
    createHeadcountProposal(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .createHeadcountProposal(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-HC-201', 'Headcount proposal created'));
    }
    updateHeadcountProposalStatus(proposalId, authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .updateHeadcountProposalStatus(proposalId, companyId, body.status, authorization, body.rejected_reason)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-HC-200', 'Headcount proposal updated'));
    }
    listCandidateEvaluations(authorization, internalApiKey, companyId, candidateId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .listCandidateEvaluations(companyId, authorization, candidateId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-EVAL-200', 'Candidate evaluations listed'));
    }
    createCandidateEvaluation(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .createCandidateEvaluation(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-EVAL-201', 'Candidate evaluation created'));
    }
    deleteCandidateEvaluation(evaluationId, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .deleteCandidateEvaluation(evaluationId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-EVAL-200', 'Candidate evaluation deleted'));
    }
    listEvaluationCriteriaTemplates(authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .listEvaluationCriteriaTemplates(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-EVAL-200', 'Evaluation criteria templates listed'));
    }
    listJobTemplates(authorization, internalApiKey, tenantId, companyId, q, active) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.recruitmentCatalog
            .listJobDescriptionTemplates(companyId, authorization, { q, active })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JD-200', 'Job description templates listed'));
    }
    createJobTemplate(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.recruitmentCatalog
            .createJobDescriptionTemplate(body, authorization, { tenantId })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JD-201', 'Job description template created'));
    }
    updateJobTemplate(templateId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.recruitmentCatalog
            .updateJobDescriptionTemplate(templateId, companyId, body, authorization, { tenantId })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JD-200', 'Job description template updated'));
    }
    deleteJobTemplate(templateId, authorization, internalApiKey, tenantId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.recruitmentCatalog
            .deleteJobDescriptionTemplate(templateId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-JD-200', 'Job description template deleted'));
    }
    replaceEvaluationCriteriaTemplates(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .replaceEvaluationCriteriaTemplates(body.company_id, body.templates ?? [], authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-EVAL-200', 'Evaluation criteria templates saved'));
    }
    listRecruitmentPlans(authorization, internalApiKey, tenantId, headerCompanyId, companyId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.recruitmentCatalog
            .listRecruitmentPlans(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-PLAN-200', 'Recruitment plans listed'));
    }
    createRecruitmentPlan(authorization, internalApiKey, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .createRecruitmentPlan(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-PLAN-201', 'Recruitment plan created'));
    }
    deleteRecruitmentPlan(planId, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .deleteRecruitmentPlan(planId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-PLAN-200', 'Recruitment plan deleted'));
    }
    updateRecruitmentPlanStatus(planId, authorization, internalApiKey, tenantId, companyId, status) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.recruitmentCatalog
            .updateRecruitmentPlanStatus(planId, companyId, status, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-PLAN-200', 'Recruitment plan updated'));
    }
    submitRecruitmentPlanWorkflow(planId, authorization, internalApiKey, tenantId, companyId, userId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const submitterUserId = (0, resolve_submitter_user_id_1.resolveSubmitterUserIdFromAuth)(authorization, userId);
        return this.recruitmentCatalog
            .submitRecruitmentPlanForApproval(planId, companyId, authorization, {
            submitterUserId,
            tenantId,
            companySlug: companyId,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-PLAN-WF-200', 'Recruitment plan submitted to workflow'));
    }
    startCandidatePipeline(candidateId, authorization, internalApiKey, tenantId, companyId, userId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        const submitterUserId = (0, resolve_submitter_user_id_1.resolveSubmitterUserIdFromAuth)(authorization, userId);
        return this.recruitmentCatalog
            .startCandidatePipeline(candidateId, companyId, authorization, {
            submitterUserId,
            tenantId,
            companySlug: companyId,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CP-WF-200', 'Candidate pipeline started'));
    }
    createJobRequisition(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.recruitmentService
            .createJobRequisition(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-201', 'Job requisition created'));
    }
    submitJobRequisitionWorkflow(requisitionId, authorization, internalApiKey, tenantId, headerCompanyId, query, userId) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId,
            companyId: query.company_id ?? headerCompanyId,
        });
        const submitterUserId = (0, resolve_submitter_user_id_1.resolveSubmitterUserIdFromAuth)(authorization, userId);
        return this.recruitmentService
            .submitJobRequisitionForApproval(requisitionId, query, authorization, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId), {
            submitterUserId,
            tenantId,
            companySlug: query.company_id ?? headerCompanyId,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-WF-200', 'Job requisition submitted to workflow'));
    }
    updateJobRequisition(requisitionId, authorization, internalApiKey, tenantId, headerCompanyId, query, body, headers = {}) {
        return this.patchJobRequisitionInternal(requisitionId, authorization, internalApiKey, tenantId, headerCompanyId, query, body, headers);
    }
    putJobRequisition(requisitionId, authorization, internalApiKey, tenantId, headerCompanyId, query, body, headers = {}) {
        return this.patchJobRequisitionInternal(requisitionId, authorization, internalApiKey, tenantId, headerCompanyId, query, body, headers);
    }
    patchJobRequisitionInternal(requisitionId, authorization, internalApiKey, tenantId, headerCompanyId, query, body, headers) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.recruitmentService
            .updateJobRequisition(requisitionId, body, query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-200', 'Job requisition updated'));
    }
    getJobRequisition(requisitionId, authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.recruitmentService
            .getJobRequisitionById(requisitionId, query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-200', 'Job requisition loaded'));
    }
    listJobRequisitions(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.recruitmentService
            .listJobRequisitions(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-200', 'Job requisitions listed'));
    }
    createCandidate(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        if (body.requisition_id) {
            return this.recruitmentService
                .createCandidate(body, authorization)
                .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-202', 'Candidate created'));
        }
        return this.recruitmentCatalog
            .createCandidatePool(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CP-201', 'Candidate pool row created'));
    }
    updateCandidatePool(candidateId, authorization, internalApiKey, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .updateCandidatePool(candidateId, companyId, body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CP-200', 'Candidate pool row updated'));
    }
    deleteCandidatePool(candidateId, authorization, internalApiKey, companyId) {
        this.assertAccess(authorization, internalApiKey);
        return this.recruitmentCatalog
            .deleteCandidatePool(candidateId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-CP-200', 'Candidate pool row deleted'));
    }
    listCandidates(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.recruitmentService
            .listCandidates(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-200', 'Candidates listed'));
    }
    getCandidate(candidateId, authorization, internalApiKey, tenantId, headerCompanyId, companyId, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: companyId ?? headerCompanyId });
        return this.recruitmentService
            .getCandidateById(candidateId, companyId, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-200', 'Candidate loaded'));
    }
    scheduleInterview(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.recruitmentService.scheduleInterview(body, authorization).then((data) => (0, api_response_1.ok)(data, 'HRM-REC-203', 'Interview scheduled'));
    }
    updateInterviewStatus(interviewId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.recruitmentService
            .updateInterviewStatus(interviewId, body, companyId ?? 'main', authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-REC-204', 'Interview updated'));
    }
};
exports.RecruitmentController = RecruitmentController;
__decorate([
    (0, common_1.Get)('job-postings'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_job_postings_query_dto_1.ListJobPostingsQueryDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listJobPostings", null);
__decorate([
    (0, common_1.Post)('job-postings'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_job_posting_dto_1.CreateJobPostingDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createJobPosting", null);
__decorate([
    (0, common_1.Patch)('job-postings/:jobPostingId'),
    __param(0, (0, common_1.Param)('jobPostingId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateJobPosting", null);
__decorate([
    (0, common_1.Delete)('job-postings/:jobPostingId'),
    __param(0, (0, common_1.Param)('jobPostingId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "deleteJobPosting", null);
__decorate([
    (0, common_1.Patch)('candidates-pool/:candidateId/stage'),
    __param(0, (0, common_1.Param)('candidateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)('stage')),
    __param(5, (0, common_1.Body)('employee_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateCandidatePoolStage", null);
__decorate([
    (0, common_1.Get)('interviews-catalog'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listInterviewsCatalog", null);
__decorate([
    (0, common_1.Post)('interviews-catalog'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createInterviewCatalog", null);
__decorate([
    (0, common_1.Patch)('interviews-catalog/:interviewId'),
    __param(0, (0, common_1.Param)('interviewId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateInterviewCatalog", null);
__decorate([
    (0, common_1.Delete)('interviews-catalog/:interviewId'),
    __param(0, (0, common_1.Param)('interviewId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "deleteInterviewCatalog", null);
__decorate([
    (0, common_1.Get)('candidates-pool'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_candidates_table_query_dto_1.ListCandidatesTableQueryDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listCandidatesPool", null);
__decorate([
    (0, common_1.Get)('candidates-pool/:candidateId'),
    __param(0, (0, common_1.Param)('candidateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "getCandidatePool", null);
__decorate([
    (0, common_1.Get)('candidate-applications'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Query)('job_posting_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listCandidateApplications", null);
__decorate([
    (0, common_1.Post)('candidate-applications'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createCandidateApplication", null);
__decorate([
    (0, common_1.Delete)('candidate-applications/:applicationId'),
    __param(0, (0, common_1.Param)('applicationId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "deleteCandidateApplication", null);
__decorate([
    (0, common_1.Patch)('candidate-applications/:applicationId/stage'),
    __param(0, (0, common_1.Param)('applicationId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)('stage')),
    __param(5, (0, common_1.Body)('employee_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateCandidateApplicationStage", null);
__decorate([
    (0, common_1.Get)('headcount-proposals'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listHeadcountProposals", null);
__decorate([
    (0, common_1.Post)('headcount-proposals'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createHeadcountProposal", null);
__decorate([
    (0, common_1.Patch)('headcount-proposals/:proposalId/status'),
    __param(0, (0, common_1.Param)('proposalId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateHeadcountProposalStatus", null);
__decorate([
    (0, common_1.Get)('candidate-evaluations'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __param(3, (0, common_1.Query)('candidate_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listCandidateEvaluations", null);
__decorate([
    (0, common_1.Post)('candidate-evaluations'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createCandidateEvaluation", null);
__decorate([
    (0, common_1.Delete)('candidate-evaluations/:evaluationId'),
    __param(0, (0, common_1.Param)('evaluationId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "deleteCandidateEvaluation", null);
__decorate([
    (0, common_1.Get)('evaluation-criteria-templates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listEvaluationCriteriaTemplates", null);
__decorate([
    (0, common_1.Get)('job-templates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Query)('q')),
    __param(5, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listJobTemplates", null);
__decorate([
    (0, common_1.Post)('job-templates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_job_template_dto_1.CreateJobTemplateDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createJobTemplate", null);
__decorate([
    (0, common_1.Patch)('job-templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String, update_job_template_dto_1.UpdateJobTemplateDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateJobTemplate", null);
__decorate([
    (0, common_1.Delete)('job-templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "deleteJobTemplate", null);
__decorate([
    (0, common_1.Post)('evaluation-criteria-templates/replace'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "replaceEvaluationCriteriaTemplates", null);
__decorate([
    (0, common_1.Get)('recruitment-plans'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listRecruitmentPlans", null);
__decorate([
    (0, common_1.Post)('recruitment-plans'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createRecruitmentPlan", null);
__decorate([
    (0, common_1.Delete)('recruitment-plans/:planId'),
    __param(0, (0, common_1.Param)('planId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "deleteRecruitmentPlan", null);
__decorate([
    (0, common_1.Patch)('recruitment-plans/:planId/status'),
    __param(0, (0, common_1.Param)('planId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateRecruitmentPlanStatus", null);
__decorate([
    (0, common_1.Post)('recruitment-plans/:planId/submit-workflow'),
    __param(0, (0, common_1.Param)('planId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "submitRecruitmentPlanWorkflow", null);
__decorate([
    (0, common_1.Post)('candidates-pool/:candidateId/start-pipeline'),
    __param(0, (0, common_1.Param)('candidateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Query)('company_id')),
    __param(5, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "startCandidatePipeline", null);
__decorate([
    (0, common_1.Post)('requisitions'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_job_requisition_dto_1.CreateJobRequisitionDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createJobRequisition", null);
__decorate([
    (0, common_1.Post)('requisitions/:requisitionId/submit-workflow'),
    __param(0, (0, common_1.Param)('requisitionId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, get_job_requisition_query_dto_1.GetJobRequisitionQueryDto, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "submitJobRequisitionWorkflow", null);
__decorate([
    (0, common_1.Patch)('requisitions/:requisitionId'),
    __param(0, (0, common_1.Param)('requisitionId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __param(7, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, get_job_requisition_query_dto_1.GetJobRequisitionQueryDto,
        update_job_requisition_dto_1.UpdateJobRequisitionDto, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateJobRequisition", null);
__decorate([
    (0, common_1.Put)('requisitions/:requisitionId'),
    __param(0, (0, common_1.Param)('requisitionId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Body)()),
    __param(7, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, get_job_requisition_query_dto_1.GetJobRequisitionQueryDto,
        update_job_requisition_dto_1.UpdateJobRequisitionDto, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "putJobRequisition", null);
__decorate([
    (0, common_1.Get)('requisitions/:requisitionId'),
    __param(0, (0, common_1.Param)('requisitionId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, get_job_requisition_query_dto_1.GetJobRequisitionQueryDto, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "getJobRequisition", null);
__decorate([
    (0, common_1.Get)('requisitions'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_job_requisitions_query_dto_1.ListJobRequisitionsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listJobRequisitions", null);
__decorate([
    (0, common_1.Post)('candidates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_candidate_dto_1.CreateCandidateDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createCandidate", null);
__decorate([
    (0, common_1.Patch)('candidates-pool/:candidateId'),
    __param(0, (0, common_1.Param)('candidateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, update_candidate_pool_dto_1.UpdateCandidatePoolDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateCandidatePool", null);
__decorate([
    (0, common_1.Delete)('candidates-pool/:candidateId'),
    __param(0, (0, common_1.Param)('candidateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "deleteCandidatePool", null);
__decorate([
    (0, common_1.Get)('candidates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_candidates_query_dto_1.ListCandidatesQueryDto, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "listCandidates", null);
__decorate([
    (0, common_1.Get)('candidates/:candidateId'),
    __param(0, (0, common_1.Param)('candidateId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)('company_id')),
    __param(6, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "getCandidate", null);
__decorate([
    (0, common_1.Post)('interviews'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, schedule_interview_dto_1.ScheduleInterviewDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "scheduleInterview", null);
__decorate([
    (0, common_1.Patch)('interviews/:interviewId/status'),
    __param(0, (0, common_1.Param)('interviewId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_interview_status_dto_1.UpdateInterviewStatusDto]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateInterviewStatus", null);
exports.RecruitmentController = RecruitmentController = __decorate([
    (0, common_1.Controller)('recruitment'),
    __metadata("design:paramtypes", [recruitment_service_1.RecruitmentService,
        recruitment_catalog_service_1.RecruitmentCatalogService])
], RecruitmentController);
//# sourceMappingURL=recruitment.controller.js.map