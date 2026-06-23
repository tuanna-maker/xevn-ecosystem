import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { PlatformAuditService } from './platform-audit.service';
import { XbosDbWriteAuditInterceptor } from './xbos-db-write-audit.interceptor';

describe('XbosDbWriteAuditInterceptor', () => {
  const platformAudit = { emit: jest.fn().mockResolvedValue(undefined) } as unknown as PlatformAuditService;
  let interceptor: XbosDbWriteAuditInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new XbosDbWriteAuditInterceptor(platformAudit);
  });

  function mockContext(method: string, path: string, headers: Record<string, string> = {}) {
    const req = {
      method,
      originalUrl: path,
      url: path,
      headers,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
  }

  it('emits platform audit on successful PUT with response code from body', async () => {
    const ctx = mockContext('PUT', '/api/xbos/infrastructure/settings', {
      'x-tenant-id': 'xevn',
      'x-company-id': 'holding',
    });
    const next: CallHandler = {
      handle: () =>
        of({
          success: true,
          code: 'XBOS-INFRA-201',
          message: 'Infrastructure settings saved',
          data: {},
        }),
    };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(platformAudit.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'xevn',
        companyId: 'holding',
        action: 'xbos.db_write',
        entityType: 'http_mutation',
        entityId: '/api/xbos/infrastructure/settings',
        payload: {
          path: '/api/xbos/infrastructure/settings',
          method: 'PUT',
          responseCode: 'XBOS-INFRA-201',
        },
      }),
    );
  });

  it('skips audit for GET requests', async () => {
    const ctx = mockContext('GET', '/api/xbos/infrastructure/settings');
    const next: CallHandler = {
      handle: () => of({ success: true, code: 'XBOS-INFRA-200', data: {} }),
    };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(platformAudit.emit).not.toHaveBeenCalled();
  });

  it('skips audit when response envelope is not success', async () => {
    const ctx = mockContext('POST', '/api/xbos/alerts/violations');
    const next: CallHandler = {
      handle: () => of({ success: false, code: 'XBOS-ERR', message: 'failed' }),
    };

    await lastValueFrom(interceptor.intercept(ctx, next));

    expect(platformAudit.emit).not.toHaveBeenCalled();
  });
});
