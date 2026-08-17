/**
 * @CODE-MEMORY
 * Screen:     theme/tokens — XeVN mobile design-token SoT (toàn app ESS)
 * UC:         AC-BRAND-DNA-01 / AC-BRAND-DNA-02 / AC-BRAND-DNA-06
 * BR:         XeVN Precision Motion — primary #1E40AF · card r12 · input r8 · splash #000
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md §3 · L1m
 * TechSpec:   docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3.1–3.3 · ADR-XEVN-THEME-SHARP-OPS-20260722 §4
 * Purpose:    Khóa màu / radius / borderWidth / typography cho DNA XeVN; L2 primitives đọc từ đây.
 * WorkItem:   MOB-XEVN-BRAND-TOKENS-L1-01
 * Coded:      2026-07-22
 *
 * Callers:
 *   - Theme.tsx → ThemeProvider / useTheme
 *   - ConfirmActionModal, ElevatedCard, FormField, SplashIntro, RootNavigator, …
 *
 * Callees: N/A (token module)
 *
 * FE-Actions: N/A — StyleSheet import colors | radius | borderWidth
 *
 * Impact:     Đổi hex/radius sai → lệch brand web + remaster L2/L4; splash native lệch cold-start.
 * must_keep:  colors.primary #1E40AF; colors.brandShell #000000; radius.card 12; radius.input 8;
 *             borderWidth.thin 1; layout.touchTargetMin ≥ 44
 * SOLID:      Một file SoT — không fork palette theo màn
 * LastVerified: src/theme/__tests__/tokens.test.ts · docs/qa/evidence/mob-xevn-brand-tokens-l1-01-20260722.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-MOB-A
 * change_mode: UPGRADE
 * What: brand.barWidth 4px · fontFamily display/body (Montserrat · Source Sans 3) · export brand bundle MOB-13
 * Why: ADR-20260805 §16 LOCK · W4-MOB-A parity web dialog chrome · face_live=false
 * must_keep: primary #1E40AF; touchTargetMin ≥44; không claim remaster DONE
 *
 * Spec refs (authoritative order):
 * 1. docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md §4 — token law
 * 2. docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3.1–3.3 (APPROVED-SPONSOR)
 * 3. docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L1m
 * 4. docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §1–3 (superseded where hex conflicts)
 * 5. .cursor/rules/xevn-theme-sharp-ops.mdc
 *
 * Theme usage: prefer `useTheme()` / `ThemeProvider` from `./Theme`.
 * Direct `import { colors, textStyles, borderWidth } from './tokens'` remains valid for StyleSheet.
 *
 * ADR §4.1 locks (do not revert to #1F2937 / #6B7280 as primary readable text):
 * - Body/label: colors.text (#111827)
 * - Secondary readable: colors.textSecondary (#4B5563)
 * - Muted placeholder/icon only: colors.textMuted (#6B7280)
 * ADR §4.3 type floors: body ≥17; title3 ≥20; title2/title1 for screen titles
 */

export const colors = {
  primary: '#1E40AF',
  primaryPressed: '#1E3A8A',
  primaryDisabled: '#93C5FD',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  /** Non-text chrome / DNA neutral — same hex as textMuted */
  neutral: '#6B7280',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  /** Body — sharp contrast (Gray-900) */
  text: '#111827',
  /** Labels / secondary copy — Gray-600 */
  textSecondary: '#4B5563',
  /** Placeholder / decorative icon only — Gray-500; never body/label */
  textMuted: '#6B7280',
  border: '#E5E7EB',
  separator: '#C6C6C8',
  /** Pressed / subtle fill on primary actions */
  primaryMuted: '#DBEAFE',
  /** Tab bar & elevated surfaces */
  surfaceElevated: '#FFFFFF',
  /** iOS grouped list background (HIG) */
  iosGroupedBackground: '#F2F2F7',
  /** Brand shell / splash overlay */
  brandShell: '#000000',
  /** SplashIntro glow — primary @ ~18% opacity */
  splashGlow: 'rgba(30, 64, 175, 0.18)',
  /** Employee portal home — hero carousel gradient */
  homeHeroGradientStart: '#1E40AF',
  homeHeroGradientEnd: '#3B82F6',
  /** Payslip net salary hero — ZenHR Z-P10 / BR-ZEN-05 success tokens */
  payslipHeroGradientStart: '#10B981',
  payslipHeroGradientEnd: '#059669',
  /** Quick-access tile backgrounds (U53 mockup) */
  homeTileProfile: '#DBEAFE',
  homeTileCareer: '#D1FAE5',
  homeTilePayroll: '#FEF3C7',
  homeTileMerits: '#E0E7FF',
  homeTilePolicies: '#FCE7F3',
  homeTileCheckin: '#CCFBF1',
  homeTileTasks: '#FEE2E2',
  homeTileMore: '#F3F4F6',
  /** ZenHR My Actions (MOB-UX-10a / J-MOB-32) */
  homeTileTimeOff: '#DCFCE7',
  homeTileExpenses: '#FFEDD5',
  homeTileLetters: '#EDE9FE',
} as const;

