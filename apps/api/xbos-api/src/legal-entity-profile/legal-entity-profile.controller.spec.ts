import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { LegalEntityProfileController } from './legal-entity-profile.controller';
import { LegalEntityProfileService } from './legal-entity-profile.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('LegalEntityProfileController (UC-CC-P0-01/02)', () => {
  let controller: LegalEntityProfileController;

  const serviceMock = {
    listShareholders: jest.fn().mockResolvedValue([]),
    createShareholder: jest.fn().mockResolvedValue({ id: 'sh-1' }),
    updateShareholder: jest.fn().mockResolvedValue({ id: 'sh-1' }),
    deleteShareholder: jest.fn().mockResolvedValue({ id: 'sh-1' }),
    listDocuments: jest.fn().mockResolvedValue([]),
    createDocument: jest.fn().mockResolvedValue({ id: 'doc-1' }),
    updateDocument: jest.fn().mockResolvedValue({ id: 'doc-1' }),
    deleteDocument: jest.fn().mockResolvedValue({ id: 'doc-1' }),
    uploadDocumentFile: jest.fn().mockResolvedValue({ id: 'doc-1', storage_path: 'xevn/le-1/doc-1.pdf' }),
    streamDocumentFile: jest.fn().mockResolvedValue({
      stream: { pipe: jest.fn() },
      mimeType: 'application/pdf',
      fileName: 'Giấy ĐKKD',
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalEntityProfileController],
      providers: [{ provide: LegalEntityProfileService, useValue: serviceMock }],
    }).compile();
    controller = module.get<LegalEntityProfileController>(LegalEntityProfileController);
  });

  it('UC-CC-P0-01: lists shareholders for legal entity', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.listShareholders('le-1', 'xevn', 'holding', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-SHR-200');
    expect(serviceMock.listShareholders).toHaveBeenCalledWith('xevn', 'holding', 'le-1');
  });

  it('UC-CC-P0-02: lists legal documents', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.listDocuments('le-1', 'xevn', 'holding', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-DOC-200');
    expect(serviceMock.listDocuments).toHaveBeenCalledWith('xevn', 'holding', 'le-1');
  });

  it('rejects shareholder list without auth', async () => {
    await expect(
      controller.listShareholders('le-1', undefined, undefined, undefined, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'XBOS-AUTH-001' });
    expect(serviceMock.listShareholders).not.toHaveBeenCalled();
  });

  it('P1-PHASE1-BE-SCOPE-CRUD-01: group CEO lists shareholders with member tenant headers', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const entityId = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';
    const result = await controller.listShareholders(
      entityId,
      'xe-du-lich',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-SHR-200');
    expect(serviceMock.listShareholders).toHaveBeenCalledWith('xe-du-lich', 'main', entityId);
  });

  it('P1-PHASE1-BE-SCOPE-CRUD-01: member CEO blocked on group rollup tenant', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    await expect(
      controller.listShareholders('le-1', 'xevn', 'main', `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.listShareholders).not.toHaveBeenCalled();
  });

  it('P1-UF-XBOS-06: streams legal document file via service', async () => {
    const res = {
      setHeader: jest.fn(),
      pipe: jest.fn(),
    };
    const stream = { pipe: jest.fn() };
    serviceMock.streamDocumentFile.mockResolvedValueOnce({
      stream,
      mimeType: 'application/pdf',
      fileName: 'Giấy ĐKKD',
    });

    await controller.streamFile('doc-1', res as never);

    expect(serviceMock.streamDocumentFile).toHaveBeenCalledWith('doc-1');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(stream.pipe).toHaveBeenCalledWith(res);
  });

  it('P1-UF-XBOS-06: upload multipart delegates to uploadDocumentFile', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const file = { buffer: Buffer.from('%PDF'), size: 4, originalname: 'test.pdf' };
    const result = await controller.uploadDocument(
      'le-1',
      'doc-1',
      file,
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-DOC-201');
    expect(serviceMock.uploadDocumentFile).toHaveBeenCalledWith('xevn', 'holding', 'le-1', 'doc-1', file);
  });
});
