import { EmployeesService } from '../employees/employees.service';
import { ListEmployeesQueryDto } from '../employees/dto/list-employees.query.dto';
import { SpreadsheetIngestService } from './spreadsheet-ingest.service';
import { SpreadsheetTemplateService } from './spreadsheet-template.service';
export type ImportPreviewResult = {
    kind: 'employee_import';
    headersDetected: string[];
    canonicalHeaders: readonly string[];
    rowCount: number;
    previewRows: Record<string, string>[];
    truncated: boolean;
    errors: import('./spreadsheet-ingest.service').SheetRowError[];
    dryRun: boolean;
};
export declare class SpreadsheetService {
    private readonly ingest;
    private readonly templates;
    private readonly employees;
    constructor(ingest: SpreadsheetIngestService, templates: SpreadsheetTemplateService, employees: EmployeesService);
    getLimitsSnapshot(): {
        maxUploadBytes: number;
        maxCsvDataRows: number;
        maxXlsxDataRows: number;
        maxCellChars: number;
        maxSyncMs: number;
        maxColumns: number;
        maxPreviewRows: number;
    };
    previewEmployeeImport(buffer: Buffer, opts: {
        mimetype?: string;
        originalname?: string;
        dryRun: boolean;
    }): Promise<ImportPreviewResult>;
    commitEmployeeImport(buffer: Buffer, opts: {
        mimetype?: string;
        originalname?: string;
        companyId: string;
        authorization?: string;
        tenantId?: string;
    }): Promise<{
        importedCount: number;
        ids: string[];
        errors: import('./spreadsheet-ingest.service').SheetRowError[];
    }>;
    exportEmployeesCsv(query: ListEmployeesQueryDto): Promise<{
        filename: string;
        body: string;
    }>;
    employeeImportCsvTemplate(): string;
    employeeImportXlsxTemplate(): Promise<Buffer>;
}
