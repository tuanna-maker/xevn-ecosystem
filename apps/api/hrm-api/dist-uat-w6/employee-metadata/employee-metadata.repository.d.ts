import { HrmDbService } from '../db/hrm-db.service';
export type EmployeeMetadataChangeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type EmployeeMetadataValueRecord = {
    id: string;
    company_id: string;
    employee_id: string;
    legal_entity_id: string | null;
    field_key: string;
    field_value: unknown;
    source_catalog_key: string | null;
    workflow_code: string | null;
    updated_by: string | null;
    updated_at: string;
};
export type EmployeeMetadataChangeRequestRecord = {
    id: string;
    company_id: string;
    employee_id: string;
    legal_entity_id: string | null;
    field_key: string;
    current_value: unknown;
    requested_value: unknown;
    reason: string | null;
    actor_user_id: string | null;
    actor_name: string | null;
    workflow_code: string | null;
    source_catalog_key: string | null;
    status: EmployeeMetadataChangeStatus;
    decided_by: string | null;
    decided_note: string | null;
    decided_at: string | null;
    submitted_at: string;
    updated_at: string;
};
export type EmployeeMetadataAuditLogRecord = {
    id: string;
    change_request_id: string | null;
    company_id: string;
    employee_id: string;
    field_key: string;
    action: string;
    actor_user_id: string | null;
    actor_name: string | null;
    payload: unknown;
    created_at: string;
};
type ListFilters = {
    employee_id?: string;
    legal_entity_id?: string;
    status?: EmployeeMetadataChangeStatus;
    field_key?: string;
    page: number;
    page_size: number;
};
type SubmitChangeInput = {
    company_id: string;
    employee_id: string;
    legal_entity_id?: string;
    field_key: string;
    current_value: unknown;
    requested_value: unknown;
    reason?: string;
    actor_user_id?: string;
    actor_name?: string;
    workflow_code?: string;
    source_catalog_key?: string;
};
type DecisionInput = {
    actor_user_id?: string;
    actor_name?: string;
    note?: string;
};
export declare class EmployeeMetadataRepository {
    private readonly db;
    constructor(db: HrmDbService);
    ensureSchema(): Promise<void>;
    submitChange(input: SubmitChangeInput): Promise<EmployeeMetadataChangeRequestRecord>;
    listChangeRequests(filters: ListFilters, authorization: string | undefined, requestedCompanyId: string): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: EmployeeMetadataChangeRequestRecord[];
    }>;
    getChangeRequestById(changeRequestId: string): Promise<EmployeeMetadataChangeRequestRecord>;
    upsertMetadataValue(request: EmployeeMetadataChangeRequestRecord, decision: DecisionInput): Promise<EmployeeMetadataValueRecord>;
    approveChangeRequest(changeRequestId: string, decision: DecisionInput): Promise<EmployeeMetadataChangeRequestRecord | null>;
    rejectChangeRequest(changeRequestId: string, decision: DecisionInput): Promise<EmployeeMetadataChangeRequestRecord | null>;
    listAuditLogs(requestedCompanyId: string, employeeId?: string, authorization?: string): Promise<EmployeeMetadataAuditLogRecord[]>;
    private insertAuditLog;
}
export {};
