import {
  HRM_GROUP_ROLLUP_TENANT_IDS,
  HRM_LEGACY_OU_TO_TENANT,
  isLegacyOperatingUnitSlug,
  legacyOuSlugsForTenantIds,
  resolveHrmTenantDisplayNameVi,
  resolveTenantIdFromLegacyOuOrTenant,
} from './hrm-tenant-scope';

describe('hrm-tenant-scope', () => {
  it('maps legacy OU slugs to tenant_id', () => {
    expect(HRM_LEGACY_OU_TO_TENANT.logistics).toBe('visun');
    expect(HRM_LEGACY_OU_TO_TENANT.trsport).toBe('xe-tmdv');
    expect(resolveTenantIdFromLegacyOuOrTenant('logistics')).toBe('visun');
    expect(resolveTenantIdFromLegacyOuOrTenant('visun')).toBe('visun');
  });

  it('detects legacy OU slugs', () => {
    expect(isLegacyOperatingUnitSlug('trsport')).toBe(true);
    expect(isLegacyOperatingUnitSlug('visun')).toBe(false);
  });

  it('builds legacy OU list for rollup tenants', () => {
    expect(legacyOuSlugsForTenantIds(['visun', 'xe-tmdv'])).toEqual([
      'logistics',
      'trsport',
    ]);
    expect(
      legacyOuSlugsForTenantIds([...HRM_GROUP_ROLLUP_TENANT_IDS]).length,
    ).toBe(5);
  });

  it('resolveHrmTenantDisplayNameVi maps registry tenants', () => {
    expect(resolveHrmTenantDisplayNameVi('visun')).toBe(
      'Công ty TNHH Du lịch Visun',
    );
    expect(resolveHrmTenantDisplayNameVi('xevn')).toBe('Tập đoàn XeVN');
  });
});
