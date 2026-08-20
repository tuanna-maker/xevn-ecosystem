import { RecruitmentWorkflowBridge } from './recruitment-workflow.bridge';
export declare class RecruitmentWorkflowController {
    private readonly bridge;
    constructor(bridge: RecruitmentWorkflowBridge);
    private assertInternal;
    private normalizeBusinessType;
    stepCallback(body: {
        businessType?: string;
        businessId?: string;
        workflowInstanceId?: string;
        stepKey?: string;
        taskType?: string;
        task_type?: string;
        taskId?: string;
        reviewerUserId?: string;
        reviewerName?: string;
    }, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        applied: boolean;
        stage?: string;
        status?: string;
        skipReason?: string;
    }>>;
    terminalCallback(body: {
        businessType?: string;
        businessId?: string;
        workflowInstanceId?: string;
        terminalStatus?: 'completed' | 'rejected';
        reviewerUserId?: string;
        reviewerName?: string;
        rejectedReason?: string | null;
    }, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        applied: boolean;
        status?: string;
        stage?: string;
        skipReason?: string;
    }>>;
}
