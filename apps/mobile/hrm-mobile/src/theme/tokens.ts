/**

 * XeVN mobile design tokens — MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §1–3.

 * Colors mirrored from web-portal `tailwind.config.cjs` (xevn.*).

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

  neutral: '#6B7280',

  background: '#F9FAFB',

  surface: '#FFFFFF',

  text: '#1F2937',

  textSecondary: '#6B7280',

  border: '#E5E7EB',

  separator: '#C6C6C8',

  /** Pressed / subtle fill on primary actions */

  primaryMuted: '#DBEAFE',

  /** Tab bar & elevated surfaces */

  surfaceElevated: '#FFFFFF',

  /** iOS grouped list background (HIG) */

  iosGroupedBackground: '#F2F2F7',

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

  /** XeVN Symmetrical Grid Law — form controls */

  input: 8,

  /** XeVN Symmetrical Grid Law — cards & panels */

  card: 12,

} as const;



/** Semantic type scale — 4pt grid, iOS body 17pt (§1) */

export const typography = {

  fontFamily: {

    sans: 'System',

  },

  fontSize: {

    tabLabel: 10,

    caption: 12,

    footnote: 13,

    subhead: 15,

    callout: 16,

    body: 17,

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



/** Default semantic text styles — MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §1 */
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

export const tokens = { colors, spacing, layout, radius, typography, shadow, textStyles } as const;



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


