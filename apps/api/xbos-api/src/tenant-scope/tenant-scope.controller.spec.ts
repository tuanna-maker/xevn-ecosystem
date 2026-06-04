import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { TenantScopeController } from './tenant-scope.controller';
import { TenantScopeService } from './tenant-scope.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('TenantScopeController (membership / group overview)', () => {
  let controller: TenantScopeController;

  const serviceMock = {
    listAccessible: jest.fn().mockResolvedValue([
      {
        tenantId: 'xevn',
        name: 'XeVN Group',
        shortName: 'XeVN',
        tenantKind: 'master',
        roleCode: 'group_ceo',
        companyId: 'main',
        isMaster: true,
      },
    ]),
    groupOrgOverview: jest.fn().mockResolvedValue({ masterTenantId: 'xevn', trees: [] }),
    groupMemberUnits: jest.fn().mockResolvedValue({ units: [] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantScopeController],
      providers: [{ provide: TenantScopeService, useValue: serviceMock }],
    }).compile();
    controller = module.get<TenantScopeController>(TenantScopeController);
  });

  it('rejects accessible without auth', async () => {
    await expect(controller.accessible(undefined, undefined, undefined, undefined)).rejects.toMatchObject<
      ApiException
    >({ code: 'XBOS-AUTH-001' });
    expect(serviceMock.listAccessible).not.toHaveBeenCalled();
  });

  it('UC-XBOS-TENANT-01: resolves userId from JWT sub for accessible tenants', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const result = await controller.accessible(undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-TENANT-200');
    expect(serviceMock.listAccessible).toHaveBeenCalledWith('ceo@xe.vn');
  });

  it('UC-XBOS-TENANT-02: loads group org overview for authenticated group CEO', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const result = await controller.groupOverview(undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-TENANT-200');
    expect(serviceMock.groupOrgOverview).toHaveBeenCalledWith('ceo@xe.vn');
  });

  it('UC-XBOS-TENANT-03: lists group member units for master tenant CEO', async () => {
    serviceMock.groupMemberUnits.mockResolvedValueOnce({ units: [{ tenantId: 'xe-du-lich', name: 'Du Lich' }] });
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.groupMemberUnits(undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-TENANT-200');
    expect(serviceMock.groupMemberUnits).toHaveBeenCalledWith('ceo@xe.vn');
  });

  it('propagates XBOS-TENANT-403 from service on group-member-units', async () => {
    serviceMock.groupMemberUnits.mockRejectedValueOnce(
      new ApiException(
        'XBOS-TENANT-403',
        'Group member units require master tenant membership',
        HttpStatus.FORBIDDEN,
      ),
    );
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    await expect(
      controller.groupMemberUnits(undefined, undefined, `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject<ApiException>({ code: 'XBOS-TENANT-403' });
  });
});
