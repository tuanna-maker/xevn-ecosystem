import { HrmDbService } from '../db/hrm-db.service';
import type { HrmRealtimeEventEnvelope } from '../realtime/hrm-realtime.service';
export declare class HrmInboxService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSchema;
    persistAttendanceEnvelope(envelope: HrmRealtimeEventEnvelope): Promise<void>;
    listInbox(requestedCompanyId: string, employeeId: string, limit: number, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: {
            id: string;
            company_id: string;
            event_type: string;
            payload: unknown;
            recipient_employee_id: string | null;
            read_at: string | null;
            created_at: string;
        }[];
    }>;
    markRead(notificationId: string, companyId: string, viewerEmployeeId: string): Promise<{
        id: string;
        company_id: string;
        event_type: string;
        read_at: string | null;
    }>;
}
