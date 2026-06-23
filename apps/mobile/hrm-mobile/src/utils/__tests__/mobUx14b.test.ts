import { describe, expect, it } from 'vitest';

import { resolveDashboardPersonaLayout } from '../dashboardPersonaLayout';
import {
  HOME_ABOVE_FOLD_MAX_HEIGHT,
  HOME_ABOVE_FOLD_SECTION_KEYS,
  HOME_ACTIVITY_SHEET_SECTION_KEYS,
  estimateAboveFoldScrollHeight,
  isAboveFoldSection,
  passesAboveFoldBudget,
  resolveActivityBadgeCount,
} from '../homeScrollBudget';

describe('MOB-UX-14b — Home 1-screen budget + Hoạt động sheet', () => {
  it('above-fold section order: grid → stats → activity hub for all personas', () => {
    for (const persona of ['employee', 'manager', 'leader'] as const) {
      const layout = resolveDashboardPersonaLayout(persona);
      expect(layout.sectionOrder[0]).toBe('action_grid');
      expect(layout.sectionOrder[1]).toBe('above_fold_stats');
      expect(layout.sectionOrder[2]).toBe('activity_hub');
      expect(layout.sectionOrder).not.toContain('tasks');
      expect(layout.sectionOrder).not.toContain('payslip_feed');
      expect(layout.sectionOrder).not.toContain('manager_expandable');
      expect(layout.sectionOrder).not.toContain('today');
      expect(layout.sectionOrder).not.toContain('upcoming');
      expect(layout.sectionOrder).not.toContain('announcements');
    }
  });

  it('no stacked expandables or manager hero above fold', () => {
    for (const persona of ['employee', 'manager', 'leader'] as const) {
      const layout = resolveDashboardPersonaLayout(persona);
      expect(layout.showManagerInboxHero).toBe(false);
      expect(layout.showPendingStrip).toBe(false);
      expect(layout.showLeaderPulse).toBe(false);
      expect(layout.taskSectionBeforeGrid).toBe(false);
      const aboveFold = layout.sectionOrder.slice(0, 3);
      expect(aboveFold).toEqual(['action_grid', 'above_fold_stats', 'activity_hub']);
    }
  });

  it('activity sheet keys cover payslip, approvals, tasks, today, upcoming', () => {
    expect(HOME_ACTIVITY_SHEET_SECTION_KEYS).toEqual([
      'payslip_feed',
      'manager_expandable',
      'tasks',
      'today',
      'upcoming',
    ]);
  });

  it('isAboveFoldSection matches program keys only', () => {
    expect(HOME_ABOVE_FOLD_SECTION_KEYS).toEqual(['action_grid', 'above_fold_stats']);
    expect(isAboveFoldSection('action_grid')).toBe(true);
    expect(isAboveFoldSection('above_fold_stats')).toBe(true);
    expect(isAboveFoldSection('activity_hub')).toBe(false);
    expect(isAboveFoldSection('payslip_feed')).toBe(false);
  });

  it('estimateAboveFoldScrollHeight stays within 78% iPhone SE budget', () => {
    const height = estimateAboveFoldScrollHeight();
    expect(height).toBeLessThanOrEqual(HOME_ABOVE_FOLD_MAX_HEIGHT);
    expect(passesAboveFoldBudget()).toBe(true);
    expect(HOME_ABOVE_FOLD_MAX_HEIGHT).toBe(520);
  });

  it('resolveActivityBadgeCount aggregates actionable items', () => {
    expect(
      resolveActivityBadgeCount({
        taskCount: 2,
        managerPendingCount: 3,
        upcomingCount: 1,
        hasPayslipTeaser: true,
      }),
    ).toBe(7);
    expect(
      resolveActivityBadgeCount({
        taskCount: 0,
        managerPendingCount: 0,
        upcomingCount: 0,
        hasPayslipTeaser: false,
      }),
    ).toBe(0);
  });
});
