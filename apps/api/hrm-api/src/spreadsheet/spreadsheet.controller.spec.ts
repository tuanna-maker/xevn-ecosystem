import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { StreamableFile } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheet.controller';
import { SpreadsheetService } from './spreadsheet.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('SpreadsheetController', () => {
  let controller: SpreadsheetController;

  const spreadsheetMock = {
    getLimitsSnapshot: jest.fn().mockReturnValue({ maxUploadBytes: 1024 }),
    previewEmployeeImport: jest.fn().mockResolvedValue({
      kind: 'employee_import',
      headersDetected: ['a'],
      canonicalHeaders: ['employee_code'],
      rowCount: 0,
      previewRows: [],
      truncated: false,
      errors: [],
      dryRun: true,
    }),
    commitEmployeeImport: jest.fn().mockResolvedValue({ importedCount: 1, ids: ['id-1'], errors: [] }),
    exportEmployeesCsv: jest.fn().mockResolvedValue({ filename: 'employees_export.csv', body: 'h\n' }),
    employeeImportCsvTemplate: jest.fn().mockReturnValue('employee_code,email\n'),
    employeeImportXlsxTemplate: jest.fn().mockResolvedValue(Buffer.from('PK', 'utf8')),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpreadsheetController],
      providers: [{ provide: SpreadsheetService, useValue: spreadsheetMock }],
    }).compile();
    controller = module.get<SpreadsheetController>(SpreadsheetController);
  });

  it('rejects unauthenticated limits', () => {
    expect(() => controller.limits(undefined, undefined)).toThrow('Unauthorized spreadsheet access');
  });

  it('returns limits with internal key', () => {
    const res = controller.limits(undefined, 'test-key');
    expect(res.success).toBe(true);
    expect(res.code).toBe('SHEET-200');
    expect(spreadsheetMock.getLimitsSnapshot).toHaveBeenCalled();
  });

  it('HRM-IM-04 returns csv template as StreamableFile', async () => {
    const file = await controller.downloadTemplate('employee_import', 'csv', undefined, 'test-key');
    expect(file).toBeInstanceOf(StreamableFile);
  });

  it('rejects template for unknown kind', async () => {
    await expect(controller.downloadTemplate('unknown', 'csv', undefined, 'test-key')).rejects.toThrow(
      'No template available for kind',
    );
  });

  it('HRM-IM-01 preview rejects scope mismatch before service', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    const file = { buffer: Buffer.from('a,b\n1,2'), mimetype: 'text/csv', originalname: 'x.csv' } as Parameters<
      SpreadsheetController['importPreview']
    >[0];
    await expect(
      controller.importPreview(
        file,
        { kind: 'employee_import', dryRun: 'true' },
        'xevn',
        'other-co',
        `Bearer ${token}`,
        undefined,
      ),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(spreadsheetMock.previewEmployeeImport).not.toHaveBeenCalled();
  });

  it('HRM-IM-02 commit returns SHEET-201', async () => {
    const file = { buffer: Buffer.from('employee_code,email\nE1,a@xe.vn'), mimetype: 'text/csv', originalname: 'x.csv' } as Parameters<
      SpreadsheetController['importCommit']
    >[0];
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
      company_uuid: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const res = await controller.importCommit(
      file,
      { kind: 'employee_import' },
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      `Bearer ${token}`,
      undefined,
    );
    expect(res.code).toBe('SHEET-201');
    expect(spreadsheetMock.commitEmployeeImport).toHaveBeenCalled();
  });

  it('HRM-IM-03 export returns StreamableFile', async () => {
    const file = await controller.exportSheet(
      { filter: { company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037' } },
      'xevn',
      undefined,
      undefined,
      'test-key',
    );
    expect(file).toBeInstanceOf(StreamableFile);
    expect(spreadsheetMock.exportEmployeesCsv).toHaveBeenCalled();
  });
});
