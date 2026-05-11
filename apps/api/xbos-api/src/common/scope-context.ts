import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { getVerifiedInternalJwtPayload } from './internal-auth';

type ScopeContext = {
  tenantId: string;
  companyId: string;
};

function readClaim(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function assertScopeId(value: string | undefined, field: 'tenantId' | 'companyId'): string {
  if (!value) {
    throw new ApiException(
      field === 'tenantId' ? 'SCOPE_TENANT_REQUIRED' : 'SCOPE_COMPANY_REQUIRED',
      `${field} is required`,
      HttpStatus.BAD_REQUEST,
      { field },
    );
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(value)) {
    throw new ApiException(
      field === 'tenantId' ? 'SCOPE_TENANT_INVALID' : 'SCOPE_COMPANY_INVALID',
      `${field} format is invalid`,
      HttpStatus.BAD_REQUEST,
      { field, value },
    );
  }
  return value;
}

export function resolveScopeContext(
  authorization: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): ScopeContext {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization);
  const claimTenantId = jwtPayload
    ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid')
    : undefined;
  const claimCompanyId = jwtPayload
    ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid')
    : undefined;

  const tenantId = assertScopeId(claimTenantId ?? requested.tenantId, 'tenantId');
  const companyId = assertScopeId(claimCompanyId ?? requested.companyId, 'companyId');

  if (claimTenantId && requested.tenantId && claimTenantId !== requested.tenantId) {
    throw new ApiException('SCOPE_CONTEXT_MISMATCH', 'tenantId mismatches token scope', HttpStatus.CONFLICT, {
      field: 'tenantId',
      token: claimTenantId,
      request: requested.tenantId,
    });
  }
  if (claimCompanyId && requested.companyId && claimCompanyId !== requested.companyId) {
    throw new ApiException('SCOPE_CONTEXT_MISMATCH', 'companyId mismatches token scope', HttpStatus.CONFLICT, {
      field: 'companyId',
      token: claimCompanyId,
      request: requested.companyId,
    });
  }

  return { tenantId, companyId };
}
