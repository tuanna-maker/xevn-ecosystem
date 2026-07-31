/**
 * Dual export — SoT `@xevn/ui` formatDisplayDate (default dd/MM/yyyy).
 * WorkItem: D-UX-VI-FORMAT-SHARED-01
 */
import { formatDisplayDate } from '@xevn/ui';

export {
  formatDisplayDate,
  VI_DATE_DISPLAY_PATTERN,
  VI_DATETIME_DISPLAY_PATTERN,
} from '@xevn/ui';

/** @deprecated Prefer formatDisplayDate — kept for existing join-date call sites. */
export function formatJoinDateVi(value: string | null | undefined): string {
  if (!value || value === '0') return '—';
  return formatDisplayDate(value);
}
