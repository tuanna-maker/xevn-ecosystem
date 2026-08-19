/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Phiếu của tôi (ESS self-service)
 * UC:         FR-UC-BP-PAY-08 · F-PAY-PAYSLIP-01 ESS · AMIS Step6 GĐ1
 * BR:         BR-BP-SLIP-01 — own-only; CEO without employee_id → 403 honest
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-08
 * TechSpec:   API_DESIGN F-PAY-PAYSLIP-01 · Nest /payroll/me/payslips* (L1 SEAL)
 * Purpose:    List → detail → Xác nhận phiếu; bind display-ready; F5 giữ ess_confirmed.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-ESS-FE-01
 * Coded:      2026-08-07
 * Callers:    pages/Payroll.tsx tab ess
 * Callees:    useMyEssPayslips · essPayslipUi · StatusBadge
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải list | refetch | GET /payroll/me/payslips |
 *             | Mở chi tiết | openDetail | GET /payroll/me/payslips/:id |
 *             | Xác nhận | confirm | POST …/confirm → 2xx HRM-PAY-204-ESS |
 * Impact:     Thiếu wire ESS → QC residual FE/mobile ESS UI sau L1 GWC
 * must_keep:  own-only 403 · CEO 403 · F5 after confirm · no FE formula · U65 · payroll_e2e_ready=false
 * SOLID:      Panel presentation; hook owns network; lib owns pure display gates
 * solid_convention_ack: FE–BE — display-ready bind; no invent net/gross; L1 sealed
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-pay-ess-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-ESS-FE-02
 * change_mode: FIX
 * What: shouldShowEssOwnOnlyHint — hide CEO 403 copy on SCOPE_CONTEXT_MISMATCH
 * Why: QA-02 OBS — 409 still showed ess-payslips-403-hint
 * must_keep: CEO 403 hint when HRM-PAY-403-ESS; L1 SEAL
 */
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Eye, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useMyEssPayslips } from '@/hooks/useMyEssPayslips';
import {
  canConfirmEssPayslip,
  formatEssConfirmStamp,
  formatEssMoney,
  resolveEssConfirmBadgeKind,
  shouldShowEssOwnOnlyHint,
} from '@/lib/essPayslipUi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { HrmListLoadBanner } from '@/components/hrm/HrmListLoadBanner';

function EssConfirmBadge({
  status,
  essConfirmed,
}: {
  status?: string | null;
  essConfirmed?: boolean | null;
}) {
  const { t } = useTranslation();
  const kind = resolveEssConfirmBadgeKind({ status, ess_confirmed: essConfirmed });
  if (kind === 'confirmed') {
    return (
      <Badge
        className="bg-success/10 text-success hover:bg-success/20"
        data-testid="ess-payslip-confirmed-badge"
      >
        {t('payroll.ess.confirmed', 'Đã xác nhận')}
      </Badge>
    );
  }
  if (kind === 'pending') {
    return (
      <Badge variant="outline" data-testid="ess-payslip-pending-badge">
        {t('payroll.ess.pendingConfirm', 'Chờ xác nhận')}
      </Badge>
    );
  }
  if (kind === 'draft') {
    return (
      <Badge variant="secondary" data-testid="ess-payslip-draft-badge">
        {t('payroll.ess.notReady', 'Chưa phát hành')}
      </Badge>
    );
  }
  return <StatusBadge status={status ?? 'unknown'} />;
}

