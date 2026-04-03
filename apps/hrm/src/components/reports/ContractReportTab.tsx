import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from 'recharts';
import type { ContractReport } from '@/hooks/useReportsData';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(173, 80%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(142, 76%, 36%)'];

interface Props { data: ContractReport | null; isLoading: boolean; }

export default function ContractReportTab({ data, isLoading }: Props) {
  const { t } = useTranslation();

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t('common.loading')}</p></div>;
  if (!data) return <div className="text-center text-muted-foreground py-12">{t('common.noData')}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: t('reports.contractReport.totalContracts'), value: data.totalContracts, color: 'text-primary' },
          { icon: CheckCircle, label: t('reports.contractReport.activeContracts'), value: data.activeContracts, color: 'text-success' },
          { icon: AlertTriangle, label: t('reports.contractReport.expiringContracts'), value: data.expiringContracts, color: 'text-warning' },
          { icon: XCircle, label: t('reports.contractReport.expiredContracts'), value: data.expiredContracts, color: 'text-destructive' },
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
          <CardHeader><CardTitle className="text-lg">{t('reports.contractReport.monthlyExpiring')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyExpiring}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" name={t('reports.contractReport.expiringCount')} fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">{t('reports.contractReport.typeStats')}</CardTitle></CardHeader>
          <CardContent>
            {data.typeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={data.typeStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="count" nameKey="type"
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}>
                    {data.typeStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">{t('reports.contractReport.noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('reports.contractReport.renewalRate')}</p>
              <p className="text-3xl font-bold text-primary">{data.renewalRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
