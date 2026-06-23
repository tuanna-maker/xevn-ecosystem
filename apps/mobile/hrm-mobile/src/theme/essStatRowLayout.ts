/**
 * Apple Settings-style ESS stat row layout — MOB-UX-14c / MOBILE_HOME_RESPONSIVE_PROGRAM.md.
 */
import { layout, spacing, typography } from './tokens';

export const essStatRowLayout = {
  /** Max stat rows in compact Home list (active team, off work, leave requests, my leaves). */
  maxRows: 4,
  /** Compact settings row — label left / value right (MOB-UX-16a ILA-06). */
  rowMinHeight: 44,
  /** Label typography — 15pt subhead on the left. */
  labelFontSize: typography.fontSize.subhead,
  /** Value typography — body semibold tabular-nums on the right (compact row). */
  valueFontSize: typography.fontSize.body,
  /** Horizontal inset inside grouped stat card. */
  horizontalPadding: layout.screenPaddingH,
  /** Vertical padding per row (compact vs legacy vertical card). */
  rowPaddingVertical: spacing.xs,
  /** Gap between quick-access grid and stat list (12pt budget). */
  sectionGapBelow: layout.itemGap,
} as const;
