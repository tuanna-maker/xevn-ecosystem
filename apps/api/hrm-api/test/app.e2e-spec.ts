import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalHttpExceptionFilter } from '../src/common/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  it('/api/hrm (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/hrm')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.code).toBe('HRM-HEALTH-200');
      });
  });

  it('/api/hrm/metrics (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/hrm/metrics')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.code).toBe('HRM-METRICS-200');
        expect(typeof res.body.data.process_uptime_sec).toBe('number');
      });
  });

  it('returns unauthorized envelope for catalog sync without auth', () => {
    return request(app.getHttpServer())
      .get('/api/hrm/catalog-sync')
      .expect(401)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('HRM-AUTH-001');
        expect(res.body.message).toBe('Unauthorized sync access');
      });
  });

  it('returns validation envelope for malformed platform-admin payload', () => {
    return request(app.getHttpServer())
      .post('/api/hrm/admin/platform-admin')
      .send({ email: 'bad-email', password: 'short', unknown: 'x' })
      .expect(400)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('HRM-VAL-001');
        expect(res.body.message).toContain('property unknown should not exist');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
