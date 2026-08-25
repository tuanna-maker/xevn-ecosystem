/** Bridge for seed scripts — mirrors apps/api/hrm-api tenant scope maps. */
export const HRM_LEGACY_OU_TO_TENANT = {
  holding: 'xevn',
  trsport: 'xe-tmdv',
  logistics: 'visun',
  finance: 'xe-du-lich',
  services: 'xe-vietnam',
};

export const HRM_TENANT_TO_LEGACY_OU = Object.fromEntries(
  Object.entries(HRM_LEGACY_OU_TO_TENANT).map(([ou, tenant]) => [tenant, ou]),
);
