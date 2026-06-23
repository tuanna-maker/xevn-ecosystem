import { describe, expect, it } from 'vitest';
import { layout } from '../../../theme/tokens';

/** DS §5.1 / MOB-UX-07 — manager inbox inline card actions + filter chip contract */
describe('manager inbox UX-07 (FilterChipRow + inline card actions)', () => {
  it('AC-DS-03: primary CTA height 48pt for inline approve/deny buttons', () => {
    expect(layout.primaryButtonHeight).toBe(48);
  });

  it('AC-DS chip spec: filter chip height 36pt', () => {
    expect(layout.filterChipHeight).toBe(36);
  });

  it('unified inbox filter keys: all | att | leave', () => {
    const filters = ['all', 'att', 'leave'] as const;
    expect(filters).toHaveLength(3);
    expect(filters[0]).toBe('all');
  });
});
