import { describe, expect, it } from 'vitest';

import {
  HOME_ABOVE_FOLD_MAX_HEIGHT,
  HOME_COMPACT_VIEWPORT_MAX_HEIGHT,
  HOME_SCROLL_DEPTH_MARKERS,
  IPHONE_SE_COMPACT_HEIGHT,
  IPHONE_SE_VIEWPORT_HEIGHT,
  countScrollDepthMarkers,
  estimateAboveFoldScrollHeight,
  passesAboveFoldBudget,
  passesScrollDepthProbe,
  resolveAboveFoldStatMaxRows,
  resolveHomeAboveFoldCompact,
} from '../homeScrollBudget';

describe('homeScrollBudget — MOB-UX-14-R5/R6 viewport', () => {
  it('caps stat rows to 1 on iPhone SE height', () => {
    expect(resolveAboveFoldStatMaxRows(IPHONE_SE_VIEWPORT_HEIGHT)).toBe(1);
    expect(resolveAboveFoldStatMaxRows(IPHONE_SE_COMPACT_HEIGHT)).toBe(1);
    expect(resolveAboveFoldStatMaxRows(HOME_COMPACT_VIEWPORT_MAX_HEIGHT)).toBe(1);
  });

  it('caps stat rows to 1 through Pro Max height (MOB-UX-14-R7)', () => {
    expect(resolveAboveFoldStatMaxRows(915)).toBe(1);
    expect(resolveAboveFoldStatMaxRows(932)).toBe(1);
    expect(resolveAboveFoldStatMaxRows(933)).toBe(2);
  });

  it('enables ultra-compact above-fold through tall phone wm sizes (MOB-UX-14-R6/R7)', () => {
    expect(resolveHomeAboveFoldCompact(IPHONE_SE_VIEWPORT_HEIGHT)).toBe(true);
    expect(resolveHomeAboveFoldCompact(HOME_COMPACT_VIEWPORT_MAX_HEIGHT)).toBe(true);
    expect(resolveHomeAboveFoldCompact(932)).toBe(true);
    expect(resolveHomeAboveFoldCompact(933)).toBe(false);
  });

  it('1-row SE budget fits 78% viewport with single grid row + activity', () => {
    const height = estimateAboveFoldScrollHeight(1, 4, IPHONE_SE_VIEWPORT_HEIGHT);
    expect(height).toBeLessThanOrEqual(HOME_ABOVE_FOLD_MAX_HEIGHT);
    expect(passesAboveFoldBudget(1, 4, IPHONE_SE_VIEWPORT_HEIGHT)).toBe(true);
  });

  it('scrollDepth probe passes when grid + stat + activity markers present', () => {
    const haystack = [
      'resource-id="home-actions-carousel"',
      'text="Nghỉ hôm nay"',
      'text="Hoạt động"',
      'resource-id="home-ess-stat-rows"',
    ].join(' ');
    expect(countScrollDepthMarkers(HOME_SCROLL_DEPTH_MARKERS, haystack)).toBeGreaterThanOrEqual(3);
    expect(passesScrollDepthProbe(haystack)).toBe(true);
  });

  it('scrollDepth probe fails when only carousel marker present', () => {
    const haystack = 'resource-id="home-actions-carousel"';
    expect(passesScrollDepthProbe(haystack)).toBe(false);
  });
});
