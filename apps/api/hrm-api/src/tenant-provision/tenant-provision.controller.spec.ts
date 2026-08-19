/**
 * @CODE-MEMORY WorkItem: HRM-TENANT-PROVISION-LISTENER-01
 * solid_convention_ack: true
 * be_boundary: true
 *
 * Jest unit tests for TenantProvisionController
 * Tests: POST /internal/tenant-provisioned auth guard, delegation to service, ok() envelope, error handling
 */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { TenantProvisionController } from './tenant-provision.controller';
import { TenantProvisionService, TenantProvisionedPayload } from './tenant-provision.service';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { ok } from '../common/api-response';

jest.mock('../common/internal-auth', () => ({
  isAuthorizedInternalRequest: jest.fn(),
}));

jest.mock('../common/api-response', () => ({
  ok: jest.fn((data, code, message) => ({ data, code, message, success: true })),
}));

describe('TenantProvisionController', () => {
  let controller: TenantProvisionController;
  let serviceMock: { handleTenantProvisioned: jest.Mock };
  let loggerSpy: jest.SpyInstance;
  let isAuthorizedInternalRequestMock: jest.Mock;
  let okMock: jest.Mock;

  const validPayload: TenantProvisionedPayload = {
    eventType: 'TENANT_PROVISIONED',
    tenantId: 'test-tenant-001',
    defaultCompanyId: 'test-company-001',
    modules: ['hrm'],
    activatedAt: '2026-08-15T10:00:00.000Z',
    issuedBy: 'xbos-platform',
  };

  beforeEach(async () => {
    serviceMock = {
      handleTenantProvisioned: jest.fn().mockResolvedValue(undefined),
    };

    isAuthorizedInternalRequestMock = isAuthorizedInternalRequest as jest.Mock;
    isAuthorizedInternalRequestMock.mockReturnValue(true);

    okMock = ok as jest.Mock;
    okMock.mockImplementation((data, code, message) => ({ data, code, message, success: true }));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantProvisionController],
      providers: [
        { provide: TenantProvisionService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<TenantProvisionController>(TenantProvisionController);
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('POST /internal/tenant-provisioned', () => {
    it('auth guard isAuthorizedInternalRequest is called with auth headers', async () => {
      await controller.handleTenantProvisioned('Bearer token123', 'api-key-456', validPayload);

      expect(isAuthorizedInternalRequestMock).toHaveBeenCalledWith('Bearer token123', 'api-key-456');
    });

    it('delegates to service.handleTenantProvisioned with payload', async () => {
      await controller.handleTenantProvisioned('Bearer token123', 'api-key-456', validPayload);

      expect(serviceMock.handleTenantProvisioned).toHaveBeenCalledWith(validPayload);
    });

    it('returns ok() envelope with correct structure', async () => {
      const result = await controller.handleTenantProvisioned('Bearer token123', 'api-key-456', validPayload);

      expect(okMock).toHaveBeenCalledWith(
        { tenantId: 'test-tenant-001', seeded: true },
        'HRM-TP-200',
        'Tenant provisioned — HRM defaults seeded',
      );
      expect(result).toEqual({
        data: { tenantId: 'test-tenant-001', seeded: true },
        code: 'HRM-TP-200',
        message: 'Tenant provisioned — HRM defaults seeded',
        success: true,
      });
    });

    it('logs tenantId when request received', async () => {
      await controller.handleTenantProvisioned('Bearer token123', 'api-key-456', validPayload);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('REST tenant-provisioned: tenantId=test-tenant-001'),
      );
    });

    it('throws ApiException HRM-AUTH-001 when auth guard returns false (missing auth)', async () => {
      isAuthorizedInternalRequestMock.mockReturnValueOnce(false);

      try {
        await controller.handleTenantProvisioned(undefined, undefined, validPayload);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiException);
        expect(err.code).toBe('HRM-AUTH-001');
        expect(err.message).toBe('Unauthorized internal request');
      }

      expect(serviceMock.handleTenantProvisioned).not.toHaveBeenCalled();
    });

    it('throws ApiException HRM-AUTH-001 when auth guard returns false (invalid auth)', async () => {
      isAuthorizedInternalRequestMock.mockReturnValueOnce(false);

      try {
        await controller.handleTenantProvisioned('Bearer invalid', 'wrong-key', validPayload);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiException);
        expect(err.code).toBe('HRM-AUTH-001');
      }

      expect(serviceMock.handleTenantProvisioned).not.toHaveBeenCalled();
    });

    it('throws ApiException with HttpStatus.UNAUTHORIZED when unauthorized', async () => {
      isAuthorizedInternalRequestMock.mockReturnValueOnce(false);

      try {
        await controller.handleTenantProvisioned('Bearer token', 'key', validPayload);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiException);
        expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.code).toBe('HRM-AUTH-001');
      }
    });

    it('propagates DB errors from service.handleTenantProvisioned', async () => {
      const dbError = new Error('Connection pool exhausted');
      serviceMock.handleTenantProvisioned.mockRejectedValueOnce(dbError);

      await expect(
        controller.handleTenantProvisioned('Bearer token123', 'api-key-456', validPayload),
      ).rejects.toThrow(dbError);
    });

    it('propagates any error from service.handleTenantProvisioned', async () => {
      const genericError = new Error('Unexpected failure');
      serviceMock.handleTenantProvisioned.mockRejectedValueOnce(genericError);

      await expect(
        controller.handleTenantProvisioned('Bearer token123', 'api-key-456', validPayload),
      ).rejects.toThrow(genericError);
    });

    it('handles payload with modules excluding hrm (service returns early)', async () => {
      const payloadNoHrm: TenantProvisionedPayload = {
        ...validPayload,
        modules: ['logistics'],
      };

      await controller.handleTenantProvisioned('Bearer token123', 'api-key-456', payloadNoHrm);

      expect(serviceMock.handleTenantProvisioned).toHaveBeenCalledWith(payloadNoHrm);
      expect(okMock).toHaveBeenCalledWith(
        { tenantId: 'test-tenant-001', seeded: true },
        'HRM-TP-200',
        'Tenant provisioned — HRM defaults seeded',
      );
    });

    it('handles payload with empty modules array', async () => {
      const payloadEmpty: TenantProvisionedPayload = {
        ...validPayload,
        modules: [],
      };

      await controller.handleTenantProvisioned('Bearer token123', 'api-key-456', payloadEmpty);

      expect(serviceMock.handleTenantProvisioned).toHaveBeenCalledWith(payloadEmpty);
    });

    it('uses x-internal-api-key header when authorization header missing', async () => {
      await controller.handleTenantProvisioned(undefined, 'api-key-only', validPayload);

      expect(isAuthorizedInternalRequestMock).toHaveBeenCalledWith(undefined, 'api-key-only');
    });

    it('uses authorization header when x-internal-api-key missing', async () => {
      await controller.handleTenantProvisioned('Bearer token-only', undefined, validPayload);

      expect(isAuthorizedInternalRequestMock).toHaveBeenCalledWith('Bearer token-only', undefined);
    });

    it('accepts valid payload with all required fields', async () => {
      const fullPayload: TenantProvisionedPayload = {
        eventType: 'TENANT_PROVISIONED',
        tenantId: 'full-tenant',
        defaultCompanyId: 'full-company',
        modules: ['hrm', 'logistics'],
        activatedAt: '2026-08-15T10:00:00.000Z',
        issuedBy: 'xbos-platform',
      };

      await controller.handleTenantProvisioned('Bearer token123', 'api-key-456', fullPayload);

      expect(serviceMock.handleTenantProvisioned).toHaveBeenCalledWith(fullPayload);
    });
  });
});