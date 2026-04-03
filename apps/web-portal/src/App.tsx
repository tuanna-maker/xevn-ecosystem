import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HrmWorkspaceRoute } from './modules/hrm/HrmWorkspaceRoute';
import { GlobalFilterProvider } from './contexts/GlobalFilterContext';
import { MainLayout } from './components/layout';
import ExecutiveDashboardLayout from './components/layout/ExecutiveDashboardLayout';
import {
  OrganizationPage,
  HRPage,
  ExecutiveDashboardPage,
  CommandCenterPage,
  UnifiedShellPage,
  CustomersPage,
  PartnersPage,
  KPIPolicyPage,
  KPIDashboardPage,
  PositionsSettingsPage,
  KPIMetricsSettingsPage,
  VehicleTypesSettingsPage,
  VendorsSettingsPage,
  ExpenseCategoriesSettingsPage,
} from './pages';

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

const App: React.FC = () => {
  return (
    <GlobalFilterProvider>
      <BrowserRouter>
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
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-96">
                <h1 className="text-4xl font-bold text-slate-800">404</h1>
                <p className="text-slate-500 mt-2">Không tìm thấy trang</p>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalFilterProvider>
  );
};

export default App;
