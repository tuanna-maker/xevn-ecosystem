export type EmployeeSummaryDepartmentRow = {
    department: string;
    count: number;
    avg_salary: number | null;
};
export type EmployeeSummaryCompanyRow = {
    company_id: string;
    total: number;
    active_count: number;
    inactive_count: number;
    archived_count: number;
};
export type EmployeeSummarySalaryRange = {
    key: string;
    min: number;
    max: number | null;
    count: number;
};
export type EmployeeSummaryRecentHire = {
    id: string;
    employee_code: string;
    full_name: string;
    status: string;
    hired_at: string | null;
    avatar_url: string | null;
};
export type EmployeeSummaryResult = {
    company_id: string;
    total: number;
    active_count: number;
    inactive_count: number;
    archived_count: number;
    payroll: {
        total: number;
        employees_with_salary: number;
    };
    by_department: EmployeeSummaryDepartmentRow[];
    by_company: EmployeeSummaryCompanyRow[];
    salary_ranges: EmployeeSummarySalaryRange[];
    new_hires: {
        last_30_days: number;
        recent: EmployeeSummaryRecentHire[];
    };
};
