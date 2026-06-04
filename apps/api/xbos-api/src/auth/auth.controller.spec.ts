import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController (UC-XBOS-AUTH-01/02)', () => {
  let controller: AuthController;
  const authMock = {
    login: jest.fn().mockResolvedValue({
      accessToken: 'tok',
      expiresInSec: 86400,
      user: { userId: 'ceo@xe.vn' },
    }),
    me: jest.fn().mockResolvedValue({ userId: 'ceo@xe.vn', memberships: [] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authMock }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('UC-XBOS-AUTH-01: login returns XBOS-AUTH-200 envelope', async () => {
    const res = await controller.login({ email: 'ceo@xe.vn', password: 'Xevn@2026' });
    expect(res.code).toBe('XBOS-AUTH-200');
    expect(authMock.login).toHaveBeenCalledWith('ceo@xe.vn', 'Xevn@2026');
  });

  it('UC-XBOS-AUTH-02: me rejects missing bearer', async () => {
    await expect(controller.me(undefined)).rejects.toThrow('Unauthorized');
    expect(authMock.me).not.toHaveBeenCalled();
  });
});
