/**
 * @CODE-MEMORY
 * Screen:     theme/brandTypography — ADR §16 font resolve helpers
 * UC:         BR-UI-BRAND-B5 · W4-MOB-A MOB-13
 * BR:         Display Montserrat · body Source Sans 3 · fallback System
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · brand Open Q
 * TechSpec:   docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §16
 * Purpose:    Map loaded Google fonts → StyleSheet fontFamily; safe fallback khi chưa load.
 * WorkItem:   PO-HRM-UI-BRAND-W4-MOB-A
 * Coded:      2026-08-05
 * Callers:    BrandDialogChrome · LoginScreen · SurfaceCard · textStyles consumers
 * Callees:    tokens.typography.fontFamily
 * Impact:     Sai family → lệch web remaster Montserrat/Source Sans 3
 * must_keep:  Fallback System; không claim Face LIVE
 * SOLID:      Typography resolve tách khỏi tokens SoT hex/radius
 * LastVerified: src/theme/__tests__/brandTypography.test.ts
 */

import { typography } from './tokens';

export type BrandFontRole = 'display' | 'body';

/** Runtime flag — set true after BrandFontsProvider loads expo-google-fonts. */
let brandFontsReady = false;

export function setBrandFontsReady(ready: boolean): void {
  brandFontsReady = ready;
}

export function isBrandFontsReady(): boolean {
  return brandFontsReady;
}

export function resolveBrandFontFamily(role: BrandFontRole): string {
  if (!brandFontsReady) {
    return typography.fontFamily.sans;
  }
  return role === 'display' ? typography.fontFamily.display : typography.fontFamily.body;
}

export function brandDisplayText(extra?: { fontWeight?: '600' | '700' }) {
  return {
    fontFamily: resolveBrandFontFamily('display'),
    fontWeight: extra?.fontWeight ?? typography.fontWeight.semibold,
  } as const;
}

export function brandBodyText(extra?: { fontWeight?: '400' | '500' | '600' }) {
  return {
    fontFamily: resolveBrandFontFamily('body'),
    fontWeight: extra?.fontWeight ?? typography.fontWeight.normal,
  } as const;
}
