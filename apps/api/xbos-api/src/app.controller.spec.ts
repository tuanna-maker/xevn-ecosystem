import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('UC-XBOS-01: returns health envelope', () => {
      const result = appController.getHello();
      expect(result.success).toBe(true);
      expect(result.code).toBe('XBOS-HEALTH-200');
      expect(result.data).toEqual({ service: 'xbos-api', status: 'ok' });
    });
  });

  describe('metrics', () => {
    it('UC-XBOS-MET-01: returns JSON metrics snapshot', async () => {
      const res = { setHeader: jest.fn(), send: jest.fn(), req: { headers: {} } };
      const result = await appController.getMetrics(res as never, undefined);
      expect(result?.code).toBe('XBOS-METRICS-200');
      expect(result?.data).toMatchObject({ prometheus_hint: expect.stringContaining('prometheus') });
    });
  });
});
