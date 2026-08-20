export declare class CreateBusinessTripRequestDto {
    company_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department?: string;
    position?: string;
    destination: string;
    start_date: string;
    end_date: string;
    total_days: number;
    purpose: string;
    transportation?: string;
    accommodation?: string;
    estimated_cost?: number;
    advance_amount?: number;
    companions?: string;
    contact_info?: string;
    approver_name?: string;
}
