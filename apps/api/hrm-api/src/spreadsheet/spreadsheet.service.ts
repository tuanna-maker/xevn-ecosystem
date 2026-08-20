import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { EmployeesService } from '../employees/employees.service';
import { CreateEmployeeDto } from '../employees/dto/create-employee.dto';
import { ListEmployeesQueryDto } from '../employees/dto/list-employees.query.dto';
import { getSpreadsheetLimits } from './spreadsheet-limits';
import { SpreadsheetIngestService } from './spreadsheet-ingest.service';
import { SpreadsheetTemplateService } from './spreadsheet-template.service';
import {
  canonicalEmployeeFieldsFromRow,
  listCanonicalEmployeeHeaders,
  validateEmployeeImportRow,
} from './spreadsheet-employee-validation';

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

@Injectable()
export class SpreadsheetService {
  constructor(
    private readonly ingest: SpreadsheetIngestService,
    private readonly templates: SpreadsheetTemplateService,
    private readonly employees: EmployeesService,
  ) {}

  getLimitsSnapshot() {
    return getSpreadsheetLimits();
  }

  async previewEmployeeImport(
    buffer: Buffer,
    opts: { mimetype?: string; originalname?: string; dryRun: boolean },
  ): Promise<ImportPreviewResult> {
    const startedAt = Date.now();
    const grid = await this.ingest.parseEmployeeImportFile(buffer, {
      ...opts,
      startedAt,
    });
    const limits = getSpreadsheetLimits();
    const errors: import('./spreadsheet-ingest.service').SheetRowError[] = [];
    for (let i = 0; i < grid.rows.length; i++) {
      errors.push(...validateEmployeeImportRow(grid.rows[i], i + 1));
    }
    const truncated = grid.rows.length > limits.maxPreviewRows;
    const previewRows = grid.rows.slice(0, limits.maxPreviewRows).map((r) => {
      const c = canonicalEmployeeFieldsFromRow(r);
      return {
        employee_code: c.employee_code,
        email: c.email,
        full_name: c.full_name,
        job_title_key: c.job_title_key,
        hired_at: c.hired_at,
      };
    });
    return {
      kind: 'employee_import',
      headersDetected: grid.headers,
      canonicalHeaders: listCanonicalEmployeeHeaders(),
      rowCount: grid.rows.length,
      previewRows,
      truncated,
      errors,
      dryRun: opts.dryRun,
    };
  }

  async commitEmployeeImport(
    buffer: Buffer,
    opts: {
      mimetype?: string;
      originalname?: string;
      companyId: string;
      authorization?: string;
      tenantId?: string;
    },
  ): Promise<{
    importedCount: number;
    ids: string[];
    errors: import('./spreadsheet-ingest.service').SheetRowError[];
  }> {
    const startedAt = Date.now();
    const grid = await this.ingest.parseEmployeeImportFile(buffer, {
      ...opts,
      startedAt,
    });
    const validationErrors: import('./spreadsheet-ingest.service').SheetRowError[] =
      [];
    for (let i = 0; i < grid.rows.length; i++) {
      validationErrors.push(...validateEmployeeImportRow(grid.rows[i], i + 1));
    }
    if (validationErrors.length > 0) {
      throw new ApiException(
        'SHEET-422',
        'Import validation failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          rowErrors: validationErrors,
        },
      );
    }
    const ids: string[] = [];
    const errors: import('./spreadsheet-ingest.service').SheetRowError[] = [];
    for (let i = 0; i < grid.rows.length; i++) {
      const c = canonicalEmployeeFieldsFromRow(grid.rows[i]);
      const dto: CreateEmployeeDto = {
        company_id: opts.companyId,
        employee_code: c.employee_code,
        email: c.email,
        full_name: c.full_name,
        job_title_key: c.job_title_key || undefined,
        hired_at: c.hired_at || undefined,
      };
      try {
        const created = await this.employees.createEmployee(
          dto,
          opts.authorization,
          {
            tenantId: opts.tenantId,
          },
        );
        ids.push(created.id);
      } catch (e) {
        const msg = e instanceof ApiException ? e.message : 'Create failed';
        errors.push({ row: i + 1, code: 'SHEET-422', message: msg });
      }
    }
    if (errors.length > 0) {
      throw new ApiException(
        'SHEET-422',
        'Import commit partially failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          rowErrors: errors,
          importedCount: ids.length,
          importedIds: ids,
        },
      );
    }
    return { importedCount: ids.length, ids, errors: [] };
  }

  async exportEmployeesCsv(
    query: ListEmployeesQueryDto,
  ): Promise<{ filename: string; body: string }> {
    const list = await this.employees.listEmployees({
      ...query,
      page: 1,
      page_size: 100,
    });
    const headers = [
      'employee_code',
      'email',
      'full_name',
      'job_title_key',
      'status',
      'hired_at',
    ];
    const lines = [headers.join(',')];
    for (const e of list.data) {
      const cells = [
        escapeCsv(e.employee_code),
        escapeCsv(e.email),
        escapeCsv(e.full_name),
        escapeCsv(e.job_title_key ?? ''),
        escapeCsv(e.status),
        escapeCsv(e.hired_at ?? ''),
      ];
      lines.push(cells.join(','));
    }
    return { filename: 'employees_export.csv', body: lines.join('\n') + '\n' };
  }

  employeeImportCsvTemplate(): string {
    return this.templates.employeeImportCsv();
  }

  async employeeImportXlsxTemplate(): Promise<Buffer> {
    return this.templates.employeeImportXlsx();
  }
}

function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
