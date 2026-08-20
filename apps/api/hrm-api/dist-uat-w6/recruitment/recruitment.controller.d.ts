import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { ListCandidatesTableQueryDto } from './dto/list-candidates-table.query.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { ListJobPostingsQueryDto } from './dto/list-job-postings.query.dto';
import { GetJobRequisitionQueryDto } from './dto/get-job-requisition.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateCandidatePoolDto } from './dto/update-candidate-pool.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';
export declare class RecruitmentController {
    private readonly recruitmentService;
    private readonly recruitmentCatalog;
    constructor(recruitmentService: RecruitmentService, recruitmentCatalog: RecruitmentCatalogService);
    private assertAccess;
    listJobPostings(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListJobPostingsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createJobPosting(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateJobPostingDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateJobPosting(jobPostingId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteJobPosting(jobPostingId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    updateCandidatePoolStage(candidateId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, stage: string, employeeId?: string): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listInterviewsCatalog(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createInterviewCatalog(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateInterviewCatalog(interviewId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteInterviewCatalog(interviewId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listCandidatesPool(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListCandidatesTableQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    getCandidatePool(candidateId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listCandidateApplications(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string, jobPostingId?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createCandidateApplication(authorization: string | undefined, internalApiKey: string | undefined, body: {
        company_id: string;
        candidate_id: string;
        job_posting_id: string;
        stage?: string;
    }): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteCandidateApplication(applicationId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    updateCandidateApplicationStage(applicationId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, stage: string, employeeId?: string): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listHeadcountProposals(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createHeadcountProposal(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateHeadcountProposalStatus(proposalId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: {
        status: string;
        rejected_reason?: string;
    }): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listCandidateEvaluations(authorization: string | undefined, internalApiKey: string | undefined, companyId: string, candidateId?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            scores: any[];
        }[];
    }>>;
    createCandidateEvaluation(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteCandidateEvaluation(evaluationId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listEvaluationCriteriaTemplates(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    listJobTemplates(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string, q?: string, active?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createJobTemplate(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateJobTemplateDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateJobTemplate(templateId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string, body: UpdateJobTemplateDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteJobTemplate(templateId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        is_active: boolean;
    }>>;
    replaceEvaluationCriteriaTemplates(authorization: string | undefined, internalApiKey: string | undefined, body: {
        company_id: string;
        templates: Record<string, unknown>[];
    }): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    listRecruitmentPlans(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            departments: {
                positions: Record<string, unknown>[];
                id: string;
                plan_id: string;
            }[];
            id: string;
        }[];
    }>>;
    createRecruitmentPlan(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        departments: {
            positions: Record<string, unknown>[];
            id: string;
            plan_id: string;
        }[];
        id: string;
    } | {
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>>;
    deleteRecruitmentPlan(planId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    updateRecruitmentPlanStatus(planId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string, status: string): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    submitRecruitmentPlanWorkflow(planId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string, userId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        status: string;
        workflow_instance_id: string;
        spawn: {
            workflowInstanceId: string;
            idempotent: boolean;
        };
        id: string;
        company_id: string;
    } | {
        spawn: {
            workflowInstanceId?: string;
        } | null;
        spawnMissing: boolean;
    }>>;
    startCandidatePipeline(candidateId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string, userId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        spawn: {
            workflowInstanceId: string;
            idempotent: boolean;
        };
        id: string;
        company_id: string;
        stage: string;
        workflow_instance_id?: string | null;
    } | {
        spawn: {
            workflowInstanceId?: string;
        } | null;
        spawnMissing: boolean;
    }>>;
    createJobRequisition(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateJobRequisitionDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        title: string;
        department: string;
        employment_type: string;
        headcount: number;
        status: string;
        job_description: string | null;
        requirements: string | null;
        job_template_id: string | null;
        workflow_instance_id?: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    submitJobRequisitionWorkflow(requisitionId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: GetJobRequisitionQueryDto, userId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        spawn: {
            workflowInstanceId: string;
            idempotent: boolean;
        };
        id: string;
        company_id: string;
        title: string;
        department: string;
        employment_type: string;
        headcount: number;
        status: string;
        job_description: string | null;
        requirements: string | null;
        job_template_id: string | null;
        workflow_instance_id?: string | null;
        created_at: string;
        updated_at: string;
    } | {
        spawn: {
            workflowInstanceId?: string;
        } | null;
        spawnMissing: boolean;
        id: string;
        company_id: string;
        title: string;
        department: string;
        employment_type: string;
        headcount: number;
        status: string;
        job_description: string | null;
        requirements: string | null;
        job_template_id: string | null;
        workflow_instance_id?: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    updateJobRequisition(requisitionId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: GetJobRequisitionQueryDto, body: UpdateJobRequisitionDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        title: string;
        department: string;
        employment_type: string;
        headcount: number;
        status: string;
        job_description: string | null;
        requirements: string | null;
        job_template_id: string | null;
        workflow_instance_id?: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    putJobRequisition(requisitionId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: GetJobRequisitionQueryDto, body: UpdateJobRequisitionDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        title: string;
        department: string;
        employment_type: string;
        headcount: number;
        status: string;
        job_description: string | null;
        requirements: string | null;
        job_template_id: string | null;
        workflow_instance_id?: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    private patchJobRequisitionInternal;
    getJobRequisition(requisitionId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: GetJobRequisitionQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        title: string;
        department: string;
        employment_type: string;
        headcount: number;
        status: string;
        job_description: string | null;
        requirements: string | null;
        job_template_id: string | null;
        workflow_instance_id?: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    listJobRequisitions(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListJobRequisitionsQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: {
            id: string;
            company_id: string;
            title: string;
            department: string;
            employment_type: string;
            headcount: number;
            status: string;
            job_description: string | null;
            requirements: string | null;
            job_template_id: string | null;
            workflow_instance_id?: string | null;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
    createCandidate(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateCandidateDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>> | Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        requisition_id: string;
        full_name: string;
        email: string;
        source: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>>;
    updateCandidatePool(candidateId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: UpdateCandidatePoolDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteCandidatePool(candidateId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listCandidates(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListCandidatesQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: {
            id: string;
            company_id: string;
            requisition_id: string;
            full_name: string;
            email: string;
            source: string;
            status: string;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
    getCandidate(candidateId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        requisition_id: string;
        full_name: string;
        email: string;
        source: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>>;
    scheduleInterview(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: ScheduleInterviewDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        candidate_id: string;
        scheduled_at: string;
        interviewer: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>>;
    updateInterviewStatus(interviewId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: UpdateInterviewStatusDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        candidate_id: string;
        scheduled_at: string;
        interviewer: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>>;
}
