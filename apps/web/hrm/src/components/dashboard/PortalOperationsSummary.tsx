import { ClipboardList, Users, Wallet, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployees } from '@/hooks/useEmployees';
import { useOperationsSummary } from '@/hooks/useOperationsSummary';
import { isPortalEmbedApiMode } from '@/lib/hrmDataMode';

export function PortalOperationsSummary() {
  const { summary, isLoading, fetchError, useApiMode } = useOperationsSummary();
  const { employees } = useEmployees(true);

  if (!isPortalEmbedApiMode() || !useApiMode) return null;

  const tiles = [
    {
      label: 'Nhân sự',
      value: employees.length,
      icon: Users,
      hint: 'GET /employees',
    },
    {
      label: 'Chấm công',
      value: summary?.attendance_records ?? 0,
      icon: ClipboardList,
      hint: 'operations/reports/summary',
    },
    {
      label: 'Tuyển dụng',
      value: summary?.job_requisitions ?? 0,
      icon: UserPlus,
      hint: 'operations/reports/summary',
    },
    {
      label: 'Kỳ lương',
      value: summary?.payroll_periods ?? 0,
      icon: Wallet,
      hint: 'operations/reports/summary',
    },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tổng quan HRM (UC-HRM-20)</CardTitle>
        <p className="text-xs text-muted-foreground">
          Nest API — không dùng mock khi embed Command Center
        </p>
      </CardHeader>
      <CardContent>
        {fetchError ? (
          <p className="text-sm text-amber-800">{fetchError}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map(({ label, value, icon: Icon, hint }) => (
              <SummaryTile
                key={label}
                label={label}
                value={isLoading ? '…' : String(value)}
                icon={Icon}
                hint={hint}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  hint: string;
}) {
  return (
    <div className="rounded-lg border bg-background/80 p-3 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}
