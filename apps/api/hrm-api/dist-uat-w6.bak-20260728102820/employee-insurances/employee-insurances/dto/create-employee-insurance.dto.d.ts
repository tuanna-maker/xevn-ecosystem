export declare class CreateEmployeeInsuranceDto {
    company_id: string;
    employee_id: string;
    type?: string;
    provider: string;
    policy_number?: string;
    start_date?: string;
    end_date?: string;
    contribution?: number;
    employer_contribution?: number;
    status?: string;
    notes?: string;
}
