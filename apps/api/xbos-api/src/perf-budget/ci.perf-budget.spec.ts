import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { AppController } from '../app.controller';
import { GlobalHttpExceptionFilter } from '../common/http-exception.filter';
import { ConfigSyncController } from '../config-sync/config-sync.controller';
import { ConfigSyncService } from '../config-sync/config-sync.service';

const WARM_UP = 2;
const SAMPLES = 7;

type BaselineTier = 'health' | 'mockedSync';

type BaselineFile = {
  version: number;
  routes: Record<string, { baselineMaxMs: number; tier: BaselineTier }>;
};

function loadBaselines(): BaselineFile {
  const p = join(__dirname, '../../perf-budget/ci-baseline.json');
  const raw = readFileSync(p, 'utf8').replace(/^\uFEFF/, '').trim();
  return JSON.parse(raw) as BaselineFile;
}

function tierMultiplier(tier: BaselineTier): number {
  return tier === 'health' ? 1.15 : 1.2;
}

async function measureMaxMs(runRequest: () => request.Test): Promise<number> {
  for (let i = 0; i < WARM_UP; i++) {
    await runRequest().expect(200);
  }
  let max = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const t0 = performance.now();
    await runRequest().expect(200);
    const ms = performance.now() - t0;
    if (ms > max) max = ms;
  }
  return max;
}

describe('CI perf budget (xbos-api)', () => {
  let app: INestApplication;
  const baselines = loadBaselines();

  const configSyncServiceMock = {
    bootstrapXevnGroupConfig: jest.fn().mockResolvedValue({ seeded_catalogs: 3 }),
    publishCatalog: jest.fn().mockResolvedValue({ key: 'job_titles', version: 2 }),
    getCatalogForTarget: jest.fn().mockResolvedValue({ key: 'job_titles', items: [] }),
    listCatalogsForTarget: jest.fn().mockResolvedValue({ total: 1, target: 'hrm', data: [] }),
  };

  beforeAll(async () => {
    process.env.INTERNAL_API_KEY = 'test-key';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, ConfigSyncController],
      providers: [{ provide: ConfigSyncService, useValue: configSyncServiceMock }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/xbos');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/xbos health stays within perf budget', async () => {
    const key = 'GET /api/xbos';
    const cfg = baselines.routes[key];
    if (!cfg) throw new Error(`missing baseline for ${key}`);
    const server = app.getHttpServer();
    const maxMs = await measureMaxMs(() => request(server).get('/api/xbos'));
    const limit = cfg.baselineMaxMs * tierMultiplier(cfg.tier);
    if (maxMs > limit) {
      throw new Error(
        `${key}: max ${maxMs.toFixed(3)}ms > budget ${limit.toFixed(3)}ms (baseline ${cfg.baselineMaxMs} × ${tierMultiplier(cfg.tier)})`,
      );
    }
  });

  it('GET /api/xbos/config-sync/catalog/:catalogKey (mocked service) stays within perf budget', async () => {
    const key = 'GET /api/xbos/config-sync/catalog/:catalogKey';
    const cfg = baselines.routes[key];
    if (!cfg) throw new Error(`missing baseline for ${key}`);
    const server = app.getHttpServer();
    const maxMs = await measureMaxMs(() =>
      request(server)
        .get('/api/xbos/config-sync/catalog/job_titles')
        .query({ target: 'hrm', tenantId: 'xevn', companyId: 'vtc' })
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
