/**
 * @CODE-MEMORY
 * Screen:     Employee profile → Thông tin chung (E11) side stats cards
 * UC:         E11 general tab chrome
 * Purpose:    Attendance/efficiency summary panels on profile general (display chrome).
 * WorkItem:   PO-HRM-UI-BRAND-W3-EMP-A
 * Coded:      2026-08-05
 * must_keep:  stub/default demo numbers honesty — do not claim LIVE API; no Nest invent
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-A
 * change_mode: UPGRADE
 * What: Labels → text-xevn-textSecondary; ban purple overtime chip → cyan accent
 * Why: Precision Motion pale ban + no purple AI on E11
 */
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
    { label: t('employeeStats.workDays'), value: 86.5, unit: t('employeeStats.days'), total: 22.4, color: 'bg-emerald-600' },
    { label: t('employeeStats.late'), value: 4, unit: t('employeeStats.times'), total: 1, color: 'bg-orange-600' },
    { label: t('employeeStats.earlyLeave'), value: 1, unit: t('employeeStats.times'), total: 0.3, color: 'bg-amber-500' },
    { label: t('employeeStats.leaveRequest'), value: 6, unit: t('employeeStats.times'), total: 1.5, color: 'bg-primary' },
    { label: t('employeeStats.overtime'), value: 9, unit: t('employeeStats.hours'), total: 2.3, color: 'bg-cyan-600' },
  ];

  const defaultEfficiencyStats: WorkEfficiencyStat[] = [
    { label: t('employeeStats.completedEarly'), percentage: 0, color: 'bg-emerald-600' },
    { label: t('employeeStats.completedOnTime'), percentage: 26.92, color: 'bg-primary' },
    { label: t('employeeStats.completedLate'), percentage: 26.92, color: 'bg-orange-600' },
    { label: t('employeeStats.notCompleted'), percentage: 12, color: 'bg-rose-600' },
  ];

  const stats = attendanceStats || defaultAttendanceStats;
  const efficiency = efficiencyStats || defaultEfficiencyStats;

  return (
    <div className="space-y-4">
      <Card className="border-xevn-border bg-xevn-surface shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-xevn-text">
              {t('employeeStats.workConsciousness')}
            </CardTitle>
            <div className="flex gap-4 text-xs text-xevn-textSecondary">
              <span>{t('employeeStats.total')}</span>
              <span>{t('employeeStats.personalAvgMonth')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="w-24 text-sm text-xevn-textSecondary">{stat.label}</span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <div className={cn('rounded px-3 py-1 text-sm font-medium text-white', stat.color)}>
                  {stat.value} {stat.unit}
                </div>
                {stat.total !== undefined && (
                  <span className="w-12 text-right text-sm tabular-nums text-xevn-textSecondary">
                    {stat.total}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-xevn-border bg-xevn-surface shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-xevn-text">
            {t('employeeStats.workEfficiency')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-center">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90 transform">
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
                <span className="text-2xl font-bold text-xevn-text">{totalTasks}</span>
                <span className="text-xs text-xevn-textMuted">{t('employeeStats.tasks')}</span>
              </div>
            </div>
          </div>

          <p className="mb-4 text-center text-sm text-xevn-textSecondary">
            {t('employeeStats.totalTasks')}
          </p>

          <div className="space-y-3">
            {efficiency.map((stat, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-xevn-text">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2 w-2 rounded-full', stat.color)} />
                    <span>{stat.label}</span>
                  </div>
                  <span className="font-medium tabular-nums">{stat.percentage}%</span>
                </div>
                <Progress value={stat.percentage} className="h-1.5" />
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-xevn-border pt-4">
            <p className="text-center text-xs text-xevn-textSecondary">
              {t('employeeStats.profileProgress')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
