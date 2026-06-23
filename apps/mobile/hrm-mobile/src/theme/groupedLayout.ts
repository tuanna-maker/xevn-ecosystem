/**
 * Apple HIG grouped inset list spacing — MOBILE_XEVN_DESIGN_SYSTEM §3 + MOB-UX-13d.
 * Snapshot-tested via mobUx13d.test.ts.
 */
import { layout, spacing } from './tokens';

export const groupedLayout = {
  /** Margin below native stack large title to first content block. */
  belowStackHeader: spacing.md,
  /** Gap between balance/hero cards row and segmented tabs. */
  belowBalanceCards: layout.itemGap,
  /** Top inset before first list section on grouped screens. */
  listSectionTop: spacing.md,
  /** Gap below inline subtitle to filter chips (stack header owns title). */
  belowSubtitle: layout.itemGap,
  /** Vertical breathing room around empty-state illustrations. */
  emptyVertical: spacing.lg,
  /** Scroll clearance above StickyFooter CTA (button + inner padding). */
  stickyFooterClearance: layout.primaryButtonHeight + spacing.sm * 2 + 1,
} as const;
