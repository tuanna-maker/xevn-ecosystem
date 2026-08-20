import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
export declare const PORTAL_GROUP_CEO_EMAIL = "ceo@xe.vn";
export declare const WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = "hrm_recruitment_plan_approval";
export declare const WF_HRM_REQUISITION_APPROVAL_CODE = "hrm_requisition_approval";
export declare const WF_HRM_CANDIDATE_PIPELINE_CODE = "hrm_candidate_pipeline";
export declare const WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = "hrm_recruitment_plan";
export declare const WF_BUSINESS_TYPE_HRM_REQUISITION = "hrm_requisition";
export declare const WF_BUSINESS_TYPE_HRM_CANDIDATE = "hrm_candidate";
export declare const REC_WF_TASK_TYPE_TO_STAGE: Readonly<Record<string, string>>;
export declare const F6_CANDIDATE_STAGES: readonly ["new", "screening", "interview", "offer", "hired", "rejected"];
export type RecruitmentBusinessType = typeof WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN | typeof WF_BUSINESS_TYPE_HRM_REQUISITION | typeof WF_BUSINESS_TYPE_HRM_CANDIDATE;
export type RecruitmentWorkflowSpawnContext = {
    businessType: RecruitmentBusinessType;
    businessId: string;
    companyId: string;
    submitterUserId?: string;
    submitterEmployeeId?: string;
    tenantId?: string;
    companySlug?: string;
};
export type RecruitmentStepCallbackPayload = {
    businessType: RecruitmentBusinessType;
    businessId: string;
    workflowInstanceId: string;
    stepKey: string;
    taskType: string;
    taskId?: string;
    reviewerUserId: string;
    reviewerName?: string;
};
export type RecruitmentTerminalCallbackPayload = {
    businessType: RecruitmentBusinessType;
    businessId: string;
    workflowInstanceId: string;
    terminalStatus: 'completed' | 'rejected';
    reviewerUserId: string;
    reviewerName?: string;
    rejectedReason?: string | null;
};
export declare function mapRecTaskTypeToStage(taskType: string): string | null;
export declare function isRecruitmentWorkflowLocked(workflowInstanceId: string | null | undefined, statusOrStage: string | null | undefined, entity: 'plan' | 'requisition' | 'candidate'): boolean;
export declare class RecruitmentWorkflowBridge {
    private readonly catalogSync;
    private readonly db;
    private readonly logger;
    constructor(catalogSync: CatalogSyncService, db: HrmDbService);
    private xbosBaseUrl;
    resolveSubmitterEmployeeId(ctx: RecruitmentWorkflowSpawnContext): Promise<string | null>;
    private isPortalGroupCeoIdentity;
    private resolveEmployeeIdByEmail;
    private resolveEmployeeIdViaMembership;
    private resolveHoldingGroupCeoMasterEmployee;
    private linkPortalEmailToEmployeeIfSafe;
    private ensureHoldingPortalGroupCeoEmployee;
    ensureSchema(): Promise<void>;
    startRecruitmentWorkflowIfConfigured(ctx: RecruitmentWorkflowSpawnContext): Promise<{
        workflowInstanceId?: string;
    } | null>;
    handleStepCallback(payload: RecruitmentStepCallbackPayload): Promise<{
        applied: boolean;
        stage?: string;
        status?: string;
        skipReason?: string;
    }>;
    handleTerminalCallback(payload: RecruitmentTerminalCallbackPayload): Promise<{
        applied: boolean;
        status?: string;
        stage?: string;
        skipReason?: string;
    }>;
    private handlePlanTerminal;
    private handleRequisitionTerminal;
    private handleCandidateTerminal;
    private resolveHireEmployeeIdForStamp;
    private isHireAcMet;
    assertNotLockedOrThrow(workflowInstanceId: string | null | undefined, statusOrStage: string | null | undefined, entity: 'plan' | 'requisition' | 'candidate'): void;
}
