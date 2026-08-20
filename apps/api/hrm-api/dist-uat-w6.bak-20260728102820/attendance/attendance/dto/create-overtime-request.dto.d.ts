export declare class CreateOvertimeRequestDto {
    company_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department?: string;
    position?: string;
    overtime_date: string;
    start_time: string;
    end_time: string;
    total_hours: number;
    overtime_type: string;
    coefficient?: number;
    reason: string;
    compensation_type?: string;
    approver_name?: string;
}
