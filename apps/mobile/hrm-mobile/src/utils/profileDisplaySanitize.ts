/**
 * @CODE-MEMORY
 * Screen:     Profile / Directory display sanitize (leaf â€” no util cycles)
 * UC:         UC-HRM-MOB-12 Â· MOB-UX-09
 * BR:         Hide UUID / seed / HRM-*-NNN wire codes from UI
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md Â§4.5
 * TechSpec:   display sanitize before ESS sections
 * Purpose:    Leaf helper for sanitizeProfileDisplay so profileTabs â†” profileEssFields
 *             never form a Metro require cycle (LogBox P2).
 * WorkItem:   D-MOB-DIR-TOAST-01
 * Coded:      2026-07-28
 * Callers:    profileTabs Â· profileEssFields Â· dynamicProfileForm (via re-export)
 * Callees:    sanitizeSeedDisplay (formatHrm)
 * must_keep:  UUID â†’ â€”; HRM-*-digits â†’ â€”; seed: â†’ Dá»¯ liá»‡u máº«u UAT; no swallow of real errors
 * SOLID:      Leaf module â€” no imports from profileTabs / profileEssFields
 * LastVerified: utils/__tests__/profileDisplaySanitize.test.ts
 */

import { sanitizeSeedDisplay } from './formatHrm';

const EM_DASH = 'â€”';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProfileFieldRow = {
  label: string;
  value: string;
  numeric?: boolean;
};

export type ProfileSection = {
  title: string;
  rows: ProfileFieldRow[];
};

/** Hide wire UUIDs and seed codes from profile UI â€” MOB-UX-09. */
export function sanitizeProfileDisplay(text: string | null | undefined): string {
  const sanitized = sanitizeSeedDisplay(text);
  if (sanitized === EM_DASH) return sanitized;
  if (UUID_RE.test(sanitized.trim())) return EM_DASH;
  if (/^HRM-[A-Z]+-\d+$/i.test(sanitized.trim())) return EM_DASH;
  return sanitized;
}
