import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';
import { RoutePending } from '@/components/feedback/RoutePending';
import { UnifiedPortalRedirect } from '@/components/UnifiedPortalRedirect';

const OrganizationPage = lazy(() =>
  import('@/pages/OrganizationPage').then((module) => ({ default: module.OrganizationPage })),
);
const OrgChartPage = lazy(() =>
  import('@/pages/OrgChartPage').then((module) => ({ default: module.OrgChartPage })),
);
const MetadataConfigPage = lazy(() =>
  import('@/pages/MetadataConfigPage').then((module) => ({ default: module.MetadataConfigPage })),
);
const MasterDataPage = lazy(() =>
  import('@/pages/MasterDataPage').then((module) => ({ default: module.MasterDataPage })),
);
const KpiLayout = lazy(() =>
  import('@/pages/kpi/KpiLayout').then((module) => ({ default: module.KpiLayout })),
);
const KpiDefinitionsPage = lazy(() =>
  import('@/pages/kpi/KpiDefinitionsPage').then((module) => ({ default: module.KpiDefinitionsPage })),
);
const KpiAssignmentsPage = lazy(() =>
  import('@/pages/kpi/KpiAssignmentsPage').then((module) => ({ default: module.KpiAssignmentsPage })),
);
const KpiProgressPage = lazy(() =>
  import('@/pages/kpi/KpiProgressPage').then((module) => ({ default: module.KpiProgressPage })),
);
const PolicyLayout = lazy(() =>
  import('@/pages/policy/PolicyLayout').then((module) => ({ default: module.PolicyLayout })),
);
const PolicyManagementPage = lazy(() =>
  import('@/pages/kpi/PolicyManagementPage').then((module) => ({ default: module.PolicyManagementPage })),
);
const TariffRangesPage = lazy(() =>
  import('@/pages/kpi/TariffRangesPage').then((module) => ({ default: module.TariffRangesPage })),
);
const RewardPenaltyCalcPage = lazy(() =>
  import('@/pages/kpi/RewardPenaltyCalcPage').then((module) => ({ default: module.RewardPenaltyCalcPage })),
);

function withRouteGuard(node: ReactNode) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RoutePending />}>{node}</Suspense>
    </RouteErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/command-center/*" element={<UnifiedPortalRedirect />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={withRouteGuard(<OrganizationPage />)} />
          <Route path="/org-chart" element={withRouteGuard(<OrgChartPage />)} />
          <Route path="/metadata" element={withRouteGuard(<MetadataConfigPage />)} />
          <Route path="/master-data" element={withRouteGuard(<MasterDataPage />)} />
          <Route path="/kpi" element={withRouteGuard(<KpiLayout />)}>
            <Route index element={withRouteGuard(<KpiDefinitionsPage />)} />
            <Route path="assign" element={withRouteGuard(<KpiAssignmentsPage />)} />
            <Route path="tracking" element={withRouteGuard(<KpiProgressPage />)} />
          </Route>
          <Route path="/policy" element={withRouteGuard(<PolicyLayout />)}>
            <Route index element={withRouteGuard(<PolicyManagementPage />)} />
            <Route path="tariff" element={withRouteGuard(<TariffRangesPage />)} />
            <Route path="summary" element={withRouteGuard(<RewardPenaltyCalcPage />)} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
