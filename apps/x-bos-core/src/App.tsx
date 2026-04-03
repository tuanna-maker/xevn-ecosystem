import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { OrganizationPage } from '@/pages/OrganizationPage';
import { OrgChartPage } from '@/pages/OrgChartPage';
import { MetadataConfigPage } from '@/pages/MetadataConfigPage';
import { MasterDataPage } from '@/pages/MasterDataPage';
import { KpiLayout } from '@/pages/kpi/KpiLayout';
import { KpiDefinitionsPage } from '@/pages/kpi/KpiDefinitionsPage';
import { KpiAssignmentsPage } from '@/pages/kpi/KpiAssignmentsPage';
import { KpiProgressPage } from '@/pages/kpi/KpiProgressPage';
import { PolicyLayout } from '@/pages/policy/PolicyLayout';
import { PolicyManagementPage } from '@/pages/kpi/PolicyManagementPage';
import { TariffRangesPage } from '@/pages/kpi/TariffRangesPage';
import { RewardPenaltyCalcPage } from '@/pages/kpi/RewardPenaltyCalcPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<OrganizationPage />} />
          <Route path="/org-chart" element={<OrgChartPage />} />
          <Route path="/metadata" element={<MetadataConfigPage />} />
          <Route path="/master-data" element={<MasterDataPage />} />
          <Route path="/kpi" element={<KpiLayout />}>
            <Route index element={<KpiDefinitionsPage />} />
            <Route path="assign" element={<KpiAssignmentsPage />} />
            <Route path="tracking" element={<KpiProgressPage />} />
          </Route>
          <Route path="/policy" element={<PolicyLayout />}>
            <Route index element={<PolicyManagementPage />} />
            <Route path="tariff" element={<TariffRangesPage />} />
            <Route path="summary" element={<RewardPenaltyCalcPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
