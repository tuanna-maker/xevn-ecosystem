export declare class CreateAttendanceUpdateRequestDto {
    company_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department?: string;
    position?: string;
    attendance_date: string;
    update_type: string;
    current_check_in?: string;
    current_check_out?: string;
    requested_check_in?: string;
    requested_check_out?: string;
    reason: string;
    evidence_url?: string;
    approver_name?: string;
}
