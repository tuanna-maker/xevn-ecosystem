export declare class CreateEmployeeDto {
    company_id: string;
    employee_code: string;
    email: string;
    full_name: string;
    job_title_key?: string;
    hired_at?: string;
    custom_fields?: Record<string, string>;
    avatar_url?: string | null;
}
