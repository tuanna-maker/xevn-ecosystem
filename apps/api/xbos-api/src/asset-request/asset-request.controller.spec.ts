import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { AssetRequestController } from './asset-request.controller';
import { AssetRequestService } from './asset-request.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('AssetRequestController (UC-XBOS-AR)', () => {
  let controller: AssetRequestController;

  const serviceMock = {
    list: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'req-1', status: 'draft' }),
    transition: jest.fn().mockResolvedValue({ requestId: 'req-1', status: 'submitted' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetRequestController],
      providers: [{ provide: AssetRequestService, useValue: serviceMock }],
    }).compile();
    controller = module.get<AssetRequestController>(AssetRequestController);
  });

  it('rejects unauthenticated list', async () => {
    await expect(controller.list(undefined, undefined, undefined, undefined)).rejects.toMatchObject<ApiException>({
      code: 'XBOS-AUTH-001',
    });
    expect(serviceMock.list).not.toHaveBeenCalled();
  });

  it('UC-XBOS-AR-01: lists asset requests scoped to JWT', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    const result = await controller.list('xevn', 'vtc', `Bearer ${token}`, undefined);
    expect(result.code).toBe('XBOS-AST-200');
    expect(serviceMock.list).toHaveBeenCalledWith('xevn', 'vtc');
  });

  it('UC-XBOS-AR-02: creates asset request with XBOS-AST-201', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    const result = await controller.create(
      { title: 'Laptop request', assetType: 'it_equipment' },
      'xevn',
      'vtc',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-AST-201');
    expect(serviceMock.create).toHaveBeenCalledWith('xevn', 'vtc', expect.any(Object));
  });

  it('UC-XBOS-AR-03: transitions request status', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    const result = await controller.transition(
      'req-1',
      { status: 'submitted', actor: 'ceo@xe.vn' },
      'xevn',
      'vtc',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-AST-200');
    expect(serviceMock.transition).toHaveBeenCalledWith('xevn', 'vtc', 'req-1', 'submitted', 'ceo@xe.vn');
  });

  it('UC-XBOS-16: advances request through finance_confirmed step', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    serviceMock.transition.mockResolvedValueOnce({ id: 'req-1', status: 'finance_confirmed' });
    const result = await controller.transition(
      'req-1',
      { status: 'finance_confirmed', actor: 'ceo@xe.vn' },
      'xevn',
      'vtc',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-AST-200');
    expect(serviceMock.transition).toHaveBeenCalledWith(
      'xevn',
      'vtc',
      'req-1',
      'finance_confirmed',
      'ceo@xe.vn',
    );
  });

  it('rejects scope mismatch before create', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    await expect(
      controller.create({ title: 'x' }, 'xevn', 'other-co', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.create).not.toHaveBeenCalled();
  });
});
