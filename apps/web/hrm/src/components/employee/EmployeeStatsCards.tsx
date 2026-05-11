import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AttendanceStat {
  label: string;
  value: number;
  unit: string;
  total?: number;
  color?: string;
}

interface WorkEfficiencyStat {
  label: string;
  percentage: number;
  color: string;
}

interface EmployeeStatsCardsProps {
  attendanceStats?: AttendanceStat[];
  efficiencyStats?: WorkEfficiencyStat[];
  totalTasks?: number;
}

export function EmployeeStatsCards({
  attendanceStats,
  efficiencyStats,
  totalTasks = 26,
}: EmployeeStatsCardsProps) {
  const { t } = useTranslation();

  const defaultAttendanceStats: AttendanceStat[] = [
    { label: t('employeeStats.workDays'), value: 86.5, unit: t('employeeStats.days'), total: 22.4, color: 'bg-green-500' },
    { label: t('employeeStats.late'), value: 4, unit: t('employeeStats.times'), total: 1, color: 'bg-orange-500' },
    { label: t('employeeStats.earlyLeave'), value: 1, unit: t('employeeStats.times'), total: 0.3, color: 'bg-yellow-500' },
    { label: t('employeeStats.leaveRequest'), value: 6, unit: t('employeeStats.times'), total: 1.5, color: 'bg-blue-500' },
    { label: t('employeeStats.overtime'), value: 9, unit: t('employeeStats.hours'), total: 2.3, color: 'bg-purple-500' },
  ];

  const defaultEfficiencyStats: WorkEfficiencyStat[] = [
    { label: t('employeeStats.completedEarly'), percentage: 0, color: 'bg-green-500' },
    { label: t('employeeStats.completedOnTime'), percentage: 26.92, color: 'bg-blue-500' },
    { label: t('employeeStats.completedLate'), percentage: 26.92, color: 'bg-orange-500' },
    { label: t('employeeStats.notCompleted'), percentage: 12, color: 'bg-red-500' },
  ];

  const stats = attendanceStats || defaultAttendanceStats;
  const efficiency = efficiencyStats || defaultEfficiencyStats;

  return (
    <div className="space-y-4">
      {/* Attendance Stats */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">{t('employeeStats.workConsciousness')}</CardTitle>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{t('employeeStats.total')}</span>
              <span>{t('employeeStats.personalAvgMonth')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground w-24">{stat.label}</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className={cn('px-3 py-1 rounded text-sm font-medium text-white', stat.color)}>
                  {stat.value} {stat.unit}
                </div>
                {stat.total !== undefined && (
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {stat.total}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Work Efficiency */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{t('employeeStats.workEfficiency')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Total Tasks Circle */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--border))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40 * 0.65} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{totalTasks}</span>
                <span className="text-xs text-muted-foreground">{t('employeeStats.tasks')}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mb-4">
            {t('employeeStats.totalTasks')}
          </p>

          {/* Efficiency Breakdown */}
          <div className="space-y-3">
            {efficiency.map((stat, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', stat.color)} />
                    <span>{stat.label}</span>
                  </div>
                  <span className="font-medium">{stat.percentage}%</span>
                </div>
                <Progress value={stat.percentage} className="h-1.5" />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {t('employeeStats.profileProgress')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}