import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalFilterProvider } from './contexts/GlobalFilterContext';
import { AuthProvider } from './contexts/AuthContext';
import RequireAuth from './components/auth/RequireAuth';

const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const ExecutiveDashboardLayout = lazy(() => import('./components/layout/ExecutiveDashboardLayout'));
const HrmWorkspaceRoute = lazy(() =>
  import('./modules/hrm/HrmWorkspaceRoute').then((module) => ({ default: module.HrmWorkspaceRoute })),
);
const OrganizationPage = lazy(() => import('./pages/organization/OrganizationPage'));
const HRPage = lazy(() => import('./pages/hr/HRPage'));
const ExecutiveDashboardPage = lazy(() => import('./pages/dashboard/ExecutiveDashboardPage'));
const CatalogGovernancePage = lazy(() => import('./pages/governance/CatalogGovernancePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const CommandCenterPage = lazy(() => import('./pages/command-center/CommandCenterPage'));
import { TenantScopeSync } from './components/layout/TenantScopeSync';
import { TenantLegacyPathRedirect } from './components/layout/TenantLegacyPathRedirect';
import { TenantQueryScopeSync } from './components/layout/TenantQueryScopeSync';
import { TenantPathPrefixRedirect } from './components/layout/TenantPathPrefixRedirect';
import { Outlet } from 'react-router-dom';
import { useTenantScope } from './contexts/GlobalFilterContext';
const CommandCenterInboxPage = lazy(() => import('./pages/command-center/CommandCenterInboxPage'));
const UnifiedShellPage = lazy(() => import('./pages/unified/UnifiedShellPage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const PartnersPage = lazy(() => import('./pages/partners/PartnersPage'));
const KPIPolicyPage = lazy(() => import('./pages/kpi-policy/KPIPolicyPage'));
const KPIDashboardPage = lazy(() => import('./pages/kpi/KPIDashboardPage'));
const PositionsSettingsPage = lazy(() => import('./pages/settings/PositionsSettingsPage'));
const KPIMetricsSettingsPage = lazy(() => import('./pages/settings/KPIMetricsSettingsPage'));
const VehicleTypesSettingsPage = lazy(() => import('./pages/settings/VehicleTypesSettingsPage'));
const VendorsSettingsPage = lazy(() => import('./pages/settings/VendorsSettingsPage'));
const ExpenseCategoriesSettingsPage = lazy(() => import('./pages/settings/ExpenseCategoriesSettingsPage'));
const DepartmentsSettingsPage = lazy(() => import('./pages/settings/DepartmentsSettingsPage'));
const RegionsSettingsPage = lazy(() => import('./pages/settings/RegionsSettingsPage'));
const KpiFormulasSettingsPage = lazy(() => import('./pages/settings/KpiFormulasSettingsPage'));

const RouteLoadingFallback: React.FC = () => (
  <div className="flex h-96 items-center justify-center text-slate-500">Đang tải...</div>
);

const RootRedirector: React.FC = () => {
  const { selectedTenant } = useTenantScope();
  if (selectedTenant.id === '__loading__') return <RouteLoadingFallback />;
  return <Navigate to={`/${selectedTenant.tenantId}/cockpit`} replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GlobalFilterProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              {/* Root redirector based on preferred tenant */}
              <Route path="/" element={<RequireAuth><RootRedirector /></RequireAuth>} />

              {/* Legacy URLs (no /:tenantId) — hard reload / bookmark / old links */}
              <Route
                path="/cockpit"
                element={
                  <RequireAuth>
                    <TenantLegacyPathRedirect />
                  </RequireAuth>
                }
              />
              <Route
                path="/catalog-governance"
                element={
                  <RequireAuth>
                    <TenantLegacyPathRedirect />
                  </RequireAuth>
                }
              />
              <Route
                path="/command-center"
                element={
                  <RequireAuth>
                    <TenantQueryScopeSync>
                      <ExecutiveDashboardLayout />
                    </TenantQueryScopeSync>
                  </RequireAuth>
                }
              >
                <Route path="inbox" element={<CommandCenterInboxPage />} />
                <Route element={<CommandCenterPage />}>
                  <Route index element={<></>} />
                  <Route path="hrm" element={<Navigate to="dashboard" replace />} />
                  <Route path="hrm/*" element={<HrmWorkspaceRoute />} />
                </Route>
              </Route>

              {/* Legacy `/:tenantId/command-center/*` → canonical `?tenantId=` URL */}
              <Route
                path="/:tenantId/command-center/*"
                element={
                  <RequireAuth>
                    <TenantPathPrefixRedirect />
                  </RequireAuth>
                }
              />
              <Route
                path="/:tenantId/command-center"
                element={
                  <RequireAuth>
                    <TenantPathPrefixRedirect />
                  </RequireAuth>
                }
              />

              {/* Legacy URLs (no ?tenantId=) — cockpit / dashboard still path-prefixed */}
              <Route
                path="/dashboard/*"
                element={
                  <RequireAuth>
                    <TenantLegacyPathRedirect />
                  </RequireAuth>
                }
              />

              {/* Unified Shell → Cockpit (dashboard) → sau đó mới mở /dashboard/* (MainLayout) */}
              <Route
                path="/:tenantId"
                element={
                  <RequireAuth>
                    <TenantScopeSync>
                      <Outlet />
                    </TenantScopeSync>
                  </RequireAuth>
                }
              >
                <Route element={<ExecutiveDashboardLayout />}>
                  <Route index element={<UnifiedShellPage />} />
                  <Route path="cockpit" element={<ExecutiveDashboardPage />} />
                  <Route path="catalog-governance" element={<CatalogGovernancePage />} />
                </Route>

                {/* Main Layout with Sidebar - All Other Pages */}
                <Route
                  path="dashboard/*"
                  element={<MainLayout />}
                >
                  <Route path="organization" element={<OrganizationPage />} />
                  <Route path="hr" element={<HRPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="partners" element={<PartnersPage />} />
                  <Route path="kpi-policy" element={<KPIPolicyPage />} />
                  <Route path="kpi-dashboard" element={<KPIDashboardPage />} />

                  {/* Settings Pages */}
                  <Route path="settings">
                    <Route path="positions" element={<PositionsSettingsPage />} />
                    <Route path="departments" element={<DepartmentsSettingsPage />} />
                    <Route path="regions" element={<RegionsSettingsPage />} />
                    <Route path="vehicles" element={<VehicleTypesSettingsPage />} />
                    <Route path="vendors" element={<VendorsSettingsPage />} />
                    <Route path="expense-categories" element={<ExpenseCategoriesSettingsPage />} />
                    <Route path="kpi-metrics" element={<KPIMetricsSettingsPage />} />
                    <Route path="kpi-formulas" element={<KpiFormulasSettingsPage />} />
                  </Route>

                  {/* Redirect dashboard root to organization */}
                  <Route index element={<Navigate to="organization" replace />} />

                  {/* 404 */}
                  <Route
                    path="*"
                    element={
                      <div className="flex flex-col items-center justify-center h-96">
                        <h1 className="text-4xl font-bold text-slate-800">404</h1>
                        <p className="text-slate-500 mt-2">Không tìm thấy trang</p>
                      </div>
                    }
                  />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </GlobalFilterProvider>
    </AuthProvider>
  );
};

export default App;
