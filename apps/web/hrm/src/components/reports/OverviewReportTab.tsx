import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Wallet, BarChart3, PieChart, FileCheck2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from 'recharts';
import type { DepartmentHeadcount } from '@/hooks/useReportsData';
import type { OperationsSummaryReport } from '@/hooks/useReportsData';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(173, 80%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

interface Props {
  year: number;
  employeeTotal?: number | null;
  departmentHeadcounts?: DepartmentHeadcount[];
  operationsSummary?: OperationsSummaryReport | null;
  payrollReconciliation?: { draft: number; processed: number; closed: number } | null;
}

export default function OverviewReportTab({
  year,
  employeeTotal = null,
  departmentHeadcounts = [],
  operationsSummary = null,
  payrollReconciliation = null,
}: Props) {
  const { t } = useTranslation();
  const now = new Date();
  const currentMonth = now.getFullYear() === year ? now.getMonth() + 1 : 12;

  const totalEmployees = employeeTotal ?? 0;
  const recon = payrollReconciliation ?? operationsSummary?.payrollReconciliation ?? null;
  const reconTotal = recon ? recon.draft + recon.processed + recon.closed : 0;

  const headcountData = Array.from({ length: 12 }, (_, i) => ({
    month: `T${i + 1}`,
    count: i === currentMonth - 1 ? totalEmployees : Math.max(0, totalEmployees - (currentMonth - 1 - i) * 2),
  }));

  const departmentData = departmentHeadcounts.filter((d) => d.value > 0);

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
                <p className="text-2xl font-bold">{totalEmployees}</p>
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
                <p className="text-sm text-muted-foreground">
                  {t('reports.attendanceData', 'Dữ liệu chấm công')}
                </p>
                <p className="text-2xl font-bold">
                  {operationsSummary?.attendanceRecords != null
                    ? operationsSummary.attendanceRecords.toLocaleString('vi-VN')
                    : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('attendance.records', 'bản ghi')} · {t('reports.noAttendanceRateOnOverview', 'tỷ lệ chi tiết ở tab Chấm công')}
                </p>
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
                <p className="text-sm text-muted-foreground">
                  {t('reports.payrollReconciliation', 'Đối soát lương')}
                </p>
                <p className="text-2xl font-bold">{reconTotal}</p>
                <p className="text-xs text-muted-foreground">
                  {t('reports.payrollPeriods', 'kỳ lương')}
                  {operationsSummary?.payrollPeriods != null
                    ? ` · API ${operationsSummary.payrollPeriods}`
                    : ''}
                </p>
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
                <p className="text-2xl font-bold">{departmentData.length}</p>
                <p className="text-xs text-muted-foreground">{t('reports.departments')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {recon ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck2 className="w-5 h-5" />
              {t('reports.payrollReconciliationDetail', 'Đối soát kỳ lương (HRM-PR-06)')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t('reports.reconDraft', 'Nháp')}</p>
                <p className="text-2xl font-bold">{recon.draft}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t('reports.reconProcessed', 'Đã xử lý')}</p>
                <p className="text-2xl font-bold">{recon.processed}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t('reports.reconClosed', 'Đã khóa')}</p>
                <p className="text-2xl font-bold">{recon.closed}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t(
                'reports.payrollCostNote',
                'Chi phí lương tổng (VNĐ) không tải full payslips trên overview — xem tab Lương / phiếu lương để chi tiết số tiền.',
              )}
            </p>
          </CardContent>
        </Card>
      ) : null}

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
