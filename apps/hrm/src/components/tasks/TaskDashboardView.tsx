import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task, TASK_STATUSES, TASK_PRIORITIES } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ListTodo, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDepartments } from '@/hooks/useDepartments';
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';

interface TaskDashboardViewProps {
  tasks: Task[];
}

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(217, 91%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(25, 95%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(0, 84%, 60%)',
];

export function TaskDashboardView({ tasks }: TaskDashboardViewProps) {
  const { t } = useTranslation();
  const { departments } = useDepartments();
  const [timeFilter, setTimeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let start: Date, end: Date;
      switch (timeFilter) {
        case 'this_month':
          start = startOfMonth(now); end = endOfMonth(now); break;
        case 'this_quarter':
          start = startOfQuarter(now); end = endOfQuarter(now); break;
        case 'this_year':
          start = startOfYear(now); end = endOfYear(now); break;
        default:
          start = new Date(0); end = now;
      }
      result = result.filter(task => {
        const created = parseISO(task.created_at);
        return isWithinInterval(created, { start, end });
      });
    }

    // Department filter
    if (departmentFilter !== 'all') {
      result = result.filter(task => task.department === departmentFilter);
    }

    return result;
  }, [tasks, timeFilter, departmentFilter]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const overdue = filteredTasks.filter(t => {
      if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
      return new Date(t.due_date) < new Date();
    }).length;
    const cancelled = filteredTasks.filter(t => t.status === 'cancelled').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, inProgress, completed, overdue, cancelled, completionRate };
  }, [filteredTasks]);

  const pieData = useMemo(() => {
    return TASK_STATUSES.map(s => ({
      name: t(s.labelKey),
      value: filteredTasks.filter(task => task.status === s.value).length,
    })).filter(d => d.value > 0);
  }, [filteredTasks, t]);

  const priorityData = useMemo(() => {
    return TASK_PRIORITIES.map(p => ({
      name: t(p.labelKey),
      value: filteredTasks.filter(task => task.priority === p.value).length,
    }));
  }, [filteredTasks, t]);

  const departmentData = useMemo(() => {
    const deptMap = new Map<string, { completed: number; inProgress: number; overdue: number }>();
    filteredTasks.forEach(task => {
      const dept = task.department || t('taskManagement.dashboard.noDepartment');
      if (!deptMap.has(dept)) deptMap.set(dept, { completed: 0, inProgress: 0, overdue: 0 });
      const d = deptMap.get(dept)!;
      if (task.status === 'completed') d.completed++;
      else if (task.status === 'in_progress') d.inProgress++;
      if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' && task.status !== 'cancelled') d.overdue++;
    });
    return Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      [t('taskManagement.dashboard.chartCompleted')]: data.completed,
      [t('taskManagement.dashboard.chartInProgress')]: data.inProgress,
      [t('taskManagement.dashboard.chartOverdue')]: data.overdue,
    }));
  }, [filteredTasks, t]);

  const statCards = [
    {
      label: t('taskManagement.dashboard.inProgress'),
      value: stats.inProgress,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    },
    {
      label: t('taskManagement.dashboard.overdue'),
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    },
    {
      label: t('taskManagement.dashboard.completed'),
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    },
    {
      label: t('taskManagement.dashboard.completionRate'),
      value: `${stats.completionRate}%`,
      icon: stats.completionRate >= 50 ? TrendingUp : TrendingDown,
      color: stats.completionRate >= 50 ? 'text-emerald-500' : 'text-destructive',
      bgColor: stats.completionRate >= 50 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
      iconBg: stats.completionRate >= 50 ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('taskManagement.dashboard.filterTime')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('taskManagement.dashboard.allTime')}</SelectItem>
            <SelectItem value="this_month">{t('taskManagement.dashboard.thisMonth')}</SelectItem>
            <SelectItem value="this_quarter">{t('taskManagement.dashboard.thisQuarter')}</SelectItem>
            <SelectItem value="this_year">{t('taskManagement.dashboard.thisYear')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('taskManagement.dashboard.filterDepartment')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('taskManagement.dashboard.allDepartments')}</SelectItem>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                  <p className={cn('text-3xl font-bold mt-1', card.color)}>{card.value}</p>
                </div>
                <div className={cn('p-3 rounded-xl', card.iconBg)}>
                  <card.icon className={cn('h-6 w-6', card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('taskManagement.dashboard.statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                {t('taskManagement.dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('taskManagement.dashboard.priorityDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t('taskManagement.dashboard.tasks')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Horizontal Bar Chart - Department Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('taskManagement.dashboard.departmentStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(250, departmentData.length * 50)}>
                <BarChart data={departmentData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={12} width={140} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={t('taskManagement.dashboard.chartCompleted')} fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} stackId="a" />
                  <Bar dataKey={t('taskManagement.dashboard.chartInProgress')} fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} stackId="a" />
                  <Bar dataKey={t('taskManagement.dashboard.chartOverdue')} fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                {t('taskManagement.dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
