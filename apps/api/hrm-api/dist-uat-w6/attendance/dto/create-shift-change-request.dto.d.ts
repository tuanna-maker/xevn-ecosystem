export declare class CreateShiftChangeRequestDto {
    company_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department?: string;
    position?: string;
    change_date: string;
    change_type: string;
    current_shift: string;
    current_shift_time?: string;
    requested_shift: string;
    requested_shift_time?: string;
    swap_with_employee_id?: string;
    swap_with_employee_name?: string;
    swap_with_employee_code?: string;
    reason: string;
    approver_name?: string;
}
