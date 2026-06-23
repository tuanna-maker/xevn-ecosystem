import { describe, expect, it } from 'vitest';



import { resolveDashboardPersonaLayout } from '../dashboardPersonaLayout';



describe('dashboardPersonaLayout — MOB-UX-14b + MOB-UX-13e layout flags', () => {

  it('EMP — grid-first, activity hub, no manager hero', () => {

    const layout = resolveDashboardPersonaLayout('employee');

    expect(layout.taskSectionBeforeGrid).toBe(false);

    expect(layout.showManagerInboxHero).toBe(false);

    expect(layout.showLeaderPulse).toBe(false);

    expect(layout.hideCheckInTile).toBe(false);

    expect(layout.hideCheckInFab).toBe(false);

    expect(layout.approveTileLabel).toBe('Việc');

    expect(layout.sectionOrder[0]).toBe('action_grid');

    expect(layout.sectionOrder[1]).toBe('above_fold_stats');

    expect(layout.sectionOrder[2]).toBe('activity_hub');

    expect(layout.sectionOrder).not.toContain('announcements');

  });



  it('MGR — same above-fold order, manager expandable in sheet only', () => {

    const layout = resolveDashboardPersonaLayout('manager');

    expect(layout.showManagerInboxHero).toBe(false);

    expect(layout.showTeamSnapshot).toBe(false);

    expect(layout.approveTileLabel).toBe('Duyệt');

    expect(layout.showManagerExpandable).toBe(true);

    expect(layout.sectionOrder[0]).toBe('action_grid');

    expect(layout.sectionOrder).not.toContain('manager_inbox_hero');

  });



  it('LDR — pulse hidden above fold, check-in FAB/tile hidden', () => {

    const layout = resolveDashboardPersonaLayout('leader');

    expect(layout.showLeaderPulse).toBe(false);

    expect(layout.hideCheckInTile).toBe(true);

    expect(layout.hideCheckInFab).toBe(true);

    expect(layout.approveTileLabel).toBe('Duyệt');

    expect(layout.sectionOrder[0]).toBe('action_grid');

    expect(layout.showManagerInboxHero).toBe(false);

  });

});

