import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import {
  getJwtRoleCodeFromClaims,
  isGroupCeoOnMasterTenant,
  isGroupLeadershipRole,
  resolveHrmOperationalCompanyId,
  resolveXbosApiCompanyIdForPath,
  resolveXbosKpiRollupCompanyId,
  resolveXbosStrictCompanyId,
  XBOS_GROUP_HOLDING_COMPANY_ID,
} from './commandCenterScope';
import { minimalScopeJwt } from '../test/jwtTestUtils';

describe('commandCenterScope (ADR C2)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    vi.stubEnv('VITE_STRICT_IDENTITY', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  it('detects group leadership roles', () => {
    expect(isGroupLeadershipRole('group_ceo')).toBe(true);
    expect(isGroupLeadershipRole('group_hrbp')).toBe(true);
    expect(isGroupLeadershipRole('ceo')).toBe(false);
  });

  it('maps group CEO KPI rollup query to holding in dev when partition flag on', () => {
    vi.stubEnv('VITE_KPI_ROLLUP_USE_HOLDING', 'true');
    const jwt = minimalScopeJwt('xevn', 'main');
    const payload = JSON.stringify({ tenantId: 'xevn', companyId: 'main', roleCode: 'group_ceo' });
    const token = `h.${Buffer.from(payload, 'utf8').toString('base64url')}.s`;
    sessionStorage.setItem('xevn.portal.accessToken', token);
    vi.stubEnv('VITE_SERVICE_JWT_TOKEN', jwt);

    expect(getJwtRoleCodeFromClaims({ roleCode: 'group_ceo' })).toBe('group_ceo');
    expect(isGroupCeoOnMasterTenant('xevn')).toBe(true);
    expect(resolveXbosKpiRollupCompanyId('xevn', MEMBER_DEFAULT_COMPANY_ID)).toBe(
      XBOS_GROUP_HOLDING_COMPANY_ID,
    );
  });

  it('keeps KPI rollup query main on production build (HTTPS pilot — no holding 409)', () => {
    vi.stubEnv('VITE_KPI_ROLLUP_USE_HOLDING', 'false');
    vi.stubEnv('MODE', 'production');
    const jwt = minimalScopeJwt('xevn', 'main');
    const payload = JSON.stringify({ tenantId: 'xevn', companyId: 'main', roleCode: 'group_ceo' });
    const token = `h.${Buffer.from(payload, 'utf8').toString('base64url')}.s`;
    sessionStorage.setItem('xevn.portal.accessToken', token);
    vi.stubEnv('VITE_SERVICE_JWT_TOKEN', jwt);

    expect(resolveXbosKpiRollupCompanyId('xevn', MEMBER_DEFAULT_COMPANY_ID)).toBe(
      MEMBER_DEFAULT_COMPANY_ID,
    );
  });

  it('normalizes master tenant slug mistaken as companyId for HRM embed', () => {
    expect(resolveHrmOperationalCompanyId('xevn', 'xevn')).toBe(MEMBER_DEFAULT_COMPANY_ID);
  });

  it('normalizes holding hint to main for HRM operational lists (EX-SA01-P1-03)', () => {
    const jwt = minimalScopeJwt('xevn', 'main');
    sessionStorage.setItem('xevn.portal.accessToken', jwt);
    vi.stubEnv('VITE_SERVICE_JWT_TOKEN', jwt);

    expect(resolveHrmOperationalCompanyId('xevn', 'holding')).toBe(MEMBER_DEFAULT_COMPANY_ID);
    expect(resolveHrmOperationalCompanyId('xevn', 'main')).toBe('main');
  });

  it('keeps member CEO rollup company as main', () => {
    const payload = JSON.stringify({ tenantId: 'xe-du-lich', companyId: 'main', roleCode: 'ceo' });
    const token = `h.${Buffer.from(payload, 'utf8').toString('base64url')}.s`;
    sessionStorage.setItem('xevn.portal.accessToken', token);

    expect(resolveXbosKpiRollupCompanyId('xe-du-lich', 'main')).toBe('main');
  });

  it('coerces holding to main on strict workflow paths (EX-SA01-P1-04)', () => {
    const jwt = minimalScopeJwt('xevn', 'main');
    const payload = JSON.stringify({ tenantId: 'xevn', companyId: 'main', roleCode: 'group_ceo' });
    const token = `h.${Buffer.from(payload, 'utf8').toString('base64url')}.s`;
    sessionStorage.setItem('xevn.portal.accessToken', token);
    vi.stubEnv('VITE_SERVICE_JWT_TOKEN', jwt);

    expect(resolveXbosStrictCompanyId('xevn', 'holding')).toBe(MEMBER_DEFAULT_COMPANY_ID);
    expect(resolveXbosApiCompanyIdForPath('/workflow-engine/instances/1/detail', 'xevn', 'holding')).toBe(
      MEMBER_DEFAULT_COMPANY_ID,
    );
    vi.stubEnv('VITE_KPI_ROLLUP_USE_HOLDING', 'true');
    expect(resolveXbosApiCompanyIdForPath('/kpi-engine/rollup', 'xevn', MEMBER_DEFAULT_COMPANY_ID)).toBe(
      XBOS_GROUP_HOLDING_COMPANY_ID,
    );
  });
});
