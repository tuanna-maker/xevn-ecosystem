import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { LeaveWorkflowBridge } from './leave-workflow.bridge';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListLeaveRequestsQueryDto } from './dto/list-leave-requests.query.dto';
type LeaveRow = {
    id: string;
    company_id: string;
    employee_id: string;
    employee_code: string | null;
    employee_name: string | null;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: string;
    requested_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    department: string | null;
    position: string | null;
    total_days: string;
    handover_to: string | null;
    handover_tasks: string | null;
    approver_employee_id: string | null;
    rejected_reason: string | null;
    attachment_url: string | null;
};
export declare const HRM_LEAVE_VAL_OVERLAP = "HRM-LEAVE-VAL-OVERLAP";
export declare const HRM_LEAVE_VAL_BALANCE = "HRM-LEAVE-VAL-BALANCE";
export declare class LeaveRequestsService {
    private readonly db;
    private readonly fanout;
    private readonly leaveWorkflowBridge;
    private readonly settingsCatalogs?;
    constructor(db: HrmDbService, fanout: AttendanceEventFanoutService, leaveWorkflowBridge: LeaveWorkflowBridge, settingsCatalogs?: SettingsCatalogsService | undefined);
    private ensureSchema;
    private toPayload;
    private ensureLeaveBalanceSchema;
    private assertNoLeaveOverlap;
    private assertSufficientLeaveBalance;
    createLeaveRequest(body: CreateLeaveRequestDto, authorization?: string, options?: {
        submitterUserId?: string;
        tenantId?: string;
        companySlug?: string;
    }): Promise<LeaveRow>;
    approveLeaveRequestInternal(requestId: string, body: DecideLeaveRequestDto): Promise<LeaveRow>;
    rejectLeaveRequestInternal(requestId: string, body: DecideLeaveRequestDto): Promise<LeaveRow>;
    listLeaveRequests(query: ListLeaveRequestsQueryDto, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: LeaveRow[];
    }>;
    private loadLeaveRequestCompany;
    approveLeaveRequest(requestId: string, body: DecideLeaveRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<LeaveRow>;
    rejectLeaveRequest(requestId: string, body: DecideLeaveRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<LeaveRow>;
}
export {};
