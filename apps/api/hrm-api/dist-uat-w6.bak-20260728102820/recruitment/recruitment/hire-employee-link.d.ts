import type { QueryResult, QueryResultRow } from 'pg';
export declare const HRM_REC_HIRE_400 = "HRM-REC-HIRE-400";
export declare const HRM_REC_HIRE_409 = "HRM-REC-HIRE-409";
export type HireLinkDb = {
    query: <T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]) => Promise<QueryResult<T>>;
};
export declare function isHiredStage(stage: string | null | undefined): boolean;
export declare function resolveHireEmployeeId(db: HireLinkDb, candidateId: string, opts: {
    existingEmployeeId?: string | null;
    explicitEmployeeId?: string | null;
}): Promise<string | null>;
export declare function assertEmployeeInCandidateCompany(db: HireLinkDb, employeeId: string, candidateCompanyId: string): Promise<string>;
export declare function assertHireEmployeeLinkOrThrow(db: HireLinkDb, candidateId: string, candidateCompanyId: string, opts: {
    existingEmployeeId?: string | null;
    explicitEmployeeId?: string | null;
}): Promise<string>;
