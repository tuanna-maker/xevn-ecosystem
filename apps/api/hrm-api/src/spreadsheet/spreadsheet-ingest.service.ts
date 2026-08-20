import { HttpStatus, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ApiException } from '../common/api.exception';
import { getSpreadsheetLimits } from './spreadsheet-limits';

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

const XLSX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

/** RFC4180-style CSV line split. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((cell) => cell.trim());
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function uniqueHeaderNames(raw: string[]): string[] {
  const used = new Map<string, number>();
  return raw.map((h) => {
    const base = h.trim() || `column_${used.size + 1}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}__${n}`;
  });
}

function assertSyncBudget(
  startedAt: number,
  limits: ReturnType<typeof getSpreadsheetLimits>,
) {
  if (Date.now() - startedAt > limits.maxSyncMs) {
    throw new ApiException(
      'SHEET-408',
      'Spreadsheet operation exceeded server time limit',
      HttpStatus.REQUEST_TIMEOUT,
      {
        maxSyncMs: limits.maxSyncMs,
      },
    );
  }
}

function isLikelyXlsx(
  buffer: Buffer,
  mimetype?: string,
  filename?: string,
): boolean {
  if (mimetype?.includes('spreadsheetml')) return true;
  if (filename?.toLowerCase().endsWith('.xlsx')) return true;
  return buffer.length >= 4 && buffer.subarray(0, 4).equals(XLSX_MAGIC);
}

function assertCellLen(
  value: string,
  limits: ReturnType<typeof getSpreadsheetLimits>,
  rowIdx: number,
  field: string,
) {
  if (value.length > limits.maxCellChars) {
    throw new ApiException(
      'SHEET-413',
      'Parsed cell exceeds maximum allowed length',
      HttpStatus.PAYLOAD_TOO_LARGE,
      { row: rowIdx, field, maxCellChars: limits.maxCellChars },
    );
  }
}

function cellToScalar(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
    return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object' && v !== null && 'text' in v) {
    return String((v as { text?: string }).text ?? '');
  }
  if (typeof v === 'object' && v !== null && 'result' in v) {
    const r = (v as { result?: unknown }).result;
    return r === null || r === undefined ? '' : String(r);
  }
  return String(v);
}

@Injectable()
export class SpreadsheetIngestService {
  async parseEmployeeImportFile(
    buffer: Buffer,
    opts: { mimetype?: string; originalname?: string; startedAt: number },
  ): Promise<ParsedImportGrid> {
    const limits = getSpreadsheetLimits();
    if (!buffer?.length) {
      throw new ApiException('SHEET-400', 'Empty file', HttpStatus.BAD_REQUEST);
    }
    if (buffer.length > limits.maxUploadBytes) {
      throw new ApiException(
        'SHEET-413',
        'File exceeds upload limit',
        HttpStatus.PAYLOAD_TOO_LARGE,
        {
          maxUploadBytes: limits.maxUploadBytes,
        },
      );
    }

    if (isLikelyXlsx(buffer, opts.mimetype, opts.originalname)) {
      return this.parseEmployeeImportXlsx(buffer, opts.startedAt);
    }
    return this.parseEmployeeImportCsv(buffer, opts.startedAt);
  }

  private parseEmployeeImportCsv(
    buffer: Buffer,
    startedAt: number,
  ): ParsedImportGrid {
    const limits = getSpreadsheetLimits();
    const csvText = buffer.toString('utf8');
    const bytes = Buffer.byteLength(csvText, 'utf8');
    if (bytes > limits.maxUploadBytes) {
      throw new ApiException(
        'SHEET-413',
        'CSV exceeds byte limit',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const normalized = normalizeNewlines(csvText).replace(/^\uFEFF/, '');
    const lines = normalized.split('\n');
    const nonEmpty = lines
      .map((l) => l.replace(/\r$/, '').trim())
      .filter((l) => l.length > 0);

    if (nonEmpty.length < 1) {
      throw new ApiException(
        'SHEET-400',
        'CSV has no header row',
        HttpStatus.BAD_REQUEST,
      );
    }

    const headerCells = splitCsvLine(nonEmpty[0]);
    if (headerCells.length === 0 || headerCells.every((h) => h === '')) {
      throw new ApiException(
        'SHEET-400',
        'CSV header row is empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (headerCells.length > limits.maxColumns) {
      throw new ApiException(
        'SHEET-413',
        'CSV exceeds maximum column count',
        HttpStatus.PAYLOAD_TOO_LARGE,
        {
          maxColumns: limits.maxColumns,
        },
      );
    }

    const headers = uniqueHeaderNames(headerCells);
    const dataLines = nonEmpty.slice(1);
    if (dataLines.length > limits.maxCsvDataRows) {
      throw new ApiException(
        'SHEET-413',
        'CSV exceeds maximum row count',
        HttpStatus.PAYLOAD_TOO_LARGE,
        {
          maxRows: limits.maxCsvDataRows,
        },
      );
    }

    const rows: Record<string, string>[] = [];
    for (let i = 0; i < dataLines.length; i++) {
      if (i % 2000 === 0) assertSyncBudget(startedAt, limits);
      const line = dataLines[i];
      const cells = splitCsvLine(line);
      if (cells.length === 1 && cells[0] === '') continue;
      const row: Record<string, string> = {};
      for (let c = 0; c < headers.length; c++) {
        const v = cells[c] ?? '';
        assertCellLen(v, limits, i + 2, headers[c]);
        row[headers[c]] = v;
      }
      rows.push(row);
    }

    return { headers, rows };
  }

  private async parseEmployeeImportXlsx(
    buffer: Buffer,
    startedAt: number,
  ): Promise<ParsedImportGrid> {
    const limits = getSpreadsheetLimits();
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.load(
        buffer as unknown as Parameters<ExcelJS.Xlsx['load']>[0],
      );
    } catch {
      throw new ApiException(
        'SHEET-400',
        'Could not read Excel workbook',
        HttpStatus.BAD_REQUEST,
      );
    }
    assertSyncBudget(startedAt, limits);
    const ws = wb.worksheets[0];
    if (!ws) {
      throw new ApiException(
        'SHEET-400',
        'Workbook has no sheets',
        HttpStatus.BAD_REQUEST,
      );
    }

    const rowArrays: string[][] = [];
    let rowIndex = 0;
    ws.eachRow({ includeEmpty: false }, (row) => {
      if (rowIndex % 1000 === 0) assertSyncBudget(startedAt, limits);
      rowIndex += 1;
      const maxCol = Math.min(row.cellCount, limits.maxColumns);
      const cells: string[] = [];
      for (let c = 1; c <= maxCol; c++) {
        const cell = row.getCell(c);
        const s = cellToScalar(cell);
        assertCellLen(s, limits, rowIndex + 1, `col_${c}`);
        cells.push(s);
      }
      rowArrays.push(cells);
    });

    if (rowArrays.length < 1) {
      throw new ApiException(
        'SHEET-400',
        'XLSX has no rows',
        HttpStatus.BAD_REQUEST,
      );
    }

    const headerCells = rowArrays[0];
    const headers = uniqueHeaderNames(headerCells);
    const dataRowArrays = rowArrays.slice(1);
    if (dataRowArrays.length > limits.maxXlsxDataRows) {
      throw new ApiException(
        'SHEET-413',
        'XLSX exceeds maximum row count',
        HttpStatus.PAYLOAD_TOO_LARGE,
        {
          maxRows: limits.maxXlsxDataRows,
        },
      );
    }

    const objects: Record<string, string>[] = [];
    for (let i = 0; i < dataRowArrays.length; i++) {
      if (i % 1000 === 0) assertSyncBudget(startedAt, limits);
      const cells = dataRowArrays[i];
      if (cells.every((c) => !c.trim())) continue;
      const row: Record<string, string> = {};
      for (let c = 0; c < headers.length; c++) {
        row[headers[c]] = cells[c] ?? '';
      }
      objects.push(row);
    }

    return { headers, rows: objects };
  }
}
