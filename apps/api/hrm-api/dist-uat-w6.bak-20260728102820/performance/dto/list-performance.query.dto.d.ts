export declare class ListPerformanceCyclesQueryDto {
    company_id: string;
    status?: 'draft' | 'active' | 'closed';
}
export declare class ListPerformanceEvaluationsQueryDto {
    company_id: string;
    employee_id?: string;
    cycle_id?: string;
}
