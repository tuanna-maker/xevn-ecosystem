import type { SheetRowError } from './spreadsheet-ingest.service';
export declare function canonicalEmployeeFieldsFromRow(row: Record<string, string>): {
    employee_code: string;
    email: string;
    full_name: string;
    job_title_key: string;
    hired_at: string;
};
export declare function validateEmployeeImportRow(row: Record<string, string>, dataRowIndex1Based: number): SheetRowError[];
export declare function listCanonicalEmployeeHeaders(): readonly string[];
