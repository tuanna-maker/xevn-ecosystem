import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend,
} from 'recharts';
import type { RecruitmentReport } from '@/hooks/useReportsData';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(173, 80%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

interface Props { data: RecruitmentReport | null; isLoading: boolean; }

export default function RecruitmentReportTab({ data, isLoading }: Props) {
  const { t } = useTranslation();

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t('common.loading')}</p></div>;
  if (!data) return <div className="text-center text-muted-foreground py-12">{t('common.noData')}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: t('recruitmentReport.totalCandidates'), value: data.totalCandidates, color: 'text-primary' },
          { icon: UserCheck, label: t('recruitmentReport.hired'), value: data.hiredCount, color: 'text-success' },
          { icon: UserX, label: t('recruitmentReport.rejected'), value: data.rejectedCount, color: 'text-destructive' },
          { icon: Clock, label: t('recruitmentReport.processing'), value: data.pendingCount, color: 'text-warning' },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">{t('recruitmentReport.monthlyTrend')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="applied" name={t('recruitmentReport.applied')} fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hired" name={t('recruitmentReport.hired')} fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">{t('recruitmentReport.candidateSources')}</CardTitle></CardHeader>
          <CardContent>
            {data.sourceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={data.sourceStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="count" nameKey="source"
                    label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}>
                    {data.sourceStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">{t('common.noData')}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">{t('recruitmentReport.stageDistribution')}</CardTitle></CardHeader>
          <CardContent>
            {data.stageStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.stageStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={120} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="count" name={t('common.quantity')} fill="hsl(280, 65%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">{t('common.noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
