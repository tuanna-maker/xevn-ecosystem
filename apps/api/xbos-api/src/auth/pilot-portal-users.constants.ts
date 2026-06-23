/**
 * Documented UAT pilot portal personas — see docs/qa/PILOT_TEST_ACCOUNTS.md.
 * Upserted on xbos-api startup (idempotent) so VPS production login works without manual seed.
 */
export const PILOT_PORTAL_DEV_PASSWORD = 'Xevn@2026';

export type PilotPortalUser = {
  userId: string;
  displayName: string;
  tenantId: string;
  roleCode: string;
  companyId: string;
};

export const PILOT_PORTAL_USERS: PilotPortalUser[] = [
  { userId: 'ceo@xe.vn', displayName: 'CEO Tập đoàn', tenantId: 'xevn', roleCode: 'group_ceo', companyId: 'holding' },
  { userId: 'du-lich.ceo@xe.vn', displayName: 'CEO Du lịch XeVN', tenantId: 'xe-du-lich', roleCode: 'subsidiary_ceo', companyId: 'main' },
  { userId: 'du-lich.hr@xe.vn', displayName: 'HR Du lịch XeVN (HRBP)', tenantId: 'xe-du-lich', roleCode: 'HRBP_MANAGER', companyId: 'main' },
  { userId: 'vietnam.ceo@xe.vn', displayName: 'CEO X.E Việt Nam', tenantId: 'xe-vietnam', roleCode: 'subsidiary_ceo', companyId: 'main' },
  { userId: 'tmdv.ceo@xe.vn', displayName: 'CEO TM-DV', tenantId: 'xe-tmdv', roleCode: 'subsidiary_ceo', companyId: 'main' },
  { userId: 'visun.ceo@xe.vn', displayName: 'CEO Visun', tenantId: 'visun', roleCode: 'subsidiary_ceo', companyId: 'main' },
];

/** Super-dev multi-tenant account — portal password only (memberships from org seed). */
export const PILOT_SUPER_DEV_PORTAL_USER = {
  userId: 'admin@xe.vn',
  displayName: 'Admin Dev (đa tenant)',
} as const;
