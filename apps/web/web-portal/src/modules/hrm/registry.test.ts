import { describe, expect, it } from 'vitest';
import {
  HRM_ALL_VIEWS,
  HRM_DEFAULT_VIEW,
  isHrmWorkspaceView,
  parseHrmWorkspaceView,
} from './registry';
import { hrmAppRelPathFromPortalSuffix, hrmPortalPath, hrmPortalPrimaryView } from './paths';

describe('HRM portal registry (COND-PF-PORTAL-01)', () => {
  it('includes performance in HRM_ALL_VIEWS', () => {
    expect(HRM_ALL_VIEWS).toContain('performance');
  });

  it('accepts performance as a valid workspace view (no dashboard redirect)', () => {
    expect(isHrmWorkspaceView('performance')).toBe(true);
    expect(parseHrmWorkspaceView('performance')).toBe('performance');
  });

  it('maps /command-center/hrm/performance → iframe /performance', () => {
    expect(hrmPortalPath('performance')).toBe('/command-center/hrm/performance');
    expect(hrmPortalPrimaryView('performance')).toBe('performance');
    expect(hrmAppRelPathFromPortalSuffix('performance')).toBe('/performance');
  });

  it('includes fleet view and maps to /fleet iframe (G-FL-07)', () => {
    expect(HRM_ALL_VIEWS).toContain('fleet');
    expect(isHrmWorkspaceView('fleet')).toBe(true);
    expect(hrmAppRelPathFromPortalSuffix('fleet')).toBe('/fleet');
  });

  it('still falls back unknown views to dashboard', () => {
    expect(isHrmWorkspaceView('not-a-view')).toBe(false);
    expect(parseHrmWorkspaceView('not-a-view')).toBe(HRM_DEFAULT_VIEW);
  });
});
