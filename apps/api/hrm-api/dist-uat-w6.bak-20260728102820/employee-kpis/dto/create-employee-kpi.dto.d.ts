export declare class CreateEmployeeKpiDto {
    company_id: string;
    employee_id: string;
    kpi_name: string;
    kpi_type?: string;
    target_value?: number;
    actual_value?: number;
    unit?: string;
    weight?: number;
    period_start?: string;
    period_end?: string;
    status?: string;
    notes?: string;
}
