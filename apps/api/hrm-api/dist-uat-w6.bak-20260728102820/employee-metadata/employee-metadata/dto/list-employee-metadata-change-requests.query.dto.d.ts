export declare class ListEmployeeMetadataChangeRequestsQueryDto {
    company_id: string;
    tenant_id?: string;
    employee_id?: string;
    legal_entity_id?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    field_key?: string;
    page?: number;
    page_size?: number;
}
