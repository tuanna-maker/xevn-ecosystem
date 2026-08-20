export declare const SPREADSHEET_KINDS: {
    readonly employee_import: "employee_import";
    readonly employee_export: "employee_export";
};
export type SpreadsheetKind = (typeof SPREADSHEET_KINDS)[keyof typeof SPREADSHEET_KINDS];
export declare function assertKnownKind(kind: string | undefined): SpreadsheetKind;
export declare function assertImportKind(kind: string | undefined): Exclude<SpreadsheetKind, 'employee_export'>;
export declare function assertTemplateKind(kind: string | undefined): typeof SPREADSHEET_KINDS.employee_import;
export declare const EMPLOYEE_IMPORT_TEMPLATE_HEADERS: readonly ["employee_code", "email", "full_name", "job_title_key", "hired_at"];
