/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../../common/api.exception';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import type { CreateCompanyDto } from './dto/create-company.dto';
import type { UpdateModulesDto } from './dto/update-modules.dto';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('CompaniesController (XBOS-TENANT-PROVISION-BE-01)', () => {
  let controller: CompaniesController;
  let serviceMock: jest.Mocked<CompaniesService>;

  const validDto: CreateCompanyDto = {
    tenantCode: 'test-tenant',
    name: 'Test Tenant',
    shortName: 'Test',
    tenantKind: 'member',
    modules: ['hrm'],
  };

  const updateDto: UpdateModulesDto = { modules: ['hrm', 'logistics'] };

  const TENANT_ID = 'test-tenant-123';
  const ISSUED_BY = 'test-user@xe.vn';

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';

    serviceMock = {
      listCompanies: jest.fn().mockResolvedValue([]),
      createCompany: jest.fn().mockResolvedValue({ tenantId: TENANT_ID }),
      activateTenant: jest.fn().mockResolvedValue(undefined),
      suspendTenant: jest.fn().mockResolvedValue(undefined),
      updateModules: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CompaniesService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  const validToken = createInternalJwt({
    iss: 'xevn-internal',
    aud: 'xevn-api',
    sub: ISSUED_BY,
    tenantId: 'xevn',
    companyId: 'holding',
  });

  describe('assertInternal (auth guard)', () => {
    it('rejects when no authorization and no internal api key', async () => {
      await expect(controller.listCompanies(undefined, undefined)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-401',
      });
      expect(serviceMock.listCompanies).not.toHaveBeenCalled();
    });

    it('rejects when invalid JWT', async () => {
      await expect(controller.listCompanies('Bearer invalid', undefined)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-401',
      });
    });

    it('accepts valid x-internal-api-key', async () => {
      const result = await controller.listCompanies(undefined, 'test-key');
      expect(result.code).toBe('XBOS-SETTINGS-200');
      expect(serviceMock.listCompanies).toHaveBeenCalled();
    });

    it('accepts valid JWT', async () => {
      const result = await controller.listCompanies(`Bearer ${validToken}`, undefined);
      expect(result.code).toBe('XBOS-SETTINGS-200');
      expect(serviceMock.listCompanies).toHaveBeenCalled();
    });
  });

  describe('GET /settings/companies', () => {
    it('returns ok envelope with items', async () => {
      const items = [
        { tenantId: 't1', name: 'Tenant 1', shortName: 'T1', tenantKind: 'member', defaultCompanyId: 'main', modules: ['hrm'], status: 'active', legalEntity: null },
      ];
      serviceMock.listCompanies.mockResolvedValue(items);

      const result = await controller.listCompanies(`Bearer ${validToken}`, undefined);

      expect(result.code).toBe('XBOS-SETTINGS-200');
      expect(result.message).toBe('Companies loaded');
      expect(result.data).toEqual({ items });
    });
  });

  describe('POST /settings/companies', () => {
    it('returns 201 envelope with tenantId', async () => {
      serviceMock.createCompany.mockResolvedValue({ tenantId: TENANT_ID });

      const result = await controller.createCompany(validDto, `Bearer ${validToken}`, undefined);

      expect(result.code).toBe('XBOS-SETTINGS-201');
      expect(result.message).toBe('Company provisioning initiated');
      expect(result.data).toEqual({ tenantId: TENANT_ID });
      expect(serviceMock.createCompany).toHaveBeenCalledWith(validDto, ISSUED_BY);
    });

    it('rejects unauthenticated', async () => {
      await expect(controller.createCompany(validDto, undefined, undefined)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-401',
      });
      expect(serviceMock.createCompany).not.toHaveBeenCalled();
    });
  });

  describe('PUT /settings/companies/:tenantId/activate', () => {
    it('returns 200 envelope with tenantId on success', async () => {
      const result = await controller.activateTenant(TENANT_ID, `Bearer ${validToken}`, undefined);

      expect(result.code).toBe('XBOS-SETTINGS-200');
      expect(result.message).toBe('Tenant activated');
      expect(result.data).toEqual({ tenantId: TENANT_ID });
      expect(serviceMock.activateTenant).toHaveBeenCalledWith(TENANT_ID, ISSUED_BY);
    });

    it('rejects unauthenticated', async () => {
      await expect(controller.activateTenant(TENANT_ID, undefined, undefined)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-401',
      });
      expect(serviceMock.activateTenant).not.toHaveBeenCalled();
    });
  });

  describe('PUT /settings/companies/:tenantId/suspend', () => {
    it('returns 200 envelope with tenantId on success', async () => {
      const result = await controller.suspendTenant(TENANT_ID, `Bearer ${validToken}`, undefined);

      expect(result.code).toBe('XBOS-SETTINGS-200');
      expect(result.message).toBe('Tenant suspended');
      expect(result.data).toEqual({ tenantId: TENANT_ID });
      expect(serviceMock.suspendTenant).toHaveBeenCalledWith(TENANT_ID, ISSUED_BY);
    });

    it('rejects unauthenticated', async () => {
      await expect(controller.suspendTenant(TENANT_ID, undefined, undefined)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-401',
      });
      expect(serviceMock.suspendTenant).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /settings/companies/:tenantId/modules', () => {
    it('returns 200 envelope with tenantId on success', async () => {
      const result = await controller.updateModules(TENANT_ID, updateDto, `Bearer ${validToken}`, undefined);

      expect(result.code).toBe('XBOS-SETTINGS-200');
      expect(result.message).toBe('Modules updated');
      expect(result.data).toEqual({ tenantId: TENANT_ID });
      expect(serviceMock.updateModules).toHaveBeenCalledWith(TENANT_ID, updateDto, ISSUED_BY);
    });

    it('rejects unauthenticated', async () => {
      await expect(controller.updateModules(TENANT_ID, updateDto, undefined, undefined)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-401',
      });
      expect(serviceMock.updateModules).not.toHaveBeenCalled();
    });
  });

  describe('resolveActor (tested via methods that pass issuedBy)', () => {
    it('uses JWT sub when available (createCompany)', async () => {
      const tokenWithSub = createInternalJwt({
        iss: 'xevn-internal',
        aud: 'xevn-api',
        sub: 'custom-sub@xe.vn',
        email: 'email@xe.vn',
      });

      await controller.createCompany(validDto, `Bearer ${tokenWithSub}`, undefined);

      expect(serviceMock.createCompany).toHaveBeenCalledWith(validDto, 'custom-sub@xe.vn');
    });

    it('falls back to email when no sub (createCompany)', async () => {
      const tokenNoSub = createInternalJwt({
        iss: 'xevn-internal',
        aud: 'xevn-api',
        email: 'fallback@xe.vn',
      });

      await controller.createCompany(validDto, `Bearer ${tokenNoSub}`, undefined);

      expect(serviceMock.createCompany).toHaveBeenCalledWith(validDto, 'fallback@xe.vn');
    });

    it('falls back to system when neither sub nor email (createCompany)', async () => {
      const tokenNoSubNoEmail = createInternalJwt({
        iss: 'xevn-internal',
        aud: 'xevn-api',
      });

      await controller.createCompany(validDto, `Bearer ${tokenNoSubNoEmail}`, undefined);

      expect(serviceMock.createCompany).toHaveBeenCalledWith(validDto, 'system');
    });

    it('uses system when using x-internal-api-key (createCompany)', async () => {
      await controller.createCompany(validDto, undefined, 'test-key');

      expect(serviceMock.createCompany).toHaveBeenCalledWith(validDto, 'system');
    });

    it('uses JWT sub when available (activateTenant)', async () => {
      const tokenWithSub = createInternalJwt({
        iss: 'xevn-internal',
        aud: 'xevn-api',
        sub: 'custom-sub@xe.vn',
        email: 'email@xe.vn',
      });

      await controller.activateTenant(TENANT_ID, `Bearer ${tokenWithSub}`, undefined);

      expect(serviceMock.activateTenant).toHaveBeenCalledWith(TENANT_ID, 'custom-sub@xe.vn');
    });

    it('uses system when using x-internal-api-key (activateTenant)', async () => {
      await controller.activateTenant(TENANT_ID, undefined, 'test-key');

      expect(serviceMock.activateTenant).toHaveBeenCalledWith(TENANT_ID, 'system');
    });

    it('uses JWT sub when available (suspendTenant)', async () => {
      const tokenWithSub = createInternalJwt({
        iss: 'xevn-internal',
        aud: 'xevn-api',
        sub: 'custom-sub@xe.vn',
        email: 'email@xe.vn',
      });

      await controller.suspendTenant(TENANT_ID, `Bearer ${tokenWithSub}`, undefined);

      expect(serviceMock.suspendTenant).toHaveBeenCalledWith(TENANT_ID, 'custom-sub@xe.vn');
    });

    it('uses system when using x-internal-api-key (suspendTenant)', async () => {
      await controller.suspendTenant(TENANT_ID, undefined, 'test-key');

      expect(serviceMock.suspendTenant).toHaveBeenCalledWith(TENANT_ID, 'system');
    });

    it('uses JWT sub when available (updateModules)', async () => {
      const tokenWithSub = createInternalJwt({
        iss: 'xevn-internal',
        aud: 'xevn-api',
        sub: 'custom-sub@xe.vn',
        email: 'email@xe.vn',
      });

      await controller.updateModules(TENANT_ID, updateDto, `Bearer ${tokenWithSub}`, undefined);

      expect(serviceMock.updateModules).toHaveBeenCalledWith(TENANT_ID, updateDto, 'custom-sub@xe.vn');
    });

    it('uses system when using x-internal-api-key (updateModules)', async () => {
      await controller.updateModules(TENANT_ID, updateDto, undefined, 'test-key');

      expect(serviceMock.updateModules).toHaveBeenCalledWith(TENANT_ID, updateDto, 'system');
    });
  });
});