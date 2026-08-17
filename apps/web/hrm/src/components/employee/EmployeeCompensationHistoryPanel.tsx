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
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP-FE-PROFILE-01
 * change_mode: ADD (restore transitive)
 * What: Khôi phục History panel kèm CompensationPanel (stash 43c479a)
 * must_keep: read-only · Employees list · FE-LIBS-01 · Fleet
 * LastVerified: docs/qa/evidence/w1b-02-emp-fe-profile-01.md
 
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-B
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; purple AI chrome → xevn primary/accent
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-B
 * must_keep: SoftDel; navigate employees/:id; stub honesty; no Nest/seed; no OCR/QR invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: History snapshot shows bank/MST + effective_from dd/MM/yyyy (formatDisplayDate)
 * Why: API-01 history MUST include bank/MST · O11 display-ready
 * must_keep: read-only · packages SoT · U65 · honesty false · CORE-01≠C&B DONE
 */

import { useEffect } from 'react';
import { format } from 'date-fns';
import { History, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEmployeeCompensation } from '@/hooks/useEmployeeCompensation';
import { resolveAllowanceCodeDisplayLabel, resolveCompensationLineTypeDisplay } from '@/lib/labelMaps';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import { maskBankAccountView, maskTaxIdView } from '@/lib/empCoreCbRing';

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
            <Loader2 className="h-6 w-6 animate-spin text-xevn-textSecondary" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-xevn-textSecondary py-6">
            Chưa có lịch sử thay đổi đãi ngộ. Mỗi lần tạo hoặc điều chỉnh gói sẽ thêm một bản ghi.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l pl-4">
            {history.map((entry) => {
              const snapshot = entry.snapshot as {
                lines?: Array<{ line_type: string; amount: number; allowance_code?: string | null }>;
                effective_from?: string;
                bank_account?: string | null;
                bank_name?: string | null;
                bank_branch?: string | null;
                tax_id?: string | null;
              };
              const base = snapshot?.lines?.find((l) => l.line_type === 'base');
              const created =
                entry.created_at && !Number.isNaN(Date.parse(String(entry.created_at)))
                  ? format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')
                  : String(entry.created_at);
              const effFrom = snapshot?.effective_from
                ? formatDisplayDate(snapshot.effective_from)
                : '';

              return (
                <li key={entry.id} className="space-y-1" data-testid={`hdsd-emp-comp-history-${entry.version}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">v{entry.version}</Badge>
                    <span className="text-sm font-medium">{created}</span>
                  </div>
                  <p className="text-sm text-xevn-textSecondary">
                    {entry.change_reason || 'Không ghi lý do'}
                    {base ? ` · Base ${formatVnd(base.amount)}` : ''}
                    {effFrom ? ` · từ ${effFrom}` : ''}
                  </p>
                  {(snapshot?.bank_account || snapshot?.bank_name || snapshot?.tax_id) && (
                    <p className="text-xs text-xevn-textSecondary">
                      NH {snapshot.bank_name?.trim() || '—'} · TK{' '}
                      {maskBankAccountView(snapshot.bank_account)}
                      {snapshot.bank_branch?.trim()
                        ? ` · CN ${snapshot.bank_branch.trim()}`
                        : ''}{' '}
                      · MST {maskTaxIdView(snapshot.tax_id)}
                    </p>
                  )}
                  {snapshot?.lines?.length ? (
                    <ul className="text-xs text-xevn-textSecondary space-y-0.5">
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
