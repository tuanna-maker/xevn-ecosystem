import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
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

const COLORS = {
  completed: '#22c55e',
  in_progress: '#3b82f6',
  pending: '#6b7280',
  overdue: '#ef4444',
};

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
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

  // Giả lập dữ liệu tiến độ theo thời gian (6 tháng gần đây)
  const months = ['T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const progressOverTime = months.map((month, index) => ({
    month,
    completed: Math.floor(Math.random() * 5) + index,
    total: Math.floor(Math.random() * 3) + index + 3,
  }));

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
                <span className="text-xs text-muted-foreground">
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
                <span className="text-sm text-muted-foreground">
                  {t('employeeProfile.jobs.chartAverageProgress')}
                </span>
                <span className="text-sm font-medium">{averageProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>

            {/* Tỷ lệ hoàn thành */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {t('employeeProfile.jobs.chartCompletionRate')}
                </span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Công việc theo ưu tiên */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3">
                {t('employeeProfile.jobs.chartByPriority')}
              </p>
              <div className="flex gap-4">
                <div className="flex-1 text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-lg font-bold text-red-600">
                    {jobs.filter(j => j.priority === 'high').length}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('employeeProfile.jobs.priorityHigh')}</p>
                </div>
                <div className="flex-1 text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-lg font-bold text-yellow-600">
                    {jobs.filter(j => j.priority === 'medium').length}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('employeeProfile.jobs.priorityMedium')}</p>
                </div>
                <div className="flex-1 text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-lg font-bold text-green-600">
                    {jobs.filter(j => j.priority === 'low').length}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('employeeProfile.jobs.priorityLow')}</p>
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

      {/* Biểu đồ đường - Xu hướng hoàn thành theo thời gian */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {t('employeeProfile.jobs.chartTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressOverTime}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name={t('employeeProfile.jobs.chartTotalJobs')}
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  name={t('employeeProfile.jobs.statusCompleted')}
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
