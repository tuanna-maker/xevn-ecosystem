/**
 * UC-BP-PAY-01 · G-PAY-01-BIND-FE — display-ready bind boundary (no hour SoT on FE).
 * must_keep: payroll_e2e_ready=false · ATT11QC1-MSLXTH9P peer · ≠ PAY-01 DONE · Nest /core hour SoT 0
 * WorkItem: PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01
 */

export const PAY01_BIND_HONESTY_FOOTER =
  'payroll_e2e_ready=false · C-SLICE · ≠ FR-UC-BP-PAY-01 DONE · tiên quyết chốt bảng công (ATT11QC1)';

export const PAY01_ATT11_PEER_STAMP = 'ATT11QC1-MSLXTH9P';

export type PayTimesheetSheetStatus = 'closed' | 'submitted' | 'open' | 'draft' | string;

export type HrmPayPeriodTimesheetBindRow = {
  id: string;
  companyId?: string;
  payrollPeriodId?: string;
  timesheetHeaderId: string;
  timesheetDisplayLabel: string;
  timesheetStatus: PayTimesheetSheetStatus;
  transferKind?: string | null;
  boundAt?: string | null;
  sheetDateFrom?: string | null;
  sheetDateTo?: string | null;
  note?: string | null;
};

export function formatPayTimesheetStatusLabelVi(status: PayTimesheetSheetStatus | null | undefined): string {
  const key = String(status ?? '').trim().toLowerCase();
  switch (key) {
    case 'closed':
      return 'Đã chốt';
    case 'submitted':
      return 'Chờ ký / đã nộp';
    case 'open':
    case 'draft':
      return 'Nháp';
    default:
      return key ? key : '—';
  }
}

export function isPayTimesheetClosedForBind(status: PayTimesheetSheetStatus | null | undefined): boolean {
  return String(status ?? '').trim().toLowerCase() === 'closed';
}

/** Actionable VI for bind/process 412 family — AC-PAY-01-BIND-DRAFT-412 · AC-PAY-01-PROCESS-412 */
export function resolvePayAtt412UserMessage(code: string | undefined, fallback?: string): string {
  if (code === 'HRM-PAY-ATT-412') {
    return 'Bảng chấm công chưa chốt hoặc không khớp kỳ lương. Vui lòng sang phân hệ Chấm công chốt bảng công (ATT-11) rồi thử lại.';
  }
  if (code === 'HRM-PAY-INP-409-DUP') {
    return 'Kỳ lương đã gắn bảng công này. F5 để xem liên kết hiện có.';
  }
  return fallback?.trim() || 'Không thể gắn bảng công với kỳ lương.';
}

export function sortSheetsForPayBindPicker<
  T extends { status?: string; start_date?: string; name?: string },
>(sheets: T[]): T[] {
  return [...sheets].sort((a, b) => {
    const aClosed = isPayTimesheetClosedForBind(a.status) ? 0 : 1;
    const bClosed = isPayTimesheetClosedForBind(b.status) ? 0 : 1;
    if (aClosed !== bClosed) return aClosed - bClosed;
    const aDate = a.start_date ?? '';
    const bDate = b.start_date ?? '';
    return bDate.localeCompare(aDate);
  });
}
