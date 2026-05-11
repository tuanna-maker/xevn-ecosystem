import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Wallet, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
} from 'recharts';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useAttendanceReports } from '@/hooks/useAttendanceReports';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(173, 80%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

interface Props { year: number; }

export default function OverviewReportTab({ year }: Props) {
  const { t } = useTranslation();
  const { employees } = useEmployees();
  const { departments } = useDepartments();
  const now = new Date();
  const currentMonth = now.getFullYear() === year ? now.getMonth() + 1 : 12;
  const { summary } = useAttendanceReports(year, currentMonth);

  const activeEmployees = employees.filter(e => e.status === 'active');
  const totalPayroll = activeEmployees.reduce((s, e) => s + (e.salary || 0), 0);

  // Monthly headcount (simplified - current count for all months)
  const headcountData = Array.from({ length: 12 }, (_, i) => ({
    month: `T${i + 1}`,
    count: activeEmployees.filter(e => {
      if (!e.start_date) return false;
      const startMonth = new Date(e.start_date);
      return startMonth <= new Date(year, i, 28);
    }).length,
  }));

  const departmentData = departments.map(d => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
    value: d.employee_count || 0,
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.totalEmployees')}</p>
                <p className="text-2xl font-bold">{activeEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.attendanceRate')}</p>
                <p className="text-2xl font-bold">{summary?.attendanceRate ?? 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('reports.payrollCost')}</p>
                <p className="text-2xl font-bold">{(totalPayroll / 1000000).toFixed(0)}M</p>
                <p className="text-xs text-muted-foreground">VNĐ/{t('common.month', 'tháng')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('reports.departmentStats')}</p>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-xs text-muted-foreground">{t('reports.departments')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('reports.headcount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headcountData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}`, t('nav.employees')]} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {t('reports.departmentStats')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={departmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {departmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, t('nav.employees')]} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                </RechartsPieChart>
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
