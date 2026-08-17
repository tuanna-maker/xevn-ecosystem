/**
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-B-01
 * change_mode: UPGRADE
 * What: Precision Motion P14 payslip API tab — title ≥20; detail dialog brand chrome
 * Why: ADR §16 · W3-PAY-B P14
 * must_keep: usePayrollPayslips API; vi-VN money
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01
 * change_mode: ADD
 * What: GET payslip by id + segments[] preview (F-PAY-PAYSLIP-01 · API-01 §5)
 * Why: J-HRM-PAY-04-06 display-only · must_keep PAY01QC1 · PAY02QC1
 * must_keep: BE net SoT · no FE sum segments · payroll_e2e_ready=false · ≠ PAY-04 DONE
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Loader2, Search } from 'lucide-react';
import { usePayrollPayslips } from '@/hooks/usePayrollPayslips';
import { usePayrollPayslipDetail } from '@/hooks/usePayrollPayslipDetail';
import { usePayrollGroups } from '@/hooks/usePayrollGroups';
import type { HrmPayslipRow } from '@/integrations/hrmApi';
import { PAY09_GROUP_HONESTY_FOOTER } from '@/lib/payPay09GroupRing';
import { PayslipSplitSegmentsPanel } from '@/components/payroll/PayslipSplitSegmentsPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

function parseAmount(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function PayrollPayslipsApiTab() {
  const { t } = useTranslation();
  const [payrollGroupFilter, setPayrollGroupFilter] = useState<string>('__all__');
  const filterGroupId = payrollGroupFilter === '__all__' ? undefined : payrollGroupFilter;
  const { payslips, isLoading, fetchError, refetch } = usePayrollPayslips(undefined, filterGroupId);
  const { groups: payrollGroups, isLoading: groupsLoading } = usePayrollGroups();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HrmPayslipRow | null>(null);
  const {
    detail: payslipDetail,
    isLoading: detailLoading,
    fetchError: detailError,
    refetch: refetchDetail,
  } = usePayrollPayslipDetail(selected?.id ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payslips;
    return payslips.filter(
      (row) =>
        row.employee_name.toLowerCase().includes(q) ||
        row.employee_code.toLowerCase().includes(q) ||
        row.period_label.toLowerCase().includes(q),
    );
  }, [payslips, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 xevn-safe-inline" data-testid="pay-payslips-api-precision">
      {fetchError ? (
        <div className="space-y-2">
          <HrmListLoadBanner loadFailed errorMessage={fetchError} />
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            {t('common.retry', 'Thử lại')}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text">{t('payroll.payrollList', 'Danh sách phiếu lương')}</h2>
          <p className="text-sm text-muted-foreground" data-testid="payroll-payslips-count">
            {filtered.length} / {payslips.length} {t('common.records', 'bản ghi')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search', 'Tìm kiếm')}
              className="pl-9"
            />
          </div>
          <Select value={payrollGroupFilter} onValueChange={setPayrollGroupFilter}>
            <SelectTrigger className="w-full sm:w-64" data-testid="pay-payslips-group-filter">
              <SelectValue placeholder={groupsLoading ? 'Nhóm…' : 'Lọc theo nhóm'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả nhóm</SelectItem>
              {payrollGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.code} — {g.name_vi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground" data-testid="pay09-payslips-honesty-footer">
        {PAY09_GROUP_HONESTY_FOOTER}
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employees.employeeCode', 'Mã NV')}</TableHead>
                <TableHead>{t('employees.fullName', 'Họ tên')}</TableHead>
                <TableHead>{t('payroll.period', 'Kỳ lương')}</TableHead>
                <TableHead>Nhóm lương</TableHead>
                <TableHead className="text-right">{t('payroll.netSalary', 'Thực lĩnh')}</TableHead>
                <TableHead>{t('common.status.label')}</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    {t('common.noData', 'Không có dữ liệu')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.employee_code}</TableCell>
                    <TableCell className="font-medium">{row.employee_name}</TableCell>
                    <TableCell>{row.period_label}</TableCell>
                    <TableCell>
                      {row.payroll_group_name_vi
                        ? `${row.payroll_group_code ?? ''} ${row.payroll_group_name_vi}`.trim()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(parseAmount(row.net_amount))}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(row)} aria-label="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-[920px]" data-testid="pay-payslip-detail-dialog-precision">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-[20px] font-bold font-display">
                  {t('payroll.viewPayslip', 'Phiếu lương')} — {selected.period_label}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {detailLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading', 'Đang tải…')}
                  </div>
                ) : null}
                {detailError ? (
                  <div className="space-y-2">
                    <HrmListLoadBanner loadFailed errorMessage={detailError} />
                    <Button variant="outline" size="sm" onClick={() => void refetchDetail()}>
                      {t('common.retry', 'Thử lại')}
                    </Button>
                  </div>
                ) : null}
                <p>
                  <span className="text-muted-foreground">{t('employees.fullName', 'Họ tên')}:</span>{' '}
                  <strong>{selected.employee_name}</strong> ({selected.employee_code})
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.grossSalary', 'Tổng thu nhập')}:</span>{' '}
                  {formatCurrency(
                    parseAmount(payslipDetail?.gross_amount ?? selected.gross_amount),
                  )}
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.deductions', 'Khấu trừ')}:</span>{' '}
                  {formatCurrency(
                    parseAmount(payslipDetail?.deduction_amount ?? selected.deduction_amount),
                  )}
                </p>
                <p data-testid="pay-payslip-header-net">
                  <span className="text-muted-foreground">{t('payroll.netSalary', 'Thực lĩnh')}:</span>{' '}
                  <strong>
                    {formatCurrency(parseAmount(payslipDetail?.net_amount ?? selected.net_amount))}
                  </strong>
                </p>
                <StatusBadge status={payslipDetail?.status ?? selected.status} />
                {!detailLoading && !detailError ? (
                  <PayslipSplitSegmentsPanel
                    split={payslipDetail?.split}
                    segmentCount={payslipDetail?.segmentCount}
                    segments={payslipDetail?.segments}
                  />
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
