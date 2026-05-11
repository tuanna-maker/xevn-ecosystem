import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserMinus, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
} from 'recharts';
import type { TurnoverReport } from '@/hooks/useReportsData';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(173, 80%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(142, 76%, 36%)'];

interface Props { data: TurnoverReport | null; isLoading: boolean; }

export default function TurnoverReportTab({ data, isLoading }: Props) {
  const { t } = useTranslation();

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t('common.loading')}</p></div>;
  if (!data) return <div className="text-center text-muted-foreground py-12">{t('common.noData')}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: t('turnoverReport.currentEmployees'), value: data.totalActive, color: 'text-primary' },
          { icon: UserPlus, label: t('turnoverReport.newHires'), value: data.newHires, color: 'text-success' },
          { icon: UserMinus, label: t('turnoverReport.terminations'), value: data.terminations, color: 'text-destructive' },
          { icon: TrendingDown, label: t('turnoverReport.turnoverRate'), value: `${data.turnoverRate}%`, sub: t('turnoverReport.avgTenure', { months: data.avgTenureMonths }), color: 'text-warning' },
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
                  {'sub' in item && item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">{t('turnoverReport.monthlyTrend')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="newHires" name={t('turnoverReport.newHires')} fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terminations" name={t('turnoverReport.terminations')} fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">{t('turnoverReport.tenureDistribution')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={data.tenureDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="count" nameKey="range"
                  label={({ range, percent }) => percent > 0 ? `${range} ${(percent * 100).toFixed(0)}%` : ''}>
                  {data.tenureDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">{t('turnoverReport.departmentTurnover')}</CardTitle></CardHeader>
          <CardContent>
            {data.departmentTurnover.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.departmentTurnover}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="active" name={t('turnoverReport.working')} fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="left" name={t('turnoverReport.terminations')} fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
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
