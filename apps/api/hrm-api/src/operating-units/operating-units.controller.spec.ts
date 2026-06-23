import { Test, TestingModule } from '@nestjs/testing';
import { signServiceJwt } from '../common/jwt-sign';
import { OperatingUnitsController } from './operating-units.controller';
import { OperatingUnitsService } from './operating-units.service';

describe('OperatingUnitsController', () => {
  let controller: OperatingUnitsController;

  const serviceMock = {
    listOperatingUnits: jest.fn().mockResolvedValue([
      { operating_slug: 'holding', display_name_vi: 'Tập đoàn XeVN', rollup_order: 1 },
    ]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatingUnitsController],
      providers: [{ provide: OperatingUnitsService, useValue: serviceMock }],
    }).compile();
    controller = module.get<OperatingUnitsController>(OperatingUnitsController);
  });

  it('requires bearer or internal key', () => {
    expect(() => controller.list(undefined, undefined, undefined, undefined)).toThrow(
      'Unauthorized operating-units access',
    );
    expect(serviceMock.listOperatingUnits).not.toHaveBeenCalled();
  });

  it('GET operating-units returns success envelope for group CEO', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.list(`Bearer ${token}`, undefined, 'xevn', 'main');
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-OPU-200');
    expect(result.data).toHaveLength(1);
    expect(serviceMock.listOperatingUnits).toHaveBeenCalledWith(`Bearer ${token}`, {
      tenantId: 'xevn',
    });
  });

  it('allows internal API key without JWT', async () => {
    const result = await controller.list(undefined, 'test-key', 'xevn', 'main');
    expect(result.success).toBe(true);
    expect(serviceMock.listOperatingUnits).toHaveBeenCalledWith(undefined, { tenantId: 'xevn' });
  });
});
