import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { AppController } from '../app.controller';
import { GlobalHttpExceptionFilter } from '../common/http-exception.filter';
import { CatalogSyncController } from '../catalog-sync/catalog-sync.controller';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';

const WARM_UP = 2;
const SAMPLES = 7;

type BaselineTier = 'health' | 'mockedSync';

type BaselineFile = {
  version: number;
  routes: Record<string, { baselineMaxMs: number; tier: BaselineTier }>;
};

function loadBaselines(): BaselineFile {
  const p = join(__dirname, '../../perf-budget/ci-baseline.json');
  const raw = readFileSync(p, 'utf8')
    .replace(/^\uFEFF/, '')
    .trim();
  return JSON.parse(raw) as BaselineFile;
}

function tierMultiplier(tier: BaselineTier): number {
  return tier === 'health' ? 1.15 : 1.2;
}

async function measureMaxMs(runRequest: () => request.Test): Promise<number> {
  const assert2xx = async () => {
    const res = await runRequest();
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`expected 2xx, got ${res.status}: ${res.text}`);
    }
  };
  for (let i = 0; i < WARM_UP; i++) {
    await assert2xx();
  }
  let max = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const t0 = performance.now();
    await assert2xx();
    const ms = performance.now() - t0;
    if (ms > max) max = ms;
  }
  return max;
}

describe('CI perf budget (hrm-api)', () => {
  let app: INestApplication;
  const baselines = loadBaselines();

  const catalogSyncServiceMock = {
    pullCatalogFromXbos: jest.fn().mockResolvedValue({ key: 'job_titles' }),
    getSyncedCatalog: jest
      .fn()
      .mockResolvedValue({ key: 'job_titles', items: [] }),
    listSyncedCatalogs: jest
      .fn()
      .mockResolvedValue({ total: 1, data: [{ key: 'job_titles' }] }),
  };

  beforeAll(async () => {
    process.env.INTERNAL_API_KEY = 'test-key';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, CatalogSyncController],
      providers: [
        { provide: CatalogSyncService, useValue: catalogSyncServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/hrm health stays within perf budget', async () => {
    const key = 'GET /api/hrm';
    const cfg = baselines.routes[key];
    if (!cfg) throw new Error(`missing baseline for ${key}`);
    const server = app.getHttpServer();
    const maxMs = await measureMaxMs(() => request(server).get('/api/hrm'));
    const limit = cfg.baselineMaxMs * tierMultiplier(cfg.tier);
    if (maxMs > limit) {
      throw new Error(
        `${key}: max ${maxMs.toFixed(3)}ms > budget ${limit.toFixed(3)}ms (baseline ${cfg.baselineMaxMs} × ${tierMultiplier(cfg.tier)})`,
      );
    }
  });

  it('GET /api/hrm/catalog-sync/:catalogKey (mocked service) stays within perf budget', async () => {
    const key = 'GET /api/hrm/catalog-sync/:catalogKey';
    const cfg = baselines.routes[key];
    if (!cfg) throw new Error(`missing baseline for ${key}`);
    const server = app.getHttpServer();
    const maxMs = await measureMaxMs(() =>
      request(server)
        .get('/api/hrm/catalog-sync/job_titles')
        .set('x-internal-api-key', 'test-key')
        .set('x-tenant-id', 'xevn')
        .set('x-company-id', 'vtc'),
    );
    const limit = cfg.baselineMaxMs * tierMultiplier(cfg.tier);
    if (maxMs > limit) {
      throw new Error(
        `${key}: max ${maxMs.toFixed(3)}ms > budget ${limit.toFixed(3)}ms (baseline ${cfg.baselineMaxMs} × ${tierMultiplier(cfg.tier)})`,
      );
    }
  });

  it('POST /api/hrm/catalog-sync/pull/:catalogKey (mocked service, no outbound fetch) stays within perf budget', async () => {
    const key = 'POST /api/hrm/catalog-sync/pull/:catalogKey';
    const cfg = baselines.routes[key];
    if (!cfg) throw new Error(`missing baseline for ${key}`);
    const server = app.getHttpServer();
    const maxMs = await measureMaxMs(() =>
      request(server)
        .post('/api/hrm/catalog-sync/pull/job_titles')
        .set('x-tenant-id', 'xevn')
        .set('x-company-id', 'vtc')
        .set('x-internal-api-key', 'test-key'),
    );
    const limit = cfg.baselineMaxMs * tierMultiplier(cfg.tier);
    if (maxMs > limit) {
      throw new Error(
        `${key}: max ${maxMs.toFixed(3)}ms > budget ${limit.toFixed(3)}ms (baseline ${cfg.baselineMaxMs} × ${tierMultiplier(cfg.tier)})`,
      );
    }
  });
});
