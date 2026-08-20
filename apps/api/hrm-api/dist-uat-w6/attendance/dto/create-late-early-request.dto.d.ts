export declare class CreateLateEarlyRequestDto {
    company_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department?: string;
    position?: string;
    request_date: string;
    request_type: string;
    late_time?: string;
    late_minutes?: number;
    early_time?: string;
    early_minutes?: number;
    reason: string;
    approver_name?: string;
}
