import {
  getPortalMockCustomers,
  getPortalMockEmployees,
  getPortalMockExecutiveDashboardAlerts,
  getPortalMockExpenseCategories,
  getPortalMockKpiDashboardData,
  getPortalMockKpiMetrics,
  getPortalMockPartners,
  getPortalMockPositions,
  getPortalMockVehicleTypes,
  getPortalMockVendors,
} from '../data/portal-dev-seed';
import { allowMockFallback } from './mockPolicy';

export type PortalListLoadFailure<T> = {
  rows: T[];
  usingMockFallback: boolean;
  loadFailed: boolean;
};

/** M-CC-07 — HR list: strict → empty + loadFailed; dev flag → gated mock rows. */
export function resolveHrPageEmployeesOnFailure(scopeCompanyId: string): PortalListLoadFailure<ReturnType<typeof getPortalMockEmployees>[number]> {
  const rows = getPortalMockEmployees(scopeCompanyId);
  const usingMockFallback = rows.length > 0;
  return {
    rows,
    usingMockFallback,
    loadFailed: !usingMockFallback,
  };
}

/** M-CC-08 — executive cockpit demo metric cards visible only when dev mock flag on. */
export function isExecutiveDashboardDemoLayoutEnabled(): boolean {
  return allowMockFallback();
}

/** M-CC-08 — cockpit alerts when API returns empty (strict → []). */
export function resolveExecutiveDashboardAlertsOnEmpty(): ReturnType<typeof getPortalMockExecutiveDashboardAlerts> {
  return getPortalMockExecutiveDashboardAlerts();
}

/** M-CC-09 — settings business-master list failure. */
export function resolveSettingsBusinessMasterFailure<T>(
  getMockRows: () => T[],
): PortalListLoadFailure<T> {
  const rows = getMockRows();
  const usingMockFallback = rows.length > 0;
  return {
    rows,
    usingMockFallback,
    loadFailed: !usingMockFallback,
  };
}

export function resolvePositionsSettingsFailure() {
  return resolveSettingsBusinessMasterFailure(getPortalMockPositions);
}

export function resolveKpiMetricsSettingsFailure() {
  return resolveSettingsBusinessMasterFailure(getPortalMockKpiMetrics);
}

export function resolveVendorsSettingsFailure() {
  return resolveSettingsBusinessMasterFailure(getPortalMockVendors);
}

export function resolveExpenseCategoriesSettingsFailure() {
  return resolveSettingsBusinessMasterFailure(getPortalMockExpenseCategories);
}

/** M-CC-10 — KPI dashboard snapshot hook failure. */
export function resolveKpiDashboardSnapshotFailure(scopeCompanyId: string): PortalListLoadFailure<
  ReturnType<typeof getPortalMockKpiDashboardData>[number]
> {
  const rows = getPortalMockKpiDashboardData(scopeCompanyId);
  const usingMockFallback = rows.length > 0;
  return {
    rows,
    usingMockFallback,
    loadFailed: !usingMockFallback,
  };
}

/** M-CC-14 — customers page list failure. */
export function resolveCustomersPageFailure() {
  return resolveSettingsBusinessMasterFailure(getPortalMockCustomers);
}

/** M-CC-14 — partners page list failure. */
export function resolvePartnersPageFailure() {
  return resolveSettingsBusinessMasterFailure(getPortalMockPartners);
}

/** M-CC-15 — vehicle types settings list failure. */
export function resolveVehicleTypesSettingsFailure() {
  return resolveSettingsBusinessMasterFailure(getPortalMockVehicleTypes);
}
