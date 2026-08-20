import { HrmListScopeContext } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { GetJobRequisitionQueryDto } from './dto/get-job-requisition.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { RecruitmentWorkflowBridge } from './recruitment-workflow.bridge';
type JobRequisitionRow = {
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
};
type CandidateRow = {
    id: string;
    company_id: string;
    requisition_id: string;
    full_name: string;
    email: string;
    source: string;
    status: string;
    created_at: string;
    updated_at: string;
};
type InterviewRow = {
    id: string;
    company_id: string;
    candidate_id: string;
    scheduled_at: string;
    interviewer: string;
    status: string;
    created_at: string;
    updated_at: string;
};
export declare class RecruitmentService {
    private readonly db;
    private readonly recruitmentWorkflowBridge;
    constructor(db: HrmDbService, recruitmentWorkflowBridge: RecruitmentWorkflowBridge);
    private resolvePage;
    private resolvePageSize;
    private ensureSchema;
    createJobRequisition(payload: CreateJobRequisitionDto, authorization?: string): Promise<JobRequisitionRow>;
    listJobRequisitions(query: ListJobRequisitionsQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: JobRequisitionRow[];
    }>;
    getJobRequisitionById(requisitionId: string, query: GetJobRequisitionQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<JobRequisitionRow>;
    updateJobRequisition(requisitionId: string, payload: UpdateJobRequisitionDto, query: GetJobRequisitionQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<JobRequisitionRow>;
    submitJobRequisitionForApproval(requisitionId: string, query: GetJobRequisitionQueryDto, authorization?: string, scopeContext?: HrmListScopeContext, options?: {
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
    }>;
    createCandidate(payload: CreateCandidateDto, authorization?: string): Promise<CandidateRow>;
    listCandidates(query: ListCandidatesQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: CandidateRow[];
    }>;
    getCandidateById(candidateId: string, companyId: string, authorization?: string, scopeContext?: HrmListScopeContext): Promise<CandidateRow>;
    scheduleInterview(payload: ScheduleInterviewDto, authorization?: string): Promise<InterviewRow>;
    updateInterviewStatus(interviewId: string, payload: UpdateInterviewStatusDto, requestedCompanyId: string, authorization?: string): Promise<InterviewRow>;
}
export {};
