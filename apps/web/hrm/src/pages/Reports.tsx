import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewReportTab from '@/components/reports/OverviewReportTab';
import RecruitmentReportTab from '@/components/reports/RecruitmentReportTab';
import ContractReportTab from '@/components/reports/ContractReportTab';
import LeaveReportTab from '@/components/reports/LeaveReportTab';
import TurnoverReportTab from '@/components/reports/TurnoverReportTab';
import ServiceReportTab from '@/components/reports/ServiceReportTab';
import ToolsReportTab from '@/components/reports/ToolsReportTab';
import { useReportsData } from '@/hooks/useReportsData';

export default function Reports() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const { isLoading, recruitment, contracts, leave, turnover } = useReportsData(Number(year));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full overflow-x-auto scrollbar-hide">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('reports.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="recruitment" className="text-xs sm:text-sm">{t('reports.tabs.recruitment')}</TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs sm:text-sm">{t('reports.tabs.contracts')}</TabsTrigger>
          <TabsTrigger value="leave" className="text-xs sm:text-sm">{t('reports.tabs.leave')}</TabsTrigger>
          <TabsTrigger value="turnover" className="text-xs sm:text-sm">{t('reports.tabs.turnover')}</TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm">Dịch vụ nội bộ</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs sm:text-sm">Công cụ dụng cụ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewReportTab year={Number(year)} />
        </TabsContent>
        <TabsContent value="recruitment">
          <RecruitmentReportTab data={recruitment} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractReportTab data={contracts} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="leave">
          <LeaveReportTab data={leave} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="turnover">
          <TurnoverReportTab data={turnover} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="services">
          <ServiceReportTab />
        </TabsContent>
        <TabsContent value="tools">
          <ToolsReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
