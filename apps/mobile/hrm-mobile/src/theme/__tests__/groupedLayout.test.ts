import { describe, expect, it } from 'vitest';
import { layout, spacing } from '../tokens';
import { groupedLayout } from '../groupedLayout';

describe('groupedLayout — MOB-UX-13d spacing constants', () => {
  it('maps Apple HIG grouped inset gaps to DS tokens', () => {
    expect(groupedLayout.belowStackHeader).toBe(16);
    expect(groupedLayout.belowBalanceCards).toBe(12);
    expect(groupedLayout.listSectionTop).toBe(16);
    expect(groupedLayout.belowSubtitle).toBe(12);
    expect(groupedLayout.emptyVertical).toBe(24);
  });

  it('derives values from spacing/layout tokens (not magic literals)', () => {
    expect(groupedLayout.belowStackHeader).toBe(spacing.md);
    expect(groupedLayout.belowBalanceCards).toBe(layout.itemGap);
    expect(groupedLayout.listSectionTop).toBe(spacing.md);
    expect(groupedLayout.belowSubtitle).toBe(layout.itemGap);
    expect(groupedLayout.emptyVertical).toBe(spacing.lg);
    expect(groupedLayout.stickyFooterClearance).toBeGreaterThan(layout.primaryButtonHeight);
  });
});
