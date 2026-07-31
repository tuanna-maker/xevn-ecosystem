import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Loader2, Search } from 'lucide-react';
import { usePayrollPayslips } from '@/hooks/usePayrollPayslips';
import type { HrmPayslipRow } from '@/integrations/hrmApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  const { payslips, isLoading, fetchError, refetch } = usePayrollPayslips();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HrmPayslipRow | null>(null);

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
    <div className="p-4 md:p-6 space-y-4">
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
          <h2 className="text-lg font-semibold">{t('payroll.payrollList', 'Danh sách phiếu lương')}</h2>
          <p className="text-sm text-muted-foreground" data-testid="payroll-payslips-count">
            {filtered.length} / {payslips.length} {t('common.records', 'bản ghi')}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Tìm kiếm')}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employees.employeeCode', 'Mã NV')}</TableHead>
                <TableHead>{t('employees.fullName', 'Họ tên')}</TableHead>
                <TableHead>{t('payroll.period', 'Kỳ lương')}</TableHead>
                <TableHead className="text-right">{t('payroll.netSalary', 'Thực lĩnh')}</TableHead>
                <TableHead>{t('common.status.label')}</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    {t('common.noData', 'Không có dữ liệu')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.employee_code}</TableCell>
                    <TableCell className="font-medium">{row.employee_name}</TableCell>
                    <TableCell>{row.period_label}</TableCell>
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
        <DialogContent className="max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('payroll.viewPayslip', 'Phiếu lương')} — {selected.period_label}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">{t('employees.fullName', 'Họ tên')}:</span>{' '}
                  <strong>{selected.employee_name}</strong> ({selected.employee_code})
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.grossSalary', 'Tổng thu nhập')}:</span>{' '}
                  {formatCurrency(parseAmount(selected.gross_amount))}
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.deductions', 'Khấu trừ')}:</span>{' '}
                  {formatCurrency(parseAmount(selected.deduction_amount))}
                </p>
                <p>
                  <span className="text-muted-foreground">{t('payroll.netSalary', 'Thực lĩnh')}:</span>{' '}
                  <strong>{formatCurrency(parseAmount(selected.net_amount))}</strong>
                </p>
                <StatusBadge status={selected.status} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
