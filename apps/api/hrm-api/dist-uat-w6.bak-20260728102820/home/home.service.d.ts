import { AttendanceService } from '../attendance/attendance.service';
import { HrmDbService } from '../db/hrm-db.service';
import type { GetHomeSummaryQueryDto } from './dto/get-home-summary.query.dto';
import type { HomeSummaryData } from './home-summary.types';
export declare class HomeService {
    private readonly db;
    private readonly attendance;
    constructor(db: HrmDbService, attendance: AttendanceService);
    getSummary(query: GetHomeSummaryQueryDto, authorization?: string, tenantId?: string): Promise<HomeSummaryData>;
    private loadViewer;
    private isBirthdayToday;
    private buildCelebrations;
    private buildWhosOut;
    private queryScopedInbox;
    private queryScopedLeaveRequests;
    private buildTasks;
    private buildManagerPending;
    private buildAttendanceToday;
}
