import { describe, expect, it, vi } from 'vitest';

/** Pure logic mirror of useForceHomeTabOnResize effect (avoids react-navigation import chain). */
function shouldNavigateHomeOnResize(
  prev: { width: number; height: number } | null,
  next: { width: number; height: number },
): boolean {
  if (!prev) return false;
  return prev.width !== next.width || prev.height !== next.height;
}

describe('useForceHomeTabOnResize — MOB-UX-14-R6', () => {
  it('skips first mount (no spurious navigate)', () => {
    expect(shouldNavigateHomeOnResize(null, { width: 412, height: 915 })).toBe(false);
  });

  it('navigates TabDashboard when wm size changes', () => {
    const navigate = vi.fn();
    const prev = { width: 412, height: 915 };
    const next = { width: 430, height: 932 };
    if (shouldNavigateHomeOnResize(prev, next)) {
      navigate('TabDashboard');
    }
    expect(navigate).toHaveBeenCalledWith('TabDashboard');
  });

  it('ignores identical dimensions', () => {
    expect(shouldNavigateHomeOnResize({ width: 375, height: 667 }, { width: 375, height: 667 })).toBe(
      false,
    );
  });
});
