import { StreamableFile } from '@nestjs/common';
import { ImportMultipartMetaDto } from './dto/import-multipart-meta.dto';
import { SpreadsheetExportBodyDto } from './dto/spreadsheet-export-body.dto';
import { SpreadsheetService } from './spreadsheet.service';
export declare class SpreadsheetController {
    private readonly spreadsheetService;
    constructor(spreadsheetService: SpreadsheetService);
    private assertSpreadsheetAccess;
    limits(authorization?: string, internalApiKey?: string): import("../common/api-response").ApiSuccess<{
        maxUploadBytes: number;
        maxCsvDataRows: number;
        maxXlsxDataRows: number;
        maxCellChars: number;
        maxSyncMs: number;
        maxColumns: number;
        maxPreviewRows: number;
    }>;
    downloadTemplate(kind: string, formatRaw: string | undefined, authorization?: string, internalApiKey?: string): Promise<StreamableFile>;
    importPreview(file: Express.Multer.File | undefined, body: ImportMultipartMetaDto, tenantId?: string, companyId?: string, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<import("./spreadsheet.service").ImportPreviewResult>>;
    importCommit(file: Express.Multer.File | undefined, body: ImportMultipartMetaDto, tenantId?: string, companyId?: string, authorization?: string, internalApiKey?: string, _idempotencyKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        importedCount: number;
        ids: string[];
        errors: import("./spreadsheet-ingest.service").SheetRowError[];
    }>>;
    exportSheet(body: SpreadsheetExportBodyDto, tenantId?: string, headerCompanyId?: string, authorization?: string, internalApiKey?: string): Promise<StreamableFile>;
}