/** Precision Motion brand chrome — dialog bar + typography roles (ADR §16). */
export const brand = {
  barWidth: 4,
  wordmark: 'XeVN',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const layout = {
  screenPaddingH: 16,
  screenPaddingBottom: 24,
  sectionGap: 24,
  itemGap: 12,
  inlineGap: 8,
  cardPadding: 16,
  listRowMinHeight: 56,
  touchTargetMin: 44,
  touchTargetComfort: 48,
  primaryButtonHeight: 48,
  filterChipHeight: 36,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
  /** XeVN Symmetrical Grid Law — form controls (AC-BRAND-DNA-01) */
  input: 8,
  /** XeVN Symmetrical Grid Law — cards & panels (AC-BRAND-DNA-01) */
  card: 12,
  /** Modal / ActionSheet sheet — same DNA as card */
  modal: 12,
} as const;

/**
 * Border widths for Modal / Card / Input (L1 lock → L2 primitives consume).
 * Prefer `colors.border` for stroke color — do not invent gray hex at call site.
 */
export const borderWidth = {
  /** Approximate hairline; call sites may use StyleSheet.hairlineWidth when pixel-perfect */
  hairline: 0.5,
  /** Default Modal / Card outline (ConfirmActionModal, SurfaceCard) */
  thin: 1,
  /** Focus / selected ring on inputs */
  focus: 2,
} as const;

/**
 * Semantic type scale — 4pt grid, iOS body ≥17pt (L-TYPE).
 * Titles: title3 ≥20, title2/title1 for clear screen hierarchy.
 */
export const typography = {
  fontFamily: {
    sans: 'System',
    /** Loaded via BrandFontsProvider — @expo-google-fonts Montserrat */
    display: 'Montserrat_600SemiBold',
    displayBold: 'Montserrat_700Bold',
    /** Loaded via BrandFontsProvider — Source Sans 3 */
    body: 'SourceSans3_400Regular',
    bodyMedium: 'SourceSans3_500Medium',
    bodySemibold: 'SourceSans3_600SemiBold',
  },
  fontSize: {
    tabLabel: 10,
    caption: 12,
    footnote: 13,
    /** Form labels floor ≥15 */
    subhead: 15,
    callout: 16,
    /** Body floor — HIG / L-TYPE */
    body: 17,
    /** Title floor ≥20 */
    title3: 20,
    title2: 22,
    title1: 28,
    largeTitle: 34,
    /** @deprecated use semantic tokens — mapped for gradual migration */
    xs: 12,
    sm: 15,
    base: 17,
    lg: 18,
    xl: 20,
    '2xl': 22,
    '3xl': 28,
  },
  lineHeight: {
    tabLabel: 12,
    caption: 16,
    footnote: 18,
    subhead: 20,
    callout: 21,
    body: 22,
    title3: 25,
    title2: 28,
    title1: 34,
    largeTitle: 41,
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const shadow = {
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
} as const;

/** Default semantic text styles — sharp contrast + type floors */
export const textStyles = {
  body: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.normal,
    color: colors.text,
  },
  footnoteLabel: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  calloutSecondary: {
    fontSize: typography.fontSize.callout,
    lineHeight: typography.lineHeight.callout,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
  },
  /** Placeholder / hint chrome only — do not use for readable labels */
  mutedPlaceholder: {
    fontSize: typography.fontSize.subhead,
    lineHeight: typography.lineHeight.subhead,
    fontWeight: typography.fontWeight.normal,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: typography.fontSize.title2,
    lineHeight: typography.lineHeight.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  screenTitle: {
    fontSize: typography.fontSize.title2,
    lineHeight: typography.lineHeight.title2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  bodyValue: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.normal,
    color: colors.text,
  },
  bodyValueSemibold: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  tabularAmount: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

/** Convenience bundle for StyleSheet consumers */
export const tokens = {
  colors,
  brand,
  spacing,
  layout,
  radius,
  borderWidth,
  typography,
  shadow,
  textStyles,
} as const;

export type ThemeTokens = typeof tokens;

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending';

export function resolveStatusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s === 'approved' || s === 'present' || s === 'paid' || s === 'ok') return 'success';
  if (s === 'late' || s === 'early_leave' || s === 'early') return 'warning';
  if (s === 'absent') return 'danger';
  if (s === 'pending' || s === 'draft' || s === 'processing') return 'pending';
  if (s === 'rejected' || s === 'failed' || s === 'error') return 'danger';
  if (s === 'warning') return 'warning';
  return 'neutral';
}

export function statusToneColor(tone: StatusTone): { bg: string; text: string; border: string } {
  switch (tone) {
    case 'success':
      return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
    case 'warning':
      return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
    case 'danger':
      return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
    case 'info':
      return { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' };
    case 'pending':
      return { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' };
    default:
      return { bg: '#F3F4F6', text: colors.textSecondary, border: colors.border };
  }
}
