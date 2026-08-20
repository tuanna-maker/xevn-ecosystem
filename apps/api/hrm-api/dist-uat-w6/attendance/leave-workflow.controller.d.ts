import { LeaveWorkflowBridge } from './leave-workflow.bridge';
export declare class LeaveWorkflowController {
    private readonly bridge;
    constructor(bridge: LeaveWorkflowBridge);
    private assertInternal;
    resolveManager(employeeId: string, companyId: string | undefined, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        manager_user_id: string | null;
        manager_employee_id: string | null;
    }>>;
    terminalCallback(body: {
        leaveRequestId: string;
        workflowInstanceId?: string;
        terminalStatus: 'completed' | 'rejected';
        reviewerUserId: string;
        reviewerName?: string;
        rejectedReason?: string | null;
    }, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        applied: boolean;
        status: string;
    }>>;
}
