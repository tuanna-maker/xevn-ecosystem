import {
  Body,
  Controller,
  Get,
  Headers,
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
