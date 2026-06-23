import { createHmac } from 'node:crypto';
import {
  normalizeHrmCatalogSyncRequestCompanyId,
  resolveHrmCatalogSyncScope,
} from './hrm-catalog-sync-scope';

function signServiceJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `Bearer ${header}.${body}.${sig}`;
}

describe('hrm-catalog-sync-scope (J-XBOS-02 / ADR §4)', () => {
  it('maps group CEO holding request to main before strict scope check', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    expect(normalizeHrmCatalogSyncRequestCompanyId(token, 'holding')).toBe('main');
    expect(normalizeHrmCatalogSyncRequestCompanyId(token, 'main')).toBe('main');
  });

  it('does not map holding for member CEO', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    expect(normalizeHrmCatalogSyncRequestCompanyId(token, 'holding')).toBe('holding');
  });

  it('resolveHrmCatalogSyncScope persists holding partition for group CEO main', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    expect(resolveHrmCatalogSyncScope(token, { tenantId: 'xevn', companyId: 'main' })).toEqual({
      tenantId: 'xevn',
      catalogCompanyId: 'holding',
    });
    expect(resolveHrmCatalogSyncScope(token, { tenantId: 'xevn', companyId: 'holding' })).toEqual({
      tenantId: 'xevn',
      catalogCompanyId: 'holding',
    });
  });

  it('resolveHrmCatalogSyncScope keeps member CEO on main partition', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    expect(resolveHrmCatalogSyncScope(token, { tenantId: 'xe-du-lich', companyId: 'main' })).toEqual({
      tenantId: 'xe-du-lich',
      catalogCompanyId: 'main',
    });
  });

  it('throws SCOPE_CONTEXT_MISMATCH when member CEO sends holding', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    expect(() =>
      resolveHrmCatalogSyncScope(token, { tenantId: 'xe-du-lich', companyId: 'holding' }),
    ).toThrow('companyId mismatches token scope');
  });
});
