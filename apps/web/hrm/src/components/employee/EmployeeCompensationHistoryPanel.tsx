/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Contracts → tab Lịch sử
 * UC:         UC-HRM-CI-11 · AC-CD-F5-04
 * BR:         BR-CD-F5-05
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/api/openapi/hrm-api.yaml compensation-history
 * Purpose:    Append-only compensation version timeline (not contract renewal history).
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    EmployeeContracts.tsx
 * Callees:    useEmployeeCompensation.refetchHistory
 * must_keep:  Read-only audit; no destructive edit
 * LastVerified: compensationLines.test.ts
 */

import { useEffect } from 'react';
import { format } from 'date-fns';
import { History, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEmployeeCompensation } from '@/hooks/useEmployeeCompensation';
import { resolveAllowanceCodeDisplayLabel, resolveCompensationLineTypeDisplay } from '@/lib/labelMaps';

type Props = {
  employeeId: string;
};

function formatVnd(amount: unknown): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

export function EmployeeCompensationHistoryPanel({ employeeId }: Props) {
  const { history, isHistoryLoading, refetchHistory } = useEmployeeCompensation(employeeId);

  useEffect(() => {
    void refetchHistory();
  }, [refetchHistory]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-5 w-5" />
          Lịch sử đãi ngộ
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => void refetchHistory()}>
          Tải lại
        </Button>
      </CardHeader>
      <CardContent>
        {isHistoryLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6">
            Chưa có lịch sử thay đổi đãi ngộ. Mỗi lần tạo hoặc điều chỉnh gói sẽ thêm một bản ghi.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l pl-4">
            {history.map((entry) => {
              const snapshot = entry.snapshot as {
                lines?: Array<{ line_type: string; amount: number; allowance_code?: string | null }>;
                effective_from?: string;
              };
              const base = snapshot?.lines?.find((l) => l.line_type === 'base');
              const created =
                entry.created_at && !Number.isNaN(Date.parse(String(entry.created_at)))
                  ? format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')
                  : String(entry.created_at);

              return (
                <li key={entry.id} className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">v{entry.version}</Badge>
                    <span className="text-sm font-medium">{created}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.change_reason || 'Không ghi lý do'}
                    {base ? ` · Base ${formatVnd(base.amount)}` : ''}
                    {snapshot?.effective_from ? ` · từ ${snapshot.effective_from}` : ''}
                  </p>
                  {snapshot?.lines?.length ? (
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {(snapshot.lines ?? []).map((line, idx) => (
                        <li key={`${entry.id}-line-${idx}`}>
                          {resolveCompensationLineTypeDisplay(line.line_type)}
                          {line.allowance_code ? ` · ${resolveAllowanceCodeDisplayLabel(line.allowance_code)}` : ''}:{' '}
                          {formatVnd(line.amount)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
