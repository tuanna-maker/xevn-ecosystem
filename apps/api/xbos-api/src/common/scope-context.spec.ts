import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { signServiceJwt } from './jwt-sign';
import { resolveScopeContext } from './scope-context';

describe('resolveScopeContext (UC-ECO-SCOPE-02)', () => {
  it('throws SCOPE_CONTEXT_MISMATCH when header tenant differs from token', () => {
    const token = signServiceJwt({ sub: 'user-1', tenantId: 'xevn', companyId: 'holding' });
    try {
      resolveScopeContext(`Bearer ${token}`, { tenantId: 'other-tenant', companyId: 'holding' });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
      expect((error as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
    }
  });

  it('throws SCOPE_CONTEXT_MISMATCH when header company main differs from token holding (ADR org plane)', () => {
    const token = signServiceJwt({ sub: 'ceo@xe.vn', tenantId: 'xevn', companyId: 'holding' });
    try {
      resolveScopeContext(`Bearer ${token}`, { tenantId: 'xevn', companyId: 'main' });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
      expect((error as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
    }
  });

  it('accepts aligned holding scope for org-foundation paths', () => {
    const token = signServiceJwt({ sub: 'ceo@xe.vn', tenantId: 'xevn', companyId: 'holding' });
    const scope = resolveScopeContext(`Bearer ${token}`, { tenantId: 'xevn', companyId: 'holding' });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'holding' });
  });

  it('accepts portal tenantId=main when JWT tenant is xevn (J-CC-03 HTTPS probe)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'main',
      companyId: 'main',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'main' });
  });
});
