import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import request from 'supertest';
import { GlobalHttpExceptionFilter } from '../common/http-exception.filter';
import { OrgFoundationController } from './org-foundation.controller';
import { OrgFoundationService } from './org-foundation.service';
import { LegalEntityEnrichPipe } from './pipes/legal-entity-enrich.pipe';
import { legalEntityBodyMiddleware } from './middleware/legal-entity-body.middleware';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

/** QA L2.5 browser PUT body (P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01). */
const QA_BROWSER_PUT_BODY = {
  code: 'XE_DU_LICH',
  name: 'QA L25 browser save retest 20260604',
  entityType: 'subsidiary',
  taxCode: '0123456789',
  charterCapital: 1_000_000_000,
  payload: {
    companyForm: {
      nameVi: 'QA L25 browser save retest 20260604',
      shortName: 'XE_DU_LICH',
      enterpriseCode: '0123456789',
      entityLevel: 'subsidiary',
    },
  },
};

describe('OrgFoundation legal-entity PUT (browser integration)', () => {
  let app: INestApplication;
  const entityId = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';

  const serviceMock = {
    upsertLegalEntity: jest.fn().mockResolvedValue({ id: entityId, code: 'XE_DU_LICH' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrgFoundationController],
      providers: [{ provide: OrgFoundationService, useValue: serviceMock }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/xbos');
    app.use(legalEntityBodyMiddleware);
    app.useGlobalPipes(
      new LegalEntityEnrichPipe(),
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('P1-CC-BE-MEMBER-LEGAL-BROWSER-PUT-01: browser-shaped PUT returns 201 (not XBOS-VAL-001)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const res = await request(app.getHttpServer())
      .put(`/api/xbos/org-foundation/legal-entities/${entityId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .set('x-internal-api-key', 'test-key')
      .send(QA_BROWSER_PUT_BODY);

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.body.code).toBe('XBOS-ORG-201');
    expect(res.body.success).toBe(true);
    expect(serviceMock.upsertLegalEntity).toHaveBeenCalledWith(
      'xe-du-lich',
      'main',
      entityId,
      expect.objectContaining({
        code: 'XE_DU_LICH',
        name: 'QA L25 browser save retest 20260604',
      }),
    );
  });

  it('accepts payload-only body (no root code/name) after middleware + enrich pipe', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const res = await request(app.getHttpServer())
      .put(`/api/xbos/org-foundation/legal-entities/${entityId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .set('x-internal-api-key', 'test-key')
      .send({
        entityType: 'subsidiary',
        taxCode: '0123456789',
        charterCapital: 1_000_000_000,
        payload: {
          companyForm: {
            nameVi: 'QA L25 browser save retest 20260604',
            shortName: 'XE_DU_LICH',
            enterpriseCode: '0123456789',
            entityLevel: 'subsidiary',
          },
        },
      });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.body.code).toBe('XBOS-ORG-201');
    expect(serviceMock.upsertLegalEntity).toHaveBeenCalledWith(
      'xe-du-lich',
      'main',
      entityId,
      expect.objectContaining({ code: 'XE_DU_LICH', name: 'QA L25 browser save retest 20260604' }),
    );
  });
});
