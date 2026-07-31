import { ApiException } from './api.exception';
import { signServiceJwt } from './jwt-sign';
import {
  assertResourceInHrmScope,
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  pushCompanyIdUuidFilter,
  pushEmployeeListScopeFilters,
  pushWorkforceEmployeeScopeFilter,
  expandHrmTextCompanyIds,
  normalizeHomeSummaryCompanyId,
  normalizePayrollListCompanyId,
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

  it('expands main rollup when mobile login JWT uses holding slug (W2A standalone)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
      employee_id: 'portal-gceo-uuid',
      roles: ['employee', 'manager', 'hr_manager'],
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

  it('pushWorkforceEmployeeScopeFilter maps holding slug via employee IN (D-W7-HOME-WHOS-SLUG-01)', () => {
    const filters: string[] = [];
    const values: unknown[] = [];
    const scope = resolveHrmListScope(undefined, 'holding');
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'lr.employee_id');
    expect(filters[0]).toContain('lr.employee_id IN');
    expect(filters[0]).toContain("company_id = $1::text");
    expect(filters[0]).not.toContain('::uuid');
    expect(values).toEqual(['holding']);
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

  it('narrows to trsport when group CEO filters operating unit (AC-INT-SW-02)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'trsport');
    expect(scope.companyIds).toEqual(['trsport']);
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

describe('mobile payroll / manager pending scope (J-MOB-04/05)', () => {
  const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';

  it('normalizePayrollListCompanyId maps mobile company_uuid query to holding slug', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
    expect(normalizePayrollListCompanyId(`Bearer ${token}`, holdingUuid)).toBe('holding');
    expect(normalizePayrollListCompanyId(`Bearer ${token}`, 'main')).toBe('main');
  });

  it('expandHrmTextCompanyIds includes slug + uuid for manager pending list', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, holdingUuid);
    const expanded = expandHrmTextCompanyIds(scope, `Bearer ${token}`, holdingUuid);
    expect(expanded).toEqual(expect.arrayContaining(['holding', holdingUuid]));
  });

  it('expandHrmTextCompanyIds aligns holding slug probe when row stores uuid TEXT', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'holding');
    const expanded = expandHrmTextCompanyIds(scope, `Bearer ${token}`, 'holding');
    expect(expanded).toEqual(expect.arrayContaining(['holding', holdingUuid]));
  });
});

describe('home summary scope (D-MOB-HOME-SUMMARY-400-01)', () => {
  const trsportUuid = '32a3cdcb-c534-4e47-80f9-d2f156e65094';

  it('normalizeHomeSummaryCompanyId maps mobile company_uuid to member JWT slug', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0002@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      company_uuid: trsportUuid,
      roleCode: 'employee',
    });
    expect(normalizeHomeSummaryCompanyId(`Bearer ${token}`, trsportUuid)).toBe('trsport');
  });

  it('normalizeHomeSummaryCompanyId rewrites holding rollup to member slug for trsport JWT', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0002@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      company_uuid: trsportUuid,
      roleCode: 'employee',
    });
    expect(normalizeHomeSummaryCompanyId(`Bearer ${token}`, 'holding')).toBe('trsport');
  });

  it('normalizeHomeSummaryCompanyId keeps holding for holding JWT (uat.nv0001)', () => {
    const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
    expect(normalizeHomeSummaryCompanyId(`Bearer ${token}`, holdingUuid)).toBe('holding');
    expect(normalizeHomeSummaryCompanyId(`Bearer ${token}`, 'holding')).toBe('holding');
  });
});

describe('employee restore scope parity (P1-PHASE1-BE-SCOPE-P0-S5-01)', () => {
  it('group CEO main rollup allows holding employee restore guard', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'main', { tenantId: 'xevn' });
    expect(() => assertResourceInHrmScope({ company_id: 'holding' }, scope)).not.toThrow();
  });

  it('member CEO scope rejects holding employee restore guard', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'main', { tenantId: 'xe-du-lich' });
    expect(() => assertResourceInHrmScope({ company_id: 'holding' }, scope)).toThrow(
      expect.objectContaining<ApiException>({ code: 'HRM-SCOPE-409' }),
    );
  });

  it('member CEO scope rejects holding UUID partition row (main slug must not rollup)', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'main', { tenantId: 'xe-du-lich' });
    expect(() =>
      assertResourceInHrmScope(
        {
          company_id: HRM_COMPANY_UUID_BY_SLUG.holding,
          custom_fields: { tenant_id: 'xevn' },
        },
        scope,
      ),
    ).toThrow(expect.objectContaining<ApiException>({ code: 'HRM-SCOPE-409' }));
  });

  it('member CEO scope rejects master-tenant archived row even when company_id=main', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    const scope = resolveHrmListScope(`Bearer ${token}`, 'main', { tenantId: 'xe-du-lich' });
    expect(() =>
      assertResourceInHrmScope(
        { company_id: 'main', custom_fields: { tenant_id: 'xevn' } },
        scope,
        { mismatchCode: 'HRM-EMP-409' },
      ),
    ).toThrow(expect.objectContaining<ApiException>({ code: 'HRM-EMP-409' }));
  });
});
