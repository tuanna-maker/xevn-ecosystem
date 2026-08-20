import type { EmployeeSummaryCompanyRow, EmployeeSummarySalaryRange } from './employee-summary.types';
export declare const EMPLOYEE_SALARY_NUM_SQL = "\n  CASE\n    WHEN NULLIF(TRIM(custom_fields->>'salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'\n      THEN (NULLIF(TRIM(custom_fields->>'salary'), ''))::numeric\n    WHEN NULLIF(TRIM(custom_fields->>'base_salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'\n      THEN (NULLIF(TRIM(custom_fields->>'base_salary'), ''))::numeric\n    ELSE NULL\n  END\n";
export declare const EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS: Array<{
    key: string;
    min: number;
    max: number | null;
}>;
export type EmployeeSummaryByCompanyRawRow = {
    company_id: string;
    total: string | number;
    active_count: string | number;
    inactive_count: string | number;
    archived_count: string | number;
};
export declare function buildSalaryRangesFromCounts(row: Record<string, string | number>): EmployeeSummarySalaryRange[];
export declare function buildEmployeeSummaryByCompany(rawRows: EmployeeSummaryByCompanyRawRow[], scopeCompanyIds: string[]): EmployeeSummaryCompanyRow[];
