import { MASTER_COMPANY_HOLDING } from '../workflow-engine/workflow-catalog.constants';

/** Company ids under master tenant `xevn` used for holding-level KPI rollup (UC-XBOS-KPI-03). */
export const GROUP_ROLLUP_COMPANY_IDS = [
  MASTER_COMPANY_HOLDING,
  'main',
  'xe-tmdv',
  'xe-du-lich',
  'xe-vietnam',
  'visun',
] as const;

export function isGroupRollupCompanyId(companyId: string): boolean {
  const normalized = companyId.trim().toLowerCase();
  return normalized === MASTER_COMPANY_HOLDING || normalized === 'all';
}
