import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const describeDb = process.env.DB_HOST || process.env.DATABASE_URL_XBOS ? describe : describe.skip;

describeDb('Tenant isolation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/xbos');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated tenant-scope accessible', async () => {
    const res = await request(app.getHttpServer()).get('/api/xbos/tenant-scope/accessible');
    expect(res.status).toBe(401);
    expect(res.body?.code).toBe('XBOS-AUTH-001');
  });

  it('rejects unauthenticated org-foundation org tree', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/xbos/org-foundation/org-units/tree')
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', 'holding');
    expect(res.status).toBe(401);
    expect(res.body?.code).toBe('XBOS-AUTH-001');
  });

  it('health is public', async () => {
    const res = await request(app.getHttpServer()).get('/api/xbos/');
    expect(res.status).toBe(200);
  });
});
