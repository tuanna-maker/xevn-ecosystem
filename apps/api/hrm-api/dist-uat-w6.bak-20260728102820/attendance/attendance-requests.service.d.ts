import { HrmDbService } from '../db/hrm-db.service';
import { CreateBusinessTripRequestDto } from './dto/create-business-trip-request.dto';
import { CreateLateEarlyRequestDto } from './dto/create-late-early-request.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
import { CreateShiftChangeRequestDto } from './dto/create-shift-change-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListAttendanceRequestsQueryDto } from './dto/list-attendance-requests.query.dto';
export declare class AttendanceRequestsService {
    private readonly db;
    constructor(db: HrmDbService);
    ensureSchema(): Promise<void>;
    private buildListSql;
    private loadCompanyId;
    private decideRequest;
    private deleteRequest;
    listOvertimeRequests(query: ListAttendanceRequestsQueryDto, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createOvertimeRequest(body: CreateOvertimeRequestDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    approveOvertimeRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    rejectOvertimeRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    deleteOvertimeRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listBusinessTripRequests(query: ListAttendanceRequestsQueryDto, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createBusinessTripRequest(body: CreateBusinessTripRequestDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    approveBusinessTripRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    rejectBusinessTripRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    deleteBusinessTripRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listLateEarlyRequests(query: ListAttendanceRequestsQueryDto, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createLateEarlyRequest(body: CreateLateEarlyRequestDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    approveLateEarlyRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    rejectLateEarlyRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    deleteLateEarlyRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listShiftChangeRequests(query: ListAttendanceRequestsQueryDto, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createShiftChangeRequest(body: CreateShiftChangeRequestDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    approveShiftChangeRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    rejectShiftChangeRequest(requestId: string, body: DecideLeaveRequestDto, companyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    deleteShiftChangeRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
