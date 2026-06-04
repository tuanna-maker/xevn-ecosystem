import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('FleetController (HRM-FL-01)', () => {
  let controller: FleetController;

  const serviceMock = {
    listVehicles: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'v1' }] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FleetController],
      providers: [{ provide: FleetService, useValue: serviceMock }],
    }).compile();
    controller = module.get<FleetController>(FleetController);
  });

  it('HRM-FL-01: lists fleet vehicles with internal key', async () => {
    const res = await controller.listVehicles(undefined, 'test-key', 'xevn', 'xe-du-lich');
    expect(res.code).toBe('HRM-FLEET-200');
    expect(serviceMock.listVehicles).toHaveBeenCalledWith('xevn', ['xe-du-lich'], {
      status: undefined,
      limit: undefined,
    });
  });

  it('HRM-FL-01: rolls up company_id=main for group CEO JWT', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listVehicles(`Bearer ${token}`, 'test-key', 'xevn', 'main', 'main');
    expect(res.code).toBe('HRM-FLEET-200');
    expect(serviceMock.listVehicles).toHaveBeenCalledWith(
      'xevn',
      expect.arrayContaining(['holding', 'trsport']),
      expect.any(Object),
    );
  });

  it('blocks unauthorized fleet access', () => {
    expect(() => controller.listVehicles(undefined, undefined, 'xevn', 'main')).toThrow(
      'Unauthorized fleet access',
    );
    expect(serviceMock.listVehicles).not.toHaveBeenCalled();
  });
});
