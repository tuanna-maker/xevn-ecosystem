import ExcelJS from 'exceljs';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { getSpreadsheetLimits } from './spreadsheet-limits';
import {
  SpreadsheetIngestService,
  splitCsvLine,
} from './spreadsheet-ingest.service';

describe('splitCsvLine', () => {
  it('splits simple cells', () => {
    expect(splitCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('handles quoted commas', () => {
    expect(splitCsvLine('"a,b",c')).toEqual(['a,b', 'c']);
  });

  it('handles escaped quotes', () => {
    expect(splitCsvLine('"say ""hi""",x')).toEqual(['say "hi"', 'x']);
  });
});

describe('SpreadsheetIngestService', () => {
  let svc: SpreadsheetIngestService;

  beforeEach(() => {
    delete process.env.SPREADSHEET_MAX_CSV_ROWS;
    delete process.env.SPREADSHEET_MAX_PREVIEW_ROWS;
    svc = new SpreadsheetIngestService();
  });

  it('parses minimal CSV', async () => {
    const buf = Buffer.from('Name,Code\nAlice,A1\n', 'utf8');
    const r = await svc.parseEmployeeImportFile(buf, {
      mimetype: 'text/csv',
      originalname: 'x.csv',
      startedAt: Date.now(),
    });
    expect(r.headers).toEqual(['Name', 'Code']);
    expect(r.rows).toEqual([{ Name: 'Alice', Code: 'A1' }]);
  });

  it('parses minimal xlsx', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    ws.addRow(['employee_code', 'email', 'full_name']);
    ws.addRow(['E1', 'e1@x.test', 'One']);
    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    const r = await svc.parseEmployeeImportFile(buf, {
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      originalname: 't.xlsx',
      startedAt: Date.now(),
    });
    expect(r.headers[0]).toBe('employee_code');
    expect(r.rows[0]).toMatchObject({
      employee_code: 'E1',
      email: 'e1@x.test',
      full_name: 'One',
    });
  });

  it('strips BOM on CSV', async () => {
    const buf = Buffer.from('\uFEFFh1,h2\nv1,v2', 'utf8');
    const r = await svc.parseEmployeeImportFile(buf, { startedAt: Date.now() });
    expect(r.headers).toEqual(['h1', 'h2']);
    expect(r.rows[0]).toEqual({ h1: 'v1', h2: 'v2' });
  });

  it('throws SHEET-400 on empty file', async () => {
    await expect(
      svc.parseEmployeeImportFile(Buffer.alloc(0), { startedAt: Date.now() }),
    ).rejects.toMatchObject({
      code: 'SHEET-400',
    });
  });

  it('throws SHEET-413 when CSV row cap exceeded', async () => {
    process.env.SPREADSHEET_MAX_CSV_ROWS = '3';
    const lines = ['a', '1', '2', '3', '4'];
    const buf = Buffer.from(lines.join('\n'), 'utf8');
    await expect(
      svc.parseEmployeeImportFile(buf, { startedAt: Date.now() }),
    ).rejects.toMatchObject({
      code: 'SHEET-413',
    });
  });

  it('throws SHEET-413 when UTF-8 byte cap exceeded', async () => {
    const max = getSpreadsheetLimits().maxUploadBytes;
    const big = Buffer.alloc(max + 1, 0x41);
    await expect(
      svc.parseEmployeeImportFile(big, { startedAt: Date.now() }),
    ).rejects.toMatchObject({
      code: 'SHEET-413',
    });
  });

  it('maps bad xlsx to SHEET-400', async () => {
    const buf = Buffer.from('not a real xlsx', 'utf8');
    await expect(
      svc.parseEmployeeImportFile(buf, {
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        startedAt: Date.now(),
      }),
    ).rejects.toMatchObject({ code: 'SHEET-400' });
  });

  it('throws SHEET-413 on oversized cell', async () => {
    process.env.SPREADSHEET_MAX_CELL_CHARS = '4';
    const buf = Buffer.from(`h\nabcde`, 'utf8');
    try {
      await svc.parseEmployeeImportFile(buf, { startedAt: Date.now() });
      fail('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).code).toBe('SHEET-413');
      expect((e as ApiException).getStatus()).toBe(
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    } finally {
      delete process.env.SPREADSHEET_MAX_CELL_CHARS;
    }
  });
});
