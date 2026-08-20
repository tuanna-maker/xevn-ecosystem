export declare class CreateAdvanceRequestDto {
    company_id: string;
    name: string;
    salary_period: string;
    department?: string;
    position?: string;
    approval_steps?: Record<string, unknown>[];
}
