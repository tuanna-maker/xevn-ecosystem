import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import request from 'supertest';
import { GlobalHttpExceptionFilter } from '../common/http-exception.filter';
import { LegalEntityProfileController } from '../legal-entity-profile/legal-entity-profile.controller';
import { LegalEntityProfileService } from '../legal-entity-profile/legal-entity-profile.service';
import { OrgFoundationController } from './org-foundation.controller';
import { OrgFoundationService } from './org-foundation.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

const XE_DU_LICH_ENTITY_ID = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';

describe('P1-PHASE1-BE-SCOPE-CRUD-01 legal entity read/mutate scope (browser integration)', () => {
  let app: INestApplication;

  const orgServiceMock = {
    resolveLegalEntityPartition: jest
      .fn()
      .mockResolvedValue({ tenantId: 'xe-du-lich', companyId: 'main' }),
    getLegalEntityById: jest.fn().mockResolvedValue({ id: XE_DU_LICH_ENTITY_ID, code: 'XE_DU_LICH' }),
    listLegalEntities: jest.fn().mockResolvedValue([]),
  };

  const profileServiceMock = {
    listShareholders: jest.fn().mockResolvedValue([]),
    listDocuments: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrgFoundationController, LegalEntityProfileController],
      providers: [
        { provide: OrgFoundationService, useValue: orgServiceMock },
        { provide: LegalEntityProfileService, useValue: profileServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/xbos');
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const groupCeoToken = createInternalJwt({
    iss: 'xevn-internal',
    aud: 'xevn-api',
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });

  const memberCeoToken = createInternalJwt({
    iss: 'xevn-internal',
    aud: 'xevn-api',
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'company_ceo',
  });

  it('group CEO GET legal-entity by id with xe-du-lich headers (no 409)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/xbos/org-foundation/legal-entities/${XE_DU_LICH_ENTITY_ID}`)
      .set('Authorization', `Bearer ${groupCeoToken}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .set('x-internal-api-key', 'test-key');

    expect(res.status).toBe(200);
    expect(res.body.code).toBe('XBOS-ORG-200');
    expect(orgServiceMock.getLegalEntityById).toHaveBeenCalledWith(XE_DU_LICH_ENTITY_ID);
  });

  it('group CEO GET shareholders with xe-du-lich headers (no 409)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/xbos/org-foundation/legal-entities/${XE_DU_LICH_ENTITY_ID}/shareholders`)
      .set('Authorization', `Bearer ${groupCeoToken}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .set('x-internal-api-key', 'test-key');

    expect(res.status).toBe(200);
    expect(res.body.code).toBe('XBOS-SHR-200');
    expect(profileServiceMock.listShareholders).toHaveBeenCalledWith(
      'xe-du-lich',
      'main',
      XE_DU_LICH_ENTITY_ID,
    );
  });

  it('P1-PHASE1-BE-SCOPE-P0-S5-01: member CEO blocked on other tenant legal-entity UUID', async () => {
    orgServiceMock.resolveLegalEntityPartition.mockResolvedValueOnce({
      tenantId: 'xe-vtc',
      companyId: 'main',
    });
    const res = await request(app.getHttpServer())
      .get(`/api/xbos/org-foundation/legal-entities/${XE_DU_LICH_ENTITY_ID}`)
      .set('Authorization', `Bearer ${memberCeoToken}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .set('x-internal-api-key', 'test-key');

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('SCOPE_CONTEXT_MISMATCH');
    expect(orgServiceMock.getLegalEntityById).not.toHaveBeenCalled();
  });

  it('member CEO blocked on group rollup legal-entity GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/xbos/org-foundation/legal-entities/${XE_DU_LICH_ENTITY_ID}`)
      .set('Authorization', `Bearer ${memberCeoToken}`)
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', 'main')
      .set('x-internal-api-key', 'test-key');

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('SCOPE_CONTEXT_MISMATCH');
    expect(orgServiceMock.getLegalEntityById).not.toHaveBeenCalled();
  });

  it('member CEO blocked on group rollup shareholders GET', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/xbos/org-foundation/legal-entities/${XE_DU_LICH_ENTITY_ID}/shareholders`)
      .set('Authorization', `Bearer ${memberCeoToken}`)
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', 'main')
      .set('x-internal-api-key', 'test-key');

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('SCOPE_CONTEXT_MISMATCH');
    expect(profileServiceMock.listShareholders).not.toHaveBeenCalled();
  });
});
