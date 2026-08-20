import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
export declare function expandWorkflowResolverCompanyIds(companyId: string): string[];
export type LeaveWorkflowSpawnContext = {
    leaveRequestId: string;
    companyId: string;
    employeeId: string;
    submitterUserId?: string;
    tenantId?: string;
    companySlug?: string;
};
export declare class LeaveWorkflowBridge {
    private readonly catalogSync;
    private readonly db;
    private readonly fanout;
    private readonly logger;
    constructor(catalogSync: CatalogSyncService, db: HrmDbService, fanout: AttendanceEventFanoutService);
    private xbosBaseUrl;
    private ensureSchema;
    resolveManagerForWorkflow(employeeId: string, companyId?: string): Promise<{
        manager_user_id: string | null;
        manager_employee_id: string | null;
    }>;
    startLeaveWorkflowIfConfigured(ctx: LeaveWorkflowSpawnContext): Promise<{
        workflowInstanceId?: string;
    } | null>;
    handleTerminalCallback(payload: {
        leaveRequestId: string;
        workflowInstanceId?: string;
        terminalStatus: 'completed' | 'rejected';
        reviewerUserId: string;
        reviewerName?: string;
        rejectedReason?: string | null;
    }): Promise<{
        applied: boolean;
        status: string;
    }>;
    private toPayload;
}
