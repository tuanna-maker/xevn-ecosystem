/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → strip «Quỹ phép & ca mặc định» (Hoạt động)
 * UC:         UC-BP-ATT-12 · FR-UC-BP-ATT-12 · AC-ATT-12-FE-CONFIRM · J-HRM-ATT-12-05
 * SRS:        SRS_HRM_ENTERPRISE.md Luồng #4
 * TechSpec:   PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md §4.3 panel
 * Purpose:    HCNS read-only confirm: GET leave-balance/panel (5 buckets) + activate_default shift;
 *             DENY merge buckets · ≠ FR-12 DONE footer.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * Coded:      2026-08-10
 * Callers:    EmployeeActivatePanel (active status)
 * Callees:    useLeaveBalancesByType · useActivateDefaultShift · attLeave12Ring · attLeave05Ring
 * must_keep:  ATT07/06/05/09 seals · Nest /core DENY · U65 · C-SLICE
 * LastVerified: poHrmMvpGd1Att12ClusterFe01.source.test.ts
 */

import { Loader2, Wallet, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivateDefaultShift } from '@/hooks/useActivateDefaultShift';
import { useLeaveBalancesByType } from '@/hooks/useLeaveBalancesByType';
import { deriveAtt05PanelBucketLabelVi } from '@/lib/attLeave05Ring';
import {
  ATT_12_HONESTY_FOOTER,
  att12HonestyBannerText,
  formatActivateDefaultShiftSummaryVi,
} from '@/lib/attLeave12Ring';
import {
  resolveLeaveBalanceDisplayDays,
  resolveLeaveBalanceHeldDays,
} from '@/lib/leaveBalance';

export interface EmployeeActivateEnrollConfirmStripProps {
  employeeId: string;
  enabled?: boolean;
}

export function EmployeeActivateEnrollConfirmStrip({
  employeeId,
  enabled = true,
}: EmployeeActivateEnrollConfirmStripProps) {
  const {
    rows: balanceByTypeRows,
    isLoading: panelLoading,
    isError: panelError,
    panel,
  } = useLeaveBalancesByType({
    employeeId,
    enabled,
  });

  const shiftQuery = useActivateDefaultShift({ employeeId, enabled });

  const year = panel?.balance_year ?? new Date().getFullYear();

  return (
    <Card
      className="rounded-card border-xevn-border shadow-soft"
      data-testid="hdsd-emp-att12-enroll-confirm-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
          <Wallet className="h-4 w-4 text-primary" aria-hidden />
          Quỹ phép & ca mặc định
        </CardTitle>
        <p className="text-xs text-xevn-textSecondary">
          Xác nhận sau kích hoạt Hoạt động — chỉ xem (GĐ1) · năm {year}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div data-testid="hdsd-emp-att12-leave-panel">
          {panelLoading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-xevn-textSecondary">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Đang tải quỹ phép…
            </div>
          ) : panelError ? (
            <p className="text-sm text-destructive" role="alert">
              Không tải được panel quỹ phép. Thử F5 hoặc kiểm tra quyền phạm vi.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-input border border-xevn-border bg-xevn-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-xevn-border bg-xevn-background">
                    <th className="p-2 text-left font-semibold text-xevn-textSecondary">Loại quỹ</th>
                    <th className="p-2 text-right font-semibold text-xevn-textSecondary">Còn lại</th>
                    <th className="p-2 text-right font-semibold text-xevn-textSecondary">Đã trừ</th>
                    <th className="p-2 text-right font-semibold text-xevn-textSecondary">Giữ chỗ</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceByTypeRows.map((row) => {
                    const days = row.balance
                      ? resolveLeaveBalanceDisplayDays(row.balance)
                      : 0;
                    const used = row.balance?.used_days ?? 0;
                    const hold = row.balance
                      ? resolveLeaveBalanceHeldDays(row.balance)
                      : 0;
                    const label = deriveAtt05PanelBucketLabelVi(
                      row.leave_type,
                      row.balance?.leave_type_label || row.leave_type,
                    );
                    return (
                      <tr
                        key={row.leave_type}
                        className="border-b border-xevn-border/60 last:border-0"
                        data-testid={`hdsd-emp-att12-leave-row-${row.leave_type}`}
                      >
                        <td className="p-2 text-[15px] font-medium text-xevn-text">{label}</td>
                        <td
                          className="p-2 text-right tabular-nums text-xevn-text"
                          data-testid={`hdsd-emp-att12-leave-available-${row.leave_type}`}
                        >
                          {days}
                        </td>
                        <td className="p-2 text-right tabular-nums text-xevn-textSecondary">
                          {used}
                        </td>
                        <td
                          className="p-2 text-right tabular-nums text-xevn-textSecondary"
                          title="held = pending_days"
                        >
                          {hold}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="rounded-lg border border-xevn-border bg-xevn-background/80 px-3 py-2"
          data-testid="hdsd-emp-att12-default-shift"
        >
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-xevn-text">
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
            Ca mặc định (activate_default)
          </p>
          {shiftQuery.isLoading ? (
            <p className="text-sm text-xevn-textSecondary">Đang tải ca…</p>
          ) : shiftQuery.isError ? (
            <p className="text-sm text-destructive" role="alert">
              Không tải được ca mặc định.
            </p>
          ) : (
            <p
              className="text-sm font-medium text-xevn-text"
              data-testid="hdsd-emp-att12-shift-summary"
            >
              {formatActivateDefaultShiftSummaryVi(shiftQuery.data ?? null)}
            </p>
          )}
        </div>

        <p
          className="text-[11px] leading-snug text-xevn-textSecondary"
          data-testid="hdsd-emp-att12-honesty-footer"
        >
          {ATT_12_HONESTY_FOOTER}
        </p>
        <p className="sr-only" data-testid="hdsd-emp-att12-honesty-banner">
          {att12HonestyBannerText()}
        </p>
      </CardContent>
    </Card>
  );
}
