/**
 * @CODE-MEMORY
 * Screen:     /reports — tab Tuyển dụng
 * UC:         UC-BP-REC-08 · AC-REC-08-10 · O8
 * BR:         BR-REC-08-REPORTS-ONE · O10 no cost
 * SRS:        FR-UC-BP-REC-08
 * TechSpec:   PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01 §11
 * Purpose:    Bind Nest dashboard subset — planned_need/filled/pipeline/%/funnel/enough_people.
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Reports.tsx
 * Callees:    RecruitmentReport (Nest subset)
 * FEActions:  display only
 * Impact:     Second FE formula = FAIL O8
 * must_keep:  no VND/cost · identical semantics to Dashboard
 * SOLID:      Presentational
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, GitBranch, Percent } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RecruitmentReport } from '@/hooks/useReportsData';
import {
  enoughPeopleStatusLabelVi,
  formatRecDashCompletionPct,
  REC_DASH_FUNNEL_KEYS,
} from '@/lib/recruitmentDashboardNestBind';

interface Props {
  data: RecruitmentReport | null;
  isLoading: boolean;
}

export default function RecruitmentReportTab({ data, isLoading }: Props) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }
  if (!data) {
    return <div className="py-12 text-center text-muted-foreground">{t('common.noData')}</div>;
  }

  const funnelRows = REC_DASH_FUNNEL_KEYS.map((key) => ({
    stage: data.funnel_labels[key],
    count: data.funnel[key],
  }));

  const monthlyTrend = (data.by_month ?? []).map((row) => {
    const ym = row.month?.trim() || '';
    const label = /^\d{4}-\d{2}$/.test(ym) ? `T${Number.parseInt(ym.slice(5, 7), 10)}` : ym;
    return {
      month: label,
      planned: row.planned_need,
      filled: row.filled_count,
    };
  });

  return (
    <div className="space-y-6" data-testid="rec-reports-nest-bind">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            icon: Users,
            label: 'Kế hoạch (Cần tuyển)',
            value: data.planned_need,
            color: 'text-primary',
          },
          {
            icon: UserCheck,
            label: 'Đã tuyển (onboard)',
            value: data.filled_count,
            color: 'text-success',
          },
          {
            icon: GitBranch,
            label: 'Trong pipeline',
            value: data.in_pipeline_count,
            color: 'text-warning',
          },
          {
            icon: Percent,
            label: '% hoàn thành',
            value: formatRecDashCompletionPct(data.completion_pct),
            color: 'text-primary',
          },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-testid="rec-reports-enough-people">
        <CardContent className="space-y-1 pt-6">
          <p className="text-sm font-semibold">{enoughPeopleStatusLabelVi(data.enough_people_status)}</p>
          <p className="text-sm text-muted-foreground">{data.enough_people_eta_label}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Theo tháng (Nest)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="planned" name="KH" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="filled" name="TT" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {t('common.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phễu (5 buckets Nest)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelRows} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={120} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" name={t('common.quantity')} fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
