/**
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01
 * change_mode: ADD
 * What: Gắn kỳ lương ↔ bảng công chốt — GET/POST timesheet-binds · 412 banner · F5 list
 * Why: G-PAY-01-BIND-FE · AC-PAY-01-BIND-CLOSED/DRAFT-412 · J-HRM-PAY-01-02/03 · ATT11QC1 peer
 * must_keep: payroll_e2e_ready=false · ≠ PAY-01 DONE · ATT12QC1+ATT11QC1 seals · U65 no seed · no Nest /core hour SoT
 */
import { useMemo, useState } from 'react';
import { Link2, Loader2, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendanceSheets } from '@/hooks/useAttendanceSheets';
import { usePayrollPeriodEligibility } from '@/hooks/usePayrollBatches';
import {
  useCreatePayrollPeriodTimesheetBind,
  usePayrollPeriodTimesheetBinds,
} from '@/hooks/usePayrollPeriodTimesheetBinds';
import {
  PAY01_ATT11_PEER_STAMP,
  PAY01_BIND_HONESTY_FOOTER,
  formatPayTimesheetStatusLabelVi,
  isPayTimesheetClosedForBind,
  sortSheetsForPayBindPicker,
} from '@/lib/payPay01BindRing';

type Props = {
  periodId: string;
  editable: boolean;
};

function formatSheetRange(from?: string | null, to?: string | null): string {
  try {
    const a = from ? format(parseISO(from), 'dd/MM/yyyy') : '—';
    const b = to ? format(parseISO(to), 'dd/MM/yyyy') : '—';
    return `${a} – ${b}`;
  } catch {
    return '—';
  }
}

export function PayrollPeriodTimesheetBindPanel({ periodId, editable }: Props) {
  const { currentCompanyId } = useAuth();
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');

  const { data: bindsData, isLoading: bindsLoading, isError: bindsError, refetch } =
    usePayrollPeriodTimesheetBinds(periodId, true);

  const { data: eligibilityData } = usePayrollPeriodEligibility(periodId, true);

  const { sheets, isLoading: sheetsLoading } = useAttendanceSheets({
    enabled: editable && Boolean(currentCompanyId),
  });

  const createBind = useCreatePayrollPeriodTimesheetBind(periodId);

  const sortedSheets = useMemo(
    () => sortSheetsForPayBindPicker(sheets),
    [sheets],
  );

  const selectedSheet = sortedSheets.find((s) => s.id === selectedSheetId);
  const selectedClosed = isPayTimesheetClosedForBind(selectedSheet?.status);

  const showClosedSheetBanner =
    eligibilityData?.require_closed_timesheet === true &&
    eligibilityData?.has_closed_sheet === false;

  const handleBind = async () => {
    if (!selectedSheetId) return;
    await createBind.mutateAsync(selectedSheetId);
    setSelectedSheetId('');
    await refetch();
  };

  const bindItems = bindsData?.items ?? [];

  return (
    <Card data-testid="pay-period-timesheet-binds">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Gắn bảng chấm công (chốt)
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tiên quyết chốt bảng công theo ATT-11 ({PAY01_ATT11_PEER_STAMP}) — chỉ header{' '}
              <span className="font-medium text-foreground">Đã chốt</span> mới gắn được (POST 2xx).
              Bảng nháp/chờ ký → 412 <code className="text-xs">HRM-PAY-ATT-412</code>.
            </p>
          </div>
        </div>

        {showClosedSheetBanner && (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            data-testid="pay-bind-no-closed-sheet-banner"
            role="status"
          >
            Kỳ chưa có bảng chấm công đã chốt trong tháng — gắn bảng đã chốt trước khi chạy tính
            lương. Điều kiện NV có thể hiển thị <strong>NO_CLOSED_SHEET</strong>.
          </div>
        )}

        {bindsLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải liên kết…
          </div>
        )}
        {bindsError && (
          <p className="text-sm text-destructive">Không tải được danh sách gắn — thử F5.</p>
        )}

        {!bindsLoading && !bindsError && (
          <div className="space-y-2" data-testid="pay-period-timesheet-binds-list">
            {bindItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa gắn bảng chấm công nào.</p>
            ) : (
              bindItems.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  data-testid={`pay-bind-row-${row.id}`}
                >
                  <span className="font-medium">{row.timesheetDisplayLabel}</span>
                  <Badge
                    variant={row.timesheetStatus === 'closed' ? 'default' : 'secondary'}
                    data-testid="pay-bind-timesheet-status"
                  >
                    {formatPayTimesheetStatusLabelVi(row.timesheetStatus)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatSheetRange(row.sheetDateFrom, row.sheetDateTo)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {editable && (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end border-t pt-4">
            <div className="flex-1 w-full space-y-1">
              <label className="text-sm font-medium" htmlFor="pay-bind-sheet-select">
                Chọn header bảng công
              </label>
              <Select
                value={selectedSheetId || undefined}
                onValueChange={setSelectedSheetId}
                disabled={sheetsLoading || createBind.isPending}
              >
                <SelectTrigger id="pay-bind-sheet-select" data-testid="pay-bind-sheet-select">
                  <SelectValue placeholder={sheetsLoading ? 'Đang tải…' : 'Chọn bảng chấm công'} />
                </SelectTrigger>
                <SelectContent>
                  {sortedSheets.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.id}>
                      {sheet.name} · {formatPayTimesheetStatusLabelVi(sheet.status)} ·{' '}
                      {formatSheetRange(sheet.start_date, sheet.end_date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSheet && !selectedClosed && (
                <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <Info className="h-3 w-3 shrink-0" />
                  Bảng chưa chốt — POST gắn sẽ trả 412 HRM-PAY-ATT-412 (không tạo liên kết giả).
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={() => void handleBind()}
              disabled={!selectedSheetId || createBind.isPending}
              data-testid="pay-bind-submit"
            >
              {createBind.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gắn…
                </>
              ) : (
                'Gắn với kỳ lương'
              )}
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
