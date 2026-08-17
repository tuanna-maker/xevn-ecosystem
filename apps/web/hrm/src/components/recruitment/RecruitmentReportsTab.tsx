/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → tab Báo cáo
 * UC:         UC-BP-REC-08 · AC-REC-08-10 · O8
 * BR:         BR-REC-08-REPORTS-ONE · O10 no cost/VND
 * SRS:        FR-UC-BP-REC-08
 * TechSpec:   PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01 §11
 * Purpose:    Bind Nest GET /recruitment/dashboard — same contract as Dashboard (subset OK).
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Recruitment.tsx reports tab
 * Callees:    getRecruitmentDashboard · recruitmentDashboardNestBind
 * FEActions:  filter năm → GET Nest → bind KPIs/funnel/enough_people
 * Impact:     FE invent conversion/%/KH = FAIL O8
 * must_keep:  tab chrome · honesty false · C-SLICE · U65
 * SOLID:      Presentational bind — Nest owns formulas
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Replace empty/stub multi-list FE formula with Nest dashboard subset bind
 * Why: BA O8 · DENY buildRecruitmentReportFromApi / job_postings KH
 * must_keep: no Campaign invent · no cost charts
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, GitBranch, Percent, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { getRecruitmentDashboard } from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import {
  bindRecDashFunnelCounts,
  bindRecDashFunnelLabels,
  enoughPeopleStatusLabelVi,
  formatRecDashCompletionPct,
  formatRecDashCount,
  mapRecruitmentReportFromDashboardDto,
  REC_DASH_FUNNEL_KEYS,
} from '@/lib/recruitmentDashboardNestBind';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function RecruitmentReportsTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = coerceHrmListCompanyId(listCompanyId || currentCompanyId || '');
  const [year, setYear] = useState(() => new Date().getFullYear());

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1];
  }, []);

  const query = useQuery({
    queryKey: ['recruitment_reports_nest', companyId, year],
    queryFn: () => getRecruitmentDashboard({ company_id: companyId, year }),
    enabled: !!companyId && Number.isFinite(year),
    retry: false,
  });

  useEffect(() => {
    if (!query.isError || !query.error) return;
    toast({
      title: 'Không tải được báo cáo tuyển',
      description: toErrorMessage(
        query.error,
        'Không tải được chỉ số tuyển dụng từ Nest dashboard.',
      ),
      variant: 'destructive',
    });
  }, [query.isError, query.error]);

  const data = query.isError ? null : query.data ?? null;
  const report = data ? mapRecruitmentReportFromDashboardDto(data) : null;
  const funnel = bindRecDashFunnelCounts(data ?? undefined);
  const funnelLabels = bindRecDashFunnelLabels(data ?? undefined);
  const funnelRows = REC_DASH_FUNNEL_KEYS.map((key) => ({
    stage: funnelLabels[key],
    count: funnel[key],
  }));
  const monthlyTrend = (report?.by_month ?? []).map((row) => {
    const ym = row.month?.trim() || '';
    const label = /^\d{4}-\d{2}$/.test(ym) ? `T${Number.parseInt(ym.slice(5, 7), 10)}` : ym;
    return { month: label, planned: row.planned_need, filled: row.filled_count };
  });

  return (
    <div className="space-y-4" data-testid="rec-module-reports-nest">
      <div className="flex h-10 flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[20px] font-bold tracking-tight text-xevn-text">
          {t('recruitment.tabs.reports')}
        </h2>
        <Select value={String(year)} onValueChange={(v) => setYear(Number.parseInt(v, 10))}>
          <SelectTrigger className="h-10 w-[120px]" data-testid="rec-module-reports-year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isError && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center gap-2 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Không hiển thị số liệu cũ — kiểm tra kỳ/phạm vi rồi tải lại.
            {query.error instanceof ApiClientError && query.error.code
              ? ` (${query.error.code})`
              : ''}
          </CardContent>
        </Card>
      )}

      {query.isLoading && !data ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : !report ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{t('common.noData')}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Users, label: 'Kế hoạch (Cần tuyển)', value: formatRecDashCount(report.planned_need) },
              { icon: UserCheck, label: 'Đã tuyển (onboard)', value: formatRecDashCount(report.filled_count) },
              { icon: GitBranch, label: 'Trong pipeline', value: formatRecDashCount(report.in_pipeline_count) },
              { icon: Percent, label: '% hoàn thành', value: formatRecDashCompletionPct(report.completion_pct) },
            ].map((item) => (
              <Card key={item.label} className="shadow-sm">
                <CardContent className="flex items-center gap-3 pt-5">
                  <item.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-xevn-textSecondary">{item.label}</p>
                    <p className="text-xl font-bold tabular-nums">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-sm" data-testid="rec-module-reports-enough">
            <CardContent className="space-y-1 px-4 py-3">
              <p className="text-sm font-semibold">
                {enoughPeopleStatusLabelVi(report.enough_people_status)}
              </p>
              <p className="text-sm text-xevn-textSecondary">{report.enough_people_eta_label}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Theo tháng (Nest)</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="planned" name="KH" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="filled" name="TT" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-16 text-center text-sm text-muted-foreground">{t('common.noData')}</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Phễu 5 buckets (Nest)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={funnelRows} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={110} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1E40AF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
