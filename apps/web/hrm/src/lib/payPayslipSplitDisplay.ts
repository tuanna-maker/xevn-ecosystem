/**
 * @CODE-MEMORY
 * Screen:     /hr/payroll — phiếu lương preview đoạn gộp lương giữa kỳ
 * UC:         UC-BP-PAY-04 · FR-UC-BP-PAY-04
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-04 Thành công · AC-PAY-04-PREVIEW-SEGMENTS
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md §5.1
 * Purpose:    Chuẩn hóa segments[] từ BE để hiển thị vi-VN — không cộng net từ đoạn (O9/O11).
 * WorkItem:   PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01
 * Coded:      2026-08-10
 * must_keep:  Header net_amount từ BE · payroll_e2e_ready=false · ≠ PAY-04 DONE
 * SOLID:      Pure helpers tách khỏi React — dễ vitest và QA probe.
 */
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { HrmPayslipSplitSegment } from '@/integrations/hrmApi';

export const PAY04_HONESTY_FOOTER_VI =
  'C-SLICE preview đoạn lương — một Net trên phiếu do hệ thống tính; không phải PAY-04 / module lương UAT hoàn tất.';

export function formatPayMoneyVnd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

/** Hours / quantities — no thousand grouping per locale lock. */
export function formatPayHoursPayable(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return String(value);
}

export function formatPaySegmentDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—';
  try {
    const d = parseISO(iso.trim());
    if (!isValid(d)) return '—';
    return format(d, 'dd/MM/yyyy', { locale: vi });
  } catch {
    return '—';
  }
}

export function normalizePayslipSplitSegments(
  raw: HrmPayslipSplitSegment[] | null | undefined,
): HrmPayslipSplitSegment[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return [...raw].sort((a, b) => (a.segmentSeq ?? 0) - (b.segmentSeq ?? 0));
}

export function payslipSplitPreviewVisible(
  split: boolean | undefined,
  segments: HrmPayslipSplitSegment[] | null | undefined,
): boolean {
  const normalized = normalizePayslipSplitSegments(segments);
  return Boolean(split) || normalized.length > 0;
}
