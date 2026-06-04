/** Registered satellite / spoke module codes (UC-XBOS-07). Case-insensitive match. */
export const REGISTERED_SATELLITE_MODULE_CODES = new Set([
  'trsport',
  'lgts',
  'logistics',
  'fleet',
  'operations',
  'hrm-admin',
  'hrm',
  'finance-tax',
  'accounting',
  'kpi-engine',
  'xbos',
  'web-portal',
  'system',
]);

export const VIOLATION_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type ViolationSeverity = (typeof VIOLATION_SEVERITIES)[number];

export function normalizeModuleCode(moduleCode: string): string {
  return moduleCode.trim().toLowerCase();
}

export function isRegisteredModuleCode(moduleCode: string): boolean {
  return REGISTERED_SATELLITE_MODULE_CODES.has(normalizeModuleCode(moduleCode));
}
