import { signServiceJwt } from '../common/jwt-sign';
import { resolveScopeContext } from '../common/scope-context';
import { resolveKpiRollupScopeContext } from './kpi-rollup-scope';

describe('resolveKpiRollupScopeContext', () => {
  it('allows group CEO JWT main to query holding rollup', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveKpiRollupScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: 'holding',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'holding' });
  });

  it('allows group CEO JWT main with portal tenantId=main and companyId=holding (P-CC-04c probe)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveKpiRollupScopeContext(`Bearer ${token}`, {
      tenantId: 'main',
      companyId: 'holding',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'holding' });
  });

  it('still rejects holding JWT with main query via base resolver', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      roleCode: 'group_ceo',
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, { tenantId: 'xevn', companyId: 'main' }),
    ).toThrow('companyId mismatches token scope');
  });
});
