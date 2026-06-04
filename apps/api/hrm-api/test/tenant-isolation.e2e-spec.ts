import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const describeDb = process.env.DB_HOST || process.env.DATABASE_URL_HRM ? describe : describe.skip;

describeDb('Tenant isolation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects scope mismatch without auth (401/403)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/hrm/attendance/leave-requests')
      .set('x-tenant-id', 'tenant-a')
      .set('x-company-id', 'main');
    expect([401, 403]).toContain(res.status);
  });

  it('health is public', async () => {
    const res = await request(app.getHttpServer()).get('/api/hrm/');
    expect(res.status).toBe(200);
  });
});
