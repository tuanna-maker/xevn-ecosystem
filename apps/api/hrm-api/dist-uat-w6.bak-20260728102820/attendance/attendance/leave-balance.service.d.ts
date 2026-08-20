import { HrmDbService } from '../db/hrm-db.service';
import { GetLeaveBalanceQueryDto } from './dto/get-leave-balance.query.dto';
export type LeaveBalancePayload = {
    company_id: string;
    employee_id: string;
    leave_type: string;
    balance_year: number;
    year: number;
    period: number;
    entitled_days: number;
    used_days: number;
    pending_days: number;
    remaining_days: number;
    available_days: number;
    as_of: string;
    source: 'employee_leave_balances' | 'custom_fields' | 'default';
};
export declare class LeaveBalanceService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSchema;
    private assertSelfOrHrAccess;
    private loadEmployeeInScope;
    private readCustomFieldsFallback;
    getLeaveBalance(query: GetLeaveBalanceQueryDto, authorization?: string, tenantId?: string): Promise<LeaveBalancePayload>;
}
