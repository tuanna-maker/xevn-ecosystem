export declare class CreateJobPostingDto {
    company_id: string;
    title: string;
    department?: string;
    position: string;
    employment_type?: string;
    work_location?: string;
    salary_min?: number;
    salary_max?: number;
    is_salary_visible?: boolean;
    description?: string;
    requirements?: string;
    benefits?: string;
    headcount?: number;
    deadline?: string;
    priority?: string;
    status?: string;
}
