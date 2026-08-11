/**
 * @CODE-MEMORY
 * Screen:     Shared VI date entry helpers (portal CC + settings)
 * Purpose:    Convert ISO date-only (yyyy-MM-dd) ↔ display dd/MM/yyyy for text entry.
 *             Native type=date chrome is OS-locale; this path guarantees vi-VN display.
 * WorkItem:   D-UX-VI-FORMAT-PORTAL-01
 * Coded:      2026-07-20
 * must_keep:  emit ISO yyyy-MM-dd for API; empty ↔ ''; invalid blur → keep last valid or ''
 * LastVerified: apps/web/web-portal viNumberFormat.test.ts (isCompleteViDateDraft)
 */

import { formatDisplayDate, VI_DATE_DISPLAY_PATTERN } from './formatDisplayDate';

export { VI_DATE_DISPLAY_PATTERN };

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** ISO date-only → dd/MM/yyyy; empty → ''. */
export function formatIsoDateToViDisplay(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === '') return '';
  const display = formatDisplayDate(String(iso).trim(), VI_DATE_DISPLAY_PATTERN);
  return display === '—' ? '' : display;
}

/**
 * Parse user entry to ISO yyyy-MM-dd.
 * Accepts dd/MM/yyyy, d/M/yyyy, yyyy-MM-dd. Invalid → null.
 */
export function parseViDisplayToIsoDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    const local = new Date(y, m - 1, d);
    if (local.getFullYear() === y && local.getMonth() === m - 1 && local.getDate() === d) {
      return `${y}-${pad2(m)}-${pad2(d)}`;
    }
    return null;
  }

  const vi = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (!vi) return null;
  const d = Number(vi[1]);
  const m = Number(vi[2]);
  const y = Number(vi[3]);
  const local = new Date(y, m - 1, d);
  if (local.getFullYear() !== y || local.getMonth() !== m - 1 || local.getDate() !== d) {
    return null;
  }
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/**
 * True when the display string is complete enough to commit to parent ISO state
 * (full dd/MM/yyyy or yyyy-MM-dd, or cleared).
 */
export function isCompleteViDateDraft(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return parseViDisplayToIsoDate(trimmed) !== null;
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    return parseViDisplayToIsoDate(trimmed) !== null;
  }
  return false;
}

/** True when label/code suggests a money/amount field (MUST group). */
export function isViMoneyFieldHint(label: string, fieldCode = ''): boolean {
  const s = `${label} ${fieldCode}`.toLowerCase();
  if (/%|percent|tỷ lệ|ty le|ratio|điểm|diem|score|rating/.test(s)) return false;
  return /vnd|vnđ|đồng|dong|tiền|tien|vốn|von|lương|luong|ngân sách|ngan sach|hạn mức|han muc|chi phí|chi phi|phạt|phat|thưởng|thuong|credit|amount|capital|salary|budget|cost|fee|price|giá|gia|phí|phi|công nợ|cong no/.test(
    s,
  );
}
