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
    it('should return health envelope', () => {
      const result = appController.getHello();
      expect(result.success).toBe(true);
      expect(result.code).toBe('HRM-HEALTH-200');
      expect(result.data).toEqual({ service: 'hrm-api', status: 'ok' });
    });
  });
});
