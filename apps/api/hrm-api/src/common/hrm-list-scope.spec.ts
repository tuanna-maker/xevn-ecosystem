import { ApiException } from './api.exception';
import { signServiceJwt } from './jwt-sign';
import {
  assertResourceInHrmScope,
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  pushCompanyIdUuidFilter,
  pushEmployeeListScopeFilters,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmOperationsPersistCompanyId,
  resolveHrmPersistCompanyIdText,
  resolveHrmSettingsCatalogCompanyId,
} from './hrm-list-scope';

describe('resolveHrmListScope (ADR-HRM-RBAC-SCOPE-LADDER)', () => {
  it('expands main to group member slugs for group_ceo on master tenant', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'main');
    expect(scope.masterTenantPartition).toBe(true);
    expect(scope.companyIds).toEqual([...HRM_GROUP_MEMBER_COMPANY_SLUGS]);
  });

  it('keeps single main for member subsidiary CEO', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'main');
    expect(scope.companyIds).toEqual(['main']);
    expect(scope.memberTenantId).toBe('xe-du-lich');
    expect(scope.masterTenantPartition).toBe(false);
  });

  it('maps settings-catalog overview company main to holding for group CEO', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    expect(resolveHrmSettingsCatalogCompanyId(`Bearer ${token}`, 'xevn', 'main')).toBe('holding');
    expect(resolveHrmSettingsCatalogCompanyId(`Bearer ${token}`, 'xe-du-lich', 'main')).toBe('main');
  });

  it('maps settings-catalog main to holding for internal service on master tenant', () => {
    expect(resolveHrmSettingsCatalogCompanyId(undefined, 'xevn', 'main')).toBe('holding');
    expect(resolveHrmSettingsCatalogCompanyId(undefined, 'xe-du-lich', 'main')).toBe('main');
  });

  it('expands main for internal service calls on master tenant without JWT', () => {
    const scope = resolveHrmListScope(undefined, 'main', { tenantId: 'xevn' });
    expect(scope.masterTenantPartition).toBe(true);
    expect(scope.companyIds).toEqual([...HRM_GROUP_MEMBER_COMPANY_SLUGS]);
  });

  it('pushEmployeeListScopeFilters treats blank tenant_id as master partition', () => {
    const filters: string[] = [];
    const values: unknown[] = [];
    const scope = resolveHrmListScope(undefined, 'main', { tenantId: 'xevn' });
    pushEmployeeListScopeFilters(filters, values, scope);
    expect(filters.join(' ')).toContain('NULLIF(TRIM(custom_fields');
  });

  it('pushWorkforceEmployeeScopeFilter aligns with employee list partition (J-HRM-01)', () => {
    const filters: string[] = [];
    const values: unknown[] = [];
    const scope = resolveHrmListScope(undefined, 'main', { tenantId: 'xevn' });
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'ec.employee_id');
    expect(filters[0]).toContain('ec.employee_id IN');
    expect(filters[0]).toContain('FROM public.employees');
    expect(filters[0]).toContain("custom_fields->>'tenant_id'");
    expect(values).toEqual(['xevn', [...HRM_GROUP_MEMBER_COMPANY_SLUGS]]);
  });

  it('does not expand when company query is a member operating slug', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'holding');
    expect(scope.companyIds).toEqual(['holding']);
    expect(scope.masterTenantPartition).toBe(false);
  });
});

describe('pushCompanyIdUuidFilter / resolveHrmOperationsPersistCompanyId', () => {
  it('maps group main rollup to member UUID IN list', () => {
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdUuidFilter(filters, values, [...HRM_GROUP_MEMBER_COMPANY_SLUGS]);
    expect(filters[0]).toContain('company_id = ANY');
    expect(values[0]).toEqual(Object.values(HRM_COMPANY_UUID_BY_SLUG));
  });

  it('persists holding UUID when create payload uses main (group CEO)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    expect(resolveHrmOperationsPersistCompanyId(`Bearer ${token}`, 'main')).toBe(
      HRM_COMPANY_UUID_BY_SLUG.holding,
    );
  });

  it('persists holding UUID for internal key on main without JWT', () => {
    expect(resolveHrmOperationsPersistCompanyId(undefined, 'main', { tenantId: 'xevn' })).toBe(
      HRM_COMPANY_UUID_BY_SLUG.holding,
    );
  });
});

describe('assertResourceInHrmScope (P1-01)', () => {
  it('allows resource company within rollup scope', () => {
    const scope = resolveHrmListScope(undefined, 'holding');
    expect(() => assertResourceInHrmScope({ company_id: 'holding' }, scope)).not.toThrow();
  });

  it('rejects resource outside scope with HRM-SCOPE-409', () => {
    const scope = resolveHrmListScope(undefined, 'holding');
    expect(() => assertResourceInHrmScope({ company_id: 'other-co' }, scope)).toThrow(
      expect.objectContaining<ApiException>({ code: 'HRM-SCOPE-409' }),
    );
  });

  it('allows holding UUID when group CEO scope uses member slugs (P1-02)', () => {
    const scope = resolveHrmListScope(undefined, 'main', { tenantId: 'xevn' });
    expect(() =>
      assertResourceInHrmScope(
        { company_id: '10000000-0000-4000-8000-000000000001' },
        scope,
      ),
    ).not.toThrow();
  });
});

describe('resolveHrmPersistCompanyIdText (EX-SA01-P1-01)', () => {
  it('maps main to holding for group CEO rollup writes', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    expect(resolveHrmPersistCompanyIdText(`Bearer ${token}`, 'main')).toBe('holding');
  });

  it('keeps main for member tenant writes (no rollup)', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    expect(resolveHrmPersistCompanyIdText(`Bearer ${token}`, 'main')).toBe('main');
  });
});
