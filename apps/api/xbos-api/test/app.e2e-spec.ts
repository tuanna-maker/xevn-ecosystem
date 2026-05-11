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
    app.setGlobalPrefix('api/xbos');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  it('/api/xbos (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/xbos')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.code).toBe('XBOS-HEALTH-200');
      });
  });

  it('rejects bootstrap without internal auth headers', () => {
    return request(app.getHttpServer())
      .post('/api/xbos/config-sync/bootstrap-xevn')
      .expect(401)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('XBOS-AUTH-001');
        expect(res.body.message).toBe('Unauthorized bootstrap access');
      });
  });

  it('rejects unsupported target query for catalog list', () => {
    return request(app.getHttpServer())
      .get('/api/xbos/config-sync/catalogs?target=invalid-target')
      .expect(400)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('XBOS-VAL-001');
        expect(res.body.message).toBe('Invalid target. Use hrm, xbos, or web-portal');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
