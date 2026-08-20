export declare class SubmitEmployeeMetadataChangeDto {
    company_id: string;
    employee_id: string;
    legal_entity_id?: string;
    field_key: string;
    current_value?: string;
    requested_value: string;
    reason?: string;
    actor_user_id?: string;
    actor_name?: string;
    workflow_code?: string;
    source_catalog_key?: string;
}
