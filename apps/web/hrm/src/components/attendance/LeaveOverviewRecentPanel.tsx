/**
 * @CODE-MEMORY
 * Screen:     /attendance — tab Tổng quan — yêu cầu nghỉ gần đây
 * UC:         UF-HRM-09 · TC-HDSD-08-02-01 F5 marker on overview
 * Purpose:    Surface recent leave request reasons on overview so F5 persist check
 *             does not require switching to «Nghỉ phép» tab.
 * WorkItem:   D-HDSD-MUTATE-FE-04 · D-HDSD-MUTATE-FE-05
 * Coded:      2026-08-01
 * must_keep:  sanitizeLeaveNoteDisplay for seed: prefix only; U65 no seed
 */
import { useMemo } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { sanitizeLeaveNoteDisplay } from '@/lib/labelMaps';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';

const RECENT_LIMIT = 5;

function formatLeaveDate(iso: string): string {
  const parsed = parseISO(iso);
  if (!isValid(parsed)) return '—';
  return format(parsed, 'dd/MM/yyyy');
}

function sortLeaveRequestsNewestFirst<T extends { created_at?: string | null }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });
}

export function LeaveOverviewRecentPanel() {
  const { t } = useTranslation();
  const { requests: leaveRequests, isLoading } = useLeaveRequests();

  const recent = useMemo(
    () => sortLeaveRequestsNewestFirst(leaveRequests).slice(0, RECENT_LIMIT),
    [leaveRequests],
  );

  return (
    <Card data-testid={HDSD_MUTATE_TEST_IDS.leaveOverviewRecent}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('attendance.overview.recentLeaveRequests', 'Yêu cầu nghỉ gần đây')}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t('attendance.overview.recentLeaveHint', 'Hiển thị trên Tổng quan — F5 vẫn thấy lý do đã gửi')}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('common.loading', 'Đang tải…')}
          </div>
        ) : recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('attendance.overview.noData', 'Chưa có dữ liệu')}
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((row) => {
              const reason = sanitizeLeaveNoteDisplay(row.reason);
              return (
                <div key={row.id} className="rounded-lg border border-border/60 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{row.employee_name}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {row.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatLeaveDate(row.start_date)} – {formatLeaveDate(row.end_date)}
                  </p>
                  {reason ? (
                    <p
                      className="text-xs text-foreground mt-1 line-clamp-2"
                      data-testid={`${HDSD_MUTATE_TEST_IDS.leaveOverviewReasonPrefix}-${row.id}`}
                    >
                      {reason}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
