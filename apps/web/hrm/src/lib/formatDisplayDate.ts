import { format, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/** Safe date format — never throws RangeError on bad API/mock values. */
export function formatDisplayDate(
  value: string | null | undefined,
  pattern = 'dd/MM/yyyy',
): string {
  if (value == null || value === '') return '—';
  const trimmed = String(value).trim();
  if (!trimmed) return '—';

  const isoTry = parseISO(trimmed);
  if (isValid(isoTry)) {
    return format(isoTry, pattern, { locale: vi });
  }

  const native = new Date(trimmed);
  if (isValid(native)) {
    return format(native, pattern, { locale: vi });
  }

  // period_label dạng MM/yyyy hoặc yyyy-MM — hiển thị nguyên văn, không parse thành ngày
  if (/^\d{1,2}\/\d{4}$/.test(trimmed) || /^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return '—';
}

/** Chọn ngày chi trả từ payslip row (ưu tiên trường ISO nếu API bổ sung sau). */
export function payslipPayDateLabel(periodLabel: string | null | undefined): string {
  return formatDisplayDate(periodLabel);
}
