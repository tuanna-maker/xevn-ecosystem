import { Test, TestingModule } from '@nestjs/testing';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { MobileAuthController } from './mobile-auth.controller';
import { MobileAuthService } from './mobile-auth.service';

describe('MobileAuthController', () => {
  let controller: MobileAuthController;

  const mobileAuthMock = {
    login: jest.fn(),
    selectMembership: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobileAuthController],
      providers: [{ provide: MobileAuthService, useValue: mobileAuthMock }],
    }).compile();

    controller = module.get<MobileAuthController>(MobileAuthController);
  });

  it('login returns HRM-AUTH-200 and passes tenant/company hint', async () => {
    mobileAuthMock.login.mockResolvedValue({
      access_token: 'at',
      memberships: [],
    });
    const res = await controller.login('xevn', 'main', {
      email: 'ceo@xe.vn',
      password: 'secret',
    });
    expect(res.code).toBe('HRM-AUTH-200');
    expect(mobileAuthMock.login).toHaveBeenCalledWith(
      { email: 'ceo@xe.vn', password: 'secret' },
      { tenantId: 'xevn', companyId: 'main' },
    );
  });

  it('login omits scope hint when headers are blank', async () => {
    mobileAuthMock.login.mockResolvedValue({ access_token: 'at' });
    await controller.login(undefined, undefined, {
      email: 'ceo@xe.vn',
      password: 'secret',
    });
    expect(mobileAuthMock.login).toHaveBeenCalledWith(
      { email: 'ceo@xe.vn', password: 'secret' },
      undefined,
    );
  });

  it('selectMembership rejects missing authorization before service call', () => {
    expect(() =>
      controller.selectMembership(undefined, {
        employee_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      }),
    ).toThrow(ApiException);
    expect(mobileAuthMock.selectMembership).not.toHaveBeenCalled();
  });

  it('UC-HRM-MOB-02: selectMembership returns HRM-AUTH-203 with verified JWT sub', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    mobileAuthMock.selectMembership.mockResolvedValue({
      access_token: 'at2',
      memberships: [],
    });
    const res = await controller.selectMembership(`Bearer ${token}`, {
      employee_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
    });
    expect(res.code).toBe('HRM-AUTH-203');
    expect(mobileAuthMock.selectMembership).toHaveBeenCalledWith(
      'ceo@xe.vn',
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
    );
  });

  it('refresh returns HRM-AUTH-201', async () => {
    mobileAuthMock.refresh.mockResolvedValue({
      access_token: 'new-at',
      expires_in_sec: 43200,
    });
    const res = await controller.refresh({ refresh_token: 'rt.example' });
    expect(res.code).toBe('HRM-AUTH-201');
    expect(mobileAuthMock.refresh).toHaveBeenCalledWith({
      refresh_token: 'rt.example',
    });
  });
});
