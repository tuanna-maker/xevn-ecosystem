import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalFilterProvider } from './contexts/GlobalFilterContext';

const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const ExecutiveDashboardLayout = lazy(() => import('./components/layout/ExecutiveDashboardLayout'));
const HrmWorkspaceRoute = lazy(() =>
  import('./modules/hrm/HrmWorkspaceRoute').then((module) => ({ default: module.HrmWorkspaceRoute })),
);
const OrganizationPage = lazy(() => import('./pages/organization/OrganizationPage'));
const HRPage = lazy(() => import('./pages/hr/HRPage'));
const ExecutiveDashboardPage = lazy(() => import('./pages/dashboard/ExecutiveDashboardPage'));
const CommandCenterPage = lazy(() => import('./pages/command-center/CommandCenterPage'));
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

// Placeholder page component
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-96">
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
    <p className="text-slate-500 mt-2">Trang này đang được phát triển</p>
  </div>
);

const RouteLoadingFallback: React.FC = () => (
  <div className="flex h-96 items-center justify-center text-slate-500">Đang tải...</div>
);

const App: React.FC = () => {
  return (
    <GlobalFilterProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Unified Shell → Cockpit (dashboard) → sau đó mới mở /dashboard/* (MainLayout) */}
            <Route path="/" element={<ExecutiveDashboardLayout />}>
              <Route index element={<UnifiedShellPage />} />
              <Route path="cockpit" element={<ExecutiveDashboardPage />} />
              <Route path="command-center" element={<CommandCenterPage />}>
                <Route path="hrm">
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path=":view" element={<HrmWorkspaceRoute />} />
                </Route>
              </Route>
            </Route>

            {/* Main Layout with Sidebar - All Other Pages */}
            <Route path="/dashboard/*" element={<MainLayout />}>
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="hr" element={<HRPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="partners" element={<PartnersPage />} />
              <Route path="kpi-policy" element={<KPIPolicyPage />} />
              <Route path="kpi-dashboard" element={<KPIDashboardPage />} />

              {/* Settings Pages */}
              <Route path="settings">
                <Route path="positions" element={<PositionsSettingsPage />} />
                <Route path="departments" element={<PlaceholderPage title="Danh mục Phòng ban" />} />
                <Route path="regions" element={<PlaceholderPage title="Vùng địa lý" />} />
                <Route path="vehicles" element={<VehicleTypesSettingsPage />} />
                <Route path="vendors" element={<VendorsSettingsPage />} />
                <Route path="expense-categories" element={<ExpenseCategoriesSettingsPage />} />
                <Route path="kpi-metrics" element={<KPIMetricsSettingsPage />} />
                <Route path="kpi-formulas" element={<PlaceholderPage title="Công thức KPI" />} />
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
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GlobalFilterProvider>
  );
};

export default App;
