import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileDown,
  BarChart3,
  PieChart as PieChartIcon,
  CalendarDays,
  Timer,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useAttendanceReports } from '@/hooks/useAttendanceReports';
import { AttendanceExportDialog } from './AttendanceExportDialog';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(142, 76%, 36%)',
];

export function AttendanceReportsTab() {
  const { t } = useTranslation();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const {
    isLoading,
    summary,
    departmentStats,
    employeeStats,
    dailyStats,
    monthlyTrend,
    leaveTypeStats,
  } = useAttendanceReports(selectedYear, selectedMonth);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Prepare pie chart data for leave types
  const leaveTypePieData = leaveTypeStats.map((item, index) => ({
    name: item.leaveType,
    value: item.totalDays,
    color: COLORS[index % COLORS.length],
  }));

  // Top late employees
  const topLateEmployees = [...employeeStats]
    .sort((a, b) => b.totalLateMinutes - a.totalLateMinutes)
    .slice(0, 10);

  // Top overtime employees
  const topOvertimeEmployees = [...employeeStats]
    .sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours)
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{t('attendance.reports.title')}</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m.toString()}>
                  {t('attendance.reports.month', { month: m })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AttendanceExportDialog>
            <Button variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              {t('attendance.reports.exportReport')}
            </Button>
          </AttendanceExportDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.totalEmployees')}</p>
                <p className="text-2xl font-bold">{summary?.totalEmployees || 0}</p>
                <p className="text-xs text-muted-foreground">{summary?.totalWorkDays || 0} {t('attendance.reports.workDays')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.attendanceRate')}</p>
                <p className="text-2xl font-bold">{summary?.attendanceRate || 0}%</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {summary?.presentCount || 0} {t('attendance.reports.times')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.lateRate')}</p>
                <p className="text-2xl font-bold">{summary?.lateRate || 0}%</p>
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {summary?.lateCount || 0} {t('attendance.reports.times')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Timer className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.totalOT')}</p>
                <p className="text-2xl font-bold">{summary?.overtimeHours || 0}h</p>
                <p className="text-xs text-muted-foreground">
                  {summary?.earlyLeaveCount || 0} {t('attendance.reports.earlyLeaveCount')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {t('attendance.reports.dailyChart')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="dayLabel" 
                  tick={{ fontSize: 10 }}
                  interval={2}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="presentCount"
                  name={t('attendance.reports.present')}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="lateCount"
                  name={t('attendance.reports.lateLabel')}
                  stroke="hsl(38, 92%, 50%)"
                  fill="hsl(38, 92%, 50%)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('attendance.reports.monthlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthLabel" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background))',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendanceRate"
                  name={t('attendance.reports.attendanceRateLabel')}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line
                  type="monotone"
                  dataKey="lateRate"
                  name={t('attendance.reports.lateRateLabel')}
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(38, 92%, 50%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('attendance.reports.byDepartment')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departmentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    type="category" 
                    dataKey="department" 
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, t('attendance.reports.attendanceRateLabel')]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--background))',
                    }}
                  />
                  <Bar 
                    dataKey="attendanceRate" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('attendance.reports.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              {t('attendance.reports.leaveTypes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveTypePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveTypePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leaveTypePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} ${t('attendance.reports.days')}`]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--background))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('attendance.reports.noLeaveData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Late Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserX className="w-5 h-5 text-amber-500" />
              {t('attendance.reports.top10Late')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('attendance.reports.employee')}</TableHead>
                  <TableHead className="text-right">{t('attendance.reports.count')}</TableHead>
                  <TableHead className="text-right">{t('attendance.reports.totalMinutes')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLateEmployees.filter(e => e.totalLateMinutes > 0).map((emp, index) => (
                  <TableRow key={emp.employeeId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{emp.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{emp.department || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{emp.lateDays}</TableCell>
                    <TableCell className="text-right text-amber-600 font-medium">
                      {emp.totalLateMinutes}
                    </TableCell>
                  </TableRow>
                ))}
                {topLateEmployees.filter(e => e.totalLateMinutes > 0).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {t('attendance.reports.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Overtime Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-500" />
              {t('attendance.reports.top10OT')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('attendance.reports.employee')}</TableHead>
                  <TableHead className="text-right">{t('attendance.reports.department')}</TableHead>
                  <TableHead className="text-right">{t('attendance.reports.totalOTHours')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOvertimeEmployees.filter(e => e.totalOvertimeHours > 0).map((emp) => (
                  <TableRow key={emp.employeeId}>
                    <TableCell>
                      <p className="font-medium">{emp.employeeName}</p>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {emp.department || '-'}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">
                      {emp.totalOvertimeHours}h
                    </TableCell>
                  </TableRow>
                ))}
                {topOvertimeEmployees.filter(e => e.totalOvertimeHours > 0).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {t('attendance.reports.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Employee Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('attendance.reports.employeeDetail')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('attendance.reports.employeeCode')}</TableHead>
                  <TableHead>{t('attendance.reports.fullName')}</TableHead>
                  <TableHead>{t('attendance.reports.department')}</TableHead>
                  <TableHead className="text-center">{t('attendance.reports.workDaysLabel')}</TableHead>
                  <TableHead className="text-center">{t('attendance.reports.presentLabel')}</TableHead>
                  <TableHead className="text-center">{t('attendance.reports.leaveLabel')}</TableHead>
                  <TableHead className="text-center">{t('attendance.reports.absentLabel')}</TableHead>
                  <TableHead className="text-center">{t('attendance.reports.lateLabel2')}</TableHead>
                  <TableHead className="text-center">{t('attendance.reports.otLabel')}</TableHead>
                  <TableHead className="text-center">{t('attendance.reports.rateLabel')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeStats.slice(0, 20).map((emp) => (
                  <TableRow key={emp.employeeId}>
                    <TableCell className="font-mono text-xs">{emp.employeeCode}</TableCell>
                    <TableCell className="font-medium">{emp.employeeName}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.department || '-'}</TableCell>
                    <TableCell className="text-center">{emp.workDays}</TableCell>
                    <TableCell className="text-center text-green-600">{emp.presentDays}</TableCell>
                    <TableCell className="text-center text-blue-600">{emp.leaveDays}</TableCell>
                    <TableCell className="text-center text-red-600">{emp.absentDays}</TableCell>
                    <TableCell className="text-center text-amber-600">{emp.lateDays}</TableCell>
                    <TableCell className="text-center">{emp.totalOvertimeHours}h</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <Progress value={emp.attendanceRate} className="w-16 h-2" />
                        <span className="text-xs font-medium">{emp.attendanceRate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