export function EssPayslipsPanel() {
  const { t } = useTranslation();
  const {
    payslips,
    isLoading,
    fetchError,
    refetch,
    detail,
    detailLoading,
    detailError,
    openDetail,
    closeDetail,
    confirm,
    confirming,
  } = useMyEssPayslips();

  const dialogOpen = detail != null || detailLoading || Boolean(detailError);

  const onConfirm = async () => {
    if (!detail?.id) return;
    const updated = await confirm(detail.id);
    if (updated?.ess_confirmed) {
      toast.success(t('payroll.ess.confirmSuccess', 'Đã xác nhận phiếu lương'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="ess-payslips-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 xevn-safe-inline" data-testid="ess-payslips-panel-precision">
      {fetchError ? (
        <div className="space-y-2">
          <HrmListLoadBanner loadFailed errorMessage={fetchError} />
          {shouldShowEssOwnOnlyHint(fetchError) ? (
            <p className="text-sm text-muted-foreground" data-testid="ess-payslips-403-hint">
              {t(
                'payroll.ess.ownOnlyHint',
                'Phiếu lương cá nhân yêu cầu đăng nhập gắn hồ sơ nhân viên (vd. uat.nv0001). Tài khoản CEO/không có employee_id sẽ bị từ chối (403).',
              )}
            </p>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => void refetch()} data-testid="ess-payslips-retry">
            {t('common.retry', 'Thử lại')}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text">
            {t('payroll.ess.title', 'Phiếu lương của tôi')}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="ess-payslips-count">
            {payslips.length} {t('common.records', 'bản ghi')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          data-testid="hdsd-pay-ess-refresh"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          {t('common.refresh', 'Tải lại')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('payroll.period', 'Kỳ lương')}</TableHead>
                <TableHead className="text-right">{t('payroll.netSalary', 'Thực lĩnh')}</TableHead>
                <TableHead>{t('common.status.label')}</TableHead>
                <TableHead>{t('payroll.ess.confirmCol', 'Xác nhận')}</TableHead>
                <TableHead className="w-[88px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {!fetchError && payslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    {t('payroll.ess.empty', 'Chưa có phiếu lương phát hành cho bạn.')}
                  </TableCell>
                </TableRow>
              ) : null}
              {payslips.map((row) => (
                <TableRow key={row.id} data-testid={`ess-payslip-row-${row.id}`}>
                  <TableCell className="font-medium">{row.period_label || '—'}</TableCell>
                  <TableCell className="text-right">{formatEssMoney(row.net_amount, row.currency)}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <EssConfirmBadge status={row.status} essConfirmed={row.ess_confirmed} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void openDetail(row.id)}
                      aria-label={t('payroll.viewPayslip', 'Xem phiếu lương')}
                      data-testid={`hdsd-pay-ess-open-${row.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <DialogContent className="sm:max-w-[720px]" data-testid="ess-payslip-detail-dialog-precision">
          {detailLoading && !detail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : null}

          {detailError && !detail ? (
            <div className="space-y-3 py-4">
              <HrmListLoadBanner loadFailed errorMessage={detailError} />
              <DialogFooter>
                <Button variant="outline" onClick={closeDetail}>
                  {t('common.close', 'Đóng')}
                </Button>
              </DialogFooter>
            </div>
          ) : null}

          {detail ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-[20px] font-bold font-display">
                  {t('payroll.viewPayslip', 'Phiếu lương')} — {detail.period_label || '—'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm" data-testid="ess-payslip-detail-body">
                {detailError ? <HrmListLoadBanner loadFailed errorMessage={detailError} /> : null}
                <p>
                  <span className="text-muted-foreground">{t('employees.fullName', 'Họ tên')}:</span>{' '}
                  <strong>{detail.employee_name}</strong>
                  {detail.employee_code ? ` (${detail.employee_code})` : ''}
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.grossSalary', 'Tổng thu nhập')}:</span>{' '}
                  {formatEssMoney(detail.gross_amount, detail.currency)}
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.deductions', 'Khấu trừ')}:</span>{' '}
                  {formatEssMoney(detail.deduction_amount, detail.currency)}
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.netSalary', 'Thực lĩnh')}:</span>{' '}
                  <strong>{formatEssMoney(detail.net_amount, detail.currency)}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={detail.status} />
                  <EssConfirmBadge status={detail.status} essConfirmed={detail.ess_confirmed} />
                </div>
                <p data-testid="ess-payslip-confirmed-at">
                  <span className="text-muted-foreground">
                    {t('payroll.ess.confirmedAt', 'Thời điểm xác nhận')}:
                  </span>{' '}
                  {formatEssConfirmStamp(detail.employee_confirmed_at)}
                </p>

                {(detail.lines?.length ?? 0) > 0 || (detail.components?.length ?? 0) > 0 ? (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('payroll.ess.componentCode', 'Mã thành phần')}</TableHead>
                          <TableHead className="text-right">{t('common.amount', 'Số tiền')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(detail.lines?.length ? detail.lines : detail.components ?? []).map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>{line.component_code}</TableCell>
                            <TableCell className="text-right">
                              {formatEssMoney(line.amount, detail.currency)}
                              {line.sign === '-' ? ' (−)' : ''}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs" data-testid="ess-payslip-lines-empty">
                    {t(
                      'payroll.ess.linesEmpty',
                      'Không có dòng thành phần trên phiếu (cấu trúc OK — mật độ dòng không chặn xác nhận).',
                    )}
                  </p>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeDetail} data-testid="ess-payslip-detail-close">
                  {t('common.close', 'Đóng')}
                </Button>
                {canConfirmEssPayslip(detail) ? (
                  <Button
                    onClick={() => void onConfirm()}
                    disabled={confirming}
                    data-testid="hdsd-pay-ess-confirm"
                  >
                    {confirming ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    )}
                    {t('payroll.ess.confirmCta', 'Xác nhận phiếu')}
                  </Button>
                ) : null}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
