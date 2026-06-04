import type { KpiSparkPoint } from '../data/command-center-mock';
import { useCommandCenterKpiRail } from './useCommandCenterKpiRail';

/** @deprecated Prefer `useCommandCenterKpiRail` for strict-mode metadata. */
export function useCommandCenterSparkline(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): KpiSparkPoint[] {
  const { series } = useCommandCenterKpiRail('bod', tenantIdHint, companyIdHint);
  return series;
}
