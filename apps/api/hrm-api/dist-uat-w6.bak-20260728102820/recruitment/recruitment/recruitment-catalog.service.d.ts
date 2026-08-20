import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { ListCandidatesTableQueryDto } from './dto/list-candidates-table.query.dto';
import { ListJobPostingsQueryDto } from './dto/list-job-postings.query.dto';
import { RecruitmentWorkflowBridge } from './recruitment-workflow.bridge';
export declare const HRM_REC_JD_POS = "HRM-REC-JD-POS";
export declare class RecruitmentCatalogService {
    private readonly db;
    private readonly recruitmentWorkflowBridge;
    private readonly settingsCatalogs?;
    constructor(db: HrmDbService, recruitmentWorkflowBridge: RecruitmentWorkflowBridge, settingsCatalogs?: SettingsCatalogsService | undefined);
    private resolveCatalogTenantId;
    private assertJdPositionCodeInCatalog;
    private ensureWave2Schema;
    listJobPostings(query: ListJobPostingsQueryDto, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createJobPosting(payload: CreateJobPostingDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteJobPosting(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listCandidatesTable(query: ListCandidatesTableQueryDto, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    getCandidatePoolById(candidateId: string, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    listCandidateApplications(companyId: string, authorization?: string, jobPostingId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createCandidateApplication(companyId: string, payload: {
        candidate_id: string;
        job_posting_id: string;
        stage?: string;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteCandidateApplication(applicationId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    updateCandidateApplicationStage(applicationId: string, companyId: string, stage: string, authorization?: string, employeeId?: string): Promise<import("pg").QueryResultRow>;
    listRecruitmentPlans(companyId: string, authorization?: string): Promise<{
        total: number;
        data: {
            departments: {
                positions: Record<string, unknown>[];
                id: string;
                plan_id: string;
            }[];
            id: string;
        }[];
    }>;
    updateJobPosting(jobPostingId: string, payload: Record<string, unknown>, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateCandidatePoolStage(candidateId: string, companyId: string, stage: string, authorization?: string, employeeId?: string): Promise<import("pg").QueryResultRow>;
    createCandidatePool(payload: {
        company_id: string;
        full_name: string;
        email?: string;
        phone?: string;
        source?: string;
        stage?: string;
        employee_id?: string;
        applied_date?: string;
        notes?: string;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateCandidatePool(candidateId: string, companyId: string, payload: {
        full_name?: string;
        email?: string;
        phone?: string;
        source?: string;
        stage?: string;
        employee_id?: string;
        applied_date?: string;
        notes?: string;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteCandidatePool(candidateId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    createRecruitmentPlan(payload: Record<string, unknown>, authorization?: string): Promise<{
        departments: {
            positions: Record<string, unknown>[];
            id: string;
            plan_id: string;
        }[];
        id: string;
    } | {
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    deleteRecruitmentPlan(planId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    private ensureInterviewsSchema;
    listInterviews(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createInterview(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateInterview(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteInterview(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listHeadcountProposals(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createHeadcountProposal(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateHeadcountProposalStatus(proposalId: string, companyId: string, status: string, authorization?: string, rejectedReason?: string): Promise<import("pg").QueryResultRow>;
    listCandidateEvaluations(companyId: string, authorization?: string, candidateId?: string): Promise<{
        total: number;
        data: {
            scores: any[];
        }[];
    }>;
    createCandidateEvaluation(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteCandidateEvaluation(evaluationId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listEvaluationCriteriaTemplates(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    replaceEvaluationCriteriaTemplates(companyId: string, templates: Record<string, unknown>[], authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    updateRecruitmentPlanStatus(planId: string, companyId: string, status: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    submitRecruitmentPlanForApproval(planId: string, companyId: string, authorization?: string, options?: {
        submitterUserId?: string;
        tenantId?: string;
        companySlug?: string;
    }): Promise<{
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
    }>;
    startCandidatePipeline(candidateId: string, companyId: string, authorization?: string, options?: {
        submitterUserId?: string;
        tenantId?: string;
        companySlug?: string;
    }): Promise<{
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
    }>;
    listJobDescriptionTemplates(companyId: string, authorization?: string, query?: {
        q?: string;
        active?: string;
    }): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createJobDescriptionTemplate(payload: {
        company_id: string;
        code: string;
        title: string;
        position_name?: string;
        position_code?: string;
        job_description?: string;
        requirements?: string;
        notes?: string;
        is_active?: boolean;
    }, authorization?: string, options?: {
        tenantId?: string;
    }): Promise<import("pg").QueryResultRow>;
    updateJobDescriptionTemplate(templateId: string, companyId: string, payload: {
        code?: string;
        title?: string;
        position_name?: string;
        position_code?: string;
        job_description?: string;
        requirements?: string;
        notes?: string;
        is_active?: boolean;
    }, authorization?: string, options?: {
        tenantId?: string;
    }): Promise<import("pg").QueryResultRow>;
    deleteJobDescriptionTemplate(templateId: string, companyId: string, authorization?: string): Promise<{
        id: string;
        is_active: boolean;
    }>;
}
