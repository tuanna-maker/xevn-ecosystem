import { AttendanceRequestsService } from './attendance-requests.service';
import { LeaveRequestsService } from './leave-requests.service';
import type { AttendanceOverviewQueryDto } from './dto/attendance-overview.query.dto';
export type AttendanceOverviewPayload = {
    stats: {
        lateEarlyToday: number;
        lateEarlyChange: number;
        actualLeaveThisWeek: number;
        actualLeaveChange: number;
        plannedLeaveNextWeek: number;
        plannedLeaveChange: number;
    };
    monthlyLeaveData: Array<{
        month: string;
        value: number;
    }>;
    departmentLeaveData: Array<{
        name: string;
        value: number;
    }>;
    leaveTypeData: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    lateEarlyList: Array<{
        name: string;
        dept: string;
        count: number;
    }>;
};
export declare class AttendanceOverviewService {
    private readonly leaveRequests;
    private readonly attendanceRequests;
    constructor(leaveRequests: LeaveRequestsService, attendanceRequests: AttendanceRequestsService);
    getOverview(query: AttendanceOverviewQueryDto, authorization?: string, tenantId?: string): Promise<AttendanceOverviewPayload>;
}
