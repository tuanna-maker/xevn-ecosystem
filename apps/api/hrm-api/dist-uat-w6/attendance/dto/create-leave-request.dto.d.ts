export declare class CreateLeaveRequestDto {
    company_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department?: string;
    position?: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason?: string;
    handover_to?: string;
    handover_tasks?: string;
    attachment_url?: string;
}
