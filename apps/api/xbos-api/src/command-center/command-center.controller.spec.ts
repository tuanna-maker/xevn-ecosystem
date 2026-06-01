import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { CommandCenterController } from './command-center.controller';
import { CommandCenterService } from './command-center.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('CommandCenterController (UC-CC-P0-08)', () => {
  let controller: CommandCenterController;

  const serviceMock = {
    getWorkspaceMeta: jest.fn().mockResolvedValue({
      asOf: '2026-05-24T12:00:00.000Z',
      dataSyncNote: null,
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommandCenterController],
      providers: [{ provide: CommandCenterService, useValue: serviceMock }],
    }).compile();
    controller = module.get<CommandCenterController>(CommandCenterController);
  });

  it('rejects workspace meta without internal auth', async () => {
    await expect(
      controller.workspaceMeta(undefined, undefined, undefined, undefined, undefined, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'XBOS-AUTH-001' });
    expect(serviceMock.getWorkspaceMeta).not.toHaveBeenCalled();
  });

  it('UC-CC-P0-08: returns workspace meta with asOf', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.workspaceMeta(
      'xevn',
      'holding',
      undefined,
      undefined,
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-CC-200');
    expect(result.data).toEqual(
      expect.objectContaining({ asOf: '2026-05-24T12:00:00.000Z' }),
    );
    expect(serviceMock.getWorkspaceMeta).toHaveBeenCalledWith('xevn', 'holding');
  });

  it('UC-CC-P0-08: group CEO main resolves to holding partition', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.workspaceMeta(undefined, undefined, undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(serviceMock.getWorkspaceMeta).toHaveBeenCalledWith('xevn', 'holding');
  });
});
