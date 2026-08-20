export type SheetRowError = {
    row: number;
    field?: string;
    code: string;
    message?: string;
};
export type ParsedImportGrid = {
    headers: string[];
    rows: Record<string, string>[];
};
export declare function splitCsvLine(line: string): string[];
export declare class SpreadsheetIngestService {
    parseEmployeeImportFile(buffer: Buffer, opts: {
        mimetype?: string;
        originalname?: string;
        startedAt: number;
    }): Promise<ParsedImportGrid>;
    private parseEmployeeImportCsv;
    private parseEmployeeImportXlsx;
}
