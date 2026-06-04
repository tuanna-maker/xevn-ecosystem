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
    getDocumentFile: jest.fn().mockResolvedValue({ buffer: Buffer.from('pdf'), mimeType: 'application/pdf' }),
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
});
