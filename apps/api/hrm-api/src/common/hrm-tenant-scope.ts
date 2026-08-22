/**
 * @CODE-MEMORY
 * Screen:     N/A (BE) — tenant-only scope constants & helpers
 * UC:         SA-HRM-TENANT-ONLY-SCOPE-01 · ADR-HRM-TENANT-ONLY-SCOPE-20260822
 * Purpose:    SoT legacy OU → tenant_id map; feature flag; rollup tenant list.
 * WorkItem:   HRM-TENANT-ONLY-SCOPE-BE-01
 * Coded:      2026-08-22
 * Ref:        docs/program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md
 * must_keep:  Legacy OU bridge until Phase 5 data fully on main partition
 * LastVerified: hrm-tenant-scope.spec.ts
 */

/** Legacy operating-unit slugs (pre tenant-only migration). */
export const HRM_LEGACY_OU_SLUGS = [
  'holding',
  'trsport',
  'logistics',
  'finance',
  'services',
] as const;

export type HrmLegacyOuSlug = (typeof HRM_LEGACY_OU_SLUGS)[number];

/** Pilot member tenants for group CEO rollup (registry-aligned). */
export const HRM_GROUP_ROLLUP_TENANT_IDS = [
  'xevn',
  'visun',
  'xe-tmdv',
  'xe-du-lich',
  'xe-vietnam',
] as const;

export type HrmGroupRollupTenantId = (typeof HRM_GROUP_ROLLUP_TENANT_IDS)[number];

/** Legacy OU slug → target tenant_id (migrate + bridge only). */
export const HRM_LEGACY_OU_TO_TENANT: Record<HrmLegacyOuSlug, HrmGroupRollupTenantId> = {
  holding: 'xevn',
  trsport: 'xe-tmdv',
  logistics: 'visun',
  finance: 'xe-du-lich',
  services: 'xe-vietnam',
};

export const HRM_TENANT_TO_LEGACY_OU: Record<string, string> = Object.fromEntries(
  Object.entries(HRM_LEGACY_OU_TO_TENANT).map(([ou, tenant]) => [tenant, ou]),
);

/** Display labels for tenant filter dropdown (portal / operating-units bridge). */
export const HRM_TENANT_DISPLAY_NAMES: Record<string, string> = {
  xevn: 'Tập đoàn XeVN',
  visun: 'Công ty TNHH Du lịch Visun',
  'xe-tmdv': 'Công ty Cổ phần Thương mại và Dịch vụ X.E',
  'xe-du-lich': 'Công ty TNHH Du lịch X.E Việt Nam',
  'xe-vietnam': 'Công ty TNHH X.E Việt Nam',
};

export function isHrmTenantOnlyScopeEnabled(): boolean {
  const raw = (process.env.HRM_TENANT_ONLY_SCOPE ?? 'false').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

/** Phase 5 — when false, SQL scope uses tenant_id + main only (no legacy OU OR branch). */
export function isHrmTenantLegacyBridgeEnabled(): boolean {
  const raw = (process.env.HRM_TENANT_ONLY_LEGACY_BRIDGE ?? 'false')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export function isLegacyOperatingUnitSlug(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (HRM_LEGACY_OU_SLUGS as readonly string[]).includes(normalized);
}

/** Map legacy OU query param to tenant_id for group CEO narrow filter. */
export function resolveTenantIdFromLegacyOuOrTenant(
  requestedCompanyOrTenant: string,
): string | null {
  const normalized = requestedCompanyOrTenant.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (isLegacyOperatingUnitSlug(normalized)) {
    return HRM_LEGACY_OU_TO_TENANT[normalized as keyof typeof HRM_LEGACY_OU_TO_TENANT];
  }
  if ((HRM_GROUP_ROLLUP_TENANT_IDS as readonly string[]).includes(normalized)) {
    return normalized;
  }
  return null;
}

export function legacyOuSlugsForTenantIds(tenantIds: readonly string[]): string[] {
  const out: string[] = [];
  for (const tenantId of tenantIds) {
    const ou = HRM_TENANT_TO_LEGACY_OU[tenantId.trim().toLowerCase()];
    if (ou) {
      out.push(ou);
    }
  }
  return out;
}

/** Vietnamese display name for tenant_id (employees company column after tenant-only migrate). */
export function resolveHrmTenantDisplayNameVi(
  tenantId: string | null | undefined,
): string | null {
  const key = tenantId?.trim().toLowerCase() ?? '';
  if (!key) {
    return null;
  }
  return HRM_TENANT_DISPLAY_NAMES[key] ?? null;
}
