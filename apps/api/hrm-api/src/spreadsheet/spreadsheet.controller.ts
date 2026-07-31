/**
 * @CODE-MEMORY
 * Screen:     HRM → Import nhân sự (spreadsheet) — HCNS
 * UC:         HRM-IM-01 · HRM-IM-02 · HRM-IM-03 · leftover IM-04 template
 * BR:         BR-IM-NON-PERSIST-PREVIEW · U65 zero-seed
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.32 · FR-HRM-IM-01
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 row 32 · code SHEET-200 (ref_srs: FR-HRM-IM-01)
 * Purpose:    HTTP spreadsheet — preview import NV không ghi DB; commit/export/template hỗ trợ.
 * WorkItem:   BE-HRM-OA-IMPORT-FLEET-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - Nest route POST /api/hrm/spreadsheet/import/preview|commit · GET limits/templates · POST export
 *
 * Callees:
 *   - resolveScopeContext → SpreadsheetService.previewEmployeeImport / commitEmployeeImport
 *   - assertImportUploadMime · FileInterceptor('file')
 *
 * FE-Actions:
 *   | Thao tác        | Handler       | Lib / RPC                          |
 *   |-----------------|---------------|------------------------------------|
 *   | Xem trước import| importPreview | previewEmployeeImport → SHEET-200  |
 *   | Xác nhận import | importCommit  | commitEmployeeImport → SHEET-201   |
 *
 * BE-Chain:
 *   importPreview → parse + validate in-memory → **no** employees INSERT (IM-01)
 *   importCommit → createEmployee (IM-02 — out of OpenAPI deepen claim)
 *
 * Impact:     Preview ghi DB → phá SRS #7; thiếu multipart file → mất AC #2/#3
 * must_keep:  IM-01 non-persist · field name `file` · kind employee_import · U65
 * SOLID:      Controller transport; domain ở SpreadsheetService
 * LastVerified: spreadsheet.controller.spec.ts (HTTP 200 meta + SHEET-200) · verify-openapi-hrm-p1-s3b
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-OA-IMPORT-FLEET-01
 * change_mode: ADD
 * What: Gắn CODE-MEMORY + OpenAPI F.1 multipart/schema cho POST …/import/preview (G-IM-OPENAPI-01)
 * Why: SA residual OpenAPI deepen — không invent staging; contract khớp API_DESIGN_HRM_IMPORT_PREVIEW
 * SRS: §3.32 · FR-HRM-IM-01 Diễn biến #1–#8
 * TechSpec: §16.2 · SHEET-200 (ref_srs: FR-HRM-IM-01)
 * must_keep: preview zero INSERT · không claim IM-02 commit DONE
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-IM-PREVIEW-HTTP-ALIGN-01
 * change_mode: FIX
 * What: `@HttpCode(HttpStatus.OK)` trên importPreview — Nest POST mặc định 201 lệch OpenAPI/API_DESIGN HTTP 200
 * Why: QA residual HTTP 201 vs `'200'` + envelope SHEET-200; SoT = API_DESIGN §A + SRS team Network 200
 * SRS: §3.32 · AC-IM-01-SCOPE-01 · team residual «Network POST → 200 SHEET-200»
 * TechSpec: §16.2 · SHEET-200 (ref_srs: FR-HRM-IM-01)
 * must_keep: IM-01 non-persist · không đổi commit IM-02 · không invent staging · U65
 */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { ImportMultipartMetaDto } from './dto/import-multipart-meta.dto';
import { SpreadsheetExportBodyDto } from './dto/spreadsheet-export-body.dto';
import { assertImportKind, assertTemplateKind } from './spreadsheet-kinds';
import { getSpreadsheetLimits } from './spreadsheet-limits';
import { assertImportUploadMime } from './spreadsheet-import-mime';
import { SpreadsheetService } from './spreadsheet.service';

const MULTIPART_FILE_MAX = () => getSpreadsheetLimits().maxUploadBytes;

@Controller('spreadsheet')
export class SpreadsheetController {
  constructor(private readonly spreadsheetService: SpreadsheetService) {}

  private assertSpreadsheetAccess(authorization?: string, internalKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized spreadsheet access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('limits')
  limits(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSpreadsheetAccess(authorization, internalApiKey);
    return ok(this.spreadsheetService.getLimitsSnapshot(), 'SHEET-200', 'Spreadsheet limits');
  }

  @Get('templates/:kind')
  async downloadTemplate(
    @Param('kind') kind: string,
    @Query('format') formatRaw: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ): Promise<StreamableFile> {
    this.assertSpreadsheetAccess(authorization, internalApiKey);
    assertTemplateKind(kind);
    const format = (formatRaw ?? 'csv').toLowerCase();
    if (format !== 'csv' && format !== 'xlsx') {
      throw new ApiException('SHEET-400', 'Invalid format; use csv or xlsx', HttpStatus.BAD_REQUEST, { format });
    }
    if (format === 'xlsx') {
      const buf = await this.spreadsheetService.employeeImportXlsxTemplate();
      return new StreamableFile(buf, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: 'attachment; filename="employee_import_template.xlsx"',
      });
    }
    const csv = this.spreadsheetService.employeeImportCsvTemplate();
    return new StreamableFile(Buffer.from(csv, 'utf8'), {
      type: 'text/csv; charset=utf-8',
      disposition: 'attachment; filename="employee_import_template.csv"',
    });
  }

  @Post('import/preview')
  @HttpCode(HttpStatus.OK) // SoT: API_DESIGN §A + OpenAPI '200' + SHEET-200 (Nest POST default 201)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: getSpreadsheetLimits().maxUploadBytes },
    }),
  )
  async importPreview(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: ImportMultipartMetaDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSpreadsheetAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    assertImportKind(body.kind);
    if (!file?.buffer?.length) {
      throw new ApiException('SHEET-400', 'Multipart file field "file" is required', HttpStatus.BAD_REQUEST);
    }
    assertImportUploadMime(file.mimetype, file.originalname);
    const dryRun = body.dryRun === undefined || body.dryRun === 'true';
    const data = await this.spreadsheetService.previewEmployeeImport(file.buffer, {
      mimetype: file.mimetype,
      originalname: file.originalname,
      dryRun,
    });
    return ok(data, 'SHEET-200', 'Import preview');
  }

  @Post('import/commit')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: getSpreadsheetLimits().maxUploadBytes },
    }),
  )
  async importCommit(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: ImportMultipartMetaDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('idempotency-key') _idempotencyKey?: string,
  ) {
    this.assertSpreadsheetAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    assertImportKind(body.kind);
    if (!file?.buffer?.length) {
      throw new ApiException('SHEET-400', 'Multipart file field "file" is required', HttpStatus.BAD_REQUEST);
    }
    assertImportUploadMime(file.mimetype, file.originalname);
    const result = await this.spreadsheetService.commitEmployeeImport(file.buffer, {
      mimetype: file.mimetype,
      originalname: file.originalname,
      companyId: scope.companyId,
      authorization,
      tenantId: scope.tenantId,
    });
    return ok(result, 'SHEET-201', 'Import committed');
  }

  @Post('export')
  async exportSheet(
    @Body() body: SpreadsheetExportBodyDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ): Promise<StreamableFile> {
    this.assertSpreadsheetAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.filter.company_id ?? headerCompanyId,
    });
    const { filename, body: csv } = await this.spreadsheetService.exportEmployeesCsv(body.filter);
    return new StreamableFile(Buffer.from(csv, 'utf8'), {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
