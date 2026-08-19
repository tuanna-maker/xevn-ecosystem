/**
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01
 * change_mode: ADD
 * What: Display-only breakdown payroll_payslip_split_segments (API-01 §5.1)
 * Why: J-HRM-PAY-04-06 · AC-PAY-04-PREVIEW-SEGMENTS · must_keep PAY01/PAY02
 * must_keep: BE net header · no sum segments → net · payroll_e2e_ready=false · ≠ PAY-04 DONE
 */
import { useTranslation } from 'react-i18next';
import type { HrmPayslipSplitSegment } from '@/integrations/hrmApi';
import {
  formatPayHoursPayable,
  formatPayMoneyVnd,
  formatPaySegmentDate,
  normalizePayslipSplitSegments,
  PAY04_HONESTY_FOOTER_VI,
  payslipSplitPreviewVisible,
} from '@/lib/payPayslipSplitDisplay';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Props = {
  split?: boolean;
  segmentCount?: number;
  segments?: HrmPayslipSplitSegment[] | null;
};

export function PayslipSplitSegmentsPanel({ split, segmentCount, segments }: Props) {
  const { t } = useTranslation();
  const rows = normalizePayslipSplitSegments(segments);

  if (!payslipSplitPreviewVisible(split, rows)) {
    return (
      <p
        className="text-xs text-muted-foreground border-t pt-3"
        data-testid="pay-04-honesty"
      >
        {PAY04_HONESTY_FOOTER_VI}
      </p>
    );
  }

  const countLabel =
    segmentCount != null && segmentCount > 0
      ? segmentCount
      : rows.length;

  return (
    <div className="space-y-3 border-t pt-3" data-testid="pay-payslip-split-segments">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-xevn-text">
          {t('payroll.splitSegmentsTitle', 'Chi tiết đoạn lương giữa kỳ')}
        </h3>
        <span className="text-xs text-muted-foreground" data-testid="pay-payslip-segment-count">
          {t('payroll.splitSegmentCount', '{{count}} đoạn', { count: countLabel })}
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>{t('payroll.segmentFrom', 'Từ ngày')}</TableHead>
            <TableHead>{t('payroll.segmentTo', 'Đến ngày')}</TableHead>
            <TableHead className="text-right">{t('payroll.baseSalarySnapshot', 'Lương cơ bản (snapshot)')}</TableHead>
            <TableHead className="text-right">{t('payroll.hoursPayable', 'Giờ tính lương')}</TableHead>
            <TableHead className="text-right">{t('payroll.segmentGross', 'Gross đoạn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.segmentSeq} data-testid={`pay-payslip-segment-row-${row.segmentSeq}`}>
              <TableCell>{row.segmentSeq}</TableCell>
              <TableCell>{formatPaySegmentDate(row.effectiveFrom)}</TableCell>
              <TableCell>{formatPaySegmentDate(row.effectiveTo)}</TableCell>
              <TableCell className="text-right">{formatPayMoneyVnd(row.baseSalarySnapshotVnd)}</TableCell>
              <TableCell className="text-right">{formatPayHoursPayable(row.hoursPayable)}</TableCell>
              <TableCell className="text-right">{formatPayMoneyVnd(row.segmentGrossVnd)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground" data-testid="pay-04-honesty">
        {PAY04_HONESTY_FOOTER_VI}
      </p>
    </div>
  );
}
