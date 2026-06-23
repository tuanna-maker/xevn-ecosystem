import type { KPIDashboardData, KPIMetric, Position, Vendor, ExpenseCategory, VehicleType } from './mockData';
import {
  mockKPIDashboardData as MOCK_KPI_DASHBOARD_DATA,
  mockKPIMetrics as MOCK_KPI_METRICS,
  mockPositions as MOCK_POSITIONS,
  mockVendors as MOCK_VENDORS,
  mockExpenseCategories as MOCK_EXPENSE_CATEGORIES,
  mockVehicleTypes as MOCK_VEHICLE_TYPES,
} from './mockData';
import {
  mockCustomers as MOCK_CUSTOMERS,
  mockPartners as MOCK_PARTNERS,
  mockEmployees as MOCK_HR_EMPLOYEES,
  type Customer,
  type Partner,
  type Employee as HrPageEmployee,
} from './mock-data';
import {
  mockExecutiveDashboardStats as MOCK_EXEC_STATS,
  mockAlerts as MOCK_EXEC_ALERTS,
} from './mockExecutiveDashboardData';
import { allowMockFallback } from '../utils/mockPolicy';

/** M-CC-07 — HR page employee rows (dev flag only). */
export function getPortalMockEmployees(scopeCompanyId: string): HrPageEmployee[] {
  if (!allowMockFallback()) return [];
  if (scopeCompanyId === 'all') return MOCK_HR_EMPLOYEES;
  return MOCK_HR_EMPLOYEES.filter((emp) => emp.id.startsWith(scopeCompanyId));
}

/** M-CC-08 — executive cockpit demo stat cards (dev flag only). */
export function getPortalMockExecutiveDashboardStats() {
  return allowMockFallback() ? MOCK_EXEC_STATS : null;
}

/** M-CC-08 — cockpit alert ticker seed when portal-alerts API empty (dev flag only). */
export function getPortalMockExecutiveDashboardAlerts() {
  return allowMockFallback() ? MOCK_EXEC_ALERTS : [];
}

/** M-CC-09 — settings business-master seed rows (dev flag only). */
export function getPortalMockPositions(): Position[] {
  return allowMockFallback() ? MOCK_POSITIONS : [];
}

export function getPortalMockKpiMetrics(): KPIMetric[] {
  return allowMockFallback() ? MOCK_KPI_METRICS : [];
}

export function getPortalMockVendors(): Vendor[] {
  return allowMockFallback() ? MOCK_VENDORS : [];
}

export function getPortalMockExpenseCategories(): ExpenseCategory[] {
  return allowMockFallback() ? MOCK_EXPENSE_CATEGORIES : [];
}

/** M-CC-10 — KPI dashboard snapshot rows (dev flag only). */
export function getPortalMockKpiDashboardData(scopeCompanyId: string): KPIDashboardData[] {
  if (!allowMockFallback()) return [];
  return scopeCompanyId === 'all'
    ? MOCK_KPI_DASHBOARD_DATA.filter((k) => k.companyId === 'all')
    : MOCK_KPI_DASHBOARD_DATA.filter((k) => k.companyId === scopeCompanyId);
}

/** M-CC-14 — customers list seed (dev flag only). */
export function getPortalMockCustomers(): Customer[] {
  return allowMockFallback() ? MOCK_CUSTOMERS : [];
}

/** M-CC-14 — partners list seed (dev flag only). */
export function getPortalMockPartners(): Partner[] {
  return allowMockFallback() ? MOCK_PARTNERS : [];
}

/** M-CC-15 — vehicle types settings seed (dev flag only). */
export function getPortalMockVehicleTypes(): VehicleType[] {
  return allowMockFallback() ? MOCK_VEHICLE_TYPES : [];
}
