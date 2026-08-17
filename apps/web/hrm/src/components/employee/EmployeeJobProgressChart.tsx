/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Việc làm charts (E18)
 * UC:         E18
 * Purpose:    Job progress charts — primary #1E40AF DNA colors.
 * WorkItem:   PO-HRM-UI-BRAND-W3-EMP-C
 * Coded:      2026-08-05
 * Callers:    EmployeeJobList
 * must_keep: Job honesty parent; no Nest invent
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-C
 * change_mode: UPGRADE
 * What: Chart DNA hex ADR; priority boxes ops-dense; fake Math.random trend → honesty stub
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-C E18 Job honesty PARTIAL
 * must_keep: SoftDel; navigate(/employees/:id); stub honesty; no OCR/QR invent; no Nest/seed; no Employees CLOSED
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface Job {
  id: string;
  title: string;
  project: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  startDate: string;
  dueDate: string;
  progress: number;
  assignedBy: string;
  description?: string;
}

interface EmployeeJobProgressChartProps {
  jobs: Job[];
}

/** ADR-20260805 DNA hex — chart fill (not Tailwind blue-500 invent). */
const COLORS = {
  completed: '#10B981',
  in_progress: '#1E40AF',
  pending: '#6B7280',
  overdue: '#EF4444',
};

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export function EmployeeJobProgressChart({ jobs }: EmployeeJobProgressChartProps) {
  const { t } = useTranslation();

  // Tính toán dữ liệu cho biểu đồ tròn theo trạng thái
  const statusData = [
    { 
      name: t('employeeProfile.jobs.statusCompleted'), 
      value: jobs.filter(j => j.status === 'completed').length,
      color: COLORS.completed
    },
    { 
      name: t('employeeProfile.jobs.statusInProgress'), 
      value: jobs.filter(j => j.status === 'in_progress').length,
      color: COLORS.in_progress
    },
    { 
      name: t('employeeProfile.jobs.statusPending'), 
      value: jobs.filter(j => j.status === 'pending').length,
      color: COLORS.pending
    },
    { 
      name: t('employeeProfile.jobs.statusOverdue'), 
      value: jobs.filter(j => j.status === 'overdue').length,
      color: COLORS.overdue
    },
  ].filter(item => item.value > 0);

  // Tính toán dữ liệu cho biểu đồ cột theo ưu tiên
  const priorityData = [
    {
      name: t('employeeProfile.jobs.priorityHigh'),
      [t('employeeProfile.jobs.statusCompleted')]: jobs.filter(j => j.priority === 'high' && j.status === 'completed').length,
      [t('employeeProfile.jobs.statusInProgress')]: jobs.filter(j => j.priority === 'high' && j.status === 'in_progress').length,
      [t('employeeProfile.jobs.statusPending')]: jobs.filter(j => j.priority === 'high' && j.status === 'pending').length,
      [t('employeeProfile.jobs.statusOverdue')]: jobs.filter(j => j.priority === 'high' && j.status === 'overdue').length,
    },
    {
      name: t('employeeProfile.jobs.priorityMedium'),
      [t('employeeProfile.jobs.statusCompleted')]: jobs.filter(j => j.priority === 'medium' && j.status === 'completed').length,
      [t('employeeProfile.jobs.statusInProgress')]: jobs.filter(j => j.priority === 'medium' && j.status === 'in_progress').length,
      [t('employeeProfile.jobs.statusPending')]: jobs.filter(j => j.priority === 'medium' && j.status === 'pending').length,
      [t('employeeProfile.jobs.statusOverdue')]: jobs.filter(j => j.priority === 'medium' && j.status === 'overdue').length,
    },
    {
      name: t('employeeProfile.jobs.priorityLow'),
      [t('employeeProfile.jobs.statusCompleted')]: jobs.filter(j => j.priority === 'low' && j.status === 'completed').length,
      [t('employeeProfile.jobs.statusInProgress')]: jobs.filter(j => j.priority === 'low' && j.status === 'in_progress').length,
      [t('employeeProfile.jobs.statusPending')]: jobs.filter(j => j.priority === 'low' && j.status === 'pending').length,
      [t('employeeProfile.jobs.statusOverdue')]: jobs.filter(j => j.priority === 'low' && j.status === 'overdue').length,
    },
  ];

  // Tính tiến độ trung bình
  const averageProgress = jobs.length > 0 
    ? Math.round(jobs.reduce((acc, job) => acc + job.progress, 0) / jobs.length) 
    : 0;

  // Tính tỷ lệ hoàn thành
  const completionRate = jobs.length > 0 
    ? Math.round((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Biểu đồ tròn - Phân bố theo trạng thái */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            {t('employeeProfile.jobs.chartStatusDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-xevn-textSecondary">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thống kê tổng quan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {t('employeeProfile.jobs.chartOverview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tiến độ trung bình */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-xevn-textSecondary">
                  {t('employeeProfile.jobs.chartAverageProgress')}
                </span>
                <span className="text-sm font-medium">{averageProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-xevn-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>

            {/* Tỷ lệ hoàn thành */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-xevn-textSecondary">
                  {t('employeeProfile.jobs.chartCompletionRate')}
                </span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-xevn-success h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Công việc theo ưu tiên */}
            <div className="pt-2">
              <p className="text-sm text-xevn-textSecondary mb-3">
                {t('employeeProfile.jobs.chartByPriority')}
              </p>
              <div className="flex gap-4">
                <div className="flex-1 text-center p-3 rounded-lg border border-xevn-border bg-xevn-danger/10">
                  <p className="text-lg font-bold text-xevn-danger">
                    {jobs.filter(j => j.priority === 'high').length}
                  </p>
                  <p className="text-xs text-xevn-textSecondary">{t('employeeProfile.jobs.priorityHigh')}</p>
                </div>
                <div className="flex-1 text-center p-3 rounded-lg border border-xevn-border bg-xevn-warning/10">
                  <p className="text-lg font-bold text-xevn-warning">
                    {jobs.filter(j => j.priority === 'medium').length}
                  </p>
                  <p className="text-xs text-xevn-textSecondary">{t('employeeProfile.jobs.priorityMedium')}</p>
                </div>
                <div className="flex-1 text-center p-3 rounded-lg border border-xevn-border bg-xevn-success/10">
                  <p className="text-lg font-bold text-xevn-success">
                    {jobs.filter(j => j.priority === 'low').length}
                  </p>
                  <p className="text-xs text-xevn-textSecondary">{t('employeeProfile.jobs.priorityLow')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biểu đồ cột - Công việc theo ưu tiên và trạng thái */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('employeeProfile.jobs.chartPriorityStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar 
                  dataKey={t('employeeProfile.jobs.statusCompleted')} 
                  stackId="a" 
                  fill={COLORS.completed} 
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey={t('employeeProfile.jobs.statusInProgress')} 
                  stackId="a" 
                  fill={COLORS.in_progress} 
                />
                <Bar 
                  dataKey={t('employeeProfile.jobs.statusPending')} 
                  stackId="a" 
                  fill={COLORS.pending} 
                />
                <Bar 
                  dataKey={t('employeeProfile.jobs.statusOverdue')} 
                  stackId="a" 
                  fill={COLORS.overdue} 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trend — no Math.random invent; honesty until history API exists */}
      <Card className="border-xevn-border bg-xevn-surface" data-testid="emp-job-trend-honesty">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-xevn-text">
            <TrendingUp className="w-4 h-4 text-xevn-primary" />
            {t('employeeProfile.jobs.chartTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-center px-4">
            <p className="text-sm font-medium text-xevn-text">
              {t(
                'employeeProfile.jobs.trendUnavailableTitle',
                'Chưa có dữ liệu xu hướng theo tháng',
              )}
            </p>
            <p className="text-sm text-xevn-textSecondary">
              {t(
                'employeeProfile.jobs.trendUnavailableBody',
                'Biểu đồ xu hướng cần API lịch sử operations/tasks theo kỳ — không hiển thị số giả lập. Pie/bar phía trên dùng dữ liệu job hiện tại.',
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
